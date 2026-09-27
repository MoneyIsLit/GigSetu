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

files['src/pages/customer/CustomerDashboard.jsx'] = `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import BookingCard from '../../components/BookingCard';
import api from '../../api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    loadBookings();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(\`/bookings/\${id}/status\`, { status });
      const res = await api.get('/bookings');
      setBookings(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('common.welcome')}, {user?.name}</h1>
      <p className="text-gray-600 mb-8">{t('auth.customerDesc')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Link to="/customer/find-service" className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1 block relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 text-6xl">🔍</div>
          <h2 className="text-2xl font-bold mb-2">{t('customer.findService')}</h2>
          <p className="text-primary-100">{t('landing.step1Desc')}</p>
        </Link>
        <Link to="/customer/bookings" className="bg-white rounded-xl p-8 text-gray-900 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 block relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl group-hover:text-primary-500 transition-colors">📅</div>
          <h2 className="text-2xl font-bold mb-2">{t('customer.myBookings')}</h2>
          <p className="text-gray-500">{t('booking.bookingHistory')}</p>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('customer.currentBooking')} / {t('admin.recentBookings')}</h2>
        {bookings.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">{t('booking.noBookings')}</p>
            <Link to="/customer/find-service" className="text-primary-600 font-medium hover:underline">{t('customer.findService')} &rarr;</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <BookingCard key={booking._id} booking={booking} userRole="customer" onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;`;

files['src/pages/customer/FindService.jsx'] = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import WorkerCard from '../../components/WorkerCard';
import toast from 'react-hot-toast';

