import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import WorkerCard from '../../components/WorkerCard';
import toast from 'react-hot-toast';

const FindService = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service: 'electrician', description: '', lat: '', lng: '', emergency: false, scheduledAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [pricing, setPricing] = useState([]);
  const [durationHours, setDurationHours] = useState(1);

  useEffect(() => {
    api.get('/pricing').then(res => setPricing(res.data)).catch(() => {});
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUseDefaultLoc = () => setFormData({ ...formData, lat: 12.9716, lng: 77.5946 });

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error(t('customer.locationUnsupported'));
    navigator.geolocation.getCurrentPosition(
      pos => setFormData(prev => ({ ...prev, lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) })),
      () => toast.error(t('customer.locationDenied'))
    );
  };

  const currentPrice = pricing.find(p => p.service === String(formData.service).toLowerCase())?.hourlyRate || 0;
  const estimatedAmount = Math.round(currentPrice * Number(durationHours || 1));

  const handleSearch = async e => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const res = await api.post('/matching/recommend', {
        service: formData.service,
        description: formData.description,
        latitude: Number(formData.lat),
        longitude: Number(formData.lng),
        emergency: formData.emergency
      });
      setResults(res.data);
      if (!res.data.length) toast(t('customer.noWorkers'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('customer.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = async worker => {
    try {
      const item = results.find(r => r.worker._id === worker._id);
      await api.post('/bookings', {
        workerId: worker._id,
        service: formData.service,
        description: formData.description,
        latitude: Number(formData.lat),
        longitude: Number(formData.lng),
        fairnessScore: item?.scores?.fairnessScore,
        mlScore: item?.scores?.mlScore,
        combinedScore: item?.scores?.combinedScore,
        isEmergency: formData.emergency,
        scheduledAt: formData.scheduledAt || undefined,
        durationHours: Number(durationHours)
      });
      toast.success(t('booking.bookingCreated'));
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || t('customer.bookingFailed'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('customer.findService')}</h1>
        <p className="text-gray-500 mb-6">{t('landing.heroText')}</p>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('customer.serviceRequired')}</label>
              <select name="service" required className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" value={formData.service} onChange={handleChange}>
                {['electrician','plumber','carpenter','cleaner','painter','gardener','applianceRepair','delivery','farmWorker','otherServices'].map(key =>
                  <option key={key} value={key}>{t(`services.${key}`)}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('common.location')}</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="any" name="lat" required placeholder={t('common.latitude')} className="w-full px-4 py-3 rounded-xl border border-gray-300" value={formData.lat} onChange={handleChange} />
                <input type="number" step="any" name="lng" required placeholder={t('common.longitude')} className="w-full px-4 py-3 rounded-xl border border-gray-300" value={formData.lng} onChange={handleChange} />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={handleCurrentLocation} className="text-xs font-semibold text-primary-700">{t('customer.useCurrentLocation')}</button>
                <button type="button" onClick={handleUseDefaultLoc} className="text-xs font-semibold text-primary-700">{t('customer.useDefaultLocation')}</button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('customer.description')}</label>
            <textarea name="description" required rows="3" placeholder={t('customer.descriptionPlaceholder')} className="w-full px-4 py-3 rounded-xl border border-gray-300 resize-none" value={formData.description} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <span className="text-xs text-green-700 font-semibold block">Fixed cooperative rate</span>
              <b className="text-xl text-green-800">₹{currentPrice}/hour</b>
              <span className="block text-xs text-gray-500 mt-1">Same transparent rate for this service</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service duration (hours)</label>
              <input type="number" min="0.5" max="24" step="0.5" value={durationHours} onChange={e => setDurationHours(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300" />
              <p className="text-xs text-gray-500 mt-1">Estimated total: <b>₹{estimatedAmount}</b></p>
            </div>
            <label className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4 cursor-pointer">
              <input type="checkbox" name="emergency" checked={formData.emergency} onChange={e => setFormData({ ...formData, emergency: e.target.checked })} />
              <span><b className="text-red-700">🚨 {t('customer.emergency')}</b><span className="block text-xs text-gray-600">{t('customer.emergencyHelp')}</span></span>
            </label>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('customer.schedule')}</label>
              <input type="datetime-local" name="scheduledAt" className="w-full px-4 py-3 rounded-xl border border-gray-300" value={formData.scheduledAt} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-md text-lg disabled:opacity-70">
            {loading ? t('customer.searching') : t('customer.findWorkers')}
          </button>
        </form>
      </div>

      {results && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('customer.recommended')}</h2>
            <span className="text-sm bg-primary-50 text-primary-700 px-3 py-2 rounded-full font-semibold">{results.length} {t('customer.matches')}</span>
          </div>
          {results.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center border">{t('customer.noWorkers')}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((item, index) => (
                <WorkerCard
                  key={item.worker._id}
                  worker={item.worker}
                  scores={{ ...item.scores, explanation: item.explanation }}
                  distance={item.distance}
                  emergency={formData.emergency}
                  isTopMatch={index === 0}
                  cooperativeRate={currentPrice}
                  onRequestService={handleRequestService}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindService;
