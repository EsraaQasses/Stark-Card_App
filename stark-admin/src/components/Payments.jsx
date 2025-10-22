import React, { useState, useEffect } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { Button } from '.';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axiosConfig';

const Payments = () => {
  const { currentColor, handleClose } = useStateContext();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentPayments();
  }, []);

  const fetchRecentPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('payment/history/?limit=5');
      setPayments(response.data.results || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Failed to fetch payments';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { color: '#10B981', text: 'Success' },
      pending: { color: '#F59E0B', text: 'Pending' },
      processing: { color: '#3B82F6', text: 'Processing' },
      failed: { color: '#EF4444', text: 'Failed' },
      cancelled: { color: '#6B7280', text: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        style={{ background: config.color, color: 'white' }}
        className="text-xs rounded-full px-2 py-1"
      >
        {config.text}
      </span>
    );
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$',
      SYP: 'ل.س',
      EUR: '€',
    };
    return symbols[currency] || currency;
  };

  const getCurrencyColor = (currency) => {
    const colors = {
      USD: { bg: 'bg-blue-100', text: 'text-blue-600' },
      SYP: { bg: 'bg-green-100', text: 'text-green-600' },
      EUR: { bg: 'bg-purple-100', text: 'text-purple-600' },
    };
    return colors[currency] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  };

  const formatAmount = (amount, currency) => {
    if (currency === 'USD') {
      return `$${parseFloat(amount).toFixed(2)}`;
    } else if (currency === 'SYP') {
      return `${parseFloat(amount).toLocaleString()} ل.س`;
    }
    return `${parseFloat(amount).toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleViewAllPayments = () => {
    window.location.href = '/payments';
  };

  const handleRefresh = () => {
    fetchRecentPayments();
  };

  if (loading) {
    return (
      <div className="nav-item absolute right-5 md:right-52 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold text-lg dark:text-gray-200">Recent Payments</p>
          <Button
            icon={<MdOutlineCancel />}
            color="rgb(153, 171, 180)"
            bgHoverColor="light-gray"
            size="2xl"
            borderRadius="50%"
            customFunc={() => handleClose('chat')}
          />
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading payments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nav-item absolute right-5 md:right-52 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold text-lg dark:text-gray-200">Recent Payments</p>
          <Button
            icon={<MdOutlineCancel />}
            color="rgb(153, 171, 180)"
            bgHoverColor="light-gray"
            size="2xl"
            borderRadius="50%"
            customFunc={() => handleClose('chat')}
          />
        </div>
        <div className="flex flex-col items-center justify-center h-32">
          <div className="text-red-500 text-center mb-3">{error}</div>
          <Button
            color="white"
            bgColor={currentColor}
            text="Retry"
            borderRadius="10px"
            customFunc={handleRefresh}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="nav-item absolute right-5 md:right-52 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96 shadow-xl z-50">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 items-center">
          <p className="font-semibold text-lg dark:text-gray-200">Recent Payments</p>
          {payments.length > 0 && (
            <button 
              type="button" 
              className="text-white text-xs rounded p-1 px-2 bg-orange-500"
            >
              {payments.filter(p => p.status === 'pending' || p.status === 'processing').length} Active
            </button>
          )}
        </div>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
          customFunc={() => handleClose('chat')}
        />
      </div>
      
      <div className="mt-5 max-h-80 overflow-y-auto">
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <div className="text-lg mb-2">No payments found</div>
            <div className="text-sm text-center">Payments will appear here once they are processed</div>
          </div>
        ) : (
          <>
            {payments?.map((payment, index) => {
              const currencyColor = getCurrencyColor(payment.wallet_currency);
              
              return (
                <div 
                  key={payment.id} 
                  className="flex items-center gap-4 border-b-1 border-gray-200 dark:border-gray-600 p-3 leading-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#4A4E55] rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currencyColor.bg}`}>
                      <span className={`font-bold ${currencyColor.text}`}>
                        {getCurrencySymbol(payment.wallet_currency)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold dark:text-gray-200 text-sm truncate">
                        {payment.user_name || `User #${payment.user}`}
                      </p>
                      <p className="font-bold dark:text-white text-sm">
                        {formatAmount(payment.final_price, payment.wallet_currency)}
                      </p>
                    </div>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                      {payment.store_product_name || 'Product Purchase'} • #{payment.id}
                    </p>
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Base: {formatAmount(payment.base_price, payment.wallet_currency)}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                    
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      {formatDate(payment.created_at)}
                      {payment.profit_percentage > 0 && (
                        <span className="ml-2 text-green-500">
                          +{payment.profit_percentage}% profit
                        </span>
                      )}
                    </p>
                    
                    {payment.external_transaction_id && (
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 truncate">
                        Ext: {payment.external_transaction_id}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="mt-5 space-y-2">
              <Button
                color="white"
                bgColor={currentColor}
                text="View All Payments"
                borderRadius="10px"
                width="full"
                customFunc={handleViewAllPayments}
              />
              <Button
                color="gray"
                bgColor="transparent"
                text="Refresh"
                borderRadius="10px"
                width="full"
                border="1px solid #D1D5DB"
                customFunc={handleRefresh}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;