import type { Match, Notification, Offer, Requirement, ResourceListing, Transaction } from '../../types';
import {
  getApiMatches,
  getApiNotifications,
  getApiTransactions,
  markApiNotificationRead,
  updateApiTransaction,
} from '../api';
import { createListing as serviceCreateListing, getListings as serviceGetListings, updateListingStatus as serviceUpdateListingStatus } from '../listings';
import { createRequirement as serviceCreateRequirement, getRequirements as serviceGetRequirements, updateRequirementStatus as serviceUpdateRequirementStatus } from '../requirements';
import { createOffer as serviceCreateOffer, getOffersForSeeker as serviceGetOffersForSeeker, getOffersForDonor as serviceGetOffersForDonor, updateOfferStatus as serviceUpdateOfferStatus } from '../offers';

export type RepositoryResult<T> = { data: T | null; error: string | null };
const ok = <T>(data: T): RepositoryResult<T> => ({ data, error: null });
const fail = <T>(error: unknown): RepositoryResult<T> => ({ data: null, error: error instanceof Error ? error.message : String(error) });

export async function createListing(input: {
  donorId: string; material: string; category: string; title: string; description: string; quantity: number; unit: string;
  condition: string; price: number; location: string; availableUntil: string; mode: string; imageUrl?: string;
  lat?: number; lng?: number; trustScore?: number; circularityScore?: number; urgencyScore?: number; aiConfidence?: number;
}): Promise<RepositoryResult<ResourceListing>> {
  const result = await createApiListing({
    donorId: input.donorId, material: input.material, category: input.category, title: input.title, description: input.description,
    quantity: input.quantity, unit: input.unit, condition: input.condition, price: input.price, location: input.location,
    availableUntil: input.availableUntil, mode: input.mode, image: input.imageUrl, lat: input.lat, lng: input.lng,
    trustScore: input.trustScore, circularityScore: input.circularityScore, urgencyScore: input.urgencyScore, aiConfidence: input.aiConfidence,
  });
  if (result.error || !result.data) return fail<ResourceListing>(result.error || 'Unable to create listing');
  return ok(mapListing(result.data.listing));
}

export async function createRequirement(input: {
  seekerId: string; material: string; quantity: number; unit: string; maxPrice?: number; condition?: string;
  location: string; lat?: number; lng?: number; radiusKm: number; neededBy: string; notes?: string;
}): Promise<RepositoryResult<Requirement>> {
  const result = await createApiRequirement({
    seekerId: input.seekerId, material: input.material, quantity: input.quantity, unit: input.unit,
    maxPrice: input.maxPrice, condition: input.condition, location: input.location, lat: input.lat, lng: input.lng,
    radiusKm: input.radiusKm, neededBy: input.neededBy, notes: input.notes,
  });
  if (result.error || !result.data) return fail<Requirement>(result.error || 'Unable to create requirement');
  return ok(mapRequirement(result.data.requirement));
}

export async function listListings(): Promise<RepositoryResult<ResourceListing[]>> {
  const result = await getApiListings();
  if (result.error || !result.data) return fail<ResourceListing[]>(result.error || 'Unable to load listings');
  return ok((result.data.listings || []).map(mapListing));
}

export async function listRequirements(): Promise<RepositoryResult<Requirement[]>> {
  const result = await getApiRequirements();
  if (result.error || !result.data) return fail<Requirement[]>(result.error || 'Unable to load requirements');
  return ok((result.data.requirements || []).map(mapRequirement));
}

export async function listOffers(_forUserId: string, role: 'DONOR' | 'SEEKER'): Promise<RepositoryResult<Offer[]>> {
  const result = await getApiOffers(role);
  if (result.error || !result.data) return fail<Offer[]>(result.error || 'Unable to load offers');
  return ok((result.data.offers || []).map(mapOffer));
}

export async function createOffer(input: {
  listingId: string; seekerId: string; quantity: number; price: number; message: string;
}): Promise<RepositoryResult<Offer>> {
  const result = await createApiOffer({ listingId: input.listingId, quantity: input.quantity, price: input.price, message: input.message });
  if (result.error || !result.data) return fail<Offer>(result.error || 'Unable to create offer');
  return ok(mapOffer(result.data.offer));
}

export async function updateOfferStatus(id: string, status: Offer['status']): Promise<RepositoryResult<Offer>> {
  const result = await updateApiOffer(id, status);
  if (result.error || !result.data) return fail<Offer>(result.error || 'Unable to update offer');
  return ok(mapOffer(result.data.offer));
}

export async function createTransaction(_input: {
  listingId: string; donorId: string; seekerId: string; material: string; quantity: number; unit: string;
  agreedPrice: number; total: number; pickupTime: string; status: Transaction['status'];
}): Promise<RepositoryResult<Transaction>> {
  return fail<Transaction>('Transactions are created by the secure offer acceptance workflow.');
}

export async function updateTransactionStatus(id: string, status: Transaction['status']): Promise<RepositoryResult<Transaction>> {
  const result = await updateApiTransaction(id, status);
  if (result.error || !result.data) return fail<Transaction>(result.error || 'Unable to update transaction');
  return ok(mapTransaction(result.data.transaction));
}

export async function listTransactions(_forUserId: string): Promise<RepositoryResult<Transaction[]>> {
  const result = await getApiTransactions();
  if (result.error || !result.data) return fail<Transaction[]>(result.error || 'Unable to load transactions');
  return ok((result.data.transactions || []).map(mapTransaction));
}

