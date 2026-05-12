import type { Metadata } from "next";
import { DoctorOnboardingPage } from "../../features/doctor-onboarding";

export const metadata: Metadata = {
  title: "GutGuard — Doctor Onboarding",
  description:
    "Create your GutGuard practitioner protocol center account and activate your doctor portal.",
};

export default function Page() {
  return <DoctorOnboardingPage />;
}
