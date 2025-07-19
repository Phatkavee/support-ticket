import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  console.log("Reset password page accessed");

  // Check if user has an active session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  console.log("Session check:", { 
    hasSession: !!session, 
    sessionError: sessionError,
    userId: session?.user?.id 
  });

  if (sessionError) {
    console.log("Session error on reset password page:", sessionError);
    redirect("/error?message=session-check-failed");
  }

  if (!session) {
    console.log("No session found on reset password page");
    redirect("/forgot-password?message=session-expired");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ResetPasswordForm />
    </div>
  );
}