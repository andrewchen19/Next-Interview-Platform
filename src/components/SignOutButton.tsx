import { signOut } from "@/actions/auth.action";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      const result = await signOut();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    } catch {
      toast.error("There was an error. Please try again.");
    }
  };

  return (
    <Button onClick={handleSignOut} className="btn-signout">
      Sign out
    </Button>
  );
}
