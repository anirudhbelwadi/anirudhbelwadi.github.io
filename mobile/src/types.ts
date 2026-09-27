export interface SeriesPoint {
  label: string;
  value: number;
}

export interface DeviceSplit {
  mobile_count: number;
  web_count: number;
  mobile_pct: number;
  web_pct: number;
}

export interface Kpis {
  todays_visitors: number;
  visits_this_week: number;
  visits_this_month: number;
  peak_day: string;
  peak_day_count: number;
  top_country: string;
  top_source: string;
  avg_per_day: number;
  avg_per_week: number;
  top_locations: { city: string; count: number }[];
  repeat_visitors_last_24h: number;
  repeat_visitors_per_day: number;
  device_split: DeviceSplit;
}

export interface Analytics {
  total: number;
  kpis: Kpis;
  series: {
    week: SeriesPoint[];
    month: SeriesPoint[];
    year: SeriesPoint[];
    fiveYears: SeriesPoint[];
  };
  countries: SeriesPoint[];
  sources: SeriesPoint[];
  generatedAt: string;
}

export interface Visitor {
  ip: string;
  timestamp: string;
  city: string | null;
  region: string | null;
  country: string | null;
  source: string | null;
  isRepeatVisitor: boolean;
  postal: string | null;
  name: string | null;
  role: string | null;
  isMobile: boolean;
}

export interface VisitorPage {
  total: number;
  limit: number;
  offset: number;
  items: Visitor[];
}
