// --- Mini TODO en JavaScript pur ---

const STORAGE_KEY = 'mini_todo_v1';
let todos = []; // {id, title, completed, createdAt}

const newTaskInput = document.getElementById('newTask');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const countEl = document.getElementById('count');
const clearCompletedBtn = document.getElementById('clearCompleted');
const resetAllBtn = document.getElementById('resetAll');
const filterButtons = document.querySelectorAll('.filters button');
let activeFilter = 'all';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    todos = [];
  }
}

function formatCount(n) {
  return n + (n > 1 ? ' tâches' : ' tâche');
}

function render() {
  todoList.innerHTML = '';
  const filtered = todos.filter(t => {
    if (activeFilter === 'active') return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    return true;
  });

  filtered.sort((a, b) => b.createdAt - a.createdAt);

  for (const t of filtered) {
    const item = document.createElement('article');
    item.className = 'todo' + (t.completed ? ' completed' : '');
    item.dataset.id = t.id;

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = t.completed;
    chk.addEventListener('change', () => toggleComplete(t.id));

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = t.title;

    const meta = document.createElement('small');
    meta.textContent = new Date(t.createdAt).toLocaleString();

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.gap = '10px';
    left.style.alignItems = 'center';
    const textWrap = document.createElement('div');
    textWrap.append(title, meta);
    left.append(chk, textWrap);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = '✏';
    editBtn.addEventListener('click', () => startEdit(t.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn danger';
    delBtn.textContent = '🗑';
    delBtn.addEventListener('click', () => removeTodo(t.id));

    actions.append(editBtn, delBtn);
    item.append(left, actions);
    todoList.append(item);
  }

  countEl.textContent = formatCount(todos.filter(t => !t.completed).length);
  save();
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.push({ id: uid(), title: trimmed, completed: false, createdAt: Date.now() });
  render();
}

function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  render();
}

function toggleComplete(id) {
  const t = todos.find(x => x.id === id);
  if (t) t.completed = !t.completed;
  render();
}

function startEdit(id) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  const node = document.querySelector(`.todo[data-id="${id}"] .title`);
  const input = document.createElement('input');
  input.type = 'text';
  input.value = t.title;
  input.style.width = '100%';
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') finishEdit(id, input.value);
    if (e.key === 'Escape') render();
  });
  input.addEventListener('blur', () => finishEdit(id, input.value));
  node.replaceWith(input);
  input.focus();
}

function finishEdit(id, newValue) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  const trimmed = newValue.trim();
  if (!trimmed) return removeTodo(id);
  t.title = trimmed;
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  render();
}

function resetAll() {
  if (confirm('Réinitialiser toutes les tâches ?')) {
    todos = [];
    render();
  }
}

addBtn.addEventListener('click', () => {
  addTodo(newTaskInput.value);
  newTaskInput.value = '';
  newTaskInput.focus();
});

newTaskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTodo(newTaskInput.value);
    newTaskInput.value = '';
  }
});

clearCompletedBtn.addEventListener('click', clearCompleted);
resetAllBtn.addEventListener('click', resetAll);

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

load();
render();
