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

import { pendingData } from '../../data/pending';
import { Header } from '../../components';

const Pending = () => {
  const toolbarOptions = ['Search'];

  const handleApprove = (requestId, customerName) => {
    console.log(`Approved request #${requestId}`);
    alert(`Request #${requestId} from ${customerName} approved successfully!`);
  };

  const handleReject = (requestId, customerName) => {
    console.log(`Rejected request #${requestId}`);
    const reason = prompt(`Please enter reason for rejecting ${customerName}'s request:`);
    if (reason) {
      alert(`Request #${requestId} rejected. Reason: ${reason}`);
    }
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
          onClick={() => handleApprove(request.RequestID, request.CustomerName)}
        >
          ✓ Approve
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium"
          onClick={() => handleReject(request.RequestID, request.CustomerName)}
        >
          ✗ Reject
        </button>
      </div>
    );
  };
  const requestTypeTemplate = (props) => {
    const request = props;
    const isShipping = request.RequestType === 'Shipping';
    const isVerification = request.RequestType === 'Verification';
    const isRefund = request.RequestType === 'Refund';
    
    return (
      <div className="text-center">
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          isShipping ? 'bg-blue-100 text-blue-800' :
          isVerification ? 'bg-purple-100 text-purple-800' :
          isRefund ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {request.RequestType}
        </span>
        {request.Product && (
          <p className="text-xs text-gray-600 mt-1">{request.Product}</p>
        )}
      </div>
    );
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Approval Management" 
        title="Pending Requests" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">Total Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingData.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Shipping Requests</p>
          <p className="text-2xl font-bold text-blue-600">
            {pendingData.filter(item => item.RequestType === 'Shipping').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">Verifications</p>
          <p className="text-2xl font-bold text-purple-600">
            {pendingData.filter(item => item.RequestType === 'Verification').length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Refunds</p>
          <p className="text-2xl font-bold text-orange-600">
            {pendingData.filter(item => item.RequestType === 'Refund').length}
          </p>
        </div>
      </div>
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
            field="RequestID" 
            headerText="Request ID" 
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
            headerText="Request Type" 
            width="140" 
            textAlign="Center"
            template={requestTypeTemplate}
          />
          
          <ColumnDirective 
            field="Destination" 
            headerText="Destination" 
            width="120" 
            textAlign="Center" 
          />
          
          <ColumnDirective 
            field="Country" 
            headerText="Country" 
            width="100" 
            textAlign="Center" 
          />
          
          <ColumnDirective 
            field="RequestDate" 
            headerText="Request Date" 
            width="120" 
            textAlign="Center" 
            format={{ type: 'date', format: 'dd/MM/yyyy' }}
          />
          
          <ColumnDirective 
            field="Amount" 
            headerText="Amount" 
            width="100" 
            textAlign="Center" 
            format="C2"
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