import { WebSocketServer } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
// awareness messages are just broadcast as-is
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

const port = process.env.YJS_PORT || 1234;

const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

// Store one Y.Doc + awareness per room
const rooms = new Map();

function getOrCreateRoom(roomName) {
  if (!rooms.has(roomName)) {
    const doc = new Y.Doc();
    rooms.set(roomName, {
      doc,
      clients: new Set(),
      awareness: new Map(), // clientId -> awareness state
    });
  }
  return rooms.get(roomName);
}

const wss = new WebSocketServer({ port });

wss.on("connection", (ws, req) => {
  const roomName =
    new URL(req.url, "http://localhost").pathname.slice(1) || "default";
  const room = getOrCreateRoom(roomName);
  room.clients.add(ws);

  // Send sync step 1 to new client
  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeSyncStep1(encoder, room.doc);
    ws.send(encoding.toUint8Array(encoder));
  }

  // Awareness states are exchanged peer-to-peer via message broadcast

  ws.on("message", (data) => {
    try {
      const buf = new Uint8Array(data);
      const decoder = decoding.createDecoder(buf);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case MSG_SYNC: {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MSG_SYNC);
          const syncMessageType = syncProtocol.readSyncMessage(
            decoder,
            encoder,
            room.doc,
            ws
          );
          // If the encoder has content (sync step 2 response), send it back
          if (encoding.length(encoder) > 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
          // If this was a sync step 2 or update, broadcast to others
          if (syncMessageType === 2) {
            // It was an update, broadcast
            for (const client of room.clients) {
              if (client !== ws && client.readyState === 1) {
                client.send(buf);
              }
            }
          }
          break;
        }
        case MSG_AWARENESS: {
          // Broadcast awareness to all other clients
          for (const client of room.clients) {
            if (client !== ws && client.readyState === 1) {
              client.send(buf);
            }
          }
          break;
        }
      }
    } catch (e) {
      console.error("Error handling message:", e);
    }
  });

  // Listen for doc updates and broadcast
  const updateHandler = (update, origin) => {
    if (origin === ws) return; // Don't echo back
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    const msg = encoding.toUint8Array(encoder);
    for (const client of room.clients) {
      if (client.readyState === 1) {
        client.send(msg);
      }
    }
  };
  room.doc.on("update", updateHandler);

  ws.on("close", () => {
    room.clients.delete(ws);
    room.doc.off("update", updateHandler);
    if (room.clients.size === 0) {
      setTimeout(() => {
        if (room.clients.size === 0) {
          room.doc.destroy();
          rooms.delete(roomName);
        }
      }, 60000);
    }
  });
});

console.log(`Yjs WebSocket server running on ws://localhost:${port}`);
