import { create } from "zustand";
import { fetchApi, ApiError } from "../api";

export interface Task {
  id: number;
  contract_id?: number;
  owner_id?: number;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  created_at?: string;
  contract_name?: string;
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  
  fetchTasks: () => Promise<void>;
  createTask: (data: Omit<Task, "id" | "created_at">) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  toggleTaskCompleted: (id: number, completed: boolean) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  clearTasks: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchApi("/crm/tasks");
      set({ tasks: data, isLoading: false });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        console.error("Failed to fetch tasks", e);
      }
      set({ isLoading: false });
    }
  },

  createTask: async (data) => {
    try {
      const result = await fetchApi("/crm/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      });
      set((state) => ({
        tasks: [result, ...state.tasks],
      }));
      return result;
    } catch (e) {
      console.error("Failed to create task", e);
      throw e;
    }
  },

  updateTask: async (id, data) => {
    try {
      const result = await fetchApi(`/crm/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? result : task)),
      }));
    } catch (e) {
      console.error("Failed to update task", e);
      throw e;
    }
  },

  toggleTaskCompleted: async (id, completed) => {
    const previousTasks = get().tasks;
    // Optimistic toggle update
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
    }));

    try {
      await fetchApi(`/crm/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed }),
      });
    } catch (e) {
      console.error("Failed to toggle task completion status", e);
      // Revert optimistic update
      set({ tasks: previousTasks });
      throw e;
    }
  },

  deleteTask: async (id) => {
    try {
      await fetchApi(`/crm/tasks/${id}`, {
        method: "DELETE",
      });
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (e) {
      console.error("Failed to delete task", e);
      throw e;
    }
  },

  clearTasks: () => set({ tasks: [] }),
}));
