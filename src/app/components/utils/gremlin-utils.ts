export function extractGremlinProperty(property: any): any {
  if (!property || !Array.isArray(property) || property.length === 0) {
    return null;
  }
  const firstProperty = property[0];
  return firstProperty && firstProperty.value !== undefined ? firstProperty.value : null;
}

export function extractHotelNameFromQuery(question: string): string | null {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('akka suites') || lowerQuestion.includes('akka')) {
    return 'AKKA SUITES';
  }
  if (lowerQuestion.includes('hilton')) {
    return 'HILTON';
  }
  if (lowerQuestion.includes('marriott')) {
    return 'MARRIOTT';
  }

  return null;
}

export function extractLanguageFromQuery(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('türkçe') || lowerQuestion.includes('tr') || lowerQuestion.includes('turkish')) {
    return 'tr';
  }
  if (lowerQuestion.includes('english') || lowerQuestion.includes('en') || lowerQuestion.includes('ingilizce')) {
    return 'en';
  }
  if (lowerQuestion.includes('german') || lowerQuestion.includes('de') || lowerQuestion.includes('almanca')) {
    return 'de';
  }

  return 'tr'; // Default
}

export function extractAspectFromQuery(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('staff') || lowerQuestion.includes('personel') || lowerQuestion.includes('çalışan')) {
    return 'Staff';
  }
  if (lowerQuestion.includes('room') || lowerQuestion.includes('oda')) {
    return 'Room';
  }
  if (lowerQuestion.includes('cleanliness') || lowerQuestion.includes('temizlik')) {
    return 'Cleanliness';
  }
  if (lowerQuestion.includes('location') || lowerQuestion.includes('konum') || lowerQuestion.includes('lokasyon')) {
    return 'Location';
  }
  if (lowerQuestion.includes('food') || lowerQuestion.includes('yemek') || lowerQuestion.includes('breakfast') || lowerQuestion.includes('kahvaltı')) {
    return 'Food';
  }
  if (lowerQuestion.includes('value') || lowerQuestion.includes('fiyat') || lowerQuestion.includes('price')) {
    return 'Value for Money';
  }

  return 'General'; // Default
}

export function parseScore(score: any): number | null {
  if (score === null || score === undefined || score === "NaN" || score === '') {
    return null;
  }
  const parsed = parseFloat(score);
  return isNaN(parsed) ? null : parsed;
}

export function getScoreColor(score: number): string {
  if (score >= 0.8) return '#10b981';
  if (score >= 0.6) return '#22c55e';
  if (score >= 0.4) return '#eab308';
  if (score >= 0.2) return '#f97316';
  return '#ef4444';
}

export function extractField(field: any): any {
  if (field === null || field === undefined) return null;

  if (Array.isArray(field)) return field.length > 0 ? field[0] : null;

  if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') {
    return field;
  }

  if (typeof field === 'object') {
    return JSON.stringify(field);
  }

  return String(field);
}

/**
 * Null-safe skor sıralaması yapar (büyükten küçüğe).
 * Null olan skorlar sona atılır.
 */
export function sortByScoreDescending<T extends { score: number | null }>(items: T[]): T[] {
  return items.sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return (b.score ?? 0) - (a.score ?? 0);
  });
}
