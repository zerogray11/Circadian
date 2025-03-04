import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

const AuthPage = ({ onAuthenticate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (onAuthenticate) {
        const success = await onAuthenticate({
          email, 
          password, 
          isLogin
        });

        if (success) {
          console.log(isLogin ? 'User logged in' : 'User signed up');
        } else {
          setError('Authentication failed');
        }
      } else {
        setError('Authentication not configured');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h2 className="auth-header-title">Circadian Fitness Planner</h2>
        </div>

        {/* Auth Toggle */}
        <div className="auth-toggle">
          <button
            onClick={() => setIsLogin(true)}
            className={`auth-toggle-button ${
              isLogin 
                ? 'auth-toggle-button-active' 
                : 'auth-toggle-button-inactive'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </div>
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`auth-toggle-button ${
              !isLogin 
                ? 'auth-toggle-button-active' 
                : 'auth-toggle-button-inactive'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Sign Up</span>
            </div>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="auth-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="auth-input"
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit-button"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            {isLogin 
              ? "Welcome back to your wellness journey" 
              : "Start your path to optimal health"}
          </p>
        </div>

        {/* Additional Link */}
        <div className="text-center py-4">
          <a 
            href="#" 
            className="auth-additional-link"
          >
            {isLogin ? 'Forgot Password?' : 'Already have an account?'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;