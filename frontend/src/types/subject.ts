export interface ResourceLink {
  label: string;
  url: string;
}

export interface Topic {
  _id?: string;
  name: string;
  description: string;
  resourceLinks?: ResourceLink[];
  finished?: boolean;
  finishedAt?: string | null;
}

export interface Chapter {
  _id?: string;
  name: string;
  description: string;
  topics: Topic[];
  finished?: boolean;
  finishedAt?: string | null;
}

export interface Subject {
  _id?: string;
  name: string;
  description: string;
  resourceLinks?: ResourceLink[];
  chapters: Chapter[];
  finished?: boolean;
  finishedAt?: string | null;
  userId?: string;
  examDate?: string | null; // ISO date string
}
