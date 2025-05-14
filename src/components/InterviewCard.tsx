import { getRandomInterviewCover } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

export default function InterviewCard({
  id,
  role,
  type,
  techStack,
  createdAt,
}: Interview) {
  const feedback = null as Feedback | null;

  // regex -> g is for global (searches the entire string) & i is for case sensitive
  // checks whether the string type contains the word "mix"
  // For example, "Mix", "MIXED", and "mix" will all be normalized to "Mixed"
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <>
      <div className="card-border w-[360px] max-sm:w-full min-h-96">
        <div className="card-interview">
          <div>
            <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
              <p className="badge-text">{normalizedType}</p>
            </div>

            <Image
              src={getRandomInterviewCover()}
              alt="cover image"
              width={90}
              height={200}
              className="rounded-full object-fit size-[90px]"
            />

            <h3 className="mt-5 capitalize">{role} Interview</h3>

            <div className="flex flex-row gap-5 mt-3">
              <div className="flex fle-rwo gap-2">
                <Image
                  src="/calendar.svg"
                  alt="calendar"
                  width={22}
                  height={22}
                />
                <p>{formattedDate}</p>
              </div>
              <div className="flex fle-rwo gap-2">
                <Image src="/star.svg" alt="star" width={22} height={22} />
                <p>{feedback?.totalScore || "---"}/100</p>
              </div>
            </div>

            <p className="line-clamp-2 mt-5">
              {feedback?.finalAssessment ||
                "You haven't take any interview yet. Take it now to improve your skills."}
            </p>
          </div>

          <div className="flex flex-row justify-between">
            <DisplayTechIcons techStack={techStack} />

            <Button asChild className="btn-primary">
              <Link
                href={
                  feedback ? `/interview/${id}/feedback` : `/interview/${id}`
                }
              >
                {feedback ? "Check feedback" : "View interview"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
