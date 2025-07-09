// ✅ Mevcut modeller - korunacak
export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  id?: string;
}

export interface QueryInfo {
  success: boolean;
  message: string;
  resultCount?: number;
  gremlinQuery?: string;
  timestamp: Date;
}

// 🔧 RAGResponse - API yapısına göre güncellendi
export interface RAGResponse {
  gremlin: string;           // 🔧 Required - API'den her zaman geliyor
  data: any[];               // 🔧 Required - API'den her zaman geliyor
  question: string;          // 🔧 Added - soruyu takip için
  hasResults: boolean;       // ✅ Computed field
  error?: string;            // ✅ Optional error
  resultCount?: number;      // ✅ Computed field
}

// ✅ GraphData - Perfect, değişiklik yok
export interface GraphData {
  nodes: any[];
  links: any[];
  metadata: {
    question: string;
    gremlin: string;
    resultCount: number;
    message: string;
  };
}

// 🆕 YENİ: Gremlin API'den gelen raw data yapısı
export interface GremlinVertex {
  id: string;
  label: string;
  properties: {
    [key: string]: Array<{
      id: string;
      value: any;
    }>
  };
}

// 🆕 YENİ: API Request/Response interfaces
export interface RAGRequest {
  question: string;
}

export interface RAGApiResponse {
  gremlin: string;
  data: GremlinVertex[];
  // Diğer optional fields...
}

// 🆕 YENİ: Graph Node interfaces - type safety için
export interface GraphNode {
  id: string;
  label: string;
  type: 'chatbot_query' | 'review' | 'hotel' | 'filter';
  x?: number;
  y?: number;
  score?: number | null;
  color?: string;
  description?: string;

  // Review-specific properties
  review_text?: string;
  reviewer_name?: string;
  hotel_name?: string;
  language?: string;
  aspect?: string;
  source?: string;
  review_date?: string;
  review_link?: string;
  is_flagged?: boolean;
  is_deleted?: boolean;

  // RAG-specific properties
  question?: string;
  rag_query?: string;
  gremlin_id?: string;
  gremlin_label?: string;
  hotel_id?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'rag_connection' | 'hotel_connection' | 'filter_connection';
  value?: number;
}

// 🆕 YENİ: Service Response için standardized interface
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface RAGResponse {
  gremlin: string;
  data: any[];
  question: string;
  hasResults: boolean;
}

export interface GraphData {
  nodes: any[];
  links: any[];
  metadata: {
    question: string;
    gremlin: string;
    resultCount: number;
    message: string;
  };
}

export interface GremlinVertex {
  id: string;
  label: string;
  properties: { [key: string]: Array<{ id: string; value: any }> };
}
