import React, { useState, useEffect, useMemo } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Toolbar,
  Sort,
  Filter,
  Group
} from '@syncfusion/ej2-react-grids';
import { Header } from '.';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';

const FullPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    status: 'All',
    currency: 'All',
    dateRange: 'All',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });

  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    successPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    averageAmount: 0
  });

  const toolbarOptions = ['Search', 'Print', 'ExcelExport'];

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('payment/history/');
      const paymentsData = response.data.results || response.data;
      setPayments(paymentsData);
      calculateStats(paymentsData);
    } catch (fetchError) {
      const errorMessage = fetchError.response?.data?.detail
        || fetchError.response?.data?.error
        || 'Failed to fetch payments';
      setError(errorMessage);
      console.error('Error fetching payments:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData) => {
    const totalPayments = paymentsData.length;
    const successPayments = paymentsData.filter((p) => p.status === 'success').length;
    const pendingPayments = paymentsData.filter((p) => p.status === 'pending' || p.status === 'processing').length;
    const failedPayments = paymentsData.filter((p) => p.status === 'failed' || p.status === 'cancelled').length;

    const totalAmount = paymentsData
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + parseFloat(p.final_price), 0);

    const averageAmount = successPayments > 0 ? totalAmount / successPayments : 0;

    setStats({
      totalPayments,
      totalAmount,
      successPayments,
      pendingPayments,
      failedPayments,
      averageAmount
    });
  };

  const filteredData = useMemo(() => {
    let filtered = payments;

    if (filters.status !== 'All') {
      filtered = filtered.filter((payment) => payment.status === filters.status);
    }

    if (filters.currency !== 'All') {
      filtered = filtered.filter((payment) => payment.wallet_currency === filters.currency);
    }

    if (filters.startDate) {
      filtered = filtered.filter((payment) => new Date(payment.created_at) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter((payment) => new Date(payment.created_at) <= new Date(`${filters.endDate}T23:59:59`));
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((payment) => 
        payment.user_name?.toLowerCase().includes(query)
        || payment.store_product_name?.toLowerCase().includes(query)
        || payment.external_transaction_id?.toLowerCase().includes(query)
        || payment.id.toString().includes(query)
      );
    }

    return filtered.map((payment) => ({
      id: payment.id,
      PaymentID: `PAY-${payment.id.toString().padStart(6, '0')}`,
      UserName: payment.user_name || `User #${payment.user}`,
      ProductName: payment.store_product_name || 'Product Purchase',
      BasePrice: parseFloat(payment.base_price),
      FinalPrice: parseFloat(payment.final_price),
      ProfitPercentage: parseFloat(payment.profit_percentage),
      ProfitAmount: parseFloat(payment.final_price) - parseFloat(payment.base_price),
      Currency: payment.wallet_currency,
      Status: payment.status,
      ExternalID: payment.external_transaction_id,
      CreatedAt: payment.created_at,
      ProcessedAt: payment.processed_at,
      UserInputs: payment.user_inputs,
      ErrorMessage: payment.error_message
    }));
  }, [payments, filters]);

  const statusTemplate = (props) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800 border border-green-200', icon: '✅', text: 'Success' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '⏳', text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: '⚙️', text: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800 border border-red-200', icon: '❌', text: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: '🚫', text: 'Cancelled' }
    };

    const config = statusConfig[props.Status] || statusConfig.pending;

    return (
      <div className="flex items-center justify-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}>
          {config.icon} {config.text}
        </span>
      </div>
    );
  };

  const amountTemplate = (props) => {
    const isUSD = props.Currency === 'USD';
    const symbol = isUSD ? '$' : 'SYP ';
    const finalAmount = isUSD ? props.FinalPrice.toFixed(2) : props.FinalPrice.toLocaleString();
    const baseAmount = isUSD ? props.BasePrice.toFixed(2) : props.BasePrice.toLocaleString();

    return (
      <div className="text-right">
        <div className="font-semibold text-gray-800">
          {symbol}{finalAmount}
        </div>
        <div className="text-xs text-gray-500">
          Base: {symbol}{baseAmount}
        </div>
        {props.ProfitPercentage > 0 && (
          <div className="text-xs text-green-600">
            +{props.ProfitPercentage}% profit
          </div>
        )}
      </div>
    );
  };

  const profitTemplate = (props) => {
    const isUSD = props.Currency === 'USD';
    const symbol = isUSD ? '$' : 'SYP ';
    const profitAmount = isUSD ? props.ProfitAmount.toFixed(2) : props.ProfitAmount.toLocaleString();

    return (
      <div className="text-right">
        <div className={`font-semibold ${props.ProfitAmount > 0 ? 'text-green-600' : 'text-gray-600'}`}>
          {symbol}{profitAmount}
        </div>
        <div className="text-xs text-gray-500">
          {props.ProfitPercentage}%
        </div>
      </div>
    );
  };

  const dateTemplate = (props) => {
    const date = new Date(props.CreatedAt);
    return (
      <div className="text-center">
        <div className="text-sm font-medium">
          {date.toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  const userTemplate = (props) => {
    const initials = props.UserName?.split(' ').map((n) => n[0]).join('').substring(0, 2) || 'US';
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
          {initials}
        </div>
        <div>
          <div className="text-sm font-medium truncate max-w-[120px]">
            {props.UserName}
          </div>
          <div className="text-xs text-gray-500">
            ID: {props.id}
          </div>
        </div>
      </div>
    );
  };

  const actionsTemplate = (props) => (
    <div className="flex gap-2 justify-center">
      <button
        type="button"
        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium flex items-center gap-1"
        onClick={() => handleViewDetails(props)}
        title="View payment details"
      >
        👁️ Details
      </button>
      {props.Status === 'pending' && user?.role === 'admin' && (
        <button
          type="button"
          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleProcessPayment(props.id)}
          title="Process payment"
        >
          ⚙️ Process
        </button>
      )}
    </div>
  );

  const handleViewDetails = (payment) => {
    const amountDisplay = payment.Currency === 'USD' ? `$${payment.FinalPrice}` : `SYP ${payment.FinalPrice}`;
    alert(`Payment Details:\nID: ${payment.PaymentID}\nUser: ${payment.UserName}\nProduct: ${payment.ProductName}\nAmount: ${amountDisplay}\nStatus: ${payment.Status}`);
  };

  const handleProcessPayment = (paymentId) => {
    alert(`Processing payment ${paymentId}...`);
  };

  const handleExport = () => {
    const headers = ['Payment ID', 'User', 'Product', 'Base Price', 'Final Price', 'Profit %', 'Currency', 'Status', 'Date'];
    const csvData = filteredData.map((payment) => [
      payment.PaymentID,
      payment.UserName,
      payment.ProductName,
      payment.BasePrice,
      payment.FinalPrice,
      payment.ProfitPercentage,
      payment.Currency,
      payment.Status,
      new Date(payment.CreatedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      status: 'All',
      currency: 'All',
      dateRange: 'All',
      startDate: '',
      endDate: '',
      searchQuery: ''
    });
  };

  const refreshData = () => {
    fetchAllPayments();
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Payment Management" title="All Payments" />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading payments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Payment Management" title="All Payments" />
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button
            type="button"
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header
        category="Payment Management"
        title="All Payments"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm">Total Payments</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalPayments}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.successPayments} successful</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ${stats.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-green-600 mt-1">From successful payments</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
          <p className="text-xs text-yellow-600 mt-1">Awaiting processing</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold text-sm">Average Payment</p>
          <p className="text-2xl font-bold text-purple-600">
            ${stats.averageAmount.toFixed(2)}
          </p>
          <p className="text-xs text-purple-600 mt-1">Per successful payment</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Filter Payments</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium flex items-center gap-2"
            >
              📊 Export CSV
            </button>
            <button
              type="button"
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium flex items-center gap-2"
            >
              🔄 Refresh
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium flex items-center gap-2"
            >
              🗑️ Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="All">All Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.currency}
              onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD</option>
              <option value="SYP">SYP</option>
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by user, product, transaction ID..."
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.status !== 'All' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Status: {filters.status}
            </span>
          )}
          {filters.currency !== 'All' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Currency: {filters.currency}
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
          {filters.searchQuery && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Search: {filters.searchQuery}
            </span>
          )}
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            Showing: {filteredData.length} payments
          </span>
        </div>
      </div>

      <GridComponent
        dataSource={filteredData}
        allowPaging
        allowSorting
        allowFiltering
        allowGrouping
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 20 }}
        height={600}
        enableHover
      >
        <ColumnsDirective>
          <ColumnDirective
            field="PaymentID"
            headerText="Payment ID"
            width="120"
            textAlign="Center"
          />
          <ColumnDirective
            headerText="User"
            width="180"
            template={userTemplate}
          />
          <ColumnDirective
            field="ProductName"
            headerText="Product"
            width="200"
          />
          <ColumnDirective
            headerText="Amount"
            width="150"
            template={amountTemplate}
          />
          <ColumnDirective
            headerText="Profit"
            width="120"
            template={profitTemplate}
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
            headerText="Date"
            width="140"
            template={dateTemplate}
          />
          <ColumnDirective
            field="ExternalID"
            headerText="External ID"
            width="160"
          />
          <ColumnDirective
            headerText="Actions"
            width="150"
            textAlign="Center"
            template={actionsTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter, Group]} />
      </GridComponent>
    </div>
  );
};

export default FullPayments;