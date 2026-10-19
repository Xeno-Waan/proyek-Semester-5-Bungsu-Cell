/**
 * SPK Bungsu Cell — Admin Reports Module
 * Menangani pembuatan laporan katalog, laporan hasil rekomendasi SPK,
 * fungsi cetak bersih dokumen, dan ekspor data ke file CSV.
 * Sesuai PRD.md Bagian 4.3 & IMPLEMENTATION_PLAN.md Fase G.
 */

const AdminReports = {
  currentType: 'catalog',

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const typeSelect = document.getElementById('reportTypeSelect');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.currentType = e.target.value;
        this.render();
      });
    }

    const btnExport = document.getElementById('btnExportCsv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        this.exportCsv();
      });
    }
  },

  render() {
    const area = document.getElementById('reportTableArea');
    if (!area) return;

    if (this.currentType === 'catalog') {
      this.renderCatalogReport(area);
    } else {
      this.renderSawReport(area);
    }
  },

  renderCatalogReport(area) {
    if (!window.SmartphoneRepository) return;
    const items = window.SmartphoneRepository.getAll();

    if (items.length === 0) {
      area.innerHTML = `
        <div class="empty-state-box">
          <i class="bi bi-inbox empty-state-icon"></i>
          <h3 class="empty-state-title">Belum Ada Data Smartphone untuk Dilaporkan</h3>
          <p class="empty-state-desc">
            Katalog smartphone saat ini masih kosong. Silakan tambahkan data smartphone terlebih dahulu melalui menu Data Smartphone.
          </p>
          <a href="smartphones.html" class="btn btn-bungsu-primary btn-sm">
            <i class="bi bi-plus-circle me-1"></i> Tambah Data Smartphone
          </a>
        </div>
      `;
      return;
    }

    const rowsHtml = items.map((item, idx) => {
      const formattedPrice = window.formatRupiah ? window.formatRupiah(item.price) : `Rp ${item.price}`;
      return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="fw-bold">${item.name}</td>
          <td>${item.brand}</td>
          <td class="text-success fw-semibold">${formattedPrice}</td>
          <td>${item.ram} GB</td>
          <td>${item.storage} GB</td>
          <td>${item.battery} mAh</td>
          <td>${item.chipsetName || '-'} (${item.chipsetScore !== null ? item.chipsetScore : '-'})</td>
          <td>${item.cameraScore !== null ? item.cameraScore : '-'}</td>
          <td>${item.screenScore !== null ? item.screenScore : '-'}</td>
          <td><span class="badge ${item.stockStatus === 'Tersedia' ? 'bg-success' : 'bg-secondary'}">${item.stockStatus || 'Tersedia'}</span></td>
        </tr>
      `;
    }).join('');

    area.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h6 fw-bold mb-0 text-uppercase"><i class="bi bi-table me-1"></i> Data Master Smartphone Toko</h3>
        <span class="badge bg-secondary">Total: ${items.length} Unit Terdaftar</span>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered table-sm align-middle small mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 40px;" class="text-center">No</th>
              <th>Nama Smartphone</th>
              <th>Merek</th>
              <th>Harga</th>
              <th>RAM</th>
              <th>ROM</th>
              <th>Baterai</th>
              <th>Chipset (Skor)</th>
              <th>Kamera (Skor)</th>
              <th>Layar (Skor)</th>
              <th>Stok</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  },

  renderSawReport(area) {
    if (!window.StorageService) return;
    const lastRec = window.StorageService.get(window.STORAGE_KEYS.LAST_RECOMMENDATION);

    if (!lastRec || !lastRec.ranking || lastRec.ranking.length === 0) {
      area.innerHTML = `
        <div class="empty-state-box">
          <i class="bi bi-calculator empty-state-icon text-muted"></i>
          <h3 class="empty-state-title">Belum Ada Riwayat Perhitungan SPK</h3>
          <p class="empty-state-desc">
            Sesi browser ini belum melakukan perhitungan rekomendasi SAW. Silakan jalankan perhitungan melalui halaman Rekomendasi SPK.
          </p>
          <a href="../recommendation.html" class="btn btn-bungsu-primary btn-sm">
            <i class="bi bi-calculator me-1"></i> Buka Halaman Rekomendasi
          </a>
        </div>
      `;
      return;
    }

    const rowsHtml = lastRec.ranking.map(entry => {
      const formattedPrice = window.formatRupiah ? window.formatRupiah(entry.item.price) : `Rp ${entry.item.price}`;
      return `
        <tr>
          <td class="text-center fw-bold">#${entry.rank}</td>
          <td class="fw-bold">${entry.item.name}</td>
          <td>${entry.item.brand}</td>
          <td class="text-success fw-semibold">${formattedPrice}</td>
          <td>${entry.item.ram} GB / ${entry.item.storage} GB</td>
          <td class="fw-bold text-dark">${entry.finalScore.toFixed(4)}</td>
          <td class="fw-bold text-primary">${entry.percentageScore}%</td>
        </tr>
      `;
    }).join('');

    area.innerHTML = `
      <div class="p-3 bg-light rounded border mb-3">
        <div class="row g-2 small">
          <div class="col-md-4">
            <span class="text-muted">Batas Anggaran:</span>
            <strong class="text-dark d-block">${window.formatRupiah ? window.formatRupiah(lastRec.budget) : lastRec.budget}</strong>
          </div>
          <div class="col-md-4">
            <span class="text-muted">Total Rekomendasi Terhitung:</span>
            <strong class="text-dark d-block">${lastRec.ranking.length} Smartphone</strong>
          </div>
          <div class="col-md-4">
            <span class="text-muted">Unit Melebihi Anggaran:</span>
            <strong class="text-danger d-block">${lastRec.excluded ? lastRec.excluded.overBudget.length : 0} Unit</strong>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-2">
        <h3 class="h6 fw-bold mb-0 text-uppercase"><i class="bi bi-trophy me-1"></i> Peringkat Rekomendasi Smartphone (Metode SAW)</h3>
        <span class="badge bg-success">Status: Terhitung Akurat</span>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-sm align-middle small mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 60px;" class="text-center">Rank</th>
              <th>Nama Smartphone</th>
              <th>Merek</th>
              <th>Harga</th>
              <th>RAM / ROM</th>
              <th>Skor SAW (V_i)</th>
              <th>Persentase Skor</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  },

  exportCsv() {
    let csvContent = '';
    let fileName = '';

    if (this.currentType === 'catalog') {
      const items = window.SmartphoneRepository ? window.SmartphoneRepository.getAll() : [];
      if (items.length === 0) {
        this.showWarning('Tidak Ada Data', 'Tidak ada data smartphone untuk diekspor ke CSV.');
        return;
      }

      fileName = 'laporan_katalog_smartphone_bungsu_cell.csv';
      const headers = ['ID', 'Nama Smartphone', 'Merek', 'Harga', 'RAM (GB)', 'ROM (GB)', 'Baterai (mAh)', 'Chipset', 'Skor Chipset', 'Kamera', 'Skor Kamera', 'Layar', 'Skor Layar', 'Status Stok'];
      const rows = items.map(i => [
        `"${i.id}"`,
        `"${i.name.replace(/"/g, '""')}"`,
        `"${i.brand.replace(/"/g, '""')}"`,
        i.price,
        i.ram,
        i.storage,
        i.battery,
        `"${(i.chipsetName || '').replace(/"/g, '""')}"`,
        i.chipsetScore !== null ? i.chipsetScore : '',
        `"${(i.cameraDesc || '').replace(/"/g, '""')}"`,
        i.cameraScore !== null ? i.cameraScore : '',
        `"${(i.screenDesc || '').replace(/"/g, '""')}"`,
        i.screenScore !== null ? i.screenScore : '',
        `"${i.stockStatus || 'Tersedia'}"`
      ]);

      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    } else {
      const lastRec = window.StorageService ? window.StorageService.get(window.STORAGE_KEYS.LAST_RECOMMENDATION) : null;
      if (!lastRec || !lastRec.ranking || lastRec.ranking.length === 0) {
        this.showWarning('Tidak Ada Data', 'Tidak ada riwayat hasil rekomendasi SPK untuk diekspor ke CSV.');
        return;
      }

      fileName = 'laporan_rekomendasi_saw_bungsu_cell.csv';
      const headers = ['Peringkat', 'ID', 'Nama Smartphone', 'Merek', 'Harga', 'RAM (GB)', 'ROM (GB)', 'Baterai (mAh)', 'Skor SAW (Vi)', 'Persentase Skor (%)'];
      const rows = lastRec.ranking.map(entry => [
        entry.rank,
        `"${entry.item.id}"`,
        `"${entry.item.name.replace(/"/g, '""')}"`,
        `"${entry.item.brand.replace(/"/g, '""')}"`,
        entry.item.price,
        entry.item.ram,
        entry.item.storage,
        entry.item.battery,
        entry.finalScore.toFixed(4),
        entry.percentageScore
      ]);

      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    }

    // Trigger download via Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Ekspor Berhasil',
        text: `File "${fileName}" berhasil diunduh.`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  },

  showWarning(title, text) {
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

window.AdminReports = AdminReports;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reportTableArea')) {
      AdminReports.init();
    }
  });
}
