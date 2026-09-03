import { supabase } from '../supabase';
import type { Match, Notification, Offer, Requirement, ResourceListing, Transaction } from '../../types';

export type RepositoryResult<T> = { data: T | null; error: string | null };

const ok = <T>(data: T): RepositoryResult<T> => ({ data, error: null });
const fail = <T>(error: unknown): RepositoryResult<T> => ({ data: null, error: error instanceof Error ? error.message : String(error) });

export async function createListing(input: {
  donorId: string;
  material: string;
  category: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  condition: string;
  price: number;
  location: string;
  availableUntil: string;
  mode: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  trustScore?: number;
  circularityScore?: number;
  urgencyScore?: number;
  aiConfidence?: number;
}): Promise<RepositoryResult<ResourceListing>> {
  if (!supabase) return ok(null as unknown as ResourceListing);
  const { data, error } = await supabase.from('listings').insert({
    donor_id: input.donorId,
    material: input.material,
    category: input.category,
    title: input.title,
    description: input.description,
    quantity: input.quantity,
    unit: input.unit,
    condition: input.condition,
    price: input.price,
    location: input.location,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    available_until: input.availableUntil,
    mode: input.mode,
    image_url: input.imageUrl ?? null,
    trust_score: input.trustScore ?? 50,
    circularity_score: input.circularityScore ?? 50,
    urgency_score: input.urgencyScore ?? 50,
    ai_confidence: input.aiConfidence ?? null,
  }, { onConflict: 'resource_id,requirement_id' }).select('*').single();
  if (error) return fail(error);
  return ok(data ? mapListing(data) : null as unknown as ResourceListing);
}

export async function createRequirement(input: {
  seekerId: string;
  material: string;
  quantity: number;
  unit: string;
  maxPrice?: number;
  condition?: string;
  location: string;
  lat?: number;
  lng?: number;
  radiusKm: number;
  neededBy: string;
  notes?: string;
}): Promise<RepositoryResult<Requirement>> {
  if (!supabase) return ok(null as unknown as Requirement);
  const { data, error } = await supabase.from('requirements').insert({
    seeker_id: input.seekerId,
    material: input.material,
    quantity: input.quantity,
    unit: input.unit,
    max_price: input.maxPrice ?? null,
    condition: input.condition ?? null,
    location: input.location,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    radius_km: input.radiusKm,
    needed_by: input.neededBy,
    notes: input.notes ?? '',
  }).select('*').single();
  if (error) return fail(error);
  return ok(data ? mapRequirement(data) : null as unknown as Requirement);
}

export async function listListings(forUserId?: string): Promise<RepositoryResult<ResourceListing[]>> {
  if (!supabase) return ok(null as unknown as ResourceListing[]);
  const { data, error } = forUserId
    ? await supabase.from('listings').select('*').or(`status.eq.ACTIVE,donor_id.eq.${forUserId}`).order('created_at', { ascending: false })
    : await supabase.from('listings').select('*').eq('status', 'ACTIVE').order('created_at', { ascending: false });
  if (error) return fail(error);
  return ok((data ?? []).map(mapListing));
}

export async function listRequirements(forUserId?: string): Promise<RepositoryResult<Requirement[]>> {
  if (!supabase) return ok(null as unknown as Requirement[]);
  const query = supabase.from('requirements').select('*').order('created_at', { ascending: false });
  const { data, error } = forUserId ? await query.eq('seeker_id', forUserId) : await query;
  if (error) return fail(error);
  return ok((data ?? []).map(mapRequirement));
}

export async function listOffers(forUserId: string, role: 'DONOR' | 'SEEKER'): Promise<RepositoryResult<Offer[]>> {
  if (!supabase) return ok(null as unknown as Offer[]);
  if (role === 'SEEKER') {
    const { data, error } = await supabase.from('offers').select('*').eq('seeker_id', forUserId).order('created_at', { ascending: false });
    if (error) return fail(error);
    return ok((data ?? []).map(mapOffer));
  }
  const { data, error } = await supabase
    .from('offers')
    .select('*, listings!inner(donor_id)')
    .eq('listings.donor_id', forUserId)
    .order('created_at', { ascending: false });
  if (error) return fail(error);
  return ok((data ?? []).map(mapOffer));
}

