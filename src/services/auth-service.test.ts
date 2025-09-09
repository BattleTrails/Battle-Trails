import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn((auth, email, pass) => Promise.resolve({ user: { email } })),
  sendEmailVerification: vi.fn((user) => Promise.resolve(true)),
  signInWithEmailAndPassword: vi.fn((auth, email, pass) => Promise.resolve({ user: { email } })),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({})),
  signInWithPopup: vi.fn(() => Promise.resolve({ user: { providerId: 'google' } })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return () => {}; }),
}));

vi.mock('@config/firebaseConfig.ts', () => ({ auth: {} }));

import {
  registerWithEmail,
  sendVerificationEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  onAuthChange,
  resetPassword
} from './auth-service';

import * as firebaseAuth from 'firebase/auth';

describe('auth-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates registerWithEmail', async () => {
    const res = await registerWithEmail('a@b.com', 'secret');
    expect(res.user.email).toBe('a@b.com');
  });

  it('delegates loginWithEmail', async () => {
    const res = await loginWithEmail('a@b.com', 'secret');
    expect(res.user.email).toBe('a@b.com');
  });

  it('delegates loginWithGoogle', async () => {
    const res = await loginWithGoogle();
    expect(res.user.providerId).toBe('google');
  });

  it('delegates sendVerificationEmail', async () => {
    const result = await sendVerificationEmail({} as any);
    expect(result).toBe(true);
  });

  it('delegates logout', async () => {
    await expect(logout()).resolves.toBeUndefined();
  });

  it('delegates onAuthChange', () => {
    const unsubscribe = onAuthChange(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect((firebaseAuth.onAuthStateChanged as any).mock.calls.length).toBe(1);
  });
});


