const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const services = [
  // 1. Electrical Services
  {
    serviceName: "Electrician on-demand",
    category: "Electrical Services",
    price: 2000,
    description: "Professional electrician available for immediate service. Expert in all electrical repairs and installations.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Expert Electricians",
    providerEmail: "electrician@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Fan/Light installation",
    category: "Electrical Services",
    price: 3500,
    description: "Installation of ceiling fans, lights, and electrical fixtures. Professional and safe installation guaranteed.",
    imageURL: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
    providerName: "Expert Electricians",
    providerEmail: "electrician@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Switchboard repair",
    category: "Electrical Services",
    price: 5500,
    description: "Expert switchboard repair and maintenance. Safety certified electricians for all electrical panel work.",
    imageURL: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    providerName: "Expert Electricians",
    providerEmail: "electrician@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Wiring and short-circuit fix",
    category: "Electrical Services",
    price: 7000,
    description: "Complete wiring solutions and short-circuit repairs. Professional diagnosis and permanent fixes.",
    imageURL: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    providerName: "Expert Electricians",
    providerEmail: "electrician@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Inverter/Generator setup",
    category: "Electrical Services",
    price: 15000,
    description: "Professional inverter and generator installation and setup. Backup power solutions for your home.",
    imageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    providerName: "Expert Electricians",
    providerEmail: "electrician@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 2. Plumbing Services
  {
    serviceName: "Pipe leakage repair",
    category: "Plumbing Services",
    price: 2500,
    description: "Quick and efficient pipe leakage repair. Expert plumbers with all necessary tools and materials.",
    imageURL: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    providerName: "Pro Plumbers",
    providerEmail: "plumber@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Bathroom fittings installation",
    category: "Plumbing Services",
    price: 7000,
    description: "Complete bathroom fittings installation including taps, showers, and fixtures. Professional installation service.",
    imageURL: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80",
    providerName: "Pro Plumbers",
    providerEmail: "plumber@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Water tank cleaning",
    category: "Plumbing Services",
    price: 3500,
    description: "Thorough water tank cleaning and sanitization. Ensures clean and safe water supply for your home.",
    imageURL: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
    providerName: "Pro Plumbers",
    providerEmail: "plumber@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Drain blockage fix",
    category: "Plumbing Services",
    price: 2000,
    description: "Quick drain blockage removal using professional tools. Effective solutions for clogged drains and pipes.",
    imageURL: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    providerName: "Pro Plumbers",
    providerEmail: "plumber@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Tap or shower replacement",
    category: "Plumbing Services",
    price: 3000,
    description: "Professional tap and shower replacement service. Modern fixtures installation with warranty.",
    imageURL: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    providerName: "Pro Plumbers",
    providerEmail: "plumber@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 3. Cleaning Services
  {
    serviceName: "Home deep cleaning",
    category: "Cleaning Services",
    price: 9000,
    description: "Comprehensive deep cleaning service for your entire home. Professional cleaners with eco-friendly products.",
    imageURL: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    providerName: "Clean Home Services",
    providerEmail: "cleaning@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Kitchen cleaning",
    category: "Cleaning Services",
    price: 3500,
    description: "Thorough kitchen cleaning including appliances, cabinets, and surfaces. Sparkling clean kitchen guaranteed.",
    imageURL: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
    providerName: "Clean Home Services",
    providerEmail: "cleaning@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Bathroom cleaning",
    category: "Cleaning Services",
    price: 2500,
    description: "Professional bathroom cleaning and sanitization. Deep cleaning of tiles, fixtures, and all surfaces.",
    imageURL: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80",
    providerName: "Clean Home Services",
    providerEmail: "cleaning@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Sofa and carpet cleaning",
    category: "Cleaning Services",
    price: 5500,
    description: "Professional sofa and carpet cleaning using steam cleaning technology. Removes stains and odors effectively.",
    imageURL: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    providerName: "Clean Home Services",
    providerEmail: "cleaning@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Office/Commercial space cleaning",
    category: "Cleaning Services",
    price: 15000,
    description: "Complete office and commercial space cleaning service. Professional cleaning for business premises.",
    imageURL: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    providerName: "Clean Home Services",
    providerEmail: "cleaning@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 4. Appliance Repair
  {
    serviceName: "AC servicing & gas refill",
    category: "Appliance Repair",
    price: 7000,
    description: "Professional AC servicing, cleaning, and gas refill. Expert technicians for all AC brands and models.",
    imageURL: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    providerName: "Appliance Experts",
    providerEmail: "appliance@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Refrigerator repair",
    category: "Appliance Repair",
    price: 4500,
    description: "Expert refrigerator repair service. Fix all issues including cooling problems, leaks, and electrical faults.",
    imageURL: "https://images.unsplash.com/photo-1571171637578-41bc2dd3cd38?w=600&q=80",
    providerName: "Appliance Experts",
    providerEmail: "appliance@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Washing machine repair",
    category: "Appliance Repair",
    price: 4000,
    description: "Professional washing machine repair for all brands. Fix drainage, spinning, and electrical issues.",
    imageURL: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    providerName: "Appliance Experts",
    providerEmail: "appliance@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Microwave or oven fix",
    category: "Appliance Repair",
    price: 3000,
    description: "Expert microwave and oven repair service. Fix heating issues, door problems, and electrical faults.",
    imageURL: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
    providerName: "Appliance Experts",
    providerEmail: "appliance@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "TV and home theater setup",
    category: "Appliance Repair",
    price: 3500,
    description: "Professional TV and home theater installation and setup. Mounting, wiring, and configuration service.",
    imageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    providerName: "Appliance Experts",
    providerEmail: "appliance@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 5. Carpentry & Furniture
  {
    serviceName: "Furniture repair",
    category: "Carpentry & Furniture",
    price: 4500,
    description: "Expert furniture repair and restoration. Fix broken chairs, tables, and all types of wooden furniture.",
    imageURL: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&q=80",
    providerName: "Master Carpenters",
    providerEmail: "carpenter@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Door/Window fitting",
    category: "Carpentry & Furniture",
    price: 9000,
    description: "Professional door and window installation and fitting. Custom sizes and styles available.",
    imageURL: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    providerName: "Master Carpenters",
    providerEmail: "carpenter@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Custom shelf or cabinet design",
    category: "Carpentry & Furniture",
    price: 15000,
    description: "Custom shelf and cabinet design and installation. Tailored solutions for your space and needs.",
    imageURL: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&q=80",
    providerName: "Master Carpenters",
    providerEmail: "carpenter@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Bed or table assembling",
    category: "Carpentry & Furniture",
    price: 2500,
    description: "Professional bed and table assembly service. Expert assembly of flat-pack furniture.",
    imageURL: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    providerName: "Master Carpenters",
    providerEmail: "carpenter@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 6. Laundry & Pest Control
  {
    serviceName: "Dry cleaning pickup & delivery",
    category: "Laundry & Pest Control",
    price: 2000,
    description: "Convenient dry cleaning service with pickup and delivery. Professional cleaning for all fabric types.",
    imageURL: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    providerName: "Laundry Pro",
    providerEmail: "laundry@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Pest control (cockroach, termite, mosquito)",
    category: "Laundry & Pest Control",
    price: 7000,
    description: "Comprehensive pest control service for cockroaches, termites, and mosquitoes. Safe and effective treatment.",
    imageURL: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    providerName: "Pest Control Experts",
    providerEmail: "pestcontrol@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Sanitization services",
    category: "Laundry & Pest Control",
    price: 9000,
    description: "Professional sanitization service for homes and offices. Complete disinfection and sanitization.",
    imageURL: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    providerName: "Pest Control Experts",
    providerEmail: "pestcontrol@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 7. Gardening & Outdoor
  {
    serviceName: "Lawn mowing",
    category: "Gardening & Outdoor",
    price: 3500,
    description: "Professional lawn mowing and grass cutting service. Keep your lawn neat and well-maintained.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Garden Care Services",
    providerEmail: "gardening@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Plant care & watering",
    category: "Gardening & Outdoor",
    price: 2500,
    description: "Expert plant care and watering service. Maintain healthy and beautiful plants in your garden.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Garden Care Services",
    providerEmail: "gardening@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Garden cleaning",
    category: "Gardening & Outdoor",
    price: 4500,
    description: "Complete garden cleaning and maintenance service. Remove weeds, trim plants, and clean garden areas.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Garden Care Services",
    providerEmail: "gardening@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Fence or gate repair",
    category: "Gardening & Outdoor",
    price: 7000,
    description: "Professional fence and gate repair service. Fix broken fences, gates, and outdoor structures.",
    imageURL: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    providerName: "Garden Care Services",
    providerEmail: "gardening@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 8. Moving & Shifting
  {
    serviceName: "Home shifting",
    category: "Moving & Shifting",
    price: 25000,
    description: "Complete home shifting service with packing, loading, transport, and unpacking. Safe and reliable moving.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Move Masters",
    providerEmail: "moving@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Office relocation",
    category: "Moving & Shifting",
    price: 40000,
    description: "Professional office relocation service. Handle all office equipment and furniture with care.",
    imageURL: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    providerName: "Move Masters",
    providerEmail: "moving@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Furniture transport",
    category: "Moving & Shifting",
    price: 9000,
    description: "Safe furniture transport service. Professional handling and delivery of your furniture items.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Move Masters",
    providerEmail: "moving@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Packing/unpacking services",
    category: "Moving & Shifting",
    price: 7000,
    description: "Professional packing and unpacking service. Secure packing materials and careful handling.",
    imageURL: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    providerName: "Move Masters",
    providerEmail: "moving@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 9. Home Beauty & Personal Care
  {
    serviceName: "Salon at home",
    category: "Home Beauty & Personal Care",
    price: 5500,
    description: "Professional salon services at your home. Haircut, styling, coloring, and beauty treatments.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Beauty Home Services",
    providerEmail: "beauty@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Massage service",
    category: "Home Beauty & Personal Care",
    price: 7000,
    description: "Relaxing massage service at home. Professional therapists for therapeutic and relaxation massage.",
    imageURL: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    providerName: "Beauty Home Services",
    providerEmail: "beauty@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Grooming & haircut",
    category: "Home Beauty & Personal Care",
    price: 3500,
    description: "Professional grooming and haircut service at home. Expert barbers and stylists for men and women.",
    imageURL: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    providerName: "Beauty Home Services",
    providerEmail: "beauty@homehero.com",
    reviews: [],
    createdAt: new Date()
  },

  // 10. Vehicle Services
  {
    serviceName: "Car wash at home",
    category: "Vehicle Services",
    price: 2000,
    description: "Professional car wash service at your location. Complete exterior and interior cleaning.",
    imageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    providerName: "Auto Care Services",
    providerEmail: "vehicle@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Bike servicing",
    category: "Vehicle Services",
    price: 3500,
    description: "Complete bike servicing including oil change, brake check, and general maintenance.",
    imageURL: "https://images.unsplash.com/photo-1558980664-1db506751c6a?w=600&q=80",
    providerName: "Auto Care Services",
    providerEmail: "vehicle@homehero.com",
    reviews: [],
    createdAt: new Date()
  },
  {
    serviceName: "Battery replacement",
    category: "Vehicle Services",
    price: 9000,
    description: "Professional car and bike battery replacement service. Quality batteries with warranty.",
    imageURL: "https://images.unsplash.com/photo-1558980664-1db506751c6a?w=600&q=80",
    providerName: "Auto Care Services",
    providerEmail: "vehicle@homehero.com",
    reviews: [],
    createdAt: new Date()
  }
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('homehero');
    const servicesCollection = db.collection('services');

    // Clear existing services before adding new ones
    await servicesCollection.deleteMany({});
    console.log('Cleared existing services');

    // Insert all services
    const result = await servicesCollection.insertMany(services);
    console.log(`✅ Successfully inserted ${result.insertedCount} services!`);
    console.log('\nServices added:');
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.serviceName} - ${service.category} - ৳${service.price}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

seedDatabase();
