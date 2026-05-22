import type { Metadata } from "next";
import { PatientLandingPage } from "../features/landing/patient";

export const metadata: Metadata = {
  title: "GutGuard BioScan — Find Out Your Inflammatory Score",
  description:
    "Your inflammatory load is measurable. It has a direction. GutGuard BioScan gives it a number — reviewed by a licensed Philippine physician within 48 hours.",
};

export default function HomePage() {
  return <PatientLandingPage />;
}
