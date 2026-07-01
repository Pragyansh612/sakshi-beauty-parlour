'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createAppointment } from '@/actions/appointments';
import { createBooking } from '@/actions/bookings';

interface ServiceOption {
  id: string;
  name: string;
  desc: string;
  price: string;
  metaLabel: string;
}

interface DayOption {
  date: string;
  dow: string;
  dnum: number;
  mon: string;
  full: string;
}

interface SlotOption {
  id: string;
  label: string;
  off: boolean;
}

interface BookingWizardProps {
  apptServices: ServiceOption[];
  bookServices: ServiceOption[];
  days: DayOption[];
  slotsByDate: Record<string, SlotOption[]>;
  isAuthenticated: boolean;
}

type Mode = 'appt' | 'book';

export function BookingWizard({ apptServices, bookServices, days, slotsByDate, isAuthenticated }: BookingWizardProps) {
  const [mode, setMode] = useState<Mode>('appt');
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dateIdx, setDateIdx] = useState<number | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [reqType, setReqType] = useState('');
  const [reqGuests, setReqGuests] = useState('');
  const [reqVenue, setReqVenue] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [trial, setTrial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isAppt = mode === 'appt';
  const services = isAppt ? apptServices : bookServices;
  const service = serviceId ? services.find((s) => s.id === serviceId) ?? null : null;
  const dateObj = dateIdx != null ? days[dateIdx] : null;
  const dateLabel = dateObj ? `${dateObj.full}` : '—';
  const daySlots = dateObj ? slotsByDate[dateObj.date] ?? [] : [];
  const slot = slotId ? daySlots.find((s) => s.id === slotId) ?? null : null;

  const reqSummaryParts = [];
  if (reqType) reqSummaryParts.push(reqType);
  if (reqGuests) reqSummaryParts.push(reqGuests);
  if (trial) reqSummaryParts.push('trial');
  const reqSummary = reqSummaryParts.length ? reqSummaryParts.join(' · ') : 'To be discussed';

  const thirdLabel = isAppt ? 'Time' : 'Requirements';
  const thirdValue = isAppt ? (slot ? slot.label : '—') : reqSummary;

  const stepNames = isAppt ? ['Service', 'Date', 'Time', 'Confirm'] : ['Service', 'Date', 'Details', 'Confirm'];

  let nextDisabled = false;
  if (step === 1) nextDisabled = serviceId == null;
  else if (step === 2) nextDisabled = dateIdx == null;
  else if (step === 3 && isAppt) nextDisabled = slotId == null;

  function switchMode(next: Mode) {
    setMode(next);
    setStep(1);
    setServiceId(null);
    setDateIdx(null);
    setSlotId(null);
  }

  function resetAll() {
    setMode('appt');
    setStep(1);
    setServiceId(null);
    setDateIdx(null);
    setSlotId(null);
    setReqType('');
    setReqGuests('');
    setReqVenue('');
    setReqNotes('');
    setTrial(false);
    setConfirmed(false);
    setReference(null);
    setSubmitError(null);
  }

  async function handleConfirm() {
    if (!service || !dateObj) return;
    setSubmitting(true);
    setSubmitError(null);

    if (isAppt) {
      if (!slotId) return;
      const result = await createAppointment({ service_id: service.id, slot_id: slotId });
      setSubmitting(false);
      if (!result.success) {
        setSubmitError(result.error ?? 'Something went wrong.');
        return;
      }
      setReference(result.reference ?? null);
      setConfirmed(true);
    } else {
      const result = await createBooking({
        service_id: service.id,
        event_date: dateObj.date,
        event_type: reqType || undefined,
        guests_count: reqGuests || undefined,
        venue: reqVenue || undefined,
        style_notes: reqNotes || undefined,
        wants_trial: trial,
      });
      setSubmitting(false);
      if (!result.success) {
        setSubmitError(result.error ?? 'Something went wrong.');
        return;
      }
      setReference(result.reference ?? null);
      setConfirmed(true);
    }
  }

  if (confirmed) {
    return (
      <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-8 pb-[90px] flex justify-center">
        <div className="bg-white border border-[#eee3d4] rounded-[18px] max-w-[560px] text-center px-8 py-12 md:px-[50px] md:py-[54px]">
          <div className="w-[74px] h-[74px] rounded-full bg-[#b5904f] text-white flex items-center justify-center text-[34px] mx-auto mb-6.5">
            ✓
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-3">
            {isAppt ? 'Appointment' : 'Booking'} requested
          </p>
          <h2 className="font-heading font-medium text-[32px] md:text-[38px] leading-[1.08] text-[#2e2823] m-0">
            You&apos;re all but <span className="font-script text-[#b5904f] text-[38px] md:text-[46px]">booked</span>
          </h2>
          <p className="text-[15px] font-light text-[#6b5f54] mt-3.5">
            We&apos;ve received your {isAppt ? 'appointment' : 'booking'} for{' '}
            <b className="text-[#2e2823] font-medium">{service?.name}</b> on{' '}
            <b className="text-[#2e2823] font-medium">{dateLabel}</b>. Our team will confirm by call or WhatsApp shortly.
          </p>
          <div className="my-7 px-6 py-5 border border-[#eee3d4] rounded-2xl text-left flex flex-col gap-2.5">
            {reference && (
              <div className="flex justify-between">
                <span className="text-[13px] font-light text-[#6b5f54]">Reference</span>
                <span className="text-[13.5px] font-medium text-[#2e2823]">{reference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[13px] font-light text-[#6b5f54]">{thirdLabel}</span>
              <span className="text-[13.5px] font-medium text-[#2e2823]">{thirdValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] font-light text-[#6b5f54]">From</span>
              <span className="text-[14px] font-semibold text-[#b5904f]">{service?.price}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]"
            >
              View in my dashboard
            </Link>
            <button
              onClick={resetAll}
              className="inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
            >
              Book another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {/* MODE TOGGLE */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-11 flex justify-center pt-7">
        <div className="inline-flex bg-[#efe6d6] border border-[#e2d3b8] rounded-[30px] p-[5px]">
          <button
            onClick={() => switchMode('appt')}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-[24px] px-6 py-2.5 text-[13.5px] font-medium leading-[1.15] transition-all',
              isAppt ? 'bg-[#2e2823] text-[#f6ede0]' : 'text-[#6b5f54]'
            )}
          >
            Quick Appointment
            <small className={cn('font-light text-[10px]', isAppt ? 'text-[#cdbfae]' : 'text-[#9b8e84]')}>Short services</small>
          </button>
          <button
            onClick={() => switchMode('book')}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-[24px] px-6 py-2.5 text-[13.5px] font-medium leading-[1.15] transition-all',
              !isAppt ? 'bg-[#2e2823] text-[#f6ede0]' : 'text-[#6b5f54]'
            )}
          >
            Bridal &amp; Event Booking
            <small className={cn('font-light text-[10px]', !isAppt ? 'text-[#cdbfae]' : 'text-[#9b8e84]')}>Special occasions</small>
          </button>
        </div>
      </div>

      {/* STEPPER */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-11 flex justify-center pt-8 overflow-x-auto">
        <div className="flex items-center gap-2.5">
          {stepNames.map((label, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <div key={label} className="flex items-center gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'w-[34px] h-[34px] rounded-full border-[1.5px] flex items-center justify-center text-[13px] font-medium shrink-0 transition-all',
                      active || done ? 'border-[#b5904f] bg-[#b5904f] text-white' : 'border-[#d8c6a6] bg-white text-[#9b8e84]'
                    )}
                  >
                    {num}
                  </div>
                  <div className={cn('text-[12.5px] whitespace-nowrap', active || done ? 'text-[#2e2823]' : 'text-[#9b8e84]')}>
                    {label}
                  </div>
                </div>
                {num < 4 && <div className={cn('w-[30px] md:w-[42px] h-[1.5px]', done ? 'bg-[#b5904f]' : 'bg-[#e2d3b8]')} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-8 pb-[74px] grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* LEFT PANEL */}
        <div className="bg-white border border-[#eee3d4] rounded-[18px] p-6 md:p-10 min-h-[430px]">
          {/* STEP 1 — SERVICE */}
          {step === 1 && (
            <div>
              <h2 className="font-heading font-medium text-[26px] md:text-[30px] text-[#2e2823] m-0">
                {isAppt ? 'Select a service' : 'Select your package'}
              </h2>
              <p className="text-[14px] font-light text-[#6b5f54] mt-1.5 mb-6">
                {isAppt
                  ? 'Quick treatments you can book for a single visit.'
                  : 'Special-occasion services with a personal consultation.'}
              </p>
              <div className="flex flex-col gap-3.5">
                {services.length === 0 && (
                  <p className="text-[13.5px] font-light text-[#9b8e84]">
                    No services available right now — please call or WhatsApp us to book.
                  </p>
                )}
                {services.map((svc) => {
                  const selected = serviceId === svc.id;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setServiceId(svc.id)}
                      className={cn(
                        'flex items-center gap-4 text-left rounded-2xl border bg-white px-5 py-4.5 transition-all',
                        selected ? 'border-[#b5904f] shadow-[0_0_0_1px_#b5904f,0_14px_30px_-22px_rgba(181,144,79,.7)]' : 'border-[#eee3d4] hover:border-[#d8b876]'
                      )}
                    >
                      <div
                        className="w-[54px] h-[54px] rounded-xl shrink-0"
                        style={{ background: 'linear-gradient(135deg,#f1e2da,#ece0cf)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-heading text-[19px] md:text-[21px] leading-none text-[#2e2823]">{svc.name}</div>
                        <div className="text-[12.5px] font-light text-[#6b5f54] mt-1">{svc.desc}</div>
                      </div>
                      <div className="text-right mr-1.5 shrink-0">
                        <div className="text-[11px] text-[#9b8e84]">{svc.metaLabel}</div>
                        <div className="text-[15px] font-semibold text-[#b5904f]">{svc.price}</div>
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full bg-[#b5904f] text-white flex items-center justify-center text-[12px] shrink-0 transition-opacity',
                          selected ? 'opacity-100' : 'opacity-0'
                        )}
                      >
                        ✓
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — DATE */}
          {step === 2 && (
            <div>
              <h2 className="font-heading font-medium text-[26px] md:text-[30px] text-[#2e2823] m-0">Choose a date</h2>
              <p className="text-[14px] font-light text-[#6b5f54] mt-1.5 mb-6">
                We&apos;re open Mon–Sun, 11:00 AM – 9:00 PM. Pick a day that suits you.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                {days.map((d, i) => {
                  const daySlotList = slotsByDate[d.date] ?? [];
                  const hasAvailability = daySlotList.some((s) => !s.off);
                  const selected = dateIdx === i;
                  return (
                    <button
                      key={d.date}
                      disabled={!hasAvailability}
                      onClick={() => {
                        setDateIdx(i);
                        setSlotId(null);
                      }}
                      className={cn(
                        'rounded-[14px] border px-1 py-3.5 text-center transition-all',
                        !hasAvailability && 'opacity-30 pointer-events-none',
                        selected ? 'bg-[#2e2823] border-[#2e2823] text-[#f6ede0]' : 'bg-white border-[#eee3d4] hover:border-[#d8b876]'
                      )}
                    >
                      <div className="text-[10.5px] tracking-[0.08em] uppercase opacity-70">{d.dow}</div>
                      <div className="font-heading text-[22px] mt-0.5">{d.dnum}</div>
                      <div className="text-[10px] opacity-70 mt-px">{d.mon}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — TIME (appt) or REQUIREMENTS (book) */}
          {step === 3 && isAppt && (
            <div>
              <h2 className="font-heading font-medium text-[26px] md:text-[30px] text-[#2e2823] m-0">Pick a time slot</h2>
              <p className="text-[14px] font-light text-[#6b5f54] mt-1.5 mb-6">
                Available slots for {dateLabel}. Greyed slots are fully booked.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {daySlots.length === 0 && (
                  <p className="col-span-full text-[13.5px] font-light text-[#9b8e84]">
                    No slots available for this date yet.
                  </p>
                )}
                {daySlots.map((s) => (
                  <button
                    key={s.id}
                    disabled={s.off}
                    onClick={() => setSlotId(s.id)}
                    className={cn(
                      'rounded-xl border px-2 py-3.5 text-center text-sm transition-all',
                      s.off && 'opacity-30 pointer-events-none line-through',
                      slotId === s.id ? 'bg-[#b5904f] border-[#b5904f] text-white' : 'bg-white border-[#eee3d4] hover:border-[#d8b876]'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && !isAppt && (
            <div>
              <h2 className="font-heading font-medium text-[26px] md:text-[30px] text-[#2e2823] m-0">Tell us about your event</h2>
              <p className="text-[14px] font-light text-[#6b5f54] mt-1.5 mb-6">
                A few details so we can prepare the right artist and timeline for you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                <div>
                  <label className="text-xs text-[#6b5f54] mb-1.5 block">Event type</label>
                  <input
                    className="w-full border border-[#e2d3b8] rounded-xl px-4 py-3 text-sm text-[#2e2823] bg-white outline-none focus:border-[#b5904f]"
                    placeholder="Wedding, Reception, Engagement…"
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6b5f54] mb-1.5 block">Number needing makeup</label>
                  <input
                    className="w-full border border-[#e2d3b8] rounded-xl px-4 py-3 text-sm text-[#2e2823] bg-white outline-none focus:border-[#b5904f]"
                    placeholder="e.g. Bride + 3 guests"
                    value={reqGuests}
                    onChange={(e) => setReqGuests(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-[#6b5f54] mb-1.5 block">Venue / location</label>
                  <input
                    className="w-full border border-[#e2d3b8] rounded-xl px-4 py-3 text-sm text-[#2e2823] bg-white outline-none focus:border-[#b5904f]"
                    placeholder="Venue name & area, or 'at salon'"
                    value={reqVenue}
                    onChange={(e) => setReqVenue(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-[#6b5f54] mb-1.5 block">Preferred style &amp; notes</label>
                  <textarea
                    className="w-full border border-[#e2d3b8] rounded-xl px-4 py-3 text-sm text-[#2e2823] bg-white outline-none focus:border-[#b5904f] min-h-[96px] resize-y"
                    placeholder="Tell us about the look you have in mind, references, timings…"
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => setTrial((t) => !t)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4.5 py-3 mt-4.5 transition-all',
                  trial ? 'border-[#b5904f] shadow-[0_0_0_1px_#b5904f]' : 'border-[#eee3d4]'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0',
                    trial ? 'bg-[#b5904f]' : 'bg-[#e2d3b8]'
                  )}
                >
                  {trial ? '✓' : ''}
                </div>
                <div className="text-[13.5px] font-medium text-[#2e2823]">I&apos;d like a makeup trial beforehand</div>
              </button>
            </div>
          )}

          {/* STEP 4 — REVIEW */}
          {step === 4 && (
            <div>
              <h2 className="font-heading font-medium text-[26px] md:text-[30px] text-[#2e2823] m-0">Review &amp; confirm</h2>
              <p className="text-[14px] font-light text-[#6b5f54] mt-1.5 mb-6">
                Please check the details below before confirming.
              </p>
              <div className="flex flex-col border border-[#eee3d4] rounded-2xl overflow-hidden">
                <div className="flex justify-between px-5 py-4 bg-[#fbf7ef]">
                  <span className="text-[13px] font-light text-[#6b5f54]">Type</span>
                  <span className="text-sm font-medium">{isAppt ? 'Appointment' : 'Booking'}</span>
                </div>
                <div className="flex justify-between px-5 py-4">
                  <span className="text-[13px] font-light text-[#6b5f54]">Service</span>
                  <span className="text-sm font-medium">{service?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between px-5 py-4 bg-[#fbf7ef]">
                  <span className="text-[13px] font-light text-[#6b5f54]">Date</span>
                  <span className="text-sm font-medium">{dateLabel}</span>
                </div>
                <div className="flex justify-between px-5 py-4 gap-4">
                  <span className="text-[13px] font-light text-[#6b5f54] shrink-0">{thirdLabel}</span>
                  <span className="text-sm font-medium text-right max-w-[260px]">{thirdValue}</span>
                </div>
                <div className="flex justify-between px-5 py-4 bg-[#fbf7ef]">
                  <span className="text-[13px] font-light text-[#6b5f54]">From</span>
                  <span className="text-[15px] font-semibold text-[#b5904f]">{service?.price ?? '—'}</span>
                </div>
              </div>
              <p className="text-[12.5px] font-light text-[#6b5f54] mt-4">
                Final pricing is confirmed after your consultation. No payment is taken online.
              </p>

              {submitError && <p className="text-[13px] text-red-600 mt-3">{submitError}</p>}

              {isAuthenticated ? (
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full mt-5.5 inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] transition-all hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)] disabled:opacity-50"
                >
                  {submitting ? 'Confirming…' : isAppt ? 'Confirm Appointment' : 'Confirm Booking'}
                </button>
              ) : (
                <div className="mt-5.5 rounded-2xl border border-[#e6d3a0] bg-[#f6ecca] px-5 py-4 text-center">
                  <p className="text-[13.5px] text-[#6b5f54]">
                    Please sign in or create an account to confirm your {isAppt ? 'appointment' : 'booking'}.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center mt-3 bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-8 py-3 font-body font-medium text-sm no-underline"
                  >
                    Sign in / Register
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* NAV */}
          {step <= 3 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#eee3d4]">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                className={cn(
                  'inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-6 py-3 font-body font-medium text-[13.5px] transition-all hover:border-[#b5904f] hover:text-[#b5904f]',
                  step === 1 && 'invisible'
                )}
              >
                ← Back
              </button>
              <button
                onClick={() => !nextDisabled && step < 4 && setStep(step + 1)}
                disabled={nextDisabled}
                className="inline-flex items-center justify-center bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-6 py-3 font-body font-medium text-[13.5px] transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)] disabled:opacity-40 disabled:pointer-events-none"
              >
                {step === 3 ? 'Review' : 'Continue'} →
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SUMMARY */}
        <aside className="bg-white border border-[#eee3d4] rounded-[18px] p-6 lg:sticky lg:top-24">
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-4">Your selection</div>
          <div
            className="relative h-32 rounded-2xl mb-5 overflow-hidden flex items-end p-4"
            style={{ background: 'linear-gradient(150deg,#f3e3dc,#efe1d0)' }}
          >
            <span className="font-script text-[#b5904f] text-[26px]">{isAppt ? 'Appointment' : 'Booking'}</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-3">
              <span className="text-[13px] font-light text-[#6b5f54]">Service</span>
              <span className="text-[13.5px] font-medium text-right">{service?.name ?? 'Not selected'}</span>
            </div>
            <div className="h-px bg-[#eee3d4]" />
            <div className="flex justify-between gap-3">
              <span className="text-[13px] font-light text-[#6b5f54]">Date</span>
              <span className="text-[13.5px] font-medium text-right">{dateObj ? dateObj.full : 'Not selected'}</span>
            </div>
            <div className="h-px bg-[#eee3d4]" />
            <div className="flex justify-between gap-3">
              <span className="text-[13px] font-light text-[#6b5f54]">{thirdLabel}</span>
              <span className="text-[13.5px] font-medium text-right">{thirdValue}</span>
            </div>
          </div>
          <div className="mt-6 px-4.5 py-4 bg-[#2e2823] rounded-2xl flex justify-between items-center">
            <span className="text-[#cdbfae] text-[12.5px] font-light">Starting from</span>
            <span className="font-heading text-[#f6ede0] text-2xl">{service?.price ?? '—'}</span>
          </div>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full mt-4 bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-6 py-3 font-body font-medium text-[12.5px] no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
          >
            Or book over WhatsApp
          </a>
        </aside>
      </section>
    </div>
  );
}
