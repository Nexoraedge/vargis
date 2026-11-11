/**
 * Comeback 90 - Daily Habit Tracker Module
 * Interactive daily discipline checklists, streak calculations, and historical preservation.
 */

const HabitsModule = {
  currentViewingDate: null,

  render(container) {
    if (!this.currentViewingDate) {
      this.currentViewingDate = StorageManager.getTodayDateString();
    }

    const viewingDate = this.currentViewingDate;
    const isToday = viewingDate === StorageManager.getTodayDateString();
    const habits = StorageManager.getHabits().filter(h => h.active !== false);
    const dailyLog = StorageManager.getDailyLog(viewingDate);
    const completedMap = dailyLog.habits || {};

    const completedCount = habits.filter(h => !!completedMap[h.id]).length;
    const totalCount = habits.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Calculate habit streak
    const currentStreak = this.calculateHabitStreak();

    // Past 7 days mini strip
    const last7Days = this.getLast7Days();

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">Daily Discipline & Habits</span>
            <h1 class="page-title">Habit Command</h1>
            <p class="page-subtitle">Atomic consistency compounds into total transformation. Every tick counts.</p>
          </div>
          <button class="btn btn-primary" onclick="HabitsModule.openAddHabitModal()">
            <i data-lucide="plus"></i> Add Custom Habit
          </button>
        </div>
      </div>

      <!-- Streak & Completion Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="flame" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Transformation Streak</span>
            <span class="metric-value">${currentStreak} <span class="unit">days</span></span>
            <span class="metric-sub">Consecutive days of action</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-champagne-light">
            <i data-lucide="check-circle" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">${isToday ? "Today's Completion" : "Completion on " + StorageManager.formatDateIndian(viewingDate)}</span>
            <span class="metric-value">${completionRate}% <span class="unit">(${completedCount}/${totalCount})</span></span>
            <div class="progress-bar-bg mt-2" style="max-width: 180px;">
              <div class="progress-bar-fill" style="width: ${completionRate}%; background-color: var(--primary);"></div>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="calendar" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Selected Date</span>
            <span class="metric-value font-medium" style="font-size: 1.1rem;">${StorageManager.formatDateIndian(viewingDate)}</span>
            <div class="flex items-center gap-2 mt-1">
              <input type="date" class="form-input form-input-sm" style="width: auto; padding: 2px 6px;" value="${viewingDate}" onchange="HabitsModule.changeDate(this.value)">
              ${!isToday ? `<button class="btn btn-xs btn-outline" onclick="HabitsModule.changeDate('${StorageManager.getTodayDateString()}')">Go to Today</button>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- 7-Day Activity Mini Strip -->
      <div class="card mt-6">
        <div class="card-header-row mb-3">
          <h4 class="font-semibold text-sm">Recent 7-Day Consistency</h4>
          <span class="text-xs text-secondary">Click any day to inspect or log</span>
        </div>
        <div class="habit-days-strip">
          ${last7Days.map(d => {
            const isSelected = d.dateStr === viewingDate;
            return `
              <div class="habit-strip-day ${isSelected ? 'selected' : ''}" onclick="HabitsModule.changeDate('${d.dateStr}')">
                <span class="day-label">${d.dayName}</span>
                <span class="day-num">${d.dayNum}</span>
                <div class="day-indicator ${d.rate >= 80 ? 'bg-success' : d.rate >= 40 ? 'bg-sage' : d.rate > 0 ? 'bg-warning' : 'bg-neutral'}">
                  ${d.rate}%
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Interactive Habit Checklist Card -->
      <div class="card mt-6">
        <div class="card-header-row border-b pb-3 mb-4">
          <div>
            <h3 class="card-title">Daily Transformation Checklist</h3>
            <p class="card-subtitle">
              ${isToday ? "Tasks reset each day, but historical entries remain safe in your vault." : `Viewing historical records for ${StorageManager.formatDateIndian(viewingDate)}.`}
            </p>
          </div>
          ${completionRate === 100 ? `<span class="badge badge-success"><i data-lucide="award" style="width:14px; height:14px; margin-right:4px;"></i> All Completed!</span>` : ''}
        </div>

        <div class="habits-list">
          ${habits.map((h, idx) => {
            const isDone = !!completedMap[h.id];
            return `
              <div class="habit-item ${isDone ? 'completed' : ''}">
                <label class="habit-main-label">
                  <input type="checkbox" class="custom-checkbox" ${isDone ? 'checked' : ''} onchange="HabitsModule.toggleHabit('${h.id}', this.checked)">
                  <div class="habit-text-group">
                    <span class="habit-name ${isDone ? 'line-through text-secondary' : 'font-medium'}">${h.name}</span>
                    <span class="badge badge-neutral text-xs">${h.category}</span>
                  </div>
                </label>
                <div class="habit-actions">
                  ${h.id.startsWith('h_custom_') ? `
                    <button class="btn-icon text-error" onclick="HabitsModule.deleteCustomHabit('${h.id}')" title="Delete custom habit">
                      <i data-lucide="trash-2"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  changeDate(newDate) {
    this.currentViewingDate = newDate;
    this.render(document.getElementById('main-content-view'));
  },

  toggleHabit(habitId, checked) {
    const date = this.currentViewingDate || StorageManager.getTodayDateString();
    StorageManager.toggleHabitStatus(date, habitId);

    // If it's today and all are checked, play subtle encouragement
    if (checked) {
      App.showToast('Habit checked!', 'info');
    }
    App.refreshCurrentView();
  },

  deleteCustomHabit(id) {
    if (confirm('Delete this custom habit? Past records will remain in daily logs.')) {
      StorageManager.deleteHabit(id);
      App.showToast('Custom habit deleted.', 'info');
      App.refreshCurrentView();
    }
  },

  getLast7Days() {
    const list = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const habits = StorageManager.getHabits().filter(h => h.active !== false);
      const dailyLog = StorageManager.getDailyLog(dateStr);
      const doneCount = habits.filter(h => dailyLog.habits && dailyLog.habits[h.id]).length;
      const rate = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

      list.push({
        dateStr,
        dayName: d.toLocaleDateString('en-IN', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        rate
      });
    }
    return list;
  },

  calculateHabitStreak() {
    const dailyLogs = StorageManager.getDailyLogs();
    const habits = StorageManager.getHabits().filter(h => h.active !== false);
    if (habits.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    // Check going backwards day by day
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const log = dailyLogs[dateStr];
      if (!log || !log.habits) {
        if (i === 0) {
          // Today might not have finished yet, give benefit of doubt if yesterday was active
          continue;
        } else {
          break;
        }
      }

      const doneCount = habits.filter(h => log.habits[h.id]).length;
      const rate = (doneCount / habits.length);

      // Consider active if at least 50% completed or workout was logged
      if (rate >= 0.5 || log.workoutCompleted) {
        streak++;
      } else {
        if (i === 0) continue; // today is still ongoing
        break;
      }
    }

    return streak;
  },

  openAddHabitModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="habit-modal">
        <div class="modal-sheet">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Create Custom Habit</h3>
              <p class="text-sm text-secondary">Add an intentional personal habit to your daily checklist.</p>
            </div>
            <button class="modal-close-btn" onclick="HabitsModule.closeModal()">&times;</button>
          </div>

          <form id="habit-form" onsubmit="HabitsModule.saveCustomHabit(event)">
            <div class="form-group mb-4">
              <label class="form-label">Habit Name</label>
              <input type="text" class="form-input" id="new-habit-name" placeholder="e.g. 10m Post-meal walk or Read 10 pages" required>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Category</label>
              <select class="form-input" id="new-habit-cat">
                <option value="Routine">Routine</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Mindset">Mindset / Focus</option>
                <option value="Recovery">Recovery</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="HabitsModule.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i data-lucide="plus"></i> Add Habit
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById('habit-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  saveCustomHabit(e) {
    e.preventDefault();
    const name = document.getElementById('new-habit-name').value;
    const cat = document.getElementById('new-habit-cat').value;

    StorageManager.addCustomHabit(name, cat);
    this.closeModal();
    App.showToast(`Habit "${name}" created!`, 'success');
    App.refreshCurrentView();
  },

  closeModal() {
    const modal = document.getElementById('habit-modal');
    if (modal) modal.remove();
  }
};
