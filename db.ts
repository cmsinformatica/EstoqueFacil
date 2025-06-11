import { Product, Person, OutputLog } from './types';

const DB_NAME = 'InventoryDB';
const DB_VERSION = 1;

// Object store names
export const PRODUCT_STORE = 'products';
export const PERSON_STORE = 'people';
export const OUTPUT_LOG_STORE = 'outputLogs';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      
      if (!dbInstance.objectStoreNames.contains(PRODUCT_STORE)) {
        const productStore = dbInstance.createObjectStore(PRODUCT_STORE, { keyPath: 'id' });
        productStore.createIndex('name_idx', 'name', { unique: false });
        productStore.createIndex('sku_idx', 'sku', { unique: true });
      }
      if (!dbInstance.objectStoreNames.contains(PERSON_STORE)) {
        const personStore = dbInstance.createObjectStore(PERSON_STORE, { keyPath: 'id' });
        personStore.createIndex('name_idx', 'name', { unique: false });
      }
      if (!dbInstance.objectStoreNames.contains(OUTPUT_LOG_STORE)) {
        const outputLogStore = dbInstance.createObjectStore(OUTPUT_LOG_STORE, { keyPath: 'id' });
        outputLogStore.createIndex('productId_idx', 'productId', { unique: false });
        outputLogStore.createIndex('personId_idx', 'personId', { unique: false });
        outputLogStore.createIndex('timestamp_idx', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log("Database initialized successfully");
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

const getStore = (storeName: string, mode: IDBTransactionMode) => {
  if (!db) {
    throw new Error("Database not initialized. Call initDB first.");
  }
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

// --- Product CRUD ---
export const addProductDB = (product: Product): Promise<Product> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PRODUCT_STORE, 'readwrite');
    const request = store.add(product);
    request.onsuccess = () => resolve(product);
    request.onerror = (event) => {
        console.error("Error adding product:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
    }
  });
};

export const getProductsDB = (): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PRODUCT_STORE, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Product[]);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

export const updateProductDB = (product: Product): Promise<Product> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PRODUCT_STORE, 'readwrite');
    const request = store.put(product);
    request.onsuccess = () => resolve(product);
    request.onerror = (event) => {
        console.error("Error updating product:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
    }
  });
};

export const deleteProductDB = (productId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PRODUCT_STORE, 'readwrite');
    const request = store.delete(productId);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

export const getProductDBById = (productId: string): Promise<Product | undefined> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PRODUCT_STORE, 'readonly');
    const request = store.get(productId);
    request.onsuccess = () => resolve(request.result as Product | undefined);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};


// --- Person CRUD ---
export const addPersonDB = (person: Person): Promise<Person> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PERSON_STORE, 'readwrite');
    const request = store.add(person);
    request.onsuccess = () => resolve(person);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

export const getPeopleDB = (): Promise<Person[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PERSON_STORE, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Person[]);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

export const updatePersonDB = (person: Person): Promise<Person> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PERSON_STORE, 'readwrite');
    const request = store.put(person);
    request.onsuccess = () => resolve(person);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

export const deletePersonDB = (personId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const store = getStore(PERSON_STORE, 'readwrite');
    const request = store.delete(personId);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// --- OutputLog CRUD ---
export const getOutputLogsDB = (): Promise<OutputLog[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(OUTPUT_LOG_STORE, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve((request.result as OutputLog[]).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// Special function for recording output (transactional)
export const recordProductOutputDB = (
    newLog: OutputLog,
    updatedProduct: Product
): Promise<OutputLog> => {
  return new Promise((resolve, reject) => {
    if (!db) {
        reject(new Error("Database not initialized."));
        return;
    }
    const transaction = db.transaction([PRODUCT_STORE, OUTPUT_LOG_STORE], 'readwrite');
    const productStore = transaction.objectStore(PRODUCT_STORE);
    const outputLogStore = transaction.objectStore(OUTPUT_LOG_STORE);

    const updateProductRequest = productStore.put(updatedProduct);
    const addLogRequest = outputLogStore.add(newLog);

    let productUpdateSuccess = false;
    let logAddSuccess = false;

    updateProductRequest.onsuccess = () => {
        productUpdateSuccess = true;
    };
    updateProductRequest.onerror = (event) => {
      console.error("Error updating product in transaction:", (event.target as IDBRequest).error);
      transaction.abort(); // Important to abort on any error
      reject((event.target as IDBRequest).error);
    };

    addLogRequest.onsuccess = () => {
        logAddSuccess = true;
    };
    addLogRequest.onerror = (event) => {
      console.error("Error adding output log in transaction:", (event.target as IDBRequest).error);
      transaction.abort();
      reject((event.target as IDBRequest).error);
    };
    
    transaction.oncomplete = () => {
      if (productUpdateSuccess && logAddSuccess) {
        resolve(newLog);
      } else {
        // This case should ideally be caught by individual request errors and transaction.abort()
        console.error("Transaction completed but one of the operations might have failed silently (should not happen if errors are handled).");
        reject(new Error("Transaction failed for unknown reasons."));
      }
    };

    transaction.onerror = (event) => {
      console.error("Transaction error:", (event.target as IDBTransaction).error);
      reject((event.target as IDBTransaction).error);
    };
  });
};
