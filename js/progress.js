/**
 * Vergis - Weight and Body Progress Module
 * Precision body metric logging, measurement tracking, and private IndexedDB photo journal.
 */

const ProgressModule = {
  activePhotoList: [],

  async render(container) {
    const profile = StorageManager.getProfile();
    const weightLogs = StorageManager.getWeightLogs();
    const startWeight = profile.startingWeight || 59.0;
    const target90Weight = profile.targetWeight || 65.0;
    const longTermTarget = profile.longTermTarget || 72.0;

    const latestLog = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
    const currentWeight = latestLog ? latestLog.weight : startWeight;
    const weightGained = Math.round((currentWeight - startWeight) * 10) / 10;
    const to90Target = Math.max(0, Math.round((target90Weight - currentWeight) * 10) / 10);
    const progressPct = Math.min(100, Math.max(0, Math.round(((currentWeight - startWeight) / (target90Weight - startWeight)) * 100)));

    // Fetch photos from IndexedDB
    try {
      this.activePhotoList = await PhotoStore.getAllPhotos();
    } catch {
      this.activePhotoList = [];
    }

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">Physique & Measurements</span>
            <h1 class="page-title">Body Progress & Vault</h1>
            <p class="page-subtitle">Clean lean mass accrual. Track circumference changes and physical posture.</p>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline" onclick="ProgressModule.openPhotoUploadModal()">
              <i data-lucide="camera"></i> Add Photo
            </button>
            <button class="btn btn-primary" onclick="ProgressModule.openLogWeightModal()">
              <i data-lucide="scale"></i> Log Weight & Body
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Metric Cards -->
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
            <i data-lucide="trending-up" class="text-champagne-dark"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">Net Gain</span>
            <span class="metric-value ${weightGained >= 0 ? 'text-primary' : 'text-error'}">
              ${weightGained >= 0 ? '+' : ''}${weightGained.toFixed(1)} <span class="unit">kg</span>
            </span>
            <span class="metric-sub">${to90Target > 0 ? `${to90Target.toFixed(1)} kg to 90-day goal` : '90-Day goal achieved!'}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-sage-light">
            <i data-lucide="target" class="text-primary"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">90-Day Goal Progress</span>
            <span class="metric-value">${progressPct}% <span class="unit">(${target90Weight} kg)</span></span>
            <div class="progress-bar-bg mt-2">
              <div class="progress-bar-fill" style="width: ${progressPct}%; background-color: var(--primary);"></div>
            </div>
            <span class="metric-sub">Long-term vision: ${longTermTarget} kg</span>
          </div>
        </div>
      </div>

      <!-- Trajectory Comparison Card -->
      <div class="card mt-6">
        <div class="card-header-row mb-4">
          <div>
            <h3 class="card-title">90-Day Bulking Trajectory</h3>
            <p class="card-subtitle">Healthy physiological lean mass growth (~0.25 - 0.5 kg weekly surplus).</p>
          </div>
        </div>
        <div class="chart-container" style="position: relative; height: 260px;">
          <canvas id="weight-progress-canvas"></canvas>
        </div>
      </div>

      <!-- Body Circumference Measurements Table -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Circumference Log & History</h3>
            <p class="card-subtitle">Track muscle vs waist changes (Chest, Arms, Thighs in centimetres).</p>
          </div>
          <button class="btn btn-sm btn-outline" onclick="ProgressModule.openLogWeightModal()">
            <i data-lucide="plus"></i> New Entry
          </button>
        </div>

        <div class="table-container mt-4">
          ${this.renderWeightLogsTable(weightLogs)}
        </div>
      </div>

      <!-- Private On-Device Progress Photo Gallery -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Private Photo Journal (IndexedDB)</h3>
            <p class="card-subtitle">100% private. Photos stay on this browser/device; never uploaded to any cloud server.</p>
          </div>
          <button class="btn btn-sm btn-primary" onclick="ProgressModule.openPhotoUploadModal()">
            <i data-lucide="camera"></i> Add Photo
          </button>
        </div>

        <div class="photo-gallery-grid mt-4" id="photo-gallery-container">
          ${this.renderPhotoGallery(this.activePhotoList)}
        </div>
      </div>
    `;

    lucide.createIcons();
    this.renderWeightChart(weightLogs, startWeight, target90Weight);
  },

  renderWeightLogsTable(logs) {
    if (!logs || logs.length === 0) {
      return `
        <div class="empty-state">
          <i data-lucide="scale" class="empty-state-icon"></i>
          <p class="empty-state-text">No weight entries recorded. Log your starting weigh-in above!</p>
        </div>
      `;
    }

    const reversed = [...logs].reverse();
    return `
      <!-- Desktop Table View -->
      <div class="desktop-table-view">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Waist</th>
              <th>Chest</th>
              <th>Arm</th>
              <th>Thigh</th>
              <th>Notes</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${reversed.map(log => `
              <tr>
                <td><strong>${StorageManager.formatDateIndian(log.date)}</strong></td>
                <td><span class="font-semibold text-primary">${log.weight.toFixed(1)} kg</span></td>
                <td>${log.waist ? `${log.waist} cm` : '—'}</td>
                <td>${log.chest ? `${log.chest} cm` : '—'}</td>
                <td>${log.arm ? `${log.arm} cm` : '—'}</td>
                <td>${log.thigh ? `${log.thigh} cm` : '—'}</td>
                <td class="text-secondary text-sm">${log.notes || '—'}</td>
                <td class="text-right">
                  <button class="btn-icon text-error" onclick="ProgressModule.deleteLog('${log.id}')" title="Delete">
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
        ${reversed.map(log => `
          <div class="mobile-log-card">
            <div class="mobile-log-header">
              <div class="flex items-center gap-2">
                <span class="font-bold text-base text-primary">${log.weight.toFixed(1)} kg</span>
                <span class="text-xs text-secondary font-medium">${StorageManager.formatDateIndian(log.date)}</span>
              </div>
              <button class="btn-icon text-error" onclick="ProgressModule.deleteLog('${log.id}')" title="Delete">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
            <div class="mobile-measurements-row mt-2">
              ${log.waist ? `<span class="measurement-chip">Waist: <b>${log.waist}cm</b></span>` : ''}
              ${log.chest ? `<span class="measurement-chip">Chest: <b>${log.chest}cm</b></span>` : ''}
              ${log.arm ? `<span class="measurement-chip">Arm: <b>${log.arm}cm</b></span>` : ''}
              ${log.thigh ? `<span class="measurement-chip">Thigh: <b>${log.thigh}cm</b></span>` : ''}
            </div>
            ${log.notes ? `<p class="mobile-log-notes mt-2">${log.notes}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  renderPhotoGallery(photos) {
    if (!photos || photos.length === 0) {
      return `
        <div class="empty-state w-full col-span-full">
          <i data-lucide="image" class="empty-state-icon"></i>
          <p class="empty-state-text">No photos uploaded yet. Capture your Day 1 baseline photo!</p>
        </div>
      `;
    }

    return photos.map(p => `
      <div class="photo-card">
        <div class="photo-image-wrapper">
          <img src="${p.dataUrl}" alt="Progress on ${p.date}" loading="lazy">
          <span class="photo-tag-badge">${p.tag}</span>
        </div>
        <div class="photo-meta">
          <span class="photo-date">${StorageManager.formatDateIndian(p.date)}</span>
          ${p.notes ? `<p class="photo-notes">${p.notes}</p>` : ''}
          <div class="photo-actions">
            <button class="btn-icon text-error" onclick="ProgressModule.deletePhoto(${p.id})" title="Delete photo">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderWeightChart(logs, startWeight, targetWeight) {
    const canvas = document.getElementById('weight-progress-canvas');
    if (!canvas) return;

    const labels = logs.map(l => StorageManager.formatDateIndian(l.date));
    const dataPoints = logs.map(l => l.weight);

    // Target benchmark line
    const targetLine = logs.map(() => targetWeight);

    if (window.weightChartInstance) {
      window.weightChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    window.weightChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Day 1'],
        datasets: [
          {
            label: 'Logged Weight (kg)',
            data: dataPoints.length > 0 ? dataPoints : [startWeight],
            borderColor: '#244B3C',
            backgroundColor: 'rgba(36, 75, 60, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.25,
            pointBackgroundColor: '#244B3C',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: '90-Day Target (65 kg)',
            data: targetLine.length > 0 ? targetLine : [targetWeight],
            borderColor: '#C7A878',
            borderWidth: 1.5,
            borderDash: [6, 4],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, font: { family: 'Inter', size: 12 } }
          },
          tooltip: {
            backgroundColor: '#202820',
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' }
          }
        },
        scales: {
          y: {
            min: Math.max(50, Math.floor(startWeight - 2)),
            max: Math.ceil(targetWeight + 3),
            grid: { color: '#E8E7DF' },
            ticks: {
              callback: val => val + ' kg',
              font: { family: 'Inter', size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });
  },

  openLogWeightModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="weight-modal">
        <div class="modal-sheet">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Log Weight & Circumference</h3>
              <p class="text-sm text-secondary">Consistent morning weigh-ins after waking give the cleanest trend.</p>
            </div>
            <button class="modal-close-btn" onclick="ProgressModule.closeModal()">&times;</button>
          </div>

          <form id="weight-form" onsubmit="ProgressModule.saveWeightEntry(event)">
            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="w-date" value="${StorageManager.getTodayDateString()}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Weight (kg) *</label>
                <input type="number" step="0.1" class="form-input" id="w-weight" placeholder="e.g. 59.8" required>
              </div>
            </div>

            <div class="form-section-title mb-2">Circumference Measurements (cm, optional)</div>
            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Waist (navel level)</label>
                <input type="number" step="0.5" class="form-input" id="w-waist" placeholder="e.g. 76">
              </div>
              <div class="form-group">
                <label class="form-label">Chest (broadest point)</label>
                <input type="number" step="0.5" class="form-input" id="w-chest" placeholder="e.g. 88">
              </div>
              <div class="form-group">
                <label class="form-label">Arm (flexed bicep)</label>
                <input type="number" step="0.5" class="form-input" id="w-arm" placeholder="e.g. 28.5">
              </div>
              <div class="form-group">
                <label class="form-label">Thigh (mid-quad)</label>
                <input type="number" step="0.5" class="form-input" id="w-thigh" placeholder="e.g. 49.5">
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Notes (Energy, digestion, sleep quality)</label>
              <input type="text" class="form-input" id="w-notes" placeholder="Felt lean, great digestion...">
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="ProgressModule.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i data-lucide="check"></i> Save Record
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById('weight-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  saveWeightEntry(e) {
    e.preventDefault();
    const date = document.getElementById('w-date').value;
    const weight = parseFloat(document.getElementById('w-weight').value);
    const waist = document.getElementById('w-waist').value;
    const chest = document.getElementById('w-chest').value;
    const arm = document.getElementById('w-arm').value;
    const thigh = document.getElementById('w-thigh').value;
    const notes = document.getElementById('w-notes').value;

    StorageManager.addWeightLog({
      date,
      weight,
      waist,
      chest,
      arm,
      thigh,
      notes
    });

    this.closeModal();
    App.showToast(`Weight recorded: ${weight.toFixed(1)} kg`, 'success');
    App.refreshCurrentView();
  },

  deleteLog(id) {
    if (confirm('Delete this entry?')) {
      StorageManager.deleteWeightLog(id);
      App.showToast('Weight record deleted.', 'info');
      App.refreshCurrentView();
    }
  },

  openPhotoUploadModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="photo-modal">
        <div class="modal-sheet">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Upload Progress Photo</h3>
              <p class="text-sm text-secondary">Stored strictly in local browser IndexedDB. Zero cloud uploads.</p>
            </div>
            <button class="modal-close-btn" onclick="ProgressModule.closeModal()">&times;</button>
          </div>

          <form id="photo-form" onsubmit="ProgressModule.savePhoto(event)">
            <div class="form-group mb-4">
              <label class="form-label">Date</label>
              <input type="date" class="form-input" id="ph-date" value="${StorageManager.getTodayDateString()}" required>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Pose / Tag</label>
              <select class="form-input" id="ph-tag">
                <option value="Front Relaxed">Front Relaxed</option>
                <option value="Side Profile">Side Profile</option>
                <option value="Back Lat Spread">Back Lat Spread</option>
                <option value="Push-up Posture">Push-up Posture</option>
                <option value="Face / Skin Glow">Face / Skin Glow</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Select Photo File</label>
              <input type="file" accept="image/*" class="form-input" id="ph-file" required onchange="ProgressModule.previewSelectedImage(this)">
              <div id="ph-preview-container" class="mt-3" style="display:none; text-align: center;">
                <img id="ph-preview-img" style="max-height: 200px; border-radius: 8px; border: 1px solid var(--border);" alt="Preview">
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Notes (Optional)</label>
              <input type="text" class="form-input" id="ph-notes" placeholder="Natural morning lighting...">
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="ProgressModule.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i data-lucide="upload"></i> Save Photo
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById('photo-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  previewSelectedImage(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const previewCont = document.getElementById('ph-preview-container');
        const img = document.getElementById('ph-preview-img');
        if (img && previewCont) {
          img.src = e.target.result;
          previewCont.style.display = 'block';
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  async savePhoto(e) {
    e.preventDefault();
    const date = document.getElementById('ph-date').value;
    const tag = document.getElementById('ph-tag').value;
    const notes = document.getElementById('ph-notes').value;
    const fileInput = document.getElementById('ph-file');

    if (!fileInput.files || !fileInput.files[0]) {
      alert('Please select an image file');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        await PhotoStore.addPhoto(date, dataUrl, tag, notes);
        ProgressModule.closeModal();
        App.showToast('Progress photo saved privately!', 'success');
        App.refreshCurrentView();
      } catch (err) {
        console.error(err);
        App.showToast('Failed to save photo: ' + err.message, 'error');
      }
    };

    reader.readAsDataURL(file);
  },

  async deletePhoto(id) {
    if (confirm('Delete this photo from your private vault?')) {
      try {
        await PhotoStore.deletePhoto(id);
        App.showToast('Photo removed from vault.', 'info');
        App.refreshCurrentView();
      } catch (err) {
        App.showToast('Error deleting photo', 'error');
      }
    }
  },

  closeModal() {
    const m1 = document.getElementById('weight-modal');
    if (m1) m1.remove();
    const m2 = document.getElementById('photo-modal');
    if (m2) m2.remove();
  }
};

