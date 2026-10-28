
import api from "./axios";

export async function testConnection() {
  try {
    const response = await api.get("/products");
    console.log("API Response:", response.data);
  } catch (error) {
    console.error("API Error:", error.response?.status, error.message);
  }
}

export default testConnection;