import { apiService } from './api';
import { GlobalSearchResult } from '../types';

export interface SearchFilters {
  query?: string;
  category_id?: number;
  priority?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
}

interface LaravelApiResponse<T> {
  success: boolean;
  data: T;
}

class SearchService {
  async search(filters: SearchFilters): Promise<GlobalSearchResult> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const response = await apiService.get<LaravelApiResponse<GlobalSearchResult>>(`/search?${params.toString()}`);
    return response?.data ?? { expenses: [], tasks: [] };
  }
}

export const searchService = new SearchService();
