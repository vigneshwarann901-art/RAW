export interface MaterialScanResult {
  material: string;
  category: string;
  confidence: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'MIXED';
  note: string;
}

export function mockMaterialScan(fileName?: string): Promise<MaterialScanResult> {
  const lower = (fileName ?? '').toLowerCase();
  let result: MaterialScanResult = {
    material: 'Copper Wire',
    category: 'Metal',
    confidence: 94,
    condition: 'GOOD',
    note: 'Clean electrical-grade copper appears reusable/recoverable.',
  };
  if (lower.includes('chair')) result = { material: 'Used Office Chairs', category: 'Furniture', confidence: 91, condition: 'GOOD', note: 'Furniture appears suitable for direct reuse.' };
  if (lower.includes('cardboard')) result = { material: 'Cardboard', category: 'Packaging', confidence: 97, condition: 'EXCELLENT', note: 'Clean corrugated cardboard can be directly reused.' };
  if (lower.includes('aluminium') || lower.includes('aluminum')) result = { material: 'Aluminium Sheets', category: 'Metal', confidence: 93, condition: 'GOOD', note: 'Sheet stock appears suitable for recovery or reuse.' };
  return new Promise((resolve) => setTimeout(() => resolve(result), 500));
}

export function suggestPrice(material: string, quantity: number) {
  const table: Record<string, { low: number; high: number }> = {
    'Copper Wire': { low: 580, high: 630 },
    'Aluminium Sheets': { low: 150, high: 190 },
    'Used Office Chairs': { low: 1100, high: 1700 },
    'Cardboard': { low: 12, high: 20 },
    'PET Plastic': { low: 45, high: 65 },
    'HDPE Plastic': { low: 55, high: 75 },
  };
  const base = table[material] ?? { low: 50, high: 100 };
  const scale = quantity > 100 ? 0.97 : quantity < 10 ? 1.03 : 1;
  const low = Math.round(base.low * scale);
  const high = Math.round(base.high * scale);
  return { low, high, recommended: Math.round((low + high) / 2), confidence: 82 };
}


import type { CircularityPath, Condition } from '../../types';

export function bestNextLife(category: string, condition: Condition, circularityScore: number): { path: CircularityPath; label: string; reason: string } {
  const c = category.toLowerCase();
  if (condition !== 'DAMAGED' && circularityScore >= 92) {
    return { path: 'DIRECT_REUSE', label: 'Direct reuse', reason: 'The material is in a condition suitable for another user without processing.' };
  }
  if (condition === 'DAMAGED' && circularityScore >= 72) {
    return { path: 'REPAIR_AND_REUSE', label: 'Repair + reuse', reason: 'A repair pathway can preserve more value than immediate recycling.' };
  }
  if (c.includes('packaging') || c.includes('textile') || c.includes('wood')) {
    return { path: 'REPURPOSE', label: 'Repurpose', reason: 'This material category has practical secondary-use pathways.' };
  }
  return { path: 'RECYCLE', label: 'Recycle', reason: 'Recovery through recycling is the fallback when direct reuse is not suitable.' };
}
