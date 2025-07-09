

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getScoreColor, parseScore } from '../components/utils/gremlin-utils';
import { SourceNode } from '../models/source.model';

const API_BASE_URL = 'https://gremlin-gje2erecgnh3d3h0.germanywestcentral-01.azurewebsites.net';

@Injectable({
  providedIn: 'root'
})
export class SourceService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  async getSourcesByHotelWithScore(hotelName: string): Promise<SourceNode[]> {
    const encodedName = encodeURIComponent(hotelName.toUpperCase());
    const url = `${this.baseUrl}/average/${encodedName}/sources`;
    const data: any = await firstValueFrom(this.http.get(url, { headers: this.getHeaders() }));
    const sourceData = Array.isArray(data[0]) ? data[0][0] : data[0];

    if (!sourceData || typeof sourceData !== 'object') {
      throw new Error(`No sources data received for hotel: ${hotelName}`);
    }

    const sources: SourceNode[] = Object.entries(sourceData).map(([sourceName, scores]: [string, any]) => {
      const ai = parseScore(scores.ai_average);
      const reviewer = parseScore(scores.reviewer_average);
      const count = scores.review_count || 0;

      const label = sourceName === "" ? "⚠️ Empty Source"
                   : sourceName === "Unknown" ? "❓ Unknown Source"
                   : sourceName;

      return {
        id: `${hotelName}_SOURCE_${sourceName || 'EMPTY'}`,
        label,
        type: "source",
        source_name: sourceName,
        hotel_name: hotelName,
        score: ai,
        color: ai !== null ? getScoreColor(ai) : '#cccccc',
        ai_avg: ai,
        customer_avg: reviewer,
        reviewer_average: reviewer,
        review_count: count,
        description: `Source: ${label} (${count} reviews)`
      };
    });

    return sources.sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return (b.score ?? 0) - (a.score ?? 0);
    });
  }
}
