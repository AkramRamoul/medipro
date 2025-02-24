import { NavLink } from "react-router-dom";

function Patient() {
  return (
    <div>
      Patients
      <NavLink to="/prescriptions">Patient 1</NavLink>
    </div>
  );
}

export default Patient;
