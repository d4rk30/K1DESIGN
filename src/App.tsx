import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AttackLogs from './pages/AttackLogs';
import AttackIpAnalysis from './pages/AttackIpAnalysis';
import AttackedIpAnalysis from './pages/AttackedIpAnalysis';
import ExternalLogs from './pages/ExternalLogs';
import AntiMappingLogs from './pages/AntiMappingLogs';
import AntiMappingSources from './pages/AntiMappingSources';
import AntiMappingAssets from './pages/AntiMappingAssets';
import OutboundLogs from './pages/OutboundLogs';
import ThreatIntelligenceTrace from './pages/ThreatIntelligenceTrace';
import ThreatIntelligenceDetail from './pages/ThreatIntelligenceDetail';
import ThreatIntelligenceDetailV2 from './pages/ThreatIntelligenceDetailV2';
import NoData from './pages/ThreatIntelligenceDetailNoData';
import PublicIntelligence from './pages/PublicIntelligence';
import FalsePositive from './pages/FalsePositive';
import PasswordPolicy from './pages/PasswordPolicy';
import BlackWhiteList from './pages/BlackWhiteList';
import AntiMappingStrategy from './pages/AntiMappingStrategy';
import OutboundTrafficConfig from './pages/OutboundTrafficConfig';
import Reports from './pages/Reports';
import AssetManagement from './pages/AssetManagement';
import AssetList from './pages/AssetList';
import License from './pages/License';
import SyslogConfig from './pages/SyslogConfig';
import Backup from './pages/Backup';

import UnderDevelopment from './pages/UnderDevelopment';
// Set dayjs locale
dayjs.locale('zh-cn');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* 仪表盘 */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* 攻击监测告警 */}
            <Route path="attack-logs" element={<AttackLogs />} />
            <Route path="attack-ip-analysis" element={<AttackIpAnalysis />} />
            <Route path="attacked-ip-analysis" element={<AttackedIpAnalysis />} />

            {/* 外联监测告警 */}
            <Route path="external-logs" element={<ExternalLogs />} />

            {/* 反测绘监测告警 */}
            <Route path="anti-mapping-logs" element={<AntiMappingLogs />} />
            <Route path="anti-mapping-sources" element={<AntiMappingSources />} />
            <Route path="anti-mapping-assets" element={<AntiMappingAssets />} />

            {/* 出境流量告警 */}
            <Route path="outbound-logs" element={<OutboundLogs />} />

            {/* 威胁情报 */}
            <Route path="threat-intelligence-trace">
              <Route index element={<ThreatIntelligenceTrace />} />
              <Route path="detail" element={<ThreatIntelligenceDetail />} />
              <Route path="nodata" element={<NoData />} />
              <Route path="detailV2" element={<ThreatIntelligenceDetailV2 />} />
            </Route>
            <Route path="public-intelligence" element={<PublicIntelligence />} />
            <Route path="false-positive" element={<FalsePositive />} />

            {/* 策略配置 */}
            <Route path="password-policy" element={<PasswordPolicy />} />
            <Route path="blackwhite-list" element={<BlackWhiteList />} />
            <Route path="anti-mapping-strategy" element={<AntiMappingStrategy />} />
            <Route path="outbound-strategy" element={<OutboundTrafficConfig />} />

            {/* 报表导出 */}
            <Route path="reports" element={<Reports />} />

            {/* 系统管理 */}
            <Route path="asset-management" element={<AssetManagement />} />
            <Route path="asset-management/:groupId" element={<AssetList />} />
            <Route path="license" element={<License />} />
            <Route path="syslog-config" element={<SyslogConfig />} />
            <Route path="backup" element={<Backup />} />
            {/* 404 页面 */}
            <Route path="*" element={<UnderDevelopment />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider >
  );
};

export default App;
