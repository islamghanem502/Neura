import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../../../api/appointmentService";
import {
  MapPin,
  Star,
  Calendar,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Building2,
  BadgeCheck,
  Wallet,
  UserRound,
  Filter,
  RotateCcw,
} from "lucide-react";

// ─────────────────────────── helpers ───────────────────────────
const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const avatarGradient = (gender) =>
  gender === "female"
    ? "from-pink-400 to-rose-500"
    : "from-blue-400 to-indigo-600";

// ─────────────────────────── DoctorCard ───────────────────────────
const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const { name, specialization, rating, reviewsCount, clinic, gender, profileImage, id } = doctor;

  const handleBook = () => {
    const today = new Date().toISOString().slice(0, 10);
    const clinicId = clinic?._id || clinic?.id || "";
    const params = new URLSearchParams();
    if (clinicId) params.set("clinicId", clinicId);
    params.set("date", today);
    navigate(`/dashboard/patient/appointments/book/${id}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group">
      {/* Image area */}
      <div className="w-full sm:w-44 flex-shrink-0 bg-gradient-to-b from-slate-50 to-slate-100 flex items-end justify-center min-h-[160px] sm:min-h-[auto] relative overflow-hidden">
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradient(gender)} flex items-center justify-center text-white text-2xl font-black shadow-lg mb-6 mt-6`}
          >
            {initials(name)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        {/* Top row */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Dr. {name}
              </h3>
              <p className="text-blue-600 font-semibold text-sm mt-0.5">
                {specialization}
              </p>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-amber-700">
                {rating > 0 ? rating.toFixed(1) : "New"}
              </span>
              <span className="text-xs text-slate-400">
                ({reviewsCount} reviews)
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-500">
            {clinic && (
              <>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {clinic.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {clinic.city}, {clinic.governorate}
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5 capitalize">
              <UserRound className="w-3.5 h-3.5 text-slate-400" />
              {gender}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <BadgeCheck className="w-3 h-3" /> In-person
            </span>
            {clinic && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Wallet className="w-3 h-3" />
                {clinic.consultationFee} EGP
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 mt-4">
          <button className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all">
            View Profile
          </button>
          <button
            onClick={handleBook}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── FilterPanel ───────────────────────────
const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Neurology", "Pediatrics",
  "Orthopedics", "Ophthalmology", "Dentistry", "General Practice",
];

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia",
  "Sharqia", "Qalyubia", "Minya", "Asyut",
];

const FilterPanel = ({ filters, onChange, onReset, onClose, isMobile }) => {
  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 });

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 sticky top-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-800 text-sm">Filters</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Specialization
          </label>
          <div className="relative">
            <select
              value={filters.specialization}
              onChange={(e) => set("specialization", e.target.value)}
              className="w-full appearance-none px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Governorate */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Governorate
          </label>
          <div className="relative">
            <select
              value={filters.governorate}
              onChange={(e) => set("governorate", e.target.value)}
              className="w-full appearance-none px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Governorates</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            City
          </label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g. Mansoura"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Doctor's Gender
          </label>
          <div className="flex gap-2">
            {["", "male", "female"].map((g) => (
              <button
                key={g}
                onClick={() => set("gender", g)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all capitalize ${filters.gender === g
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
              >
                {g || "Any"}
              </button>
            ))}
          </div>
        </div>

        {/* Available Today */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => set("availableToday", !filters.availableToday)}
            className={`w-10 h-5 rounded-full transition-all relative ${filters.availableToday ? "bg-blue-600" : "bg-slate-200"
              }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${filters.availableToday ? "left-5" : "left-0.5"
                }`}
            />
          </div>
          <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Available Today
          </span>
        </label>

        {/* Min Rating */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Min Rating — <span className="text-blue-600">{filters.minRating}★</span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating}
            onChange={(e) => set("minRating", parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0</span><span>5</span>
          </div>
        </div>


      </div>
    </aside>
  );
};

// ─────────────────────────── SORT OPTIONS ────────────────────────────
const SORT_OPTIONS = [
  { label: "Most Relevant", value: "rating-desc" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
];

// ─────────────────────────── MAIN PAGE ────────────────────────────
const AppointmentsPage = () => {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
    city: "",
    governorate: "",
    gender: "",
    availableToday: false,
    minRating: 0,
    sortBy: "price",
    sortOrder: "asc",
    page: 1,
    limit: 12,
  });

  // ── React Query (unchanged) ──
  const { data, isLoading, error } = useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, v]) => v !== "" && v !== false && v !== undefined
        )
      );
      return getDoctors(cleanFilters);
    },
  });

  const handleFilterChange = (newFilters) =>
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));

  const handleReset = () => {
    setSearchText("");
    setFilters({
      search: "", specialization: "", city: "", governorate: "", gender: "",
      availableToday: false, minRating: 0,
      sortBy: "price", sortOrder: "asc", page: 1, limit: 12,
    });
  };

  const totalPages = data?.meta?.totalPages || 1;
  const currentPage = filters.page;

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setFilters((prev) => ({ ...prev, page: p }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const doctors = data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Find the right specialist
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Browse and book from our network of verified doctors
          </p>
        </div>

        {/* ── Search Bar ── */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFilterChange({ search: searchText });
              }}
              placeholder="Search by name, specialty, or clinic…"
              className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleFilterChange({ search: searchText })}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
          >
            Search
          </button>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center gap-2 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* ── Quick filter chips ── */}
        <div className="flex flex-wrap gap-2 mb-7">
          {[
            { label: "Rating 4.5+", action: () => handleFilterChange({ minRating: 4.5 }) },
            { label: "Available Today", action: () => handleFilterChange({ availableToday: true }) },
            { label: "Clinic Visit", action: () => { } },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
            >
              {label === "Rating 4.5+" && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              {label === "Available Today" && <Calendar className="w-3.5 h-3.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* ── Body: sidebar + results ── */}
        <div className="flex gap-6 items-start">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Mobile Sidebar overlay */}
          {showMobileFilter && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="fixed inset-y-0 left-0 w-80 z-50 bg-slate-50 overflow-y-auto p-4 lg:hidden shadow-2xl">
                <FilterPanel
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleReset}
                  onClose={() => setShowMobileFilter(false)}
                  isMobile
                />
              </div>
            </>
          )}

          {/* Results column */}
          <div className="flex-1 min-w-0">

            {/* Results header / sort */}
            {!isLoading && !error && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {doctors.length}
                  </span>
                  {data?.meta?.total && (
                    <> of <span className="font-semibold text-slate-800">{data.meta.total}</span></>
                  )}{" "}
                  specialists
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Sort by:</span>
                  <div className="relative">
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split("-");
                        handleFilterChange({ sortBy, sortOrder });
                      }}
                      className="appearance-none pl-3 pr-7 py-1.5 text-sm font-semibold text-blue-600 border border-blue-100 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                    >
                      {SORT_OPTIONS.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Loading specialists…</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl text-center">
                <p className="font-bold">Failed to load doctors</p>
                <p className="text-sm mt-1 text-red-400">Please try again later</p>
              </div>
            )}

            {/* Doctors list */}
            {!isLoading && !error && doctors.length > 0 && (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && doctors.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No specialists found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && doctors.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - currentPage) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === currentPage
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}

            {/* Load More hint when only 1 page */}
            {!isLoading && !error && doctors.length > 0 && totalPages === 1 && (
              <div className="text-center mt-8">
                <p className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <span>All {data?.meta?.total || doctors.length} specialists displayed</span>
                  <ChevronDown className="w-4 h-4" />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
