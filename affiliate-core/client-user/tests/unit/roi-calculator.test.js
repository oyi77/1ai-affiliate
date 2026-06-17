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

describe('roi-calculator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-roi-calculator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 bg-clip-text text-transparent">
            <i class="fas fa-calculator-chart mr-3"></i>Kalkulator ROI
          </h1>
          <p class="text-lg text-gray-600 mt-2">Hitung return on investment bisnis Anda dengan akurat</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Initial Investment -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-coins mr-2 text-teal-500"></i>Investasi Awal
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="roi-calculator-initial-investment" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-money-bill-wave mr-1 text-teal-500"></i>Jumlah Investasi (Rp)
                  </label>
                  <input type="number" id="roi-calculator-initial-investment" placeholder="Contoh: 50000000" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                </div>
              </div>
            </div>
            
            <!-- Expected Revenue -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-chart-line mr-2 text-emerald-500"></i>Pendapatan yang Diharapkan
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="roi-calculator-expected-revenue" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-money-bill-trend-up mr-1 text-emerald-500"></i>Pendapatan (Rp)
                  </label>
                  <input type="number" id="roi-calculator-expected-revenue" placeholder="Contoh: 100000000" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>
              </div>
            </div>
            
            <!-- Time Period -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-clock mr-2 text-green-500"></i>Periode Waktu
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="roi-calculator-time-period" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-alt mr-1 text-green-500"></i>Durasi Investasi
                  </label>
                  <select id="roi-calculator-time-period" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="1">1 Bulan</option>
                    <option value="3">3 Bulan</option>
                    <option value="6">6 Bulan</option>
                    <option value="12">1 Tahun</option>
                    <option value="24">2 Tahun</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Industry -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-industry mr-2 text-teal-500"></i>Industri
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="roi-calculator-industry" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-building mr-1 text-teal-500"></i>Jenis Industri
                  </label>
                  <select id="roi-calculator-industry" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="service">Jasa/Layanan</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufaktur</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Growth Rate -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-arrow-trend-up mr-2 text-emerald-500"></i>Tingkat Pertumbuhan
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="roi-calculator-growth-rate" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-percent mr-1 text-emerald-500"></i>Tingkat Pertumbuhan (%)
                  </label>
                  <input type="number" id="roi-calculator-growth-rate" placeholder="Contoh: 15" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                </div>
              </div>
            </div>
            
            <!-- Cost of Goods -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-tags mr-2 text-green-500"></i>Biaya Barang
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="roi-calculator-cost-of-goods" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-percent mr-1 text-green-500"></i>Cost of Goods (%)
                  </label>
                  <input type="number" id="roi-calculator-cost-of-goods" placeholder="Contoh: 30" 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="roi-calculator-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Hitung ROI
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="roi-calculator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="roi-calculator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-calculator-chart text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil perhitungan ROI akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Hitung ROI</p>
              </div>
              <div id="roi-calculator-results" class="hidden space-y-6"></div>
              <div id="roi-calculator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang menghitung ROI...</p>
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
      const container = document.getElementById('content-roi-calculator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Kalkulator ROI');
      expect(title.querySelector('i.fas.fa-calculator-chart')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Hitung return on investment bisnis Anda dengan akurat');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(6);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#roi-calculator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Initial Investment Input Tests
  describe('Initial Investment Input', () => {
    it('should render initial investment input', () => {
      const initialInvestmentInput = document.getElementById('roi-calculator-initial-investment');
      expect(initialInvestmentInput).toBeTruthy();
      expect(initialInvestmentInput.tagName).toBe('INPUT');
      expect(initialInvestmentInput.type).toBe('number');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('Investasi Awal');
    });

    it('should have all labels with icons', () => {
      const coinsIcon = document.body.querySelector('i.fas.fa-coins');
      expect(coinsIcon).toBeTruthy();
      
      const moneyBillWaveIcon = document.body.querySelector('i.fas.fa-money-bill-wave');
      expect(moneyBillWaveIcon).toBeTruthy();
    });

    it('should have proper placeholder text', () => {
      const initialInvestmentInput = document.getElementById('roi-calculator-initial-investment');
      expect(initialInvestmentInput.placeholder).toContain('Contoh: 50000000');
    });

    it('should have proper input styling', () => {
      const initialInvestmentInput = document.getElementById('roi-calculator-initial-investment');
      expect(initialInvestmentInput.classList.contains('w-full')).toBe(true);
      expect(initialInvestmentInput.classList.contains('p-3')).toBe(true);
      expect(initialInvestmentInput.classList.contains('border')).toBe(true);
      expect(initialInvestmentInput.classList.contains('rounded-lg')).toBe(true);
      expect(initialInvestmentInput.classList.contains('focus:ring-2')).toBe(true);
      expect(initialInvestmentInput.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Expected Revenue Input Tests
  describe('Expected Revenue Input', () => {
    it('should render expected revenue input', () => {
      const expectedRevenueInput = document.getElementById('roi-calculator-expected-revenue');
      expect(expectedRevenueInput).toBeTruthy();
      expect(expectedRevenueInput.tagName).toBe('INPUT');
      expect(expectedRevenueInput.type).toBe('number');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('Pendapatan yang Diharapkan');
    });

    it('should have all labels with icons', () => {
      const chartLineIcon = document.body.querySelector('i.fas.fa-chart-line');
      expect(chartLineIcon).toBeTruthy();
      
      const moneyBillTrendUpIcon = document.body.querySelector('i.fas.fa-money-bill-trend-up');
      expect(moneyBillTrendUpIcon).toBeTruthy();
    });

    it('should have proper placeholder text', () => {
      const expectedRevenueInput = document.getElementById('roi-calculator-expected-revenue');
      expect(expectedRevenueInput.placeholder).toContain('Contoh: 100000000');
    });

    it('should have proper input styling', () => {
      const expectedRevenueInput = document.getElementById('roi-calculator-expected-revenue');
      expect(expectedRevenueInput.classList.contains('w-full')).toBe(true);
      expect(expectedRevenueInput.classList.contains('p-3')).toBe(true);
      expect(expectedRevenueInput.classList.contains('border')).toBe(true);
      expect(expectedRevenueInput.classList.contains('rounded-lg')).toBe(true);
      expect(expectedRevenueInput.classList.contains('focus:ring-2')).toBe(true);
      expect(expectedRevenueInput.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Time Period Selection Tests
  describe('Time Period Selection', () => {
    it('should render time period select', () => {
      const timePeriodSelect = document.getElementById('roi-calculator-time-period');
      expect(timePeriodSelect).toBeTruthy();
      expect(timePeriodSelect.tagName).toBe('SELECT');
      expect(timePeriodSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('Periode Waktu');
    });

    it('should have all labels with icons', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
      
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
    });

    it('should have time period options with proper labels', () => {
      const timePeriodSelect = document.getElementById('roi-calculator-time-period');
      expect(timePeriodSelect.options[0].textContent).toContain('1 Bulan');
      expect(timePeriodSelect.options[1].textContent).toContain('3 Bulan');
      expect(timePeriodSelect.options[2].textContent).toContain('6 Bulan');
      expect(timePeriodSelect.options[3].textContent).toContain('1 Tahun');
      expect(timePeriodSelect.options[4].textContent).toContain('2 Tahun');
    });

    it('should have default time period value', () => {
      const timePeriodSelect = document.getElementById('roi-calculator-time-period');
      expect(timePeriodSelect.value).toBe('1');
    });

    it('should have proper input styling', () => {
      const timePeriodSelect = document.getElementById('roi-calculator-time-period');
      expect(timePeriodSelect.classList.contains('w-full')).toBe(true);
      expect(timePeriodSelect.classList.contains('p-3')).toBe(true);
      expect(timePeriodSelect.classList.contains('border')).toBe(true);
      expect(timePeriodSelect.classList.contains('rounded-lg')).toBe(true);
      expect(timePeriodSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(timePeriodSelect.classList.contains('focus:ring-green-500')).toBe(true);
    });
  });

  // Industry Selection Tests
  describe('Industry Selection', () => {
    it('should render industry select', () => {
      const industrySelect = document.getElementById('roi-calculator-industry');
      expect(industrySelect).toBeTruthy();
      expect(industrySelect.tagName).toBe('SELECT');
      expect(industrySelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('Industri');
    });

    it('should have all labels with icons', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
      
      const buildingIcon = document.body.querySelector('i.fas.fa-building');
      expect(buildingIcon).toBeTruthy();
    });

    it('should have industry options with proper labels', () => {
      const industrySelect = document.getElementById('roi-calculator-industry');
      expect(industrySelect.options[0].textContent).toContain('E-commerce');
      expect(industrySelect.options[1].textContent).toContain('SaaS');
      expect(industrySelect.options[2].textContent).toContain('Jasa/Layanan');
      expect(industrySelect.options[3].textContent).toContain('Retail');
      expect(industrySelect.options[4].textContent).toContain('Manufaktur');
      expect(industrySelect.options[5].textContent).toContain('Lainnya');
    });

    it('should have default industry value', () => {
      const industrySelect = document.getElementById('roi-calculator-industry');
      expect(industrySelect.value).toBe('ecommerce');
    });

    it('should have proper input styling', () => {
      const industrySelect = document.getElementById('roi-calculator-industry');
      expect(industrySelect.classList.contains('w-full')).toBe(true);
      expect(industrySelect.classList.contains('p-3')).toBe(true);
      expect(industrySelect.classList.contains('border')).toBe(true);
      expect(industrySelect.classList.contains('rounded-lg')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Growth Rate Input Tests
  describe('Growth Rate Input', () => {
    it('should render growth rate input', () => {
      const growthRateInput = document.getElementById('roi-calculator-growth-rate');
      expect(growthRateInput).toBeTruthy();
      expect(growthRateInput.tagName).toBe('INPUT');
      expect(growthRateInput.type).toBe('number');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('Tingkat Pertumbuhan');
    });

    it('should have all labels with icons', () => {
      const arrowTrendUpIcon = document.body.querySelector('i.fas.fa-arrow-trend-up');
      expect(arrowTrendUpIcon).toBeTruthy();
      
      const percentIcon = document.body.querySelectorAll('i.fas.fa-percent');
      expect(percentIcon.length).toBeGreaterThanOrEqual(1);
    });

    it('should have proper placeholder text', () => {
      const growthRateInput = document.getElementById('roi-calculator-growth-rate');
      expect(growthRateInput.placeholder).toContain('Contoh: 15');
    });

    it('should have proper input styling', () => {
      const growthRateInput = document.getElementById('roi-calculator-growth-rate');
      expect(growthRateInput.classList.contains('w-full')).toBe(true);
      expect(growthRateInput.classList.contains('p-3')).toBe(true);
      expect(growthRateInput.classList.contains('border')).toBe(true);
      expect(growthRateInput.classList.contains('rounded-lg')).toBe(true);
      expect(growthRateInput.classList.contains('focus:ring-2')).toBe(true);
      expect(growthRateInput.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Cost of Goods Input Tests
  describe('Cost of Goods Input', () => {
    it('should render cost of goods input', () => {
      const costOfGoodsInput = document.getElementById('roi-calculator-cost-of-goods');
      expect(costOfGoodsInput).toBeTruthy();
      expect(costOfGoodsInput.tagName).toBe('INPUT');
      expect(costOfGoodsInput.type).toBe('number');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('Biaya Barang');
    });

    it('should have all labels with icons', () => {
      const tagsIcon = document.body.querySelector('i.fas.fa-tags');
      expect(tagsIcon).toBeTruthy();
    });

    it('should have proper placeholder text', () => {
      const costOfGoodsInput = document.getElementById('roi-calculator-cost-of-goods');
      expect(costOfGoodsInput.placeholder).toContain('Contoh: 30');
    });

    it('should have proper input styling', () => {
      const costOfGoodsInput = document.getElementById('roi-calculator-cost-of-goods');
      expect(costOfGoodsInput.classList.contains('w-full')).toBe(true);
      expect(costOfGoodsInput.classList.contains('p-3')).toBe(true);
      expect(costOfGoodsInput.classList.contains('border')).toBe(true);
      expect(costOfGoodsInput.classList.contains('rounded-lg')).toBe(true);
      expect(costOfGoodsInput.classList.contains('focus:ring-2')).toBe(true);
      expect(costOfGoodsInput.classList.contains('focus:ring-green-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('roi-calculator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Hitung ROI');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('roi-calculator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-green-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('roi-calculator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('roi-calculator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('roi-calculator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('roi-calculator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-calculator-chart')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil perhitungan ROI akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('roi-calculator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('roi-calculator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang menghitung ROI');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('roi-calculator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('roi-calculator-empty-state').querySelector('i.fas.fa-calculator-chart');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/emerald/green color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-500')).toBe(true);
      expect(title.classList.contains('via-emerald-500')).toBe(true);
      expect(title.classList.contains('to-green-500')).toBe(true);
    });

    it('should use teal/emerald/green accents in generate button', () => {
      const generateBtn = document.getElementById('roi-calculator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-green-500')).toBe(true);
    });

    it('should use teal accents in initial investment input', () => {
      const initialInvestmentInput = document.getElementById('roi-calculator-initial-investment');
      expect(initialInvestmentInput.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(initialInvestmentInput.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use emerald accents in expected revenue input', () => {
      const expectedRevenueInput = document.getElementById('roi-calculator-expected-revenue');
      expect(expectedRevenueInput.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(expectedRevenueInput.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use green accents in time period select', () => {
      const timePeriodSelect = document.getElementById('roi-calculator-time-period');
      expect(timePeriodSelect.classList.contains('focus:ring-green-500')).toBe(true);
      expect(timePeriodSelect.classList.contains('focus:border-green-500')).toBe(true);
    });

    it('should use teal accents in industry select', () => {
      const industrySelect = document.getElementById('roi-calculator-industry');
      expect(industrySelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(industrySelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use emerald accents in growth rate input', () => {
      const growthRateInput = document.getElementById('roi-calculator-growth-rate');
      expect(growthRateInput.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(growthRateInput.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use green accents in cost of goods input', () => {
      const costOfGoodsInput = document.getElementById('roi-calculator-cost-of-goods');
      expect(costOfGoodsInput.classList.contains('focus:ring-green-500')).toBe(true);
      expect(costOfGoodsInput.classList.contains('focus:border-green-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('roi-calculator-empty-state').querySelector('i.fas.fa-calculator-chart');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(7);
      
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
      const icons = document.body.querySelectorAll('i.fas, i.fab');
      expect(icons.length).toBeGreaterThanOrEqual(15);
    });

    it('should have calculator-chart icon in header', () => {
      const calculatorChartIcon = document.body.querySelector('header i.fas.fa-calculator-chart');
      expect(calculatorChartIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('roi-calculator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have coins icon for initial investment', () => {
      const coinsIcon = document.body.querySelector('i.fas.fa-coins');
      expect(coinsIcon).toBeTruthy();
    });

    it('should have money-bill-wave icon for initial investment label', () => {
      const moneyBillWaveIcon = document.body.querySelector('i.fas.fa-money-bill-wave');
      expect(moneyBillWaveIcon).toBeTruthy();
    });

    it('should have chart-line icon for expected revenue', () => {
      const chartLineIcon = document.body.querySelector('i.fas.fa-chart-line');
      expect(chartLineIcon).toBeTruthy();
    });

    it('should have money-bill-trend-up icon for expected revenue label', () => {
      const moneyBillTrendUpIcon = document.body.querySelector('i.fas.fa-money-bill-trend-up');
      expect(moneyBillTrendUpIcon).toBeTruthy();
    });

    it('should have clock icon for time period', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have calendar-alt icon for time period label', () => {
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
    });

    it('should have industry icon for industry', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
    });

    it('should have building icon for industry label', () => {
      const buildingIcon = document.body.querySelector('i.fas.fa-building');
      expect(buildingIcon).toBeTruthy();
    });

    it('should have arrow-trend-up icon for growth rate', () => {
      const arrowTrendUpIcon = document.body.querySelector('i.fas.fa-arrow-trend-up');
      expect(arrowTrendUpIcon).toBeTruthy();
    });

    it('should have percent icon for growth rate label', () => {
      const percentIcons = document.body.querySelectorAll('i.fas.fa-percent');
      expect(percentIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('should have tags icon for cost of goods', () => {
      const tagsIcon = document.body.querySelector('i.fas.fa-tags');
      expect(tagsIcon).toBeTruthy();
    });

    it('should have calculator-chart icon in empty state', () => {
      const emptyStateIcon = document.getElementById('roi-calculator-empty-state').querySelector('i.fas.fa-calculator-chart');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Kalkulator ROI');
      expect(document.body.textContent).toContain('Investasi Awal');
      expect(document.body.textContent).toContain('Pendapatan yang Diharapkan');
      expect(document.body.textContent).toContain('Periode Waktu');
      expect(document.body.textContent).toContain('Industri');
      expect(document.body.textContent).toContain('Tingkat Pertumbuhan');
      expect(document.body.textContent).toContain('Biaya Barang');
      expect(document.body.textContent).toContain('Hitung ROI');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('Investasi Awal');
      expect(headers[1].textContent).toContain('Pendapatan yang Diharapkan');
      expect(headers[2].textContent).toContain('Periode Waktu');
      expect(headers[3].textContent).toContain('Industri');
      expect(headers[4].textContent).toContain('Tingkat Pertumbuhan');
      expect(headers[5].textContent).toContain('Biaya Barang');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('roi-calculator-empty-state');
      expect(emptyState.textContent).toContain('Hasil perhitungan ROI akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Hitung ROI');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('roi-calculator-loading');
      expect(loading.textContent).toContain('Sedang menghitung ROI');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(6);
    });

    it('should have labeled form inputs', () => {
      const initialInvestmentInput = document.getElementById('roi-calculator-initial-investment');
      expect(initialInvestmentInput).toBeTruthy();
      
      const expectedRevenueInput = document.getElementById('roi-calculator-expected-revenue');
      expect(expectedRevenueInput).toBeTruthy();
      
      const timePeriodSelect = document.getElementById('roi-calculator-time-period');
      expect(timePeriodSelect).toBeTruthy();
      
      const industrySelect = document.getElementById('roi-calculator-industry');
      expect(industrySelect).toBeTruthy();
      
      const growthRateInput = document.getElementById('roi-calculator-growth-rate');
      expect(growthRateInput).toBeTruthy();
      
      const costOfGoodsInput = document.getElementById('roi-calculator-cost-of-goods');
      expect(costOfGoodsInput).toBeTruthy();
    });

    it('should have proper labels for inputs and selects', () => {
      const initialInvestmentLabel = document.querySelector('label[for="roi-calculator-initial-investment"]');
      expect(initialInvestmentLabel).toBeTruthy();
      
      const expectedRevenueLabel = document.querySelector('label[for="roi-calculator-expected-revenue"]');
      expect(expectedRevenueLabel).toBeTruthy();
      
      const timePeriodLabel = document.querySelector('label[for="roi-calculator-time-period"]');
      expect(timePeriodLabel).toBeTruthy();
      
      const industryLabel = document.querySelector('label[for="roi-calculator-industry"]');
      expect(industryLabel).toBeTruthy();
      
      const growthRateLabel = document.querySelector('label[for="roi-calculator-growth-rate"]');
      expect(growthRateLabel).toBeTruthy();
      
      const costOfGoodsLabel = document.querySelector('label[for="roi-calculator-cost-of-goods"]');
      expect(costOfGoodsLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('roi-calculator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const initialInvestmentInput = document.getElementById('roi-calculator-initial-investment');
      expect(initialInvestmentInput.type).toBe('number');
      
      const expectedRevenueInput = document.getElementById('roi-calculator-expected-revenue');
      expect(expectedRevenueInput.type).toBe('number');
      
      const growthRateInput = document.getElementById('roi-calculator-growth-rate');
      expect(growthRateInput.type).toBe('number');
      
      const costOfGoodsInput = document.getElementById('roi-calculator-cost-of-goods');
      expect(costOfGoodsInput.type).toBe('number');
    });

    it('should have proper select types', () => {
      const timePeriodSelect = document.getElementById('roi-calculator-time-period');
      expect(timePeriodSelect.tagName).toBe('SELECT');
      
      const industrySelect = document.getElementById('roi-calculator-industry');
      expect(industrySelect.tagName).toBe('SELECT');
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have mobile-first grid layout', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid-cols-1')).toBe(true);
    });

    it('should have responsive grid for larger screens', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive spacing', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive header text', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });
  });
});
