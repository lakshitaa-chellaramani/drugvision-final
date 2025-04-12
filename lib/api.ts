import axios from "axios"

// Create an axios instance
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle errors globally
    console.error("API Error:", error)
    return Promise.reject(error)
  },
)

// API functions for users
export const userApi = {
  register: (userData) => api.post("/users/register", userData),
  login: (credentials) => api.post("/users/login", credentials),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (userData) => api.put("/users/profile", userData),
}

// API functions for medications
export const medicationApi = {
  getAll: () => api.get("/medications"),
  getById: (id) => api.get(`/medications/${id}`),
  create: (medicationData) => api.post("/medications", medicationData),
  update: (id, medicationData) => api.put(`/medications/${id}`, medicationData),
  delete: (id) => api.delete(`/medications/${id}`),
  checkInteractions: (medications) => api.post("/medications/check-interactions", { medications }),
}

// API functions for prescriptions
export const prescriptionApi = {
  getAll: () => api.get("/prescriptions"),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (prescriptionData) => api.post("/prescriptions", prescriptionData),
  update: (id, prescriptionData) => api.put(`/prescriptions/${id}`, prescriptionData),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  uploadImage: (formData) =>
    api.post("/prescriptions/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  analyzeImage: (imageUrl) => api.post("/prescriptions/analyze", { imageUrl }),
}

// API functions for appointments
export const appointmentApi = {
  getAll: () => api.get("/appointments"),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post("/appointments", appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id) => api.delete(`/appointments/${id}`),
}

// API functions for health plans
export const healthPlanApi = {
  getAll: () => api.get("/health-plans"),
  getById: (id) => api.get(`/health-plans/${id}`),
  create: (healthPlanData) => api.post("/health-plans", healthPlanData),
  update: (id, healthPlanData) => api.put(`/health-plans/${id}`, healthPlanData),
  delete: (id) => api.delete(`/health-plans/${id}`),
  generateWithAI: (patientId) => api.post("/health-plans/generate", { patientId }),
}

// API functions for AI assistant
export const aiApi = {
  askQuestion: (question) => api.post("/ai/ask", { question }),
  analyzePrescription: (prescriptionData) => api.post("/ai/analyze-prescription", prescriptionData),
  checkMedicationCompatibility: (medicationData) => api.post("/ai/check-compatibility", medicationData),
}

export default api
