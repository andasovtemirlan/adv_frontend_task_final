import { describe, expect, it, beforeEach } from 'vitest';
import authReducer, {
  logout,
  clearError,
  initializeAuth,
  loginUser,
} from '@/features/auth/authSlice';
import { STORAGE_KEYS } from '@/shared/utils/constants';

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logout clears auth state and storage', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'token');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 1, name: 'User' }));

    const loggedInState = {
      user: { id: 1, name: 'User' } as any,
      token: 'token',
      isAuthenticated: true,
      loading: false,
      error: null as string | null,
    };

    const state = authReducer(loggedInState as any, logout());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });

  it('initializeAuth.fulfilled hydrates state', () => {
    const initialState = authReducer(undefined, { type: '@@INIT' });
    const payload = {
      user: { id: 2, name: 'Jane Doe' } as any,
      token: 'abc123',
    };

    const state = authReducer(
      initialState,
      initializeAuth.fulfilled(payload, 'request-id', undefined)
    );

    expect(state.user).toEqual(payload.user);
    expect(state.token).toBe(payload.token);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('loginUser.pending sets loading', () => {
    const initialState = authReducer(undefined, { type: '@@INIT' });
    const state = authReducer(
      initialState,
      loginUser.pending('request-id', { email: 'a@example.com', password: 'x' })
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loginUser.rejected stores error and resets auth flags', () => {
    const initialState = authReducer(undefined, { type: '@@INIT' });
    const state = authReducer(
      initialState,
      loginUser.rejected(new Error('Invalid'), 'request-id', { email: 'a', password: 'b' }, 'Invalid credentials')
    );
    expect(state.error).toBe('Invalid credentials');
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
  });

  it('clearError removes error message', () => {
    const erroredState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: 'Something went wrong',
    };
    const state = authReducer(erroredState as any, clearError());
    expect(state.error).toBeNull();
  });
});
