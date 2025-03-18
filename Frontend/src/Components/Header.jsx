import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Clock, LogOut, Settings, ChevronDown } from 'lucide-react';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await auth.signOut(); // Sign out the user
      navigate('/'); // Redirect to the AuthPage
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  return (
    <header className="bg-indigo-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/profile" className="text-xl font-bold text-white">
            Circadian Fitness Planner
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          <Link
            to="/profile"
            className="flex items-center space-x-2 text-indigo-100 hover:text-white transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          
          <Link
            to="/circadian-schedule"
            className="flex items-center space-x-2 text-indigo-100 hover:text-white transition-colors"
          >
            <Clock className="w-5 h-5" />
            <span>Schedule</span>
          </Link>
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-indigo-100 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Dropdown Content */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-indigo-200 z-50"
                >
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 p-2 text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;