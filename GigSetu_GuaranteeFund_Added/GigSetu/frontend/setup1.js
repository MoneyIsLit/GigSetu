const fs = require('fs');
const path = require('path');

const basePath = 'c:/Users/Saathvik/OneDrive/Desktop/GigSetu/frontend/';

function ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function writeFile(relPath, content) {
    const fullPath = path.join(basePath, relPath);
    ensureDir(fullPath);
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
    console.log(`Created ${relPath}`);
}

const files = {};

files['package.json'] = `{
  "name": "gigsetu-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "socket.io-client": "^4.7.2",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}`;

files['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="GigSetu - Cooperative Gig Services Platform for fair work distribution" />
  <title>GigSetu - Local Work. Fairly Distributed.</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

files['vite.config.js'] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': { target: 'http://localhost:5000', ws: true }
    }
  }
})`;

files['tailwind.config.js'] = `export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
        accent: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'Noto Sans Kannada', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}`;

files['postcss.config.js'] = `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`;

files['src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #22c55e;
}
html { scroll-behavior: smooth; }
body { @apply font-sans bg-gray-50 text-gray-900; }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #86efac; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #22c55e; }

.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.text-gradient {
  background: linear-gradient(to right, #16a34a, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hover-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.pulse-badge {
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.touch-target { @apply min-h-[44px] min-w-[44px]; }`;

files['src/api.js'] = `import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('gigsetu_token')
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('gigsetu_token')
    if (window.location.pathname !== '/login') window.location.href = '/login'
  }
  return Promise.reject(err)
})
export default api`;

files['src/i18n/i18n.js'] = `import en from './en'
import hi from './hi'
import kn from './kn'

const translations = { en, hi, kn }

export function getTranslation(lang, key) {
  const keys = key.split('.')
  let result = translations[lang] || translations.en
  for (const k of keys) {
    result = result?.[k]
  }
  return result || key 
}

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
]`;

