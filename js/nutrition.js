/**
 * Vergis - Vegetarian Nutrition Module
 * Clean, lean-bulking Indian vegetarian nutrition tracker with Desk Snacks and Water.
 */

const NutritionModule = {
  // Common Indian vegetarian food database (per typical serving)
  foodDatabase: [
    { name: 'Cow Milk (Toned)', serving: '250 ml glass', protein: 8.0, calories: 150, category: 'Dairy' },
    { name: 'Cow Milk (Toned)', serving: '500 ml', protein: 16.0, calories: 300, category: 'Dairy' },
    { name: 'Paneer (Raw/Sauteed)', serving: '100 g', protein: 18.0, calories: 265, category: 'Dairy' },
    { name: 'Curd / Plain Dahi', serving: '1 bowl (150 g)', protein: 5.0, calories: 95, category: 'Dairy' },
    { name: 'Soy Chunks (Nutrela, dry wt)', serving: '50 g (cooked expands 3x)', protein: 26.0, calories: 172, category: 'Legume' },
    { name: 'Yellow / Toor / Moong Dal', serving: '1 medium bowl (150 g cooked)', protein: 8.5, calories: 140, category: 'Legume' },
    { name: 'Whole Wheat Roti / Chapati', serving: '1 medium roti (no ghee)', protein: 3.2, calories: 85, category: 'Grain' },
    { name: 'Steamed Rice (White/Brown)', serving: '1 medium bowl (150 g cooked)', protein: 4.0, calories: 195, category: 'Grain' },
    { name: 'Rolled Oats', serving: '45 g dry', protein: 5.5, calories: 175, category: 'Grain' },
    { name: 'Chana Sattu (Roasted Gram Flour)', serving: '30 g (2 tbsp in water)', protein: 6.5, calories: 120, category: 'Grain' },
    { name: 'Roasted Chana (Desk Snack)', serving: 'Handful (50 g)', protein: 9.5, calories: 185, category: 'Snack' },
    { name: 'Roasted Peanuts', serving: '30 g (small palmful)', protein: 7.8, calories: 170, category: 'Nuts' },
    { name: 'Almonds & Walnuts', serving: '20 g mixed', protein: 4.2, calories: 130, category: 'Nuts' },
    { name: 'Peanut Butter (Unsweetened)', serving: '1 tbsp (16 g)', protein: 4.0, calories: 95, category: 'Nuts' },
    { name: 'Banana', serving: '1 medium (110 g)', protein: 1.3, calories: 105, category: 'Fruit' },
    { name: 'Mixed Seasonal Sabzi', serving: '1 bowl (150 g)', protein: 2.5, calories: 80, category: 'Veg' }
  ],

  // Structured preloaded daily blueprint
  mealBlueprints: [
    {
      type: 'Breakfast',
      timing: '7:00 – 8:00 AM',
      name: 'High-Protein Bulking Shake & Oats',
      items: '500 ml milk, 2 bananas, 45 g oats, 25 g peanuts',
      estProtein: 31,
      estCalories: 680,
      description: 'Quick liquid calories & clean complex carbs to start muscle protein synthesis.'
    },
    {
      type: 'Lunch',
      timing: '2:00 – 3:00 PM',
      name: 'Traditional Indian Wholesome Thali',
      items: '3 rotis, 1 large bowl dal, seasonal sabzi, 100 g curd',
      estProtein: 21,
      estCalories: 560,
      description: 'Balanced amino acids combining wheat gluten and legume proteins.'
    },
    {
      type: 'Evening Snack',
      timing: '5:00 PM',
      name: 'High-Fiber Desk Energy Snack',
      items: '50 g roasted chana, 1 banana, 20 g peanuts',
      estProtein: 15,
      estCalories: 380,
      description: 'Pre-workout sustained energy release and steady blood sugar.'
    },
    {
      type: 'Dinner',
      timing: '8:00 PM',
      name: 'Muscle Recovery Power Dinner',
      items: '50 g soy chunks (or 100 g paneer), 3 rotis / rice, sabzi, curd',
      estProtein: 30,
      estCalories: 610,
      description: 'Massive protein spike to stimulate overnight muscular recovery.'
    },
    {
      type: 'Optional Late Snack',
      timing: '10:00 PM',
      name: 'Casein Sleep Booster',
      items: '250 ml warm milk',
      estProtein: 8,
      estCalories: 150,
      description: 'Slow-digesting casein protein before overnight fasting.'
    }
  ],

  // Desk Snacks for coding and study sessions
  deskSnacks: [
    { name: 'Roasted Chana', qty: '50 g handful', protein: 9.5, cals: 185, benefit: 'High crunch, zero grease, pure lean protein' },
    { name: 'Roasted Salted Peanuts', qty: '30 g', protein: 7.8, cals: 170, benefit: 'Healthy monounsaturated fats & dense calories' },
    { name: 'Sattu Namkeen Water', qty: '300 ml glass (30 g sattu)', protein: 6.5, cals: 120, benefit: 'Instant hydration, cooling & plant protein' },
    { name: 'Raw Almonds & Walnuts', qty: '15 nuts (20 g)', protein: 4.2, cals: 130, benefit: 'Omega-3 fatty acids for cognitive focus' },
    { name: 'Banana + Peanut Butter', qty: '1 banana + 1 tbsp PB', protein: 5.3, cals: 200, benefit: 'Clean potassium & sweet craving satisfier' }
  ],

  render(container) {
    const today = StorageManager.getTodayDateString();
    const todayLogs = StorageManager.getNutritionLogs(today);
    const dailyLog = StorageManager.getDailyLog(today);
    const settings = StorageManager.getSettings();

    const currentProtein = todayLogs.reduce((sum, item) => sum + (item.protein || 0), 0);
    const currentCalories = todayLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
    const currentWater = dailyLog.waterMl || 0;

    const targetProtein = settings.proteinTarget || 85;
    const targetCalories = settings.calorieTarget || 2400;
    const targetWater = settings.waterTarget || 2500;

    const proteinPct = Math.min(100, Math.round((currentProtein / targetProtein) * 100));
    const caloriePct = Math.min(100, Math.round((currentCalories / targetCalories) * 100));
    const waterPct = Math.min(100, Math.round((currentWater / targetWater) * 100));

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">Vegetarian Lean Bulking</span>
            <h1 class="page-title">Nutrition & Hydration</h1>
            <p class="page-subtitle">Target: 75–90g protein daily with affordable, clean Indian staples.</p>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline" onclick="NutritionModule.openFoodLibraryModal()">
              <i data-lucide="book-open"></i> Food Database
            </button>
            <button class="btn btn-primary" onclick="NutritionModule.openAddMealModal()">
              <i data-lucide="plus"></i> Custom Food
            </button>
          </div>
        </div>
      </div>

      <!-- Macro Target Progress Meters -->
      <div class="metrics-grid">
        <!-- Protein Card -->
        <div class="metric-card">
          <div class="metric-header-row">
            <span class="metric-label">Daily Protein</span>
            <span class="badge ${currentProtein >= targetProtein ? 'badge-success' : 'badge-sage'}">${proteinPct}%</span>
          </div>
          <div class="metric-value">
            ${Math.round(currentProtein * 10) / 10} <span class="unit">/ ${targetProtein} g</span>
          </div>
          <div class="progress-bar-bg mt-2">
            <div class="progress-bar-fill" style="width: ${proteinPct}%; background-color: var(--primary);"></div>
          </div>
          <span class="metric-sub">${currentProtein >= targetProtein ? 'Target met! Great recovery support.' : `${Math.round((targetProtein - currentProtein) * 10) / 10}g needed today`}</span>
        </div>

        <!-- Calories Card -->
        <div class="metric-card">
          <div class="metric-header-row">
            <span class="metric-label">Estimated Calories</span>
            <span class="badge badge-champagne">${caloriePct}%</span>
          </div>
          <div class="metric-value">
            ${Math.round(currentCalories)} <span class="unit">/ ${targetCalories} kcal</span>
          </div>
          <div class="progress-bar-bg mt-2">
            <div class="progress-bar-fill" style="width: ${caloriePct}%; background-color: var(--champagne-dark);"></div>
          </div>
          <span class="metric-sub">Bulking surplus target: +200-300 kcal</span>
        </div>

        <!-- Water Card -->
        <div class="metric-card">
          <div class="metric-header-row">
            <span class="metric-label">Hydration</span>
            <span class="badge badge-sage">${waterPct}%</span>
          </div>
          <div class="metric-value">
            ${(currentWater / 1000).toFixed(1)} <span class="unit">/ ${(targetWater / 1000).toFixed(1)} L</span>
          </div>
          <div class="progress-bar-bg mt-2">
            <div class="progress-bar-fill" style="width: ${waterPct}%; background-color: var(--secondary-sage);"></div>
          </div>
          <div class="water-quick-buttons mt-3">
            <button class="btn btn-xs btn-outline" onclick="NutritionModule.adjustWater(250)">+250ml</button>
            <button class="btn btn-xs btn-outline" onclick="NutritionModule.adjustWater(500)">+500ml</button>
            <button class="btn btn-xs btn-outline" onclick="NutritionModule.adjustWater(-250)">-250ml</button>
          </div>
        </div>
      </div>

      <!-- Indian Nutrition Disclaimer -->
      <div class="info-callout mt-4 mb-4">
        <i data-lucide="info" class="callout-icon"></i>
        <div class="callout-text">
          <strong>Nutritional Estimates:</strong> Values are based on standard Indian Food Composition Tables (ICMR-NIN). Variations occur with specific brands, cooking methods, and dal thickness. This is an educational tracking guide, not strict medical dietetics.
        </div>
      </div>

      <!-- Preloaded Indian Vegetarian Meal Structure -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Preloaded Indian Meal Blueprint</h3>
            <p class="card-subtitle">Designed for ₹1,000–₹2,000 monthly budget. One-click log into your daily ledger.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="NutritionModule.logFullDayBlueprint()" title="Log all 4 staple daily meals at once">
            <i data-lucide="zap"></i> 1-Tap Log Full Day (~82g P)
          </button>
        </div>

        <div class="meal-blueprint-grid mt-4">
          ${this.mealBlueprints.map(mb => `
            <div class="blueprint-card">
              <div class="blueprint-header">
                <div>
                  <span class="blueprint-timing">${mb.timing}</span>
                  <h4 class="blueprint-title">${mb.type}: ${mb.name}</h4>
                </div>
                <div class="blueprint-badge">${mb.estProtein}g Protein</div>
              </div>
              <p class="blueprint-items">${mb.items}</p>
              <div class="blueprint-footer">
                <span class="text-xs text-secondary">~${mb.estCalories} kcal • ${mb.description}</span>
                <button class="btn btn-sm btn-outline" onclick="NutritionModule.quickLogBlueprint('${mb.type}', '${mb.name.replace(/'/g, "\\'")}', ${mb.estCalories}, ${mb.estProtein}, '${mb.items.replace(/'/g, "\\'")}')">
                  <i data-lucide="check"></i> Log Meal
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Desk Snacks Section (Coding/Working Friendly) -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Dedicated Desk Snacks</h3>
            <p class="card-subtitle">High-protein, mess-free finger foods to eat while coding or studying at your computer.</p>
          </div>
          <span class="badge badge-champagne"><i data-lucide="laptop" style="width:14px; height:14px; margin-right:4px;"></i> Focus Fuel</span>
        </div>

        <div class="desk-snacks-grid mt-4">
          ${this.deskSnacks.map(snack => `
            <div class="snack-card">
              <div class="snack-top">
                <h4 class="snack-name">${snack.name}</h4>
                <span class="snack-protein">+${snack.protein}g protein</span>
              </div>
              <p class="snack-qty text-sm text-secondary">${snack.qty} • ~${snack.cals} kcal</p>
              <p class="snack-benefit text-xs">${snack.benefit}</p>
              <button class="btn btn-xs btn-primary mt-3 w-full" onclick="NutritionModule.quickLogFood('${snack.name}', ${snack.cals}, ${snack.protein}, '${snack.qty}', 'Evening Snack')">
                <i data-lucide="plus"></i> Add to Today
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Today's Logged Meals Ledger -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Today's Meal Ledger</h3>
            <p class="card-subtitle">${todayLogs.length} items logged for ${StorageManager.formatDateIndian(today)}.</p>
          </div>
          <button class="btn btn-sm btn-outline" onclick="NutritionModule.openAddMealModal()">
            <i data-lucide="plus"></i> Add Custom
          </button>
        </div>

        <div class="table-container mt-4">
          ${this.renderTodayMealTable(todayLogs)}
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  renderTodayMealTable(logs) {
    if (!logs || logs.length === 0) {
      return `
        <div class="empty-state">
          <i data-lucide="utensils" class="empty-state-icon"></i>
          <p class="empty-state-text">No meals logged yet today. Use the blueprint or quick desk snacks above!</p>
        </div>
      `;
    }

    return `
      <!-- Desktop Table View -->
      <div class="desktop-table-view">
        <table class="data-table">
          <thead>
            <tr>
              <th>Time / Slot</th>
              <th>Meal Item</th>
              <th>Est. Protein</th>
              <th>Est. Calories</th>
              <th>Notes</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td>
                  <span class="text-xs text-secondary">${log.time}</span><br>
                  <span class="badge badge-sage">${log.mealType}</span>
                </td>
                <td><strong>${log.name}</strong> ${log.quantity ? `<span class="text-secondary text-sm">(${log.quantity})</span>` : ''}</td>
                <td><span class="font-semibold text-primary">${log.protein}g</span></td>
                <td>${log.calories} kcal</td>
                <td class="text-secondary text-sm">${log.notes || '—'}</td>
                <td class="text-right">
                  <button class="btn-icon text-error" onclick="NutritionModule.deleteFoodEntry('${log.id}')" title="Delete">
                    <i data-lucide="trash-2"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Card List View -->
      <div class="mobile-card-list">
        ${logs.map(log => `
          <div class="mobile-log-card">
            <div class="mobile-log-header">
              <div class="flex items-center gap-2">
                <span class="badge badge-sage">${log.mealType}</span>
                <span class="text-xs text-secondary">${log.time}</span>
              </div>
              <button class="btn-icon text-error" onclick="NutritionModule.deleteFoodEntry('${log.id}')" title="Delete">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
            <div class="mobile-meal-main">
              <span class="font-semibold text-sm text-main">${log.name}</span>
              ${log.quantity ? `<span class="text-xs text-secondary ml-1">(${log.quantity})</span>` : ''}
            </div>
            <div class="mobile-meal-footer mt-2">
              <div class="flex items-center gap-2">
                <span class="badge badge-primary font-semibold">+${log.protein}g protein</span>
                <span class="badge badge-neutral">${log.calories} kcal</span>
              </div>
              ${log.notes ? `<span class="text-xs text-secondary mt-1 block">${log.notes}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  adjustWater(deltaMl) {
    const today = StorageManager.getTodayDateString();
    const daily = StorageManager.getDailyLog(today);
    const newTotal = Math.max(0, (daily.waterMl || 0) + deltaMl);
    daily.waterMl = newTotal;

    const settings = StorageManager.getSettings();
    if (newTotal >= (settings.waterTarget || 2500)) {
      if (daily.habits) daily.habits['h_water'] = true;
    }
    StorageManager.saveDailyLog(today, daily);
    if ('vibrate' in navigator) navigator.vibrate(25);
    App.showToast(`Water updated: ${(newTotal / 1000).toFixed(2)} Litres`, 'info');
    App.refreshCurrentView();
  },

  logFullDayBlueprint() {
    const today = StorageManager.getTodayDateString();
    const existing = StorageManager.getNutritionLogs(today);
    if (existing && existing.length > 0) {
      if (!confirm(`You already have ${existing.length} meal(s) logged today. Do you want to log the full day blueprint (~82g protein)?`)) {
        return;
      }
    }

    const coreMeals = this.mealBlueprints.filter(mb => mb.type !== 'Optional Late Snack');
    let totalP = 0;
    coreMeals.forEach(meal => {
      StorageManager.addNutritionLog({
        date: today,
        mealType: meal.type,
        name: meal.name,
        calories: meal.estCalories,
        protein: meal.estProtein,
        quantity: meal.items,
        notes: 'Full day blueprint 1-tap log'
      });
      totalP += meal.estProtein;
    });

    if ('vibrate' in navigator) navigator.vibrate([40, 60, 40]);
    App.showToast(`⚡ Full day blueprint logged: +${totalP}g protein!`, 'success');
    App.refreshCurrentView();
  },

  quickLogBlueprint(mealType, name, calories, protein, items) {
    const today = StorageManager.getTodayDateString();
    StorageManager.addNutritionLog({
      date: today,
      mealType,
      name,
      calories,
      protein,
      quantity: items,
      notes: 'Preloaded blueprint log'
    });
    if ('vibrate' in navigator) navigator.vibrate([25, 40]);
    App.showToast(`Logged ${mealType}: +${protein}g protein`, 'success');
    App.refreshCurrentView();
  },

  quickLogFood(name, calories, protein, quantity, mealType = 'Snack') {
    const today = StorageManager.getTodayDateString();
    StorageManager.addNutritionLog({
      date: today,
      mealType,
      name,
      calories,
      protein,
      quantity,
      notes: 'Quick desk snack'
    });
    if ('vibrate' in navigator) navigator.vibrate([25, 40]);
    App.showToast(`Added ${name}: +${protein}g protein`, 'success');
    App.refreshCurrentView();
  },

  deleteFoodEntry(id) {
    StorageManager.deleteNutritionLog(id);
    App.showToast('Meal entry removed.', 'info');
    App.refreshCurrentView();
  },

  openAddMealModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="meal-modal">
        <div class="modal-sheet">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Log Custom Food</h3>
              <p class="text-sm text-secondary">Record what you ate along with approximate macros.</p>
            </div>
            <button class="modal-close-btn" onclick="NutritionModule.closeModal()">&times;</button>
          </div>

          <form id="custom-meal-form" onsubmit="NutritionModule.saveCustomMeal(event)">
            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Meal Slot</label>
                <select class="form-input" id="meal-slot" required>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snack">Evening Snack</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Late Snack">Late Snack</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="meal-date" value="${StorageManager.getTodayDateString()}" required>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Food / Meal Name</label>
              <input type="text" class="form-input" id="meal-name" placeholder="e.g. Soya chunks curry with 3 rotis" required>
            </div>

            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Estimated Protein (g)</label>
                <input type="number" step="0.5" inputmode="decimal" class="form-input" id="meal-protein" placeholder="e.g. 25" required>
              </div>
              <div class="form-group">
                <label class="form-label">Estimated Calories (kcal)</label>
                <input type="number" inputmode="numeric" class="form-input" id="meal-cals" placeholder="e.g. 500" required>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Quantity / Portions</label>
              <input type="text" class="form-input" id="meal-quantity" placeholder="e.g. 1 bowl + 3 rotis">
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Notes (Optional)</label>
              <input type="text" class="form-input" id="meal-notes" placeholder="Low oil, extra dahi">
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="NutritionModule.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i data-lucide="check"></i> Save Meal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById('meal-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  saveCustomMeal(e) {
    e.preventDefault();
    const date = document.getElementById('meal-date').value;
    const mealType = document.getElementById('meal-slot').value;
    const name = document.getElementById('meal-name').value;
    const protein = parseFloat(document.getElementById('meal-protein').value) || 0;
    const calories = parseFloat(document.getElementById('meal-cals').value) || 0;
    const quantity = document.getElementById('meal-quantity').value;
    const notes = document.getElementById('meal-notes').value;

    StorageManager.addNutritionLog({
      date,
      mealType,
      name,
      protein,
      calories,
      quantity,
      notes
    });

    this.closeModal();
    App.showToast(`Logged ${name}: +${protein}g protein!`, 'success');
    App.refreshCurrentView();
  },

  openFoodLibraryModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="food-lib-modal">
        <div class="modal-sheet" style="max-width: 600px;">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Indian Vegetarian Food Reference</h3>
              <p class="text-sm text-secondary">Approximate macro values per standard serving.</p>
            </div>
            <button class="modal-close-btn" onclick="NutritionModule.closeModal()">&times;</button>
          </div>

          <div class="food-search-box mb-4">
            <input type="text" class="form-input" id="food-search-input" placeholder="Search foods (e.g. paneer, oats, chana)..." oninput="NutritionModule.filterFoodLibrary(this.value)">
          </div>

          <div class="food-lib-list" id="food-lib-list-container" style="max-height: 400px; overflow-y: auto;">
            ${this.renderFoodLibraryItems(this.foodDatabase)}
          </div>

          <div class="modal-footer mt-4">
            <button type="button" class="btn btn-primary" onclick="NutritionModule.closeModal()">Done</button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('food-lib-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  renderFoodLibraryItems(items) {
    return items.map(item => `
      <div class="food-lib-item">
        <div class="food-lib-main">
          <h4 class="font-medium">${item.name}</h4>
          <span class="text-xs text-secondary">${item.serving} • ${item.category}</span>
        </div>
        <div class="food-lib-stats">
          <span class="badge badge-sage"><strong>${item.protein}g</strong> pro</span>
          <span class="badge badge-neutral">${item.calories} kcal</span>
          <button class="btn btn-xs btn-outline ml-2" onclick="NutritionModule.quickLogFood('${item.name.replace(/'/g, "\\'")}', ${item.calories}, ${item.protein}, '${item.serving}', 'Snack'); NutritionModule.closeModal();">
            + Log
          </button>
        </div>
      </div>
    `).join('');
  },

  filterFoodLibrary(query) {
    const q = query.toLowerCase().trim();
    const filtered = this.foodDatabase.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    const container = document.getElementById('food-lib-list-container');
    if (container) {
      container.innerHTML = this.renderFoodLibraryItems(filtered);
      lucide.createIcons();
    }
  },

  closeModal() {
    const m1 = document.getElementById('meal-modal');
    if (m1) m1.remove();
    const m2 = document.getElementById('food-lib-modal');
    if (m2) m2.remove();
  }
};

