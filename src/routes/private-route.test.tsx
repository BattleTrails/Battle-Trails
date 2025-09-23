import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const hoisted = vi.hoisted(() => ({
  authState: { user: { id: '1' }, loading: false } as { user: unknown | null; loading: boolean }
}));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => hoisted.authState
}));

describe('PrivateRoute', () => {
  it('renderiza children cuando hay usuario', async () => {
    hoisted.authState = { user: { id: '1' }, loading: false };
    const { default: PrivateRoute } = await import('./private-route');
    render(
      <MemoryRouter initialEntries={["/privado"]}>
        <Routes>
          <Route path="/auth" element={<div>LOGIN</div>} />
          <Route path="/privado" element={<PrivateRoute><div>OK</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('redirige a /auth cuando no hay usuario', async () => {
    hoisted.authState = { user: null, loading: false };
    const { default: PrivateRoute } = await import('./private-route');
    render(
      <MemoryRouter initialEntries={["/privado"]}>
        <Routes>
          <Route path="/auth" element={<div>LOGIN</div>} />
          <Route path="/privado" element={<PrivateRoute><div>OK</div></PrivateRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
  });
});


