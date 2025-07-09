import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AspectNode } from '../models/aspect.model';
import { getScoreColor, parseScore, sortByScoreDescending } from '../components/utils/gremlin-utils';

const API_BASE_URL =
  'https://gremlin-gje2erecgnh3d3h0.germanywestcentral-01.azurewebsites.net';

@Injectable({
  providedIn: 'root',
})
export class AspectService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  async getAspectsByHotelWithScore(hotelName: string): Promise<AspectNode[]> {
    try {
      const encodedHotelName = encodeURIComponent(hotelName.toUpperCase());
      const url = `${this.baseUrl}/average/${encodedHotelName}/aspects`;
      const data: any = await firstValueFrom(
        this.http.get(url, { headers: this.getHeaders() })
      );
      const aspectsData = Array.isArray(data[0]) ? data[0][0] : data[0];

      if (!aspectsData || typeof aspectsData !== 'object') {
        throw new Error(`No aspects data received for hotel: ${hotelName}`);
      }

      const aspectNodes: AspectNode[] = Object.entries(aspectsData).map(
        ([aspectName, scores]: [string, any]) => {
          const aiScore = parseScore(scores.ai_average);
          const reviewerScore = parseScore(scores.reviewer_average);
          const reviewCount = scores.review_count || 0;
          const label =
            aspectName === ''
              ? '⚠️ Empty Aspect'
              : aspectName === 'Unknown'
              ? '❓ Unknown Aspect'
              : aspectName.replace(/_/g, ' ').toUpperCase();

          return {
            id: `${hotelName}_ASPECT_${aspectName || 'EMPTY'}`,
            label,
            type: 'aspect',
            aspect_name: aspectName,
            hotel_name: hotelName,
            score: aiScore,
            color: aiScore !== null ? getScoreColor(aiScore) : '#cccccc',
            ai_avg: aiScore,
            customer_avg: reviewerScore,
            reviewer_average: reviewerScore,
            review_count: reviewCount,
            description: `Aspect: ${label} (${reviewCount} reviews)`,
          };
        }
      );

      // Null-safe sıralama
      return sortByScoreDescending(aspectNodes);

    } catch (err: any) {
      throw new Error(
        `Failed to fetch aspects for hotel ${hotelName}: ${err.message}`
      );
    }
  }
}
