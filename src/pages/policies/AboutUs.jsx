export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#B8934A] uppercase tracking-wider">Our Formulation Philosophy</span>
        <h1 className="text-3xl font-bold text-[#6E2A45]">About Zen Nova Solutions</h1>
        <p className="text-xs text-[#574F49]">Clean, human-designed cosmetics and health care created for real routines.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-[#E7DECF] shadow-zen space-y-6 text-xs sm:text-sm text-[#574F49] leading-relaxed">
        <h2 className="text-lg font-bold text-[#6E2A45]">Designed by people who care about beauty & wellness</h2>
        <p>
          Zen Nova Solutions was founded on a simple principle: beauty and health care e-commerce should feel warm, editorial, and trustworthy — not like an aggressive template selling generic products.
        </p>
        <p>
          We carefully curate and formulate products across 5 connected families: Hair Care, Skin Care, Cosmetics, Health Care, and Wellness. Every formula undergoes rigorous testing, and every ingredient is transparently listed with its specific benefit.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-[#FBF8F4] rounded-xl border border-[#E7DECF]">
            <h4 className="font-bold text-[#6E2A45] mb-1">100% INCI Transparency</h4>
            <p className="text-xs">No secret fragrance blends or hidden fillers. We publish full active percentages.</p>
          </div>
          <div className="p-4 bg-[#FBF8F4] rounded-xl border border-[#E7DECF]">
            <h4 className="font-bold text-[#6E2A45] mb-1">Cruelty & Paraben Free</h4>
            <p className="text-xs">Ethically sourced ingredients tested dermatologically for sensitive skin.</p>
          </div>
          <div className="p-4 bg-[#FBF8F4] rounded-xl border border-[#E7DECF]">
            <h4 className="font-bold text-[#6E2A45] mb-1">Zero Friction Support</h4>
            <p className="text-xs">Live order tracking and seamless customer service without automated dead-ends.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
