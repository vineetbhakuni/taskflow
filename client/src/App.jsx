import { useEffect, useMemo, useState } from 'react';
import {
  Archive, CalendarDays, Check, CheckCircle2, Circle, ClipboardList, Clock3,
  LayoutDashboard, ListFilter, Menu, Pencil, Plus, Search, Trash2, X
} from 'lucide-react';

const emptyForm = { title: '', description: '', priority: 'Medium', dueDate: '' };
const filters = ['all', 'pending', 'completed'];

async function readResponse(response, fallbackMessage) {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!response.ok) throw new Error(data.message || `${fallbackMessage} (${response.status})`);
  return data;
}

function formatDueDate(date) {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useMemo(() => ({
    total: allTasks.length,
    completed: allTasks.filter((task) => task.completed).length,
    pending: allTasks.filter((task) => !task.completed).length
  }), [allTasks]);

  async function loadTasks() {
    try {
      setLoading(true);
      const query = new URLSearchParams({ status: filter, search });
      const [filteredResponse, allResponse] = await Promise.all([
        fetch(`/api/tasks?${query}`),
        fetch('/api/tasks?status=all')
      ]);
      const data = await readResponse(filteredResponse, 'Unable to load tasks');
      const allData = await readResponse(allResponse, 'Unable to load task totals');
      setTasks(data);
      setAllTasks(allData);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadTasks, 250);
    return () => clearTimeout(timer);
  }, [filter, search]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(task) {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
    });
    setEditingId(task._id);
    setModalOpen(true);
  }

  async function saveTask(event) {
    event.preventDefault();
    try {
      const response = await fetch(editingId ? `/api/tasks/${editingId}` : '/api/tasks', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      await readResponse(response, 'Unable to save task');
      setModalOpen(false);
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      await readResponse(response, 'Unable to update task');
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteTask(id) {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      await readResponse(response, 'Unable to delete task');
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Check size={19} strokeWidth={3} /></div><span>Task<span>Flow</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          <button className="nav-item active"><LayoutDashboard size={18} /> Dashboard</button>
          <button className="nav-item" onClick={() => { setFilter('all'); setSidebarOpen(false); }}><ClipboardList size={18} /> All Tasks <b>{stats.total}</b></button>
          <button className="nav-item" onClick={() => { setFilter('completed'); setSidebarOpen(false); }}><CheckCircle2 size={18} /> Completed</button>
          <button className="nav-item" onClick={() => { setFilter('pending'); setSidebarOpen(false); }}><Clock3 size={18} /> Pending</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="product-card"><div className="sparkle">✦</div><strong>Stay productive</strong><p>Keep your momentum going, one task at a time.</p><button onClick={openCreate}>Add a task <Plus size={14} /></button></div>
          <div className="profile"><div className="avatar">TF</div><div><strong>My Workspace</strong><small>Personal account</small></div><span>•••</span></div>
        </div>
      </aside>
      {sidebarOpen && <button className="overlay" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}
      <main className="main-content">
        <header className="topbar"><button className="menu-button" onClick={() => setSidebarOpen(true)}><Menu /></button><div className="topbar-date"><CalendarDays size={16} /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div><div className="topbar-actions"><div className="mini-avatar">TF</div></div></header>
        <section className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>Good morning, <span>let's get things done.</span></h1><p className="subtitle">Here’s what’s happening with your tasks today.</p></div><button className="primary-button" onClick={openCreate}><Plus size={18} /> New task</button></section>
        {error && <div className="error-banner">{error}<button onClick={() => setError('')}><X size={15} /></button></div>}
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-icon purple"><ClipboardList size={21} /></div><div><span>Total tasks</span><strong>{stats.total}</strong><small>Across your workspace</small></div></div>
          <div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={21} /></div><div><span>Completed</span><strong>{stats.completed}</strong><small>{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% of all tasks</small></div></div>
          <div className="stat-card"><div className="stat-icon orange"><Clock3 size={21} /></div><div><span>Pending</span><strong>{stats.pending}</strong><small>Keep the momentum going</small></div></div>
        </section>
        <section className="tasks-section">
          <div className="section-header"><div><h2>Your tasks</h2><p>Stay organized and make progress every day.</p></div><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." /></div></div>
          <div className="toolbar"><div className="filter-tabs">{filters.map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}><ListFilter size={15} /> {item[0].toUpperCase() + item.slice(1)}{item === 'all' && <em>{stats.total}</em>}</button>)}</div><span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span></div>
          {loading ? <div className="empty-state"><div className="spinner" /> Loading tasks...</div> : tasks.length === 0 ? <div className="empty-state"><Archive size={40} /><h3>No tasks found</h3><p>Create a task or change your filters to see it here.</p><button className="primary-button" onClick={openCreate}><Plus size={16} /> Add your first task</button></div> : <div className="task-list">{tasks.map((task) => <article className={`task-card ${task.completed ? 'is-completed' : ''}`} key={task._id}><button className="check-button" onClick={() => toggleTask(task)} aria-label={task.completed ? 'Mark pending' : 'Mark completed'}>{task.completed ? <CheckCircle2 size={23} /> : <Circle size={23} />}</button><div className="task-info"><div className="task-title-row"><h3>{task.title}</h3><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div>{task.description && <p>{task.description}</p>}<div className="task-meta"><span><CalendarDays size={14} /> {formatDueDate(task.dueDate)}</span><span className={task.completed ? 'done-label' : ''}>{task.completed ? 'Completed' : 'Pending'}</span></div></div><div className="task-actions"><button onClick={() => openEdit(task)} aria-label="Edit task"><Pencil size={16} /></button><button onClick={() => deleteTask(task._id)} aria-label="Delete task"><Trash2 size={16} /></button></div></article>)}</div>}
        </section>
      </main>
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><form className="task-modal" onSubmit={saveTask}><div className="modal-header"><div><p className="eyebrow">{editingId ? 'UPDATE TASK' : 'NEW TASK'}</p><h2>{editingId ? 'Edit task' : 'Create a task'}</h2></div><button type="button" className="close-button" onClick={() => setModalOpen(false)}><X /></button></div><label>Task title<input required maxLength="120" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs to be done?" /></label><label>Description <span>(optional)</span><textarea maxLength="500" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add a little more detail..." /></label><div className="form-row"><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></label><label>Due date<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Create task'}</button></div></form></div>}
    </div>
  );
}

export default App;
