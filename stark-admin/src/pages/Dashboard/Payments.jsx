import React, { useState, useEffect } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Toolbar,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';
import { Header } from '../../components';
import axiosInstance from '../../utils/axiosConfig';

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [formFields, setFormFields] = useState([]);

  const toolbarOptions = ['Search', 'Refresh'];

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/payment-methods/admin/payment-methods/');

      setMethods(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to load payment methods');
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const filteredMethods = methods.filter((method) => method.title?.toLowerCase().includes(searchText.toLowerCase()) || method.currency?.toLowerCase().includes(searchText.toLowerCase()) || method.account_details?.toLowerCase().includes(searchText.toLowerCase()));

  const iconTemplate = (props) => (
    <div className="flex flex-col items-center">
      <img
        src={props.icon_url || getDefaultIcon(props.currency)}
        alt={props.title}
        className="w-12 h-12 object-contain rounded-lg bg-gray-100 p-1"
        onError={(e) => {
          e.target.src = getDefaultIcon(props.currency);
        }}
      />
      {props.currency && (
        <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
          props.currency === 'usd'
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
        }`}
        >
          {props.currency.toUpperCase()}
        </span>
      )}
    </div>
  );

  const detailsTemplate = (props) => (
    <div className="max-w-xs">
      <p className="text-sm font-medium text-gray-900 truncate">
        {props?.title || 'No Title'}
      </p>
      <p className="text-xs text-gray-600 mt-1">
        {props?.account_details || 'No details provided'}
      </p>
    </div>
  );

  const instructionsTemplate = (props) => (
    <div
      className="max-w-xs cursor-help group relative"
      title={props?.instructions || 'No instructions'}
    >
      <p className="text-sm text-gray-600 truncate">
        {props?.instructions || 'No instructions provided'}
      </p>
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 max-w-xs break-words">
          {props?.instructions || 'No instructions provided'}
        </div>
      </div>
    </div>
  );

  const statusTemplate = (props) => (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          props?.is_active
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-600 border border-red-300'
        }`}
      >
        {props?.is_active ? '🟢 Active' : '🔴 Inactive'}
      </span>
      <span className="text-xs text-gray-500">
        {props?.created_at ? new Date(props.created_at).toLocaleDateString() : 'N/A'}
      </span>
    </div>
  );

  const fieldsTemplate = (props) => (
    <div className="text-center">
      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        {props.fields?.length || 0}
      </span>
    </div>
  );

  const actionsTemplate = (props) => (
    <div className="flex gap-2 justify-center">
      <button
        type="button"
        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium flex items-center gap-1"
        onClick={() => handleEdit(props)}
        title="Edit payment method"
      >
        ✏️ Edit
      </button>
      <button
        type="button"
        className={`px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1 ${
          props.is_active
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        onClick={() => toggleStatus(props.id)}
        title={props.is_active ? 'Deactivate method' : 'Activate method'}
      >
        {props.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
      </button>
      <button
        type="button"
        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium flex items-center gap-1"
        onClick={() => handleDelete(props.id, props.title)}
        title="Delete payment method"
      >
        🗑️ Delete
      </button>
    </div>
  );

  const getDefaultIcon = (currency) => {
    const icons = {
      usd: 'https://cdn-icons-png.flaticon.com/512/4209/4209382.png',
      syp: 'https://cdn-icons-png.flaticon.com/512/4209/4209382.png',
      default: 'https://cdn-icons-png.flaticon.com/512/3536/3536034.png'
    };
    return icons[currency] || icons.default;
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormFields(method.fields || []);
    setShowModal(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await axiosInstance.delete(`/payment-methods/admin/payment-methods/${id}/`);
        await fetchPaymentMethods();
        alert('Payment method deleted successfully!');
      } catch (err) {
        console.error('Error deleting payment method:', err);
        alert('Failed to delete payment method');
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      const method = methods.find((m) => m.id === id);
      const updatedData = { ...method, is_active: !method.is_active };

      await axiosInstance.put(`/payment-methods/admin/payment-methods/${id}/`, updatedData);
      await fetchPaymentMethods();
    } catch (err) {
      console.error('Error updating payment method status:', err);
      alert('Failed to update payment method status');
    }
  };

  const handleAddMethod = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const methodData = {
      title: formData.get('title'),
      name: formData.get('name'),
      currency: formData.get('currency'),
      icon_url: formData.get('icon_url') || '',
      account_details: formData.get('account_details'),
      instructions: formData.get('instructions'),
      description: formData.get('description') || '',
      note: formData.get('note') || '',
      is_active: formData.get('is_active') === 'on',
      fields: formFields.map((field) => ({
        field_name: field.field_name,
        field_key: field.field_key,
        input_type: field.input_type,
        is_required: field.is_required,
        placeholder: field.placeholder || '',
        order: field.order || 0,
      })),
    };

    try {
      if (editingMethod) {
        await axiosInstance.put(`/payment-methods/admin/payment-methods/${editingMethod.id}/`, methodData);
        alert('Payment method updated successfully!');
      } else {
        await axiosInstance.post('/payment-methods/admin/payment-methods/', methodData);
        alert('Payment method created successfully!');
      }

      setShowModal(false);
      setEditingMethod(null);
      setFormFields([]);

      setTimeout(() => {
        fetchPaymentMethods();
      }, 100);
    } catch (err) {
      console.error('Error saving payment method:', err);

      if (err.response?.data) {
        const errorData = err.response.data;
        let errorMessage = 'Failed to save payment method:\n';

        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach((key) => {
            if (Array.isArray(errorData[key])) {
              errorMessage += `• ${key}: ${errorData[key].join(', ')}\n`;
            } else if (typeof errorData[key] === 'object') {
              Object.keys(errorData[key]).forEach((nestedKey) => {
                errorMessage += `• ${key}.${nestedKey}: ${errorData[key][nestedKey]}\n`;
              });
            } else {
              errorMessage += `• ${key}: ${errorData[key]}\n`;
            }
          });
        } else {
          errorMessage += errorData;
        }

        alert(errorMessage);
      } else if (err.message) {
        alert(`Error: ${err.message}`);
      } else {
        alert('Failed to save payment method. Please check the console for details.');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMethod(null);
    setFormFields([]);
  };

  const addFormField = () => {
    setFormFields((prev) => [...prev, {
      field_name: '',
      field_key: '',
      input_type: 'text',
      is_required: true,
      placeholder: '',
      order: prev.length,
    }]);
  };

  const updateFormField = (index, field, value) => {
    setFormFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'field_name') {
        updated[index].field_key = value.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      }

      return updated;
    });
  };

  const removeFormField = (index) => {
    setFormFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToolbarClick = (args) => {
    if (args.item.id.includes('Refresh')) {
      fetchPaymentMethods();
    }
  };

  const activeMethods = methods.filter((m) => m.is_active).length;
  const usdMethods = methods.filter((m) => m.currency === 'usd').length;
  const sypMethods = methods.filter((m) => m.currency === 'syp').length;

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="Payments Management" title="Manual Payment Methods" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading payment methods...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="Payments Management" title="Manual Payment Methods" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
          <button
            type="button"
            onClick={fetchPaymentMethods}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header
        category="Payments Management"
        title="Manual Payment Methods"
      />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={fetchPaymentMethods}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Methods</p>
          <p className="text-2xl font-bold text-blue-600">{methods.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">Active Methods</p>
          <p className="text-2xl font-bold text-green-600">{activeMethods}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold">USD Methods</p>
          <p className="text-2xl font-bold text-purple-600">{usdMethods}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold">SYP Methods</p>
          <p className="text-2xl font-bold text-orange-600">{sypMethods}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search methods by title, currency, or details..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          ➕ Add New Method
        </button>
      </div>

      {methods && methods.length > 0 ? (
        <GridComponent
          dataSource={filteredMethods}
          allowPaging
          allowSorting
          allowFiltering
          toolbar={toolbarOptions}
          pageSettings={{ pageSize: 8 }}
          height={400}
          enableHover
          toolbarClick={handleToolbarClick}
          ref={(grid) => {
            if (grid && grid.dataSource && !Array.isArray(grid.dataSource)) {
              grid.dataSource = [];
            }
          }}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="id"
              headerText="ID"
              width="80"
              textAlign="Center"
              isPrimaryKey
            />
            <ColumnDirective
              headerText="Icon & Currency"
              width="120"
              textAlign="Center"
              template={iconTemplate}
            />
            <ColumnDirective
              field="title"
              headerText="Method Title"
              width="200"
              textAlign="Left"
            />
            <ColumnDirective
              headerText="Account Details"
              width="220"
              template={detailsTemplate}
              textAlign="Left"
            />
            <ColumnDirective
              headerText="Instructions"
              width="200"
              template={instructionsTemplate}
              textAlign="Left"
            />
            <ColumnDirective
              headerText="Fields"
              width="80"
              textAlign="Center"
              template={fieldsTemplate}
            />
            <ColumnDirective
              headerText="Status & Date"
              width="140"
              textAlign="Center"
              template={statusTemplate}
            />
            <ColumnDirective
              headerText="Actions"
              width="280"
              textAlign="Center"
              template={actionsTemplate}
            />
          </ColumnsDirective>
          <Inject services={[Page, Toolbar, Sort, Filter]} />
        </GridComponent>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-500 text-lg">No payment methods found</p>
          <p className="text-gray-400 mt-2">Create your first payment method to get started</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Payment Method
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMethod} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method Title *
                  </label>
                  <input
                    name="title"
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Bank Transfer - Syrian Pounds"
                    defaultValue={editingMethod?.title}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unique Name *
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., bank_transfer_syp"
                    defaultValue={editingMethod?.name}
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier (no spaces, use underscores)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    name="currency"
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={editingMethod?.currency || 'usd'}
                  >
                    <option value="usd">USD ($)</option>
                    <option value="syp">Syrian Pound (SYP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL
                  </label>
                  <input
                    name="icon_url"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/icon.png"
                    defaultValue={editingMethod?.icon_url}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account/Service Details *
                </label>
                <textarea
                  name="account_details"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Account number, agent details, or service information..."
                  defaultValue={editingMethod?.account_details}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions *
                </label>
                <textarea
                  name="instructions"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Step-by-step instructions for users..."
                  defaultValue={editingMethod?.instructions}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Optional description..."
                    defaultValue={editingMethod?.description}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    name="note"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Additional notes..."
                    defaultValue={editingMethod?.note}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Form Fields</h3>
                  <button
                    type="button"
                    onClick={addFormField}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    ➕ Add Field
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Define the input fields users need to fill when using this payment method
                </p>

                {formFields.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No form fields added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add fields to collect user information</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formFields.map((field, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Field Name *
                            </label>
                            <input
                              type="text"
                              value={field.field_name}
                              onChange={(e) => updateFormField(index, 'field_name', e.target.value)}
                              className="w-full border border-gray-300 p-2 rounded text-sm"
                              placeholder="e.g., Account Number"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Field Key
                            </label>
                            <input
                              type="text"
                              value={field.field_key}
                              onChange={(e) => updateFormField(index, 'field_key', e.target.value)}
                              className="w-full border border-gray-300 p-2 rounded text-sm bg-gray-100"
                              placeholder="auto-generated"
                              readOnly
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Input Type *
                            </label>
                            <select
                              value={field.input_type}
                              onChange={(e) => updateFormField(index, 'input_type', e.target.value)}
                              className="w-full border border-gray-300 p-2 rounded text-sm"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="file">File</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              value={field.placeholder}
                              onChange={(e) => updateFormField(index, 'placeholder', e.target.value)}
                              className="w-full border border-gray-300 p-2 rounded text-sm"
                              placeholder="Optional placeholder text"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.is_required}
                              onChange={(e) => updateFormField(index, 'is_required', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            Required Field
                          </label>

                          <button
                            type="button"
                            onClick={() => removeFormField(index)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked={editingMethod?.is_active ?? true}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Set as Active (users can see and use this method)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  {editingMethod ? 'Update Method' : 'Save Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
