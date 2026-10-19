/**
 * SPK Bungsu Cell — Recommendation UI Module
 * Menghubungkan form preferensi & anggaran pada recommendation.html dengan SawEngine.
 * Menampilkan Top 3, tabel ranking, transparansi kontribusi skor kriteria, dan data tereksklusi.
 * Sesuai PRD.md Bagian 4.1 & 7 serta IMPLEMENTATION_PLAN.md Fase D.
 */

const RecommendationUI = {
  lastResult: null,

  init() {
    this.checkUrlParams();
    this.bindEvents();
    this.restoreLastResult();
  },

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const budgetParam = urlParams.get('budget');
    if (budgetParam) {
      const budgetInput = document.getElementById('budgetInput');
      if (budgetInput) {
        budgetInput.value = budgetParam;
      }
    }
  },

  bindEvents() {
    const form = document.getElementById('sawPreferenceForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCalculate();
      });
    }
  },

  handleCalculate() {
    const budgetInput = document.getElementById('budgetInput');
    const budgetVal = Number(budgetInput ? budgetInput.value : 0);

    if (!budgetVal || budgetVal <= 0) {
      this.showAlert('Anggaran Tidak Valid', 'Silakan masukkan batas anggaran maksimal dalam angka lebih dari 0.');
      return;
    }

    // Ambil nilai bobot dari form
    const rawWeights = {
      C1: Number(document.getElementById('weightPrice')?.value || 20),
      C2: Number(document.getElementById('weightRam')?.value || 15),
      C3: Number(document.getElementById('weightStorage')?.value || 15),
      C4: Number(document.getElementById('weightChipset')?.value || 15),
      C5: Number(document.getElementById('weightBattery')?.value || 15),
      C6: Number(document.getElementById('weightCamera')?.value || 10),
      C7: Number(document.getElementById('weightScreen')?.value || 10),
    };

    if (!window.SmartphoneRepository || !window.SawEngine) {
      this.showAlert('Error Sistem', 'Modul data atau engine SAW tidak tersedia.');
      return;
    }

    const allItems = window.SmartphoneRepository.getAll();
    const resultsContainer = document.getElementById('recommendationResultsContainer');

    // Kasus 1: Belum Ada Data Smartphone Nyata di Sistem (Patuh SOT)
    if (allItems.length === 0) {
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="empty-state-box">
            <i class="bi bi-database-exclamation empty-state-icon text-warning"></i>
            <h3 class="empty-state-title">Belum Ada Data Smartphone Nyata</h3>
            <p class="empty-state-desc">
              Sistem tidak dapat melakukan perhitungan rekomendasi karena dataset operasional smartphone toko Bungsu Cell belum dimuat. Silakan tambahkan data melalui Panel Admin atau tunggu pembaruan resmi toko.
            </p>
            <a href="admin/smartphones.html" class="btn btn-bungsu-primary btn-sm">
              <i class="bi bi-plus-circle me-1"></i> Tambah Data di Panel Admin
            </a>
          </div>
        `;
      }
      return;
    }

    // Eksekusi engine SAW
    const result = window.SawEngine.execute({
      items: allItems,
      budget: budgetVal,
      rawWeights
    });

    this.lastResult = result;

    // Simpan ke storage untuk laporan
    if (window.StorageService && result.success) {
      window.StorageService.set(window.STORAGE_KEYS.LAST_RECOMMENDATION, result);
    }

    this.renderResults(result);
  },

  renderResults(result) {
    const container = document.getElementById('recommendationResultsContainer');
    if (!container) return;

    if (!result.success) {
      container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i> ${result.error || 'Terjadi kesalahan saat menghitung.'}
        </div>
      `;
      return;
    }

    // Kasus: Tidak ada yang lolos anggaran
    if (result.ranking.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <i class="bi bi-cash-stack empty-state-icon text-muted"></i>
          <h3 class="empty-state-title">Tidak Ada Smartphone yang Sesuai Anggaran</h3>
          <p class="empty-state-desc">
            ${result.message || 'Semua produk di katalog melebihi batas anggaran yang Anda tentukan.'}
          </p>
          <div class="small text-muted p-2 bg-light rounded border mb-3">
            Total produk di atas anggaran: <strong>${result.excluded.overBudget.length} unit</strong>
          </div>
          <button class="btn btn-bungsu-primary btn-sm" onclick="document.getElementById('budgetInput').focus()">
            <i class="bi bi-arrow-clockwise me-1"></i> Sesuaikan Batas Anggaran
          </button>
        </div>
      `;
      return;
    }

    const top3 = result.ranking.slice(0, 3);
    const remaining = result.ranking.slice(3);

    container.innerHTML = `
      <!-- Summary Notification -->
      <div class="alert alert-success d-flex justify-content-between align-items-center py-2 px-3 small mb-4">
        <div>
          <i class="bi bi-check-circle-fill me-1"></i>
          Ditemukan <strong>${result.ranking.length} rekomendasi</strong> smartphone (Batas Anggaran: <strong>${window.formatRupiah ? window.formatRupiah(result.budget) : result.budget}</strong>).
        </div>
        <span class="badge bg-success">Status: Selesai</span>
      </div>

      <!-- Top 3 Showcase Cards -->
      <h3 class="h6 fw-bold text-uppercase text-muted mb-3"><i class="bi bi-trophy-fill text-warning me-1"></i> Rekomendasi Teratas (Top 3)</h3>
      <div class="row g-3 mb-4">
        ${top3.map((entry, idx) => {
          const colors = [
            { badge: 'bg-warning text-dark', label: 'Juara 1 (Paling Direkomendasikan)', border: 'border-warning' },
            { badge: 'bg-secondary text-white', label: 'Juara 2', border: 'border-secondary' },
            { badge: 'bg-dark text-white', label: 'Juara 3', border: 'border-dark' }
          ][idx] || { badge: 'bg-light text-dark', label: `Peringkat ${idx + 1}`, border: '' };

          const formattedPrice = window.formatRupiah ? window.formatRupiah(entry.item.price) : `Rp ${entry.item.price}`;

          return `
            <div class="col-md-4">
              <div class="bungsu-card h-100 p-3 text-center border-2 ${colors.border}">
                <span class="badge ${colors.badge} mb-2 small fw-bold">Rank #${entry.rank}</span>
                <h4 class="h6 fw-bold mb-1 text-truncate" title="${entry.item.name}">${entry.item.name}</h4>
                <div class="text-success fw-bold small mb-2">${formattedPrice}</div>
                
                <div class="bg-light rounded p-2 mb-2">
                  <div class="small text-muted">Skor SAW (V):</div>
                  <div class="fs-5 fw-extrabold text-dark">${entry.finalScore.toFixed(4)}</div>
                  <div class="badge bg-primary text-white">${entry.percentageScore}% Nilai Bobot</div>
                </div>

                <div class="d-grid gap-1 mt-2">
                  <button type="button" class="btn btn-bungsu-outline btn-sm py-1" onclick="RecommendationUI.showDetailModal(${entry.rank})">
                    <i class="bi bi-pie-chart me-1"></i> Kontribusi Skor
                  </button>
                  <a href="product-detail.html?id=${entry.item.id}" class="btn btn-outline-secondary btn-sm py-1">
                    Detail Produk
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Full Ranking Table -->
      <h3 class="h6 fw-bold text-uppercase text-muted mb-2"><i class="bi bi-list-ol me-1"></i> Tabel Peringkat Lengkap</h3>
      <div class="bungsu-card overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th style="width: 60px;">Rank</th>
                <th>Smartphone</th>
                <th>Harga</th>
                <th>RAM/ROM</th>
                <th>Skor SAW (V_i)</th>
                <th>Persentase Skor</th>
                <th class="text-end">Rincian</th>
              </tr>
            </thead>
            <tbody>
              ${result.ranking.map(entry => `
                <tr>
                  <td class="fw-bold text-center">
                    ${entry.rank <= 3 
                      ? `<span class="badge ${entry.rank === 1 ? 'bg-warning text-dark' : (entry.rank === 2 ? 'bg-secondary' : 'bg-dark')} rounded-circle p-1" style="width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;">${entry.rank}</span>` 
                      : `#${entry.rank}`}
                  </td>
                  <td>
                    <div class="fw-bold">${entry.item.name}</div>
                    <div class="text-muted small">${entry.item.brand}</div>
                  </td>
                  <td class="text-success fw-semibold">
                    ${window.formatRupiah ? window.formatRupiah(entry.item.price) : entry.item.price}
                  </td>
                  <td>${entry.item.ram} GB / ${entry.item.storage} GB</td>
                  <td class="fw-bold text-dark">${entry.finalScore.toFixed(4)}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height: 6px;">
                        <div class="progress-bar bg-success" style="width: ${entry.percentageScore}%;"></div>
                      </div>
                      <span class="fw-bold">${entry.percentageScore}%</span>
                    </div>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-link btn-sm p-0 text-success text-decoration-none fw-semibold" onclick="RecommendationUI.showDetailModal(${entry.rank})">
                      Lihat Kontribusi
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Excluded Items Section (Transparency SOT Compliance) -->
      ${(result.excluded.overBudget.length > 0 || result.excluded.incomplete.length > 0) ? `
        <div class="bungsu-card p-3 mb-3 bg-light">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="h6 fw-bold mb-0 text-muted">
              <i class="bi bi-funnel me-1"></i> Data yang Tidak Memenuhi Syarat Evaluasi
            </h4>
            <span class="badge bg-secondary">${result.excluded.overBudget.length + result.excluded.incomplete.length} Unit Dikecualikan</span>
          </div>
          <p class="small text-muted mb-2">
            Sesuai aturan transparansi SOT, smartphone di bawah ini tidak diikutkan dalam ranking rekomendasi:
          </p>
          <ul class="list-group list-group-flush small">
            ${result.excluded.overBudget.map(e => `
              <li class="list-group-item bg-transparent py-1 px-2 text-muted">
                <strong>${e.item.name}</strong> (${e.item.brand}) &mdash; <span class="text-danger">${e.reason}</span>
              </li>
            `).join('')}
            ${result.excluded.incomplete.map(e => `
              <li class="list-group-item bg-transparent py-1 px-2 text-muted">
                <strong>${e.item.name}</strong> (${e.item.brand}) &mdash; <span class="text-warning text-dark">${e.reason}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Disclaimer & Transparency Note -->
      <div class="alert alert-secondary py-2 px-3 small">
        <i class="bi bi-info-circle me-1"></i>
        <strong>Ketentuan Skor:</strong> Skor SAW dihitung menggunakan rumus <code>V_i = &sum; (w_j &times; r_ij)</code>. Persentase merupakan nilai skor terbobot pada skala normalisasi dan bukan merupakan jaminan kecocokan mutlak.
      </div>
    `;
  },

  showDetailModal(rank) {
    if (!this.lastResult || !this.lastResult.ranking) return;
    const entry = this.lastResult.ranking.find(r => r.rank === rank);
    if (!entry) return;

    let rowsHtml = '';
    Object.values(entry.contributions).forEach(c => {
      const isCost = c.type === 'cost';
      rowsHtml += `
        <tr>
          <td class="fw-bold">${c.code}</td>
          <td>${c.name}</td>
          <td><span class="badge ${isCost ? 'badge-bungsu-cost' : 'badge-bungsu-benefit'}">${c.type}</span></td>
          <td>${(c.weight * 100).toFixed(1)}% (${c.weight.toFixed(2)})</td>
          <td class="fw-semibold">${c.normalizedValue}</td>
          <td class="fw-bold text-success">${c.weightedScore}</td>
        </tr>
      `;
    });

    const modalHtml = `
      <div class="modal fade" id="contributionModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title fw-bold">Kontribusi Kriteria — ${entry.item.name} (#Rank ${entry.rank})</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body small">
              <div class="p-3 bg-light rounded mb-3">
                <div class="row text-center">
                  <div class="col-6">
                    <div class="text-muted">Total Skor Preferensi (V_i):</div>
                    <div class="h4 fw-extrabold text-success mb-0">${entry.finalScore.toFixed(4)}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-muted">Persentase Skor:</div>
                    <div class="h4 fw-extrabold text-primary mb-0">${entry.percentageScore}%</div>
                  </div>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-bordered table-sm align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Kode</th>
                      <th>Kriteria</th>
                      <th>Sifat</th>
                      <th>Bobot (w_j)</th>
                      <th>Normalisasi (r_ij)</th>
                      <th>Skor Terbobot (w_j &times; r_ij)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                  <tfoot class="table-light fw-bold">
                    <tr>
                      <td colspan="5" class="text-end">Total Skor Akhir (V_i):</td>
                      <td class="text-success">${entry.finalScore.toFixed(4)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const oldModal = document.getElementById('contributionModal');
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById('contributionModal');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  },

  restoreLastResult() {
    if (!window.StorageService) return;
    const saved = window.StorageService.get(window.STORAGE_KEYS.LAST_RECOMMENDATION);
    if (saved && saved.ranking && saved.ranking.length > 0) {
      this.lastResult = saved;
      this.renderResults(saved);
    }
  },

  showAlert(title, text) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title,
        text,
        confirmButtonColor: '#0B3D2E'
      });
    } else {
      alert(`${title}: ${text}`);
    }
  }
};

window.RecommendationUI = RecommendationUI;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sawPreferenceForm')) {
      RecommendationUI.init();
    }
  });
}
