"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

export default function ReportsPage() {
  const [metrics, setMetrics] = useState({ netRevenue: 0, avgOrder: 0, sellThrough: 0, totalWatches: 0, soldWatches: 0, salesCount: 0 });
  const [brandEquity, setBrandEquity] = useState<{ brand: string; pct: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number; pct: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const supabase = createClient();
      const { data: sales, error: salesError } = await supabase.from('sales').select('sale_price, status, sold_at');
      if (salesError) throw salesError;
      
      const { data: watches, error: watchesError } = await supabase.from('watches').select('brand, status, price');
      if (watchesError) throw watchesError;

      if (sales && watches) {
        const completedSales = sales.filter(s => s.status === 'completed');
        const netRevenue = completedSales.reduce((sum, s) => sum + s.sale_price, 0);
        const avgOrder = completedSales.length > 0 ? Math.round(netRevenue / completedSales.length) : 0;
        const soldCount = watches.filter(w => w.status === 'sold').length;
        const sellThrough = watches.length > 0 ? Math.round((soldCount / watches.length) * 100) : 0;

        setMetrics({ netRevenue, avgOrder, sellThrough, totalWatches: watches.length, soldWatches: soldCount, salesCount: completedSales.length });

        // Brand equity
        const brandCounts: Record<string, number> = {};
        watches.forEach(w => { brandCounts[w.brand] = (brandCounts[w.brand] || 0) + w.price; });
        const totalValue = Object.values(brandCounts).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
        setBrandEquity(sorted.map(([brand, val]) => ({ brand, pct: Math.round((val / totalValue) * 100) })));

        // Monthly revenue (last 6 months)
        const months: Record<string, number> = {};
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        completedSales.forEach(s => {
          const d = new Date(s.sold_at);
          const key = monthNames[d.getMonth()];
          months[key] = (months[key] || 0) + s.sale_price;
        });
        const maxVal = Math.max(...Object.values(months), 1);
        const now = new Date();
        const last6 = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i);
          return monthNames[d.getMonth()];
        });
        setMonthlyData(last6.map(m => ({ month: m, total: months[m] || 0, pct: Math.round(((months[m] || 0) / maxVal) * 100) })));
      }
      setLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load reports';
      console.error('Reports fetch error:', err);
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatCurrency = (val: number) => { if (val >= 1_000_000) return `₱${(val / 1_000_000).toFixed(1)}M`; if (val >= 1_000) return `₱${(val / 1_000).toFixed(0)}K`; return `₱${val.toLocaleString()}`; };
  const barColors = ['bg-[#f2ca4b]', 'bg-[#999]', 'bg-[#666]', 'bg-[#555]', 'bg-[#444]', 'bg-[#333]'];

  const handleExportLedger = () => {
    try {
      const csv = `Metric,Value\nNet Revenue,${metrics.netRevenue}\nAvg Order Value,${metrics.avgOrder}\nSell-Through Rate,${metrics.sellThrough}%\nTotal Watches,${metrics.totalWatches}\nSold Watches,${metrics.soldWatches}\nTotal Sales,${metrics.salesCount}\n\nBrand,Equity %\n${brandEquity.map(b => `${b.brand},${b.pct}%`).join('\n')}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'heritage_report.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export report');
    }
  };

  if (loading) return (<><Sidebar /><main className="md:ml-64 min-h-screen flex items-center justify-center"><p className="label-engraved text-outline animate-pulse">Loading Reports...</p></main></>);

  if (error) {
    return (
      <>
        <Sidebar />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 font-body mb-4">Error loading reports</p>
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
      <main className="md:ml-64 min-h-screen bg-[#fafafa] flex flex-col">
        <TopNav />
        <div className="pt-24 px-8 pb-12 flex-1 w-full relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight mb-2">Heritage Performance</h1>
                <p className="font-body text-[#737373] text-sm tracking-wide">Real-time Fiscal Summary & Inventory Flux</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleExportLedger} className="bg-[#e9e8e8] text-[#4a4a4a] hover:bg-[#dcdcdc] px-4 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase shadow-sm">Export Ledger</button>
                <button className="bg-[#000] text-white px-4 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase shadow-sm">Schedule Audit</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[8px] border border-[#f0efee] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] min-h-[140px] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div className="space-y-4 mb-4"><p className="font-body text-[#737373] text-[10px] font-bold tracking-widest uppercase">Total Net Revenue</p><div className="flex items-baseline space-x-2"><span className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight">{formatCurrency(metrics.netRevenue)}</span></div></div>
                <div className="w-full bg-[#f4f3f2] h-[4px] rounded-full"><div className="bg-[#000] h-full rounded-full" style={{ width: `${Math.min((metrics.netRevenue / 50_000_000) * 100, 100)}%` }}></div></div>
              </div>
              <div className="bg-white p-6 rounded-[8px] border border-[#f0efee] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] min-h-[140px] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div className="space-y-4 mb-4"><p className="font-body text-[#737373] text-[10px] font-bold tracking-widest uppercase">Avg. Order Value</p><span className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight block">{formatCurrency(metrics.avgOrder)}</span></div>
                <p className="font-body text-[#737373] text-[11px] italic">Across {metrics.salesCount} curated sales.</p>
              </div>
              <div className="bg-white p-6 rounded-[8px] border border-[#f0efee] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] min-h-[140px] flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                <div className="space-y-4 mb-4"><p className="font-body text-[#737373] text-[10px] font-bold tracking-widest uppercase">Sell-Through Rate</p><span className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight">{metrics.sellThrough}%</span></div>
                <p className="font-body text-[#737373] text-[11px] italic">{metrics.soldWatches} of {metrics.totalWatches} units sold.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-[#f0efee] p-6 rounded-[8px] shadow-[0px_2px_15px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-start mb-10">
                  <div><h2 className="font-headline text-xl font-bold text-[#2d2d2d] tracking-tight mb-1">Fiscal Trajectory</h2><p className="font-body text-[#737373] text-[10px] font-bold tracking-widest uppercase">Monthly Revenue Flux</p></div>
                </div>
                <div className="w-full h-[180px] relative px-4 flex items-end justify-between border-b border-[#e5e5e5]">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-[#e5e5e5] border-t border-dashed"></div>
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#e5e5e5] border-t border-dashed"></div>
                  {monthlyData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center justify-end h-full relative z-10 w-12 group">
                      <div className="w-[2px] bg-[#000] mx-auto group-hover:bg-[#a38031] transition-colors" style={{ height: `${Math.max(d.pct, 5)}%` }}></div>
                      <div className="w-3 h-3 bg-[#000] rounded-full absolute group-hover:bg-[#a38031] transition-colors" style={{ bottom: `calc(${Math.max(d.pct, 5)}% - 6px)`, left: '50%', transform: 'translateX(-50%)' }}></div>
                      <span className="absolute -bottom-7 font-label text-[9px] font-bold tracking-widest text-[#a3a3a3] uppercase">{d.month}</span>
                    </div>
                  ))}
                </div>
                <div className="h-7"></div>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-[8px] flex flex-col justify-between min-h-[340px]">
                <div>
                  <div className="mb-8"><h2 className="font-headline text-xl font-bold text-white tracking-tight mb-1">Brand Equity</h2><p className="font-body text-[#8c8c8c] text-[10px] font-bold tracking-widest uppercase">Asset Concentration</p></div>
                  <div className="space-y-5">
                    {brandEquity.slice(0, 5).map((b, i) => (
                      <div key={b.brand}>
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="font-label text-[9px] font-bold tracking-wider text-[#e5e5e5] uppercase">{b.brand}</span>
                          <span className="font-label text-[10px] font-bold tracking-widest text-[#cfcfcf]">{b.pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#333] rounded-full"><div className={`h-full ${barColors[i] || 'bg-[#555]'} rounded-full`} style={{ width: `${b.pct}%` }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 text-[#737373] text-[9px] font-label font-bold uppercase tracking-widest leading-relaxed">Live data from {metrics.totalWatches} total pieces.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
