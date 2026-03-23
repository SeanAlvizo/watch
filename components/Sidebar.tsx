import React from "react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col py-8 px-6 space-y-4 bg-[#f4f3f2] h-screen w-64 fixed left-0 top-0 border-r-0 z-50">
      <div className="mb-10 px-2">
        <h2 className="font-headline text-lg text-[#000000] leading-tight">Atelier Admin</h2>
        <p className="font-body text-[10px] tracking-widest uppercase text-secondary opacity-70">Luxury Management</p>
      </div>
      <nav className="flex-1 space-y-2">
        {/* Active Tab: Dashboard */}
        <Link className="flex items-center space-x-3 px-4 py-3 text-[#000000] font-semibold hover:bg-[#e3e2e1] rounded-md transition-all duration-300" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-body text-sm tracking-wide uppercase">Dashboard</span>
        </Link>
        <Link className="flex items-center space-x-3 px-4 py-3 text-[#737373] hover:text-[#000000] hover:translate-x-1 transition-all duration-300" href="/inventory">
          <span className="material-symbols-outlined">watch</span>
          <span className="font-body text-sm tracking-wide uppercase">Inventory</span>
        </Link>
        <Link className="flex items-center space-x-3 px-4 py-3 text-[#737373] hover:text-[#000000] hover:translate-x-1 transition-all duration-300" href="/customers">
          <span className="material-symbols-outlined">group</span>
          <span className="font-body text-sm tracking-wide uppercase">Customers</span>
        </Link>
        <Link className="flex items-center space-x-3 px-4 py-3 text-[#737373] hover:text-[#000000] hover:translate-x-1 transition-all duration-300" href="/sales">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-body text-sm tracking-wide uppercase">Sales</span>
        </Link>
        <Link className="flex items-center space-x-3 px-4 py-3 text-[#737373] hover:text-[#000000] hover:translate-x-1 transition-all duration-300" href="/reports">
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-body text-sm tracking-wide uppercase">Reports</span>
        </Link>
      </nav>
    </aside>
  );
}
