"use client";

import { Construction } from "lucide-react";

interface PlaceholderTabProps {
  title: string;
  description: string;
}

export function PlaceholderTab({ title, description }: PlaceholderTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
      <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Construction className="h-10 w-10 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md">
        {description}
      </p>
      
      <div className="mt-8 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
        Tính năng đang được phát triển
      </div>
    </div>
  );
}
