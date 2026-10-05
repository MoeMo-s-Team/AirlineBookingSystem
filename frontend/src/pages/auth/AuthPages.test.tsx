import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

describe('Auth Pages', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('LoginPage', () => {
    it('renders login form elements', () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </AuthProvider>
      );

      expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByText('Remember me')).toBeInTheDocument();
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });

    it('shows error on failed login', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </AuthProvider>
      );

      await user.type(screen.getByPlaceholderText('you@example.com'), 'unknown@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
      });
    });

    it('navigates to home on successful login', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<div data-testid="home-page">Home</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );

      await user.type(screen.getByPlaceholderText('you@example.com'), 'nguyenvana@email.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('RegisterPage', () => {
    it('validates password match and length', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <MemoryRouter>
            <RegisterPage />
          </MemoryRouter>
        </AuthProvider>
      );

      // Short password error
      await user.type(screen.getByPlaceholderText('Nguyen Van A'), 'User Name');
      await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com');
      await user.type(screen.getByPlaceholderText('0912345678'), '0912345678');
      await user.type(screen.getByPlaceholderText('Min. 6 characters'), '123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), '123');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 6 characters');

      // Passwords mismatch error
      await user.clear(screen.getByPlaceholderText('Min. 6 characters'));
      await user.type(screen.getByPlaceholderText('Min. 6 characters'), 'password123');
      await user.clear(screen.getByPlaceholderText('Confirm your password'));
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password456');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });

    it('successfully registers and navigates to home', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/register']}>
            <Routes>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<div data-testid="home-page">Home</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );

      await user.type(screen.getByPlaceholderText('Nguyen Van A'), 'Brand New User');
      await user.type(screen.getByPlaceholderText('you@example.com'), 'brandnew@test.com');
      await user.type(screen.getByPlaceholderText('0912345678'), '0999888777');
      await user.type(screen.getByPlaceholderText('Min. 6 characters'), 'brandnewpass');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'brandnewpass');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });
});
