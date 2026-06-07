/**
 * API Client Service
 * Provides type-safe methods for calling the backend API
 */

const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ============================================
  // HEALTH CHECK
  // ============================================
  async getHealth() {
    return this.request("/api/health");
  }

  // ============================================
  // LECTURERS
  // ============================================
  async getLecturers() {
    return this.request("/api/lecturers");
  }

  async createLecturer(data: {
    name: string;
    email: string;
    department: string;
    availability?: Array<{ day: number; period: number }>;
  }) {
    return this.request("/api/lecturers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLecturer(
    id: string,
    data: {
      name?: string;
      email?: string;
      department?: string;
      availability?: Array<{ day: number; period: number }>;
    },
  ) {
    return this.request(`/api/lecturers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteLecturer(id: string) {
    return this.request(`/api/lecturers/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================
  // CLASSROOMS
  // ============================================
  async getClassrooms() {
    return this.request("/api/classrooms");
  }

  async createClassroom(data: {
    name: string;
    capacity: number;
    type: "lecture" | "lab";
  }) {
    return this.request("/api/classrooms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClassroom(id: string, data: Partial<{
    name: string;
    capacity: number;
    type: "lecture" | "lab";
  }>) {
    return this.request(`/api/classrooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteClassroom(id: string) {
    return this.request(`/api/classrooms/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================
  // STUDENT GROUPS
  // ============================================
  async getGroups() {
    return this.request("/api/groups");
  }

  async createGroup(data: {
    name: string;
    size: number;
    year: 1 | 2 | 3;
  }) {
    return this.request("/api/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateGroup(id: string, data: Partial<{
    name: string;
    size: number;
    year: 1 | 2 | 3;
  }>) {
    return this.request(`/api/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string) {
    return this.request(`/api/groups/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================
  // COURSES
  // ============================================
  async getCourses() {
    return this.request("/api/courses");
  }

  async createCourse(data: {
    code: string;
    title: string;
    lecturerId: string;
    groupId: string;
    weeklyHours: number;
    roomType: "lecture" | "lab";
  }) {
    return this.request("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: string, data: Partial<{
    code: string;
    title: string;
    lecturerId: string;
    groupId: string;
    weeklyHours: number;
    roomType: "lecture" | "lab";
  }>) {
    return this.request(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/api/courses/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================
  // ASSIGNMENTS
  // ============================================
  async getAssignments() {
    return this.request("/api/assignments");
  }

  async createAssignment(data: {
    courseId: string;
    day: number;
    period: number;
    classroomId: string;
  }) {
    return this.request("/api/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createAssignmentsBatch(data: Array<{
    courseId: string;
    day: number;
    period: number;
    classroomId: string;
  }>) {
    return this.request("/api/assignments/batch", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteAssignment(id: string) {
    return this.request(`/api/assignments/${id}`, {
      method: "DELETE",
    });
  }

  async clearAssignments() {
    return this.request("/api/assignments", {
      method: "DELETE",
    });
  }

  // ============================================
  // CONFLICTS
  // ============================================
  async getConflicts() {
    return this.request("/api/conflicts");
  }

  // ============================================
  // SEED DATA
  // ============================================
  async seedData() {
    return this.request("/api/seed", {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();
export type { ApiClient };
