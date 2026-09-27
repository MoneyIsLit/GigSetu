const fs = require('fs');
const path = require('path');

const basePath = 'c:/Users/Saathvik/OneDrive/Desktop/GigSetu/frontend/';

function ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function writeFile(relPath, content) {
    const fullPath = path.join(basePath, relPath);
    ensureDir(fullPath);
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
    console.log(`Created ${relPath}`);
}

const files = {};

files['src/main.jsx'] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { SocketProvider } from './context/SocketContext'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <App />
            <Toaster position="top-right" />
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)`;

files['src/App.jsx'] = `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import FindService from './pages/customer/FindService';
import MyBookings from './pages/customer/MyBookings';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import MyJobs from './pages/worker/MyJobs';
import WorkerProfile from './pages/worker/WorkerProfile';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/find-service" element={<ProtectedRoute allowedRoles={['customer']}><FindService /></ProtectedRoute>} />
          <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
          
          <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/worker/jobs" element={<ProtectedRoute allowedRoles={['worker']}><MyJobs /></ProtectedRoute>} />
          <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['worker']}><WorkerProfile /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;`;

files['src/components/ProtectedRoute.jsx'] = `import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;`;

files['src/components/Navbar.jsx'] = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold text-gradient">GigSetu</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.dashboard')}</Link>
              </>
            )}
            {user && user.role === 'customer' && (
              <>
                <Link to="/customer" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.dashboard')}</Link>
                <Link to="/customer/find-service" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.findService')}</Link>
                <Link to="/customer/bookings" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.bookings')}</Link>
              </>
            )}
            {user && user.role === 'worker' && (
              <>
                <Link to="/worker" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.dashboard')}</Link>
                <Link to="/worker/jobs" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.myJobs')}</Link>
                <Link to="/worker/profile" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.profile')}</Link>
              </>
            )}

            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center text-gray-700 hover:text-primary-600 p-2">
                🌐 {language.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  {supportedLanguages.map(lang => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code); setLangOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white justify-center items-center font-bold">
                        {notifications.length}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium">{t('common.login')}</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
                  {t('auth.registerHere')}
                </Link>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700 focus:outline-none touch-target flex justify-center items-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`;

files['src/components/StatCard.jsx'] = `import React from 'react';

const StatCard = ({ icon, title, value, colorClass = 'bg-primary-50 text-primary-600 border-primary-500' }) => {
  return (
    <div className={\`bg-white rounded-xl shadow-md p-6 flex items-center hover-card border-l-4 \${colorClass.split(' ')[2]}\`}>
      <div className={\`p-4 rounded-full mr-4 \${colorClass.split(' ')[0]} \${colorClass.split(' ')[1]}\`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;`;

files['src/components/FairnessBreakdown.jsx'] = `import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const ProgressBar = ({ label, percentage }) => {
  const color = percentage > 80 ? 'bg-green-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className={\`\${color} h-1.5 rounded-full transition-all duration-1000\`} style={{ width: \`\${percentage}%\` }}></div>
      </div>
    </div>
  );
};

const FairnessBreakdown = ({ scores }) => {
  const { t } = useLanguage();
  if (!scores) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm border border-gray-100">
      <h4 className="font-semibold text-gray-800 mb-3">{t('fairness.scoreBreakdown')}</h4>
      <ProgressBar label={t('fairness.skillMatch')} percentage={scores.skillMatch * 100} />
      <ProgressBar label={t('fairness.distance')} percentage={scores.distance * 100} />
      <ProgressBar label={t('fairness.availability')} percentage={scores.availability * 100} />
      <ProgressBar label={t('fairness.workloadBalance')} percentage={scores.workloadBalance * 100} />
      <ProgressBar label={t('fairness.rating')} percentage={scores.rating * 100} />
    </div>
  );
};

export default FairnessBreakdown;`;

files['src/components/NotificationToast.jsx'] = `// This is now integrated directly into SocketContext using react-hot-toast`;

