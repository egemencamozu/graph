import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getScoreColor, parseScore, extractField } from '../components/utils/gremlin-utils';
import { ReviewNode } from '../models/review.model';

const API_BASE_URL = 'https://gremlin-gje2erecgnh3d3h0.germanywestcentral-01.azurewebsites.net';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  async getReviewsWithFilters(filters: Record<string, any> = {}): Promise<ReviewNode[]> {
    try {
      console.info("📝 Fetching reviews with filters:", filters);

      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, key === 'hotel_name' ? value.toUpperCase() : value);
        }
      }

      const endpoint = `${this.baseUrl}/reviews?${queryParams.toString()}`;
      const rawData: any = await firstValueFrom(this.http.get(endpoint, { headers: this.getHeaders() }));

      if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
        console.warn("⚠️ No reviews found for filters:", filters);
        return [];
      }

      const reviews = this.normalizeResponse(rawData, filters);
      console.info(`✅ Reviews processed: ${reviews.length}`);
      return reviews;

    } catch (err: any) {
      console.error("❌ getReviewsWithFilters failed:", err);
      if (err.message?.includes('No reviews found')) {
        return [];
      }
      throw new Error(`Failed to fetch reviews: ${err.message}`);
    }
  }

  private normalizeResponse(rawData: any, filters: Record<string, any>): ReviewNode[] {
    try {
      if (!rawData) return [];

      let reviewsArray: any[] = [];

      if (Array.isArray(rawData)) {
        if (Array.isArray(rawData[0])) {
          rawData.forEach(arr => {
            if (Array.isArray(arr)) reviewsArray.push(...arr);
          });
        } else {
          reviewsArray = rawData;
        }
      } else {
        throw new Error(`Invalid data structure: ${typeof rawData}`);
      }

      return reviewsArray
        .map((reviewObj: any, index: number): ReviewNode | null => {
          if (!reviewObj || typeof reviewObj !== 'object') return null;

          const reviewId = extractField(reviewObj.id) || `review_${index}`;
          const reviewText = extractField(reviewObj.review_text) || '';
          const reviewer = extractField(reviewObj.reviewer) || 'Anonymous';
          const score = parseScore(extractField(reviewObj.score));

          return {
            id: reviewId,
            review_id: reviewId,
            label: reviewText ? `${reviewText.substring(0, 30)}...` : `Review ${index + 1}`,
            type: "review",
            review_text: reviewText,
            reviewer_name: reviewer,
            review_date: extractField(reviewObj.review_date),
            score: score,
            ai_score: score,
            customer_score: score,
            color: score !== null ? getScoreColor(score) : '#cccccc',
            hotel_name: filters['hotel_name'] || 'Unknown',
            hotel_id: extractField(reviewObj.hotel_id) || '',
            language: filters['language'] || 'unknown',
            source: filters['source'] || 'google',
            accommodation_type: filters['accommodation_type'] || 'unknown',
            aspect: filters['aspect'] || 'general',
            response_text: extractField(reviewObj.response_text) || '',
            review_link: extractField(reviewObj.link) || '',
            applied_filters: { ...filters }
          };
        })
        .filter((r): r is ReviewNode => r !== null)
        .sort((a, b) => {
          if (a.score === null && b.score === null) return 0;
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return (b.score ?? 0) - (a.score ?? 0);
        });

    } catch (error: any) {
      console.error("❌ Error processing reviews:", error);
      throw new Error(`Failed to process review data: ${error.message}`);
    }
  }
}
