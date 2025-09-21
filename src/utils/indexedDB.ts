// 定义类型接口
export interface Drawing {
  id?: number;
  data: string; // 存储canvas的dataURL
  timestamp: string;
}

// 数据库配置
const DB_NAME = 'WhiteboardDB';
const DB_VERSION = 2; // 升级版本号
const DRAWINGS_STORE_NAME = 'drawings';
const HISTORY_STORE_NAME = 'history'; // 新增历史记录存储

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
      
      // 如果绘图存储对象不存在则创建
      if (!db.objectStoreNames.contains(DRAWINGS_STORE_NAME)) {
        db.createObjectStore(DRAWINGS_STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }

      // 新增历史记录存储对象（键值对形式）
      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        db.createObjectStore(HISTORY_STORE_NAME, { 
          keyPath: 'key' 
        });
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
 * 通用方法：从指定存储中获取值
 * @param storeName 存储名称
 * @param key 键名
 * @returns 值的Promise
 */
export const getItem = async <T>(storeName: string): Promise<T | null> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(storeName);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };

      request.onerror = () => {
        console.error(`Error getting item from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error getting item from ${storeName}:`, error);
    throw error;
  }
};

/**
 * 通用方法：向指定存储中设置值
 * @param storeName 存储名称
 * @param key 键名
 * @param value 要存储的值
 * @returns 操作结果的Promise
 */
export const setItem = async <T>(storeName: string, key: string, value: T): Promise<void> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error(`Error setting item in ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error setting item in ${storeName}:`, error);
    throw error;
  }
};

/**
 * 通用方法：从指定存储中删除值
 * @param storeName 存储名称
 * @param key 键名
 * @returns 操作结果的Promise
 */
export const removeItem = async (storeName: string, key: string): Promise<void> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error(`Error removing item from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error removing item from ${storeName}:`, error);
    throw error;
  }
};

/**
 * 保存绘图数据到IndexedDB
 * @param dataURL canvas的dataURL
 * @returns 保存结果的Promise
 */
export const saveDrawing = async (dataURL: string): Promise<number> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DRAWINGS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(DRAWINGS_STORE_NAME);
      
      const drawing: Omit<Drawing, 'id'> = {
        data: dataURL,
        timestamp: new Date().toISOString()
      };

      const request = store.put(drawing);

      request.onsuccess = () => {
        const drawingId = (request.result as number);
        console.log(`Drawing saved successfully (ID: ${drawingId})`);
        resolve(drawingId);
      };

      request.onerror = () => {
        console.error('Error saving drawing:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error saving drawing:', error);
    throw error;
  }
};

/**
 * 获取最新的绘图数据
 * @returns 最新绘图数据的Promise
 */
export const getLatestDrawing = async (): Promise<Drawing | null> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DRAWINGS_STORE_NAME, 'readonly');
      const store = transaction.objectStore(DRAWINGS_STORE_NAME);
      
      const request = store.getAll();

      request.onsuccess = () => {
        const drawings = request.result as Drawing[];
        
        if (drawings.length === 0) {
          resolve(null);
          return;
        }

        // 按时间戳排序，获取最新的绘图
        drawings.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        resolve(drawings[0]);
      };

      request.onerror = () => {
        console.error('Error loading drawings:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error loading latest drawing:', error);
    throw error;
  }
};

/**
 * 获取所有保存的绘图
 * @returns 绘图数组的Promise
 */
export const getAllDrawings = async (): Promise<Drawing[]> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DRAWINGS_STORE_NAME, 'readonly');
      const store = transaction.objectStore(DRAWINGS_STORE_NAME);
      
      const request = store.getAll();

      request.onsuccess = () => {
        const drawings = request.result as Drawing[];
        // 按时间戳排序，最新的在前
        drawings.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(drawings);
      };

      request.onerror = () => {
        console.error('Error loading all drawings:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error loading all drawings:', error);
    throw error;
  }
};

/**
 * 根据ID删除绘图
 * @param id 绘图ID
 * @returns 删除结果的Promise
 */
export const deleteDrawing = async (id: number): Promise<void> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DRAWINGS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(DRAWINGS_STORE_NAME);
      
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Drawing with ID ${id} deleted successfully`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Error deleting drawing with ID ${id}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error deleting drawing with ID ${id}:`, error);
    throw error;
  }
};

/**
 * 清空所有绘图数据
 * @returns 清空结果的Promise
 */
export const clearAllDrawings = async (): Promise<void> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DRAWINGS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(DRAWINGS_STORE_NAME);
      
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All drawings cleared successfully');
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing all drawings:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error clearing all drawings:', error);
    throw error;
  }
};

/**
 * 清空历史记录数据
 * @returns 清空结果的Promise
 */
export const clearAllHistory = async (): Promise<void> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HISTORY_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE_NAME);
      
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All history cleared successfully');
        resolve();
      };

      request.onerror = () => {
        console.error('Error clearing all history:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error clearing all history:', error);
    throw error;
  }
};
