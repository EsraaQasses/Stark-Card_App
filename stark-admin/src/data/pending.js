// src/data/pending.js

export const pendingData = [
  {
    RequestID: 3001,
    CustomerName: 'Omar Khaled',
    CustomerEmail: 'omar.khaled@example.com',
    CustomerPhone: '+963 944 555 123',
    Country: 'Syria',
    Product: 'Stark-Card Classic',
    RequestType: 'Shipping',
    Destination: 'Damascus',
    Status: 'Pending',
    RequestDate: new Date('2025-09-25'),
    CustomerImage: 'https://randomuser.me/api/portraits/men/72.jpg',
    Amount: 50.00,
    Currency: 'USD',
    Priority: 'High'
  },
  {
    RequestID: 3002,
    CustomerName: 'Lina Ahmad',
    CustomerEmail: 'lina.ahmad@example.com',
    CustomerPhone: '+963 933 222 456',
    Country: 'Syria',
    Product: 'Stark-Card Premium',
    RequestType: 'Shipping',
    Destination: 'Aleppo',
    Status: 'Pending',
    RequestDate: new Date('2025-09-26'),
    CustomerImage: 'https://randomuser.me/api/portraits/women/45.jpg',
    Amount: 75.00,
    Currency: 'USD',
    Priority: 'Medium'
  },
  {
    RequestID: 3003,
    CustomerName: 'Mohammed Hassan',
    CustomerEmail: 'mohammed.hassan@example.com',
    CustomerPhone: '+963 955 777 888',
    Country: 'Syria',
    RequestType: 'Verification',
    Destination: 'Latakia',
    Status: 'Pending',
    RequestDate: new Date('2025-09-27'),
    CustomerImage: 'https://randomuser.me/api/portraits/men/68.jpg',
    Amount: 0.00,
    Currency: 'USD',
    Priority: 'High',
    VerificationType: 'ID Verification'
  },
  {
    RequestID: 3004,
    CustomerName: 'Sarah Johnson',
    CustomerEmail: 'sarah.johnson@example.com',
    CustomerPhone: '+963 966 888 999',
    Country: 'Syria',
    RequestType: 'Refund',
    Destination: 'Homs',
    Status: 'Pending',
    RequestDate: new Date('2025-09-28'),
    CustomerImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    Amount: 25.00,
    Currency: 'USD',
    Priority: 'Medium',
    RefundReason: 'Product not delivered'
  },
  {
    RequestID: 3005,
    CustomerName: 'Ahmed Mohammed',
    CustomerEmail: 'ahmed.mohammed@example.com',
    CustomerPhone: '+963 977 111 222',
    Country: 'Syria',
    Product: 'Stark-Card Business',
    RequestType: 'Shipping',
    Destination: 'Damascus',
    Status: 'Pending',
    RequestDate: new Date('2025-09-29'),
    CustomerImage: 'https://randomuser.me/api/portraits/men/55.jpg',
    Amount: 100.00,
    Currency: 'USD',
    Priority: 'Low'
  }
];

// Optional: Grid configuration if needed elsewhere
export const pendingGrid = [
  { field: 'RequestID', headerText: 'Request ID', width: '100', textAlign: 'Center' },
  { field: 'CustomerName', headerText: 'Customer', width: '150', textAlign: 'Center' },
  { field: 'RequestType', headerText: 'Type', width: '120', textAlign: 'Center' },
  { field: 'Status', headerText: 'Status', width: '100', textAlign: 'Center' },
  { field: 'RequestDate', headerText: 'Date', width: '120', textAlign: 'Center' },
];