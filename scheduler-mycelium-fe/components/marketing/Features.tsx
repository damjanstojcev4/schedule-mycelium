export function Features() {
  const features = [
    "24/7 online booking",
    "Real-time availability",
    "Individual staff schedules",
    "Breaks and days off",
    "Business closures",
    "Service duration management",
    "Appointment management",
    "No customer account required",
    "Mobile-friendly booking pages",
    "Cancellation rules",
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need. Nothing you don't.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 py-3 border-b border-gray-200/60 last:border-0 sm:[&:nth-last-child(-n+2)]:border-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-base font-medium text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
