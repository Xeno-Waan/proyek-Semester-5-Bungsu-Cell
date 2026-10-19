/**
 * SPK Bungsu Cell — Admin Smartphone Management Module
 * Menangani operasi CRUD smartphone riil, validasi form, pencarian, dan konfirmasi hapus.
 * Sesuai PRD.md Bagian 4.3 & IMPLEMENTATION_PLAN.md Fase F.
 */

const AdminSmartphones = {
  currentEditId: null,
  searchQuery: '',
  filterBrand: 'all',

  init() {
    this.bindEvents();
    this.populateBrandFilter();
    this.render();
  },

  bindEvents() {
    // Tombol Buka Modal Tambah
    const btnOpenAdd = document.getElementById('btnOpenAddModal');
    if (btnOpenAdd) {
      btnOpenAdd.addEventListener('click', () => {
        this.resetForm();
      });
    }

    // Form Submit (Tambah / Ubah)
    const form = document.getElementById('smartphoneForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSave();
      });
    }

    // Search Input
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    // Brand Filter
    const brandFilter = document.getElementById('adminBrandFilter');
    if (brandFilter) {
      brandFilter.addEventListener('change', (e) => {
        this.filterBrand = e.target.value;
        this.render();
      });
    }
  },

  resetForm() {
    this.currentEditId = null;
    const form = document.getElementById('smartphoneForm');
    if (form) form.reset();

    const title = document.getElementById('smartphoneModalLabel');
    if (title) title.textContent = 'Tambah Data Smartphone';
  },

  populateBrandFilter() {
    const brandFilter = document.getElementById('adminBrandFilter');
    if (!brandFilter || !window.SmartphoneRepository) return;

    const items = window.SmartphoneRepository.getAll();
    const brands = [...new Set(items.map(i => i.brand).filter(Boolean))].sort();

    brandFilter.innerHTML = '<option value="all">Semua Merek</option>';
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      brandFilter.appendChild(opt);
    });
  },

  getFilteredData() {
    if (!window.SmartphoneRepository) return [];
    let items = window.SmartphoneRepository.getAll();

    if (this.searchQuery) {
      const q = this.searchQuery;
      items = items.filter(item => 
        (item.name && item.name.toLowerCase().includes(q)) || 
        (item.brand && item.brand.toLowerCase().includes(q))
      );
    }

    if (this.filterBrand !== 'all') {
      items = items.filter(item => item.brand === this.filterBrand);
    }

    return items;
  },

  render() {
    const tbody = document.getElementById('smartphoneTableBody');
    const countEl = document.getElementById('adminItemCount');
    if (!tbody || !window.SmartphoneRepository) return;

    const allItems = window.SmartphoneRepository.getAll();
    const items = this.getFilteredData();

    if (countEl) {
      countEl.textContent = `${items.length} dari ${allItems.length} Produk`;
    }

    if (allItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5">
            <i class="bi bi-phone text-muted fs-1 d-block mb-2"></i>
            <div class="fw-bold text-dark mb-1">Belum Ada Data Smartphone Nyata</div>
            <div class="small text-muted mb-3">Klik tombol "Tambah Smartphone" di atas untuk menambahkan data resmi pertama.</div>
          </td>
        </tr>
      `;
      return;
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            <i class="bi bi-search me-1"></i> Tidak ditemukan smartphone yang cocok dengan kata kunci pencarian/filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map((item, idx) => {
      const completeness = window.SmartphoneRepository.checkSawCompleteness(item);
      const formattedPrice = window.formatRupiah ? window.formatRupiah(item.price) : `Rp ${item.price}`;

      return `
        <tr>
          <td class="small text-muted fw-mono">${item.id}</td>
          <td>
            <div class="fw-bold text-dark">${item.name}</div>
            <div class="small text-muted">
              ${completeness.complete 
                ? '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Kriteria SAW Lengkap</span>' 
                : `<span class="text-warning"><i class="bi bi-exclamation-triangle-fill me-1"></i>Kurang: ${completeness.missingCriteria.length} skor</span>`}
            </div>
          </td>
          <td><span class="badge bg-secondary">${item.brand}</span></td>
          <td class="fw-bold text-success">${formattedPrice}</td>
          <td>${item.ram} GB</td>
          <td>${item.storage} GB</td>
          <td>${item.battery} mAh</td>
          <td class="text-end text-nowrap">
            <button class="btn btn-outline-primary btn-sm py-0 px-2 me-1" onclick="AdminSmartphones.openEditModal('${item.id}')" title="Ubah data">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm py-0 px-2" onclick="AdminSmartphones.confirmDelete('${item.id}')" title="Hapus data">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openEditModal(id) {
    if (!window.SmartphoneRepository) return;
    const item = window.SmartphoneRepository.getById(id);
    if (!item) return;

    this.currentEditId = id;

    const title = document.getElementById('smartphoneModalLabel');
    if (title) title.textContent = `Ubah Data — ${item.name}`;

    document.getElementById('inputModelName').value = item.name || '';
    document.getElementById('inputBrand').value = item.brand || '';
    document.getElementById('inputPrice').value = item.price || '';
    document.getElementById('inputRam').value = item.ram || '';
    document.getElementById('inputStorage').value = item.storage || '';
    document.getElementById('inputBattery').value = item.battery || '';
    document.getElementById('inputChipsetName').value = item.chipsetName || '';
    document.getElementById('inputChipsetScore').value = item.chipsetScore !== null ? item.chipsetScore : '';
    document.getElementById('inputCameraDesc').value = item.cameraDesc || '';
    document.getElementById('inputCameraScore').value = item.cameraScore !== null ? item.cameraScore : '';
    document.getElementById('inputScreenDesc').value = item.screenDesc || '';
    document.getElementById('inputScreenScore').value = item.screenScore !== null ? item.screenScore : '';
    document.getElementById('inputStockStatus').value = item.stockStatus || 'Tersedia';

    const modalEl = document.getElementById('smartphoneModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.show();
    }
  },

  handleSave() {
    const data = {
      name: document.getElementById('inputModelName')?.value || '',
      brand: document.getElementById('inputBrand')?.value || '',
      price: Number(document.getElementById('inputPrice')?.value || 0),
      ram: Number(document.getElementById('inputRam')?.value || 0),
      storage: Number(document.getElementById('inputStorage')?.value || 0),
      battery: Number(document.getElementById('inputBattery')?.value || 0),
      chipsetName: document.getElementById('inputChipsetName')?.value || '',
      chipsetScore: document.getElementById('inputChipsetScore')?.value ? Number(document.getElementById('inputChipsetScore').value) : null,
      cameraDesc: document.getElementById('inputCameraDesc')?.value || '',
      cameraScore: document.getElementById('inputCameraScore')?.value ? Number(document.getElementById('inputCameraScore').value) : null,
      screenDesc: document.getElementById('inputScreenDesc')?.value || '',
      screenScore: document.getElementById('inputScreenScore')?.value ? Number(document.getElementById('inputScreenScore').value) : null,
      stockStatus: document.getElementById('inputStockStatus')?.value || 'Tersedia'
    };

    let result;
    if (this.currentEditId) {
      result = window.SmartphoneRepository.update(this.currentEditId, data);
    } else {
      result = window.SmartphoneRepository.create(data);
    }

    if (!result.success) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: result.errors ? result.errors.join('\n') : 'Terjadi kesalahan validasi.',
          confirmButtonColor: '#0B3D2E'
        });
      } else {
        alert('Gagal: ' + (result.errors ? result.errors.join(', ') : 'Error'));
      }
      return;
    }

    // Tutup modal
    const modalEl = document.getElementById('smartphoneModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    this.populateBrandFilter();
    this.render();

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan',
        text: `Data smartphone "${data.name}" berhasil ${this.currentEditId ? 'diperbarui' : 'ditambahkan'}.`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  },

  confirmDelete(id) {
    if (!window.SmartphoneRepository) return;
    const item = window.SmartphoneRepository.getById(id);
    if (!item) return;

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Hapus Smartphone?',
        text: `Apakah Anda yakin ingin menghapus "${item.name}"? Data akan terhapus dari browser ini.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC3545',
        cancelButtonColor: '#6C757D',
        confirmButtonText: 'Ya, Hapus Data',
        cancelButtonText: 'Batal'
      }).then((res) => {
        if (res.isConfirmed) {
          this.executeDelete(id, item.name);
        }
      });
    } else {
      if (confirm(`Hapus "${item.name}"?`)) {
        this.executeDelete(id, item.name);
      }
    }
  },

  executeDelete(id, name) {
    const res = window.SmartphoneRepository.delete(id);
    if (!res.success) {
      if (typeof Swal !== 'undefined') {
        Swal.fire('Gagal', res.errors ? res.errors.join(', ') : 'Gagal menghapus.', 'error');
      } else {
        alert('Gagal menghapus.');
      }
      return;
    }

    // Bersihkan dari compare list jika ada
    if (window.StorageService) {
      let comp = window.StorageService.get(window.STORAGE_KEYS.COMPARE_LIST, []);
      if (Array.isArray(comp)) {
        comp = comp.filter(i => i !== id);
        window.StorageService.set(window.STORAGE_KEYS.COMPARE_LIST, comp);
      }
    }

    this.populateBrandFilter();
    this.render();

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: `Smartphone "${name}" berhasil dihapus.`,
        timer: 1800,
        showConfirmButton: false
      });
    }
  }
};

window.AdminSmartphones = AdminSmartphones;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('smartphoneTableBody')) {
      AdminSmartphones.init();
    }
  });
}
