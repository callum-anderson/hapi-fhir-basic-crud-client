import React, { useState } from 'react'
import {useNavigate } from "react-router-dom";
import Loader from './Loader';
import FhirApi from './services/FhirApi';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Alert, Col, FormControl, FormGroup, Row } from 'react-bootstrap';

const CreatePatient = ({fhirApi}: {fhirApi: FhirApi}) => {
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [patient, setPatient] = useState({
        givenName: "",
        middleNames: "",
        familyName: "",
        gender: "",
        phoneNumber: "",
        birthDate: ""
    })

    const handleInput = (event: any) => {
        event.preventDefault();
        const { name, value } = event.target;
        setPatient({ ...patient, [name]: value });
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        try {
            setIsLoading(true);

            const response = await fhirApi.postResource('Patient', patient);

            if (response.ok) {
                const resource = await response.json();

                navigate(`/patient/${resource.id}`);
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
                <h4 className="my-3">Create Patient</h4>
            </div>
            <Form className="mt-5" onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-3" controlId="patientName">
                <Form.Label column sm={3} className="my-3">First Name</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control className="col-md-6" type="text" name="givenName" placeholder="Enter patient's first name" onChange={handleInput} required />
                </Col>
                <Form.Label column sm={3} className="my-3">Middle Name(s)</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control className="col-md-6" type="text" name="middleNames" placeholder="Enter patient's middle name(s), seperated by a comma" onChange={handleInput} />
                </Col>
                <Form.Label column sm={3} className="my-3">Last Name</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control type="text" name="familyName" placeholder="Enter patient's last name" required onChange={handleInput} />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="patientPhone">
                <Form.Label column sm={3} className="my-3">Phone number</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control className="col-md-6" type="tel" name="phoneNumber" pattern="[0-9]{10,14}" placeholder="Enter patient's phone number" onChange={handleInput} required />
                </Col>
            </Form.Group>
            <Form.Group  as={Row} className="mb-3" controlId="formGender">
                <Form.Label column sm={3} className="my-3">Gender</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control
                        as="select"
                        name="gender"
                        defaultValue={"blank"}
                        onChange={handleInput}
                    
                        >
                        <option disabled value="blank">Select a gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                    </Form.Control>
                </Col>
            </Form.Group>
            <Form.Group  as={Row} className="mb-3" controlId="formDateOfBirth">
                <Form.Label column sm={3} className="my-3">Date of Birth</Form.Label>
                <Col sm={9} className="my-3">
                    <Form.Control type="date" name="birthDate" max={new Date().toISOString().slice(0, 10)} required onChange={handleInput} />
                </Col>
            </Form.Group>
            <FormGroup role="form">
                <Button className="btn btn-primary btn-large centerButton" type="submit">Create</Button>
            </FormGroup>
        </Form>
        {isLoading && <Loader />}
        {error && 
            <Alert variant="danger" className="p-2 my-5">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>}
        </div>
    )
}

export default CreatePatient