import React from 'react';
import { GoPrimitiveDot } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { Stacked } from '../components';
import { earningData, SparklineAreaData } from '../data/earningData';
import { useStateContext } from '../contexts/ContextProvider';

const Home = () => {
  const { currentColor, currentMode } = useStateContext();

  return (
    <div className="mt-24">
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="grid grid-cols-2 gap-6 m-3 justify-center items-center w-full max-w-4xl">
          {earningData.map((item) => (
            <Link key={item.title} to={`/${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="block bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 transform transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{item.amount}</p>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{item.title}</p>
                </div>
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-full"
                  style={{ backgroundColor: item.iconBg }}
                >
                  <span style={{ color: item.iconColor, fontSize: '24px' }}>
                    {item.icon}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-10 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-780  ">
          <div className="flex justify-between">
            <p className="font-semibold text-xl">Revenue Updates</p>
            <div className="flex items-center gap-4">
              <p className="flex items-center gap-2 text-gray-600 hover:drop-shadow-xl">
                <span>
                  <GoPrimitiveDot />
                </span>
                <span>Customers</span>
              </p>
              <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
                <span>
                  <GoPrimitiveDot />
                </span>
                <span>sales</span>
              </p>
            </div>
          </div>
          <div className="mt-10 flex gap-10 flex-wrap justify-center">
            <div className=" border-r-1 border-color m-4 pr-10">
              <div>
                <p>
                  <span className="text-3xl font-semibold">$93,438</span>
                  <span className="p-1.5 hover:drop-shadow-xl cursor-pointer rounded-full text-white bg-green-400 ml-3 text-xs">
                    23%
                  </span>
                </p>
                <p className="text-gray-500 mt-1">Sales</p>
              </div>
              <div className="mt-8">
                <p className="text-3xl font-semibold">$48,487</p>

                <p className="text-gray-500 mt-1">Customers</p>
              </div>

            </div>
            <div>
              <Stacked currentMode={currentMode} width="320px" height="360px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
