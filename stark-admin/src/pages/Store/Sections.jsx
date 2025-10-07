import React, { useState, useMemo } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Toolbar,
  Sort,
  Filter,
} from "@syncfusion/ej2-react-grids";

import { Header } from "../../components";
import { storeSectionsData } from "../../data/sections"

const StoreSections = () => {
  const [data, setData] = useState(storeSectionsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    currency: 'All',
    type: 'All'
  });

  const [newSection, setNewSection] = useState({
    Title: "",
    ShortDescription: "",
    IconURL: "",
    SortOrder: 1,
    DefaultCurrency: "USD",
    IsActive: true,
    SectionType: "Digital",
    TargetAudience: "All Users",
    CommissionRate: 15,
  });

  const toolbarOptions = ["Search"];

  const filteredData = useMemo(() => {
    return data.filter(section => {
      if (filters.status !== 'All' && section.IsActive !== (filters.status === 'Active')) return false;
      if (filters.currency !== 'All' && section.DefaultCurrency !== filters.currency) return false;
      if (filters.type !== 'All' && section.SectionType !== filters.type) return false;
      return true;
    });
  }, [data, filters]);

  const stats = useMemo(() => {
    const totalSections = data.length;
    const activeSections = data.filter(s => s.IsActive).length;
    const totalProducts = data.reduce((sum, section) => sum + section.ProductCount, 0);
    const usdSections = data.filter(s => s.DefaultCurrency === 'USD').length;
    const avgCommission = data.reduce((sum, section) => sum + section.CommissionRate, 0) / data.length;

    return { totalSections, activeSections, totalProducts, usdSections, avgCommission };
  }, [data]);

  const iconTemplate = (props) => (
    <div className="flex flex-col items-center">
      <img
        src={props.IconURL}
        alt={props.Title}
        className="w-12 h-12 rounded-lg object-cover bg-gray-100 p-1"
        onError={(e) => {
          e.target.src = "https://cdn-icons-png.flaticon.com/512/1170/1170679.png";
        }}
      />
      <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
        props.DefaultCurrency === 'USD' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-blue-100 text-blue-700'
      }`}>
        {props.DefaultCurrency}
      </span>
    </div>
  );

  const statusTemplate = (props) => (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          props.IsActive
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}
      >
        {props.IsActive ? "🟢 Active" : "🔴 Inactive"}
      </span>
      <span className="text-xs text-gray-500">
        {props.ProductCount} products
      </span>
    </div>
  );

  const descriptionTemplate = (props) => (
    <div className="max-w-xs">
      <p className="text-sm font-medium text-gray-900">{props.Title}</p>
      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{props.ShortDescription}</p>
      <div className="flex gap-2 mt-1">
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
          {props.SectionType}
        </span>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
          {props.TargetAudience}
        </span>
      </div>
    </div>
  );

  const commissionTemplate = (props) => (
    <div className="text-center">
      <span className={`text-sm font-bold ${
        props.CommissionRate >= 15 ? 'text-green-600' : 
        props.CommissionRate >= 10 ? 'text-blue-600' : 'text-gray-600'
      }`}>
        {props.CommissionRate}%
      </span>
      <p className="text-xs text-gray-500">Commission</p>
    </div>
  );

  const actionTemplate = (props) => (
    <div className="flex flex-col gap-2 justify-center">
      <div className="flex gap-2">
        <button 
          onClick={() => handleEdit(props)}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium flex items-center gap-1"
          title="Edit section"
        >
          ✏️ Edit
        </button>
        <button 
          onClick={() => handleViewProducts(props.CategoryID)}
          className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-xs font-medium flex items-center gap-1"
          title="View products"
        >
          📦 Products
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => toggleStatus(props.CategoryID)}
          className={`px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1 ${
            props.IsActive
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          title={props.IsActive ? "Deactivate section" : "Activate section"}
        >
          {props.IsActive ? "⏸️ Hide" : "▶️ Show"}
        </button>
        <button
          onClick={() => handleDelete(props.CategoryID, props.Title)}
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium flex items-center gap-1"
          title="Delete section"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  const handleEdit = (section) => {
    setEditingSection(section);
    setNewSection({
      Title: section.Title,
      ShortDescription: section.ShortDescription,
      IconURL: section.IconURL,
      SortOrder: section.SortOrder,
      DefaultCurrency: section.DefaultCurrency,
      IsActive: section.IsActive,
      SectionType: section.SectionType,
      TargetAudience: section.TargetAudience,
      CommissionRate: section.CommissionRate,
    });
    setIsModalOpen(true);
  };

  const handleViewProducts = (categoryId) => {
    alert(`Navigating to products for category ${categoryId}`);
  };

  const toggleStatus = (id) => {
    setData((prev) =>
      prev.map((s) =>
        s.CategoryID === id ? { ...s, IsActive: !s.IsActive } : s
      )
    );
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will also remove all products in this section.`)) {
      setData((prev) => prev.filter((s) => s.CategoryID !== id));
    }
  };

  const handleSaveSection = (e) => {
    e.preventDefault();
    
    if (editingSection) {
      setData((prev) =>
        prev.map((s) =>
          s.CategoryID === editingSection.CategoryID
            ? { ...s, ...newSection, LastModified: new Date() }
            : s
        )
      );
    } else {
      const newEntry = {
        ...newSection,
        CategoryID: Math.max(...data.map(s => s.CategoryID)) + 1,
        ProductCount: 0,
        LastModified: new Date(),
        CreatedDate: new Date(),
      };
      setData([...data, newEntry]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setNewSection({
      Title: "",
      ShortDescription: "",
      IconURL: "",
      SortOrder: 1,
      DefaultCurrency: "USD",
      IsActive: true,
      SectionType: "Digital",
      TargetAudience: "All Users",
      CommissionRate: 15,
    });
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Store Management" title="Store Sections" />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm">Total Sections</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalSections}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-sm">Active Sections</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeSections}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold text-sm">Total Products</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold text-sm">USD Sections</p>
          <p className="text-2xl font-bold text-orange-600">{stats.usdSections}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-800 font-semibold text-sm">Avg Commission</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.avgCommission.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.currency}
              onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD</option>
              <option value="SYP">SYP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="All">All Types</option>
              <option value="Digital">Digital</option>
              <option value="Subscription">Subscription</option>
              <option value="Service">Service</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          ➕ Add New Section
        </button>
      </div>

      <GridComponent
        dataSource={filteredData}
        allowPaging
        allowSorting
        allowFiltering
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 10 }}
        height={500}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="CategoryID"
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
            headerText="Section Details"
            width="250"
            template={descriptionTemplate}
          />
          <ColumnDirective
            field="ProductCount"
            headerText="Products"
            width="100"
            textAlign="Center"
          />
          <ColumnDirective
            headerText="Commission"
            width="120"
            textAlign="Center"
            template={commissionTemplate}
          />
          <ColumnDirective
            field="SortOrder"
            headerText="Order"
            width="80"
            textAlign="Center"
          />
          <ColumnDirective
            headerText="Status"
            width="140"
            textAlign="Center"
            template={statusTemplate}
          />
          <ColumnDirective
            field="LastModified"
            headerText="Last Updated"
            width="130"
            textAlign="Center"
            format={{ type: "date", format: "dd/MM/yyyy" }}
          />
          <ColumnDirective
            headerText="Actions"
            width="240"
            textAlign="Center"
            template={actionTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter]} />
      </GridComponent>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingSection ? 'Edit Store Section' : 'Add New Store Section'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={newSection.Title}
                    onChange={(e) =>
                      setNewSection({ ...newSection, Title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={50}
                    required
                    placeholder="e.g., Mobile Gaming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Type *
                  </label>
                  <select
                    value={newSection.SectionType}
                    onChange={(e) =>
                      setNewSection({ ...newSection, SectionType: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Digital">Digital Products</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Service">Service</option>
                    <option value="Physical">Physical Goods</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description *
                </label>
                <textarea
                  value={newSection.ShortDescription}
                  onChange={(e) =>
                    setNewSection({
                      ...newSection,
                      ShortDescription: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={150}
                  rows="2"
                  required
                  placeholder="Brief description of this section..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL *
                  </label>
                  <input
                    type="url"
                    value={newSection.IconURL}
                    onChange={(e) =>
                      setNewSection({ ...newSection, IconURL: e.target.value })
                    }
                    placeholder="https://example.com/icon.png"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order *
                  </label>
                  <input
                    type="number"
                    value={newSection.SortOrder}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        SortOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Rate (%) *
                  </label>
                  <input
                    type="number"
                    value={newSection.CommissionRate}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        CommissionRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency *
                  </label>
                  <select
                    value={newSection.DefaultCurrency}
                    onChange={(e) =>
                      setNewSection({ ...newSection, DefaultCurrency: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="USD">USD ($)</option>
                    <option value="SYP">Syrian Pound (SYP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience *
                  </label>
                  <select
                    value={newSection.TargetAudience}
                    onChange={(e) =>
                      setNewSection({ ...newSection, TargetAudience: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="All Users">All Users</option>
                    <option value="Students">Students</option>
                    <option value="Business">Business</option>
                    <option value="Gamers">Gamers</option>
                    <option value="Local">Local Users</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newSection.IsActive}
                  onChange={(e) =>
                    setNewSection({ ...newSection, IsActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (Visible to users in the store)
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
                  {editingSection ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSections;
