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

import { inProgressData } from '../../data/inProgress';
import { Header } from '../../components';

const InProgress = () => {
  const toolbarOptions = ['Search'];

  const handleApprovePayment = (transactionId, customerName, amount) => {
    console.log(`Approved transaction #${transactionId}`);
    if (window.confirm(`Approve payment of $${amount} from ${customerName}?`)) {
      alert(`Payment #${transactionId} approved successfully!`);
    }
  };

  const handleRejectPayment = (transactionId, customerName) => {
    console.log(`Rejected transaction #${transactionId}`);
    const reason = prompt(`Please enter reason for rejecting ${customerName}'s payment:`);
    if (reason) {
      alert(`Payment #${transactionId} rejected. Reason: ${reason}`);
    }
  };

  const handleViewDetails = (transactionId) => {
    console.log(`Viewing details for transaction #${transactionId}`);
    alert(`Opening details for transaction #${transactionId}`);
  };

  const handleEscalate = (transactionId, customerName) => {
    console.log(`Escalated transaction #${transactionId}`);
    if (window.confirm(`Escalate transaction #${transactionId} from ${customerName} to supervisor?`)) {
      alert(`Transaction #${transactionId} escalated to supervisor!`);
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

  const statusTemplate = (props) => {
    const status = props.Status;
    const statusConfig = {
      'Pending': { color: 'bg-yellow-500', icon: '⏳', progress: 25 },
      'Processing': { color: 'bg-blue-500', icon: '⚙️', progress: 50 },
      'Under Review': { color: 'bg-orange-500', icon: '🔍', progress: 75 },
      'Awaiting Funds': { color: 'bg-purple-500', icon: '💰', progress: 40 },
      'Verifying': { color: 'bg-indigo-500', icon: '✅', progress: 60 }
    };

    const config = statusConfig[status] || { color: 'bg-gray-500', icon: '❓', progress: 0 };

    return (
      <div className="text-center">
        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${config.color} mb-1 inline-block`}>
          {config.icon} {status}
        </span>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${config.color}`} 
            style={{ width: `${config.progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const amountTemplate = (props) => {
    const isUSD = props.Currency === 'USD';
    const amountColor = isUSD ? 'text-green-600' : 'text-blue-600';
    const currencySymbol = isUSD ? '$' : 'SYP';
    
    return (
      <div className="text-center">
        <p className={`text-sm font-bold ${amountColor}`}>
          {currencySymbol}{props.Amount.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{props.Currency} Wallet</p>
      </div>
    );
  };

  const agentTemplate = (props) => {
    return (
      <div className="text-center">
        <p className="text-sm font-medium">{props.AgentName}</p>
        <p className="text-xs text-gray-500">Agent ID: {props.AgentID}</p>
      </div>
    );
  };

  const actionTemplate = (props) => {
    const transaction = props;
    const canApprove = transaction.Status === 'Pending' || transaction.Status === 'Processing';
    const canEscalate = transaction.Amount > 1000;

    return (
      <div className="flex flex-col gap-2 justify-center">
        {canApprove && (
          <button
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium"
            onClick={() => handleApprovePayment(transaction.TransactionID, transaction.CustomerName, transaction.Amount)}
          >
            ✓ Approve
          </button>
        )}
        
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium"
          onClick={() => handleViewDetails(transaction.TransactionID)}
        >
          👁️ Details
        </button>
        
        {canEscalate && (
          <button
            className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-xs font-medium"
            onClick={() => handleEscalate(transaction.TransactionID, transaction.CustomerName)}
          >
            ⚠️ Escalate
          </button>
        )}
        
        <button
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium"
          onClick={() => handleRejectPayment(transaction.TransactionID, transaction.CustomerName)}
        >
          ✗ Reject
        </button>
      </div>
    );
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Payment Management" 
        title="Transactions In Progress" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Pending</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressData.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">USD Transactions</p>
          <p className="text-2xl font-bold text-green-600">
            ${inProgressData.filter(item => item.Currency === 'USD')
              .reduce((sum, item) => sum + item.Amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">SYP Transactions</p>
          <p className="text-2xl font-bold text-purple-600">
            SYP{inProgressData.filter(item => item.Currency === 'SYP')
              .reduce((sum, item) => sum + item.Amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Under Review</p>
          <p className="text-2xl font-bold text-orange-600">
            {inProgressData.filter(item => item.Status === 'Under Review').length}
          </p>
        </div>
      </div>
      
      <GridComponent
        dataSource={inProgressData}
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
            field="TransactionID" 
            headerText="Transaction ID" 
            width="120" 
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
            headerText="Agent" 
            width="150" 
            textAlign="Center"
            template={agentTemplate}
          />
          
          <ColumnDirective 
            field="TransactionType" 
            headerText="Type" 
            width="120" 
            textAlign="Center" 
          />
          
          <ColumnDirective 
            headerText="Amount" 
            width="140" 
            textAlign="Center"
            template={amountTemplate}
          />
          
          <ColumnDirective 
            field="PaymentMethod" 
            headerText="Payment Method" 
            width="140" 
            textAlign="Center" 
          />
          
          <ColumnDirective 
            headerText="Status" 
            width="150" 
            textAlign="Center"
            template={statusTemplate}
          />
          
          <ColumnDirective 
            field="CreatedDate" 
            headerText="Date" 
            width="120" 
            textAlign="Center" 
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