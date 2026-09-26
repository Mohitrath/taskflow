const API = process.env.NEXT_PUBLIC_API_URL || '/api';
const STORE = 'taskflow_local_store';

function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function localStore() {
  if (typeof window === 'undefined') return { users: [], projects: [], tasks: [], session: null };
  try {
    return JSON.parse(localStorage.getItem(STORE)) || { users: [], projects: [], tasks: [], session: null };
  } catch {
    return { users: [], projects: [], tasks: [], session: null };
  }
}

function saveStore(s) {
  if (typeof window !== 'undefined') localStorage.setItem(STORE, JSON.stringify(s));
  return s;
}

function localRequest(path, options = {}) {
  const s = localStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('taskflow_token') : null;
  const body = options.body || {};
  const current = s.users.find(u => u._id === s.session && (!token || token === u.token));

  if (path === '/auth/register') {
    if (s.users.some(u => u.email.toLowerCase() === body.email.toLowerCase())) throw new Error('Email already registered');
    const user = { _id: uid('usr'), name: body.name, email: body.email, token: uid('token') };
    s.users.push(user); s.session = user._id; saveStore(s);
    return { success: true, data: { user, token: user.token } };
  }

  if (path === '/auth/login') {
    const user = s.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (!user) throw new Error('Invalid email or password');
    user.token = uid('token'); s.session = user._id; saveStore(s);
    return { success: true, data: { user, token: user.token } };
  }

  if (path === '/auth/me') {
    if (!current) throw new Error('Not authenticated');
    return { success: true, data: { user: current } };
  }

  if (!current) throw new Error('Please sign in again');

  if (path === '/projects' && options.method === 'GET') {
    const data = s.projects.filter(p => p.user === current._id).map(p => ({
      ...p,
      stats: { total: s.tasks.filter(t => t.project === p._id).length, done: s.tasks.filter(t => t.project === p._id && t.status === 'done').length }
    }));
    return { success: true, data };
  }

  if (path === '/projects' && options.method === 'POST') {
    const project = { _id: uid('prj'), user: current._id, name: body.name, description: body.description || '', color: body.color || '#6366f1', status: 'active' };
    s.projects.push(project); saveStore(s); return { success: true, data: project };
  }

  const projectMatch = path.match(/^\\/projects\\/([^/]+)$/);
  if (projectMatch && options.method === 'GET') {
    const p = s.projects.find(x => x._id === projectMatch[1] && x.user === current._id);
    if (!p) throw new Error('Project not found');
    return { success: true, data: p };
  }

  if (path.startsWith('/tasks?project=')) {
    const project = path.split('=')[1];
    return { success: true, data: s.tasks.filter(t => t.project === project) };
  }

  if (path === '/tasks' && options.method === 'POST') {
    const task = { _id: uid('tsk'), project: body.project, title: body.title, description: body.description || '', status: 'todo', priority: body.priority || 'medium' };
    s.tasks.push(task); saveStore(s); return { success: true, data: task };
  }

  const taskMatch = path.match(/^\\/tasks\\/([^/]+)$/);
  if (taskMatch) {
    const task = s.tasks.find(t => t._id === taskMatch[1]);
    if (!task) throw new Error('Task not found');
    if (options.method === 'PUT') { Object.assign(task, body); saveStore(s); return { success: true, data: task }; }
    if (options.method === 'DELETE') { s.tasks = s.tasks.filter(t => t._id !== task._id); saveStore(s); return { success: true }; }
  }

  const genMatch = path.match(/^\\/ai\\/projects\\/([^/]+)\\/generate-tasks$/);
  if (genMatch && options.method === 'POST') {
    const ideas = ['Define project scope', 'Create initial implementation', 'Add validation and error handling', 'Test the main workflow', 'Prepare documentation'];
    const tasks = ideas.slice(0, Math.max(1, Math.min(body.count || 5, 5))).map(title => ({
      _id: uid('tsk'), project: genMatch[1], title, description: body.goal || '', status: 'todo', priority: 'medium'
    }));
    s.tasks.push(...tasks); saveStore(s); return { success: true, data: { tasks } };
  }

  if (path === '/stats/dashboard') {
    const projects = s.projects.filter(p => p.user === current._id);
    const tasks = s.tasks.filter(t => projects.some(p => p._id === t.project));
    const done = tasks.filter(t => t.status === 'done').length;
    return { success: true, data: {
      projectCount: projects.length, totalTasks: tasks.length,
      tasksByStatus: { todo: tasks.filter(t => t.status === 'todo').length, 'in-progress': tasks.filter(t => t.status === 'in-progress').length, done },
      completionRate: tasks.length ? Math.round(done / tasks.length * 100) : 0,
      recentActivity: tasks.slice(-5).reverse()
    }};
  }

  throw new Error('Local fallback does not support this request');
}

async function req(path, o = {}) {
  const h = { 'Content-Type': 'application/json', ...(o.headers || {}) };
  const t = typeof window !== 'undefined' && localStorage.getItem('taskflow_token');
  if (t) h.Authorization = 'Bearer ' + t;

  try {
    const r = await fetch(API + path, {
      ...o, headers: h, body: o.body ? JSON.stringify(o.body) : undefined
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (r.status >= 500) return localRequest(path, o);
      throw new Error(d.message || 'Request failed');
    }
    return d;
  } catch (error) {
    if (error instanceof TypeError || /API is unavailable|Failed to fetch/i.test(error.message)) {
      return localRequest(path, o);
    }
    throw error;
  }
}

export const api = {
  register: p => req('/auth/register', { method: 'POST', body: p }),
  login: p => req('/auth/login', { method: 'POST', body: p }),
  me: () => req('/auth/me'),
  getProjects: () => req('/projects'),
  createProject: p => req('/projects', { method: 'POST', body: p }),
  getProject: id => req('/projects/' + id),
  getTasks: id => req('/tasks?project=' + id),
  createTask: p => req('/tasks', { method: 'POST', body: p }),
  updateTask: (id, p) => req('/tasks/' + id, { method: 'PUT', body: p }),
  deleteTask: id => req('/tasks/' + id, { method: 'DELETE' }),
  deleteProject: id => req('/projects/' + id, { method: 'DELETE' }),
  generateTasks: (id, p) => req('/ai/projects/' + id + '/generate-tasks', { method: 'POST', body: p }),
  getDashboardStats: () => req('/stats/dashboard')
};
