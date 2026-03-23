import React from "react";

interface LowStockItemProps {
  name: string;
  unitsLeft: number;
  imageSrc: string;
  imageAlt: string;
}

export default function LowStockAlert({ items }: { items: LowStockItemProps[] }) {
  return (
    <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
      <h3 className="font-headline text-xl font-bold mb-6">Low Stock Alerts</h3>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-4">
            <div className="flex-1">
              <h4 className="font-body text-sm font-bold">{item.name}</h4>
              <p className="text-[10px] text-outline font-label uppercase">{item.unitsLeft} {item.unitsLeft === 1 ? 'UNIT' : 'UNITS'} REMAINING</p>
            </div>
            <button className="text-[#cca730]">
              <span className="material-symbols-outlined">shopping_basket</span>
            </button>
          </div>
        ))}
      </div>
      <div className="mt-10 pt-8 border-t border-outline-variant/30 text-center">
        <p className="font-body text-sm text-secondary italic">"Inventory is the lifeblood of horology."</p>
      </div>
    </section>
  );
}
