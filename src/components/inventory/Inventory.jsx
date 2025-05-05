import React from "react";
import { useApp } from "../../context/AppContext";
import { useForm } from "../../hooks/useForm";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";

const Inventory = () => {
  const { state, dispatch } = useApp();
  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(
    {
      room: "",
      condition: "Good",
      notes: "",
      photo: null,
    },
    {
      room: { required: true },
      condition: { required: true },
      notes: { required: false },
    }
  );

  const inventory = state.inventory.length > 0 ? state.inventory : [
    {
      id: 1,
      room: "Living Room",
      condition: "Good",
      notes: "Clean and no damage.",
      photo: null,
    },
    {
      id: 2,
      room: "Bedroom 1",
      condition: "Fair",
      notes: "Minor chip on wardrobe door.",
      photo: null,
    },
  ];

  const onSubmit = (formData) => {
    const entry = {
      ...formData,
      id: inventory.length + 1,
    };
    dispatch({ type: "ADD_INVENTORY", payload: entry });
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "Good":
        return "bg-green-100 text-green-800";
      case "Fair":
        return "bg-yellow-100 text-yellow-800";
      case "Damaged":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Inventory & Condition Report</h2>

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Room"
            name="room"
            value={values.room}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.room}
          />
          <div>
            <label className="block text-sm font-semibold mb-1">Condition</label>
            <select
              name="condition"
              value={values.condition}
              onChange={handleChange}
              onBlur={handleBlur}
              className="border p-2 rounded w-full"
            >
              <option>Good</option>
              <option>Fair</option>
              <option>Damaged</option>
            </select>
          </div>
          <Input
            label="Notes"
            name="notes"
            value={values.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.notes}
            as="textarea"
          />
          <Input
            label="Upload Photo"
            name="photo"
            type="file"
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.photo}
          />
          <Button type="submit">Add Entry</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {inventory.map((item) => (
          <Card key={item.id} className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{item.room}</h3>
                <p className="text-sm text-gray-600">{item.notes}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm ${getConditionColor(
                  item.condition
                )}`}
              >
                {item.condition}
              </span>
            </div>
            {item.photo && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Photo uploaded</p>
              </div>
            )}
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="small">
                Edit
              </Button>
              <Button variant="outline" size="small">
                View Photo
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Inventory; 