import { ProtectedRoute } from "@/lib/supabase/protected-route";
import { DoctorDashboardContent } from "./doctor-dashboard-content";

export default function DoctorDashboard() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorDashboardContent />
    </ProtectedRoute>
  );
}
