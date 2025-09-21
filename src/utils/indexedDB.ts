// 定义类型接口
export interface CanvasData {
  id?: string;
  jsonData: string; // 存储画布的JSON数据
  name: string; // 画布名称
  timestamp: string; // 最后修改时间戳
}

export interface OperationLog {
  id?: number;
  canvasId: number; // 关联的画布ID
  operation: string; // 操作类型：如"draw", "erase", "resize", "addShape"等
  details: string; // 操作详情的JSON字符串
  timestamp: string; // 操作时间戳
  userId?: string; // 操作用户ID（可选）
}

// 数据库配置
const DB_NAME = 'WhiteboardDB';
const DB_VERSION = 3; // 升级版本号
const CANVAS_STORE_NAME = 'canvasData'; // 画布数据存储
const OPERATION_LOG_STORE_NAME = 'operationLogs'; // 操作日志存储

/**
 * 打开数据库连接
 * @returns 数据库实例的Promise
 */
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // 数据库版本升级时触发
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 如果画布数据存储对象不存在则创建
      if (!db.objectStoreNames.contains(CANVAS_STORE_NAME)) {
        const canvasStore = db.createObjectStore(CANVAS_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        // 创建时间戳索引，方便按时间查询
        canvasStore.createIndex('by_timestamp', 'timestamp', { unique: false });
      }

      // 如果操作日志存储对象不存在则创建
      if (!db.objectStoreNames.contains(OPERATION_LOG_STORE_NAME)) {
        const logStore = db.createObjectStore(OPERATION_LOG_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        // 创建画布ID索引，方便查询特定画布的操作日志
        logStore.createIndex('by_canvasId', 'canvasId', { unique: false });
        // 创建时间戳索引，方便按时间查询
        logStore.createIndex('by_timestamp', 'timestamp', { unique: false });
      }
    };

    // 打开成功
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    // 打开失败
    request.onerror = (event) => {
      console.error('Error opening database:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * 保存画布JSON数据
 * @param canvas 包含jsonData, name的画布对象
 * @returns 保存后的画布ID
 */
export const saveCanvasData = async (canvas: Omit<CanvasData, 'id' | 'timestamp'>): Promise<number> => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CANVAS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(CANVAS_STORE_NAME);

      const canvasData: CanvasData = {
        id: 'latest', // 固定 ID
        ...canvas,
        timestamp: new Date().toISOString()
      };

      const request = store.put(canvasData);

      request.onsuccess = () => {
        const canvasId = (request.result as number);
        console.log(`Canvas data saved successfully (ID: ${canvasId})`);
        resolve(canvasId);
      };

      request.onerror = () => {
        console.error('Error saving canvas data:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error saving canvas data:', error);
    throw error;
  }
};
/**
 * 根据ID获取画布数据
 * @param id 画布ID
 * @returns 画布数据对象
 */
export const getCanvasDataById = async (id: string): Promise<CanvasData | null> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CANVAS_STORE_NAME, 'readonly');
      const store = transaction.objectStore(CANVAS_STORE_NAME);
      
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result as CanvasData | null);
      };

      request.onerror = () => {
        console.error(`Error getting canvas data with ID ${id}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error getting canvas data with ID ${id}:`, error);
    throw error;
  }
};
