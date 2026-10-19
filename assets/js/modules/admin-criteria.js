/**
 * SPK Bungsu Cell — Admin Criteria Management Module
 * Mengelola konfigurasi prioritas kriteria berbasis Rank Order Centroid (ROC),
 * konversi bobot otomatis tanpa input manual persentase, dan reset ke default.
 * Sesuai PRD.md Bagian 5 & IMPLEMENTATION_PLAN.md Fase F.
 */

const AdminCriteria = {
  // Salinan kriteria sementara saat modal edit dibuka
  modalWorkingList: [],

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const btnEdit = document.getElementById('btnEditDefaultWeights');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        this.openEditModal();
      });
    }

    const btnReset = document.getElementById('btnResetDefaultWeights');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.confirmResetDefault();
      });
    }
  },

  render() {
    const tbody = document.getElementById('criteriaTableBody');
    const statusAlert = document.getElementById('criteriaStatusAlert');
    if (!window.CriteriaRepository) return;

    let criteriaList = window.CriteriaRepository.getAll();

    // Urutkan berdasarkan priorityRank (1..m)
    criteriaList.sort((a, b) => (a.priorityRank || 99) - (b.priorityRank || 99));

    const validation = window.CriteriaRepository.validate(criteriaList);

    if (statusAlert) {
      if (validation.valid) {
        statusAlert.className = 'alert alert-success d-flex align-items-center justify-content-between py-2 px-3 mb-4';
        statusAlert.innerHTML = `
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill fs-5 text-success"></i>
            <div>
              <strong>Total Bobot Kriteria ROC: 100% (1.0000)</strong> &mdash; 
              Bobot dihitung otomatis berdasarkan urutan prioritas menggunakan metode <em>Rank Order Centroid (ROC)</em>.
            </div>
          </div>
          <span class="badge bg-success">Status Valid</span>
        `;
      } else {
        statusAlert.className = 'alert alert-danger d-flex align-items-center justify-content-between py-2 px-3 mb-4';
        statusAlert.innerHTML = `
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
            <div><strong>Total Bobot Tidak Valid!</strong> Harus tepat 100%.</div>
          </div>
          <span class="badge bg-danger">Perlu Penyesuaian</span>
        `;
      }
    }

    if (tbody) {
      tbody.innerHTML = criteriaList.map((crit, idx) => {
        const isCost = crit.type === 'cost';
        const rank = crit.priorityRank || (idx + 1);
        const weightPercent = typeof crit.defaultWeight === 'number'
          ? (crit.defaultWeight <= 1 ? (crit.defaultWeight * 100).toFixed(2) : crit.defaultWeight)
          : crit.defaultWeight;

        return `
          <tr>
            <td class="text-center">
              <span class="badge ${rank === 1 ? 'bg-warning text-dark fw-bold' : (rank <= 3 ? 'bg-success' : 'bg-secondary')}">
                #${rank}
              </span>
            </td>
            <td class="fw-bold">${crit.code}</td>
            <td>
              <div class="fw-semibold text-dark">${crit.name}</div>
              <div class="small text-muted">${crit.description || ''}</div>
            </td>
            <td><span class="badge ${isCost ? 'badge-bungsu-cost' : 'badge-bungsu-benefit'}">${crit.type.toUpperCase()}</span></td>
            <td>${crit.unit === 'score' ? 'Skor Rubrik (1–100)' : crit.unit}</td>
            <td>
              <span class="fw-bold fs-6 text-dark">${weightPercent}%</span>
              <span class="small text-muted ms-1">(${crit.defaultWeight})</span>
            </td>
            <td>
              ${crit.evalMethod === 'rubric_score' 
                ? '<span class="badge bg-info text-dark">Rubrik Terstandar</span>' 
                : '<span class="badge bg-light text-muted border">Nilai Mentah Langsung</span>'}
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  openEditModal() {
    if (!window.CriteriaRepository) return;
    const criteriaList = window.CriteriaRepository.getAll();

    // Buat salinan kerja terurut berdasarkan priorityRank
    this.modalWorkingList = JSON.parse(JSON.stringify(criteriaList)).sort(
      (a, b) => (a.priorityRank || 99) - (b.priorityRank || 99)
    );

    // Hitung bobot ROC awal
    this.recalculateWorkingWeights();

    const modalHtml = `
      <div class="modal fade" id="editCriteriaModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <div>
                <h5 class="modal-title fw-bold mb-0">Atur Prioritas Kriteria (Metode ROC)</h5>
                <small class="text-muted">Urutkan kriteria dari yang paling penting ke paling tidak penting. Bobot dihitung otomatis oleh sistem.</small>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                <i class="bi bi-info-circle-fill fs-5"></i>
                <div>
                  <strong>Tanpa Hitung Manual:</strong> Anda cukup menaikkan/menurunkan posisi kriteria. Sistem menerapkan rumus matematis 
                  <em>Rank Order Centroid</em>: <code>w<sub>j</sub> = (1/m) &Sigma; (1/k)</code> sehingga total bobot pasti tepat 100%.
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                <span class="small fw-bold text-uppercase text-muted">Daftar Urutan Kepentingan Kriteria</span>
                <span class="badge bg-success" id="modalTotalWeightBadge">Total Bobot: 100.00%</span>
              </div>

              <div class="list-group" id="criteriaRankingList">
                <!-- Di-render oleh renderModalList() -->
              </div>
            </div>
            <div class="modal-footer d-flex justify-content-between">
              <span class="small text-muted">Perubahan langsung berlaku untuk evaluasi SAW toko.</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-bungsu-primary btn-sm" id="btnSaveCriteriaWeights">
                  <i class="bi bi-check2-circle me-1"></i> Terapkan &amp; Simpan Bobot ROC
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const old = document.getElementById('editCriteriaModal');
    if (old) old.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    this.renderModalList();

    // Bind save button
    document.getElementById('btnSaveCriteriaWeights').addEventListener('click', () => {
      this.saveWorkingWeights();
    });

    const modalEl = document.getElementById('editCriteriaModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  },

  recalculateWorkingWeights() {
    if (!window.CriteriaRepository) return;
    const m = this.modalWorkingList.length;
    const weights = window.CriteriaRepository.calculateRocWeights(m);
    this.modalWorkingList.forEach((item, idx) => {
      item.priorityRank = idx + 1;
      item.defaultWeight = weights[idx];
    });
  },

  renderModalList() {
    const listEl = document.getElementById('criteriaRankingList');
    if (!listEl) return;

    listEl.innerHTML = this.modalWorkingList.map((crit, idx) => {
      const rank = idx + 1;
      const isFirst = idx === 0;
      const isLast = idx === this.modalWorkingList.length - 1;
      const weightPercent = (crit.defaultWeight * 100).toFixed(2);
      const isCost = crit.type === 'cost';

      return `
        <div class="list-group-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border">
          <div class="d-flex align-items-center gap-3">
            <div class="text-center" style="min-width: 45px;">
              <span class="badge ${rank === 1 ? 'bg-warning text-dark' : (rank <= 3 ? 'bg-success' : 'bg-secondary')} fs-6">
                #${rank}
              </span>
            </div>
            <div>
              <div class="fw-bold text-dark d-flex align-items-center gap-2">
                <span>${crit.code} &mdash; ${crit.name}</span>
                <span class="badge ${isCost ? 'badge-bungsu-cost' : 'badge-bungsu-benefit'} small">${crit.type.toUpperCase()}</span>
              </div>
              <div class="small text-muted">${crit.description || ''}</div>
            </div>
          </div>

          <div class="d-flex align-items-center gap-3">
            <div class="text-end" style="min-width: 100px;">
              <div class="small text-muted">Bobot ROC:</div>
              <div class="fw-bold fs-6 text-primary">${weightPercent}%</div>
            </div>
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn btn-outline-secondary btn-move-up" data-index="${idx}" ${isFirst ? 'disabled' : ''} title="Naikkan Prioritas">
                <i class="bi bi-arrow-up"></i>
              </button>
              <button type="button" class="btn btn-outline-secondary btn-move-down" data-index="${idx}" ${isLast ? 'disabled' : ''} title="Turunkan Prioritas">
                <i class="bi bi-arrow-down"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind move buttons
    listEl.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        this.swapItems(idx, idx - 1);
      });
    });

    listEl.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        this.swapItems(idx, idx + 1);
      });
    });
  },

  swapItems(fromIdx, toIdx) {
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= this.modalWorkingList.length || toIdx >= this.modalWorkingList.length) {
      return;
    }
    const temp = this.modalWorkingList[fromIdx];
    this.modalWorkingList[fromIdx] = this.modalWorkingList[toIdx];
    this.modalWorkingList[toIdx] = temp;

    this.recalculateWorkingWeights();
    this.renderModalList();
  },

  saveWorkingWeights() {
    this.recalculateWorkingWeights();

    const saveRes = window.CriteriaRepository.saveAll(this.modalWorkingList);
    if (!saveRes.success) {
      alert('Gagal menyimpan bobot kriteria: ' + (saveRes.errors ? saveRes.errors.join(', ') : ''));
      return;
    }

    const modalEl = document.getElementById('editCriteriaModal');
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();

    this.render();

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Bobot ROC Berhasil Diterapkan',
        text: 'Urutan prioritas dan bobot kriteria telah diperbarui secara otomatis.',
        timer: 1800,
        showConfirmButton: false
      });
    }
  },

  confirmResetDefault() {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Reset ke Urutan Prioritas Default Toko?',
        text: 'Konfigurasi bobot akan dikembalikan ke urutan prioritas kanonikal (C1: Rank 1 [37.04%], C2: Rank 2 [22.76%], C3: Rank 3 [15.61%], C4: Rank 4 [10.85%], C5: Rank 5 [7.28%], C6: Rank 6 [4.42%], C7: Rank 7 [2.04%]).',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0B3D2E',
        cancelButtonColor: '#6C757D',
        confirmButtonText: 'Ya, Reset ke Default',
        cancelButtonText: 'Batal'
      }).then((res) => {
        if (res.isConfirmed) {
          window.CriteriaRepository.resetToDefault();
          this.render();
          Swal.fire({
            icon: 'success',
            title: 'Berhasil Direset',
            text: 'Urutan prioritas dan bobot kriteria kembali ke setelan default toko.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    } else {
      if (confirm('Reset bobot ke bawaan toko?')) {
        window.CriteriaRepository.resetToDefault();
        this.render();
      }
    }
  }
};

window.AdminCriteria = AdminCriteria;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('criteriaTableBody')) {
      AdminCriteria.init();
    }
  });
}
