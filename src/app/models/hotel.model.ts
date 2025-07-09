export interface HotelNode {
  id: string;
  hotel_id: string;
  hotel_name: string;
  label: string;
  type: string;
  score: number | null;
  color: string;
  ai_avg: number | null;
  customer_avg: number | null;
  reviewer_average: number | null;
  review_count: number;
  group_name?: string;
}

export interface HotelGroupNode {
  id: string;
  label: string;
  type: string;
  group_name: string;
  score: number | null;
  color: string;
  ai_avg: number | null;
  customer_avg: number | null;
  reviewer_average: number | null;
  hotel_count: number;
  review_count: number;
  hotels: any[];
}

export interface FilterChoiceNode {
  id: string;
  label: string;
  type: string;
  filter_type: string;
  hotel_name: string;
  score: number | null;
  color: string;
  ai_avg: number | null;
  customer_avg: number | null;
  reviewer_average: number | null;
  review_count: number;
  description: string;
}
