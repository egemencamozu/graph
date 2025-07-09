import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AccommodationNode } from '../models/accommodation-type.model';
import { parseScore, getScoreColor, sortByScoreDescending } from '../components/utils/gremlin-utils';

const API_BASE_URL = 'https://gremlin-gje2erecgnh3d3h0.germanywestcentral-01.azurewebsites.net';

@Injectable({
  providedIn: 'root'
})
export class AccommodationService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  async getAccommodationsByHotelWithScore(hotelName: string): Promise<AccommodationNode[]> {
    try {
      console.info(`🏠 Fetching accommodations for hotel: ${hotelName}`);

      const encodedName = encodeURIComponent(hotelName.toUpperCase());
      const url = `${this.baseUrl}/average/${encodedName}/accommodations`;
      const data: any = await firstValueFrom(this.http.get(url, { headers: this.getHeaders() }));
      const accData = Array.isArray(data[0]) ? data[0][0] : data[0];

      if (!accData || typeof accData !== 'object') {
        throw new Error(`No accommodations data received for hotel: ${hotelName}`);
      }

      const accommodations: AccommodationNode[] = Object.entries(accData).map(([type, scores]: [string, any]) => {
        const ai = parseScore(scores.ai_average);
        const reviewer = parseScore(scores.reviewer_average);
        const count = scores.review_count || 0;

        const label = type === "" ? "⚠️ Empty Accommodation"
                    : type === "Unknown" ? "❓ Unknown Accommodation"
                    : type;

        return {
          id: `${hotelName}_ACCOMMODATION_${type || 'EMPTY'}`,
          label,
          type: "accommodation",
          accommodation_type: type,
          hotel_name: hotelName,
          score: ai,
          color: ai !== null ? getScoreColor(ai) : '#cccccc',
          ai_avg: ai,
          customer_avg: reviewer,
          reviewer_average: reviewer,
          review_count: count,
          description: `Accommodation: ${label} (${count} reviews)`
        };
      });

      console.info(`✅ Accommodations processed for ${hotelName}: ${accommodations.length}`);
      return sortByScoreDescending(accommodations);

    } catch (err: any) {
      console.error(`❌ getAccommodationsByHotelWithScore failed for hotel ${hotelName}:`, err);
      throw new Error(`Failed to fetch accommodations for hotel ${hotelName}: ${err.message}`);
    }
  }
}
