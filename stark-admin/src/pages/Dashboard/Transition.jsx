import React, { useState, useMemo } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Toolbar,
  Sort,
  Filter,
  Group,
} from '@syncfusion/ej2-react-grids';
import { Header } from '../../components';
import { transactionsData } from '../../data/transactions';

const Transactions = () => {
  const [transactions, setTransactions] = useState(transactionsData);
  const [filters, setFilters] = useState({
    currency: 'All',
    status: 'All',
    type: 'All',
    direction: 'All',
    startDate: '',
    endDate: '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const toolbarOptions = ['Search', 'Print', 'ExcelExport'];

  const filteredData = useMemo(() => {
    return transactions.filter((txn) => {
      if (filters.currency !== 'All' && txn.Currency !== filters.currency) return false;
      if (filters.status !== 'All' && txn.Status !== filters.status) return false;
      if (filters.type !== 'All' && txn.TransactionType !== filters.type) return false;
      if (filters.direction !== 'All' && txn.Direction !== filters.direction) return false;

      if (filters.startDate && new Date(txn.Timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(txn.Timestamp) > new Date(filters.endDate + 'T23:59:59')) return false;

      return true;
    });
  }, [transactions, filters]);

  const stats = useMemo(() => {
    const totalTransactions = filteredData.length;
    const completedTransactions = filteredData.filter(t => t.Status === 'Completed').length;
    const inflowUSD = filteredData
      .filter((t) => t.Direction === 'Inflow' && t.Status === 'Completed' && t.Currency === 'USD')
      .reduce((sum, t) => sum + t.Amount, 0);

    const outflowUSD = filteredData
      .filter((t) => t.Direction === 'Outflow' && t.Status === 'Completed' && t.Currency === 'USD')
      .reduce((sum, t) => sum + t.Amount, 0);

    const inflowSYP = filteredData
      .filter((t) => t.Direction === 'Inflow' && t.Status === 'Completed' && t.Currency === 'SYP')
      .reduce((sum, t) => sum + t.Amount, 0);

    const outflowSYP = filteredData
      .filter((t) => t.Direction === 'Outflow' && t.Status === 'Completed' && t.Currency === 'SYP')
      .reduce((sum, t) => sum + t.Amount, 0);

    const totalCommissions = filteredData.reduce((sum, t) => sum + t.FeeAmount, 0);
    const pendingTransactions = filteredData.filter((t) => t.Status === 'Pending').length;

    return { 
      totalTransactions, 
      completedTransactions,
      inflowUSD, 
      outflowUSD, 
      inflowSYP, 
      outflowSYP, 
      totalCommissions, 
      pendingTransactions 
    };
  }, [filteredData]);

  const statusTemplate = (props) => {
    const statusConfig = {
      Completed: { color: 'bg-green-100 text-green-800 border border-green-200', icon: '✅' },
      Pending: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '⏳' },
      Failed: { color: 'bg-red-100 text-red-800 border border-red-200', icon: '❌' },
      Reversed: { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: '🔄' },
      Processing: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: '⚙️' },
    };

    const config = statusConfig[props.Status] || statusConfig.Pending;

    return (
      <div className="flex items-center justify-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}>
          {config.icon} {props.Status}
        </span>
      </div>
    );
  };

  const amountTemplate = (props) => {
    const isUSD = props.Currency === 'USD';
    const isInflow = props.Direction === 'Inflow';
    const amountColor = isInflow ? 'text-green-600' : 'text-red-600';
    const symbol = isUSD ? '$' : 'SYP ';
    const amount = isUSD ? props.Amount.toFixed(2) : props.Amount.toLocaleString();

    return (
      <div className="text-right">
        <div className={`font-semibold ${amountColor}`}>
          {isInflow ? '+' : '-'}{symbol}{amount}
        </div>
        {props.FeeAmount > 0 && (
          <div className="text-xs text-gray-500">
            Fee: {symbol}{props.FeeAmount.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  const entityTemplate = (props, field) => {
    const entity = props[field];
    const isUser = entity?.startsWith('User_');
    const isAgent = entity?.startsWith('Agent_');
    const isSystem = entity === 'System';

    let icon = '👤';
    if (isAgent) icon = '🤵';
    if (isSystem) icon = '⚙️';
    if (entity?.includes('Google')) icon = '📱';
    if (entity?.includes('AppStore')) icon = '📱';

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <div>
          <div className="text-sm font-medium">{entity}</div>
          {props[`${field}Name`] && (
            <div className="text-xs text-gray-500">{props[`${field}Name`]}</div>
          )}
        </div>
      </div>
    );
  };

  const sourceTemplate = (props) => entityTemplate(props, 'SourceEntityID');
  const targetTemplate = (props) => entityTemplate(props, 'TargetEntityID');

  const typeTemplate = (props) => {
    const typeIcons = {
      'Agent Top-up': '💰',
      'App Purchase': '🛒',
      'P2P Transfer': '🔄',
      'Fee Deduction': '💸',
      'Refund': '↩️',
      'Wallet Top-up': '💳',
      'Game Purchase': '🎮',
    };

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{typeIcons[props.TransactionType] || '📊'}</span>
        <span className="text-sm font-medium">{props.TransactionType}</span>
      </div>
    );
  };

  const actionsTemplate = (props) => (
    <div className="flex gap-2 justify-center">
      <button
        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium flex items-center gap-1"
        onClick={() => handleViewDetails(props)}
        title="View transaction details"
      >
        👁️ Details
      </button>
      {props.Status === 'Pending' && (
        <button
          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleApprove(props.TransactionID)}
          title="Approve transaction"
        >
          ✅ Approve
        </button>
      )}
      {(props.Status === 'Pending' || props.Status === 'Processing') && (
        <button
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleReject(props.TransactionID)}
          title="Reject transaction"
        >
          ❌ Reject
        </button>
      )}
    </div>
  );

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleApprove = (transactionId) => {
    if (window.confirm('Approve this transaction?')) {
      setTransactions(prev => prev.map(t => 
        t.TransactionID === transactionId ? { ...t, Status: 'Completed' } : t
      ));
    }
  };

  const handleReject = (transactionId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      setTransactions(prev => prev.map(t => 
        t.TransactionID === transactionId ? { ...t, Status: 'Failed', Notes: reason } : t
      ));
    }
  };

  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  const clearFilters = () => {
    setFilters({
      currency: 'All',
      status: 'All',
      type: 'All',
      direction: 'All',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Financial Management" 
        title="Transactions Ledger" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.completedTransactions} completed</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-sm">USD Inflow</p>
          <p className="text-2xl font-bold text-green-600">${stats.inflowUSD.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">Completed</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold text-sm">USD Outflow</p>
          <p className="text-2xl font-bold text-red-600">${stats.outflowUSD.toFixed(2)}</p>
          <p className="text-xs text-red-600 mt-1">Completed</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold text-sm">SYP Inflow</p>
          <p className="text-2xl font-bold text-purple-600">{stats.inflowSYP.toLocaleString()} SYP</p>
          <p className="text-xs text-purple-600 mt-1">Completed</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold text-sm">SYP Outflow</p>
          <p className="text-2xl font-bold text-orange-600">{stats.outflowSYP.toLocaleString()} SYP</p>
          <p className="text-xs text-orange-600 mt-1">Completed</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-800 font-semibold text-sm">Pending</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.pendingTransactions}</p>
          <p className="text-xs text-indigo-600 mt-1">Awaiting action</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Filter Transactions</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium flex items-center gap-2"
            >
              📊 Export
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium flex items-center gap-2"
            >
              🗑️ Clear Filters
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.currency}
              onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="SYP">SYP (Lira)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="All">All Types</option>
              <option value="Agent Top-up">Agent Top-up</option>
              <option value="App Purchase">App Purchase</option>
              <option value="P2P Transfer">P2P Transfer</option>
              <option value="Fee Deduction">Fee Deduction</option>
              <option value="Refund">Refund</option>
              <option value="Wallet Top-up">Wallet Top-up</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.direction}
              onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
            >
              <option value="All">All Directions</option>
              <option value="Inflow">Inflow</option>
              <option value="Outflow">Outflow</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.currency !== 'All' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Currency: {filters.currency}
            </span>
          )}
          {filters.status !== 'All' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Status: {filters.status}
            </span>
          )}
          {filters.type !== 'All' && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Type: {filters.type}
            </span>
          )}
          {filters.direction !== 'All' && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              Direction: {filters.direction}
            </span>
          )}
          {filters.startDate && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              From: {filters.startDate}
            </span>
          )}
          {filters.endDate && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              To: {filters.endDate}
            </span>
          )}
        </div>
      </div>

      <GridComponent
        dataSource={filteredData}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        allowGrouping={true}
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 15 }}
        height={500}
        enableHover={true}
      >
        <ColumnsDirective>
          <ColumnDirective 
            field="TransactionID" 
            headerText="Txn ID" 
            width="120" 
            textAlign="Center" 
            isPrimaryKey={true}
          />
          <ColumnDirective 
            field="Timestamp" 
            headerText="Date/Time" 
            width="180" 
            format={{ type: 'dateTime', format: 'dd/MM/yyyy HH:mm' }} 
          />
          <ColumnDirective 
            headerText="Type" 
            width="160" 
            template={typeTemplate}
          />
          <ColumnDirective 
            headerText="Source" 
            width="180" 
            template={sourceTemplate}
          />
          <ColumnDirective 
            headerText="Destination" 
            width="180" 
            template={targetTemplate}
          />
          <ColumnDirective 
            headerText="Amount & Fee" 
            width="140" 
            template={amountTemplate}
          />
          <ColumnDirective 
            field="Currency" 
            headerText="Currency" 
            width="100" 
            textAlign="Center" 
          />
          <ColumnDirective 
            headerText="Status" 
            width="140" 
            textAlign="Center" 
            template={statusTemplate} 
          />
          <ColumnDirective 
            headerText="Actions" 
            width="200" 
            textAlign="Center" 
            template={actionsTemplate} 
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter, Group]} />
      </GridComponent>

      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{selectedTransaction.TransactionID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedTransaction.TransactionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span>{selectedTransaction.Status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {new Date(selectedTransaction.Timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Financial Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className={`font-bold ${
                      selectedTransaction.Direction === 'Inflow' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedTransaction.Direction === 'Inflow' ? '+' : '-'}
                      {selectedTransaction.Currency === 'USD' ? '$' : 'SYP '}
                      {selectedTransaction.Amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">{selectedTransaction.Currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">
                      {selectedTransaction.Currency === 'USD' ? '$' : 'SYP '}
                      {selectedTransaction.FeeAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Direction:</span>
                    <span className="font-medium">{selectedTransaction.Direction}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Parties Involved</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Source</h4>
                  <p className="text-sm">{selectedTransaction.SourceEntityID}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Destination</h4>
                  <p className="text-sm">{selectedTransaction.TargetEntityID}</p>
                </div>
              </div>
            </div>
            
            {selectedTransaction.Notes && (
              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Notes</h3>
                <p className="text-sm text-yellow-700">{selectedTransaction.Notes}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;