import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/actions/auth.action";
import { getInterviewById } from "@/actions/interview.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

export default async function Page({ params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect("/");

  const { id: interviewId, role, type, techStack, questions } = interview;

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />

            <h3 className="capitalize">{role} Interview</h3>
          </div>
          <DisplayTechIcons techStack={techStack} />
        </div>
        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">
          {type}
        </p>
      </div>

      <Agent
        userName={user?.name as string}
        userId={user?.id as string}
        type="interview"
        interviewId={interviewId}
        questions={questions}
      />
    </>
  );
}
