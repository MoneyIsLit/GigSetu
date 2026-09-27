import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djI2aDJWMzRoLTI2VjIyaC0yVjM2SDZWMzRoMjYV3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
            GigSetu
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 text-primary-100 max-w-3xl mx-auto">
            {t('landing.tagline')}
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-primary-50">
            {t('landing.heroText')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 hover:bg-gray-50 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              {t('landing.findService')}
            </Link>
            <Link to="/register" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl font-bold text-lg transition-all hover:-translate-y-1">
              {t('landing.joinAsWorker')}
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl mb-6">🛡️</div>
              <h3 className="text-xl font-bold mb-3">{t('landing.benefit1Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.benefit1Desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-6">⚖️</div>
              <h3 className="text-xl font-bold mb-3">{t('landing.benefit2Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.benefit2Desc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-6">📍</div>
              <h3 className="text-xl font-bold mb-3">{t('landing.benefit3Title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('landing.benefit3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-16">{t('landing.howItWorks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 z-10 relative shadow-sm">1</div>
              <h3 className="text-xl font-bold mb-2">{t('landing.step1')}</h3>
              <p className="text-gray-600">{t('landing.step1Desc')}</p>
            </div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 z-10 relative shadow-sm">2</div>
              <h3 className="text-xl font-bold mb-2">{t('landing.step2')}</h3>
              <p className="text-gray-600">{t('landing.step2Desc')}</p>
            </div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 z-10 relative shadow-sm">3</div>
              <h3 className="text-xl font-bold mb-2">{t('landing.step3')}</h3>
              <p className="text-gray-600">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p className="mb-2">GigSetu - {t('landing.cooperativeOwned')}</p>
        <p className="text-sm">{t('landing.sihProject')}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
