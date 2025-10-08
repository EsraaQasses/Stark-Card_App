import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaMoneyCheckAlt } from 'react-icons/fa';

import { Button } from '.';
import { notificationData } from '../data/notifications';
import { useStateContext } from '../contexts/ContextProvider';

const Notification = () => {
  const { currentColor } = useStateContext();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'payment':
        return <FaMoneyCheckAlt className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return <span className={`text-xs rounded-full px-2 py-1 ${colors[priority]}`}>{priority}</span>;
  };

  return (
    <div className="nav-item absolute right-5 md:right-40 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96 shadow-xl z-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <p className="font-semibold text-lg dark:text-gray-200">System Notifications</p>
          <button type="button" className="text-white text-xs rounded p-1 px-2 bg-orange-500">
            {notificationData.filter(item => item.isNew).length} New
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
        {notificationData?.map((item, index) => (
          <div key={index} className={`flex items-start gap-4 p-3 rounded-lg mb-2 border-l-4 ${
            item.priority === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
            item.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
            'border-l-green-500 bg-green-50 dark:bg-green-900/20'
          }`}>
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold dark:text-gray-200 text-sm">{item.message}</p>
                {getPriorityBadge(item.priority)}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">{item.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 dark:text-gray-500 text-xs">{item.time}</span>
                {item.requiresAction && (
                  <span className="text-red-500 text-xs font-semibold">Action Required</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="mt-5">
          <Button
            color="white"
            bgColor={currentColor}
            text="See All Notifications"
            borderRadius="10px"
            width="full"
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;
