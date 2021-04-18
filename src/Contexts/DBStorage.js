import Dexie from 'dexie';

const db = new Dexie('AppDB');

db.version(1).stores({ formData: 'id,value' });

export default db;
