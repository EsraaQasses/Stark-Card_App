import axios from 'axios';
import React, { useEffect, useState } from 'react';

const TwoFASetup = ({ onSetupComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const startSetup = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8000/api/users/2fa/setup/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.data.is_2fa_enabled) {
        setError('2FA is already enabled for your account.');
        return;
      }

      setSetupData(response.data);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:8000/api/users/2fa/verify/', {
        token: verificationCode,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      setBackupCodes(response.data.backup_codes);
      setSuccess(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startSetup();
  }, []);

  const handleManualEntry = () => {
    navigator.clipboard.writeText(setupData.secret);
    setSuccess('Secret key copied to clipboard!');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
        <p className="text-gray-600">Scan this QR code with your authenticator app</p>
      </div>

      {setupData?.qr_code && (
        <div className="flex justify-center">
          <img
            src={setupData.qr_code}
            alt="QR Code for 2FA"
            className="w-48 h-48 border rounded-lg"
          />
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleManualEntry}
          className="text-blue-600 hover:text-blue-700 text-sm"
          type="button"
        >
          Can&apos;t scan? Enter code manually
        </button>

        {setupData?.secret && (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Secret Key:</p>
            <code className="text-sm font-mono bg-white p-2 rounded border">
              {setupData.secret}
            </code>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          type="button"
        >
          I&apos;ve Scanned the Code
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
        <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div>
        <input
          type="text"
          maxLength={6}
          pattern="[0-9]{6}"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-widest"
          placeholder="000000"
          disabled={loading}
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
          type="button"
        >
          Back
        </button>
        <button
          onClick={verifyToken}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          type="button"
        >
          {loading ? 'Verifying...' : 'Verify & Enable'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2FA Enabled Successfully!</h3>
        <p className="text-gray-600">Your account is now protected with two-factor authentication</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Save Your Backup Codes</h4>
        <p className="text-yellow-700 text-sm mb-3">
          These codes can be used to access your account if you lose your authenticator device.
          Save them in a secure place!
        </p>

        <div className="bg-white p-3 rounded border">
          {backupCodes.map((code) => (
            <div key={code} className="font-mono text-sm text-center py-1 border-b last:border-b-0">
              {code}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            const codesText = backupCodes.join('\n');
            navigator.clipboard.writeText(codesText);
            setSuccess('Backup codes copied to clipboard!');
          }}
          className="w-full mt-3 bg-yellow-100 text-yellow-800 py-2 px-4 rounded hover:bg-yellow-200 transition text-sm"
          type="button"
        >
          Copy All Codes
        </button>
      </div>

      <button
        onClick={onSetupComplete}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition"
        type="button"
      >
        Done
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Setup Two-Factor Authentication</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default TwoFASetup;
