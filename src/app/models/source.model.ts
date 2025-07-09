export interface SourceNode {
  id: string;
  label: string;
  type: string;
  source_name: string;
  hotel_name: string;
  score: number | null;
  color: string;
  ai_avg: number | null;
  customer_avg: number | null;
  reviewer_average: number | null;
  review_count: number;
  description: string;
}

