"use server";

import { db } from "@/firebase/admin";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { feedbackSchema } from "@/constants";

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
  params: GetOthersInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 9 } = params;

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

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    const formattedTranscript = transcript
      .map(({ role, content }) => `- ${role}: ${content}\n`)
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const {
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
    } = object;

    const feedback = {
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      interviewId,
      userId,
      createdAt: new Date().toISOString(),
    };

    const newFeedback = await db.collection("feedback").add(feedback);

    // 201 Created
    return { success: true, feedbackId: newFeedback.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getFeedback(
  params: GetFeedbackParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  try {
    const feedback = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .where("interviewId", "==", interviewId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (feedback.empty) return null;

    const feedbackDoc = feedback.docs[0];

    return {
      id: feedbackDoc.id,
      ...feedbackDoc.data(),
    } as Feedback;
  } catch (error) {
    console.log(error);
    return null;
  }
}
