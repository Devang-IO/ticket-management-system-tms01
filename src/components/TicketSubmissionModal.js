import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../utils/supabase"; // Import Supabase client
import "../styles/global.css";

const TicketSubmissionModal = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true); // Disable the submit button to prevent multiple submissions
    const toastId = "ticket-submit-toast";

    try {
      // Upload image to Supabase Storage (if provided)
      let imageUrl = null;
      if (data.image && data.image[0]) {
        const file = data.image[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("ticket-images") // Replace with your Supabase bucket name
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
          .from("ticket-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // Insert ticket data into Supabase
      const { error: insertError } = await supabase.from("tickets").insert([
        {
          name: data.name,
          email: data.email,
          category: data.category,
          priority: data.priority,
          title: data.title,
          description: data.description,
          image_url: imageUrl, // Store the image URL if available
          status: "open", // Default status for new tickets
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      // Show success toast
      if (!toast.isActive(toastId)) {
        toast.success("Ticket submitted successfully!", {
          position: "top-center",
          autoClose: 3000,
          toastId,
          hideProgressBar: true,
        });
      }

      // Close the modal and navigate to the dashboard
      setTimeout(() => {
        onClose();
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error("Failed to submit ticket. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        toastId,
        hideProgressBar: true,
      });
    } finally {
      setIsSubmitting(false); // Re-enable the submit button
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose ? onClose : () => {}}>
          ×
        </button>
        <h2 className="modal-title">Submit a Ticket</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          {/* Name Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              placeholder="Enter your name"
              type="text"
              className="form-input"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              placeholder="Enter your email"
              type="email"
              className="form-input"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email",
                },
              })}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          {/* Category Select */}
          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Issue Category
            </label>
            <select
              id="category"
              className="form-select"
              {...register("category", { required: "Issue category is required" })}
            >
              <option value="">Select a category</option>
              <option value="technical">Technical</option>
              <option value="system_crash">System Crash</option>
              <option value="software_bug">Software Bug</option>
              <option value="connectivity_issue">Connectivity Issue</option>
              <option value="billing">Billing</option>
              <option value="data_loss">Data Loss</option>
              <option value="security">Security</option>
              <option value="general">General</option>
            </select>
            {errors.category && <p className="error-message">{errors.category.message}</p>}
          </div>

          {/* Priority Select */}
          <div className="form-group">
            <label className="form-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              className="form-select"
              {...register("priority", { required: "Priority is required" })}
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            {errors.priority && <p className="error-message">{errors.priority.message}</p>}
          </div>

          {/* Title Textarea */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="title">
              Title
            </label>
            <textarea
              id="title"
              placeholder="Enter a brief title for the issue"
              className="form-textarea"
              {...register("title", { required: "Title is required" })}
            ></textarea>
            {errors.title && <p className="error-message">{errors.title.message}</p>}
          </div>

          {/* Description Textarea */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe your issue in detail..."
              className="form-textarea"
              {...register("description", { required: "Description is required" })}
            ></textarea>
            {errors.description && <p className="error-message">{errors.description.message}</p>}
          </div>

          {/* Image Upload */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="image">
              Upload Image (optional)
            </label>
            <label htmlFor="image" className="dropzone block">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              ) : (
                <p className="dropzone-text">Drag & drop an image here, or click to select one.</p>
              )}
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="form-input-file hidden"
              {...register("image")}
              onChange={handleImageChange}
            />
          </div>

          {/* Submit Button */}
          <div className="form-group full-width">
            <button type="submit" className="form-button" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default TicketSubmissionModal;