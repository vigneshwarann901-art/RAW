import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoImpact, demoListings, demoMatches, demoOffers, demoRequirements, demoTransactions, demoUsers, demoNotifications } from '../data/demo';
import { buildMatches } from '../services/matching';
import type { ImpactRecord, Match, Notification, Offer, Requirement, ResourceListing, Transaction, User } from '../types';
import {
  createListing as persistListing,
  createRequirement as persistRequirement,
  createOffer as persistOffer,
  updateOfferStatus as persistOfferStatus,
  listListings,
  listRequirements,
  listOffers,
  listTransactions,
  listMatches,
  listNotifications,
  markNotificationRead,
  updateTransactionStatus,
} from '../services/data/repository';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../services/supabase';
import { subscribeToRawRealtime } from '../services/realtime';

const keys = { listings: 'raw:listings', requirements: 'raw:requirements', offers: 'raw:offers', transactions: 'raw:transactions', notifications: 'raw:notifications' };
function load<T>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function save<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* best effort */ } }

export type Store = {
  currentUser: User;
  listings: ResourceListing[];
  requirements: Requirement[];
  matches: Match[];
  offers: Offer[];
  transactions: Transaction[];
  notifications: Notification[];
  impact: ImpactRecord;
  loading: boolean;
  addListing: (input: Omit<ResourceListing, 'id' | 'donorId' | 'status'>) => ResourceListing;
  addRequirement: (input: Omit<Requirement, 'id' | 'seekerId' | 'status'>) => Requirement;
  addOffer: (input: Omit<Offer, 'id' | 'seekerId' | 'status' | 'createdAt'>) => Offer;
  updateOffer: (id: string, status: Offer['status']) => void;
  completeTransaction: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
};

const RawContext = createContext<Store | null>(null);

function serverMatchToLocal(match: Match) { return match; }

