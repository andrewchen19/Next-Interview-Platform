import Agent from "@/components/Agent";

import { getCurrentUser } from "@/actions/auth.action";

export default async function InterviewGenerationPage() {
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview Generation</h3>

      <Agent
        userName={user?.name as string}
        userId={user?.id as string}
        type="generate"
      />
    </>
  );
}
