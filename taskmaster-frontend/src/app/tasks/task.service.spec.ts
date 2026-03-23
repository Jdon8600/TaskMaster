import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';
import { AuthService } from '../auth/auth.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpClientSpy: any;
  const authServiceSpy = {
    token: vi.fn(() => 'jwt-token')
  };

  beforeEach(() => {
    httpClientSpy = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTasks', () => {
    it('should load and map tasks correctly', async () => {
      const mockResponse = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          due_date: '2026-03-22',
          status: 'pending',
          email_address: 'test@example.com'
        }
      ];

      httpClientSpy.get.mockReturnValue(of(mockResponse));

      await service.loadTasks();

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/tasks',
        expect.objectContaining({ headers: expect.anything() })
      );
      const tasks = service.tasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0]).toEqual({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2026-03-22',
        status: 'pending'
      });
    });

    it('should handle load tasks error gracefully', async () => {
      vi.spyOn(console, 'error');

      httpClientSpy.get.mockReturnValue(throwError(() => new Error('network error')));

      await service.loadTasks();

      expect(console.error).toHaveBeenCalledWith('Failed to load tasks:', expect.any(Object));
      expect(service.tasks()).toEqual([]);
    });
  });

  describe('addTask', () => {
    it('should add task and update signal', async () => {
      const newTaskData = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2026-03-23',
        status: 'pending' as const
      };
      const mockResponse = {
        id: 2,
        title: 'New Task',
        description: 'New Description',
        due_date: '2026-03-23',
        status: 'pending',
        email_address: 'test@example.com'
      };

      httpClientSpy.post.mockReturnValue(of(mockResponse));

      const result = await service.addTask(newTaskData);

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/tasks',
        {
          task: {
            title: 'New Task',
            description: 'New Description',
            due_date: '2026-03-23',
            status: 'pending'
          }
        },
        expect.objectContaining({ headers: expect.anything() })
      );
      expect(result).toEqual({
        id: 2,
        title: 'New Task',
        description: 'New Description',
        dueDate: '2026-03-23',
        status: 'pending'
      });
      expect(service.tasks()).toContain(result);
    });

    it('should return null on add task error', async () => {
      const newTaskData = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2026-03-23',
        status: 'pending' as const
      };

      vi.spyOn(console, 'error');

      httpClientSpy.post.mockReturnValue(throwError(() => new Error('network error')));

      const result = await service.addTask(newTaskData);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Failed to add task:', expect.any(Object));
    });
  });

  describe('updateTask', () => {
    it('should update task and update signal', async () => {
      // First add a task
      service['_tasks'].set([{
        id: 1,
        title: 'Old Title',
        description: 'Old Description',
        dueDate: '2026-03-22',
        status: 'pending'
      }]);

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        dueDate: '2026-03-24',
        status: 'in_progress' as const
      };

      httpClientSpy.put.mockReturnValue(of({}));

      const result = await service.updateTask(1, updateData);

      expect(httpClientSpy.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/tasks/1',
        {
          task: {
            title: 'Updated Title',
            description: 'Updated Description',
            due_date: '2026-03-24',
            status: 'in_progress'
          }
        },
        expect.objectContaining({ headers: expect.anything() })
      );
      expect(result).toBe(true);
      const tasks = service.tasks();
      expect(tasks[0]).toEqual({
        id: 1,
        ...updateData
      });
    });

    it('should return false on update task error', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        dueDate: '2026-03-24',
        status: 'in_progress' as const
      };

      vi.spyOn(console, 'error');

      httpClientSpy.put.mockReturnValue(throwError(() => new Error('network error')));

      const result = await service.updateTask(1, updateData);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to update task:', expect.any(Object));
    });
  });

  describe('deleteTask', () => {
    it('should delete task and update signal', async () => {
      // First add tasks
      service['_tasks'].set([
        { id: 1, title: 'Task 1', description: '', dueDate: '', status: 'pending' },
        { id: 2, title: 'Task 2', description: '', dueDate: '', status: 'pending' }
      ]);

      httpClientSpy.delete.mockReturnValue(of({}));

      const result = await service.deleteTask(1);

      expect(httpClientSpy.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/tasks/1',
        expect.objectContaining({ headers: expect.anything() })
      );
      expect(result).toBe(true);
      const tasks = service.tasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe(2);
    });

    it('should return false on delete task error', async () => {
      vi.spyOn(console, 'error');

      httpClientSpy.delete.mockReturnValue(throwError(() => new Error('network error')));

      const result = await service.deleteTask(1);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to delete task:', expect.any(Object));
    });
  });

  describe('sortedTasks', () => {
    it('should sort by status first, then due date within same status', () => {
      service['_tasks'].set([
        { id: 1, title: 'Done later', description: '', dueDate: '2026-03-30', status: 'done' },
        { id: 2, title: 'Pending later', description: '', dueDate: '2026-03-29', status: 'pending' },
        { id: 3, title: 'Pending earlier', description: '', dueDate: '2026-03-24', status: 'pending' },
        { id: 4, title: 'In progress earlier', description: '', dueDate: '2026-03-25', status: 'in_progress' },
        { id: 5, title: 'Done earlier', description: '', dueDate: '2026-03-20', status: 'done' }
      ]);

      const sorted = service.sortedTasks();

      expect(sorted.map(task => task.id)).toEqual([3, 2, 4, 5, 1]);
    });
  });
});