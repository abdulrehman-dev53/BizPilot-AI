import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BusinessProfile from './pages/BusinessProfile';
import Products from './pages/Products';
import Competitors from './pages/Competitors';
import AIBusinessAnalysis from './pages/AIBusinessAnalysis';
import AIMarketingGenerator from './pages/AIMarketingGenerator';
import AIContentGenerator from './pages/AIContentGenerator';
import AIContentCalendar from './pages/AIContentCalendar';
import ContentHistory from './pages/ContentHistory';
import Campaigns from './pages/Campaigns';
import Chat from './pages/Chat';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/business" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/competitors" element={<ProtectedRoute><Competitors /></ProtectedRoute>} />
        <Route path="/ai/analysis" element={<ProtectedRoute><AIBusinessAnalysis /></ProtectedRoute>} />
        <Route path="/ai/marketing" element={<ProtectedRoute><AIMarketingGenerator /></ProtectedRoute>} />
        <Route path="/ai/content" element={<ProtectedRoute><AIContentGenerator /></ProtectedRoute>} />
        <Route path="/ai/calendar" element={<ProtectedRoute><AIContentCalendar /></ProtectedRoute>} />
        <Route path="/content-history" element={<ProtectedRoute><ContentHistory /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
