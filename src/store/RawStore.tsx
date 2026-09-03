import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoImpact, demoListings, demoMatches, demoOffers, demoRequirements, demoTransactions, demoUsers, demoNotifications } from '../data/demo';
import { buildMatches } from '../services/matching';
import type { ImpactRecord, Match, Notification, Offer, Requirement, ResourceListing, Transaction, User } from '../types';
import { createListing as persistListing, createRequirement as persistRequirement, createOffer as persistOffer, updateOfferStatus as persistOfferStatus, createTransaction as persistTransaction, listListings, listRequirements, listOffers, listTransactions, listMatches, persistMatch, createNotification, listNotifications } from '../services/data/repository';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../services/supabase';
import { subscribeToRawRealtime } from '../services/realtime';

const keys = {
  listings: 'raw:listings',
  requirements: 'raw:requirements',
  offers: 'raw:offers',
  transactions: 'raw:transactions',
  notifications: 'raw:notifications',
};

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* demo mode */ }
}

type Store = {
  currentUser: User;
  listings: ResourceListing[];
  requirements: Requirement[];
  matches: Match[];
  offers: Offer[];
  transactions: Transaction[];
  notifications: Notification[];
  impact: ImpactRecord;
  addListing: (input: Omit<ResourceListing, 'id' | 'donorId' | 'status'>) => ResourceListing;
  addRequirement: (input: Omit<Requirement, 'id' | 'seekerId' | 'status'>) => Requirement;
  addOffer: (input: Omit<Offer, 'id' | 'seekerId' | 'status' | 'createdAt'>) => Offer;
  updateOffer: (id: string, status: Offer['status']) => void;
};

const RawContext = createContext<Store | null>(null);

