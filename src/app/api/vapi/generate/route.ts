import { NextResponse } from "next/server";

import { db } from "@/firebase/admin";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { getRandomInterviewCover } from "@/lib/utils";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}

export async function POST(request: Request) {
  const { type, level, role, techstack, userid, amount } = await request.json();

  try {
    // gemini generate questions based on the info we passed to it
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      type,
      level,
      role,
      techStack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    // 201 Created
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
