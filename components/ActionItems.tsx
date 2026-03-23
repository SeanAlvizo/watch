import React from "react";

export default function ActionItems() {
  return (
    <section className="bg-primary text-on-primary p-6 rounded-xl shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <span className="material-symbols-outlined text-tertiary-fixed-dim">priority_high</span>
        <h3 className="font-headline text-xl">Action Items</h3>
      </div>
      <ul className="space-y-6">
        <li className="border-b border-outline-variant/20 pb-4">
          <p className="text-[10px] font-label font-bold tracking-widest text-[#cca730] mb-1 uppercase">Authentication Pending</p>
          <p className="text-sm font-body leading-relaxed text-[#ffffff]">Vacheron Constantin Overseas requires workshop validation.</p>
        </li>
        <li className="border-b border-outline-variant/20 pb-4">
          <p className="text-[10px] font-label font-bold tracking-widest text-[#cca730] mb-1 uppercase">Shipment Delay</p>
          <p className="text-sm font-body leading-relaxed text-[#ffffff]">Incoming shipment #8842 held at customs (London).</p>
        </li>
        <li>
          <p className="text-[10px] font-label font-bold tracking-widest text-[#cca730] mb-1 uppercase">Contract Expiry</p>
          <p className="text-sm font-body leading-relaxed text-[#ffffff]">Insurance policy for Gallery Sector A expires in 3 days.</p>
        </li>
      </ul>
      <button className="w-full mt-8 bg-[#ffffff] text-[#000000] py-4 rounded font-label font-bold tracking-widest uppercase text-[10px] hover:bg-[#e3e2e1] transition-colors">
        Open Command Center
      </button>
    </section>
  );
}
