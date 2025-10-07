import React, { useState } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Toolbar,
  Sort,
  Filter,
  Edit,
  CommandColumn
} from '@syncfusion/ej2-react-grids';

import { Header } from '../../components';
import { paymentMethodsData } from '../../data/paymentMethods';

const PaymentMethods = () => {
  const [methods, setMethods] = useState(paymentMethodsData);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [searchText, setSearchText] = useState('');

  const toolbarOptions = ['Search', 'Add'];

  const filteredMethods = methods.filter(method =>
    method.Title.toLowerCase().includes(searchText.toLowerCase()) ||
    method.Currency.toLowerCase().includes(searchText.toLowerCase()) ||
    method.AccountDetails.toLowerCase().includes(searchText.toLowerCase())
  );

  const iconTemplate = (props) => (
    <div className="flex flex-col items-center">
      <img
        src={props.PhotoURL || getDefaultIcon(props.Currency)}
        alt={props.Title}
        className="w-12 h-12 object-contain rounded-lg bg-gray-100 p-1"
        onError={(e) => {
          e.target.src = getDefaultIcon(props.Currency);
        }}
      />
      {props.Currency && (
        <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
          props.Currency === 'USD' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {props.Currency}
        </span>
      )}
    </div>
  );

  const detailsTemplate = (props) => (
    <div className="max-w-xs">
      <p className="text-sm font-medium text-gray-900 truncate">{props.Title}</p>
      <p className="text-xs text-gray-600 mt-1">{props.AccountDetails}</p>
    </div>
  );

  const instructionsTemplate = (props) => (
    <div 
      className="max-w-xs cursor-help group relative"
      title={props.InstructionText}
    >
      <p className="text-sm text-gray-600 truncate">
        {props.InstructionText}
      </p>
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 max-w-xs break-words">
          {props.InstructionText}
        </div>
      </div>
    </div>
  );

  const statusTemplate = (props) => (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          props.IsActive 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-600 border border-red-300'
        }`}
      >
        {props.IsActive ? '🟢 Active' : '🔴 Inactive'}
      </span>
      <span className="text-xs text-gray-500">
        {props.DateCreated ? new Date(props.DateCreated).toLocaleDateString() : 'N/A'}
      </span>
    </div>
  );

  const actionsTemplate = (props) => (
    <div className="flex gap-2 justify-center">
      <button
        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium flex items-center gap-1"
        onClick={() => handleEdit(props)}
        title="Edit payment method"
      >
        ✏️ Edit
      </button>
      <button
        className={`px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1 ${
          props.IsActive
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        onClick={() => toggleStatus(props.MethodID)}
        title={props.IsActive ? 'Deactivate method' : 'Activate method'}
      >
        {props.IsActive ? '⏸️ Deactivate' : '▶️ Activate'}
      </button>
      <button
        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium flex items-center gap-1"
        onClick={() => handleDelete(props.MethodID, props.Title)}
        title="Delete payment method"
      >
        🗑️ Delete
      </button>
    </div>
  );

  const getDefaultIcon = (currency) => {
    const icons = {
      'USD': 'https://cdn-icons-png.flaticon.com/512/4209/4209382.png',
      'SYP': 'https://cdn-icons-png.flaticon.com/512/4209/4209382.png',
      'default': 'https://cdn-icons-png.flaticon.com/512/3536/3536034.png'
    };
    return icons[currency] || icons.default;
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setMethods((prev) => prev.filter((m) => m.MethodID !== id));
    }
  };

  const toggleStatus = (id) => {
    setMethods((prev) =>
      prev.map((m) =>
        m.MethodID === id ? { ...m, IsActive: !m.IsActive } : m
      )
    );
  };

  const handleAddMethod = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      Title: form.title.value,
      Currency: form.currency.value,
      PhotoURL: form.photoURL.value || getDefaultIcon(form.currency.value),
      AccountDetails: form.details.value,
      InstructionText: form.instructions.value,
      IsActive: form.isActive.checked,
    };

    if (editingMethod) {
      setMethods((prev) =>
        prev.map((m) =>
          m.MethodID === editingMethod.MethodID
            ? { ...m, ...formData, DateModified: new Date() }
            : m
        )
      );
    } else {
      const newMethod = {
        MethodID: Date.now(),
        ...formData,
        DateCreated: new Date(),
      };
      setMethods((prev) => [...prev, newMethod]);
    }

    setShowModal(false);
    setEditingMethod(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMethod(null);
  };

  const activeMethods = methods.filter(m => m.IsActive).length;
  const usdMethods = methods.filter(m => m.Currency === 'USD').length;
  const sypMethods = methods.filter(m => m.Currency === 'SYP').length;

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Payments Management" 
        title="Manual Payment Methods" 
      />

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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          ➕ Add New Method
        </button>
      </div>

      <GridComponent
        dataSource={filteredMethods}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 8 }}
        height={400}
        enableHover={true}
      >
        <ColumnsDirective>
          <ColumnDirective 
            field="MethodID" 
            headerText="ID" 
            width="80" 
            textAlign="Center" 
            isPrimaryKey={true} 
          />
          <ColumnDirective 
            headerText="Icon & Currency" 
            width="120" 
            textAlign="Center" 
            template={iconTemplate} 
          />
          <ColumnDirective 
            field="Title" 
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddMethod} className="space-y-4">
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
                    defaultValue={editingMethod?.Title}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select 
                    name="currency" 
                    required 
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={editingMethod?.Currency || 'USD'}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="SYP">Syrian Pound (SYP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo/Icon URL
                </label>
                <input 
                  name="photoURL" 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/icon.png"
                  defaultValue={editingMethod?.PhotoURL}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default icon for selected currency
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account/Service Details *
                </label>
                <textarea 
                  name="details" 
                  required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Account number, agent details, or service information..."
                  defaultValue={editingMethod?.AccountDetails}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruction Text *
                </label>
                <textarea 
                  name="instructions" 
                  required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Step-by-step instructions for users..."
                  defaultValue={editingMethod?.InstructionText}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive" 
                  defaultChecked={editingMethod?.IsActive ?? true}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
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