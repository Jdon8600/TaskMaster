import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-card">
      <h1>Welcome to TaskMaster</h1>
      <p>Organize your tasks, boost your productivity, and stay on track.</p>

      <ng-container *ngIf="!authService.isAuthenticated(); else authenticated">
        <form (submit)="onLogin($event)">
          <div class="form-field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="form-field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6" />
          </div>

          <div class="actions">
            <button class="btn btn-login" type="submit">Login</button>
            <button class="btn btn-signup" type="button" (click)="navigate('signup')">Sign Up</button>
          </div>
        </form>

        <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      </ng-container>

      <ng-template #authenticated>
        <p class="success">
          <button class="btn btn-login" (click)="navigate('tasks')">Go to Tasks</button>
        </p>
      </ng-template>
    </div>
  `
})
export class HomeComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router, public authService: AuthService) {}

  async onLogin(event: Event) {
    event.preventDefault();
    const success = await this.authService.login(this.email, this.password);
    if (!success) {
      this.errorMessage = 'Invalid email or password. Please try again.';
      window.alert('Invalid email or password. Please try again.');
      return;
    }

    this.errorMessage = '';
    this.router.navigate(['/tasks']);
  }

  navigate(path: 'tasks' | 'signup') {
    this.router.navigate([path]);
  }
}
