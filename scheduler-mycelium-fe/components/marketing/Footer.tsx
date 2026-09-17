import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 pt-16 pb-8 border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Mycelium
            </span>
            <p className="mt-4 text-sm text-slate-500">
              The modern appointment scheduling platform for service businesses.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Pricing</Link></li>
              <li><Link href="#how-it-works" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Business</h4>
            <ul className="space-y-3">
              <li><Link href="/for/barbershops" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">For Barbershops</Link></li>
              <li><Link href="/for/beauty-salons" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">For Beauty Salons</Link></li>
              <li><Link href="/for/nail-salons" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">For Nail Salons</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Account</h4>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Log In</Link></li>
              <li><Link href="/register" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Start Free</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} Mycelium Scheduling. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
