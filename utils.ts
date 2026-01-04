
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Dinâmica de Trava: Calcula se um recurso está bloqueado para o usuário.
 * Administradores possuem bypass total para fins de gestão.
 */
export const isResourceLocked = (userJoinedAt: number, lockDays: number, userRole: string): { locked: boolean; remaining: string } => {
  // Dinâmica: Admin sempre tem acesso
  if (userRole === 'admin') return { locked: false, remaining: '' };
  
  const unlockDate = userJoinedAt + (lockDays * 24 * 60 * 60 * 1000);
  const now = Date.now();
  const diff = unlockDate - now;

  if (diff <= 0 || lockDays <= 0) return { locked: false, remaining: '' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return { locked: true, remaining: `${days}d ${hours}h` };
  }
  return { locked: true, remaining: `${hours}h restantes` };
};

// IndexedDB implementation to bypass localStorage limits (5MB)
const DB_NAME = 'DominioMagneticoDB';
const STORE_NAME = 'resources';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveResourcesDB = async (resources: any[]) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  store.clear();
  resources.forEach(r => store.put(r));
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const loadResourcesDB = async (): Promise<any[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
