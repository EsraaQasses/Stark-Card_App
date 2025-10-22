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

const ObjectionRequest = () => {
  const [objectionData, setObjectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    underReview: 0,
    resolved: 0
  });
  const toolbarOptions = ['Search'];

  // Fetch objection requests from backend
  useEffect(() => {
    fetchObjectionRequests();
  }, []);

  const fetchObjectionRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch requests with objection status
      const response = await axiosInstance.get('/all_requests/admin/requests/?status=objection');
      const requests = response.data;
      setObjectionData(requests);
      calculateStats(requests);
    } catch (error) {
      console.error('Error fetching objection requests:', error);
      setError('Failed to load objection requests');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requests) => {
    const stats = {
      total: requests.length,
      highPriority: requests.filter(item => 
        item.description?.toLowerCase().includes('urgent') || 
        item.title?.toLowerCase().includes('urgent') ||
        item.amount > 500 // Consider high amount as high priority
      ).length,
      underReview: requests.filter(item => item.status === 'objection').length,
      resolved: requests.filter(item => item.status === 'completed' && item.request_type === 'support').length
    };
    setStats(stats);
  };

  const handleApproveObjection = async (requestId, customerName, reason) => {
    if (window.confirm(`Approve objection from ${customerName}?\nReason: ${reason}`)) {
      try {
        await axiosInstance.post(`/all_requests/admin/requests/${requestId}/update_status/`, {
          status: 'completed',
          admin_notes: 'Objection approved and resolved'
        });
        
        alert(`Objection #${requestId} approved. Refund/compensation processed.`);
        fetchObjectionRequests(); // Refresh data
      } catch (error) {
        console.error('Error approving objection:', error);
        const errorMessage = error.response?.data?.message || 'Failed to approve objection';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleRejectObjection = async (requestId, customerName, reason) => {
    const rejectionReason = prompt(`Please enter reason for rejecting ${customerName}'s objection:\n\nOriginal Reason: ${reason}`);
    if (!rejectionReason) return;

    try {
      await axiosInstance.post(`/all_requests/admin/requests/${requestId}/update_status/`, {
        status: 'rejected',
        admin_notes: rejectionReason,
        rejection_reason: rejectionReason
      });
      
      alert(`Objection #${requestId} rejected.\nRejection Reason: ${rejectionReason}`);
      fetchObjectionRequests(); // Refresh data
    } catch (error) {
      console.error('Error rejecting objection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject objection';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleViewDetails = async (requestId, customerName) => {
    try {
      // Fetch detailed request information including comments
      const response = await axiosInstance.get(`/all_requests/admin/requests/${requestId}/`);
      const requestDetails = response.data;
      
      // Show details in alert or you can create a modal for better UX
      const details = `
Customer: ${customerName}
Title: ${requestDetails.title}
Description: ${requestDetails.description}
Amount: ${requestDetails.amount || 'N/A'} ${requestDetails.currency || ''}
Created: ${new Date(requestDetails.created_at).toLocaleDateString()}
Status: ${requestDetails.status}
Comments: ${requestDetails.comments?.length || 0}
      `;
      
      alert(`Objection Details #${requestId}\n\n${details}`);
    } catch (error) {
      console.error('Error fetching request details:', error);
      alert(`Error loading details for objection #${requestId}`);
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

  const statusTemplate = (props) => {
    const request = props;
    const statusConfig = {
      'objection': { color: 'bg-orange-500', icon: '🔍', label: 'Under Review' },
      'in_progress': { color: 'bg-yellow-500', icon: '🕵️', label: 'Investigation' },
      'completed': { color: 'bg-green-500', icon: '✅', label: 'Resolved' },
      'rejected': { color: 'bg-red-500', icon: '❌', label: 'Rejected' },
      'pending': { color: 'bg-purple-500', icon: '📈', label: 'Escalated' }
    };

    const config = statusConfig[request.status] || { color: 'bg-gray-500', icon: '❓', label: request.status };

    return (
      <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${config.color}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const reasonTemplate = (props) => {
    const request = props;
    const reason = request.description || request.title;
    const maxLength = 60;
    
    // Determine objection type based on content
    const getObjectionType = (req) => {
      const desc = (req.description || '').toLowerCase();
      const title = (req.title || '').toLowerCase();
      
      if (desc.includes('product') || title.includes('product')) return 'Product Issue';
      if (desc.includes('payment') || title.includes('payment')) return 'Payment Issue';
      if (desc.includes('delivery') || desc.includes('shipping')) return 'Delivery Issue';
      if (desc.includes('refund')) return 'Refund Request';
      return 'General Issue';
    };

    const objectionType = getObjectionType(request);
    
    return (
      <div 
        className="text-left cursor-help" 
        title={reason.length > maxLength ? reason : ''}
      >
        <p className="text-sm">
          {reason.length > maxLength ? `${reason.substring(0, maxLength)}...` : reason}
        </p>
        <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
          objectionType === 'Product Issue' ? 'bg-red-100 text-red-800' :
          objectionType === 'Payment Issue' ? 'bg-blue-100 text-blue-800' :
          objectionType === 'Delivery Issue' ? 'bg-yellow-100 text-yellow-800' :
          objectionType === 'Refund Request' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {objectionType}
        </span>
      </div>
    );
  };

  const priorityTemplate = (props) => {
    const request = props;
    
    // Determine priority based on amount and content
    const getPriority = (req) => {
      if (req.amount > 500) return 'High';
      if ((req.description || '').toLowerCase().includes('urgent')) return 'High';
      if (req.amount > 100) return 'Medium';
      return 'Low';
    };

    const priority = getPriority(request);
    const priorityConfig = {
      'High': { color: 'bg-red-100 text-red-800', icon: '🔴' },
      'Medium': { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      'Low': { color: 'bg-green-100 text-green-800', icon: '🟢' }
    };

    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', icon: '⚪' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {priority}
      </span>
    );
  };

  const actionTemplate = (props) => {
    const request = props;
    const isResolved = request.status === 'completed' || request.status === 'rejected';

    if (isResolved) {
      return (
        <span className="text-gray-400 text-sm capitalize">{request.status}</span>
      );
    }

    return (
      <div className="flex flex-col gap-2 justify-center">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium"
          onClick={() => handleApproveObjection(request.id, request.user_name, request.description)}
        >
          ✓ Approve
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium"
          onClick={() => handleRejectObjection(request.id, request.user_name, request.description)}
        >
          ✗ Reject
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium"
          onClick={() => handleViewDetails(request.id, request.user_name)}
        >
          👁️ Details
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
          day: 'numeric'
        })}
      </span>
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Customer Support" title="Objection Requests Management" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading objection requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Customer Support" title="Objection Requests Management" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Customer Support" 
        title="Objection Requests Management" 
      />
      
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchObjectionRequests}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
          <p className="text-orange-800 dark:text-orange-300 font-semibold">Total Objections</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.total}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-300 font-semibold">High Priority</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highPriority}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-300 font-semibold">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.underReview}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-800 dark:text-green-300 font-semibold">Resolved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
        </div>
      </div>
      
      <GridComponent
        dataSource={objectionData}
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
            field="title" 
            headerText="Title" 
            width="150" 
            textAlign="Center" 
          />
          
          <ColumnDirective 
            headerText="Objection Reason" 
            width="200" 
            textAlign="Left"
            template={reasonTemplate}
          />
          
          <ColumnDirective 
            headerText="Amount" 
            width="100" 
            textAlign="Center"
            template={amountTemplate}
          />
          
          <ColumnDirective 
            headerText="Priority" 
            width="100" 
            textAlign="Center"
            template={priorityTemplate}
          />
          
          <ColumnDirective 
            field="created_at" 
            headerText="Request Date" 
            width="120" 
            textAlign="Center"
            template={dateTemplate}
          />
          
          <ColumnDirective 
            headerText="Status" 
            width="130" 
            textAlign="Center"
            template={statusTemplate}
          />
          
          <ColumnDirective 
            headerText="Actions" 
            width="150" 
            textAlign="Center"
            template={actionTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default ObjectionRequest;
