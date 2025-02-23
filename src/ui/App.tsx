import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Patients from "./components/Patients";
import Consultations from "./components/Consultation";
import Prescriptions from "./components/Prescriptions";
import Settings from "./components/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Patients />} />
          <Route path="patients" element={<Patients />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
