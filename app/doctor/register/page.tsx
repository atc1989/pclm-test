import type { Metadata } from "next";
import { DoctorRegisterPage } from "../../features/doctor-onboarding";

export const metadata: Metadata = {
  title: "GutGuard — Create Doctor Account",
  description:
    "Register your GutGuard practitioner account to access the protocol center.",
};

export default function Page() {
  return <DoctorRegisterPage />;
}
