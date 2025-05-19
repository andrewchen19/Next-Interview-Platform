import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

// import { mockInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/actions/auth.action";
import {
  getInterviewsByUserId,
  getOthersInterviews,
} from "@/actions/interview.action";

export default async function HomePage() {
  const user = await getCurrentUser();

  // use Promise.all to run them concurrently
  const [interviews, othersInterviews] = await Promise.all([
    getInterviewsByUserId(user?.id as string),
    getOthersInterviews({ userId: user?.id as string }),
  ]);

  const hasMyInterviews = !!interviews && interviews?.length > 0;
  const hasOthersInterviews =
    !!othersInterviews && othersInterviews?.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p>Practice real interview questions & get instant feedback.</p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href={"/interview"}>Create an interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robot"
          height={400}
          width={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your own interviews</h2>

        <div className="interviews-section">
          {hasMyInterviews ? (
            interviews.map((interview) => (
              <InterviewCard key={interview.id} {...interview} />
            ))
          ) : (
            <p>You haven&apos;t create any interview yet. Create it now.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Pick others interviews</h2>

        <div className="interviews-section">
          {hasOthersInterviews ? (
            othersInterviews.map((interview) => (
              <InterviewCard key={interview.id} {...interview} />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}