export async function createOffer(input: {
  listingId: string; seekerId: string; quantity: number; price: number; message: string;
}): Promise<RepositoryResult<Offer>> {
  if (!supabase) return ok(null as unknown as Offer);
  const { data, error } = await supabase.from('offers').insert({
    listing_id: input.listingId,
    seeker_id: input.seekerId,
    quantity: input.quantity,
    price: input.price,
    message: input.message,
  }).select('*').single();
  if (error) return fail(error);
  return ok(data ? mapOffer(data) : null as unknown as Offer);
}

export async function updateOfferStatus(id: string, status: Offer['status']): Promise<RepositoryResult<Offer>> {
  if (!supabase) return ok(null as unknown as Offer);
  const { data, error } = await supabase.from('offers').update({ status }).eq('id', id).select('*').single();
  if (error) return fail(error);
  return ok(data ? mapOffer(data) : null as unknown as Offer);
}

export async function createTransaction(input: {
  listingId: string; donorId: string; seekerId: string; material: string; quantity: number; unit: string;
  agreedPrice: number; total: number; pickupTime: string; status: Transaction['status'];
}): Promise<RepositoryResult<Transaction>> {
  if (!supabase) return ok(null as unknown as Transaction);
  const { data, error } = await supabase.from('transactions').insert({
    listing_id: input.listingId,
    donor_id: input.donorId,
    seeker_id: input.seekerId,
    material: input.material,
    quantity: input.quantity,
    unit: input.unit,
    agreed_price: input.agreedPrice,
    total: input.total,
    pickup_time: input.pickupTime,
    status: input.status,
  }).select('*').single();
  if (error) return fail(error);
  return ok(data ? mapTransaction(data) : null as unknown as Transaction);
}

export async function listTransactions(forUserId: string): Promise<RepositoryResult<Transaction[]>> {
  if (!supabase) return ok(null as unknown as Transaction[]);
  const { data, error } = await supabase.from('transactions').select('*').or(`donor_id.eq.${forUserId},seeker_id.eq.${forUserId}`).order('created_at', { ascending: false });
  if (error) return fail(error);
  return ok((data ?? []).map(mapTransaction));
}

function mapListing(row: Record<string, unknown>): ResourceListing {
  return {
    id: String(row.id), donorId: String(row.donor_id), material: String(row.material), category: String(row.category), title: String(row.title),
    description: String(row.description ?? ''), quantity: Number(row.quantity), unit: String(row.unit), condition: row.condition as ResourceListing['condition'],
    price: row.price == null ? undefined : Number(row.price), location: String(row.location ?? ''), distanceKm: 0, availableUntil: String(row.available_until ?? ''),
    mode: row.mode as ResourceListing['mode'], status: row.status as ResourceListing['status'], image: String(row.image_url ?? ''),
    trustScore: Number(row.trust_score ?? 50), circularityScore: Number(row.circularity_score ?? 50), urgencyScore: Number(row.urgency_score ?? 50),
    aiConfidence: row.ai_confidence == null ? undefined : Number(row.ai_confidence),
  };
}

function mapRequirement(row: Record<string, unknown>): Requirement {
  return {
    id: String(row.id), seekerId: String(row.seeker_id), material: String(row.material), quantity: Number(row.quantity), unit: String(row.unit),
    maxPrice: row.max_price == null ? undefined : Number(row.max_price), condition: row.condition as Requirement['condition'], location: String(row.location ?? ''),
    radiusKm: Number(row.radius_km ?? 10), neededBy: String(row.needed_by ?? ''), notes: String(row.notes ?? ''), status: row.status as Requirement['status'],
  };
}

