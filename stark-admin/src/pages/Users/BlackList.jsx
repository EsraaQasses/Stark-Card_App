import React from 'react';
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

import { blacklistData, blacklistGrid } from '../../data/blacklist';
import { Header } from '../../components';

const Blacklist = () => {

  const GridComponent = ({ dataSource, toolbar }) => (
      <div className="mt-6 border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-[#33373E] shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400 border-b pb-2">
              Blacklist Grid (MOCK VIEW)
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Current Toolbar Options: **{toolbar.join(', ')}**
          </p>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-red-50 dark:bg-red-900/50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#33373E] divide-y divide-gray-200 dark:divide-gray-700">
                      {dataSource.map((item) => (
                          <tr key={item.CustomerID} className="hover:bg-gray-50 dark:hover:bg-[#42464D]">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.CustomerName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-400 font-semibold">{item.Status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{item.CustomerID}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );
  const ColumnsDirective = ({ children }) => null;
  const ColumnDirective = (props) => null;
  const Inject = () => null; 
  const Header = ({ title }) => (
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-100 mb-6 border-b pb-2">
          {title}
      </h1>
  );

  const blacklistData = [
    { CustomerID: 9999, CustomerName: 'Blocked User M.Z.R.', Status: 'Blacklisted', StatusBg: '#d32f2f' },
    { CustomerID: 9998, CustomerName: 'Sarah J. (Fraud Risk)', Status: 'Blacklisted', StatusBg: '#d32f2f' },
    { CustomerID: 9997, CustomerName: 'Agent 47 (Suspended)', Status: 'Blacklisted', StatusBg: '#d32f2f' },
  ];

  const blacklistGrid = [];

  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ['Add', 'Delete']; 
  const editing = { allowDeleting: true, allowEditing: false, allowAdding: true };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-[#20232A] rounded-3xl shadow-xl">
      <Header category="Management" title="Blacklisted Accounts" />
      <GridComponent
        dataSource={blacklistData}
        enableHover={true}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting
        allowFiltering
        width="auto"
        className="dark:border-gray-700"
      >
        <ColumnsDirective>
          {blacklistGrid.map((item, index) => (
            <ColumnDirective key={index} {...item} />
          ))}
        </ColumnsDirective>

      </GridComponent>
    </div>
  );
};

export default Blacklist;
