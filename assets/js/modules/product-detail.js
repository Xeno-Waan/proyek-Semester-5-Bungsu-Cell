/**
 * SPK Bungsu Cell — Product Detail Module
 * Menampilkan rincian teknis 7 kriteria smartphone berdasarkan parameter ID di URL.
 * Sesuai PRD.md Bagian 4.2 & IMPLEMENTATION_PLAN.md Fase C.
 */

const ProductDetailModule = {
  init() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
      this.renderNoIdState(container);
      return;
    }

    if (!window.SmartphoneRepository) {
      this.renderErrorState(container, 'Layanan data smartphone tidak tersedia.');
      return;
    }

    const item = window.SmartphoneRepository.getById(productId);
    if (!item) {
      this.renderNotFoundState(container, productId);
      return;
    }

    this.renderDetail(container, item);
  },

  renderNoIdState(container) {
    container.innerHTML = `
      <div class="empty-state-box">
        <i class="bi bi-phone empty-state-icon"></i>
        <h2 class="empty-state-title">Pilih Smartphone dari Katalog</h2>
        <p class="empty-state-desc">
          Tidak ada ID smartphone yang ditentukan pada tautan. Silakan pilih smartphone dari katalog resmi toko Bungsu Cell.
        </p>
        <a href="catalog.html" class="btn btn-bungsu-primary btn-sm">
          <i class="bi bi-grid me-1"></i> Buka Katalog
        </a>
      </div>
    `;
  },

  renderNotFoundState(container, id) {
    container.innerHTML = `
      <div class="empty-state-box">
        <i class="bi bi-exclamation-triangle empty-state-icon text-warning"></i>
        <h2 class="empty-state-title">Smartphone Tidak Ditemukan</h2>
        <p class="empty-state-desc">
          Smartphone dengan ID <code>${id}</code> tidak ditemukan pada sistem penyimpanan browser ini.
        </p>
        <a href="catalog.html" class="btn btn-bungsu-outline btn-sm">
          <i class="bi bi-arrow-left me-1"></i> Kembali ke Katalog
        </a>
      </div>
    `;
  },

  renderDetail(container, item) {
    const formattedPrice = window.formatRupiah ? window.formatRupiah(item.price) : `Rp ${item.price}`;
    const completeness = window.SmartphoneRepository.checkSawCompleteness(item);
    
    // Check if item is in compare list
    const compareList = window.StorageService ? window.StorageService.get(window.STORAGE_KEYS.COMPARE_LIST, []) : [];
    const isCompared = compareList.includes(item.id);

    container.innerHTML = `
      <div class="row g-4">
        <!-- Left: Image & Quick Summary -->
        <div class="col-lg-4">
          <div class="bungsu-card p-4 text-center">
            <span class="badge bg-secondary mb-2">${item.brand}</span>
            <div class="p-4 bg-light rounded-4 my-3">
              <i class="bi bi-phone-fill fs-1 text-success d-inline-block p-4 bg-white rounded-circle shadow-sm"></i>
            </div>
            <h2 class="h4 fw-bold text-dark mb-1">${item.name}</h2>
            <div class="h3 fw-extrabold text-success mb-3">${formattedPrice}</div>
            
            <div class="d-grid gap-2">
              <button 
                type="button" 
                class="btn ${isCompared ? 'btn-warning' : 'btn-bungsu-outline'} btn-sm" 
                id="btnToggleCompareDetail">
                <i class="bi bi-arrow-left-right me-1"></i> 
                ${isCompared ? 'Hapus dari Perbandingan' : 'Bandingkan Smartphone Ini'}
              </button>
              <a href="recommendation.html?budget=${item.price}" class="btn btn-bungsu-accent btn-sm">
                <i class="bi bi-calculator me-1"></i> Gunakan di SPK SAW
              </a>
              <a href="catalog.html" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-arrow-left me-1"></i> Kembali ke Katalog
              </a>
            </div>
          </div>
        </div>

        <!-- Right: Technical Specification Breakdown -->
        <div class="col-lg-8">
          <div class="bungsu-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="h5 fw-bold mb-0">Rincian Spesifikasi Teknis (7 Kriteria SAW)</h3>
              ${completeness.complete 
                ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Data Kriteria Lengkap</span>' 
                : '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-circle me-1"></i>Kriteria Belum Lengkap</span>'}
            </div>

            ${!completeness.complete ? `
              <div class="alert alert-warning py-2 px-3 small mb-3">
                <i class="bi bi-info-circle me-1"></i> 
                Produk ini belum memiliki skor evaluasi untuk: <strong>${completeness.missingCriteria.join(', ')}</strong>. 
                Sesuai aturan SOT, produk yang tidak lengkap tidak akan diikutkan dalam ranking SAW sampai data dilengkapi.
              </div>
            ` : ''}

            <div class="table-responsive">
              <table class="table table-bordered align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th style="width: 200px;">Kriteria</th>
                    <th style="width: 100px;">Sifat</th>
                    <th>Nilai Spesifikasi Produk</th>
                    <th style="width: 150px;">Nilai Evaluasi SAW</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr>
                    <td class="fw-semibold">C1: Harga Smartphone</td>
                    <td><span class="badge-bungsu-cost">Cost</span></td>
                    <td class="fw-bold text-success">${formattedPrice}</td>
                    <td>Nilai mentah (Cost)</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">C2: Kapasitas RAM</td>
                    <td><span class="badge-bungsu-benefit">Benefit</span></td>
                    <td>${item.ram} GB</td>
                    <td>${item.ram} GB</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">C3: Memori Internal (ROM)</td>
                    <td><span class="badge-bungsu-benefit">Benefit</span></td>
                    <td>${item.storage} GB</td>
                    <td>${item.storage} GB</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">C4: Performa Chipset</td>
                    <td><span class="badge-bungsu-benefit">Benefit</span></td>
                    <td>${item.chipsetName || '<span class="text-muted">Standar</span>'}</td>
                    <td>
                      ${item.chipsetScore !== null 
                        ? `<span class="badge bg-primary">${item.chipsetScore} / 100</span>` 
                        : '<span class="badge bg-light text-muted border">Belum dinilai</span>'}
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">C5: Kapasitas Baterai</td>
                    <td><span class="badge-bungsu-benefit">Benefit</span></td>
                    <td>${item.battery} mAh</td>
                    <td>${item.battery} mAh</td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">C6: Kualitas Kamera</td>
                    <td><span class="badge-bungsu-benefit">Benefit</span></td>
                    <td>${item.cameraDesc || '<span class="text-muted">Standar</span>'}</td>
                    <td>
                      ${item.cameraScore !== null 
                        ? `<span class="badge bg-primary">${item.cameraScore} / 100</span>` 
                        : '<span class="badge bg-light text-muted border">Belum dinilai</span>'}
                    </td>
                  </tr>
                  <tr>
                    <td class="fw-semibold">C7: Kualitas Layar</td>
                    <td><span class="badge-bungsu-benefit">Benefit</span></td>
                    <td>${item.screenDesc || '<span class="text-muted">Standar</span>'}</td>
                    <td>
                      ${item.screenScore !== null 
                        ? `<span class="badge bg-primary">${item.screenScore} / 100</span>` 
                        : '<span class="badge bg-light text-muted border">Belum dinilai</span>'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind compare button
    const btnCompare = document.getElementById('btnToggleCompareDetail');
    if (btnCompare && window.CatalogModule) {
      btnCompare.addEventListener('click', () => {
        window.CatalogModule.toggleCompare(item.id);
        this.renderDetail(container, item);
      });
    }
  }
};

window.ProductDetailModule = ProductDetailModule;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productDetailContainer')) {
      ProductDetailModule.init();
    }
  });
}
