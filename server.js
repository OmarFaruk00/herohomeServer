const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { verifyToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://homehero-8e501.web.app',
  'https://homehero-8e501.firebaseapp.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now, can be restricted later
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB connection
let db;
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in .env file');
      console.error('⚠️ Server will run but database operations will fail');
      console.error('📝 Please add MONGODB_URI to backend/.env file');
      db = null;
      return;
    }
    
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('URI:', uri.substring(0, 20) + '...'); // Show first 20 chars only
    
    await client.connect();
    db = client.db('homehero');
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📦 Database: homehero');
    
    // Test the connection by counting services
    try {
      const serviceCount = await db.collection('services').countDocuments();
      console.log(`📊 Found ${serviceCount} services in database`);
    } catch (countError) {
      console.warn('⚠️ Could not count services (collection might be empty):', countError.message);
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Error code:', error.code);
    console.error('📝 Please check your MONGODB_URI in backend/.env file');
    console.error('💡 Make sure:');
    console.error('   1. MONGODB_URI is set correctly');
    console.error('   2. MongoDB Atlas IP whitelist includes your IP (0.0.0.0/0 for all)');
    console.error('   3. Network connection is working');
    db = null;
  }
}

connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'HomeHero API is running' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Get all services with search and filter
app.get('/api/services', async (req, res) => {
  try {
    // Check if database is connected
    if (!db) {
      console.error('⚠️ Database not connected - returning empty array');
      // Return empty array instead of error so frontend doesn't crash
      return res.json([]);
    }
    
    const { minPrice, maxPrice, search } = req.query;
    let query = {};
    
    // Price filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Search functionality - case-insensitive search by service name or category
    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const services = await db.collection('services').find(query).toArray();
    console.log(`✅ Found ${services.length} services`);
    res.json(services);
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
    console.error('Error details:', error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('MongoServerSelectionError')) {
      console.error('MongoDB server selection failed - connection issue');
      return res.json([]); // Return empty array instead of error
    }
    if (error.message && error.message.includes('MongoNetworkError')) {
      console.error('MongoDB network error - cannot reach server');
      return res.json([]); // Return empty array instead of error
    }
    
    // For any other error, return empty array to prevent frontend crash
    console.error('Unknown error, returning empty array');
    res.json([]);
  }
});

