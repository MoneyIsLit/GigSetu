import React, { useState } from 'react';
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
        console.warn('Role mismatch, proceeding anyway as', user.role);
      }
      navigate(`/${user.role}`);
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
              className={`flex-1 py-2 text-sm font-medium rounded-md ${role === 'customer' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}`}
            >
              {t('auth.customerRole')}
            </button>
            <button 
              type="button" 
              onClick={() => setRole('worker')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${role === 'worker' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}`}
            >
              {t('auth.workerRole')}
            </button>
            <button 
              type="button" 
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${role === 'admin' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}`}
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

export default LoginPage;
