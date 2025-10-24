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

const ShippingRequests = () => {
  const [shippingData, setShippingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toolbarOptions = ['Search'];

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/shipping/');
      setShippingData(response.data);
    } catch (err) {
      setError('Failed to load shipping requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shippingId) => {
    try {
      await axiosInstance.post(`/shipping/${shippingId}/update_status/`, {
        status: 'approved',
        admin_notes: 'Payment verified and approved',
      });

      alert(`Shipping request #${shippingId} approved successfully!`);
      fetchShippingData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to approve shipping request';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleReject = async (shippingId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      await axiosInstance.post(`/shipping/${shippingId}/update_status/`, {
        status: 'rejected',
        admin_notes: reason,
      });

      alert(`Shipping request #${shippingId} rejected.`);
      fetchShippingData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reject shipping request';
      alert(`Error: ${errorMessage}`);
    }
  };

  const customerTemplate = (props) => {
    const shipping = props;
    return (
      <div className="flex items-center gap-3">
        <img
          className="rounded-full w-10 h-10 object-cover"
          src={shipping.user?.profile_image || 'https://via.placeholder.com/40x40/cccccc/666666?text=User'}
          alt={shipping.user_name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/40x40/cccccc/666666?text=User';
          }}
        />
        <div>
          <p className="font-semibold text-sm">{shipping.user_name}</p>
          <p className="text-xs text-gray-500">{shipping.user_email}</p>
          {shipping.request_details?.user_phone && (
            <p className="text-xs text-gray-400">{shipping.request_details.user_phone}</p>
          )}
        </div>
      </div>
    );
  };

  const getStatusConfig = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
    };

    const statusText = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      processing: 'Processing',
    };

    return {
      color: statusColors[status] || 'bg-gray-100 text-gray-800',
      text: statusText[status] || status,
    };
  };

  const statusTemplate = (props) => {
    const { status } = props;
    const config = getStatusConfig(status);

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const amountTemplate = (props) => {
    const shipping = props;
    return (
      <div className="text-center">
        <p className="font-semibold text-sm">{shipping.amount} {shipping.currency?.toUpperCase()}</p>
        {shipping.request_details?.payment_method_title && (
          <p className="text-xs text-gray-500">{shipping.request_details.payment_method_title}</p>
        )}
      </div>
    );
  };

  const actionTemplate = (props) => {
    const shipping = props;
    const isPending = shipping.status === 'pending';

    if (!isPending) {
      return (
        <span className="text-gray-400 text-sm capitalize">{shipping.status}</span>
      );
    }

    return (
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs"
          onClick={() => handleApprove(shipping.id)}
        >
          Approve
        </button>
        <button
          type="button"
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs"
          onClick={() => handleReject(shipping.id)}
        >
          Reject
        </button>
      </div>
    );
  };

  const dateTemplate = (props) => {
    const date = new Date(props.created_at);
    return (
      <span className="text-sm">
        {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Shipping" title="Shipping Requests Management" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading shipping requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Shipping" title="Shipping Requests Management" />
        <div className="flex justify-center items-center h-40">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Header category="Shipping" title="Shipping Requests Management" />

      <GridComponent
        dataSource={shippingData}
        allowPaging
        allowSorting
        allowFiltering
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 10 }}
        height={400}
        enableHover={false}
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
            headerText="Customer"
            width="220"
            textAlign="Left"
            template={customerTemplate}
          />

          <ColumnDirective
            headerText="Amount"
            width="120"
            textAlign="Center"
            template={amountTemplate}
          />

          <ColumnDirective
            field="request_details.title"
            headerText="Description"
            width="180"
            textAlign="Center"
          />

          <ColumnDirective
            field="created_at"
            headerText="Request Date"
            width="130"
            textAlign="Center"
            template={dateTemplate}
          />

          <ColumnDirective
            field="status"
            headerText="Status"
            width="110"
            textAlign="Center"
            template={statusTemplate}
          />

          <ColumnDirective
            headerText="Actions"
            width="180"
            textAlign="Center"
            template={actionTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter]} />
      </GridComponent>
    </div>
  );
};

export default ShippingRequests;
