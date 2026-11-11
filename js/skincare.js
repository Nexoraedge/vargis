/**
 * Vergis - Skincare Tracker Module
 * Minimal, barrier-focused skincare routine for dry skin.
 * Emphasizes gentle hydration, barrier repair, and SPF 50 photoprotection.
 * Zero skin-bleaching or aggressive treatments.
 */

const SkincareModule = {
  render(container) {
    const today = StorageManager.getTodayDateString();
    const skincareLog = StorageManager.getSkincareLog(today);
    const products = StorageManager.getProducts();

    const amComplete = skincareLog.amWater && skincareLog.amMoisturizer && skincareLog.amSunscreen;
    const pmComplete = skincareLog.pmWash && skincareLog.pmMoisturizer;

    // Check week count from start date for Aloe Scrub reassessment
    const profile = StorageManager.getProfile();
    const prog = StorageManager.calculateDay(profile.startDate || today);
    const currentWeek = Math.ceil(prog.currentDay / 7);

    container.innerHTML = `
      <div class="page-header animate-fadeIn">
        <div class="page-title-row">
          <div>
            <span class="badge badge-sage">Barrier Health & Protection</span>
            <h1 class="page-title">Skincare Routine</h1>
            <p class="page-subtitle">Minimal, non-stripping regimen designed specifically for dry skin & sun protection.</p>
          </div>
          <button class="btn btn-primary" onclick="SkincareModule.openAddProductModal()">
            <i data-lucide="plus"></i> Add Product
          </button>
        </div>
      </div>


      <!-- Today's Routine Checklists -->
      <div class="grid-2col gap-6">
        <!-- Morning Routine -->
        <div class="card">
          <div class="card-header-row border-b pb-3 mb-4">
            <div class="flex items-center gap-2">
              <div class="icon-circle bg-champagne-light">
                <i data-lucide="sun" class="text-champagne-dark"></i>
              </div>
              <div>
                <h3 class="card-title text-base">Morning Routine (7:00 AM)</h3>
                <p class="card-subtitle text-xs">Gentle hydration & UV shield</p>
              </div>
            </div>
            <span class="badge ${amComplete ? 'badge-success' : 'badge-neutral'}">
              ${amComplete ? 'Completed' : 'Pending'}
            </span>
          </div>

          <div class="skincare-checklist">
            <label class="skincare-step-item">
              <input type="checkbox" class="custom-checkbox" id="chk-am-water" ${skincareLog.amWater ? 'checked' : ''} onchange="SkincareModule.toggleStep('amWater', this.checked)">
              <div class="step-info">
                <span class="step-name">1. Rinse face with lukewarm/cool water</span>
                <span class="step-desc">Do not use soap in the morning. Natural overnight lipids protect dry skin.</span>
              </div>
            </label>

            <label class="skincare-step-item">
              <input type="checkbox" class="custom-checkbox" id="chk-am-moist" ${skincareLog.amMoisturizer ? 'checked' : ''} onchange="SkincareModule.toggleStep('amMoisturizer', this.checked)">
              <div class="step-info">
                <span class="step-name">2. Apply Moisturizer</span>
                <span class="step-desc">Apply generously onto slightly damp skin to lock in hydration.</span>
              </div>
            </label>

            <label class="skincare-step-item">
              <input type="checkbox" class="custom-checkbox" id="chk-am-spf" ${skincareLog.amSunscreen ? 'checked' : ''} onchange="SkincareModule.toggleStep('amSunscreen', this.checked)">
              <div class="step-info">
                <span class="step-name">3. Broad-Spectrum SPF 50 PA++++ Sunscreen</span>
                <span class="step-desc">2 finger-lengths for face, plus apply over neck, ears, and exposed arms.</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Night Routine -->
        <div class="card">
          <div class="card-header-row border-b pb-3 mb-4">
            <div class="flex items-center gap-2">
              <div class="icon-circle bg-sage-light">
                <i data-lucide="moon" class="text-primary"></i>
              </div>
              <div>
                <h3 class="card-title text-base">Night Routine (9:30 PM)</h3>
                <p class="card-subtitle text-xs">Gentle cleanse & overnight repair</p>
              </div>
            </div>
            <span class="badge ${pmComplete ? 'badge-success' : 'badge-neutral'}">
              ${pmComplete ? 'Completed' : 'Pending'}
            </span>
          </div>

          <div class="skincare-checklist">
            <label class="skincare-step-item">
              <input type="checkbox" class="custom-checkbox" id="chk-pm-wash" ${skincareLog.pmWash ? 'checked' : ''} onchange="SkincareModule.toggleStep('pmWash', this.checked)">
              <div class="step-info">
                <span class="step-name">1. Simple Refreshing Facial Wash</span>
                <span class="step-desc">100% soap-free. Gently dissolve sunscreen, sweat, and pollutants without tightness.</span>
              </div>
            </label>

            <label class="skincare-step-item">
              <input type="checkbox" class="custom-checkbox" id="chk-pm-moist" ${skincareLog.pmMoisturizer ? 'checked' : ''} onchange="SkincareModule.toggleStep('pmMoisturizer', this.checked)">
              <div class="step-info">
                <span class="step-name">2. Apply Moisturizer</span>
                <span class="step-desc">Layer gently to support overnight cellular hydration and barrier regeneration.</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Scrub Protocol Advisory (Weeks 1-4 Paused) -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Physical Scrub Protocol & Status</h3>
            <p class="card-subtitle">Forever Aloe Scrub assessment based on your barrier recovery timeline.</p>
          </div>
          <span class="badge ${currentWeek <= 4 ? 'badge-warning' : 'badge-sage'}">
            ${currentWeek <= 4 ? `Week ${currentWeek} of 4: PAUSED` : `Week ${currentWeek}: Optional Gentle Use`}
          </span>
        </div>

        <div class="scrub-status-body mt-4">
          <div class="scrub-badge-indicator ${currentWeek <= 4 ? 'paused' : 'active'}">
            <i data-lucide="${currentWeek <= 4 ? 'pause-circle' : 'check-circle'}" class="scrub-icon"></i>
          </div>
          <div class="scrub-explanation">
            <h4 class="font-semibold text-primary mb-1">
              ${currentWeek <= 4 ? 'Barrier Reset in Progress: Physical Exfoliation Paused' : 'Post 4-Week Reassessment: Gentle 1x Weekly (Optional)'}
            </h4>
            <p class="text-sm text-secondary">
              ${currentWeek <= 4
                ? 'Dry skin barrier needs 28 days of uncompromised lipid restoration. Avoid mechanical walnut/aloe scrubs during this phase to heal micro-tears and moisture loss.'
                : 'Your lipid barrier has stabilized. If skin feels flaky and not inflamed or irritated, you may use a tiny pea-sized amount with gentle circular fingertip motions at most once per week. Never scrub aggressively.'
              }
            </p>
          </div>
        </div>

        ${currentWeek > 4 ? `
          <div class="mt-4 pt-3 border-t flex items-center justify-between">
            <span class="text-sm">Did you do your gentle once-weekly scrub today?</span>
            <label class="switch-control">
              <input type="checkbox" ${skincareLog.weeklyScrub ? 'checked' : ''} onchange="SkincareModule.toggleStep('weeklyScrub', this.checked)">
              <span class="switch-slider"></span>
            </label>
          </div>
        ` : ''}
      </div>

      <!-- Product Inventory & Restock Checklist -->
      <div class="card mt-6">
        <div class="card-header-row">
          <div>
            <h3 class="card-title">Product Inventory & Restock Checklist</h3>
            <p class="card-subtitle">Track your dry skin essentials, usage status, and purchase list.</p>
          </div>
        </div>

        <div class="table-container mt-4">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category / Step</th>
                <th>Status</th>
                <th>Notes / Instructions</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td><span class="badge badge-neutral">${p.step}</span></td>
                  <td>
                    <select class="form-input form-input-sm" style="width: auto; padding: 4px 8px;" onchange="SkincareModule.updateProductStatus('${p.id}', this.value)">
                      <option value="In use" ${p.status === 'In use' ? 'selected' : ''}>In use</option>
                      <option value="Need to buy" ${p.status === 'Need to buy' ? 'selected' : ''}>Need to buy</option>
                      <option value="Running low" ${p.status === 'Running low' ? 'selected' : ''}>Running low</option>
                      <option value="Paused" ${p.status.includes('Paused') ? 'selected' : ''}>Paused</option>
                    </select>
                  </td>
                  <td class="text-secondary text-sm">${p.notes || '—'}</td>
                  <td class="text-right">
                    <button class="btn-icon text-error" onclick="SkincareModule.deleteProduct('${p.id}')" title="Delete">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  toggleStep(stepKey, checked) {
    const today = StorageManager.getTodayDateString();
    const update = {};
    update[stepKey] = checked;
    StorageManager.saveSkincareLog(today, update);
    App.showToast('Skincare checklist updated', 'info');
    App.refreshCurrentView();
  },

  updateProductStatus(id, newStatus) {
    StorageManager.updateProduct(id, { status: newStatus });
    App.showToast('Product status updated', 'success');
  },

  deleteProduct(id) {
    if (confirm('Remove this product from your inventory?')) {
      StorageManager.deleteProduct(id);
      App.showToast('Product removed.', 'info');
      App.refreshCurrentView();
    }
  },

  openAddProductModal() {
    const modalHtml = `
      <div class="modal-backdrop" id="product-modal">
        <div class="modal-sheet">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Add Skincare Product</h3>
              <p class="text-sm text-secondary">Keep track of your dry-skin regimen essentials.</p>
            </div>
            <button class="modal-close-btn" onclick="SkincareModule.closeModal()">&times;</button>
          </div>

          <form id="product-form" onsubmit="SkincareModule.saveNewProduct(event)">
            <div class="form-group mb-4">
              <label class="form-label">Product Name</label>
              <input type="text" class="form-input" id="new-prod-name" placeholder="e.g. Minimalist SPF 50 PA++++" required>
            </div>

            <div class="grid-2col gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-input" id="new-prod-cat">
                  <option value="Sunscreen">Sunscreen</option>
                  <option value="Moisturizer">Moisturizer</option>
                  <option value="Cleanser">Cleanser</option>
                  <option value="Hydrating Toner">Hydrating Toner</option>
                  <option value="Lip Care">Lip Care</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Step / Timing</label>
                <input type="text" class="form-input" id="new-prod-step" placeholder="e.g. Morning 7:00 AM">
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Status</label>
              <select class="form-input" id="new-prod-status">
                <option value="In use">In use</option>
                <option value="Need to buy">Need to buy</option>
                <option value="Running low">Running low</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Notes & Usage Instructions</label>
              <textarea class="form-input" id="new-prod-notes" rows="2" placeholder="Apply before step 3, fragrance-free..."></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="SkincareModule.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i data-lucide="check"></i> Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const existing = document.getElementById('product-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
  },

  saveNewProduct(e) {
    e.preventDefault();
    const name = document.getElementById('new-prod-name').value;
    const category = document.getElementById('new-prod-cat').value;
    const step = document.getElementById('new-prod-step').value || 'Daily';
    const status = document.getElementById('new-prod-status').value;
    const notes = document.getElementById('new-prod-notes').value;

    StorageManager.addProduct({ name, category, step, status, notes });
    this.closeModal();
    App.showToast(`Added ${name} to inventory!`, 'success');
    App.refreshCurrentView();
  },

  closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.remove();
  }
};