const FindService = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ service: 'electrician', description: '', lat: '', lng: '' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUseDefaultLoc = () => {
    setFormData({ ...formData, lat: 12.9716, lng: 77.5946 });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const res = await api.post('/matching/recommend', {
        service: formData.service,
        lat: Number(formData.lat),
        lng: Number(formData.lng)
      });
      setResults(res.data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = async (worker) => {
    try {
      await api.post('/bookings', {
        workerId: worker._id,
        service: formData.service,
        description: formData.description,
        lat: Number(formData.lat),
        lng: Number(formData.lng)
      });
      toast.success(t('booking.bookingCreated'));
      navigate('/customer/bookings');
    } catch (err) {
      toast.error('Failed to create booking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('customer.findService')}</h1>
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('customer.serviceRequired')}</label>
              <select name="service" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none bg-white shadow-sm" value={formData.service} onChange={handleChange}>
                <option value="electrician">{t('services.electrician')}</option>
                <option value="plumber">{t('services.plumber')}</option>
                <option value="carpenter">{t('services.carpenter')}</option>
                <option value="cleaner">{t('services.cleaner')}</option>
                <option value="painter">{t('services.painter')}</option>
                <option value="applianceRepair">{t('services.applianceRepair')}</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">{t('common.location')} ({t('customer.enterCoordinates')})</label>
                <button type="button" onClick={handleUseDefaultLoc} className="text-xs text-primary-600 font-medium hover:underline bg-primary-50 px-2 py-1 rounded">{t('customer.useDefaultLocation')}</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="any" name="lat" required placeholder={t('common.latitude')} className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm outline-none" value={formData.lat} onChange={handleChange} />
                <input type="number" step="any" name="lng" required placeholder={t('common.longitude')} className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm outline-none" value={formData.lng} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('customer.description')}</label>
            <textarea name="description" required rows="3" placeholder={t('customer.descriptionPlaceholder')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm resize-none" value={formData.description} onChange={handleChange}></textarea>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-lg disabled:opacity-70">
            {loading ? <span className="flex justify-center items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {t('customer.searching')}</span> : t('customer.findWorkers')}
          </button>
        </form>
      </div>

      {results && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('customer.recommended')}</h2>
          {results.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-500">{t('customer.noWorkers')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((item, index) => (
                <WorkerCard key={item.worker._id} worker={item.worker} scores={item.scores} distance={item.distance} isTopMatch={index === 0} onRequestService={handleRequestService} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindService;`;

files['src/pages/customer/MyBookings.jsx'] = `import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import BookingCard from '../../components/BookingCard';
import { useSocket } from '../../context/SocketContext';

const MyBookings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const { notifications } = useSocket();

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [notifications]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(\`/bookings/\${id}/status\`, { status });
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('customer.myBookings')}</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4 text-lg">{t('booking.noBookings')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} userRole="customer" onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;`;

files['src/pages/worker/WorkerDashboard.jsx'] = `import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import BookingCard from '../../components/BookingCard';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const WorkerDashboard = () => {
  const { user, workerProfile } = useAuth();
  const { t } = useLanguage();
  const { notifications } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [avail, setAvail] = useState(workerProfile?.availability || 'available');

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.filter(b => ['requested', 'accepted', 'in_progress'].includes(b.status)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [notifications]);

  const handleAvailabilityChange = async (val) => {
    try {
      await api.patch(\`/workers/\${workerProfile._id}\`, { availability: val });
      setAvail(val);
      toast.success(t('common.success'));
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(\`/bookings/\${id}/status\`, { status });
      loadBookings();
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (!workerProfile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {workerProfile.verificationStatus !== 'verified' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{t('worker.pendingMessage')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('worker.workerPortal')}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">{t('worker.setAvailability')}</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleAvailabilityChange('available')} className={\`px-6 py-2 rounded-full font-medium transition-colors \${avail === 'available' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>
            {t('worker.available')}
          </button>
          <button onClick={() => handleAvailabilityChange('partially_available')} className={\`px-6 py-2 rounded-full font-medium transition-colors \${avail === 'partially_available' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>
            {t('worker.partiallyAvailable')}
          </button>
          <button onClick={() => handleAvailabilityChange('unavailable')} className={\`px-6 py-2 rounded-full font-medium transition-colors \${avail === 'unavailable' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>
            {t('worker.unavailable')}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('worker.activeJobs')}</h2>
      
      {bookings.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-10 text-center border border-dashed border-gray-300">
          <p className="text-gray-500">{t('worker.noJobs')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} userRole="worker" onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;`;

files['src/pages/worker/MyJobs.jsx'] = `import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import BookingCard from '../../components/BookingCard';

const MyJobs = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('worker.myJobs')}</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4 text-lg">{t('booking.noBookings')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} userRole="worker" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;`;

files['src/pages/worker/WorkerProfile.jsx'] = `import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const WorkerProfile = () => {
  const { workerProfile } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    skills: '', experience: 0, lat: '', lng: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workerProfile) {
      setFormData({
        skills: workerProfile.skills?.join(', ') || '',
        experience: workerProfile.experience || 0,
        lat: workerProfile.location?.coordinates[1] || '',
        lng: workerProfile.location?.coordinates[0] || ''
      });
    }
  }, [workerProfile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(\`/workers/\${workerProfile._id}\`, {
        skills: formData.skills.split(',').map(s => s.trim()),
        experience: Number(formData.experience),
        location: { type: 'Point', coordinates: [Number(formData.lng), Number(formData.lat)] }
      });
      toast.success(t('common.success'));
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary-600 py-6 px-8 text-white">
          <h1 className="text-2xl font-bold">{t('worker.updateProfile')}</h1>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('worker.skills')} (Comma separated)</label>
              <input type="text" name="skills" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.skills} onChange={handleChange} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('worker.experience')} (Years)</label>
              <input type="number" name="experience" min="0" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.experience} onChange={handleChange} />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('common.location')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="any" name="lat" required placeholder={t('common.latitude')} className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none" value={formData.lat} onChange={handleChange} />
                <input type="number" step="any" name="lng" required placeholder={t('common.longitude')} className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none" value={formData.lng} onChange={handleChange} />
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-70">
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;`;

Object.keys(files).forEach(file => {
  writeFile(file, files[file]);
});
console.log('Done script 4');
