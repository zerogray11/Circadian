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
    <header className="relative">
      {/* Main header content */}
      <div className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 to-orange-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/profile" className="text-xl font-black text-gray-600 font-outfit">
              Circadian Fitness Planner
            </Link>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex items-center space-x-6">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            
            <Link
              to="/circadian-schedule"
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span>Schedule</span>
            </Link>
            
            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
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
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-blue-200 z-50"
                  >
                    <div className="p-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition-colors"
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
      </div>
      
      {/* Blur effect at the bottom of the header */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-transparent to-white/30 backdrop-blur-md transform translate-y-1/2 z-10"></div>
    </header>
  );
};

export default Header;