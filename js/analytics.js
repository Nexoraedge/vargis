/**
 * Vergis - Analytics & Insights Module
 * Multi-dimensional progress visualization, weekly retrospectives, and consistency metrics.
 */

const AnalyticsModule = {
  charts: {},

  render(container) {
    const weightLogs = StorageManager.getWeightLogs();
    const workoutLogs = StorageManager.getWorkoutLogs();
    const nutritionLogs = StorageManager.getAllNutritionLogs();
    const dailyLogs = StorageManager.getDailyLogs();
    const habits = StorageManager.getHabits();
    const profile = StorageManager.getProfile();
    const settings = StorageManager.getSettings();

    // Weekly summary calculations (last 7 days)
    const weeklyStats = this.calculateWeeklyStats(workoutLogs, weightLogs, nutritionLogs, dailyLogs, habits);

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">Analytics & Metrics</span>
            <h1 class="page-title">Insights & Consistency</h1>
            <p class="page-subtitle">Honest feedback loops driven by your real LocalStorage data.</p>
          </div>
        </div>
      </div>

      <!-- Weekly Retrospective Highlights Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="dumbbell" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Workouts This Week</span>
            <span class="metric-value">${weeklyStats.workoutsCount} <span class="unit">/ 4</span></span>
            <span class="metric-sub">${weeklyStats.workoutsCount >= 4 ? 'Target achieved!' : `${4 - weeklyStats.workoutsCount} needed`}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-champagne-light">
            <i data-lucide="scale" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">7-Day Avg Weight</span>
            <span class="metric-value">${weeklyStats.avgWeight ? weeklyStats.avgWeight.toFixed(1) : '59.0'} <span class="unit">kg</span></span>
            <span class="metric-sub">Target: steady +0.3 kg/wk</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="target" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Avg Daily Protein</span>
            <span class="metric-value">${weeklyStats.avgProtein ? Math.round(weeklyStats.avgProtein) : 0} <span class="unit">/ ${settings.proteinTarget || 85} g</span></span>
            <span class="metric-sub">${weeklyStats.avgProtein >= (settings.proteinTarget || 85) ? 'Meeting target!' : 'Increase soy/milk/chana'}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-champagne-light">
            <i data-lucide="award" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Push-up PR</span>
            <span class="metric-value">${profile.pushupPR || 48} <span class="unit">reps</span></span>
            <span class="metric-sub">Consecutive strict form</span>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid-2col gap-6 mt-6">
        <!-- Protein Daily Chart -->
        <div class="card">
          <div class="card-header-row mb-4">
            <div>
              <h3 class="card-title text-base">Protein Adherence (Last 14 Days)</h3>
              <p class="card-subtitle text-xs">Target: 75–90g daily range</p>
            </div>
          </div>
          <div class="chart-container" style="height: 220px;">
            <canvas id="chart-protein"></canvas>
          </div>
        </div>

        <!-- Workout Consistency Bar Chart -->
        <div class="card">
          <div class="card-header-row mb-4">
            <div>
              <h3 class="card-title text-base">Weekly Workout Volume</h3>
              <p class="card-subtitle text-xs">Target: 4 strength sessions / week + Sunday sports</p>
            </div>
          </div>
          <div class="chart-container" style="height: 220px;">
            <canvas id="chart-workouts"></canvas>
          </div>
        </div>

        <!-- Push-up Progression Chart -->
        <div class="card">
          <div class="card-header-row mb-4">
            <div>
              <h3 class="card-title text-base">Push-up Reps Progression</h3>
              <p class="card-subtitle text-xs">Tracking upper body endurance</p>
            </div>
          </div>
          <div class="chart-container" style="height: 220px;">
            <canvas id="chart-pushups"></canvas>
          </div>
        </div>

        <!-- Habit Completion Rate Chart -->
        <div class="card">
          <div class="card-header-row mb-4">
            <div>
              <h3 class="card-title text-base">Habit Completion Trend</h3>
              <p class="card-subtitle text-xs">% of daily habits checked</p>
            </div>
          </div>
          <div class="chart-container" style="height: 220px;">
            <canvas id="chart-habits"></canvas>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    this.initCharts(nutritionLogs, workoutLogs, dailyLogs, habits, settings, profile);
  },

  calculateWeeklyStats(workoutLogs, weightLogs, nutritionLogs, dailyLogs, habits) {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Workouts this week
    const recentWorkouts = workoutLogs.filter(w => new Date(w.date + 'T00:00:00') >= sevenDaysAgo);

    // Recent weights
    const recentWeights = weightLogs.filter(w => new Date(w.date + 'T00:00:00') >= sevenDaysAgo);
    const avgWeight = recentWeights.length > 0
      ? recentWeights.reduce((s, w) => s + w.weight, 0) / recentWeights.length
      : null;

    // Recent daily proteins
    const proteinByDate = {};
    nutritionLogs.forEach(n => {
      if (new Date(n.date + 'T00:00:00') >= sevenDaysAgo) {
        proteinByDate[n.date] = (proteinByDate[n.date] || 0) + (n.protein || 0);
      }
    });
    const proteinVals = Object.values(proteinByDate);
    const avgProtein = proteinVals.length > 0
      ? proteinVals.reduce((s, p) => s + p, 0) / proteinVals.length
      : 0;

    return {
      workoutsCount: recentWorkouts.length,
      avgWeight,
      avgProtein
    };
  },

  initCharts(nutritionLogs, workoutLogs, dailyLogs, habits, settings, profile) {
    // Destroy previous charts
    Object.keys(this.charts).forEach(k => {
      if (this.charts[k]) this.charts[k].destroy();
    });

    const last14Days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      last14Days.push(`${y}-${m}-${day}`);
    }

    // 1. Protein Chart
    const proteinCanvas = document.getElementById('chart-protein');
    if (proteinCanvas) {
      const proteinData = last14Days.map(dateStr => {
        const items = nutritionLogs.filter(n => n.date === dateStr);
        return items.reduce((s, i) => s + (i.protein || 0), 0);
      });
      const targetData = last14Days.map(() => settings.proteinTarget || 85);

      this.charts.protein = new Chart(proteinCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: last14Days.map(d => StorageManager.formatDateIndian(d).slice(0, 6)),
          datasets: [
            {
              label: 'Protein (g)',
              data: proteinData,
              backgroundColor: '#244B3C',
              borderRadius: 4
            },
            {
              type: 'line',
              label: 'Target (85g)',
              data: targetData,
              borderColor: '#C7A878',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { boxWidth: 10, font: { family: 'Inter', size: 10 } } } },
          scales: {
            y: { beginAtZero: true, max: 120, grid: { color: '#E8E7DF' } },
            x: { grid: { display: false }, ticks: { font: { size: 9 } } }
          }
        }
      });
    }

    // 2. Workout Consistency Chart (Last 4 weeks)
    const workoutsCanvas = document.getElementById('chart-workouts');
    if (workoutsCanvas) {
      const weekLabels = ['3 Wks Ago', '2 Wks Ago', 'Last Week', 'This Week'];
      const weekCounts = [0, 0, 0, 0];

      workoutLogs.forEach(w => {
        const wDate = new Date(w.date + 'T00:00:00');
        const diffDays = Math.floor((today - wDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) weekCounts[3]++;
        else if (diffDays <= 14) weekCounts[2]++;
        else if (diffDays <= 21) weekCounts[1]++;
        else if (diffDays <= 28) weekCounts[0]++;
      });

      this.charts.workouts = new Chart(workoutsCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: weekLabels,
          datasets: [{
            label: 'Sessions Completed',
            data: weekCounts,
            backgroundColor: '#A6B49A',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 }, grid: { color: '#E8E7DF' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 3. Push-up Progression Chart
    const pushupCanvas = document.getElementById('chart-pushups');
    if (pushupCanvas) {
      const pushupEntries = workoutLogs.filter(w => w.pushupsCompleted > 0);
      const labels = pushupEntries.length > 0 ? pushupEntries.map(w => StorageManager.formatDateIndian(w.date).slice(0, 6)) : ['Baseline'];
      const data = pushupEntries.length > 0 ? pushupEntries.map(w => w.pushupsCompleted) : [profile.pushupPR || 48];

      this.charts.pushups = new Chart(pushupCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Push-up Reps',
            data,
            borderColor: '#C7A878',
            backgroundColor: 'rgba(199, 168, 120, 0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#C7A878',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 30, max: 70, grid: { color: '#E8E7DF' } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
          }
        }
      });
    }

    // 4. Habit Completion Trend (Last 14 days)
    const habitCanvas = document.getElementById('chart-habits');
    if (habitCanvas) {
      const activeHabits = habits.filter(h => h.active !== false);
      const habitPercentages = last14Days.map(dateStr => {
        const log = dailyLogs[dateStr];
        if (!log || !log.habits || activeHabits.length === 0) return 0;
        const done = activeHabits.filter(h => log.habits[h.id]).length;
        return Math.round((done / activeHabits.length) * 100);
      });

      this.charts.habits = new Chart(habitCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: last14Days.map(d => StorageManager.formatDateIndian(d).slice(0, 6)),
          datasets: [{
            label: 'Habit Adherence (%)',
            data: habitPercentages,
            borderColor: '#244B3C',
            borderWidth: 2,
            tension: 0.25,
            pointBackgroundColor: '#244B3C',
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' }, grid: { color: '#E8E7DF' } },
            x: { grid: { display: false }, ticks: { font: { size: 9 } } }
          }
        }
      });
    }
  }
};

