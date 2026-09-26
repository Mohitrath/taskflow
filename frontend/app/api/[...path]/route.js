import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

const User = mongoose.models.TaskFlowUser || mongoose.model('TaskFlowUser', userSchema);
const Project = mongoose.models.TaskFlowProject || mongoose.model('TaskFlowProject', projectSchema);
const Task = mongoose.models.TaskFlowTask || mongoose.model('TaskFlowTask', taskSchema);

let connectionPromise;
async function db() {
  if (!MONGO) throw new Error('MONGODB_URI is not configured');
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) connectionPromise = mongoose.connect(MONGO, { bufferCommands: true });
  await connectionPromise;
}

function tokenFor(user) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ sub: String(user._id) }, JWT_SECRET, { expiresIn: '7d' });
}

function auth(request) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  const raw = request.headers.get('authorization') || '';
  if (!raw.startsWith('Bearer ')) throw new Error('Authentication required');
  return jwt.verify(raw.slice(7), JWT_SECRET);
}

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

async function handler(request, { params }) {
  try {
    await db();
    const path = '/' + (params.path || []).join('/');
    const method = request.method;
    const body = ['GET', 'HEAD'].includes(method) ? {} : await request.json().catch(() => ({}));

    if (path === '/health' && method === 'GET') {
      return json({ success: true, message: 'TaskFlow API is running' });
    }

    if (path === '/auth/register' && method === 'POST') {
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (name.length < 2) return json({ message: 'Name is required' }, 400);
      if (!email.includes('@')) return json({ message: 'Valid email is required' }, 400);
      if (password.length < 6) return json({ message: 'Password must be at least 6 characters' }, 400);
      if (await User.exists({ email })) return json({ message: 'Email already registered' }, 409);
      const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
      return json({ success: true, data: { user: { _id: user._id, name: user.name, email: user.email }, token: tokenFor(user) } }, 201);
    }

    if (path === '/auth/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(String(body.password || ''), user.password))) {
        return json({ message: 'Invalid email or password' }, 401);
      }
      return json({ success: true, data: { user: { _id: user._id, name: user.name, email: user.email }, token: tokenFor(user) } });
    }

    const decoded = auth(request);
    const userId = decoded.sub;

    if (path === '/auth/me' && method === 'GET') {
      const user = await User.findById(userId).select('_id name email');
      if (!user) return json({ message: 'User not found' }, 404);
      return json({ success: true, data: { user } });
    }

    if (path === '/projects' && method === 'GET') {
      const projects = await Project.find({ user: userId }).sort({ createdAt: -1 }).lean();
      const ids = projects.map(p => p._id);
      const counts = await Task.aggregate([
        { $match: { project: { $in: ids } } },
        { $group: { _id: '$project', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } }
      ]);
      const map = Object.fromEntries(counts.map(x => [String(x._id), x]));
      return json({ success: true, data: projects.map(p => ({ ...p, stats: map[String(p._id)] || { total: 0, done: 0 } })) });
    }

    if (path === '/projects' && method === 'POST') {
      const project = await Project.create({ user: userId, name: body.name, description: body.description || '', color: body.color || '#6366f1' });
      return json({ success: true, data: project }, 201);
    }

    const projectMatch = path.match(/^\/projects\/([^/]+)$/);
    if (projectMatch) {
      const project = await Project.findOne({ _id: projectMatch[1], user: userId });
      if (!project) return json({ message: 'Project not found' }, 404);
      if (method === 'GET') return json({ success: true, data: project });
      if (method === 'DELETE') {
        await Task.deleteMany({ project: project._id });
        await project.deleteOne();
        return json({ success: true });
      }
    }

    if (path === '/tasks' && method === 'GET') {
      const project = new URL(request.url).searchParams.get('project');
      const owned = await Project.exists({ _id: project, user: userId });
      if (!owned) return json({ message: 'Project not found' }, 404);
      return json({ success: true, data: await Task.find({ project }).sort({ createdAt: -1 }) });
    }

    if (path === '/tasks' && method === 'POST') {
      const owned = await Project.exists({ _id: body.project, user: userId });
      if (!owned) return json({ message: 'Project not found' }, 404);
      const task = await Task.create({ project: body.project, title: body.title, description: body.description || '', priority: body.priority || 'medium' });
      return json({ success: true, data: task }, 201);
    }

    const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
    if (taskMatch) {
      const task = await Task.findById(taskMatch[1]);
      if (!task) return json({ message: 'Task not found' }, 404);
      const owned = await Project.exists({ _id: task.project, user: userId });
      if (!owned) return json({ message: 'Forbidden' }, 403);
      if (method === 'PUT') {
        Object.assign(task, { title: body.title ?? task.title, description: body.description ?? task.description, status: body.status ?? task.status, priority: body.priority ?? task.priority });
        await task.save();
        return json({ success: true, data: task });
      }
      if (method === 'DELETE') {
        await task.deleteOne();
        return json({ success: true });
      }
    }

    const genMatch = path.match(/^\/ai\/projects\/([^/]+)\/generate-tasks$/);
    if (genMatch && method === 'POST') {
      const owned = await Project.exists({ _id: genMatch[1], user: userId });
      if (!owned) return json({ message: 'Project not found' }, 404);
      const count = Math.min(Math.max(Number(body.count) || 5, 1), 10);
      let titles = [];
      if (process.env.OPENAI_API_KEY) {
        const prompt = `Generate exactly ${count} concise actionable software/project tasks for this goal. Return ONLY a JSON array of strings. Goal: ${body.goal || 'Complete this project'}`;
        const ai = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.4 })
        });
        if (ai.ok) {
          const result = await ai.json();
          try { titles = JSON.parse(result.choices?.[0]?.message?.content || '[]'); } catch {}
        }
      }
      if (!Array.isArray(titles) || !titles.length) {
        titles = ['Define project scope', 'Design the solution', 'Implement core functionality', 'Add validation and error handling', 'Test the main workflow', 'Polish the user experience', 'Prepare documentation', 'Deploy the application'].slice(0, count);
      }
      const tasks = await Task.insertMany(titles.slice(0, count).map(title => ({ project: genMatch[1], title: String(title), description: body.goal || '', status: 'todo', priority: 'medium' })));
      return json({ success: true, data: { tasks } });
    }

    if (path === '/stats/dashboard' && method === 'GET') {
      const projects = await Project.find({ user: userId }).select('_id');
      const ids = projects.map(p => p._id);
      const tasks = await Task.find({ project: { $in: ids } }).sort({ createdAt: -1 }).limit(20).lean();
      const done = tasks.filter(t => t.status === 'done').length;
      return json({ success: true, data: {
        projectCount: projects.length,
        totalTasks: tasks.length,
        tasksByStatus: {
          todo: tasks.filter(t => t.status === 'todo').length,
          'in-progress': tasks.filter(t => t.status === 'in-progress').length,
          done
        },
        completionRate: tasks.length ? Math.round(done / tasks.length * 100) : 0,
        recentActivity: tasks.slice(0, 5)
      }});
    }

    return json({ message: 'Route not found' }, 404);
  } catch (error) {
    console.error('TaskFlow API error:', error);
    const status = /Authentication|required|Invalid/.test(error.message) ? 401 : 500;
    return json({ success: false, message: error.message || 'Internal server error' }, status);
  }
}

export async function GET(request, context) { return handler(request, context); }
export async function POST(request, context) { return handler(request, context); }
export async function PUT(request, context) { return handler(request, context); }
export async function PATCH(request, context) { return handler(request, context); }
export async function DELETE(request, context) { return handler(request, context); }
