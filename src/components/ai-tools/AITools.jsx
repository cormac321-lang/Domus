import React from "react";
import { useApp } from "../../context/AppContext";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";

const templates = {
  arrears: `Dear [Tenant Name],\n\nThis is a notice that your rent is overdue. Please arrange payment within the next 7 days to avoid RTB action.\n\nRegards,\n[Landlord Name]`,
  complaint: `Dear [Tenant Name],\n\nWe've received a complaint regarding [Issue]. Please respond or address this within 3 days.\n\nSincerely,\n[Landlord Name]`,
  lease: `Dear [Tenant Name],\n\nPlease find enclosed your lease renewal terms. Let us know if you have any questions.\n\nBest,\n[Landlord Name]`,
};

const AITools = () => {
  const { state, dispatch } = useApp();
  const [selected, setSelected] = React.useState("arrears");
  const [output, setOutput] = React.useState(templates["arrears"]);
  const [variables, setVariables] = React.useState({});

  const handleSelect = (e) => {
    const key = e.target.value;
    setSelected(key);
    setOutput(templates[key]);
    setVariables({});
  };

  const handleVariableChange = (e) => {
    const { name, value } = e.target;
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const replaceVariables = (text) => {
    return text.replace(/\[(.*?)\]/g, (match, key) => variables[key] || match);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replaceVariables(output));
    alert("Message copied to clipboard!");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">AI Tools & Templates</h2>

      <Card className="mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Select Template</label>
            <select
              value={selected}
              onChange={handleSelect}
              className="border p-2 rounded w-full"
            >
              <option value="arrears">Rent Arrears Notice</option>
              <option value="complaint">Tenant Complaint</option>
              <option value="lease">Lease Renewal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Template Variables</label>
            <div className="space-y-2">
              {Object.keys(templates[selected].match(/\[(.*?)\]/g) || []).map((match) => {
                const key = match.slice(1, -1);
                return (
                  <Input
                    key={key}
                    label={key}
                    name={key}
                    value={variables[key] || ""}
                    onChange={handleVariableChange}
                    placeholder={`Enter ${key}`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Generated Message</label>
            <textarea
              rows="10"
              value={replaceVariables(output)}
              onChange={(e) => setOutput(e.target.value)}
              className="border w-full p-2 rounded font-mono"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleCopy}>Copy to Clipboard</Button>
            <Button variant="outline">Save as Template</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AITools; 