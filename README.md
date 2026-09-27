# GigSetu
Cooperative Gig Services Platform for Household &amp; Community Services


GigSetu — Local Work. Fairly Distributed.
GigSetu is a Smart India Hackathon prototype for a cooperative-owned hyperlocal service marketplace. It connects customers with verified local professionals and uses a transparent fairness algorithm plus ML recommendations to distribute opportunities more equitably.

SIH capabilities
Separate Customer / Worker / Cooperative Admin authentication
JWT + bcrypt + role-based authorization
Worker registration, verification, skills and certifications
Hyperlocal matching using latitude/longitude and Haversine distance
Explainable fairness score:
30% skill match
20% distance
15% availability
25% workload balance
10% rating
Random Forest + XGBoost worker recommendation service
Synthetic-data AI demand forecasting for the prototype
Emergency/on-demand booking mode
Scheduled booking support
Real-time Socket.IO notifications
Rating and feedback after completed jobs
Prototype digital payment flow
Digital invoice view/print
Worker welfare / insurance / safety-training demo records
Admin fairness and workload monitoring
English, Hindi and Kannada UI with localStorage persistence
Responsive, worker-friendly interface
Prototype transparency: ML training data and demand forecasting data are synthetic. Payment is a simulated/demo flow and does not collect bank/card credentials. Welfare/insurance fields are demo records. Production deployment should replace these with audited integrations and real anonymized historical data.

Architecture
React + Vite + Tailwind
        |
        | REST / Socket.IO
        v
Node.js + Express
        |
        +---- MongoDB + Mongoose
        |
        +---- Python FastAPI ML service
                  |
                  +-- Random Forest classifier
                  +-- XGBoost classifier
                  +-- Random Forest demand forecaster
Folder structure
GigSetu/
├── backend/
│   └── src/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── i18n/
│       └── pages/
└── ml-service/
    ├── models/
    └── training/
Requirements
Node.js 18+ (Node 24 works)
MongoDB Community Server running locally
Python 3.10+
A modern browser
MongoDB
The default connection is:

mongodb://127.0.0.1:27017/gigsetu
On Windows, if MongoDB was installed as a service:

Get-Service MongoDB
The status should be Running.

Backend
Open PowerShell:

cd C:\Users\<YOUR_NAME>\OneDrive\Desktop\GigSetu\backend
npm.cmd install
npm.cmd run seed
npm.cmd run dev
If PowerShell blocks npm.ps1, use npm.cmd as shown above.

Backend: http://localhost:5000

Do not run npm.cmd run seed every time. The seed script clears and recreates demo collections.

ML service
Open a second terminal:

cd C:\Users\<YOUR_NAME>\OneDrive\Desktop\GigSetu\ml-service
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe app.py
If PowerShell blocks Activate.ps1, you do not need to activate the environment; run .venv\Scripts\python.exe directly.

ML service: http://localhost:8000

Health check: http://localhost:8000/health

Frontend
Open a third terminal:

cd C:\Users\<YOUR_NAME>\OneDrive\Desktop\GigSetu\frontend
npm.cmd install
npm.cmd run dev
Frontend: http://localhost:5173

Environment variables
backend/.env.example:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gigsetu
JWT_SECRET=change_this_secret_in_production
ML_SERVICE_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
Create backend/.env from this template for local development.

Demo accounts
Password for all seeded users:

GigSetu@123
Role	Email
Admin	admin@gigsetu.local
Customer	customer@gigsetu.local
Worker	worker@gigsetu.local
Worker	amit@gigsetu.local
Worker	suresh@gigsetu.local
Worker	priya@gigsetu.local
Worker	manoj@gigsetu.local
Unverified worker	deepa@gigsetu.local
Customer	ananya@gigsetu.local
Matching algorithm
The backend first filters the database so only verified, available workers whose service matches the requested service can be recommended.

For every eligible worker:

Fairness =
0.30 × Skill Match
+ 0.20 × Distance
+ 0.15 × Availability
+ 0.25 × Workload Balance
+ 0.10 × Rating
Each component is normalized from 0 to 1.

The UI exposes all components, the resulting Fairness Score, the ML score, and an explanation such as strong skill match, nearby location, availability and lower workload.

For emergency requests, the system adds a small transparent proximity/availability boost without removing the fairness score.

