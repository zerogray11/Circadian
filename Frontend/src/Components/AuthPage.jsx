import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, setDoc } from './firebase';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login with email and password
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in');
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect after a short delay to show success message
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
        showNotification('Account created successfully!', 'success');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/questionnaire');
        }, 1500);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred');
      showNotification(
        error.message.includes('auth/') 
          ? error.message.replace('Firebase: Error (auth/', '').replace(').', '')
          : error.message, 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="p-6 bg-blue-600 text-white text-center">
          <h2 className="text-2xl font-bold">Circadian Fitness Planner</h2>
          <p className="mt-2 opacity-90">
            {isLogin ? "Welcome back to your wellness journey" : "Start your path to optimal health"}
          </p>
        </div>

        {/* Auth Toggle */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex items-center justify-center space-x-2 flex-1 py-4 font-medium transition-colors ${
              isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span>Login</span>
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex items-center justify-center space-x-2 flex-1 py-4 font-medium transition-colors ${
              !isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-500'
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
                className="w-full p-4 pl-10 text-gray-800 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full p-4 pl-10 text-gray-800 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors ${
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
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isLogin ? 'Forgot Password?' : 'Already have an account?'}
          </a>
        </div>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'error' 
            ? 'bg-red-600 text-white' 
            : notification.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white'
        } transition-all duration-300 ease-in-out animate-fade-in z-50`}>
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <p>{notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default AuthPage;