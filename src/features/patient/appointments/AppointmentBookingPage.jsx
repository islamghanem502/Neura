import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDoctorById } from "../../../api/doctorService";
import { getAvailableSlots, createAppointment } from "../../../api/appointmentService";
import {
  MapPin,
  Star,
  Calendar,
  Clock,
  Wallet,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Building2,
  Stethoscope,
  AlertCircle,
  Info,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Format "15:00" → "3:00 PM" */
const formatTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

/** Format ISO / YYYY-MM-DD → "Thursday, March 20 2026" */
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/** Format date for display in mini calendar (e.g., "Mar 20") */
const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Get the full day name ("Monday", "Friday" …) from a YYYY-MM-DD string.
 * Uses local midnight to avoid UTC-shift issues.
 */
const getDayName = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
  });
};

/** Get short day name (Mon, Tue, etc.) */
const getShortDayName = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
  });
};

/**
 * Given a list of working days (strings), find the next YYYY-MM-DD date
 * from `fromDate` (inclusive) that falls on one of those days.
 */
const nextValidDate = (fromDateStr, workingDays) => {
  if (!workingDays || workingDays.length === 0) return fromDateStr;
  const d = new Date(fromDateStr + "T00:00:00");
  for (let i = 0; i < 14; i++) {
    const name = d.toLocaleDateString("en-US", { weekday: "long" });
    if (workingDays.includes(name)) {
      return d.toISOString().slice(0, 10);
    }
    d.setDate(d.getDate() + 1);
  }
  return fromDateStr; // fallback: no valid day found in 2 weeks
};

