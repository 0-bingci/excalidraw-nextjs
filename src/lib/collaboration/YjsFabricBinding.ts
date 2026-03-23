import * as Y from "yjs";
import * as fabric from "fabric";

/**
 * Bidirectional binding between a Yjs Y.Map and a Fabric.js Canvas.
 *
 * Each Fabric object is keyed by a unique ID (`obj.data.id`) in the Y.Map.
 * The value is the serialized JSON string of that object.
 */
export class YjsFabricBinding {
  private objectsMap: Y.Map<string>;
  private canvas: fabric.Canvas;
  private doc: Y.Doc;
  private isBound = false;

  /** Externally readable: true during remote Yjs -> Fabric updates */
  public isRemoteUpdate = false;
  private isLocalUpdate = false;

  /** External callback fired when isRemoteUpdate changes */
  public onRemoteUpdateChange?: (isRemote: boolean) => void;

  private boundOnAdded: (e: any) => void;
  private boundOnModified: (e: any) => void;
  private boundOnRemoved: (e: any) => void;
  private boundOnMouseUp: () => void;
  private boundOnYjsChange: (
    event: Y.YMapEvent<string>,
    txn: Y.Transaction,
  ) => void;

  constructor(doc: Y.Doc, canvas: fabric.Canvas) {
    this.doc = doc;
    this.canvas = canvas;
    this.objectsMap = doc.getMap("objects");

    this.boundOnAdded = this.onObjectAdded.bind(this);
    this.boundOnModified = this.onObjectModified.bind(this);
    this.boundOnRemoved = this.onObjectRemoved.bind(this);
    this.boundOnMouseUp = this.onMouseUp.bind(this);
    this.boundOnYjsChange = this.onYjsChange.bind(this);
  }

  bind(): void {
    if (this.isBound) return;
    this.isBound = true;

    this.initialSync();

    // Fabric -> Yjs
    this.canvas.on("object:added", this.boundOnAdded);
    this.canvas.on("object:modified", this.boundOnModified);
    this.canvas.on("object:removed", this.boundOnRemoved);
    // Sync all objects on mouse up (catches programmatic set() changes during drawing)
    this.canvas.on("mouse:up", this.boundOnMouseUp);

    // Yjs -> Fabric
    this.objectsMap.observe(this.boundOnYjsChange);

    console.log("[Collab] Binding active, objects in Yjs:", this.objectsMap.size);
  }

  unbind(): void {
    if (!this.isBound) return;
    this.isBound = false;

    this.canvas.off("object:added", this.boundOnAdded);
    this.canvas.off("object:modified", this.boundOnModified);
    this.canvas.off("object:removed", this.boundOnRemoved);
    this.canvas.off("mouse:up", this.boundOnMouseUp);
    this.objectsMap.unobserve(this.boundOnYjsChange);
  }

  // ──────────── Initial Sync ────────────

  private initialSync(): void {
    this.isRemoteUpdate = true;
    try {
      const existingIds = new Set<string>();

      // Add remote objects that don't exist locally
      this.objectsMap.forEach((jsonStr, id) => {
        existingIds.add(id);
        if (!this.findObjectById(id)) {
          this.applyRemoteAdd(id, jsonStr);
        }
      });

      // Push local objects that don't exist in Yjs
      this.doc.transact(() => {
        for (const obj of this.canvas.getObjects()) {
          const id = this.ensureObjectId(obj);
          if (!existingIds.has(id)) {
            this.objectsMap.set(id, this.serializeObject(obj));
          }
        }
      });

      this.canvas.renderAll();
    } finally {
      this.isRemoteUpdate = false;
    }
  }

  // ──────────── Local -> Yjs ────────────

  private onObjectAdded(e: any): void {
    if (this.isRemoteUpdate) return;
    const obj: fabric.Object = e.target;
    if (!obj) return;
    const id = this.ensureObjectId(obj);
    this.isLocalUpdate = true;
    try {
      this.objectsMap.set(id, this.serializeObject(obj));
      console.log("[Collab] Local add:", id);
    } finally {
      this.isLocalUpdate = false;
    }
  }

  private onObjectModified(e: any): void {
    if (this.isRemoteUpdate) return;
    const obj: fabric.Object = e.target;
    if (!obj) return;
    const id = this.getObjectId(obj);
    if (!id) return;
    this.isLocalUpdate = true;
    try {
      this.objectsMap.set(id, this.serializeObject(obj));
    } finally {
      this.isLocalUpdate = false;
    }
  }

