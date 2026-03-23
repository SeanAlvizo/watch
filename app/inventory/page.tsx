"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import InventoryCard from "@/components/InventoryCard";
import { createClient } from "@/lib/supabase/client";

interface Watch {
  id: string;
  brand: string;
  model: string;
  reference_number: string;
  serial_number: string;
  year: number;
  condition: string;
  movement: string;
  case_size: string;
  material: string;
  price: number;
  cost_basis: number;
  status: string;
  image_url: string;
  notes: string;
}

const emptyWatch = { brand: '', model: '', reference_number: '', serial_number: '', year: 2024, condition: 'unworn', movement: 'automatic', case_size: '', material: '', price: 0, cost_basis: 0, status: 'in_stock', image_url: '', notes: '' };

export default function InventoryPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingWatch, setEditingWatch] = useState<Partial<Watch> | null>(null);
  const [formData, setFormData] = useState(emptyWatch);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const supabase = createClient();

  const fetchWatches = useCallback(async () => {
    const { data } = await supabase.from('watches').select('*').order('created_at', { ascending: false });
    if (data) setWatches(data as Watch[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWatches();
    const channel = supabase.channel('inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watches' }, () => fetchWatches())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchWatches]);

  const openAdd = () => { setEditingWatch(null); setFormData(emptyWatch); setImageFile(null); setImagePreview(''); setShowModal(true); };
  const openEdit = (w: Watch) => { setEditingWatch(w); setFormData({ brand: w.brand, model: w.model, reference_number: w.reference_number || '', serial_number: w.serial_number || '', year: w.year || 2024, condition: w.condition || 'unworn', movement: w.movement || 'automatic', case_size: w.case_size || '', material: w.material || '', price: w.price, cost_basis: w.cost_basis || 0, status: w.status, image_url: w.image_url || '', notes: w.notes || '' }); setImageFile(null); setImagePreview(w.image_url || ''); setShowModal(true); };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image_url;
    const ext = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from('watch-images').upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
    if (error) { console.error('Upload error:', error); return formData.image_url; }
    const { data: urlData } = supabase.storage.from('watch-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    const imageUrl = await uploadImage();
    const saveData = { ...formData, image_url: imageUrl };
    if (editingWatch?.id) {
      await supabase.from('watches').update({ ...saveData, updated_at: new Date().toISOString() }).eq('id', editingWatch.id);
      await supabase.from('activity_log').insert({ type: 'inventory', icon: 'edit', title: `${formData.brand} ${formData.model}`, description: `Updated — ${formData.status.replace('_', ' ')}` });
    } else {
      await supabase.from('watches').insert(saveData);
      await supabase.from('activity_log').insert({ type: 'inventory', icon: 'inventory_2', title: `${formData.brand} ${formData.model}`, description: `Added to inventory — REF ${formData.reference_number}` });
    }
    setSaving(false);
    setShowModal(false);
    setImageFile(null);
    setImagePreview('');
    fetchWatches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this timepiece from inventory?')) return;
    const w = watches.find(x => x.id === id);
    await supabase.from('watches').delete().eq('id', id);
    if (w) await supabase.from('activity_log').insert({ type: 'inventory', icon: 'delete', title: `${w.brand} ${w.model}`, description: `Removed from inventory` });
    fetchWatches();
  };

  const formatPrice = (val: number) => `₱${val.toLocaleString()}`;

  const uniqueBrands = [...new Set(watches.map(w => w.brand))];
  const filtered = watches.filter(w => {
    const matchesSearch = `${w.brand} ${w.model} ${w.reference_number}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = brandFilter === 'ALL' || w.brand === brandFilter;
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  if (loading) return (<><Sidebar /><main className="md:ml-64 min-h-screen flex items-center justify-center"><p className="label-engraved text-outline animate-pulse">Loading Inventory...</p></main></>);

  return (
    <>
      <Sidebar />
      <main className="md:ml-64 min-h-screen bg-[#fafafa] flex flex-col">
        <TopNav />
        <div className="pt-24 px-8 pb-12 flex-1 w-full relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight mb-2">Inventory</h1>
                <p className="font-body text-[#737373] text-sm tracking-wide">Managing {watches.length} timepieces across {uniqueBrands.length} manufactures.</p>
              </div>
              <button onClick={openAdd} className="bg-[#000000] text-[#ffffff] px-4 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase transition-colors shadow-sm flex items-center hover:bg-[#2d2d2d]">
                <span className="material-symbols-outlined text-[14px] mr-2">add</span> Add Timepiece
              </button>
            </div>

            {/* Filters */}
            <div className="bg-[#f4f3f2] p-4 rounded-[4px] flex flex-col md:flex-row items-center gap-4">
              <div className="bg-[#ffffff] flex items-center px-4 py-2.5 w-full max-w-[400px] shadow-sm rounded-sm border border-transparent focus-within:border-[#d4d4d4] transition-colors">
                <span className="material-symbols-outlined text-[#737373] text-[18px] mr-3">search</span>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by brand, model, or reference..." className="bg-transparent border-none outline-none w-full text-[13px] font-body text-[#000000] placeholder:text-[#a3a3a3] font-medium" />
              </div>
              <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="bg-white border border-[#e5e5e5] rounded-sm px-3 py-2 text-[12px] font-body">
                <option value="ALL">All Brands</option>
                {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-[#e5e5e5] rounded-sm px-3 py-2 text-[12px] font-body">
                <option value="ALL">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(w => (
                <div key={w.id} className="relative group">
                  <InventoryCard
                    imageSrc={w.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop'}
                    statusText={w.status.replace('_', ' ').toUpperCase()}
                    statusType={w.status as "instock" | "reserved" | "sold"}
                    brand={w.brand}
                    model={w.model}
                    meta={`REF ${w.reference_number || 'N/A'} • ${w.year || ''} • ${w.condition || ''}`}
                    price={formatPrice(w.price)}
                  />
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => openEdit(w)} className="bg-white/90 backdrop-blur-sm p-1.5 rounded shadow-sm hover:bg-white"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                    <button onClick={() => handleDelete(w.id)} className="bg-white/90 backdrop-blur-sm p-1.5 rounded shadow-sm hover:bg-red-50 text-red-500"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && <p className="text-center py-16 text-[#a3a3a3] font-body">No timepieces match your search criteria.</p>}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <h2 className="font-headline text-xl font-bold mb-6">{editingWatch ? 'Edit Timepiece' : 'New Timepiece'}</h2>
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-2">Watch Image</label>
              <div className="flex gap-4 items-start">
                <div
                  className="w-32 h-32 bg-[#f4f3f2] border-2 border-dashed border-[#d4d4d4] rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#737373] transition-colors relative"
                  onClick={() => document.getElementById('watch-image-input')?.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) handleImageSelect(file); }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <span className="material-symbols-outlined text-[28px] text-[#a3a3a3] block">add_photo_alternate</span>
                      <span className="text-[9px] text-[#a3a3a3] font-label tracking-wider">Click or drop</span>
                    </div>
                  )}
                  <input id="watch-image-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleImageSelect(file); }} />
                </div>
                <div className="flex-1 text-[11px] text-[#a3a3a3] font-body space-y-1">
                  <p>JPEG, PNG, WebP, or GIF</p>
                  <p>Max 5MB</p>
                  {imageFile && <p className="text-[#2d7a46] font-bold">✓ {imageFile.name}</p>}
                  {imagePreview && <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setFormData({ ...formData, image_url: '' }); }} className="text-[#db5a5a] hover:underline">Remove image</button>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Brand', key: 'brand', type: 'text' },
                { label: 'Model', key: 'model', type: 'text' },
                { label: 'Reference Number', key: 'reference_number', type: 'text' },
                { label: 'Serial Number', key: 'serial_number', type: 'text' },
                { label: 'Year', key: 'year', type: 'number' },
                { label: 'Case Size', key: 'case_size', type: 'text' },
                { label: 'Material', key: 'material', type: 'text' },
                { label: 'Price (₱)', key: 'price', type: 'number' },
                { label: 'Cost Basis (₱)', key: 'cost_basis', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">{f.label}</label>
                  <input type={f.type} value={(formData as Record<string, unknown>)[f.key] as string} onChange={e => setFormData({ ...formData, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none focus:border-[#737373]" />
                </div>
              ))}
              <div>
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Condition</label>
                <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none">
                  {['unworn', 'mint', 'excellent', 'good', 'fair'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Movement</label>
                <select value={formData.movement} onChange={e => setFormData({ ...formData, movement: e.target.value })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none">
                  {['automatic', 'manual', 'quartz'].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none">
                  {['in_stock', 'reserved', 'sold'].map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-1">Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-3 py-2 text-[13px] font-body focus:outline-none h-20 resize-none" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[11px] font-label font-bold tracking-wider uppercase text-[#737373] hover:text-[#000] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !formData.brand || !formData.model} className="bg-[#000] text-white px-6 py-2.5 rounded-[4px] text-[11px] font-label font-bold tracking-wider uppercase disabled:opacity-40 hover:bg-[#2d2d2d] transition-colors">
                {saving ? 'Saving...' : editingWatch ? 'Update' : 'Add to Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
