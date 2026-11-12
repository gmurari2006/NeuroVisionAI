"use client";

import React from "react";
import Link from "next/link";
import { Brain } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#DFE7F1] dark:border-[#2B3B52] bg-white dark:bg-[#111C30] py-6 px-4 sm:px-6 mt-auto text-xs text-[#64748B] dark:text-[#A7B5C9] transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#17365D] dark:bg-[#3B82F6] text-white flex items-center justify-center shrink-0">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[#172B4D] dark:text-[#F1F5F9]">
            NeuroVisionAI
          </span>
          <span>&bull;</span>
          <span>Brain MRI Analysis Workstation</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link href="/" className="hover:text-[#172B4D] dark:hover:text-[#F1F5F9] transition-colors">
            Dashboard
          </Link>
          <Link href="/analysis" className="hover:text-[#172B4D] dark:hover:text-[#F1F5F9] transition-colors">
            MRI Analysis
          </Link>
          <Link href="/models" className="hover:text-[#172B4D] dark:hover:text-[#F1F5F9] transition-colors">
            Models
          </Link>
          <Link href="/history" className="hover:text-[#172B4D] dark:hover:text-[#F1F5F9] transition-colors">
            History
          </Link>
          <Link href="/methodology" className="hover:text-[#172B4D] dark:hover:text-[#F1F5F9] transition-colors">
            Methodology
          </Link>
          <Link href="/about" className="hover:text-[#172B4D] dark:hover:text-[#F1F5F9] transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
};
