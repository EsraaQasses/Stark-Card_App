import React, { useState, useEffect } from 'react';
import { MdOutlineCancel, MdSwapVert } from 'react-icons/md';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import { useStateContext } from '../contexts/ContextProvider';
import { Button } from '.';
import axiosInstance from '../utils/axiosConfig'; // Adjust path as needed

const Currencies = () => {
  const { currentColor } = useStateContext();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet data from backend
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/wallets/wallet/');
      setWalletData(response.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Format currency values
  const formatCurrency = (amount, currency) => {
    if (currency === 'SYP') {
      return `ل.س ${parseFloat(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } else {
      return `$${parseFloat(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  };

  // Mock data structure for fallback
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
      exchangeRate: `1 USD = ${walletData.exchange_rates?.usd_to_syp?.value || 0} SYP`
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
      exchangeRate: `1 SYP = ${walletData.exchange_rates?.syp_to_usd?.value || 0} USD`
    }
  ] : [];

  // Exchange rates data from backend
  const exchangeRates = walletData ? [
    {
      from: 'USD',
      to: 'SYP',
      rate: walletData.exchange_rates?.usd_to_syp?.value || 0,
      change: walletData.exchange_rates?.usd_to_syp?.change || 0,
      trend: (walletData.exchange_rates?.usd_to_syp?.change || 0) >= 0 ? 'up' : 'down'
    },
    {
      from: 'SYP',
      to: 'USD',
      rate: walletData.exchange_rates?.syp_to_usd?.value || 0,
      change: walletData.exchange_rates?.syp_to_usd?.change || 0,
      trend: (walletData.exchange_rates?.syp_to_usd?.change || 0) >= 0 ? 'up' : 'down'
    }
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

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={fetchWalletData}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>

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
          <div className="flex items-center gap-2 mb-4">
            <MdSwapVert className="text-xl" />
            <p className="font-semibold text-lg">Exchange Rates</p>
          </div>
          <div className="space-y-3">
            {exchangeRates?.map((rate, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-semibold">{rate.from} → {rate.to}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Rate</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{rate.rate.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  })}</p>
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
      </div>
    </div>
  );
};

export default Currencies;