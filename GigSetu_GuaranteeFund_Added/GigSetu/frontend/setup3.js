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

files['src/pages/LandingPage.jsx'] = `import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djI2aDJWMzRoLTI2VjIyaC0yVjM2SDZWMzRoMjYV3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
            GigSetu
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 text-primary-100 max-w-3xl mx-auto">
            {t('landing.tagline')}
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-primary-50">
            {t('landing.heroText')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 hover:bg-gray-50 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              {t('landing.findService')}
            </Link>
            <Link to="/register" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl font-bold text-lg transition-all hover:-translate-y-1">
              {t('landing.joinAsWorker')}
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold mb-3">{t('landing.benefit1Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.benefit1Desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-6">⚖️</div>
              <h3 className="text-xl font-bold mb-3">{t('landing.benefit2Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.benefit2Desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-6">📍</div>
              <h3 className="text-xl font-bold mb-3">{t('landing.benefit3Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.benefit3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-16">{t('landing.howItWorks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 z-10 relative shadow-sm">1</div>
              <h3 className="text-xl font-bold mb-2">{t('landing.step1')}</h3>
              <p className="text-gray-600">{t('landing.step1Desc')}</p>
            </div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 z-10 relative shadow-sm">2</div>
              <h3 className="text-xl font-bold mb-2">{t('landing.step2')}</h3>
              <p className="text-gray-600">{t('landing.step2Desc')}</p>
            </div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 z-10 relative shadow-sm">3</div>
              <h3 className="text-xl font-bold mb-2">{t('landing.step3')}</h3>
              <p className="text-gray-600">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p className="mb-2">GigSetu - {t('landing.cooperativeOwned')}</p>
        <p className="text-sm">{t('landing.sihProject')}</p>
      </footer>
    </div>
  );
};

export default LandingPage;`;

