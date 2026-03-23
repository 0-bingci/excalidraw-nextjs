import { useRef, useCallback, useState, useEffect } from "react";
import type * as fabric from "fabric";

const MAX_HISTORY = 50;
// 防抖延迟：绘图过程中 object:added/removed 会频繁触发，
// 等操作稳定后再保存，避免中间状态污染历史栈
const DEBOUNCE_MS = 300;
// localStorage 持久化的 key
const STORAGE_KEY = "excalidraw_canvas_state";
// 持久化防抖延迟（避免高频写入 localStorage）
const PERSIST_DEBOUNCE_MS = 500;

export function useCanvasHistory(
  canvas: fabric.Canvas | null,
  /** When true, skip saving state (e.g. during remote Yjs updates) */
  skipRef?: React.RefObject<boolean>,
) {
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  // 防止 undo/redo 恢复画布时触发的事件写入新状态
  const isRestoring = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  /** 持久化当前画布状态到 localStorage（防抖） */
  const persistToStorage = useCallback((json: string) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, json);
      } catch {
        // localStorage 满了或不可用时静默失败
      }
    }, PERSIST_DEBOUNCE_MS);
  }, []);

  /** 立即保存当前画布状态（不防抖，用于初始化） */
  const saveStateImmediate = useCallback(() => {
    if (!canvas || isRestoring.current || skipRef?.current) return;
    const json = JSON.stringify(canvas.toJSON());
    const top = undoStack.current[undoStack.current.length - 1];
    if (top === json) return;
    undoStack.current.push(json);
    if (undoStack.current.length > MAX_HISTORY) {
      undoStack.current.shift();
    }
    redoStack.current = [];
    updateFlags();
    // 同步持久化到 localStorage
    persistToStorage(json);
  }, [canvas, updateFlags, persistToStorage]);

  /** 防抖保存：绘图过程中多次触发只保存最终状态 */
  const saveState = useCallback(() => {
    if (!canvas || isRestoring.current) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveStateImmediate();
    }, DEBOUNCE_MS);
  }, [canvas, saveStateImmediate]);

  /** 恢复画布并确保恢复期间所有事件被忽略 */
  const restoreState = useCallback(
    (json: string) => {
      if (!canvas) return;
      isRestoring.current = true;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll();
        // 持久化 undo/redo 后的画布状态
        persistToStorage(json);
        setTimeout(() => {
          isRestoring.current = false;
          updateFlags();
        }, 0);
      });
    },
    [canvas, updateFlags, persistToStorage],
  );

  /** 撤销 */
  const undo = useCallback(() => {
    if (!canvas || undoStack.current.length <= 1) return;
    const currentState = undoStack.current.pop()!;
    redoStack.current.push(currentState);
    const prevState = undoStack.current[undoStack.current.length - 1];
    restoreState(prevState);
  }, [canvas, restoreState]);

  /** 重做 */
  const redo = useCallback(() => {
    if (!canvas || redoStack.current.length === 0) return;
    const nextState = redoStack.current.pop()!;
    undoStack.current.push(nextState);
    restoreState(nextState);
  }, [canvas, restoreState]);

  /** 初始化：从 localStorage 恢复画布，绑定事件 */
  useEffect(() => {
    if (!canvas) return;

    const initTimer = setTimeout(() => {
      undoStack.current = [];
      redoStack.current = [];

      // 尝试从 localStorage 恢复画布
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          isRestoring.current = true;
          canvas.loadFromJSON(saved).then(() => {
            canvas.renderAll();
            setTimeout(() => {
              isRestoring.current = false;
              // 将恢复后的状态作为初始状态入栈
              const json = JSON.stringify(canvas.toJSON());
              undoStack.current = [json];
              updateFlags();
            }, 0);
          });
          return;
        }
      } catch {
        // localStorage 不可用时忽略
      }

      // 没有缓存，保存当前空画布为初始状态
      saveStateImmediate();
    }, 200);

    const onChanged = () => saveState();

    canvas.on("object:added", onChanged);
    canvas.on("object:removed", onChanged);
    canvas.on("object:modified", onChanged);

    return () => {
      clearTimeout(initTimer);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (persistTimer.current) clearTimeout(persistTimer.current);
      canvas.off("object:added", onChanged);
      canvas.off("object:removed", onChanged);
      canvas.off("object:modified", onChanged);
    };
  }, [canvas, saveState, saveStateImmediate, updateFlags]);

  /** 页面关闭前立即保存（确保最后的修改不丢失） */
  useEffect(() => {
    const onBeforeUnload = () => {
      if (!canvas) return;
      try {
        const json = JSON.stringify(canvas.toJSON());
        localStorage.setItem(STORAGE_KEY, json);
      } catch {
        // 静默失败
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [canvas]);

  /** 绑定键盘快捷键 Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        ((e.key === "z" && e.shiftKey) || e.key === "y")
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  return { undo, redo, canUndo, canRedo, saveState: saveStateImmediate };
}
