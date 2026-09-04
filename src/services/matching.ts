import type { CircularityPath, Match, Requirement, ResourceListing } from '../types';

function normalise(value: string) {
  return value.trim().toLowerCase();
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function dateScore(target: string, radiusHours = 48) {
  const timestamp = Date.parse(target);
  if (!Number.isFinite(timestamp)) return 70;
  const hours = Math.max(0, (timestamp - Date.now()) / 36e5);
  return clamp(100 - (hours / radiusHours) * 45);
}

function chooseCircularityPath(listing: ResourceListing): CircularityPath {
  if (listing.circularityScore >= 92 && listing.condition !== 'DAMAGED') return 'DIRECT_REUSE';
  if (listing.condition === 'DAMAGED' || listing.circularityScore >= 78) return 'REPAIR_AND_REUSE';
  if (listing.category === 'Packaging' || listing.category === 'Textile') return 'REPURPOSE';
  return 'RECYCLE';
}

function materialCompatibility(listing: ResourceListing, requirement: Requirement) {
  const material = normalise(listing.material);
  const requested = normalise(requirement.material);
  const category = normalise(listing.category);
  if (material === requested) return 100;
  if (category === requested || material.includes(requested) || requested.includes(material)) return 82;
  return 15;
}

export function scoreMatch(listing: ResourceListing, requirement: Requirement): Match {
  const materialScore = materialCompatibility(listing, requirement);
  const needScore = clamp((Math.min(listing.quantity, requirement.quantity) / Math.max(requirement.quantity, 1)) * 100);
  const priceScore = requirement.maxPrice == null || listing.price == null || listing.price === 0
    ? 95
    : listing.price <= requirement.maxPrice
      ? clamp(100 - ((requirement.maxPrice - listing.price) / Math.max(requirement.maxPrice, 1)) * 10)
      : clamp(100 - ((listing.price - requirement.maxPrice) / Math.max(requirement.maxPrice, 1)) * 140);
  const distanceScore = clamp((1 - Math.min(listing.distanceKm, requirement.radiusKm) / Math.max(requirement.radiusKm, 1)) * 100);
  const availabilityScore = clamp((listing.urgencyScore * 0.65) + (dateScore(listing.availableUntil) * 0.35));
  const urgencyScore = clamp((listing.urgencyScore * 0.55) + (dateScore(requirement.neededBy) * 0.45));
  const trustScore = listing.trustScore;
  const circularityScore = listing.circularityScore;
  const circularityPath = chooseCircularityPath(listing);

  const score = clamp(
    materialScore * 0.30 +
    needScore * 0.14 +
    distanceScore * 0.18 +
    priceScore * 0.13 +
    availabilityScore * 0.08 +
    trustScore * 0.07 +
    circularityScore * 0.05 +
    urgencyScore * 0.05,
  );

  const explanation = [
    materialScore >= 95 ? 'Material is an exact match' : 'Material is compatible by category or name',
    `${Math.min(listing.quantity, requirement.quantity)}/${requirement.quantity} ${requirement.unit} requirement can be fulfilled`,
    requirement.maxPrice == null || listing.price == null || listing.price <= requirement.maxPrice ? 'Price fits the seeker criteria' : 'Price is above the preferred budget',
    `Within preferred ${requirement.radiusKm} km radius`,
    listing.trustScore >= 90 ? 'High-trust verified participant' : 'Established participant',
    circularityPath === 'DIRECT_REUSE' ? 'Direct reuse is the preferred circular pathway' : `Recommended pathway: ${circularityPath.replace(/_/g, ' ').toLowerCase()}`,
    listing.urgencyScore >= 80 ? 'Resource is time-sensitive and should be matched quickly' : 'Availability window is stable',
  ];

  return {
    id: `m-${listing.id}-${requirement.id}`,
    resourceId: listing.id,
    requirementId: requirement.id,
    score,
    distanceScore,
    needScore,
    priceScore,
    availabilityScore,
    trustScore,
    circularityScore,
    urgencyScore,
    circularityPath,
    explanation,
  };
}

export function buildMatches(listings: ResourceListing[], requirements: Requirement[]) {
  return requirements.flatMap((requirement) => listings
    .filter((listing) => listing.status === 'ACTIVE')
    .filter((listing) => listing.distanceKm <= requirement.radiusKm)
    .map((listing) => scoreMatch(listing, requirement)))
    .sort((a, b) => b.score - a.score);
}
