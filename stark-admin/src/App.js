import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import { Home } from './pages';
import './App.css';
import Customers from './pages/Users/Customers';
import Agents from './pages/Users/Agents';
import Blacklist from './pages/Users/BlackList';

import Pending from './pages/Requests/Pending';
import ShippingRequests from './pages/Requests/ShippingRequests';
import ObjectionRequest from './pages/Requests/ObjectionRequest';
import InProgress from './pages/Requests/InProgress';
import API from './pages/Dashboard/API';
import Requests from './pages/Dashboard/RequestsHub';
import Payments from './pages/Dashboard/Payments';
import Transition from './pages/Dashboard/Transition';
import Ads from './pages/Dashboard/AdsPage';
import Sections from './pages/Store/Sections';
import Products from './pages/Store/Products';
import Packages from './pages/Store/Packages';

import { useStateContext } from './contexts/ContextProvider';

const App = () => {
  const { setCurrentColor, setCurrentMode, currentMode, activeMenu, currentColor, themeSettings, setThemeSettings } = useStateContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
      <BrowserRouter>
        <div className="flex relative dark:bg-main-dark-bg">
          <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
            <TooltipComponent
              content="Settings"
              position="Top"
            >
              <button
                type="button"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor, borderRadius: '50%' }}
                className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
              >
                <FiSettings />
              </button>

            </TooltipComponent>
          </div>
          {activeMenu ? (
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
              <Sidebar />
            </div>
          ) : (
            <div className="w-0 dark:bg-secondary-dark-bg">
              <Sidebar />
            </div>
          )}
          <div
            className={
              activeMenu
                ? 'dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  '
                : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
            }
          >
            <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
              <Navbar />
            </div>
            <div>
              {themeSettings && (<ThemeSettings />)}

              <Routes>
                {/* dashboard  */}
                <Route path="/" element={(<Home />)} />
                <Route path="/Home" element={(<Home />)} />
                <Route path="/api" element={(<API />)} />
                <Route path="/requests" element={(<Requests />)} />
                <Route path="/payment" element={(<Payments />)} />
                <Route path="/transition" element={(<Transition />)} />
                <Route path="/ads" element={(<Ads />)} />

                {/* requests  */}
                <Route path="/shipping-requests" element={<ShippingRequests />} />
                <Route path="/pending" element={<Pending />} />
                <Route path="/in-progress" element={<InProgress />} />
                <Route path="/objection-requests" element={<ObjectionRequest />} />

                {/* Users  */}
                <Route path="/customers" element={<Customers />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/blacklist" element={<Blacklist />} />

                {/* Store  */}
                <Route path="/sections" element={<Sections />} />
                <Route path="/products" element={<Products />} />
                <Route path="/packages" element={<Packages />} />

              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
