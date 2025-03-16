import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { supabase } from "../utils/supabase";

const RatingModal = ({ show, onClose, employeeId, ticketId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [experience, setExperience] = useState("");

  if (!show) return null;

  const handleSubmit = async () => {
    // Insert rating into employee_ratings table
    const { error } = await supabase.from("employee_ratings").insert([
      {
        employee_id: employeeId,
        ticket_id: ticketId,
        rating,
        experience_text: experience,
      },
    ]);

    if (error) {
      console.error("Error submitting rating:", error);
      alert("There was an error submitting your rating.");
    } else {
      alert("Thank you for your feedback!");
      // Clear state and close modal
      setRating(0);
      setExperience("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Your ticket has been closed</h2>
        <p className="mb-4">How was your experience?</p>
        <div className="flex mb-4">
          {[...Array(5)].map((star, index) => {
            const ratingValue = index + 1;
            return (
              <label key={ratingValue}>
                <input
                  type="radio"
                  name="rating"
                  className="hidden"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                />
                <FaStar
                  size={30}
                  className="cursor-pointer"
                  color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            );
          })}
        </div>
        <textarea
          placeholder="How was your experience?"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          rows="3"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
