"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const [liveVal, setLiveVal] = useState('...');
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoInterest, setDemoInterest] = useState('Boutique Operations');
  const [demoSent, setDemoSent] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('watches').select('price, status');
      if (data) {
        const total = data.filter(w => w.status !== 'sold').reduce((s, w) => s + (w.price || 0), 0);
        setLiveVal(`₱${total.toLocaleString()}`);
      }
    };
    loadStats();
  }, []);

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoEmail) return;
    setDemoLoading(true);
    const supabase = createClient();
    await supabase.from('activity_log').insert({ type: 'system', icon: 'mail', title: `Demo Request: ${demoName}`, description: `${demoEmail} — ${demoInterest}` });
    setDemoSent(true);
    setDemoLoading(false);
  };
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-tertiary-fixed selection:text-on-tertiary-fixed-variant">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#faf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center px-8 py-4 max-w-[1440px] mx-auto">
          <Link href="/home" className="text-xl font-bold tracking-tight text-black dark:text-white font-['Noto_Serif'] cursor-pointer transition-transform active:scale-95 duration-[cubic-bezier(0.2,0.8,0.2,1)]">
            The Digital Atelier
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <a className="text-black dark:text-white border-b border-black dark:border-white pb-0.5 font-['Noto_Serif'] antialiased text-sm" href="#features">Features</a>
            <a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white transition-colors font-['Noto_Serif'] antialiased text-sm" href="#solutions">Solutions</a>
            <a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white transition-colors font-['Noto_Serif'] antialiased text-sm" href="#journal">Journal</a>
            <a href="#demo" className="bg-primary text-on-primary px-5 py-2 rounded-md font-['Manrope'] text-sm font-medium hover:opacity-80 transition-opacity duration-300 active:scale-95 inline-block">Request Demo</a>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-8 py-16 md:py-24 overflow-hidden bg-surface">
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 z-10">
              <span className="label-engraved text-tertiary mb-4 block">Established MMXXIV</span>
              <h1 className="text-5xl md:text-6xl serif-tight font-bold text-on-surface leading-tight mb-6">
                The Art of <br />Horological <br /><span className="text-outline">Management</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-lg font-light mb-8 leading-relaxed">
                A unified ecosystem for the world's most prestigious boutiques. Precision software for the masters of time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/collections" className="border border-outline-variant text-on-surface px-6 py-3 rounded-md text-sm font-medium hover:bg-surface-container-low transition-all text-center">View Collections</Link>
              </div>
            </div>
            <div className="md:col-span-5 relative">
              <div className="aspect-[4/5] max-w-sm ml-auto bg-surface-container rounded-xl overflow-hidden shadow-xl transform md:rotate-2">
                <img className="w-full h-full object-cover grayscale contrast-125 opacity-90" alt="Luxury mechanical watch movement close up" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-We9vXn2LViVc8zXsimT-LMR1TZEje1UxVK2Qyraeu0pgzL8KAGZNTWapyEXwaHRTd-Y1kmxSNvGNzP9Iuh_8sZQvp9tWX-0D9emDFqS--4wbt6IqXQS7ydPHbythd8jp7iXMbJn_xEVytMLto3Lybf4-7_iSSOFbjCPjQmAPMaMQZ_b5IDxZCh9ovHcjmnor_zatOwONsg7eY46kCeXaw4F96ETsVF9KZYrdbUuuwUMPA4OjhThJb3scp9bT8kom61mO_4K5mWzc" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 left-4 bg-surface-container-lowest p-6 rounded-xl shadow-lg hidden md:block border border-outline-variant/15">
                <p className="label-engraved text-outline mb-1">Live Valuation</p>
                <p className="text-2xl font-bold serif-tight">{liveVal}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligent Inventory: Bento Grid */}
        <section id="features" className="px-8 py-20 bg-surface-container-low">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl serif-tight font-bold mb-3">Intelligent Inventory</h2>
              <p className="text-on-surface-variant text-base max-w-2xl">Digital authenticity records and real-time tracking for rare references. Powered by a robust PostgreSQL and Supabase engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between shadow-sm border border-outline-variant/15">
                <div>
                  <span className="material-symbols-outlined text-3xl text-primary mb-5">inventory_2</span>
                  <h3 className="text-xl font-bold serif-tight mb-3">Reference Vault</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Every piece in your collection tracked with microscopic detail—from movement caliber to previous ownership heritage.</p>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="p-3 bg-surface rounded-lg flex items-center justify-between border border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-variant rounded overflow-hidden">
                        <img className="w-full h-full object-cover" alt="Close up of a luxury blue dial watch" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUenXLqd38l8mWJn7AFhflNGYaRHU03EaAJtWBq-nluImwYY74ByL_IWI_eWh1YitLvkeD2kIOdk2B1PZm8srCG5Eun-6NFL8bocqnHx1qB2nawDB3FWuFTwCP2B41snTU5hcOKRYfBiCs9g-ofrYLXFlfyRIWir9ETqsxJPzXTKyT6tEZAgvulYdivkkH2QiVxVvgt3bYb4xnLC6spwPl96OLIfScRRf_qb5bT98jS-GDOLoDMOlENV2eZloQ--Ujx9D7SItvUrYA" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Submariner "Hulk"</p>
                        <p className="text-[11px] text-outline">Ref: 116610LV</p>
                      </div>
                    </div>
                    <span className="bg-tertiary-fixed-dim text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Vaulted</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-highest rounded-xl p-6 flex flex-col justify-between">
                <span className="material-symbols-outlined text-2xl text-primary mb-3">verified</span>
                <div>
                  <h4 className="text-base font-bold serif-tight mb-1">Digital Provenance</h4>
                  <p className="text-sm text-on-surface-variant">Immutable records of authenticity for every transaction.</p>
                </div>
              </div>

              <div className="bg-surface-container-highest rounded-xl p-6 flex flex-col justify-between">
                <span className="material-symbols-outlined text-2xl text-primary mb-3">cloud_upload</span>
                <div>
                  <h4 className="text-base font-bold serif-tight mb-1">High-Res Storage</h4>
                  <p className="text-sm text-on-surface-variant">Cloud-native media assets for cataloguing and marketing.</p>
                </div>
              </div>

              <div id="engine" className="md:col-span-2 bg-primary text-on-primary rounded-xl p-6 flex items-center gap-6 scroll-mt-24">
                <div className="flex-1">
                  <h4 className="text-xl font-bold serif-tight mb-1">The Engine</h4>
                  <p className="text-on-primary-container text-sm leading-relaxed">Architected on Supabase, React, and PostgreSQL. Production-grade performance with sub-millisecond query times for your global boutique network.</p>
                </div>
                <span className="material-symbols-outlined text-5xl opacity-20">settings_suggest</span>
              </div>
            </div>
          </div>
        </section>

        {/* Heritage Analytics */}
        <section className="px-8 py-20 bg-surface">
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="bg-surface-container p-2 rounded-xl shadow-lg border border-outline-variant/15 w-11/12">
                <div className="bg-surface-container-lowest rounded-lg p-6">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="label-engraved text-outline">Revenue Overview (PHP)</h3>
                    <span className="material-symbols-outlined text-sm">more_horiz</span>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end h-28 gap-3">
                      <div className="w-full bg-surface-variant rounded-t h-[60%]"></div>
                      <div className="w-full bg-surface-variant rounded-t h-[45%]"></div>
                      <div className="w-full bg-primary rounded-t h-[85%]"></div>
                      <div className="w-full bg-surface-variant rounded-t h-[70%]"></div>
                      <div className="w-full bg-tertiary rounded-t h-[95%]"></div>
                      <div className="w-full bg-surface-variant rounded-t h-[50%]"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-outline-variant/10">
                      <div>
                        <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Total Liquidity</p>
                        <p className="text-xl font-bold serif-tight">₱142,500,000</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Stock Flux</p>
                        <p className="text-xl font-bold serif-tight text-error">-2.4%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-tertiary-fixed/20 rounded-full blur-3xl -z-10"></div>
            </div>

            <div className="order-1 md:order-2">
              <span className="label-engraved text-tertiary mb-4 block">Advanced Reporting</span>
              <h2 className="text-3xl md:text-4xl serif-tight font-bold mb-6">Heritage Analytics</h2>
              <p className="text-on-surface-variant text-base leading-relaxed mb-6">
                Transform your boutique data into brand equity. Our reporting suite provides real-time insights into market trends, inventory velocity, and financial health—localized precisely to the Philippine Peso (₱).
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-lg text-primary">analytics</span>
                  <div>
                    <h5 className="font-bold text-sm">Automated Appraisal</h5>
                    <p className="text-[13px] text-on-surface-variant">Live price tracking against global secondary market indices.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-lg text-primary">account_balance_wallet</span>
                  <div>
                    <h5 className="font-bold text-sm">The Ledger</h5>
                    <p className="text-[13px] text-on-surface-variant">Professional financial audit trails for every transaction, ensuring total compliance.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Elite CRM Redesign */}
        <section className="px-8 py-24 bg-[#f8f7f6]">
          <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-[#bfa15e] mb-5 tracking-[0.3em] uppercase">VIP Relations</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-[#1a1c1c]">The Elite CRM</h2>
            <p className="text-[#6c7070] text-base max-w-2xl mb-16 leading-relaxed font-light">
              Manage High-Net-Worth individuals with the discretion they deserve. Track lifetime value, personal milestones, and outreach history through a bespoke interface.
            </p>

            <div className="w-full grid md:grid-cols-3 gap-8">
              {/* Card 1: Anton Lorenzo */}
              <div className="bg-white p-8 rounded-lg text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e8e6e4] transition-all hover:shadow-lg group">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-full bg-[#e3e2e1] flex items-center justify-center font-bold text-[13px] text-[#747878]">AL</div>
                  <div>
                    <p className="font-bold text-base text-[#1a1c1c]">Anton Lorenzo</p>
                    <p className="text-[11px] text-[#a0a5a5] font-medium">Tier: Collector Platinum</p>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#a0a5a5]">Lifetime Spend</span>
                    <span className="font-bold text-[#1a1c1c]">₱42,000,000</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#6c7070]">Recent Interest</span>
                    <span className="font-bold text-[#1a1c1c]">Patek Ref. 5711</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Sofia Cojuangco (Featured) */}
              <div className="bg-white p-8 rounded-lg text-left shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#e8e6e4] transition-all hover:shadow-xl relative overflow-hidden group">
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-2xl text-[#bfa15e]">star</span>
                </div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-full bg-[#bfa15e] flex items-center justify-center font-bold text-[13px] text-white">SC</div>
                  <div>
                    <p className="font-bold text-base text-[#1a1c1c]">Sofia Cojuangco</p>
                    <p className="text-[11px] text-[#a0a5a5] font-medium">Tier: VIP Ambassador</p>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#a0a5a5]">Lifetime Spend</span>
                    <span className="font-bold text-[#1a1c1c]">₱89,500,000</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#6c7070]">Recent Interest</span>
                    <span className="font-bold text-[#1a1c1c]">Audemars Royal Oak</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Jaime Manuel */}
              <div className="bg-white p-8 rounded-lg text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e8e6e4] transition-all hover:shadow-lg group">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-full bg-[#e3e2e1] flex items-center justify-center font-bold text-[13px] text-[#747878]">JM</div>
                  <div>
                    <p className="font-bold text-base text-[#1a1c1c]">Jaime Manuel</p>
                    <p className="text-[11px] text-[#a0a5a5] font-medium">Tier: Private Equity</p>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#a0a5a5]">Lifetime Spend</span>
                    <span className="font-bold text-[#1a1c1c]">₱12,200,000</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#6c7070]">Recent Interest</span>
                    <span className="font-bold text-[#1a1c1c]">Rolex GMT-Master II</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="px-8 py-20 bg-surface">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <span className="label-engraved text-tertiary mb-4 block">Bespoke Frameworks</span>
              <h2 className="text-3xl md:text-4xl serif-tight font-bold mb-6">Tailored Solutions</h2>
              <p className="text-on-surface-variant text-base max-w-2xl mx-auto">
                The Digital Atelier is not a one-size-fits-all platform. We provide specialized ecosystems designed for every facet of the horological industry.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4 pt-8 border-t border-outline-variant/20">
                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg mb-6">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                </div>
                <h3 className="text-xl font-bold serif-tight">The Boutique Solution</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Streamlined operations for physical storefronts. Includes sales ledgers, staff permissions, and local inventory sync with global availability records.
                </p>
                <div className="pt-4">
                  <span className="text-[11px] font-bold text-tertiary uppercase tracking-widest">Core Feature: Sales Ledger</span>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-outline-variant/20">
                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg mb-6">
                  <span className="material-symbols-outlined text-primary">shield_person</span>
                </div>
                <h3 className="text-xl font-bold serif-tight">The Private Office</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Tailored for family offices and ultra-high-net-worth collectors. Focuses on asset protection, insurance reporting, and private vault management.
                </p>
                <div className="pt-4">
                  <span className="text-[11px] font-bold text-tertiary uppercase tracking-widest">Core Feature: Vault Analytics</span>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-outline-variant/20">
                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg mb-6">
                  <span className="material-symbols-outlined text-primary">history_edu</span>
                </div>
                <h3 className="text-xl font-bold serif-tight">The Heritage Archive</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  For brands and restorers. Immutable provenance tracking, service history logs, and digital certificates of authenticity for rare pieces.
                </p>
                <div className="pt-4">
                  <span className="text-[11px] font-bold text-tertiary uppercase tracking-widest">Core Feature: Provenance Engine</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journal Section */}
        <section id="journal" className="px-8 py-20 bg-surface-container-low">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl">
                <span className="label-engraved text-tertiary mb-4 block">Editorial</span>
                <h2 className="text-3xl md:text-4xl serif-tight font-bold">The Journal</h2>
              </div>
              <button className="text-sm font-bold border-b border-primary pb-1 hover:text-tertiary transition-colors">Visit Full Archive</button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <article className="group cursor-pointer">
                <div className="aspect-[16/9] mb-6 overflow-hidden rounded-lg bg-surface-variant">
                  <img src="https://images.unsplash.com/photo-1547996160-81dfa63595dd?q=80&w=800&auto=format&fit=crop" alt="Watch details" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Design</span>
                  <span className="text-[10px] opacity-40">March 2024</span>
                </div>
                <h4 className="text-lg font-bold serif-tight mb-3 group-hover:text-primary transition-colors leading-snug">The Evolution of the Integrated Bracelet</h4>
                <p className="text-[13px] text-on-surface-variant line-clamp-2">Exploring the 1970s design revolution that redefined luxury sports horology for the modern era.</p>
              </article>

              <article className="group cursor-pointer">
                <div className="aspect-[16/9] mb-6 overflow-hidden rounded-lg bg-surface-variant">
                  <img src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=800&auto=format&fit=crop" alt="Watch details" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Market</span>
                  <span className="text-[10px] opacity-40">February 2024</span>
                </div>
                <h4 className="text-lg font-bold serif-tight mb-3 group-hover:text-primary transition-colors leading-snug">The Rise of Independent Horology</h4>
                <p className="text-[13px] text-on-surface-variant line-clamp-2">Why global collectors are shifting their focus from legacy houses to artisanal masters like F.P. Journe.</p>
              </article>

              <article className="group cursor-pointer">
                <div className="aspect-[16/9] mb-6 overflow-hidden rounded-lg bg-surface-variant">
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop" alt="Watch details" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Tech</span>
                  <span className="text-[10px] opacity-40">January 2024</span>
                </div>
                <h4 className="text-lg font-bold serif-tight mb-3 group-hover:text-primary transition-colors leading-snug">Managing Scarcity in a Digital Age</h4>
                <p className="text-[13px] text-on-surface-variant line-clamp-2">How proprietary algorithms can preserve the exclusivity of the world's most rare horological references.</p>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Form */}
        <section id="demo" className="px-8 py-20 bg-primary text-on-primary">
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl serif-tight font-bold mb-6">Bespoke Demonstration</h2>
              <p className="text-on-primary-container text-base mb-10 w-11/12">Schedule a private consultation with our curatorial team. We will walk you through our unified ecosystem and demonstrate how the Atelier can refine your boutique's operational heritage.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">event_available</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold uppercase tracking-widest text-white">Priority Scheduling</h5>
                    <p className="text-xs text-on-primary-container">Response within 12 standard business hours.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">lock_open</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold uppercase tracking-widest text-white">Full Feature Access</h5>
                    <p className="text-xs text-on-primary-container">Explore the entire repository of inventory and CRM tools.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest text-on-surface p-8 rounded-xl shadow-xl border border-outline-variant/10">
              {demoSent ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-primary mb-4 block">check_circle</span>
                  <h3 className="text-xl font-bold serif-tight mb-2">Request Received</h3>
                  <p className="text-on-surface-variant text-sm">We&apos;ll be in touch within 24 hours.</p>
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleDemo}>
                  <div>
                    <label className="label-engraved text-outline mb-1 block">Full Name</label>
                    <input value={demoName} onChange={e => setDemoName(e.target.value)} className="w-full border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-2 text-base placeholder:text-outline-variant placeholder:text-sm transition-all bg-transparent font-['Manrope']" placeholder="Your Full Name" type="text" required />
                  </div>
                  <div>
                    <label className="label-engraved text-outline mb-1 block">Business Email</label>
                    <input value={demoEmail} onChange={e => setDemoEmail(e.target.value)} className="w-full border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-2 text-base placeholder:text-outline-variant placeholder:text-sm transition-all bg-transparent font-['Manrope']" placeholder="professional@example.com" type="email" required />
                  </div>
                  <div>
                    <label className="label-engraved text-outline mb-1 block">Interest Area</label>
                    <select value={demoInterest} onChange={e => setDemoInterest(e.target.value)} className="w-full border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary px-0 py-2 text-base text-stone-500 transition-all bg-transparent font-['Manrope'] appearance-none">
                      <option>Boutique Operations</option>
                      <option>Private Asset Management</option>
                      <option>Heritage Documentation</option>
                    </select>
                  </div>
                  <button className="w-full bg-primary text-on-primary py-4 rounded-md text-xs font-bold tracking-[0.2em] uppercase shadow-md hover:bg-on-surface-variant transition-all active:scale-95 mt-4 disabled:opacity-50" type="submit" disabled={demoLoading}>{demoLoading ? 'Sending...' : 'Request Demo Session'}</button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#c4c7c7]/15 bg-[#f4f3f2] dark:bg-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 md:px-12 py-16 max-w-[1440px] mx-auto">
          <div className="md:col-span-1">
            <Link href="/home" className="text-base font-bold font-['Noto_Serif'] text-black dark:text-white mb-4 hover:opacity-80 transition-opacity">The Digital Atelier</Link>
            <p className="text-stone-500 dark:text-stone-400 text-[13px] font-['Manrope'] tracking-wide">Refining the heritage of horology for the digital age.</p>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest mb-4 font-['Manrope']">Platform</h5>
            <ul className="space-y-3 font-['Manrope'] text-[13px] tracking-wide">
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="#features">Features</a></li>
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="#engine">The Engine</a></li>
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="#journal">Journal</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest mb-4 font-['Manrope']">Company</h5>
            <ul className="space-y-3 font-['Manrope'] text-[13px] tracking-wide">
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="#demo">Inquiries</a></li>
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="/legal">Legal</a></li>
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="/legal#privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest mb-4 font-['Manrope']">Support</h5>
            <ul className="space-y-3 font-['Manrope'] text-[13px] tracking-wide">
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="#demo">Concierge</a></li>
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="/legal#security">Security Documentation</a></li>
              <li><a className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-all duration-300" href="/legal#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 py-6 border-t border-outline-variant/10 text-center md:text-left">
          <p className="text-stone-500 dark:text-stone-400 text-[11px] font-['Manrope'] tracking-wide">© 2024 The Digital Atelier. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