// Get top 6 rated services
app.get('/api/services/top-rated', async (req, res) => {
  try {
    const services = await db.collection('services')
      .find({ reviews: { $exists: true, $ne: [] } })
      .toArray();
    
    // Calculate average rating and sort
    const servicesWithRatings = services.map(service => {
      const avgRating = service.reviews && service.reviews.length > 0
        ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length
        : 0;
      return { ...service, avgRating };
    });
    
    servicesWithRatings.sort((a, b) => b.avgRating - a.avgRating);
    res.json(servicesWithRatings.slice(0, 6));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single service by ID
app.get('/api/services/:_id', async (req, res) => {
  try {
    const service = await db.collection('services').findOne({ _id: new ObjectId(req.params._id) });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get services by provider email (protected route)
app.get('/api/services/provider/:email', verifyToken, async (req, res) => {
  try {
    // Verify that the user is requesting their own services
    if (req.userEmail !== req.params.email) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own services' });
    }
    
    const services = await db.collection('services')
      .find({ providerEmail: req.params.email })
      .toArray();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new service (protected route)
app.post('/api/services', verifyToken, async (req, res) => {
  try {
    const service = {
      ...req.body,
      providerEmail: req.userEmail, // Ensure provider email matches authenticated user
      reviews: [],
      createdAt: new Date()
    };
    const result = await db.collection('services').insertOne(service);
    res.status(201).json({ ...service, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update service (protected route)
app.patch('/api/services/:_id', verifyToken, async (req, res) => {
  try {
    // Verify that the user owns this service
    const service = await db.collection('services').findOne({ _id: new ObjectId(req.params._id) });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    if (service.providerEmail !== req.userEmail) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own services' });
    }
    
    const result = await db.collection('services').updateOne(
      { _id: new ObjectId(req.params._id) },
      { $set: req.body }
    );
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete service (protected route)
app.delete('/api/services/:_id', verifyToken, async (req, res) => {
  try {
    // Verify that the user owns this service
    const service = await db.collection('services').findOne({ _id: new ObjectId(req.params._id) });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    if (service.providerEmail !== req.userEmail) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own services' });
    }
    
    const result = await db.collection('services').deleteOne({ _id: new ObjectId(req.params._id) });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review to service (protected route)
app.post('/api/services/:_id/reviews', verifyToken, async (req, res) => {
  try {
    const review = {
      userEmail: req.userEmail, // Use authenticated user's email
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date()
    };
    const result = await db.collection('services').updateOne(
      { _id: new ObjectId(req.params._id) },
      { $push: { reviews: review } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings by user email (protected route)
app.get('/api/bookings/:email', verifyToken, async (req, res) => {
  try {
    // Verify that the user is requesting their own bookings
    if (req.userEmail !== req.params.email) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own bookings' });
    }
    
    const bookings = await db.collection('bookings')
      .find({ userEmail: req.params.email })
      .toArray();
    
    // Populate service details
    const bookingsWithServices = await Promise.all(
      bookings.map(async (booking) => {
        const service = await db.collection('services').findOne({ _id: new ObjectId(booking.serviceId) });
        return { ...booking, service };
      })
    );
    
    res.json(bookingsWithServices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking (protected route)
app.post('/api/bookings', verifyToken, async (req, res) => {
  try {
    console.log('Booking request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User email from middleware:', req.userEmail);
    
    // Verify user cannot book their own service
    const service = await db.collection('services').findOne({ _id: new ObjectId(req.body.serviceId) });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    if (service.providerEmail === req.userEmail) {
      return res.status(403).json({ error: 'Forbidden: You cannot book your own service' });
    }
    
    const booking = {
      userEmail: req.userEmail, // Use authenticated user's email
      serviceId: req.body.serviceId,
      bookingDate: req.body.bookingDate,
      price: req.body.price,
      createdAt: new Date()
    };
    
    console.log('Creating booking:', JSON.stringify(booking, null, 2));
    const result = await db.collection('bookings').insertOne(booking);
    console.log('Booking created successfully:', result.insertedId);
    
    res.status(201).json({ ...booking, _id: result.insertedId });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete booking (protected route)
app.delete('/api/bookings/:_id', verifyToken, async (req, res) => {
  try {
    // Verify that the user owns this booking
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(req.params._id) });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.userEmail !== req.userEmail) {
      return res.status(403).json({ error: 'Forbidden: You can only cancel your own bookings' });
    }
    
    const result = await db.collection('bookings').deleteOne({ _id: new ObjectId(req.params._id) });
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get provider statistics (protected route)
app.get('/api/provider/stats/:email', verifyToken, async (req, res) => {
  try {
    // Verify that the user is requesting their own stats
    if (req.userEmail !== req.params.email) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own statistics' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const providerEmail = req.params.email;

    // Get all services by this provider
    const services = await db.collection('services')
      .find({ providerEmail: providerEmail })
      .toArray();

    const serviceIds = services.map(s => s._id.toString());

    // Get all bookings for this provider's services
    const bookings = await db.collection('bookings')
      .find({ serviceId: { $in: serviceIds } })
      .toArray();

    // Calculate statistics
    const totalServices = services.length;
    const totalBookings = bookings.length;
    
    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

    // Calculate average rating from all reviews across all services
    let totalRating = 0;
    let reviewCount = 0;
    services.forEach(service => {
      if (service.reviews && service.reviews.length > 0) {
        service.reviews.forEach(review => {
          totalRating += review.rating || 0;
          reviewCount++;
        });
      }
    });
    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(2) : 0;

    // Get bookings by month for chart data
    const bookingsByMonth = {};
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt || booking.bookingDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      bookingsByMonth[monthKey] = (bookingsByMonth[monthKey] || 0) + 1;
    });

    // Get revenue by month
    const revenueByMonth = {};
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt || booking.bookingDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (booking.price || 0);
    });

    // Get bookings by service for chart
    const bookingsByService = {};
    bookings.forEach(booking => {
      const service = services.find(s => s._id.toString() === booking.serviceId);
      if (service) {
        const serviceName = service.serviceName;
        bookingsByService[serviceName] = (bookingsByService[serviceName] || 0) + 1;
      }
    });

    // Format chart data - always return arrays even if empty
    const bookingsChartData = Object.entries(bookingsByMonth).length > 0
      ? Object.entries(bookingsByMonth)
          .map(([month, count]) => ({ month, bookings: count }))
          .sort((a, b) => a.month.localeCompare(b.month))
      : [];

    const revenueChartData = Object.entries(revenueByMonth).length > 0
      ? Object.entries(revenueByMonth)
          .map(([month, revenue]) => ({ month, revenue: parseFloat(revenue.toFixed(2)) }))
          .sort((a, b) => a.month.localeCompare(b.month))
      : [];

    const serviceBookingsChartData = Object.entries(bookingsByService).length > 0
      ? Object.entries(bookingsByService)
          .map(([serviceName, count]) => ({ serviceName, bookings: count }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 10) // Top 10 services
      : [];

    res.json({
      totalServices,
      totalBookings,
      totalRevenue: totalRevenue.toFixed(2),
      averageRating: parseFloat(averageRating),
      bookingsChartData,
      revenueChartData,
      serviceBookingsChartData
    });
  } catch (error) {
    console.error('Provider stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

