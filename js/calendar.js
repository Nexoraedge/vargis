/**
 * Comeback 90 - 90-Day Journey Calendar Module
 * Interactive 90-day grid with milestone markers (Day 1, 30, 60, 90) and day detail inspections.
 */

const CalendarModule = {
  render(container) {
    const profile = StorageManager.getProfile();
    const startDateStr = profile.startDate || StorageManager.getTodayDateString();
    const prog = StorageManager.calculateDay(startDateStr);
    const dailyLogs = StorageManager.getDailyLogs();
    const workoutLogs = StorageManager.getWorkoutLogs();
    const weightLogs = StorageManager.getWeightLogs();
    const nutritionLogs = StorageManager.getAllNutritionLogs();

    const days = [];
    const start = new Date(startDateStr + 'T00:00:00');

    for (let dayNum = 1; dayNum <= 90; dayNum++) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + (dayNum - 1));

      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const isToday = dateStr === StorageManager.getTodayDateString();
      const isPast = dayNum < prog.currentDay;
      const isFuture = dayNum > prog.currentDay;
      const isMilestone = [1, 30, 60, 90].includes(dayNum);

      // Status check
      const dLog = dailyLogs[dateStr] || {};
      const wLog = workoutLogs.find(w => w.date === dateStr);
      const wtLog = weightLogs.find(wt => wt.date === dateStr);
      const nutList = nutritionLogs.filter(n => n.date === dateStr);
      const proteinTotal = nutList.reduce((s, i) => s + (i.protein || 0), 0);

      let statusType = 'future';
      if (isPast || isToday) {
        if (wLog || dLog.workoutCompleted) {
          statusType = 'workout';
        } else if (dLog.habits && Object.values(dLog.habits).some(v => v === true)) {
          statusType = 'active';
        } else if (isPast) {
          statusType = 'missed';
        } else {
          statusType = 'today';
        }
      }

      days.push({
        dayNum,
        dateStr,
        dayDate,
        isToday,
        isPast,
        isFuture,
        isMilestone,
        statusType,
        workout: wLog,
        weight: wtLog,
        proteinTotal,
        dailyLog: dLog
      });
    }

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">90-Day Visual Journey</span>
            <h1 class="page-title">Transformation Calendar</h1>
            <p class="page-subtitle">Currently on Day ${prog.currentDay} of 90. Click any day to view details.</p>
          </div>
          <div class="calendar-legend flex flex-wrap gap-3">
            <span class="legend-item"><span class="legend-dot bg-primary"></span> Workout</span>
            <span class="legend-item"><span class="legend-dot bg-sage"></span> Active / Rest</span>
            <span class="legend-item"><span class="legend-dot bg-champagne"></span> Milestone</span>
            <span class="legend-item"><span class="legend-dot bg-neutral"></span> Future</span>
          </div>
        </div>
      </div>

      <!-- Milestone Progress Banner -->
      <div class="card mb-6">
        <div class="card-header-row mb-3">
          <h4 class="font-semibold text-sm">Key Programme Checkpoints</h4>
          <span class="badge badge-sage">Day ${prog.currentDay} / 90</span>
        </div>
        <div class="milestones-row">
          <div class="milestone-step ${prog.currentDay >= 1 ? 'reached' : ''}">
            <div class="step-circle">D1</div>
            <span class="step-title">Day 1: Baseline</span>
            <span class="step-sub">Weigh-in & PR test</span>
          </div>
          <div class="milestone-line ${prog.currentDay >= 30 ? 'fill' : ''}"></div>
          <div class="milestone-step ${prog.currentDay >= 30 ? 'reached' : ''}">
            <div class="step-circle">D30</div>
            <span class="step-title">Day 30: Review 1</span>
            <span class="step-sub">Weight + Circumference</span>
          </div>
          <div class="milestone-line ${prog.currentDay >= 60 ? 'fill' : ''}"></div>
          <div class="milestone-step ${prog.currentDay >= 60 ? 'reached' : ''}">
            <div class="step-circle">D60</div>
            <span class="step-title">Day 60: Review 2</span>
            <span class="step-sub">Progression Overload</span>
          </div>
          <div class="milestone-line ${prog.currentDay >= 90 ? 'fill' : ''}"></div>
          <div class="milestone-step ${prog.currentDay >= 90 ? 'reached' : ''}">
            <div class="step-circle">D90</div>
            <span class="step-title">Day 90: Finale</span>
            <span class="step-sub">Target: 62–65 kg</span>
          </div>
        </div>
      </div>

      <!-- 90-Day Visual Grid -->
      <div class="card">
        <div class="card-header-row mb-4">
          <div>
            <h3 class="card-title">90-Day Transformation Matrix</h3>
            <p class="card-subtitle">Started ${StorageManager.formatDateIndian(startDateStr)}</p>
          </div>
        </div>

        <div class="journey-grid">
          ${days.map(d => {
            let badgeClass = 'grid-day-future';
            if (d.isToday) badgeClass = 'grid-day-today';
            else if (d.statusType === 'workout') badgeClass = 'grid-day-workout';
            else if (d.statusType === 'active') badgeClass = 'grid-day-active';
            else if (d.statusType === 'missed') badgeClass = 'grid-day-missed';

            return `
              <div class="grid-day-cell ${badgeClass} ${d.isMilestone ? 'milestone-cell' : ''}" onclick="CalendarModule.openDayDetailModal(${d.dayNum}, '${d.dateStr}')">
                <span class="grid-day-num">D${d.dayNum}</span>
                <span class="grid-day-date">${d.dayDate.getDate()} ${d.dayDate.toLocaleDateString('en-IN', { month: 'short' })}</span>
                ${d.isMilestone ? `<span class="milestone-star">★</span>` : ''}
                ${d.statusType === 'workout' ? `<span class="grid-cell-dot"></span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  openDayDetailModal(dayNum, dateStr) {
    const dailyLog = StorageManager.getDailyLog(dateStr);
    const workoutLogs = StorageManager.getWorkoutLogs().filter(w => w.date === dateStr);
    const weightLog = StorageManager.getWeightLogs().find(w => w.date === dateStr);
    const nutritionLogs = StorageManager.getNutritionLogs(dateStr);
    const habits = StorageManager.getHabits();
    const completedHabits = habits.filter(h => dailyLog.habits && dailyLog.habits[h.id]);

    const totalProtein = nutritionLogs.reduce((s, i) => s + (i.protein || 0), 0);
    const totalCals = nutritionLogs.reduce((s, i) => s + (i.calories || 0), 0);

    const isMilestone = [1, 30, 60, 90].includes(dayNum);

    const modalHtml = `
      <div class="modal-backdrop" id="day-detail-modal">
        <div class="modal-sheet" style="max-width: 540px;">
          <div class="modal-header">
            <div>
              <span class="badge ${isMilestone ? 'badge-champagne' : 'badge-sage'}">Day ${dayNum} of 90</span>
              <h3 class="modal-title mt-1">${StorageManager.formatDateIndian(dateStr)}</h3>
            </div>
            <button class="modal-close-btn" onclick="CalendarModule.closeModal()">&times;</button>
          </div>

          <div class="day-detail-content">
            <!-- Workout summary -->
            <div class="detail-section">
              <h4 class="detail-title"><i data-lucide="dumbbell"></i> Workout</h4>
              ${workoutLogs.length > 0 ? `
                <div class="detail-box">
                  <strong>${workoutLogs[0].workoutType}</strong> (${workoutLogs[0].durationMinutes} mins)
                  ${workoutLogs[0].pushupsCompleted ? `<div class="text-sm">Push-ups: <strong>${workoutLogs[0].pushupsCompleted}</strong> reps</div>` : ''}
                  ${workoutLogs[0].notes ? `<p class="text-xs text-secondary mt-1">${workoutLogs[0].notes}</p>` : ''}
                </div>
              ` : `
                <p class="text-secondary text-sm">No workout recorded for this day.</p>
              `}
            </div>

            <!-- Nutrition summary -->
            <div class="detail-section mt-4">
              <h4 class="detail-title"><i data-lucide="utensils"></i> Nutrition & Water</h4>
              <div class="detail-box">
                <div class="flex justify-between text-sm">
                  <span>Protein Logged: <strong>${totalProtein} g</strong></span>
                  <span>Calories: <strong>${Math.round(totalCals)} kcal</strong></span>
                </div>
                <div class="text-xs text-secondary mt-1">Water: ${((dailyLog.waterMl || 0) / 1000).toFixed(1)} L</div>
                ${nutritionLogs.length > 0 ? `
                  <ul class="text-xs text-secondary mt-2 pl-4 list-disc">
                    ${nutritionLogs.map(n => `<li>${n.name} (${n.protein}g pro)</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            </div>

            <!-- Habits summary -->
            <div class="detail-section mt-4">
              <h4 class="detail-title"><i data-lucide="check-circle"></i> Habits (${completedHabits.length}/${habits.length})</h4>
              ${completedHabits.length > 0 ? `
                <div class="tags-cloud mt-2">
                  ${completedHabits.map(h => `<span class="badge badge-sage">${h.name}</span>`).join('')}
                </div>
              ` : `
                <p class="text-secondary text-sm">No habits checked on this day.</p>
              `}
            </div>

            <!-- Weight summary -->
            ${weightLog ? `
              <div class="detail-section mt-4">
                <h4 class="detail-title"><i data-lucide="scale"></i> Weight Logged</h4>
                <div class="detail-box">
                  <span class="font-bold text-primary">${weightLog.weight.toFixed(1)} kg</span>
                  ${weightLog.waist ? ` • Waist: ${weightLog.waist}cm` : ''}
                  ${weightLog.chest ? ` • Chest: ${weightLog.chest}cm` : ''}
                </div>
              </div>
            ` : ''}
          </div>

          <div class="modal-footer mt-4">
            <button type="button" class="btn btn-primary" onclick="CalendarModule.closeModal()">Close</button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('day-detail-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  closeModal() {
    const m = document.getElementById('day-detail-modal');
    if (m) m.remove();
  }
};
