"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      console.log("Attempting to update password...");
      
      // First, verify we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log("Session error:", sessionError);
        setError("Session error. Please try requesting a new password reset.");
        setLoading(false);
        return;
      }

      if (!session) {
        console.log("No active session found");
        setError("No active session found. Please request a new password reset.");
        setLoading(false);
        return;
      }

      console.log("Session found, updating password for user:", session.user.id);

      // Update password for the authenticated user
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.log("Update error:", updateError);
        setError(`Failed to update password: ${updateError.message}`);
        setLoading(false);
        return;
      }

      console.log("Password updated successfully!");
      setSuccess(true);
      
      // Give user a moment to see the success message
      setTimeout(() => {
        // Sign out user after password change for security
        supabase.auth.signOut().then(() => {
          router.push("/login?message=password-updated");
        });
      }, 2000);
      
    } catch (error) {
      console.log("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-green-600">Password Updated!</CardTitle>
          <CardDescription>
            Your password has been successfully updated. You will be redirected to the login page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded mb-4">
              Redirecting to login page...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="grid gap-4">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}