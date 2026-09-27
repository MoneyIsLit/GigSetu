import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const ProgressBar = ({ label, percentage }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="font-semibold text-gray-700">{Math.round(percentage)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }} />
    </div>
  </div>
);

const FairnessBreakdown = ({ scores }) => {
  const { t } = useLanguage();
  if (!scores) return null;
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <h4 className="font-semibold text-gray-800 mb-3">{t('fairness.scoreBreakdown')}</h4>
      <ProgressBar label={t('fairness.skillMatch')} percentage={(scores.skillMatch || 0) * 100} />
      <ProgressBar label={t('fairness.distance')} percentage={(scores.distanceScore || 0) * 100} />
      <ProgressBar label={t('fairness.availability')} percentage={(scores.availabilityScore || 0) * 100} />
      <ProgressBar label={t('fairness.workloadBalance')} percentage={(scores.workloadBalance || 0) * 100} />
      <ProgressBar label={t('fairness.rating')} percentage={(scores.ratingScore || 0) * 100} />
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        30% skill · 20% distance · 15% availability · 25% workload · 10% rating
      </div>
    </div>
  );
};

export default FairnessBreakdown;
