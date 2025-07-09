import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  RAGResponse,
  RAGRequest,
  RAGApiResponse,
  GraphData,
  GraphNode,
  GraphLink,
  GremlinVertex,
} from '../models/chatbot.model';

import {
  extractGremlinProperty,
  extractHotelNameFromQuery,
  extractLanguageFromQuery,
  extractAspectFromQuery,
  parseScore,
  getScoreColor
} from '../components/utils/gremlin-utils';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly baseURL = 'https://gremlinrag-etd0gga7f3epfdep.germanywestcentral-01.azurewebsites.net';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // ✅ Main RAG API function - Updated return type
  async queryChatBotRAG(question: string): Promise<RAGResponse> {
    try {
      console.log('🤖 RAG Query:', question);

      const request: RAGRequest = { question };

      const apiResponse = await this.http.post<RAGApiResponse>(
        `${this.baseURL}/query`,
        request,
        this.httpOptions
      ).toPromise();

      console.log('✅ RAG Response received:', apiResponse);

      if (!apiResponse || !apiResponse.gremlin) {
        throw new Error('Invalid RAG response structure');
      }

      // 🔧 API response'u standardized RAGResponse'a çevir
      const ragResponse: RAGResponse = {
        gremlin: apiResponse.gremlin,
        data: apiResponse.data || [],
        question: question,
        hasResults: apiResponse.data && apiResponse.data.length > 0,
        resultCount: apiResponse.data ? apiResponse.data.length : 0
      };

      return ragResponse;

    } catch (err: any) {
      console.error('❌ RAG Query failed:', err);

      // Error durumunda da proper RAGResponse döndür
      return {
        gremlin: '',
        data: [],
        question: question,
        hasResults: false,
        resultCount: 0,
        error: err.message || 'Unknown error'
      };
    }
  }

  // 🔧 Updated return type ve parameters
  processRAGResults(ragResponse: RAGResponse, question: string): GraphData {
    try {
      const { gremlin, data, hasResults } = ragResponse;

      if (!hasResults || data.length === 0) {
        return {
          nodes: [],
          links: [],
          metadata: {
            question: question,
            gremlin: gremlin,
            resultCount: 0,
            message: "No results found for your query."
          }
        };
      }

      // 🔧 Typed node ve link arrays
      const nodes: GraphNode[] = this.convertGremlinVerticesToNodes(data, question);
      const links: GraphLink[] = this.generateLinksFromGremlinData(nodes, data);

      console.log(`🔄 Gremlin Results processed: ${nodes.length} nodes, ${links.length} links`);

      return {
        nodes: nodes,
        links: links,
        metadata: {
          question: question,
          gremlin: gremlin,
          resultCount: data.length,
          message: `Found ${data.length} reviews for your query.`
        }
      };

    } catch (err: any) {
      console.error('❌ Gremlin Result processing failed:', err);
      throw new Error(`Failed to process Gremlin results: ${err.message}`);
    }
  }

  // 🔧 Updated return types
  private convertGremlinVerticesToNodes(vertices: GremlinVertex[], question: string): GraphNode[] {
    const nodes: GraphNode[] = [];

    // 🤖 ChatBot Query node'u ekle (merkez)
    const queryNode: GraphNode = {
      id: `CHATBOT_QUERY_${Date.now()}`,
      label: `RAG Query: ${question.substring(0, 30)}...`,
      type: "chatbot_query",
      question: question,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      score: null,
      color: '#8B5CF6',
      description: `RAG Query: "${question}"`
    };
    nodes.push(queryNode);

    // 🔍 Her Gremlin vertex'i için review node oluştur
    vertices.forEach((vertex, index) => {
      try {
        const reviewNode = this.createGremlinReviewNode(vertex, index, question);
        if (reviewNode) {
          nodes.push(reviewNode);
        }
      } catch (error) {
        console.warn(`⚠️ Skipping invalid Gremlin vertex ${index}:`, error);
      }
    });

    console.log(`🔄 Converted ${vertices.length} Gremlin vertices to ${nodes.length - 1} review nodes`);
    return nodes;
  }

  private generateLinksFromGremlinData(nodes: GraphNode[], vertices: GremlinVertex[]): GraphLink[] {
    const links: GraphLink[] = [];
    const queryNode = nodes.find(n => n.type === "chatbot_query");

    if (!queryNode) return links;

    // Tüm review node'larını query node'una bağla
    nodes.forEach(node => {
      if (node.type === "review") {
        links.push({
          source: queryNode.id,
          target: node.id,
          type: "rag_connection",
          value: 1
        });
      }
    });

    return links;
  }

  // 📝 Gremlin vertex'den review node oluştur - updated return type
  private createGremlinReviewNode(vertex: GremlinVertex, index: number, question: string): GraphNode | null {
    try {
      // Gremlin vertex yapısını parse et
      const gremlinId = vertex.id;
      const label = vertex.label;
      const properties = vertex.properties || {};

      // Gremlin property formatını çöz - bracket notation kullan
      const reviewText = extractGremlinProperty(properties['review_text']) || 'No review text';
      const reviewer = extractGremlinProperty(properties['reviewer']) || 'Anonymous';
      const score = parseScore(extractGremlinProperty(properties['score']));
      const reviewDate = extractGremlinProperty(properties['review_date']);
      const reviewLink = extractGremlinProperty(properties['review_link']);
      const hotelId = extractGremlinProperty(properties['hotel_id']);
      const isFlagged = extractGremlinProperty(properties['is_flagged']) || false;
      const isDeleted = extractGremlinProperty(properties['is_deleted']) || false;

      // 🔧 Typed review node oluştur
      const reviewNode: GraphNode = {
        id: `RAG_REVIEW_${index}_${Date.now()}`,
        label: reviewText.length > 30 ? `${reviewText.substring(0, 30)}...` : reviewText,
        type: "review",
        review_text: reviewText,
        reviewer_name: reviewer,
        score: score,
        color: score !== null ? getScoreColor(score) : '#cccccc',
        hotel_name: extractHotelNameFromQuery(question) || 'AKKA SUITES',
        hotel_id: hotelId,
        language: extractLanguageFromQuery(question) || 'tr',
        aspect: extractAspectFromQuery(question) || 'staff',
        source: 'google',
        review_date: reviewDate,
        review_link: reviewLink,
        is_flagged: isFlagged,
        is_deleted: isDeleted,
        rag_query: question,
        gremlin_id: gremlinId,
        gremlin_label: label,
        description: `RAG Review: ${reviewText.substring(0, 50)}...`,
        // Graph positioning
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 600,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 600
      };

      return reviewNode;

    } catch (error) {
      console.error('❌ Error creating Gremlin review node:', error);
      return null;
    }
  }
}
