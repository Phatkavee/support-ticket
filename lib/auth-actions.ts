// "use server";

// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { createClient } from "@/utils/supabase/server";

// export async function login(formData: FormData) {
//   const supabase = await createClient();

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const data = {
//     email: formData.get("email") as string,
//     password: formData.get("password") as string,
//   };

//   const { error } = await supabase.auth.signInWithPassword(data);

//   if (error) {
//     redirect("/error");
//   }

//   revalidatePath("/", "layout");
//   redirect("/");
// }

// export async function signup(formData: FormData) {
//   const supabase = await createClient();

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const firstName = formData.get("first-name") as string;
//   const lastName = formData.get("last-name") as string;
//   const data = {
//     email: formData.get("email") as string,
//     password: formData.get("password") as string,
//     options: {
//       data: {
//         full_name: `${firstName + " " + lastName}`,
//         email: formData.get("email") as string,
//       },
//     },
//   };

//   const { error } = await supabase.auth.signUp(data);

//   if (error) {
//     redirect("/error");
//   }

//   revalidatePath("/", "layout");
//   redirect("/");
// }

// export async function signout() {
//   const supabase = await createClient();
//   const { error } = await supabase.auth.signOut();
//   if (error) {
//     console.log(error);
//     redirect("/error");
//   }

//   redirect("/logout");
// }

// export async function signInWithGoogle() {
//   const supabase = await createClient();
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       queryParams: {
//         access_type: "offline",
//         prompt: "consent",
//       },
//     },
//   });

//   if (error) {
//     console.log(error);
//     redirect("/error");
//   }


//   redirect(data.url);
// }


// export async function resetPassword(formData: FormData) {
//   const supabase = await createClient();
//   const email = formData.get("email") as string;

//   if (!email) {
//     redirect("/error?message=email-required");
//   }

//   const { error } = await supabase.auth.resetPasswordForEmail(email, {
//     redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
//   });

//   if (error) {
//     console.log("Reset password error:", error);
//     redirect("/error?message=reset-password-failed");
//   }

//   redirect("/reset-password-sent");
// }

// export async function updatePassword(formData: FormData) {
//   const supabase = await createClient();
//   const password = formData.get("password") as string;

//   const { error } = await supabase.auth.updateUser({
//     password: password,
//   });

//   if (error) {
//     console.log(error);
//     redirect("/error");
//   }

//   revalidatePath("/", "layout");
//   redirect("/login");
// }






"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error?message=login-failed");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: `${firstName + " " + lastName}`,
        email: formData.get("email") as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error?message=signup-failed");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error?message=logout-failed");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error?message=google-login-failed");
  }

  redirect(data.url);
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    redirect("/error?message=email-required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
  });

  if (error) {
    console.log("Reset password error:", error);
    redirect("/error?message=reset-password-failed");
  }

  redirect("/reset-password-sent");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  console.log("=== PASSWORD UPDATE DEBUG ===");
  console.log("Password length:", password.length);
  console.log("Confirm password length:", confirmPassword.length);

  // Basic validation
  if (password !== confirmPassword) {
    console.log("Passwords don't match");
    redirect("/error?message=passwords-dont-match");
  }

  if (password.length < 6) {
    console.log("Password too short");
    redirect("/error?message=password-too-short");
  }

  try {
    console.log("Checking current user session...");
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log("User error:", userError);
      redirect("/error?message=user-session-error");
    }

    if (!user) {
      console.log("No user found");
      redirect("/error?message=no-user-session");
    }

    console.log("User found:", user.id);
    console.log("Attempting to update password...");

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.log("Supabase update error:", error);
      console.log("Error message:", error.message);
      console.log("Error code:", error.code);
      
      redirect("/error?message=password-update-failed&details=" + encodeURIComponent(error.message));
    }

    console.log("Password updated successfully!");
    
    // Clear session after password change (best practice)
    await supabase.auth.signOut();
    
    revalidatePath("/", "layout");
    redirect("/login?message=password-updated");
    
  } catch (error) {
    console.log("Unexpected error in catch block:", error);
    
    // Don't redirect with the actual error object, just the message
    if (error instanceof Error) {
      redirect("/error?message=unexpected-error&details=" + encodeURIComponent(error.message));
    } else {
      redirect("/error?message=unexpected-error&details=" + encodeURIComponent(String(error)));
    }
  }
}