/** Generate an array of dates from start date for the next N days */
const generateDateRange = (startDateStr, numDays = 14) => {
  const dates = [];
  const start = new Date(startDateStr + "T00:00:00");

  for (let i = 0; i < numDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
};

// ─── today's date (YYYY-MM-DD) ────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── AppointmentBookingPage ────────────────────────────────────────────────────
const AppointmentBookingPage = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL query params
  const clinicIdFromUrl = searchParams.get("clinicId") || "";
  const dateFromUrl = searchParams.get("date") || todayStr();

  // Local state for user selections
  const [selectedDate, setSelectedDate] = useState(dateFromUrl);
  const [selectedClinicId, setSelectedClinicId] = useState(clinicIdFromUrl);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [dateRangeStart, setDateRangeStart] = useState(todayStr());
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const errorRef = useRef(null);

  // ── Fetch doctor profile ──────────────────────────────────────────────────
  const {
    data: doctorData,
    isLoading: loadingDoctor,
    error: doctorError,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: !!doctorId,
  });

  const profile = doctorData?.data?.doctorProfile;

  // Clinics from the profile
  const activeClinics = (profile?.clinicInfo || []).filter(Boolean);

  // Once the profile is loaded, auto-select the first clinic if none was
  // provided via URL — this ensures resolvedClinicId is never empty.
  useEffect(() => {
    if (!selectedClinicId && activeClinics.length > 0) {
      setSelectedClinicId(activeClinics[0]._id);
    }
  }, [activeClinics.length]); // eslint-disable-line

  // The clinic ID we actually use for the slot query
  const resolvedClinicId =
    selectedClinicId ||
    (activeClinics.length > 0 ? activeClinics[0]._id : "");

  // The clinic object shown in the UI
  const activeClinic =
    activeClinics.find((c) => c._id === resolvedClinicId) ||
    activeClinics[0] ||
    null;

  // Correct field paths from the actual API response:
  //   primarySpecialization  → profile.professionalInfo.primarySpecialization
  //   rating                 → profile.stats.averageRating
  //   reviewsCount           → profile.stats.totalReviews
  const specialization =
    profile?.professionalInfo?.primarySpecialization ||
    profile?.primarySpecialization ||
    "";
  const avgRating = profile?.stats?.averageRating ?? profile?.rating ?? 0;
  const reviewsCount =
    profile?.stats?.totalReviews ?? profile?.reviewsCount ?? 0;

  // ── Derive working days from the active clinic's availableHours ───────────
  // e.g. ["Friday", "Saturday"]
  const workingDays = [
    ...new Set(
      (activeClinic?.availableHours || []).map((h) => h.day).filter(Boolean)
    ),
  ];

  // Schedule entries with time-range strings for display
  const scheduleEntries = (activeClinic?.availableHours || []).map((h) => ({
    day: h.day,
    range: `${formatTime(h.startTime)} – ${formatTime(h.endTime)}`,
  }));

  // Is the currently selected date a working day for this clinic?
  const selectedDayName = getDayName(selectedDate);
  const isDayValid =
    workingDays.length === 0 || workingDays.includes(selectedDayName);

  // Auto-skip the initial date to the next valid working day once we know the schedule
  useEffect(() => {
    if (workingDays.length > 0 && selectedDate) {
      const valid = nextValidDate(selectedDate, workingDays);
      if (valid !== selectedDate) setSelectedDate(valid);
    }
  }, [workingDays.join(",")]); // eslint-disable-line

  // Generate date range for the mini calendar
  const dateRange = generateDateRange(dateRangeStart, 14);

  // Check if a date is a working day
  const isWorkingDay = (dateStr) => {
    if (workingDays.length === 0) return true;
    const dayName = getDayName(dateStr);
    return workingDays.includes(dayName);
  };

  // ── Fetch available slots – only when the date is valid ───────────────────
  const {
    data: slotsData,
    isLoading: loadingSlots,
    error: slotsError,
  } = useQuery({
    queryKey: ["slots", doctorId, resolvedClinicId, selectedDate],
    queryFn: async () => {
      try {
        return await getAvailableSlots(doctorId, {
          date: selectedDate,
          clinicId: resolvedClinicId,
          isTelemedicine: false,
        });
      } catch (err) {
        // Many APIs return a 400 or 404 when no slots are found for a given date
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          return { slots: [] };
        }
        throw err;
      }
    },
    // Guard: need a clinic ID AND the day must be a working day
    enabled: !!doctorId && !!selectedDate && !!resolvedClinicId && isDayValid,
    retry: false, // avoid retrying 404s
  });

  const slots = slotsData?.data?.slots || slotsData?.slots || [];

  // ── Confirm: POST /appointments ────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedSlot || !resolvedClinicId) return;
    setBookingError(null);
    setSubmitting(true);

    // Compute endTime = startTime + consultationDuration (minutes)
    const duration = activeClinic?.consultationDuration || 30;
    const [h, m] = selectedSlot.split(":").map(Number);
    const totalMinutes = h * 60 + m + duration;
    const endHour = String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0");
    const endMin = String(totalMinutes % 60).padStart(2, "0");
    const endTime = `${endHour}:${endMin}`;

    const payload = {
      doctorId,
      clinicId: resolvedClinicId,
      appointmentType: "inPerson",
      scheduledDate: selectedDate,
      scheduledTime: { startTime: selectedSlot, endTime },
      paymentMethod: "cash",
    };

    console.log("[BookingPage] POST /appointments payload:", payload);

    try {
      const result = await createAppointment(payload);
      console.log("[BookingPage] Appointment created:", result);
      setConfirmed(true);
    } catch (err) {
      console.error("[BookingPage] Booking error:", err?.response ?? err);

      // Extract the most useful message from the API response
      const apiData = err?.response?.data;
      const msg =
        (Array.isArray(apiData?.errors)
          ? apiData.errors.map((e) => e.message || e.msg || e).join(", ")
          : apiData?.message) ||
        err?.message ||
        "Failed to book appointment. Please try again.";

      setBookingError(msg);
      // Scroll the error banner into view
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } finally {
      setSubmitting(false);
    }
  };

  // Navigate date range forward/backward
  const shiftDateRange = (direction) => {
    const newStart = new Date(dateRangeStart + "T00:00:00");
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 14 : -14));
    setDateRangeStart(newStart.toISOString().slice(0, 10));
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loadingDoctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading doctor details…</p>
        </div>
      </div>
    );
  }

  // ─── Doctor fetch error ───────────────────────────────────────────────────
  if (doctorError || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-sm shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="font-bold text-slate-800 text-lg mb-1">Doctor not found</h2>
          <p className="text-sm text-slate-500 mb-5">
            We couldn't load this doctor's profile. Please try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Confirmed Success Screen ─────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-emerald-100 p-10 text-center max-w-sm shadow-lg">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Appointment Confirmed!
          </h2>
          <p className="text-slate-500 text-sm mb-2">
            <span className="font-semibold text-slate-700">
              Dr. {profile.fullName}
            </span>
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {formatDate(selectedDate)} &mdash;{" "}
            <span className="font-semibold text-blue-600">
              {formatTime(selectedSlot)}
            </span>
          </p>
          <button
            onClick={() => navigate("/dashboard/patient/bookings")}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all text-sm"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to doctors
        </button>

        {/* ── Doctor Header Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-lg">
              {(profile.fullName || "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                Dr. {profile.fullName}
              </h1>
              <p className="text-blue-600 font-semibold text-sm mt-0.5">
                {specialization}
              </p>

              {/* Rating if available */}
              {avgRating > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-700">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({reviewsCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Clinic Selector (if multiple clinics) ──────────────────────── */}
        {activeClinics.length > 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" /> Select Clinic
            </h2>
            <div className="space-y-2">
              {activeClinics.map((clinic, idx) => {
                const cid = clinic._id;
                const isActive = resolvedClinicId === cid;
                return (
                  <button
                    key={cid}
                    onClick={() => {
                      setSelectedClinicId(cid);
                      setSelectedSlot(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                  >
                    <span className="font-semibold">{clinic.clinicName}</span>
                    {clinic.address && (
                      <span className="text-xs text-slate-400 ml-2">
                        {clinic.address.city}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Active Clinic Info ──────────────────────────────────────────── */}
        {activeClinic && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" /> Clinic Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Name */}
              <div className="flex items-start gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Clinic</p>
                  <p className="font-semibold text-slate-800">{activeClinic.clinicName}</p>
                </div>
              </div>

              {/* Address */}
              {activeClinic.address && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Address</p>
                    <p className="font-semibold text-slate-800">
                      {[
                        activeClinic.address.street,
                        activeClinic.address.city,
                        activeClinic.address.governorate,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Fee */}
              {activeClinic.consultationFee != null && (
                <div className="flex items-start gap-2 text-slate-600">
                  <Wallet className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Consultation Fee</p>
                    <p className="font-bold text-emerald-600 text-base">
                      {activeClinic.consultationFee} EGP
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Working Schedule Badges ──────────────────────────────────────── */}
        {scheduleEntries.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Clinic Working Schedule
            </p>
            <div className="flex flex-wrap gap-2">
              {scheduleEntries.map((entry, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${entry.day === selectedDayName
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-blue-200 text-blue-700"
                    }`}
                >
                  <span className="font-bold">{entry.day}</span>
                  <span className="opacity-70">{entry.range}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── IMPROVED Date Picker ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-500" /> Select Date
            </h2>

            {/* Month navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftDateRange('prev')}
                disabled={dateRangeStart <= todayStr()}
                className={`p-1.5 rounded-lg border transition-all ${dateRangeStart <= todayStr()
                  ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => shiftDateRange('next')}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mini calendar - date grid */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {/* Day headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
                {day}
              </div>
            ))}

            {/* Date cells */}
            {dateRange.map((date) => {
              const isAvailable = isWorkingDay(date);
              const isSelected = date === selectedDate;
              const isPast = date < todayStr();
              const shortDay = getShortDayName(date);
              const formattedDate = formatShortDate(date);

              return (
                <button
                  key={date}
                  onClick={() => {
                    if (!isAvailable || isPast) return;
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  disabled={!isAvailable || isPast}
                  className={`
                    relative p-2 rounded-xl text-center transition-all
                    ${isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                      : isAvailable && !isPast
                        ? 'hover:bg-blue-50 hover:border-blue-200 bg-white border border-slate-100 text-slate-700'
                        : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-50'
                    }
                  `}
                >
                  <div className="text-xs font-medium">
                    {shortDay}
                  </div>
                  <div className="text-sm font-bold">
                    {formattedDate.split(' ')[1]}
                  </div>
                  {isAvailable && !isPast && !isSelected && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected date display */}
          {selectedDate && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Selected:</span>
                <span className="font-bold text-slate-800">{formatDate(selectedDate)}</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Available Slots ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" /> Available Time Slots
          </h2>

          {/* Unavailable day warning */}
          {!isDayValid && selectedDate && (
            <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Dr. {profile.fullName} is not available on {selectedDayName}.
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Please choose a day from their schedule:{" "}
                  <span className="font-semibold">
                    {workingDays.join(", ")}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Loading slots */}
          {loadingSlots && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-sm">Checking availability…</span>
            </div>
          )}

          {/* Slots error */}
          {slotsError && !loadingSlots && (
            <div className="text-center py-6 text-sm text-red-400">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              Failed to load slots. Please try a different date.
            </div>
          )}

          {/* No slots */}
          {!loadingSlots && !slotsError && slots.length === 0 && isDayValid && (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No available slots on this date.</p>
              <p className="text-xs mt-1">Try selecting another day.</p>
            </div>
          )}

          {/* Slots grid */}
          {!loadingSlots && !slotsError && slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(isSelected ? null : slot)}
                    className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all duration-150 text-center ${isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                      : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    {formatTime(slot)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected slot callout */}
          {selectedSlot && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              Selected:{" "}
              <span className="font-bold">{formatTime(selectedSlot)}</span> on{" "}
              <span className="font-bold">{formatDate(selectedDate)}</span>
            </div>
          )}
        </div>

        {/* ── Booking Error Banner ─────────────────────────────────────────── */}
        {bookingError && (
          <div ref={errorRef} className="flex items-start gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-2xl mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Booking failed</p>
              <p className="text-xs text-red-600 mt-0.5">{bookingError}</p>
            </div>
          </div>
        )}

        {/* ── Confirm Button ───────────────────────────────────────────────── */}
        <button
          onClick={handleConfirm}
          disabled={!selectedSlot || submitting}
          className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            selectedSlot && !submitting
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Booking…</>
          ) : selectedSlot ? (
            `Confirm Appointment at ${formatTime(selectedSlot)}`
          ) : (
            "Select a time slot to continue"
          )}
        </button>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;