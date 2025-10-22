import React, { useState, useEffect } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Toolbar,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';
import { Header } from '../../components';
import axiosInstance from '../../utils/axiosConfig';

const Pending = () => {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    shipping: 0,
    verification: 0,
    refund: 0,
    other: 0
  });
  const toolbarOptions = ['Search'];

  // Fetch pending requests from backend
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/all_requests/admin/requests/?status=pending');
      const requests = response.data;
      setPendingData(requests);
      calculateStats(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requests) => {
    const stats = {
      total: requests.length,
      shipping: requests.filter(item => item.request_type === 'payment').length,
      verification: requests.filter(item => item.request_type === 'support').length,
      refund: requests.filter(item => item.request_type === 'refund').length,
      other: requests.filter(item => item.request_type === 'other').length
    };
    setStats(stats);
  };

  const handleApprove = async (requestId, customerName) => {
    try {
      await axiosInstance.post(`/all_requests/admin/requests/${requestId}/update_status/`, {
        status: 'completed',
        admin_notes: 'Request approved'
      });
      
      alert(`Request #${requestId} from ${customerName} approved successfully!`);
      fetchPendingRequests(); // Refresh data
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve request';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleReject = async (requestId, customerName) => {
    const reason = prompt(`Please enter reason for rejecting ${customerName}'s request:`);
    if (!reason) return;

    try {
      await axiosInstance.post(`/all_requests/admin/requests/${requestId}/update_status/`, {
        status: 'rejected',
        admin_notes: reason,
        rejection_reason: reason
      });
      
      alert(`Request #${requestId} rejected. Reason: ${reason}`);
      fetchPendingRequests(); // Refresh data
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject request';
      alert(`Error: ${errorMessage}`);
    }
  };

  const customerTemplate = (props) => {
    const request = props;
    return (
      <div className="flex items-center gap-3">
        <img
          className="rounded-full w-10 h-10 object-cover"
          src={request.user?.avatar || 'https://via.placeholder.com/40x40/cccccc/666666?text=User'}
          alt={request.user_name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/40x40/cccccc/666666?text=User';
          }}
        />
        <div>
          <p className="font-semibold text-sm">{request.user_name}</p>
          <p className="text-xs text-gray-500">{request.user_email}</p>
          <p className="text-xs text-gray-400">{request.user_phone}</p>
        </div>
      </div>
    );
  };

  const statusTemplate = () => (
    <span className="px-3 py-1 rounded-full text-white text-xs font-semibold bg-yellow-500 animate-pulse">
      ⏳ Pending
    </span>
  );

  const actionTemplate = (props) => {
    const request = props;
    return (
      <div className="flex gap-2 justify-center">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium"
          onClick={() => handleApprove(request.id, request.user_name)}
        >
          ✓ Approve
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium"
          onClick={() => handleReject(request.id, request.user_name)}
        >
          ✗ Reject
        </button>
      </div>
    );
  };

  const requestTypeTemplate = (props) => {
    const request = props;
    const requestTypeMap = {
      'payment': { label: 'Payment', color: 'bg-blue-100 text-blue-800' },
      'support': { label: 'Support', color: 'bg-purple-100 text-purple-800' },
      'refund': { label: 'Refund', color: 'bg-orange-100 text-orange-800' },
      'other': { label: 'Other', color: 'bg-gray-100 text-gray-800' }
    };
    
    const typeInfo = requestTypeMap[request.request_type] || { label: request.request_type, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <div className="text-center">
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        {request.title && (
          <p className="text-xs text-gray-600 mt-1 truncate max-w-[120px] mx-auto">
            {request.title}
          </p>
        )}
      </div>
    );
  };

  const amountTemplate = (props) => {
    const request = props;
    if (!request.amount) return <span className="text-gray-400">-</span>;
    
    return (
      <div className="text-center">
        <p className="font-semibold text-sm">
          {request.amount} {request.currency?.toUpperCase()}
        </p>
        {request.payment_method_title && (
          <p className="text-xs text-gray-500">{request.payment_method_title}</p>
        )}
      </div>
    );
  };

  const dateTemplate = (props) => {
    const date = new Date(props.created_at);
    return (
      <span className="text-sm">
        {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </span>
    );
  };

  const descriptionTemplate = (props) => {
    const request = props;
    return (
      <div className="text-center">
        <p className="text-sm font-medium truncate max-w-[150px] mx-auto" title={request.title}>
          {request.title}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[150px] mx-auto" title={request.description}>
          {request.description}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Approval Management" title="Pending Requests" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading pending requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Approval Management" title="Pending Requests" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Approval Management" 
        title="Pending Requests" 
      />
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-300 font-semibold">Total Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.total}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 font-semibold">Payment Requests</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.shipping}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 dark:bg-purple-900/20 dark:border-purple-800">
          <p className="text-purple-800 dark:text-purple-300 font-semibold">Support</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.verification}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
          <p className="text-orange-800 dark:text-orange-300 font-semibold">Refunds</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.refund}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-800 dark:text-gray-300 font-semibold">Other</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.other}</p>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchPendingRequests}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Requests Grid */}
      <GridComponent
        dataSource={pendingData}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 10 }}
        height={400}
        enableHover={false}
      >
        <ColumnsDirective>
          <ColumnDirective 
            field="id" 
            headerText="ID" 
            width="80" 
            textAlign="Center" 
            isPrimaryKey={true}
          />
          
          <ColumnDirective 
            headerText="Customer" 
            width="220" 
            textAlign="Left"
            template={customerTemplate}
          />
          
          <ColumnDirective 
            headerText="Request Type" 
            width="140" 
            textAlign="Center"
            template={requestTypeTemplate}
          />
          
          <ColumnDirective 
            headerText="Description" 
            width="180" 
            textAlign="Center"
            template={descriptionTemplate}
          />
          
          <ColumnDirective 
            headerText="Amount" 
            width="120" 
            textAlign="Center"
            template={amountTemplate}
          />
          
          <ColumnDirective 
            field="created_at" 
            headerText="Request Date" 
            width="130" 
            textAlign="Center"
            template={dateTemplate}
          />
          
          <ColumnDirective 
            headerText="Status" 
            width="100" 
            textAlign="Center"
            template={statusTemplate}
          />
          
          <ColumnDirective 
            headerText="Actions" 
            width="180" 
            textAlign="Center"
            template={actionTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default Pending;