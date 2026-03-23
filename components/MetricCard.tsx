import React from "react";

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
  isTertiaryBorder?: boolean;
}

export default function MetricCard({ title, value, suffix, isTertiaryBorder = false }: MetricCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0px_20px_40px_rgba(0,0,0,0.04)] group hover:translate-y-[-4px] transition-all duration-300">
      <p className="text-[10px] font-label font-bold tracking-[0.1em] text-outline uppercase mb-3">{title}</p>
      <div className="flex items-baseline space-x-2">
        <span className="font-headline text-2xl font-bold">{value}</span>
        {suffix && suffix}
      </div>
    </div>
  );
}
