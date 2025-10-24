import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    secondPassword: '',
    token: '',
  });
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const { adminLoginStep1, adminLoginStep2, adminLoginStep3, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (requiresSetup) return 'Setup & Continue';
    return 'Continue to Verification';
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Welcome Back';
      case 2:
        return requiresSetup ? 'Setup Required' : 'Security Verification';
      case 3:
        return requires2FA ? '2FA Verification' : 'OTP Verification';
      default:
        return 'Welcome Back';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Sign in to your Stark Admin Dashboard';
      case 2:
        return requiresSetup ? 'Setup your security password' : 'Enter your second password';
      case 3:
        return requires2FA
          ? 'Enter the code from your authenticator app'
          : 'Enter the code from your email';
      default:
        return 'Sign in to your Stark Admin Dashboard';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await adminLoginStep1(formData.name, formData.password);

    if (result.success) {
      setSessionToken(result.data.session_token);

      if (result.data.requires_setup) {
        setRequiresSetup(true);
        setStep(2);
      } else if (result.data.requires_second_password) {
        setStep(2);
      } else {
        setRequires2FA(result.data.requires_2fa || false);
        setStep(3); // Skip directly to verification
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (requiresSetup) {
      try {
        const response = await fetch('http://localhost:8000/api/users/setup-first-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_token: sessionToken,
            second_password: formData.secondPassword,
            confirm_password: formData.secondPassword,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          setRequiresSetup(false);
          setRequires2FA(data.requires_2fa || false);
          setStep(3);
        } else {
          setError(data.error || 'Failed to setup second password');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    } else {
      const result = await adminLoginStep2(sessionToken, formData.secondPassword);
      if (result.success) {
        setRequires2FA(result.data.requires_2fa || false);
        setStep(3);
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await adminLoginStep3(sessionToken, formData.token);
    if (result.success) {
      setTimeout(() => {
        navigate('/');
      }, 100);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setFormData((prev) => ({ ...prev, secondPassword: '' }));
    } else if (step === 3) {
      setStep(2);
      setFormData((prev) => ({ ...prev, token: '' }));
      setRequires2FA(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
          1
        </div>
        <span className="ml-2 text-sm font-medium">Credentials</span>
      </div>
      <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
      <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
          2
        </div>
        <span className="ml-2 text-sm font-medium">
          {requiresSetup ? 'Setup' : 'Security'}
        </span>
      </div>
      <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
      <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
          3
        </div>
        <span className="ml-2 text-sm font-medium">
          {requires2FA ? '2FA' : 'OTP'}
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Enter your username"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Verifying...
          </div>
        ) : (
          'Continue to Security Step'
        )}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-6">
      <div className="text-center mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          requiresSetup ? 'bg-blue-100' : 'bg-yellow-100'
        }`}
        >
          <svg className={`w-6 h-6 ${requiresSetup ? 'text-blue-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {requiresSetup ? 'Security Setup Required' : 'Security Verification'}
        </h3>
        <p className="text-gray-600 mt-2">
          {requiresSetup
            ? 'Please set up your second password for enhanced security'
            : 'Enter your second password to continue'}
        </p>
      </div>

      <div>
        <label htmlFor="secondPassword" className="block text-sm font-medium text-gray-700 mb-2">
          {requiresSetup ? 'Create Security Password' : 'Second Password'}
        </label>
        <input
          id="secondPassword"
          name="secondPassword"
          type="password"
          required
          value={formData.secondPassword}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder={requiresSetup ? 'Create your security password' : 'Enter your second password'}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-2">
          Must be 8+ characters with uppercase, lowercase, numbers, and symbols
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={goBack}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-medium disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getButtonText()}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-6">
      <div className="text-center mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${requires2FA ? 'bg-purple-100' : 'bg-green-100'}`}>
          {requires2FA ? (
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {requires2FA ? '2FA Verification' : 'OTP Verification'}
        </h3>
        <p className="text-gray-600 mt-2">
          {requires2FA
            ? 'Enter the 6-digit code from your authenticator app'
            : 'Enter the 6-digit code sent to your email'}
        </p>
      </div>

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
          {requires2FA ? '2FA Code' : 'Verification Code'}
        </label>
        <input
          id="token"
          name="token"
          type="text"
          required
          maxLength={6}
          pattern="[0-9]{6}"
          value={formData.token}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-center text-xl tracking-widest"
          placeholder="000000"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          {requires2FA
            ? 'Open your authenticator app to get the code'
            : 'Check your email for the verification code'}
        </p>
      </div>

      {requires2FA && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-blue-700">
                <strong>Using 2FA:</strong> Get code from Google Authenticator, Authy, or similar app. 
                The code refreshes every 30 seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {!requires2FA && (
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-green-700">
                <strong>Email OTP:</strong> Check your registered email for the 6-digit code. 
                The code expires in 5 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={goBack}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-medium disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || formData.token.length !== 6}
          className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Complete Login'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getStepTitle()}
          </h1>
          <p className="text-gray-600">
            {getStepDescription()}
          </p>
        </div>

        {renderStepIndicator()}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {step === 1 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Admin Security:</strong> 3-step verification with optional 2FA support
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Step 1: Credentials → Step 2: Second Password → Step 3: 2FA/OTP
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
