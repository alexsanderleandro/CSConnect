import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalystDashboard from '../pages/AnalystDashboard';

// Mock ContactList and ChatWindow to control behavior
jest.mock('../components/ContactList', () => {
  return function DummyContactList({ onSelect }){
    return (
      <div>
        <button onClick={() => onSelect({ id: 'c1', name: 'Contato 1' })}>select-1</button>
        <button onClick={() => onSelect({ id: 'c2', name: 'Contato 2' })}>select-2</button>
      </div>
    );
  };
});

jest.mock('../components/ChatWindow', () => {
  return function DummyChatWindow({ contact, me }){
    return <div data-testid="chat-window">Chat with {contact ? contact.name : '—'}</div>;
  };
});

describe('AnalystDashboard', () => {
  it('renderiza e troca seleção de contato', () => {
    const me = { id: 'me1', email: 'a@b.com' };
    render(<AnalystDashboard me={me} />);
  // inicialmente mostra texto de instrução
  expect(screen.getByText(/Selecione um contato/i)).toBeTruthy();

    // selecionar contato 1
  fireEvent.click(screen.getByText('select-1'));
  expect(screen.getByTestId('chat-window').textContent).toContain('Contato 1');

    // selecionar contato 2
  fireEvent.click(screen.getByText('select-2'));
  expect(screen.getByTestId('chat-window').textContent).toContain('Contato 2');
  });
});
