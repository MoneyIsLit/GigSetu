import React from 'react';

const StatCard = ({ icon, title, value, colorClass = 'bg-primary-50 text-primary-600 border-primary-500' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 flex items-center hover-card border-l-4 ${colorClass.split(' ')[2]}`}>
      <div className={`p-4 rounded-full mr-4 ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
