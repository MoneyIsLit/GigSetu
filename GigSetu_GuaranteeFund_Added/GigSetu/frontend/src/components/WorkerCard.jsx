import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import FairnessBreakdown from './FairnessBreakdown';

const WorkerCard = ({ worker, scores, distance, isTopMatch, onRequestService, emergency, cooperativeRate }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const name = worker.user?.name || worker.userId?.name || worker.name || 'Local Professional';
  const serviceKey = String(worker.service || '').toLowerCase();
  const localRate = Number(worker.hourlyRate || 0);
  const coopRate = Number(cooperativeRate || 0);
  const rateDelta = localRate && coopRate ? Math.round(((localRate - coopRate) / coopRate) * 100) : null;

  return (
    <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${isTopMatch ? 'ring-2 ring-primary-500' : 'border border-gray-100'}`}>
      {isTopMatch && (
        <div className="bg-gradient-to-r from-primary-600 to-green-500 text-white text-center py-2 text-xs font-bold uppercase tracking-wider">
          ⭐ {t('customer.bestFairMatch')} ⭐
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-primary-600 font-semibold">{t(`services.${serviceKey}`)}</p>
            <div className="mt-2 text-sm text-gray-500 space-y-1">
              <div>⭐ {Number(worker.rating || 0).toFixed(1)}/5 · {worker.experienceYears || 0} {t('common.yearsExp')}</div>
              <div>📍 {distance} {t('common.kmAway')} · {worker.locality || 'Locality N/A'}</div>
              {localRate > 0 && (
                <div className="flex items-center gap-2">
                  <span>💼 Indicated local rate: ₹{localRate}/hr</span>
                  {rateDelta !== null && rateDelta !== 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rateDelta > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                      {rateDelta > 0 ? '+' : ''}{rateDelta}% vs fixed rate
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-center min-w-[95px]">
            <span className="text-xs text-green-800 font-semibold block">{t('fairness.fairnessScore')}</span>
            <span className="text-2xl font-black text-green-600">{scores?.fairnessScore || 0}%</span>
          </div>
        </div>

        {emergency && <div className="mt-3 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-bold">🚨 {t('customer.emergency')}</div>}

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block">{t('worker.availability')}</span><b>{t(`worker.${worker.availability}`)}</b></div>
          <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block">{t('worker.currentWorkload')}</span><b>{worker.workload || 0} {t('common.activeJobs')}</b></div>
        </div>

        {expanded && (
          <>
            <FairnessBreakdown scores={scores} />
            <div className="mt-3 bg-primary-50 border border-primary-100 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">{t('customer.whyThisWorker')}</h4>
              {(scores?.explanation || []).map((reason, i) => <div key={i} className="text-sm text-gray-700 mb-1">✓ {reason}</div>)}
            </div>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
          <button onClick={() => setExpanded(!expanded)} className="text-sm text-primary-700 font-semibold hover:underline">
            {expanded ? t('common.close') : t('customer.whyThisWorker')}
          </button>
          <button onClick={() => onRequestService(worker)} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-lg font-bold shadow-md">
            {t('customer.requestService')}
          </button>
        </div>
        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>{t('fairness.aiMatchScore')}: <b>{scores?.mlScore || 0}%</b></span>
          <span>{t('fairness.combinedScore')}: <b>{scores?.combinedScore || 0}%</b></span>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
