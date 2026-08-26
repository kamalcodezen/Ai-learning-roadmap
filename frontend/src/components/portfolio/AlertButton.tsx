"use client";

import React from "react";
import { Plus } from "lucide-react";

interface AlertButtonProps {
  text: string;
  className?: string;
  alertMessage?: string;
}

export function AlertButton({ 
  text, 
  className, 
  alertMessage = "Project upload feature is coming in Phase 2!" 
}: AlertButtonProps) {
  return (
    <button 
      onClick={() => alert(alertMessage)}
      className={className}
    >
      <Plus className="w-5 h-5 mr-2" /> {text}
    </button>
  );
}
