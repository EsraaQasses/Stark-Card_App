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

import { shippingRequestsData } from '../../data/shippingRequests';
import { Header } from '../../components';

const ShippingRequests = () => {
  const toolbarOptions = ['Search'];

  const handleApprove = (requestId) => {
    console.log(`Approved request #${requestId}`);
    alert(`Shipping request #${requestId} approved successfully!`);
  };

  const handleReject = (requestId) => {
    console.log(`Rejected request #${requestId}`);
    alert(`Shipping request #${requestId} rejected.`);
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
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Shipped': 'bg-blue-100 text-blue-800',
      'Delivered': 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const actionTemplate = (props) => {
    const request = props;
    const isPending = request.Status === 'Pending';

    if (!isPending) {
      return (
        <span className="text-gray-400 text-sm">Completed</span>
      );
    }

    return (
      <div className="flex gap-2 justify-center">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs"
          onClick={() => handleApprove(request.RequestID)}
        >
          Approve
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs"
          onClick={() => handleReject(request.RequestID)}
        >
          Reject
        </button>
      </div>
    );
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Shipping" title="Shipping Requests Management" />
      
      <GridComponent
        dataSource={shippingRequestsData}
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
            field="Product" 
            headerText="Product" 
            width="160" 
            textAlign="Center" 
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
            field="Date" 
            headerText="Request Date" 
            width="120" 
            textAlign="Center" 
            format={{ type: 'date', format: 'dd/MM/yyyy' }}
          />
          
          <ColumnDirective 
            field="Status" 
            headerText="Status" 
            width="110" 
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

export default ShippingRequests;