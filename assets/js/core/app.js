/**
 * SPK Bungsu Cell — Core Application Helper
 * Phase A Foundation: Shared formatting, navbar active state, and UI utilities.
 */

// Currency Formatter Utility
function formatRupiah(number) {
  if (typeof number !== 'number' || isNaN(number)) return 'Rp -';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// Active Nav Link Auto-Highlight
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Public nav links
  document.querySelectorAll('.navbar-bungsu .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  // Admin sidebar links
  document.querySelectorAll('.admin-sidebar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.classList.add('active');
    }
  });

  // Recommendation Form Slider Interactivity
  const sliders = [
    { id: 'weightPrice', label: 'valPrice' },
    { id: 'weightRam', label: 'valRam' },
    { id: 'weightStorage', label: 'valStorage' },
    { id: 'weightChipset', label: 'valChipset' },
    { id: 'weightBattery', label: 'valBattery' },
    { id: 'weightCamera', label: 'valCamera' },
    { id: 'weightScreen', label: 'valScreen' },
  ];

  function updateTotalWeight() {
    let total = 0;
    sliders.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) total += parseInt(el.value, 10) || 0;
    });

    const totalEl = document.getElementById('totalWeightValue');
    const indicatorEl = document.getElementById('weightTotalIndicator');

    if (totalEl) totalEl.textContent = `${total}%`;
    if (indicatorEl) {
      if (total === 100) {
        indicatorEl.className = 'alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-3';
      } else {
        indicatorEl.className = 'alert alert-warning py-2 px-3 small d-flex justify-content-between align-items-center mb-3';
      }
    }
  }

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const labelEl = document.getElementById(s.label);
    if (el && labelEl) {
      el.addEventListener('input', () => {
        labelEl.textContent = `${el.value}%`;
        updateTotalWeight();
      });
    }
  });

  const btnResetWeights = document.getElementById('btnResetWeights');
  if (btnResetWeights) {
    btnResetWeights.addEventListener('click', () => {
      const defaults = {
        weightPrice: 20,
        weightRam: 15,
        weightStorage: 15,
        weightChipset: 15,
        weightBattery: 15,
        weightCamera: 10,
        weightScreen: 10
      };
      Object.keys(defaults).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
          input.value = defaults[key];
          const match = sliders.find(s => s.id === key);
          if (match) {
            const label = document.getElementById(match.label);
            if (label) label.textContent = `${defaults[key]}%`;
          }
        }
      });
      updateTotalWeight();
    });
  }

  // Print Date Auto-Fill
  const printDateEl = document.getElementById('printDate');
  if (printDateEl) {
    const today = new Date();
    printDateEl.textContent = today.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
});

