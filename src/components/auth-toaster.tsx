"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function AuthToasterContent() {
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    if (searchParams.get("registered") === "true") {
      toast.success("Account created!", {
        description: "Please sign in to continue.",
      });
    }
    if (searchParams.get("error") === "invalid_credentials") {
      toast.error("Invalid email or password.");
    } else if (searchParams.get("error") === "generic") {
      toast.error("Login failed. Please try again.");
    }
    if (searchParams.get("loggedOut") === "true") {
      toast.success("Logged out successfully.");
    }
  }, [searchParams]);

  return null;
}

export default function AuthToaster() {
  return (
    <Suspense fallback={null}>
      <AuthToasterContent />
    </Suspense>
  );
}