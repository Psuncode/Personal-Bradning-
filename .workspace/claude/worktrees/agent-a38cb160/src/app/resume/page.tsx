import type { Metadata } from "next";
import { ResumeView } from "@/components/sections/resume-view";

export const metadata: Metadata = {
  title: "Resume",
  description: "Philip Sun — Product Manager, Healthcare Founder, and Business Strategist. Experience, education, and skills.",
};

export default function ResumePage() {
  return (
    <div className="pb-24 pt-8">
      <ResumeView />
    </div>
  );
}
