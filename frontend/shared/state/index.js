// Afya CarePath State Management
// Minimal global state using observer pattern

class StateManager {
  constructor() {
    this.state = {
      user: null,
      currentTriage: null,
      selectedFacility: null,
      appointments: [],
      notifications: []
    };
    this.listeners = {};
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Notify listeners of changed keys
    Object.keys(updates).forEach(key => {
      if (this.listeners[key]) {
        this.listeners[key].forEach(callback => {
          callback(this.state[key], prevState[key]);
        });
      }
    });
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  // Action creators
  setUser(user) {
    this.setState({ user });
  }

  setTriage(triage) {
    this.setState({ currentTriage: triage });
  }

  selectFacility(facility) {
    this.setState({ selectedFacility: facility });
  }

  addAppointment(appointment) {
    this.setState({ 
      appointments: [...this.state.appointments, appointment] 
    });
  }

  addNotification(notification) {
    this.setState({
      notifications: [...this.state.notifications, { 
        ...notification, 
        id: Date.now(),
        timestamp: new Date()
      }]
    });
  }
}

// Global instance
export const globalState = new StateManager();
export default StateManager;