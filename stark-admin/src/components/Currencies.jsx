import React from 'react';
import { MdOutlineCancel, MdSwapVert } from 'react-icons/md';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

import { useStateContext } from '../contexts/ContextProvider';
import { currenciesData, exchangeRates } from '../data/currancies';
import { Button } from '.';

const Currencies = () => {
  const { currentColor } = useStateContext();

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
                  <p className="font-bold">{rate.rate}</p>
                  <div className={`flex items-center gap-1 text-xs ${
                    rate.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                  >
                    {rate.trend === 'up' ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                    <span>{rate.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t dark:border-gray-600 pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-500 dark:text-gray-400">Total Balance (USD)</p>
            <p className="font-semibold">$16,842.50</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400">Total Balance (SYP)</p>
            <p className="font-semibold">ل.س 210,531,250</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Currencies;
