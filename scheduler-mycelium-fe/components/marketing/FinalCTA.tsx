import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 right-[20%] h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
          Your next appointment doesn't need to arrive through a DM.
        </h2>
        <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
          Create your booking page, share your link and let customers book when you're actually available.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex h-14 items-center justify-center rounded-full bg-emerald-500 px-8 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
          >
            Start Free
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex h-14 items-center justify-center rounded-full border border-slate-700 bg-white/5 px-8 text-base font-semibold text-white hover:bg-white/10 hover:border-slate-500 transition-colors"
          >
            View Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
