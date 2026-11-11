/**
 * Vergis - Main Application Controller & Router
 * Orchestrates navigation, mobile bottom navigation, desktop sidebar,
 * toast notifications, and modular views.
 */

const App = {
  currentView: 'dashboard',

  init() {
    // 1. Initialize Storage & IDB
    StorageManager.init();
    PhotoStore.init().catch(err => console.warn('PhotoStore init error:', err));

    // 2. Load theme preference
    const settings = StorageManager.getSettings();
    this.applyTheme(settings.theme || 'light');

    // 3. Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            reg.update().catch(() => {});
            console.log('Vergis SW registered:', reg.scope);
          })
          .catch(err => console.log('SW registration failed:', err));
      });
    }

    // 4. Bind navigation events
    this.bindNavigation();

    // 5. Handle initial URL hash or default to dashboard
    const initialHash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'workouts', 'nutrition', 'skincare', 'habits', 'progress', 'calendar', 'analytics', 'settings'];
    const startView = validViews.includes(initialHash) ? initialHash : 'dashboard';

    this.navigateTo(startView);

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (validViews.includes(newHash) && newHash !== this.currentView) {
        this.navigateTo(newHash, false);
      }
    });
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', 'light');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', '#244B3C');
    }
  },

  bindNavigation() {
    // Desktop sidebar links
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) this.navigateTo(view);
      });
    });

    // Mobile bottom nav links
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view === 'more') {
          this.toggleMoreSheet();
        } else if (view) {
          this.navigateTo(view);
        }
      });
    });
  },

  navigateTo(viewName, updateHash = true) {
    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Close mobile "more" sheet if open
    this.closeMoreSheet();

    // Update active nav items
    document.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      const btnView = el.getAttribute('data-view');
      const isMoreViews = ['skincare', 'habits', 'calendar', 'analytics', 'settings'].includes(viewName);
      if (btnView === 'more' && isMoreViews) {
        el.classList.add('active');
      } else {
        el.classList.toggle('active', btnView === viewName);
      }
    });

    // Render target view
    const mainContainer = document.getElementById('main-content-view');
    if (!mainContainer) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewName) {
      case 'dashboard':
        DashboardModule.render(mainContainer);
        break;
      case 'workouts':
        WorkoutModule.render(mainContainer);
        break;
      case 'nutrition':
        NutritionModule.render(mainContainer);
        break;
      case 'skincare':
        SkincareModule.render(mainContainer);
        break;
      case 'habits':
        HabitsModule.render(mainContainer);
        break;
      case 'progress':
        ProgressModule.render(mainContainer);
        break;
      case 'calendar':
        CalendarModule.render(mainContainer);
        break;
      case 'analytics':
        AnalyticsModule.render(mainContainer);
        break;
      case 'settings':
        SettingsModule.render(mainContainer);
        break;
      default:
        DashboardModule.render(mainContainer);
    }
  },

  refreshCurrentView() {
    const mainContainer = document.getElementById('main-content-view');
    if (!mainContainer) return;

    switch (this.currentView) {
      case 'dashboard':
        DashboardModule.render(mainContainer);
        break;
      case 'workouts':
        WorkoutModule.render(mainContainer);
        break;
      case 'nutrition':
        NutritionModule.render(mainContainer);
        break;
      case 'skincare':
        SkincareModule.render(mainContainer);
        break;
      case 'habits':
        HabitsModule.render(mainContainer);
        break;
      case 'progress':
        ProgressModule.render(mainContainer);
        break;
      case 'calendar':
        CalendarModule.render(mainContainer);
        break;
      case 'analytics':
        AnalyticsModule.render(mainContainer);
        break;
      case 'settings':
        SettingsModule.render(mainContainer);
        break;
      default:
        DashboardModule.render(mainContainer);
    }
  },

  toggleMoreSheet() {
    const sheet = document.getElementById('mobile-more-sheet');
    if (sheet) {
      sheet.classList.toggle('open');
    }
  },

  closeMoreSheet() {
    const sheet = document.getElementById('mobile-more-sheet');
    if (sheet) {
      sheet.classList.remove('open');
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slideUp`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    else if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons({ root: toast });

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

