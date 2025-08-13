"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ 
  message,
  className
}) => {
  if (!message) return null;

  return (
    <div 
      className={`text-sm text-destructive flex items-center gap-x-1 ${className}`}
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};
