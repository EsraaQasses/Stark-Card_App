import React, { useState, useEffect } from 'react';
import { MdOutlineCancel, MdSwapVert, MdEdit, MdRefresh, MdUpdate } from 'react-icons/md';
import { AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineSave, AiOutlineClose } from 'react-icons/ai';
import { useStateContext } from '../contexts/ContextProvider';
import { Button } from '.';
import axiosInstance from '../utils/axiosConfig';

const Currencies = () => {
  const { currentUser } = useStateContext();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRate, setEditingRate] = useState(false);
  const [newExchangeRate, setNewExchangeRate] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [refreshingRates, setRefreshingRates] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/wallets/wallet/');
      setWalletData(response.data);
      if (response.data.exchange_rates?.usd_to_syp?.value) {
        setNewExchangeRate(response.data.exchange_rates.usd_to_syp.value.toString());
      }
    } catch (fetchError) {
      console.error('Error fetching wallet data:', fetchError);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await axiosInstance.get('/wallets/exchange-rate/');
      if (response.data.usd_to_syp) {
        setNewExchangeRate(response.data.usd_to_syp.toString());
      }
    } catch (rateError) {
      console.error('Error fetching exchange rate:', rateError);
    }
  };

  const refreshExchangeRates = async () => {
    try {
      setRefreshingRates(true);
      setUpdateError(null);
      setSuccessMessage(null);

      const response = await axiosInstance.post('/wallets/refresh-exchange-rates/');
      setSuccessMessage('تم تحديث أسعار الصرف تلقائياً');
      setTimeout(() => {
        fetchWalletData();
        setSuccessMessage(null);
      }, 2000);
    } catch (refreshError) {
      console.error('Error refreshing exchange rates:', refreshError);
      if (refreshError.response?.data?.detail) {
        setUpdateError(refreshError.response.data.detail);
      } else if (refreshError.response?.data?.error) {
        setUpdateError(refreshError.response.data.error);
      } else {
        setUpdateError('Failed to refresh exchange rates');
      }
    } finally {
      setRefreshingRates(false);
    }
  };

  const updateExchangeRate = async () => {
    if (!newExchangeRate || isNaN(parseFloat(newExchangeRate)) || parseFloat(newExchangeRate) <= 0) {
      setUpdateError('Please enter a valid exchange rate greater than 0');
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setSuccessMessage(null);

      await axiosInstance.put('/wallets/exchange-rate/', {
        usd_to_syp: parseFloat(newExchangeRate),
      });

      setSuccessMessage('تم تحديث سعر الصرف بنجاح');
      setEditingRate(false);

      setTimeout(() => {
        fetchWalletData();
        setSuccessMessage(null);
      }, 2000);
    } catch (updateoError) {
      console.error('Error updating exchange rate:', updateError);
      if (updateoError.response?.data?.detail) {
        setUpdateError(updateoError.response.data.detail);
      } else if (updateoError.response?.data?.error) {
        setUpdateError(updateoError.response.data.error);
      } else {
        setUpdateError('Failed to update exchange rate');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const startEditing = () => {
    setEditingRate(true);
    setUpdateError(null);
    setSuccessMessage(null);
  };

  const cancelEditing = () => {
    setEditingRate(false);
    setUpdateError(null);
    setSuccessMessage(null);
    if (walletData?.exchange_rates?.usd_to_syp?.value) {
      setNewExchangeRate(walletData.exchange_rates.usd_to_syp.value.toString());
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const formatCurrency = (amount, currency) => {
    if (currency === 'SYP') {
      return `ل.س ${parseFloat(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatRate = (rate, decimals = 2) => {
    return parseFloat(rate).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const currenciesData = walletData ? [
    {
      name: 'US Dollar',
      currency: 'USD',
      icon: '$',
      color: 'bg-green-100',
      textColor: 'text-green-800',
      balance: formatCurrency(walletData.USD?.total || 0, 'USD'),
      available: formatCurrency(walletData.USD?.available || 0, 'USD'),
      pending: formatCurrency(walletData.USD?.pending || 0, 'USD'),
      exchangeRate: `1 USD = ${walletData.exchange_rates?.usd_to_syp?.value || 0} SYP`,
    },
    {
      name: 'Syrian Pound',
      currency: 'SYP',
      icon: 'ل.س',
      color: 'bg-orange-100',
      textColor: 'text-orange-800',
      balance: formatCurrency(walletData.SYP?.total || 0, 'SYP'),
      available: formatCurrency(walletData.SYP?.available || 0, 'SYP'),
      pending: formatCurrency(walletData.SYP?.pending || 0, 'SYP'),
      exchangeRate: `1 SYP = ${walletData.exchange_rates?.syp_to_usd?.value || 0} USD`,
    },
  ] : [];

  const exchangeRates = walletData ? [
    {
      from: 'USD',
      to: 'SYP',
      rate: walletData.exchange_rates?.usd_to_syp?.value || 0,
      change: walletData.exchange_rates?.usd_to_syp?.change || 0,
      trend: (walletData.exchange_rates?.usd_to_syp?.change || 0) >= 0 ? 'up' : 'down',
    },
    {
      from: 'SYP',
      to: 'USD',
      rate: walletData.exchange_rates?.syp_to_usd?.value || 0,
      change: walletData.exchange_rates?.syp_to_usd?.change || 0,
      trend: (walletData.exchange_rates?.syp_to_usd?.change || 0) >= 0 ? 'up' : 'down',
    },
  ] : [];

  if (loading) {
    return (
      <div className="bg-half-transparent w-full fixed nav-item top-0 right-0 z-50">
        <div className="float-right h-screen duration-1000 ease-in-out dark:text-gray-200 transition-all dark:bg-[#484B52] bg-white md:w-400 p-8 overflow-y-auto">
          <div className="flex justify-center items-center h-40">
            <div className="text-lg">Loading wallet data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-half-transparent w-full fixed nav-item top-0 right-0 z-50">
        <div className="float-right h-screen duration-1000 ease-in-out dark:text-gray-200 transition-all dark:bg-[#484B52] bg-white md:w-400 p-8 overflow-y-auto">
          <div className="flex justify-center items-center h-40">
            <div className="text-lg text-red-500">{error}</div>
            <button
              type="button"
              onClick={fetchWalletData}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-half-transparent w-full fixed nav-item top-0 right-0 z-50">
      <div className="float-right h-screen duration-1000 ease-in-out dark:text-gray-200 transition-all dark:bg-[#484B52] bg-white md:w-400 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="font-semibold text-lg">Wallet Balances</p>
          <Button
            icon={<MdOutlineCancel />}
            color="rgb(153, 171, 180)"
            bgHoverColor="light-gray"
            size="2xl"
            borderRadius="50%"
          />
        </div>

        <div className="flex justify-between mb-4">
          <button
            type="button"
            onClick={fetchWalletData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
          >
            <MdRefresh className="text-sm" />
            Refresh Data
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={refreshExchangeRates}
              disabled={refreshingRates}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 transition"
            >
              <MdUpdate className="text-sm" />
              {refreshingRates ? 'Updating...' : 'Update Rates'}
            </button>
          )}
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {updateError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {updateError}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {currenciesData?.map((currency, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currency.color}`}>
                    <span className={`font-bold text-xl ${currency.textColor}`}>
                      {currency.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{currency.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{currency.currency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{currency.balance}</p>
                  <p className="text-xs text-gray-500">{currency.exchangeRate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Available</p>
                  <p className="font-semibold text-green-600">{currency.available}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="font-semibold text-yellow-600">{currency.pending}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MdSwapVert className="text-xl" />
              <p className="font-semibold text-lg">Exchange Rates</p>
            </div>
          </div>

          {isAdmin && editingRate && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">Update Exchange Rate Manually</p>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <AiOutlineClose />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    USD to SYP Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExchangeRate}
                    onChange={(e) => setNewExchangeRate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Enter USD to SYP rate"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: 1 USD = {formatRate(walletData?.exchange_rates?.usd_to_syp?.value || 0)} SYP
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={updateExchangeRate}
                    disabled={updateLoading}
                    className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    <AiOutlineSave />
                    {updateLoading ? 'Updating...' : 'Update Rate'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {exchangeRates?.map((rate, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold">{rate.from} → {rate.to}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Rate</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {formatRate(rate.rate, rate.from === 'SYP' ? 6 : 2)}
                  </p>
                  <div className={`flex items-center gap-1 text-xs ${
                    rate.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                  >
                    {rate.trend === 'up' ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                    <span>{rate.change}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isAdmin && !editingRate && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={startEditing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <MdEdit className="text-sm" />
                Change Exchange Rate
              </button>
            </div>
          )}
        </div>

        <div className="border-t dark:border-gray-600 pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-500 dark:text-gray-400">Total Balance (USD)</p>
            <p className="font-semibold">
              {walletData?.totals?.usd ? formatCurrency(walletData.totals.usd, 'USD') : '$0.00'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400">Total Balance (SYP)</p>
            <p className="font-semibold">
              {walletData?.totals?.syp ? formatCurrency(walletData.totals.syp, 'SYP') : 'ل.س 0.00'}
            </p>
          </div>
        </div>

        {walletData?.exchange_rates?.last_updated && (
          <div className="mt-4 pt-4 border-t dark:border-gray-600">
            <p className="text-xs text-gray-500 text-center">
              Last updated: {new Date(walletData.exchange_rates.last_updated).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Currencies;
