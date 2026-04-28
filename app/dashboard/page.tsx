"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import MetricCard from "@/components/MetricCard";
import ManufacturerCard from "@/components/ManufacturerCard";
import ActivityList from "@/components/ActivityList";
import ActionItems from "@/components/ActionItems";
import LowStockAlert from "@/components/LowStockAlert";
import { createClient } from "@/lib/supabase/client";

interface BrandShare {
  brand: string;
  count: number;
  share: string;
  imageSrc: string;
  imageAlt: string;
}

const brandImages: Record<string, { src: string; alt: string }> = {
  'Rolex': { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOE_u45n6jWgiio5gMhiLfVh4w9iXhPjnNgS38wVoAKvzuN8AVSj9OdllxoYzIVkMT1rLtlijQUej_W8Gkxok06KFIIqXHqRinwso04FMTX5hyMskaA8oZjZMeQQhLtrJB1npiY1P6npoT36N5qocUtvoS8-mXejpxZh2p98OvT-z9j7IVYsZ86M880nheIlQU4UljIayHwxWwERcShYz6hCNpJPHUyKlEcE9KLvIaIjDQyZJooD133owmaiL7zGXrfjcS0DwDUYg_', alt: 'Classic luxury watch' },
  'Patek Philippe': { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3oZjgj81VI-wpPqwJM1pWAAnz24TzPJdqo9Z4wF6dr11JQ2LGFRw8oeHG6uTpNO9kECUzfPbDrgUAANhAOnb4OootH-h2DxKFZ700Vc01y_nR260STuhW-u_oovYTJuTzin3O7fFtyHD2Tulx--FsX4na5u8cZzwexfHoNVr7MBTcbfD_WgCO_Ttjnq3FKGoDVo3WKmUErRQho--iVMUFaRcAJkdI2bqiYX50TaiS9psQZSRl5Nlo8wl6j2MnKsiwHtKUhWO_5lJs', alt: 'Gold watch movement' },
  'Audemars Piguet': { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT8LK_-akmqp0kOQ86vWQWadO9bpidcEjNpXw3iMANt4NKrGT6dE2bjz4nXZgwzH1h_UdR9_tAeE-TXmFbZ95yCl463SixDyUJEJ5m2cGIUIWlpOi4aTkYjOC7srYAudLJDPd1BIBEUNwQQm83sbro4Tv60oggy65WXQnJXMvnIcBcttBT0RZhs_CNZPbN7YrbM3RI6bmxY0H5n7YEW3txKEBsbluF0EcYGwjyN8n0pgyVQELQQv5isY1JVBxbVzUp0KdywHvgwTOd', alt: 'Minimalist watch face' },
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ inventoryValue: 0, totalSales: 0, monthlyRevenue: 0, vipCount: 0 });
  const [topBrands, setTopBrands] = useState<BrandShare[]>([]);
  const [activities, setActivities] = useState<{ icon: string; title: string; subtitlePre: string; subtitleBold: string; value: string; timeAgo: string }[]>([]);
  const [lowStock, setLowStock] = useState<{ name: string; unitsLeft: number; imageSrc: string; imageAlt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const supabase = createClient();

      // Fetch inventory value (in_stock + reserved)
      const { data: watches, error: watchesError } = await supabase.from('watches').select('brand, price, status, image_url, model');
      if (watchesError) throw watchesError;
      
      // Fetch sales
      const { data: sales, error: salesError } = await supabase.from('sales').select('sale_price, status, sold_at');
      if (salesError) throw salesError;
      
      // Fetch customers
      const { data: customers, error: customersError } = await supabase.from('customers').select('tier');
      if (customersError) throw customersError;
      
      // Fetch activity log
      const { data: activityData, error: activityError } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(5);
      if (activityError) throw activityError;

      if (watches) {
        const inventoryValue = watches.filter(w => w.status !== 'sold').reduce((sum, w) => sum + (w.price || 0), 0);
        const completedSales = (sales || []).filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.sale_price || 0), 0);
        
        // Monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyRev = (sales || [])
          .filter(s => s.status === 'completed' && new Date(s.sold_at) >= thirtyDaysAgo)
          .reduce((sum, s) => sum + (s.sale_price || 0), 0);

        const vipCount = (customers || []).filter(c => ['platinum', 'vip_ambassador', 'private_equity'].includes(c.tier)).length;

        setMetrics({ inventoryValue, totalSales: completedSales, monthlyRevenue: monthlyRev, vipCount });

        // Brand shares — top 3
        const brandCounts: Record<string, number> = {};
        watches.forEach(w => { brandCounts[w.brand] = (brandCounts[w.brand] || 0) + 1; });
        const sorted = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const total = watches.length;
        setTopBrands(sorted.map(([brand, count]) => ({
          brand,
          count,
          share: `${Math.round((count / total) * 100)}% Share`,
          imageSrc: brandImages[brand]?.src || brandImages['Rolex'].src,
          imageAlt: brandImages[brand]?.alt || 'Watch image',
        })));

        // Low stock — brands with fewer than 3 in-stock units
        const brandStock: Record<string, { count: number; image: string }> = {};
        watches.filter(w => w.status === 'in_stock').forEach(w => {
          if (!brandStock[w.model]) brandStock[w.model] = { count: 0, image: w.image_url || '' };
          brandStock[w.model].count++;
        });
        setLowStock(Object.entries(brandStock)
          .filter(([, v]) => v.count <= 2)
          .slice(0, 3)
          .map(([name, v]) => ({ name, unitsLeft: v.count, imageSrc: v.image, imageAlt: name })));
      }

      if (activityData) {
        setActivities(activityData.map(a => {
          const timeAgo = getTimeAgo(new Date(a.created_at));
          const parts = (a.description || '').split(' — ');
          return {
            icon: a.icon || 'info',
            title: a.title,
            subtitlePre: parts[0] || '',
            subtitleBold: '',
            value: parts[1] || '',
            timeAgo,
          };
        }));
      }

      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      console.error('Dashboard fetch error:', err);
      setError(message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Real-time subscription
    const supabase = createClient();
    let mounted = true;
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watches' }, () => {
        if (mounted) fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        if (mounted) fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
        if (mounted) fetchData();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `₱${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `₱${(val / 1_000).toFixed(0)}K`;
    return `₱${val.toLocaleString()}`;
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <p className="label-engraved text-outline animate-pulse">Loading Portfolio...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 font-body mb-4">Error loading dashboard</p>
            <p className="text-[#737373] text-sm mb-6">{error}</p>
            <button onClick={() => { setLoading(true); fetchData(); }} className="bg-[#000] text-white px-4 py-2 rounded text-sm hover:bg-[#2d2d2d]">
              Retry
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        <TopNav />
        <div className="pt-28 px-8 pb-12 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-bold text-primary tracking-tight mb-2">Portfolio Overview</h2>
            <p className="font-body text-secondary text-sm tracking-wide">Real-time performance metrics for your boutique collection.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <MetricCard title="Total Inventory Value" value={formatCurrency(metrics.inventoryValue)} />
            <MetricCard title="Total Sales (YTD)" value={formatCurrency(metrics.totalSales)} />
            <MetricCard title="Monthly Revenue" value={formatCurrency(metrics.monthlyRevenue)} />
            <MetricCard title="VIP Customers Count" value={String(metrics.vipCount)} suffix={<span className="text-outline text-xs font-medium ml-1">Active</span>} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-headline text-xl font-bold mb-6">Dominant Manufactures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topBrands.map((b, i) => (
                      <ManufacturerCard key={i} brand={b.brand} share={b.share} imageSrc={b.imageSrc} imageAlt={b.imageAlt} />
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-end mb-8">
                  <h3 className="font-headline text-xl font-bold">Recent Acquisitions & Sales</h3>
                  <a className="text-[10px] font-label font-bold tracking-widest uppercase text-outline hover:text-primary transition-colors" href="/sales">View All Archive</a>
                </div>
                <ActivityList items={activities.length > 0 ? activities : [{ icon: 'info', title: 'No recent activity', subtitlePre: '', subtitleBold: '', value: '', timeAgo: '' }]} />
              </section>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <ActionItems />
              <LowStockAlert items={lowStock.length > 0 ? lowStock : [{ name: 'All stocked', unitsLeft: 99, imageSrc: '', imageAlt: '' }]} />
            </div>
          </div>

          <footer className="mt-24 pt-12 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center opacity-40">
            <div className="mb-4 md:mb-0"><p className="font-headline text-sm"></p></div>
            <div className="flex space-x-8"></div>
          </footer>
        </div>
      </main>
    </>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'JUST NOW';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}
