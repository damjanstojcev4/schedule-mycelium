export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Set up your business",
      description: "Add your services, staff and working hours in minutes.",
    },
    {
      number: "02",
      title: "Share your booking link",
      description: "Put it in your Instagram bio, website, Google profile or send it directly to customers.",
    },
    {
      number: "03",
      title: "Customers book themselves",
      description: "Appointments appear automatically in your dashboard without you lifting a finger.",
    }
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            How it works
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center md:text-left">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white text-xl font-black mb-6 shadow-md">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-slate-200" />
              )}
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-base text-slate-600 leading-relaxed max-w-xs mx-auto md:mx-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
