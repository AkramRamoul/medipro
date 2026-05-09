import { HashRouter as Router, Routes, Route, } from "react-router-dom";
import React, { Suspense, useEffect, useState } from "react";
import Layout from "./routes/Layout";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "./components/theme-provider";
import { Loader2 } from "lucide-react";
import GlobalShortcuts from "./hooks/use-navigate";
import api from "./axios";

function RoleBasedIndex() {
  return <DashboardPage />;
}

// Lazy load heavy route components
const Prescriptions = React.lazy(() => import("./routes/Prescriptions"));
const Settings = React.lazy(() => import("./components/Settings/Settings"));
const Today = React.lazy(() => import("./routes/Today"));
const Patients = React.lazy(() => import("./routes/Patients"));
const MainPage = React.lazy(() => import("./components/Patient/MainPage"));
const DashboardPage = React.lazy(() => import("./dashboard/Page"));
const Page = React.lazy(() => import("./routes/Consultations"));
const LoginPage = React.lazy(() => import("./routes/EnterPasswordScreen"));
const PrescriptionModelForm = React.lazy(() => import("./Prescriptionsettings/PrescriptionSetting").then(m => ({ default: m.PrescriptionModelForm })));
const MainAppointmentPage = React.lazy(() => import("./components/Appointment/MainAppointmentPage"));
const ExpensesPage = React.lazy(() => import("./expenses/Page"));
const DocumentsPage = React.lazy(() => import("./routes/Documents"));
const LicenseScreen = React.lazy(() => import("./components/License/LicenseScreen"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-10 w-full h-screen">
    <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
  </div>
);

function App() {
  const [licensed, setLicensed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordExists, setPasswordExists] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    api.get("/users/init").then(({ data }) => {
      if (data.isLicensed) setLicensed(true);
      if (data.passwordExists) {
        setPasswordExists(true);
      } else {
        setIsUnlocked(true);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error("App init failed:", err);
      // Fallback to licensed in case of connection error during migration
      setLicensed(true);
      setIsUnlocked(true); // fallback to unlocked on error
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingFallback />;

  if (licensed && passwordExists && !isUnlocked) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage onUnlock={() => setIsUnlocked(true)} />
        </Suspense>
        <Toaster position="top-center" />
      </ThemeProvider>
    );
  }

  return licensed ? (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<RoleBasedIndex />} />
                <Route path="/prescriptions" element={<Prescriptions />} />
                <Route path="/consultations" element={<Page />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pat/:id" element={<MainPage />} />
                <Route path="/patients" element={<Today />} />
                <Route path="/all-patients" element={<Patients />} />
                <Route path="/Ordonnance" element={<PrescriptionModelForm />} />
                <Route path="/appointments" element={<MainAppointmentPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
              </Route>
            </Routes>
          </Suspense>
          <GlobalShortcuts />
          <Toaster position="top-center" />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  ) : (
    <Suspense fallback={<LoadingFallback />}>
      <LicenseScreen onSuccess={() => setLicensed(true)} />
    </Suspense>
  );
}

export default App;

