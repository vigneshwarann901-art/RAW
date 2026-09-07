import { supabase } from './supabase';
import type { ResourceListing, ListingStatus } from '../types';

export async function getListings(): Promise<ResourceListing[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    donorId: row.donor_id,
    material: row.material,
    category: row.category,
    title: row.title,
    description: row.description || '',
    quantity: Number(row.quantity),
    unit: row.unit,
    condition: row.condition,
    price: row.price ? Number(row.price) : undefined,
    location: row.location || '',
    distanceKm: row.distance_km || 0,
    availableUntil: row.available_until || '',
    mode: row.mode,
    status: row.status as ListingStatus,
    image: row.image_url || '',
    trustScore: row.trust_score || 50,
    circularityScore: row.circularity_score || 50,
    urgencyScore: row.urgency_score || 50,
    aiConfidence: row.ai_confidence,
  }));
}

export async function getListingById(id: string): Promise<ResourceListing | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    donorId: data.donor_id,
    material: data.material,
    category: data.category,
    title: data.title,
    description: data.description || '',
    quantity: Number(data.quantity),
    unit: data.unit,
    condition: data.condition,
    price: data.price ? Number(data.price) : undefined,
    location: data.location || '',
    distanceKm: data.distance_km || 0,
    availableUntil: data.available_until || '',
    mode: data.mode,
    status: data.status as ListingStatus,
    image: data.image_url || '',
    trustScore: data.trust_score || 50,
    circularityScore: data.circularity_score || 50,
    urgencyScore: data.urgency_score || 50,
    aiConfidence: data.ai_confidence,
  };
}

export async function createListing(input: Omit<ResourceListing, 'id' | 'status'> & { donorId: string }): Promise<ResourceListing | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('listings')
    .insert({
      donor_id: input.donorId,
      material: input.material,
      category: input.category,
      title: input.title,
      description: input.description,
      quantity: input.quantity,
      unit: input.unit,
      condition: input.condition,
      price: input.price ?? 0,
      location: input.location,
      available_until: input.availableUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      mode: input.mode,
      status: 'ACTIVE',
      image_url: input.image,
      trust_score: input.trustScore || 50,
      circularity_score: input.circularityScore || 50,
      urgency_score: input.urgencyScore || 50,
      ai_confidence: input.aiConfidence,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error creating listing:', error);
    return null;
  }

  return {
    id: data.id,
    donorId: data.donor_id,
    material: data.material,
    category: data.category,
    title: data.title,
    description: data.description || '',
    quantity: Number(data.quantity),
    unit: data.unit,
    condition: data.condition,
    price: data.price ? Number(data.price) : undefined,
    location: data.location || '',
    distanceKm: data.distance_km || 0,
    availableUntil: data.available_until || '',
    mode: data.mode,
    status: data.status as ListingStatus,
    image: data.image_url || '',
    trustScore: data.trust_score || 50,
    circularityScore: data.circularity_score || 50,
    urgencyScore: data.urgency_score || 50,
    aiConfidence: data.ai_confidence,
  };
}

export async function updateListingStatus(id: string, status: ListingStatus): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', id);

  return !error;
}