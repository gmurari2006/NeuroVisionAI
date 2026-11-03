"use client";

import React from "react";
import Link from "next/link";
import { Brain } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#DCE5EF] dark:border-[#1E344D] bg-[#FFFFFF] dark:bg-[#132235] py-6 px-4 sm:px-6 mt-auto text-xs text-[#64748B] dark:text-[#94A3B8] transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1769AA] text-white flex items-center justify-center shrink-0">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[#16324F] dark:text-[#F1F5F9]">NeuroVisionAI</span>
          <span>&bull;</span>
          <span>AI-Powered Brain MRI Analysis</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="hover:text-[#16324F] dark:hover:text-[#F1F5F9] transition-colors">
            Home / MRI Analysis
          </Link>
          <Link href="/models" className="hover:text-[#16324F] dark:hover:text-[#F1F5F9] transition-colors">
            Model Comparison
          </Link>
          <Link href="/methodology" className="hover:text-[#16324F] dark:hover:text-[#F1F5F9] transition-colors">
            Methodology
          </Link>
          <Link href="/history" className="hover:text-[#16324F] dark:hover:text-[#F1F5F9] transition-colors">
            History
          </Link>
          <Link href="/about" className="hover:text-[#16324F] dark:hover:text-[#F1F5F9] transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
};
