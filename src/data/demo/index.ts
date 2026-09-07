import type { ImpactRecord, Match, Offer, Requirement, ResourceListing, Transaction, User } from '../../types';

export const demoUsers: User[] = [
  {
    id: 'u1', name: 'Vignesh Waran', email: 'vignesh@example.com', phone: '+91 98765 43210', role: 'DONOR',
    location: 'Chennai', trustScore: 94, verifiedPhone: true, verifiedEmail: true, successfulTransactions: 18, responseRate: 98,
  },
  {
    id: 'u2', name: 'Sri Metals', email: 'contact@srimetals.example', phone: '+91 98765 11223', role: 'BUSINESS',
    location: 'Guindy, Chennai', trustScore: 96, verifiedPhone: true, verifiedEmail: true, verifiedBusiness: true, successfulTransactions: 61, responseRate: 97,
  },
  {
    id: 'u3', name: 'GreenLoop Foundation', email: 'hello@greenloop.example', phone: '+91 90000 11001', role: 'SEEKER',
    location: 'Adyar, Chennai', trustScore: 91, verifiedPhone: true, verifiedEmail: true, successfulTransactions: 33, responseRate: 93,
  },
];

export const demoListings: ResourceListing[] = [
  {
    id: 'r1', donorId: 'u2', material: 'Copper Wire', category: 'Metal', title: 'Copper Wire Offcuts',
    description: 'Clean copper wire offcuts from electrical fabrication.', quantity: 100, unit: 'kg', condition: 'GOOD', price: 605,
    location: 'Guindy, Chennai', distanceKm: 2.8, availableUntil: '2026-09-04T18:00:00', mode: 'SELL', status: 'ACTIVE',
    image: '/material-copper.svg',
    trustScore: 96, circularityScore: 93, urgencyScore: 78, aiConfidence: 94,
  },
  {
    id: 'r2', donorId: 'u1', material: 'Used Office Chairs', category: 'Furniture', title: 'Ergonomic Office Chairs',
    description: 'Used office chairs in good condition, ideal for classrooms and small offices.', quantity: 15, unit: 'units', condition: 'GOOD', price: 1500,
    location: 'Velachery, Chennai', distanceKm: 4.1, availableUntil: '2026-09-06T18:00:00', mode: 'SELL', status: 'ACTIVE',
    image: '/material-chairs.svg',
    trustScore: 94, circularityScore: 97, urgencyScore: 52,
  },
  {
    id: 'r3', donorId: 'u1', material: 'Cardboard', category: 'Packaging', title: 'Clean Corrugated Cardboard',
    description: 'Flattened, clean cardboard sheets from an event inventory.', quantity: 80, unit: 'kg', condition: 'EXCELLENT', price: 0,
    location: 'Anna Nagar, Chennai', distanceKm: 6.3, availableUntil: '2026-09-05T15:00:00', mode: 'DONATE', status: 'ACTIVE',
    image: '/material-cardboard.svg',
    trustScore: 94, circularityScore: 89, urgencyScore: 65,
  },
  {
    id: 'r4', donorId: 'u2', material: 'Aluminium Sheets', category: 'Metal', title: 'Reusable Aluminium Sheet Stack',
    description: 'Assorted aluminium sheets from fabrication surplus, suitable for repair or repurposing.', quantity: 45, unit: 'kg', condition: 'GOOD', price: 210,
    location: 'Ambattur, Chennai', distanceKm: 9.4, availableUntil: '2026-09-08T18:00:00', mode: 'SELL', status: 'ACTIVE',
    image: '/raw-materials-light.svg',
    trustScore: 96, circularityScore: 91, urgencyScore: 58,
  },
  {
    id: 'r5', donorId: 'u1', material: 'Electronic Components', category: 'Electronics', title: 'Sorted Electronic Components',
    description: 'Mixed working electronic parts including connectors, boards and small modules.', quantity: 120, unit: 'units', condition: 'MIXED', price: 35,
    location: 'T Nagar, Chennai', distanceKm: 5.7, availableUntil: '2026-09-07T15:00:00', mode: 'SELL', status: 'ACTIVE',
    image: '/material-electronics.svg',
    trustScore: 94, circularityScore: 84, urgencyScore: 70,
  },
];

