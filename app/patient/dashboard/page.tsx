import { ProtectedRoute } from "@/lib/supabase/protected-route";
import { PatientDashboardContent } from "./patient-dashboard-content";

export default function PatientDashboard() {
  return (
    <ProtectedRoute requiredRole="patient">
      <PatientDashboardContent />
    </ProtectedRoute>
  );
}
