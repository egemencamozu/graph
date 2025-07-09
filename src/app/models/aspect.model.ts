export interface AspectNode {
  id: string;
  label: string;
  type: string;
  aspect_name: string;
  hotel_name: string;
  score: number | null;
  color: string;
  ai_avg: number | null;
  customer_avg: number | null;
  reviewer_average: number | null;
  review_count: number;
  description: string;
}
