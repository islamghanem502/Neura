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
import DigitalTwinSetup from "../features/patient/digital-twin/DigitalTwinSetup";
import TherapyGroupsPage from "../features/patient/therapy-groups/TherapyGroupsPage";
import PatientProfilePage from "../features/patient/profile/PatientProfilePage";

// ── Doctor Features ──────────────────────────────────────────────────────
import DashboardLayout from "../features/doctor/dashboard/layout/DashboardLayout";
import DoctorDashboard from "../features/doctor/dashboard/pages/DoctorDashboard";
import MyClinicPage from "../features/doctor/dashboard/pages/MyClinicPage";
import DoctorAppointmentsPage from "../features/doctor/dashboard/pages/DoctorAppointmentsPage";
import MySessionsPage from "../features/doctor/dashboard/pages/MySessionsPage";
import SessionPage from "../features/doctor/dashboard/pages/SessionPage";
import MessagesPage from "../features/doctor/dashboard/pages/MessagesPage";
import DoctorCompleteProfilePage from "../features/doctor/dashboard/pages/CompleteProfilePage";
import DoctorOnboardingPage from "../features/doctor/onboarding/CompleteProfilePage";
import PatientsPage from "../features/doctor/dashboard/pages/PatientsPage";
import DoctorTherapyRoomsPage from "../features/doctor/dashboard/pages/DoctorTherapyRoomsPage";
import PatientFilePage from "../features/doctor/dashboard/pages/PatientFilePage";
import TherapyRoomSessionPage from "../features/therapy-rooms/TherapyRoomSessionPage";
import PreSessionBreathingPage from "../features/therapy-rooms/PreSessionBreathingPage";

// ── Other Features ───────────────────────────────────────────────────────
import NurseDashboard from "../features/nurse/NurseDashboard";

// ── Pharmacy Features ────────────────────────────────────────────────────
import DashboardPage from "../features/pharmacy/dashboard/DashboardPage";
import InventoryPage from "../features/pharmacy/dashboard/InventoryPage";
import OffersPage from "../features/pharmacy/dashboard/OffersPage";
import OrdersPage from "../features/pharmacy/dashboard/OrdersPage";
import PrescriptionPage from "../features/pharmacy/dashboard/PrescriptionPage";
import BasicInfoPage from "../features/pharmacy/onboarding/BasicInfo";
import CredentialsPage from "../features/pharmacy/onboarding/Credentials";
import LocationPage from "../features/pharmacy/onboarding/Location";
import DeliveryPage from "../features/pharmacy/onboarding/Delivery";
import PaymentPage from "../features/pharmacy/onboarding/Payment";
import VerificationPage from "../features/pharmacy/onboarding/Verification";

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
          { path: "digital-twin/setup", element: <DigitalTwinSetup /> },
          { path: "therapy-groups", element: <TherapyGroupsPage /> },
          { path: "profile", element: <PatientProfilePage /> },
        ],
      },
      {
        path: "/dashboard/patient/therapy-room/:roomCode",
        element: <PreSessionBreathingPage />,
      },
      {
        path: "/dashboard/patient/therapy-room-session/:roomCode",
        element: <TherapyRoomSessionPage />,
      },
    ],
  },

  // ── Protected: Doctor ────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRole="doctor" />,
    children: [
      {
        path: "/dashboard/doctor/onboarding",
        element: <DoctorOnboardingPage />,
      },
      {
        path: "/dashboard/doctor",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DoctorDashboard /> },
          { path: 'clinic', element: <MyClinicPage /> },
          { path: 'appointments', element: <DoctorAppointmentsPage /> },
          { path: 'sessions', element: <MySessionsPage /> },
          { path: 'sessions/:apptId', element: <SessionPage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'patients', element: <PatientsPage /> },
          { path: 'patients/:patientId', element: <PatientFilePage /> },
          { path: 'profile', element: <DoctorCompleteProfilePage /> },
          { path: 'therapy-rooms', element: <DoctorTherapyRoomsPage /> },
        ]
      },
      {
        path: "/dashboard/doctor/therapy-room/:roomCode",
        element: <PreSessionBreathingPage />,
      },
      {
        path: "/dashboard/doctor/therapy-room-session/:roomCode",
        element: <TherapyRoomSessionPage />,
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
        element: <BasicInfoPage />,
      },
      {
        path: "/dashboard/pharmacy/basic-info",
        element: <BasicInfoPage />,
      },
      {
        path: "/dashboard/pharmacy/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/dashboard/pharmacy/credentials",
        element: <CredentialsPage />,
      },
      {
        path: "/dashboard/pharmacy/location",
        element: <LocationPage />,
      },
      {
        path: "/dashboard/pharmacy/delivery",
        element: <DeliveryPage />,
      },
      {
        path: "/dashboard/pharmacy/payment",
        element: <PaymentPage />,
      },
      {
        path: "/dashboard/pharmacy/verification",
        element: <VerificationPage />,
      },
      {
        path: "/dashboard/pharmacy/orders",
        element: <OrdersPage />,
      },
      {
        path: "/dashboard/pharmacy/inventory",
        element: <InventoryPage />,
      },
      {
        path: "/dashboard/pharmacy/prescription",
        element: <PrescriptionPage />,
      },
      {
        path: "/dashboard/pharmacy/offers",
        element: <OffersPage />,
      },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}