files['src/i18n/en.js'] = `export default {
  common: { login: 'Login', logout: 'Logout', save: 'Save', cancel: 'Cancel', submit: 'Submit', search: 'Search', loading: 'Loading...', error: 'Error', success: 'Success', back: 'Back', home: 'Home', profile: 'Profile', settings: 'Settings', email: 'Email', password: 'Password', name: 'Name', phone: 'Phone', actions: 'Actions', view: 'View', edit: 'Edit', delete: 'Delete', confirm: 'Confirm', close: 'Close', yes: 'Yes', no: 'No', welcome: 'Welcome', or: 'or', and: 'and', noData: 'No data available', required: 'Required', location: 'Location', latitude: 'Latitude', longitude: 'Longitude', yearsExp: 'years experience', kmAway: 'km away', activeJobs: 'active jobs' },
  navigation: { dashboard: 'Dashboard', workers: 'Workers', bookings: 'Bookings', profile: 'Profile', findService: 'Find a Service', myJobs: 'My Jobs', adminPanel: 'Admin Panel', home: 'Home', verification: 'Verification', workloadMonitor: 'Workload Monitor' },
  landing: { title: 'GigSetu', tagline: 'Local Work. Fairly Distributed.', heroText: 'Connect with trusted local professionals while creating fair opportunities for every worker.', heroSubtext: 'India\\'s first cooperative-owned hyperlocal gig platform that ensures fair work distribution.', benefit1Title: 'Verified Workers', benefit1Desc: 'Every worker is verified by the cooperative before they can receive jobs.', benefit2Title: 'Fair Work Allocation', benefit2Desc: 'Our fairness algorithm ensures work is distributed equitably among all workers.', benefit3Title: 'Hyperlocal Services', benefit3Desc: 'Find trusted professionals right in your neighborhood.', findService: 'Find a Service', joinAsWorker: 'Join as a Worker', builtForEveryone: 'Built for Everyone', availableLanguages: 'Available in English, Hindi and Kannada.', howItWorks: 'How It Works', step1: 'Search for a service', step1Desc: 'Select the type of service you need and describe your requirement.', step2: 'Get fair recommendations', step2Desc: 'Our AI-powered fairness algorithm recommends workers based on skills, distance, availability, and workload balance.', step3: 'Book and track', step3Desc: 'Book a worker and track your service in real-time.', cooperativeOwned: 'Cooperative Owned', cooperativeDesc: 'Built for and by local communities.', sihProject: 'Smart India Hackathon 2026 Project' },
  auth: { loginTitle: 'Welcome Back', registerTitle: 'Create Account', selectRole: 'Select Your Role', customerLogin: 'Customer Login', workerLogin: 'Worker Login', adminLogin: 'Admin Login', customerRole: 'Customer', workerRole: 'Gig Worker', adminRole: 'Cooperative Leader', noAccount: 'Don\\'t have an account?', haveAccount: 'Already have an account?', registerHere: 'Register here', loginHere: 'Login here', registerAs: 'Register as', customerDesc: 'Find trusted local professionals for your needs.', workerDesc: 'Join the cooperative and get fair work opportunities.', adminDesc: 'Manage workers, verify profiles, and monitor fairness.' },
  customer: { findService: 'Find a Service', serviceRequired: 'Service Required', description: 'Describe what you need', descriptionPlaceholder: 'E.g., Need help repairing a ceiling fan', findWorkers: 'Find Workers', requestService: 'Request Service', myBookings: 'My Bookings', currentBooking: 'Current Booking', bookingHistory: 'Booking History', recommended: 'Recommended Workers', bestFairMatch: 'Best Fair Match', whyThisWorker: 'Why this worker?', skillMatchReason: 'Strong skill match for your requirements', distanceReason: 'Close to your location', availabilityReason: 'Currently available for work', workloadReason: 'Lower current workload - fair distribution', ratingReason: 'Highly rated by customers', noWorkers: 'No workers found for this service. Try a different service or location.', useDefaultLocation: 'Use Default Location (Bangalore)', enterCoordinates: 'Enter Coordinates', searching: 'Searching for best fair matches...' },
  worker: { workerPortal: 'Worker Portal', availability: 'Availability', myJobs: 'My Jobs', verified: 'Verified', pending: 'Pending Verification', rejected: 'Rejected', verificationStatus: 'Verification Status', activeJobs: 'Active Jobs', completedJobs: 'Completed Jobs', acceptJob: 'Accept Job', rejectJob: 'Reject Job', startJob: 'Start Job', completeJob: 'Complete Job', currentWorkload: 'Current Workload', rating: 'Rating', experience: 'Experience', skills: 'Skills', updateProfile: 'Update Profile', setAvailability: 'Set Availability', available: 'Available', partiallyAvailable: 'Partially Available', unavailable: 'Unavailable', service: 'Service', pendingMessage: 'Your profile is pending verification by the cooperative leader. You will be able to receive jobs once verified.', noJobs: 'No jobs at the moment. New requests will appear here.' },
  admin: { cooperativeDashboard: 'Cooperative Dashboard', totalWorkers: 'Total Workers', verifiedWorkers: 'Verified Workers', pendingWorkers: 'Pending Workers', customers: 'Customers', totalBookings: 'Total Bookings', completedJobs: 'Completed Jobs', activeJobs: 'Active Jobs', cancelledJobs: 'Cancelled Jobs', workerVerification: 'Worker Verification', verifyWorker: 'Verify', rejectWorker: 'Reject', viewProfile: 'View Profile', workloadDistribution: 'Workload Distribution', fairnessMonitor: 'Fairness Monitor', allWorkers: 'All Workers', pendingOnly: 'Pending Only', verifiedOnly: 'Verified Only', recentBookings: 'Recent Bookings', workerName: 'Worker Name', serviceType: 'Service Type', experienceYears: 'Experience', status: 'Status' },
  services: { electrician: 'Electrician', plumber: 'Plumber', carpenter: 'Carpenter', cleaner: 'Cleaner', painter: 'Painter', gardener: 'Gardener', applianceRepair: 'Appliance Repair', delivery: 'Delivery', farmWorker: 'Farm Worker', otherServices: 'Other Community Services' },
  fairness: { fairnessScore: 'Fairness Score', aiMatchScore: 'AI Match Score', skillMatch: 'Skill Match', distance: 'Distance', availability: 'Availability', workloadBalance: 'Workload Balance', rating: 'Rating', overallScore: 'Overall Score', combinedScore: 'Combined Score', scoreBreakdown: 'Score Breakdown' },
  booking: { requested: 'Requested', matched: 'Matched', accepted: 'Accepted', inProgress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', newRequest: 'New Request', serviceRequest: 'Service Request', bookingDetails: 'Booking Details', cancelBooking: 'Cancel Booking', bookingCreated: 'Booking created successfully!', noBookings: 'No bookings yet.' },
  notifications: { bookingAccepted: 'Your booking has been accepted!', bookingStarted: 'Your service is now in progress!', bookingCompleted: 'Your service has been completed!', newBookingRequest: 'New service request received!', bookingCancelled: 'A booking has been cancelled.', workerVerified: 'Your profile has been verified!' }
}`;

