require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Worker = require('./models/Worker');
const Booking = require('./models/Booking');
const Pricing = require('./models/Pricing');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gigsetu');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Worker.deleteMany({});
    await Booking.deleteMany({});
    await Pricing.deleteMany({});
    console.log('Collections cleared');

    const passwordHash = await bcrypt.hash('GigSetu@123', 10);

    const admin = new User({ name: 'Admin User', email: 'admin@gigsetu.local', role: 'admin', passwordHash });
    await admin.save();

    const customer1 = new User({ name: 'Rahul Sharma', email: 'customer@gigsetu.local', role: 'customer', phone: '9876543210', passwordHash });
    await customer1.save();

    const worker1User = new User({ name: 'Ravi Kumar', email: 'worker@gigsetu.local', role: 'worker', phone: '9876543211', passwordHash });
    await worker1User.save();
    const worker1 = new Worker({ user: worker1User._id, service: 'electrician', skills: ['fan repair', 'wiring', 'electrical', 'switch repair', 'MCB'], experienceYears: 5, latitude: 12.9716, longitude: 77.5946, locality: 'Koramangala', hourlyRate: 500, availability: 'available', workload: 2, rating: 4.7, verified: true, completedJobs: 45, ratingCount: 18, certifications: ['Electrical Safety', 'Home Wiring'], welfare: { insuranceStatus: 'Demo enrolled', welfareFundStatus: 'Eligible', safetyTraining: 'Approved' } });
    await worker1.save();

    const worker2User = new User({ name: 'Amit Patel', email: 'amit@gigsetu.local', role: 'worker', phone: '9876543212', passwordHash });
    await worker2User.save();
    const worker2 = new Worker({ user: worker2User._id, service: 'electrician', skills: ['wiring', 'electrical', 'meter reading', 'inverter repair'], experienceYears: 3, latitude: 12.9800, longitude: 77.5900, locality: 'Indiranagar', hourlyRate: 550, availability: 'available', workload: 7, rating: 4.5, verified: true, completedJobs: 89, ratingCount: 31, certifications: ['Electrical Safety'], welfare: { insuranceStatus: 'Demo enrolled', welfareFundStatus: 'Eligible', safetyTraining: 'Approved' } });
    await worker2.save();

    const worker3User = new User({ name: 'Suresh Reddy', email: 'suresh@gigsetu.local', role: 'worker', phone: '9876543213', passwordHash });
    await worker3User.save();
    const worker3 = new Worker({ user: worker3User._id, service: 'plumber', skills: ['pipe repair', 'plumbing', 'water tank', 'tap repair'], experienceYears: 8, latitude: 12.9600, longitude: 77.6000, locality: 'Jayanagar', hourlyRate: 520, availability: 'available', workload: 1, rating: 4.9, verified: true, completedJobs: 120, ratingCount: 40, certifications: ['Plumbing Safety'], welfare: { insuranceStatus: 'Demo enrolled', welfareFundStatus: 'Eligible', safetyTraining: 'Approved' } });
    await worker3.save();

    const worker4User = new User({ name: 'Priya Nair', email: 'priya@gigsetu.local', role: 'worker', phone: '9876543214', passwordHash });
    await worker4User.save();
    const worker4 = new Worker({ user: worker4User._id, service: 'cleaner', skills: ['deep cleaning', 'house cleaning', 'office cleaning', 'carpet cleaning'], experienceYears: 4, latitude: 12.9500, longitude: 77.5800, locality: 'Basavanagudi', hourlyRate: 420, availability: 'partially_available', workload: 5, rating: 4.6, verified: true, completedJobs: 67, ratingCount: 22, certifications: ['Professional Cleaning'], welfare: { insuranceStatus: 'Demo enrolled', welfareFundStatus: 'Eligible', safetyTraining: 'Approved' } });
    await worker4.save();

    const worker5User = new User({ name: 'Manoj Gowda', email: 'manoj@gigsetu.local', role: 'worker', phone: '9876543215', passwordHash });
    await worker5User.save();
    const worker5 = new Worker({ user: worker5User._id, service: 'carpenter', skills: ['furniture repair', 'woodwork', 'carpentry', 'door fitting'], experienceYears: 6, latitude: 12.9650, longitude: 77.6100, locality: 'HSR Layout', hourlyRate: 580, availability: 'available', workload: 3, rating: 4.2, verified: true, completedJobs: 34, ratingCount: 11, certifications: ['Carpentry Safety'], welfare: { insuranceStatus: 'Demo enrolled', welfareFundStatus: 'Eligible', safetyTraining: 'Approved' } });
    await worker5.save();

    const worker6User = new User({ name: 'Deepa Kumari', email: 'deepa@gigsetu.local', role: 'worker', phone: '9876543216', passwordHash });
    await worker6User.save();
    const worker6 = new Worker({ user: worker6User._id, service: 'painter', skills: ['wall painting', 'interior painting', 'waterproofing'], experienceYears: 2, latitude: 12.9750, longitude: 77.5750, locality: 'Malleshwaram', hourlyRate: 600, availability: 'available', workload: 0, rating: 4.0, verified: false, completedJobs: 5, ratingCount: 2, certifications: [], welfare: { insuranceStatus: 'Not enrolled', welfareFundStatus: 'Eligible', safetyTraining: 'Approved' } });
    await worker6.save();

    const customer2 = new User({ name: 'Ananya Singh', email: 'ananya@gigsetu.local', role: 'customer', phone: '9876543217', passwordHash });
    await customer2.save();

    const fixedPrices = [
      ['electrician', 500], ['plumber', 550], ['carpenter', 600], ['cleaner', 400],
      ['painter', 650], ['gardener', 350], ['appliancerepair', 700], ['delivery', 250],
      ['farmworker', 450], ['otherservices', 400]
    ];
    await Pricing.insertMany(fixedPrices.map(([service, hourlyRate]) => ({
      service, hourlyRate, currency: 'INR', updatedBy: admin._id
    })));
    console.log('✅ Fixed cooperative hourly prices seeded');

    console.log('✅ Database seeded successfully!');
    console.log('Demo Credentials:');
    console.log('Password for all users: GigSetu@123');
    console.log('- admin@gigsetu.local (Admin)');
    console.log('- customer@gigsetu.local (Customer)');
    console.log('- worker@gigsetu.local (Verified Electrician)');
    console.log('- amit@gigsetu.local (Verified Electrician)');
    console.log('- suresh@gigsetu.local (Verified Plumber)');
    console.log('- priya@gigsetu.local (Verified Cleaner)');
    console.log('- manoj@gigsetu.local (Verified Carpenter)');
    console.log('- deepa@gigsetu.local (Unverified Painter)');
    console.log('- ananya@gigsetu.local (Customer)');

    mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
