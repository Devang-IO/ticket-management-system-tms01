import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { X } from "lucide-react";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function ProfileModal({ onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [ticketStats, setTicketStats] = useState({ open: 0, closed: 0, assigned: 0, recent: [] });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "", profile_picture: "" });

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) return setLoading(false);

      if (!userData?.user?.id) return setLoading(false);

      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, phone, role, profile_picture")
        .eq("id", userData.user.id)
        .single();

      if (!error && data) {
        setUser(data);
        setFormData(data);
        fetchTicketStats(data);
      }
      setLoading(false);
    }

    async function fetchTicketStats(userInfo) {
      let { data: tickets, error } = await supabase.from("tickets").select("id, status, assigned_to, created_by, updated_at");

      if (error || !tickets) return;

      let openTickets = 0, closedTickets = 0, assignedTickets = 0, recentActivity = [];

      if (userInfo.role === "Admin") {
        openTickets = tickets.filter(ticket => ticket.status === "open").length;
        closedTickets = tickets.filter(ticket => ticket.status === "closed").length;
        recentActivity = tickets.slice(-3);
      }

      if (userInfo.role === "Employee") {
        assignedTickets = tickets.filter(ticket => ticket.assigned_to === userInfo.id).length;
        closedTickets = tickets.filter(ticket => ticket.assigned_to === userInfo.id && ticket.status === "closed").length;
        recentActivity = tickets.filter(ticket => ticket.assigned_to === userInfo.id).slice(-3);
      }

      if (userInfo.role === "User") {
        openTickets = tickets.filter(ticket => ticket.created_by === userInfo.id && ticket.status === "open").length;
        closedTickets = tickets.filter(ticket => ticket.created_by === userInfo.id && ticket.status === "closed").length;
        recentActivity = tickets.filter(ticket => ticket.created_by === userInfo.id).slice(-3);
      }

      setTicketStats({ open: openTickets, closed: closedTickets, assigned: assignedTickets, recent: recentActivity });
    }

    fetchUserProfile();
  }, []);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => setEditing(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { error } = await supabase.from("users").update(formData).eq("id", user.id);
    if (!error) {
      setUser(formData);
      setEditing(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-600">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="p-8 w-full max-w-2xl bg-white rounded-xl shadow-lg text-center relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">
          <X size={24} />
        </button>
        
        <div className="h-24 bg-gradient-to-r from-yellow-500 to-blue-700 rounded-t-lg flex justify-center items-center" />
        <div className="-mt-12 flex flex-col items-center">
          <img
            src={user.profile_picture || "default-avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{user.name || "No Name"}</h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm mt-1">{user.role}</span>
          <p className="text-gray-600 mt-1">📧 {user.email}</p>
          <p className="text-gray-600">📞 {user.phone || "Not Provided"}</p>
          <button onClick={handleEdit} className="mt-3 bg-gray-600 text-white px-4 py-2 rounded">Edit Profile</button>
        </div>
        
        {/* Ticket Stats */}
        <div className="mt-6 border-t pt-4 text-left">
          <h3 className="text-lg font-semibold">Profile Details</h3>
          {user.role === "Admin" && (
            <div>
              <p className="text-gray-700">Total Tickets: {ticketStats.open + ticketStats.closed}</p>
              <p className="text-gray-700">Open Tickets: {ticketStats.open}</p>
              <p className="text-gray-700">Closed Tickets: {ticketStats.closed}</p>
            </div>
          )}
          {user.role === "Employee" && (
            <div>
              <p className="text-gray-700">Assigned Tickets: {ticketStats.assigned}</p>
              <p className="text-gray-700">Resolved in Last 7 Days: {ticketStats.closed}</p>
            </div>
          )}
          {user.role === "User" && (
            <div>
              <p className="text-gray-700">Open Tickets: {ticketStats.open}</p>
              <p className="text-gray-700">Closed Tickets: {ticketStats.closed}</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-6 text-left">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          {ticketStats.recent.length > 0 ? (
            <ul className="list-disc ml-5 text-gray-700">
              {ticketStats.recent.map(ticket => (
                <li key={ticket.id}>Ticket #{ticket.id} - {ticket.status} ({new Date(ticket.updated_at).toLocaleString()})</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