files['src/pages/LoginPage.jsx'] = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role !== role && user.role !== 'admin') {
        // Just for UX, let them know they logged into different role than selected, but proceed
        console.warn('Role mismatch, proceeding anyway as', user.role);
      }
      navigate(\`/\${user.role}\`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary-600 py-6 text-center text-white">
          <h2 className="text-3xl font-extrabold">{t('auth.loginTitle')}</h2>
        </div>
        
        <div className="p-8">
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button 
              type="button" 
              onClick={() => setRole('customer')}
              className={\`flex-1 py-2 text-sm font-medium rounded-md \${role === 'customer' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}\`}
            >
              {t('auth.customerRole')}
            </button>
            <button 
              type="button" 
              onClick={() => setRole('worker')}
              className={\`flex-1 py-2 text-sm font-medium rounded-md \${role === 'worker' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}\`}
            >
              {t('auth.workerRole')}
            </button>
            <button 
              type="button" 
              onClick={() => setRole('admin')}
              className={\`flex-1 py-2 text-sm font-medium rounded-md \${role === 'admin' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}\`}
            >
              {t('auth.adminRole')}
            </button>
          </div>

          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
              <input 
                type="email" required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                value={email} onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.password')}</label>
              <input 
                type="password" required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                value={password} onChange={e => setPassword(e.target.value)} 
              />
            </div>
            
            <button 
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('common.login')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.noAccount')} <Link to="/register" className="text-primary-600 font-bold hover:underline">{t('auth.registerHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;`;

files['src/pages/RegisterPage.jsx'] = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage = () => {
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    service: 'electrician', skills: '', experience: 0,
    lat: '', lng: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUseDefaultLoc = () => {
    setFormData({ ...formData, lat: 12.9716, lng: 77.5946 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = { 
        name: formData.name, email: formData.email, password: formData.password, 
        phone: formData.phone, role 
      };
      
      if (role === 'worker') {
        payload.service = formData.service;
        payload.skills = formData.skills.split(',').map(s => s.trim());
        payload.experience = Number(formData.experience);
        payload.location = {
          type: 'Point',
          coordinates: [Number(formData.lng) || 0, Number(formData.lat) || 0]
        };
      }
      
      const user = await register(payload);
      navigate(\`/\${user.role}\`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary-600 py-6 text-center text-white">
          <h2 className="text-3xl font-extrabold">{t('auth.registerTitle')}</h2>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button type="button" onClick={() => setRole('customer')} className={\`p-4 rounded-xl border-2 transition-all \${role === 'customer' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:border-primary-300'}\`}>
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-bold text-gray-900">{t('auth.customerRole')}</h3>
            </button>
            <button type="button" onClick={() => setRole('worker')} className={\`p-4 rounded-xl border-2 transition-all \${role === 'worker' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:border-primary-300'}\`}>
              <div className="text-2xl mb-2">🛠️</div>
              <h3 className="font-bold text-gray-900">{t('auth.workerRole')}</h3>
            </button>
          </div>

          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name')}</label>
                <input type="text" name="name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phone')}</label>
                <input type="tel" name="phone" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
              <input type="email" name="email" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.password')}</label>
              <input type="password" name="password" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.password} onChange={handleChange} />
            </div>

            {role === 'worker' && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <h4 className="font-bold text-gray-900">{t('worker.workerPortal')} Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.service')}</label>
                    <select name="service" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white" value={formData.service} onChange={handleChange}>
                      <option value="electrician">{t('services.electrician')}</option>
                      <option value="plumber">{t('services.plumber')}</option>
                      <option value="carpenter">{t('services.carpenter')}</option>
                      <option value="cleaner">{t('services.cleaner')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.experience')} (Years)</label>
                    <input type="number" name="experience" min="0" required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.experience} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('worker.skills')} (Comma separated)</label>
                  <input type="text" name="skills" required placeholder="e.g. wiring, installation" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.skills} onChange={handleChange} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">{t('common.location')}</label>
                    <button type="button" onClick={handleUseDefaultLoc} className="text-xs text-primary-600 font-medium hover:underline">{t('customer.useDefaultLocation')}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="any" name="lat" required placeholder="Lat" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" value={formData.lat} onChange={handleChange} />
                    <input type="number" step="any" name="lng" required placeholder="Lng" className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" value={formData.lng} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
              {loading ? t('common.loading') : t('common.submit')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.haveAccount')} <Link to="/login" className="text-primary-600 font-bold hover:underline">{t('auth.loginHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;`;

files['src/pages/admin/AdminDashboard.jsx'] = `import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ totalWorkers: 0, pendingWorkers: 0, verifiedWorkers: 0, activeJobs: 0 });
  const [workers, setWorkers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, verified

  const loadData = async () => {
    try {
      const [statsRes, workersRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { totalWorkers: 0, pendingWorkers: 0, verifiedWorkers: 0, activeJobs: 0 } })),
        api.get('/admin/workers').catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setWorkers(workersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.patch(\`/workers/\${id}/verify\`, { status });
      toast.success('Worker status updated');
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredWorkers = workers.filter(w => {
    if (filter === 'pending') return w.verificationStatus === 'pending';
    if (filter === 'verified') return w.verificationStatus === 'verified';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('admin.cooperativeDashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon="👥" title={t('admin.totalWorkers')} value={stats.totalWorkers} colorClass="bg-blue-50 text-blue-600 border-blue-500" />
        <StatCard icon="✅" title={t('admin.verifiedWorkers')} value={stats.verifiedWorkers} colorClass="bg-green-50 text-green-600 border-green-500" />
        <StatCard icon="⏳" title={t('admin.pendingWorkers')} value={stats.pendingWorkers} colorClass="bg-yellow-50 text-yellow-600 border-yellow-500" />
        <StatCard icon="🔨" title={t('admin.activeJobs')} value={stats.activeJobs} colorClass="bg-orange-50 text-orange-600 border-orange-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">{t('admin.workerVerification')}</h2>
          <div className="flex space-x-2">
            <button onClick={() => setFilter('all')} className={\`px-3 py-1 text-sm rounded-full font-medium \${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}\`}>{t('admin.allWorkers')}</button>
            <button onClick={() => setFilter('pending')} className={\`px-3 py-1 text-sm rounded-full font-medium \${filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}\`}>{t('admin.pendingOnly')}</button>
            <button onClick={() => setFilter('verified')} className={\`px-3 py-1 text-sm rounded-full font-medium \${filter === 'verified' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}\`}>{t('admin.verifiedOnly')}</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.workerName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.serviceType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.experienceYears')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkers.map((worker) => (
                <tr key={worker._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.userId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(\`services.\${worker.service}\`)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.experience}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full \${worker.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : worker.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}\`}>
                      {t(\`worker.\${worker.verificationStatus}\`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {worker.verificationStatus === 'pending' && (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleVerify(worker._id, 'verified')} className="text-green-600 hover:text-green-900 font-bold bg-green-50 px-2 py-1 rounded">{t('admin.verifyWorker')}</button>
                        <button onClick={() => handleVerify(worker._id, 'rejected')} className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-2 py-1 rounded">{t('admin.rejectWorker')}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;`;

Object.keys(files).forEach(file => {
  writeFile(file, files[file]);
});
console.log('Done script 3');
