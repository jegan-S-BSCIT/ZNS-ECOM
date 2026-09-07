import { useState } from 'react';

export default function FAQ() {
  const faqs = [
    {
      q: "Are Zen Nova products safe for sensitive skin?",
      a: "Yes. All our hair and skin care formulas are dermatologically tested, non-comedogenic, and 100% free from sulfates, parabens, and mineral oil."
    },
    {
      q: "How long does shipping take?",
      a: "Standard shipping takes 2-4 business days across India. Orders placed before 2:00 PM are dispatched on the same day."
    },
    {
      q: "Is Cash on Delivery (COD) available?",
      a: "Yes, Cash on Delivery is available for over 18,000+ pincodes with a flat handling fee of ₹40."
    },
    {
      q: "What is your return and refund policy?",
      a: "We offer a 14-day hassle-free return policy for unopened and damaged items upon delivery. Refunds are credited within 3-5 working days."
    },
    {
      q: "How do I track my order live?",
      a: "You can track your order using the 'Track Order' option in your My Account dashboard or directly via the tracking link provided in your confirmation SMS/email."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#B8934A] uppercase tracking-wider">Help Center</span>
        <h1 className="text-3xl font-bold text-[#6E2A45]">Frequently Asked Questions</h1>
        <p className="text-xs text-[#574F49]">Find quick answers to common questions regarding ingredients, orders & returns.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7DECF] shadow-zen divide-y divide-[#E7DECF] overflow-hidden">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-5">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-[#2A2420] hover:text-[#6E2A45]"
            >
              <span>{faq.q}</span>
              <span className="text-base font-normal">{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <p className="text-xs text-[#574F49] mt-3 leading-relaxed">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
