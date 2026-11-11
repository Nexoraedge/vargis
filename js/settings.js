/**
 * Vergis - Settings & Data Management Module
 * Comprehensive profile configuration, target calibrations, JSON backup & restore.
 */

const SettingsModule = {
  render(container) {
    const profile = StorageManager.getProfile();
    const settings = StorageManager.getSettings();

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">Preferences & Targets</span>
            <h1 class="page-title">Settings & Storage</h1>
            <p class="page-subtitle">Configure your baseline metrics, daily thresholds, and manage your local vault.</p>
          </div>
        </div>
      </div>

      <!-- Critical LocalStorage Notice -->
      <div class="card banner-card mb-6">
        <div class="banner-icon">
          <i data-lucide="hard-drive" class="text-primary"></i>
        </div>
        <div class="banner-body">
          <h4 class="banner-title">Client-Side Vault Notice</h4>
          <p class="banner-text">
            Vergis operates <strong>100% locally in your browser</strong> for complete privacy. No remote databases or servers are used. Please use the <strong>Export JSON Backup</strong> feature periodically to safeguard your logs across browser cache cleans or device transfers.
          </p>
        </div>
      </div>

      <!-- Settings Forms Grid -->
      <div class="grid-2col gap-6">
        <!-- Profile & Baseline -->
        <div class="card">
          <div class="card-header-row border-b pb-3 mb-4">
            <h3 class="card-title text-base">Profile & Baselines</h3>
            <span class="badge badge-neutral">Body Metrics</span>
          </div>

          <form id="profile-settings-form" onsubmit="SettingsModule.saveProfileSettings(event)">
            <div class="form-group mb-4">
              <label class="form-label">Your Name</label>
              <input type="text" class="form-input" id="cfg-name" value="${profile.name || 'Divit'}" required>
            </div>

            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Height</label>
                <input type="text" class="form-input" id="cfg-height" value="${profile.heightFt || "5'11\""}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Programme Start Date</label>
                <input type="date" class="form-input" id="cfg-start-date" value="${profile.startDate || StorageManager.getTodayDateString()}" required>
              </div>
            </div>

            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Starting Weight (kg)</label>
                <input type="number" step="0.1" class="form-input" id="cfg-start-wt" value="${profile.startingWeight || 59.0}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Primary Target (kg)</label>
                <input type="number" step="0.1" class="form-input" id="cfg-target-wt" value="${profile.targetWeight || 65.0}" required>
              </div>
            </div>

            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Long-Term Target (kg)</label>
                <input type="number" step="0.1" class="form-input" id="cfg-lt-wt" value="${profile.longTermTarget || 72.0}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Current Push-up PR</label>
                <input type="number" class="form-input" id="cfg-pushup-pr" value="${profile.pushupPR || 48}" required>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full mt-2">
              <i data-lucide="check"></i> Save Profile Baselines
            </button>
          </form>
        </div>

        <!-- Targets & App Configuration -->
        <div class="card">
          <div class="card-header-row border-b pb-3 mb-4">
            <h3 class="card-title text-base">Targets & Calibrations</h3>
            <span class="badge badge-neutral">Daily Thresholds</span>
          </div>

          <form id="targets-settings-form" onsubmit="SettingsModule.saveTargetSettings(event)">
            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Daily Protein Target (g)</label>
                <input type="number" class="form-input" id="cfg-protein" value="${settings.proteinTarget || 85}" min="50" max="250" required>
                <span class="text-xs text-secondary">Recommended: 75–90g</span>
              </div>
              <div class="form-group">
                <label class="form-label">Daily Calories (kcal)</label>
                <input type="number" class="form-input" id="cfg-cals" value="${settings.calorieTarget || 2400}" min="1500" max="4000" required>
                <span class="text-xs text-secondary">Lean bulking surplus</span>
              </div>
            </div>

            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Water Target (ml)</label>
                <input type="number" step="100" class="form-input" id="cfg-water" value="${settings.waterTarget || 2500}" min="1000" max="6000" required>
                <span class="text-xs text-secondary">2.5 L recommended</span>
              </div>
              <div class="form-group">
                <label class="form-label">Sleep Target (hours)</label>
                <input type="number" step="0.5" class="form-input" id="cfg-sleep" value="${settings.sleepTarget || 8}" min="5" max="12" required>
                <span class="text-xs text-secondary">7–9 hours recovery</span>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Active Visual Theme</label>
              <div class="p-3 border rounded-lg bg-neutral-light flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="theme-preview bg-warm-light" style="width: 44px; height: 32px; border-radius: 6px;">
                    <span class="dot-pri" style="width: 12px; height: 12px;"></span>
                    <span class="dot-acc" style="width: 8px; height: 8px;"></span>
                  </div>
                  <div>
                    <span class="font-semibold text-sm block">Warm Ivory & Forest Green</span>
                    <span class="text-xs text-secondary">Signature editorial light palette</span>
                  </div>
                </div>
                <span class="badge badge-sage">Active</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full mt-2">
              <i data-lucide="check"></i> Save Daily Targets
            </button>
          </form>
        </div>
      </div>

      <!-- Backup, Restore and Vault Management -->
      <div class="card mt-6">
        <div class="card-header-row border-b pb-3 mb-4">
          <div>
            <h3 class="card-title">Data Backup, Export & Restore</h3>
            <p class="card-subtitle">Download your complete transformation records as a standard JSON file.</p>
          </div>
          <span class="badge badge-sage">Schema v1</span>
        </div>

        <div class="grid-2col gap-6">
          <div class="p-4 border rounded-lg bg-neutral-light">
            <h4 class="font-semibold text-primary mb-1">Export Vault to JSON</h4>
            <p class="text-sm text-secondary mb-4">Creates an offline snapshot of your profile, daily logs, workouts, meals, and skincare.</p>
            <button class="btn btn-outline" onclick="SettingsModule.triggerExport()">
              <i data-lucide="download"></i> Download Backup JSON
            </button>
          </div>

          <div class="p-4 border rounded-lg bg-neutral-light">
            <h4 class="font-semibold text-primary mb-1">Restore from JSON</h4>
            <p class="text-sm text-secondary mb-4">Restore or migrate records from a previous Vergis backup file.</p>
            <input type="file" id="import-json-file" accept=".json" style="display:none;" onchange="SettingsModule.handleImport(this)">
            <button class="btn btn-outline" onclick="document.getElementById('import-json-file').click()">
              <i data-lucide="upload"></i> Select Backup File
            </button>
          </div>
        </div>

        <div class="danger-zone mt-6 pt-4 border-t">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 class="text-error font-semibold">Reset Application Data</h4>
              <p class="text-xs text-secondary">Erase all logs and reset to preloaded Day 1 baseline settings.</p>
            </div>
            <button class="btn btn-outline text-error border-error" onclick="SettingsModule.confirmReset()">
              <i data-lucide="alert-triangle"></i> Clear & Reset Data
            </button>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  saveProfileSettings(e) {
    e.preventDefault();
    const profile = StorageManager.getProfile();
    profile.name = document.getElementById('cfg-name').value.trim();
    profile.heightFt = document.getElementById('cfg-height').value.trim();
    profile.startDate = document.getElementById('cfg-start-date').value;
    profile.startingWeight = parseFloat(document.getElementById('cfg-start-wt').value);
    profile.targetWeight = parseFloat(document.getElementById('cfg-target-wt').value);
    profile.longTermTarget = parseFloat(document.getElementById('cfg-lt-wt').value);
    profile.pushupPR = parseInt(document.getElementById('cfg-pushup-pr').value, 10);

    StorageManager.saveProfile(profile);
    App.showToast('Profile baselines updated successfully!', 'success');
    App.refreshCurrentView();
  },

  saveTargetSettings(e) {
    e.preventDefault();
    const settings = StorageManager.getSettings();
    settings.proteinTarget = parseInt(document.getElementById('cfg-protein').value, 10);
    settings.calorieTarget = parseInt(document.getElementById('cfg-cals').value, 10);
    settings.waterTarget = parseInt(document.getElementById('cfg-water').value, 10);
    settings.sleepTarget = parseFloat(document.getElementById('cfg-sleep').value);

    StorageManager.saveSettings(settings);
    App.showToast('Daily targets saved!', 'success');
    App.refreshCurrentView();
  },

  changeTheme(newTheme) {
    const settings = StorageManager.getSettings();
    settings.theme = newTheme;
    StorageManager.saveSettings(settings);
    App.applyTheme(newTheme);
    App.showToast(`Theme changed to ${newTheme === 'dark' ? 'Dark Forest' : 'Warm Ivory'}`, 'info');
    App.refreshCurrentView();
  },

  triggerExport() {
    const jsonStr = StorageManager.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vergis_backup_${StorageManager.getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('Backup JSON downloaded successfully!', 'success');
  },

  handleImport(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const res = StorageManager.importBackupJSON(content);
      if (res.success) {
        App.showToast('Data successfully restored from backup!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        App.showToast('Import failed: ' + res.error, 'error');
      }
    };

    reader.readAsText(file);
    input.value = '';
  },

  confirmReset() {
    const userPrompt = prompt('WARNING: This will reset all your logs to factory defaults. Type "RESET" to confirm:');
    if (userPrompt === 'RESET') {
      StorageManager.clearAllData();
      App.showToast('All data reset to baseline.', 'info');
      setTimeout(() => window.location.reload(), 800);
    } else if (userPrompt !== null) {
      App.showToast('Reset cancelled.', 'info');
    }
  }
};

