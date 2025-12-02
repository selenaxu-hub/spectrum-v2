export enum BiasCategory {
  FAR_LEFT = "Far Left",
  LEFT = "Left Leaning",
  CENTER = "Center",
  RIGHT = "Right Leaning",
  FAR_RIGHT = "Far Right"
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface Perspective {
  sourceName: string;
  biasCategory: string; // Simplistic string for display
  headline: string;
  summary: string;
}

export interface Effect {
  domain: string; // e.g., "Economy", "Environment"
  immediateEffect: string; // First order
  longTermEffect: string; // Second order
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
}

export interface ArticleAnalysis {
  summary: string;
  biasScore: number; // -10 to 10
  biasCategory: BiasCategory;
  reasoning: string;
  timeline: TimelineEvent[];
  perspectives: Perspective[];
  effects: Effect[];
  glossary: GlossaryTerm[];
  books: BookRecommendation[];
}

export type ViewState = 'input' | 'analyzing' | 'results';
export type TabState = 'overview' | 'timeline' | 'perspectives' | 'learn';
