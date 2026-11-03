"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  compact,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg border border-amber-200 dark:border-amber-500/30 bg-[#FFF7E6] dark:bg-amber-950/20 px-4 py-3 text-xs text-[#92400E] dark:text-amber-200 flex items-center gap-3 transition-colors ${className}`}
      role="alert"
    >
      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <p className="leading-relaxed">
        <strong>Medical Notice:</strong> For academic research only. Results are not clinically validated and must not be used for medical diagnosis or treatment.
      </p>
    </div>
  );
};
