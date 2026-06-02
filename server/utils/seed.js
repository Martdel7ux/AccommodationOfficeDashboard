const { data, save, nextId } = require('../db');

const LISTINGS = [
  {
    first_name: 'Andreas', last_name: 'Papadopoulos', phone: '+357 99 123456', email: 'andreas.papa@email.com',
    property_type: 'apartment', bedrooms: 2, price: 750,
    address: '14 Makarios Avenue, Nicosia 1065', availability_date: '2024-02-01',
    availability_status: 'available', target_audience: 'both',
    furnishing_status: 'fully-furnished', walking_distance: true,
    description: 'Bright and spacious 2-bedroom apartment located just a 5-minute walk from the University. Modern kitchen, air conditioning in all rooms, and a private balcony with city views. Ideal for students seeking comfort and convenience.',
  },
  {
    first_name: 'Maria', last_name: 'Georgiou', phone: '+357 96 789012', email: 'maria.georgiou@hotmail.com',
    property_type: 'studio', bedrooms: null, price: 480,
    address: '7 Pindarou Street, Nicosia 1060', availability_date: '2024-01-15',
    availability_status: 'available', target_audience: 'erasmus',
    furnishing_status: 'fully-furnished', walking_distance: true,
    description: 'Cozy fully-furnished studio apartment, perfect for Erasmus students. All utilities included in the rent. High-speed internet, weekly cleaning service, and 24/7 building security.',
  },
  {
    first_name: 'Christos', last_name: 'Stavrou', phone: '+357 97 345678', email: 'christos.s@gmail.com',
    property_type: 'apartment', bedrooms: 1, price: 600,
    address: '22 Athalassas Avenue, Nicosia 2107', availability_date: '2024-03-01',
    availability_status: 'available', target_audience: 'full-time',
    furnishing_status: 'semi-furnished', walking_distance: false,
    description: 'Modern 1-bedroom apartment with open-plan kitchen/living area. Located in a quiet residential neighborhood 15 minutes from campus by bus. Parking space included.',
  },
  {
    first_name: 'Elena', last_name: 'Charalambous', phone: '+357 99 654321', email: 'elena.char@outlook.com',
    property_type: 'house', bedrooms: 3, price: 1200,
    address: '5 Strovolos Avenue, Nicosia 2042', availability_date: '2024-02-15',
    availability_status: 'available', target_audience: 'both',
    furnishing_status: 'semi-furnished', walking_distance: false,
    description: 'Spacious 3-bedroom house with garden, ideal for a group of students sharing. Large living room, 2 bathrooms, and a private garden with BBQ area. Bus stop directly outside.',
  },
  {
    first_name: 'Nikos', last_name: 'Andreou', phone: '+357 96 111222', email: 'nikos.andreou@gmail.com',
    property_type: 'room', bedrooms: 1, price: 320,
    address: '31 Nicosia Old Town, 1010', availability_date: '2024-01-20',
    availability_status: 'available', target_audience: 'erasmus',
    furnishing_status: 'fully-furnished', walking_distance: true,
    description: 'Private room in a shared 4-bedroom student house. Common areas include kitchen, living room, and 2 bathrooms. Walking distance to the University main campus and city center.',
  },
  {
    first_name: 'Sofia', last_name: 'Ioannou', phone: '+357 97 222333', email: 'sofia.ioannou@yahoo.com',
    property_type: 'apartment', bedrooms: 2, price: 820,
    address: '9 Engomi District, Nicosia 2413', availability_date: '2023-12-01',
    availability_status: 'unavailable', target_audience: 'both',
    furnishing_status: 'fully-furnished', walking_distance: false,
    description: 'Upscale 2-bedroom apartment in the sought-after Engomi area. Floor-to-ceiling windows, designer furniture, smart TV, and gym access included. Currently occupied.',
  },
  {
    first_name: 'Petros', last_name: 'Kyriacou', phone: '+357 99 333444', email: 'p.kyriacou@unic.ac.cy',
    property_type: 'apartment', bedrooms: 3, price: 1050,
    address: '18 Acropolis, Nicosia 2006', availability_date: '2024-04-01',
    availability_status: 'available', target_audience: 'full-time',
    furnishing_status: 'semi-furnished', walking_distance: false,
    description: 'Large 3-bedroom apartment in a modern complex with swimming pool and covered parking. Suitable for 3 students sharing. Spacious balcony with mountain views.',
  },
  {
    first_name: 'Irini', last_name: 'Loizou', phone: '+357 96 444555', email: 'irini.l@cablenet.com.cy',
    property_type: 'studio', bedrooms: null, price: 520,
    address: '3 Kypranoros Street, Nicosia 1061', availability_date: '2024-01-10',
    availability_status: 'available', target_audience: 'erasmus',
    furnishing_status: 'fully-furnished', walking_distance: true,
    description: 'Modern studio apartment in the heart of Nicosia. Minutes from campus on foot. Perfect for single Erasmus students. All bills included.',
  },
  {
    first_name: 'Costas', last_name: 'Petrou', phone: '+357 97 555666', email: 'costas.petrou@hotmail.com',
    property_type: 'apartment', bedrooms: 1, price: 650,
    address: '45 Deryneia Street, Nicosia 2015', availability_date: '2024-02-20',
    availability_status: 'unavailable', target_audience: 'full-time',
    furnishing_status: 'semi-furnished', walking_distance: false,
    description: 'Well-maintained 1-bedroom apartment with fitted kitchen and wardrobes. Short drive to university. Quiet neighborhood. Currently under renovation, available from March.',
  },
  {
    first_name: 'Anna', last_name: 'Economou', phone: '+357 99 777888', email: 'a.economou@gmail.com',
    property_type: 'house', bedrooms: 2, price: 900,
    address: '12 Lakatamia, Nicosia 2300', availability_date: '2024-03-15',
    availability_status: 'available', target_audience: 'both',
    furnishing_status: 'fully-furnished', walking_distance: false,
    description: 'Charming 2-bedroom house with a beautiful garden. Perfect for two students. Quiet suburb with excellent bus connections to the university. Pet-friendly upon request.',
  },
  {
    first_name: 'Giorgos', last_name: 'Nicolaou', phone: '+357 96 888999', email: 'g.nicolaou@outlook.com',
    property_type: 'apartment', bedrooms: 2, price: 780,
    address: '60 Ledras Street, Nicosia 1011', availability_date: '2024-01-25',
    availability_status: 'available', target_audience: 'erasmus',
    furnishing_status: 'fully-furnished', walking_distance: true,
    description: 'Stylish 2-bedroom apartment on the famous Ledras Street. Walking distance to university, shops, cafes, and nightlife. Fully furnished with high-speed fibre internet.',
  },
  {
    first_name: 'Despina', last_name: 'Theocharous', phone: '+357 97 999000', email: 'despina.t@email.com',
    property_type: 'room', bedrooms: 1, price: 280,
    address: '8 Agios Dometios, Nicosia 2360', availability_date: '2024-02-05',
    availability_status: 'available', target_audience: 'full-time',
    furnishing_status: 'fully-furnished', walking_distance: false,
    description: 'Single room in a well-maintained shared apartment with 2 other students. Shared bathroom and kitchen. Inclusive of all bills and WiFi. Clean and safe environment.',
  },
];

if (data.accommodations.length > 0) {
  console.log(`ℹ️   Database already has ${data.accommodations.length} records — skipping seed.`);
  process.exit(0);
}

const now = new Date().toISOString();
for (const l of LISTINGS) {
  data.accommodations.push({ id: nextId('accommodations'), ...l, created_at: now, updated_at: now });
}
save();
console.log(`✅  Seeded ${LISTINGS.length} sample accommodations into accommodation.json`);
