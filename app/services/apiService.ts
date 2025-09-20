class ApiService {
  private baseURL = 'http://localhost:5000/api';
  
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur API');
    }
    
    return data;
  }

  async register(email: string, password: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async generateImage(prompt: string, imageBase64: string, mimeType: string) {
    return this.request('/images/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, imageBase64, mimeType })
    });
  }

  async getHistory() {
    return this.request('/images/history');
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }
}

export const apiService = new ApiService();
