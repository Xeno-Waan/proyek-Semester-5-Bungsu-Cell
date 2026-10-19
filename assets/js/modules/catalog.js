/**
 * SPK Bungsu Cell — Catalog Module
 * Menangani rendering kartu produk, pencarian teks, pemfilteran merek/harga/RAM,
 * pengurutan, dan penambahan produk ke daftar bandingkan.
 * Sesuai PRD.md Bagian 4.2 & IMPLEMENTATION_PLAN.md Fase C.
 */

const CatalogModule = {
  currentFilter: {
    search: '',
    brand: 'all',
    maxPrice: 'all',
    minRam: 'all',
    sort: 'default'
  },

  init() {
    this.bindEvents();
    this.populateBrandFilter();
    this.render();
    this.updateCompareBadge();
  },

  bindEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter.search = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    const brandSelect = document.getElementById('brandSelect');
    if (brandSelect) {
      brandSelect.addEventListener('change', (e) => {
        this.currentFilter.brand = e.target.value;
        this.render();
      });
    }

    const priceMaxFilter = document.getElementById('priceMaxFilter');
    if (priceMaxFilter) {
      priceMaxFilter.addEventListener('change', (e) => {
        this.currentFilter.maxPrice = e.target.value;
        this.render();
      });
    }

    const ramFilter = document.getElementById('ramFilter');
    if (ramFilter) {
      ramFilter.addEventListener('change', (e) => {
        this.currentFilter.minRam = e.target.value;
        this.render();
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentFilter.sort = e.target.value;
        this.render();
      });
    }

    const btnResetFilter = document.getElementById('btnResetFilter');
    if (btnResetFilter) {
      btnResetFilter.addEventListener('click', () => {
        this.resetFilters();
      });
    }
  },

  resetFilters() {
    this.currentFilter = {
      search: '',
      brand: 'all',
      maxPrice: 'all',
      minRam: 'all',
      sort: 'default'
    };

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const brandSelect = document.getElementById('brandSelect');
    if (brandSelect) brandSelect.value = 'all';

    const priceMaxFilter = document.getElementById('priceMaxFilter');
    if (priceMaxFilter) priceMaxFilter.value = 'all';

    const ramFilter = document.getElementById('ramFilter');
    if (ramFilter) ramFilter.value = 'all';

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';

    this.render();
  },

  populateBrandFilter() {
    const brandSelect = document.getElementById('brandSelect');
    if (!brandSelect || !window.SmartphoneRepository) return;

    const allItems = window.SmartphoneRepository.getAll();
    const brands = [...new Set(allItems.map(i => i.brand).filter(Boolean))].sort();

    // Preserve default
    brandSelect.innerHTML = '<option value="all">Semua Merek</option>';
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      brandSelect.appendChild(opt);
    });
  },

  getFilteredData() {
    if (!window.SmartphoneRepository) return [];
    let items = window.SmartphoneRepository.getAll();

    // Filter Search
    if (this.currentFilter.search) {
      const q = this.currentFilter.search;
      items = items.filter(item => {
        const nameMatch = item.name && item.name.toLowerCase().includes(q);
        const brandMatch = item.brand && item.brand.toLowerCase().includes(q);
        return nameMatch || brandMatch;
      });
    }

    // Filter Brand
    if (this.currentFilter.brand !== 'all') {
      items = items.filter(item => item.brand === this.currentFilter.brand);
    }

    // Filter Max Price
    if (this.currentFilter.maxPrice !== 'all') {
      const max = Number(this.currentFilter.maxPrice);
      if (!isNaN(max)) {
        items = items.filter(item => Number(item.price) <= max);
      }
    }

    // Filter Min RAM
    if (this.currentFilter.minRam !== 'all') {
      const min = Number(this.currentFilter.minRam);
      if (!isNaN(min)) {
        items = items.filter(item => Number(item.ram) >= min);
      }
    }

    // Sorting
    switch (this.currentFilter.sort) {
      case 'price_asc':
        items.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        items.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name_asc':
        items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        // Default order
        break;
    }

    return items;
  },

  render() {
    const grid = document.getElementById('productGrid');
    const countEl = document.getElementById('catalogResultCount');
    if (!grid) return;

    const allItems = window.SmartphoneRepository ? window.SmartphoneRepository.getAll() : [];
    const filteredItems = this.getFilteredData();

    if (countEl) {
      countEl.textContent = `Menampilkan ${filteredItems.length} produk`;
    }

    // 1. Kasus Tidak Ada Data Smartphone Sama Sekali di Sistem (SOT Data Compliance)
    if (allItems.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="empty-state-box">
            <i class="bi bi-inbox empty-state-icon"></i>
            <h3 class="empty-state-title">Belum Ada Data Smartphone Operasional</h3>
            <p class="empty-state-desc">
              Katalog toko Bungsu Cell saat ini belum memiliki data smartphone yang dimuat. Silakan lakukan input data melalui Panel Admin atau tunggu penyediaan dataset resmi dari toko.
            </p>
            <a href="admin/smartphones.html" class="btn btn-bungsu-primary btn-sm">
              <i class="bi bi-plus-circle me-1"></i> Tambah Data Smartphone di Admin
            </a>
          </div>
        </div>
      `;
      return;
    }

    // 2. Kasus Filter Tidak Menemukan Hasil
    if (filteredItems.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="empty-state-box">
            <i class="bi bi-search empty-state-icon"></i>
            <h3 class="empty-state-title">Tidak Ada Smartphone yang Sesuai</h3>
            <p class="empty-state-desc">
              Tidak ditemukan smartphone yang memenuhi kombinasi pencarian dan filter saat ini. Coba ubah rentang harga atau kata kunci pencarian Anda.
            </p>
            <button class="btn btn-bungsu-outline btn-sm" onclick="CatalogModule.resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Semua Filter
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 3. Render Kartu Produk
    const compareList = window.StorageService ? window.StorageService.get(window.STORAGE_KEYS.COMPARE_LIST, []) : [];

    grid.innerHTML = filteredItems.map(item => {
      const isCompared = compareList.includes(item.id);
      const formattedPrice = window.formatRupiah ? window.formatRupiah(item.price) : `Rp ${item.price}`;

      return `
        <div class="col-md-6 col-xl-4">
          <div class="bungsu-card h-100 d-flex flex-column">
            <div class="p-4 text-center border-bottom bg-light bg-opacity-50 position-relative">
              <span class="badge bg-secondary position-absolute top-0 start-0 m-3">${item.brand}</span>
              ${item.stockStatus ? `<span class="badge ${item.stockStatus === 'Tersedia' ? 'bg-success' : 'bg-warning text-dark'} position-absolute top-0 end-0 m-3">${item.stockStatus}</span>` : ''}
              <div class="my-3">
                <i class="bi bi-phone fs-1 text-success d-inline-block p-3 bg-white rounded-circle shadow-sm"></i>
              </div>
              <h5 class="fw-bold mb-1 text-dark text-truncate" title="${item.name}">${item.name}</h5>
              <div class="fs-5 fw-extrabold text-success">${formattedPrice}</div>
            </div>

            <div class="bungsu-card-body flex-grow-1">
              <div class="row g-2 small text-muted mb-3">
                <div class="col-6">
                  <i class="bi bi-memory me-1 text-primary"></i> RAM: <strong>${item.ram} GB</strong>
                </div>
                <div class="col-6">
                  <i class="bi bi-device-hdd me-1 text-primary"></i> ROM: <strong>${item.storage} GB</strong>
                </div>
                <div class="col-6">
                  <i class="bi bi-battery-charging me-1 text-success"></i> ${item.battery} mAh
                </div>
                <div class="col-6">
                  <i class="bi bi-cpu me-1 text-warning"></i> ${item.chipsetName || 'Chipset standar'}
                </div>
              </div>
            </div>

            <div class="p-3 bg-white border-top d-flex gap-2">
              <a href="product-detail.html?id=${item.id}" class="btn btn-bungsu-outline btn-sm flex-grow-1">
                <i class="bi bi-eye me-1"></i> Detail
              </a>
              <button 
                type="button" 
                class="btn btn-sm ${isCompared ? 'btn-warning' : 'btn-outline-secondary'}" 
                onclick="CatalogModule.toggleCompare('${item.id}')"
                title="${isCompared ? 'Hapus dari perbandingan' : 'Tambahkan ke perbandingan'}">
                <i class="bi bi-arrow-left-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleCompare(id) {
    if (!window.StorageService) return;
    let list = window.StorageService.get(window.STORAGE_KEYS.COMPARE_LIST, []);
    if (!Array.isArray(list)) list = [];

    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      if (list.length >= 3) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'info',
            title: 'Batas Perbandingan',
            text: 'Maksimal 3 smartphone yang dapat dibandingkan secara bersamaan. Silakan hapus salah satu produk terlebih dahulu.',
            confirmButtonColor: '#0B3D2E'
          });
        } else if (typeof alert !== 'undefined') {
          alert('Maksimal 3 smartphone yang dapat dibandingkan secara bersamaan.');
        } else {
          console.warn('Maksimal 3 smartphone yang dapat dibandingkan secara bersamaan.');
        }
        return;
      }
      list.push(id);
    }

    window.StorageService.set(window.STORAGE_KEYS.COMPARE_LIST, list);
    this.updateCompareBadge();
    this.render();
  },

  updateCompareBadge() {
    const badge = document.getElementById('compareCountBadge');
    if (!badge || !window.StorageService) return;

    const list = window.StorageService.get(window.STORAGE_KEYS.COMPARE_LIST, []);
    const count = Array.isArray(list) ? list.length : 0;

    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  },

  renderHomePreview() {
    const container = document.getElementById('homeCatalogContainer');
    if (!container || !window.SmartphoneRepository) return;

    const allItems = window.SmartphoneRepository.getAll();
    if (allItems.length === 0) return; // Tetap pada empty state standar yang sudah ada di HTML

    const previewItems = allItems.slice(0, 3);
    container.className = 'row g-3';
    container.innerHTML = previewItems.map(item => {
      const formattedPrice = window.formatRupiah ? window.formatRupiah(item.price) : `Rp ${item.price}`;
      return `
        <div class="col-md-4">
          <div class="bungsu-card h-100 p-3 text-center">
            <span class="badge bg-secondary mb-2">${item.brand}</span>
            <div class="my-2">
              <i class="bi bi-phone fs-2 text-success"></i>
            </div>
            <h5 class="fw-bold mb-1 small text-truncate" title="${item.name}">${item.name}</h5>
            <div class="fw-bold text-success mb-2">${formattedPrice}</div>
            <a href="product-detail.html?id=${item.id}" class="btn btn-bungsu-outline btn-sm w-100">
              Lihat Detail
            </a>
          </div>
        </div>
      `;
    }).join('');
  }
};

window.CatalogModule = CatalogModule;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productGrid')) {
      CatalogModule.init();
    }
    if (document.getElementById('homeCatalogContainer')) {
      CatalogModule.renderHomePreview();
    }
  });
}
