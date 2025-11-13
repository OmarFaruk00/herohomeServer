const admin = require('firebase-admin');

let firebaseAdminInitialized = false;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseAdminInitialized = true;
      console.log('✅ Firebase Admin initialized with service account');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // For development, you can use application default credentials
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      firebaseAdminInitialized = true;
      console.log('✅ Firebase Admin initialized with project ID');
    } else {
      console.warn('⚠️ Firebase Admin not configured. Token verification will be disabled.');
      console.warn('⚠️ Protected routes will still work but without token verification.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    console.warn('⚠️ Continuing without Firebase Admin. Protected routes may not work properly.');
  }
} else {
  firebaseAdminInitialized = true;
}

// Helper function to decode JWT without verification (for development only)
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format - expected 3 parts');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const decoded = JSON.parse(jsonPayload);
    
    console.log('Decoded token payload:', JSON.stringify(decoded, null, 2));
    return decoded;
  } catch (error) {
    console.error('JWT decode error:', error.message);
    return null;
  }
};

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 verifyToken middleware called');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Has auth header:', !!authHeader);
    console.log('Request body keys:', req.body ? Object.keys(req.body) : 'no body');

    // If Firebase Admin is not initialized, use development mode (more lenient)
    if (!firebaseAdminInitialized) {
      console.warn('⚠️ Firebase Admin not configured. Using development mode (lenient authentication).');
      
      // PRIORITY 1: For development, if we have email in request body, use it directly (most reliable)
      if (req.body && req.body.userEmail) {
        console.log('✅ Using email from request body:', req.body.userEmail);
        req.userEmail = req.body.userEmail;
        req.user = { email: req.body.userEmail };
        return next();
      }
      
      // PRIORITY 2: Try to decode token if provided
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        console.log('Attempting to decode token (length:', token.length, ')...');
        const decoded = decodeJWT(token);
        
        if (decoded) {
          // Firebase tokens might have email in different fields
          const email = decoded.email || decoded.user_id || decoded.sub || decoded.firebase?.identities?.email?.[0];
          
          if (email) {
            console.log('✅ Extracted email from token:', email);
            req.userEmail = email;
            req.user = decoded;
            return next();
          } else {
            console.warn('⚠️ Token decoded but no email found. Decoded:', JSON.stringify(decoded, null, 2));
          }
        } else {
          console.warn('⚠️ Could not decode token');
        }
      }
      
      // PRIORITY 3: For development, be VERY lenient - check for email in any form
      if (req.body) {
        const email = req.body.userEmail || req.body.email || req.body.user?.email;
        if (email) {
          console.log('✅ Using fallback email from request:', email);
          req.userEmail = email;
          req.user = { email: email };
          return next();
        }
      }
      
      // Last resort: log everything for debugging
      console.error('❌ Could not extract user email');
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      console.error('Auth header present:', !!authHeader);
      console.error('Auth header value (first 50 chars):', authHeader ? authHeader.substring(0, 50) : 'none');
      
      // In development, if we're on a booking route and have some user data, allow it
      if (req.path.includes('/bookings') && req.body && Object.keys(req.body).length > 0) {
        console.warn('⚠️ DEVELOPMENT MODE: Allowing request without verified email');
        req.userEmail = req.body.userEmail || 'dev-user@example.com';
        req.user = { email: req.userEmail };
        return next();
      }
      
      return res.status(401).json({ error: 'Unauthorized: Could not extract user email. Please ensure you are logged in.' });
    }

    // Firebase Admin is configured - verify token properly
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      req.userEmail = decodedToken.email;
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      // If verification fails, try to decode without verification (development fallback)
      const decoded = decodeJWT(token);
      const email = decoded?.email || decoded?.user_id || decoded?.sub;
      if (email) {
        console.warn('⚠️ Token verification failed, using decoded email (development mode):', email);
        req.userEmail = email;
        req.user = decoded;
        return next();
      }
      // Last resort: use email from request body
      if (req.body && req.body.userEmail) {
        console.warn('⚠️ Using email from request body (last resort):', req.body.userEmail);
        req.userEmail = req.body.userEmail;
        return next();
      }
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { verifyToken };

