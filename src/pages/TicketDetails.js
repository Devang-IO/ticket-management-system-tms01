import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


const mockTickets = [
  { id: "1", title: "Issue 1", status: "Open", priority: "High", createdBy: "John", createdAt: "2025-02-24" },
  { id: "2", title: "Issue 2", status: "Closed", priority: "Medium", createdBy: "Emma", createdAt: "2025-02-23" },
  { id: "3", title: "Issue 3", status: "Pending", priority: "Low", createdBy: "Liam", createdAt: "2025-02-22" },
  { id: "4", title: "Issue 4", status: "Resolved", priority: "High", createdBy: "Sophia", createdAt: "2025-02-21" },
  { id: "5", title: "Issue 5", status: "Open", priority: "Medium", createdBy: "John", createdAt: "2025-02-20" }
];


const TicketDetails = () => {
  const { id } = useParams(); // Get ticket ID from URL
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    // Simulating fetching ticket from mock data
    const foundTicket = mockTickets.find((t) => t.id === id);
    setTicket(foundTicket);
  }, [id]);

  if (!ticket) return <p className="text-center text-red-500 font-bold">Ticket not found</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ticket Details</h1>
      <div className="border rounded-lg p-4 shadow-md">
        <p><strong>ID:</strong> {ticket.id}</p>
        <p><strong>Title:</strong> {ticket.title}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Priority:</strong> {ticket.priority}</p>
        <p><strong>Created By:</strong> {ticket.createdBy}</p>
        <p><strong>Created At:</strong> {ticket.createdAt}</p>
      </div>
    </div>
  );
};

export default TicketDetails;
