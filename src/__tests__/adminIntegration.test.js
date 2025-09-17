import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsers from '../components/AdminUsers';
import { AuthContext } from '../contexts/AuthContext';

test('aprovar usuário atualiza estado via API mock', async () => {
  const mockUsers = [{ id: 1, email: 'cliente@empresa.com', user_type: 'cliente', is_approved: false }];

  // mock GET /users
  global.fetch = jest.fn()
    .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ users: mockUsers }) }))
    // mock PUT /users/1/approve
    .mockImplementationOnce(() => Promise.resolve({ ok: true }));

  render(
    <AuthContext.Provider value={{ user: { email: 'alex@ceosoftware.com.br' }, isAdmin: true }}>
      <AdminUsers />
    </AuthContext.Provider>
  );

  // aguarda até a linha do usuário aparecer
  expect(await screen.findByText('cliente@empresa.com')).toBeInTheDocument();

  const checkbox = screen.getByRole('checkbox');
  expect(checkbox.checked).toBe(false);

  fireEvent.click(checkbox);

  // espera que a chamada PUT tenha sido feita e o checkbox passe a true
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
