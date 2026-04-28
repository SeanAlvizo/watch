"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (user) {
          setEmail(user.email || "");
          setFirstName(user.user_metadata?.first_name || user.user_metadata?.full_name?.split(" ")[0] || "Admin");
          setLastName(user.user_metadata?.last_name || user.user_metadata?.full_name?.split(" ")[1] || "");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load profile';
        console.error('Load profile error:', err);
        setMessage(msg);
        setIsError(true);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } });
      setIsError(!!error);
      setMessage(error ? error.message : "Profile updated successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      console.error('Save profile error:', err);
      setIsError(true);
      setMessage(msg);
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) { 
      setIsError(true);
      setMessage("Password must be at least 8 characters."); 
      return; 
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setIsError(!!error);
      setMessage(error ? error.message : "Password updated successfully.");
      setNewPassword(""); 
      setCurrentPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      console.error('Change password error:', err);
      setIsError(true);
      setMessage(msg);
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleExportData = async () => {
    try {
      const supabase = createClient();
      const [{ data: watches }, { data: customers }, { data: sales }] = await Promise.all([
        supabase.from('watches').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('sales').select('*'),
      ]);
      const exportData = { watches, customers, sales, exported_at: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'atelier_export.json'; a.click();
      URL.revokeObjectURL(url);
      setIsError(false);
      setMessage("Data exported successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to export data';
      console.error('Export data error:', err);
      setIsError(true);
      setMessage(msg);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <>
      <Sidebar />
      <main className="md:ml-64 min-h-screen bg-[#fafafa] flex flex-col">
        <TopNav />
        <div className="pt-24 px-8 pb-12 flex-1 w-full relative">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8"><h1 className="font-headline text-3xl font-bold text-[#2d2d2d] tracking-tight mb-2">Settings</h1><p className="font-body text-[#737373] text-sm tracking-wide">Manage your account preferences and configurations.</p></div>

            {message && <div className={`mb-4 px-4 py-3 rounded-[4px] text-[12px] font-body ${isError ? 'bg-[#fcebea] text-[#db5a5a]' : 'bg-[#e2f0e6] text-[#2d7a46]'}`}>{message}</div>}

            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                {[{ key: 'profile', icon: 'person', label: 'Profile' }, { key: 'security', icon: 'lock', label: 'Security' }, { key: 'data', icon: 'database', label: 'Data Management' }].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)} className={`w-full text-left px-4 py-3 rounded-[4px] font-body text-[13px] uppercase tracking-wider font-bold transition-colors ${activeTab === t.key ? 'bg-[#e2e1e0] text-[#000]' : 'text-[#737373] hover:bg-[#f4f3f2]'}`}>
                    <span className="material-symbols-outlined text-[16px] mr-3 align-text-bottom">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-white border border-[#f0efee] rounded-[8px] shadow-[0px_2px_15px_rgba(0,0,0,0.02)] min-h-[500px]">
                {activeTab === "profile" && (
                  <div className="p-8">
                    <h2 className="font-headline text-xl font-bold text-[#2d2d2d] mb-6">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-2">First Name</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-4 py-3 text-[13px] font-body text-[#2d2d2d] focus:outline-none focus:border-[#737373]" />
                      </div>
                      <div>
                        <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-2">Last Name</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-4 py-3 text-[13px] font-body text-[#2d2d2d] focus:outline-none focus:border-[#737373]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-2">Email</label>
                        <input type="text" value={email} disabled className="w-full bg-[#f4f3f2] border border-[#f0efee] rounded-[4px] px-4 py-3 text-[13px] font-body text-[#a3a3a3] cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={handleSaveProfile} disabled={saving} className="bg-[#000] hover:bg-[#2d2d2d] text-white px-6 py-3 rounded-[4px] text-[11px] font-label font-bold tracking-widest uppercase disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="p-8">
                    <h2 className="font-headline text-xl font-bold text-[#2d2d2d] mb-6">Security & Access</h2>
                    <div className="mb-8 pb-8 border-b border-[#f0efee]">
                      <h3 className="font-body text-[#2d2d2d] text-[15px] font-bold mb-4">Change Password</h3>
                      <div className="space-y-4 max-w-md">
                        <div><label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-2">Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-4 py-3 text-[13px] font-body focus:outline-none focus:border-[#737373]" /></div>
                        <div><label className="block font-label text-[10px] font-bold tracking-widest uppercase text-[#737373] mb-2">New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[4px] px-4 py-3 text-[13px] font-body focus:outline-none focus:border-[#737373]" /></div>
                        <button onClick={handleChangePassword} disabled={saving} className="bg-[#f0efee] hover:bg-[#e2e1e0] text-[#2d2d2d] px-5 py-2.5 rounded-[4px] text-[10px] font-label font-bold tracking-widest uppercase disabled:opacity-50">{saving ? 'Updating...' : 'Update Password'}</button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-body text-[#2d2d2d] text-[15px] font-bold mb-4">Session</h3>
                      <div className="bg-[#fafafa] border border-[#f0efee] rounded-[4px] p-4 flex justify-between items-center">
                        <div><span className="font-body text-[13px] font-bold text-[#2d2d2d]">Current Session</span><br/><span className="font-body text-[11px] text-[#8c8c8c]">{email} • Active now</span></div>
                        <span className="bg-[#e2f0e6] text-[#2d7a46] px-3 py-1 rounded-[4px] text-[9px] font-label font-bold uppercase tracking-widest">Current</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "data" && (
                  <div className="p-8">
                    <h2 className="font-headline text-xl font-bold text-[#2d2d2d] mb-6">Data Management</h2>
                    <div className="mb-8 pb-8 border-b border-[#f0efee]">
                      <h3 className="font-body text-[#2d2d2d] text-[15px] font-bold mb-2">Export Workspace Data</h3>
                      <p className="font-body text-[#737373] text-[13px] mb-4">Download a complete JSON export of your inventory, clients, and transaction history.</p>
                      <button onClick={handleExportData} className="bg-[#f0efee] hover:bg-[#e2e1e0] text-[#2d2d2d] px-5 py-2.5 rounded-[4px] text-[10px] font-label font-bold tracking-widest uppercase flex items-center"><span className="material-symbols-outlined text-[16px] mr-2">download</span>Export All Data</button>
                    </div>
                    <div>
                      <h3 className="font-body text-[#db5a5a] text-[15px] font-bold mb-2">Danger Zone</h3>
                      <p className="font-body text-[#737373] text-[13px] mb-4">Sign out of your current session.</p>
                      <button onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/login'; }} className="bg-[#fcebea] text-[#db5a5a] hover:bg-[#fad4d4] px-5 py-3 rounded-[4px] text-[10px] font-label font-bold tracking-widest uppercase border border-[#fac8c8]">Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
