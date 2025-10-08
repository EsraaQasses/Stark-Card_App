import React from 'react';
import avatar from './avatar.jpg';
import avatar2 from './avatar2.jpg';
import avatar3 from './avatar3.png';
import avatar4 from './avatar4.jpg';

const customerGridImage = (props) => (
  <div className="image flex gap-4">
    <img
      className="rounded-full w-10 h-10"
      src={props.CustomerImage}
      alt="employee"
    />
    <div>
      <p>{props.CustomerName}</p>
      <p>{props.CustomerEmail}</p>
    </div>
  </div>
);

const customerGridStatus = (props) => (
  <div className="flex gap-2 justify-center items-center text-gray-700 capitalize">
    <p style={{ background: props.StatusBg }} className="rounded-full h-3 w-3" />
    <p>{props.Status}</p>
  </div>
);

export const customersGrid = [
  { type: 'checkbox', width: '50' },
  {
    headerText: 'Customer',
    width: '180',
    template: customerGridImage,
    textAlign: 'Center',
  },
  {
    field: 'CustomerEmail',
    headerText: 'Email',
    width: '200',
    textAlign: 'Center',
  },
  {
    field: 'CustomerPhone',
    headerText: 'Phone',
    width: '150',
    textAlign: 'Center',
  },
  {
    field: 'Country',
    headerText: 'Country',
    width: '120',
    textAlign: 'Center',
  },
  {
    field: 'WalletUSD',
    headerText: 'Wallet (USD)',
    width: '140',
    textAlign: 'Center',
    format: 'C2',
  },
  {
    field: 'WalletLBP',
    headerText: 'Wallet (LBP)',
    width: '180',
    textAlign: 'Center',
    format: 'N0',
  },
  {
    field: 'Status',
    headerText: 'Status',
    width: '120',
    textAlign: 'Center',
    template: customerGridStatus,
  },
  {
    field: 'CustomerID',
    headerText: 'Customer ID',
    width: '120',
    textAlign: 'Center',
    isPrimaryKey: true,
  },
];

export const customersData = [
  {
    CustomerID: 1001,
    CustomerName: 'Nirav Joshi',
    CustomerEmail: 'nirav@gmail.com',
    CustomerPhone: '+1 555-1234',
    CustomerImage: avatar2,
    Country: 'India',
    WalletUSD: 2400,
    WalletLBP: 36000000,
    Status: 'Active',
    StatusBg: '#8BE78B',
  },
  {
    CustomerID: 1002,
    CustomerName: 'Sunil Joshi',
    CustomerEmail: 'sunil@gmail.com',
    CustomerPhone: '+91 888-2222',
    CustomerImage: avatar3,
    Country: 'India',
    WalletUSD: 1200,
    WalletLBP: 18000000,
    Status: 'Active',
    StatusBg: '#8BE78B',
  },
  {
    CustomerID: 1003,
    CustomerName: 'Andrew McDownland',
    CustomerEmail: 'andrew@gmail.com',
    CustomerPhone: '+1 999-4567',
    CustomerImage: avatar4,
    Country: 'USA',
    WalletUSD: 500,
    WalletLBP: 7500000,
    Status: 'Suspended',
    StatusBg: '#FEC90F',
  },
  {
    CustomerID: 1004,
    CustomerName: 'Christopher Jamil',
    CustomerEmail: 'jamil@gmail.com',
    CustomerPhone: '+963 44-5566',
    CustomerImage: avatar,
    Country: 'Syria',
    WalletUSD: 300,
    WalletLBP: 4500000,
    Status: 'Active',
    StatusBg: '#8BE78B',
  },
  {
    CustomerID: 1005,
    CustomerName: 'Michael',
    CustomerEmail: 'michael@gmail.com',
    CustomerPhone: '+961 70-123456',
    CustomerImage: avatar2,
    Country: 'Lebanon',
    WalletUSD: 50,
    WalletLBP: 750000,
    Status: 'Inactive',
    StatusBg: 'red',
  },
];
