import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TwoFASetup from './TwoFASetup';

const TwoFAManagement = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/users/2fa/status/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setStatus(response.data);
    } catch (err) {
      setError('Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/users/2fa/disable/', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        }.
      });
      await loadStatus();
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (showSetup) {
    return (
      <TwoFASetup 
        onSetupComplete={() => {
          setShowSetup(false);
          loadStatus();
        }}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  if (loading && !status) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status?.is_2fa_enabled
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status?.is_2fa_enabled ? 'Enabled' : 'Not Set Up'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {status?.is_2fa_enabled ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700">Your account is protected with two-factor authentication</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Active Devices</h3>
            {status.devices?.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-gray-500">
                    Added {new Date(device.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>

          {status.has_backup_codes && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                You have {status.backup_codes_count} backup codes available
              </p>
            </div>
          )}

          <button
            onClick={disable2FA}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            type="button"
          >
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Enhanced Security</h3>
            <p className="text-yellow-700 text-sm">
              Two-factor authentication adds an extra layer of security to your account.
              You&apos;ll need to enter a code from your authenticator app in addition to your password when signing in.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">How it works:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Scan a QR code with Google Authenticator or similar app
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enter a verification code to confirm setup
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Receive backup codes for emergency access
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowSetup(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
            type="button"
          >
            Setup Two-Factor Authentication
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFAManagement;
