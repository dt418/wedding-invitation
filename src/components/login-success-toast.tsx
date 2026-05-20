"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function LoginSuccessToast() {
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    if (searchParams.get("justLoggedIn") === "true") {
      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });
    }
  }, [searchParams]);

  return null;
}

export default function LoginSuccessToastWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginSuccessToast />
    </Suspense>
  );
}