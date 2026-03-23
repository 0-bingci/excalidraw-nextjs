import type * as fabric from "fabric";
import type { Awareness } from "y-protocols/awareness";

export interface UserPresence {
  clientId: number;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

const USER_COLORS = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#E67E22",
  "#E91E63",
];

function randomName(): string {
  const names = [
    "User",
    "Designer",
    "Artist",
    "Creator",
    "Builder",
    "Maker",
  ];
  return names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
}

export class AwarenessManager {
  private awareness: Awareness;
  private canvas: fabric.Canvas;
  private container: HTMLElement;
  private cursorElements: Map<number, HTMLElement> = new Map();
  private userName: string;
  private userColor: string;
  private boundOnMouseMove: (e: any) => void;
  private boundOnAwarenessChange: () => void;

  constructor(
    awareness: Awareness,
    canvas: fabric.Canvas,
    container: HTMLElement,
  ) {
    this.awareness = awareness;
    this.canvas = canvas;
    this.container = container;
    this.userColor =
      USER_COLORS[awareness.clientID % USER_COLORS.length];
    this.userName = randomName();

    this.boundOnMouseMove = this.onLocalCursorMove.bind(this);
    this.boundOnAwarenessChange = this.onAwarenessChange.bind(this);
  }

  bind(): void {
    // Set initial local state
    this.awareness.setLocalStateField("user", {
      name: this.userName,
      color: this.userColor,
    });

    this.canvas.on("mouse:move", this.boundOnMouseMove);
    this.awareness.on("change", this.boundOnAwarenessChange);
  }

  unbind(): void {
    this.canvas.off("mouse:move", this.boundOnMouseMove);
    this.awareness.off("change", this.boundOnAwarenessChange);
    // Remove all cursor elements
    this.cursorElements.forEach((el) => el.remove());
    this.cursorElements.clear();
  }

  private onLocalCursorMove(e: any): void {
    const pointer = this.canvas.getPointer(e.e);
    this.awareness.setLocalStateField("cursor", {
      x: pointer.x,
      y: pointer.y,
    });
  }

  private onAwarenessChange(): void {
    const states = this.awareness.getStates();
    const localClientId = this.awareness.clientID;
    const activeIds = new Set<number>();

    states.forEach((state, clientId) => {
      if (clientId === localClientId) return;
      activeIds.add(clientId);

      const user = state.user;
      const cursor = state.cursor;
      if (!cursor) return;

      // Convert canvas coordinates to screen coordinates
      const vpt = this.canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const zoom = vpt[0];
      const screenX = cursor.x * zoom + vpt[4];
      const screenY = cursor.y * zoom + vpt[5];

      let el = this.cursorElements.get(clientId);
      if (!el) {
        el = this.createCursorElement(
          user?.color || "#999",
          user?.name || "Anonymous",
        );
        this.container.appendChild(el);
        this.cursorElements.set(clientId, el);
      }

      el.style.left = screenX + "px";
      el.style.top = screenY + "px";
      el.style.display = "block";
    });

    // Remove cursors for disconnected users
    this.cursorElements.forEach((el, clientId) => {
      if (!activeIds.has(clientId)) {
        el.remove();
        this.cursorElements.delete(clientId);
      }
    });
  }

  private createCursorElement(color: string, name: string): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "position:absolute;pointer-events:none;z-index:9999;transition:left 0.1s,top 0.1s;";

    // Arrow SVG
    wrapper.innerHTML = `
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">
        <path d="M0 0L16 12L8 12L4 20L0 0Z" fill="${color}"/>
      </svg>
      <span style="
        position:absolute;left:16px;top:10px;
        background:${color};color:#fff;
        font-size:11px;font-weight:500;
        padding:1px 6px;border-radius:4px;
        white-space:nowrap;line-height:1.4;
      ">${name}</span>
    `;
    return wrapper;
  }

  getConnectedUsers(): UserPresence[] {
    const users: UserPresence[] = [];
    this.awareness.getStates().forEach((state, clientId) => {
      users.push({
        clientId,
        name: state.user?.name || "Anonymous",
        color: state.user?.color || "#999",
        cursor: state.cursor,
      });
    });
    return users;
  }
}
