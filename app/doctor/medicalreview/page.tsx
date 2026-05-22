import { Suspense } from "react";
import { ProtectedRoute } from "@/lib/supabase/protected-route";
import { MedicalReviewContent } from "./medical-review-content";

export default function MedicalReviewPage() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <Suspense>
        <MedicalReviewContent />
      </Suspense>
    </ProtectedRoute>
  );
}
