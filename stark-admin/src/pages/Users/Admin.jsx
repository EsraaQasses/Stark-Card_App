import React, { useState, useEffect, useMemo } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Selection,
  Inject,
  Toolbar,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';
import { Header } from '../../components';
import axiosInstance from '../../utils/axiosConfig';

// Admin Details Modal Component
const AdminDetailsModal = ({ 
  isOpen, 
  onClose, 
  admin,
  onSetPassword,
  onRemoveAdmin 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [passwordData, setPasswordData] = useState({
    second_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen || !admin) return null;

  const handleSetPassword = async () => {
    // Validate passwords
    const errors = {};
    if (passwordData.second_password.length < 8) {
      errors.second_password = 'Password must be at least 8 characters long';
    }
    if (passwordData.second_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(passwordData.second_password)) {
      errors.second_password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await onSetPassword(admin.id, passwordData.second_password);
      if (result.success) {
        setPasswordData({ second_password: '', confirm_password: '' });
        setPasswordErrors({});
        alert('Second password updated successfully!');
      }
    } catch (error) {
      console.error('Password setup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (window.confirm(`Are you sure you want to remove admin privileges from ${admin.name}?`)) {
      setLoading(true);
      try {
        const result = await onRemoveAdmin(admin.id);
        if (result.success) {
          onClose();
        }
      } catch (error) {
        console.error('Remove admin failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Admin Details: {admin.full_name}
              </h3>
              <p className="text-gray-600 text-sm">@{admin.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'security', 'actions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="mt-1 text-sm text-gray-900">{admin.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{admin.full_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{admin.email || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{admin.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Admin Status</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      admin.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Super Admin</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      admin.is_superuser 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.is_superuser ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Staff Access</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      admin.is_staff 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.is_staff ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Joined</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(admin.date_joined)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(admin.last_login)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h4>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">Second Password</h5>
                      <p className="text-sm text-gray-600">
                        {admin.security?.has_second_password 
                          ? 'Second password is set up' 
                          : 'Second password is not set up'}
                      </p>
                      {admin.security?.second_password_set_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {formatDate(admin.security.second_password_set_at)}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.security?.has_second_password 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {admin.security?.has_second_password ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                </div>

                {/* Set Second Password Form */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3">Set/Update Second Password</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Second Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.second_password}
                        onChange={(e) => setPasswordData({...passwordData, second_password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new second password"
                      />
                      {passwordErrors.second_password && (
                        <p className="text-red-500 text-xs mt-1">{passwordErrors.second_password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm second password"
                      />
                      {passwordErrors.confirm_password && (
                        <p className="text-red-500 text-xs mt-1">{passwordErrors.confirm_password}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>Uppercase and lowercase letters</li>
                      <li>At least one number</li>
                      <li>At least one special character</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleSetPassword}
                    disabled={loading || !passwordData.second_password || !passwordData.confirm_password}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Second Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Admin Actions</h4>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-medium text-red-800 mb-2">Danger Zone</h5>
                  <p className="text-sm text-red-700 mb-4">
                    Removing admin privileges will demote this user to a regular user. 
                    They will lose access to admin features.
                  </p>
                  
                  <button
                    onClick={handleRemoveAdmin}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? 'Removing...' : 'Remove Admin Privileges'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admins = () => {
  const [gridInstance, setGridInstance] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ['Refresh', 'View Details'];
  const editing = { allowDeleting: false, allowEditing: false };

  // Fetch admins from backend
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/users/admin-users/');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to load admin users data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Set second password for admin
  const setAdminSecondPassword = async (adminId, password) => {
    try {
      await axiosInstance.post(`/users/set-admin-password/${adminId}/`, {
        second_password: password,
        confirm_password: password
      });
      
      await fetchAdmins(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error setting admin password:', error);
      const errorMsg = error.response?.data?.error || 'Failed to set second password';
      alert(`Error: ${errorMsg}`);
      return { success: false };
    }
  };

  // Remove admin role
  const removeAdminRole = async (adminId) => {
    try {
      await axiosInstance.post(`/users/remove-admin/${adminId}/`);
      await fetchAdmins(); // Refresh data
      alert('Admin privileges removed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error removing admin role:', error);
      const errorMsg = error.response?.data?.error || 'Failed to remove admin role';
      alert(`Error: ${errorMsg}`);
      return { success: false };
    }
  };

  const toolbarClick = async (args) => {
    if (args.item.id.includes('Refresh')) {
      fetchAdmins();
    }

    if (args.item.id.includes('View Details')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        // Only allow viewing one admin at a time
        if (selected.length > 1) {
          alert('Please select only one admin to view details.');
          return;
        }

        const admin = selected[0];
        setSelectedAdmin(admin);
        setDetailsModalOpen(true);
      } else {
        alert('Please select an admin to view details.');
      }
    }
  };

  const handleRowClick = (args) => {
    // Optional: Open details on double click or single click
    // setSelectedAdmin(args.data);
    // setDetailsModalOpen(true);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(admin => admin.is_active).length;
    const superAdmins = admins.filter(admin => admin.is_superuser).length;
    const adminsWithSecondPassword = admins.filter(admin => admin.has_second_password).length;

    return {
      totalAdmins,
      activeAdmins,
      superAdmins,
      adminsWithSecondPassword,
      inactiveAdmins: totalAdmins - activeAdmins,
      securityPercentage: totalAdmins > 0 ? Math.round((adminsWithSecondPassword / totalAdmins) * 100) : 0
    };
  }, [admins]);

  // Admin grid columns configuration
  const adminsGrid = [
    { 
      type: 'checkbox', 
      width: '50' 
    },
    { 
      field: 'id', 
      headerText: 'ID', 
      width: '80', 
      textAlign: 'Center',
      isPrimaryKey: true 
    },
    { 
      field: 'name', 
      headerText: 'Username', 
      width: '120' 
    },
    { 
      field: 'full_name', 
      headerText: 'Full Name', 
      width: '150' 
    },
    { 
      field: 'email', 
      headerText: 'Email', 
      width: '180' 
    },
    { 
      field: 'phone', 
      headerText: 'Phone', 
      width: '130' 
    },
    { 
      field: 'is_active', 
      headerText: 'Status', 
      width: '100',
      template: (props) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          props.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {props.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      field: 'is_superuser', 
      headerText: 'Super Admin', 
      width: '100',
      template: (props) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          props.is_superuser ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {props.is_superuser ? 'Yes' : 'No'}
        </span>
      )
    },
    { 
      field: 'has_second_password', 
      headerText: 'Security', 
      width: '100',
      template: (props) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          props.has_second_password ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {props.has_second_password ? 'Secure' : 'Setup Needed'}
        </span>
      )
    },
    { 
      field: 'date_joined', 
      headerText: 'Joined Date', 
      width: '120',
      format: 'yMd',
      textAlign: 'Center'
    },
    { 
      field: 'last_login', 
      headerText: 'Last Login', 
      width: '120',
      format: 'yMd',
      textAlign: 'Center',
      template: (props) => (
        <span>
          {props.last_login ? new Date(props.last_login).toLocaleDateString() : 'Never'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="User Management" title="Admin Users" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading admin users data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="User Management" title="Admin Users" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
          <button
            onClick={fetchAdmins}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="User Management" title="Admin Users" />
      
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchAdmins}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
        >
          Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Admins</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalAdmins}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">Active Admins</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeAdmins}</p>
          <p className="text-sm text-green-600">
            {stats.totalAdmins > 0 ? Math.round((stats.activeAdmins / stats.totalAdmins) * 100) : 0}% active
          </p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">Super Admins</p>
          <p className="text-2xl font-bold text-purple-600">{stats.superAdmins}</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Security Setup</p>
          <p className="text-2xl font-bold text-orange-600">{stats.adminsWithSecondPassword}</p>
          <p className="text-sm text-orange-600">{stats.securityPercentage}% secured</p>
        </div>
      </div>

      {/* Security Alert */}
      {stats.securityPercentage < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {stats.totalAdmins - stats.adminsWithSecondPassword} admin(s) haven't set up their second password. 
                  Encourage them to complete their security setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {admins.length > 0 ? (
        <GridComponent
          dataSource={admins}
          ref={(g) => setGridInstance(g)}
          enableHover={false}
          allowPaging
          pageSettings={{ pageCount: 5, pageSize: 10 }}
          selectionSettings={selectionsettings}
          toolbar={toolbarOptions}
          editSettings={editing}
          allowSorting
          allowFiltering
          toolbarClick={toolbarClick}
          rowSelected={handleRowClick}
        >
          <ColumnsDirective>
            {adminsGrid.map((item, index) => (
              <ColumnDirective key={index} {...item} />
            ))}
          </ColumnsDirective>
          <Inject services={[Page, Selection, Toolbar, Sort, Filter]} />
        </GridComponent>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No admin users found</p>
          <p className="text-gray-400 mt-2">
            Admin users will appear here once they are created or promoted
          </p>
        </div>
      )}

      {/* Admin Details Modal */}
      <AdminDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
        onSetPassword={setAdminSecondPassword}
        onRemoveAdmin={removeAdminRole}
      />
    </div>
  );
};

export default Admins;