"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/actions/interview.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export default function Agent({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: AgentProps) {
  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [latestMessage, setLatestMessage] = useState<string>("");

  const handleCallStart = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      const assistantOverrides = {
        variableValues: {
          username: userName,
          userid: userId,
        },
        // necessary, even if you’re not using them
        clientMessages: [],
        serverMessages: [],
      };

      // tell vapi to start the call
      // collecting interview info we need according to the work flow
      await vapi.start(
        process.env.NEXT_PUBLIC_VAPI_WORK_FLOW_ID as string,
        assistantOverrides
      );
    } else {
      let formattedQuestions = "";

      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      const assistantOverrides = {
        variableValues: {
          questions: formattedQuestions,
        },
        // necessary, even if you’re not using them
        clientMessages: [],
        serverMessages: [],
      };

      // tell vapi to start the call
      // collecting feedback we need according to the interview
      await vapi.start(interviewer, assistantOverrides);
    }
  };

  const handleDisconnectCall = async () => {
    setCallStatus(CallStatus.FINISHED);

    // tell vapi to stop the call
    await vapi.stop();
  };

  // all these functions define what happen at different stages of the call
  // you can think these as vapi event listeners
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => {
      console.log(error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // clean up function
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLatestMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      const { success, feedbackId } = await createFeedback({
        interviewId: interviewId as string,
        userId,
        transcript: messages,
      });

      if (success && feedbackId) {
        router.push(`/interview/${interviewId}/feedback/`);
      } else {
        // failed to generate feedback
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId, router, interviewId]);

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="ai avatar"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>{type === "generate" ? "AI Assistant" : "AI Interviewer"}</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* transcript */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      {/* button */}
      <div className="w-fll flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCallStart}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === CallStatus.CONNECTING ? ". . ." : "Call"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnectCall}>
            End
          </button>
        )}
      </div>
    </>
  );
}
