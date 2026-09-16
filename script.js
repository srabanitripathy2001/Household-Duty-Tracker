// State Management
const members = ["Srabani", "Bhagyalaxmi", "Barsha", "Priyanka"];
const categories = [
  { name: "Kitchen", icon: "fa-kitchen-set" },
  { name: "Cleaning", icon: "fa-broom" },
  { name: "Grocery", icon: "fa-cart-shopping" },
  { name: "Bills", icon: "fa-file-invoice-dollar" },
  { name: "Other", icon: "fa-ellipsis" }
];

let activeTasks = [];
let taskHistory = [];
let weeklyRota = {
  Kitchen: ["Srabani", "Bhagyalaxmi", "Barsha", "Priyanka", "Srabani", "Bhagyalaxmi", "Barsha"],
  Cleaning: ["Bhagyalaxmi", "Barsha", "Priyanka", "Srabani", "Bhagyalaxmi", "Barsha", "Priyanka"],
  Grocery: ["Barsha", "Priyanka", "Srabani", "Bhagyalaxmi", "Barsha", "Priyanka", "Srabani"],
  Bills: ["Priyanka", "Srabani", "Bhagyalaxmi", "Barsha", "Priyanka", "Srabani", "Bhagyalaxmi"],
  Other: ["Srabani", "Bhagyalaxmi", "Barsha", "Priyanka", "Srabani", "Bhagyalaxmi", "Barsha"]
};

// Theme Toggle Functionality
function setTheme(theme) {
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Map Categories to Font Awesome Icons
function getCategoryIcon(cat) {
  switch (cat) {
    case 'Kitchen': return 'fa-kitchen-set';
    case 'Cleaning': return 'fa-broom';
    case 'Grocery': return 'fa-cart-shopping';
    case 'Bills': return 'fa-file-invoice-dollar';
    default: return 'fa-ellipsis';
  }
}

// Preset Category Selection
document.querySelectorAll('.btn-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.getAttribute('data-category');
    document.getElementById('task-category').value = cat;
  });
});

document.getElementById('task-category').addEventListener('change', (e) => {
  const selectedCat = e.target.value;
  document.querySelectorAll('.btn-preset').forEach(btn => {
    if (btn.getAttribute('data-category') === selectedCat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
});

// Add Task
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const category = document.getElementById('task-category').value;
  const title = document.getElementById('task-title').value.trim();
  const assignedBy = document.getElementById('assigned-by').value;
  const assignedTo = document.getElementById('assigned-to').value;

  if (!title) return;

  const newTask = {
    id: Date.now(),
    category,
    title,
    assignedBy,
    assignedTo,
    timestamp: new Date()
  };

  activeTasks.push(newTask);
  renderTasks();
  document.getElementById('task-title').value = '';
});

// Clear Tasks
document.getElementById('clear-btn').addEventListener('click', () => {
  activeTasks = [];
  renderTasks();
});

// Complete Task
function completeTask(taskId) {
  const index = activeTasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    const task = activeTasks.splice(index, 1)[0];
    task.completedAt = new Date();
    taskHistory.push(task);
    renderTasks();
    renderReports();
  }
}

// Render Active Tasks
function renderTasks() {
  const container = document.getElementById('task-list');
  container.innerHTML = '';

  if (activeTasks.length === 0) {
    container.innerHTML = '<p class="subtitle" style="text-align:center; padding: 20px;">No active tasks.</p>';
    return;
  }

  activeTasks.forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item';

    const icon = getCategoryIcon(task.category);

    item.innerHTML = `
      <div class="task-info">
        <span class="badge"><i class="fa-solid ${icon}"></i> ${task.category}</span>
        <div class="task-title">${task.title}</div>
        <div class="task-meta">By ${task.assignedBy} ➔ To <strong>${task.assignedTo}</strong></div>
      </div>
      <button class="btn-complete" onclick="completeTask(${task.id})"><i class="fa-solid fa-check"></i> Done</button>
    `;

    container.appendChild(item);
  });
}

// Render Weekly Rota Matrix
function renderWeeklyRota() {
  const tbody = document.getElementById('weekly-rota-body');
  tbody.innerHTML = '';

  categories.forEach(cat => {
    const tr = document.createElement('tr');

    let rowHTML = `<td><i class="fa-solid ${cat.icon}"></i> ${cat.name}</td>`;

    weeklyRota[cat.name].forEach((assignedPerson, dayIndex) => {
      let optionsHTML = members.map(m =>
        `<option value="${m}" ${m === assignedPerson ? 'selected' : ''}>${m}</option>`
      ).join('');

      rowHTML += `
        <td>
          <select onchange="updateRota('${cat.name}', ${dayIndex}, this.value)">
            ${optionsHTML}
          </select>
        </td>
      `;
    });

    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);
  });
}

// Update Rota Cell
function updateRota(category, dayIndex, person) {
  weeklyRota[category][dayIndex] = person;
}

// Auto Rotate Rota Shift
document.getElementById('rotate-rota-btn').addEventListener('click', () => {
  Object.keys(weeklyRota).forEach(cat => {
    const arr = weeklyRota[cat];
    arr.unshift(arr.pop());
  });
  renderWeeklyRota();
});

// Render Reports and History
function renderReports() {
  document.getElementById('daily-count').innerText = taskHistory.length;
  document.getElementById('weekly-count').innerText = taskHistory.length;
  document.getElementById('monthly-count').innerText = taskHistory.length;

  // Member stats
  const memberCounts = {};
  members.forEach(m => memberCounts[m] = 0);
  taskHistory.forEach(t => {
    if (memberCounts[t.assignedTo] !== undefined) {
      memberCounts[t.assignedTo]++;
    }
  });

  const memberStatsContainer = document.getElementById('member-stats');
  memberStatsContainer.innerHTML = '';
  members.forEach(m => {
    const row = document.createElement('div');
    row.className = 'member-stat-row';
    row.innerHTML = `<span><i class="fa-solid fa-user"></i> ${m}</span><strong>${memberCounts[m]} Done</strong>`;
    memberStatsContainer.appendChild(row);
  });

  // Task History Log
  const historyContainer = document.getElementById('detailed-logs-list');
  historyContainer.innerHTML = '';
  if (taskHistory.length === 0) {
    historyContainer.innerHTML = '<p class="subtitle" style="text-align:center; padding: 10px;">No completed tasks yet.</p>';
    return;
  }

  taskHistory.slice().reverse().forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item completed';
    item.innerHTML = `
      <div class="task-info">
        <span class="badge"><i class="fa-solid ${getCategoryIcon(task.category)}"></i> ${task.category}</span>
        <div class="task-title">${task.title}</div>
        <div class="task-meta">Completed by <strong>${task.assignedTo}</strong></div>
      </div>
    `;
    historyContainer.appendChild(item);
  });
}

// Initial Render
renderTasks();
renderWeeklyRota();
renderReports();