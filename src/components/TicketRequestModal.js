import React, { useState } from "react";
import { supabase } from "../utils/supabase";
import { toast } from "react-toastify";

const TicketRequestModal = ({ show, onClose, ticket, onRequestSubmitted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleCloseTicket = async () => {
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Update ticket status to indicate closure requested (resolution notes removed)
      const { error } = await supabase
        .from("tickets")
        .update({
          status: "closure_requested",
          closed_by: user.id // Set the employee who is requesting to close the ticket
        })
        .eq("id", ticket.id);

      if (error) {
        toast.error("Error submitting request: " + error.message);
      } else {
        toast.success("Closure request submitted successfully");
        onRequestSubmitted(ticket.id, user.id);
        onClose(); // Close the modal after successful submission
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Request Ticket Closure</h2>
        
        <div className="mb-4">
          <p>You are requesting to close ticket: <strong>{ticket.title}</strong></p>
        </div>
        
        {/* Resolution notes input removed */}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            disabled={isSubmitting}
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={handleCloseTicket}
            className="px-4 py-2 bg-[#23486A] text-white rounded-md hover:bg-[#3B6790] transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Yes, Close Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketRequestModal;
