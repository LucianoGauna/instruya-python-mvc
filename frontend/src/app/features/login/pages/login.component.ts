import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { AuthService } from '../../../core/auth/auth.service';
import { homeRouteForRole } from '../../../core/auth/home-route.util';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class LoginPageComponent {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private fb = inject(NonNullableFormBuilder);
  private messageService = inject(MessageService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = signal(false);

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { email, password } = this.form.getRawValue();

    this.loginService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.auth.login(res.token, res.user);
        this.router.navigate([homeRouteForRole(res.user.rol)]);
      },
      error: (err) => {
        this.loading.set(false);

        if (err?.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Credenciales inválidas',
            detail: 'Revisá tu email y contraseña',
            life: 3500,
          });
          return;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo iniciar sesión',
          life: 3500,
        });
      },
    });
  }
}
