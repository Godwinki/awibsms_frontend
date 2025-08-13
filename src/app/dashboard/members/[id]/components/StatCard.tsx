import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon, loading = false }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="mt-2 text-lg font-semibold">
        {loading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
