import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./routes/Layout";
import Prescriptions from "./routes/Prescriptions";
import Settings from "./components/Settings/Settings";
import Home from "./routes/Home";
import MainPage from "./components/Patient/MainPage";
import { Toaster } from "sonner";
import DashboardPage from "./dashboard/Page";
import Page from "./routes/Consultations";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/consultations" element={<Page />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pat/:id" element={<MainPage />} />
          <Route path="/patients" element={<Home />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
