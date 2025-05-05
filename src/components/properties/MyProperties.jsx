import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import Card from "../common/Card";
import Button from "../common/Button";
import { formatCurrency } from "../../utils/format";

const MyProperties = () => {
  const { state, dispatch } = useApp();
  const [selectedId, setSelectedId] = useState(null);

  const properties = state.properties.length > 0 ? state.properties : [
    {
      id: 1,
      name: "Middle House, Ringaskiddy",
      address: "Main Street, Ringaskiddy, Cork",
      type: "Commercial",
      image: "/images/middlehouse.jpg",
      rent: 180000,
      tenants: ["Veto"],
      rooms: [],
      maintenance: [],
    },
    {
      id: 2,
      name: "Glandore Complex",
      address: "Glandore, West Cork",
      type: "Residential Block",
      image: "/images/glandore.jpg",
      rent: 75000,
      tenants: ["Unit 1 - Aoife", "Unit 2 - Vacant", "Unit 3 - John"],
      rooms: [
        { name: "Unit 1", tenant: "Aoife", leaseEnd: "2025-12-01" },
        { name: "Unit 2", tenant: null, leaseEnd: null },
        { name: "Unit 3", tenant: "John", leaseEnd: "2025-09-15" },
      ],
      maintenance: [
        { date: "2025-02-12", issue: "Boiler not working", status: "Resolved" },
        { date: "2025-04-02", issue: "Leaking tap", status: "Pending" },
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Properties</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {properties.map((prop) => (
          <Card
            key={prop.id}
            className="cursor-pointer hover:bg-green-50 transition-colors"
            onClick={() => setSelectedId(selectedId === prop.id ? null : prop.id)}
          >
            <img
              src={prop.image}
              alt={prop.name}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{prop.name}</h3>
            <p className="text-sm text-gray-600">{prop.address}</p>
            <p className="text-sm">Type: {prop.type}</p>
            <p className="text-sm">Tenants: {prop.tenants.join(", ")}</p>

            {selectedId === prop.id && (
              <div className="mt-4 text-sm space-y-2">
                {prop.rooms.length > 0 && (
                  <>
                    <h4 className="font-bold">Rooms:</h4>
                    <ul className="list-disc ml-5">
                      {prop.rooms.map((room, idx) => (
                        <li key={idx}>
                          {room.name}: {room.tenant || "Vacant"} (Lease ends{" "}
                          {room.leaseEnd || "N/A"})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div>
                  <h4 className="font-bold mt-3">Finances:</h4>
                  <p>Annual Rent: {formatCurrency(prop.rent)}</p>
                </div>
                {prop.maintenance.length > 0 && (
                  <div>
                    <h4 className="font-bold mt-3">Maintenance History:</h4>
                    <ul className="list-disc ml-5">
                      {prop.maintenance.map((m, idx) => (
                        <li key={idx}>
                          {m.date}: {m.issue} ({m.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="small">
                    Edit Details
                  </Button>
                  <Button variant="outline" size="small">
                    View Reports
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyProperties; 