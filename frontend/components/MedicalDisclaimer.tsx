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
      className={`rounded-xl border border-amber-200/80 dark:border-amber-500/20 bg-[#FFFBEB] dark:bg-amber-950/20 px-4 py-3 text-xs text-[#B45309] dark:text-amber-200 flex items-center gap-3 transition-colors ${className}`}
      role="alert"
    >
      <ShieldAlert className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] shrink-0" />
      <p className="leading-relaxed">
        <strong>Academic & Research Notice:</strong> For academic and research demonstration only. Not intended for clinical diagnosis. Predictions and Grad-CAM activation heatmaps represent convolutional neural network feature attention and do not constitute clinical evaluations or medical treatment advice.
      </p>
    </div>
  );
};