function mapOffer(row: Record<string, unknown>): Offer {
  return {
    id: String(row.id), listingId: String(row.listing_id), seekerId: String(row.seeker_id), quantity: Number(row.quantity), price: Number(row.price ?? 0),
    message: String(row.message ?? ''), status: row.status as Offer['status'], createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: `RAW-${String(row.id).slice(0, 8).toUpperCase()}`, listingId: String(row.listing_id), donorId: String(row.donor_id), seekerId: String(row.seeker_id),
    material: String(row.material), quantity: Number(row.quantity), unit: String(row.unit), agreedPrice: Number(row.agreed_price ?? 0), total: Number(row.total ?? 0),
    pickupTime: String(row.pickup_time ?? ''), status: row.status as Transaction['status'], createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function persistMatch(match: Match): Promise<RepositoryResult<Match>> {
  if (!supabase) return { data: null, error: null };
  const { data, error } = await supabase.from('matches').upsert({
    resource_id: match.resourceId,
    requirement_id: match.requirementId,
    score: match.score,
    distance_score: match.distanceScore,
    need_score: match.needScore,
    price_score: match.priceScore,
    availability_score: match.availabilityScore,
    trust_score: match.trustScore,
    circularity_score: match.circularityScore,
    urgency_score: match.urgencyScore,
    circularity_path: match.circularityPath,
    explanation: match.explanation,
  }, { onConflict: 'resource_id,requirement_id' }).select('*').single();
  if (error) return fail(error);
  return ok(data ? mapMatch(data) : null as unknown as Match);
}

export async function listMatches(forUserId: string): Promise<RepositoryResult<Match[]>> {
  if (!supabase) return { data: null, error: null };
  const [listingResult, requirementResult] = await Promise.all([
    supabase.from('listings').select('id').eq('donor_id', forUserId),
    supabase.from('requirements').select('id').eq('seeker_id', forUserId),
  ]);
  if (listingResult.error) return fail(listingResult.error);
  if (requirementResult.error) return fail(requirementResult.error);
  const listingIds = (listingResult.data ?? []).map((row) => String(row.id));
  const requirementIds = (requirementResult.data ?? []).map((row) => String(row.id));
  if (!listingIds.length && !requirementIds.length) return ok([]);

  const [byListing, byRequirement] = await Promise.all([
    listingIds.length ? supabase.from('matches').select('*').in('resource_id', listingIds) : Promise.resolve({ data: [], error: null }),
    requirementIds.length ? supabase.from('matches').select('*').in('requirement_id', requirementIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (byListing.error) return fail(byListing.error);
  if (byRequirement.error) return fail(byRequirement.error);
  const map = new Map<string, Match>();
  [...(byListing.data ?? []), ...(byRequirement.data ?? [])].forEach((row) => map.set(String(row.id), mapMatch(row)));
  return ok([...map.values()].sort((a, b) => b.score - a.score));
}

export async function createNotification(input: {
  userId: string; type: Notification['type']; title: string; message: string; link?: string;
}): Promise<RepositoryResult<Notification>> {
  if (!supabase) return { data: null, error: null };
  const { data, error } = await supabase.from('notifications').insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
  }).select('*').single();
  if (error) return fail(error);
  return ok(data ? mapNotification(data) : null as unknown as Notification);
}

export async function listNotifications(forUserId: string): Promise<RepositoryResult<Notification[]>> {
  if (!supabase) return { data: null, error: null };
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', forUserId).order('created_at', { ascending: false }).limit(30);
  if (error) return fail(error);
  return ok((data ?? []).map(mapNotification));
}

function mapMatch(row: Record<string, unknown>): Match {
  return {
    id: String(row.id), resourceId: String(row.resource_id), requirementId: String(row.requirement_id), score: Number(row.score ?? 0),
    distanceScore: Number(row.distance_score ?? 0), needScore: Number(row.need_score ?? 0), priceScore: Number(row.price_score ?? 0),
    availabilityScore: Number(row.availability_score ?? 0), trustScore: Number(row.trust_score ?? 0), circularityScore: Number(row.circularity_score ?? 0),
    urgencyScore: Number(row.urgency_score ?? 0), circularityPath: (row.circularity_path as Match['circularityPath']) ?? 'RECYCLE',
    explanation: Array.isArray(row.explanation) ? row.explanation.map(String) : [],
  };
}

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id), userId: String(row.user_id), type: row.type as Notification['type'], title: String(row.title), message: String(row.message),
    read: Boolean(row.read), createdAt: String(row.created_at ?? new Date().toISOString()), link: row.link == null ? undefined : String(row.link),
  };
}
