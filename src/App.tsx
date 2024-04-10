import './App.css';
import './services/FhirApi';
import FhirApi from './services/FhirApi';
import Container from 'react-bootstrap/Container';
import CreatePatient from "./CreatePatient";
import { Route, Routes } from "react-router-dom";
import UpdatePatient from "./UpdatePatient";
import GetPatients from "./GetPatients";
import Header from "./Header";

function App() {

  const fhirApi = new FhirApi();

  return (
    <div className="App">
      <Header />
      <Container>
          <Routes>
            <Route path="/" element={<div></div>} />
            <Route path="/patient/:id" element={<UpdatePatient fhirApi={fhirApi} />} />
            <Route path="/create-patient" element={<CreatePatient fhirApi={fhirApi} />} />
            <Route path="/get-patients" element={<GetPatients fhirApi={fhirApi} />} />
          </Routes>
      </Container>
    </div>
  );
}

export default App;
