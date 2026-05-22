"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      
      if (code) {
        try {
          // Exchange code for session
          await supabase.auth.exchangeCodeForSession(code);
          
          // Get current user to check role
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            if (profile?.role === "doctor") {
              router.push("/doctor/dashboard");
            } else if (profile?.role === "patient") {
              router.push("/patient/dashboard");
            } else {
              router.push("/dashboard");
            }
          }
        } catch (error) {
          console.error("Auth callback error:", error);
          router.push("/auth/login?error=callback_failed");
        }
      }
    };

    handleCallback();
  }, [searchParams, supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Processing your authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
