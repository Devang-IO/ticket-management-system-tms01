import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import Navbar from "../components/Navbar";
import { FaThumbsUp, FaMedal, FaClock, FaTasks, FaCheckCircle, FaUserCheck } from "react-icons/fa";

const CSRdashboard = () => {
  const ticketData = [
    { time: "09:00", new: 12, closed: 8 },
    { time: "10:00", new: 25, closed: 20 },
    { time: "11:00", new: 30, closed: 25 },
    { time: "12:00", new: 10, closed: 5 },
    { time: "13:00", new: 12, closed: 8 },
    { time: "14:00", new: 15, closed: 10 },
    { time: "15:00", new: 20, closed: 12 },
    { time: "16:00", new: 25, closed: 18 },
    { time: "17:00", new: 30, closed: 22 },
    { time: "18:00", new: 35, closed: 30 },
  ];

  const ticketSummary = [
    {
      section: "Live Tickets",
      items: [
        { label: "Open Tickets", value: "23", color: "bg-[#3B6790]", icon: <FaTasks /> },
        { label: "Unassigned", value: "16", color: "bg-[#23486A]", icon: <FaClock /> },
      ],
    },
    {
      section: "Response Time Today",
      items: [
        { label: "First Response Time", value: "9m", color: "bg-[#4C7B8B]", icon: <FaClock /> },
        { label: "SLA Compliance", value: "85%", color: "bg-[#3B6790]", icon: <FaCheckCircle /> },
      ],
    },
    {
      section: "CSAT Today",
      items: [
        { label: "CSAT", value: "89%", color: "bg-[#EFB036]", icon: <FaCheckCircle /> },
      ],
    },
    {
      section: "Agent Workload",
      items: [
        { label: "Tickets Assigned", value: "120", color: "bg-[#23486A]", icon: <FaUserCheck /> },
      ],
    },
  ];

  const topSolvers = [
    { name: "Reece Martin", role: "Support Agent", tickets: 37 },
    { name: "Robyn Mers", role: "Customer Support", tickets: 34 },
    { name: "Julia Smith", role: "Tech Support", tickets: 27 },
    { name: "Michael Lee", role: "IT Support", tickets: 25 },

  ];


  return (
    <div className="w-full min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <div className="pt-20 px-4 lg:px-8 mx-auto w-full max-w-[100vw] overflow-hidden">

        {/* Ticket Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn ">
          {ticketSummary.map((section, index) => (
            <div key={index} className={'p-4 rounded-xl shadow-md text-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 text-white'}>
              <h2 className="text-lg font-semibold text-gray-300 mb-2 ">{section.section}</h2>
              <div className="grid gap-3">
                {section.items.map((item, i) => (
                  <div key={i} className={`p-4 rounded-lg shadow ${item.color} flex items-center justify-center gap-3`}>
                    <span className="text-white text-xl">{item.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{item.value}</h2>
                      <p className="text-sm">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Top Solvers  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 w-full animate-fadeIn">

          {/* Ticket Chart */}
          <div className=" col-span-2 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-6 rounded-xl shadow-md w-full h-[500px] relative overflow-hidden">
            <h3 className="text-xl font-semibold mb-4">New Tickets vs Closed</h3>
            <div className="p-4  rounded-lg">
              <ResponsiveContainer width="100%" height={350} >
                <LineChart data={ticketData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }} >
                  <XAxis dataKey="time" stroke="#ccc">
                    <Label value="Time of the Day" offset={-20} position="insideBottom" />
                  </XAxis>
                  <YAxis >
                    <Label value="Number of Tickets" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" />
                  <Line type="monotone" dataKey="new" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} name="New Tickets" />
                  <Line type="monotone" dataKey="closed" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} name="Closed Tickets" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Ticket Solvers  */}
          <div className=" col-span-1 h-[500px] bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-6 rounded-xl shadow-md w-full">
            <h3 className="text-xl font-semibold mb-4">Top Ticket Solvers</h3>
            <div className="space-y-3">
              {topSolvers.map((solver, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg shadow">
                  <div className="bg-yellow-500 p-2 rounded-full">
                    <FaMedal className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="text-white">{solver.name}</h4>
                    <p className="text-gray-400 text-sm">{solver.role}</p>
                    <p className="text-blue-400">{solver.tickets} tickets solved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Customer Feedback & Agent Status  */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 w-full animate-fadeIn">

          {/* Customer Feedback */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-6 rounded-xl shadow-md w-full">
            <h3 className="text-xl font-semibold mb-4">Customer Feedback</h3>
            <div className="space-y-3">
              {[
                { message: "Thanks for exchanging my item so promptly", time: "an hour ago" },
                { message: "Super fast resolution, thank you!", time: "an hour ago" },
                { message: "Great service as always", time: "3 hours ago" },
                { message: "Helpful and efficient. Great service!", time: "4 hours ago" },
                { message: "Fast and efficient, thanks.", time: "2 days ago" },
              ].map((feedback, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg shadow">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <FaThumbsUp className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-white">{feedback.message}</p>
                    <p className="text-gray-400 text-sm">{feedback.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Status */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 p-4 rounded-xl shadow-lg">
            <h2 className="text-white text-xl font-semibold mb-4">Agent Status</h2>

            {/* Table Headers */}
            <div className="flex justify-between text-gray-300 px-4 py-2 border-b border-gray-600">
              <span className="font-semibold">Agent</span>
              <span className="font-semibold">Status</span>
            </div>

            {/* Agent List */}
            <div className="space-y-2 mt-2">
              {[
                { name: "Ash Monk", status: "Offline" },
                { name: "Danica Johnson", status: "Away" },
                { name: "Ebenezer Grey", status: "Taking call" },
                { name: "Frank Massey", status: "Online" },
                { name: "Robyn Mers", status: "Away" },
              ].map((agent, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-[#2D3E50] text-white px-4 py-3 rounded-lg"
                >
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-gray-300">{agent.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CSRdashboard;
