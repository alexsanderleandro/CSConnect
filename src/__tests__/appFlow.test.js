import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

test('fluxo completo: login admin e aprovar usuário', async () => {
  // mock sequence:
  // 1) initial /users for AdminUsers when opened -> return one user
  // 2) /online for UsersList -> empty
  // 3) POST /login for admin login
  // 4) GET /users?status=todos when AdminUsers mounts again -> users list
  // 5) PUT /users/1/approve

  const mockUsers = [{ id: 1, email: 'cliente@empresa.com', user_type: 'cliente', is_approved: false }];

  const fetchMock = jest.fn((input, init) => {
    const raw = typeof input === 'string' ? input : input.url;
    // base the URL parsing on a base origin so relative paths also work
    const url = new URL(raw, 'http://localhost');
    const pathname = url.pathname;
    const search = url.searchParams;

    // initial AdminUsers /users (no status param) -> empty
    if (pathname === '/users' && !search.has('status')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ users: [] }) });
    }

    // UsersList /online
    if (pathname === '/online') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ online: [] }) });
    }

    // /api/check-type-user
    if (pathname === '/api/check-type-user') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ user_type: 'analista_admin' }) });
    }

    // POST /login
    if (pathname === '/login' && (!init || init.method === 'POST')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'abc' }) });
    }

    // AdminUsers GET /users?status=todos
    if (pathname === '/users' && search.get('status') === 'todos') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ users: mockUsers }) });
    }

    // departamentos
    if (pathname === '/departamentos') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ departamentos: [] }) });
    }

    // PUT approve (e.g. /users/1/approve)
    if (/^\/users\/\d+\/approve$/.test(pathname) && init && init.method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }

    // fallback: return empty object
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });

  global.fetch = fetchMock;

  const { container } = render(<App />);

  // click engrenagem para abrir modal admin
  const gearButton = await screen.findByTitle('Área administrativa');
  fireEvent.click(gearButton);

  // preencher modal admin (usuário=alex, senha=123) - seleciona por id para evitar ambiguidade
  const adminNameInput = await waitFor(() => container.querySelector('#adminName'));
  const adminPassInput = await waitFor(() => container.querySelector('#adminPassword'));
  fireEvent.change(adminNameInput, { target: { value: 'alex' } });
  fireEvent.change(adminPassInput, { target: { value: '123' } });

  // submeter login: encontrar o formulário do modal (a partir do input adminName) e clicar no botão submit dentro dele
  const adminForm = adminNameInput.closest('form');
  const loginButton = adminForm.querySelector('button[type="submit"]');
  fireEvent.click(loginButton);

  // agora admin panel deve aparecer; aguarda usuário na tabela
  expect(await screen.findByText('cliente@empresa.com')).toBeInTheDocument();

  // clicar checkbox de aprovação
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);

  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
});
