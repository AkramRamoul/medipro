import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./routes/Layout";
import Prescriptions from "./routes/Prescriptions";
import Settings from "./components/Settings/Settings";
import Home from "./routes/Home";
import MainPage from "./components/Patient/MainPage";
import { Toaster } from "sonner";
import DashboardPage from "./dashboard/Page";
import Page from "./routes/Consultations";
import { EnterPasswordScreen } from "./routes/EnterPasswordScreen";
import { AuthProvider } from "./context/auth-context";
import RequirePassword from "./lib/RequirePassword";
import { ThemeProvider } from "./components/theme-provider";
import { PrescriptionModelForm } from "./Prescriptionsettings/PrescriptionSetting";
import MainAppointmentPage from "./components/Appointment/MainAppointmentPage";
import { useEffect, useState } from "react";
import LicenseScreen from "./components/License/LicenseScreen";
import { Loader2 } from "lucide-react";
import GlobalShortcuts from "./hooks/use-navigate";
import ExpensesPage from "./expenses/Page";

function App() {
  const [licensed, setLicensed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.electronAPI.getAppInitData().then((data) => {
      if (data.isLicensed) setLicensed(true);
      setIsLoading(false);
    });
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 w-full h-screen">
        <Loader2 className="animate-spin text-muted-foreground w-6 h-6" />
      </div>
    );
  return licensed ? (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/enter-password" element={<EnterPasswordScreen />} />
            <Route
              path="/"
              element={
                <RequirePassword>
                  <Layout />
                </RequirePassword>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/consultations" element={<Page />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pat/:id" element={<MainPage />} />
              <Route
                path="/patients"
                element={<Home showAll={false} />}
              />
              <Route
                path="/all-patients"
                element={<Home showAll={true} />}
              />
              <Route path="/Ordonnance" element={<PrescriptionModelForm />} />
              <Route path="/appointments" element={<MainAppointmentPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
            </Route>
          </Routes>
          <GlobalShortcuts />
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  ) : (
    <LicenseScreen onSuccess={() => setLicensed(true)} />
  );
}

export default App;
