/**
 * Comeback 90 - Data Storage & Model Manager
 * Structured, versioned LocalStorage persistence with validation and backup/restore.
 */

const STORAGE_KEYS = {
  VERSION: 'comeback90_schema_version',
  PROFILE: 'comeback90_profile',
  SETTINGS: 'comeback90_settings',
  DAILY_LOGS: 'comeback90_daily_logs',
  WEIGHT_LOGS: 'comeback90_weight_logs',
  WORKOUT_LOGS: 'comeback90_workout_logs',
  NUTRITION_LOGS: 'comeback90_nutrition_logs',
  SKINCARE_LOGS: 'comeback90_skincare_logs',
  HABITS: 'comeback90_habits',
  PRODUCTS: 'comeback90_products',
};

const SCHEMA_VERSION = 1;

const StorageManager = {
  // Returns today's date in local YYYY-MM-DD format (never UTC to avoid date shifting)
  getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Format date to Indian standard: DD MMM YYYY (e.g. 11 Nov 2026)
  formatDateIndian(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  },

  // Calculate dynamic 90-day progress
  calculateDay(startDateStr) {
    if (!startDateStr) startDateStr = this.getTodayDateString();
    const start = new Date(startDateStr + 'T00:00:00');
    const today = new Date(this.getTodayDateString() + 'T00:00:00');
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return {
      currentDay: Math.max(1, diffDays),
      totalDays: 90,
      isFinished: diffDays > 90,
      daysLeft: Math.max(0, 90 - diffDays)
    };
  },

  init() {
    // Check if initial storage setup is needed
    if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
      this.preloadDefaultData();
    }
  },

  preloadDefaultData() {
    const today = this.getTodayDateString();

    const defaultProfile = {
      name: "Divit",
      heightFt: "5'11\"",
      heightCm: 180,
      startingWeight: 59,
      targetWeight: 65,
      longTermTarget: 72,
      pushupPR: 48,
      diet: "Vegetarian",
      environment: "Home workouts",
      budget: "₹1,000–₹2,000 / month",
      workoutFrequency: "3 strength sessions weekly",
      startDate: today,
    };

    const defaultSettings = {
      theme: 'light',
      proteinTarget: 85, // 75-90g range
      calorieTarget: 2400,
      waterTarget: 2500, // 2.5 Litres
      sleepTarget: 8, // 7-9 hours
      accentColor: '#244B3C'
    };

    const defaultHabits = [
      { id: 'h_wake', name: 'Wake up on time & hydrate', category: 'Routine', icon: 'sunrise', active: true },
      { id: 'h_water', name: 'Drink 2.5+ Litres water', category: 'Nutrition', icon: 'droplet', active: true },
      { id: 'h_breakfast', name: 'High-protein breakfast (milk, oats, peanuts)', category: 'Nutrition', icon: 'coffee', active: true },
      { id: 'h_lunch', name: 'Wholesome lunch (rotis, dal, sabzi, curd)', category: 'Nutrition', icon: 'utensils', active: true },
      { id: 'h_snack', name: 'Evening desk snack (roasted chana, banana)', category: 'Nutrition', icon: 'apple', active: true },
      { id: 'h_dinner', name: 'Protein dinner (soya chunks/paneer, roti)', category: 'Nutrition', icon: 'soup', active: true },
      { id: 'h_protein', name: 'Hit daily protein target (75–90g)', category: 'Nutrition', icon: 'target', active: true },
      { id: 'h_workout', name: 'Complete planned workout / active recovery', category: 'Fitness', icon: 'dumbbell', active: true },
      { id: 'h_skincare_am', name: 'Morning skincare (Water + Pond\'s + SPF 50)', category: 'Skincare', icon: 'sun', active: true },
      { id: 'h_skincare_pm', name: 'Evening skincare (Simple Wash + Pond\'s)', category: 'Skincare', icon: 'moon', active: true },
      { id: 'h_sleep', name: 'Get 7–9 hours restorative sleep', category: 'Recovery', icon: 'bed', active: true }
    ];

    const defaultProducts = [
      {
        id: 'prod_ponds',
        name: "Pond's Super Light Gel Moisturizer",
        category: 'Moisturizer',
        step: 'Morning & Evening',
        status: 'In use',
        suitableFor: 'Dry / Dehydrated skin',
        notes: 'Hyaluronic acid + Vitamin E. Non-sticky hydration.'
      },
      {
        id: 'prod_spf',
        name: 'Broad-Spectrum SPF 50 PA++++ Sunscreen',
        category: 'Sun Protection',
        step: 'Morning (7:00 AM)',
        status: 'In use',
        suitableFor: 'Daily outdoor & indoor UV defense',
        notes: 'Generous application on face, neck, ears & exposed arms.'
      },
      {
        id: 'prod_wash',
        name: 'Simple Kind to Skin Refreshing Facial Wash',
        category: 'Cleanser',
        step: 'Evening (9:30 PM)',
        status: 'In use',
        suitableFor: 'Dry / Sensitive barrier',
        notes: '100% soap-free gel cleanser. Preserves natural moisture barrier.'
      },
      {
        id: 'prod_scrub',
        name: 'Forever Aloe Scrub',
        category: 'Exfoliant',
        step: 'Weekly Treatment (PAUSED)',
        status: 'Paused (Weeks 1–4)',
        suitableFor: 'Skin barrier recovery',
        notes: 'Paused for first 4 weeks. After 4-week reset, gentle 1x/week optional reminder only. Never scrub abrasively.'
      }
    ];

    const initialWeightLogs = [
      {
        id: 'w_' + Date.now(),
        date: today,
        weight: 59.0,
        waist: 76,
        chest: 88,
        arm: 28,
        thigh: 49,
        notes: 'Day 1 Starting baseline. 59 kg target to 65 kg.'
      }
    ];

    localStorage.setItem(STORAGE_KEYS.VERSION, String(SCHEMA_VERSION));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(defaultHabits));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(initialWeightLogs));
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.SKINCARE_LOGS, JSON.stringify({}));
  },

  // PROFILE
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // SETTINGS
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { theme: 'light', proteinTarget: 85, calorieTarget: 2400, waterTarget: 2500, sleepTarget: 8 };
    } catch {
      return { theme: 'light', proteinTarget: 85, calorieTarget: 2400, waterTarget: 2500, sleepTarget: 8 };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // HABITS
  getHabits() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  addCustomHabit(name, category = 'Custom', icon = 'check-circle') {
    const habits = this.getHabits();
    const newHabit = {
      id: 'h_custom_' + Date.now(),
      name: name.trim(),
      category,
      icon,
      active: true
    };
    habits.push(newHabit);
    this.saveHabits(habits);
    return newHabit;
  },

  deleteHabit(id) {
    let habits = this.getHabits();
    habits = habits.filter(h => h.id !== id);
    this.saveHabits(habits);
  },

  // DAILY LOGS (keyed by YYYY-MM-DD)
  getDailyLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getDailyLog(dateStr) {
    if (!dateStr) dateStr = this.getTodayDateString();
    const logs = this.getDailyLogs();
    if (!logs[dateStr]) {
      return {
        date: dateStr,
        habits: {},
        waterMl: 0,
        sleepHours: 0,
        notes: '',
        workoutCompleted: false,
        skincareAm: false,
        skincarePm: false,
      };
    }
    return logs[dateStr];
  },

  saveDailyLog(dateStr, logData) {
    if (!dateStr) dateStr = this.getTodayDateString();
    const logs = this.getDailyLogs();
    logs[dateStr] = {
      ...(logs[dateStr] || {}),
      ...logData,
      date: dateStr
    };
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
    return logs[dateStr];
  },

  toggleHabitStatus(dateStr, habitId) {
    const log = this.getDailyLog(dateStr);
    if (!log.habits) log.habits = {};
    log.habits[habitId] = !log.habits[habitId];
    this.saveDailyLog(dateStr, log);
    return log.habits[habitId];
  },

  // WEIGHT & BODY LOGS
  getWeightLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
      const list = data ? JSON.parse(data) : [];
      return list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch {
      return [];
    }
  },

  addWeightLog(entry) {
    const list = this.getWeightLogs();
    const newEntry = {
      id: 'w_' + Date.now(),
      date: entry.date || this.getTodayDateString(),
      weight: parseFloat(entry.weight),
      waist: entry.waist ? parseFloat(entry.waist) : null,
      chest: entry.chest ? parseFloat(entry.chest) : null,
      arm: entry.arm ? parseFloat(entry.arm) : null,
      thigh: entry.thigh ? parseFloat(entry.thigh) : null,
      notes: entry.notes ? entry.notes.trim() : ''
    };
    // Replace if same date or append
    const existingIndex = list.findIndex(item => item.date === newEntry.date);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newEntry };
    } else {
      list.push(newEntry);
    }
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(list));
    return newEntry;
  },

  deleteWeightLog(id) {
    let list = this.getWeightLogs();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(list));
  },

  // WORKOUT LOGS
  getWorkoutLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      const list = data ? JSON.parse(data) : [];
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
      return [];
    }
  },

  addWorkoutLog(entry) {
    const list = this.getWorkoutLogs();
    const newEntry = {
      id: 'wo_' + Date.now(),
      date: entry.date || this.getTodayDateString(),
      workoutType: entry.workoutType || 'Workout A',
      durationMinutes: entry.durationMinutes || 45,
      exercises: entry.exercises || [],
      pushupsCompleted: entry.pushupsCompleted || 0,
      notes: entry.notes || '',
      completedAt: new Date().toISOString()
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(list));

    // Also update daily log workoutCompleted
    const daily = this.getDailyLog(newEntry.date);
    daily.workoutCompleted = true;
    if (daily.habits) {
      daily.habits['h_workout'] = true;
    }
    this.saveDailyLog(newEntry.date, daily);

    // Check if new Pushup PR set
    if (entry.pushupsCompleted) {
      const profile = this.getProfile();
      if (entry.pushupsCompleted > (profile.pushupPR || 0)) {
        profile.pushupPR = entry.pushupsCompleted;
        this.saveProfile(profile);
      }
    }

    return newEntry;
  },

  deleteWorkoutLog(id) {
    let list = this.getWorkoutLogs();
    list = list.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(list));
  },

  // NUTRITION LOGS
  getNutritionLogs(dateStr) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NUTRITION_LOGS);
      const list = data ? JSON.parse(data) : [];
      if (!dateStr) return list;
      return list.filter(item => item.date === dateStr);
    } catch {
      return [];
    }
  },

  getAllNutritionLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NUTRITION_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addNutritionLog(entry) {
    const list = this.getAllNutritionLogs();
    const newEntry = {
      id: 'nut_' + Date.now(),
      date: entry.date || this.getTodayDateString(),
      mealType: entry.mealType || 'Breakfast',
      name: entry.name || '',
      calories: parseFloat(entry.calories) || 0,
      protein: parseFloat(entry.protein) || 0,
      quantity: entry.quantity || '',
      time: entry.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: entry.notes || ''
    };
    list.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(list));

    // Check if protein target met today
    const todayLogs = list.filter(i => i.date === newEntry.date);
    const totalProtein = todayLogs.reduce((sum, i) => sum + (i.protein || 0), 0);
    const settings = this.getSettings();
    if (totalProtein >= (settings.proteinTarget || 75)) {
      const daily = this.getDailyLog(newEntry.date);
      if (daily.habits) {
        daily.habits['h_protein'] = true;
        this.saveDailyLog(newEntry.date, daily);
      }
    }

    return newEntry;
  },

  deleteNutritionLog(id) {
    let list = this.getAllNutritionLogs();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(list));
  },

  // SKINCARE LOGS
  getSkincareLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SKINCARE_LOGS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getSkincareLog(dateStr) {
    if (!dateStr) dateStr = this.getTodayDateString();
    const logs = this.getSkincareLogs();
    return logs[dateStr] || {
      date: dateStr,
      amWater: false,
      amMoisturizer: false,
      amSunscreen: false,
      pmWash: false,
      pmMoisturizer: false,
      weeklyScrub: false,
      notes: ''
    };
  },

  saveSkincareLog(dateStr, partial) {
    if (!dateStr) dateStr = this.getTodayDateString();
    const logs = this.getSkincareLogs();
    const existing = this.getSkincareLog(dateStr);
    const updated = { ...existing, ...partial, date: dateStr };
    logs[dateStr] = updated;
    localStorage.setItem(STORAGE_KEYS.SKINCARE_LOGS, JSON.stringify(logs));

    // Sync with daily habits
    const daily = this.getDailyLog(dateStr);
    if (!daily.habits) daily.habits = {};

    const amComplete = updated.amWater && updated.amMoisturizer && updated.amSunscreen;
    const pmComplete = updated.pmWash && updated.pmMoisturizer;

    daily.skincareAm = amComplete;
    daily.skincarePm = pmComplete;
    daily.habits['h_skincare_am'] = amComplete;
    daily.habits['h_skincare_pm'] = pmComplete;
    this.saveDailyLog(dateStr, daily);

    return updated;
  },

  // PRODUCTS
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct(product) {
    const list = this.getProducts();
    const newProd = {
      id: 'prod_' + Date.now(),
      name: product.name,
      category: product.category || 'Skincare',
      step: product.step || 'Daily',
      status: product.status || 'In use',
      suitableFor: product.suitableFor || '',
      notes: product.notes || ''
    };
    list.push(newProd);
    this.saveProducts(list);
    return newProd;
  },

  updateProduct(id, updates) {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      this.saveProducts(list);
    }
  },

  deleteProduct(id) {
    let list = this.getProducts();
    list = list.filter(p => p.id !== id);
    this.saveProducts(list);
  },

  // EXPORT & IMPORT BACKUP
  exportBackupJSON() {
    const backup = {
      app: 'Comeback 90',
      exportedAt: new Date().toISOString(),
      version: SCHEMA_VERSION,
      data: {
        profile: this.getProfile(),
        settings: this.getSettings(),
        daily_logs: this.getDailyLogs(),
        weight_logs: this.getWeightLogs(),
        workout_logs: this.getWorkoutLogs(),
        nutrition_logs: this.getAllNutritionLogs(),
        skincare_logs: this.getSkincareLogs(),
        habits: this.getHabits(),
        products: this.getProducts()
      }
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !parsed.data) {
        throw new Error('Invalid format: Missing data container');
      }
      const d = parsed.data;
      if (d.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(d.profile));
      if (d.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(d.settings));
      if (d.daily_logs) localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(d.daily_logs));
      if (d.weight_logs) localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(d.weight_logs));
      if (d.workout_logs) localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(d.workout_logs));
      if (d.nutrition_logs) localStorage.setItem(STORAGE_KEYS.NUTRITION_LOGS, JSON.stringify(d.nutrition_logs));
      if (d.skincare_logs) localStorage.setItem(STORAGE_KEYS.SKINCARE_LOGS, JSON.stringify(d.skincare_logs));
      if (d.habits) localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(d.habits));
      if (d.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(d.products));
      localStorage.setItem(STORAGE_KEYS.VERSION, String(SCHEMA_VERSION));
      return { success: true };
    } catch (err) {
      console.error('Import error:', err);
      return { success: false, error: err.message };
    }
  },

  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.NUTRITION_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SKINCARE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
    this.preloadDefaultData();
  }
};

// Initialize right away
StorageManager.init();
