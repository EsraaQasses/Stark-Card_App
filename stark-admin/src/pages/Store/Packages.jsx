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
import { packagesData } from "../../data/packagesData";

export default function PackagesPage() {
  const [packages, setPackages] = useState(packagesData);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    vendor: 'All',
    currency: 'All',
    fulfillment: 'All'
  });

  const [newPackage, setNewPackage] = useState({
    Name: "",
    Description: "",
    PriceUSD: 0,
    PriceSYP: 0,
    VendorCost: 0,
    VendorCostCurrency: "USD",
    VendorSystem: "Alfaour API",
    VendorSKU: "",
    FulfillmentType: "Instant Code",
    Category: "Gaming",
    IsActive: true,
    TrackStock: false,
    AvailableStock: 0,
    LowStockAlert: 10,
    MarginPercentage: 0,
    BonusAmount: 0,
    IsPopular: false,
    SortOrder: 1,
  });

  const toolbarOptions = ["Search", "Add"];

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      if (filters.status !== 'All' && pkg.Status !== filters.status) return false;
      if (filters.vendor !== 'All' && pkg.VendorSystem !== filters.vendor) return false;
      if (filters.currency !== 'All' && pkg.VendorCostCurrency !== filters.currency) return false;
      if (filters.fulfillment !== 'All' && pkg.FulfillmentType !== filters.fulfillment) return false;
      return true;
    });
  }, [packages, filters]);

  const stats = useMemo(() => {
    const totalPackages = packages.length;
    const activePackages = packages.filter(p => p.IsActive).length;
    const lowStockPackages = packages.filter(p => p.TrackStock && p.AvailableStock <= p.LowStockAlert && p.AvailableStock > 0).length;
    const outOfStockPackages = packages.filter(p => p.TrackStock && p.AvailableStock === 0).length;
    const totalMargin = packages.reduce((sum, p) => sum + p.MarginPercentage, 0) / packages.length;
    const popularPackages = packages.filter(p => p.IsPopular).length;

    return { totalPackages, activePackages, lowStockPackages, outOfStockPackages, totalMargin, popularPackages };
  }, [packages]);

  const calculateMargin = (priceUSD, vendorCost, vendorCurrency) => {
    const cost = vendorCurrency === 'SYP' ? vendorCost / 13000 : vendorCost;
    const margin = ((priceUSD - cost) / priceUSD) * 100;
    return Math.max(0, margin);
  };

  const statusTemplate = (props) => {
    const statusConfig = {
      'Active': { color: 'bg-green-100 text-green-800 border border-green-200', icon: '🟢' },
      'Hidden': { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: '⚫' },
      'Out of Stock': { color: 'bg-red-100 text-red-800 border border-red-200', icon: '🔴' },
      'Low Stock': { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '🟡' },
    };

    const config = statusConfig[props.Status] || statusConfig.Hidden;

    return (
      <div className="flex items-center justify-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}>
          {config.icon} {props.Status}
        </span>
      </div>
    );
  };

  const pricingTemplate = (props) => {
    const margin = calculateMargin(props.PriceUSD, props.VendorCost, props.VendorCostCurrency);

    return (
      <div className="text-right">
        <div className="font-semibold text-gray-900">${props.PriceUSD.toFixed(2)}</div>
        <div className="text-sm text-gray-600">{props.PriceSYP.toLocaleString()} SYP</div>
        <div className={`text-xs ${margin >= 20 ? 'text-green-600' : margin >= 10 ? 'text-blue-600' : 'text-orange-600'}`}>
          {margin.toFixed(1)}% margin
        </div>
      </div>
    );
  };

  const vendorTemplate = (props) => {
    const vendorIcons = {
      'Alfaour API': '🔌',
      'Internal System': '⚙️',
      'Manual Fulfillment': '👨‍💼',
    };

    return (
      <div className="text-center">
        <div className="text-sm">{vendorIcons[props.VendorSystem] || '🏢'}</div>
        <div className="text-xs text-gray-600">{props.VendorSystem}</div>
        <div className="text-xs text-gray-500">SKU: {props.VendorSKU}</div>
      </div>
    );
  };

  const stockTemplate = (props) => {
    if (!props.TrackStock) {
      return (
        <div className="text-center text-gray-500">
          <div className="text-sm">∞</div>
          <div className="text-xs">Unlimited</div>
        </div>
      );
    }

    const isLowStock = props.AvailableStock <= props.LowStockAlert && props.AvailableStock > 0;
    const isOutOfStock = props.AvailableStock === 0;
    let stockColor = 'text-green-600';
    if (isLowStock) stockColor = 'text-yellow-600';
    if (isOutOfStock) stockColor = 'text-red-600';

    return (
      <div className="text-center">
        <div className={`font-semibold ${stockColor}`}>
          {props.AvailableStock}
        </div>
        {props.LowStockAlert > 0 && (
          <div className="text-xs text-gray-500">
            Alert: {props.LowStockAlert}
          </div>
        )}
      </div>
    );
  };

  const actionsTemplate = (props) => (
    <div className="flex flex-col gap-2 justify-center">
      <div className="flex gap-2">
        <button
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleEdit(props)}
          title="Edit package"
        >
          ✏️ Edit
        </button>
        <button
          className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handlePricing(props.PackageID)}
          title="Manage pricing"
        >
          💰 Pricing
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1 ${
            props.IsActive
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          onClick={() => toggleStatus(props.PackageID)}
          title={props.IsActive ? "Deactivate package" : "Activate package"}
        >
          {props.IsActive ? "⏸️ Hide" : "▶️ Show"}
        </button>
        <button
          className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleStock(props.PackageID)}
          title="Manage stock"
        >
          📦 Stock
        </button>
      </div>
    </div>
  );

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setNewPackage({
      Name: pkg.Name,
      Description: pkg.Description,
      PriceUSD: pkg.PriceUSD,
      PriceSYP: pkg.PriceSYP,
      VendorCost: pkg.VendorCost,
      VendorCostCurrency: pkg.VendorCostCurrency,
      VendorSystem: pkg.VendorSystem,
      VendorSKU: pkg.VendorSKU,
      FulfillmentType: pkg.FulfillmentType,
      Category: pkg.Category,
      IsActive: pkg.IsActive,
      TrackStock: pkg.TrackStock,
      AvailableStock: pkg.AvailableStock,
      LowStockAlert: pkg.LowStockAlert,
      MarginPercentage: pkg.MarginPercentage,
      BonusAmount: pkg.BonusAmount,
      IsPopular: pkg.IsPopular,
      SortOrder: pkg.SortOrder,
    });
    setShowModal(true);
  };

  const toggleStatus = (packageId) => {
    setPackages(prev =>
      prev.map(pkg =>
        pkg.PackageID === packageId 
          ? { ...pkg, IsActive: !pkg.IsActive, Status: !pkg.IsActive ? 'Active' : 'Hidden' }
          : pkg
      )
    );
  };

  const handlePricing = (packageId) => {
    alert(`Opening pricing management for ${packageId}`);
  };

  const handleStock = (packageId) => {
    alert(`Opening stock management for ${packageId}`);
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    const margin = calculateMargin(newPackage.PriceUSD, newPackage.VendorCost, newPackage.VendorCostCurrency);
    let status = newPackage.IsActive ? 'Active' : 'Hidden';
    if (newPackage.TrackStock) {
      if (newPackage.AvailableStock === 0) status = 'Out of Stock';
      else if (newPackage.AvailableStock <= newPackage.LowStockAlert) status = 'Low Stock';
    }

    if (editingPackage) {
      setPackages(prev =>
        prev.map(pkg =>
          pkg.PackageID === editingPackage.PackageID
            ? { 
                ...pkg, 
                ...newPackage, 
                Status: status,
                MarginPercentage: margin,
                LastUpdated: new Date()
              }
            : pkg
        )
      );
    } else {
      const newEntry = {
        ...newPackage,
        PackageID: `PKG-${String(packages.length + 1).padStart(3, '0')}`,
        Status: status,
        MarginPercentage: margin,
        LastUpdated: new Date(),
        CreatedDate: new Date(),
      };
      setPackages([...packages, newEntry]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setNewPackage({
      Name: "",
      Description: "",
      PriceUSD: 0,
      PriceSYP: 0,
      VendorCost: 0,
      VendorCostCurrency: "USD",
      VendorSystem: "Alfaour API",
      VendorSKU: "",
      FulfillmentType: "Instant Code",
      Category: "Gaming",
      IsActive: true,
      TrackStock: false,
      AvailableStock: 0,
      LowStockAlert: 10,
      MarginPercentage: 0,
      BonusAmount: 0,
      IsPopular: false,
      SortOrder: 1,
    });
  };

  const clearFilters = () => {
    setFilters({
      status: 'All',
      vendor: 'All',
      currency: 'All',
      fulfillment: 'All'
    });
  };

  const handleUSDPriceChange = (usdPrice) => {
    const syrPrice = usdPrice * 13000;
    setNewPackage(prev => ({
      ...prev,
      PriceUSD: usdPrice,
      PriceSYP: Math.round(syrPrice / 1000) * 1000,
    }));
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header
        category="Store Management"
        title="Packages Management"
      />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm">Total Packages</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalPackages}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-sm">Active Packages</p>
          <p className="text-2xl font-bold text-green-600">{stats.activePackages}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStockPackages}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{stats.outOfStockPackages}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold text-sm">Avg Margin</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold text-sm">Popular</p>
          <p className="text-2xl font-bold text-orange-600">{stats.popularPackages}</p>
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
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.vendor}
              onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
            >
              <option value="All">All Vendors</option>
              <option value="Alfaour API">Alfaour API</option>
              <option value="Internal System">Internal System</option>
              <option value="Manual Fulfillment">Manual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Currency</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.fulfillment}
              onChange={(e) => setFilters({ ...filters, fulfillment: e.target.value })}
            >
              <option value="All">All Types</option>
              <option value="Instant Code">Instant Code</option>
              <option value="Direct Injection">Direct Injection</option>
              <option value="Manual Processing">Manual Processing</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium flex items-center gap-2"
          >
            🗑️ Clear Filters
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center gap-2"
          >
            ➕ Add Package
          </button>
        </div>
      </div>

      <GridComponent
        dataSource={filteredPackages}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 10 }}
        height={500}
        enableHover={true}
      >
        <ColumnsDirective>
          <ColumnDirective 
            field="PackageID" 
            headerText="Package ID" 
            width="120" 
            textAlign="Center" 
            isPrimaryKey={true}
          />
          <ColumnDirective 
            field="Name" 
            headerText="Display Name" 
            width="200" 
            textAlign="Left" 
          />
          <ColumnDirective 
            headerText="Pricing" 
            width="150" 
            template={pricingTemplate}
          />
          <ColumnDirective 
            headerText="Vendor Details" 
            width="180" 
            template={vendorTemplate}
          />
          <ColumnDirective 
            field="VendorCost" 
            headerText="Vendor Cost" 
            width="120" 
            textAlign="Right" 
            format="C2"
          />
          <ColumnDirective 
            headerText="Status" 
            width="140" 
            textAlign="Center" 
            template={statusTemplate}
          />
          <ColumnDirective 
            headerText="Stock" 
            width="120" 
            textAlign="Center" 
            template={stockTemplate}
          />
          <ColumnDirective 
            field="LastUpdated" 
            headerText="Last Updated" 
            width="130" 
            textAlign="Center" 
            format={{ type: "date", format: "dd/MM/yyyy" }}
          />
          <ColumnDirective 
            headerText="Actions" 
            width="220" 
            textAlign="Center" 
            template={actionsTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter]} />
      </GridComponent>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">User-Facing Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Display Name *
                    </label>
                    <input
                      type="text"
                      value={newPackage.Name}
                      onChange={(e) => setNewPackage({ ...newPackage, Name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Starter Pack 300 UC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={newPackage.Category}
                      onChange={(e) => setNewPackage({ ...newPackage, Category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Gaming">Gaming</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Top-up">Top-up</option>
                      <option value="Subscription">Subscription</option>
                      <option value="Service">Service</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newPackage.Description}
                    onChange={(e) => setNewPackage({ ...newPackage, Description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Includes 5% Bonus UC! Instant delivery..."
                    maxLength={150}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Pricing Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (USD) *
                    </label>
                    <input
                      type="number"
                      value={newPackage.PriceUSD}
                      onChange={(e) => handleUSDPriceChange(parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (SYP) *
                    </label>
                    <input
                      type="number"
                      value={newPackage.PriceSYP}
                      onChange={(e) => setNewPackage({ ...newPackage, PriceSYP: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bonus Amount
                    </label>
                    <input
                      type="number"
                      value={newPackage.BonusAmount}
                      onChange={(e) => setNewPackage({ ...newPackage, BonusAmount: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      placeholder="Extra UC/coins"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Cost *
                    </label>
                    <input
                      type="number"
                      value={newPackage.VendorCost}
                      onChange={(e) => setNewPackage({ ...newPackage, VendorCost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Currency *
                    </label>
                    <select
                      value={newPackage.VendorCostCurrency}
                      onChange={(e) => setNewPackage({ ...newPackage, VendorCostCurrency: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="USD">USD</option>
                      <option value="SYP">SYP</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Fulfillment & API Mapping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor System *
                    </label>
                    <select
                      value={newPackage.VendorSystem}
                      onChange={(e) => setNewPackage({ ...newPackage, VendorSystem: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Alfaour API">Alfaour API</option>
                      <option value="Internal System">Internal System</option>
                      <option value="Manual Fulfillment">Manual Fulfillment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Product SKU *
                    </label>
                    <input
                      type="text"
                      value={newPackage.VendorSKU}
                      onChange={(e) => setNewPackage({ ...newPackage, VendorSKU: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="alfaour_uc_300"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fulfillment Type *
                  </label>
                  <select
                    value={newPackage.FulfillmentType}
                    onChange={(e) => setNewPackage({ ...newPackage, FulfillmentType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Instant Code">Instant Code</option>
                    <option value="Direct Injection">Direct Injection</option>
                    <option value="Manual Processing">Manual Processing</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Inventory & Visibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="trackStock"
                      checked={newPackage.TrackStock}
                      onChange={(e) => setNewPackage({ ...newPackage, TrackStock: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="trackStock" className="text-sm font-medium text-gray-700">
                      Track Stock for this Package
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={newPackage.IsPopular}
                      onChange={(e) => setNewPackage({ ...newPackage, IsPopular: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPopular" className="text-sm font-medium text-gray-700">
                      Mark as Popular
                    </label>
                  </div>
                </div>

                {newPackage.TrackStock && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Stock
                      </label>
                      <input
                        type="number"
                        value={newPackage.AvailableStock}
                        onChange={(e) => setNewPackage({ ...newPackage, AvailableStock: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        value={newPackage.LowStockAlert}
                        onChange={(e) => setNewPackage({ ...newPackage, LowStockAlert: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newPackage.IsActive}
                    onChange={(e) => setNewPackage({ ...newPackage, IsActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (Available for purchase)
                  </label>
                </div>
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
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}