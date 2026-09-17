export function EarlyAccess() {
  return (
    <section className="py-24 sm:py-32 bg-emerald-50 border-t border-emerald-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Built for local businesses.
          </h2>
          <p className="mt-6 text-lg text-slate-700 leading-relaxed">
            Mycelium is being built closely with service businesses to make appointment management simpler, faster and more affordable. By joining early, you get:
          </p>
          
          <div className="mt-10 grid gap-4 sm:grid-cols-2 text-left">
            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Personal onboarding</h4>
                <p className="text-sm text-slate-600 mt-1">We help you set up your account and import your existing schedule.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Local support</h4>
                <p className="text-sm text-slate-600 mt-1">Talk to real people when you need help, not a chatbot.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Simple pricing</h4>
                <p className="text-sm text-slate-600 mt-1">No hidden fees, no per-appointment commissions. Just a flat monthly rate.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Shape the product</h4>
                <p className="text-sm text-slate-600 mt-1">Your feedback directly influences what we build next.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
