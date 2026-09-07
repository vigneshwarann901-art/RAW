import { supabase } from './supabase';
import type { Offer, OfferStatus } from '../types';

export async function createOffer(input: Omit<Offer, 'id' | 'status' | 'createdAt'> & { seekerId: string }): Promise<Offer | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('offers')
    .insert({
      listing_id: input.listingId,
      seeker_id: input.seekerId,
      quantity: input.quantity,
      price: input.price,
      message: input.message,
      status: 'PENDING',
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error creating offer:', error);
    return null;
  }

  return {
    id: data.id,
    listingId: data.listing_id,
    seekerId: data.seeker_id,
    quantity: Number(data.quantity),
    price: Number(data.price),
    message: data.message || '',
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function getOffersForSeeker(seekerId: string): Promise<Offer[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('seeker_id', seekerId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    listingId: row.listing_id,
    seekerId: row.seeker_id,
    quantity: Number(row.quantity),
    price: Number(row.price),
    message: row.message || '',
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function getOffersForDonor(donorId: string): Promise<Offer[]> {
  if (!supabase) return [];
  // To get offers for a donor, we need to join offers with listings to filter by donor_id
  const { data, error } = await supabase
    .from('offers')
    .select('*, listings!inner(donor_id)')
    .eq('listings.donor_id', donorId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    listingId: row.listing_id,
    seekerId: row.seeker_id,
    quantity: Number(row.quantity),
    price: Number(row.price),
    message: row.message || '',
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function updateOfferStatus(id: string, status: OfferStatus): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id);

  return !error;
}