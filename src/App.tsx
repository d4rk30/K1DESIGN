import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import License from './pages/License';
import UnderDevelopment from './pages/UnderDevelopment';
import ExposureLog from './pages/ExposureLog';
import ExposureAssets from './pages/ExposureAssets';
import ExposureStrategy from './pages/ExposureStrategy';
const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="license" element={<License />} />
            <Route path="exposure-logs" element={<ExposureLog />} />
            <Route path="exposure-assets" element={<ExposureAssets />} />
            <Route path="exposure-policy" element={<ExposureStrategy />} />
            <Route path="*" element={<UnderDevelopment />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
