import { useRef, useState, useCallback, useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import type * as fabric from "fabric";
import { YjsFabricBinding } from "@/lib/collaboration/YjsFabricBinding";
import {
  AwarenessManager,
  type UserPresence,
} from "@/lib/collaboration/AwarenessManager";

const WS_URL = process.env.NEXT_PUBLIC_YJS_WS_URL || "ws://localhost:1234";

export interface UseCollaborationReturn {
  isConnected: boolean;
  roomId: string | null;
  connectedUsers: UserPresence[];
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  createRoom: () => string;
  isRemoteRef: React.RefObject<boolean>;
}

export function useCollaboration(
  canvas: fabric.Canvas | null,
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseCollaborationReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<UserPresence[]>([]);

  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const bindingRef = useRef<YjsFabricBinding | null>(null);
  const awarenessRef = useRef<AwarenessManager | null>(null);
  const isRemoteRef = useRef(false);
  const usersIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const leaveRoom = useCallback(() => {
    if (usersIntervalRef.current) {
      clearInterval(usersIntervalRef.current);
      usersIntervalRef.current = null;
    }
    bindingRef.current?.unbind();
    bindingRef.current = null;
    awarenessRef.current?.unbind();
    awarenessRef.current = null;
    providerRef.current?.destroy();
    providerRef.current = null;
    persistenceRef.current?.destroy();
    persistenceRef.current = null;
    docRef.current?.destroy();
    docRef.current = null;

    setIsConnected(false);
    setRoomId(null);
    setConnectedUsers([]);
  }, []);

  const joinRoom = useCallback(
    (newRoomId: string) => {
      if (!canvas || !containerRef.current) return;
      if (docRef.current) leaveRoom();

      console.log("[Collab] Joining room:", newRoomId);

      const doc = new Y.Doc();
      docRef.current = doc;

      const provider = new WebsocketProvider(WS_URL, newRoomId, doc);
      providerRef.current = provider;

      const persistence = new IndexeddbPersistence(newRoomId, doc);
      persistenceRef.current = persistence;

      // Create binding with remote update callback to sync with history hook
      const binding = new YjsFabricBinding(doc, canvas);
      binding.onRemoteUpdateChange = (isRemote) => {
        isRemoteRef.current = isRemote;
      };
      bindingRef.current = binding;

      const awareness = new AwarenessManager(
        provider.awareness,
        canvas,
        containerRef.current,
      );
      awarenessRef.current = awareness;

      provider.on("status", ({ status }: { status: string }) => {
        console.log("[Collab] Connection status:", status);
        setIsConnected(status === "connected");
      });

      // Bind after initial sync completes
      const doBind = () => {
        if (bindingRef.current) {
          bindingRef.current.bind();
        }
        if (awarenessRef.current) {
          awarenessRef.current.bind();
        }
      };

      provider.on("sync", (isSynced: boolean) => {
        console.log("[Collab] Sync status:", isSynced);
        if (isSynced) doBind();
      });

      if (provider.synced) {
        doBind();
      }

      // Poll connected users
      usersIntervalRef.current = setInterval(() => {
        if (awarenessRef.current) {
          setConnectedUsers(awarenessRef.current.getConnectedUsers());
        }
      }, 2000);

      setRoomId(newRoomId);
    },
    [canvas, containerRef, leaveRoom],
  );

  const createRoom = useCallback((): string => {
    const newRoomId = crypto.randomUUID().slice(0, 8);
    joinRoom(newRoomId);
    return newRoomId;
  }, [joinRoom]);

  // Auto-join from URL ?room=xxx
  useEffect(() => {
    if (!canvas) return;
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      joinRoom(room);
    }
  }, [canvas, joinRoom]);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return {
    isConnected,
    roomId,
    connectedUsers,
    joinRoom,
    leaveRoom,
    createRoom,
    isRemoteRef,
  };
}
