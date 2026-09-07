import { supabase } from '../supabase';

export type ApiResult<T> = { data: T | null; error: string | null };
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    if (init?.headers) Object.assign(headers, init.headers);
    const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return { data: null, error: payload?.message ?? `API request failed (${response.status})` };
    return { data: payload as T, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Network error' };
  }
}

export function health() { return request<{ success: boolean; service: string; message: string; supabaseConfigured: boolean }>('/health'); }
export function getProfile() { return request<{ success: boolean; profile: Record<string, unknown> }>('/me'); }
export function updateProfile(data: Record<string, unknown>) { return request<{ success: boolean; profile: Record<string, unknown> }>('/profile', { method: 'PATCH', body: JSON.stringify(data) }); }
export function getApiProfileById(id: string) { return request<{ success: boolean; profile: Record<string, unknown> }>(`/profiles/${id}`); }
export function uploadApiImage(data: { fileName: string; contentType: string; data: string }) { return request<{ success: boolean; url: string; path: string }>('/uploads', { method: 'POST', body: JSON.stringify(data) }); }
export function getApiListings() { return request<{ success: boolean; listings: Record<string, unknown>[] }>('/listings'); }
export function createApiListing(data: Record<string, unknown>) { return request<{ success: boolean; listing: Record<string, unknown> }>('/listings', { method: 'POST', body: JSON.stringify(data) }); }
export function getApiRequirements() { return request<{ success: boolean; requirements: Record<string, unknown>[] }>('/requirements'); }
export function createApiRequirement(data: Record<string, unknown>) { return request<{ success: boolean; requirement: Record<string, unknown> }>('/requirements', { method: 'POST', body: JSON.stringify(data) }); }
export function getApiMatches() { return request<{ success: boolean; matches: Record<string, unknown>[] }>('/matches'); }
export function getApiOffers(role: 'DONOR' | 'SEEKER') { return request<{ success: boolean; offers: Record<string, unknown>[] }>(`/offers?role=${role}`); }
export function createApiOffer(data: Record<string, unknown>) { return request<{ success: boolean; offer: Record<string, unknown> }>('/offers', { method: 'POST', body: JSON.stringify(data) }); }
export function updateApiOffer(id: string, status: string) { return request<{ success: boolean; offer: Record<string, unknown> }>(`/offers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
export function getApiTransactions() { return request<{ success: boolean; transactions: Record<string, unknown>[] }>('/transactions'); }
export function updateApiTransaction(id: string, status: string) { return request<{ success: boolean; transaction: Record<string, unknown> }>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
export function getApiNotifications() { return request<{ success: boolean; notifications: Record<string, unknown>[] }>('/notifications'); }
export function markApiNotificationRead(id: string) { return request<{ success: boolean; notification: Record<string, unknown> }>(`/notifications/${id}`, { method: 'PATCH' }); }
export function getApiStats() { return request<{ success: boolean; stats: Record<string, unknown> }>('/stats'); }
export function getApiRatingsForTransaction(transactionId: string) { return request<{ success: boolean; ratings: Record<string, unknown>[] }>(`/transactions/${transactionId}/ratings`); }
export function createApiRating(data: Record<string, unknown>) { return request<{ success: boolean; rating: Record<string, unknown> }>('/ratings', { method: 'POST', body: JSON.stringify(data) }); }