export async function persistMatch(_match: Match): Promise<RepositoryResult<Match>> {
  return ok(_match);
}

export async function listMatches(_forUserId: string): Promise<RepositoryResult<Match[]>> {
  const result = await getApiMatches();
  if (result.error || !result.data) return fail<Match[]>(result.error || 'Unable to load matches');
  return ok((result.data.matches || []).map(mapMatch));
}

export async function createNotification(_input: {
  userId: string; type: Notification['type']; title: string; message: string; link?: string;
}): Promise<RepositoryResult<Notification>> {
  return ok(null as unknown as Notification);
}

export async function listNotifications(_forUserId: string): Promise<RepositoryResult<Notification[]>> {
  const result = await getApiNotifications();
  if (result.error || !result.data) return fail<Notification[]>(result.error || 'Unable to load notifications');
  return ok((result.data.notifications || []).map(mapNotification));
}

export async function markNotificationRead(id: string): Promise<RepositoryResult<Notification>> {
  const result = await markApiNotificationRead(id);
  if (result.error || !result.data) return fail<Notification>(result.error || 'Unable to update notification');
  return ok(mapNotification(result.data.notification));
}

function mapListing(row: Record<string, unknown>): ResourceListing {
  return {
    id: String(row.id), donorId: String(row.donor_id ?? row.donorId ?? ''), material: String(row.material), category: String(row.category ?? 'Other'),
    title: String(row.title ?? `${row.material} material`), description: String(row.description ?? ''), quantity: Number(row.quantity ?? 0), unit: String(row.unit ?? 'kg'),
    condition: row.condition as ResourceListing['condition'], price: row.price == null ? undefined : Number(row.price), location: String(row.location ?? ''),
    distanceKm: Number(row.distance_km ?? row.distanceKm ?? 0), availableUntil: String(row.available_until ?? row.availableUntil ?? ''),
    mode: row.mode as ResourceListing['mode'], status: row.status as ResourceListing['status'], image: String(row.image_url ?? row.image ?? ''),
    trustScore: Number(row.trust_score ?? row.trustScore ?? 50), circularityScore: Number(row.circularity_score ?? row.circularityScore ?? 50),
    urgencyScore: Number(row.urgency_score ?? row.urgencyScore ?? 50), aiConfidence: row.ai_confidence == null ? undefined : Number(row.ai_confidence),
  };
}

function mapRequirement(row: Record<string, unknown>): Requirement {
  return {
    id: String(row.id), seekerId: String(row.seeker_id ?? row.seekerId ?? ''), material: String(row.material), quantity: Number(row.quantity ?? 0), unit: String(row.unit ?? 'kg'),
    maxPrice: row.max_price == null ? undefined : Number(row.max_price), condition: row.condition as Requirement['condition'], location: String(row.location ?? ''),
    radiusKm: Number(row.radius_km ?? row.radiusKm ?? 10), neededBy: String(row.needed_by ?? row.neededBy ?? ''), notes: String(row.notes ?? ''),
    status: row.status as Requirement['status'],
  };
}

function mapOffer(row: Record<string, unknown>): Offer {
  return {
    id: String(row.id), listingId: String(row.listing_id ?? row.listingId ?? ''), seekerId: String(row.seeker_id ?? row.seekerId ?? ''),
    quantity: Number(row.quantity ?? 0), price: Number(row.price ?? 0), message: String(row.message ?? ''), status: row.status as Offer['status'],
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
  };
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id).startsWith('RAW-') ? String(row.id) : `RAW-${String(row.id).slice(0, 8).toUpperCase()}`,
    listingId: String(row.listing_id ?? row.listingId ?? ''), donorId: String(row.donor_id ?? row.donorId ?? ''), seekerId: String(row.seeker_id ?? row.seekerId ?? ''),
    material: String(row.material), quantity: Number(row.quantity ?? 0), unit: String(row.unit ?? 'kg'), agreedPrice: Number(row.agreed_price ?? row.agreedPrice ?? 0),
    total: Number(row.total ?? 0), pickupTime: String(row.pickup_time ?? row.pickupTime ?? ''), status: row.status as Transaction['status'],
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
  };
}

function mapMatch(row: Record<string, unknown>): Match {
  return {
    id: String(row.id ?? `m-${row.resourceId}-${row.requirementId}`),
    resourceId: String(row.resource_id ?? row.resourceId), requirementId: String(row.requirement_id ?? row.requirementId), score: Number(row.score ?? 0),
    distanceScore: Number(row.distance_score ?? row.distanceScore ?? 0), needScore: Number(row.need_score ?? row.needScore ?? 0), priceScore: Number(row.price_score ?? row.priceScore ?? 0),
    availabilityScore: Number(row.availability_score ?? row.availabilityScore ?? 0), trustScore: Number(row.trust_score ?? row.trustScore ?? 0),
    circularityScore: Number(row.circularity_score ?? row.circularityScore ?? 0), urgencyScore: Number(row.urgency_score ?? row.urgencyScore ?? 0),
    circularityPath: (row.circularity_path ?? row.circularityPath ?? 'RECYCLE') as Match['circularityPath'],
    explanation: Array.isArray(row.explanation) ? row.explanation.map(String) : [],
  };
}

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id), userId: String(row.user_id ?? row.userId ?? ''), type: row.type as Notification['type'], title: String(row.title ?? ''), message: String(row.message ?? ''),
    read: Boolean(row.read), createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()), link: row.link == null ? undefined : String(row.link),
  };
}
