export type Pillar = 'vlog' | 'showcase' | 'conversion';
export type ProductionLevel = 'quick_capture' | 'planned_shoot' | 'higgsfield_enhanced';
export type ContentStatus =
  | 'idea'
  | 'scripted'
  | 'to_film'
  | 'filmed'
  | 'editing'
  | 'ready'
  | 'posted';
export type Platform = 'tiktok' | 'instagram' | 'facebook';
export type Priority = 'low' | 'medium' | 'high';

export type ShotListItem = {
  id: string;
  text: string;
  done: boolean;
};

export type ContentItem = {
  id: string;
  title: string;
  pillar: Pillar;
  segment: string | null;
  platforms: Platform[];
  production_level: ProductionLevel;
  status: ContentStatus;
  scheduled_post_date: string | null;
  filming_date: string | null;
  week_number: number | null;
  year: number | null;
  script: string | null;
  shot_list: ShotListItem[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BankItem = {
  id: string;
  title: string;
  pillar: Pillar;
  description: string | null;
  priority: Priority;
  promoted_to_item_id: string | null;
  created_at: string;
};

export type Metric = {
  id: string;
  content_item_id: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  saves: number | null;
  logged_at: string;
};

export type Segment = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type Settings = {
  id: boolean;
  /** ISO weekday numbers, 1 = Monday … 7 = Sunday. */
  on_site_days: number[];
  weekly_target: number;
  updated_at: string;
};

// --- Display metadata -------------------------------------------------------

export const PILLARS: Pillar[] = ['vlog', 'showcase', 'conversion'];
export const PLATFORMS: Platform[] = ['tiktok', 'instagram', 'facebook'];
export const STATUSES: ContentStatus[] = [
  'idea',
  'scripted',
  'to_film',
  'filmed',
  'editing',
  'ready',
  'posted',
];
export const PRODUCTION_LEVELS: ProductionLevel[] = [
  'quick_capture',
  'planned_shoot',
  'higgsfield_enhanced',
];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const PILLAR_LABEL: Record<Pillar, string> = {
  vlog: 'Docuseries',
  showcase: 'Showcase',
  conversion: 'Conversion',
};

export const STATUS_LABEL: Record<ContentStatus, string> = {
  idea: 'Idea',
  scripted: 'Scripted',
  to_film: 'To film',
  filmed: 'Filmed',
  editing: 'Editing',
  ready: 'Ready',
  posted: 'Posted',
};

export const PRODUCTION_LABEL: Record<ProductionLevel, string> = {
  quick_capture: 'Quick capture',
  planned_shoot: 'Planned shoot',
  higgsfield_enhanced: 'Higgsfield',
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
