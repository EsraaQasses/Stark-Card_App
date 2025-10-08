import React, { useState } from 'react';
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

import { requestsData } from '../../data/requestsData';
import { Header } from '../../components';
import RequestReviewModal from '../../components/RequestReviewModal';

const RequestsHub = () => {
  const toolbarOptions = ['Search'];
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const filteredRequests = requestsData.filter(request => {
    const statusMatch = filterStatus === 'All' || request.Status === filterStatus;
    const typeMatch = filterType === 'All' || request.RequestType === filterType;
    return statusMatch && typeMatch;
  });

  const handleReviewDetails = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const statusCounts = {
    All: requestsData.length,
    'Pending Review': requestsData.filter(r => r.Status === 'Pending Review').length,
    'Awaiting Documents': requestsData.filter(r => r.Status === 'Awaiting Documents').length,
    'Under Review': requestsData.filter(r => r.Status === 'Under Review').length,
    'Approved': requestsData.filter(r => r.Status === 'Approved').length,
    'Rejected': requestsData.filter(r => r.Status === 'Rejected').length,
  };

  const typeCounts = {
    All: requestsData.length,
    'Agent Application': requestsData.filter(r => r.RequestType === 'Agent Application').length,
    'Manual Payment': requestsData.filter(r => r.RequestType === 'Manual Payment').length,
    'Payout': requestsData.filter(r => r.RequestType === 'Payout').length,
    'Refund': requestsData.filter(r => r.RequestType === 'Refund').length,
    'Verification': requestsData.filter(r => r.RequestType === 'Verification').length,
  };

  const requestTypeTemplate = (props) => {
    const request = props;
    const typeConfig = {
      'Agent Application': { color: 'bg-blue-100 text-blue-800', icon: '👤' },
      'Manual Payment': { color: 'bg-yellow-100 text-yellow-800', icon: '💳' },
      'Payout': { color: 'bg-purple-100 text-purple-800', icon: '💰' },
      'Refund': { color: 'bg-red-100 text-red-800', icon: '↩️' },
      'Verification': { color: 'bg-green-100 text-green-800', icon: '✅' }
    };

    const config = typeConfig[request.RequestType] || { color: 'bg-gray-100 text-gray-800', icon: '📋' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        {config.icon} {request.RequestType}
      </span>
    );
  };

  const statusTemplate = (props) => {
    const request = props;
    const statusConfig = {
      'Pending Review': { color: 'bg-orange-100 text-orange-800', icon: '⏳' },
      'Awaiting Documents': { color: 'bg-yellow-100 text-yellow-800', icon: '📄' },
      'Under Review': { color: 'bg-blue-100 text-blue-800', icon: '🔍' },
      'Approved': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[request.Status] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        {config.icon} {request.Status}
      </span>
    );
  };

  const priorityTemplate = (props) => {
    const request = props;
    const priorityConfig = {
      'High': { color: 'bg-red-100 text-red-800', icon: '🔴' },
      'Medium': { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      'Low': { color: 'bg-green-100 text-green-800', icon: '🟢' }
    };

    const config = priorityConfig[request.Priority] || { color: 'bg-gray-100 text-gray-800', icon: '⚪' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        {config.icon} {request.Priority}
      </span>
    );
  };

  const userTemplate = (props) => {
    const request = props;
    return (
      <div className="flex items-center gap-3">
        <img
          className="rounded-full w-8 h-8 object-cover"
          src={request.UserImage}
          alt={request.UserName}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/32x32/cccccc/666666?text=U';
          }}
        />
        <div>
          <p className="font-semibold text-sm">{request.UserName}</p>
          <p className="text-xs text-gray-500">{request.UserEmail}</p>
          <p className="text-xs text-gray-400">ID: {request.UserID}</p>
        </div>
      </div>
    );
  };

  const actionsTemplate = (props) => {
    const request = props;
    return (
      <button
        onClick={() => handleReviewDetails(request)}
        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium"
      >
        Review
      </button>
    );
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Request Management" 
        title="Requests Hub" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Requests</p>
          <p className="text-2xl font-bold text-blue-600">{requestsData.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Pending Review</p>
          <p className="text-2xl font-bold text-orange-600">{statusCounts['Pending Review']}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">Awaiting Documents</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts['Awaiting Documents']}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">High Priority</p>
          <p className="text-2xl font-bold text-red-600">
            {requestsData.filter(r => r.Priority === 'High').length}
          </p>
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
                {status} ({count})
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
                {type} ({count})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={() => { setFilterStatus('All'); setFilterType('All'); }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <GridComponent
        dataSource={filteredRequests}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        pageSettings={{ pageSize: 10 }}
        toolbar={toolbarOptions}
        height={400}
        enableHover={false}
      >
        <ColumnsDirective>
          <ColumnDirective 
            field="RequestID" 
            headerText="Request ID" 
            width="120" 
            textAlign="Center" 
            isPrimaryKey={true}
          />
          
          <ColumnDirective 
            headerText="User" 
            width="200" 
            textAlign="Left"
            template={userTemplate}
          />
          
          <ColumnDirective 
            headerText="Request Type" 
            width="180" 
            textAlign="Center"
            template={requestTypeTemplate}
          />
          
          <ColumnDirective 
            headerText="Status" 
            width="150" 
            textAlign="Center"
            template={statusTemplate}
          />
          
          <ColumnDirective 
            field="SubmittedDate" 
            headerText="Submitted" 
            width="120" 
            textAlign="Center" 
            format="dd/MM/yyyy"
          />
          
          <ColumnDirective 
            field="Amount" 
            headerText="Amount" 
            width="120" 
            textAlign="Center" 
          />
          
          <ColumnDirective 
            headerText="Priority" 
            width="100" 
            textAlign="Center"
            template={priorityTemplate}
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

      {selectedRequest && (
        <RequestReviewModal
          request={selectedRequest}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RequestsHub;