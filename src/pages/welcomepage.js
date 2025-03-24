import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaComments, FaTicketAlt } from "react-icons/fa";
import { motion } from "framer-motion";

// Image paths
const images = {
  "ticket-list": "/ticketview.png",
  "ticket-view": "/ticketdetail.png",
  "dashboard": "/dashboard.png",
};

const WelcomePage = () => {
  // Default active tab
  const [activeTab, setActiveTab] = useState("ticket-list");
  
  // Typewriter effect states
  const [titleText, setTitleText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const fullTitleText = "Welcome to QuickAssist";
  const fullDescriptionText = "QuickAssist is a powerful helpdesk solution designed to simplify customer support. With a ticketing system, community forums, and an intuitive interface, we help businesses resolve issues faster and enhance customer satisfaction.";
  
  // Scroll-based animation state
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("none"); // "up", "down", or "none"
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef(null);
  const backgroundRef = useRef(null);

  // Typewriter effect for title
  useEffect(() => {
    if (titleText.length < fullTitleText.length) {
      const timeoutId = setTimeout(() => {
        setTitleText(fullTitleText.slice(0, titleText.length + 1));
      }, 100);
      return () => clearTimeout(timeoutId);
    } else if (descriptionText.length < fullDescriptionText.length) {
      const timeoutId = setTimeout(() => {
        setDescriptionText(fullDescriptionText.slice(0, descriptionText.length + 1));
      }, 30);
      return () => clearTimeout(timeoutId);
    }
  }, [titleText, descriptionText]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Detect if we're scrolling and in which direction
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setIsScrolling(true);
        
        if (currentScrollY > lastScrollY) {
          setScrollDirection("down");
        } else {
          setScrollDirection("up");
        }
        
        // Reset the timeout to detect when scrolling stops
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
          setScrollDirection("none");
        }, 300); // Wait 300ms after scrolling stops to revert the animation
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  // Setup the dot background
  const dots = [];
  const numDots = 1000;
  for (let i = 0; i < numDots; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 3 + 1;
    dots.push({ x, y, size });
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center bg-[#113946] text-white relative overflow-hidden"
      ref={backgroundRef}
    >
      {/* Animated background dots */}
      {dots.map((dot, index) => (
  <motion.div
  initial={{ y: 0 }}
  animate={
    isScrolling
      ? {
          y: scrollDirection === "down" ? 100 : -100, // Move all dots down/up
          transition: {
            duration: 0.5,
            ease: "easeOut",
          },
        }
      : {
          y: 0, // Reset when idle
          transition: { duration: 0.5, ease: "easeOut" },
        }
  }
  className="absolute w-full h-full"
>
  {dots.map((dot, index) => (
    <motion.div
      key={index}
      initial={{
        left: `${dot.x}%`,
        top: `${dot.y}%`,
        opacity: 0.2 + Math.random() * 0.3,
      }}
      animate={{
        opacity: [0.2, 0.5, 0.2], // Twinkling effect
        transition: {
          opacity: {
            duration: 1.5 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      }}
      className="absolute rounded-full bg-white"
      style={{
        width: `${dot.size}px`,
        height: `${dot.size}px`,
      }}
    />
  ))}
</motion.div>

))}


      {/* Content wrapper to ensure it's above the background dots */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Navbar */}
        <nav className="w-full flex justify-between items-center px-10 py-4 bg-[#EAD7BB] shadow-md">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="QuickAssist Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl font-extrabold tracking-wide text-[#113946]">
              QuickAssist
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full px-6 py-2 bg-[#113946] text-[#EAD7BB] font-semibold rounded-full hover:bg-[#BCA37F] transition duration-300">
                Login
              </button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full px-6 py-2 bg-[#113946] text-[#EAD7BB] font-semibold rounded-full hover:bg-[#BCA37F] transition duration-300">
                Signup
              </button>
            </Link>
          </div>
        </nav>

        {/* Welcome Section with Typewriter Animation */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className="mt-16 px-6 md:px-10 lg:px-20 py-10 bg-[#BCA37F] text-white rounded-xl shadow-lg max-w-4xl text-center"
        >
          <h2 className="text-4xl font-bold mb-4 text-[#113946] min-h-[48px]">
            {titleText}<span className="animate-pulse">|</span>
          </h2>
          <p className="text-lg opacity-90 text-[#113946] min-h-[120px]">
            {descriptionText}<span className={`animate-pulse ${descriptionText.length === fullDescriptionText.length ? 'hidden' : ''}`}>|</span>
          </p>
        </motion.div>

        {/* Feature Section with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-10 max-w-6xl">
          {[
            { icon: <FaUsers />, title: "How to use QuickAssist", desc: "Learn how to navigate and use QuickAssist effectively." },
            { icon: <FaComments />, title: "Community Forums", desc: "Ask questions and share your ideas with others!" },
            { icon: <FaTicketAlt />, title: "Ticket System", desc: "Solve issues faster with our easy-to-use ticketing system." }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.01, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#BCA37F] text-[#113946] p-6 rounded-3xl shadow-lg text-center transition-transform duration-300 cursor-pointer"
            >
              <div className="text-3xl text-[#113946] mx-auto mb-3">{item.icon}</div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Get Started Button Below Feature Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Link to="/register">
            <button className="px-8 py-3 bg-[#EAD7BB] text-[#113946] font-semibold rounded-full hover:bg-[#FFF2D8] transition duration-300 shadow-lg">
              Get Started
            </button>
          </Link>
        </motion.div>

        {/* Discover QuickAssist Section */}
        <div className="mt-16 w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-[#FFF2D8] text-center mb-6">
            Discover QuickAssist
          </h2>
          <div className="flex justify-center space-x-8 border-b-2 border-[#EAD7BB] pb-2">
            {Object.keys(images).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-gray-300 hover:text-[#FFF2D8] ${
                  activeTab === tab
                    ? "text-[#FFF2D8] font-semibold border-b-2 border-[#FFF2D8] pb-1"
                    : ""
                }`}
              >
                {tab.replace("-", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Image Container */}
        <div className="mt-8 bg-[#EAD7BB] p-4 rounded-3xl shadow-lg max-w-4xl w-full text-center">
          <img
            src={images[activeTab]}
            alt={activeTab}
            className="w-full rounded-xl shadow-md"
          />
        </div>

        {/* Footer */}
        <footer className="w-full flex justify-center px-10 py-6 mt-12 bg-[#EAD7BB] text-[#113946] shadow-md">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} QuickAssist. All rights reserved.</p>
            <p className="text-sm opacity-80">
              Helping businesses solve issues, one ticket at a time.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;