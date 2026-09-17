import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pb-40">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-16 right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
          
          <div className="text-center lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-5xl xl:text-6xl leading-[1.1]">
              Stop managing appointments through DMs.
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
              Give your customers a booking link and let Mycelium manage your availability automatically. Your customers can book services, staff and available times 24/7 — while you manage everything from one simple dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex h-14 items-center justify-center rounded-full bg-emerald-500 px-8 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
              >
                Start Free
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              No credit card required • Setup in minutes • Cancel anytime
            </p>
          </div>

          <div className="mt-16 lg:col-span-6 lg:mt-0">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              {/* Product Mockup */}
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/10 transform transition-all duration-700 hover:-translate-y-2 hover:shadow-emerald-500/20 hover:ring-emerald-500/30">
                <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                  </div>
                  <div className="mx-auto rounded-md bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-400">
                    mycelium.app/dashboard
                  </div>
                </div>
                <div className="p-4 sm:p-6 bg-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-32 rounded-md bg-slate-200"></div>
                    <div className="h-8 w-24 rounded-full bg-emerald-500 text-xs font-bold flex items-center justify-center text-slate-950">
                      New Booking
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className={`h-12 rounded-md ${i === 3 ? 'bg-emerald-500/10 border-emerald-500 border' : 'bg-white border border-slate-200'}`}></div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="h-10 w-10 rounded-full bg-slate-200 mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 rounded bg-slate-200 mb-2"></div>
                        <div className="h-3 w-16 rounded bg-slate-100"></div>
                      </div>
                      <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Confirmed</div>
                    </div>
                    <div className="flex items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-md cursor-default">
                      <div className="h-10 w-10 rounded-full bg-slate-200 mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 rounded bg-slate-200 mb-2"></div>
                        <div className="h-3 w-20 rounded bg-slate-100"></div>
                      </div>
                      <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Upcoming</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