  private onObjectRemoved(e: any): void {
    if (this.isRemoteUpdate) return;
    const obj: fabric.Object = e.target;
    if (!obj) return;
    const id = this.getObjectId(obj);
    if (!id) return;
    this.isLocalUpdate = true;
    try {
      this.objectsMap.delete(id);
      console.log("[Collab] Local remove:", id);
    } finally {
      this.isLocalUpdate = false;
    }
  }

  /**
   * On mouse:up, sync ALL canvas objects to Yjs.
   * This catches shape modifications done via set() during drawing
   * (toolHandlers modify width/height programmatically, which doesn't fire object:modified).
   */
  private onMouseUp(): void {
    if (this.isRemoteUpdate) return;
    this.isLocalUpdate = true;
    try {
      this.doc.transact(() => {
        for (const obj of this.canvas.getObjects()) {
          const id = this.getObjectId(obj);
          if (!id) continue;
          const json = this.serializeObject(obj);
          const existing = this.objectsMap.get(id);
          // Only update if changed (avoid unnecessary Yjs transactions)
          if (existing !== json) {
            this.objectsMap.set(id, json);
          }
        }
      });
    } finally {
      this.isLocalUpdate = false;
    }
  }

  // ──────────── Yjs -> Local ────────────

  private onYjsChange(event: Y.YMapEvent<string>, txn: Y.Transaction): void {
    if (this.isLocalUpdate) return;
    if (txn.local) return;

    console.log("[Collab] Remote changes received:", event.changes.keys.size);

    this.isRemoteUpdate = true;
    this.onRemoteUpdateChange?.(true);
    try {
      event.changes.keys.forEach((change, id) => {
        switch (change.action) {
          case "add": {
            const json = this.objectsMap.get(id);
            if (json) this.applyRemoteAdd(id, json);
            break;
          }
          case "update": {
            const json = this.objectsMap.get(id);
            if (json) this.applyRemoteUpdate(id, json);
            break;
          }
          case "delete": {
            this.applyRemoteDelete(id);
            break;
          }
        }
      });
      this.canvas.renderAll();
    } finally {
      this.isRemoteUpdate = false;
      this.onRemoteUpdateChange?.(false);
    }
  }

  // ──────────── Remote apply helpers ────────────

  private applyRemoteAdd(id: string, jsonStr: string): void {
    if (this.findObjectById(id)) return;

    try {
      const parsed = JSON.parse(jsonStr);
      fabric.util.enlivenObjects([parsed]).then((objects: fabric.Object[]) => {
        if (objects.length > 0 && this.isBound) {
          const obj = objects[0];
          if (!obj.data) obj.data = {};
          obj.data.id = id;
          // Temporarily set isRemoteUpdate in case the add triggers listeners
          const prev = this.isRemoteUpdate;
          this.isRemoteUpdate = true;
          this.canvas.add(obj);
          this.canvas.renderAll();
          this.isRemoteUpdate = prev;
          console.log("[Collab] Remote add applied:", id);
        }
      });
    } catch (e) {
      console.error("[Collab] Failed to enliven remote object:", e);
    }
  }

  private applyRemoteUpdate(id: string, jsonStr: string): void {
    const obj = this.findObjectById(id);
    if (!obj) {
      this.applyRemoteAdd(id, jsonStr);
      return;
    }

    try {
      const parsed = JSON.parse(jsonStr);
      const { type, ...props } = parsed;
      obj.set(props);
      obj.setCoords();
    } catch (e) {
      console.error("[Collab] Failed to update remote object:", e);
    }
  }

  private applyRemoteDelete(id: string): void {
    const obj = this.findObjectById(id);
    if (obj) {
      this.canvas.remove(obj);
      console.log("[Collab] Remote delete applied:", id);
    }
  }

  // ──────────── Helpers ────────────

  private ensureObjectId(obj: fabric.Object): string {
    if (!obj.data) obj.data = {};
    if (!obj.data.id) {
      obj.data.id = crypto.randomUUID();
    }
    return obj.data.id;
  }

  private getObjectId(obj: fabric.Object): string | null {
    return obj.data?.id || null;
  }

  private findObjectById(id: string): fabric.Object | undefined {
    return this.canvas.getObjects().find((o) => o.data?.id === id);
  }

  private serializeObject(obj: fabric.Object): string {
    const json = obj.toObject(["data"]);
    return JSON.stringify(json);
  }

  /** Full resync after loadFromJSON etc. */
  public fullResync(): void {
    this.isLocalUpdate = true;
    try {
      this.doc.transact(() => {
        this.objectsMap.forEach((_, id) => {
          this.objectsMap.delete(id);
        });
        for (const obj of this.canvas.getObjects()) {
          const id = this.ensureObjectId(obj);
          this.objectsMap.set(id, this.serializeObject(obj));
        }
      });
    } finally {
      this.isLocalUpdate = false;
    }
  }
}
