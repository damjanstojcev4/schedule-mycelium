import Link from 'next/link';

export function BusinessTypes() {
  const types = [
    {
      name: "Barbershops",
      description: "Let clients choose their barber and see available times instantly.",
    },
    {
      name: "Beauty salons",
      description: "Manage multiple staff members, services and appointment durations from one calendar.",
    },
    {
      name: "Nail salons",
      description: "Give regular customers a fast way to rebook without messaging back and forth.",
    }
  ];

  return (
    <section id="businesses" className="py-24 sm:py-32 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Built for businesses that run on appointments.
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <div key={type.name} className="flex flex-col p-8 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-emerald-200">
              <h3 className="text-xl font-bold text-slate-900 mb-3">{type.name}</h3>
              <p className="text-slate-600 mb-6 flex-1">{type.description}</p>
              <Link
                href={`/for/${type.name.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Learn more
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
