import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';

import { Button } from '.';
import { paymentData } from '../data/payments';
import { useStateContext } from '../contexts/ContextProvider';

const Payments = () => {
  const { currentColor } = useStateContext();

  const getStatusBadge = (status, statusColor) => (
    <span
      style={{ background: statusColor, color: 'white' }}
      className="text-xs rounded-full px-2 py-1"
    >
      {status}
    </span>
  );

  return (
    <div className="nav-item absolute right-5 md:right-52 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <p className="font-semibold text-lg dark:text-gray-200">Recent Payments</p>
          <button type="button" className="text-white text-xs rounded p-1 px-2 bg-orange">
            {paymentData.length} New
          </button>
        </div>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      <div className="mt-5 max-h-80 overflow-y-auto">
        {paymentData?.map((payment, index) => (
          <div key={index} className="flex items-center gap-4 border-b-1 border-gray-200 dark:border-gray-600 p-3 leading-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#4A4E55] rounded-lg">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                payment.currency === 'USD' ? 'bg-blue-100' : 
                payment.currency === 'SYP' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <span className={`font-bold ${
                  payment.currency === 'USD' ? 'text-blue-600' : 
                  payment.currency === 'SYP' ? 'text-green-600' : 'text-purple-600'
                }`}>
                  {payment.currency === 'USD' ? '$' : payment.currency === 'SYP' ? 'ل.س' : '↔'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-semibold dark:text-gray-200 text-sm truncate">
                  {payment.user}
                </p>
                <p className="font-bold dark:text-white text-sm">
                  {payment.amount}
                </p>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                {payment.type} • {payment.id}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Agent: {payment.agent}
                </p>
                {getStatusBadge(payment.status, payment.statusColor)}
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                {payment.time} • {payment.date}
              </p>
            </div>
          </div>
        ))}
        <div className="mt-5">
          <Button
            color="white"
            bgColor={currentColor}
            text="View All Payments"
            borderRadius="10px"
            width="full"
          />
        </div>
      </div>
    </div>
  );
};

export default Payments;
