import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, CheckCircle, Clock, AlertTriangle, Key, ArrowRight } from 'lucide-react';

export const RentalTransparency: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Submit Request',
      desc: 'Select your vehicle, pickup dates and optional delivery services online in seconds.',
    },
    {
      num: '02',
      title: 'Owner Verification',
      desc: 'Direct owner checks vehicle availability, schedule and driver eligibility.',
    },
    {
      num: '03',
      title: 'Receive Approval',
      desc: 'Get an official booking confirmation or custom quote tailored to your exact journey.',
    },
    {
      num: '04',
      title: 'Accept Quote',
      desc: 'Review total costs, mileage limits, and transparent Swiss terms before commitment.',
    },
    {
      num: '05',
      title: 'Complete Payment',
      desc: 'Pay securely via approved payment method. Security deposit payable in cash at handover.',
    },
    {
      num: '06',
      title: 'Collect Vehicle',
      desc: 'Personal handover and digital condition protocol in Pieterlen or Biel/Bienne.',
    },
  ];

  return (
    <section className="relative w-full bg-charcoal/50 py-20 border-t border-white/5 select-none">
      <div className="section-container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="label-technical text-brand-red text-xs block mb-2 font-mono tracking-[0.24em]">
            SWISS CONDITIONS
          </span>
          <h2
            className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide uppercase leading-tight mb-4"
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          >
            RENTAL TRANSPARENCY
          </h2>
          <p className="text-silver text-sm sm:text-base font-light leading-relaxed">
            Straightforward Swiss rental terms. No unexpected charges, no complicated paperwork. Direct owner communication from enquiry to return.
          </p>
        </div>

        {/* 6-Step Visual Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-obsidian border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                <span className="font-mono text-2xl font-black text-brand-red tracking-widest block mb-4">
                  {step.num}
                </span>
                <h3 className="font-display font-bold text-base text-white tracking-wider uppercase mb-2">
                  {step.title}
                </h3>
                <p className="text-ash text-xs leading-relaxed font-sans">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Essential Legal & Operational Disclaimers */}
        <div className="bg-obsidian border border-brand-red/30 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  IMPORTANT SWISS RENTAL POLICIES
                </h4>
                <ul className="text-silver text-xs space-y-1 list-disc list-inside font-sans">
                  <li>
                    <strong>Request Status:</strong> Submitting a request does not confirm a booking until owner approval.
                  </li>
                  <li>
                    <strong>Security Deposit:</strong> Refundable deposit (CHF 500 for A5 / CHF 300 for A3) is held separately from rental price and refunded after inspection.
                  </li>
                  <li>
                    <strong>Fuel:</strong> Excluded. Full-to-full return policy.
                  </li>
                  <li>
                    <strong>Territory:</strong> Cross-border travel outside Switzerland requires prior written owner authorization.
                  </li>
                </ul>
              </div>
            </div>

            <Link
              to="/about#rental-terms"
              className="btn-outline text-xs font-mono py-2.5 px-6 whitespace-nowrap tracking-wider self-start lg:self-center"
            >
              <span>COMPLETE TERMS & FAQ</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
