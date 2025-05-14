import Agent from "@/components/Agent";

import { getCurrentUser } from "@/actions/auth.action";

export default async function InterviewPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  return (
    <>
      <h3>Interview Generation</h3>

      <Agent userName={user.name} userId={user.id} type="generate" />
    </>
  );
}
