import React, { useState } from 'react';
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
        payload.skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
        payload.experienceYears = Number(formData.experience);
        payload.latitude = Number(formData.lat) || 12.9716;
        payload.longitude = Number(formData.lng) || 77.5946;
      }
      
      const user = await register(payload);
      navigate(`/${user.role}`);
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
            <button type="button" onClick={() => setRole('customer')} className={`p-4 rounded-xl border-2 transition-all ${role === 'customer' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}>
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-bold text-gray-900">{t('auth.customerRole')}</h3>
            </button>
            <button type="button" onClick={() => setRole('worker')} className={`p-4 rounded-xl border-2 transition-all ${role === 'worker' ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}>
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

export default RegisterPage;
