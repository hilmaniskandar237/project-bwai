export interface FAQItem {
  question: string;
  answer: string;
}

export interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  faqs: FAQItem[];
}

export interface MindmapSubtopic {
  title: string;
  points: string[];
}

export interface MindmapResult {
  topic: string;
  subtopics: MindmapSubtopic[];
}
