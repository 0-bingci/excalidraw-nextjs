import * as fabric from "fabric";
import { getItem, setItem, removeItem } from "@/utils/indexedDB";

// -------------------------- 类型定义 --------------------------
/** 操作类型枚举 */
export type HistoryActionType = "add" | "modify" | "delete";

/** 新增对象操作的数据结构 */
interface AddActionData {
  object: ReturnType<fabric.Object["toObject"]>; // 新增对象的序列化数据
}

/** 修改对象操作的数据结构 */
interface ModifyActionData {
  objectId: string; // 被修改对象的唯一ID
  oldProps: Partial<ReturnType<fabric.Object["toObject"]>>; // 修改前的属性
  newProps: Partial<ReturnType<fabric.Object["toObject"]>>; // 修改后的属性
}

/** 删除对象操作的数据结构 */
interface DeleteActionData {
  object: ReturnType<fabric.Object["toObject"]>; // 被删除对象的序列化数据
}

/** 单个历史操作项 */
export interface HistoryAction {
  id: string; // 操作唯一标识
  type: HistoryActionType; // 操作类型
  timestamp: number; // 操作时间戳
  data: AddActionData | ModifyActionData | DeleteActionData; // 操作增量数据
}

/** 历史栈整体状态 */
export interface HistoryState {
  actions: HistoryAction[]; // 所有操作历史
  currentIndex: number; // 当前操作索引（-1 表示无操作）
}

// -------------------------- 常量定义 --------------------------
/** IndexedDB 中历史栈的存储键名 */
const HISTORY_STORE_KEY = "history";
/** 修改操作防抖时间（ms）- 避免频繁修改触发过多历史记录 */
const MODIFY_DEBOUNCE_DELAY = 300;

// -------------------------- 全局状态 --------------------------
let canvas: fabric.Canvas | null = null;
let historyState: HistoryState = { actions: [], currentIndex: -1 };
let selectedObjectOldState: Record<
  string,
  ReturnType<fabric.Object["toObject"]>
> = {}; // 缓存选中对象的原始状态
let modifyDebounceTimer: NodeJS.Timeout | null = null;

// -------------------------- IndexedDB 操作 --------------------------
/**
 * 从 IndexedDB 加载历史栈
 */
export const loadHistoryFromDB = async (): Promise<HistoryState> => {
  const savedState = await getItem<HistoryState>(HISTORY_STORE_KEY);
  if (savedState) {
    historyState = savedState;
    return savedState;
  }
  // 初始化默认状态并保存到DB
  await saveHistoryToDB();
  return historyState;
};

/**
 * 将历史栈保存到 IndexedDB
 */
export const saveHistoryToDB = async (): Promise<void> => {
  await setItem<HistoryState>(HISTORY_STORE_KEY, historyState);
};

/**
 * 清空 IndexedDB 中的历史记录
 */
export const clearHistoryFromDB = async (): Promise<void> => {
  historyState = { actions: [], currentIndex: -1 };
  await removeItem(HISTORY_STORE_KEY);
  // 清空画布时同步清空历史（可选，根据业务需求调整）
  canvas?.clear();
};

// -------------------------- 历史操作生成 --------------------------
/**
 * 生成唯一操作ID
 */
