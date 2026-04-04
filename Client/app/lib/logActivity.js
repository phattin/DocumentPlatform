import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const logActivity = async (userId, type, title, docId = null) => {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      userId,
      type,
      title,
      docId,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('logActivity error:', e);
  }
};