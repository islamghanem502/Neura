import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMyAppointments, cancelAppointment } from "../../../api/appointmentService";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Loader2,
  AlertCircle,
  X,
  XCircle,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  completed: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400"    },
  cancelled: { bg: "bg-slate-100",  text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-400"   },
  noShow:    { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     dot: "bg-red-400"     },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Cancel Confirmation Modal ─────────────────────────────────────────────────

const CancelModal = ({ appt, onConfirm, onClose, isCancelling, error }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-w-sm w-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-lg font-black text-slate-900 mb-1">Cancel appointment?</h3>
      <p className="text-sm text-slate-500 mb-1">
        <span className="font-semibold text-slate-700">Dr. {appt?.doctor?.fullName}</span>
      </p>
      <p className="text-sm text-slate-400 mb-5">
        {formatDate(appt?.scheduledDate)} &mdash; {formatTime(appt?.scheduledTime?.startTime)}
      </p>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isCancelling}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          Keep it
        </button>
        <button
          onClick={onConfirm}
          disabled={isCancelling}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isCancelling ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</>
          ) : (
            "Yes, cancel"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ─── AppointmentCard ──────────────────────────────────────────────────────────

const AppointmentCard = ({ appt, onCancelClick }) => {
  const {
    doctor, clinic, scheduledDate, scheduledTime, status,
    appointmentNumber, payment, appointmentType,
  } = appt;

  const canCancel = status === "pending";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 ${
      status === "cancelled" ? "border-slate-100 opacity-70" : "border-slate-100"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

        {/* Doctor avatar */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow">
          {(doctor?.fullName || "")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex flex-wrap items-start gap-2 justify-between">
            <div>
              <p className="font-bold text-slate-900 text-base leading-tight">
                Dr. {doctor?.fullName}
              </p>
              <p className="text-blue-600 text-sm font-semibold mt-0.5">
                {doctor?.primarySpecialization}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(scheduledDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatTime(scheduledTime?.startTime)}
              {scheduledTime?.endTime && ` – ${formatTime(scheduledTime.endTime)}`}
            </span>
            {clinic?.clinicName && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {clinic.clinicName}
                {clinic.address?.city && `, ${clinic.address.city}`}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-50">
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              {appointmentNumber && (
                <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  {appointmentNumber}
                </span>
              )}
              {appointmentType && (
                <span className="capitalize bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  {appointmentType === "inPerson" ? "In-Person" : appointmentType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {payment?.totalAmount != null && (
                <span className="text-sm font-bold text-emerald-600">
                  {payment.totalAmount} EGP
                  {payment.paid && (
                    <span className="ml-1 text-xs font-medium text-emerald-400">(Paid)</span>
                  )}
                </span>
              )}

              {/* Cancel button — only for pending */}
              {canCancel && (
                <button
                  onClick={() => onCancelClick(appt)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Status filter options ─────────────────────────────────────────────────────

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

// ─── MyBookingsPage ────────────────────────────────────────────────────────────

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null); // the appointment being cancelled
  const [cancelError, setCancelError] = useState(null);
  const LIMIT = 10;

  const queryParams = {
    page,
    limit: LIMIT,
    sortBy: "scheduledDate",
    sortOrder: "desc",
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["myAppointments", queryParams],
    queryFn: () => getMyAppointments(queryParams),
    keepPreviousData: true,
  });

  // ── Cancel mutation ────────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (appointmentId) => cancelAppointment(appointmentId),
    onSuccess: () => {
      // Invalidate all myAppointments queries so the list refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      setCancelTarget(null);
      setCancelError(null);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        "Failed to cancel appointment. Please try again.";
      setCancelError(msg);
    },
  });

  const handleCancelClick = (appt) => {
    setCancelError(null);
    setCancelTarget(appt);
  };

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;

    // The backend should return `_id` or `id` for each appointment.
    const apptId = cancelTarget._id || cancelTarget.id || cancelTarget.appointmentId;
    
    if (!apptId) {
      console.error("[MyBookingsPage] Cannot cancel: Appointment ID is missing from object.", cancelTarget);
      setCancelError("Error: Appointment ID not found. Please contact support.");
      return;
    }

    cancelMutation.mutate(apptId);
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const appointments = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta.totalPages || 1;

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <CancelModal
          appt={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => { setCancelTarget(null); setCancelError(null); }}
          isCancelling={cancelMutation.isPending}
          error={cancelError}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            View and manage all your booked appointments
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/dashboard/patient/appointments")}
          className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all"
        >
          <Stethoscope className="w-4 h-4" />
          Book New Appointment
        </button>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all capitalize ${
                statusFilter === s
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Loading your appointments…</p>
          </div>
        )}

        {/* Fetch error */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="font-bold text-slate-800">Failed to load appointments</p>
            <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && appointments.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No appointments yet</h3>
            <p className="text-slate-500 text-sm mb-5">
              {statusFilter === "all"
                ? "You haven't booked any appointments yet."
                : `No ${statusFilter} appointments found.`}
            </p>
            <button
              onClick={() => navigate("/dashboard/patient/appointments")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              Find a Doctor
            </button>
          </div>
        )}

        {/* Appointment cards */}
        {!isLoading && !error && appointments.length > 0 && (
          <>
            {/* Summary row */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">{appointments.length}</span>
                {meta.total && (
                  <> of <span className="font-semibold text-slate-800">{meta.total}</span></>
                )}{" "}
                appointments
                {isFetching && (
                  <Loader2 className="inline w-3.5 h-3.5 animate-spin ml-2 text-blue-400" />
                )}
              </p>
            </div>

            <div className="space-y-3">
              {appointments.map((appt, idx) => (
                <AppointmentCard
                  key={appt.id || appt._id || appt.appointmentNumber || idx}
                  appt={appt}
                  onCancelClick={handleCancelClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!meta.hasPrevPage}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!meta.hasNextPage}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
