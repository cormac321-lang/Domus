import React from "react";
import { useApp } from "../../context/AppContext";
import { useForm } from "../../hooks/useForm";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { formatDate } from "../../utils/format";

const Calendar = () => {
  const { state, dispatch } = useApp();
  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(
    {
      title: "",
      date: "",
      type: "Reminder",
    },
    {
      title: { required: true },
      date: { required: true, date: true },
      type: { required: true },
    }
  );

  const events = state.calendar.length > 0 ? state.calendar : [
    {
      id: 1,
      title: "Annual Inspection – Glandore Complex",
      date: "2025-06-15",
      type: "Inspection",
    },
    {
      id: 2,
      title: "Tenant Viewing – Middle House",
      date: "2025-06-20",
      type: "Viewing",
    },
    {
      id: 3,
      title: "Property Tax Reminder",
      date: "2025-07-01",
      type: "Reminder",
    },
  ];

  const onSubmit = (formData) => {
    const newEvent = {
      ...formData,
      id: events.length + 1,
    };
    dispatch({ type: "ADD_CALENDAR", payload: newEvent });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "Inspection":
        return "bg-blue-100 text-blue-800";
      case "Viewing":
        return "bg-green-100 text-green-800";
      case "Reminder":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Calendar & Reminders</h2>

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Event Title"
            name="title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.title}
          />
          <Input
            label="Date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.date}
          />
          <div>
            <label className="block text-sm font-semibold mb-1">Type</label>
            <select
              name="type"
              value={values.type}
              onChange={handleChange}
              onBlur={handleBlur}
              className="border p-2 rounded w-full"
            >
              <option>Reminder</option>
              <option>Inspection</option>
              <option>Viewing</option>
            </select>
          </div>
          <Button type="submit">Add Event</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  Date: {formatDate(event.date)}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm ${getEventTypeColor(
                  event.type
                )}`}
              >
                {event.type}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="small">
                Edit
              </Button>
              <Button variant="outline" size="small">
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 