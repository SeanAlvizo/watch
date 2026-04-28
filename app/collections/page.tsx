"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Watch { id: string; brand: string; model: string; reference_number: string; year: number; condition: string; movement: string; case_size: string; material: string; price: number; image_url: string; }

export default function CollectionsPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movementFilter, setMovementFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  const fetchWatches = useCallback(async () => {
    try {
      setError(null);
      const supabase = createClient();
      const { data, error: err } = await supabase.from('watches').select('*').eq('status', 'in_stock').order('price', { ascending: false });
      if (err) throw err;
      if (data) setWatches(data as Watch[]);
      setLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load collections';
      console.error('Fetch watches error:', err);
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  const filtered = watches.filter(w => {
    const matchesMovement = movementFilter === 'all' || w.movement === movementFilter;
    const matchesCondition = conditionFilter === 'all' || w.condition === conditionFilter;
    return matchesMovement && matchesCondition;
  });

  return (
    <div className="bg-[#f8f7f6] selection:bg-tertiary-fixed selection:text-on-tertiary-fixed-variant min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-[#faf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
          <Link href="/home" className="text-xl font-bold tracking-tight text-black font-['Noto_Serif']">The Digital Atelier</Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="text-stone-500 hover:text-black transition-colors font-['Noto_Serif'] text-sm" href="/home#features">Features</Link>
            <Link className="text-stone-500 hover:text-black transition-colors font-['Noto_Serif'] text-sm" href="/home#solutions">Solutions</Link>
            <Link href="/home#demo" className="bg-primary text-on-primary px-5 py-2 rounded-md font-['Manrope'] text-sm font-medium hover:opacity-80 transition-opacity">Request Demo</Link>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside className="w-64 border-r border-outline-variant/10 bg-[#f4f3f2] p-8 hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <Link href="/home" className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-outline hover:text-primary transition-colors mb-12 uppercase group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>Atelier Home
          </Link>
          <div>
            <p className="text-[9px] font-bold label-engraved text-outline mb-4 tracking-widest">SPECIFICATIONS</p>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-outline mb-1">MOVEMENT</p>
                <select value={movementFilter} onChange={e => setMovementFilter(e.target.value)} className="w-full flex justify-between items-center text-[11px] font-bold border-b border-outline-variant/20 pb-1 bg-transparent cursor-pointer focus:outline-none">
                  <option value="all">All</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="quartz">Quartz</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-outline mb-1">CONDITION</p>
                <select value={conditionFilter} onChange={e => setConditionFilter(e.target.value)} className="w-full flex justify-between items-center text-[11px] font-bold border-b border-outline-variant/20 pb-1 bg-transparent cursor-pointer focus:outline-none">
                  <option value="all">All</option>
                  <option value="unworn">Unworn</option>
                  <option value="mint">Mint</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 md:p-12 lg:p-16 max-w-7xl mx-auto">
          <header className="flex justify-between items-start mb-16">
            <div>
              <p className="text-[10px] font-bold label-engraved text-tertiary mb-3 tracking-[0.3em]">AVAILABLE NOW</p>
              <h1 className="text-5xl md:text-6xl serif-tight font-bold mb-6">The Heritage<br />Collection</h1>
              <p className="text-on-surface-variant text-base max-w-lg leading-relaxed font-light italic">
                {loading ? 'Loading collection...' : `${filtered.length} exceptional timepieces currently available for acquisition.`}
              </p>
            </div>
          </header>

          {loading ? (
            <p className="label-engraved text-outline animate-pulse">Loading Collection...</p>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-body mb-4">Error loading collection</p>
              <p className="text-[#737373] text-sm mb-6">{error}</p>
              <button onClick={() => { setLoading(true); fetchWatches(); }} className="bg-[#000] text-white px-4 py-2 rounded text-sm hover:bg-[#2d2d2d]">
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(w => (
                <div key={w.id} className="group">
                  <div className="aspect-square bg-[#f0efee] rounded-lg overflow-hidden mb-4">
                    <img src={w.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop'} alt={w.model} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  </div>
                  <p className="text-[9px] font-bold label-engraved text-tertiary tracking-[0.2em] mb-1">{w.brand}</p>
                  <h3 className="font-headline text-lg font-bold mb-1">{w.model}</h3>
                  <p className="text-[11px] text-outline mb-2">REF {w.reference_number} • {w.year} • {w.case_size} {w.material}</p>
                  <p className="font-headline text-lg font-bold">₱{w.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && <p className="text-center py-16 text-[#a3a3a3] font-body">No pieces match your specifications.</p>}
        </main>
      </div>
    </div>
  );
}
