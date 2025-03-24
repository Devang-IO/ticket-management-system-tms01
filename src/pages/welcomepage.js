import React, { useState, useEffect, useRef, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState("ticket-list");
  const [titleText, setTitleText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const fullTitleText = "Welcome to QuickAssist";
  const fullDescriptionText = "QuickAssist is a powerful helpdesk solution designed to simplify customer support. With a ticketing system, community forums, and an intuitive interface, we help businesses resolve issues faster and enhance customer satisfaction.";
  
  // Scroll animation states
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("none");
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);

  // Generate dots with useMemo to prevent recreation on re-renders
  const dots = useMemo(() => {
    const numDots = 100;
    return Array(numDots).fill(null).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1
    }));
  }, []);

  // Typewriter effect
  useEffect(() => {
    let titleTimeout, descTimeout;
    
    if (titleText.length < fullTitleText.length) {
      titleTimeout = setTimeout(() => {
        setTitleText(fullTitleText.slice(0, titleText.length + 1));
      }, 100);
    } else if (descriptionText.length < fullDescriptionText.length) {
      descTimeout = setTimeout(() => {
        setDescriptionText(fullDescriptionText.slice(0, descriptionText.length + 1));
      }, 30);
    }

    return () => {
      clearTimeout(titleTimeout);
      clearTimeout(descTimeout);
    };
  }, [titleText, descriptionText]);

  // Scroll handler with improved detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? "down" : "up";
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

      if (scrollDelta > 10) {
        setScrollDirection(direction);
        setIsScrolling(true);
        
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
          setScrollDirection("none");
        }, 100);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#113946] text-white relative overflow-hidden">
      {/* Star Dots Background */}
      <div className="fixed inset-0 pointer-events-none">
        {dots.map((dot, index) => (
          <motion.div
            key={index}
            initial={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              opacity: 0 + Math.random() * 0.4,
            }}
            animate={isScrolling ? {
              y: scrollDirection === "down" ? "100vh" : "-100vh",
              opacity: [1, 0],
              scale: [1, 1.5],
              transition: {
                duration: 0.01,
                ease: "linear",
              }
            } : {
              y: 0,
              opacity: [0.2, 0.5, 0.2],
              scale: 1,
              transition: {
                opacity: {
                  duration: 5 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y: { duration: 0.01 }
              }
            }}
            className="absolute rounded-full bg-white"
            style={{
              width: `${dot.size}px`,
              height: `${dot.size}px`,
            }}
          />
        ))}
      </div>

      {/* Rest of your content remains the same */}
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

        {/* Welcome Section */}
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

        {/* Feature Section */}
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

        {/* Get Started Button */}
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

        {/* Discover Section */}
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

        {/* Image Container */}
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