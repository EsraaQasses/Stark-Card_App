import React, { useState } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Toolbar,
  Edit,
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
  AccumulationTooltip
} from '@syncfusion/ej2-react-charts';

import { apiData } from '../../data/apiData';
import { Header } from '../../components';

const Api = () => {
  const [apiKeys, setApiKeys] = useState(apiData);
  
  const generatePieChartData = () => {
    return {
      callsData: apiKeys.map(api => ({
        x: api.AppName,
        y: api.TodayCalls,
        text: `${api.TodayCalls} calls`
      }))
    };
  };

  const pieChartData = generatePieChartData();

  const toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
  
  const editSettings = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Dialog',
    showConfirmDialog: true,
    showDeleteConfirmDialog: true,
  };

  const selectionSettings = { persistSelection: true };

  const handleTestConnection = (apiId, appName) => {
    console.log(`Testing connection for ${appName} (ID: ${apiId})`);
    alert(`Testing connection to ${appName}...\n\nThis would validate the API credentials and endpoint.`);
  };

  const handleRegenerateKey = (apiId, appName) => {
    if (window.confirm(`Regenerate API key for ${appName}? This will invalidate the current key.`)) {
      console.log(`Regenerating key for ${appName} (ID: ${apiId})`);
      alert(`New API key generated for ${appName}!\n\nMake sure to update it in the respective application.`);
    }
  };

  const handleViewLogs = (apiId, appName) => {
    console.log(`Viewing logs for ${appName} (ID: ${apiId})`);
    alert(`Opening logs for ${appName}...\n\nThis would show recent API calls and transactions.`);
  };

  const statusTemplate = (props) => {
    const status = props.Status;
    const statusConfig = {
      'Active': { color: 'bg-green-100 text-green-800', icon: '🟢' },
      'Inactive': { color: 'bg-red-100 text-red-800', icon: '🔴' },
      'Testing': { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      'Error': { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '⚪' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color} flex items-center gap-1 justify-center`}>
        {config.icon} {status}
      </span>
    );
  };

  const apiKeyTemplate = (props) => {
    const [showKey, setShowKey] = useState(false);
    const apiKey = props.ApiKey;
    
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-sm">
            {showKey ? apiKey : '•'.repeat(16)}
          </span>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-blue-500 hover:text-blue-700 text-xs"
            title={showKey ? 'Hide API Key' : 'Show API Key'}
          >
            {showKey ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        <button
          onClick={() => handleRegenerateKey(props.ApiID, props.AppName)}
          className="text-xs text-red-500 hover:text-red-700 mt-1"
        >
          Regenerate
        </button>
      </div>
    );
  };

  const actionsTemplate = (props) => {
    const api = props;
    
    return (
      <div className="flex flex-col gap-2 justify-center">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-medium"
          onClick={() => handleTestConnection(api.ApiID, api.AppName)}
        >
          Test
        </button>
        <button
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-xs font-medium"
          onClick={() => handleViewLogs(api.ApiID, api.AppName)}
        >
          Logs
        </button>
        {api.Status === 'Active' && (
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs font-medium"
            onClick={() => alert(`API ${api.AppName} is active and receiving requests`)}
          >
            Stats
          </button>
        )}
      </div>
    );
  };

  const appTypeTemplate = (props) => {
    const type = props.AppType;
    const typeConfig = {
      'Game Store': { color: 'bg-purple-100 text-purple-800', icon: '🎮' },
      'Payment Gateway': { color: 'bg-blue-100 text-blue-800', icon: '💳' },
      'E-commerce': { color: 'bg-orange-100 text-orange-800', icon: '🛒' },
      'Utility': { color: 'bg-green-100 text-green-800', icon: '⚡' }
    };

    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', icon: '🔧' };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.icon} {type}
      </span>
    );
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Integration Management" 
        title="API Configuration" 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Today's API Calls Distribution</h3>
          <AccumulationChartComponent
            id="api-calls-chart"
            legendSettings={{ 
              visible: true, 
              position: 'Bottom',
              textStyle: { size: '12px' }
            }}
            height="300px"
            tooltip={{ enable: true, format: '${point.x} : <b>${point.y} calls</b>' }}
          >
            <ChartInject services={[AccumulationLegend, PieSeries, AccumulationDataLabel, AccumulationTooltip]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective
                name="Calls"
                dataSource={pieChartData.callsData}
                xName="x"
                yName="y"
                innerRadius="0%"
                startAngle={0}
                endAngle={360}
                radius="70%"
                dataLabel={{
                  visible: true,
                  name: 'text',
                  position: 'Outside',
                  font: {
                    fontWeight: '600',
                  },
                }}
              />
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total APIs</p>
          <p className="text-2xl font-bold text-blue-600">{apiKeys.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">Active APIs</p>
          <p className="text-2xl font-bold text-green-600">
            {apiKeys.filter(api => api.Status === 'Active').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">Game Stores</p>
          <p className="text-2xl font-bold text-purple-600">
            {apiKeys.filter(api => api.AppType === 'Game Store').length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">Today's Calls</p>
          <p className="text-2xl font-bold text-orange-600">
            {apiKeys.reduce((sum, api) => sum + (api.TodayCalls || 0), 0)}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
            + Add New API
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
            📊 View Analytics
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm">
            📚 API Documentation
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm">
            🔐 Security Settings
          </button>
        </div>
      </div>
      
      <GridComponent
        dataSource={apiKeys}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        pageSettings={{ pageSize: 10 }}
        selectionSettings={selectionSettings}
        toolbar={toolbarOptions}
        editSettings={editSettings}
        height={400}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="ApiID" 
            headerText="API ID" 
            width="80" 
            textAlign="Center" 
            isPrimaryKey={true}
            visible={false}
          />
          
          <ColumnDirective 
            field="AppName" 
            headerText="Application Name" 
            width="180" 
            textAlign="Center" 
            validationRules={{ required: true }}
          />
          
          <ColumnDirective 
            field="AppType" 
            headerText="Type" 
            width="120" 
            textAlign="Center"
            template={appTypeTemplate}
            editType="dropdownedit"
            edit={{ params: { dataSource: ['Game Store', 'Payment Gateway', 'E-commerce', 'Utility'] } }}
          />
          
          <ColumnDirective 
            field="ApiKey" 
            headerText="API Key" 
            width="200" 
            textAlign="Center"
            template={apiKeyTemplate}
            validationRules={{ required: true }}
            editType="passwordedit"
          />
          
          <ColumnDirective 
            field="BaseUrl" 
            headerText="Endpoint URL" 
            width="250" 
            textAlign="Center"
            validationRules={{ required: true }}
          />
          
          <ColumnDirective 
            field="PaymentFee" 
            headerText="Fee (%)" 
            width="100" 
            textAlign="Center"
            editType="numericedit"
            validationRules={{ required: true, min: 0, max: 100 }}
            format="N2"
          />
          
          <ColumnDirective 
            field="TodayCalls" 
            headerText="Today's Calls" 
            width="100" 
            textAlign="Center"
            format="N0"
          />
          
          <ColumnDirective 
            field="Status" 
            headerText="Status" 
            width="120" 
            textAlign="Center"
            template={statusTemplate}
            editType="dropdownedit"
            edit={{ params: { dataSource: ['Active', 'Inactive', 'Testing'] } }}
          />
          
          <ColumnDirective 
            field="LastUpdated" 
            headerText="Last Updated" 
            width="120" 
            textAlign="Center" 
            format="dd/MM/yyyy"
          />
          
          <ColumnDirective 
            headerText="Actions" 
            width="150" 
            textAlign="Center"
            template={actionsTemplate}
            allowEditing={false}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default Api;