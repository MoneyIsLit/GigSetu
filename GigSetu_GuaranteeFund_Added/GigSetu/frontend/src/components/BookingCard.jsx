import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * BookingCard — renders a single booking with proof-of-work camera actions.
 *
 * Props (all optional beyond `booking`):
 *   onStatusUpdate(bookingId, status) — generic status transition (accept, cancel…)
 *   onStart(bookingId, file)          — called when worker taps "Start Job" with a photo
 *   onFinish(bookingId, file)         — called when worker taps "Finish Job" with a photo
 *   uploading                         — true while an upload is in flight
 *   uploadProgress                    — 0-100 upload percentage
 *   uploadError                       — error message string (blurry, missing, etc.)
 */
const BookingCard = ({
  booking,
  onStatusUpdate,
  onStart,
  onFinish,
  uploading = false,
  uploadProgress = 0,
  uploadError = null,
}) => {
  const { t } = useLanguage();
  const isWorker = !!onStart || !!onFinish;
  const serviceKey = String(booking.service || '').toLowerCase();
  const other = isWorker ? booking.customer : (booking.worker || booking.workerProfile?.user);
  const otherName = other?.name || '—';

  // Separate refs for before / after file pickers
  const beforeInputRef = useRef(null);
  const afterInputRef  = useRef(null);

  const statusClass = {
    requested:   'bg-yellow-100 text-yellow-800',
    accepted:    'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed:   'bg-green-100 text-green-800',
    cancelled:   'bg-red-100 text-red-800',
  }[booking.status] || 'bg-gray-100 text-gray-800';

  // ── Proof photo thumbnail helper ──────────────────────────────────────────
  const ProofThumb = ({ url, label }) =>
    url ? (
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <img
          src={url}
          alt={label}
          className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
        />
      </div>
    ) : null;

  // ── Start Job button + hidden file input ─────────────────────────────────
  const handleStartClick = () => beforeInputRef.current?.click();
  const handleBeforeChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onStart) onStart(booking._id, file);
    e.target.value = ''; // reset so same file can be re-selected
  };

  // ── Finish Job — inline picker shown alongside Finish button ─────────────
  const [afterFile, setAfterFile] = React.useState(null);
  const [afterPreview, setAfterPreview] = React.useState(null);

  const handleAfterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAfterFile(file);
    setAfterPreview(URL.createObjectURL(file));
  };

  const handleFinishClick = () => {
    if (!afterFile) {
      afterInputRef.current?.click();
      return;
    }
    if (onFinish) onFinish(booking._id, afterFile);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* ── Header ── */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div>
          <span className={`px-2 py-1 text-xs rounded-full font-semibold uppercase ${statusClass}`}>
            {t(`booking.${booking.status}`)}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-2">
            {t(`services.${serviceKey}`) || booking.service}
          </h3>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(booking.createdAt).toLocaleDateString()}
        </span>
      </div>

      {booking.isEmergency && (
        <div className="mb-3 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm font-bold">
          🚨 {t('customer.emergency')}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-3">{booking.description}</p>

      <div className="text-sm text-gray-700 space-y-1">
        <div>
          <b>{isWorker ? t('booking.customer') : t('booking.worker')}:</b> {otherName}
        </div>
        {booking.scheduledAt && (
          <div>
            <b>{t('booking.scheduledFor')}:</b>{' '}
            {new Date(booking.scheduledAt).toLocaleString()}
          </div>
        )}
        {booking.combinedScore != null && (
          <div>
            <b>{t('fairness.combinedScore')}:</b> {booking.combinedScore}%
          </div>
        )}
      </div>

      {/* ── Proof photo thumbnails (visible after completion) ── */}
      {booking.proofPhotos?.beforeUrl && (
        <ProofThumb url={booking.proofPhotos.beforeUrl} label="📷 Before photo" />
      )}
      {booking.proofPhotos?.afterUrl && (
        <ProofThumb url={booking.proofPhotos.afterUrl} label="✅ After photo" />
      )}
      {booking.proofPhotos?.verificationScore != null && (
        <div className="mt-2 text-xs text-gray-500">
          Verification score:{' '}
          <b className={booking.proofPhotos.flagged ? 'text-red-600' : 'text-green-600'}>
            {(booking.proofPhotos.verificationScore * 100).toFixed(1)}%
          </b>
          {booking.proofPhotos.flagged && (
            <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">
              ⚠️ Flagged
            </span>
          )}
        </div>
      )}

      {/* ── Upload error ── */}
      {uploadError && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {uploadError}
        </div>
      )}

      {/* ── Upload progress bar ── */}
      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading photo…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      {(onStatusUpdate || onStart || onFinish) && (
        <div className="mt-4 flex flex-col gap-2">

          {/* Non-worker actions (customer cancel etc.) */}
          {onStatusUpdate && !isWorker && booking.status === 'requested' && (
            <button
              onClick={() => onStatusUpdate(booking._id, 'cancelled')}
              className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-bold"
            >
              {t('booking.cancelBooking')}
            </button>
          )}

          {/* Worker: accept / reject (still uses generic status update) */}
          {onStatusUpdate && booking.status === 'requested' && (
            <div className="flex gap-2">
              <button
                onClick={() => onStatusUpdate(booking._id, 'accepted')}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold"
              >
                {t('worker.acceptJob')}
              </button>
              <button
                onClick={() => onStatusUpdate(booking._id, 'cancelled')}
                className="flex-1 bg-red-50 text-red-700 py-3 rounded-lg font-bold"
              >
                {t('worker.rejectJob')}
              </button>
            </div>
          )}

          {/* Worker: START JOB — opens camera for optional before photo */}
          {onStart && booking.status === 'accepted' && (
            <>
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleBeforeChange}
              />
              <button
                onClick={handleStartClick}
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                📷 {uploading ? 'Uploading…' : t('worker.startJob')}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Take a before photo (optional) to start the job
              </p>
            </>
          )}

          {/* Worker: FINISH JOB — mandatory after photo */}
          {onFinish && booking.status === 'in_progress' && (
            <>
              <input
                ref={afterInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAfterChange}
              />

              {/* After photo preview */}
              {afterPreview && (
                <div className="relative">
                  <img
                    src={afterPreview}
                    alt="After photo preview"
                    className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => afterInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-white/80 text-xs px-2 py-1 rounded-full border"
                  >
                    Retake
                  </button>
                </div>
              )}

              {/* Select photo button (shown when no photo yet) */}
              {!afterPreview && (
                <button
                  onClick={() => afterInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:border-primary-400 transition-colors"
                >
                  📷 Take After Photo (required)
                </button>
              )}

              {/* Finish Job button — disabled until a photo is selected */}
              <button
                onClick={handleFinishClick}
                disabled={!afterFile || uploading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                ✅ {uploading ? `Uploading… ${uploadProgress}%` : t('worker.completeJob')}
              </button>

              {!afterFile && (
                <p className="text-xs text-red-500 text-center">
                  An after photo is required to finish the job
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
