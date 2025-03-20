import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, setDoc } from './firebase';

// Cool loading component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50">
    <div className="relative">
      {/* Outer circle */}
      <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
      
      {/* Inner spinning circle */}
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
    </div>
  </div>
);

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login with email and password
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        console.log('User signed up');
        
        // Store additional user data in Firestore
        const userDocRef = doc(db, 'users', newUser.uid);
        await setDoc(userDocRef, {
          email: newUser.email,
          createdAt: new Date().toISOString(),
        });

        console.log('User data saved to Firestore');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/questionnaire');
        }, 1500);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      {/* Background with blur effect */}
      <div className="fixed inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 to-orange-100 backdrop-blur-lg z-0"></div>

      <div className="w-full max-w-md bg-white/90 rounded-xl shadow-lg overflow-visible transition-all duration-300 ease-in-out relative z-10">
        {/* Glistening gradient header */}
        <div className="h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 to-orange-200 rounded-t-xl"></div>

        {/* Header */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-black text-gray-600 font-outfit">The Circadian</h2>
          <p className="mt-2 text-gray-500">
            {isLogin ? "Welcome back to your wellness journey" : "Start your path to optimal health"}
          </p>
        </div>

        {/* Auth Toggle */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex items-center justify-center space-x-2 flex-1 py-4 font-medium transition-colors ${
              isLogin 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span>Login</span>
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex items-center justify-center space-x-2 flex-1 py-4 font-medium transition-colors ${
              !isLogin 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-4 pl-10 text-gray-800 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full p-4 pl-10 text-gray-800 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-4 rounded-lg font-medium text-white bg-black hover:opacity-90 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Additional Link */}
        <div className="text-center p-6 border-t border-gray-200">
          <a 
            href="#" 
            className="text-black hover:text-gray-700 transition-colors"
          >
            {isLogin ? 'Forgot Password?' : 'Already have an account?'}
          </a>
        </div>
      </div>
      
      {/* Cool Loading Component */}
      {isLoading && <LoadingSpinner />}
      
      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-2 bg-red-600 text-white transition-all duration-300 ease-in-out animate-fade-in z-50">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default AuthPage;