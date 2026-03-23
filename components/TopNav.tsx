"use client";

import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="fixed top-0 w-full md:w-[calc(100%-16rem)] flex justify-between items-center px-8 h-20 bg-[#faf9f8] opacity-90 glass-nav z-40 shadow-[0px_20px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center">
        <h1 className="font-headline tracking-tight text-xl font-bold text-[#000000]"></h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <div className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#e3e2e1] transition-colors text-[#2d2d2d]">
            <span className="material-symbols-outlined text-[28px]">account_circle</span>
          </div>
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-outline-variant/20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
            <Link className="flex items-center px-4 py-2 text-sm text-[#1a1c1c] hover:bg-[#f4f3f2] transition-colors" href="/settings">
              <span className="material-symbols-outlined mr-3 text-sm">settings</span>
              <span className="font-body tracking-wide">Settings</span>
            </Link>
            <div className="border-t border-outline-variant/10 my-1"></div>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#f4f3f2] transition-colors w-full text-left">
              <span className="material-symbols-outlined mr-3 text-sm">logout</span>
              <span className="font-body tracking-wide">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
