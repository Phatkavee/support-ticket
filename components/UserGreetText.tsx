"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const UserGreetText = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [supabase.auth]);

  // Prevent hydration mismatch by showing loading state initially
  if (isLoading) {
    return (
      <div className="text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  if (user !== null) {
    return (
      <div className="text-sm text-gray-600">
        Hello{" "}
        <span className="font-semibold text-gray-900">
          {user.user_metadata.full_name ?? user.email ?? "User"}
        </span>
        !
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600">
      Welcome, Guest
    </div>
  );
};

export default UserGreetText;