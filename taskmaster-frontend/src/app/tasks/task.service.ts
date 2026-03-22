import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { firstValueFrom } from 'rxjs';

interface TaskResponse {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  email_address: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks = signal<Task[]>([]);
  private apiUrl = 'http://localhost:3000/api';

  tasks = this._tasks.asReadonly();

  constructor(private http: HttpClient) {}

  async loadTasks(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<TaskResponse[]>(`${this.apiUrl}/tasks`, { withCredentials: true })
      );
      const tasks = response.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        status: task.status as any
      }));
      this._tasks.set(tasks);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
    }
  }

  async addTask(task: Omit<Task, 'id'>): Promise<Task | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<TaskResponse>(`${this.apiUrl}/tasks`, {
          task: {
            title: task.title,
            description: task.description,
            due_date: task.dueDate,
            status: task.status
          }
        }, { withCredentials: true })
      );
      const newTask: Task = {
        id: response.id,
        title: response.title,
        description: response.description,
        dueDate: response.due_date,
        status: response.status as any
      };
      this._tasks.update((list) => [...list, newTask]);
      return newTask;
    } catch (error: any) {
      console.error('Failed to add task:', error);
      return null;
    }
  }

  async updateTask(id: number, task: Omit<Task, 'id'>): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/tasks/${id}`, {
          task: {
            title: task.title,
            description: task.description,
            due_date: task.dueDate,
            status: task.status
          }
        }, { withCredentials: true })
      );
      this._tasks.update((list) =>
        list.map((item) => (item.id === id ? { ...item, ...task } : item))
      );
      return true;
    } catch (error: any) {
      console.error('Failed to update task:', error);
      return false;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/tasks/${id}`, { withCredentials: true })
      );
      this._tasks.update((list) => list.filter((task) => task.id !== id));
      return true;
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  clearTasks() {
    this._tasks.set([]);
  }
}
