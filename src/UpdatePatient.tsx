import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "./Loader";
import FhirApi from "./services/FhirApi";
import { Alert, Button, Col, Form, FormGroup, Row } from "react-bootstrap";

// TODO: figure out how to provide value to Gender Select element, whilst defaulting it to a blank entry if the source patient doesn't have gender

const UpdatePatient = ({fhirApi}: {fhirApi: FhirApi}) => {

    let { id } = useParams();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [patientLoaded, setPatientLoaded] = useState(false);
    const [patientDeleted, setPatientDeleted] = useState(false);
    const [patientUpdated, setPatientUpdated] = useState(false);
    const [patient, setPatient] = useState({
        id: "",
        givenName: "",
        middleNames: "",
        familyName: "",
        gender: "",
        phoneNumber: "",
        birthDate: ""
    });


    

    useEffect(() => {
        if (!id) return;

        setIsLoading(true);
        fhirApi.getResourceById('Patient', id as string)
        .then(response => {

            response.json()
                .then(resource => {

                    setPatientLoaded(true);
                    setIsLoading(false);
                    setPatient({
                        id: resource?.id,
                        givenName: resource?.name?.at(0)?.given?.at(0)?.toString() || '', 
                        middleNames: resource?.name?.at(0)?.given?.slice(1).join(' ') || '', 
                        familyName: resource?.name?.at(0)?.family?.toString() || '', 
                        gender: resource?.gender?.toString() || '', 
                        phoneNumber: resource?.telecom?.filter((x: any) => x.system === 'phone')?.at(0)?.value || '',
                        birthDate: resource?.birthDate?.toString() || ''
                    });
                })


        })
        .catch(error => {
            setIsLoading(false);
            setError(error instanceof Error ? error.message : '');
        });
      }, [id]);

const handleInput = (event: any) => {
    event.preventDefault();
    const { name, value } = event.target;
    setPatient({ ...patient, [name]: value });
}

const handleDelete = async () => {
    try {
        setIsLoading(true);
        setPatientUpdated(false);

        const response = await fhirApi.deleteResource('Patient', id as string);

        if (response.ok) {
            await response.json();
            setPatientDeleted(true);
            setPatient({ id: "", givenName: "", middleNames: "", familyName: "", gender: "", phoneNumber: "", birthDate: ""});
        } else {
            throw Error(`Request failed: ${response.status} ${response.statusText}`);
        }

    } catch (error) {
        setError(error instanceof Error ? error.message : '');
    } finally{
        setIsLoading(false);
    }
}

const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    try {
        setIsLoading(true);
        setPatientUpdated(false);

        const response = await fhirApi.putResource('Patient', id as string, patient);

        if (response.ok) {

            await response.json();
            setPatientUpdated(true);
        } else {
            throw Error(`Request failed: ${response.status} ${response.statusText}`);
        }

    } catch (error) {
        console.log(error);
        setError(error instanceof Error ? error.message : '');
    } finally{
        setIsLoading(false);
    }
}

return (
    <div className='Patient-form'>
        <div className='heading'>
            <h4 className="my-3">Update Patient</h4>
        </div>
        {patientLoaded &&
        <Form className="mt-5" onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-3" controlId="patientName">
                <Form.Label column sm={3} className="my-3">First Name</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control className="col-md-6" type="text" name="givenName" placeholder="Enter patient's first name" value={patient.givenName} onChange={handleInput} required />
                </Col>
                <Form.Label column sm={3} className="my-3">Middle Name(s)</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control className="col-md-6" type="text" name="middleNames" placeholder="Enter patient's middle name(s), seperated by a comma" value={patient.middleNames} onChange={handleInput} />
                </Col>
                <Form.Label column sm={3} className="my-3">Last Name</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control type="text" name="familyName" placeholder="Enter patient's last name" value={patient.familyName} required onChange={handleInput} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="patientPhone">
                <Form.Label column sm={3} className="my-3">Phone number</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control className="col-md-6" type="tel" name="phoneNumber" pattern="[0-9]{10,14}" value={patient.phoneNumber} placeholder="Enter patient's phone number" onChange={handleInput} required />
                </Col>
            </Form.Group>
            <Form.Group  as={Row} className="mb-3" controlId="formGender">
                <Form.Label column sm={3} className="my-3">Gender</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control
                        as="select"
                        name="gender"
                        value={patient.gender}
                        onChange={handleInput}
                        required
                        >
                        <option value="unknown">Unknown</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </Form.Control>
                </Col>
            </Form.Group>
            <Form.Group  as={Row} className="mb-3" controlId="formDateOfBirth">
                <Form.Label column sm={3} className="my-3">Date of Birth</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control type="date" name="birthDate" value={patient.birthDate} max={new Date().toISOString().slice(0, 10)} required onChange={handleInput} />
                </Col>
            </Form.Group>
            <FormGroup role="form">
                <Button className="btn btn-primary btn-large centerButton mx-3" type="submit" disabled={patientDeleted}>Update</Button>
                <Button className="btn btn-secondary btn-large centerButton mx-3" onClick={() => handleDelete()} disabled={patientDeleted}>Delete</Button>
            </FormGroup>
        </Form>}
        {patientDeleted && 
            <Alert variant="success" className="p-2 my-5">
                <Alert.Heading>Patient deleted</Alert.Heading>
            </Alert>}
        {patientUpdated && 
        <Alert variant="success" className="p-2 my-5">
            <Alert.Heading>Patient updated</Alert.Heading>
        </Alert>}
        {isLoading && <Loader />}
        {error && 
            <Alert variant="danger" className="p-2 my-5">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>}
    </div>
)
};
export default UpdatePatient;