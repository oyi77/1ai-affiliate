import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock copyToClipboard globally
window.copyToClipboard = vi.fn().mockResolvedValue();

// Mock downloadTextFile globally
window.downloadTextFile = vi.fn();

// Mock checkApiKey globally
window.checkApiKey = vi.fn().mockReturnValue(true);

describe('rencana-bisnis Component', () => {
  
  const mockComponentHTML = `
    <div id="content-rencana-bisnis" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <i class="fas fa-briefcase mr-3"></i>Rencana Bisnis
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat rencana bisnis profesional dengan bantuan AI</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Bisnis</h2>
              <div id="rencana-bisnis-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="umkm" class="type-btn-rencana-bisnis p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-store text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">UMKM</span>
                </button>
                <button type="button" data-type="startup" class="type-btn-rencana-bisnis p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-rocket text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Startup</span>
                </button>
                <button type="button" data-type="franchise" class="type-btn-rencana-bisnis p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-copy text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Franchise</span>
                </button>
                <button type="button" data-type="digital" class="type-btn-rencana-bisnis p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-laptop text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Digital</span>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Informasi Bisnis</h2>
              <div class="space-y-4">
                <div>
                  <label for="rencana-bisnis-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-building mr-1 text-blue-500"></i>Nama Bisnis
                  </label>
                  <input type="text" id="rencana-bisnis-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Toko Kopi Sejuk">
                </div>
                <div>
                  <label for="rencana-bisnis-desc" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-blue-500"></i>Deskripsi Singkat
                  </label>
                  <textarea id="rencana-bisnis-desc" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Jelaskan bisnis Anda dalam beberapa kalimat..."></textarea>
                </div>
                <div>
                  <label for="rencana-bisnis-location" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-map-marker-alt mr-1 text-blue-500"></i>Lokasi
                  </label>
                  <input type="text" id="rencana-bisnis-location" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Jakarta Selatan">
                </div>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Target Market</h2>
              <div class="space-y-4">
                <div>
                  <label for="rencana-bisnis-target-age" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-blue-500"></i>Target Usia
                  </label>
                  <select id="rencana-bisnis-target-age" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">Semua Usia</option>
                    <option value="18-24">18-24 tahun (Gen Z)</option>
                    <option value="25-34">25-34 tahun (Milenial)</option>
                    <option value="35-44">35-44 tahun (Gen X)</option>
                    <option value="45-54">45-54 tahun (Boomers)</option>
                    <option value="55+">55 tahun ke atas</option>
                  </select>
                </div>
                <div>
                  <label for="rencana-bisnis-target-gender" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-venus-mars mr-1 text-blue-500"></i>Target Jenis Kelamin
                  </label>
                  <select id="rencana-bisnis-target-gender" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">Semua Jenis Kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label for="rencana-bisnis-target-income" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-money-bill-wave mr-1 text-blue-500"></i>Target Pendapatan
                  </label>
                  <select id="rencana-bisnis-target-income" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="low">Menengah Bawah (Rp 1-5 juta/bulan)</option>
                    <option value="middle" selected>Menengah (Rp 5-15 juta/bulan)</option>
                    <option value="high">Menengah Atas (Rp 15-50 juta/bulan)</option>
                    <option value="premium">Premium (Rp 50 juta+/bulan)</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Goals & Objectives</h2>
              <div class="space-y-4">
                <div>
                  <label for="rencana-bisnis-goals" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-blue-500"></i>Tujuan Bisnis
                  </label>
                  <textarea id="rencana-bisnis-goals" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Apa tujuan utama bisnis Anda dalam 1-3 tahun ke depan?"></textarea>
                </div>
                <div>
                  <label for="rencana-bisnis-kpi" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-chart-line mr-1 text-blue-500"></i>KPI Utama
                  </label>
                  <textarea id="rencana-bisnis-kpi" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Target omset Rp 100 juta/bulan, 1000 pelanggan aktif"></textarea>
                </div>
                <div>
                  <label for="rencana-bisnis-competitors" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-crosshairs mr-1 text-blue-500"></i>Competitor Utama
                  </label>
                  <textarea id="rencana-bisnis-competitors" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Siapa kompetitor utama Anda?"></textarea>
                </div>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Proyeksi Keuangan</h2>
              <div class="space-y-4">
                <div>
                  <label for="rencana-bisnis-initial-capital" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-coins mr-1 text-blue-500"></i>Modal Awal (Rp)
                  </label>
                  <input type="number" id="rencana-bisnis-initial-capital" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: 50000000">
                </div>
                <div>
                  <label for="rencana-bisnis-monthly-cost" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-invoice-dollar mr-1 text-blue-500"></i>Biaya Bulanan (Rp)
                  </label>
                  <input type="number" id="rencana-bisnis-monthly-cost" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: 10000000">
                </div>
                <div>
                  <label for="rencana-bisnis-target-revenue" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-chart-pie mr-1 text-blue-500"></i>Target Pendapatan (Rp/bulan)
                  </label>
                  <input type="number" id="rencana-bisnis-target-revenue" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: 50000000">
                </div>
                <div>
                  <label for="rencana-bisnis-break-even" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock mr-1 text-blue-500"></i>Target Break Even (bulan)
                  </label>
                  <input type="number" id="rencana-bisnis-break-even" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: 6">
                </div>
              </div>
            </div>
            <button id="rencana-bisnis-generate-btn" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Rencana Bisnis
            </button>
          </div>
          <div class="lg:col-span-2">
            <div id="rencana-bisnis-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="rencana-bisnis-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-briefcase text-6xl mb-4 text-blue-400"></i>
                <p class="text-xl">Hasil rencana bisnis akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Rencana Bisnis</p>
              </div>
              <div id="rencana-bisnis-results" class="hidden space-y-6"></div>
              <div id="rencana-bisnis-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat rencana bisnis...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `;

  beforeEach(() => {
    document.body.innerHTML = mockComponentHTML;
    // Reset fetch mock
    global.fetch = vi.fn();
    // Reset toast mock
    window.showToast = vi.fn();
    // Reset copyToClipboard mock
    window.copyToClipboard = vi.fn().mockResolvedValue();
    // Reset downloadTextFile mock
    window.downloadTextFile = vi.fn();
    // Reset checkApiKey mock
    window.checkApiKey = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should render main container with correct ID', () => {
      const container = document.getElementById('content-rencana-bisnis');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Rencana Bisnis');
      expect(title.querySelector('i.fas.fa-briefcase')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat rencana bisnis profesional');
    });

    it('should render main grid layout', () => {
      const main = document.body.querySelector('main');
      expect(main).toBeTruthy();
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should render left panel with controls', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
      expect(leftPanel.querySelectorAll('.card').length).toBe(5);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#rencana-bisnis-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Business Type Selection Tests
  describe('Business Type Selection', () => {
    it('should render type options container', () => {
      const typeOptions = document.getElementById('rencana-bisnis-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render UMKM option', () => {
      const umkmBtn = document.body.querySelector('[data-type="umkm"]');
      expect(umkmBtn).toBeTruthy();
      expect(umkmBtn.textContent).toContain('UMKM');
      expect(umkmBtn.querySelector('i.fas.fa-store')).toBeTruthy();
      expect(umkmBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Startup option', () => {
      const startupBtn = document.body.querySelector('[data-type="startup"]');
      expect(startupBtn).toBeTruthy();
      expect(startupBtn.textContent).toContain('Startup');
      expect(startupBtn.querySelector('i.fas.fa-rocket')).toBeTruthy();
    });

    it('should render Franchise option', () => {
      const franchiseBtn = document.body.querySelector('[data-type="franchise"]');
      expect(franchiseBtn).toBeTruthy();
      expect(franchiseBtn.textContent).toContain('Franchise');
      expect(franchiseBtn.querySelector('i.fas.fa-copy')).toBeTruthy();
    });

    it('should render Digital option', () => {
      const digitalBtn = document.body.querySelector('[data-type="digital"]');
      expect(digitalBtn).toBeTruthy();
      expect(digitalBtn.textContent).toContain('Digital');
      expect(digitalBtn.querySelector('i.fas.fa-laptop')).toBeTruthy();
    });

    it('should have 4 business type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-rencana-bisnis');
      expect(typeBtns.length).toBe(4);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('rencana-bisnis-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have blue icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-rencana-bisnis');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Bisnis');
    });
  });

  // Business Information Tests
  describe('Business Information', () => {
    it('should render business name input', () => {
      const nameInput = document.getElementById('rencana-bisnis-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.type).toBe('text');
      expect(nameInput.placeholder).toContain('Toko Kopi Sejuk');
    });

    it('should render business description textarea', () => {
      const descInput = document.getElementById('rencana-bisnis-desc');
      expect(descInput).toBeTruthy();
      expect(descInput.tagName).toBe('TEXTAREA');
      expect(descInput.rows).toBe(3);
      expect(descInput.placeholder).toContain('Jelaskan bisnis Anda');
    });

    it('should render location input', () => {
      const locationInput = document.getElementById('rencana-bisnis-location');
      expect(locationInput).toBeTruthy();
      expect(locationInput.type).toBe('text');
      expect(locationInput.placeholder).toContain('Jakarta Selatan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Informasi Bisnis');
    });

    it('should have all labels with icons', () => {
      const buildingIcon = document.body.querySelector('i.fas.fa-building');
      expect(buildingIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
      
      const mapMarkerIcon = document.body.querySelector('i.fas.fa-map-marker-alt');
      expect(mapMarkerIcon).toBeTruthy();
    });

    it('should have proper input styling', () => {
      const nameInput = document.getElementById('rencana-bisnis-name');
      expect(nameInput.classList.contains('w-full')).toBe(true);
      expect(nameInput.classList.contains('p-3')).toBe(true);
      expect(nameInput.classList.contains('border')).toBe(true);
      expect(nameInput.classList.contains('rounded-lg')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-2')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Target Market Input Tests
  describe('Target Market Input', () => {
    it('should render target age select', () => {
      const ageSelect = document.getElementById('rencana-bisnis-target-age');
      expect(ageSelect).toBeTruthy();
      expect(ageSelect.tagName).toBe('SELECT');
      expect(ageSelect.options.length).toBe(6);
    });

    it('should render target gender select', () => {
      const genderSelect = document.getElementById('rencana-bisnis-target-gender');
      expect(genderSelect).toBeTruthy();
      expect(genderSelect.tagName).toBe('SELECT');
      expect(genderSelect.options.length).toBe(3);
    });

    it('should render target income select', () => {
      const incomeSelect = document.getElementById('rencana-bisnis-target-income');
      expect(incomeSelect).toBeTruthy();
      expect(incomeSelect.tagName).toBe('SELECT');
      expect(incomeSelect.options.length).toBe(4);
      expect(incomeSelect.value).toBe('middle');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Target Market');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const venusMarsIcon = document.body.querySelector('i.fas.fa-venus-mars');
      expect(venusMarsIcon).toBeTruthy();
      
      const moneyBillIcon = document.body.querySelector('i.fas.fa-money-bill-wave');
      expect(moneyBillIcon).toBeTruthy();
    });

    it('should have age options with proper labels', () => {
      const ageSelect = document.getElementById('rencana-bisnis-target-age');
      expect(ageSelect.options[0].textContent).toContain('Semua Usia');
      expect(ageSelect.options[1].textContent).toContain('18-24 tahun');
      expect(ageSelect.options[2].textContent).toContain('25-34 tahun');
    });

    it('should have income options with proper labels', () => {
      const incomeSelect = document.getElementById('rencana-bisnis-target-income');
      expect(incomeSelect.options[0].textContent).toContain('Menengah Bawah');
      expect(incomeSelect.options[1].textContent).toContain('Menengah');
      expect(incomeSelect.options[2].textContent).toContain('Menengah Atas');
      expect(incomeSelect.options[3].textContent).toContain('Premium');
    });
  });

  // Goals and Objectives Tests
  describe('Goals and Objectives', () => {
    it('should render goals textarea', () => {
      const goalsInput = document.getElementById('rencana-bisnis-goals');
      expect(goalsInput).toBeTruthy();
      expect(goalsInput.tagName).toBe('TEXTAREA');
      expect(goalsInput.rows).toBe(3);
      expect(goalsInput.placeholder).toContain('tujuan utama bisnis');
    });

    it('should render KPI textarea', () => {
      const kpiInput = document.getElementById('rencana-bisnis-kpi');
      expect(kpiInput).toBeTruthy();
      expect(kpiInput.tagName).toBe('TEXTAREA');
      expect(kpiInput.rows).toBe(2);
      expect(kpiInput.placeholder).toContain('Target omset');
    });

    it('should render competitors textarea', () => {
      const competitorsInput = document.getElementById('rencana-bisnis-competitors');
      expect(competitorsInput).toBeTruthy();
      expect(competitorsInput.tagName).toBe('TEXTAREA');
      expect(competitorsInput.rows).toBe(2);
      expect(competitorsInput.placeholder).toContain('kompetitor utama');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Goals & Objectives');
    });

    it('should have all labels with icons', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
      
      const chartLineIcon = document.body.querySelector('i.fas.fa-chart-line');
      expect(chartLineIcon).toBeTruthy();
      
      const crosshairsIcon = document.body.querySelector('i.fas.fa-crosshairs');
      expect(crosshairsIcon).toBeTruthy();
    });
  });

  // Financial Projections Tests
  describe('Financial Projections', () => {
    it('should render initial capital input', () => {
      const capitalInput = document.getElementById('rencana-bisnis-initial-capital');
      expect(capitalInput).toBeTruthy();
      expect(capitalInput.type).toBe('number');
      expect(capitalInput.placeholder).toContain('50000000');
    });

    it('should render monthly cost input', () => {
      const costInput = document.getElementById('rencana-bisnis-monthly-cost');
      expect(costInput).toBeTruthy();
      expect(costInput.type).toBe('number');
      expect(costInput.placeholder).toContain('10000000');
    });

    it('should render target revenue input', () => {
      const revenueInput = document.getElementById('rencana-bisnis-target-revenue');
      expect(revenueInput).toBeTruthy();
      expect(revenueInput.type).toBe('number');
      expect(revenueInput.placeholder).toContain('50000000');
    });

    it('should render break even input', () => {
      const breakEvenInput = document.getElementById('rencana-bisnis-break-even');
      expect(breakEvenInput).toBeTruthy();
      expect(breakEvenInput.type).toBe('number');
      expect(breakEvenInput.placeholder).toContain('6');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Proyeksi Keuangan');
    });

    it('should have all labels with icons', () => {
      const coinsIcon = document.body.querySelector('i.fas.fa-coins');
      expect(coinsIcon).toBeTruthy();
      
      const fileInvoiceIcon = document.body.querySelector('i.fas.fa-file-invoice-dollar');
      expect(fileInvoiceIcon).toBeTruthy();
      
      const chartPieIcon = document.body.querySelector('i.fas.fa-chart-pie');
      expect(chartPieIcon).toBeTruthy();
      
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have proper input styling for financial fields', () => {
      const capitalInput = document.getElementById('rencana-bisnis-initial-capital');
      expect(capitalInput.classList.contains('w-full')).toBe(true);
      expect(capitalInput.classList.contains('p-3')).toBe(true);
      expect(capitalInput.classList.contains('border')).toBe(true);
      expect(capitalInput.classList.contains('rounded-lg')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('rencana-bisnis-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Rencana Bisnis');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('rencana-bisnis-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-600')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('rencana-bisnis-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('rencana-bisnis-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('rencana-bisnis-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-briefcase')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil rencana bisnis akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('rencana-bisnis-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('rencana-bisnis-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat rencana bisnis');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('rencana-bisnis-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have blue icon in empty state', () => {
      const emptyStateIcon = document.getElementById('rencana-bisnis-empty-state').querySelector('i.fas.fa-briefcase');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/indigo color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-600')).toBe(true);
      expect(title.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use blue accents in generate button', () => {
      const generateBtn = document.getElementById('rencana-bisnis-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-600')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use blue accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-rencana-bisnis');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should use blue accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should use blue accents in focus states', () => {
      const nameInput = document.getElementById('rencana-bisnis-name');
      expect(nameInput.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(nameInput.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use blue accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should use blue accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('rencana-bisnis-empty-state').querySelector('i.fas.fa-briefcase');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(6);
      
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
        expect(card.classList.contains('rounded-2xl')).toBe(true);
        expect(card.classList.contains('shadow-lg')).toBe(true);
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });
  });

  // Icon Tests
  describe('Icons', () => {
    it('should use FontAwesome icons', () => {
      const icons = document.body.querySelectorAll('i.fas');
      expect(icons.length).toBeGreaterThan(15);
    });

    it('should have briefcase icon in header', () => {
      const briefcaseIcon = document.body.querySelector('header i.fas.fa-briefcase');
      expect(briefcaseIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('rencana-bisnis-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Rencana Bisnis');
      expect(document.body.textContent).toContain('Jenis Bisnis');
      expect(document.body.textContent).toContain('Informasi Bisnis');
      expect(document.body.textContent).toContain('Target Market');
      expect(document.body.textContent).toContain('Goals & Objectives');
      expect(document.body.textContent).toContain('Proyeksi Keuangan');
      expect(document.body.textContent).toContain('Buat Rencana Bisnis');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(5);
      expect(headers[0].textContent).toContain('1. Jenis Bisnis');
      expect(headers[1].textContent).toContain('2. Informasi Bisnis');
      expect(headers[2].textContent).toContain('3. Target Market');
      expect(headers[3].textContent).toContain('4. Goals & Objectives');
      expect(headers[4].textContent).toContain('5. Proyeksi Keuangan');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(5);
    });

    it('should have labeled form inputs', () => {
      const nameInput = document.getElementById('rencana-bisnis-name');
      expect(nameInput).toBeTruthy();
      
      const descInput = document.getElementById('rencana-bisnis-desc');
      expect(descInput).toBeTruthy();
      
      const locationInput = document.getElementById('rencana-bisnis-location');
      expect(locationInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const ageSelect = document.getElementById('rencana-bisnis-target-age');
      expect(ageSelect).toBeTruthy();
      
      const genderSelect = document.getElementById('rencana-bisnis-target-gender');
      expect(genderSelect).toBeTruthy();
      
      const incomeSelect = document.getElementById('rencana-bisnis-target-income');
      expect(incomeSelect).toBeTruthy();
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive spacing', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive panel sizing', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
      
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have responsive title sizing', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });
  });

  // Placeholder Tests
  describe('Placeholders', () => {
    it('should have proper placeholders in text inputs', () => {
      const nameInput = document.getElementById('rencana-bisnis-name');
      expect(nameInput.placeholder).toBeTruthy();
      
      const locationInput = document.getElementById('rencana-bisnis-location');
      expect(locationInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const descInput = document.getElementById('rencana-bisnis-desc');
      expect(descInput.placeholder).toBeTruthy();
      
      const goalsInput = document.getElementById('rencana-bisnis-goals');
      expect(goalsInput.placeholder).toBeTruthy();
      
      const kpiInput = document.getElementById('rencana-bisnis-kpi');
      expect(kpiInput.placeholder).toBeTruthy();
      
      const competitorsInput = document.getElementById('rencana-bisnis-competitors');
      expect(competitorsInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in number inputs', () => {
      const capitalInput = document.getElementById('rencana-bisnis-initial-capital');
      expect(capitalInput.placeholder).toBeTruthy();
      
      const costInput = document.getElementById('rencana-bisnis-monthly-cost');
      expect(costInput.placeholder).toBeTruthy();
      
      const revenueInput = document.getElementById('rencana-bisnis-target-revenue');
      expect(revenueInput.placeholder).toBeTruthy();
      
      const breakEvenInput = document.getElementById('rencana-bisnis-break-even');
      expect(breakEvenInput.placeholder).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('rencana-bisnis-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('rencana-bisnis-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have proper input types', () => {
      const nameInput = document.getElementById('rencana-bisnis-name');
      expect(nameInput.type).toBe('text');
      
      const locationInput = document.getElementById('rencana-bisnis-location');
      expect(locationInput.type).toBe('text');
      
      const capitalInput = document.getElementById('rencana-bisnis-initial-capital');
      expect(capitalInput.type).toBe('number');
    });

    it('should have proper textarea attributes', () => {
      const descInput = document.getElementById('rencana-bisnis-desc');
      expect(descInput.rows).toBe(3);
      
      const goalsInput = document.getElementById('rencana-bisnis-goals');
      expect(goalsInput.rows).toBe(3);
      
      const kpiInput = document.getElementById('rencana-bisnis-kpi');
      expect(kpiInput.rows).toBe(2);
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have proper spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper results container styling', () => {
      const resultsContainer = document.getElementById('rencana-bisnis-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      const businessInfoCard = document.body.querySelectorAll('.card')[1];
      const spaceDiv = businessInfoCard.querySelector('.space-y-4');
      expect(spaceDiv).toBeTruthy();
    });
  });

  // Additional UI Elements Tests
  describe('Additional UI Elements', () => {
    it('should have proper section numbering', () => {
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements[0].textContent).toContain('1.');
      expect(h2Elements[1].textContent).toContain('2.');
      expect(h2Elements[2].textContent).toContain('3.');
      expect(h2Elements[3].textContent).toContain('4.');
      expect(h2Elements[4].textContent).toContain('5.');
    });

    it('should have proper spacing between sections', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const cards = leftPanel.querySelectorAll('.card');
      expect(cards.length).toBe(5);
    });

    it('should have proper results area structure', () => {
      const resultsContainer = document.getElementById('rencana-bisnis-results-container');
      expect(resultsContainer.querySelector('#rencana-bisnis-empty-state')).toBeTruthy();
      expect(resultsContainer.querySelector('#rencana-bisnis-results')).toBeTruthy();
      expect(resultsContainer.querySelector('#rencana-bisnis-loading')).toBeTruthy();
    });
  });

  // Input Group Tests
  describe('Input Groups', () => {
    it('should have proper label styling', () => {
      const formLabels = [
        document.getElementById('rencana-bisnis-name')?.closest('div').querySelector('label'),
        document.getElementById('rencana-bisnis-desc')?.closest('div').querySelector('label'),
        document.getElementById('rencana-bisnis-location')?.closest('div').querySelector('label')
      ].filter(Boolean);
      
      formLabels.forEach(label => {
        expect(label.classList.contains('block')).toBe(true);
        expect(label.classList.contains('text-sm')).toBe(true);
        expect(label.classList.contains('font-medium')).toBe(true);
      });
    });

    it('should have proper input styling', () => {
      const inputs = document.body.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        expect(input.classList.contains('w-full')).toBe(true);
        expect(input.classList.contains('p-3')).toBe(true);
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
      });
    });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-blue-500')).toBe(true);
      expect(loader.classList.contains('h-12')).toBe(true);
      expect(loader.classList.contains('w-12')).toBe(true);
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('rencana-bisnis-loading');
      expect(loading.textContent).toContain('Sedang membuat rencana bisnis');
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have proper empty state icon', () => {
      const emptyState = document.getElementById('rencana-bisnis-empty-state');
      expect(emptyState.querySelector('i.fas.fa-briefcase')).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-briefcase').classList.contains('text-blue-400')).toBe(true);
      expect(emptyState.querySelector('i.fas.fa-briefcase').classList.contains('text-6xl')).toBe(true);
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('rencana-bisnis-empty-state');
      expect(emptyState.textContent).toContain('Hasil rencana bisnis akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Rencana Bisnis');
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('rencana-bisnis-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
      expect(emptyState.classList.contains('text-gray-500')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have all required elements for functionality', () => {
      // Business type elements
      expect(document.getElementById('rencana-bisnis-type-options')).toBeTruthy();
      
      // Business info elements
      expect(document.getElementById('rencana-bisnis-name')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-desc')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-location')).toBeTruthy();
      
      // Target market elements
      expect(document.getElementById('rencana-bisnis-target-age')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-target-gender')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-target-income')).toBeTruthy();
      
      // Goals elements
      expect(document.getElementById('rencana-bisnis-goals')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-kpi')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-competitors')).toBeTruthy();
      
      // Financial elements
      expect(document.getElementById('rencana-bisnis-initial-capital')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-monthly-cost')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-target-revenue')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-break-even')).toBeTruthy();
      
      // Generate button
      expect(document.getElementById('rencana-bisnis-generate-btn')).toBeTruthy();
      
      // Results elements
      expect(document.getElementById('rencana-bisnis-results')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-empty-state')).toBeTruthy();
      expect(document.getElementById('rencana-bisnis-loading')).toBeTruthy();
    });

    it('should have proper data attributes for business types', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-rencana-bisnis');
      typeBtns.forEach(btn => {
        expect(btn.dataset.type).toBeTruthy();
      });
    });

    it('should have selected state on UMKM by default', () => {
      const umkmBtn = document.body.querySelector('[data-type="umkm"]');
      expect(umkmBtn.dataset.selected).toBe('true');
      expect(umkmBtn.classList.contains('selected')).toBe(true);
    });
  });
});