export function RawProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth();
  const [listings, setListings] = useState<ResourceListing[]>(() => load(keys.listings, demoListings));
  const [requirements, setRequirements] = useState<Requirement[]>(() => load(keys.requirements, demoRequirements));
  const [offers, setOffers] = useState<Offer[]>(() => load(keys.offers, demoOffers));
  const [transactions, setTransactions] = useState<Transaction[]>(() => load(keys.transactions, demoTransactions));
  const [notifications, setNotifications] = useState<Notification[]>(() => load(keys.notifications, demoNotifications));
  const [hydrated, setHydrated] = useState(false);
  const [serverMatches, setServerMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!supabase) { setHydrated(true); return; }
    let active = true;
    const refresh = async () => {
      const [listingResult, reqResult, offerResult, txResult, matchResult, notificationResult] = await Promise.all([
        listListings(currentUser.id),
        listRequirements(currentUser.id),
        listOffers(currentUser.id, currentUser.role === 'SEEKER' ? 'SEEKER' : 'DONOR'),
        listTransactions(currentUser.id),
        listMatches(currentUser.id),
        listNotifications(currentUser.id),
      ]);
      if (!active) return;
      if (listingResult.data) { setListings((current) => listingResult.data?.length ? listingResult.data : current); save(keys.listings, listingResult.data); }
      if (reqResult.data) { setRequirements((current) => reqResult.data?.length ? reqResult.data : current); save(keys.requirements, reqResult.data); }
      if (offerResult.data) { setOffers((current) => offerResult.data?.length ? offerResult.data : current); save(keys.offers, offerResult.data); }
      if (txResult.data) { setTransactions((current) => txResult.data?.length ? txResult.data : current); save(keys.transactions, txResult.data); }
      if (matchResult.data?.length) { setServerMatches(matchResult.data); }
      if (notificationResult.data) { setNotifications(notificationResult.data); save(keys.notifications, notificationResult.data); }
      setHydrated(true);
    };
    void refresh();
    const unsubscribe = subscribeToRawRealtime(currentUser.id, { onChange: () => { void refresh(); } });
    return () => { active = false; unsubscribe(); };
  }, [currentUser.id, currentUser.role]);

  const matches = useMemo(() => {
    const computed = buildMatches(listings, requirements);
    if (computed.length) return computed;
    if (serverMatches.length) return serverMatches;
    return demoMatches;
  }, [listings, requirements, serverMatches]);

  useEffect(() => {
    if (!supabase || !hydrated) return;
    const candidates = buildMatches(listings, requirements).slice(0, 50);
    candidates.forEach((match) => { void persistMatch(match); });
  }, [listings, requirements, hydrated]);

  const addListing: Store['addListing'] = (input) => {
    const listing: ResourceListing = { ...input, id: `r-${Date.now()}`, donorId: currentUser.id, status: 'ACTIVE' };
    setListings((value) => { const next = [listing, ...value]; save(keys.listings, next); return next; });
    void persistListing({ donorId: currentUser.id, material: listing.material, category: listing.category, title: listing.title, description: listing.description, quantity: listing.quantity, unit: listing.unit, condition: listing.condition, price: listing.price ?? 0, location: listing.location, availableUntil: listing.availableUntil, mode: listing.mode, imageUrl: listing.image, trustScore: listing.trustScore, circularityScore: listing.circularityScore, urgencyScore: listing.urgencyScore, aiConfidence: listing.aiConfidence }).then((result) => { if (result.data) setListings((value) => [result.data!, ...value.filter((x) => x.id !== listing.id)]); }).catch(() => undefined);
    return listing;
  };

  const addRequirement: Store['addRequirement'] = (input) => {
    const requirement: Requirement = { ...input, id: `req-${Date.now()}`, seekerId: currentUser.id, status: 'ACTIVE' };
    setRequirements((value) => { const next = [requirement, ...value]; save(keys.requirements, next); return next; });
    void persistRequirement({ seekerId: currentUser.id, material: requirement.material, quantity: requirement.quantity, unit: requirement.unit, maxPrice: requirement.maxPrice, condition: requirement.condition, location: requirement.location, radiusKm: requirement.radiusKm, neededBy: requirement.neededBy, notes: requirement.notes }).catch(() => undefined);
    return requirement;
  };

  const addOffer: Store['addOffer'] = (input) => {
    const offer: Offer = { ...input, id: `o-${Date.now()}`, seekerId: currentUser.id, status: 'PENDING', createdAt: new Date().toISOString() };
    setOffers((value) => { const next = [offer, ...value]; save(keys.offers, next); return next; });
    void persistOffer({ listingId: offer.listingId, seekerId: offer.seekerId, quantity: offer.quantity, price: offer.price, message: offer.message }).then((result) => { if (result.data) setOffers((value) => [result.data!, ...value.filter((x) => x.id !== offer.id)]); }).catch(() => undefined);
    const listing = listings.find((item) => item.id === offer.listingId);
    if (listing) {
      const notification: Notification = { id: `n-${Date.now()}`, userId: listing.donorId, type: 'OFFER', title: 'New RAW offer', message: `${offer.quantity} ${listing.unit} of ${listing.material} — ₹${offer.price.toLocaleString()}.`, read: false, createdAt: new Date().toISOString(), link: '/donor/offers' };
      setNotifications((value) => { const next = [notification, ...value]; save(keys.notifications, next); return next; });
      void createNotification({ userId: listing.donorId, type: 'OFFER', title: notification.title, message: notification.message, link: notification.link });
    }
    return offer;
  };

  const updateOffer = (id: string, status: Offer['status']) => {
    const changed = offers.find((offer) => offer.id === id);
    if (!changed) return;

    const listing = listings.find((item) => item.id === changed.listingId);

    setOffers((value) => {
      const next = value.map((offer) => offer.id === id ? { ...offer, status } : offer);
      save(keys.offers, next);
      return next;
    });
    void persistOfferStatus(id, status).catch(() => undefined);

    const notification: Notification = {
      id: `n-${Date.now()}-${id}`,
      userId: changed.seekerId,
      type: 'OFFER',
      title: status === 'ACCEPTED' ? 'Offer accepted' : status === 'REJECTED' ? 'Offer declined' : 'Offer updated',
      message: `Your offer is now ${status.toLowerCase()}.`,
      read: false,
      createdAt: new Date().toISOString(),
      link: '/seeker/matches',
    };
    setNotifications((items) => { const next = [notification, ...items]; save(keys.notifications, next); return next; });
    void createNotification({ userId: notification.userId, type: notification.type, title: notification.title, message: notification.message, link: notification.link });

    if (status === 'ACCEPTED' && listing) {
      const tx: Transaction = {
        id: `RAW-${Math.floor(10000 + Math.random() * 89999)}`,
        listingId: listing.id,
        donorId: listing.donorId,
        seekerId: changed.seekerId,
        material: listing.material,
        quantity: changed.quantity,
        unit: listing.unit,
        agreedPrice: changed.price,
        total: changed.quantity * changed.price,
        pickupTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      };
      setTransactions((existing) => { const updated = [tx, ...existing]; save(keys.transactions, updated); return updated; });
      void persistTransaction({ listingId: tx.listingId, donorId: tx.donorId, seekerId: tx.seekerId, material: tx.material, quantity: tx.quantity, unit: tx.unit, agreedPrice: tx.agreedPrice, total: tx.total, pickupTime: tx.pickupTime, status: tx.status }).then((result) => { if (result.data) setTransactions((value) => [result.data!, ...value.filter((x) => x.id !== tx.id)]); }).catch(() => undefined);
    }
  };

  const impact: ImpactRecord = useMemo(() => ({
    ...demoImpact,
    successfulTransactions: transactions.filter((t) => t.status === 'COMPLETED').length + 34,
    materialRecovered: demoImpact.materialRecovered + listings.filter((l) => l.status === 'COMPLETED').reduce((n, l) => n + l.quantity, 0),
  }), [transactions, listings]);

  const store = useMemo(() => ({ currentUser, listings, requirements, matches, offers, transactions, notifications, impact, addListing, addRequirement, addOffer, updateOffer }), [currentUser, listings, requirements, matches, offers, transactions, notifications, impact]);
  return <RawContext.Provider value={store}>{children}</RawContext.Provider>;
}

export function useRaw() {
  const value = useContext(RawContext);
  if (!value) throw new Error('useRaw must be used inside RawProvider');
  return value;
}