const generateActionId = (): string => {
  return `action_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * 处理对象新增操作
 * @param object 新增的Fabric对象
 */
const handleObjectAdded = (object: fabric.Object) => {
  if (!canvas) return;
  console.log("handleObjectAdded");
  console.log(object.target.toJSON());

  // 过滤画布初始化加载的对象（避免重复记录）
  //   const isInitialLoad =
  //     historyState.actions.length === 0 && historyState.currentIndex === -1;
  //   if (isInitialLoad) return;
  const id = generateActionId();
  if (!object.target.id) {
    object.target.set("id", id);
  }
  // 生成新增操作
  const action: HistoryAction = {
    id: id,
    type: "add",
    timestamp: Date.now(),
    data: {
      object: object.target.toJSON(), // 仅存储对象序列化数据（增量）
    },
  };

  // 清除当前索引之后的历史（避免分支历史）
  if (historyState.currentIndex < historyState.actions.length - 1) {
    console.log(historyState.actions,historyState.currentIndex);
    
    historyState.actions = historyState.actions.slice(
      0,
      historyState.currentIndex + 1
    );
    console.log(historyState.actions);
    
  }

  // 添加到历史栈并更新状态
  historyState.actions.push(action);
  historyState.currentIndex = historyState.actions.length - 1;
//   saveHistoryToDB(); // 异步保存到DB，不阻塞操作
};

/**
 * 处理对象修改操作（防抖）
 * @param object 被修改的Fabric对象
 */
const handleObjectModified = (object: fabric.Object) => {
  if (!canvas) return;

  // 清除上一次防抖计时器
  if (modifyDebounceTimer) clearTimeout(modifyDebounceTimer);

  modifyDebounceTimer = setTimeout(() => {
    console.log(object);

    const oldProps = selectedObjectOldState[object.id];
    const newProps = object.toObject();

    // 对比属性差异，仅存储变化的属性（进一步增量优化）
    const changedOldProps = getChangedProps(oldProps, newProps);
    const changedNewProps = getChangedProps(newProps, oldProps);

    // 无变化则不记录
    if (Object.keys(changedOldProps).length === 0) return;

    // 生成修改操作
    const action: HistoryAction = {
      id: generateActionId(),
      type: "modify",
      timestamp: Date.now(),
      data: {
        objectId: object.id,
        oldProps: changedOldProps,
        newProps: changedNewProps,
      },
    };

    // 更新历史栈
    if (historyState.currentIndex < historyState.actions.length - 1) {
      historyState.actions = historyState.actions.slice(
        0,
        historyState.currentIndex + 1
      );
    }
    historyState.actions.push(action);
    historyState.currentIndex = historyState.actions.length - 1;
    saveHistoryToDB();

    // 更新缓存的原始状态
    selectedObjectOldState[object.id] = newProps;
  }, MODIFY_DEBOUNCE_DELAY);
};

/**
 * 处理对象删除操作
 * @param object 被删除的Fabric对象
 */
const handleObjectRemoved = (object: fabric.Object) => {
  if (!canvas) return;

  // 生成删除操作
  const action: HistoryAction = {
    id: generateActionId(),
    type: "delete",
    timestamp: Date.now(),
    data: {
      object: object.toObject(), // 存储被删除对象数据，用于撤销恢复
    },
  };

  // 更新历史栈
  if (historyState.currentIndex < historyState.actions.length - 1) {
    historyState.actions = historyState.actions.slice(
      0,
      historyState.currentIndex + 1
    );
  }
  historyState.actions.push(action);
  historyState.currentIndex = historyState.actions.length - 1;
  saveHistoryToDB();

  // 清除缓存的该对象状态
  delete selectedObjectOldState[object.id];
};

/**
 * 监听对象选中事件 - 缓存原始状态用于后续修改对比
 * @param e 选中事件对象
 */
const handleObjectSelected = (e: fabric.IEvent) => {
  if (!e.target) return;
  const object = e.target as fabric.Object;
  // 缓存选中对象的当前状态（作为修改前的旧状态）
  selectedObjectOldState[object.id] = object.toObject();
};

/**
 * 对比两个对象的属性差异，返回仅存在差异的属性
 * @param source 源对象
 * @param target 目标对象
 * @returns 差异属性集合
 */
const getChangedProps = (
  source: Record<string, any>,
  target: Record<string, any>
): Record<string, any> => {
  const changedProps: Record<string, any> = {};
  Object.keys(source).forEach((key) => {
    // 跳过不需要监听的属性（如内部ID、渲染相关属性）
    if (["id", "canvas", "group", "dirty"].includes(key)) return;

    // 基础类型直接对比，对象类型简易对比（可根据需求优化）
    if (
      typeof source[key] !== typeof target[key] ||
      JSON.stringify(source[key]) !== JSON.stringify(target[key])
    ) {
      changedProps[key] = source[key];
    }
  });
  return changedProps;
};

// -------------------------- 撤销/重做核心逻辑 --------------------------
/**
 * 暂停历史监听（避免撤销/重做操作触发新的历史记录）
 */
const pauseHistoryListening = () => {
  if (!canvas) return;
  canvas.off("object:added", handleObjectAdded);
  canvas.off("object:modified", handleObjectModified);
  canvas.off("object:removed", handleObjectRemoved);
  canvas.off("object:selected", handleObjectSelected);
};

/**
 * 恢复历史监听
 */
const resumeHistoryListening = () => {
  if (!canvas) return;
  canvas.on("object:added", handleObjectAdded);
  canvas.on("object:modified", handleObjectModified);
  canvas.on("object:removed", handleObjectRemoved);
  canvas.on("object:selected", handleObjectSelected);
};

/**
 * 撤销上一步操作
 */
export const undo = async (): Promise<boolean> => {
  if (!canvas || historyState.currentIndex < 0) return false; // 无操作可撤销

  const action = historyState.actions[historyState.currentIndex];
  pauseHistoryListening();

  try {
    switch (action.type) {
      case "add": {
        // 撤销新增：删除对应的对象
        // const { object } = action.data as AddActionData;
        console.log(action.id);

        canvas.getObjects().find((o) => console.log(o));
        const obj = canvas.getObjects().find((o) => o.id === action.id);
        console.log(obj);

        if (obj) canvas.remove(obj);
        break;
      }
      case "modify": {
        // 撤销修改：恢复旧属性
        const { objectId, oldProps } = action.data as ModifyActionData;
        const targetObj = canvas.getObjectById(objectId);
        if (targetObj) targetObj.set(oldProps).setCoords();
        break;
      }
      case "delete": {
        // 撤销删除：重新添加对象
        const { object } = action.data as DeleteActionData;
        const restoredObj = fabric.util.createObjectFromObject(object);
        canvas.add(restoredObj);
        break;
      }
    }

    // 更新历史索引并保存
    historyState.currentIndex -= 1;
    // await saveHistoryToDB();
    canvas.renderAll();
    return true;
  } catch (error) {
    console.error("撤销操作失败:", error);
    return false;
  } finally {
    resumeHistoryListening();
  }
};

/**
 * 重做上一步操作
 */
export const redo = async (): Promise<boolean> => {
  if (!canvas || historyState.currentIndex >= historyState.actions.length - 1)
    return false; // 无操作可重做

  const nextIndex = historyState.currentIndex + 1;
  const action = historyState.actions[nextIndex];
  pauseHistoryListening();

  try {
    switch (action.type) {
      case "add": {
        const object = action.data.object;
        const restoredObj = { ...object, type: object.type.toLowerCase() };

        fabric.util
          .enlivenObjects([restoredObj])
          .then((objects) => {
            console.log("转换成功的对象：", objects); // 现在会触发
            if (objects.length > 0) {
              canvas.add(objects[0]);
              canvas.renderAll();
            }
          })
          .catch((err) => {
            console.error("转换失败：", err); // 捕获错误
          });
        break;
      }
      case "modify": {
        // 重做修改：恢复新属性
        const { objectId, newProps } = action.data as ModifyActionData;
        const targetObj = canvas.getObjectById(objectId);
        if (targetObj) targetObj.set(newProps).setCoords();
        break;
      }
      case "delete": {
        // 重做删除：删除对应的对象
        const { object } = action.data as DeleteActionData;
        const targetObj = canvas.getObjectById(object.id);
        if (targetObj) canvas.remove(targetObj);
        break;
      }
    }

    // 更新历史索引并保存
    historyState.currentIndex = nextIndex;
    // await saveHistoryToDB();
    canvas.renderAll();
    return true;
  } catch (error) {
    console.error("重做操作失败:", error);
    return false;
  } finally {
    resumeHistoryListening();
  }
};

// -------------------------- 初始化与清理 --------------------------
/**
 * 初始化历史记录管理
 * @param canvasInstance Fabric画布实例
 */
export const initHistoryManager = async (canvasInstance: fabric.Canvas) => {
  // 绑定画布实例
  canvas = canvasInstance;

  // 从DB加载历史状态
  //   await loadHistoryFromDB();

  // 绑定画布事件监听
  resumeHistoryListening();

  // 初始化时缓存所有现有对象的状态（针对页面刷新后恢复的场景）
  canvas.getObjects().forEach((obj) => {
    selectedObjectOldState[obj.id] = obj.toObject();
  });
};

/**
 * 销毁历史记录管理（组件卸载时调用）
 */
export const destroyHistoryManager = async () => {
  if (modifyDebounceTimer) clearTimeout(modifyDebounceTimer);
  if (canvas) {
    canvas.off("object:added", handleObjectAdded);
    canvas.off("object:modified", handleObjectModified);
    canvas.off("object:removed", handleObjectRemoved);
    canvas.off("object:selected", handleObjectSelected);
  }
  canvas = null;
  selectedObjectOldState = {};
};

// -------------------------- 辅助方法 --------------------------
/**
 * 获取当前历史栈状态（用于调试或UI展示）
 */
export const getCurrentHistoryState = (): HistoryState => {
  return { ...historyState }; // 返回拷贝，避免外部修改
};
