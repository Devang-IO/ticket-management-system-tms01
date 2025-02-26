import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/global.css";

const TicketSubmissionModal = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log(data);
    const toastId = "ticket-submit-toast";
  
    if (!toast.isActive(toastId)) {
      toast.success("Ticket submitted successfully!", {
        position: "top-center",
        autoClose: 3000,
        toastId,
        hideProgressBar:true,
      });
    }
  
    setTimeout(() => {
      onClose();  // Close the modal after submission
      navigate("/dashboard");
    }, 1000);
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

          {/* Description Textarea */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
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
            <button type="submit" className="form-button">
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default TicketSubmissionModal;
