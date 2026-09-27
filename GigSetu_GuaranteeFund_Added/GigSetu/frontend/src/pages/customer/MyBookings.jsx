import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import BookingCard from '../../components/BookingCard';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});

  const load = async () => {
    try { setBookings((await api.get('/bookings')).data); }
    catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/bookings/${id}/status`, { status }); await load(); }
    catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const pay = async booking => {
    try {
      await api.post(`/bookings/${booking._id}/pay`, {});
      toast.success(t('payment.success'));
      load();
    } catch (err) { toast.error(err.response?.data?.message || t('payment.failed')); }
  };

  const rate = async booking => {
    try {
      await api.post(`/bookings/${booking._id}/rating`, { rating: Number(ratings[booking._id]), feedback: feedback[booking._id] || '' });
      toast.success(t('rating.thanks'));
      load();
    } catch (err) { toast.error(err.response?.data?.message || t('rating.failed')); }
  };

  const printInvoice = async booking => {
    try {
      const invoice = (await api.get(`/bookings/${booking._id}/invoice`)).data;
      const win = window.open('', '_blank', 'width=760,height=700');
      win.document.write(`
        <html><head><title>${invoice.invoiceNumber}</title>
        <style>body{font-family:Arial;padding:40px;color:#1f2937}h1{color:#15803d}.box{border:1px solid #ddd;padding:20px;border-radius:12px}.row{display:flex;justify-content:space-between;margin:10px 0}</style>
        </head><body><h1>GIGSETU</h1><p>Local Work. Fairly Distributed.</p>
        <div class="box"><h2>Service Invoice</h2>
        <div class="row"><b>Invoice</b><span>${invoice.invoiceNumber}</span></div>
        <div class="row"><b>Customer</b><span>${invoice.customer?.name || ''}</span></div>
        <div class="row"><b>Worker</b><span>${invoice.worker?.name || ''}</span></div>
        <div class="row"><b>Service</b><span>${invoice.service}</span></div>
        <div class="row"><b>Amount</b><span>₹${invoice.amount}</span></div>
        <div class="row"><b>Worker earnings (90%)</b><span>₹${invoice.workerEarnings}</span></div>
        <div class="row"><b>Cooperative contribution (10%)</b><span>₹${invoice.cooperativeShare}</span></div>
        <div class="row"><b>Payment</b><span>${invoice.paymentStatus} · ${invoice.paymentMethod}</span></div>
        </div><script>window.print()</script></body></html>`);
      win.document.close();
    } catch (err) { toast.error(err.response?.data?.message || t('invoice.failed')); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('customer.myBookings')}</h1>
      {!bookings.length ? <div className="bg-gray-50 rounded-xl p-12 text-center">{t('booking.noBookings')}</div> :
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bookings.map(booking => (
          <div key={booking._id}>
            <BookingCard booking={booking} userRole="customer" onStatusUpdate={updateStatus} />
            {booking.status === 'completed' && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3 shadow-sm">
                {booking.paymentStatus !== 'paid' ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <span className="flex-1 font-semibold text-gray-700">{t('payment.amount')}: ₹{booking.amount}</span>
                    <button onClick={() => pay(booking)} className="bg-primary-600 text-white px-5 py-2 rounded-lg font-bold">{t('payment.payNow')}</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="bg-green-50 text-green-700 px-3 py-2 rounded-lg font-semibold">✓ {t('payment.paid')}</span>
                    <button onClick={() => printInvoice(booking)} className="border border-primary-600 text-primary-700 px-4 py-2 rounded-lg font-semibold">{t('invoice.view')}</button>
                  </div>
                )}
                {!booking.rating ? (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold mb-2">{t('rating.title')}</p>
                    <div className="flex gap-2 mb-2">{[1,2,3,4,5].map(n => <button key={n} type="button" onClick={() => setRatings({ ...ratings, [booking._id]: n })} className={`text-2xl ${Number(ratings[booking._id]) >= n ? '' : 'opacity-30'}`}>★</button>)}</div>
                    <textarea placeholder={t('rating.feedback')} value={feedback[booking._id] || ''} onChange={e => setFeedback({ ...feedback, [booking._id]: e.target.value })} className="w-full border rounded-lg p-2 mb-2" rows="2" />
                    <button onClick={() => rate(booking)} disabled={!ratings[booking._id]} className="bg-gray-900 text-white px-4 py-2 rounded-lg disabled:opacity-40">{t('rating.submit')}</button>
                  </div>
                ) : <p className="mt-3 text-sm text-gray-600">⭐ {booking.rating}/5 {booking.feedback ? `— ${booking.feedback}` : ''}</p>}
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
};

export default MyBookings;
