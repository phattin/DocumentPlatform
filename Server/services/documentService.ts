import { db } from "../utils/firebaseAdmin";

export async function createDocument(
  userId: string,
  title: string,
  description: string,
  subject: string,
  fileUploaded: string
) {
  const ref = await db.collection("Documents").add({
    userId,
    title,
    description,
    subject,
    fileUploaded,
    date: new Date(),
    likes: 0,
    downloads: 0,
    status: "pending"
  });

  return { id: ref.id };
}

export async function getUserDocuments(userId: string) {
  const snap = await db
    .collection("Documents")
    .where("userId", "==", userId)
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}