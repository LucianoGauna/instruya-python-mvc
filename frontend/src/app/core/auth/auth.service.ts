import { Injectable, signal } from '@angular/core';
import { AuthUser } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  token = signal<string | null>(null);
  user = signal<AuthUser | null>(null);

  constructor() {
    // cuando arranca la app, intento restaurar sesión
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) this.token.set(storedToken);
    if (storedUser) this.user.set(JSON.parse(storedUser));
  }

  login(token: string, user: AuthUser) {
    this.token.set(token);
    this.user.set(user);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.token.set(null);
    this.user.set(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn() {
    return this.token() !== null;
  }

  getRole() {
    return this.user()?.rol ?? null;
  }
}
