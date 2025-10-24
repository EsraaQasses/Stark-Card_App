import React, { useState, useMemo, useEffect } from 'react';
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

const StoreSections = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({
    status: 'All',
  });

  const [newSection, setNewSection] = useState({
    name_en: '',
    name_ar: '',
    description: '',
    image: null,
    father_section: '',
    is_active: true,
  });

  const toolbarOptions = ['Search'];

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('store/admin/sections/');
      if (Array.isArray(response.data)) {
        setData(response.data);
        setSections(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      alert('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const filteredData = useMemo(() => data.filter((section) => {
    if (filters.status !== 'All' && section.is_active !== (filters.status === 'Active')) return false;
    return true;
  }), [data, filters]);

  const stats = useMemo(() => {
    const totalSections = data.length;
    const activeSections = data.filter((s) => s.is_active).length;
    const totalProducts = data.reduce((sum, section) => sum + (section.products_count || 0), 0);
    const mainSections = data.filter((s) => !s.father_section).length;
    const subsections = data.filter((s) => s.father_section).length;

    return { totalSections, activeSections, totalProducts, mainSections, subsections };
  }, [data]);

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:8000${image}`;
  };

  const imageTemplate = (props) => {
    const section = props;
    const imageUrl = getImageUrl(section.image);

    return (
      <div className="flex flex-col items-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={section.name_en}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100 p-1"
            onError={(e) => {
              e.target.src = 'https://cdn-icons-png.flaticon.com/512/1170/1170679.png';
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
        <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
          !section.father_section
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
        }`}
        >
          {!section.father_section ? 'Main' : 'Sub'}
        </span>
      </div>
    );
  };

  const statusTemplate = (props) => {
    const section = props;
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            section.is_active
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {section.is_active ? '🟢 Active' : '🔴 Inactive'}
        </span>
        <span className="text-xs text-gray-500">
          {section.products_count || 0} products
        </span>
      </div>
    );
  };

  const descriptionTemplate = (props) => {
    const section = props;
    return (
      <div className="max-w-xs">
        <p className="text-sm font-medium text-gray-900">{section.name_en}</p>
        <p className="text-sm text-gray-600 mt-1">{section.name_ar}</p>
        {section.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{section.description}</p>
        )}
        {section.father_section && (
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              Subsection
            </span>
          </div>
        )}
      </div>
    );
  };

  const fatherSectionTemplate = (props) => {
    const section = props;
    return (
      <div className="text-center">
        {section.father_section ? (
          <span className="text-sm text-blue-600 font-medium">Subsection</span>
        ) : (
          <span className="text-sm text-purple-600 font-medium">Main Section</span>
        )}
      </div>
    );
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setNewSection({
      name_en: section.name_en,
      name_ar: section.name_ar,
      description: section.description || '',
      image: null,
      father_section: section.father_section || '',
      is_active: section.is_active,
    });
    setIsModalOpen(true);
  };

  const handleViewProducts = (sectionId) => {
    alert(`Navigating to products for section ${sectionId}`);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axiosInstance.patch(`store/admin/sections/${id}/`, {
        is_active: !currentStatus,
      });

      setData((prev) => prev.map((section) => (section.id === id ? { ...section, is_active: !currentStatus } : section)));

      alert(`Section ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      alert('Failed to update section status');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will also remove all products in this section.`)) {
      try {
        await axiosInstance.delete(`store/admin/sections/${id}/`);
        setData((prev) => prev.filter((s) => s.id !== id));
        alert('Section deleted successfully');
      } catch (error) {
        alert('Failed to delete section');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        e.target.value = '';
        return;
      }

      setNewSection({ ...newSection, image: file });
    } else {
      setNewSection({ ...newSection, image: null });
    }
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append('name_en', newSection.name_en);
      formData.append('name_ar', newSection.name_ar);
      formData.append('description', newSection.description);
      formData.append('is_active', newSection.is_active.toString());

      if (newSection.father_section) {
        formData.append('father_section', newSection.father_section);
      }

      if (newSection.image instanceof File) {
        formData.append('image', newSection.image);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
      };

      let response;
      if (editingSection) {
        response = await axiosInstance.patch(
          `store/admin/sections/${editingSection.id}/`,
          formData,
          config,
        );
      } else {
        response = await axiosInstance.post(
          'store/admin/sections/',
          formData,
          config,
        );
      }

      if (editingSection) {
        setData((prev) => prev.map((section) => (section.id === editingSection.id ? response.data : section)));
      } else {
        setData((prev) => [...prev, response.data]);
      }

      alert('Section saved successfully!');
      closeModal();
      fetchSections();
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to save section';
      alert(`Error: ${JSON.stringify(errorMessage)}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setNewSection({
      name_en: '',
      name_ar: '',
      description: '',
      image: null,
      father_section: '',
      is_active: true,
    });
  };

  const actionTemplate = (props) => {
    const section = props;
    return (
      <div className="flex flex-col gap-2 justify-center">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleEdit(section)}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium flex items-center gap-1"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => handleViewProducts(section.id)}
            className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-xs font-medium flex items-center gap-1"
          >
            📦 Products
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleStatus(section.id, section.is_active)}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1 ${
              section.is_active
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {section.is_active ? '⏸️ Hide' : '▶️ Show'}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(section.id, section.name_en)}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium flex items-center gap-1"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Store Management" title="Store Sections" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading sections...</div>
        </div>
      </div>
    );
  }

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
          <p className="text-orange-800 font-semibold text-sm">Main Sections</p>
          <p className="text-2xl font-bold text-orange-600">{stats.mainSections}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-800 font-semibold text-sm">Subsections</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.subsections}</p>
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
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          ➕ Add New Section
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((section) => (
              <tr key={section.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{section.id}</td>
                <td className="px-4 py-3">
                  {imageTemplate(section)}
                </td>
                <td className="px-4 py-3">
                  {descriptionTemplate(section)}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">
                  {section.products_count}
                </td>
                <td className="px-4 py-3">
                  {fatherSectionTemplate(section)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(section.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {statusTemplate(section)}
                </td>
                <td className="px-4 py-3">
                  {actionTemplate(section)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingSection ? 'Edit Store Section' : 'Add New Store Section'}
              </h2>
              <button
                type="button"
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
                    English Name *
                  </label>
                  <input
                    type="text"
                    value={newSection.name_en}
                    onChange={(e) => setNewSection({ ...newSection, name_en: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., Mobile Gaming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arabic Name *
                  </label>
                  <input
                    type="text"
                    value={newSection.name_ar}
                    onChange={(e) => setNewSection({ ...newSection, name_ar: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., ألعاب الموبايل"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection({
                    ...newSection,
                    description: e.target.value,
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Description of this section..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newSection.image
                    ? `Selected: ${newSection.image.name}`
                    : editingSection?.image ? 'Current image will be kept' : 'No file selected'}
                </p>

                {newSection.image instanceof File && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 mb-1">Preview:</p>
                    <img
                      src={URL.createObjectURL(newSection.image)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                )}

                {editingSection && editingSection.image && !newSection.image && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-600 mb-1">Current Image:</p>
                    <img
                      src={getImageUrl(editingSection.image)}
                      alt="Current"
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = 'https://cdn-icons-png.flaticon.com/512/1170/1170679.png';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Section
                </label>
                <select
                  value={newSection.father_section}
                  onChange={(e) => setNewSection({ ...newSection, father_section: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Main Section (No Parent)</option>
                  {sections
                    .filter((section) => !section.father_section)
                    .map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name_en}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newSection.is_active}
                  onChange={(e) => setNewSection({ ...newSection, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
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
