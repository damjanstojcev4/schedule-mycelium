import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-950">
              Mycelium
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="#businesses" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              For Businesses
            </Link>
            <Link href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              FAQ
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors sm:block">
            Log In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm hover:bg-emerald-400 transition-colors"
          >
            Start Free
          </Link>
          
          {/* Mobile menu button */}
          <button className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
