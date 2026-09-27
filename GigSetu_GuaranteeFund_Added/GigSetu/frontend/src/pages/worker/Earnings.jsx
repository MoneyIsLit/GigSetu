import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const Earnings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings')
      .then(res => setBookings(res.data))
      .catch(err => toast.error(err.response?.data?.message || t('common.error')))
      .finally(() => setLoading(false));
  }, []);

  const completed = bookings.filter(b => b.status === 'completed');
  const paid = completed.filter(b => b.paymentStatus === 'paid');
  const pending = completed.filter(b => b.paymentStatus !== 'paid');

  const workerShare = (amount) => Number((Number(amount || 0) * 0.90).toFixed(2));
  const totalPaidEarnings = paid.reduce((sum, b) => sum + workerShare(b.amount), 0);
  const totalPendingEarnings = pending.reduce((sum, b) => sum + workerShare(b.amount), 0);

  const now = new Date();
  const thisMonthPaid = paid.filter(b => {
    const d = new Date(b.completedAt || b.updatedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthEarnings = thisMonthPaid.reduce((sum, b) => sum + workerShare(b.amount), 0);

  const exportCsv = () => {
    const rows = [
      ['Booking ID', 'Service', 'Date', 'Payment Status', 'Total Amount (INR)', 'Your Earnings (90%, INR)'],
      ...completed.map(b => [
        b._id,
        b.service,
        new Date(b.completedAt || b.createdAt).toLocaleDateString(),
        b.paymentStatus,
        b.amount || 0,
        workerShare(b.amount)
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gigsetu-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">💰 Earnings & Payouts</h1>
        <button onClick={exportCsv} disabled={!completed.length} className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-40">Export CSV</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">This month's earnings</p>
          <p className="text-3xl font-black text-green-600">₹{thisMonthEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Total paid out</p>
          <p className="text-3xl font-black">₹{totalPaidEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-gray-500 text-sm">Awaiting customer payment</p>
          <p className="text-3xl font-black text-yellow-600">₹{totalPendingEarnings.toFixed(2)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">Your earnings are 90% of the fixed cooperative price; the remaining 10% funds the cooperative.</p>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-5 bg-gray-50 border-b"><h2 className="font-bold">Completed jobs</h2></div>
        {!completed.length ? (
          <div className="p-8 text-center text-gray-500">No completed jobs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-4 text-left">Service</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Your earnings</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(b => (
                  <tr key={b._id} className="border-t text-sm">
                    <td className="p-4 font-semibold">{t(`services.${String(b.service).toLowerCase()}`) || b.service}</td>
                    <td className="p-4">{new Date(b.completedAt || b.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {b.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">₹{b.amount || 0}</td>
                    <td className="p-4 text-right font-bold">₹{workerShare(b.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