files['src/components/WorkerCard.jsx'] = `import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import FairnessBreakdown from './FairnessBreakdown';

const WorkerCard = ({ worker, scores, distance, isTopMatch, onRequestService }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'partially_available': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className={\`bg-white rounded-xl shadow-md overflow-hidden hover-card \${isTopMatch ? 'ring-2 ring-primary-500 transform scale-[1.02]' : 'border border-gray-100'}\`}>
      {isTopMatch && (
        <div className="bg-gradient-to-r from-primary-600 to-green-500 text-white text-center py-1 text-xs font-bold uppercase tracking-wider">
          ⭐ {t('customer.bestFairMatch')} ⭐
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{worker.userId?.name || worker.name}</h3>
            <p className="text-sm text-primary-600 font-medium">{t(\`services.\${worker.service}\`)}</p>
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
              <span>⭐ {worker.rating?.toFixed(1) || '0.0'}</span>
              <span>•</span>
              <span>{worker.experience} {t('common.yearsExp')}</span>
              <span>•</span>
              <span>{(distance / 1000).toFixed(1)} {t('common.kmAway')}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex flex-col items-center justify-center bg-green-50 rounded-lg p-2 border border-green-100 min-w-[80px]">
              <span className="text-xs text-green-800 font-semibold">{t('fairness.overallScore')}</span>
              <span className="text-2xl font-bold text-green-600">{((scores?.combinedScore || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <span className={\`px-2 py-1 text-xs rounded-full font-medium \${getStatusColor(worker.availability)}\`}>
            {t(\`worker.\${worker.availability}\`)}
          </span>
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">
            {worker.activeJobs} {t('common.activeJobs')}
          </span>
        </div>

        {expanded && <FairnessBreakdown scores={scores} />}

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <button onClick={() => setExpanded(!expanded)} className="text-sm text-gray-500 hover:text-primary-600 font-medium underline-offset-2 hover:underline">
            {expanded ? t('common.close') : t('customer.whyThisWorker')}
          </button>
          <button onClick={() => onRequestService(worker)} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition-colors">
            {t('customer.requestService')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;`;

files['src/components/BookingCard.jsx'] = `import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const BookingCard = ({ booking, onStatusUpdate, userRole }) => {
  const { t } = useLanguage();
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isWorker = userRole === 'worker';
  const otherParty = isWorker ? booking.customerId : booking.workerId;
  const otherName = typeof otherParty === 'object' ? (otherParty?.name || otherParty?.userId?.name || 'Unknown') : 'Unknown';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover-card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={\`px-2 py-1 text-xs rounded-full font-medium uppercase tracking-wider \${getStatusColor(booking.status)}\`}>
            {t(\`booking.\${booking.status}\`)}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-2">{t(\`services.\${booking.service}\`)}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{booking.description}</p>
      
      <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3">
        <div className="text-gray-600">
          <span className="font-medium text-gray-900">{otherName}</span>
        </div>
      </div>

      {onStatusUpdate && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {isWorker && booking.status === 'requested' && (
            <>
              <button onClick={() => onStatusUpdate(booking._id, 'accepted')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium shadow-sm transition-colors text-sm">
                {t('worker.acceptJob')}
              </button>
              <button onClick={() => onStatusUpdate(booking._id, 'cancelled')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm">
                {t('worker.rejectJob')}
              </button>
            </>
          )}
          {isWorker && booking.status === 'accepted' && (
            <button onClick={() => onStatusUpdate(booking._id, 'in_progress')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium shadow-sm transition-colors">
              {t('worker.startJob')}
            </button>
          )}
          {isWorker && booking.status === 'in_progress' && (
            <button onClick={() => onStatusUpdate(booking._id, 'completed')} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium shadow-sm transition-colors">
              {t('worker.completeJob')}
            </button>
          )}
          {!isWorker && booking.status === 'requested' && (
            <button onClick={() => onStatusUpdate(booking._id, 'cancelled')} className="w-full border border-red-300 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg font-medium transition-colors text-sm">
              {t('booking.cancelBooking')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;`;

Object.keys(files).forEach(file => {
  writeFile(file, files[file]);
});
console.log('Done script 2');
