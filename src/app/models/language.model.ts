
export interface LanguageNode {
  id: string;
  label: string;
  type: string;
  language_code: string;
  hotel_name: string;
  hotel_id: string;
  score: number | null;
  color: string;
  ai_avg: number | null;
  customer_avg: number | null;
  reviewer_average: number | null;
  review_count: number;
  description: string;
}
