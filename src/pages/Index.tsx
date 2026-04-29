"use client";

import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <AssessmentWizard />
      <MadeWithDyad />
    </div>
  );
};

export default Index;