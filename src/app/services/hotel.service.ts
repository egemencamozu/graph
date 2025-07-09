import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  getScoreColor,
  parseScore,
  sortByScoreDescending,
} from '../components/utils/gremlin-utils';
import {
  FilterChoiceNode,
  HotelGroupNode,
  HotelNode,
} from '../models/hotel.model';
import { firstValueFrom } from 'rxjs';

const API_BASE_URL =
  'https://gremlin-gje2erecgnh3d3h0.germanywestcentral-01.azurewebsites.net';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  async getAllHotelsFromAPI(): Promise<HotelNode[]> {
    const url = `${this.baseUrl}/average/hotels`;
    const data: any = await firstValueFrom(
      this.http.get(url, { headers: this.getHeaders() })
    );
    const hotelsData = Array.isArray(data[0]) ? data[0] : data;

    if (!Array.isArray(hotelsData) || hotelsData.length === 0) {
      throw new Error('No hotels data received from API');
    }

    const hotelsWithScores: HotelNode[] = hotelsData
      .filter(
        (hotel: any) =>
          hotel &&
          typeof (hotel.name || hotel.hotel_name) === 'string' &&
          hotel.hotel_id
      )
      .map((hotel: any) => {
        const hotelName = hotel.name || hotel.hotel_name;
        const hotelId = hotel.hotel_id;
        const aiScore = parseScore(hotel.ai_average);
        const reviewerScore = parseScore(hotel.reviewer_average);
        const reviewCount = hotel.review_count || 0;

        return {
          id: hotelId,
          hotel_id: hotelId,
          hotel_name: hotelName,
          label: hotelName,
          type: 'hotel',
          score: aiScore,
          color: aiScore !== null ? getScoreColor(aiScore) : '#cccccc',
          ai_avg: aiScore,
          customer_avg: reviewerScore,
          reviewer_average: reviewerScore,
          review_count: reviewCount,
        };
      });

    return hotelsWithScores;
  }

  async getHotelGroupsWithScore(): Promise<HotelGroupNode[]> {
    const url = `${this.baseUrl}/average/groups`;
    const data: any = await firstValueFrom(
      this.http.get(url, { headers: this.getHeaders() })
    );
    const groupsData = Array.isArray(data[0]) ? data[0] : data;

    if (!Array.isArray(groupsData) || groupsData.length === 0) {
      throw new Error('No groups data received from API');
    }

    const groupNodes = groupsData.map((group: any) => {
      const aiScore = parseScore(group.ai_average);
      const reviewerScore = parseScore(group.reviewer_average);

      return {
        id: `group-${group.hotelGroup.toLowerCase()}`,
        label: group.hotelGroup,
        type: 'hotel_group',
        group_name: group.hotelGroup,
        score: aiScore,
        color: aiScore !== null ? getScoreColor(aiScore) : '#cccccc',
        ai_avg: aiScore,
        customer_avg: reviewerScore,
        reviewer_average: reviewerScore,
        hotel_count: 0,
        review_count: 0,
        hotels: [],
      };
    });

    return sortByScoreDescending(groupNodes);
  }

  async getHotelsByGroupWithScore(groupName: string): Promise<HotelNode[]> {
    const allHotels = await this.getAllHotelsFromAPI();

    if (!allHotels || allHotels.length === 0) {
      throw new Error('No hotels received from getAllHotelsFromAPI');
    }

    const groupHotels = allHotels.filter((hotel) => {
      const hotelFirstWord = hotel.hotel_name.split(' ')[0].toUpperCase();
      return hotelFirstWord === groupName.toUpperCase();
    });

    if (groupHotels.length === 0) {
      throw new Error(`No hotels found for group: ${groupName}`);
    }

    return sortByScoreDescending(
      groupHotels.map((hotel) => ({
        ...hotel,
        group_name: groupName,
      }))
    );
  }

  async getHotelFilterTypesWithScore(
    hotelName: string
  ): Promise<FilterChoiceNode[]> {
    const encodedHotelName = encodeURIComponent(hotelName.toUpperCase());
    const url = `${this.baseUrl}/average/${encodedHotelName}`;
    const data: any = await firstValueFrom(
      this.http.get(url, { headers: this.getHeaders() })
    );
    const filterTypesData = Array.isArray(data[0]) ? data[0][0] : data[0];

    if (!filterTypesData || typeof filterTypesData !== 'object') {
      throw new Error(`No filter types data received for hotel: ${hotelName}`);
    }

    const filterChoiceNodes: FilterChoiceNode[] = Object.entries(
      filterTypesData
    ).map(([filterType, scores]: [string, any]) => {
      const aiScore = parseScore(scores.ai_average);
      const reviewerScore = parseScore(scores.reviewer_average);
      const reviewCount = scores.review_count || 0;

      const label =
        filterType === 'accommodation_type'
          ? 'Accommodation Type'
          : filterType === 'aspect'
          ? 'Aspects'
          : filterType.charAt(0).toUpperCase() + filterType.slice(1);

      return {
        id: `${hotelName}_CHOICE_${filterType.toUpperCase()}`,
        label,
        type: 'filter_choice',
        filter_type: filterType,
        hotel_name: hotelName,
        score: aiScore,
        color: aiScore !== null ? getScoreColor(aiScore) : '#cccccc',
        ai_avg: aiScore,
        customer_avg: reviewerScore,
        reviewer_average: reviewerScore,
        review_count: reviewCount,
        description: `Filter by ${label}`,
      };
    });

    filterChoiceNodes.push({
      id: `${hotelName}_CHOICE_SHOW_REVIEWS`,
      label: 'Show Reviews',
      type: 'filter_choice',
      filter_type: 'show_reviews',
      hotel_name: hotelName,
      score: null,
      color: '#cccccc',
      ai_avg: null,
      customer_avg: null,
      reviewer_average: null,
      review_count: 0,
      description: 'Show Reviews with Current Filters',
    });

    return sortByScoreDescending(filterChoiceNodes);
  }
}
