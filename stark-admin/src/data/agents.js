import React from 'react';
import avatar2 from './avatar2.jpg';
import avatar3 from './avatar3.png';
import avatar4 from './avatar4.jpg';

const agentGridImage = (props) => (
  <div className="flex gap-4 items-center">
    <img className="rounded-full w-10 h-10" src={props.AgentImage} alt={props.AgentName} />
    <div>
      <p className="font-semibold">{props.AgentName}</p>
      <p className="text-sm text-gray-500">{props.AgentEmail}</p>
    </div>
  </div>
);

const agentGridStatus = (props) => (
  <div className="flex gap-2 justify-center items-center text-gray-700 capitalize">
    <p style={{ background: props.StatusBg }} className="rounded-full h-3 w-3" />
    <p>{props.Status}</p>
  </div>
);

export const agentsGrid = [
  { type: 'checkbox', width: '50' },
  { headerText: 'Agent', width: '180', template: agentGridImage, textAlign: 'Center' },
  { field: 'AgentEmail', headerText: 'Email', width: '200', textAlign: 'Center' },
  { field: 'AgentPhone', headerText: 'Phone', width: '150', textAlign: 'Center' },
  { field: 'Country', headerText: 'Country', width: '120', textAlign: 'Center' },
  { field: 'TotalUsers', headerText: 'Total Users', width: '140', textAlign: 'Center' },
  { field: 'WalletBalance', headerText: 'Wallet Balance', width: '150', textAlign: 'Center', format: 'C2' },
  { field: 'Status', headerText: 'Status', width: '120', textAlign: 'Center', template: agentGridStatus },
  { field: 'AgentID', headerText: 'Agent ID', width: '120', textAlign: 'Center', isPrimaryKey: true },
  {
    headerText: 'Actions',
    width: '120',
    textAlign: 'Center',
    template: () => null,
  },
];

export const agentsData = [
  {
    AgentID: 1,
    AgentName: 'John Smith',
    AgentEmail: 'john.smith@email.com',
    AgentPhone: '+1234567890',
    AgentImage: avatar2,
    Country: 'United States',
    TotalUsers: 45,
    WalletBalance: 12500.5,
    Status: 'Active',
    StatusBg: '#22c55e',
    JoinDate: '2023-01-15',
    LastPayment: '2024-01-10',
    users: [
      { id: 1, name: 'Alice Johnson', email: 'alice@email.com', joinDate: '2023-02-01', totalSpent: 450 },
      { id: 2, name: 'Bob Wilson', email: 'bob@email.com', joinDate: '2023-02-15', totalSpent: 320.5 },
    ],
  },
  {
    AgentID: 2,
    AgentName: 'Maria Garcia',
    AgentEmail: 'maria.garcia@email.com',
    AgentPhone: '+1987654321',
    AgentImage: avatar3,
    Country: 'Spain',
    TotalUsers: 28,
    WalletBalance: 8450.75,
    Status: 'Active',
    StatusBg: '#22c55e',
    JoinDate: '2023-03-20',
    LastPayment: '2024-01-05',
    users: [
      { id: 1, name: 'David Brown', email: 'david@email.com', joinDate: '2023-04-01', totalSpent: 230 },
    ],
  },
  {
    AgentID: 3,
    AgentName: 'Ahmed Hassan',
    AgentEmail: 'ahmed.hassan@email.com',
    AgentPhone: '+20123456789',
    AgentImage: avatar4,
    Country: 'Egypt',
    TotalUsers: 62,
    WalletBalance: 21800.25,
    Status: 'Active',
    StatusBg: '#22c55e',
    JoinDate: '2022-11-05',
    LastPayment: '2024-01-12',
    users: [
      { id: 1, name: 'Fatima Ali', email: 'fatima@email.com', joinDate: '2022-12-01', totalSpent: 1200 },
      { id: 2, name: 'Omar Khan', email: 'omar@email.com', joinDate: '2023-01-10', totalSpent: 780.5 },
    ],
  },
];
