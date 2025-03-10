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

  const [imageFile, setImageFile] = useState(null); // Store the actual file
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Function to upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

    try {
      console.log("Uploading to Cloudinary...");
      console.log("Cloud name:", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary error details:", errorData);
        throw new Error(`Failed to upload image to Cloudinary: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Cloudinary upload successful:", data);
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast.error("Image upload failed. Submitting ticket without image.");
      return null;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = "ticket-submit-toast";

    try {
      let imageUrl = null;

      // Upload image to Cloudinary if a file was selected
      if (imageFile) {
        console.log("Image file detected, uploading to Cloudinary:", imageFile.name);
        imageUrl = await uploadImageToCloudinary(imageFile);
        console.log("Image uploaded to Cloudinary. URL:", imageUrl);
      } else {
        console.log("No image file to upload");
      }

      // Check if environment variables are properly set
      if (!process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || !process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET) {
        console.warn("Cloudinary environment variables are not properly set");
      }

      // Insert ticket data into Supabase
      const { data: ticketData, error: insertError } = await supabase
        .from("tickets")
        .insert([
          {
            name: data.name,
            email: data.email,
            category: data.category,
            priority: data.priority,
            title: data.title,
            description: data.description,
            image_url: imageUrl, // This will be null if no image or upload failed
            status: "open",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {
        console.error("Supabase insertion error:", insertError);
        throw insertError;
      }

      console.log("Ticket inserted into Supabase:", ticketData);

      toast.success("Ticket submitted successfully!", {
        position: "top-center",
        autoClose: 3000,
        toastId,
        hideProgressBar: true,
      });

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
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the actual file object
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      console.log("Image file selected:", file.name);
    } else {
      setImageFile(null);
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