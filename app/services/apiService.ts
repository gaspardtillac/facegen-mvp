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
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  async register(email: string, password: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la connexion');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  }

  async getProfile() {
    const response = await this.request('/auth/profile');
    
    if (!response.ok) {
      throw new Error('Non authentifié');
    }
    
    return response.json();
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  async generateImage(prompt: string, imageBase64: string, mimeType: string) {
    const response = await this.request('/images/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, imageBase64, mimeType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la génération');
    }

    return response.json();
  }

  async generateTextToImage(prompt: string) {
    const response = await this.request('/images/text-to-image', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la génération');
    }
    
    return response.json();
  }

  async generateImageToVideo(prompt: string, imageBase64: string, mimeType: string) {
    const response = await this.request('/images/image-to-video', {
      method: 'POST',
      body: JSON.stringify({ prompt, imageBase64, mimeType }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la génération vidéo');
    }
    
    return response.json();
  }

  async getHistory() {
    const response = await this.request('/images/history');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du chargement de l\'historique');
    }
    
    return response.json();
  }

  async getPackages() {
    const response = await this.request('/payment/packages');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du chargement des forfaits');
    }
    
    return response.json();
  }

  async createCheckoutSession(packageType = 'starter') {
    const response = await this.request('/payment/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ packageType }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la session');
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();
