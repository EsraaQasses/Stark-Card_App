import React, { useState, useEffect, useMemo } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Selection,
  Inject,
  Edit,
  Toolbar,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  AccumulationLegend,
  PieSeries,
  AccumulationDataLabel,
  Inject as ChartInject,
  AccumulationTooltip,
} from '@syncfusion/ej2-react-charts';

import { Header } from '../../components';
import axiosInstance from '../../utils/axiosConfig';

// Admin Promotion Modal Component
const AdminPromotionModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onPromote, 
  onSetPassword 
}) => {
  const [step, setStep] = useState(1); // 1: Confirm, 2: Set Password
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    second_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  if (!isOpen) return null;

  const handlePromote = async () => {
    setLoading(true);
    try {
      const result = await onPromote(user.id);
      if (result.success) {
        if (result.requiresSecondPasswordSetup) {
          setStep(2); // Move to password setup
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error('Promotion failed:', error);
    } finally {
      setLoading(false);
    }
  };

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
      const result = await onSetPassword(user.id, passwordData.second_password);
      if (result.success) {
        onClose();
        setStep(1);
        setPasswordData({ second_password: '', confirm_password: '' });
        setPasswordErrors({});
      }
    } catch (error) {
      console.error('Password setup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPasswordData({ second_password: '', confirm_password: '' });
    setPasswordErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        {step === 1 && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Promote to Admin
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to promote <strong>{user?.name}</strong> to admin?
            </p>
            <p className="text-sm text-yellow-600 mb-4">
              This will give them full administrative access to the system.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePromote}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Promoting...' : 'Promote to Admin'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Set Admin Security Password
            </h3>
            <p className="text-gray-600 mb-4">
              Set a second password for <strong>{user?.name}</strong>'s admin account.
            </p>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Second Password
                </label>
                <input
                  type="password"
                  value={passwordData.second_password}
                  onChange={(e) => setPasswordData({...passwordData, second_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter second password"
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

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleSetPassword}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Setting Password...' : 'Set Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Customers = () => {
  const [gridInstance, setGridInstance] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminModal, setAdminModal] = useState({
    isOpen: false,
    user: null
  });
  
  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ['Delete', 'Block', 'Unblock', 'Make Agent', 'Make Admin', 'Refresh'];
  const editing = { allowDeleting: true, allowEditing: true };

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try the simple endpoint
      try {
        const response = await axiosInstance.get('/users/users-simple/'); 
        setCustomers(response.data);
        return; // Success, exit early
      } catch (simpleError) {
        console.log('Simple endpoint failed, trying main endpoint:', simpleError);
      }
      
      // Fall back to main endpoint
      const response = await axiosInstance.get('/users/users/'); 
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers data. Please check if the admin user is logged in.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Promote user to admin
  const promoteToAdmin = async (userId) => {
    try {
      const response = await axiosInstance.post(`/users/make-admin/${userId}/`);
      await fetchCustomers(); // Refresh data
      return { 
        success: true, 
        requiresSecondPasswordSetup: response.data.requires_second_password_setup 
      };
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      const errorMsg = error.response?.data?.error || 'Failed to promote user to admin';
      alert(`Error: ${errorMsg}`);
      return { success: false };
    }
  };

  // Set second password for admin
  const setAdminSecondPassword = async (userId, password) => {
    try {
      await axiosInstance.post(`/users/set-admin-password/${userId}/`, {
        second_password: password,
        confirm_password: password
      });
      
      await fetchCustomers(); // Refresh data
      alert('Second password set successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error setting admin password:', error);
      const errorMsg = error.response?.data?.error || 'Failed to set second password';
      alert(`Error: ${errorMsg}`);
      return { success: false };
    }
  };

  // Open admin promotion modal
  const openAdminPromotionModal = (user) => {
    setAdminModal({
      isOpen: true,
      user: user
    });
  };

  // Close admin promotion modal
  const closeAdminPromotionModal = () => {
    setAdminModal({
      isOpen: false,
      user: null
    });
  };

  const userActivityData = useMemo(() => {
    const totalUsers = customers.length;

    // Calculate real stats based on actual data
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const active = customers.filter(user => {
      const lastActive = user.last_login ? new Date(user.last_login) : new Date(user.date_joined);
      return lastActive > thirtyDaysAgo;
    }).length;

    const newUsers = customers.filter(user => {
      const joinedDate = new Date(user.date_joined);
      return joinedDate > sevenDaysAgo;
    }).length;

    const dormant = totalUsers - active;

    return [
      {
        x: 'Active',
        y: active,
        text: `${active}`,
        color: '#10B981',
        description: 'Logged in within the last 30 days'
      },
      {
        x: 'Dormant',
        y: dormant,
        text: `${dormant}`,
        color: '#EF4444',
        description: 'Has not logged in for 30+ days'
      },
      {
        x: 'New (Last 7 Days)',
        y: newUsers,
        text: `${newUsers}`,
        color: '#F59E0B',
        description: 'Registered within the last 7 days'
      }
    ];
  }, [customers]);

  const totalUsers = customers.length;
  const activePercentage = totalUsers > 0 ? ((userActivityData[0].y / totalUsers) * 100).toFixed(1) : 0;
  const dormantPercentage = totalUsers > 0 ? ((userActivityData[1].y / totalUsers) * 100).toFixed(1) : 0;
  const newPercentage = totalUsers > 0 ? ((userActivityData[2].y / totalUsers) * 100).toFixed(1) : 0;

  const toolbarClick = async (args) => {
    if (args.item.id.includes('deletegrid')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        if (window.confirm(`Are you sure you want to delete ${selected.length} customer(s)?`)) {
          try {
            // Implement delete functionality
            alert(`${selected.length} customer(s) marked for deletion.`);
          } catch (error) {
            console.error('Error deleting customers:', error);
            alert('Error deleting customers');
          }
        }
      } else {
        alert('Please select a customer to delete.');
      }
    }

    if (args.item.id.includes('Block')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        try {
          const banPromises = selected.map(customer => 
            axiosInstance.post(`/users/ban/${customer.id}/`)
          );
          
          await Promise.all(banPromises);
          await fetchCustomers(); // Refresh data
          alert(`${selected.length} customer(s) blocked successfully.`);
        } catch (error) {
          console.error('Error blocking customers:', error);
          alert('Error blocking customers');
        }
      } else {
        alert('Please select a customer to block.');
      }
    }

    if (args.item.id.includes('Unblock')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        try {
          const unbanPromises = selected.map(customer => 
            axiosInstance.post(`/users/unban/${customer.id}/`)
          );
          
          await Promise.all(unbanPromises);
          await fetchCustomers(); // Refresh data
          alert(`${selected.length} customer(s) unblocked successfully.`);
        } catch (error) {
          console.error('Error unblocking customers:', error);
          alert('Error unblocking customers');
        }
      } else {
        alert('Please select a customer to unblock.');
      }
    }

    if (args.item.id.includes('Make Agent')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        // Only allow making one user agent at a time
        if (selected.length > 1) {
          alert('Please select only one user to make agent.');
          return;
        }

        const user = selected[0];
        
        // Check if user is already an agent or admin
        if (user.role === 'agent') {
          alert(`${user.name} is already an agent.`);
          return;
        }
        
        if (user.role === 'admin') {
          alert('Cannot change admin role to agent.');
          return;
        }

        if (window.confirm(`Are you sure you want to make ${user.name} an agent?`)) {
          try {
            const response = await axiosInstance.post(`/users/make-agent/${user.id}/`);
            await fetchCustomers(); // Refresh data
            alert(`Success! ${user.name} is now an agent. Agent Code: ${response.data.agent_code}`);
          } catch (error) {
            console.error('Error making user agent:', error);
            const errorMsg = error.response?.data?.error || 'Failed to make user agent';
            alert(`Error: ${errorMsg}`);
          }
        }
      } else {
        alert('Please select a user to make agent.');
      }
    }

    if (args.item.id.includes('Make Admin')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        // Only allow making one user admin at a time
        if (selected.length > 1) {
          alert('Please select only one user to make admin.');
          return;
        }

        const user = selected[0];
        
        // Check if user is already an admin
        if (user.role === 'admin') {
          alert(`${user.name} is already an admin.`);
          return;
        }

        // Open admin promotion modal
        openAdminPromotionModal(user);
      } else {
        alert('Please select a user to make admin.');
      }
    }

    if (args.item.id.includes('Refresh')) {
      fetchCustomers();
    }
  };

  const pointRender = (args) => {
    const activityItem = userActivityData.find(item => item.x === args.point.x);
    if (activityItem) {
      args.fill = activityItem.color;
    }
  };

  // Calculate total balances
  const totalBalances = useMemo(() => {
    return customers.reduce((acc, customer) => {
      if (customer.balances) {
        Object.entries(customer.balances).forEach(([currency, balance]) => {
          acc[currency] = (acc[currency] || 0) + parseFloat(balance);
        });
      }
      return acc;
    }, {});
  }, [customers]);

  // Count admin users
  const adminCount = useMemo(() => {
    return customers.filter(user => user.role === 'admin').length;
  }, [customers]);

  // Customer grid columns configuration
  const customersGrid = [
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
      field: 'country', 
      headerText: 'Country', 
      width: '100' 
    },
    { 
      field: 'role', 
      headerText: 'Role', 
      width: '100',
      template: (props) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          props.role === 'admin' ? 'bg-red-100 text-red-800' :
          props.role === 'agent' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {props.role}
        </span>
      )
    },
    { 
      field: 'is_banned', 
      headerText: 'Status', 
      width: '100',
      template: (props) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          props.is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {props.is_banned ? 'Banned' : 'Active'}
        </span>
      )
    },
    { 
      field: 'balances.USD', 
      headerText: 'USD Balance', 
      width: '120',
      textAlign: 'Center',
      template: (props) => (
        <span className="font-semibold text-green-600">
          ${props.balances?.USD ? parseFloat(props.balances.USD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
        </span>
      )
    },
    { 
      field: 'balances.SYP', 
      headerText: 'SYP Balance', 
      width: '120',
      textAlign: 'Center',
      template: (props) => (
        <span className="font-semibold text-orange-600">
          {props.balances?.SYP ? parseFloat(props.balances.SYP).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} SYP
        </span>
      )
    },
    { 
      field: 'agent_code', 
      headerText: 'Agent Code', 
      width: '120',
      template: (props) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          props.agent_code ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {props.agent_code || 'N/A'}
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
        <Header category="User Management" title="Customers" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading customers data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="User Management" title="Customers" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
          <button
            onClick={fetchCustomers}
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
      <Header category="User Management" title="Customers" />
      
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchCustomers}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            User Activity Status
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Total Registered Users: {totalUsers}
          </p>
          {totalUsers > 0 ? (
            <AccumulationChartComponent
              id="user-activity-chart"
              legendSettings={{ 
                visible: true, 
                position: 'Bottom',
                textStyle: { size: '12px', fontWeight: '600' }
              }}
              height="300px"
              tooltip={{ 
                enable: true, 
                format: '${point.x} : <b>${point.y} users</b><br>${point.percentage}%' 
              }}
              pointRender={pointRender}
            >
              <ChartInject services={[AccumulationLegend, PieSeries, AccumulationDataLabel, AccumulationTooltip]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  name="User Activity"
                  dataSource={userActivityData}
                  xName="x"
                  yName="y"
                  innerRadius="60%"
                  startAngle={0}
                  endAngle={360}
                  radius="70%"
                  dataLabel={{
                    visible: true,
                    name: 'text',
                    position: 'Inside',
                    font: {
                      fontWeight: '600',
                      color: '#fff',
                    },
                  }}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">No data available for chart</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Insights</h3>
          
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Active Users</h4>
                <p className="text-2xl font-bold text-green-600">{userActivityData[0].y} users</p>
                <p className="text-sm text-green-600">{activePercentage}% of total</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              {userActivityData[0].description}
            </p>
          </div>

          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-red-800">Dormant Users</h4>
                <p className="text-2xl font-bold text-red-600">{userActivityData[1].y} users</p>
                <p className="text-sm text-red-600">{dormantPercentage}% of total</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <p className="text-xs text-red-700 mt-2">
              {userActivityData[1].description}
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-yellow-800">New Users (7 Days)</h4>
                <p className="text-2xl font-bold text-yellow-600">{userActivityData[2].y} users</p>
                <p className="text-sm text-yellow-600">{newPercentage}% of total</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              {userActivityData[2].description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Customers</p>
          <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">Active Now</p>
          <p className="text-2xl font-bold text-green-600">{userActivityData[0].y}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Admin Users</p>
          <p className="text-2xl font-bold text-red-600">{adminCount}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">Total USD Balance</p>
          <p className="text-2xl font-bold text-purple-600">
            ${totalBalances.USD ? totalBalances.USD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Total SYP Balance</p>
          <p className="text-2xl font-bold text-orange-600">
            {totalBalances.SYP ? totalBalances.SYP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} SYP
          </p>
        </div>
      </div>

      {customers.length > 0 ? (
        <GridComponent
          dataSource={customers}
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
        >
          <ColumnsDirective>
            {customersGrid.map((item, index) => (
              <ColumnDirective key={index} {...item} />
            ))}
          </ColumnsDirective>
          <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
        </GridComponent>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No customers found</p>
          <p className="text-gray-400 mt-2">Customer data will appear here once available</p>
        </div>
      )}

      {/* Admin Promotion Modal */}
      <AdminPromotionModal
        isOpen={adminModal.isOpen}
        onClose={closeAdminPromotionModal}
        user={adminModal.user}
        onPromote={promoteToAdmin}
        onSetPassword={setAdminSecondPassword}
      />
    </div>
  );
};

export default Customers;