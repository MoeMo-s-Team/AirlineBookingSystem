import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

function TestComponent() {
  const { user, isAuthenticated, isAdmin, login, register, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="admin-status">{isAdmin ? 'admin' : 'not-admin'}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <div data-testid="user-name">{user?.name || 'no-name'}</div>
      <button
        onClick={() => login('nguyenvana@email.com', 'password123')}
        data-testid="login-customer"
      >
        Login Customer
      </button>
      <button
        onClick={() => login('admin@skywing.vn', 'admin123')}
        data-testid="login-admin"
      >
        Login Admin
      </button>
      <button
        onClick={() => login('wrong@email.com', 'wrongpass')}
        data-testid="login-fail"
      >
        Login Fail
      </button>
      <button
        onClick={() =>
          register({
            email: 'newuser@email.com',
            password: 'newpassword',
            name: 'New Person',
            phone: '0123456789',
          })
        }
        data-testid="register-new"
      >
        Register New
      </button>
      <button
        onClick={() =>
          register({
            email: 'nguyenvana@email.com',
            password: 'anypassword',
            name: 'Duplicate Person',
            phone: '0123456789',
          })
        }
        data-testid="register-duplicate"
      >
        Register Duplicate
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });

  it('initializes as unauthenticated when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('admin-status')).toHaveTextContent('not-admin');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
  });

  it('logs in customer successfully and updates state', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('login-customer'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('admin-status')).toHaveTextContent('not-admin');
      expect(screen.getByTestId('user-email')).toHaveTextContent('nguyenvana@email.com');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Nguyen Van An');
    });
  });

  it('logs in admin successfully and sets isAdmin to true', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('login-admin'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('admin-status')).toHaveTextContent('admin');
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@skywing.vn');
    });
  });

  it('fails login with invalid credentials', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('login-fail'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    });
  });

  it('registers a new user and sets state', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('register-new'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('newuser@email.com');
      expect(screen.getByTestId('user-name')).toHaveTextContent('New Person');
    });
  });

  it('fails registration for duplicate email', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('register-duplicate'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    });
  });

  it('logs out and clears state', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId('login-customer'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    await user.click(screen.getByTestId('logout-btn'));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-email');
  });

  it('restores persisted user from localStorage on mount', () => {
    localStorage.setItem(
      'skywing_auth_user',
      JSON.stringify({
        id: 'user-1',
        email: 'saved@email.com',
        name: 'Saved User',
        phone: '1234567890',
        role: 'customer',
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('saved@email.com');
  });
});
