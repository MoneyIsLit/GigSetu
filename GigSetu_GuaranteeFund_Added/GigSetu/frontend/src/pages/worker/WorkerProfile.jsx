import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const KNOWN_LOCALITIES = [
  'Koramangala', 'Indiranagar', 'Jayanagar', 'Basavanagudi', 'HSR Layout',
  'Malleshwaram', 'Whitefield', 'Marathahalli', 'BTM Layout', 'Rajajinagar',
  'Central Bengaluru', 'Yelahanka', 'Electronic City'
];

const WorkerProfile = () => {
  const { workerProfile } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ skills: '', experienceYears: 0, latitude: '', longitude: '', locality: '', hourlyRate: '', certifications: '' });
  const [localitySelect, setLocalitySelect] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workerProfile) {
      const locality = workerProfile.locality || '';
      setLocalitySelect(locality && KNOWN_LOCALITIES.includes(locality) ? locality : (locality ? 'Other' : ''));
      setFormData({
      skills: workerProfile.skills?.join(', ') || '',
      experienceYears: workerProfile.experienceYears || 0,
      latitude: workerProfile.latitude ?? '',
      longitude: workerProfile.longitude ?? '',
      locality,
      hourlyRate: workerProfile.hourlyRate ?? '',
      certifications: workerProfile.certifications?.join(', ') || ''
      });
    }
  }, [workerProfile]);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/workers/${workerProfile._id}`, {
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: Number(formData.experienceYears),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        locality: formData.locality.trim(),
        hourlyRate: Number(formData.hourlyRate) || 0,
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean)
      });
      toast.success(t('common.success'));
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
    finally { setLoading(false); }
  };

  if (!workerProfile) return <div className="p-8">{t('common.loading')}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="bg-primary-600 p-6 text-white">
          <h1 className="text-2xl font-bold">{t('worker.updateProfile')}</h1>
          <p className="text-primary-100">{workerProfile.user?.name || ''} · {workerProfile.service}</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block font-semibold mb-2">{t('worker.skills')}</label>
            <input required value={formData.skills} onChange={e => setFormData({...formData, skills:e.target.value})} className="w-full border rounded-lg px-4 py-3" placeholder="fan repair, wiring, installation" />
          </div>
          <div>
            <label className="block font-semibold mb-2">{t('welfare.certifications')}</label>
            <input value={formData.certifications} onChange={e => setFormData({...formData, certifications:e.target.value})} className="w-full border rounded-lg px-4 py-3" placeholder="Electrical Safety, Home Wiring" />
          </div>
          <div>
            <label className="block font-semibold mb-2">{t('worker.experience')} (Years)</label>
            <input type="number" min="0" required value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears:e.target.value})} className="w-full border rounded-lg px-4 py-3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="any" required value={formData.latitude} onChange={e => setFormData({...formData, latitude:e.target.value})} placeholder={t('common.latitude')} className="border rounded-lg px-4 py-3" />
            <input type="number" step="any" required value={formData.longitude} onChange={e => setFormData({...formData, longitude:e.target.value})} placeholder={t('common.longitude')} className="border rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Locality</label>
            <select
              required
              value={localitySelect}
              onChange={e => {
                const val = e.target.value;
                setLocalitySelect(val);
                setFormData({ ...formData, locality: val === 'Other' ? '' : val });
              }}
              className="w-full border rounded-lg px-4 py-3 bg-white"
            >
              <option value="" disabled>Select your locality</option>
              {KNOWN_LOCALITIES.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              <option value="Other">Other (type below)</option>
            </select>
            {localitySelect === 'Other' && (
              <input
                required
                value={formData.locality}
                onChange={e => setFormData({ ...formData, locality: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 mt-2"
                placeholder="Enter your locality name"
              />
            )}
          </div>
          <div>
            <label className="block font-semibold mb-2">Your indicated hourly rate (₹, for transparency comparison only)</label>
            <input type="number" min="0" required value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate:e.target.value})} className="w-full border rounded-lg px-4 py-3" placeholder="500" />
            <p className="text-xs text-gray-500 mt-1">Customers still pay the fixed cooperative rate — this is only used for the cooperative's locality price comparison view.</p>
          </div>
          <button disabled={loading} className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg disabled:opacity-50">{loading ? t('common.loading') : t('common.save')}</button>
        </form>
      </div>
    </div>
  );
};

export default WorkerProfile;
