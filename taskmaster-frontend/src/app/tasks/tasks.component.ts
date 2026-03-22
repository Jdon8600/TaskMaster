import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-card">
      <div class="top-row">
        <h1>Task Manager</h1>
        <button class="btn btn-signup" (click)="logout()">Logout</button>
      </div>
      <p>Manage tasks with title, description, due date, and status.</p>

      <form (submit)="onSubmit($event)">
        <div class="form-field">
          <label>Title</label>
          <input [(ngModel)]="taskForm.title" name="title" required />
        </div>
        <div class="form-field">
          <label>Description</label>
          <textarea [(ngModel)]="taskForm.description" name="description" required></textarea>
        </div>
        <div class="form-field">
          <label>Due date</label>
          <input type="date" [(ngModel)]="taskForm.dueDate" name="dueDate" required />
        </div>
        <div class="form-field">
          <label>Status</label>
          <select [(ngModel)]="taskForm.status" name="status" required>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div class="actions">
          <button class="btn btn-login" type="submit">Add Task</button>
        </div>
      </form>

      <div class="task-list" *ngIf="taskService.sortedTasks().length > 0; else empty">
        <table>
          <thead>
            <tr><th>Title</th><th>Description</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of taskService.sortedTasks()">
              <td>{{ task.title }}</td>
              <td>{{ task.description }}</td>
              <td>{{ task.dueDate }}</td>
              <td>{{ task.status }}</td>
              <td>
                <button class="mini-btn" (click)="openEdit(task)">Edit</button>
                <button class="mini-btn delete" (click)="deleteTask(task.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #empty>
        <p class="empty">No tasks yet. Add your first task above.</p>
      </ng-template>

      <p><button class="btn btn-signup" (click)="backHome()">Back to Home</button></p>
    </div>

    <div class="modal-overlay" *ngIf="editingTask">
      <div class="modal-card">
        <h2>Edit Task</h2>
        <form (submit)="saveEdit($event)">
          <div class="form-field">
            <label>Title</label>
            <input [(ngModel)]="editForm.title" name="editTitle" required />
          </div>
          <div class="form-field">
            <label>Description</label>
            <textarea [(ngModel)]="editForm.description" name="editDescription" required></textarea>
          </div>
          <div class="form-field">
            <label>Due date</label>
            <input type="date" [(ngModel)]="editForm.dueDate" name="editDueDate" required />
          </div>
          <div class="form-field">
            <label>Status</label>
            <select [(ngModel)]="editForm.status" name="editStatus" required>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div class="actions">
            <button class="btn btn-login" type="submit">Save Changes</button>
            <button class="btn btn-signup" type="button" (click)="closeEdit()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TasksComponent implements OnInit {
  taskForm: Omit<Task, 'id'> = {
    title: '',
    description: '',
    dueDate: '',
    status: 'pending'
  };

  editingTask: Task | null = null;
  editForm: Omit<Task, 'id'> = {
    title: '',
    description: '',
    dueDate: '',
    status: 'pending'
  };

  constructor(public taskService: TaskService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.taskService.loadTasks();
  }

  async logout() {
    await this.authService.logout();
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (!this.taskForm.title.trim() || !this.taskForm.description.trim() || !this.taskForm.dueDate.trim()) {
      window.alert('Please complete all fields.');
      return;
    }

    const success = await this.taskService.addTask({
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim(),
      dueDate: this.taskForm.dueDate,
      status: this.taskForm.status
    });

    if (success) {
      this.resetForm();
    } else {
      window.alert('Failed to add task. Please try again.');
    }
  }

  openEdit(task: Task) {
    this.editingTask = task;
    this.editForm = { ...task };
  }

  async saveEdit(event: Event) {
    event.preventDefault();

    if (!this.editingTask) {
      return;
    }

    if (!this.editForm.title.trim() || !this.editForm.description.trim() || !this.editForm.dueDate.trim()) {
      window.alert('Please complete all fields.');
      return;
    }

    const success = await this.taskService.updateTask(this.editingTask.id, {
      title: this.editForm.title.trim(),
      description: this.editForm.description.trim(),
      dueDate: this.editForm.dueDate,
      status: this.editForm.status
    });

    if (success) {
      this.closeEdit();
    } else {
      window.alert('Failed to update task. Please try again.');
    }
  }

  closeEdit() {
    this.editingTask = null;
    this.editForm = {
      title: '',
      description: '',
      dueDate: '',
      status: 'pending'
    };
  }

  async deleteTask(id: number) {
    const success = await this.taskService.deleteTask(id);
    if (success && this.editingTask?.id === id) {
      this.closeEdit();
    }
  }

  backHome() {
    this.router.navigate(['/']);
  }

  resetForm() {
    this.taskForm = {
      title: '',
      description: '',
      dueDate: '',
      status: 'pending'
    };
  }
}
