import {
  AccumulationChartComponent,
  AccumulationDataLabel,
  AccumulationLegend,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  AccumulationTooltip,
  Inject as ChartInject,
  PieSeries,
} from '@syncfusion/ej2-react-charts';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Header } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';

const ApiTable = ({ data, onTestConnection, onSyncProducts, onViewTransactions, testingConnection, syncingProducts }) => {
  const [showApiKey, setShowApiKey] = useState({});

  const toggleApiKeyVisibility = (apiId) => {
    setShowApiKey(prev => ({
      ...prev,
      [apiId]: !prev[apiId],
    }));
  };

  const StatusBadge = ({ isActive }) => {
    const statusConfig = {
      true: { color: 'bg-green-100 text-green-800', icon: '🟢', text: 'Active' },
      false: { color: 'bg-red-100 text-red-800', icon: '🔴', text: 'Inactive' }
    };

    const config = statusConfig[isActive.toString()] || statusConfig.false;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color} flex items-center gap-1 justify-center`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const ProviderBadge = ({ provider }) => {
    const providerConfig = {
      daily: { color: 'bg-blue-100 text-blue-800', icon: '🌐', text: 'Daily' },
      alfaour: { color: 'bg-purple-100 text-purple-800', icon: '💳', text: 'Alfaour' },
      alaaeddin: { color: 'bg-orange-100 text-orange-800', icon: '🛒', text: 'Alaaeddin' }
    };

    const config = providerConfig[provider] || { color: 'bg-gray-100 text-gray-800', icon: '🔧', text: provider };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const ApiKeyDisplay = ({ api }) => {
    const hasApiKey = api.encrypted_api_key && api.is_connected;
    const isVisible = showApiKey[api.id];

    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-sm">
            {hasApiKey ? (isVisible ? '••••••••' : '••••••••') : 'Not Set'}
          </span>
          {hasApiKey && (
            <button
              onClick={() => toggleApiKeyVisibility(api.id)}
              className="text-blue-500 hover:text-blue-700 text-xs p-1"
              title={isVisible ? 'Hide API Key' : 'Show API Key'}
              type="button"
              aria-label={isVisible ? 'Hide API Key' : 'Show API Key'}
            >
              {isVisible ? '👁️' : '👁️‍🗨️'}
            </button>
          )}
        </div>
        <div className={`text-xs mt-1 ${api.is_connected ? 'text-green-600' : 'text-gray-500'}`}>
          {api.is_connected ? 'Connected' : 'Not Connected'}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No APIs configured yet. Click &quot;Add New API&quot; to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base URL</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Limit</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((api) => (
            <tr key={api.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{api.id}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{api.name}</td>
              <td className="px-4 py-3 text-sm">
                <ProviderBadge provider={api.provider} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <div className="max-w-xs truncate" title={api.base_url}>
                  {api.base_url}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <div className="max-w-xs truncate" title={api.description}>
                  {api.description || '-'}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-center">{api.priority}</td>
              <td className="px-4 py-3 text-sm text-gray-900 text-center">
                {api.max_daily_limit || 'No limit'}
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge isActive={api.is_active} />
              </td>
              <td className="px-4 py-3 text-sm">
                <ApiKeyDisplay api={api} />
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex flex-col gap-2">
                  <button
                    className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-medium flex items-center justify-center gap-1 ${
                      testingConnection === api.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => onTestConnection(api.id, api.name)}
                    disabled={testingConnection === api.id}
                    type="button"
                  >
                    {testingConnection === api.id ? '⏳' : '🔌'}
                    {testingConnection === api.id ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    className={`px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs font-medium flex items-center justify-center gap-1 ${
                      syncingProducts === api.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => onSyncProducts(api.id, api.name)}
                    disabled={syncingProducts === api.id}
                    type="button"
                  >
                    {syncingProducts === api.id ? '⏳' : '🔄'}
                    {syncingProducts === api.id ? 'Syncing...' : 'Sync Products'}
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-xs font-medium flex items-center justify-center gap-1"
                    onClick={() => onViewTransactions(api.id, api.name)}
                    type="button"
                  >
                    📊 Logs
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiCall, successMessage = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      if (successMessage) {
        console.log(successMessage, result);
      }
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message 
      || 'Operation failed';
      setError(errorMessage);
      console.error('API Error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, callApi, setError };
};

const AddApiModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'daily',
    base_url: '',
    description: '',
    api_key: '',
    priority: 1,
    max_daily_limit: '',
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleChange = (field, value) => {
    if (!isMounted.current) return;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'API name is required';
    }

    if (!formData.base_url.trim()) {
      newErrors.base_url = 'Base URL is required';
    } else if (!isValidUrl(formData.base_url)) {
      newErrors.base_url = 'Please enter a valid URL';
    }

    if (!formData.api_key.trim()) {
      newErrors.api_key = 'API Key is required';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await onSave(formData);
    if (success && isMounted.current) {
      setFormData({
        name: '',
        provider: 'daily',
        base_url: '',
        description: '',
        api_key: '',
        priority: 1,
        max_daily_limit: '',
        is_active: true,
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    if (!isMounted.current) return;

    setFormData({
      name: '',
      provider: 'daily',
      base_url: '',
      description: '',
      api_key: '',
      priority: 1,
      max_daily_limit: '',
      is_active: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New API</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Alaaeddin Main API"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider *
            </label>
            <select
              value={formData.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="daily">Daily</option>
              <option value="alfaour">Alfaour</option>
              <option value="alaaeddin">Alaaeddin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL *
            </label>
            <input
              type="url"
              value={formData.base_url}
              onChange={(e) => handleChange('base_url', e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.base_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://api.example.com"
            />
            {errors.base_url && (
              <p className="text-red-500 text-xs mt-1">{errors.base_url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) => handleChange('api_key', e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.api_key ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your API key"
            />
            {errors.api_key && (
              <p className="text-red-500 text-xs mt-1">{errors.api_key}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                className={`w-full p-2 border rounded ${
                  errors.priority ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.priority && (
                <p className="text-red-500 text-xs mt-1">{errors.priority}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Limit
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.max_daily_limit}
                onChange={(e) => handleChange('max_daily_limit', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Activate this API immediately
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Adding...' : 'Add API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Api = () => {
  const [apis, setApis] = useState([]);
  const [testingConnection, setTestingConnection] = useState(null);
  const [syncingProducts, setSyncingProducts] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();

  const isMounted = useRef(true);
  const { loading, error, callApi, setError } = useApi();

  const [stats, setStats] = useState({
    totalApis: 0,
    activeApis: 0,
    dailyApis: 0,
    alfaourApis: 0,
    alaaeddinApis: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      fetchApis();
    }
  }, []);

  const fetchApis = useCallback(async () => {
    const { success, data } = await callApi(
      () => axiosInstance.get('third_party_apis/apis/'),
      'APIs fetched successfully',
    );

    if (success && isMounted.current) {
      try {
        let apisData = [];
        if (Array.isArray(data)) {
          apisData = data;
        } else if (data && typeof data === 'object') {
          apisData = data.results || data.data || Object.values(data).filter(item => typeof item === 'object') || [];
        }

        apisData = Array.isArray(apisData) ? apisData : [];

        console.log('Processed APIs data:', apisData);
        setApis(apisData);
        calculateStats(apisData);
      } catch (err) {
        console.error('Error processing API data:', err);
        setApis([]);
        calculateStats([]);
      }
    }
  }, [callApi]);

  const calculateStats = useCallback((apisData) => {
    if (!isMounted.current) return;

    const totalApis = apisData.length;
    const activeApis = apisData.filter(api => api.is_active).length;
    const dailyApis = apisData.filter(api => api.provider === 'daily').length;
    const alfaourApis = apisData.filter(api => api.provider === 'alfaour').length;
    const alaaeddinApis = apisData.filter(api => api.provider === 'alaaeddin').length;

    const totalProducts = apisData.reduce((total, api) => {
      return total + (api.products_count || 0);
    }, 0);

    setStats({
      totalApis,
      activeApis,
      dailyApis,
      alfaourApis,
      alaaeddinApis,
      totalProducts,
    });
  }, []);

  const generatePieChartData = useCallback(() => {
    const providerCounts = {
      Daily: apis.filter(api => api.provider === 'daily').length,
      Alfaour: apis.filter(api => api.provider === 'alfaour').length,
      Alaaeddin: apis.filter(api => api.provider === 'alaaeddin').length
    };

    return {
      providerData: Object.entries(providerCounts)
        .filter(([_, count]) => count > 0)
        .map(([provider, count]) => ({
          x: provider,
          y: count,
          text: `${count} APIs`,
        })),
    };
  }, [apis]);

  const pieChartData = generatePieChartData();

  const handleAddApi = async (formData) => {
    const { success } = await callApi(
      () => axiosInstance.post('third_party_apis/apis/', {
        name: formData.name,
        provider: formData.provider,
        base_url: formData.base_url,
        description: formData.description,
        api_key: formData.api_key,
        priority: formData.priority,
        max_daily_limit: formData.max_daily_limit || null,
        is_active: formData.is_active,
      }),
      'API added successfully',
    );

    if (success && isMounted.current) {
      fetchApis();
      setShowAddModal(false);
      showNotification('success', 'API Added', 'API configuration has been added successfully');
      return true;
    }
    return false;
  };

  const handleTestConnection = async (apiId, apiName) => {
    if (!isMounted.current) return;

    try {
      setTestingConnection(apiId);

      const response = await axiosInstance.post(`third_party_apis/apis/${apiId}/test_connection/`);

      if (!isMounted.current) return;

      if (response.data.connected || response.data.success) {
        const result = response.data;
        let message = `✅ Connection successful!\n\nAPI: ${apiName}\nProvider: ${result.provider || apiName}\n`;

        if (result.balance_test && result.balance_test.success) {
          message += `Balance: ${result.balance_test.balance || 'N/A'}\n`;
        }

        if (result.products_test) {
          message += `Products: ${result.products_test.products_count || 0} found\n`;
        }

        if (result.details) {
          message += `Details: ${result.details}`;
        }

        showNotification('success', 'Connection Test Successful', message);
        fetchApis();
      } else {
        showNotification('error', 'Connection Test Failed',
          `API: ${apiName}\nError: ${response.data.error || 'Unknown error'}`
        );
      }
    } catch (err) {
      console.error('Connection test error:', err);
      if (!isMounted.current) return;

      const errorMessage = err.response?.data?.error
      || err.response?.data?.detail
                          || 'Connection test failed';
      showNotification('error', 'Connection Test Failed',
        `API: ${apiName}\nError: ${errorMessage}`);
    } finally {
      if (isMounted.current) {
        setTestingConnection(null);
      }
    }
  };

  const handleSyncProducts = async (apiId, apiName) => {
    if (!isMounted.current) return;

    try {
      setSyncingProducts(apiId);

      const response = await axiosInstance.post(`third_party_apis/apis/${apiId}/sync_products/`);

      if (!isMounted.current) return;

      if (response.data.success) {
        showNotification('success', 'Product Sync Successful',
          `API: ${apiName}\nNew: ${response.data.synced_count}\nUpdated: ${response.data.updated_count}\nActive: ${response.data.active_products}/${response.data.total_products}`);

        fetchApis();
      } else {
        showNotification('error', 'Product Sync Failed',
          `API: ${apiName}\nError: ${response.data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Product sync error:', err);
      if (!isMounted.current) return;

      const errorMessage = err.response?.data?.error
      || err.response?.data?.detail
                          || 'Product sync failed';
      showNotification('error', 'Product Sync Failed',
        `API: ${apiName}\nError: ${errorMessage}`);
    } finally {
      if (isMounted.current) {
        setSyncingProducts(null);
      }
    }
  };

  const handleViewTransactions = (apiId, apiName) => {
    window.location.href = `/api-transactions?api=${apiId}`;
  };

  const showNotification = (type, title, message) => {
    const styles = {
      success: { bg: 'bg-green-100 border-green-400 text-green-800' },
      error: { bg: 'bg-red-100 border-red-400 text-red-800' },
      warning: { bg: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
      info: { bg: 'bg-blue-100 border-blue-400 text-blue-800' },
    };

    const style = styles[type] || styles.info;

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg border ${style.bg} ${style.text} shadow-lg z-50 max-w-md`;
    notification.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm mt-1 whitespace-pre-line">${message}</div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  const tableData = React.useMemo(() => {
    try {
      return apis.map(api => ({
        id: api.id || 0,
        name: api.name || 'Unnamed API',
        provider: api.provider || 'unknown',
        base_url: api.base_url || '',
        description: api.description || '',
        priority: api.priority || 1,
        max_daily_limit: api.max_daily_limit ? `$${parseFloat(api.max_daily_limit).toFixed(2)}` : 'No limit',
        is_active: Boolean(api.is_active),
        is_connected: Boolean(api.is_connected),
        encrypted_api_key: api.encrypted_api_key || null,
        created_at: api.created_at ? new Date(api.created_at).toLocaleDateString() : 'N/A',
        updated_at: api.updated_at ? new Date(api.updated_at).toLocaleDateString() : 'N/A',
      }));
    } catch (oerror) {
      console.error('Error processing table data:', oerror);
      return [];
    }
  }, [apis]);

  if (loading && apis.length === 0) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Integration Management" title="API Configuration" />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading APIs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header
        category="Integration Management"
        title="Third Party APIs"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">API Providers Distribution</h3>
          {pieChartData.providerData.length > 0 ? (
            <AccumulationChartComponent
              id="api-providers-chart"
              legendSettings={{
                visible: true,
                position: 'Bottom',
                textStyle: { size: '12px' },
              }}
              height="300px"
              tooltip={{ enable: true, format: '${point.x} : <b>${point.y} APIs</b>' }}
            >
              <ChartInject services={[AccumulationLegend, PieSeries, AccumulationDataLabel, AccumulationTooltip]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  name="APIs"
                  dataSource={pieChartData.providerData}
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
          ) : (
            <div className="flex justify-center items-center h-32 text-gray-500">
              No API data available for chart
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm">Total APIs</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalApis}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.activeApis} active</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-sm">Active APIs</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeApis}</p>
          <p className="text-xs text-green-600 mt-1">Ready for use</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold text-sm">Daily APIs</p>
          <p className="text-2xl font-bold text-purple-600">{stats.dailyApis}</p>
          <p className="text-xs text-purple-600 mt-1">Daily provider</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold text-sm">Alfaour APIs</p>
          <p className="text-2xl font-bold text-orange-600">{stats.alfaourApis}</p>
          <p className="text-xs text-orange-600 mt-1">Alfaour provider</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold text-sm">Alaaeddin APIs</p>
          <p className="text-2xl font-bold text-red-600">{stats.alaaeddinApis}</p>
          <p className="text-xs text-red-600 mt-1">Alaaeddin provider</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-800 font-semibold text-sm">Total Products</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalProducts}</p>
          <p className="text-xs text-indigo-600 mt-1">Available products</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
            type="button"
          >
            <span>+</span> Add New API
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center gap-2"
            onClick={fetchApis}
            disabled={loading}
            type="button"
          >
            {loading ? '⏳' : '🔄'} Refresh Data
          </button>
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm flex items-center gap-2"
            onClick={() => {
              apis.filter(api => api.is_active).forEach(api => {
                handleSyncProducts(api.id, api.name);
              });
            }}
            type="button"
          >
            🔄 Sync All Active APIs
          </button>
        </div>
      </div>

      <div className="relative border border-gray-200 rounded-lg overflow-hidden">
        <ApiTable
          data={tableData}
          onTestConnection={handleTestConnection}
          onSyncProducts={handleSyncProducts}
          onViewTransactions={handleViewTransactions}
          testingConnection={testingConnection}
          syncingProducts={syncingProducts}
        />
      </div>

      <AddApiModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddApi}
        loading={loading}
      />

      {apis.length === 0 && !loading && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🚀 Getting Started with Third Party APIs</h4>
          <p className="text-sm text-blue-700 mb-3">
            No APIs configured yet. Follow these steps to integrate with payment providers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Setup Steps:</h5>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Click &quot;Add New API&quot; button above</li>
                <li>Fill in the API configuration details</li>
                <li>Test the connection to verify credentials</li>
                <li>Sync products to import available services</li>
                <li>Activate the API to make it available for users</li>
              </ol>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Required Information:</h5>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li><strong>API Name</strong>: Descriptive name for identification</li>
                <li><strong>Provider</strong>: Choose from available providers</li>
                <li><strong>Base URL</strong>: API endpoint URL</li>
                <li><strong>API Key</strong>: Authentication token from provider</li>
                <li><strong>Priority</strong>: Order of API usage (1 = highest)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Api;
