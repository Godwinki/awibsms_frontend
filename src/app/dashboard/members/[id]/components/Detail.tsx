import React from 'react';

interface DetailProps {
  label: string;
  value: React.ReactNode;
}

export function Detail({ label, value }: DetailProps) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">
        {value || <span className="text-muted-foreground italic">Not provided</span>}
      </p>
    </div>
  );
}
