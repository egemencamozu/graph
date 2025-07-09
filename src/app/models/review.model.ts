export interface ReviewNode {
  id: string;
  review_id: string;
  label: string;
  type: string;
  review_text: string;
  reviewer_name: string;
  review_date: string | null;
  score: number | null;
  ai_score: number | null;
  customer_score: number | null;
  color: string;
  hotel_name: string;
  hotel_id: string;
  language: string;
  source: string;
  accommodation_type: string;
  aspect: string;
  response_text: string;
  review_link: string;
  applied_filters: Record<string, any>;
}
