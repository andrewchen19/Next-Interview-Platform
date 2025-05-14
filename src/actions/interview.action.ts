"use server";

import { db } from "@/firebase/admin";

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const interviewRef = await db.collection("interviews").doc(id).get();

    if (!interviewRef.exists) return null;

    return {
      id: interviewRef.id,
      ...interviewRef.data(),
    } as Interview;
  } catch {
    return null;
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch {
    return null;
  }
}

export async function getOthersInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 8 } = params;

  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "!=", userId)
      .where("finalized", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.log(error);
    return null;
  }
}