export const demoRequirements: Requirement[] = [
  {
    id: 'req1', seekerId: 'u3', material: 'Copper Wire', quantity: 80, unit: 'kg', maxPrice: 620,
    location: 'Adyar, Chennai', radiusKm: 10, neededBy: '2026-09-04T17:00:00', status: 'ACTIVE', notes: 'Prefer clean insulated wire.',
  },
  {
    id: 'req2', seekerId: 'u3', material: 'Used Office Chairs', quantity: 10, unit: 'units', maxPrice: 1800,
    location: 'Adyar, Chennai', radiusKm: 15, neededBy: '2026-09-06T17:00:00', status: 'ACTIVE', notes: 'Functional condition required.',
  },
];

export const demoMatches: Match[] = [
  {
    id: 'm1', resourceId: 'r1', requirementId: 'req1', score: 96, distanceScore: 91, needScore: 98, priceScore: 97,
    availabilityScore: 95, trustScore: 96, circularityScore: 93, urgencyScore: 92, circularityPath: 'DIRECT_REUSE',
    explanation: ['Material is an exact match', '80/100 kg requirement can be fulfilled', 'Price is within seeker budget', 'Within preferred 10 km radius', 'High-trust verified business'],
  },
  {
    id: 'm2', resourceId: 'r2', requirementId: 'req2', score: 89, distanceScore: 82, needScore: 92, priceScore: 90,
    availabilityScore: 94, trustScore: 94, circularityScore: 97, urgencyScore: 76, circularityPath: 'DIRECT_REUSE',
    explanation: ['Material and condition are compatible', '10/15 units can be fulfilled', 'Within preferred radius', 'High circularity through direct reuse'],
  },
];

export const demoOffers: Offer[] = [
  { id: 'o1', listingId: 'r1', seekerId: 'u3', quantity: 80, price: 590, message: 'Can confirm 80 kg if pickup is available tomorrow.', status: 'PENDING', createdAt: '2026-09-03T09:30:00' },
  { id: 'o2', listingId: 'r2', seekerId: 'u3', quantity: 10, price: 1350, message: 'We can take ten chairs together.', status: 'COUNTERED', createdAt: '2026-09-03T10:00:00' },
];

export const demoTransactions: Transaction[] = [
  { id: 'RAW-10294', listingId: 'r3', donorId: 'u1', seekerId: 'u3', material: 'Cardboard', quantity: 80, unit: 'kg', agreedPrice: 0, total: 0, pickupTime: '2026-09-03T16:30:00', status: 'COMPLETED', createdAt: '2026-09-01T12:00:00' },
  { id: 'RAW-10281', listingId: 'r2', donorId: 'u1', seekerId: 'u3', material: 'Used Office Chairs', quantity: 8, unit: 'units', agreedPrice: 1400, total: 11200, pickupTime: '2026-08-31T15:00:00', status: 'COMPLETED', createdAt: '2026-08-29T10:00:00' },
];

export const demoImpact: ImpactRecord = {
  materialRecovered: 1240,
  valueRecovered: 82400,
  successfulTransactions: 36,
  estimatedWasteAvoided: 312,
  reuseCycles: 57,
};

export const demoNotifications = [
  { id: 'n1', userId: 'u1', type: 'OFFER' as const, title: 'New RAW offer', message: 'GreenLoop Foundation offered ₹590/kg for 80 kg of Copper Wire.', read: false, createdAt: '2026-09-03T10:45:00', link: '/donor/offers' },
  { id: 'n2', userId: 'u1', type: 'MATCH' as const, title: 'High-value match found', message: 'A seeker nearby currently needs 80 kg of your Copper Wire.', read: false, createdAt: '2026-09-03T10:20:00', link: '/donor/listings' },
  { id: 'n3', userId: 'u1', type: 'SYSTEM' as const, title: 'RAW impact updated', message: 'Your network impact now shows 1.24 tonnes recovered.', read: true, createdAt: '2026-09-02T18:00:00', link: '/donor/impact' },
];
