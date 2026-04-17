export type BidStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface Division {
  id: string;
  label: string;
  directCost: number;
  included: boolean;
}

export interface Bid {
  id: string;
  bidNumber: string;
  clientName: string;
  clientEmail: string;
  projectAddress: string;
  projectType: string;
  squareFeet: number;
  divisions: Division[];
  overheadPct: number;
  profitPct: number;
  directTotal: number;
  overheadAmount: number;
  profitAmount: number;
  grandTotal: number;
  status: BidStatus;
  createdAt: string;
  sentAt?: string;
  notes?: string;
  planFiles?: string[];
}

export const DEFAULT_DIVISIONS: Omit<Division, 'directCost'>[] = [
  {id: 'demo',  label: 'Demolition & Site Preparation',    included: true},
  {id: 'found', label: 'Footing & Foundation',              included: true},
  {id: 'frame', label: 'Structural Framing',                included: true},
  {id: 'roof',  label: 'Roofing Systems',                   included: true},
  {id: 'ext',   label: 'Exterior Finishes & Siding',        included: true},
  {id: 'doors', label: 'Windows & Doors',                   included: true},
  {id: 'deck',  label: 'Deck / Patio System',               included: false},
  {id: 'insul', label: 'Insulation & Interior Sheathing',   included: true},
  {id: 'elec',  label: 'Electrical',                        included: true},
  {id: 'plumb', label: 'Plumbing, Gas & Drainage',          included: true},
  {id: 'drive', label: 'Driveway & Concrete Flatwork',      included: false},
  {id: 'mgmt',  label: 'Project Mgmt & Insurance',          included: true},
];

// Cost per SF by division (base rates for Utah 2026)
export const COST_PER_SF: Record<string, number> = {
  demo:  22,
  found: 24,
  frame: 48,
  roof:  41,
  ext:   42,
  doors: 24,
  deck:  40,
  insul: 8,
  elec:  17,
  plumb: 10,
  drive: 9,
  mgmt:  22,
};

export const STATUS_COLORS: Record<BidStatus, {bg: string; text: string; label: string}> = {
  draft:    {bg: 'rgba(251,191,36,0.15)', text: '#92650a', label: 'Draft'},
  sent:     {bg: 'rgba(96,165,250,0.15)', text: '#1e40af', label: 'Sent'},
  accepted: {bg: 'rgba(52,211,153,0.15)', text: '#065f46', label: 'Accepted'},
  declined: {bg: 'rgba(248,113,113,0.15)', text: '#991b1b', label: 'Declined'},
};

export const PROJECT_TYPES = [
  'Garage Addition',
  'Home Addition',
  'Kitchen Remodel',
  'ADU / Guest House',
  'Full Renovation',
  'Custom Build',
  'Bathroom Remodel',
  'Basement Finish',
  'Deck / Patio',
  'Commercial Buildout',
];
