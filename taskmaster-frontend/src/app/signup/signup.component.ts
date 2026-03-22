import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-card">
      <h1>Sign Up for TaskMaster</h1>
      <p>Create a free account to start tracking your tasks instantly.</p>
      <form (submit)="onSubmit($event)">
        <div class="form-field">
          <label>First name</label>
          <input type="text" name="firstName" required />
        </div>
        <div class="form-field">
          <label>Last name</label>
          <input type="text" name="lastName" required />
        </div>
        <div class="form-field">
          <label>Email</label>
          <input type="email" name="email" required />
        </div>
        <div class="form-field">
          <label>Password</label>
          <input type="password" name="password" required minlength="6" />
        </div>

        <div class="actions">
          <button class="btn btn-login" type="submit">Create Account</button>
          <button class="btn btn-signup" type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `
})
export class SignUpComponent {
  constructor(private router: Router, private authService: AuthService) {}

  async onSubmit(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const data = new FormData(form);
    const firstName = (data.get('firstName') as string || '').trim();
    const lastName = (data.get('lastName') as string || '').trim();
    const email = (data.get('email') as string || '').trim();
    const password = (data.get('password') as string || '').trim();

    if (!firstName || !lastName || !email || !password) {
      window.alert('Please complete all fields.');
      return;
    }

    const result = await this.authService.signup(firstName, lastName, email, password);
    if (result.success) {
      window.alert(`Thank you ${firstName}! Sign-up and login successful.`);
      this.router.navigate(['/tasks']);
      return;
    }

    window.alert(result.error || 'Unable to sign up. Please try again.');
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
