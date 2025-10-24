import React, { useState, useEffect } from 'react';
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
import { Header } from '../../components';
import axiosInstance from '../../utils/axiosConfig';

const AdsPage = () => {
  const [adsData, setAdsData] = useState([]);
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [formData, setFormData] = useState({
    section: '',
    product: '',
    text: '',
    background_color: '#FFFFFF',
    font_size: 14,
    text_color: 'black',
    image: null,
    link: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [gridInstance, setGridInstance] = useState(null);

  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ['Add', 'Edit', 'Delete', 'Refresh'];
  const editing = { allowDeleting: true, allowEditing: false, allowAdding: false };

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/system/ads/');
      setAdsData(response.data);
    } catch (err) {
      setError('Failed to load ads data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [sectionsRes, productsRes] = await Promise.all([
        axiosInstance.get('/store/sections/'),
        axiosInstance.get('/store/products/'),
      ]);
      setSections(sectionsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onload = (en) => {
        setImagePreview(en.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      section: '',
      product: '',
      text: '',
      background_color: '#FFFFFF',
      font_size: 14,
      text_color: 'black',
      image: null,
      link: '',
    });
    setImagePreview(null);
    setSelectedAd(null);
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      await axiosInstance.post('/system/ads/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowAddModal(false);
      resetForm();
      fetchAds();
      alert('تمت إضافة الإعلان بنجاح ✅');
    } catch (err) {
      alert('فشل في إضافة الإعلان ❌');
    }
  };

  const handleEditAd = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      await axiosInstance.put(`/system/ads/${selectedAd.id}/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowEditModal(false);
      resetForm();
      fetchAds();
      alert('تم تعديل الإعلان بنجاح ✅');
    } catch (err) {
      alert('فشل في تعديل الإعلان ❌');
    }
  };

  const handleDeleteAds = async (selected) => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} ad(s)?`)) {
      try {
        const deletePromises = selected.map((ad) => axiosInstance.delete(`/system/ads/${ad.id}/`));
        await Promise.all(deletePromises);
        await fetchAds();
        alert(`${selected.length} ad(s) deleted successfully ❌`);
      } catch (err) {
        alert('Error deleting ads');
      }
    }
  };

  const toolbarClick = async (args) => {
    if (!gridInstance) return;

    const selected = gridInstance.getSelectedRecords();

    if (args.item.id.includes('addgrid')) {
      setShowAddModal(true);
    }

    if (args.item.id.includes('editgrid')) {
      if (selected.length === 1) {
        const ad = selected[0];
        setSelectedAd(ad);
        setFormData({
          section: ad.section,
          product: ad.product,
          text: ad.text,
          background_color: ad.background_color,
          font_size: ad.font_size,
          text_color: ad.text_color,
          image: null,
          link: ad.link || '',
        });
        setImagePreview(ad.image || null);
        setShowEditModal(true);
      } else {
        alert('Please select one ad to edit.');
      }
    }

    if (args.item.id.includes('deletegrid')) {
      if (selected.length > 0) {
        await handleDeleteAds(selected);
      } else {
        alert('Please select an ad to delete.');
      }
    }

    if (args.item.id.includes('Refresh')) {
      fetchAds();
    }
  };

  const adsGrid = [
    {
      type: 'checkbox',
      width: '50',
    },
    {
      field: 'id',
      headerText: 'ID',
      width: '80',
      textAlign: 'Center',
      isPrimaryKey: true,
    },
    {
      field: 'section_name',
      headerText: 'Section',
      width: '120',
    },
    {
      field: 'product_name',
      headerText: 'Product',
      width: '150',
    },
    {
      field: 'text',
      headerText: 'Ad Text',
      width: '200',
      template: (props) => (
        <div className="truncate" title={props.text}>
          {props.text.length > 50 ? `${props.text.substring(0, 50)}...` : props.text}
        </div>
      ),
    },
    {
      field: 'background_color',
      headerText: 'Background',
      width: '100',
      template: (props) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: props.background_color }}
          />
          <span>{props.background_color}</span>
        </div>
      ),
    },
    {
      field: 'font_size',
      headerText: 'Font Size',
      width: '80',
      template: (props) => (
        <span>{props.font_size}px</span>
      ),
    },
    {
      field: 'text_color',
      headerText: 'Text Color',
      width: '100',
      template: (props) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          props.text_color === 'white' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'
        }`}
        >
          {props.text_color}
        </span>
      ),
    },
    {
      field: 'image',
      headerText: 'Image',
      width: '80',
      template: (props) => (
        props.image
          ? (
            <div
              className="w-8 h-8 bg-cover bg-center rounded"
              style={{ backgroundImage: `url(${props.image})` }}
            />
          )
          : <span className="text-gray-400">No image</span>
      ),
    },
    {
      field: 'link',
      headerText: 'Link',
      width: '150',
      template: (props) => (
        props.link
          ? (
            <a
              href={props.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline truncate block"
            >
              {props.link.length > 20 ? `${props.link.substring(0, 20)}...` : props.link}
            </a>
          )
          : <span className="text-gray-400">No link</span>
      ),
    },
    {
      field: 'created_at',
      headerText: 'Created At',
      width: '120',
      format: 'yMd',
      textAlign: 'Center',
    },
  ];

  const AdModal = ({ isOpen, onClose, onSubmit, isEdit = false }) => (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              {isEdit ? 'Edit Ad' : 'Add New Ad'}
            </h2>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product *</label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ad Text *</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter advertisement text..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                    className="w-10 h-10 p-1 border rounded"
                  />
                  <input
                    type="text"
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <input
                  type="number"
                  name="font_size"
                  value={formData.font_size}
                  onChange={handleInputChange}
                  min="8"
                  max="72"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <select
                  name="text_color"
                  value={formData.text_color}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="black">Black</option>
                  <option value="white">White</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ad Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 border rounded bg-gray-50">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div
                className="p-4 rounded border"
                style={{
                  backgroundColor: formData.background_color,
                  color: formData.text_color,
                  fontSize: `${formData.font_size}px`,
                }}
              >
                {formData.text || 'Ad preview will appear here...'}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                {isEdit ? 'Update Ad' : 'Add Ad'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="Management" title="Advertisements" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading advertisements...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="Management" title="Advertisements" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
          <button
            type="button"
            onClick={fetchAds}
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
      <Header category="Management" title="Advertisements" />

      <div className="flex justify-between items-center mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Active Ads</p>
          <p className="text-2xl font-bold text-blue-600">{adsData.length}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm flex items-center gap-2"
        >
          + Add New Ad
        </button>
      </div>

      {adsData.length > 0 ? (
        <GridComponent
          dataSource={adsData}
          enableHover={false}
          allowPaging
          pageSettings={{ pageCount: 5, pageSize: 10 }}
          selectionSettings={selectionsettings}
          toolbar={toolbarOptions}
          editSettings={editing}
          allowSorting
          allowFiltering
          toolbarClick={toolbarClick}
          width="auto"
          ref={(g) => setGridInstance(g)}
        >
          <ColumnsDirective>
            {adsGrid.map((item, index) => (
              <ColumnDirective key={index} {...item} />
            ))}
          </ColumnsDirective>
          <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
        </GridComponent>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📢</div>
          <p className="text-gray-500 text-lg">No advertisements found</p>
          <p className="text-gray-400 mt-2">Start by creating your first advertisement</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Create First Ad
          </button>
        </div>
      )}

      <AdModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAd}
        isEdit={false}
      />

      <AdModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditAd}
        isEdit
      />
    </div>
  );
};

export default AdsPage;
