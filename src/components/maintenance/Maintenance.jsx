import React from "react";
import { useApp } from "../../context/AppContext";
import { useForm } from "../../hooks/useForm";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { formatDate } from "../../utils/format";

const Maintenance = () => {
  const { state, dispatch } = useApp();
  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(
    {
      property: "",
      issue: "",
      assignedTo: "",
      photo: null,
    },
    {
      property: { required: true },
      issue: { required: true, minLength: 10 },
      assignedTo: { required: false },
    }
  );

  const requests = state.maintenance.length > 0 ? state.maintenance : [
    {
      id: 1,
      property: "Glandore Complex",
      issue: "Boiler not working",
      status: "Resolved",
      date: "2025-02-12",
      photo: null,
      assignedTo: "John the Plumber",
    },
    {
      id: 2,
      property: "Middle House",
      issue: "Leaking tap",
      status: "Pending",
      date: "2025-04-02",
      photo: null,
      assignedTo: null,
    },
  ];

  const onSubmit = (formData) => {
    const newEntry = {
      ...formData,
      id: requests.length + 1,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };
    dispatch({ type: "ADD_MAINTENANCE", payload: newEntry });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Maintenance Requests</h2>

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Property"
            name="property"
            value={values.property}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.property}
          />
          <Input
            label="Issue"
            name="issue"
            value={values.issue}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.issue}
            as="textarea"
          />
          <Input
            label="Assign to"
            name="assignedTo"
            value={values.assignedTo}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.assignedTo}
          />
          <Input
            label="Upload Photo"
            name="photo"
            type="file"
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.photo}
          />
          <Button type="submit">Submit Request</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{req.property}</h3>
                <p className="text-gray-600">{req.issue}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  req.status === "Resolved"
                    ? "bg-green-100 text-green-800"
                    : req.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {req.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Date: {formatDate(req.date)}</p>
              <p>Assigned to: {req.assignedTo || "Unassigned"}</p>
            </div>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="small">
                Update Status
              </Button>
              <Button variant="outline" size="small">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Maintenance; 