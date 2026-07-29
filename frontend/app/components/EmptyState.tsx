"use client";

import React, { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100 text-gray-400">
        {icon || <FileQuestion className="w-8 h-8" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="max-w-sm mb-6 text-sm text-gray-500">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
