const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export async function getAnalysts(){
  const res = await fetch(`${API_BASE}/contacts/analysts`);
  return res.json();
}

export async function getClients(){
  const res = await fetch(`${API_BASE}/contacts/clients`);
  return res.json();
}

export async function postMessage(payload){
  const res = await fetch(`${API_BASE}/messages/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)});
  return res.json();
}

export async function getMessages(contactId){
  const res = await fetch(`${API_BASE}/messages/${contactId}`);
  return res.json();
}

export async function getSectors(){
  const res = await fetch(`${API_BASE}/sectors`);
  return res.json();
}

export async function createAttendance(payload){
  const res = await fetch(`${API_BASE}/attendance/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)});
  return res.json();
}
