import React, { useState, useMemo, useEffect } from "react";
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
import axiosInstance from "../../utils/axiosConfig";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [apis, setApis] = useState([]);
  const [externalProducts, setExternalProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    section: 'All',
    status: 'All',
    currency: 'All',
    product_type: 'All',
  });

  // NEW STATES FOR API PRODUCTS
  const [selectedApi, setSelectedApi] = useState("");
  const [apiProducts, setApiProducts] = useState([]);
  const [loadingApiProducts, setLoadingApiProducts] = useState(false);
  const [showApiProductsModal, setShowApiProductsModal] = useState(false);
  const [selectedApiProduct, setSelectedApiProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    section: "",
    api_config: "",
    external_product: "", // ADDED: Store external product ID
    product_type: "amount_based",
    currency: "USD",
    base_price: 0,
    min_amount: 0,
    max_amount: 0,
    min_amount_price: 0,
    customization_options: "",
    customization_prices: "",
    image: null,
    is_active: true,
    requirements: [],
  });

  const [newRequirement, setNewRequirement] = useState({
    field_name: "",
    field_type: "text",
    is_required: true,
    placeholder: "",
    order: 0,
  });

  const toolbarOptions = ["Search"];

  // NEW FUNCTION: Map API field types to our system - ADDED AT TOP LEVEL
  const mapApiFieldType = (apiType) => {
    const typeMap = {
      'text': 'text',
      'string': 'text',
      'number': 'number',
      'integer': 'number',
      'email': 'email',
      'phone': 'phone',
      'tel': 'phone',
      'id': 'id',
      'identifier': 'id'
    };
    return typeMap[apiType?.toLowerCase()] || 'text';
  };

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await axiosInstance.get("store/admin/products/");
      console.log("Products API Response:", productsResponse.data);
      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      
      // Fetch sections for dropdown
      const sectionsResponse = await axiosInstance.get("store/admin/sections/");
      console.log("Sections API Response:", sectionsResponse.data);
      setSections(Array.isArray(sectionsResponse.data) ? sectionsResponse.data : []);
      
      // Fetch APIs for dropdown - handle different response formats
      try {
        const apisResponse = await axiosInstance.get("third_party_apis/apis/");
        console.log("APIs API Response:", apisResponse.data);
        setApis(apisResponse.data?.results || apisResponse.data || []);
      } catch (apiError) {
        console.warn("Could not fetch APIs:", apiError);
        setApis([]);
      }
      
      // Fetch external products for sync - handle different response formats
      try {
        const externalResponse = await axiosInstance.get("store/admin/external-products/");
        console.log("External Products API Response:", externalResponse.data);
        setExternalProducts(externalResponse.data?.results || externalResponse.data || []);
      } catch (externalError) {
        console.warn("Could not fetch external products:", externalError);
        setExternalProducts([]);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // NEW FUNCTION: Fetch API products when API is selected
  const fetchApiProducts = async (apiId) => {
    if (!apiId) {
      setApiProducts([]);
      return;
    }

    try {
      setLoadingApiProducts(true);
      console.log(`Fetching products for API: ${apiId}`);
      
      // First, try to sync products from the API
      try {
        const syncResponse = await axiosInstance.post(`third_party_apis/apis/${apiId}/sync_products/`);
        console.log("Sync response:", syncResponse.data);
      } catch (syncError) {
        console.warn("Sync failed, but continuing:", syncError);
      }
      
      // Then fetch external products for this API
      const response = await axiosInstance.get("store/admin/external-products/", {
        params: { api_id: apiId }
      });
      
      const productsData = response.data?.results || response.data || [];
      console.log(`Found ${productsData.length} API products:`, productsData);
      setApiProducts(productsData);
      
    } catch (error) {
      console.error("Error fetching API products:", error);
      alert("Failed to load API products");
      setApiProducts([]);
    } finally {
      setLoadingApiProducts(false);
    }
  };

  // NEW FUNCTION: Handle API selection change
  const handleApiChange = (apiId) => {
    setSelectedApi(apiId);
    setNewProduct(prev => ({ 
      ...prev, 
      api_config: apiId,
      external_product: "" // Reset when API changes
    }));
    
    if (apiId) {
      fetchApiProducts(apiId);
      setShowApiProductsModal(true);
    } else {
      setApiProducts([]);
      setShowApiProductsModal(false);
    }
  };

  // NEW FUNCTION: Select API product and auto-fill fields - FIXED
  const handleSelectApiProduct = (apiProduct) => {
    console.log("Selected API product:", apiProduct);
    setSelectedApiProduct(apiProduct);
    
    // Auto-fill product fields based on API product - FIXED: use mapApiFieldType directly
    setNewProduct(prev => ({
      ...prev,
      name_en: apiProduct.name || prev.name_en,
      name_ar: apiProduct.name || prev.name_ar, // Use same name if Arabic not available
      description_en: apiProduct.description || prev.description_en,
      description_ar: apiProduct.description || prev.description_ar,
      base_price: parseFloat(apiProduct.base_price) || prev.base_price,
      external_product: apiProduct.id, // Store the external product ID
      // Auto-create requirements from API product fields - FIXED: use mapApiFieldType function
      requirements: apiProduct.required_fields_json?.map((field, index) => {
        const fieldData = typeof field === 'object' ? field : { name: field, type: 'text', required: true };
        return {
          field_name: fieldData.name || `field_${index}`,
          field_type: mapApiFieldType(fieldData.type) || 'text', // FIXED: Use the function directly
          is_required: fieldData.required !== false,
          placeholder: fieldData.placeholder || '',
          order: index
        };
      }) || prev.requirements
    }));
    
    setShowApiProductsModal(false);
    alert(`Product "${apiProduct.name}" selected! Fields have been auto-filled.`);
  };

  // NEW FUNCTION: Close API products modal
  const closeApiProductsModal = () => {
    setShowApiProductsModal(false);
    setSelectedApiProduct(null);
  };

  // NEW FUNCTION: Clear API selection
  const handleClearApiSelection = () => {
    setSelectedApi("");
    setSelectedApiProduct(null);
    setApiProducts([]);
    setNewProduct(prev => ({
      ...prev,
      api_config: "",
      external_product: ""
    }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.section !== 'All' && product.section !== parseInt(filters.section)) return false;
      if (filters.status !== 'All' && product.is_active !== (filters.status === 'Active')) return false;
      if (filters.currency !== 'All' && product.currency !== filters.currency) return false;
      if (filters.product_type !== 'All' && product.product_type !== filters.product_type) return false;
      return true;
    });
  }, [products, filters]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const usdProducts = products.filter(p => p.currency === 'USD').length;
    const sypProducts = products.filter(p => p.currency === 'SYP').length;
    const amountBased = products.filter(p => p.product_type === 'amount_based').length;
    const customizationBased = products.filter(p => p.product_type === 'customization_based').length;

    return { totalProducts, activeProducts, usdProducts, sypProducts, amountBased, customizationBased };
  }, [products]);

  // FIX: Add image template function
  const imageTemplate = (props) => {
    const product = props;
    const getImageUrl = (image) => {
      if (!image) return null;
      if (image.startsWith('http')) return image;
      return `http://localhost:8000${image}`;
    };

    const imageUrl = getImageUrl(product.image);

    return (
      <div className="flex justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name_en}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100 p-1"
            onError={(e) => {
              e.target.src = "https://cdn-icons-png.flaticon.com/512/1170/1170679.png";
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>
    );
  };

  const statusTemplate = (props) => {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          props.is_active
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {props.is_active ? "🟢 Active" : "🔴 Inactive"}
        </span>
      </div>
    );
  };

  const priceTemplate = (props) => {
    const symbol = props.currency === 'USD' ? '$' : 'SYP ';
    const price = props.currency === 'USD' ? 
      parseFloat(props.base_price || 0).toFixed(2) : 
      parseFloat(props.base_price || 0).toLocaleString();
    
    return (
      <div className="text-right">
        <div className="font-semibold text-gray-900">
          {symbol}{price}
        </div>
        <div className="text-xs text-gray-500 capitalize">
          {props.product_type?.replace('_', ' ') || 'N/A'}
        </div>
        {props.product_type === 'amount_based' && props.price_per_unit && (
          <div className="text-xs text-green-600">
            {symbol}{parseFloat(props.price_per_unit).toFixed(4)}/unit
          </div>
        )}
      </div>
    );
  };

  const sectionTemplate = (props) => {
    const section = sections.find(s => s.id === props.section);
    return (
      <div className="text-center">
        <div className="font-medium text-gray-900">
          {section?.name_en || 'Unknown'}
        </div>
        <div className="text-xs text-gray-500">
          {section?.name_ar || ''}
        </div>
      </div>
    );
  };

  const apiTemplate = (props) => {
    const api = apis.find(a => a.id === props.api_config);
    return (
      <div className="text-center">
        {api ? (
          <>
            <div className="text-sm font-medium text-gray-900">
              {api.name}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {api.provider}
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-400">No API</div>
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
          onClick={() => handleRequirements(props.id)}
          title="Manage requirements"
        >
          📋 Requirements
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1 ${
            props.is_active
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          onClick={() => toggleStatus(props.id, props.is_active)}
          title={props.is_active ? "Deactivate product" : "Activate product"}
        >
          {props.is_active ? "⏸️ Hide" : "▶️ Show"}
        </button>
        <button
          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium flex items-center gap-1"
          onClick={() => handleDelete(props.id, props.name_en)}
          title="Delete product"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  const handleEdit = (product) => {
    console.log("Editing product:", product);
    setEditingProduct(product);
    setNewProduct({
      name_en: product.name_en || "",
      name_ar: product.name_ar || "",
      description_en: product.description_en || "",
      description_ar: product.description_ar || "",
      section: product.section || "",
      api_config: product.api_config || "",
      external_product: product.external_product || "", // ADDED
      product_type: product.product_type || "amount_based",
      currency: product.currency || "USD",
      base_price: parseFloat(product.base_price) || 0,
      min_amount: parseFloat(product.min_amount) || 0,
      max_amount: parseFloat(product.max_amount) || 0,
      min_amount_price: parseFloat(product.min_amount_price) || 0,
      customization_options: product.customization_options || "",
      customization_prices: product.customization_prices || "",
      image: null, // Reset image - user needs to re-select if they want to change
      is_active: product.is_active !== undefined ? product.is_active : true,
      requirements: product.requirements || [],
    });
    setShowModal(true);
  };

  const handleRequirements = (productId) => {
    alert(`Opening requirements management for product ${productId}`);
    // You can implement a modal for requirements management here
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await axiosInstance.patch(`store/admin/products/${id}/`, {
        is_active: !currentStatus
      });
      
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, is_active: !currentStatus } : product
      ));
      
      alert(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update product status");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axiosInstance.delete(`store/admin/products/${id}/`);
        setProducts(prev => prev.filter(p => p.id !== id));
        alert("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleAddRequirement = () => {
    if (!newRequirement.field_name.trim()) {
      alert("Field name is required");
      return;
    }
    
    setNewProduct(prev => ({
      ...prev,
      requirements: [...prev.requirements, { 
        ...newRequirement, 
        order: prev.requirements.length 
      }]
    }));
    
    setNewRequirement({
      field_name: "",
      field_type: "text",
      is_required: true,
      placeholder: "",
      order: 0,
    });
  };

  const handleRemoveRequirement = (index) => {
    setNewProduct(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("🖼️ File selected:", file);
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setNewProduct({ ...newProduct, image: file });
      console.log("✅ Image set in state:", file.name);
    } else {
      console.log("❌ No file selected");
      setNewProduct({ ...newProduct, image: null });
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name_en', newProduct.name_en);
      formData.append('name_ar', newProduct.name_ar);
      formData.append('description_en', newProduct.description_en);
      formData.append('description_ar', newProduct.description_ar);
      formData.append('section', newProduct.section);
      formData.append('product_type', newProduct.product_type);
      formData.append('currency', newProduct.currency);
      formData.append('base_price', newProduct.base_price.toString());
      formData.append('is_active', newProduct.is_active.toString());
      
      if (newProduct.api_config) {
        formData.append('api_config', newProduct.api_config);
      }
      
      // ADDED: Add external product ID if selected
      if (newProduct.external_product) {
        formData.append('external_product', newProduct.external_product);
      }
      
      // Add product type specific fields
      if (newProduct.product_type === 'amount_based') {
        formData.append('min_amount', newProduct.min_amount.toString());
        formData.append('max_amount', newProduct.max_amount.toString());
        formData.append('min_amount_price', newProduct.min_amount_price.toString());
      } else if (newProduct.product_type === 'customization_based') {
        formData.append('customization_options', newProduct.customization_options);
        formData.append('customization_prices', newProduct.customization_prices);
      }
      
      // Add image if selected
      if (newProduct.image instanceof File) {
        console.log("📸 Adding image to FormData:", newProduct.image.name);
        formData.append('image', newProduct.image);
      }
      
      // Add requirements as JSON
      if (newProduct.requirements.length > 0) {
        formData.append('requirements', JSON.stringify(newProduct.requirements));
      }

      // DEBUG: Log FormData entries
      console.log("📦 FormData entries:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value} (type: ${typeof value})`);
        }
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data, // Prevent axios from transforming FormData
      };

      let response;
      if (editingProduct) {
        console.log(`🔄 Updating product ${editingProduct.id}`);
        response = await axiosInstance.put(
          `store/admin/products/${editingProduct.id}/`,
          formData,
          config
        );
      } else {
        console.log("🆕 Creating new product");
        response = await axiosInstance.post(
          "store/admin/products/",
          formData,
          config
        );
      }
      
      console.log("✅ API Response:", response.data);
      alert("Product saved successfully!");
      closeModal();
      fetchData();
    } catch (error) {
      console.error("❌ Error saving product:", error);
      console.error("❌ Error response data:", error.response?.data);
      console.error("❌ Error response status:", error.response?.status);
      const errorMessage = error.response?.data || "Failed to save product";
      alert(`Error: ${JSON.stringify(errorMessage)}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setNewProduct({
      name_en: "",
      name_ar: "",
      description_en: "",
      description_ar: "",
      section: "",
      api_config: "",
      external_product: "", // ADDED
      product_type: "amount_based",
      currency: "USD",
      base_price: 0,
      min_amount: 0,
      max_amount: 0,
      min_amount_price: 0,
      customization_options: "",
      customization_prices: "",
      image: null,
      is_active: true,
      requirements: [],
    });
    setNewRequirement({
      field_name: "",
      field_type: "text",
      is_required: true,
      placeholder: "",
      order: 0,
    });
    setSelectedApi("");
    setApiProducts([]);
    setSelectedApiProduct(null);
  };

  const clearFilters = () => {
    setFilters({
      section: 'All',
      status: 'All',
      currency: 'All',
      product_type: 'All'
    });
  };

  // Add Debug component to see data
  const DebugData = () => (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Debug Data ({products.length} products):</h3>
      <pre className="text-xs">{JSON.stringify(products.slice(0, 2), null, 2)}</pre>
    </div>
  );

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Store Management" title="Products Catalog" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Store Management" title="Products Catalog" />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold text-sm">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-sm">Active Products</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 font-semibold text-sm">USD Products</p>
          <p className="text-2xl font-bold text-purple-600">{stats.usdProducts}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 font-semibold text-sm">SYP Products</p>
          <p className="text-2xl font-bold text-orange-600">{stats.sypProducts}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-800 font-semibold text-sm">Amount Based</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.amountBased}</p>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <p className="text-pink-800 font-semibold text-sm">Customization</p>
          <p className="text-2xl font-bold text-pink-600">{stats.customizationBased}</p>
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
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name_en}
                </option>
              ))}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
            <select
              className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.product_type}
              onChange={(e) => setFilters({ ...filters, product_type: e.target.value })}
            >
              <option value="All">All Types</option>
              <option value="amount_based">Amount Based</option>
              <option value="customization_based">Customization Based</option>
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{product.id}</td>
                <td className="px-4 py-3">
                  {imageTemplate(product)}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{product.name_en}</div>
                    <div className="text-sm text-gray-600">{product.name_ar}</div>
                    {product.description_en && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {product.description_en}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {sectionTemplate(product)}
                </td>
                <td className="px-4 py-3">
                  {apiTemplate(product)}
                </td>
                <td className="px-4 py-3">
                  {priceTemplate(product)}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 capitalize">
                  {product.product_type?.replace('_', ' ') || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  {statusTemplate(product)}
                </td>
                <td className="px-4 py-3">
                  {actionsTemplate(product)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found matching your filters.
          </div>
        )}
      </div>

      <DebugData />

      {/* Main Product Modal */}
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
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name_en}
                    onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., PUBG Mobile 600 UC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arabic Name *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name_ar}
                    onChange={(e) => setNewProduct({ ...newProduct, name_ar: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., ببجي موبايل 600 UC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Description
                  </label>
                  <textarea
                    value={newProduct.description_en}
                    onChange={(e) => setNewProduct({ ...newProduct, description_en: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="English description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arabic Description
                  </label>
                  <textarea
                    value={newProduct.description_ar}
                    onChange={(e) => setNewProduct({ ...newProduct, description_ar: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="الوصف بالعربية..."
                  />
                </div>
              </div>

              {/* Section and API Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section *
                  </label>
                  <select
                    value={newProduct.section}
                    onChange={(e) => setNewProduct({ ...newProduct, section: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a section</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name_en} / {section.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Configuration
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={newProduct.api_config}
                        onChange={(e) => handleApiChange(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No API</option>
                        {apis.map(api => (
                          <option key={api.id} value={api.id}>
                            {api.name} ({api.provider})
                          </option>
                        ))}
                      </select>
                      {newProduct.api_config && (
                        <button
                          type="button"
                          onClick={handleClearApiSelection}
                          className="px-3 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          title="Clear API selection"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    {/* Show selected API product info */}
                    {selectedApiProduct && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              ✅ Connected to: {selectedApiProduct.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Base Price: ${selectedApiProduct.base_price} | 
                              Provider: {selectedApiProduct.provider} | 
                              ID: {selectedApiProduct.external_id}
                            </p>
                            {selectedApiProduct.required_fields_json?.length > 0 && (
                              <p className="text-xs text-green-600">
                                Auto-added {selectedApiProduct.required_fields_json.length} required fields
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowApiProductsModal(true)}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show button to select API product if API is selected but no product chosen */}
                    {newProduct.api_config && !selectedApiProduct && (
                      <button
                        type="button"
                        onClick={() => setShowApiProductsModal(true)}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
                      >
                        🔗 Select API Product
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Rest of the form remains the same */}
              {/* Product Type and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type *
                  </label>
                  <select
                    value={newProduct.product_type}
                    onChange={(e) => setNewProduct({ ...newProduct, product_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="amount_based">Amount Based</option>
                    <option value="customization_based">Customization Based</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    value={newProduct.currency}
                    onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="USD">USD ($)</option>
                    <option value="SYP">Syrian Pound (SYP)</option>
                  </select>
                </div>
              </div>

              {/* Product Type Specific Fields */}
              {newProduct.product_type === 'amount_based' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Amount *
                    </label>
                    <input
                      type="number"
                      value={newProduct.min_amount}
                      onChange={(e) => setNewProduct({ ...newProduct, min_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Amount *
                    </label>
                    <input
                      type="number"
                      value={newProduct.max_amount}
                      onChange={(e) => setNewProduct({ ...newProduct, max_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Amount Price *
                    </label>
                    <input
                      type="number"
                      value={newProduct.min_amount_price}
                      onChange={(e) => setNewProduct({ ...newProduct, min_amount_price: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              )}

              {newProduct.product_type === 'customization_based' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customization Options *
                    </label>
                    <textarea
                      value={newProduct.customization_options}
                      onChange={(e) => setNewProduct({ ...newProduct, customization_options: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Option1,Option2,Option3"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated options</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customization Prices *
                    </label>
                    <textarea
                      value={newProduct.customization_prices}
                      onChange={(e) => setNewProduct({ ...newProduct, customization_prices: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="10,15,20"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated prices matching the options</p>
                  </div>
                </div>
              )}

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price *
                </label>
                <input
                  type="number"
                  value={newProduct.base_price}
                  onChange={(e) => setNewProduct({ ...newProduct, base_price: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newProduct.image ? `Selected: ${newProduct.image.name}` : 'No file selected'}
                </p>
                
                {/* Show preview if image is selected */}
                {newProduct.image instanceof File && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 mb-1">Preview:</p>
                    <img 
                      src={URL.createObjectURL(newProduct.image)} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}
                
                {/* Show current image when editing */}
                {editingProduct && editingProduct.image && !newProduct.image && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-600 mb-1">Current Image:</p>
                    <img 
                      src={`http://localhost:8000${editingProduct.image}`} 
                      alt="Current" 
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/1170/1170679.png";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Requirements Management */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Product Requirements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                  <input
                    type="text"
                    value={newRequirement.field_name}
                    onChange={(e) => setNewRequirement({ ...newRequirement, field_name: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Field name"
                  />
                  <select
                    value={newRequirement.field_type}
                    onChange={(e) => setNewRequirement({ ...newRequirement, field_type: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="id">ID</option>
                  </select>
                  <input
                    type="text"
                    value={newRequirement.placeholder}
                    onChange={(e) => setNewRequirement({ ...newRequirement, placeholder: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Placeholder"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_required"
                      checked={newRequirement.is_required}
                      onChange={(e) => setNewRequirement({ ...newRequirement, is_required: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_required" className="text-sm text-gray-700">
                      Required
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                  >
                    Add
                  </button>
                </div>

                {newProduct.requirements.length > 0 && (
                  <div className="space-y-2">
                    {newProduct.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex-1">
                          <span className="font-medium">{req.field_name}</span>
                          <span className="text-sm text-gray-500 ml-2">({req.field_type})</span>
                          {req.placeholder && (
                            <span className="text-sm text-gray-400 ml-2">Placeholder: {req.placeholder}</span>
                          )}
                          <span className={`text-sm ml-2 ${req.is_required ? 'text-red-500' : 'text-gray-400'}`}>
                            {req.is_required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(index)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newProduct.is_active}
                  onChange={(e) => setNewProduct({ ...newProduct, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
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

      {/* NEW: API Products Modal */}
      {showApiProductsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Select API Product
              </h2>
              <button
                onClick={closeApiProductsModal}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Choose a product from the API to auto-fill the product details and requirements.
              </p>
            </div>

            {loadingApiProducts ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-lg">Loading API products...</div>
              </div>
            ) : apiProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiProducts.map((apiProduct) => (
                  <div
                    key={apiProduct.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedApiProduct?.id === apiProduct.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                    onClick={() => handleSelectApiProduct(apiProduct)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{apiProduct.name}</h3>
                      <span className="text-sm font-medium text-blue-600">
                        ${apiProduct.base_price}
                      </span>
                    </div>
                    
                    {apiProduct.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {apiProduct.description}
                      </p>
                    )}
                    
                    {apiProduct.required_fields_json && apiProduct.required_fields_json.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Required Fields:</p>
                        <div className="space-y-1">
                          {apiProduct.required_fields_json.slice(0, 3).map((field, index) => {
                            const fieldData = typeof field === 'object' ? field : { name: field, type: 'text', required: true };
                            return (
                              <div key={index} className="flex items-center text-xs text-gray-600">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                {fieldData.name} ({mapApiFieldType(fieldData.type)}) {/* FIXED: Use the function directly */}
                                {fieldData.required && (
                                  <span className="ml-1 text-red-500">*</span>
                                )}
                              </div>
                            );
                          })}
                          {apiProduct.required_fields_json.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{apiProduct.required_fields_json.length - 3} more fields
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500 capitalize">
                        {apiProduct.category || 'Uncategorized'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectApiProduct(apiProduct);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No products found for this API. Make sure the API is properly configured and has available products.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button
                onClick={closeApiProductsModal}
                className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
              {apiProducts.length > 0 && (
                <button
                  onClick={() => {
                    if (apiProducts.length > 0) {
                      handleSelectApiProduct(apiProducts[0]);
                    }
                  }}
                  className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Select First Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}