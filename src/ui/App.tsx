import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./routes/Layout";
import NewPatient from "./routes/NewPatient";
import Prescriptions from "./routes/Prescriptions";
import Settings from "./routes/Settings";
import Home from "./routes/Home";
import MainPage from "./components/Patient/MainPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="newpatient" element={<NewPatient />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="/pat/:id" element={<MainPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
