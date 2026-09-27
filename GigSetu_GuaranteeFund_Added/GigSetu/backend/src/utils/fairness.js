const { haversine } = require('./distance');

const calculateFairnessComponents = (worker, description, customerLat, customerLng) => {
  let skillMatch = 0.5;
  const text = `${description || ''} ${worker.service || ''}`.toLowerCase();

  if (description) {
    const descWords = description.toLowerCase().split(/\W+/);
    const stopWords = ['need', 'help', 'repair', 'service', 'my', 'the', 'a', 'an', 'i', 'is', 'for', 'and', 'or', 'in', 'to', 'with', 'please'];
    const keywords = descWords.filter(word => word.length > 1 && !stopWords.includes(word));

    if (keywords.length) {
      let matchedCount = 0;
      keywords.forEach(keyword => {
        const matches = (worker.skills || []).some(skill =>
          skill.toLowerCase().includes(keyword) || keyword.includes(skill.toLowerCase())
        );
        if (matches) matchedCount++;
      });
      skillMatch = Math.min(1, matchedCount / keywords.length);
      // Service itself is a strong signal, while keeping the score explainable.
      if (String(worker.service).toLowerCase() && text.includes(String(worker.service).toLowerCase())) {
        skillMatch = Math.min(1, skillMatch + 0.15);
      }
    }
  }

  const distKm = haversine(customerLat, customerLng, worker.latitude, worker.longitude);
  let distanceScore;
  if (distKm <= 2) distanceScore = 1;
  else if (distKm <= 5) distanceScore = 0.8 + ((5 - distKm) / 3) * 0.2;
  else if (distKm <= 10) distanceScore = 0.6 + ((10 - distKm) / 5) * 0.2;
  else if (distKm <= 20) distanceScore = 0.3 + ((20 - distKm) / 10) * 0.3;
  else distanceScore = 0.1;

  const availabilityScore =
    worker.availability === 'available' ? 1 :
    worker.availability === 'partially_available' ? 0.5 : 0;

  // A lower workload receives a higher score. Cap at 10+ active jobs.
  const workloadBalance = Math.max(0, Math.min(1, 1 - ((worker.workload || 0) / 10)));
  const ratingScore = Math.max(0, Math.min(1, (worker.rating || 0) / 5));

  const fairnessScore =
    0.30 * skillMatch +
    0.20 * distanceScore +
    0.15 * availabilityScore +
    0.25 * workloadBalance +
    0.10 * ratingScore;

  return {
    skillMatch,
    distanceScore,
    availabilityScore,
    workloadBalance,
    ratingScore,
    fairnessScore
  };
};

const generateExplanation = (scores) => {
  const reasons = [];
  if (scores.skillMatch >= 0.7) reasons.push('Strong skill match for your requirements');
  else if (scores.skillMatch >= 0.4) reasons.push('Partial skill match');
  if (scores.distanceScore >= 0.8) reasons.push('Very close to your location');
  else if (scores.distanceScore >= 0.5) reasons.push('Reasonably close to your location');
  if (scores.availabilityScore === 1) reasons.push('Currently available for work');
  else if (scores.availabilityScore === 0.5) reasons.push('Partially available');
  if (scores.workloadBalance >= 0.7) reasons.push('Has low current workload');
  else if (scores.workloadBalance >= 0.4) reasons.push('Moderate current workload');
  if (scores.ratingScore >= 0.8) reasons.push('Highly rated by customers');
  return reasons;
};

module.exports = { calculateFairnessComponents, generateExplanation };
