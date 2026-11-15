 "use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, CalendarDays, Check, CheckCircle2, ChevronDown, Circle, Clock3, ListTodo, Plus, Search, SlidersHorizontal, Target, Trash2, X } from "lucide-react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Update = { id: string; message: string; at: string };
type Task = {
  id: string; title: string; description: string; startDate: string; dueDate: string;
  priority: Priority; status: Status; progress: number; createdAt: string; updates: Update[];
};

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);
const dateLabel = (value: string) => value ? new Date(value + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No date";
const seed: Task[] = [
  { id: "welcome01", title: "Explore your new task manager", description: "Edit this task, update its progress, or create your own tasks.", startDate: today(), dueDate: "", priority: "Medium", status: "In progress", progress: 35, createdAt: new Date().toISOString(), updates: [{ id: uid(), message: "TaskFlow is ready. Start planning your work!", at: new Date().toISOString() }] },
  { id: "welcome02", title: "Plan your first milestone", description: "Add a start date and a due date to create a clear timeline.", startDate: today(), dueDate: "", priority: "Low", status: "Not started", progress: 0, createdAt: new Date().toISOString(), updates: [] },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startDate: today(), dueDate: "", priority: "Medium" as Priority, status: "Not started" as Status, progress: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("taskflow-tasks");
      setTasks(saved ? JSON.parse(saved) : seed);
    } catch { setTasks(seed); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("taskflow-tasks", JSON.stringify(tasks)); }, [tasks, ready]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === "Completed").length,
    active: tasks.filter(t => t.status === "In progress").length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < today() && t.status !== "Completed").length,
  }), [tasks]);
  const filtered = useMemo(() => tasks.filter(t => {
    const matches = (t.title + " " + t.description).toLowerCase().includes(query.toLowerCase());
    return matches && (filter === "All" || t.status === filter);
  }).sort((a,b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, query, filter]);
  const overall = tasks.length ? Math.round(tasks.reduce((sum,t) => sum + t.progress, 0) / tasks.length) : 0;

  function openNew() {
    setEditing(null); setForm({ title: "", description: "", startDate: today(), dueDate: "", priority: "Medium", status: "Not started", progress: 0 }); setModal(true);
  }
  function openEdit(task: Task) {
    setEditing(task); setForm({ title: task.title, description: task.description, startDate: task.startDate, dueDate: task.dueDate, priority: task.priority, status: task.status, progress: task.progress }); setModal(true);
  }
  function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    if (editing) {
      const changes: string[] = [];
      if (editing.status !== form.status) changes.push(`Status changed to ${form.status}`);
      if (editing.progress !== Number(form.progress)) changes.push(`Progress updated to ${form.progress}%`);
      if (editing.dueDate !== form.dueDate) changes.push(`Due date changed to ${form.dueDate || "not set"}`);
      if (editing.title !== form.title.trim()) changes.push("Task title updated");
      const updates = [...editing.updates, ...changes.map(message => ({ id: uid(), message, at: now }))];
      setTasks(prev => prev.map(t => t.id === editing.id ? { ...t, ...form, title: form.title.trim(), progress: Number(form.progress), updates } : t));
    } else {
      const newTask: Task = { ...form, title: form.title.trim(), id: uid(), progress: Number(form.progress), createdAt: now, updates: [{ id: uid(), message: "Task created", at: now }] };
      setTasks(prev => [newTask, ...prev]);
    }
    setModal(false);
  }
  function quickProgress(task: Task, progress: number) {
    const status: Status = progress === 100 ? "Completed" : progress > 0 ? "In progress" : "Not started";
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress, status, updates: [...t.updates, { id: uid(), message: `Progress updated to ${progress}%`, at: now }] } : t));
  }
  function removeTask(task: Task) {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) setTasks(prev => prev.filter(t => t.id !== task.id));
  }
  const dueState = (task: Task) => {
    if (!task.dueDate || task.status === "Completed") return null;
    const diff = Math.ceil((new Date(task.dueDate + "T23:59:59").getTime() - Date.now()) / 86400000);
    if (diff < 0) return "Overdue";
    if (diff <= 3) return diff === 0 ? "Due today" : `Due in ${diff}d`;
    return null;
  };

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Check size={20}/></div><span>taskflow</span></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav active"><ListTodo size={18}/> My tasks <span className="nav-count">{tasks.length}</span></button>
      <div className="side-note"><div className="side-note-icon"><Target size={17}/></div><b>Make progress visible.</b><p>Small steps add up. Keep your priorities clear and your momentum going.</p></div>
      <div className="sidebar-bottom"><span className="online-dot"/> Your workspace is saved locally</div>
    </aside>
    <section className="main">
      <header className="topbar"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>My tasks</h1><p className="subhead">A little progress each day adds up to big results.</p></div><button className="primary" onClick={openNew}><Plus size={18}/> New task</button></header>
      <div className="stats">
        <div className="stat-card"><div className="stat-top"><span>Total tasks</span><ListTodo size={18}/></div><strong>{stats.total}</strong><small>Across your workspace</small></div>
        <div className="stat-card"><div className="stat-top"><span>In progress</span><Activity size={18}/></div><strong>{stats.active}</strong><small>Work currently moving</small></div>
        <div className="stat-card"><div className="stat-top"><span>Completed</span><CheckCircle2 size={18}/></div><strong>{stats.completed}</strong><small>Tasks finished</small></div>
        <div className="stat-card"><div className="stat-top"><span>Overdue</span><AlertCircle size={18}/></div><strong className={stats.overdue ? "danger-text" : ""}>{stats.overdue}</strong><small>Need your attention</small></div>
      </div>
      <div className="overview">
        <div className="overview-copy"><div className="overview-icon"><Target size={19}/></div><div><b>Overall progress</b><p>Average completion across all tasks</p></div></div>
        <div className="overview-progress"><div className="progress-line"><span style={{width: `${overall}%`}}/></div><strong>{overall}%</strong></div>
      </div>
      <div className="section-heading"><div><h2>Task list</h2><p>Manage your work and keep an eye on what's next.</p></div><span className="task-total">{filtered.length} {filtered.length === 1 ? "task" : "tasks"}</span></div>
      <div className="toolbar"><div className="search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks..."/></div><div className="filter-wrap"><SlidersHorizontal size={16}/><select value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>Not started</option><option>In progress</option><option>Completed</option></select><ChevronDown size={14}/></div></div>
      <div className="task-list">
        {!ready ? <div className="empty">Loading your workspace…</div> : filtered.length === 0 ? <div className="empty"><div className="empty-icon"><ListTodo size={22}/></div><b>No tasks found</b><p>Try another search or create a new task.</p><button className="text-button" onClick={openNew}>+ Create a task</button></div> :
          filtered.map(task => {
            const due = dueState(task);
            return <article className="task-card" key={task.id}>
              <div className="task-main">
                <button className={`task-check ${task.status === "Completed" ? "checked" : ""}`} aria-label="Mark complete" onClick={() => quickProgress(task, task.status === "Completed" ? 0 : 100)}>{task.status === "Completed" ? <Check size={15}/> : <Circle size={17}/>}</button>
                <div className="task-content"><div className="task-title-row"><button className={`task-title ${task.status === "Completed" ? "done" : ""}`} onClick={() => openEdit(task)}>{task.title}</button><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta"><span><CalendarDays size={14}/> {task.startDate ? dateLabel(task.startDate) : "No start"} <span className="date-arrow">→</span> {dateLabel(task.dueDate)}</span><span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}><i/> {task.status}</span>{due && <span className={`due ${due === "Overdue" ? "late" : ""}`}><Clock3 size={13}/>{due}</span>}</div>
                  <div className="task-progress"><div className="mini-track"><span style={{width: `${task.progress}%`}}/></div><span>{task.progress}%</span></div>
                </div>
                <div className="task-actions"><button title="Edit task" onClick={() => openEdit(task)}>Edit</button><button className="delete" title="Delete task" onClick={() => removeTask(task)}><Trash2 size={16}/></button></div>
              </div>
              {task.updates.length > 0 && <details className="updates"><summary><Activity size={14}/> Activity <span>{task.updates.length}</span></summary><div className="update-list">{[...task.updates].reverse().slice(0,4).map(u => <div className="update-row" key={u.id}><i/><span>{u.message}</span><time>{new Date(u.at).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</time></div>)}</div></details>}
            </article>;
          })}
      </div>
      <footer>Built for focused work <span>·</span> Keep moving forward.</footer>
    </section>
    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><form className="modal" onSubmit={saveTask}>
      <div className="modal-head"><div><div className="eyebrow">{editing ? "UPDATE YOUR WORK" : "MAKE IT HAPPEN"}</div><h2>{editing ? "Edit task" : "Create a task"}</h2></div><button type="button" className="close" onClick={() => setModal(false)}><X size={20}/></button></div>
      <label>Task name <em>*</em><input autoFocus required maxLength={100} placeholder="e.g. Prepare project proposal" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/></label>
      <label>Description <textarea rows={3} placeholder="Add a few details about this task..." value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></label>
      <div className="form-grid"><label>Start date <input type="date" value={form.startDate} onChange={e => setForm({...form,startDate:e.target.value})}/></label><label>Due date <input type="date" min={form.startDate || undefined} value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})}/></label></div>
      <div className="form-grid"><label>Priority <select value={form.priority} onChange={e => setForm({...form,priority:e.target.value as Priority})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Status <select value={form.status} onChange={e => setForm({...form,status:e.target.value as Status})}><option>Not started</option><option>In progress</option><option>Completed</option></select></label></div>
      <label className="progress-label">Progress <b>{form.progress}%</b><input type="range" min="0" max="100" step="5" value={form.progress} onChange={e => setForm({...form,progress:Number(e.target.value)})}/></label>
      <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="primary">{editing ? "Save changes" : "Create task"}</button></div>
    </form></div>}
  </main>;
}
