import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import { Home } from './pages';
import './App.css';
import Customers from './pages/Users/Customers';
import Agents from './pages/Users/Agents';
import Admin from './pages/Users/Admin';
import Blacklist from './pages/Users/BlackList';

import Pending from './pages/Requests/Pending';
import ShippingRequests from './pages/Requests/ShippingRequests';
import ObjectionRequest from './pages/Requests/ObjectionRequest';
import InProgress from './pages/Requests/InProgress';
import API from './pages/Dashboard/API';
import Requests from './pages/Dashboard/RequestsHub';
import Payments from './pages/Dashboard/Payments';
import Transition from './pages/Dashboard/Transition';
import Ads from './pages/Dashboard/AdsPage';
import Sections from './pages/Store/Sections';
import Products from './pages/Store/Products';
import Packages from './pages/Store/Packages';
import Profile from './components/Profile';
import FullPayments from './components/FullPayments';

import { useStateContext } from './contexts/ContextProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Component to reset scroll on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Main App Content
const AppContent = () => {
  const { setCurrentColor, setCurrentMode, currentMode, activeMenu, currentColor, themeSettings, setThemeSettings } = useStateContext();
  const { user, loading } = useAuth();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-main-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Securing your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!user) {
    return <Login />;
  }

  // Check if user is admin (additional safety check)
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-main-dark-bg">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">This dashboard requires administrator privileges.</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <ScrollToTop />
      <div className="flex relative dark:bg-main-dark-bg">
        <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
          <TooltipComponent content="Settings" position="Top">
            <button
              type="button"
              onClick={() => setThemeSettings(true)}
              style={{ background: currentColor, borderRadius: '50%' }}
              className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
            >
              <FiSettings />
            </button>
          </TooltipComponent>
        </div>
        
        {activeMenu ? (
          <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
            <Sidebar />
          </div>
        ) : (
          <div className="w-0 dark:bg-secondary-dark-bg">
            <Sidebar />
          </div>
        )}
        
        <div
          className={
            activeMenu
              ? 'dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-72 w-full'
              : 'bg-main-bg dark:bg-main-dark-bg w-full min-h-screen flex-2'
          }
        >
          <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
            <Navbar />
          </div>
          <div>
            {themeSettings && (<ThemeSettings />)}

            <Routes>
              {/* All routes are protected and require admin role */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/api" element={<ProtectedRoute><API /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/transition" element={<ProtectedRoute><Transition /></ProtectedRoute>} />
              <Route path="/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><FullPayments /></ProtectedRoute>} />

              {/* Requests */}
              <Route path="/shipping-requests" element={<ProtectedRoute><ShippingRequests /></ProtectedRoute>} />
              <Route path="/pending" element={<ProtectedRoute><Pending /></ProtectedRoute>} />
              <Route path="/in-progress" element={<ProtectedRoute><InProgress /></ProtectedRoute>} />
              <Route path="/objection-requests" element={<ProtectedRoute><ObjectionRequest /></ProtectedRoute>} />

              {/* Users */}
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route path="/blacklist" element={<ProtectedRoute><Blacklist /></ProtectedRoute>} />
              <Route path="/admins" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

              {/* Store */}
              <Route path="/sections" element={<ProtectedRoute><Sections /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;