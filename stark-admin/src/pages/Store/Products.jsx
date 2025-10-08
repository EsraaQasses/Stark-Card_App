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
  Edit,
} from "@syncfusion/ej2-react-grids";
import { Header } from "../../components";
import { productsData } from "../../data/products"

export default function ProductsPage() {
  const [products, setProducts] = useState(productsData);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    section: 'All',
    status: 'All',
    currency: 'All',
    fulfillment: 'All',
  });

  const [newProduct, setNewProduct] = useState({
    Name: "",
    Description: "",
    Section: "Mobile Gaming",
    Category: "",
    CommissionRate: 15,
    FulfillmentMethod: "Alfaour API",
    APIProductID: "",
    Status: "Active",
    Inventory: 0,
    LowStockAlert: 10,
    IsDigital: true,
    RequiresActivation: false,
    Tags: [],
  });

  const toolbarOptions = ["Search", "Add"];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.section !== 'All' && product.Section !== filters.section) return false;
      if (filters.status !== 'All' && product.Status !== filters.status) return false;
      if (filters.currency !== 'All' && product.Currency !== filters.currency) return false;
      if (filters.fulfillment !== 'All' && product.FulfillmentMethod !== filters.fulfillment) return false;
      return true;
    });
  }, [products, filters]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.Status === 'Active').length;
    const outOfStock = products.filter(p => p.Status === 'Out of Stock').length;
    const lowStock = products.filter(p => p.Status === 'Low Stock').length;
    const totalInventory = products.reduce((sum, p) => sum + p.Inventory, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.Price * p.Inventory), 0);

    return { totalProducts, activeProducts, outOfStock, lowStock, totalInventory, totalValue };
  }, [products]);

  const statusTemplate = (props) => {
    const statusConfig = {
      'Active': { color: 'bg-green-100 text-green-800 border border-green-200', icon: '🟢' },
      'Out of Stock': { color: 'bg-red-100 text-red-800 border border-red-200', icon: '🔴' },
      'Low Stock': { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '🟡' },
      'Inactive': { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: '⚫' },
    };

    const config = statusConfig[props.Status] || statusConfig.Inactive;

    return (
      <div className="flex items-center justify-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}>
          {config.icon} {props.Status}
        </span>
      </div>
    );
  };

  const priceTemplate = (props) => {
    const isUSD = props.Currency === 'USD';
    const symbol = isUSD ? '$' : 'SYP ';
    const price = isUSD ? props.Price.toFixed(2) : props.Price.toLocaleString();
    return (
      <div className="text-right">
        <div className="font-semibold text-gray-900">
          {symbol}{price}
        </div>
        <div className="text-xs text-gray-500">
          Cost: {symbol}{isUSD ? props.CostPrice.toFixed(2) : props.CostPrice.toLocaleString()}
        </div>
        <div className="text-xs text-green-600">
          {props.CommissionRate}% margin
        </div>
      </div>
    );
  };

  const inventoryTemplate = (props) => {
    const isLowStock = props.Inventory <= props.LowStockAlert && props.Inventory > 0;
    const isOutOfStock = props.Inventory === 0;
    let stockColor = 'text-green-600';
    if (isLowStock) stockColor = 'text-yellow-600';
    if (isOutOfStock) stockColor = 'text-red-600';

    return (
      <div className="text-center">
        <div className={`font-semibold ${stockColor}`}>
          {props.Inventory}
        </div>
        {props.LowStockAlert > 0 && (
          <div className="text-xs text-gray-500">
            Alert at: {props.LowStockAlert}
          </div>
        )}
      </div>
    );
  };

  const fulfillmentTemplate = (props) => {
    const methodIcons = {
      'Alfaour API': '🔌',
      'Daily System': '📦',
      'Internal Static Codes': '💳',
      'Manual Fulfillment': '👨‍💼',
    };

    return (
      <div className="text-center">
        <div className="text-sm">{methodIcons[props.FulfillmentMethod] || '⚙️'}</div>
        <div className="text-xs text-gray-600">{props.FulfillmentMethod}</div>
        {props.APIProductID && (
          <div className="text-xs text-gray-500">ID: {props.APIProductID}</div>
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
          title="Edit product"
        >
          ✏️ Edit
        </button>
        <button
          className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handlePricing(props.ProductID)}
          title="Manage pricing"
        >
          💰 Pricing
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleInventory(props.ProductID)}
          title="Manage inventory"
        >
          📦 Stock
        </button>
        <button
          className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleConfig(props.ProductID)}
          title="Product configuration"
        >
          ⚙️ Config
        </button>
      </div>
    </div>
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      Name: product.Name,
      Description: product.Description,
      Section: product.Section,
      Category: product.Category,
      Price: product.Price,
      Currency: product.Currency,
      CostPrice: product.CostPrice,
      CommissionRate: product.CommissionRate,
      FulfillmentMethod: product.FulfillmentMethod,
      APIProductID: product.APIProductID,
      Status: product.Status,
      Inventory: product.Inventory,
      LowStockAlert: product.LowStockAlert,
      IsDigital: product.IsDigital,
      RequiresActivation: product.RequiresActivation,
      Tags: product.Tags || [],
    });
    setShowModal(true);
  };

  const handlePricing = (productId) => {
    alert(`Opening pricing management for ${productId}`);
  };

  const handleInventory = (productId) => {
    alert(`Opening inventory management for ${productId}`);
  };

  const handleConfig = (productId) => {
    alert(`Opening configuration for ${productId}`);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev =>
        prev.map(p =>
          p.ProductID === editingProduct.ProductID
            ? { ...p, ...newProduct, LastUpdated: new Date() }
            : p
        )
      );
    } else {
      const newEntry = {
        ...newProduct,
        ProductID: `P-${String(products.length + 1).padStart(3, '0')}`,
        LastUpdated: new Date(),
        CreatedDate: new Date(),
      };
      setProducts([...products, newEntry]);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setNewProduct({
      Name: "",
      Description: "",
      Section: "Mobile Gaming",
      Category: "",
      CommissionRate: 15,
      FulfillmentMethod: "Alfaour API",
      APIProductID: "",
      Status: "Active",
      Inventory: 0,
      LowStockAlert: 10,
      IsDigital: true,
      RequiresActivation: false,
      Tags: [],
    });
  };

  const clearFilters = () => {
    setFilters({
      section: 'All',
      status: 'All',
      currency: 'All',
      fulfillment: 'All'
    });
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header 
        category="Store Management" 
        title="Products Catalog" 
      />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-sm">Active Products</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold text-sm">Total Inventory</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalInventory}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-800 font-semibold text-sm">Inventory Value</p>
          <p className="text-2xl font-bold text-indigo-600">${stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            >
              <option value="All">All Sections</option>
              <option value="Mobile Gaming">Mobile Gaming</option>
              <option value="Top-Up Cards">Top-Up Cards</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Inactive">Inactive</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.fulfillment}
              onChange={(e) => setFilters({ ...filters, fulfillment: e.target.value })}
            >
              <option value="All">All Methods</option>
              <option value="Alfaour API">Alfaour API</option>
              <option value="Daily System">Daily System</option>
              <option value="Internal Static Codes">Internal Codes</option>
              <option value="Manual Fulfillment">Manual</option>
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
            ➕ Add Product
          </button>
        </div>
      </div>

      <GridComponent
        dataSource={filteredProducts}
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
            field="ProductID" 
            headerText="Product ID" 
            width="120" 
            textAlign="Center" 
            isPrimaryKey={true}
          />
          <ColumnDirective 
            field="Name" 
            headerText="Product Name" 
            width="200" 
            textAlign="Left" 
          />
          <ColumnDirective 
            field="Section" 
            headerText="Section" 
            width="140" 
            textAlign="Center" 
          />

          <ColumnDirective 
            headerText="Fulfillment" 
            width="160" 
            template={fulfillmentTemplate}
          />
          <ColumnDirective 
            headerText="Status" 
            width="140" 
            textAlign="Center" 
            template={statusTemplate}
          />
          <ColumnDirective 
            headerText="Inventory" 
            width="120" 
            textAlign="Center" 
            template={inventoryTemplate}
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
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={newProduct.Name}
                    onChange={(e) => setNewProduct({ ...newProduct, Name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., PUBG Mobile 600 UC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Section *
                  </label>
                  <select
                    value={newProduct.Section}
                    onChange={(e) => setNewProduct({ ...newProduct, Section: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Mobile Gaming">Mobile Gaming</option>
                    <option value="Top-Up Cards">Top-Up Cards</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                    <option value="Local Services">Local Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newProduct.Description}
                  onChange={(e) => setNewProduct({ ...newProduct, Description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                  placeholder="Product description for customers..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    value={newProduct.Price}
                    onChange={(e) => setNewProduct({ ...newProduct, Price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    value={newProduct.Currency}
                    onChange={(e) => setNewProduct({ ...newProduct, Currency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="USD">USD ($)</option>
                    <option value="SYP">Syrian Pound (SYP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price *
                  </label>
                  <input
                    type="number"
                    value={newProduct.CostPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, CostPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fulfillment Method *
                  </label>
                  <select
                    value={newProduct.FulfillmentMethod}
                    onChange={(e) => setNewProduct({ ...newProduct, FulfillmentMethod: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Alfaour API">Alfaour API</option>
                    <option value="Daily System">Daily System</option>
                    <option value="Internal Static Codes">Internal Static Codes</option>
                    <option value="Manual Fulfillment">Manual Fulfillment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Product ID
                  </label>
                  <input
                    type="text"
                    value={newProduct.APIProductID}
                    onChange={(e) => setNewProduct({ ...newProduct, APIProductID: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ALF-PUBG600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Inventory
                  </label>
                  <input
                    type="number"
                    value={newProduct.Inventory}
                    onChange={(e) => setNewProduct({ ...newProduct, Inventory: parseInt(e.target.value) || 0 })}
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
                    value={newProduct.LowStockAlert}
                    onChange={(e) => setNewProduct({ ...newProduct, LowStockAlert: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={newProduct.CommissionRate}
                    onChange={(e) => setNewProduct({ ...newProduct, CommissionRate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isDigital"
                    checked={newProduct.IsDigital}
                    onChange={(e) => setNewProduct({ ...newProduct, IsDigital: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isDigital" className="text-sm font-medium text-gray-700">
                    Digital Product (No shipping required)
                  </label>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="requiresActivation"
                    checked={newProduct.RequiresActivation}
                    onChange={(e) => setNewProduct({ ...newProduct, RequiresActivation: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="requiresActivation" className="text-sm font-medium text-gray-700">
                    Requires Manual Activation
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newProduct.Status === 'Active'}
                  onChange={(e) => setNewProduct({ ...newProduct, Status: e.target.checked ? 'Active' : 'Inactive' })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (Available for purchase)
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
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
