import { createServer } from 'node:http';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);
const PORT = Number(process.env.PORT || 5000);

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(projectRoot, '.env.local'));
loadEnvFile(join(projectRoot, '.env'));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
const adminClient = SUPABASE_URL && SUPABASE_SECRET_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return {}; }
}

function bearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function userClient(token) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

async function requireUser(req, res) {
  if (!supabaseConfigured) {
    json(res, 503, { success: false, message: 'Supabase is not configured on the server.' });
    return null;
  }
  const token = bearerToken(req);
  if (!token) {
    json(res, 401, { success: false, message: 'Authentication required.' });
    return null;
  }
  const client = userClient(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    json(res, 401, { success: false, message: 'Invalid or expired session.' });
    return null;
  }
  return { client, user: data.user };
}

async function ensureProfile(client, user, roleHint) {
  const { data: existing } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (existing) return existing;
  const metadata = user.user_metadata || {};
  const role = roleHint === 'SEEKER' || roleHint === 'DONOR' ? roleHint : (metadata.role === 'SEEKER' ? 'SEEKER' : 'DONOR');
  const profile = {
    id: user.id,
    name: metadata.name || metadata.full_name || user.email?.split('@')[0] || 'RAW Member',
    email: user.email || '',
    phone: metadata.phone || '',
    role,
  };
  const { data, error } = await client.from('profiles').insert(profile).select('*').single();
  if (error) throw error;
  return data;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clamp(value) { return Math.max(0, Math.min(100, Math.round(value))); }

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function dateScore(target, radiusHours = 48) {
  const timestamp = Date.parse(target || '');
  if (!Number.isFinite(timestamp)) return 70;
  const hours = Math.max(0, (timestamp - Date.now()) / 36e5);
  return clamp(100 - (hours / radiusHours) * 45);
}

function circularityPath(listing) {
  const score = Number(listing.circularity_score ?? 50);
  if (score >= 92 && listing.condition !== 'DAMAGED') return 'DIRECT_REUSE';
  if (listing.condition === 'DAMAGED' || score >= 78) return 'REPAIR_AND_REUSE';
  if (['cardboard', 'packaging', 'textile'].some((x) => String(listing.material).toLowerCase().includes(x))) return 'REPURPOSE';
  return 'RECYCLE';
}

function scorePair(listing, requirement) {
  const material = String(listing.material || '').trim().toLowerCase();
  const requested = String(requirement.material || '').trim().toLowerCase();
  const materialScore = material === requested || material.includes(requested) || requested.includes(material) ? 100 : 15;
  const requiredQty = Math.max(Number(requirement.quantity || 0), 1);
  const listingQty = Number(listing.quantity || 0);
  const needScore = clamp((Math.min(listingQty, requiredQty) / requiredQty) * 100);
  const maxPrice = requirement.max_price == null ? Infinity : Number(requirement.max_price);
  const listingPrice = listing.price == null ? 0 : Number(listing.price);
  const priceScore = !Number.isFinite(maxPrice) || listingPrice === 0
    ? 95
    : listingPrice <= maxPrice
      ? clamp(100 - ((maxPrice - listingPrice) / Math.max(maxPrice, 1)) * 10)
      : clamp(100 - ((listingPrice - maxPrice) / Math.max(maxPrice, 1)) * 140);
  const conditionScore = ['GOOD', 'EXCELLENT', 'Usable', 'Good'].includes(String(listing.condition)) ? 100 : 55;
  let distanceScore = 70;
  let distanceKm = null;
  if (Number.isFinite(Number(requirement.lat)) && Number.isFinite(Number(requirement.lng)) && Number.isFinite(Number(listing.lat)) && Number.isFinite(Number(listing.lng))) {
    distanceKm = haversineKm(Number(requirement.lat), Number(requirement.lng), Number(listing.lat), Number(listing.lng));
    distanceScore = clamp((1 - Math.min(distanceKm, Number(requirement.radius_km || 10)) / Math.max(Number(requirement.radius_km || 10), 1)) * 100);
  }
  const availabilityScore = clamp((Number(listing.urgency_score ?? 50) * 0.65) + (dateScore(listing.available_until) * 0.35));
  const urgencyScore = clamp((Number(listing.urgency_score ?? 50) * 0.55) + (dateScore(requirement.needed_by) * 0.45));
  const trustScore = Number(listing.trust_score ?? 50);
  const circularityScore = Number(listing.circularity_score ?? 50);
  const score = clamp(
    materialScore * 0.30 + needScore * 0.14 + distanceScore * 0.18 + priceScore * 0.13 + availabilityScore * 0.08 + trustScore * 0.07 + circularityScore * 0.05 + urgencyScore * 0.05,
  );
  const path = circularityPath(listing);
  return {
    resourceId: String(listing.id),
    requirementId: String(requirement.id),
    score,
    distanceScore,
    needScore,
    priceScore,
    availabilityScore,
    trustScore,
    circularityScore,
    urgencyScore,
    circularityPath: path,
    distanceKm: distanceKm == null ? null : Number(distanceKm.toFixed(2)),
    explanation: [
      materialScore >= 95 ? 'Material is an exact match' : 'Material is compatible by name',
      needScore >= 100 ? 'Full quantity can be fulfilled' : 'Partial quantity coverage is available',
      priceScore >= 90 ? 'Price fits the target budget' : 'Price is above the preferred budget',
      distanceKm == null ? 'Location score uses a neutral baseline' : `${distanceKm.toFixed(1)} km from seeker`,
      trustScore >= 90 ? 'High-trust participant' : 'Established participant',
      path === 'DIRECT_REUSE' ? 'Direct reuse is the preferred next life' : `Recommended pathway: ${path.replaceAll('_', ' ').toLowerCase()}`,
    ],
  };
}

async function notify(client, userId, type, title, message, link) {
  if (!userId) return;
  const writer = adminClient || client;
  await writer.from('notifications').insert({ user_id: userId, type, title, message, link: link || null });
}

async function routes(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;

  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method === 'GET' && path === '/api/health') {
    return json(res, 200, { success: true, service: 'RAW Backend', message: 'API is running', supabaseConfigured, version: '2.0.0' });
  }

  const auth = await requireUser(req, res);
  if (!auth) return;
  const { client, user } = auth;

  try {
    if (req.method === 'GET' && path === '/api/me') {
      const profile = await ensureProfile(client, user);
      return json(res, 200, { success: true, user: { id: user.id, email: user.email, metadata: user.user_metadata || {} }, profile });
    }

    if (req.method === 'PATCH' && path === '/api/profile') {
      const input = await body(req);
      const patch = {
        name: input.name,
        phone: input.phone,
        location: input.location,
        lat: input.lat == null ? null : Number(input.lat),
        lng: input.lng == null ? null : Number(input.lng),
      };
      if (input.role === 'DONOR' || input.role === 'SEEKER') patch.role = input.role;
      if (input.business_name) {
        await client.from('businesses').upsert({ owner_id: user.id, name: String(input.business_name) }, { onConflict: 'owner_id' });
      }
      const { data, error } = await client.from('profiles').update(patch).eq('id', user.id).select('*').single();
      if (error) throw error;
      return json(res, 200, { success: true, profile: data });
    }

    if (req.method === 'GET' && path.startsWith('/api/profiles/')) {
      const id = path.split('/').pop();
      const { data, error } = await client
        .from('profiles')
        .select('id,name,email,phone,role,location,trust_score,verified_phone,verified_email,verified_business,successful_transactions,response_rate')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json(res, 404, { success: false, message: 'Profile not found.' });
      return json(res, 200, { success: true, profile: data });
    }

    if (req.method === 'POST' && path === '/api/uploads') {
      const input = await body(req);
      const contentType = String(input.contentType || '');
      if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
        return json(res, 400, { success: false, message: 'Only JPG, PNG or WEBP images are supported.' });
      }
      if (!input.data) return json(res, 400, { success: false, message: 'No image data provided.' });
      const buffer = Buffer.from(String(input.data), 'base64');
      if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
        return json(res, 400, { success: false, message: 'Image must be 10 MB or smaller.' });
      }
      const safeName = String(input.fileName || 'upload').replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(-80);
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await client.storage.from('raw-images').upload(path, buffer, { contentType, upsert: false });
      if (uploadError) throw uploadError;
      const { data: pub } = client.storage.from('raw-images').getPublicUrl(path);
      return json(res, 201, { success: true, url: pub.publicUrl, path });
    }

    if (req.method === 'GET' && path === '/api/listings') {
      const { data, error } = await client.from('listings').select('*').or(`status.eq.ACTIVE,donor_id.eq.${user.id}`).order('created_at', { ascending: false });
      if (error) throw error;
      return json(res, 200, { success: true, listings: data || [] });
    }

    if (req.method === 'POST' && path === '/api/listings') {
      const input = await body(req);
      if (!input.material || !input.quantity) return json(res, 400, { success: false, message: 'material and quantity are required' });
      const payload = {
        donor_id: user.id,
        material: String(input.material),
        category: String(input.category || 'Other'),
        title: String(input.title || `${input.material} material`),
        description: String(input.description || ''),
        quantity: Number(input.quantity),
        unit: String(input.unit || 'kg'),
        condition: String(input.condition || 'GOOD'),
        price: input.price == null ? 0 : Number(input.price),
        location: String(input.location || ''),
        lat: input.lat == null ? null : Number(input.lat),
        lng: input.lng == null ? null : Number(input.lng),
        available_until: input.availableUntil || new Date(Date.now() + 86400000).toISOString(),
        mode: ['SELL', 'DONATE', 'SWAP'].includes(input.mode) ? input.mode : 'SELL',
        image_url: String(input.image || input.imageUrl || ''),
        images: Array.isArray(input.images) ? input.images.map((x) => String(x)).slice(0, 8) : [],
        trust_score: Number(input.trustScore ?? 50),
        circularity_score: Number(input.circularityScore ?? 70),
        urgency_score: Number(input.urgencyScore ?? 50),
        ai_confidence: input.aiConfidence == null ? null : Number(input.aiConfidence),
      };
      const { data, error } = await client.from('listings').insert(payload).select('*').single();
      if (error) throw error;
      const { data: reqs } = await client.from('requirements').select('*').eq('status', 'ACTIVE').eq('material', payload.material);
      for (const requirement of (reqs || []).slice(0, 5)) {
        await notify(client, requirement.seeker_id, 'MATCH', 'New RAW match', `${payload.quantity} ${payload.unit} of ${payload.material} may fit your requirement.`, '/seeker/matches');
      }
      return json(res, 201, { success: true, listing: data });
    }

    if (req.method === 'GET' && path === '/api/requirements') {
      const { data, error } = await client.from('requirements').select('*').eq('seeker_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return json(res, 200, { success: true, requirements: data || [] });
    }

    if (req.method === 'POST' && path === '/api/requirements') {
      const input = await body(req);
      if (!input.material || !input.quantity) return json(res, 400, { success: false, message: 'material and quantity are required' });
      const payload = {
        seeker_id: user.id,
        material: String(input.material),
        quantity: Number(input.quantity),
        unit: String(input.unit || 'kg'),
        max_price: input.maxPrice == null ? null : Number(input.maxPrice),
        condition: input.condition || null,
        location: String(input.location || ''),
        lat: input.lat == null ? null : Number(input.lat),
        lng: input.lng == null ? null : Number(input.lng),
        radius_km: Number(input.radiusKm || 10),
        needed_by: input.neededBy || new Date(Date.now() + 86400000).toISOString(),
        notes: String(input.notes || ''),
      };
      const { data, error } = await client.from('requirements').insert(payload).select('*').single();
      if (error) throw error;
      const { data: donors } = await client.from('listings').select('donor_id').eq('status', 'ACTIVE').eq('material', payload.material).limit(20);
      const uniqueDonors = [...new Set((donors || []).map((row) => row.donor_id).filter((id) => id !== user.id))];
      for (const donorId of uniqueDonors.slice(0, 10)) {
        await notify(client, donorId, 'REQUIREMENT', 'New local RAW demand', `${payload.quantity} ${payload.unit} of ${payload.material} is needed nearby.`, '/donor/listings');
      }
      return json(res, 201, { success: true, requirement: data });
    }

    if (req.method === 'GET' && path === '/api/matches') {
      const [{ data: listings, error: listingError }, { data: requirements, error: requirementError }] = await Promise.all([
        client.from('listings').select('*').eq('status', 'ACTIVE'),
        client.from('requirements').select('*').eq('status', 'ACTIVE'),
      ]);
      if (listingError) throw listingError;
      if (requirementError) throw requirementError;
      const relevantListings = (listings || []).filter((row) => row.donor_id === user.id);
      const relevantRequirements = (requirements || []).filter((row) => row.seeker_id === user.id);
      const results = [];
      for (const listing of relevantListings) {
        for (const requirement of requirements || []) {
          const match = scorePair(listing, requirement);
          if (match.distanceKm == null || match.distanceKm <= Number(requirement.radius_km || 10)) results.push(match);
        }
      }
      for (const requirement of relevantRequirements) {
        for (const listing of listings || []) {
          const match = scorePair(listing, requirement);
          if (match.distanceKm == null || match.distanceKm <= Number(requirement.radius_km || 10)) results.push(match);
        }
      }
      results.sort((a, b) => b.score - a.score);
      return json(res, 200, { success: true, matches: results });
    }

    if (req.method === 'GET' && path === '/api/offers') {
      const role = String(url.searchParams.get('role') || 'SEEKER').toUpperCase();
      const query = role === 'DONOR'
        ? client.from('offers').select('*, listings!inner(donor_id)').eq('listings.donor_id', user.id).order('created_at', { ascending: false })
        : client.from('offers').select('*').eq('seeker_id', user.id).order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return json(res, 200, { success: true, offers: data || [] });
    }

    if (req.method === 'POST' && path === '/api/offers') {
      const input = await body(req);
      if (!input.listingId || !input.quantity) return json(res, 400, { success: false, message: 'listingId and quantity are required' });
      const { data: listing, error: listingError } = await client.from('listings').select('*').eq('id', input.listingId).maybeSingle();
      if (listingError) throw listingError;
      if (!listing || listing.status !== 'ACTIVE') return json(res, 404, { success: false, message: 'Listing is not available.' });
      if (listing.donor_id === user.id) return json(res, 400, { success: false, message: 'You cannot make an offer on your own listing.' });
      const quantity = Number(input.quantity);
      if (quantity <= 0 || quantity > Number(listing.quantity)) return json(res, 400, { success: false, message: 'Offer quantity exceeds available quantity.' });
      const { data, error } = await client.from('offers').insert({ listing_id: input.listingId, seeker_id: user.id, quantity, price: Number(input.price ?? 0), message: String(input.message || '') }).select('*').single();
      if (error) throw error;
      await notify(client, listing.donor_id, 'OFFER', 'New RAW offer', `${quantity} ${listing.unit} of ${listing.material} — ₹${Number(input.price ?? 0).toLocaleString()}.`, '/donor/offers');
      return json(res, 201, { success: true, offer: data });
    }

    if (req.method === 'PATCH' && path.startsWith('/api/offers/')) {
      const id = path.split('/').pop();
      const input = await body(req);
      const { data: offer, error: offerError } = await client.from('offers').select('*, listings!inner(*)').eq('id', id).maybeSingle();
      if (offerError) throw offerError;
      if (!offer) return json(res, 404, { success: false, message: 'Offer not found.' });
      const listing = Array.isArray(offer.listings) ? offer.listings[0] : offer.listings;
      const isDonor = listing?.donor_id === user.id;
      const isSeeker = offer.seeker_id === user.id;
      if (!isDonor && !isSeeker) return json(res, 403, { success: false, message: 'Not authorized to update this offer.' });
      const status = String(input.status || '').toUpperCase();
      if (!['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'].includes(status)) return json(res, 400, { success: false, message: 'Invalid offer status.' });
      if (status === 'ACCEPTED' && !isDonor) return json(res, 403, { success: false, message: 'Only the donor can accept an offer.' });
      const { data: updated, error: updateError } = await client.from('offers').update({ status }).eq('id', id).select('*').single();
      if (updateError) throw updateError;
      if (status === 'ACCEPTED') {
        const transactionPayload = {
          listing_id: listing.id,
          donor_id: listing.donor_id,
          seeker_id: offer.seeker_id,
          material: listing.material,
          quantity: Number(offer.quantity),
          unit: listing.unit,
          agreed_price: Number(offer.price),
          total: Number(offer.quantity) * Number(offer.price),
          pickup_time: new Date(Date.now() + 86400000).toISOString(),
          status: 'CONFIRMED',
        };
        const { data: tx, error: txError } = await client.from('transactions').insert(transactionPayload).select('*').single();
        if (txError) throw txError;
        await client.from('listings').update({ status: 'PENDING' }).eq('id', listing.id);
        await notify(client, offer.seeker_id, 'TRANSACTION', 'Offer accepted', `Your offer for ${listing.material} was accepted. Transaction ${String(tx.id).slice(0, 8).toUpperCase()} is confirmed.`, '/seeker/marketplace');
      } else {
        await notify(client, isDonor ? offer.seeker_id : listing.donor_id, 'OFFER', `Offer ${status.toLowerCase()}`, `Your RAW offer is now ${status.toLowerCase()}.`, isDonor ? '/seeker/matches' : '/donor/offers');
      }
      return json(res, 200, { success: true, offer: updated });
    }

    if (req.method === 'PATCH' && path.startsWith('/api/transactions/')) {
      const id = path.split('/').pop();
      const input = await body(req);
      const status = String(input.status || '').toUpperCase();
      if (!['REQUESTED', 'ACCEPTED', 'NEGOTIATING', 'CONFIRMED', 'COMPLETED'].includes(status)) return json(res, 400, { success: false, message: 'Invalid transaction status.' });
      const { data: existing, error: existingError } = await client.from('transactions').select('*').eq('id', id).maybeSingle();
      if (existingError) throw existingError;
      if (!existing) return json(res, 404, { success: false, message: 'Transaction not found.' });
      if (existing.donor_id !== user.id && existing.seeker_id !== user.id) return json(res, 403, { success: false, message: 'Not authorized to update this transaction.' });
      const { data, error } = await client.from('transactions').update({ status }).eq('id', id).select('*').single();
      if (error) throw error;
      if (status === 'COMPLETED') {
        await client.from('listings').update({ status: 'COMPLETED' }).eq('id', existing.listing_id);
        const { data: existingImpact } = await client.from('impact_records').select('id').eq('transaction_id', existing.id).maybeSingle();
        if (!existingImpact) {
          await client.from('impact_records').insert({ transaction_id: existing.id, material_recovered: Number(existing.quantity || 0), value_recovered: Number(existing.total || 0), estimated_waste_avoided: Number(existing.quantity || 0), reuse_cycles: 1 });
        }
        await notify(client, existing.donor_id === user.id ? existing.seeker_id : existing.donor_id, 'TRANSACTION', 'Transaction completed', `Transaction ${String(existing.id).slice(0, 8).toUpperCase()} is marked complete.`, '/donor/transactions');
      }
      return json(res, 200, { success: true, transaction: data });
    }

    if (req.method === 'GET' && path === '/api/transactions') {
      const { data, error } = await client.from('transactions').select('*').or(`donor_id.eq.${user.id},seeker_id.eq.${user.id}`).order('created_at', { ascending: false });
      if (error) throw error;
      return json(res, 200, { success: true, transactions: data || [] });
    }

    if (req.method === 'GET' && path.startsWith('/api/transactions/') && path.endsWith('/ratings')) {
      const id = path.split('/')[3];
      const { data: existing, error: existingError } = await client.from('transactions').select('id,donor_id,seeker_id').eq('id', id).maybeSingle();
      if (existingError) throw existingError;
      if (!existing) return json(res, 404, { success: false, message: 'Transaction not found.' });
      if (existing.donor_id !== user.id && existing.seeker_id !== user.id) return json(res, 403, { success: false, message: 'Not authorized to view these ratings.' });
      const { data, error } = await client.from('ratings').select('*').eq('transaction_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return json(res, 200, { success: true, ratings: data || [] });
    }

    if (req.method === 'POST' && path === '/api/ratings') {
      const input = await body(req);
      const transactionId = input.transactionId;
      const toUser = input.toUser;
      const score = Number(input.score);
      if (!transactionId || !toUser || !Number.isFinite(score) || score < 1 || score > 5) {
        return json(res, 400, { success: false, message: 'transactionId, toUser and a score between 1 and 5 are required.' });
      }
      const { data: tx, error: txError } = await client.from('transactions').select('*').eq('id', transactionId).maybeSingle();
      if (txError) throw txError;
      if (!tx) return json(res, 404, { success: false, message: 'Transaction not found.' });
      if (tx.status !== 'COMPLETED') return json(res, 400, { success: false, message: 'Only completed transactions can be rated.' });
      if (tx.donor_id !== user.id && tx.seeker_id !== user.id) return json(res, 403, { success: false, message: 'Not authorized to rate this transaction.' });
      if (toUser !== tx.donor_id && toUser !== tx.seeker_id) return json(res, 400, { success: false, message: 'toUser must be the other transaction participant.' });
      const { data, error } = await client.from('ratings').insert({ transaction_id: transactionId, from_user: user.id, to_user: toUser, score, comment: input.comment ? String(input.comment) : null }).select('*').single();
      if (error) throw error;
      await notify(client, toUser, 'SYSTEM', 'New RAW rating', `You received a ${score}-star rating for a completed exchange.`, '/profile');
      return json(res, 201, { success: true, rating: data });
    }

    if (req.method === 'GET' && path === '/api/notifications') {
      const { data, error } = await client.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return json(res, 200, { success: true, notifications: data || [] });
    }

    if (req.method === 'PATCH' && path.startsWith('/api/notifications/')) {
      const id = path.split('/').pop();
      const { data, error } = await client.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id).select('*').single();
      if (error) throw error;
      return json(res, 200, { success: true, notification: data });
    }

    if (req.method === 'GET' && path === '/api/stats') {
      const [profiles, listings, transactions] = await Promise.all([
        client.from('profiles').select('id', { count: 'exact', head: true }),
        client.from('listings').select('id,status,quantity', { count: 'exact' }),
        client.from('transactions').select('id,status,total,quantity,donor_id,seeker_id').or(`donor_id.eq.${user.id},seeker_id.eq.${user.id}`),
      ]);
      if (profiles.error) throw profiles.error;
      if (listings.error) throw listings.error;
      if (transactions.error) throw transactions.error;
      const ownTx = transactions.data || [];
      return json(res, 200, {
        success: true,
        stats: {
          users: profiles.count || 0,
          activeListings: (listings.data || []).filter((x) => x.status === 'ACTIVE').length,
          transactionCount: ownTx.length,
          materialRecovered: ownTx.filter((x) => x.status === 'COMPLETED').reduce((n, x) => n + Number(x.quantity || 0), 0),
          valueRecovered: ownTx.filter((x) => x.status === 'COMPLETED').reduce((n, x) => n + Number(x.total || 0), 0),
        },
      });
    }

    return json(res, 404, { success: false, message: 'Route not found.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { success: false, message: error?.message || 'Server error.' });
  }
}

createServer((req, res) => { void routes(req, res); }).listen(PORT, () => {
  console.log(`RAW backend running on http://localhost:${PORT}`);
  console.log(`Supabase ${supabaseConfigured ? 'configured' : 'NOT configured'}; authenticated API routes are ${supabaseConfigured ? 'enabled' : 'disabled'}.`);
});
