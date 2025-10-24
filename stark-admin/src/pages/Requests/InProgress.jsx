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

const InProgress = () => {
  const [inProgressData, setInProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    usdTotal: 0,
    sypTotal: 0,
    underReview: 0,
  });
  const toolbarOptions = ['Search'];

  useEffect(() => {
    fetchInProgressRequests();
  }, []);

  const fetchInProgressRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/all_requests/admin/requests/?status=in_progress');
      const requests = response.data;
      setInProgressData(requests);
      calculateStats(requests);
    } catch (err) {
      setError('Failed to load in-progress requests');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requests) => {
    const usdRequests = requests.filter((item) => item.currency === 'usd');
    const sypRequests = requests.filter((item) => item.currency === 'syp');

    const newStats = {
      total: requests.length,
      usdTotal: usdRequests.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
      sypTotal: sypRequests.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
      underReview: requests.filter((item) => item.status === 'in_progress' || item.description?.toLowerCase().includes('review')).length,
    };
    setStats(newStats);
  };

  const handleApprovePayment = async (requestId, customerName, amount, currency) => {
    if (window.confirm(`Approve payment of ${amount} ${currency?.toUpperCase()} from ${customerName}?`)) {
      try {
        await axiosInstance.post(`/all_requests/admin/requests/${requestId}/update_status/`, {
          status: 'completed',
          admin_notes: 'Payment approved and processed',
        });

        alert(`Payment #${requestId} approved successfully!`);
        fetchInProgressRequests();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to approve payment';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleRejectPayment = async (requestId, customerName) => {
    const reason = prompt(`Please enter reason for rejecting ${customerName}'s payment:`);
    if (!reason) return;

    try {
      await axiosInstance.post(`/all_requests/admin/requests/${requestId}/update_status/`, {
        status: 'rejected',
        admin_notes: reason,
        rejection_reason: reason,
      });

      alert(`Payment #${requestId} rejected. Reason: ${reason}`);
      fetchInProgressRequests();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reject payment';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const response = await axiosInstance.get(`/all_requests/admin/requests/${requestId}/`);
      const requestDetails = response.data;

      const details = `
Request ID: ${requestId}
Customer: ${requestDetails.user_name}
Title: ${requestDetails.title}
Description: ${requestDetails.description}
Amount: ${requestDetails.amount || 'N/A'} ${requestDetails.currency?.toUpperCase() || ''}
Payment Method: ${requestDetails.payment_method_title || 'N/A'}
Status: ${requestDetails.status}
Created: ${new Date(requestDetails.created_at).toLocaleDateString()}
Comments: ${requestDetails.comments?.length || 0}
      `;

      alert(`Request Details #${requestId}\n\n${details}`);
    } catch (err) {
      alert(`Error loading details for request #${requestId}`);
    }
  };

  const handleEscalate = async (requestId, customerName) => {
    if (window.confirm(`Escalate request #${requestId} from ${customerName} to supervisor?`)) {
      try {
        await axiosInstance.post(`/all_requests/admin/requests/${requestId}/add_comment/`, {
          comment: 'ESCALATED: Request escalated to supervisor for further review.',
          is_admin_note: true,
        });

        alert(`Request #${requestId} escalated to supervisor!`);
        fetchInProgressRequests();
      } catch (err) {
        alert(`Error escalating request #${requestId}`);
      }
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

  const getStatusConfig = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: '⏳', label: 'Pending', progress: 25 },
      in_progress: { color: 'bg-blue-500', icon: '⚙️', label: 'Processing', progress: 50 },
      objection: { color: 'bg-orange-500', icon: '🔍', label: 'Under Review', progress: 75 },
      shipping: { color: 'bg-purple-500', icon: '💰', label: 'Awaiting Funds', progress: 40 },
      completed: { color: 'bg-green-500', icon: '✅', label: 'Completed', progress: 100 },
    };
    return statusConfig[status] || { color: 'bg-gray-500', icon: '❓', label: status, progress: 0 };
  };

  const statusTemplate = (props) => {
    const request = props;
    const config = getStatusConfig(request.status);

    return (
      <div className="text-center">
        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${config.color} mb-1 inline-block`}>
          {config.icon} {config.label}
        </span>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${config.color}`}
            style={{ width: `${config.progress}%` }}
          />
        </div>
      </div>
    );
  };

  const amountTemplate = (props) => {
    const request = props;
    if (!request.amount) return <span className="text-gray-400">-</span>;

    const isUSD = request.currency === 'usd';
    const amountColor = isUSD ? 'text-green-600' : 'text-blue-600';
    const currencySymbol = isUSD ? '$' : 'SYP';

    return (
      <div className="text-center">
        <p className={`text-sm font-bold ${amountColor}`}>
          {currencySymbol}{parseFloat(request.amount).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{request.currency?.toUpperCase()} {request.request_type === 'payment' ? 'Payment' : 'Request'}</p>
      </div>
    );
  };

  const agentTemplate = (props) => {
    const request = props;
    const agent = request.user?.agent;

    if (!agent) {
      return (
        <div className="text-center">
          <p className="text-sm text-gray-400">No Agent</p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-sm font-medium">{agent.full_name}</p>
        <p className="text-xs text-gray-500">ID: {agent.agent_code}</p>
      </div>
    );
  };

  const getRequestTypeConfig = (requestType) => {
    const typeConfig = {
      payment: { color: 'bg-green-100 text-green-800', label: 'Payment' },
      support: { color: 'bg-blue-100 text-blue-800', label: 'Support' },
      refund: { color: 'bg-orange-100 text-orange-800', label: 'Refund' },
      other: { color: 'bg-gray-100 text-gray-800', label: 'Other' },
    };
    return typeConfig[requestType] || { color: 'bg-gray-100 text-gray-800', label: requestType };
  };

  const requestTypeTemplate = (props) => {
    const request = props;
    const config = getRequestTypeConfig(request.request_type);

    return (
      <div className="text-center">
        <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
        {request.payment_method_title && (
          <p className="text-xs text-gray-500 mt-1">{request.payment_method_title}</p>
        )}
      </div>
    );
  };

  const actionTemplate = (props) => {
    const request = props;
    const canApprove = request.status === 'pending' || request.status === 'in_progress';
    const canEscalate = request.amount > 500;

    return (
      <div className="flex flex-col gap-2 justify-center">
        {canApprove && (
          <button
            type="button"
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium"
            onClick={() => handleApprovePayment(request.id, request.user_name, request.amount, request.currency)}
          >
            ✓ Approve
          </button>
        )}

        <button
          type="button"
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium"
          onClick={() => handleViewDetails(request.id)}
        >
          👁️ Details
        </button>

        {canEscalate && (
          <button
            type="button"
            className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-xs font-medium"
            onClick={() => handleEscalate(request.id, request.user_name)}
          >
            ⚠️ Escalate
          </button>
        )}

        <button
          type="button"
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium"
          onClick={() => handleRejectPayment(request.id, request.user_name)}
        >
          ✗ Reject
        </button>
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
          day: 'numeric',
        })}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Payment Management" title="Transactions In Progress" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading in-progress requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Payment Management" title="Transactions In Progress" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header
        category="Payment Management"
        title="Transactions In Progress"
      />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={fetchInProgressRequests}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 font-semibold">Total In Progress</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-800 dark:text-green-300 font-semibold">USD Total</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${stats.usdTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 dark:bg-purple-900/20 dark:border-purple-800">
          <p className="text-purple-800 dark:text-purple-300 font-semibold">SYP Total</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            SYP{stats.sypTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
          <p className="text-orange-800 dark:text-orange-300 font-semibold">Under Review</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.underReview}</p>
        </div>
      </div>

      <GridComponent
        dataSource={inProgressData}
        allowPaging
        allowSorting
        allowFiltering
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
            isPrimaryKey
          />

          <ColumnDirective
            headerText="Customer"
            width="220"
            textAlign="Left"
            template={customerTemplate}
          />

          <ColumnDirective
            headerText="Agent"
            width="150"
            textAlign="Center"
            template={agentTemplate}
          />

          <ColumnDirective
            headerText="Type"
            width="120"
            textAlign="Center"
            template={requestTypeTemplate}
          />

          <ColumnDirective
            headerText="Amount"
            width="140"
            textAlign="Center"
            template={amountTemplate}
          />

          <ColumnDirective
            field="title"
            headerText="Description"
            width="160"
            textAlign="Center"
          />

          <ColumnDirective
            headerText="Status"
            width="150"
            textAlign="Center"
            template={statusTemplate}
          />

          <ColumnDirective
            field="created_at"
            headerText="Date"
            width="120"
            textAlign="Center"
            template={dateTemplate}
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

export default InProgress;
