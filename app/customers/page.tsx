"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

interface Customer { id: string; first_name: string; last_name: string; email: string; phone: string; location: string; tier: string; lifetime_value: number; preferred_brands: string[]; avatar_url: string; notes: string; }

const emptyCustomer = { first_name: '', last_name: '', email: '', phone: '', location: '', tier: 'standard', lifetime_value: 0, preferred_brands: [] as string[], avatar_url: '', notes: '' };

const tierConfig: Record<string, { label: string; bg: string; color: string }> = {
  platinum: { label: 'VIP PLATINUM', bg: 'bg-[#f2ca4b]', color: 'text-[#241a00]' },
  heritage: { label: 'HERITAGE MEMBER', bg: 'bg-[#dedede]', color: 'text-[#2d2d2d]' },
  standard: { label: 'STANDARD', bg: 'bg-[#e2e1e0]', color: 'text-[#737373]' },
  vip_ambassador: { label: 'VIP AMBASSADOR', bg: 'bg-[#f2ca4b]', color: 'text-[#241a00]' },
  private_equity: { label: 'PRIVATE EQUITY', bg: 'bg-[#1a1a1a]', color: 'text-[#ffffff]' },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL CUSTOMERS");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState(emptyCustomer);
  const [brandsInput, setBrandsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase.from('customers').select('*').order('lifetime_value', { ascending: false });
    if (data) setCustomers(data as Customer[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
    const channel = supabase.channel('customers-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchCustomers()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchCustomers]);

  const openAdd = () => { setEditingCustomer(null); setFormData(emptyCustomer); setBrandsInput(''); setShowModal(true); };
  const openEdit = (c: Customer) => { setEditingCustomer(c); setFormData({ first_name: c.first_name, last_name: c.last_name, email: c.email || '', phone: c.phone || '', location: c.location || '', tier: c.tier, lifetime_value: c.lifetime_value, preferred_brands: c.preferred_brands || [], avatar_url: c.avatar_url || '', notes: c.notes || '' }); setBrandsInput((c.preferred_brands || []).join(', ')); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...formData, preferred_brands: brandsInput.split(',').map(b => b.trim()).filter(Boolean) };
    if (editingCustomer) {
      await supabase.from('customers').update(payload).eq('id', editingCustomer.id);
    } else {
      await supabase.from('customers').insert(payload);
      await supabase.from('activity_log').insert({ type: 'customer', icon: 'person_add', title: `${payload.first_name} ${payload.last_name}`, description: `New ${payload.tier} client added — ${payload.location}` });
    }
    setSaving(false); setShowModal(false); fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this client profile?')) return;
    await supabase.from('customers').delete().eq('id', id);
    fetchCustomers();
  };

  const filtered = customers.filter(c => {
    const matchesSearch = `${c.first_name} ${c.last_name} ${(c.preferred_brands || []).join(' ')}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'VIP ONLY') return matchesSearch && ['platinum', 'vip_ambassador'].includes(c.tier);
    if (activeFilter === 'TOP SPENDERS') return matchesSearch && c.lifetime_value > 15000000;
    return matchesSearch;
  });

  const formatLTV = (val: number) => `₱${(val / 1_000_000).toFixed(1)}M`;
  const filterButtons = ["ALL CUSTOMERS", "VIP ONLY", "TOP SPENDERS"];

  if (loading) return (<><Sidebar /><main className="md:ml-64 min-h-screen flex items-center justify-center"><p className="label-engraved text-outline animate-pulse">Loading Clients...</p></main></>);

  return (
    <>
      <Sidebar />
      <main className="md:ml-64 min-h-screen bg-[#fafafa] flex flex-col">
        <TopNav />
        <div className="pt-24 px-8 pb-12 flex-1 w-full relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight mb-2">Customers</h1>
                <p className="font-body text-[#737373] text-sm tracking-wide">Managing your network of {customers.length} elite collectors.</p>
              </div>
              <button onClick={openAdd} className="bg-[#000] text-white px-4 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase shadow-sm flex items-center hover:bg-[#2d2d2d]">
                <span className="material-symbols-outlined text-[14px] mr-2">person_add</span> Add Client
              </button>
            </div>

            <div className="bg-[#f4f3f2] p-4 rounded-[4px]">
              <div className="bg-[#ffffff] flex items-center px-4 py-2.5 mb-3 w-full max-w-[500px] shadow-sm rounded-sm border border-transparent focus-within:border-[#d4d4d4]">
                <span className="material-symbols-outlined text-[#737373] text-[18px] mr-3">search</span>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search collectors by name or brand..." className="bg-transparent border-none outline-none w-full text-[13px] font-body text-[#000] placeholder:text-[#a3a3a3] font-medium" />
              </div>
              <div className="flex space-x-2.5 overflow-x-auto">
                {filterButtons.map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)} className={`${activeFilter === f ? 'bg-[#000] text-white' : 'bg-[#e2e1e0] text-[#737373] hover:text-[#000]'} px-5 py-2.5 rounded-full text-[10px] font-label font-bold tracking-wider uppercase whitespace-nowrap transition-colors`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="rounded-[4px] overflow-hidden shadow-[0px_2px_15px_rgba(0,0,0,0.02)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4f3f2] text-[10px] font-label font-bold tracking-widest text-[#5a5a5a] uppercase">
                    <th className="px-8 py-5 w-[25%]">CUSTOMER</th>
                    <th className="px-4 py-5 w-[15%]">STATUS</th>
                    <th className="px-4 py-5 w-[15%]">LTV</th>
                    <th className="px-4 py-5 w-[30%]">PREFERRED BRANDS</th>
                    <th className="px-4 py-5 w-[15%] text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filtered.map(c => {
                    const tier = tierConfig[c.tier] || tierConfig.standard;
                    return (
                      <tr key={c.id} className="border-b border-[#f4f3f2] hover:bg-[#fafafa] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-5">
                            {c.avatar_url ? <img src={c.avatar_url} alt={c.first_name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-[#e3e2e1] flex items-center justify-center font-bold text-[13px] text-[#747878]">{c.first_name[0]}{c.last_name[0]}</div>}
                            <div>
                              <p className="font-headline font-bold text-[17px] text-[#2d2d2d] leading-[1.15] mb-1">{c.first_name} {c.last_name}</p>
                              <p className="font-body text-[11px] text-[#8c8c8c]">{c.location || 'No location'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-6"><span className={`${tier.bg} ${tier.color} px-3 py-1 text-[8px] font-label font-bold tracking-widest uppercase rounded-full`}>{tier.label}</span></td>
                        <td className="px-4 py-6"><span className="font-body text-[15px] font-bold text-[#2d2d2d]">{formatLTV(c.lifetime_value)}</span></td>
                        <td className="px-4 py-6">
                          <div className="flex flex-wrap gap-1.5">{(c.preferred_brands || []).map((b, i) => <span key={i} className="bg-[#e9e8e8] px-2.5 py-1 text-[11px] font-body text-[#4a4a4a] rounded-sm">{b}</span>)}</div>
                        </td>
                        <td className="px-4 py-6 text-right">
                          <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-[#f0f0f0] rounded mr-1"><span className="material-symbols-outlined text-[16px] text-[#737373]">edit</span></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded"><span className="material-symbols-outlined text-[16px] text-red-400">delete</span></button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={5} className="px-8 py-12 text-center text-[#737373] font-body text-sm">No collectors found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <h2 className="font-headline text-xl font-bold mb-6">{editingCustomer ? 'Edit Client' : 'New Client'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {[{ l: 'First Name', k: 'first_name' }, { l: 'Last Name', k: 'last_name' }, { l: 'Email', k: 'email' }, { l: 'Phone', k: 'phone' }, { l: 'Location', k: 'location' }, { l: 'Avatar URL', k: 'avatar_url' }].map(f => (
                <div key={f.k}>
                  <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">{f.l}</label>
                  <input type="text" value={(formData as Record<string, unknown>)[f.k] as string} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none focus:border-[#737373]" />
                </div>
              ))}
              <div>
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Tier</label>
                <select value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none">
                  {Object.keys(tierConfig).map(t => <option key={t} value={t}>{tierConfig[t].label}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Lifetime Value (₱)</label>
                <input type="number" value={formData.lifetime_value} onChange={e => setFormData({ ...formData, lifetime_value: Number(e.target.value) })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Preferred Brands (comma-separated)</label>
                <input type="text" value={brandsInput} onChange={e => setBrandsInput(e.target.value)} placeholder="Rolex, Patek Philippe" className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[11px] font-label font-bold tracking-wider uppercase text-[#737373]">Cancel</button>
              <button onClick={handleSave} disabled={saving || !formData.first_name || !formData.last_name} className="bg-[#000] text-white px-6 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase disabled:opacity-40">{saving ? 'Saving...' : editingCustomer ? 'Update' : 'Add Client'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
