import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';

const SERVICES = [
  ['electrician', 'Electrician'], ['plumber', 'Plumber'], ['carpenter', 'Carpenter'],
  ['cleaner', 'Cleaner'], ['painter', 'Painter'], ['gardener', 'Gardener'],
  ['appliancerepair', 'Appliance Repair'], ['delivery', 'Delivery'],
  ['farmworker', 'Farm Worker'], ['otherservices', 'Other Services']
];

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({});
  const [workers, setWorkers] = useState([]);
  const [fairness, setFairness] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [federation, setFederation] = useState(null);
  const [prices, setPrices] = useState([]);
  const [selectedService, setSelectedService] = useState('electrician');
  const [comparison, setComparison] = useState(null);
  const [savingPrice, setSavingPrice] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [flaggedBookings, setFlaggedBookings] = useState([]);
  const [clearingFlag, setClearingFlag] = useState('');
  const [fund, setFund] = useState(null);
  const [disputable, setDisputable] = useState([]);
  const [disputeForm, setDisputeForm] = useState({ bookingId: '', disputeType: 'worker_fault', payoutAmount: '' });
  const [filingDispute, setFilingDispute] = useState(false);

  const load = async () => {
    try {
      const [s, w, f, d, fd, a, bkgs, gf, disp] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/workers'), api.get('/admin/fairness'),
        api.get('/admin/demand-forecast'), api.get('/admin/federation'), api.get('/admin/analytics'),
        api.get('/bookings'), api.get('/admin/guarantee-fund'), api.get('/admin/disputable-bookings'),
      ]);
      setStats(s.data); setWorkers(w.data); setFairness(f.data); setForecast(d.data); setFederation(fd.data); setAnalytics(a.data);
      setFund(gf.data);
      setDisputable(disp.data);

      // Filter bookings that were flagged by the CNN verifier.
      const flagged = (bkgs.data || []).filter(b => b.proofPhotos?.flagged === true);
      setFlaggedBookings(flagged);
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const loadPricing = async (service = selectedService) => {
    try {
      const [p, c] = await Promise.all([
        api.get('/pricing'),
        api.get(`/pricing/comparison/localities?service=${encodeURIComponent(service)}`)
      ]);
      setPrices(p.data);
      setComparison(c.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load pricing');
    }
  };

  useEffect(() => { load(); loadPricing('electrician'); }, []);
  useEffect(() => { loadPricing(selectedService); }, [selectedService]);

  const verify = async (id, verified) => {
    try {
      await api.patch(`/workers/${id}/verify`, { verified });
      toast.success(t('common.success'));
      load();
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const updatePrice = async (service, hourlyRate) => {
    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate < 0) return toast.error('Enter a valid hourly price');
    try {
      setSavingPrice(service);
      await api.patch(`/pricing/${service}`, { hourlyRate: rate });
      toast.success(`${service} price updated by Cooperative Leader`);
      await loadPricing(selectedService);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Only the Cooperative Leader can change prices');
    } finally { setSavingPrice(''); }
  };

  const clearFlag = async (bookingId) => {
    try {
      setClearingFlag(bookingId);
      await api.patch(`/bookings/${bookingId}/clear-flag`);
      toast.success('Flag cleared — booking marked as reviewed');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setClearingFlag('');
    }
  };

  const DISPUTE_LABELS = {
    worker_fault: "Worker's fault",
    platform_matching_fault: "Platform matching fault",
    property_damage: "Property damage",
  };

  const fileDispute = async () => {
    if (!disputeForm.bookingId) return toast.error('Select a booking first');
    try {
      setFilingDispute(true);
      await api.patch(`/bookings/${disputeForm.bookingId}/dispute`, {
        disputeType: disputeForm.disputeType,
        payoutAmount: Number(disputeForm.payoutAmount) || 0,
      });
      toast.success('Dispute recorded');
      setDisputeForm({ bookingId: '', disputeType: 'worker_fault', payoutAmount: '' });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setFilingDispute(false);
    }
  };

  const filtered = workers.filter(w => filter === 'all' || (filter === 'pending' ? !w.verified : w.verified));
  const priceMap = Object.fromEntries(prices.map(p => [p.service, p.hourlyRate]));
  const localityA = comparison?.localities?.[0];
  const localityB = comparison?.localities?.[1];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.cooperativeDashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        <StatCard icon="👥" title={t('admin.totalWorkers')} value={stats.totalWorkers || 0} />
        <StatCard icon="✅" title={t('admin.verifiedWorkers')} value={stats.verifiedWorkers || 0} />
        <StatCard icon="⏳" title={t('admin.pendingWorkers')} value={stats.pendingWorkers || 0} />
        <StatCard icon="👤" title={t('admin.customers')} value={stats.totalCustomers || 0} />
        <StatCard icon="📋" title={t('admin.totalBookings')} value={stats.totalBookings || 0} />
        <StatCard icon="🔨" title={t('admin.activeJobs')} value={stats.activeBookings || 0} />
        <StatCard icon="✓" title={t('admin.completedJobs')} value={stats.completedBookings || 0} />
      </div>

      <section className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold">💰 Fixed Cooperative Pricing</h2>
            <p className="text-sm text-gray-500">One transparent hourly price per service category. Only the Cooperative Leader can edit these rates.</p>
          </div>
          <span className="px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold">🔐 Leader Controlled</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map(([service, label]) => (
            <div key={service} className="border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">{label}</span>
                <span className="text-xs text-gray-500">INR / hour</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number" min="0" step="10"
                  defaultValue={priceMap[service] ?? ''}
                  key={`${service}-${priceMap[service] ?? 'empty'}`}
                  id={`price-${service}`}
                  className="w-full px-3 py-2 rounded-lg border bg-white"
                />
                <button
                  onClick={() => updatePrice(service, document.getElementById(`price-${service}`).value)}
                  disabled={savingPrice === service}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white font-bold disabled:opacity-60"
                >{savingPrice === service ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold">📍 Locality Price Comparison</h2>
            <p className="text-sm text-gray-500">Compare indicative worker rates across two different localities. The customer still pays the fixed cooperative rate above.</p>
          </div>
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="px-4 py-2 rounded-lg border bg-white font-semibold">
            {SERVICES.map(([service, label]) => <option key={service} value={service}>{label}</option>)}
          </select>
        </div>

        <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div><span className="text-sm text-gray-600">Fixed cooperative price</span><div className="text-2xl font-black">₹{comparison?.cooperativeHourlyRate || priceMap[selectedService] || 0} / hour</div></div>
          <div className="text-sm text-gray-600">Service: <b>{SERVICES.find(x => x[0] === selectedService)?.[1]}</b></div>
        </div>

        {localityA && localityB ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[localityA, localityB].map((loc, index) => (
              <div key={loc.locality} className="border rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">{index === 0 ? 'Area A' : 'Area B'} — {loc.locality}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{loc.workerCount} workers</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-2"><div className="text-xs text-gray-500">Average</div><b>₹{loc.averageHourlyRate}</b></div>
                  <div className="bg-gray-50 rounded-lg p-2"><div className="text-xs text-gray-500">Lowest</div><b>₹{loc.minHourlyRate}</b></div>
                  <div className="bg-gray-50 rounded-lg p-2"><div className="text-xs text-gray-500">Highest</div><b>₹{loc.maxHourlyRate}</b></div>
                </div>
                <div className="space-y-2">
                  {loc.workers.map(w => <div key={w.workerId} className="flex justify-between items-center border-t pt-2 text-sm"><span className="font-semibold">{w.name}</span><span>₹{w.hourlyRate}/hr</span></div>)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-5 text-sm text-yellow-800">This service currently has workers in fewer than two localities. Add/verify workers in another locality to compare Area A and Area B.</div>
        )}
      </section>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-8">
        <div className="p-5 bg-gray-50 border-b flex flex-wrap gap-2 items-center justify-between">
          <h2 className="text-xl font-bold">{t('admin.workerVerification')}</h2>
          <div className="flex gap-2">
            {['all','pending','verified'].map(x => <button key={x} onClick={() => setFilter(x)} className={`px-3 py-2 rounded-full text-sm font-bold ${filter === x ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>{x === 'all' ? t('admin.allWorkers') : x === 'pending' ? t('admin.pendingOnly') : t('admin.verifiedOnly')}</button>)}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4 text-left">{t('admin.workerName')}</th><th className="p-4 text-left">{t('admin.serviceType')}</th><th className="p-4 text-left">{t('admin.experienceYears')}</th><th className="p-4 text-left">Rating</th><th className="p-4 text-left">Workload</th><th className="p-4 text-left">Locality</th><th className="p-4 text-left">{t('admin.status')}</th><th className="p-4 text-right">{t('common.actions')}</th></tr></thead>
            <tbody>
              {filtered.map(w => <tr key={w._id} className="border-t">
                <td className="p-4 font-semibold">{w.user?.name || '—'}</td>
                <td className="p-4">{t(`services.${String(w.service).toLowerCase()}`)}</td>
                <td className="p-4">{w.experienceYears || 0}</td>
                <td className="p-4">⭐ {Number(w.rating || 0).toFixed(1)}</td>
                <td className="p-4">{w.workload || 0}</td>
                <td className="p-4">{w.locality || '—'}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${w.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.verified ? t('worker.verified') : t('worker.pending')}</span></td>
                <td className="p-4 text-right">{!w.verified && <button onClick={() => verify(w._id, true)} className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold mr-2">{t('admin.verifyWorker')}</button>}{w.verified && <button onClick={() => verify(w._id, false)} className="bg-red-50 text-red-700 px-3 py-2 rounded-lg font-bold">{t('admin.rejectWorker')}</button>}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {federation && <section className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div><h2 className="text-xl font-bold">🤝 {t('admin.federationAdministration')}</h2><p className="text-sm text-gray-500">{federation.federationName}</p></div>
          <span className="px-3 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-bold">{t('admin.cooperativeGovernance')}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <StatCard icon="👷" title={t('admin.federationWorkers')} value={federation.administration.workers} />
          <StatCard icon="✅" title={t('admin.admittedWorkers')} value={federation.administration.verifiedWorkers} />
          <StatCard icon="⏳" title={t('admin.pendingAdmissions')} value={federation.administration.pendingWorkers} />
          <StatCard icon="🧑‍🤝‍🧑" title={t('admin.federationCustomers')} value={federation.administration.customers} />
          <StatCard icon="🛡️" title={t('admin.welfareEligible')} value={federation.welfare.eligibleWorkers} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl bg-gray-50 p-4"><h3 className="font-bold mb-2">{t('admin.admissionGovernance')}</h3><p className="text-sm text-gray-600">{federation.governance.verificationProcess}</p><p className="text-sm text-gray-600 mt-1">{federation.governance.allocationPolicy}</p></div>
          <div className="rounded-xl bg-gray-50 p-4"><h3 className="font-bold mb-2">{t('admin.serviceCoverage')}</h3><div className="flex flex-wrap gap-2">{federation.serviceCoverage.map(x => <span key={x.service} className="px-3 py-1 rounded-full bg-white border text-sm">{t(`services.${x.service}`) || x.service}: <b>{x.workers}</b></span>)}</div></div>
        </div>
      </section>}

      {analytics && (
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold mb-1">📊 Cooperative Analytics</h2>
          <p className="text-sm text-gray-500 mb-5">Booking activity, fairness score spread, and workers who may be under-matched relative to peers.</p>

          <div className="mb-8">
            <h3 className="font-bold mb-3">Bookings — last 14 days</h3>
            <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-2">
              {analytics.bookingsOverTime.map(day => {
                const maxTotal = Math.max(1, ...analytics.bookingsOverTime.map(d => d.total));
                const h = (n) => Math.max(2, Math.round((n / maxTotal) * 120));
                return (
                  <div key={day.date} className="flex flex-col items-center justify-end min-w-[26px]" title={`${day.date}: ${day.total} bookings`}>
                    <div className="flex flex-col-reverse w-4 rounded-sm overflow-hidden">
                      <div style={{ height: `${h(day.completed)}px` }} className="bg-green-500" />
                      <div style={{ height: `${h(day.requested)}px` }} className="bg-blue-400" />
                      <div style={{ height: `${h(day.cancelled)}px` }} className="bg-red-400" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 rotate-0">{day.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span><span className="inline-block w-2.5 h-2.5 bg-blue-400 rounded-sm mr-1"></span>In progress</span>
              <span><span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-sm mr-1"></span>Completed</span>
              <span><span className="inline-block w-2.5 h-2.5 bg-red-400 rounded-sm mr-1"></span>Cancelled</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-3">Fairness score distribution</h3>
              <div className="space-y-2">
                {analytics.fairnessDistribution.map(bucket => {
                  const maxCount = Math.max(1, ...analytics.fairnessDistribution.map(b => b.count));
                  return (
                    <div key={bucket.label} className="flex items-center gap-3 text-sm">
                      <span className="w-16 text-gray-500">{bucket.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3"><div className="bg-primary-500 h-3 rounded-full" style={{ width: `${(bucket.count / maxCount) * 100}%` }} /></div>
                      <span className="w-6 text-right font-semibold">{bucket.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">⚠️ Under-served workers</h3>
              <p className="text-xs text-gray-500 mb-3">Verified, rated 4★+, but below {Math.round(analytics.averageWorkload * 0.5 * 10) / 10} active jobs (half the cooperative average of {analytics.averageWorkload}).</p>
              {analytics.underservedWorkers.length ? (
                <div className="space-y-2">
                  {analytics.underservedWorkers.map(w => (
                    <div key={w.workerId} className="flex justify-between items-center border rounded-lg p-2 text-sm">
                      <span><b>{w.name}</b> · {w.service} · {w.locality || '—'}</span>
                      <span>⭐ {Number(w.rating).toFixed(1)} · {w.workload} active</span>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">No workers currently flagged as under-served.</div>}
            </div>
          </div>
        </section>
      )}
      {flaggedBookings.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-red-700">
                ⚠️ Flagged Bookings ({flaggedBookings.length})
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                These jobs were marked suspicious by the AI verifier — before &amp; after photos look nearly identical,
                suggesting work may not have been done. Review and clear the flag once satisfied.
              </p>
            </div>
            <span className="px-3 py-2 rounded-full bg-red-100 text-red-700 text-sm font-bold">
              🔍 Needs Review
            </span>
          </div>

          <div className="space-y-6">
            {flaggedBookings.map(b => {
              const workerName = b.worker?.name || b.workerProfile?.name || '—';
              const customerName = b.customer?.name || '—';
              const score = b.proofPhotos?.verificationScore;
              const serviceKey = String(b.service || '').toLowerCase();

              return (
                <div key={b._id} className="border border-red-100 rounded-xl p-5 bg-red-50/30">
                  {/* ── Meta ── */}
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                    <div>
                      <div className="font-bold text-gray-900">
                        {t(`services.${serviceKey}`) || b.service}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        Worker: <b>{workerName}</b> · Customer: <b>{customerName}</b>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Completed: {b.completedAt ? new Date(b.completedAt).toLocaleString() : '—'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {score != null && (
                        <div className="text-sm">
                          CNN similarity:{' '}
                          <b className="text-red-600">
                            {(score * 100).toFixed(1)}%
                          </b>
                          <span className="ml-1 text-xs text-gray-500">(threshold: 92%)</span>
                        </div>
                      )}
                      <button
                        onClick={() => clearFlag(b._id)}
                        disabled={clearingFlag === b._id}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold disabled:opacity-60"
                      >
                        {clearingFlag === b._id ? 'Clearing…' : '✅ Clear Flag'}
                      </button>
                    </div>
                  </div>

                  {/* ── Before / After photos ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">📷 Before photo</p>
                      {b.proofPhotos?.beforeUrl ? (
                        <a href={b.proofPhotos.beforeUrl} target="_blank" rel="noreferrer">
                          <img
                            src={b.proofPhotos.beforeUrl}
                            alt="Before"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                          No before photo
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">✅ After photo</p>
                      {b.proofPhotos?.afterUrl ? (
                        <a href={b.proofPhotos.afterUrl} target="_blank" rel="noreferrer">
                          <img
                            src={b.proofPhotos.afterUrl}
                            alt="After"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                          No after photo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {fund && (
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold">🛡️ Cooperative Guarantee Fund</h2>
              <p className="text-sm text-gray-500">
                2% of every paid booking is set aside here. Simulated ledger — no real money moves.
              </p>
            </div>
            <span className="px-3 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
              Balance: ₹{fund.totalPool.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="text-xs text-gray-500">Total contributions</div>
              <div className="text-lg font-bold">₹{fund.totalContributions.toLocaleString()}</div>
            </div>
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="text-xs text-gray-500">Total payouts</div>
              <div className="text-lg font-bold">₹{fund.totalPayouts.toLocaleString()}</div>
            </div>
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="text-xs text-gray-500">Current pool</div>
              <div className="text-lg font-bold">₹{fund.totalPool.toLocaleString()}</div>
            </div>
          </div>

          {fund.payoutsByType.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-sm">Payouts by dispute type</h3>
              <div className="space-y-2">
                {fund.payoutsByType.map(p => {
                  const maxTotal = Math.max(...fund.payoutsByType.map(x => x.total), 1);
                  return (
                    <div key={p.disputeType} className="flex items-center gap-3 text-sm">
                      <span className="w-40 text-gray-500">{DISPUTE_LABELS[p.disputeType] || p.disputeType}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ width: `${(p.total / maxTotal) * 100}%` }} />
                      </div>
                      <span className="w-24 text-right font-semibold">₹{p.total.toLocaleString()} ({p.count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t pt-5">
            <h3 className="font-bold mb-3 text-sm">Raise a dispute on a completed booking</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={disputeForm.bookingId}
                onChange={e => setDisputeForm({ ...disputeForm, bookingId: e.target.value })}
                className="px-3 py-2 rounded-lg border bg-white md:col-span-2"
              >
                <option value="">Select a completed booking…</option>
                {disputable.map(b => (
                  <option key={b.bookingId} value={b.bookingId}>
                    {b.service} · {b.customerName} / {b.workerName} · ₹{b.amount}
                  </option>
                ))}
              </select>
              <select
                value={disputeForm.disputeType}
                onChange={e => setDisputeForm({ ...disputeForm, disputeType: e.target.value })}
                className="px-3 py-2 rounded-lg border bg-white"
              >
                {Object.entries(DISPUTE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                type="number" min="0" step="10" placeholder="Payout ₹ (optional)"
                value={disputeForm.payoutAmount}
                onChange={e => setDisputeForm({ ...disputeForm, payoutAmount: e.target.value })}
                className="px-3 py-2 rounded-lg border bg-white"
              />
            </div>
            <button
              onClick={fileDispute}
              disabled={filingDispute}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white font-bold disabled:opacity-60"
            >
              {filingDispute ? 'Recording…' : 'Record Dispute'}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Worker's-fault disputes also apply a small rating penalty to that worker automatically.
            </p>

            {fund.recentDisputes.length > 0 && (
              <div className="mt-5 space-y-2">
                {fund.recentDisputes.map(d => (
                  <div key={d.bookingId} className="flex justify-between items-center border rounded-lg p-2 text-sm">
                    <span><b>{d.service}</b> · {d.customerName} / {d.workerName}</span>
                    <span>{DISPUTE_LABELS[d.disputeType]} · ₹{d.payoutAmount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">⚖️ {t('admin.fairnessMonitor')}</h2>
          <div className="space-y-3">
            {fairness.map(w => <div key={w.workerId} className="border rounded-xl p-3">
              <div className="flex justify-between font-semibold"><span>{w.name}</span><span>{w.fairness}%</span></div>
              <div className="text-xs text-gray-500">{w.service} · {w.activeJobs} active jobs · ⭐ {w.rating} · {t(`worker.${w.availability}`)}</div>
              <div className="mt-2 bg-gray-200 h-2 rounded-full"><div className="bg-primary-600 h-2 rounded-full" style={{width:`${w.fairness}%`}} /></div>
            </div>)}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-2">🤖 {t('forecast.title')}</h2>
          <p className="text-xs text-gray-500 mb-4">{t('forecast.synthetic')}</p>
          {forecast?.predictions?.map(p => {
            const width = Math.min(100, p.predictedDemand * 2);
            return <div key={p.service} className="mb-4">
              <div className="flex justify-between text-sm font-semibold"><span>{t(`services.${p.service}`) || p.service}</span><span>{p.predictedDemand} jobs · {p.trendPercent >= 0 ? '↑' : '↓'} {Math.abs(p.trendPercent)}%</span></div>
              <div className="h-3 bg-gray-100 rounded-full mt-1"><div className="h-3 bg-primary-500 rounded-full" style={{width:`${width}%`}} /></div>
            </div>
          })}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
