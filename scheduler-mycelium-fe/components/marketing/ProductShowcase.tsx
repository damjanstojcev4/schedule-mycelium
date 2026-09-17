export function ProductShowcase() {
  const sections = [
    {
      title: "Online booking",
      description: "Customers choose their service, staff member and available time themselves. A clean, professional booking page without needing an account.",
      mockup: (
        <div className="rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="font-bold text-slate-900">Select Service</div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-emerald-500 cursor-pointer">
                <div>
                  <div className="font-medium text-slate-900 text-sm">Haircut & Styling</div>
                  <div className="text-xs text-slate-500">45 mins</div>
                </div>
                <div className="text-sm font-semibold text-slate-900">$35</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Business dashboard",
      description: "See upcoming appointments, track daily revenue, and manage your entire schedule from one central place.",
      mockup: (
        <div className="rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex">
            <div className="w-16 bg-slate-950 h-64 p-3 flex flex-col gap-4">
              <div className="w-10 h-10 rounded bg-slate-800"></div>
              <div className="w-10 h-10 rounded bg-emerald-500"></div>
              <div className="w-10 h-10 rounded bg-slate-800"></div>
            </div>
            <div className="flex-1 p-4 bg-slate-50">
              <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-white border border-slate-200 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Today's Bookings</div>
                  <div className="text-2xl font-bold text-slate-900">12</div>
                </div>
                <div className="h-20 bg-white border border-slate-200 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Revenue</div>
                  <div className="text-2xl font-bold text-slate-900">$420</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Staff schedules",
      description: "Set individual working hours, breaks, and days off for every member of your team.",
      mockup: (
        <div className="rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden p-4">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-slate-200"></div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Alex Staff</div>
                <div className="text-xs text-slate-500">Barber</div>
              </div>
           </div>
           <div className="space-y-2">
             {['Monday', 'Tuesday', 'Wednesday'].map(day => (
                <div key={day} className="flex justify-between items-center text-sm p-2 border-b border-slate-100">
                  <span className="font-medium text-slate-700">{day}</span>
                  <span className="text-slate-600">09:00 - 17:00</span>
                </div>
             ))}
           </div>
        </div>
      )
    },
    {
      title: "Automatic availability",
      description: "Mycelium only shows times that can actually be booked, automatically preventing scheduling conflicts and double bookings.",
      mockup: (
         <div className="rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden p-6">
            <div className="text-center font-bold text-slate-900 mb-4">October 24</div>
            <div className="grid grid-cols-3 gap-3">
              {['09:00', '09:30', '10:00', '11:30', '13:00', '14:30'].map((time, i) => (
                <div key={time} className={`text-center py-2 rounded text-sm font-medium ${i === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {time}
                </div>
              ))}
            </div>
         </div>
      )
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything in one place.
          </h2>
        </div>

        <div className="space-y-24">
          {sections.map((section, idx) => (
            <div key={section.title} className={`lg:grid lg:grid-cols-2 lg:gap-16 items-center ${idx % 2 !== 0 ? 'lg:grid-flow-col-dense' : ''}`}>
              <div className={idx % 2 !== 0 ? 'lg:col-start-2' : ''}>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{section.description}</p>
              </div>
              <div className={`mt-10 lg:mt-0 ${idx % 2 !== 0 ? 'lg:col-start-1' : ''}`}>
                <div className="relative">
                  <div className="absolute -inset-4 rounded-2xl bg-slate-50"></div>
                  <div className="relative">
                    {section.mockup}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
