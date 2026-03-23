import React from "react";

interface ActivityItem {
  icon: string;
  title: string;
  subtitlePre: string;
  subtitleBold: string;
  value: string;
  timeAgo: string;
}

export default function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-8">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between group">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
            </div>
            <div>
              <h4 className="font-body font-semibold text-primary">{item.title}</h4>
              <p className="text-sm text-secondary">
                {item.subtitlePre} <span className="text-primary font-medium">{item.subtitleBold}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-headline font-bold text-lg">{item.value}</p>
            <p className="text-[10px] font-label font-bold text-outline uppercase">{item.timeAgo}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
