import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import UnderDevelopment from './pages/UnderDevelopment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="*" element={<UnderDevelopment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
