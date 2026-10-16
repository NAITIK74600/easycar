import React, { useState } from 'react';
import { sendContactMessage } from '../api/client';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSubmitting(true);
      await sendContactMessage({
        name,
        email,
        phone: phone || undefined,
        subject: subject || undefined,
        message,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit contact enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-obsidian text-pearl pt-32 pb-24">
      <div className="section-container">
        <div className="max-w-2xl mb-12">
          <span className="label-technical text-accent text-xs block mb-2">CONCIERGE COMMUNICATIONS</span>
          <h1 className="heading-hero text-3xl md:text-5xl text-white mb-4 font-display">
            CONTACT DESK.
          </h1>
          <p className="text-ash text-sm md:text-base leading-relaxed">
            Our team in Biel/Bienne and Pieterlen is available seven days a week for reservations, vehicle handovers, and customer support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left 5 Cols: Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 bg-charcoal border border-white/10 space-y-6">
              <span className="label-technical text-accent text-xs block font-mono">EASY CARS BIEL • DIRECT CONTACT</span>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-mono text-silver uppercase block">TELEPHONE & MOBILE</span>
                  <div className="space-y-1">
                    <a href="tel:+41793889997" className="text-sm font-mono font-bold text-white hover:text-accent transition-colors block">
                      +41 79 388 99 97
                    </a>
                    <a href="tel:+41323771200" className="text-xs font-mono text-silver hover:text-white transition-colors block">
                      +41 32 377 12 00
                    </a>
                  </div>
                  <p className="text-[11px] text-steel font-mono mt-1">Mon – Sun: 08:00 – 20:00 CET</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-mono text-silver uppercase block">EMAIL</span>
                  <a href="mailto:info@easycarsbiel.ch" className="text-sm font-mono font-bold text-white hover:text-accent transition-colors">
                    info@easycarsbiel.ch
                  </a>
                  <p className="text-[11px] text-steel font-mono">Official Site: www.easycarsbiel.ch</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-mono text-silver uppercase block">LOCATIONS</span>
                  <p className="text-sm font-mono text-white font-semibold">Biel/Bienne Showroom</p>
                  <p className="text-xs font-mono text-silver mb-2">Zentralstrasse 4, 2502 Biel/Bienne</p>
                  <p className="text-sm font-mono text-white font-semibold">Pieterlen Hub</p>
                  <p className="text-xs font-mono text-silver">Hauptstrasse 12, 2542 Pieterlen</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 bg-charcoal border border-white/10 shadow-2xl">
              <span className="label-technical text-accent text-xs block mb-2">SEND AN ENQUIRY</span>
              <h3 className="text-xl font-bold text-white mb-6">Concierge Enquiry Form</h3>

              {success && (
                <div className="p-4 mb-6 bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-3 text-emerald-200 text-xs font-mono">
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block uppercase">Transmission Complete</strong>
                    <span>Your message has been received by our Pieterlen concierge desk. We will respond shortly.</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 mb-6 bg-red-950/60 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs font-mono">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block uppercase">Submission Notice</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="input-dark"
                    />
                  </div>

                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      placeholder="jean.dupont@example.ch"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-dark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">
                      PHONE NUMBER (OPTIONAL)
                    </label>
                    <input
                      type="tel"
                      placeholder="+41 79 000 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-dark"
                    />
                  </div>

                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">
                      SUBJECT
                    </label>
                    <input
                      type="text"
                      placeholder="Custom Alpine Itinerary / Private Handover"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-technical text-silver text-[10px] block mb-1">
                    MESSAGE *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe your planned travel dates, vehicle preference, or special requests..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="input-dark"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-xs font-mono tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={15} />
                      <span>DISPATCHING MESSAGE...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>TRANSMIT ENQUIRY</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
