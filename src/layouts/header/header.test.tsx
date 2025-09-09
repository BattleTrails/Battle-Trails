import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mocks de componentes hijos para aislar el Header
vi.mock('@layouts/header/header-logo/header-logo.tsx', () => ({
  default: (props: { currentPath: string; searchOpen: boolean; onClick: () => void }) => (
    <div data-testid="header-logo" data-path={props.currentPath} data-open={props.searchOpen}>
      LOGO
    </div>
  ),
}));

vi.mock('@layouts/header/header-search-bar-wrapper/header-search-bar-wrapper.tsx', () => ({
  default: (props: { currentPath: string; setSearchOpen: (open: boolean) => void }) => (
    <div data-testid="header-search" data-path={props.currentPath}>
      SEARCH
    </div>
  ),
}));

vi.mock('@layouts/header/header-user-actions/header-user-actions.tsx', () => ({
  default: (props: { currentPath: string; searchOpen: boolean; isScrolled: boolean }) => (
    <div data-testid="header-actions" data-path={props.currentPath} data-open={props.searchOpen} data-scroll={props.isScrolled}>
      ACTIONS
    </div>
  ),
}));

vi.mock('@components/ui/filter-bar/filter-bar.tsx', () => ({
  default: () => <div data-testid="filter-bar">FILTER</div>,
}));

import Header from './header';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza logo, buscador y acciones en ruta raíz y muestra FilterBar', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByTestId('header-logo')).toBeInTheDocument();
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
    expect(screen.getByTestId('header-actions')).toBeInTheDocument();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
  });

  it('oculta FilterBar en rutas de detalles', () => {
    render(
      <MemoryRouter initialEntries={["/post/123"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByTestId('header-logo')).toBeInTheDocument();
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
    expect(screen.getByTestId('header-actions')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-bar')).toBeNull();
  });
});


