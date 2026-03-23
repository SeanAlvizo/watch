import React from 'react';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-tertiary-fixed selection:text-on-tertiary-fixed-variant min-h-screen">
      {/* Simple Nav */}
      <nav className="border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/home" className="font-headline font-bold text-lg tracking-tight">The Digital Atelier</Link>
          <Link href="/home#demo" className="text-xs font-bold uppercase tracking-widest border border-primary px-4 py-2 rounded hover:bg-primary hover:text-on-primary transition-all">Contact Concierge</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl serif-tight font-bold mb-12">Legal & Advisory</h1>

        {/* Privacy Section */}
        <section id="privacy" className="mb-20 scroll-mt-24">
          <h2 className="label-engraved text-tertiary mb-4 block">Privacy Policy</h2>
          <div className="prose prose-stone dark:prose-invert max-w-none text-on-surface-variant leading-relaxed space-y-4">
            <p>At The Digital Atelier, we understand that discretion is the ultimate luxury. Your data is treated with the same meticulous care as a grand complication timepiece.</p>
            <p className="font-bold text-on-surface">Data Sovereignty</p>
            <p>All inventory records, client histories, and financial data are encrypted at rest and in transit. We do not sell or share your boutique's operational data with third parties.</p>
            <p className="font-bold text-on-surface">The Vault Protocol</p>
            <p>We use production-grade PostgreSQL environments with Row-Level Security (RLS) to ensure that your data is isolated and accessible only by authorized principals.</p>
          </div>
        </section>

        {/* Terms Section */}
        <section id="terms" className="mb-20 scroll-mt-24">
          <h2 className="label-engraved text-tertiary mb-4 block">Terms of Service</h2>
          <div className="prose prose-stone dark:prose-invert max-w-none text-on-surface-variant leading-relaxed space-y-4">
            <p>Usage of the Atelier platform is governed by our Professional Services Agreement. Key highlights include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>License:</strong> Access is granted on a per-boutique basis.</li>
              <li><strong>Integrity:</strong> Users must maintain accurate provenance records to preserve the network's trust.</li>
              <li><strong>Termination:</strong> Principals may export their full data repository at any time, ensuring zero vendor lock-in.</li>
            </ul>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="mb-20 scroll-mt-24">
          <h2 className="label-engraved text-tertiary mb-4 block">Security Documentation</h2>
          <div className="prose prose-stone dark:prose-invert max-w-none text-on-surface-variant leading-relaxed space-y-4">
            <p>Our infrastructure is designed for the most demanding security requirements in the luxury sector.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="p-6 bg-surface-container rounded-lg border border-outline-variant/15">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">enhanced_encryption</span>
                  Encryption
                </h4>
                <p className="text-xs">AES-256 encryption for all sensitive media assets and private keys.</p>
              </div>
              <div className="p-6 bg-surface-container rounded-lg border border-outline-variant/15">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">history</span>
                  Audit Trails
                </h4>
                <p className="text-xs">Immutable logs for every administrative action and record modification.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant/10 py-12 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] label-engraved text-outline">© 2024 The Digital Atelier | Established in Excellence</p>
        </div>
      </footer>
    </div>
  );
}
