import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

// Shared Components
import LandingPage from "../features/landing/LandingPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import LoadingOverlay from "../components/LoadingOverlay";

// ── Patient Features ─────────────────────────────────────────────────────
import PatientLayout from "../features/patient/components/PatientLayout";
import PatientDashboard from "../features/patient/dashboard/PatientDashboard";
import AppointmentsPage from "../features/patient/appointments/AppointmentsPage";
import AppointmentBookingPage from "../features/patient/appointments/AppointmentBookingPage";
import MyBookingsPage from "../features/patient/bookings/MyBookingsPage";
import MedicalRecordsPage from "../features/patient/records/MedicalRecordsPage";
import PatientPharmacyPage from "../features/patient/pharmacy/PatientPharmacyPage";
import DigitalTwinPage from "../features/patient/digital-twin/DigitalTwinPage";
import TherapyGroupsPage from "../features/patient/therapy-groups/TherapyGroupsPage";
import PatientProfilePage from "../features/patient/profile/PatientProfilePage";

// ── Doctor Features ──────────────────────────────────────────────────────
import DoctorLayout from "../features/doctor/components/DoctorLayout";
import DoctorDashboard from "../features/doctor/DoctorDashboard";
import CompleteProfilePage from "../features/doctor/CompleteProfilePage";
import DoctorProfile from "../features/doctor/DoctorProfile";
import MyClinic from "../features/doctor/MyClinic";
import DoctorAppointmentsPage from "../features/doctor/DoctorAppointmentsPage";
import StartSessionPage from "../features/doctor/StartSessionPage";

// ── Other Features ───────────────────────────────────────────────────────
import NurseDashboard from "../features/nurse/NurseDashboard";
import PharmacyDashboard from "../features/pharmacy/PharmacyDashboard";

const router = createBrowserRouter([
  // ── Public Routes ────────────────────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/auth",
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },

  // ── Protected: Patient ───────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRole="patient" />,
    children: [
      {
        path: "/dashboard/patient",
        element: <PatientLayout />,
        children: [
          { index: true, element: <PatientDashboard /> },
          { path: "appointments", element: <AppointmentsPage /> },
          { path: "appointments/book/:doctorId", element: <AppointmentBookingPage /> },
          { path: "bookings", element: <MyBookingsPage /> },
          { path: "records", element: <MedicalRecordsPage /> },
          { path: "pharmacy", element: <PatientPharmacyPage /> },
          { path: "digital-twin", element: <DigitalTwinPage /> },
          { path: "therapy-groups", element: <TherapyGroupsPage /> },
          { path: "profile", element: <PatientProfilePage /> },
        ],
      },
    ],
  },

  // ── Protected: Doctor ────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRole="doctor" />,
    children: [
      {
        path: "/dashboard/doctor",
        element: <DoctorLayout />, // الـ Layout الجديد اللي عملناه
        children: [
          { index: true, element: <DoctorDashboard /> },
          { path: "profile", element: <CompleteProfilePage /> }, // used when verification incomplete
          { path: "my-profile", element: <DoctorProfile /> }, // used when active
          { path: "clinic", element: <MyClinic /> },
          { path: "appointments", element: <DoctorAppointmentsPage /> },
          { path: "start-session", element: <StartSessionPage /> },
        ],
      },
    ],
  },

  // ── Protected: Nurse ─────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRole="nurse" />,
    children: [
      {
        path: "/dashboard/nurse",
        element: <NurseDashboard />,
      },
    ],
  },

  // ── Protected: Pharmacy ──────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRole="pharmacy" />,
    children: [
      {
        path: "/dashboard/pharmacy",
        element: <PharmacyDashboard />,
      },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}