files['src/i18n/hi.js'] = `export default {
  common: { login: 'लॉग इन', logout: 'लॉग आउट', save: 'सहेजें', cancel: 'रद्द करें', submit: 'जमा करें', search: 'खोजें', loading: 'लोड हो रहा है...', error: 'त्रुटि', success: 'सफल', back: 'वापस', home: 'होम', profile: 'प्रोफ़ाइल', email: 'ईमेल', password: 'पासवर्ड', name: 'नाम', phone: 'फ़ोन', actions: 'कार्रवाई', view: 'देखें', edit: 'संपादित करें', delete: 'हटाएं', confirm: 'पुष्टि करें', close: 'बंद करें', yes: 'हाँ', no: 'नहीं', welcome: 'स्वागत है', location: 'स्थान', latitude: 'अक्षांश', longitude: 'देशांतर', yearsExp: 'वर्ष का अनुभव', kmAway: 'किमी दूर', activeJobs: 'सक्रिय कार्य', noData: 'कोई डेटा उपलब्ध नहीं', required: 'आवश्यक' },
  navigation: { dashboard: 'डैशबोर्ड', workers: 'कर्मचारी', bookings: 'बुकिंग', profile: 'प्रोफ़ाइल', findService: 'सेवा खोजें', myJobs: 'मेरे कार्य', adminPanel: 'प्रशासन पैनल', home: 'होम', verification: 'सत्यापन', workloadMonitor: 'कार्यभार मॉनिटर' },
  landing: { title: 'गिगसेतु', tagline: 'स्थानीय काम। निष्पक्ष वितरण।', heroText: 'विश्वसनीय स्थानीय पेशेवरों से जुड़ें और हर कर्मचारी के लिए उचित अवसर बनाएं।', heroSubtext: 'भारत का पहला सहकारी स्वामित्व वाला हाइपरलोकल गिग प्लेटफ़ॉर्म जो उचित कार्य वितरण सुनिश्चित करता है।', benefit1Title: 'सत्यापित कर्मचारी', benefit1Desc: 'हर कर्मचारी को काम मिलने से पहले सहकारी द्वारा सत्यापित किया जाता है।', benefit2Title: 'निष्पक्ष कार्य आवंटन', benefit2Desc: 'हमारा निष्पक्षता एल्गोरिदम सभी कर्मचारियों के बीच काम को समान रूप से वितरित करता है।', benefit3Title: 'हाइपरलोकल सेवाएं', benefit3Desc: 'अपने पड़ोस में विश्वसनीय पेशेवर खोजें।', findService: 'सेवा खोजें', joinAsWorker: 'कर्मचारी बनें', builtForEveryone: 'सबके लिए बनाया गया', availableLanguages: 'अंग्रेजी, हिंदी और कन्नड में उपलब्ध।', howItWorks: 'यह कैसे काम करता है', step1: 'सेवा खोजें', step1Desc: 'आपको जिस प्रकार की सेवा चाहिए उसे चुनें और अपनी आवश्यकता बताएं।', step2: 'निष्पक्ष सिफारिशें पाएं', step2Desc: 'हमारा AI-संचालित निष्पक्षता एल्गोरिदम कौशल, दूरी, उपलब्धता और कार्यभार संतुलन के आधार पर कर्मचारियों की सिफारिश करता है।', step3: 'बुक करें और ट्रैक करें', step3Desc: 'कर्मचारी बुक करें और अपनी सेवा को रियल-टाइम में ट्रैक करें।', cooperativeOwned: 'सहकारी स्वामित्व', cooperativeDesc: 'स्थानीय समुदायों द्वारा और उनके लिए बनाया गया।', sihProject: 'स्मार्ट इंडिया हैकाथॉन 2026 प्रोजेक्ट' },
  auth: { loginTitle: 'वापस स्वागत है', registerTitle: 'खाता बनाएं', selectRole: 'अपनी भूमिका चुनें', customerLogin: 'ग्राहक लॉगिन', workerLogin: 'कर्मचारी लॉगिन', adminLogin: 'प्रशासक लॉगिन', customerRole: 'ग्राहक', workerRole: 'गिग वर्कर', adminRole: 'सहकारी नेता', noAccount: 'खाता नहीं है?', haveAccount: 'पहले से खाता है?', registerHere: 'यहां रजिस्टर करें', loginHere: 'यहां लॉगिन करें', registerAs: 'के रूप में रजिस्टर करें', customerDesc: 'अपनी जरूरतों के लिए विश्वसनीय स्थानीय पेशेवर खोजें।', workerDesc: 'सहकारी में शामिल हों और उचित काम के अवसर पाएं।', adminDesc: 'कर्मचारियों का प्रबंधन करें, प्रोफाइल सत्यापित करें और निष्पक्षता की निगरानी करें।' },
  customer: { findService: 'सेवा खोजें', serviceRequired: 'आवश्यक सेवा', description: 'अपनी जरूरत बताएं', descriptionPlaceholder: 'जैसे, सीलिंग फैन की मरम्मत में मदद चाहिए', findWorkers: 'कर्मचारी खोजें', requestService: 'सेवा का अनुरोध करें', myBookings: 'मेरी बुकिंग', currentBooking: 'वर्तमान बुकिंग', bookingHistory: 'बुकिंग इतिहास', recommended: 'अनुशंसित कर्मचारी', bestFairMatch: 'सर्वश्रेष्ठ निष्पक्ष मिलान', whyThisWorker: 'यह कर्मचारी क्यों?', skillMatchReason: 'आपकी आवश्यकताओं के लिए मजबूत कौशल मिलान', distanceReason: 'आपके स्थान के करीब', availabilityReason: 'वर्तमान में काम के लिए उपलब्ध', workloadReason: 'कम वर्तमान कार्यभार - निष्पक्ष वितरण', ratingReason: 'ग्राहकों द्वारा उच्च रेटिंग', noWorkers: 'इस सेवा के लिए कोई कर्मचारी नहीं मिला। कोई अलग सेवा या स्थान आज़माएं।', useDefaultLocation: 'डिफ़ॉल्ट स्थान का उपयोग करें (बैंगलोर)', enterCoordinates: 'निर्देशांक दर्ज करें', searching: 'सर्वश्रेष्ठ निष्पक्ष मिलान खोजा जा रहा है...' },
  worker: { workerPortal: 'कर्मचारी पोर्टल', availability: 'उपलब्धता', myJobs: 'मेरे कार्य', verified: 'सत्यापित', pending: 'सत्यापन लंबित', rejected: 'अस्वीकृत', verificationStatus: 'सत्यापन स्थिति', activeJobs: 'सक्रिय कार्य', completedJobs: 'पूर्ण कार्य', acceptJob: '✓ कार्य स्वीकार करें', rejectJob: '✗ कार्य अस्वीकार करें', startJob: '▶ कार्य शुरू करें', completeJob: '✓ कार्य पूरा करें', currentWorkload: 'वर्तमान कार्यभार', rating: 'रेटिंग', experience: 'अनुभव', skills: 'कौशल', updateProfile: 'प्रोफ़ाइल अपडेट करें', setAvailability: 'उपलब्धता सेट करें', available: 'उपलब्ध', partiallyAvailable: 'आंशिक रूप से उपलब्ध', unavailable: 'अनुपलब्ध', service: 'सेवा', pendingMessage: 'आपकी प्रोफ़ाइल सहकारी नेता द्वारा सत्यापन के लिए लंबित है। सत्यापित होने के बाद आप कार्य प्राप्त कर सकेंगे।', noJobs: 'अभी कोई कार्य नहीं है। नए अनुरोध यहां दिखाई देंगे।' },
  admin: { cooperativeDashboard: 'सहकारी डैशबोर्ड', totalWorkers: 'कुल कर्मचारी', verifiedWorkers: 'सत्यापित कर्मचारी', pendingWorkers: 'लंबित कर्मचारी', customers: 'ग्राहक', totalBookings: 'कुल बुकिंग', completedJobs: 'पूर्ण कार्य', activeJobs: 'सक्रिय कार्य', cancelledJobs: 'रद्द कार्य', workerVerification: 'कर्मचारी सत्यापन', verifyWorker: 'सत्यापित करें', rejectWorker: 'अस्वीकार करें', viewProfile: 'प्रोफ़ाइल देखें', workloadDistribution: 'कार्यभार वितरण', fairnessMonitor: 'निष्पक्षता मॉनिटर', allWorkers: 'सभी कर्मचारी', pendingOnly: 'केवल लंबित', verifiedOnly: 'केवल सत्यापित', recentBookings: 'हालिया बुकिंग', workerName: 'कर्मचारी का नाम', serviceType: 'सेवा प्रकार', experienceYears: 'अनुभव', status: 'स्थिति' },
  services: { electrician: 'इलेक्ट्रीशियन', plumber: 'प्लंबर', carpenter: 'बढ़ई', cleaner: 'सफाईकर्मी', painter: 'पेंटर', gardener: 'माली', applianceRepair: 'उपकरण मरम्मत', delivery: 'डिलीवरी', farmWorker: 'कृषि कर्मचारी', otherServices: 'अन्य सामुदायिक सेवाएं' },
  fairness: { fairnessScore: 'निष्पक्षता स्कोर', aiMatchScore: 'AI मिलान स्कोर', skillMatch: 'कौशल मिलान', distance: 'दूरी', availability: 'उपलब्धता', workloadBalance: 'कार्यभार संतुलन', rating: 'रेटिंग', overallScore: 'समग्र स्कोर', combinedScore: 'संयुक्त स्कोर', scoreBreakdown: 'स्कोर विवरण' },
  booking: { requested: 'अनुरोधित', matched: 'मिलान किया गया', accepted: 'स्वीकृत', inProgress: 'कार्य प्रगति पर है', completed: 'पूरा हुआ', cancelled: 'रद्द किया गया', newRequest: 'नया अनुरोध', serviceRequest: 'सेवा अनुरोध', bookingDetails: 'बुकिंग विवरण', cancelBooking: 'बुकिंग रद्द करें', bookingCreated: 'बुकिंग सफलतापूर्वक बनाई गई!', noBookings: 'अभी तक कोई बुकिंग नहीं।' },
  notifications: { bookingAccepted: 'आपकी बुकिंग स्वीकार कर ली गई है!', bookingStarted: 'आपकी सेवा अब प्रगति पर है!', bookingCompleted: 'आपकी सेवा पूरी हो गई है!', newBookingRequest: 'नया सेवा अनुरोध प्राप्त हुआ!', bookingCancelled: 'एक बुकिंग रद्द कर दी गई है।', workerVerified: 'आपकी प्रोफ़ाइल सत्यापित कर दी गई है!' }
}`;