export function RawProvider({ children }: { children: ReactNode }) {
  const { user: currentUser, session, mode } = useAuth();
  const [listings, setListings] = useState<ResourceListing[]>(() => mode === 'demo' ? load(keys.listings, demoListings) : []);
  const [requirements, setRequirements] = useState<Requirement[]>(() => mode === 'demo' ? load(keys.requirements, demoRequirements) : []);
  const [offers, setOffers] = useState<Offer[]>(() => mode === 'demo' ? load(keys.offers, demoOffers) : []);
  const [transactions, setTransactions] = useState<Transaction[]>(() => mode === 'demo' ? load(keys.transactions, demoTransactions) : []);
  const [notifications, setNotifications] = useState<Notification[]>(() => mode === 'demo' ? load(keys.notifications, demoNotifications) : []);
  const [serverMatches, setServerMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true);
    const [listingResult, reqResult, offerResult, txResult, matchResult, notificationResult] = await Promise.all([
      listListings(), listRequirements(), listOffers(currentUser.id, currentUser.role === 'SEEKER' ? 'SEEKER' : 'DONOR'), listTransactions(currentUser.id), listMatches(currentUser.id), listNotifications(currentUser.id),
    ]);
    if (listingResult.data) { setListings(listingResult.data); save(keys.listings, listingResult.data); }
    if (reqResult.data) { setRequirements(reqResult.data); save(keys.requirements, reqResult.data); }
    if (offerResult.data) { setOffers(offerResult.data); save(keys.offers, offerResult.data); }
    if (txResult.data) { setTransactions(txResult.data); save(keys.transactions, txResult.data); }
    if (matchResult.data) setServerMatches(matchResult.data.map(serverMatchToLocal));
    if (notificationResult.data) { setNotifications(notificationResult.data); save(keys.notifications, notificationResult.data); }
    setLoading(false);
  }, [currentUser.id, currentUser.role, session]);

  useEffect(() => {
    if (mode === 'demo') { setLoading(false); return; }
    void refresh();
    if (!supabase || !session) return;
    const unsubscribe = subscribeToRawRealtime(currentUser.id, { onChange: () => { void refresh(); } });
    return unsubscribe;
  }, [mode, session, currentUser.id, currentUser.role, refresh]);

  const matches = useMemo(() => {
    if (mode === 'demo') return buildMatches(listings, requirements).length ? buildMatches(listings, requirements) : demoMatches;
    return serverMatches;
  }, [mode, listings, requirements, serverMatches]);

  const addListing: Store['addListing'] = (input) => {
    const optimistic: ResourceListing = { ...input, id: `local-${Date.now()}`, donorId: currentUser.id, status: 'ACTIVE' };
    setListings((value) => [optimistic, ...value]);
    void persistListing({
      donorId: currentUser.id, material: optimistic.material, category: optimistic.category, title: optimistic.title, description: optimistic.description,
      quantity: optimistic.quantity, unit: optimistic.unit, condition: optimistic.condition, price: optimistic.price ?? 0, location: optimistic.location,
      availableUntil: optimistic.availableUntil, mode: optimistic.mode, imageUrl: optimistic.image, trustScore: optimistic.trustScore, circularityScore: optimistic.circularityScore,
      urgencyScore: optimistic.urgencyScore, aiConfidence: optimistic.aiConfidence,
    }).then((result) => { if (result.data) setListings((value) => [result.data!, ...value.filter((x) => x.id !== optimistic.id)]); else void refresh(); }).catch(() => undefined);
    return optimistic;
  };

  const addRequirement: Store['addRequirement'] = (input) => {
    const optimistic: Requirement = { ...input, id: `local-${Date.now()}`, seekerId: currentUser.id, status: 'ACTIVE' };
    setRequirements((value) => [optimistic, ...value]);
    void persistRequirement({ seekerId: currentUser.id, material: optimistic.material, quantity: optimistic.quantity, unit: optimistic.unit, maxPrice: optimistic.maxPrice, condition: optimistic.condition, location: optimistic.location, lat: undefined, lng: undefined, radiusKm: optimistic.radiusKm, neededBy: optimistic.neededBy, notes: optimistic.notes }).then((result) => { if (result.data) setRequirements((value) => [result.data!, ...value.filter((x) => x.id !== optimistic.id)]); else void refresh(); }).catch(() => undefined);
    return optimistic;
  };

  const addOffer: Store['addOffer'] = (input) => {
    const optimistic: Offer = { ...input, id: `local-${Date.now()}`, seekerId: currentUser.id, status: 'PENDING', createdAt: new Date().toISOString() };
    setOffers((value) => [optimistic, ...value]);
    void persistOffer({ listingId: optimistic.listingId, seekerId: optimistic.seekerId, quantity: optimistic.quantity, price: optimistic.price, message: optimistic.message })
      .then((result) => { if (result.data) setOffers((value) => [result.data!, ...value.filter((x) => x.id !== optimistic.id)]); else void refresh(); }).catch(() => undefined);
    return optimistic;
  };

  const updateOffer = (id: string, status: Offer['status']) => {
    setOffers((value) => value.map((offer) => offer.id === id ? { ...offer, status } : offer));
    void persistOfferStatus(id, status).then((result) => { if (result.error) void refresh(); else void refresh(); }).catch(() => void refresh());
  };

  const completeTransaction = (id: string) => {
    setTransactions((value) => value.map((tx) => tx.id === id ? { ...tx, status: 'COMPLETED' } : tx));
    void updateTransactionStatus(id, 'COMPLETED').then(() => void refresh()).catch(() => void refresh());
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((value) => value.map((item) => item.id === id ? { ...item, read: true } : item));
    void markNotificationRead(id);
  };

  const impact: ImpactRecord = useMemo(() => {
    if (mode === 'demo') return { ...demoImpact, successfulTransactions: transactions.length + 34 };
    const completed = transactions.filter((t) => t.status === 'COMPLETED');
    return {
      materialRecovered: completed.reduce((sum, t) => sum + t.quantity, 0),
      valueRecovered: completed.reduce((sum, t) => sum + t.total, 0),
      successfulTransactions: completed.length,
      estimatedWasteAvoided: completed.reduce((sum, t) => sum + t.quantity, 0),
      reuseCycles: completed.length,
    };
  }, [mode, transactions]);

  const store = useMemo(() => ({ currentUser, listings, requirements, matches, offers, transactions, notifications, impact, loading, addListing, addRequirement, addOffer, updateOffer, completeTransaction, markNotificationAsRead }), [currentUser, listings, requirements, matches, offers, transactions, notifications, impact, loading]);
  return <RawContext.Provider value={store}>{children}</RawContext.Provider>;
}

export function useRaw() { const value = useContext(RawContext); if (!value) throw new Error('useRaw must be used inside RawProvider'); return value; }
