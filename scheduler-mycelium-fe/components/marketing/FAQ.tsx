'use client';
import { useState } from 'react';

export function FAQ() {
  const faqs = [
    {
      question: "Do customers need an account?",
      answer: "No. Customers can book directly from your public booking page without signing up or remembering another password."
    },
    {
      question: "Can every staff member have different working hours?",
      answer: "Yes. Each staff member can have their own schedule, breaks and days off configured individually."
    },
    {
      question: "Can customers book when my business is closed?",
      answer: "They can visit the booking page at any time, but Mycelium only allows them to select valid, available appointment times during your open hours."
    },
    {
      question: "Can I block holidays or days when the business is closed?",
      answer: "Yes. You can add one-off closures or holidays to ensure no bookings can be made on those specific days."
    },
    {
      question: "Can customers choose a specific employee?",
      answer: "Yes, if your business enables multiple staff members, customers can select who they want to book with."
    },
    {
      question: "Does Mycelium prevent double bookings?",
      answer: "Yes. Availability is dynamically calculated using existing appointments, service duration, and staff schedules to ensure a time slot is never double-booked."
    },
    {
      question: "Can I use Mycelium if I work alone?",
      answer: "Absolutely. The Solo plan is designed specifically for independent professionals and includes all the features you need to manage your own schedule."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`rounded-2xl border ${isOpen ? 'border-emerald-200 bg-white shadow-sm' : 'border-gray-200 bg-white'} overflow-hidden transition-all duration-200`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className={`text-base font-bold ${isOpen ? 'text-slate-900' : 'text-slate-800'}`}>
                    {faq.question}
                  </span>
                  <span className={`ml-6 flex h-7 w-7 items-center justify-center rounded-full ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <svg
                      className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