ML
The matching ML service returns:

Random Forest probability
XGBoost probability
Combined ML score
The combined ML score is:

0.5 × Random Forest probability
+ 0.5 × XGBoost probability
The fairness formula remains visible and is not replaced by the ML model.

Demand forecasting
GET /forecast generates synthetic historical-like service demand and trains a Random Forest regressor for a demonstration forecast. This must be replaced with real anonymized booking history for production.

Booking lifecycle
Customer searches
      ↓
Fair + AI recommendation
      ↓
Customer requests worker
      ↓
Worker notified in real time
      ↓
Worker accepts
      ↓
Worker starts job
      ↓
Worker completes job
      ↓
Customer pays (demo flow)
      ↓
Digital invoice
      ↓
Customer rating + feedback
Statuses:

requested
matched
accepted
in_progress
completed
cancelled
API endpoints
Auth
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Workers
GET   /api/workers
GET   /api/workers/me
POST  /api/workers
GET   /api/workers/:id
PATCH /api/workers/:id
PATCH /api/workers/:id/verify
Matching
POST /api/matching/recommend
Bookings
POST  /api/bookings
GET   /api/bookings
GET   /api/bookings/:id
PATCH /api/bookings/:id/status
POST  /api/bookings/:id/pay
POST  /api/bookings/:id/rating
GET   /api/bookings/:id/invoice
Admin
GET /api/admin/stats
GET /api/admin/workers
GET /api/admin/bookings
GET /api/admin/fairness
GET /api/admin/demand-forecast
Role permissions
Customer
Can:

Search for eligible workers
Create bookings
Cancel requested bookings
Track status
Pay after completion using the demo flow
Rate completed jobs
Cannot:

Access admin endpoints
Verify workers
Modify worker profiles
Change their role
Worker
Can:

Manage own profile
Set availability
View own jobs
Accept/reject requests
Start and complete jobs
View welfare/certification information
Cannot:

Verify themselves
Modify another worker
Access admin endpoints
Admin
Can:

View platform statistics
Verify/reject worker profiles
Monitor bookings
Monitor workload and fairness
View demand forecast
Multilingual system
The UI uses:

en = English
hi = हिन्दी
kn = ಕನ್ನಡ
Translations live in:

frontend/src/i18n/
Selected language is stored as:

gigsetu_language
and restored on the next visit.

Security
JWT authentication
bcrypt password hashing
Role authorization on the backend
Zod input validation for authentication
Authentication rate limiting
CORS configuration
Environment variables for secrets
Backend filtering for verified/available worker recommendations
No password hashes are returned to clients
No real payment credentials are collected by the prototype
SIH demo flow
Open the landing page.
Demonstrate English → Hindi → Kannada.
Login as customer.
Select Electrician.
Enter Need fan repair.
Use the Bangalore default location.
Find workers.
Show the Fairness Score breakdown and AI score.
Request the best fair match.
Switch to worker account.
Accept the request.
Switch to customer and show the real-time acceptance notification.
Worker starts the job.
Customer sees In Progress.
Worker completes the job.
Customer completes the demo payment.
Show the invoice.
Submit a rating and feedback.
Login as admin.
Show verification, workload/fairness monitoring and AI demand forecast.
Prototype limitations / production roadmap
Payment gateway should be replaced with an audited Razorpay/other gateway integration.
Insurance/welfare should connect to verified cooperative/insurer systems.
Demand forecasting should use real anonymized historical booking data.
Maps can be upgraded from coordinate entry/browser geolocation to OpenStreetMap/Google Maps.
SMS/WhatsApp notifications can be added.
Native Android/iOS clients can consume the same REST/Socket.IO APIs.
Cloud deployment can use managed MongoDB, containerized services and HTTPS.
Worker certification should connect to cooperative-approved certification sources.
Troubleshooting
npm is not recognized or PowerShell blocks npm
Use:

npm.cmd install
npm.cmd run dev
MongoDB connection refused
Check:

Get-Service MongoDB
Start it if necessary:

Start-Service MongoDB
ML service does not respond
Run:

.venv\Scripts\python.exe app.py
and check:

http://localhost:8000/health
Frontend cannot call the backend
Make sure all three services are running:

MongoDB
Backend :5000
ML      :8000
Frontend:5173
