// LocalStorage-backed persistence (simulates the PostgreSQL contact_messages table & auth session)

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

const MSG_KEY = 'eh_contact_messages';
const AUTH_KEY = 'eh_admin_session';

export function saveMessage(msg: ContactMessage) {
  const list = getMessages();
  list.unshift({ ...msg, isRead: false });
  localStorage.setItem(MSG_KEY, JSON.stringify(list));
}

export function getMessages(): ContactMessage[] {
  try {
    return JSON.parse(localStorage.getItem(MSG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function markRead(index: number) {
  const list = getMessages();
  if (list[index]) {
    list[index].isRead = true;
    localStorage.setItem(MSG_KEY, JSON.stringify(list));
  }
  return list;
}

export function deleteMessage(index: number) {
  const list = getMessages();
  list.splice(index, 1);
  localStorage.setItem(MSG_KEY, JSON.stringify(list));
  return list;
}

// ── Auth (simulated JWT session) ──
export function login(email: string, password: string): boolean {
  // Demo credentials — in production this hits the API with bcrypt-hashed passwords
  if (email === 'admin@emranhossain.com' && password === 'admin123') {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email, role: 'admin', issuedAt: Date.now() }));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY);
}
