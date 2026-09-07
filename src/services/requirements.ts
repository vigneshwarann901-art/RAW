import { supabase } from './supabase';
import type { Requirement } from '../types';

export async function getRequirements(): Promise<Requirement[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    seekerId: row.seeker_id,
    material: row.material,
    quantity: Number(row.quantity),
    unit: row.unit,
    maxPrice: row.max_price ? Number(row.max_price) : undefined,
    condition: row.condition,
    location: row.location || '',
    radiusKm: Number(row.radius_km || 10),
    neededBy: row.needed_by || '',
    notes: row.notes || '',
    status: row.status,
  }));
}

export async function createRequirement(input: Omit<Requirement, 'id' | 'status'> & { seekerId: string }): Promise<Requirement | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('requirements')
    .insert({
      seeker_id: input.seekerId,
      material: input.material,
      quantity: input.quantity,
      unit: input.unit,
      max_price: input.maxPrice,
      condition: input.condition,
      location: input.location,
      radius_km: input.radiusKm,
      needed_by: input.neededBy,
      notes: input.notes,
      status: 'ACTIVE',
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error creating requirement:', error);
    return null;
  }

  return {
    id: data.id,
    seekerId: data.seeker_id,
    material: data.material,
    quantity: Number(data.quantity),
    unit: data.unit,
    maxPrice: data.max_price ? Number(data.max_price) : undefined,
    condition: data.condition,
    location: data.location || '',
    radiusKm: Number(data.radius_km || 10),
    neededBy: data.needed_by || '',
    notes: data.notes || '',
    status: data.status,
  };
}

export async function updateRequirementStatus(id: string, status: Requirement['status']): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('requirements')
    .update({ status })
    .eq('id', id);

  return !error;
}