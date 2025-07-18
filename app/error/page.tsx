import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string, details?: string }>
}) {
  const params = await searchParams;
  
  const getErrorMessage = (code: string) => {
    switch (code) {
      case "reset-code-expired":
        return "Your password reset link has expired. Please request a new one.";
      case "invalid-reset-code":
        return "Invalid reset code. Please request a new password reset.";
      case "user-session-error":
        return "User session error. Please request a new password reset.";
      case "no-user-session":
        return "No user session found. Please request a new password reset.";
      case "passwords-dont-match":
        return "Passwords don't match. Please try again.";
      case "password-too-short":
        return "Password must be at least 6 characters long.";
      case "password-update-failed":
        return "Failed to update password. Please try again.";
      case "unexpected-error":
        return "An unexpected error occurred. Please try again.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const shouldShowResetButton = (code: string) => {
    return [
      "reset-code-expired",
      "invalid-reset-code",
      "user-session-error",
      "no-user-session"
    ].includes(code);
  };

  // Clean up details - remove NEXT_REDIRECT noise
  const cleanDetails = (details: string) => {
    if (details.includes("NEXT_REDIRECT")) {
      return "Internal redirect error occurred";
    }
    return details;
  };

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Error</CardTitle>
          <CardDescription>
            {getErrorMessage(params.message || "")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {params.details && !params.details.includes("NEXT_REDIRECT") && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                <strong>Details:</strong> {decodeURIComponent(cleanDetails(params.details))}
              </div>
            )}

            <Button asChild className="w-full">
              <Link href="/login">
                Back to Login
              </Link>
            </Button>
            
            {shouldShowResetButton(params.message || "") && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/forgot-password">
                  Request New Reset
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}