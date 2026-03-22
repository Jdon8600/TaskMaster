import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Task } from '../models/task.model';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

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
  private apiUrl = environment.apiUrl;

  tasks = this._tasks.asReadonly();
  
  sortedTasks = computed(() => {
    const tasks = this._tasks();
    const statusOrder = { 'pending': 0, 'in-progress': 1, 'done': 2 };
    return [...tasks].sort((a, b) => {
      const aIsDone = a.status === 'done';
      const bIsDone = b.status === 'done';

      if (aIsDone !== bIsDone) {
        return aIsDone ? 1 : -1;
      }

      const dueDateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dueDateDiff !== 0) {
        return dueDateDiff;
      }

      const orderA = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
      const orderB = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
      return orderA - orderB;
    });
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  async loadTasks(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<TaskResponse[]>(`${this.apiUrl}/tasks`, { headers: this.getAuthHeaders() })
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
        }, { headers: this.getAuthHeaders() })
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
        }, { headers: this.getAuthHeaders() })
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
        this.http.delete(`${this.apiUrl}/tasks/${id}`, { headers: this.getAuthHeaders() })
      );
      this._tasks.update((list) => list.filter((task) => task.id !== id));
      return true;
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }
}
