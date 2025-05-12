import Link from "next/link";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { mockInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";

export default function HomePage() {
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p>Practice real interview questions & get instant feedback.</p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href={"/interview"}>Start an interview</Link>
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
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {/* <p>You haven&apos;t take any interview yet</p> */}

          {mockInterviews.map((interview) => (
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an interview</h2>

        <div className="interviews-section">
          {/* <p>There are no interviews available</p> */}

          {mockInterviews.map((interview) => (
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </div>
      </section>
    </>
  );
}
