import { useState } from "react";

const requests = [
  { id: "TKT123", name: "John Doe", status: "Pending", timestamp: "2025-03-13 10:30 AM" },
  { id: "TKT456", name: "Alice Smith", status: "Pending", timestamp: "2025-03-13 11:00 AM" },
  { id: "TKT789", name: "Michael Brown", status: "Pending", timestamp: "2025-03-13 12:00 PM" },
  { id: "TKT101", name: "Sarah Johnson", status: "Pending", timestamp: "2025-03-13 1:00 PM" },
  { id: "TKT202", name: "David Lee", status: "Pending", timestamp: "2025-03-13 2:30 PM" },
];

const UserRequest = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [requestList, setRequestList] = useState(requests);

  const handleAccept = (id) => {
    setRequestList(
      requestList.map((req) =>
        req.id === id ? { ...req, status: "Accepted" } : req
      )
    );
  };

  const handleDecline = (id) => {
    setRequestList(
      requestList.map((req) =>
        req.id === id ? { ...req, status: "Declined" } : req
      )
    );
  };

  const filteredRequests = requestList.filter(
    (req) =>
      (filter === "All" || req.status === filter) &&
      (req.name.toLowerCase().includes(search.toLowerCase()) ||
        req.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] flex justify-center items-center p-6 mt-16">
      <div className="w-full bg-white shadow-lg rounded-xl p-6 ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#3B6790]">User Requests</h2>
          <span className="bg-[#EFB036] text-white px-3 py-1 rounded-full text-sm">
            {filteredRequests.filter((req) => req.status === "Pending").length} Pending
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or Ticket ID"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#EFB036] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border px-4 py-2 rounded-md rounded-md focus:ring-2 focus:ring-[#EFB036] outline-none "
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-lg shadow border-l-4 flex justify-between items-center"
              style={{
                borderColor: req.status === "Accepted" ? "#4C7B8B" : req.status === "Declined" ? "#E74C3C" : "#EFB036",
              }}
            >
              <div>
                <p className="font-semibold text-[#23486A]">{req.name} requested a chat</p>
                <p className="text-sm text-gray-500">Ticket ID: {req.id}</p>
                <p className="text-xs text-gray-400">{req.timestamp}</p>
              </div>
              <div className="space-x-2">
                {req.status === "Pending" ? (
                  <>
                    <button
                      className="bg-[#4C7B8B] text-white px-3 py-1 rounded hover:bg-opacity-90"
                      onClick={() => handleAccept(req.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-opacity-90"
                      onClick={() => handleDecline(req.id)}
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded text-white text-sm ${
                      req.status === "Accepted" ? "bg-[#4C7B8B]" : "bg-[#E74C3C]"
                    }`}
                  >
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRequest;