files['src/i18n/kn.js'] = `export default {
  common: { login: 'ಲಾಗಿನ್', logout: 'ಲಾಗ್ ಔಟ್', save: 'ಉಳಿಸಿ', cancel: 'ರದ್ದುಮಾಡಿ', submit: 'ಸಲ್ಲಿಸಿ', search: 'ಹುಡುಕಿ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', error: 'ದೋಷ', success: 'ಯಶಸ್ವಿ', back: 'ಹಿಂದೆ', home: 'ಮುಖಪುಟ', profile: 'ಪ್ರೊಫೈಲ್', email: 'ಇಮೇಲ್', password: 'ಪಾಸ್ವರ್ಡ್', name: 'ಹೆಸರು', phone: 'ಫೋನ್', actions: 'ಕ್ರಿಯೆಗಳು', view: 'ನೋಡಿ', edit: 'ಸಂಪಾದಿಸಿ', delete: 'ಅಳಿಸಿ', confirm: 'ದೃಢೀಕರಿಸಿ', close: 'ಮುಚ್ಚಿ', yes: 'ಹೌದು', no: 'ಇಲ್ಲ', welcome: 'ಸ್ವಾಗತ', location: 'ಸ್ಥಳ', latitude: 'ಅಕ್ಷಾಂಶ', longitude: 'ರೇಖಾಂಶ', yearsExp: 'ವರ್ಷಗಳ ಅನುಭವ', kmAway: 'ಕಿಮೀ ದೂರ', activeJobs: 'ಸಕ್ರಿಯ ಕೆಲಸಗಳು', noData: 'ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ', required: 'ಅಗತ್ಯವಿದೆ' },
  navigation: { dashboard: 'ಡ್ಯಾಶ್ಬೋರ್ಡ್', workers: 'ಕಾರ್ಮಿಕರು', bookings: 'ಬುಕ್ಕಿಂಗ್ಗಳು', profile: 'ಪ್ರೊಫೈಲ್', findService: 'ಸೇವೆ ಹುಡುಕಿ', myJobs: 'ನನ್ನ ಕೆಲಸಗಳು', adminPanel: 'ನಿರ್ವಾಹಕ ಫಲಕ', home: 'ಮುಖಪುಟ', verification: 'ಪರಿಶೀಲನೆ', workloadMonitor: 'ಕೆಲಸದ ಭಾರ ಮಾನಿಟರ್' },
  landing: { title: 'ಗಿಗ್ಸೇತು', tagline: 'ಸ್ಥಳೀಯ ಕೆಲಸ. ನ್ಯಾಯಯುತ ವಿತರಣೆ.', heroText: 'ವಿಶ್ವಾಸಾರ್ಹ ಸ್ಥಳೀಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಹೊಂದಿ ಮತ್ತು ಪ್ರತಿ ಕಾರ್ಮಿಕರಿಗೆ ನ್ಯಾಯಯುತ ಅವಕಾಶಗಳನ್ನು ಸೃಷ್ಟಿಸಿ.', heroSubtext: 'ನ್ಯಾಯಯುತ ಕೆಲಸ ವಿತರಣೆಯನ್ನು ಖಚಿತಪಡಿಸುವ ಭಾರತದ ಮೊದಲ ಸಹಕಾರಿ ಸ್ವಾಮ್ಯದ ಹೈಪರ್ಲೋಕಲ್ ಗಿಗ್ ಪ್ಲಾಟ್ಫಾರ್ಮ್.', benefit1Title: 'ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಮಿಕರು', benefit1Desc: 'ಪ್ರತಿ ಕಾರ್ಮಿಕರನ್ನು ಕೆಲಸ ಸ್ವೀಕರಿಸುವ ಮೊದಲು ಸಹಕಾರಿಯಿಂದ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.', benefit2Title: 'ನ್ಯಾಯಯುತ ಕೆಲಸ ಹಂಚಿಕೆ', benefit2Desc: 'ನಮ್ಮ ನ್ಯಾಯಸಮ್ಮತ ಅಲ್ಗಾರಿದಮ್ ಎಲ್ಲಾ ಕಾರ್ಮಿಕರ ನಡುವೆ ಕೆಲಸವನ್ನು ಸಮಾನವಾಗಿ ವಿತರಿಸುತ್ತದೆ.', benefit3Title: 'ಹೈಪರ್ಲೋಕಲ್ ಸೇವೆಗಳು', benefit3Desc: 'ನಿಮ್ಮ ನೆರೆಹೊರೆಯಲ್ಲಿಯೇ ವಿಶ್ವಾಸಾರ್ಹ ವೃತ್ತಿಪರರನ್ನು ಹುಡುಕಿ.', findService: 'ಸೇವೆ ಹುಡುಕಿ', joinAsWorker: 'ಕಾರ್ಮಿಕರಾಗಿ ಸೇರಿ', builtForEveryone: 'ಎಲ್ಲರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ', availableLanguages: 'ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಲಭ್ಯ.', howItWorks: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', step1: 'ಸೇವೆಯನ್ನು ಹುಡುಕಿ', step1Desc: 'ನಿಮಗೆ ಬೇಕಾದ ಸೇವೆಯ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಅವಶ್ಯಕತೆಯನ್ನು ವಿವರಿಸಿ.', step2: 'ನ್ಯಾಯಯುತ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ', step2Desc: 'ನಮ್ಮ AI-ಚಾಲಿತ ನ್ಯಾಯಸಮ್ಮತ ಅಲ್ಗಾರಿದಮ್ ಕೌಶಲ್ಯ, ದೂರ, ಲಭ್ಯತೆ ಮತ್ತು ಕೆಲಸದ ಭಾರ ಸಮತೋಲನದ ಆಧಾರದ ಮೇಲೆ ಕಾರ್ಮಿಕರನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತದೆ.', step3: 'ಬುಕ್ ಮಾಡಿ ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', step3Desc: 'ಕಾರ್ಮಿಕರನ್ನು ಬುಕ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಸೇವೆಯನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.', cooperativeOwned: 'ಸಹಕಾರಿ ಸ್ವಾಮ್ಯ', cooperativeDesc: 'ಸ್ಥಳೀಯ ಸಮುದಾಯಗಳಿಂದ ಮತ್ತು ಅವರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.', sihProject: 'ಸ್ಮಾರ್ಟ್ ಇಂಡಿಯಾ ಹ್ಯಾಕಥಾನ್ 2026 ಯೋಜನೆ' },
  auth: { loginTitle: 'ಮರಳಿ ಸ್ವಾಗತ', registerTitle: 'ಖಾತೆ ರಚಿಸಿ', selectRole: 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ', customerLogin: 'ಗ್ರಾಹಕ ಲಾಗಿನ್', workerLogin: 'ಕಾರ್ಮಿಕ ಲಾಗಿನ್', adminLogin: 'ನಿರ್ವಾಹಕ ಲಾಗಿನ್', customerRole: 'ಗ್ರಾಹಕ', workerRole: 'ಗಿಗ್ ಕಾರ್ಮಿಕ', adminRole: 'ಸಹಕಾರಿ ನಾಯಕ', noAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?', haveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?', registerHere: 'ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ', loginHere: 'ಇಲ್ಲಿ ಲಾಗಿನ್ ಮಾಡಿ', registerAs: 'ಆಗಿ ನೋಂದಾಯಿಸಿ', customerDesc: 'ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ಸ್ಥಳೀಯ ವೃತ್ತಿಪರರನ್ನು ಹುಡುಕಿ.', workerDesc: 'ಸಹಕಾರಿಯಲ್ಲಿ ಸೇರಿ ಮತ್ತು ನ್ಯಾಯಯುತ ಕೆಲಸದ ಅವಕಾಶಗಳನ್ನು ಪಡೆಯಿರಿ.', adminDesc: 'ಕಾರ್ಮಿಕರನ್ನು ನಿರ್ವಹಿಸಿ, ಪ್ರೊಫೈಲ್ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನ್ಯಾಯಸಮ್ಮತತೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.' },
  customer: { findService: 'ಸೇವೆ ಹುಡುಕಿ', serviceRequired: 'ಅಗತ್ಯ ಸೇವೆ', description: 'ನಿಮಗೆ ಏನು ಬೇಕು ಎಂಬುದನ್ನು ವಿವರಿಸಿ', descriptionPlaceholder: 'ಉದಾ., ಸೀಲಿಂಗ್ ಫ್ಯಾನ್ ರಿಪೇರಿ ಮಾಡಲು ಸಹಾಯ ಬೇಕು', findWorkers: 'ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ', requestService: 'ಸೇವೆಯನ್ನು ವಿನಂತಿಸಿ', myBookings: 'ನನ್ನ ಬುಕ್ಕಿಂಗ್ಗಳು', currentBooking: 'ಪ್ರಸ್ತುತ ಬುಕ್ಕಿಂಗ್', bookingHistory: 'ಬುಕ್ಕಿಂಗ್ ಇತಿಹಾಸ', recommended: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕಾರ್ಮಿಕರು', bestFairMatch: 'ಅತ್ಯುತ್ತಮ ನ್ಯಾಯಯುತ ಹೊಂದಾಣಿಕೆ', whyThisWorker: 'ಈ ಕಾರ್ಮಿಕ ಏಕೆ?', skillMatchReason: 'ನಿಮ್ಮ ಅವಶ್ಯಕತೆಗಳಿಗೆ ಬಲವಾದ ಕೌಶಲ್ಯ ಹೊಂದಾಣಿಕೆ', distanceReason: 'ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಹತ್ತಿರ', availabilityReason: 'ಪ್ರಸ್ತುತ ಕೆಲಸಕ್ಕೆ ಲಭ್ಯ', workloadReason: 'ಕಡಿಮೆ ಪ್ರಸ್ತುತ ಕೆಲಸದ ಭಾರ - ನ್ಯಾಯಯುತ ವಿತರಣೆ', ratingReason: 'ಗ್ರಾಹಕಸರಿಂದ ಉನ್ನತ ರೇಟಿಂಗ್', noWorkers: 'ಈ ಸೇವೆಗೆ ಯಾವುದೇ ಕಾರ್ಮಿಕರು ಸಿಗಲಿಲ್ಲ. ಬೇರೆ ಸೇವೆ ಅಥವಾ ಸ್ಥಳವನ್ನು ಪ್ರಯತ್ನಿಸಿ.', useDefaultLocation: 'ಡೀಫಾಲ್ಟ್ ಸ್ಥಳ ಬಳಸಿ (ಬೆಂಗಳೂರು)', enterCoordinates: 'ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ನಮೂದಿಸಿ', searching: 'ಅತ್ಯುತ್ತಮ ನ್ಯಾಯಯುತ ಹೊಂದಾಣಿಕೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...' },
  worker: { workerPortal: 'ಕಾರ್ಮಿಕ ಪೋರ್ಟಲ್', availability: 'ಲಭ್ಯತೆ', myJobs: 'ನನ್ನ ಕೆಲಸಗಳು', verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ', pending: 'ಪರಿಶೀಲನೆ ಬಾಕಿಯಿದೆ', rejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', verificationStatus: 'ಪರಿಶೀಲನೆ ಸ್ಥಿತಿ', activeJobs: 'ಸಕ್ರಿಯ ಕೆಲಸಗಳು', completedJobs: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು', acceptJob: '✓ ಕೆಲಸ ಸ್ವೀಕರಿಸಿ', rejectJob: '✗ ಕೆಲಸ ತಿರಸ್ಕರಿಸಿ', startJob: '▶ ಕೆಲಸ ಪ್ರಾರಂಭಿಸಿ', completeJob: '✓ ಕೆಲಸ ಪೂರ್ಣಗೊಳಿಸಿ', currentWorkload: 'ಪ್ರಸ್ತುತ ಕೆಲಸದ ಭಾರ', rating: 'ರೇಟಿಂಗ್', experience: 'ಅನುಭವ', skills: 'ಕೌಶಲ್ಯಗಳು', updateProfile: 'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ', setAvailability: 'ಲಭ್ಯತೆ ಹೊಂದಿಸಿ', available: 'ಲಭ್ಯ', partiallyAvailable: 'ಭಾಗಶಃ ಲಭ್ಯ', unavailable: 'ಲಭ್ಯವಿಲ್ಲ', service: 'ಸೇವೆ', pendingMessage: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸಹಕಾರಿ ನಾಯಕರ ಪರಿಶೀಲನೆಗೆ ಬಾಕಿಯಿದೆ. ಪರಿಶೀಲಿಸಿದ ನಂತರ ನೀವು ಕೆಲಸಗಳನ್ನು ಸ್ವೀಕರಿಸಬಹುದು.', noJobs: 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ಕೆಲಸಗಳಿಲ್ಲ. ಹೊಸ ವಿನಂತಿಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.' },
  admin: { cooperativeDashboard: 'ಸಹಕಾರಿ ಡ್ಯಾಶ್ಬೋರ್ಡ್', totalWorkers: 'ಒಟ್ಟು ಕಾರ್ಮಿಕರು', verifiedWorkers: 'ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಮಿಕರು', pendingWorkers: 'ಬಾಕಿ ಕಾರ್ಮಿಕರು', customers: 'ಗ್ರಾಹಕರು', totalBookings: 'ಒಟ್ಟು ಬುಕ್ಕಿಂಗ್ಗಳು', completedJobs: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು', activeJobs: 'ಸಕ್ರಿಯ ಕೆಲಸಗಳು', cancelledJobs: 'ರದ್ದಾದ ಕೆಲಸಗಳು', workerVerification: 'ಕಾರ್ಮಿಕ ಪರಿಶೀಲನೆ', verifyWorker: 'ಪರಿಶೀಲಿಸಿ', rejectWorker: 'ತಿರಸ್ಕರಿಸಿ', viewProfile: 'ಪ್ರೊಫೈಲ್ ನೋಡಿ', workloadDistribution: 'ಕೆಲಸದ ಭಾರ ವಿತರಣೆ', fairnessMonitor: 'ನ್ಯಾಯಸಮ್ಮತ ಮಾನಿಟರ್', allWorkers: 'ಎಲ್ಲಾ ಕಾರ್ಮಿಕರು', pendingOnly: 'ಬಾಕಿ ಮಾತ್ರ', verifiedOnly: 'ಪರಿಶೀಲಿಸಿದ ಮಾತ್ರ', recentBookings: 'ಇತ್ತೀಚಿನ ಬುಕ್ಕಿಂಗ್ಗಳು', workerName: 'ಕಾರ್ಮಿಕರ ಹೆಸರು', serviceType: 'ಸೇವೆ ಪ್ರಕಾರ', experienceYears: 'ಅನುಭವ', status: 'ಸ್ಥಿತಿ' },
  services: { electrician: 'ಎಲೆಕ್ಟ್ರೀಶಿಯನ್', plumber: 'ಪ್ಲಂಬರ್', carpenter: 'ಮರಗೆಲಸಗಾರ', cleaner: 'ಶುಚಿಕಾರ', painter: 'ಪೇಂಟರ್', gardener: 'ತೋಟಗಾರ', applianceRepair: 'ಉಪಕರಣ ದುರಸ್ತಿ', delivery: 'ಡೆಲಿವರಿ', farmWorker: 'ಕೃಷಿ ಕಾರ್ಮಿಕ', otherServices: 'ಇತರ ಸಮುದಾಯ ಸೇವೆಗಳು' },
  fairness: { fairnessScore: 'ನ್ಯಾಯಸಮ್ಮತ ಸ್ಕೋರ್', aiMatchScore: 'AI ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್', skillMatch: 'ಕೌಶಲ್ಯ ಹೊಂದಾಣಿಕೆ', distance: 'ದೂರ', availability: 'ಲಭ್ಯತೆ', workloadBalance: 'ಕೆಲಸದ ಭಾರ ಸಮತೋಲನ', rating: 'ರೇಟಿಂಗ್', overallScore: 'ಒಟ್ಟಾರೆ ಸ್ಕೋರ್', combinedScore: 'ಸಂಯೋಜಿತ ಸ್ಕೋರ್', scoreBreakdown: 'ಸ್ಕೋರ್ ವಿವರಣೆ' },
  booking: { requested: 'ವಿನಂತಿಸಲಾಗಿದೆ', matched: 'ಹೊಂದಿಸಲಾಗಿದೆ', accepted: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ', inProgress: 'ಕೆಲಸ ಪ್ರಗತಿಯಲ್ಲಿದೆ', completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ', cancelled: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ', newRequest: 'ಹೊಸ ವಿನಂತಿ', serviceRequest: 'ಸೇವಾ ವಿನಂತಿ', bookingDetails: 'ಬುಕ್ಕಿಂಗ್ ವಿವರಗಳು', cancelBooking: 'ಬುಕ್ಕಿಂಗ್ ರದ್ದುಮಾಡಿ', bookingCreated: 'ಬುಕ್ಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!', noBookings: 'ಇನ್ನೂ ಯಾವುದೇ ಬುಕ್ಕಿಂಗ್ಗಳಿಲ್ಲ.' },
  notifications: { bookingAccepted: 'ನಿಮ್ಮ ಬುಕ್ಕಿಂಗ್ ಅನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ!', bookingStarted: 'ನಿಮ್ಮ ಸೇವೆ ಈಗ ಪ್ರಗತಿಯಲ್ಲಿದೆ!', bookingCompleted: 'ನಿಮ್ಮ ಸೇವೆ ಪೂರ್ಣಗೊಂಡಿದೆ!', newBookingRequest: 'ಹೊಸ ಸೇವಾ ವಿನಂತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!', bookingCancelled: 'ಒಂದು ಬುಕ್ಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.', workerVerified: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ!' }
}`;

