import React from "react";
import { useApp } from "../../context/AppContext";
import { useForm } from "../../hooks/useForm";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { formatDateTime } from "../../utils/format";

const Chat = () => {
  const { state, dispatch } = useApp();
  const { values, handleChange, handleSubmit } = useForm(
    {
      message: "",
    },
    {
      message: { required: true },
    }
  );

  const messages = state.chat.length > 0 ? state.chat : [
    { id: 1, sender: "Tenant", content: "Hi, can you fix the boiler?", timestamp: "2025-04-01T10:00:00" },
    { id: 2, sender: "Landlord", content: "Yes, I've scheduled a plumber for Friday.", timestamp: "2025-04-01T10:05:00" },
  ];

  const onSubmit = (formData) => {
    if (!formData.message.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      sender: "Landlord", // Future: dynamically use logged-in user
      content: formData.message,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CHAT", payload: newMsg });
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <h2 className="text-xl font-bold mb-4">Chat</h2>

      <Card className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded max-w-[70%] ${
              msg.sender === "Landlord"
                ? "bg-green-100 ml-auto text-right"
                : "bg-gray-100"
            }`}
          >
            <p className="text-sm font-semibold">{msg.sender}</p>
            <p>{msg.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateTime(msg.timestamp)}
            </p>
          </div>
        ))}
      </Card>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
          <Input
            name="message"
            value={values.message}
            onChange={handleChange}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </Card>
    </div>
  );
};

export default Chat; 