import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import BookingCard from '../../components/BookingCard';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const WorkerDashboard = () => {
  const { workerProfile } = useAuth();
  const { t } = useLanguage();
  const { notifications } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [avail, setAvail] = useState(workerProfile?.availability || 'available');

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.filter(b => ['requested', 'accepted', 'in_progress'].includes(b.status)));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadBookings(); }, [notifications]);
  useEffect(() => { setAvail(workerProfile?.availability || 'available'); }, [workerProfile]);

  const handleAvailabilityChange = async val => {
    try {
      await api.patch(`/workers/${workerProfile._id}`, { availability: val });
      setAvail(val);
      toast.success(t('common.success'));
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await api.patch(`/bookings/${id}/status`, { status }); await loadBookings(); toast.success(t('common.success')); }
    catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  if (!workerProfile) return <div className="p-8">{t('common.loading')}</div>;

  const verified = workerProfile.verified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!verified && <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 rounded-xl">⚠️ {t('worker.pendingMessage')}</div>}

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('worker.workerPortal')}</h1>
          <p className="text-gray-500">{workerProfile.service} · {workerProfile.experienceYears || 0} {t('common.yearsExp')}</p>
        </div>
        <span className={`self-start px-4 py-2 rounded-full font-bold ${verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {verified ? `✓ ${t('worker.verified')}` : `⏳ ${t('worker.pending')}`}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border"><p className="text-gray-500 text-sm">{t('worker.currentWorkload')}</p><p className="text-3xl font-black">{workerProfile.workload || 0}</p></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border"><p className="text-gray-500 text-sm">{t('worker.rating')}</p><p className="text-3xl font-black">⭐ {Number(workerProfile.rating || 0).toFixed(1)}</p></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border"><p className="text-gray-500 text-sm">{t('worker.completedJobs')}</p><p className="text-3xl font-black">{workerProfile.completedJobs || 0}</p></div>
        <div className="bg-white rounded-xl p-5 shadow-sm border"><p className="text-gray-500 text-sm">{t('worker.availability')}</p><p className="text-lg font-bold mt-2">{t(`worker.${avail}`)}</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">{t('worker.setAvailability')}</h3>
        <div className="flex flex-wrap gap-3">
          {['available','partially_available','unavailable'].map(value => (
            <button key={value} onClick={() => handleAvailabilityChange(value)} className={`px-6 py-3 rounded-full font-bold ${avail === value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {t(`worker.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold mb-3">🛡️ {t('welfare.title')}</h3>
          <p className="text-sm mb-2">{t('welfare.insurance')}: <b>{workerProfile.welfare?.insuranceStatus || 'Demo status'}</b></p>
          <p className="text-sm mb-2">{t('welfare.fund')}: <b>{workerProfile.welfare?.welfareFundStatus || 'Eligible'}</b></p>
          <p className="text-sm">{t('welfare.safety')}: <b>{workerProfile.welfare?.safetyTraining || 'Pending'}</b></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-bold mb-3">🏅 {t('welfare.certifications')}</h3>
          {workerProfile.certifications?.length ? workerProfile.certifications.map(c => <span key={c} className="inline-block bg-primary-50 text-primary-700 px-3 py-2 rounded-full text-sm mr-2 mb-2">✓ {c}</span>) : <p className="text-gray-500 text-sm">{t('welfare.none')}</p>}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('worker.activeJobs')}</h2>
      {!bookings.length ? <div className="bg-gray-50 rounded-xl p-10 text-center border border-dashed">{t('worker.noJobs')}</div> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{bookings.map(b => <BookingCard key={b._id} booking={b} userRole="worker" onStatusUpdate={handleStatusUpdate} />)}</div>}
    </div>
  );
};

export default WorkerDashboard;
