/**
 * Vergis - Home Dashboard Module
 * Central Command Center bringing together daily schedule, quick actions,
 * interactive checklists, trajectory charts, and holistic progress meters.
 */

const DashboardModule = {
  render(container) {
    const profile = StorageManager.getProfile();
    const settings = StorageManager.getSettings();
    const today = StorageManager.getTodayDateString();
    const prog = StorageManager.calculateDay(profile.startDate || today);

    // Logs
    const weightLogs = StorageManager.getWeightLogs();
    const workoutLogs = StorageManager.getWorkoutLogs();
    const nutritionLogs = StorageManager.getNutritionLogs(today);
    const dailyLog = StorageManager.getDailyLog(today);
    const skincareLog = StorageManager.getSkincareLog(today);
    const habits = StorageManager.getHabits().filter(h => h.active !== false);

    // Metrics calculations
    const startWeight = profile.startingWeight || 59.0;
    const targetWeight = profile.targetWeight || 65.0;
    const latestWeightLog = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
    const currentWeight = latestWeightLog ? latestWeightLog.weight : startWeight;
    const netGained = Math.round((currentWeight - startWeight) * 10) / 10;

    // Today's workout & schedule
    const todayPlan = WorkoutModule.getTodayPlannedWorkout();
    const todayWorkoutDone = workoutLogs.some(w => w.date === today) || dailyLog.workoutCompleted;

    // Habits
    const habitMap = dailyLog.habits || {};
    const completedHabitCount = habits.filter(h => !!habitMap[h.id]).length;
    const habitPercent = habits.length > 0 ? Math.round((completedHabitCount / habits.length) * 100) : 0;

    // Nutrition
    const totalProtein = Math.round((nutritionLogs.reduce((s, i) => s + (i.protein || 0), 0)) * 10) / 10;
    const totalCalories = Math.round(nutritionLogs.reduce((s, i) => s + (i.calories || 0), 0));
    const proteinTarget = settings.proteinTarget || 85;
    const waterTarget = settings.waterTarget || 2500;
    const waterCurrent = dailyLog.waterMl || 0;

    // Skincare
    const amSkincareDone = skincareLog.amWater && skincareLog.amMoisturizer && skincareLog.amSunscreen;
    const pmSkincareDone = skincareLog.pmWash && skincareLog.pmMoisturizer;

    // Workouts this week
    const thisWeekWorkouts = WorkoutModule.getThisWeekCompletedCount();

    // Time-based greeting
    const greeting = this.getTimeGreeting();

    const showPwaBanner = !localStorage.getItem('comeback90_pwa_dismissed') && !window.matchMedia('(display-mode: standalone)').matches;

    container.innerHTML = `
      ${showPwaBanner ? `
        <div class="pwa-install-banner mb-4 animate-fadeIn" id="pwa-install-banner">
          <div class="flex items-center gap-3">
            <div class="pwa-install-icon"><i data-lucide="smartphone"></i></div>
            <div class="pwa-install-text">
              <span class="pwa-install-title">Install Native App</span>
              <p class="pwa-install-desc">Tap <b>Share ⎋ → Add to Home Screen</b> in Safari/Chrome to use Comeback 90 fullscreen without browser bars.</p>
            </div>
          </div>
          <button class="btn-icon btn-xs text-secondary" onclick="DashboardModule.dismissPwaBanner()" title="Dismiss">&times;</button>
        </div>
      ` : ''}

      <!-- Header Section -->
      <div class="dashboard-header animate-fadeIn">
        <div class="header-left">
          <div class="greeting-row">
            <span class="greeting-badge">
              <span class="pulse-dot"></span>
              Day ${prog.currentDay} of 90
            </span>
            <span class="date-text">${this.formatFullDate(today)}</span>
          </div>
          <h1 class="dashboard-title">${greeting}, ${profile.name || 'Champion'}</h1>
          <p class="tagline">Your comeback starts with consistency. Build yourself, one day at a time.</p>
        </div>
        <div class="header-right">
          <button class="btn btn-primary" onclick="DashboardModule.openQuickActionMenu()">
            <i data-lucide="plus"></i> Quick Action
          </button>
        </div>
      </div>

      <!-- Quick Action Buttons Strip -->
      <div class="quick-actions-bar mt-4 mb-6">
        <button class="quick-act-btn" onclick="ProgressModule.openLogWeightModal()">
          <div class="act-icon bg-sage-light"><i data-lucide="scale" class="text-primary"></i></div>
          <span>Log Weight</span>
        </button>
        <button class="quick-act-btn" onclick="WorkoutModule.openWorkoutSessionModal()">
          <div class="act-icon bg-champagne-light"><i data-lucide="dumbbell" class="text-champagne-dark"></i></div>
          <span>Log Workout</span>
        </button>
        <button class="quick-act-btn" onclick="NutritionModule.openAddMealModal()">
          <div class="act-icon bg-sage-light"><i data-lucide="utensils" class="text-primary"></i></div>
          <span>Add Meal</span>
        </button>
        <button class="quick-act-btn" onclick="NutritionModule.adjustWater(250)">
          <div class="act-icon bg-champagne-light"><i data-lucide="droplet" class="text-champagne-dark"></i></div>
          <span>+250ml Water</span>
        </button>
        <button class="quick-act-btn" onclick="App.navigateTo('skincare')">
          <div class="act-icon bg-sage-light"><i data-lucide="sparkles" class="text-primary"></i></div>
          <span>Skincare</span>
        </button>
      </div>

      <!-- Section A: 6 Primary Overview Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="scale" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Current Weight</span>
            <span class="metric-value">${currentWeight.toFixed(1)} <span class="unit">kg</span></span>
            <span class="metric-sub">Started at ${startWeight.toFixed(1)} kg</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-champagne-light">
            <i data-lucide="target" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">90-Day Target</span>
            <span class="metric-value">${targetWeight.toFixed(1)} <span class="unit">kg</span></span>
            <span class="metric-sub">Long-term: ${profile.longTermTarget || 72} kg</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="trending-up" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Weight Gained</span>
            <span class="metric-value ${netGained >= 0 ? 'text-primary' : 'text-error'}">
              ${netGained >= 0 ? '+' : ''}${netGained.toFixed(1)} <span class="unit">kg</span>
            </span>
            <span class="metric-sub">Lean mass trajectory</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-champagne-light">
            <i data-lucide="flag" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Programme Timeline</span>
            <span class="metric-value">Day ${prog.currentDay} <span class="unit">/ 90</span></span>
            <span class="metric-sub">${prog.daysLeft} days remaining</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="activity" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Weekly Workouts</span>
            <span class="metric-value">${thisWeekWorkouts} <span class="unit">/ 4</span></span>
            <span class="metric-sub">${thisWeekWorkouts >= 4 ? 'Weekly goal hit!' : `${4 - thisWeekWorkouts} remaining`}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-champagne-light">
            <i data-lucide="check-circle" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Today's Habits</span>
            <span class="metric-value">${habitPercent}% <span class="unit">(${completedHabitCount}/${habits.length})</span></span>
            <span class="metric-sub">${habitPercent === 100 ? 'All completed!' : 'In progress'}</span>
          </div>
        </div>
      </div>

      <!-- Section D: Today's Scheduled Activity & Focus -->
      <div class="card mt-6">
        <div class="card-header-row border-b pb-3 mb-3">
          <div class="flex items-center gap-2">
            <i data-lucide="calendar" class="text-primary"></i>
            <h3 class="card-title text-base">Today's Schedule & Workout Focus</h3>
          </div>
          <span class="badge ${todayWorkoutDone ? 'badge-success' : 'badge-champagne'}">
            ${todayWorkoutDone ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="font-semibold text-lg text-primary">${todayPlan.plan}</h4>
            <p class="text-sm text-secondary mt-1">${todayPlan.description}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            ${todayPlan.resolvedWorkout ? `
              <button class="btn btn-sm btn-primary" onclick="WorkoutModule.openWorkoutSessionModal('${todayPlan.resolvedWorkout}')">
                <i data-lucide="play"></i> Start ${todayPlan.resolvedWorkout}
              </button>
            ` : `
              <button class="btn btn-sm btn-outline" onclick="WorkoutModule.openWorkoutSessionModal('Active Recovery')">
                <i data-lucide="check"></i> Mark Recovery Done
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Section B: Today's Holistic Progress Rings & Quick Checklist -->
      <div class="grid-2col gap-6 mt-6">
        <!-- Today's Status Badges -->
        <div class="card">
          <div class="card-header-row border-b pb-3 mb-4">
            <h3 class="card-title text-base">Today's Pillar Status</h3>
            <span class="text-xs text-secondary">${StorageManager.formatDateIndian(today)}</span>
          </div>

          <div class="pillar-status-list">
            <!-- Workout -->
            <div class="pillar-status-row">
              <div class="pillar-info">
                <div class="icon-circle ${todayWorkoutDone ? 'bg-success-light' : 'bg-neutral-light'}">
                  <i data-lucide="dumbbell" class="${todayWorkoutDone ? 'text-success' : 'text-secondary'}"></i>
                </div>
                <div>
                  <h4 class="font-medium text-sm">Workout Session</h4>
                  <span class="text-xs text-secondary">${todayWorkoutDone ? 'Completed for today' : todayPlan.plan}</span>
                </div>
              </div>
              <button class="btn btn-xs ${todayWorkoutDone ? 'btn-outline text-success' : 'btn-primary'}" onclick="WorkoutModule.openWorkoutSessionModal()">
                ${todayWorkoutDone ? 'Logged ✓' : 'Log'}
              </button>
            </div>

            <!-- Nutrition -->
            <div class="pillar-status-row">
              <div class="pillar-info">
                <div class="icon-circle ${totalProtein >= proteinTarget ? 'bg-success-light' : 'bg-neutral-light'}">
                  <i data-lucide="utensils" class="${totalProtein >= proteinTarget ? 'text-success' : 'text-secondary'}"></i>
                </div>
                <div>
                  <h4 class="font-medium text-sm">Protein Intake</h4>
                  <span class="text-xs text-secondary">${totalProtein}g / ${proteinTarget}g target (${totalCalories} kcal)</span>
                </div>
              </div>
              <button class="btn btn-xs btn-outline" onclick="App.navigateTo('nutrition')">
                View
              </button>
            </div>

            <!-- Hydration -->
            <div class="pillar-status-row">
              <div class="pillar-info">
                <div class="icon-circle ${waterCurrent >= waterTarget ? 'bg-success-light' : 'bg-neutral-light'}">
                  <i data-lucide="droplet" class="${waterCurrent >= waterTarget ? 'text-success' : 'text-secondary'}"></i>
                </div>
                <div>
                  <h4 class="font-medium text-sm">Hydration</h4>
                  <span class="text-xs text-secondary">${(waterCurrent/1000).toFixed(1)}L / ${(waterTarget/1000).toFixed(1)}L</span>
                </div>
              </div>
              <button class="btn btn-xs btn-outline" onclick="NutritionModule.adjustWater(250)">
                +250ml
              </button>
            </div>

            <!-- Skincare AM & PM -->
            <div class="pillar-status-row">
              <div class="pillar-info">
                <div class="icon-circle ${amSkincareDone && pmSkincareDone ? 'bg-success-light' : 'bg-neutral-light'}">
                  <i data-lucide="sparkles" class="${amSkincareDone && pmSkincareDone ? 'text-success' : 'text-secondary'}"></i>
                </div>
                <div>
                  <h4 class="font-medium text-sm">Skincare Regimen</h4>
                  <span class="text-xs text-secondary">AM: ${amSkincareDone ? 'Done ✓' : 'Pending'} • PM: ${pmSkincareDone ? 'Done ✓' : 'Pending'}</span>
                </div>
              </div>
              <button class="btn btn-xs btn-outline" onclick="App.navigateTo('skincare')">
                Check
              </button>
            </div>
          </div>
        </div>

        <!-- Interactive Quick Habit Checklist (Top Priority Daily Items) -->
        <div class="card">
          <div class="card-header-row border-b pb-3 mb-4">
            <div>
              <h3 class="card-title text-base">Quick Habit Checklist</h3>
              <p class="card-subtitle text-xs">Tap directly to toggle completion</p>
            </div>
            <button class="btn btn-xs btn-outline" onclick="App.navigateTo('habits')">
              All (${habits.length})
            </button>
          </div>

          <div class="habits-list-compact">
            ${habits.slice(0, 6).map(h => {
              const isChecked = !!habitMap[h.id];
              return `
                <label class="compact-habit-item">
                  <input type="checkbox" class="custom-checkbox" ${isChecked ? 'checked' : ''} onchange="DashboardModule.toggleQuickHabit('${h.id}', this.checked)">
                  <span class="compact-habit-name ${isChecked ? 'line-through text-secondary' : 'font-medium'}">${h.name}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Section C: Weight Trajectory Chart Preview -->
      <div class="card mt-6">
        <div class="card-header-row mb-3">
          <div>
            <h3 class="card-title">Weight Progression Trajectory</h3>
            <p class="card-subtitle">59.0 kg baseline to 65.0 kg 90-day target.</p>
          </div>
          <button class="btn btn-sm btn-outline" onclick="ProgressModule.openLogWeightModal()">
            <i data-lucide="plus"></i> Log Weigh-in
          </button>
        </div>
        <div class="chart-container" style="height: 240px;">
          <canvas id="dashboard-weight-canvas"></canvas>
        </div>
      </div>
    `;

    lucide.createIcons();
    this.renderDashboardWeightChart(weightLogs, startWeight, targetWeight);
  },

  getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  },

  formatFullDate(dateStr) {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  },

  dismissPwaBanner() {
    localStorage.setItem('comeback90_pwa_dismissed', 'true');
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
  },

  toggleQuickHabit(habitId, checked) {
    const today = StorageManager.getTodayDateString();
    StorageManager.toggleHabitStatus(today, habitId);
    if ('vibrate' in navigator) navigator.vibrate(25);
    App.showToast(checked ? 'Habit checked!' : 'Habit unchecked', 'info');
    App.refreshCurrentView();
  },

  renderDashboardWeightChart(logs, startWeight, targetWeight) {
    const canvas = document.getElementById('dashboard-weight-canvas');
    if (!canvas) return;

    const labels = logs.map(l => StorageManager.formatDateIndian(l.date).slice(0, 6));
    const dataPoints = logs.map(l => l.weight);
    const targetLine = logs.map(() => targetWeight);

    if (window.dashboardWeightChartInstance) {
      window.dashboardWeightChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    window.dashboardWeightChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Day 1'],
        datasets: [
          {
            label: 'Weight (kg)',
            data: dataPoints.length > 0 ? dataPoints : [startWeight],
            borderColor: '#244B3C',
            backgroundColor: 'rgba(36, 75, 60, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.25,
            pointBackgroundColor: '#244B3C',
            pointRadius: 4
          },
          {
            label: 'Target (65 kg)',
            data: targetLine.length > 0 ? targetLine : [targetWeight],
            borderColor: '#C7A878',
            borderWidth: 1.5,
            borderDash: [5, 4],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { family: 'Inter', size: 11 } } }
        },
        scales: {
          y: {
            min: Math.max(50, Math.floor(startWeight - 2)),
            max: Math.ceil(targetWeight + 3),
            grid: { color: '#E8E7DF' },
            ticks: { callback: v => v + ' kg', font: { family: 'Inter', size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 10 } }
          }
        }
      }
    });
  },

  openQuickActionMenu() {
    const modalHtml = `
      <div class="modal-backdrop" id="quick-action-modal">
        <div class="modal-sheet" style="max-width: 480px;">
          <div class="modal-header">
            <h3 class="modal-title">Quick Actions</h3>
            <button class="modal-close-btn" onclick="DashboardModule.closeModal()">&times;</button>
          </div>
          <div class="quick-menu-grid mt-2">
            <button class="quick-menu-card" onclick="DashboardModule.closeModal(); ProgressModule.openLogWeightModal();">
              <i data-lucide="scale" class="text-primary"></i>
              <div>
                <strong>Log Weight & Measurements</strong>
                <p class="text-xs text-secondary">Record today's morning weight</p>
              </div>
            </button>
            <button class="quick-menu-card" onclick="DashboardModule.closeModal(); WorkoutModule.openWorkoutSessionModal();">
              <i data-lucide="dumbbell" class="text-champagne-dark"></i>
              <div>
                <strong>Complete Workout</strong>
                <p class="text-xs text-secondary">Log reps, backpack load, and sets</p>
              </div>
            </button>
            <button class="quick-menu-card" onclick="DashboardModule.closeModal(); NutritionModule.openAddMealModal();">
              <i data-lucide="utensils" class="text-primary"></i>
              <div>
                <strong>Add Food / Meal</strong>
                <p class="text-xs text-secondary">Record meal calories & protein</p>
              </div>
            </button>
            <button class="quick-menu-card" onclick="DashboardModule.closeModal(); NutritionModule.adjustWater(250);">
              <i data-lucide="droplet" class="text-secondary-sage"></i>
              <div>
                <strong>+250ml Water</strong>
                <p class="text-xs text-secondary">Quick hydration increment</p>
              </div>
            </button>
            <button class="quick-menu-card" onclick="DashboardModule.closeModal(); ProgressModule.openPhotoUploadModal();">
              <i data-lucide="camera" class="text-primary"></i>
              <div>
                <strong>Progress Photo</strong>
                <p class="text-xs text-secondary">Save private on-device photo</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('quick-action-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  closeModal() {
    const m = document.getElementById('quick-action-modal');
    if (m) m.remove();
  }
};

