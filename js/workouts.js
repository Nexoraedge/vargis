/**
 * Vergis - Workout Tracker Module
 * Comprehensive home-calisthenics and backpack resistance tracking system.
 */

const WorkoutModule = {
  activeTimerInterval: null,
  timerSecondsRemaining: 0,

  weeklySchedule: [
    { dayIndex: 0, dayName: 'Sunday', plan: 'Sunday Sports / Volleyball', type: 'Sports', description: 'Recreational volleyball match / outdoor sports. Fun athleticism & agility.' },
    { dayIndex: 1, dayName: 'Monday', plan: 'Workout A (Chest, Legs, Core)', type: 'Workout A', description: 'Strength session 1: Push-ups, backpack squats, glute bridges, rows, plank.' },
    { dayIndex: 2, dayName: 'Tuesday', plan: 'Workout B (Shoulders, Back, Calves)', type: 'Workout B', description: 'Strength session 2: Pike push-ups, backpack rows, reverse lunges, shoulder press, calves.' },
    { dayIndex: 3, dayName: 'Wednesday', plan: 'Active Recovery / 30-45m Walk', type: 'Recovery', description: 'Midweek active recovery: gentle walking, joint decompression, hydration.' },
    { dayIndex: 4, dayName: 'Thursday', plan: 'Workout A (Chest, Legs, Core)', type: 'Workout A', description: 'Strength session 3: Progressive overload on push-ups, squats, rows, and core.' },
    { dayIndex: 5, dayName: 'Friday', plan: 'Workout B (Shoulders, Back, Calves)', type: 'Workout B', description: 'Strength session 4: Strict shoulder press, rows, lunges, calf raises, side plank.' },
    { dayIndex: 6, dayName: 'Saturday', plan: 'Rest & Deep Mobility', type: 'Rest', description: 'Rest day: hip mobility, wrist stretches, deep sleep before Sunday sports.' }
  ],

  workoutRoutines: {
    'Workout A': [
      { name: 'Standard Push-ups', targetSets: 3, targetReps: '12–15', restSec: 60, focus: 'Chest, front delts, triceps. Full range with chest touching floor.' },
      { name: 'Backpack Squats', targetSets: 3, targetReps: '15', restSec: 60, focus: 'Quads & glutes. Fill backpack with books/water bottles. Keep chest high.' },
      { name: 'Backpack Bent-over Rows', targetSets: 3, targetReps: '12', restSec: 60, focus: 'Lats & upper back. Flat back, hinge at hips, pull elbows back.' },
      { name: 'Glute Bridges', targetSets: 3, targetReps: '15', restSec: 45, focus: 'Posterior chain. 1-second squeeze at the peak of each rep.' },
      { name: 'Plank Hold', targetSets: 3, targetReps: '30–45s', restSec: 45, focus: 'Core stability. Glutes tight, belly button drawn in, no sagging.' }
    ],
    'Workout B': [
      { name: 'Pike Push-ups', targetSets: 2, targetReps: '6–10', restSec: 75, focus: 'Anterior deltoids & overhead pressing strength. Elevated hips.' },
      { name: 'Backpack Rows', targetSets: 3, targetReps: '12', restSec: 60, focus: 'Rhomboids and back thickness. Control the eccentric lowering.' },
      { name: 'Reverse Lunges', targetSets: 3, targetReps: '10 each leg', restSec: 60, focus: 'Unilateral leg strength & knee stability. Step back smoothly.' },
      { name: 'Backpack Shoulder Press', targetSets: 2, targetReps: '10', restSec: 60, focus: 'Strict overhead press with weighted backpack. Core locked.' },
      { name: 'Standing Calf Raises', targetSets: 3, targetReps: '20', restSec: 45, focus: 'Calf hypertrophy. Elevate toes on a step or book for full stretch.' },
      { name: 'Side Plank', targetSets: 2, targetReps: '30s each side', restSec: 45, focus: 'Obliques & lateral hip stability. Hips straight.' }
    ]
  },

  progressionStages: [
    { weeks: 'Weeks 1–2', phase: 'Technique Mastery', notes: 'Master spotless form. Avoid training to absolute failure. Emphasize full range of motion.' },
    { weeks: 'Weeks 3–4', phase: 'Volume Consistency', notes: 'Hit all scheduled sets reliably. Establish cadence and recover between sessions.' },
    { weeks: 'Weeks 5–8', phase: 'Load Progression', notes: 'Add weight to backpack (extra books/water bottles). Add 2-second eccentric pauses.' },
    { weeks: 'Weeks 9–12', phase: 'Overload & Peak', notes: 'Target the upper rep brackets. Test push-up endurance with proper multi-day recovery.' }
  ],

  getTodayPlannedWorkout() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    const scheduleItem = this.weeklySchedule.find(s => s.dayIndex === dayOfWeek) || this.weeklySchedule[1];
    return {
      ...scheduleItem,
      resolvedWorkout: scheduleItem.type.startsWith('Workout') ? scheduleItem.type : null
    };
  },

  render(container) {
    const planned = this.getTodayPlannedWorkout();
    const workoutLogs = StorageManager.getWorkoutLogs();
    const todayDate = StorageManager.getTodayDateString();
    const todayLog = workoutLogs.find(w => w.date === todayDate);
    const profile = StorageManager.getProfile();

    // Calculate this week's workout count
    const thisWeekWorkouts = this.getThisWeekCompletedCount();

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">Calisthenics & Resistance</span>
            <h1 class="page-title">Workouts & Strength</h1>
            <p class="page-subtitle">4 weekly strength sessions + Sunday sports. Recovery on Wed & Sat.</p>
          </div>
          <button class="btn btn-primary" id="btn-quick-log-workout">
            <i data-lucide="plus-circle"></i> Log Workout
          </button>
        </div>
      </div>

      <!-- Overview Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="calendar" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Today's Plan</span>
            <span class="metric-value font-medium" style="font-size: 1.1rem;">${planned.plan}</span>
            <span class="metric-sub">${planned.description}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-champagne-light">
            <i data-lucide="zap" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Push-up Best Record</span>
            <span class="metric-value">${profile.pushupPR || 48} <span class="unit">reps</span></span>
            <span class="metric-sub">Strict form baseline</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="activity" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Weekly Consistency</span>
            <span class="metric-value">${thisWeekWorkouts} <span class="unit">/ 4 sessions</span></span>
            <span class="metric-sub">${thisWeekWorkouts >= 4 ? 'Target achieved this week!' : `${4 - thisWeekWorkouts} remaining this week`}</span>
          </div>
        </div>
      </div>

      <!-- Rest & Recovery Scientific Principle Banner -->
      <div class="card banner-card">
        <div class="banner-icon">
          <i data-lucide="shield-alert" class="text-champagne-dark"></i>
        </div>
        <div class="banner-body">
          <h4 class="banner-title">Crucial Recovery Principle</h4>
          <p class="banner-text">
            <strong>Do not test your maximum push-ups daily.</strong> Muscle growth and progressive overload require 48 hours of muscular recovery and adequate sleep (7–9 hours) to synthesize new tissue. Train hard on workout days, rest purposefully on recovery days.
          </p>
        </div>
      </div>

      <!-- Workout Routines Interactive Tabs -->
      <div class="card p-0 mt-6">
        <div class="tab-header border-b">
          <button class="tab-btn active" data-tab="routine-a">Workout A (Chest/Legs)</button>
          <button class="tab-btn" data-tab="routine-b">Workout B (Shoulders/Back)</button>
          <button class="tab-btn" data-tab="weekly-schedule">Weekly Schedule</button>
          <button class="tab-btn" data-tab="progression-guide">12-Week Progression</button>
        </div>

        <div class="p-6">
          <!-- Routine A -->
          <div class="tab-content active" id="tab-routine-a">
            <div class="routine-meta mb-4">
              <div class="routine-badge">Workout A</div>
              <p class="text-secondary text-sm">Focus: Horizontal push, knee flexion, back engagement, and midline stabilization.</p>
            </div>
            <div class="exercises-list">
              ${this.renderExerciseList('Workout A')}
            </div>
            <div class="routine-actions mt-6">
              <button class="btn btn-primary" onclick="WorkoutModule.openWorkoutSessionModal('Workout A')">
                <i data-lucide="play"></i> Start Workout A Session
              </button>
            </div>
          </div>

          <!-- Routine B -->
          <div class="tab-content" id="tab-routine-b">
            <div class="routine-meta mb-4">
              <div class="routine-badge">Workout B</div>
              <p class="text-secondary text-sm">Focus: Vertical/overhead push, unilateral leg balance, horizontal pulling, and lateral core.</p>
            </div>
            <div class="exercises-list">
              ${this.renderExerciseList('Workout B')}
            </div>
            <div class="routine-actions mt-6">
              <button class="btn btn-primary" onclick="WorkoutModule.openWorkoutSessionModal('Workout B')">
                <i data-lucide="play"></i> Start Workout B Session
              </button>
            </div>
          </div>

          <!-- Schedule Tab -->
          <div class="tab-content" id="tab-weekly-schedule">
            <div class="schedule-timeline">
              ${this.weeklySchedule.map(s => {
                const isToday = s.dayIndex === new Date().getDay();
                return `
                  <div class="schedule-item ${isToday ? 'current-day-highlight' : ''}">
                    <div class="schedule-day-badge ${isToday ? 'badge-primary' : 'badge-neutral'}">${s.dayName} ${isToday ? '(Today)' : ''}</div>
                    <div class="schedule-detail">
                      <h4 class="font-semibold">${s.plan}</h4>
                      <p class="text-sm text-secondary">${s.description}</p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Progression Tab -->
          <div class="tab-content" id="tab-progression-guide">
            <div class="grid-2col gap-4">
              ${this.progressionStages.map(p => `
                <div class="progression-card">
                  <div class="badge badge-sage mb-2">${p.weeks}</div>
                  <h4 class="font-semibold text-primary mb-1">${p.phase}</h4>
                  <p class="text-sm text-secondary">${p.notes}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Rest Timer Component -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Inter-Set Rest Timer</h3>
            <p class="card-subtitle">Keep your rest strictly bounded between 45s and 90s for maximum stimulus.</p>
          </div>
          <div class="rest-timer-display" id="rest-timer-val">00:00</div>
        </div>
        <div class="timer-controls mt-4">
          <button class="btn btn-secondary btn-sm" onclick="WorkoutModule.startTimer(45)">45s Rest</button>
          <button class="btn btn-secondary btn-sm" onclick="WorkoutModule.startTimer(60)">60s Rest</button>
          <button class="btn btn-secondary btn-sm" onclick="WorkoutModule.startTimer(90)">90s Rest</button>
          <button class="btn btn-outline btn-sm" onclick="WorkoutModule.stopTimer()">Reset</button>
        </div>
      </div>

      <!-- Workout History Table -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Workout History</h3>
            <p class="card-subtitle">Logs of all completed sessions, volume, and push-up achievements.</p>
          </div>
        </div>
        <div class="table-container mt-4">
          ${this.renderWorkoutHistoryTable(workoutLogs)}
        </div>
      </div>
    `;

    lucide.createIcons();
    this.bindEvents(container);
  },

  renderExerciseList(routineKey) {
    const list = this.workoutRoutines[routineKey] || [];
    return list.map((item, idx) => `
      <div class="exercise-item">
        <div class="exercise-idx">${idx + 1}</div>
        <div class="exercise-info">
          <div class="exercise-header">
            <h4 class="exercise-name">${item.name}</h4>
            <span class="exercise-targets">${item.targetSets} sets × ${item.targetReps} • ${item.restSec}s rest</span>
          </div>
          <p class="exercise-focus">${item.focus}</p>
        </div>
      </div>
    `).join('');
  },

  renderWorkoutHistoryTable(logs) {
    if (!logs || logs.length === 0) {
      return `
        <div class="empty-state">
          <i data-lucide="dumbbell" class="empty-state-icon"></i>
          <p class="empty-state-text">No workouts logged yet. Start your first session today!</p>
        </div>
      `;
    }

    return `
      <!-- Desktop Table -->
      <div class="desktop-table-view">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Push-ups Logged</th>
              <th>Notes</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td><strong>${StorageManager.formatDateIndian(log.date)}</strong></td>
                <td><span class="badge badge-sage">${log.workoutType}</span></td>
                <td>${log.durationMinutes} mins</td>
                <td>${log.pushupsCompleted ? `<strong>${log.pushupsCompleted}</strong> reps` : '—'}</td>
                <td class="text-secondary text-sm">${log.notes || '—'}</td>
                <td class="text-right">
                  <button class="btn-icon text-error" onclick="WorkoutModule.deleteWorkout('${log.id}')" title="Delete">
                    <i data-lucide="trash-2"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Card List -->
      <div class="mobile-card-list">
        ${logs.map(log => `
          <div class="mobile-log-card">
            <div class="mobile-log-header">
              <div class="flex items-center gap-2">
                <span class="badge badge-sage">${log.workoutType}</span>
                <span class="text-xs text-secondary font-medium">${StorageManager.formatDateIndian(log.date)}</span>
              </div>
              <button class="btn-icon text-error" onclick="WorkoutModule.deleteWorkout('${log.id}')" title="Delete">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
            <div class="mobile-log-metrics">
              <span class="log-metric-pill"><i data-lucide="clock" class="pill-icon"></i> ${log.durationMinutes}m</span>
              ${log.pushupsCompleted ? `<span class="log-metric-pill badge-champagne"><i data-lucide="zap" class="pill-icon"></i> ${log.pushupsCompleted} push-ups</span>` : ''}
            </div>
            ${log.notes ? `<p class="mobile-log-notes">${log.notes}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  getThisWeekCompletedCount() {
    const logs = StorageManager.getWorkoutLogs();
    const now = new Date();
    // Start of current week (Monday)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return logs.filter(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      return logDate >= monday;
    }).length;
  },

  bindEvents(container) {
    // Tabs
    const tabBtns = container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = 'tab-' + btn.getAttribute('data-tab');
        const content = container.querySelector('#' + targetId);
        if (content) content.classList.add('active');
        lucide.createIcons();
      });
    });

    // Quick Log Workout
    const quickLogBtn = container.querySelector('#btn-quick-log-workout');
    if (quickLogBtn) {
      quickLogBtn.addEventListener('click', () => {
        this.openWorkoutSessionModal();
      });
    }
  },

  startTimer(seconds) {
    this.stopTimer();
    this.timerSecondsRemaining = seconds;
    this.updateTimerDisplay();

    const displayEl = document.getElementById('rest-timer-val');
    if (displayEl) displayEl.classList.add('timer-running');

    this.activeTimerInterval = setInterval(() => {
      this.timerSecondsRemaining--;
      this.updateTimerDisplay();

      if (this.timerSecondsRemaining <= 0) {
        this.stopTimer();
        App.showToast('Rest completed! Time for the next set.', 'info');
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      }
    }, 1000);
  },

  stopTimer() {
    if (this.activeTimerInterval) {
      clearInterval(this.activeTimerInterval);
      this.activeTimerInterval = null;
    }
    const displayEl = document.getElementById('rest-timer-val');
    if (displayEl) {
      displayEl.classList.remove('timer-running');
      displayEl.textContent = '00:00';
    }
  },

  updateTimerDisplay() {
    const displayEl = document.getElementById('rest-timer-val');
    if (!displayEl) return;
    const mins = Math.floor(this.timerSecondsRemaining / 60);
    const secs = this.timerSecondsRemaining % 60;
    displayEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  openWorkoutSessionModal(presetType = 'Workout A') {
    const planned = this.getTodayPlannedWorkout();
    const defaultType = presetType || planned.resolvedWorkout || 'Workout A';

    const modalHtml = `
      <div class="modal-backdrop" id="workout-modal">
        <div class="modal-sheet">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Record Workout Session</h3>
              <p class="text-sm text-secondary">Log your completed sets, reps, and energy levels.</p>
            </div>
            <button class="modal-close-btn" onclick="WorkoutModule.closeModal()">&times;</button>
          </div>

          <form id="workout-form" onsubmit="WorkoutModule.saveWorkoutSession(event)">
            <div class="form-group mb-4">
              <label class="form-label">Date</label>
              <input type="date" class="form-input" id="wo-date" value="${StorageManager.getTodayDateString()}" required>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Workout Routine</label>
              <select class="form-input" id="wo-type" onchange="WorkoutModule.onRoutineSelectChange(this.value)">
                <option value="Workout A" ${defaultType === 'Workout A' ? 'selected' : ''}>Workout A (Push-ups, Squats, Rows, Glute Bridges, Plank)</option>
                <option value="Workout B" ${defaultType === 'Workout B' ? 'selected' : ''}>Workout B (Pike Push-ups, Rows, Lunges, Shoulder Press, Calves)</option>
                <option value="Active Recovery / Walking" ${defaultType === 'Recovery' ? 'selected' : ''}>Active Recovery / 30-45m Walk</option>
                <option value="Rest & Mobility" ${defaultType === 'Rest' ? 'selected' : ''}>Rest & Deep Mobility</option>
                <option value="Volleyball Session">Volleyball / Recreational Sport</option>
                <option value="Custom Workout">Custom Workout</option>
              </select>
            </div>

            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Duration (minutes)</label>
                <input type="number" class="form-input" id="wo-duration" value="45" min="5" max="180">
              </div>
              <div class="form-group">
                <label class="form-label">Push-ups Completed (Total or Best Set)</label>
                <input type="number" class="form-input" id="wo-pushups" placeholder="e.g. 45" min="0" max="200">
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Session Notes & Resistance (e.g. 6kg in backpack, felt strong)</label>
              <textarea class="form-input" id="wo-notes" rows="3" placeholder="Added 2 books to backpack, smooth eccentric tempo..."></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="WorkoutModule.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i data-lucide="check"></i> Save & Log Session
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById('workout-modal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  onRoutineSelectChange(val) {
    // Helpful preset duration
    const durInput = document.getElementById('wo-duration');
    if (!durInput) return;
    if (val.includes('Walking') || val.includes('Recovery')) durInput.value = 35;
    else if (val.includes('Rest')) durInput.value = 20;
    else durInput.value = 45;
  },

  saveWorkoutSession(e) {
    e.preventDefault();
    const date = document.getElementById('wo-date').value;
    const workoutType = document.getElementById('wo-type').value;
    const durationMinutes = parseInt(document.getElementById('wo-duration').value, 10) || 45;
    const pushups = parseInt(document.getElementById('wo-pushups').value, 10) || 0;
    const notes = document.getElementById('wo-notes').value;

    StorageManager.addWorkoutLog({
      date,
      workoutType,
      durationMinutes,
      pushupsCompleted: pushups,
      notes
    });

    this.closeModal();
    App.showToast('Workout successfully saved and logged!', 'success');
    App.refreshCurrentView();
  },

  deleteWorkout(id) {
    if (confirm('Are you sure you want to delete this workout log?')) {
      StorageManager.deleteWorkoutLog(id);
      App.showToast('Workout deleted.', 'info');
      App.refreshCurrentView();
    }
  },

  closeModal() {
    const modal = document.getElementById('workout-modal');
    if (modal) modal.remove();
  }
};

