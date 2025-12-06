const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = {
  get: async (endpoint: string) => {
    try {
      console.log(`[API] GET ${API_BASE_URL}${endpoint}`);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        mode: 'cors',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errorBody = await res.json();
          if (errorBody.error) errorMsg += ` - ${errorBody.error}`;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }
      return await res.json();
    } catch (error: any) {
      console.error(`[API] GET Error:`, error);
      return { error: error.message || 'Network error' };
    }
  },
  post: async (endpoint: string, body: any) => {
    try {
      console.log(`[API] POST ${API_BASE_URL}${endpoint}`, body);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errorBody = await res.json();
          if (errorBody.error) errorMsg += ` - ${errorBody.error}`;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }
      return await res.json();
    } catch (error: any) {
      console.error(`[API] POST Error:`, error);
      return { error: error.message || 'Network error' };
    }
  },
};
