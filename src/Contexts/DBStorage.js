/* eslint-disable linebreak-style */
import Dexie from 'dexie';

const db = new Dexie('AppDB');

db.version(1).stores({ formData: 'id' });

export default db;
