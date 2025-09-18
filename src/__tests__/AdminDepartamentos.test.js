import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDepartamentos from '../components/AdminDepartamentos';
import { AuthContext } from '../contexts/AuthContext';

describe('AdminDepartamentos defensive rendering', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders table even if API returns undefined/null entries', async () => {
    // Response contains some valid and some invalid entries
    const mocked = [
      { id: 1, nome: 'Dept A', ativo: true },
      null,
      undefined,
      { id: 2, nome: 'Dept B', ativo: false }
    ];

    global.fetch.mockResolvedValueOnce({ json: async () => mocked });

    render(
      <AuthContext.Provider value={{ token: 'fake-token' }}>
        <AdminDepartamentos />
      </AuthContext.Provider>
    );

    // Should eventually render the header and at least one known department name
    const header = await screen.findByText('Administração de Departamentos');
    expect(header).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Dept A')).toBeTruthy());
    expect(screen.getByText('Dept B')).toBeTruthy();
  });
});