files['src/context/AuthContext.jsx'] = `import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gigsetu_token'));
  const [loading, setLoading] = useState(true);
  const [workerProfile, setWorkerProfile] = useState(null);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('gigsetu_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    if (res.data.user.role === 'worker') {
      const profile = await api.get('/workers/me');
      setWorkerProfile(profile.data);
    }
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('gigsetu_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('gigsetu_token');
    setToken(null);
    setUser(null);
    setWorkerProfile(null);
  };

  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      if (res.data.role === 'worker') {
        const profile = await api.get('/workers/me');
        setWorkerProfile(profile.data);
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, workerProfile, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);`;

files['src/context/LanguageContext.jsx'] = `import React, { createContext, useContext, useState } from 'react';
import { getTranslation, supportedLanguages } from '../i18n/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('gigsetu_language') || 'en');

  const setLanguage = (lang) => {
    localStorage.setItem('gigsetu_language', lang);
    setLanguageState(lang);
  };

  const t = (key) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);`;

files['src/context/SocketContext.jsx'] = `import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketRef.current = io(window.location.origin);
      socketRef.current.emit('join', user._id);
      
      socketRef.current.on('notification', (msg) => {
        setNotifications((prev) => [...prev, msg]);
        toast(msg.message, { icon: '🔔' });
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);`;

Object.keys(files).forEach(file => {
  writeFile(file, files[file]);
});
console.log('Done script 1');
