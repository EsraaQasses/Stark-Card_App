import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    optional_phone: '',
    currency_preference: 'USD'
  });

  // Fetch user profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users/me/');
      setProfileData(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        country: response.data.country || '',
        optional_phone: response.data.optional_phone || '',
        currency_preference: response.data.currency_preference || 'USD'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await axiosInstance.patch('/users/me/', formData);
      
      setProfileData(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 
                          Object.values(error.response?.data || {}).flat().join(', ') || 
                          'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profileData.full_name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      country: profileData.country || '',
      optional_phone: profileData.optional_phone || '',
      currency_preference: profileData.currency_preference || 'USD'
    });
    setEditing(false);
    setError(null);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': { color: 'bg-red-100 text-red-800', label: 'Administrator' },
      'agent': { color: 'bg-blue-100 text-blue-800', label: 'Agent' },
      'user': { color: 'bg-green-100 text-green-800', label: 'User' }
    };
    
    const config = roleConfig[role] || { color: 'bg-gray-100 text-gray-800', label: role };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-8 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="rounded-full bg-gray-200 h-24 w-24"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-dark-bg rounded-2xl p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information and preferences
          </p>
        </div>
        
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <FiEdit2 className="text-sm" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              disabled={saving}
            >
              <FiX className="text-sm" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              disabled={saving}
            >
              <FiSave className="text-sm" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mb-4 mx-auto">
                {getInitials(profileData?.full_name || user?.name)}
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            
            {/* Basic Info */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {profileData?.full_name || user?.name}
            </h2>
            <div className="mb-4">
              {getRoleBadge(profileData?.role || user?.role)}
            </div>
            
            {/* Stats */}
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Member since</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {profileData?.date_joined ? new Date(profileData.date_joined).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className={`font-medium ${profileData?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {profileData?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {profileData?.is_banned && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                  <span className="font-medium text-red-600">Banned</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <FiUser className="text-gray-400" />
                    <span className="text-gray-800 dark:text-white">
                      {profileData?.full_name || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <FiMail className="text-gray-400" />
                    <span className="text-gray-800 dark:text-white">
                      {profileData?.email || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <FiPhone className="text-gray-400" />
                    <span className="text-gray-800 dark:text-white">
                      {profileData?.phone || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your country"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <FiMapPin className="text-gray-400" />
                    <span className="text-gray-800 dark:text-white">
                      {profileData?.country || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              {/* Optional Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Optional Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="optional_phone"
                    value={formData.optional_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Optional phone number"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-2">
                    <FiPhone className="text-gray-400" />
                    <span className="text-gray-800 dark:text-white">
                      {profileData?.optional_phone || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              {/* Currency Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency Preference
                </label>
                {editing ? (
                  <select
                    name="currency_preference"
                    value={formData.currency_preference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="SYP">Syrian Pound (SYP)</option>
                  </select>
                ) : (
                  <div className="p-2">
                    <span className="text-gray-800 dark:text-white">
                      {profileData?.currency_preference === 'SYP' ? 'Syrian Pound (SYP)' : 'US Dollar (USD)'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Connected Agent (if any) */}
            {profileData?.connected_agent && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Connected Agent
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 dark:text-blue-200">
                      {profileData.connected_agent.full_name}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Agent Code: {profileData.connected_agent.agent_code}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Balances (if available) */}
            {profileData?.balances && Object.keys(profileData.balances).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Wallet Balances</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(profileData.balances).map(([currency, balance]) => (
                    <div key={currency} className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currency}</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {balance} {currency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;