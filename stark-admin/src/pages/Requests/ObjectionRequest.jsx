import React from 'react';
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

import { objectionRequestData } from '../../data/objectionRequest';
import { Header } from '../../components';

const ObjectionRequest = () => {
  const toolbarOptions = ['Search'];

  const handleApproveObjection = (requestId, customerName, reason) => {
    console.log(`Approved objection #${requestId}`);
    if (window.confirm(`Approve objection from ${customerName}?\nReason: ${reason}`)) {
      alert(`Objection #${requestId} approved. Refund/compensation processed.`);
    }
  };

  const handleRejectObjection = (requestId, customerName, reason) => {
    console.log(`Rejected objection #${requestId}`);
    const rejectionReason = prompt(`Please enter reason for rejecting ${customerName}'s objection:\n\nOriginal Reason: ${reason}`);
    if (rejectionReason) {
      alert(`Objection #${requestId} rejected.\nRejection Reason: ${rejectionReason}`);
    }
  };

  const handleViewDetails = (requestId, customerName) => {
    console.log(`Viewing details for objection #${requestId}`);
    alert(`Viewing full details for objection #${requestId} from ${customerName}`);
  };

  const customerTemplate = (props) => {
    const customer = props;
    return (
      <div className="flex items-center gap-3">
        <img
          className="rounded-full w-10 h-10 object-cover"
          src={customer.CustomerImage}
          alt={customer.CustomerName}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/40x40/cccccc/666666?text=User';
          }}
        />
        <div>
          <p className="font-semibold text-sm">{customer.CustomerName}</p>
          <p className="text-xs text-gray-500">{customer.CustomerEmail}</p>
          <p className="text-xs text-gray-400">{customer.CustomerPhone}</p>
        </div>
      </div>
    );
  };

  const statusTemplate = (props) => {
    const status = props.Status;
    const statusConfig = {
      'Under Review': { color: 'bg-orange-500', icon: '🔍' },
      'Investigation': { color: 'bg-yellow-500', icon: '🕵️' },
      'Resolved': { color: 'bg-green-500', icon: '✅' },
      'Rejected': { color: 'bg-red-500', icon: '❌' },
      'Escalated': { color: 'bg-purple-500', icon: '📈' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-500', icon: '❓' };

    return (
      <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  };

  const reasonTemplate = (props) => {
    const reason = props.ObjectionReason;
    const maxLength = 60;
    
    return (
      <div 
        className="text-left cursor-help" 
        title={reason.length > maxLength ? reason : ''}
      >
        <p className="text-sm">
          {reason.length > maxLength ? `${reason.substring(0, maxLength)}...` : reason}
        </p>
        {props.ObjectionType && (
          <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
            props.ObjectionType === 'Product Issue' ? 'bg-red-100 text-red-800' :
            props.ObjectionType === 'Payment Issue' ? 'bg-blue-100 text-blue-800' :
            props.ObjectionType === 'Delivery Issue' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {props.ObjectionType}
          </span>
        )}
      </div>
    );
  };

  const priorityTemplate = (props) => {
    const priority = props.Priority;
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
    const objection = props;
    const isResolved = objection.Status === 'Resolved' || objection.Status === 'Rejected';

    if (isResolved) {
      return (
        <span className="text-gray-400 text-sm">Resolved</span>
      );
    }

    return (
      <div className="flex flex-col gap-2 justify-center">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium"
          onClick={() => handleApproveObjection(objection.RequestID, objection.CustomerName, objection.ObjectionReason)}
        >
          ✓ Approve
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium"
          onClick={() => handleRejectObjection(objection.RequestID, objection.CustomerName, objection.ObjectionReason)}
        >
          ✗ Reject
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium"
          onClick={() => handleViewDetails(objection.RequestID, objection.CustomerName)}
        >
          👁️ Details
        </button>
      </div>
    );
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Customer Support" 
        title="Objection Requests Management" 
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Total Objections</p>
          <p className="text-2xl font-bold text-orange-600">{objectionRequestData.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">High Priority</p>
          <p className="text-2xl font-bold text-red-600">
            {objectionRequestData.filter(item => item.Priority === 'High').length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600">
            {objectionRequestData.filter(item => item.Status === 'Under Review').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {objectionRequestData.filter(item => item.Status === 'Resolved').length}
          </p>
        </div>
      </div>
      
      <GridComponent
        dataSource={objectionRequestData}
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
            field="RequestID" 
            headerText="Objection ID" 
            width="100" 
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
            field="Product" 
            headerText="Product" 
            width="120" 
            textAlign="Center" 
          />
          
          <ColumnDirective 
            headerText="Objection Reason" 
            width="200" 
            textAlign="Left"
            template={reasonTemplate}
          />
          
          <ColumnDirective 
            headerText="Type" 
            width="120" 
            textAlign="Center"
            field="ObjectionType"
          />
          
          <ColumnDirective 
            headerText="Priority" 
            width="100" 
            textAlign="Center"
            template={priorityTemplate}
          />
          
          <ColumnDirective 
            field="RequestDate" 
            headerText="Request Date" 
            width="120" 
            textAlign="Center" 
            format={{ type: 'date', format: 'dd/MM/yyyy' }}
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