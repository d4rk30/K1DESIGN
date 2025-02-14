import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
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
import AssetManagement from './pages/AssetManagement';
import AssetList from './pages/AssetList';
import SyslogConfig from './pages/SyslogConfig';
import PasswordPolicy from './pages/PasswordPolicy';
import AttackLogs from './pages/AttackLogs';
import ExternalLogs from './pages/ExternalLogs';
import BlackWhiteList from './pages/BlackWhiteList';
import FalsePositive from './pages/FalsePositive';
import NoData from './pages/ThreatIntelligenceDetailNoData';
// Set dayjs locale
dayjs.locale('zh-cn');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* 系统概览 */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* 攻击日志 */}
            <Route path="attack-logs" element={<AttackLogs />} />

            {/* 反探测 */}
            <Route path="anti-mapping-logs" element={<AntiMappingLog />} />
            <Route path="anti-mapping-sources" element={<AntiMappingSources />} />
            <Route path="anti-mapping-assets" element={<AntiMappingAssets />} />
            <Route path="anti-mapping-policy" element={<AntiMappingStrategy />} />

            {/* 威胁情报 */}
            <Route path="threat-intelligence-trace">
              <Route index element={<ThreatIntelligenceTrace />} />
              <Route path="detail" element={<ThreatIntelligenceDetail />} />
              <Route path="nodata" element={<NoData />} />
            </Route>
            <Route path="public-intelligence" element={<PublicIntelligence />} />

            {/* 资产管理 */}
            <Route path="asset-management" element={<AssetManagement />} />
            <Route path="asset-management/:groupId" element={<AssetList />} />

            {/* 系统管理 */}
            <Route path="reports" element={<Reports />} />
            <Route path="external-logs" element={<ExternalLogs />} />
            <Route path="blackwhite-list" element={<BlackWhiteList />} />
            <Route path="false-positive" element={<FalsePositive />} />
            <Route path="password-policy" element={<PasswordPolicy />} />
            <Route path="syslog-config" element={<SyslogConfig />} />
            <Route path="license" element={<License />} />

            {/* 404 页面 */}
            <Route path="*" element={<UnderDevelopment />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider >
  );
};

export default App;
