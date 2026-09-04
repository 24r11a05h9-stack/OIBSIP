const STORAGE_KEY = "daymark-tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const pendingList = document.querySelector("#pending-list");
const completedList = document.querySelector("#completed-list");
const pendingEmpty = document.querySelector("#pending-empty");
const completedEmpty = document.querySelector("#completed-empty");
const pendingCount = document.querySelector("#pending-count");
const completedCount = document.querySelector("#completed-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const todayLabel = document.querySelector("#today-label");

let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateString));
}

function createTask(text) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
}

function renderTasks() {
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  pendingList.innerHTML = pendingTasks.map((task) => taskTemplate(task)).join("");
  completedList.innerHTML = completedTasks.map((task) => taskTemplate(task)).join("");

  pendingCount.textContent = `${pendingTasks.length} pending`;
  completedCount.textContent = `${completedTasks.length} completed`;
  pendingEmpty.hidden = pendingTasks.length > 0;
  completedEmpty.hidden = completedTasks.length > 0;
  clearCompletedButton.disabled = completedTasks.length === 0;
}

function taskTemplate(task) {
  const completedClass = task.completed ? " completed" : "";
  const dateLabel = task.completed && task.completedAt
    ? `Completed ${formatDate(task.completedAt)}`
    : `Added ${formatDate(task.createdAt)}`;

  return `
    <li class="task-item${completedClass}" data-task-id="${task.id}">
      <button class="toggle-button" type="button" data-action="toggle" aria-label="${task.completed ? "Mark task pending" : "Mark task complete"}"></button>
      <div class="task-content">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <small class="task-time">${dateLabel}</small>
      </div>
      <div class="task-actions">
        <button type="button" data-action="edit">Edit</button>
        <button class="delete-button" type="button" data-action="delete">Delete</button>
      </div>
    </li>
  `;
}

function escapeHtml(text) {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
}

function updateTask(taskId, changes) {
  tasks = tasks.map((task) => task.id === taskId ? { ...task, ...changes } : task);
  saveTasks();
  renderTasks();
}

function editTask(taskItem) {
  const taskId = taskItem.dataset.taskId;
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  const textElement = taskItem.querySelector(".task-text");
  const editInput = document.createElement("input");
  editInput.className = "inline-edit";
  editInput.type = "text";
  editInput.maxLength = 120;
  editInput.value = task.text;
  textElement.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  const finishEditing = () => {
    const text = editInput.value.trim();
    if (text) updateTask(taskId, { text });
    else renderTasks();
  };

  editInput.addEventListener("blur", finishEditing, { once: true });
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") editInput.blur();
    if (event.key === "Escape") renderTasks();
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift(createTask(text));
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

function handleTaskAction(event) {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const taskItem = actionButton.closest("[data-task-id]");
  const taskId = taskItem.dataset.taskId;
  const task = tasks.find((item) => item.id === taskId);

  if (actionButton.dataset.action === "toggle") {
    updateTask(taskId, { completed: !task.completed, completedAt: task.completed ? null : new Date().toISOString() });
  }
  if (actionButton.dataset.action === "edit") editTask(taskItem);
  if (actionButton.dataset.action === "delete") {
    tasks = tasks.filter((item) => item.id !== taskId);
    saveTasks();
    renderTasks();
  }
}

pendingList.addEventListener("click", handleTaskAction);
completedList.addEventListener("click", handleTaskAction);
clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric"
}).format(new Date());

renderTasks();
