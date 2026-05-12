import type { Metadata } from "next";
import { DoctorLandingPage } from "../features/landing/doctor";

export const metadata: Metadata = {
  title: "GutGuard — For Healthcare Professionals · Philippines",
  description:
    "Your patients have inflammation their labs confirm and their referrals ignore. GutGuard gives you the clinical tool to address it.",
};

export default function DoctorPage() {
  return <DoctorLandingPage />;
}
