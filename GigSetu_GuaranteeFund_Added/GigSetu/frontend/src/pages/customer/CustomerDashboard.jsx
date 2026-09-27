import React, { useState, useEffect } from 'react';
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
      await api.patch(`/bookings/${id}/status`, { status });
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
          <p className="text-gray-500">{t('customer.bookingHistory')}</p>
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

export default CustomerDashboard;
