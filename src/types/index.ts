export type UserRole = 'DONOR' | 'SEEKER' | 'BUSINESS' | 'ADMIN';
export type ExchangeMode = 'SELL' | 'DONATE' | 'SWAP';
export type Condition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'MIXED';
export type ListingStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'EXPIRED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
export type TransactionStatus = 'REQUESTED' | 'ACCEPTED' | 'NEGOTIATING' | 'CONFIRMED' | 'COMPLETED';
export type CircularityPath = 'DIRECT_REUSE' | 'REPAIR_AND_REUSE' | 'REPURPOSE' | 'RECYCLE';
export type NotificationType = 'MATCH' | 'OFFER' | 'TRANSACTION' | 'REQUIREMENT' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  trustScore: number;
  verifiedPhone: boolean;
  verifiedEmail: boolean;
  verifiedBusiness?: boolean;
  successfulTransactions: number;
  responseRate: number;
  avatar?: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  type: string;
  gstin?: string;
  location: string;
  verified: boolean;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
}

export interface ResourceListing {
  id: string;
  donorId: string;
  material: string;
  category: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  condition: Condition;
  price?: number;
  location: string;
  distanceKm: number;
  availableUntil: string;
  mode: ExchangeMode;
  status: ListingStatus;
  image: string;
  trustScore: number;
  circularityScore: number;
  urgencyScore: number;
  aiConfidence?: number;
}

export interface Requirement {
  id: string;
  seekerId: string;
  material: string;
  quantity: number;
  unit: string;
  maxPrice?: number;
  condition?: Condition;
  location: string;
  radiusKm: number;
  neededBy: string;
  notes?: string;
  status: 'ACTIVE' | 'FULFILLED' | 'CLOSED';
}

export interface Match {
  id: string;
  resourceId: string;
  requirementId: string;
  score: number;
  distanceScore: number;
  needScore: number;
  priceScore: number;
  availabilityScore: number;
  trustScore: number;
  circularityScore: number;
  urgencyScore: number;
  circularityPath: CircularityPath;
  explanation: string[];
}

export interface Offer {
  id: string;
  listingId: string;
  seekerId: string;
  quantity: number;
  price: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  donorId: string;
  seekerId: string;
  material: string;
  quantity: number;
  unit: string;
  agreedPrice: number;
  total: number;
  pickupTime: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface Receipt {
  id: string;
  transactionId: string;
  issuedAt: string;
}

export interface ImpactRecord {
  materialRecovered: number;
  valueRecovered: number;
  successfulTransactions: number;
  estimatedWasteAvoided: number;
  reuseCycles: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
