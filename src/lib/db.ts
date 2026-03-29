import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface PhotoRecord {
  id: string;
  /** ローカル暦 YYYY-MM-DD */
  date: string;
  blob: Blob;
  createdAt: number;
}

/** v1 互換（マイグレーション用） */
interface LegacyPhotoRecord {
  date: string;
  blob: Blob;
  createdAt: number;
}

interface MoonDB extends DBSchema {
  photos: {
    key: string;
    value: PhotoRecord;
    indexes: { byDate: string };
  };
}

const DB_NAME = "moon-real-v1";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<MoonDB>> | null = null;

function getDb(): Promise<IDBPDatabase<MoonDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB はこの環境では使えません"));
  }
  if (!dbPromise) {
    dbPromise = openDB<MoonDB>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 2) {
          if (oldVersion === 0) {
            const store = db.createObjectStore("photos", { keyPath: "id" });
            store.createIndex("byDate", "date", { unique: false });
            return;
          }
          if (oldVersion === 1) {
            const oldStore = transaction.objectStore("photos");
            const all = (await oldStore.getAll()) as LegacyPhotoRecord[];
            db.deleteObjectStore("photos");
            const store = db.createObjectStore("photos", { keyPath: "id" });
            store.createIndex("byDate", "date", { unique: false });
            for (const row of all) {
              await store.add({
                id: crypto.randomUUID(),
                date: row.date,
                blob: row.blob,
                createdAt: row.createdAt ?? Date.now(),
              });
            }
          }
        }
      },
    });
  }
  return dbPromise;
}

/** 新規追加（同日に複数可）。追加したレコードの id を返す */
export async function savePhoto(date: string, blob: Blob): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.put("photos", {
    id,
    date,
    blob,
    createdAt: Date.now(),
  });
  return id;
}

/** その日の写真を新しい順 */
export async function getPhotosForDate(date: string): Promise<PhotoRecord[]> {
  const db = await getDb();
  const list = await db.getAllFromIndex("photos", "byDate", date);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

/** 写真が1枚以上ある日付キー（昇順） */
export async function getAllPhotoDateKeys(): Promise<string[]> {
  const db = await getDb();
  const dates = new Set<string>();
  let cursor = await db.transaction("photos").store.openCursor();
  while (cursor) {
    dates.add(cursor.value.date);
    cursor = await cursor.continue();
  }
  return Array.from(dates).sort();
}
