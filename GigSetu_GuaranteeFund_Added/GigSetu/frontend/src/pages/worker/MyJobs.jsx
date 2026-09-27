import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import BookingCard from '../../components/BookingCard';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);

  // Per-booking upload state: { [bookingId]: { uploading, progress, error } }
  const [uploadState, setUploadState] = useState({});

  const loadBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load jobs');
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // ── Generic status update (accept / reject / cancel) ────────────────────
  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      await loadBookings();
      toast.success(`Booking ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  // ── Helper: send a multipart/form-data PATCH with upload progress ────────
  const patchWithPhoto = async (bookingId, endpoint, fieldName, file) => {
    setUploadState(prev => ({
      ...prev,
      [bookingId]: { uploading: true, progress: 0, error: null },
    }));

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      await api.patch(`/bookings/${bookingId}/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          setUploadState(prev => ({
            ...prev,
            [bookingId]: { ...prev[bookingId], progress: pct },
          }));
        },
      });

      setUploadState(prev => ({
        ...prev,
        [bookingId]: { uploading: false, progress: 100, error: null },
      }));
      await loadBookings();
      toast.success(endpoint === 'start' ? 'Job started!' : 'Job completed! 🎉');
    } catch (err) {
      const msg = err.response?.data?.message || t('common.error');
      const isBlurry = err.response?.data?.blurryPhoto;

      setUploadState(prev => ({
        ...prev,
        [bookingId]: { uploading: false, progress: 0, error: msg },
      }));

      if (isBlurry) {
        toast.error('📷 Photo is too blurry — please retake in better lighting');
      } else {
        toast.error(msg);
      }
    }
  };

  // ── onStart: optional before photo → /start ──────────────────────────────
  const handleStart = (bookingId, file) => {
    patchWithPhoto(bookingId, 'start', 'before', file);
  };

  // ── onFinish: mandatory after photo → /finish ────────────────────────────
  const handleFinish = (bookingId, file) => {
    patchWithPhoto(bookingId, 'finish', 'after', file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('worker.myJobs')}</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4 text-lg">{t('booking.noBookings')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => {
            const us = uploadState[booking._id] || {};
            return (
              <BookingCard
                key={booking._id}
                booking={booking}
                userRole="worker"
                onStatusUpdate={handleStatusUpdate}
                onStart={handleStart}
                onFinish={handleFinish}
                uploading={us.uploading || false}
                uploadProgress={us.progress || 0}
                uploadError={us.error || null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
