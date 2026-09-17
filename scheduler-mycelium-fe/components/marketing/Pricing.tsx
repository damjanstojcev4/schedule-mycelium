import Link from 'next/link';

export function Pricing() {
  const plans = [
    {
      name: "Solo",
      description: "For independent professionals.",
      price: "500 MKD",
      period: "/ month",
      recommended: false,
      features: [
        "1 staff member",
        "Unlimited bookings",
        "Booking page",
        "Service management",
        "Schedule management",
        "Customer bookings",
      ]
    },
    {
      name: "Business",
      description: "For teams.",
      price: "1000 MKD",
      period: "/ month",
      recommended: true,
      features: [
        "Up to 4 staff",
        "Everything in Solo",
        "Individual staff schedules",
        "Team management",
        "Central appointment dashboard",
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Start with a 30-day free trial. No credit card required.
          </p>
        </div>

        <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-2 items-center">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`rounded-3xl p-8 ring-1 ${
                plan.recommended 
                  ? 'ring-slate-900 bg-slate-950 shadow-2xl relative md:scale-105 z-10' 
                  : 'ring-gray-200 bg-white shadow-sm'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wide rounded-full">
                  Recommended
                </div>
              )}
              <h3 className={`text-2xl font-bold ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <p className={`mt-2 text-sm ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.description}
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold tracking-tight ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm font-medium ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.period}
                </span>
              </div>
              
              <Link
                href="/register"
                className={`mt-8 block w-full rounded-full py-3 px-4 text-center text-sm font-bold shadow-sm transition-colors ${
                  plan.recommended
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Start Free
              </Link>
              
              <ul className="mt-8 space-y-4 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <svg className={`h-5 w-5 flex-shrink-0 ${plan.recommended ? 'text-emerald-400' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.recommended ? 'text-slate-300' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
