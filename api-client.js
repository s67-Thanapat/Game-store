// API Client สำหรับเชื่อมต่อ Cloudflare Worker
// เปลี่ยน YOUR_API_URL เป็น URL จริง เช่น https://nexora-api.YOUR_SUBDOMAIN.workers.dev

const API_URL = "https://nexora-api.s6701012610180.workers.dev";

const apiClient = {
  async fetchStore() {
    try {
      const response = await fetch(`${API_URL}/api/store`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching store:", error);
      return null;
    }
  },

  async saveStore(state) {
    try {
      const response = await fetch(`${API_URL}/api/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error saving store:", error);
      return { success: false, error: error.message };
    }
  }
};
