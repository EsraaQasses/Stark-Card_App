import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [step, setStep] = useState(1); // 1: username/password, 2: second password, 3: OTP
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    secondPassword: '',
    otp: ''
  });
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresSetup, setRequiresSetup] = useState(false);
  
  const { login, isAuthenticated, refreshToken } = useAuth(); // Added refreshToken
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Step 1: Username and Password
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/users/login/admin/step1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSessionToken(data.session_token);
        
        if (data.requires_setup) {
          setRequiresSetup(true);
          setStep(2); // Go to setup step
        } else if (data.requires_second_password) {
          setStep(2); // Proceed to second password verification
        } else {
          setStep(3); // Skip directly to OTP
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Second Password (for existing admins) OR Setup (for new admins)
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      let data;

      if (requiresSetup) {
        // First-time setup flow
        response = await fetch('http://localhost:8000/api/users/setup-first-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_token: sessionToken,
            second_password: formData.secondPassword,
            confirm_password: formData.secondPassword
          }),
        });
        data = await response.json();

        if (response.ok) {
          setRequiresSetup(false);
          setStep(3); // Proceed to OTP after successful setup
        } else {
          setError(data.error || 'Failed to setup second password');
        }
      } else {
        // Existing admin - verify second password
        response = await fetch('http://localhost:8000/api/users/login/admin/step2/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_token: sessionToken,
            second_password: formData.secondPassword
          }),
        });
        data = await response.json();

        if (response.ok) {
          setStep(3); // Proceed to OTP
        } else {
          setError(data.error || 'Second password verification failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: OTP Verification - FIXED VERSION
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/users/login/admin/step3/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionToken,
          otp_code: formData.otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login successful, storing tokens and redirecting...');
        
        // Store tokens and user data
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Force AuthContext to update by calling checkAuth
        // Option 1: Use the login function from AuthContext
        try {
          await login(formData.name, formData.password, true);
        } catch (authError) {
          console.log('Auth context login failed, but tokens are stored');
        }
        
        // Option 2: Force navigation after a short delay
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          navigate('/');
        }, 100);
        
      } else {
        setError(data.error || 'OTP verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setFormData(prev => ({ ...prev, secondPassword: '' }));
    } else if (step === 3) {
      setStep(2);
      setFormData(prev => ({ ...prev, otp: '' }));
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
      <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
      <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
          2
        </div>
        <span className="ml-2 text-sm font-medium">
          {requiresSetup ? 'Setup' : 'Security'}
        </span>
      </div>
      <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
      <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
          3
        </div>
        <span className="ml-2 text-sm font-medium">OTP</span>
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
        }`}>
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
            : 'Enter your second password to continue'
          }
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
          {loading ? 'Processing...' : requiresSetup ? 'Setup & Continue' : 'Continue to OTP'}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">OTP Verification</h3>
        <p className="text-gray-600 mt-2">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
          One-Time Password
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          required
          maxLength={6}
          pattern="[0-9]{6}"
          value={formData.otp}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-center text-xl tracking-widest"
          placeholder="000000"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          Check your email for the verification code
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
          {loading ? 'Verifying...' : 'Complete Login'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Welcome Back' : 
             step === 2 ? (requiresSetup ? 'Setup Required' : 'Security Verification') : 
             'OTP Verification'}
          </h1>
          <p className="text-gray-600">
            {step === 1 ? 'Sign in to your Stark Admin Dashboard' :
             step === 2 ? (requiresSetup ? 'Setup your security password' : 'Enter your second password') : 
             'Enter the code from your email'}
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error Message */}
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

        {/* Forms */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Demo Credentials Hint - Only show on step 1 */}
        {step === 1 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              <strong>Admin Access:</strong> 3-step security verification required
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;