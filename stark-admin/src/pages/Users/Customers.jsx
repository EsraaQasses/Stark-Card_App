import React, { useState, useMemo } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Selection,
  Inject,
  Edit,
  Toolbar,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  AccumulationLegend,
  PieSeries,
  AccumulationDataLabel,
  Inject as ChartInject,
  AccumulationTooltip,
} from '@syncfusion/ej2-react-charts';

import { customersData, customersGrid } from '../../data/customers';
import { Header } from '../../components';
import { customerseData } from '../../data/blacklist';

const Customers = () => {
  const [gridInstance, setGridInstance] = useState(null);
  const [customers, setCustomers] = useState(customersData);
  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ['Delete', 'Block', 'Unblock'];
  const editing = { allowDeleting: true, allowEditing: true };

  const userActivityData = useMemo(() => {
    const totalUsers = customers.length;

    const activityStats = {
      active: Math.floor(totalUsers * 0.6),
      dormant: Math.floor(totalUsers * 0.25),
      new: Math.floor(totalUsers * 0.15),
    };

    return [
      {
        x: 'Active',
        y: activityStats.active,
        text: `${activityStats.active}`,
        color: '#10B981',
        description: 'Performed a transaction or logged in within the last 30 days'
      },
      {
        x: 'Dormant',
        y: activityStats.dormant,
        text: `${activityStats.dormant}`,
        color: '#EF4444',
        description: 'Has not logged in or transacted in the last 60+ days'
      },
      {
        x: 'New (Last 7 Days)',
        y: activityStats.new,
        text: `${activityStats.new}`,
        color: '#F59E0B',
        description: 'Registered within the last 7 days'
      }
    ];
  }, [customers.length]);

  const totalUsers = customers.length;
  const activePercentage = ((userActivityData[0].y / totalUsers) * 100).toFixed(1);
  const dormantPercentage = ((userActivityData[1].y / totalUsers) * 100).toFixed(1);
  const newPercentage = ((userActivityData[2].y / totalUsers) * 100).toFixed(1);

  const toolbarClick = (args) => {
    if (args.item.id.includes('Block')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        const updatedCustomers = customers.map(customer => {
          if (selected.some(selectedCustomer => selectedCustomer.CustomerID === customer.CustomerID)) {
            customerseData.push({
              ...customer,
              BlockedDate: new Date(),
              Reason: 'Manual Block'
            });
            return {
              ...customer,
              Status: 'Blocked',
              StatusBg: '#FF6B6B'
            };
          }
          return customer;
        });

        setCustomers(updatedCustomers);
        alert(`${selected.length} customer(s) blocked and moved to Blacklist.`);
      } else {
        alert('Please select a customer to block.');
      }
    }

    if (args.item.id.includes('Unblock')) {
      const selected = gridInstance.getSelectedRecords();
      if (selected.length > 0) {
        const updatedCustomers = customers.map(customer => {
          if (selected.some(selectedCustomer => selectedCustomer.CustomerID === customer.CustomerID)) {
            return {
              ...customer,
              Status: 'Active',
              StatusBg: '#8BE78B'
            };
          }
          return customer;
        });

        setCustomers(updatedCustomers);
        alert(`${selected.length} customer(s) unblocked.`);
      } else {
        alert('Please select a customer to unblock.');
      }
    }
  };

  const pointRender = (args) => {
    const activityItem = userActivityData.find(item => item.x === args.point.x);
    if (activityItem) {
      args.fill = activityItem.color;
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="User Management" title="Customers" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            User Activity Status
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Total Registered Users: {totalUsers}
          </p>
          <AccumulationChartComponent
            id="user-activity-chart"
            legendSettings={{ 
              visible: true, 
              position: 'Bottom',
              textStyle: { size: '12px', fontWeight: '600' }
            }}
            height="300px"
            tooltip={{ 
              enable: true, 
              format: '${point.x} : <b>${point.y} users</b><br>${point.percentage}%' 
            }}
            pointRender={pointRender}
          >
            <ChartInject services={[AccumulationLegend, PieSeries, AccumulationDataLabel, AccumulationTooltip]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective
                name="User Activity"
                dataSource={userActivityData}
                xName="x"
                yName="y"
                innerRadius="60%"
                startAngle={0}
                endAngle={360}
                radius="70%"
                dataLabel={{
                  visible: true,
                  name: 'text',
                  position: 'Inside',
                  font: {
                    fontWeight: '600',
                    color: '#fff',
                  },
                }}
              />
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Insights</h3>
          
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Active Users</h4>
                <p className="text-2xl font-bold text-green-600">{userActivityData[0].y} users</p>
                <p className="text-sm text-green-600">{activePercentage}% of total</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              {userActivityData[0].description}
            </p>
          </div>

          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-red-800">Dormant Users</h4>
                <p className="text-2xl font-bold text-red-600">{userActivityData[1].y} users</p>
                <p className="text-sm text-red-600">{dormantPercentage}% of total</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <p className="text-xs text-red-700 mt-2">
              {userActivityData[1].description}
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-yellow-800">New Users (7 Days)</h4>
                <p className="text-2xl font-bold text-yellow-600">{userActivityData[2].y} users</p>
                <p className="text-sm text-yellow-600">{newPercentage}% of total</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              {userActivityData[2].description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Customers</p>
          <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">Active Now</p>
          <p className="text-2xl font-bold text-green-600">{userActivityData[0].y}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">Total USD Balance</p>
          <p className="text-2xl font-bold text-purple-600">
            ${customers.reduce((sum, customer) => sum + customer.WalletUSD, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Total LBP Balance</p>
          <p className="text-2xl font-bold text-orange-600">
            {customers.reduce((sum, customer) => sum + customer.WalletLBP, 0).toLocaleString()} LBP
          </p>
        </div>
      </div>

      <GridComponent
        dataSource={customers}
        ref={(g) => setGridInstance(g)}
        enableHover={false}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting
        toolbarClick={toolbarClick}
      >
        <ColumnsDirective>
          {customersGrid.map((item, index) => (
            <ColumnDirective key={index} {...item} />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default Customers;