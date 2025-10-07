import React, { useState } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Inject, Toolbar, Sort, Filter, Selection } from '@syncfusion/ej2-react-grids';
import { agentsData } from '../../data/agents';
import { Header } from '../../components';

const Agents = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const toolbarOptions = ['Search'];

  const formattedAgentsData = agentsData.map(agent => ({
    ...agent,
    WalletBalanceFormatted: `$${agent.WalletBalance.toLocaleString()}`,
  }));

  const handleRowSelected = (args) => {
    setSelectedAgent(args.data);
  };

  const handleViewUsers = () => {
    if (selectedAgent) {
      window.location.href = `/agents-users/${selectedAgent.AgentID}`;
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Management" title="Agents" />
      
      {selectedAgent && (
        <div className="mb-4">
          <button
            onClick={handleViewUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            View Users for {selectedAgent.AgentName}
          </button>
        </div>
      )}

      <GridComponent
        dataSource={formattedAgentsData}
        allowPaging={true}
        pageSettings={{ pageSize: 6 }}
        allowSorting={true}
        allowFiltering={true}
        toolbar={toolbarOptions}
        height={400}
        rowSelected={handleRowSelected}
        selectionSettings={{ type: 'Single' }}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="AgentID"
            headerText="Agent ID"
            width="100"
            textAlign="Center"
          />
          <ColumnDirective 
            field="AgentName" 
            headerText="Name" 
            width="150" 
            textAlign="Left"
          />
          <ColumnDirective 
            field="AgentEmail" 
            headerText="Email" 
            width="200" 
            textAlign="Left"
          />
          <ColumnDirective 
            field="AgentPhone" 
            headerText="Phone" 
            width="150" 
            textAlign="Center"
          />
          <ColumnDirective 
            field="Country" 
            headerText="Country" 
            width="120" 
            textAlign="Center"
          />
          <ColumnDirective 
            field="TotalUsers" 
            headerText="Users" 
            width="100" 
            textAlign="Center"
          />
          <ColumnDirective 
            field="WalletBalanceFormatted" 
            headerText="Balance" 
            width="120" 
            textAlign="Center"
          />
          <ColumnDirective 
            field="Status" 
            headerText="Status" 
            width="100" 
            textAlign="Center"
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Sort, Filter, Selection]} />
      </GridComponent>
    </div>
  );
};

export default Agents;
