import type { Metadata } from "next";
import { ResumeView } from "@/components/sections/resume-view";

export const metadata: Metadata = {
  title: "Resume",
  description: "Philip Sun — Product Manager, Engineer, and Strategist. View experience, skills, and education.",
};

export default function ResumePage() {
  return (
    <div className="pb-24 pt-8">
      <ResumeView />
    </div>
  );
}
