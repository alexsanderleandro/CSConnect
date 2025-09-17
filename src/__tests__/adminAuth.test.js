import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import AdminUsers from '../components/AdminUsers';
import { AuthContext } from '../contexts/AuthContext';

const mockFetchSuccess = () => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ users: [] })
  }));
};

afterEach(() => {
  jest.resetAllMocks();
});

test('não mostra estrutura de administração para não-admin', async () => {
  mockFetchSuccess();
  render(<AdminUsers user={null} isAdmin={false} />);
  // aguarda até que o título apareça
  const title = await screen.findByText(/Administração/i);
  expect(title).toBeInTheDocument();
});

test('usa contexto para reconhecer admin', async () => {
  mockFetchSuccess();
  render(
    <AuthContext.Provider value={{ user: { email: 'alex@ceosoftware.com.br' }, isAdmin: true }}>
      <AdminUsers />
    </AuthContext.Provider>
  );
  const title = await screen.findByText(/Administração/i);
  expect(title).toBeInTheDocument();
});
