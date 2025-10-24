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
import RequestReviewModal from '../../components/RequestReviewModal';
import axiosInstance from '../../utils/axiosConfig';

const RequestsHub = () => {
  const [requestsData, setRequestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    in_progress: 0,
    objection: 0,
    completed: 0,
    rejected: 0,
  });

  const toolbarOptions = ['Search', 'Refresh'];

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestsResponse = await axiosInstance.get('/all_requests/admin/requests/');
      setRequestsData(requestsResponse.data);

      const statsResponse = await axiosInstance.get('/all_requests/admin/requests/stats/');
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requestsData.filter((request) => {
    const statusMatch = filterStatus === 'All' || request.status === filterStatus;
    const typeMatch = filterType === 'All' || request.request_type === filterType;
    return statusMatch && typeMatch;
  });

  const handleReviewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    fetchRequests();
  };

  const handleToolbarClick = (args) => {
    if (args.item.id.includes('Refresh')) {
      fetchRequests();
    }
  };

  const handleUpdateStatus = async (requestId, newStatus, adminNotes = '', rejectionReason = '') => {
    try {
      await axiosInstance.post(`/all_requests/admin/requests/${requestId}/update_status/`, {
        status: newStatus,
        admin_notes: adminNotes,
        rejection_reason: rejectionReason,
      });

      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error updating request status:', err);
      alert('Failed to update request status');
      return false;
    }
  };

  const handleAddComment = async (requestId, comment, isAdminNote = false) => {
    try {
      await axiosInstance.post(`/all_requests/admin/requests/${requestId}/add_comment/`, {
        comment,
        is_admin_note: isAdminNote,
      });

      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
      return false;
    }
  };

  const statusCounts = {
    All: requestsData.length,
    pending: requestsData.filter((r) => r.status === 'pending').length,
    shipping: requestsData.filter((r) => r.status === 'shipping').length,
    in_progress: requestsData.filter((r) => r.status === 'in_progress').length,
    objection: requestsData.filter((r) => r.status === 'objection').length,
    completed: requestsData.filter((r) => r.status === 'completed').length,
    rejected: requestsData.filter((r) => r.status === 'rejected').length,
  };

  const typeCounts = {
    All: requestsData.length,
    payment: requestsData.filter((r) => r.request_type === 'payment').length,
    support: requestsData.filter((r) => r.request_type === 'support').length,
    refund: requestsData.filter((r) => r.request_type === 'refund').length,
    other: requestsData.filter((r) => r.request_type === 'other').length,
  };

  const requestTypeTemplate = (props) => {
    const request = props;
    const typeConfig = {
      payment: { color: 'bg-yellow-100 text-yellow-800', icon: '💳', label: 'Payment' },
      support: { color: 'bg-blue-100 text-blue-800', icon: '🛟', label: 'Support' },
      refund: { color: 'bg-red-100 text-red-800', icon: '↩️', label: 'Refund' },
      other: { color: 'bg-gray-100 text-gray-800', icon: '📋', label: 'Other' },
    };

    const config = typeConfig[request.request_type] || { color: 'bg-gray-100 text-gray-800', icon: '📋', label: request.request_type };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const statusTemplate = (props) => {
    const request = props;
    const statusConfig = {
      pending: { color: 'bg-orange-100 text-orange-800', icon: '⏳', label: 'Pending' },
      shipping: { color: 'bg-yellow-100 text-yellow-800', icon: '🚚', label: 'Shipping' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: '🔍', label: 'In Progress' },
      objection: { color: 'bg-purple-100 text-purple-800', icon: '⚠️', label: 'Objection' },
      completed: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Completed' },
      rejected: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Rejected' },
    };

    const config = statusConfig[request.status] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: request.status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const userTemplate = (props) => {
    const request = props;
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {request.user_name ? request.user_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <p className="font-semibold text-sm">{request.user_name || 'Unknown User'}</p>
          <p className="text-xs text-gray-500">{request.user_email || 'No email'}</p>
          <p className="text-xs text-gray-400">ID: {request.user}</p>
        </div>
      </div>
    );
  };

  const amountTemplate = (props) => {
    const request = props;
    if (!request.amount) return <span className="text-gray-400">-</span>;

    return (
      <span className="font-semibold">
        {request.amount} {request.currency?.toUpperCase() || ''}
      </span>
    );
  };

  const dateTemplate = (props) => {
    const request = props;
    return (
      <span className="text-sm">
        {new Date(request.created_at).toLocaleDateString()}
      </span>
    );
  };

  const actionsTemplate = (props) => {
    const request = props;
    return (
      <button
        type="button"
        onClick={() => handleReviewDetails(request)}
        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium"
      >
        Review
      </button>
    );
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="Request Management" title="Requests Hub" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading requests data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="Request Management" title="Requests Hub" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
          <button
            type="button"
            onClick={fetchRequests}
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
      <Header
        category="Request Management"
        title="Requests Hub"
      />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Requests</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {Object.entries(statusCounts).map(([status, count]) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {Object.entries(typeCounts).map(([type, count]) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => { setFilterStatus('All'); setFilterType('All'); }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {filteredRequests.length > 0 ? (
        <GridComponent
          dataSource={filteredRequests}
          allowPaging
          allowSorting
          allowFiltering
          pageSettings={{ pageSize: 10 }}
          toolbar={toolbarOptions}
          height={400}
          enableHover={false}
          toolbarClick={handleToolbarClick}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="id"
              headerText="Request ID"
              width="120"
              textAlign="Center"
              isPrimaryKey
            />

            <ColumnDirective
              headerText="User"
              width="200"
              textAlign="Left"
              template={userTemplate}
            />

            <ColumnDirective
              headerText="Request Type"
              width="150"
              textAlign="Center"
              template={requestTypeTemplate}
            />

            <ColumnDirective
              headerText="Status"
              width="130"
              textAlign="Center"
              template={statusTemplate}
            />

            <ColumnDirective
              headerText="Title"
              field="title"
              width="180"
              textAlign="Left"
            />

            <ColumnDirective
              headerText="Amount"
              width="120"
              textAlign="Center"
              template={amountTemplate}
            />

            <ColumnDirective
              headerText="Submitted"
              width="120"
              textAlign="Center"
              template={dateTemplate}
            />

            <ColumnDirective
              headerText="Actions"
              width="100"
              textAlign="Center"
              template={actionsTemplate}
            />
          </ColumnsDirective>
          <Inject services={[Page, Toolbar, Sort, Filter]} />
        </GridComponent>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">No requests found</p>
          <p className="text-gray-400 mt-2">
            {requestsData.length === 0
              ? 'There are no requests in the system yet.'
              : 'No requests match your current filters.'}
          </p>
        </div>
      )}

      {selectedRequest && (
        <RequestReviewModal
          request={selectedRequest}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default RequestsHub;
