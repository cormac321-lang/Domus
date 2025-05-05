import React from "react";
import { useApp } from "../../context/AppContext";
import { useForm } from "../../hooks/useForm";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { formatCurrency } from "../../utils/format";

const Budget = () => {
  const { state, dispatch } = useApp();
  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(
    {
      year: new Date().getFullYear(),
      category: "",
      amount: "",
      notes: "",
    },
    {
      year: { required: true, number: true },
      category: { required: true },
      amount: { required: true, amount: true },
      notes: { required: false },
    }
  );

  const entries = state.budget.length > 0 ? state.budget : [
    {
      id: 1,
      year: 2025,
      category: "Painting",
      amount: 2000,
      notes: "Interior repaint of two units",
    },
    {
      id: 2,
      year: 2025,
      category: "Gardening",
      amount: 800,
      notes: "Spring cleanup and hedge trimming",
    },
  ];

  const onSubmit = (formData) => {
    const entry = {
      ...formData,
      id: entries.length + 1,
      amount: parseFloat(formData.amount),
    };
    dispatch({ type: "ADD_BUDGET", payload: entry });
  };

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Property Budget – {values.year}
      </h2>

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category"
            name="category"
            value={values.category}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.category}
          />
          <Input
            label="Amount (€)"
            name="amount"
            type="number"
            value={values.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.amount}
          />
          <Input
            label="Notes"
            name="notes"
            value={values.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.notes}
            as="textarea"
          />
          <Button type="submit">Add Budget Item</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Total Budget: {formatCurrency(total)}</h3>
          <Button variant="outline" size="small">
            Export Report
          </Button>
        </div>
        {entries.map((item) => (
          <div key={item.id} className="border-b pb-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{item.category}</p>
                <p className="text-sm text-gray-600">{item.notes}</p>
              </div>
              <p className="font-semibold text-green-700">
                {formatCurrency(item.amount)}
              </p>
            </div>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" size="small">
                Edit
              </Button>
              <Button variant="outline" size="small">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Budget; 