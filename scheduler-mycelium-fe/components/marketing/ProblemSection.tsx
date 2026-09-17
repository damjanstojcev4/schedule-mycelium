export function ProblemSection() {
  const problems = [
    {
      title: "Missed messages",
      description: "Customers message while you're busy working and their appointment request gets buried in your inbox.",
    },
    {
      title: "Double bookings",
      description: "Manual calendars and ongoing DM conversations make scheduling mistakes and overlapping appointments easy.",
    },
    {
      title: "Constant interruptions",
      description: "You shouldn't have to stop working every few minutes to answer \"Do you have anything free at 5?\"",
    },
    {
      title: "Appointments everywhere",
      description: "Instagram, Messenger, WhatsApp, calls, and handwritten notes become impossible to manage efficiently.",
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-gray-50 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Your inbox shouldn't be your booking system.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Running a service business is hard enough. Managing appointments manually across multiple apps makes it unnecessarily stressful.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <div key={problem.title} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{problem.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
