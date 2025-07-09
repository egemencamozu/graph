import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { HotelService } from './hotel.service';
import { LanguageNode } from '../models/language.model';
import { getScoreColor, parseScore, sortByScoreDescending } from '../components/utils/gremlin-utils';

const API_BASE_URL = 'https://gremlin-gje2erecgnh3d3h0.germanywestcentral-01.azurewebsites.net';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly baseUrl = API_BASE_URL;

  constructor(
    private http: HttpClient,
    private hotelService: HotelService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  async getLanguagesByHotelWithScore(hotelName: string): Promise<LanguageNode[]> {
    // Hotel ID al
    const hotels = await this.hotelService.getAllHotelsFromAPI();
    const hotel = hotels.find(h => h.hotel_name === hotelName);

    if (!hotel || !hotel.hotel_id) {
      throw new Error(`Hotel ID not found for hotel: ${hotelName}`);
    }

    const url = `${this.baseUrl}/average/${hotel.hotel_id}/languages`;
    const data: any = await firstValueFrom(this.http.get(url, { headers: this.getHeaders() }));
    const languagesData = Array.isArray(data[0]) ? data[0][0] : data[0];

    if (!languagesData || typeof languagesData !== 'object') {
      throw new Error(`No languages data received for hotel: ${hotelName}`);
    }

    const languageNodes: LanguageNode[] = Object.entries(languagesData).map(([languageCode, scores]: [string, any]) => {
      const aiScore = parseScore(scores.ai_average);
      const reviewerScore = parseScore(scores.reviewer_average);
      const reviewCount = scores.review_count || 0;

      const label = languageCode === "" ? "⚠️ Empty Language"
                   : languageCode === "Unknown" ? "❓ Unknown Language"
                   : languageCode.toUpperCase();

      return {
        id: `${hotelName}_LANGUAGE_${languageCode || 'EMPTY'}`,
        label,
        type: "language",
        language_code: languageCode,
        hotel_name: hotelName,
        hotel_id: hotel.hotel_id,
        score: aiScore,
        color: aiScore !== null ? getScoreColor(aiScore) : '#cccccc',
        ai_avg: aiScore,
        customer_avg: reviewerScore,
        reviewer_average: reviewerScore,
        review_count: reviewCount,
        description: `Language: ${label} (${reviewCount} reviews)`
      };
    });

    return sortByScoreDescending(languageNodes);
  }
}
