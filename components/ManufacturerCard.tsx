import React from "react";

interface ManufacturerCardProps {
  brand: string;
  share: string;
  imageSrc: string;
  imageAlt: string;
}

export default function ManufacturerCard({ brand, share, imageSrc, imageAlt }: ManufacturerCardProps) {
  return (
    <div className="space-y-4">
      <div className="aspect-square bg-black rounded-lg overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={imageAlt} 
          src={imageSrc} 
        />
      </div>
      <div>
        <p className="font-label font-bold text-[10px] tracking-widest uppercase text-[#cca730]">{brand}</p>
        <p className="font-headline text-lg">{share}</p>
      </div>
    </div>
  );
}
