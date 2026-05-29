// Afya CarePath API Client
// Typed client for backend service communication

class ApiClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Triage Service
  async submitTriage(symptoms) {
    return this.request('/api/triage', {
      method: 'POST',
      body: JSON.stringify({ symptoms })
    });
  }

  // Facility Matching
  async findFacilities(location, careLevel) {
    return this.request(`/api/facilities?lat=${location.lat}&lng=${location.lng}&care=${careLevel}`);
  }

  // Appointments
  async bookAppointment(facilityId, datetime, patientId) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ facilityId, datetime, patientId })
    });
  }

  // Cost Estimation
  async estimateCost(serviceType, facilityId) {
    return this.request(`/api/cost-estimate?service=${serviceType}&facility=${facilityId}`);
  }
}

export default ApiClient;