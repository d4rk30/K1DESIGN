import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import License from './pages/License';
import UnderDevelopment from './pages/UnderDevelopment';
import AntiMappingLog from './pages/AntiMappingLog';
import AntiMappingSources from './pages/AntiMappingSources';
import AntiMappingAssets from './pages/AntiMappingAssets';
import AntiMappingStrategy from './pages/AntiMappingStrategy';
import Reports from './pages/Reports';
import ThreatIntelligenceTrace from './pages/ThreatIntelligenceTrace';
import ThreatIntelligenceDetail from './pages/ThreatIntelligenceDetail';
import PublicIntelligence from './pages/PublicIntelligence';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="license" element={<License />} />
            <Route path="anti-mapping-logs" element={<AntiMappingLog />} />
            <Route path="anti-mapping-sources" element={<AntiMappingSources />} />
            <Route path="anti-mapping-assets" element={<AntiMappingAssets />} />
            <Route path="anti-mapping-policy" element={<AntiMappingStrategy />} />
            <Route path="reports" element={<Reports />} />
            <Route path="threat-intelligence-trace">
              <Route index element={<ThreatIntelligenceTrace />} />
              <Route path="detail" element={<ThreatIntelligenceDetail />} />
            </Route>
            <Route path="public-intelligence" element={<PublicIntelligence />} />
            <Route path="*" element={<UnderDevelopment />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
