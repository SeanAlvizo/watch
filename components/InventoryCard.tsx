import React from "react";

interface InventoryCardProps {
  imageSrc: string;
  statusText: string;
  statusType: "instock" | "reserved" | "sold";
  brand: string;
  model: string;
  meta: string;
  price: string;
}

export default function InventoryCard({ imageSrc, statusText, statusType, brand, model, meta, price }: InventoryCardProps) {
  const statusStyles = {
    instock: "bg-[#e3e2e1] text-[#000000]",
    reserved: "bg-[#ffe088] text-[#241a00]",
    sold: "bg-[#c4c7c7] text-[#444748]",
  };

  return (
    <div className="bg-[#ffffff] rounded-[4px] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] border border-outline-variant/10 overflow-hidden group hover:shadow-[0px_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      <div className="relative p-0 bg-[#f4f3f2] aspect-[4/3] flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageSrc} 
          alt={model} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-sm text-[8px] font-label font-bold tracking-widest uppercase shadow-sm ${statusStyles[statusType]}`}>
          {statusText}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-6 flex flex-col flex-1">
        <p className="text-[9px] font-label font-bold tracking-widest text-[#8c8c8c] uppercase mb-1.5">{brand}</p>
        <h4 className="font-headline text-[17px] font-bold text-[#2d2d2d] leading-[1.2] mb-4 flex-1">{model}</h4>
        
        <p className="text-[10px] font-label font-bold tracking-widest text-[#737373] uppercase mb-3">{meta}</p>
        
        <div className="flex justify-between items-end mt-auto pt-2">
          <span className="font-body text-[16px] font-bold text-[#2d2d2d]">{price}</span>
          <button className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-[#737373] hover:text-[#000000] hover:bg-[#e2e1e0] transition-colors">
            <span className="material-symbols-outlined text-[16px]">{statusType === 'sold' ? 'visibility' : 'arrow_forward'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
