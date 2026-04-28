"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

interface Sale { id: string; transaction_id: string; watch_id: string; customer_id: string; sale_price: number; payment_method: string; status: string; notes: string; sold_at: string; watches: { brand: string; model: string; reference_number: string } | null; customers: { first_name: string; last_name: string; tier: string } | null; }
interface Watch { id: string; brand: string; model: string; reference_number: string; price: number; status: string; }
interface Customer { id: string; first_name: string; last_name: string; }

const paymentIcons: Record<string, string> = { wire_transfer: 'account_balance', credit_card: 'credit_card', cash: 'payments', crypto: 'currency_bitcoin', remittance: 'account_balance' };
const statusStyles: Record<string, { bg: string; color: string }> = { completed: { bg: 'bg-[#f2ebdb]', color: 'text-[#8c734b]' }, pending: { bg: 'bg-[#e2e1e0]', color: 'text-[#737373]' }, refunded: { bg: 'bg-[#fcebea]', color: 'text-[#db5a5a]' } };

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wire_transfer');
  const [salePrice, setSalePrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { data: salesData, error: salesError } = await supabase.from('sales').select('*, watches(brand, model, reference_number), customers(first_name, last_name, tier)').order('sold_at', { ascending: false });
      if (salesError) throw salesError;
      
      const { data: watchData, error: watchError } = await supabase.from('watches').select('id, brand, model, reference_number, price, status');
      if (watchError) throw watchError;
      
      const { data: customerData, error: customerError } = await supabase.from('customers').select('id, first_name, last_name');
      if (customerError) throw customerError;
      
      if (salesData) setSales(salesData as Sale[]);
      if (watchData) setWatches(watchData);
      if (customerData) setCustomers(customerData);
      setLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load sales data';
      console.error('Fetch sales data error:', err);
      setError(msg);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
    let mounted = true;
    const channel = supabase.channel('sales-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
      if (mounted) fetchData();
    }).subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchData, supabase]);

  const handleCreateSale = async () => {
    if (!selectedWatch || !selectedCustomer || salePrice <= 0) {
      setValidationError('Please select a watch, client, and valid sale price');
      return;
    }
    
    try {
      setSaving(true);
      setValidationError(null);
      const txnId = `HS-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      const { error: insertError } = await supabase.from('sales').insert({ transaction_id: txnId, watch_id: selectedWatch, customer_id: selectedCustomer, sale_price: salePrice, payment_method: paymentMethod, status: 'completed', sold_at: new Date().toISOString() });
      if (insertError) throw insertError;
      
      const { error: watchError } = await supabase.from('watches').update({ status: 'sold', updated_at: new Date().toISOString() }).eq('id', selectedWatch);
      if (watchError) throw watchError;
      
      const w = watches.find(x => x.id === selectedWatch);
      const c = customers.find(x => x.id === selectedCustomer);
      if (w && c) {
        const { error: actError } = await supabase.from('activity_log').insert({ type: 'sale', icon: 'sell', title: `${w.brand} ${w.model}`, description: `Sold to ${c.first_name} ${c.last_name} — +₱${salePrice.toLocaleString()}` });
        if (actError) console.warn('Activity log error:', actError);
        
        // Update customer lifetime value
        const { data: custData, error: custQueryError } = await supabase.from('customers').select('lifetime_value').eq('id', selectedCustomer).single();
        if (custQueryError) console.warn('Query customer error:', custQueryError);
        if (custData) {
          const { error: updateError } = await supabase.from('customers').update({ lifetime_value: (custData.lifetime_value || 0) + salePrice }).eq('id', selectedCustomer);
          if (updateError) console.warn('Update customer error:', updateError);
        }
      }
      setSaving(false); setShowModal(false); fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create sale';
      console.error('Create sale error:', err);
      setValidationError(msg);
      setSaving(false);
    }
  };

  const handleStatusChange = async (saleId: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase.from('sales').update({ status: newStatus }).eq('id', saleId);
      if (updateError) throw updateError;
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update sale status';
      console.error('Update status error:', err);
      setError(msg);
    }
  };

  const handleExport = () => {
    try {
      const csv = ['Transaction ID,Client,Watch,Amount,Payment,Status,Date', ...sales.map(s => `${s.transaction_id},"${s.customers?.first_name || ''} ${s.customers?.last_name || ''}","${s.watches?.brand || ''} ${s.watches?.model || ''}",${s.sale_price},${s.payment_method},${s.status},${s.sold_at}`)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'sales_ledger.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export CSV');
    }
  };

  const completedTotal = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.sale_price, 0);
  const pendingCount = sales.filter(s => s.status === 'pending').length;
  const filtered = statusFilter === 'ALL' ? sales : sales.filter(s => s.status === statusFilter);
  const availableWatches = watches.filter(w => w.status === 'in_stock');

  if (loading) return (<><Sidebar /><main className="md:ml-64 min-h-screen flex items-center justify-center"><p className="label-engraved text-outline animate-pulse">Loading Sales...</p></main></>);

  if (error) {
    return (
      <>
        <Sidebar />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 font-body mb-4">Error loading sales</p>
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
                <h1 className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight mb-2">Sales Ledger</h1>
                <p className="font-body text-[#737373] text-sm tracking-wide uppercase">Comprehensive Financial Audit & Transaction Log</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleExport} className="bg-[#e9e8e8] text-[#4a4a4a] hover:bg-[#dcdcdc] px-4 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase flex items-center"><span className="material-symbols-outlined text-[14px] mr-2">download</span>Export CSV</button>
                <button onClick={() => { setShowModal(true); setSelectedWatch(''); setSelectedCustomer(''); setSalePrice(0); }} className="bg-[#000] text-white px-4 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase flex items-center hover:bg-[#2d2d2d]"><span className="material-symbols-outlined text-[14px] mr-2">add</span>New Sale</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-[8px] border border-[#f0efee] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] min-h-[140px] flex flex-col justify-center">
                <p className="font-body text-[#737373] text-[9px] font-bold tracking-widest uppercase mb-3">Gross Revenue</p>
                <span className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight">₱{(completedTotal / 1_000_000).toFixed(1)}M</span>
              </div>
              <div className="bg-[#fcfbf9] p-6 rounded-[8px] border border-[#f0efee] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] min-h-[140px] flex flex-col justify-center">
                <p className="font-body text-[#737373] text-[9px] font-bold tracking-widest uppercase mb-3">Pending Transactions</p>
                <span className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight">{String(pendingCount).padStart(2, '0')}</span>
              </div>
              <div className="bg-[#fcfbf9] p-6 rounded-[8px] border border-[#f0efee] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] min-h-[140px] flex flex-col justify-center">
                <p className="font-body text-[#737373] text-[9px] font-bold tracking-widest uppercase mb-3">Total Transactions</p>
                <span className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight">{sales.length}</span>
              </div>
            </div>

            <div className="bg-[#f9f8f7] p-4 rounded-[4px] flex items-center gap-4 border border-[#f0efee]">
              <span className="material-symbols-outlined text-[18px] text-[#737373]">filter_list</span>
              <span className="font-label text-[10px] font-bold tracking-widest uppercase">Status:</span>
              {['ALL', 'completed', 'pending', 'refunded'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase ${statusFilter === s ? 'bg-[#000] text-white' : 'bg-[#e2e1e0] text-[#737373]'}`}>{s === 'ALL' ? 'All Records' : s}</button>
              ))}
            </div>

            <div className="rounded-[4px] overflow-hidden bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfbf9] text-[9px] font-label font-bold tracking-[0.15em] text-[#737373] uppercase border-b border-[#f0efee]">
                    <th className="px-6 py-6 w-[10%]">ID</th><th className="px-6 py-6 w-[20%]">CLIENT</th><th className="px-6 py-6 w-[25%]">TIMEPIECE</th><th className="px-6 py-6 w-[15%]">AMOUNT</th><th className="px-6 py-6 w-[15%]">PAYMENT</th><th className="px-6 py-6 text-right w-[15%]">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const st = statusStyles[s.status] || statusStyles.pending;
                    return (
                      <tr key={s.id} className="border-b border-[#f0efee] hover:bg-[#fafafa] transition-colors align-top">
                        <td className="px-6 py-8"><p className="font-body font-bold text-[11px] text-[#4a4a4a] tracking-wide">{s.transaction_id}</p></td>
                        <td className="px-6 py-8">
                          <p className="font-headline font-bold text-[15px] text-[#2d2d2d] leading-none">{s.customers?.first_name || ''}</p>
                          <p className="font-headline font-bold text-[15px] text-[#2d2d2d] leading-none">{s.customers?.last_name || ''}</p>
                          <p className="font-label text-[9px] tracking-widest text-[#7990a4] uppercase mt-2">{s.customers?.tier?.replace('_', ' ') || ''}</p>
                        </td>
                        <td className="px-6 py-8">
                          <p className="font-body text-[13px] text-[#2d2d2d]">{s.watches?.brand || ''}</p>
                          <p className="font-body font-bold text-[13px] text-[#2d2d2d]">{s.watches?.model || ''}</p>
                          <p className="font-label text-[9px] tracking-widest text-[#a3a3a3] uppercase mt-2">REF {s.watches?.reference_number || ''}</p>
                        </td>
                        <td className="px-6 py-8"><span className="font-headline text-[16px] font-black text-[#2d2d2d] tracking-tight">₱{s.sale_price.toLocaleString()}</span></td>
                        <td className="px-6 py-8">
                          <div className="flex items-start space-x-2 text-[#737373]">
                            <span className="material-symbols-outlined text-[16px] mt-0.5">{paymentIcons[s.payment_method] || 'payments'}</span>
                            <span className="font-body text-[11px] text-[#4a4a4a] leading-tight capitalize">{s.payment_method.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-right">
                          <select value={s.status} onChange={e => handleStatusChange(s.id, e.target.value)} className={`${st.bg} ${st.color} px-3 py-1.5 rounded-full text-[9px] font-label font-bold tracking-widest uppercase border-none cursor-pointer appearance-none text-center`}>
                            <option value="completed">COMPLETED</option>
                            <option value="pending">PENDING</option>
                            <option value="refunded">REFUNDED</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={6} className="px-8 py-12 text-center text-[#737373] font-body">No transactions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
            <h2 className="font-headline text-xl font-bold mb-6">New Sale</h2>
            {validationError && (
              <div className="mb-6 bg-[#fcebea] border border-[#fac8c8] text-[#db5a5a] px-4 py-3 rounded-[4px] text-[12px] font-body">
                {validationError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Select Timepiece</label>
                <select value={selectedWatch} onChange={e => { setSelectedWatch(e.target.value); const w = availableWatches.find(x => x.id === e.target.value); if (w) setSalePrice(w.price); }} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none">
                  <option value="">— Choose a watch —</option>
                  {availableWatches.map(w => <option key={w.id} value={w.id}>{w.brand} {w.model} — REF {w.reference_number} (₱{w.price.toLocaleString()})</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Select Client</label>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none">
                  <option value="">— Choose a client —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Sale Price (₱)</label>
                  <input type="number" value={salePrice} onChange={e => setSalePrice(Number(e.target.value))} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none" />
                </div>
                <div>
                  <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none">
                    <option value="wire_transfer">Wire Transfer</option><option value="credit_card">Credit Card</option><option value="cash">Cash</option><option value="remittance">Direct Remittance</option><option value="crypto">Crypto</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[11px] font-label font-bold tracking-wider uppercase text-[#737373]">Cancel</button>
              <button onClick={handleCreateSale} disabled={saving || !selectedWatch || !selectedCustomer} className="bg-[#000] text-white px-6 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase disabled:opacity-40">{saving ? 'Processing...' : 'Complete Sale'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
