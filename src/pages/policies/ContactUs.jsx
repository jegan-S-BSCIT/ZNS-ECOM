import { useState } from 'react';
import { useCart } from '../../context/CartContext';

export default function ContactUs() {
  const { showToast } = useCart();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Thank you! Your message has been sent to support@zennova.com', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#B8934A] uppercase tracking-wider">Customer Care</span>
        <h1 className="text-3xl font-bold text-[#6E2A45]">Contact Support</h1>
        <p className="text-xs text-[#574F49]">We are here to help with formulation advice, order tracking, and returns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-2xl border border-[#E7DECF] shadow-zen space-y-4">
          <h3 className="text-base font-bold text-[#6E2A45]">Send Us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium mb-1">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Message</label>
              <textarea
                rows="4"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#C1662E] text-white py-3 font-bold rounded-lg hover:bg-[#A35021] shadow-md"
            >
              Send Message &rarr;
            </button>
          </form>
        </div>

        <div className="space-y-4 text-xs text-[#574F49]">
          <div className="bg-white p-6 rounded-2xl border border-[#E7DECF] shadow-zen space-y-3">
            <h4 className="font-bold text-[#6E2A45] text-sm">Direct Channels</h4>
            <p><strong>Email:</strong> support@zennova.com</p>
            <p><strong>Toll-Free Helpline:</strong> +91 (1800) 425-9090</p>
            <p><strong>Operating Hours:</strong> Mon - Sat, 9:00 AM - 7:00 PM IST</p>
          </div>

          <div className="bg-[#F6EFF2] p-6 rounded-2xl border border-[#6E2A45]/20 space-y-2">
            <h4 className="font-bold text-[#6E2A45]">Formulation Guidance</h4>
            <p>Unsure which product fits your skin type? Send us your routine questions and our skin advisor team will reply within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
