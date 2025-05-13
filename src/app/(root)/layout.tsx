import { isAuthenticated } from "@/actions/auth.action";
import { redirect } from "next/navigation";

import NavBar from "@/components/NavBar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <NavBar />
      {children}
    </div>
  );
}
