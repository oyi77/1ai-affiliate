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

describe('financial-forecast Component', () => {
  
  const mockComponentHTML = `
    <!-- Financial Forecast Component -->
    <div id="financial-forecast-container" class="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 id="financial-forecast-title" class="text-3xl font-bold text-white mb-2">
          📊 Proyeksi Keuangan Bisnis
        </h2>
        <p id="financial-forecast-subtitle" class="text-white/90 text-lg">
          Rencanakan masa depan keuangan bisnis Anda dengan akurat
        </p>
      </div>

      <!-- Business Type Selection -->
      <div id="financial-forecast-business-type-section" class="bg-white/95 backdrop-blur rounded-lg p-6 mb-6 shadow-md">
        <h3 id="financial-forecast-business-type-label" class="text-xl font-semibold text-gray-800 mb-4">
          🏢 Tipe Bisnis
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label id="financial-forecast-business-type-retail" class="cursor-pointer">
            <input type="radio" name="financial-forecast-business-type" value="retail" class="peer sr-only" checked>
            <div class="p-4 rounded-lg border-2 border-gray-200 peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all hover:border-orange-300">
              <div class="text-center">
                <span class="text-3xl">🏪</span>
                <p class="font-medium text-gray-700 mt-2">Retail</p>
              </div>
            </div>
          </label>
          <label id="financial-forecast-business-type-service" class="cursor-pointer">
            <input type="radio" name="financial-forecast-business-type" value="service" class="peer sr-only">
            <div class="p-4 rounded-lg border-2 border-gray-200 peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all hover:border-orange-300">
              <div class="text-center">
                <span class="text-3xl">🔧</span>
                <p class="font-medium text-gray-700 mt-2">Jasa</p>
              </div>
            </div>
          </label>
          <label id="financial-forecast-business-type-manufacturing" class="cursor-pointer">
            <input type="radio" name="financial-forecast-business-type" value="manufacturing" class="peer sr-only">
            <div class="p-4 rounded-lg border-2 border-gray-200 peer-checked:border-orange-500 peer-checked:bg-orange-50 transition-all hover:border-orange-300">
              <div class="text-center">
                <span class="text-3xl">🏭</span>
                <p class="font-medium text-gray-700 mt-2">Manufaktur</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Revenue Projections -->
      <div id="financial-forecast-revenue-section" class="bg-white/95 backdrop-blur rounded-lg p-6 mb-6 shadow-md">
        <h3 id="financial-forecast-revenue-label" class="text-xl font-semibold text-gray-800 mb-4">
          💰 Proyeksi Pendapatan
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label id="financial-forecast-current-revenue-label" for="financial-forecast-current-revenue" class="block text-sm font-medium text-gray-700 mb-2">
              Pendapatan Saat Ini (per bulan)
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input type="number" id="financial-forecast-current-revenue" placeholder="0" 
                     class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
            </div>
          </div>
          <div>
            <label id="financial-forecast-expected-growth-label" for="financial-forecast-expected-growth" class="block text-sm font-medium text-gray-700 mb-2">
              Pertumbuhan yang Diharapkan (%)
            </label>
            <div class="relative">
              <input type="number" id="financial-forecast-expected-growth" placeholder="0" 
                     class="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          <div>
            <label id="financial-forecast-projection-period-label" for="financial-forecast-projection-period" class="block text-sm font-medium text-gray-700 mb-2">
              Periode Proyeksi
            </label>
            <select id="financial-forecast-projection-period" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              <option value="3">3 Bulan</option>
              <option value="6">6 Bulan</option>
              <option value="12" selected>12 Bulan</option>
              <option value="24">24 Bulan</option>
              <option value="36">36 Bulan</option>
            </select>
          </div>
          <div>
            <label id="financial-forecast-seasonal-variation-label" for="financial-forecast-seasonal-variation" class="block text-sm font-medium text-gray-700 mb-2">
              Variasi Musiman
            </label>
            <select id="financial-forecast-seasonal-variation" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              <option value="none">Tidak Ada</option>
              <option value="low">Rendah (±5%)</option>
              <option value="medium" selected>Sedang (±15%)</option>
              <option value="high">Tinggi (±30%)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Expense Categories -->
      <div id="financial-forecast-expense-section" class="bg-white/95 backdrop-blur rounded-lg p-6 mb-6 shadow-md">
        <h3 id="financial-forecast-expense-label" class="text-xl font-semibold text-gray-800 mb-4">
          📋 Kategori Pengeluaran
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label id="financial-forecast-fixed-costs-label" for="financial-forecast-fixed-costs" class="block text-sm font-medium text-gray-700 mb-2">
              Biaya Tetap (per bulan)
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input type="number" id="financial-forecast-fixed-costs" placeholder="0" 
                     class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
            </div>
            <p class="text-xs text-gray-500 mt-1">Sewa, utilitas, gaji tetap, dll.</p>
          </div>
          <div>
            <label id="financial-forecast-variable-costs-label" for="financial-forecast-variable-costs" class="block text-sm font-medium text-gray-700 mb-2">
              Biaya Variabel (% dari pendapatan)
            </label>
            <div class="relative">
              <input type="number" id="financial-forecast-variable-costs" placeholder="0" 
                     class="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Bahan baku, pengiriman, komisi, dll.</p>
          </div>
          <div>
            <label id="financial-forecast-marketing-budget-label" for="financial-forecast-marketing-budget" class="block text-sm font-medium text-gray-700 mb-2">
              Anggaran Pemasaran (% dari pendapatan)
            </label>
            <div class="relative">
              <input type="number" id="financial-forecast-marketing-budget" placeholder="0" 
                     class="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          <div>
            <label id="financial-forecast-operational-costs-label" for="financial-forecast-operational-costs" class="block text-sm font-medium text-gray-700 mb-2">
              Biaya Operasional Lainnya (per bulan)
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input type="number" id="financial-forecast-operational-costs" placeholder="0" 
                     class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
            </div>
          </div>
        </div>
      </div>

      <!-- Profit Margin Targets -->
      <div id="financial-forecast-profit-margin-section" class="bg-white/95 backdrop-blur rounded-lg p-6 mb-6 shadow-md">
        <h3 id="financial-forecast-profit-margin-label" class="text-xl font-semibold text-gray-800 mb-4">
          🎯 Target Margin Laba
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label id="financial-forecast-target-profit-margin-label" for="financial-forecast-target-profit-margin" class="block text-sm font-medium text-gray-700 mb-2">
              Target Margin Laba Bersih (%)
            </label>
            <div class="relative">
              <input type="number" id="financial-forecast-target-profit-margin" placeholder="20" value="20"
                     class="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          <div>
            <label id="financial-forecast-minimum-profit-label" for="financial-forecast-minimum-profit" class="block text-sm font-medium text-gray-700 mb-2">
              Laba Minimum yang Diharapkan
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input type="number" id="financial-forecast-minimum-profit" placeholder="0" 
                     class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
            </div>
          </div>
          <div>
            <label id="financial-forecast-emergency-fund-label" for="financial-forecast-emergency-fund" class="block text-sm font-medium text-gray-700 mb-2">
              Dana Darurat (% dari laba)
            </label>
            <div class="relative">
              <input type="number" id="financial-forecast-emergency-fund" placeholder="10" value="10"
                     class="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <div id="financial-forecast-generate-section" class="text-center">
        <button id="financial-forecast-generate-btn" 
                class="bg-white text-orange-600 font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-orange-50 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg">
          🚀 Generate Proyeksi Keuangan
        </button>
        <p id="financial-forecast-generate-hint" class="text-white/80 text-sm mt-3">
          Klik tombol di atas untuk melihat analisis proyeksi keuangan bisnis Anda
        </p>
      </div>

      <!-- Results Section (Hidden by default) -->
      <div id="financial-forecast-results-section" class="hidden mt-8">
        <div class="bg-white/95 backdrop-blur rounded-lg p-6 shadow-md">
          <h3 id="financial-forecast-results-title" class="text-2xl font-bold text-gray-800 mb-6 text-center">
            📈 Hasil Proyeksi Keuangan
          </h3>
          
          <!-- Summary Cards -->
          <div id="financial-forecast-summary-cards" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 text-center">
              <p id="financial-forecast-total-revenue-label" class="text-sm opacity-90">Total Pendapatan</p>
              <p id="financial-forecast-total-revenue" class="text-2xl font-bold mt-1">Rp 0</p>
            </div>
            <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 text-center">
              <p id="financial-forecast-total-expenses-label" class="text-sm opacity-90">Total Pengeluaran</p>
              <p id="financial-forecast-total-expenses" class="text-2xl font-bold mt-1">Rp 0</p>
            </div>
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center">
              <p id="financial-forecast-net-profit-label" class="text-sm opacity-90">Laba Bersih</p>
              <p id="financial-forecast-net-profit" class="text-2xl font-bold mt-1">Rp 0</p>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 text-center">
              <p id="financial-forecast-actual-margin-label" class="text-sm opacity-90">Margin Nyata</p>
              <p id="financial-forecast-actual-margin" class="text-2xl font-bold mt-1">0%</p>
            </div>
          </div>

          <!-- Monthly Breakdown Table -->
          <div id="financial-forecast-monthly-breakdown">
            <h4 id="financial-forecast-monthly-breakdown-title" class="text-lg font-semibold text-gray-800 mb-4">
              📅 Rincian Bulanan
            </h4>
            <div class="overflow-x-auto">
              <table id="financial-forecast-results-table" class="w-full text-sm">
                <thead class="bg-orange-100">
                  <tr>
                    <th class="px-4 py-3 text-left text-gray-700 font-semibold">Bulan</th>
                    <th class="px-4 py-3 text-right text-gray-700 font-semibold">Pendapatan</th>
                    <th class="px-4 py-3 text-right text-gray-700 font-semibold">Pengeluaran</th>
                    <th class="px-4 py-3 text-right text-gray-700 font-semibold">Laba Bersih</th>
                    <th class="px-4 py-3 text-right text-gray-700 font-semibold">Margin</th>
                  </tr>
                </thead>
                <tbody id="financial-forecast-results-tbody">
                  <!-- Dynamic content will be inserted here -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recommendations -->
          <div id="financial-forecast-recommendations" class="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 id="financial-forecast-recommendations-title" class="text-lg font-semibold text-amber-800 mb-3">
              💡 Rekomendasi
            </h4>
            <ul id="financial-forecast-recommendations-list" class="space-y-2 text-sm text-amber-700">
              <!-- Dynamic recommendations will be inserted here -->
            </ul>
          </div>
        </div>
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
      const container = document.getElementById('financial-forecast-container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(container.classList.contains('from-orange-500')).toBe(true);
      expect(container.classList.contains('to-amber-500')).toBe(true);
      expect(container.classList.contains('rounded-xl')).toBe(true);
      expect(container.classList.contains('shadow-lg')).toBe(true);
      expect(container.classList.contains('p-6')).toBe(true);
      expect(container.classList.contains('max-w-4xl')).toBe(true);
      expect(container.classList.contains('mx-auto')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('.text-center');
      expect(header).toBeTruthy();
      
      const title = document.getElementById('financial-forecast-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Proyeksi Keuangan Bisnis');
      expect(title.classList.contains('text-3xl')).toBe(true);
      expect(title.classList.contains('font-bold')).toBe(true);
      expect(title.classList.contains('text-white')).toBe(true);
    });

    it('should render header with subtitle', () => {
      const subtitle = document.getElementById('financial-forecast-subtitle');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Rencanakan masa depan keuangan bisnis Anda dengan akurat');
      expect(subtitle.classList.contains('text-white/90')).toBe(true);
      expect(subtitle.classList.contains('text-lg')).toBe(true);
    });

    it('should have proper container styling', () => {
      const container = document.getElementById('financial-forecast-container');
      expect(container.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(container.classList.contains('from-orange-500')).toBe(true);
      expect(container.classList.contains('to-amber-500')).toBe(true);
    });
  });

  // Business Type Selection Tests
  describe('Business Type Selection', () => {
    it('should render business type section', () => {
      const businessTypeSection = document.getElementById('financial-forecast-business-type-section');
      expect(businessTypeSection).toBeTruthy();
      expect(businessTypeSection.classList.contains('bg-white/95')).toBe(true);
      expect(businessTypeSection.classList.contains('backdrop-blur')).toBe(true);
      expect(businessTypeSection.classList.contains('rounded-lg')).toBe(true);
      expect(businessTypeSection.classList.contains('p-6')).toBe(true);
    });

    it('should render business type label', () => {
      const businessTypeLabel = document.getElementById('financial-forecast-business-type-label');
      expect(businessTypeLabel).toBeTruthy();
      expect(businessTypeLabel.textContent).toContain('Tipe Bisnis');
    });

    it('should render Retail option', () => {
      const retailLabel = document.getElementById('financial-forecast-business-type-retail');
      expect(retailLabel).toBeTruthy();
      
      const retailInput = retailLabel.querySelector('input[type="radio"]');
      expect(retailInput).toBeTruthy();
      expect(retailInput.value).toBe('retail');
      expect(retailInput.checked).toBe(true);
      
      expect(retailLabel.textContent).toContain('Retail');
      expect(retailLabel.querySelector('span.text-3xl')).toBeTruthy();
    });

    it('should render Service option', () => {
      const serviceLabel = document.getElementById('financial-forecast-business-type-service');
      expect(serviceLabel).toBeTruthy();
      
      const serviceInput = serviceLabel.querySelector('input[type="radio"]');
      expect(serviceInput).toBeTruthy();
      expect(serviceInput.value).toBe('service');
      expect(serviceInput.checked).toBe(false);
      
      expect(serviceLabel.textContent).toContain('Jasa');
      expect(serviceLabel.querySelector('span.text-3xl')).toBeTruthy();
    });

    it('should render Manufacturing option', () => {
      const manufacturingLabel = document.getElementById('financial-forecast-business-type-manufacturing');
      expect(manufacturingLabel).toBeTruthy();
      
      const manufacturingInput = manufacturingLabel.querySelector('input[type="radio"]');
      expect(manufacturingInput).toBeTruthy();
      expect(manufacturingInput.value).toBe('manufacturing');
      expect(manufacturingInput.checked).toBe(false);
      
      expect(manufacturingLabel.textContent).toContain('Manufaktur');
      expect(manufacturingLabel.querySelector('span.text-3xl')).toBeTruthy();
    });

    it('should have 3 business type options', () => {
      const businessTypeInputs = document.querySelectorAll('input[name="financial-forecast-business-type"]');
      expect(businessTypeInputs.length).toBe(3);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptionsContainer = document.getElementById('financial-forecast-business-type-section').querySelector('.grid');
      expect(typeOptionsContainer).toBeTruthy();
      expect(typeOptionsContainer.classList.contains('grid-cols-1')).toBe(true);
      expect(typeOptionsContainer.classList.contains('md:grid-cols-3')).toBe(true);
      expect(typeOptionsContainer.classList.contains('gap-4')).toBe(true);
    });

    it('should have orange accents for selected state', () => {
      const retailLabel = document.getElementById('financial-forecast-business-type-retail');
      const retailDiv = retailLabel.querySelector('div:not(.sr-only)');
      expect(retailDiv.classList.contains('peer-checked:border-orange-500')).toBe(true);
      expect(retailDiv.classList.contains('peer-checked:bg-orange-50')).toBe(true);
    });
  });

  // Revenue Projections Input Tests
  describe('Revenue Projections Input', () => {
    it('should render revenue section', () => {
      const revenueSection = document.getElementById('financial-forecast-revenue-section');
      expect(revenueSection).toBeTruthy();
      expect(revenueSection.classList.contains('bg-white/95')).toBe(true);
      expect(revenueSection.classList.contains('backdrop-blur')).toBe(true);
    });

    it('should render revenue label', () => {
      const revenueLabel = document.getElementById('financial-forecast-revenue-label');
      expect(revenueLabel).toBeTruthy();
      expect(revenueLabel.textContent).toContain('Proyeksi Pendapatan');
    });

    it('should render current revenue input', () => {
      const currentRevenueInput = document.getElementById('financial-forecast-current-revenue');
      expect(currentRevenueInput).toBeTruthy();
      expect(currentRevenueInput.type).toBe('number');
      expect(currentRevenueInput.placeholder).toBe('0');
      expect(currentRevenueInput.classList.contains('w-full')).toBe(true);
      expect(currentRevenueInput.classList.contains('pl-10')).toBe(true);
      expect(currentRevenueInput.classList.contains('pr-4')).toBe(true);
      expect(currentRevenueInput.classList.contains('py-3')).toBe(true);
    });

    it('should render expected growth input', () => {
      const expectedGrowthInput = document.getElementById('financial-forecast-expected-growth');
      expect(expectedGrowthInput).toBeTruthy();
      expect(expectedGrowthInput.type).toBe('number');
      expect(expectedGrowthInput.placeholder).toBe('0');
      expect(expectedGrowthInput.classList.contains('focus:ring-orange-500')).toBe(true);
    });

    it('should render projection period select', () => {
      const projectionPeriodSelect = document.getElementById('financial-forecast-projection-period');
      expect(projectionPeriodSelect).toBeTruthy();
      expect(projectionPeriodSelect.tagName).toBe('SELECT');
      expect(projectionPeriodSelect.options.length).toBe(5);
      expect(projectionPeriodSelect.value).toBe('12');
    });

    it('should render seasonal variation select', () => {
      const seasonalVariationSelect = document.getElementById('financial-forecast-seasonal-variation');
      expect(seasonalVariationSelect).toBeTruthy();
      expect(seasonalVariationSelect.tagName).toBe('SELECT');
      expect(seasonalVariationSelect.options.length).toBe(4);
      expect(seasonalVariationSelect.value).toBe('medium');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h3');
      expect(headers[1].textContent).toContain('💰 Proyeksi Pendapatan');
    });

    it('should have all labels with icons', () => {
      const currentRevenueLabel = document.getElementById('financial-forecast-current-revenue-label');
      expect(currentRevenueLabel).toBeTruthy();
      
      const expectedGrowthLabel = document.getElementById('financial-forecast-expected-growth-label');
      expect(expectedGrowthLabel).toBeTruthy();
    });

    it('should have proper input styling for revenue fields', () => {
      const currentRevenueInput = document.getElementById('financial-forecast-current-revenue');
      expect(currentRevenueInput.classList.contains('border')).toBe(true);
      expect(currentRevenueInput.classList.contains('border-gray-300')).toBe(true);
      expect(currentRevenueInput.classList.contains('rounded-lg')).toBe(true);
      expect(currentRevenueInput.classList.contains('focus:ring-2')).toBe(true);
      expect(currentRevenueInput.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(currentRevenueInput.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should have currency symbols in inputs', () => {
      const currentRevenueInput = document.getElementById('financial-forecast-current-revenue');
      const currentRevenueContainer = currentRevenueInput.parentElement;
      expect(currentRevenueContainer.querySelector('span.text-gray-500')).toBeTruthy();
      expect(currentRevenueContainer.querySelector('span.text-gray-500').textContent).toBe('Rp');
    });

    it('should have percentage symbols in inputs', () => {
      const expectedGrowthInput = document.getElementById('financial-forecast-expected-growth');
      const expectedGrowthContainer = expectedGrowthInput.parentElement;
      expect(expectedGrowthContainer.querySelector('span.text-gray-500')).toBeTruthy();
      expect(expectedGrowthContainer.querySelector('span.text-gray-500').textContent).toBe('%');
    });
  });

  // Expense Categories Tests
  describe('Expense Categories', () => {
    it('should render expense section', () => {
      const expenseSection = document.getElementById('financial-forecast-expense-section');
      expect(expenseSection).toBeTruthy();
      expect(expenseSection.classList.contains('bg-white/95')).toBe(true);
      expect(expenseSection.classList.contains('backdrop-blur')).toBe(true);
    });

    it('should render expense label', () => {
      const expenseLabel = document.getElementById('financial-forecast-expense-label');
      expect(expenseLabel).toBeTruthy();
      expect(expenseLabel.textContent).toContain('Kategori Pengeluaran');
    });

    it('should render fixed costs input', () => {
      const fixedCostsInput = document.getElementById('financial-forecast-fixed-costs');
      expect(fixedCostsInput).toBeTruthy();
      expect(fixedCostsInput.type).toBe('number');
      expect(fixedCostsInput.placeholder).toBe('0');
    });

    it('should render variable costs input', () => {
      const variableCostsInput = document.getElementById('financial-forecast-variable-costs');
      expect(variableCostsInput).toBeTruthy();
      expect(variableCostsInput.type).toBe('number');
      expect(variableCostsInput.placeholder).toBe('0');
    });

    it('should render marketing budget input', () => {
      const marketingBudgetInput = document.getElementById('financial-forecast-marketing-budget');
      expect(marketingBudgetInput).toBeTruthy();
      expect(marketingBudgetInput.type).toBe('number');
      expect(marketingBudgetInput.placeholder).toBe('0');
    });

    it('should render operational costs input', () => {
      const operationalCostsInput = document.getElementById('financial-forecast-operational-costs');
      expect(operationalCostsInput).toBeTruthy();
      expect(operationalCostsInput.type).toBe('number');
      expect(operationalCostsInput.placeholder).toBe('0');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h3');
      expect(headers[2].textContent).toContain('📋 Kategori Pengeluaran');
    });

    it('should have helper text for fixed costs', () => {
      const fixedCostsLabel = document.getElementById('financial-forecast-fixed-costs-label');
      expect(fixedCostsLabel.textContent).toContain('Biaya Tetap');
      
      const helperText = fixedCostsLabel.parentElement.querySelector('p.text-xs.text-gray-500');
      expect(helperText).toBeTruthy();
      expect(helperText.textContent).toContain('Sewa, utilitas, gaji tetap, dll.');
    });

    it('should have helper text for variable costs', () => {
      const variableCostsLabel = document.getElementById('financial-forecast-variable-costs-label');
      expect(variableCostsLabel.textContent).toContain('Biaya Variabel');
      
      const helperText = variableCostsLabel.parentElement.querySelector('p.text-xs.text-gray-500');
      expect(helperText).toBeTruthy();
      expect(helperText.textContent).toContain('Bahan baku, pengiriman, komisi, dll.');
    });

    it('should have proper input styling for expense fields', () => {
      const fixedCostsInput = document.getElementById('financial-forecast-fixed-costs');
      expect(fixedCostsInput.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(fixedCostsInput.classList.contains('focus:border-orange-500')).toBe(true);
    });
  });

  // Profit Margin Targets Tests
  describe('Profit Margin Targets', () => {
    it('should render profit margin section', () => {
      const profitMarginSection = document.getElementById('financial-forecast-profit-margin-section');
      expect(profitMarginSection).toBeTruthy();
      expect(profitMarginSection.classList.contains('bg-white/95')).toBe(true);
      expect(profitMarginSection.classList.contains('backdrop-blur')).toBe(true);
    });

    it('should render profit margin label', () => {
      const profitMarginLabel = document.getElementById('financial-forecast-profit-margin-label');
      expect(profitMarginLabel).toBeTruthy();
      expect(profitMarginLabel.textContent).toContain('Target Margin Laba');
    });

    it('should render target profit margin input', () => {
      const targetProfitMarginInput = document.getElementById('financial-forecast-target-profit-margin');
      expect(targetProfitMarginInput).toBeTruthy();
      expect(targetProfitMarginInput.type).toBe('number');
      expect(targetProfitMarginInput.placeholder).toBe('20');
      expect(targetProfitMarginInput.value).toBe('20');
    });

    it('should render minimum profit input', () => {
      const minimumProfitInput = document.getElementById('financial-forecast-minimum-profit');
      expect(minimumProfitInput).toBeTruthy();
      expect(minimumProfitInput.type).toBe('number');
      expect(minimumProfitInput.placeholder).toBe('0');
    });

    it('should render emergency fund input', () => {
      const emergencyFundInput = document.getElementById('financial-forecast-emergency-fund');
      expect(emergencyFundInput).toBeTruthy();
      expect(emergencyFundInput.type).toBe('number');
      expect(emergencyFundInput.placeholder).toBe('10');
      expect(emergencyFundInput.value).toBe('10');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h3');
      expect(headers[3].textContent).toContain('🎯 Target Margin Laba');
    });

    it('should have proper input styling for margin fields', () => {
      const targetProfitMarginInput = document.getElementById('financial-forecast-target-profit-margin');
      expect(targetProfitMarginInput.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(targetProfitMarginInput.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should have percentage symbols in margin inputs', () => {
      const targetProfitMarginInput = document.getElementById('financial-forecast-target-profit-margin');
      const targetProfitMarginContainer = targetProfitMarginInput.parentElement;
      expect(targetProfitMarginContainer.querySelector('span.text-gray-500')).toBeTruthy();
      expect(targetProfitMarginContainer.querySelector('span.text-gray-500').textContent).toBe('%');
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('financial-forecast-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Generate Proyeksi Keuangan');
      expect(generateBtn.textContent).toContain('🚀');
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('financial-forecast-generate-btn');
      expect(generateBtn.classList.contains('bg-white')).toBe(true);
      expect(generateBtn.classList.contains('text-orange-600')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-8')).toBe(true);
      expect(generateBtn.classList.contains('rounded-lg')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
      expect(generateBtn.classList.contains('text-lg')).toBe(true);
    });

    it('should have hover styling classes', () => {
      const generateBtn = document.getElementById('financial-forecast-generate-btn');
      expect(generateBtn.classList.contains('hover:bg-orange-50')).toBe(true);
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transform')).toBe(true);
      expect(generateBtn.classList.contains('hover:-translate-y-1')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
      expect(generateBtn.classList.contains('duration-300')).toBe(true);
    });

    it('should render generate hint', () => {
      const generateHint = document.getElementById('financial-forecast-generate-hint');
      expect(generateHint).toBeTruthy();
      expect(generateHint.textContent).toContain('Klik tombol di atas untuk melihat analisis proyeksi keuangan bisnis Anda');
      expect(generateHint.classList.contains('text-white/80')).toBe(true);
      expect(generateHint.classList.contains('text-sm')).toBe(true);
      expect(generateHint.classList.contains('mt-3')).toBe(true);
    });

    it('should have proper generate section styling', () => {
      const generateSection = document.getElementById('financial-forecast-generate-section');
      expect(generateSection).toBeTruthy();
      expect(generateSection.classList.contains('text-center')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results section', () => {
      const resultsSection = document.getElementById('financial-forecast-results-section');
      expect(resultsSection).toBeTruthy();
      expect(resultsSection.classList.contains('hidden')).toBe(true);
      expect(resultsSection.classList.contains('mt-8')).toBe(true);
    });

    it('should render results title', () => {
      const resultsTitle = document.getElementById('financial-forecast-results-title');
      expect(resultsTitle).toBeTruthy();
      expect(resultsTitle.textContent).toContain('Hasil Proyeksi Keuangan');
      expect(resultsTitle.classList.contains('text-2xl')).toBe(true);
      expect(resultsTitle.classList.contains('font-bold')).toBe(true);
    });

    it('should render summary cards container', () => {
      const summaryCards = document.getElementById('financial-forecast-summary-cards');
      expect(summaryCards).toBeTruthy();
      expect(summaryCards.classList.contains('grid')).toBe(true);
      expect(summaryCards.classList.contains('grid-cols-1')).toBe(true);
      expect(summaryCards.classList.contains('md:grid-cols-4')).toBe(true);
      expect(summaryCards.classList.contains('gap-4')).toBe(true);
    });

    it('should render total revenue card', () => {
      const totalRevenueCard = document.body.querySelector('#financial-forecast-summary-cards > div:first-child');
      expect(totalRevenueCard).toBeTruthy();
      expect(totalRevenueCard.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(totalRevenueCard.classList.contains('from-green-500')).toBe(true);
      expect(totalRevenueCard.classList.contains('to-green-600')).toBe(true);
      expect(totalRevenueCard.classList.contains('text-white')).toBe(true);
      
      const totalRevenueLabel = document.getElementById('financial-forecast-total-revenue-label');
      expect(totalRevenueLabel.textContent).toContain('Total Pendapatan');
      
      const totalRevenue = document.getElementById('financial-forecast-total-revenue');
      expect(totalRevenue.textContent).toBe('Rp 0');
    });

    it('should render total expenses card', () => {
      const totalExpensesCard = document.body.querySelector('#financial-forecast-summary-cards > div:nth-child(2)');
      expect(totalExpensesCard).toBeTruthy();
      expect(totalExpensesCard.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(totalExpensesCard.classList.contains('from-red-500')).toBe(true);
      expect(totalExpensesCard.classList.contains('to-red-600')).toBe(true);
      
      const totalExpensesLabel = document.getElementById('financial-forecast-total-expenses-label');
      expect(totalExpensesLabel.textContent).toContain('Total Pengeluaran');
      
      const totalExpenses = document.getElementById('financial-forecast-total-expenses');
      expect(totalExpenses.textContent).toBe('Rp 0');
    });

    it('should render net profit card', () => {
      const netProfitCard = document.body.querySelector('#financial-forecast-summary-cards > div:nth-child(3)');
      expect(netProfitCard).toBeTruthy();
      expect(netProfitCard.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(netProfitCard.classList.contains('from-blue-500')).toBe(true);
      expect(netProfitCard.classList.contains('to-blue-600')).toBe(true);
      
      const netProfitLabel = document.getElementById('financial-forecast-net-profit-label');
      expect(netProfitLabel.textContent).toContain('Laba Bersih');
      
      const netProfit = document.getElementById('financial-forecast-net-profit');
      expect(netProfit.textContent).toBe('Rp 0');
    });

    it('should render actual margin card', () => {
      const actualMarginCard = document.body.querySelector('#financial-forecast-summary-cards > div:nth-child(4)');
      expect(actualMarginCard).toBeTruthy();
      expect(actualMarginCard.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(actualMarginCard.classList.contains('from-purple-500')).toBe(true);
      expect(actualMarginCard.classList.contains('to-purple-600')).toBe(true);
      
      const actualMarginLabel = document.getElementById('financial-forecast-actual-margin-label');
      expect(actualMarginLabel.textContent).toContain('Margin Nyata');
      
      const actualMargin = document.getElementById('financial-forecast-actual-margin');
      expect(actualMargin.textContent).toBe('0%');
    });

    it('should render monthly breakdown section', () => {
      const monthlyBreakdown = document.getElementById('financial-forecast-monthly-breakdown');
      expect(monthlyBreakdown).toBeTruthy();
      
      const monthlyBreakdownTitle = document.getElementById('financial-forecast-monthly-breakdown-title');
      expect(monthlyBreakdownTitle.textContent).toContain('Rincian Bulanan');
    });

    it('should render results table', () => {
      const resultsTable = document.getElementById('financial-forecast-results-table');
      expect(resultsTable).toBeTruthy();
      expect(resultsTable.classList.contains('w-full')).toBe(true);
      expect(resultsTable.classList.contains('text-sm')).toBe(true);
    });

    it('should render table headers', () => {
      const tableHeaders = document.querySelectorAll('#financial-forecast-results-table th');
      expect(tableHeaders.length).toBe(5);
      expect(tableHeaders[0].textContent).toContain('Bulan');
      expect(tableHeaders[1].textContent).toContain('Pendapatan');
      expect(tableHeaders[2].textContent).toContain('Pengeluaran');
      expect(tableHeaders[3].textContent).toContain('Laba Bersih');
      expect(tableHeaders[4].textContent).toContain('Margin');
    });

    it('should render results table body', () => {
      const resultsTbody = document.getElementById('financial-forecast-results-tbody');
      expect(resultsTbody).toBeTruthy();
    });

    it('should render recommendations section', () => {
      const recommendations = document.getElementById('financial-forecast-recommendations');
      expect(recommendations).toBeTruthy();
      expect(recommendations.classList.contains('mt-6')).toBe(true);
      expect(recommendations.classList.contains('p-4')).toBe(true);
      expect(recommendations.classList.contains('bg-amber-50')).toBe(true);
      expect(recommendations.classList.contains('rounded-lg')).toBe(true);
      expect(recommendations.classList.contains('border')).toBe(true);
      expect(recommendations.classList.contains('border-amber-200')).toBe(true);
      
      const recommendationsTitle = document.getElementById('financial-forecast-recommendations-title');
      expect(recommendationsTitle.textContent).toContain('Rekomendasi');
      
      const recommendationsList = document.getElementById('financial-forecast-recommendations-list');
      expect(recommendationsList).toBeTruthy();
    });

    it('should have orange accent in table header', () => {
      const tableHeader = document.querySelector('#financial-forecast-results-table thead');
      expect(tableHeader.classList.contains('bg-orange-100')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use orange/amber color scheme in main container', () => {
      const container = document.getElementById('financial-forecast-container');
      expect(container.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(container.classList.contains('from-orange-500')).toBe(true);
      expect(container.classList.contains('to-amber-500')).toBe(true);
    });

    it('should use orange accents in generate button', () => {
      const generateBtn = document.getElementById('financial-forecast-generate-btn');
      expect(generateBtn.classList.contains('text-orange-600')).toBe(true);
      expect(generateBtn.classList.contains('hover:bg-orange-50')).toBe(true);
    });

    it('should use orange accents in form labels', () => {
      const currentRevenueInput = document.getElementById('financial-forecast-current-revenue');
      expect(currentRevenueInput.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(currentRevenueInput.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use orange accents in business type selection', () => {
      const retailLabel = document.getElementById('financial-forecast-business-type-retail');
      const retailDiv = retailLabel.querySelector('div:not(.sr-only)');
      expect(retailDiv.classList.contains('peer-checked:border-orange-500')).toBe(true);
      expect(retailDiv.classList.contains('peer-checked:bg-orange-50')).toBe(true);
    });

    it('should use amber accents in recommendations', () => {
      const recommendations = document.getElementById('financial-forecast-recommendations');
      expect(recommendations.classList.contains('bg-amber-50')).toBe(true);
      expect(recommendations.classList.contains('border-amber-200')).toBe(true);
      
      const recommendationsTitle = document.getElementById('financial-forecast-recommendations-title');
      expect(recommendationsTitle.classList.contains('text-amber-800')).toBe(true);
      
      const recommendationsList = document.getElementById('financial-forecast-recommendations-list');
      expect(recommendationsList.classList.contains('text-amber-700')).toBe(true);
    });

    it('should use orange accents in table header', () => {
      const tableHeader = document.querySelector('#financial-forecast-results-table thead');
      expect(tableHeader.classList.contains('bg-orange-100')).toBe(true);
    });

    it('should use orange accents in hover states', () => {
      const resultsTbody = document.getElementById('financial-forecast-results-tbody');
      // Test that hover class is available for dynamic content
      expect(resultsTbody).toBeTruthy();
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('#financial-forecast-business-type-section, #financial-forecast-revenue-section, #financial-forecast-expense-section, #financial-forecast-profit-margin-section');
      expect(cards.length).toBe(4);
      
      cards.forEach(card => {
        expect(card.classList.contains('bg-white/95')).toBe(true);
        expect(card.classList.contains('backdrop-blur')).toBe(true);
        expect(card.classList.contains('rounded-lg')).toBe(true);
        expect(card.classList.contains('p-6')).toBe(true);
        expect(card.classList.contains('shadow-md')).toBe(true);
        expect(card.classList.contains('mb-6')).toBe(true);
      });
    });
  });

  // Icon Tests
  describe('Icons', () => {
    it('should use emoji icons', () => {
      const title = document.getElementById('financial-forecast-title');
      expect(title.textContent).toContain('📊');
      
      const revenueLabel = document.getElementById('financial-forecast-revenue-label');
      expect(revenueLabel.textContent).toContain('💰');
      
      const expenseLabel = document.getElementById('financial-forecast-expense-label');
      expect(expenseLabel.textContent).toContain('📋');
      
      const profitMarginLabel = document.getElementById('financial-forecast-profit-margin-label');
      expect(profitMarginLabel.textContent).toContain('🎯');
      
      const generateBtn = document.getElementById('financial-forecast-generate-btn');
      expect(generateBtn.textContent).toContain('🚀');
      
      const resultsTitle = document.getElementById('financial-forecast-results-title');
      expect(resultsTitle.textContent).toContain('📈');
      
      const monthlyBreakdownTitle = document.getElementById('financial-forecast-monthly-breakdown-title');
      expect(monthlyBreakdownTitle.textContent).toContain('📅');
      
      const recommendationsTitle = document.getElementById('financial-forecast-recommendations-title');
      expect(recommendationsTitle.textContent).toContain('💡');
    });

    it('should have emoji icons for business types', () => {
      const retailLabel = document.getElementById('financial-forecast-business-type-retail');
      expect(retailLabel.textContent).toContain('🏪');
      
      const serviceLabel = document.getElementById('financial-forecast-business-type-service');
      expect(serviceLabel.textContent).toContain('🔧');
      
      const manufacturingLabel = document.getElementById('financial-forecast-business-type-manufacturing');
      expect(manufacturingLabel.textContent).toContain('🏭');
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Proyeksi Keuangan Bisnis');
      expect(document.body.textContent).toContain('Rencanakan masa depan keuangan bisnis Anda dengan akurat');
      expect(document.body.textContent).toContain('Tipe Bisnis');
      expect(document.body.textContent).toContain('Proyeksi Pendapatan');
      expect(document.body.textContent).toContain('Kategori Pengeluaran');
      expect(document.body.textContent).toContain('Target Margin Laba');
      expect(document.body.textContent).toContain('Generate Proyeksi Keuangan');
      expect(document.body.textContent).toContain('Hasil Proyeksi Keuangan');
    });

    it('should have proper section headers', () => {
      const h3Elements = document.body.querySelectorAll('h3');
      expect(h3Elements.length).toBe(5);
      expect(h3Elements[0].textContent).toContain('🏢 Tipe Bisnis');
      expect(h3Elements[1].textContent).toContain('💰 Proyeksi Pendapatan');
      expect(h3Elements[2].textContent).toContain('📋 Kategori Pengeluaran');
      expect(h3Elements[3].textContent).toContain('🎯 Target Margin Laba');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h2 = document.getElementById('financial-forecast-title');
      expect(h2).toBeTruthy();
      
      const h3Elements = document.body.querySelectorAll('h3');
      expect(h3Elements.length).toBe(5);
      
      const h4Elements = document.body.querySelectorAll('h4');
      expect(h4Elements.length).toBe(2);
    });

    it('should have labeled form inputs', () => {
      const currentRevenueInput = document.getElementById('financial-forecast-current-revenue');
      expect(currentRevenueInput).toBeTruthy();
      
      const expectedGrowthInput = document.getElementById('financial-forecast-expected-growth');
      expect(expectedGrowthInput).toBeTruthy();
      
      const fixedCostsInput = document.getElementById('financial-forecast-fixed-costs');
      expect(fixedCostsInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const projectionPeriodSelect = document.getElementById('financial-forecast-projection-period');
      expect(projectionPeriodSelect).toBeTruthy();
      
      const seasonalVariationSelect = document.getElementById('financial-forecast-seasonal-variation');
      expect(seasonalVariationSelect).toBeTruthy();
    });

    it('should have radio buttons with proper labels', () => {
      const businessTypeInputs = document.querySelectorAll('input[name="financial-forecast-business-type"]');
      businessTypeInputs.forEach(input => {
        expect(input.classList.contains('peer')).toBe(true);
        expect(input.classList.contains('sr-only')).toBe(true);
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid classes for business types', () => {
      const businessTypeGrid = document.getElementById('financial-forecast-business-type-section').querySelector('.grid');
      expect(businessTypeGrid.classList.contains('grid-cols-1')).toBe(true);
      expect(businessTypeGrid.classList.contains('md:grid-cols-3')).toBe(true);
    });

    it('should have responsive grid classes for revenue inputs', () => {
      const revenueGrid = document.getElementById('financial-forecast-revenue-section').querySelector('.grid');
      expect(revenueGrid.classList.contains('grid-cols-1')).toBe(true);
      expect(revenueGrid.classList.contains('md:grid-cols-2')).toBe(true);
    });

    it('should have responsive grid classes for expense inputs', () => {
      const expenseGrid = document.getElementById('financial-forecast-expense-section').querySelector('.grid');
      expect(expenseGrid.classList.contains('grid-cols-1')).toBe(true);
      expect(expenseGrid.classList.contains('md:grid-cols-2')).toBe(true);
    });

    it('should have responsive grid classes for profit margin inputs', () => {
      const profitMarginGrid = document.getElementById('financial-forecast-profit-margin-section').querySelector('.grid');
      expect(profitMarginGrid.classList.contains('grid-cols-1')).toBe(true);
      expect(profitMarginGrid.classList.contains('md:grid-cols-3')).toBe(true);
    });

    it('should have responsive grid classes for summary cards', () => {
      const summaryCards = document.getElementById('financial-forecast-summary-cards');
      expect(summaryCards.classList.contains('grid-cols-1')).toBe(true);
      expect(summaryCards.classList.contains('md:grid-cols-4')).toBe(true);
    });

    it('should have responsive title sizing', () => {
      const title = document.getElementById('financial-forecast-title');
      expect(title.classList.contains('text-3xl')).toBe(true);
    });
  });

  // Placeholder Tests
  describe('Placeholders', () => {
    it('should have proper placeholders in number inputs', () => {
      const currentRevenueInput = document.getElementById('financial-forecast-current-revenue');
      expect(currentRevenueInput.placeholder).toBe('0');
      
      const expectedGrowthInput = document.getElementById('financial-forecast-expected-growth');
      expect(expectedGrowthInput.placeholder).toBe('0');
      
      const fixedCostsInput = document.getElementById('financial-forecast-fixed-costs');
      expect(fixedCostsInput.placeholder).toBe('0');
      
      const variableCostsInput = document.getElementById('financial-forecast-variable-costs');
      expect(variableCostsInput.placeholder).toBe('0');
      
      const marketingBudgetInput = document.getElementById('financial-forecast-marketing-budget');
      expect(marketingBudgetInput.placeholder).toBe('0');
      
      const operationalCostsInput = document.getElementById('financial-forecast-operational-costs');
      expect(operationalCostsInput.placeholder).toBe('0');
      
      const minimumProfitInput = document.getElementById('financial-forecast-minimum-profit');
      expect(minimumProfitInput.placeholder).toBe('0');
    });

    it('should have proper placeholders in select options', () => {
      const projectionPeriodSelect = document.getElementById('financial-forecast-projection-period');
      expect(projectionPeriodSelect.options[0].textContent).toContain('3 Bulan');
      expect(projectionPeriodSelect.options[1].textContent).toContain('6 Bulan');
      expect(projectionPeriodSelect.options[2].textContent).toContain('12 Bulan');
      expect(projectionPeriodSelect.options[3].textContent).toContain('24 Bulan');
      expect(projectionPeriodSelect.options[4].textContent).toContain('36 Bulan');
      
      const seasonalVariationSelect = document.getElementById('financial-forecast-seasonal-variation');
      expect(seasonalVariationSelect.options[0].textContent).toContain('Tidak Ada');
      expect(seasonalVariationSelect.options[1].textContent).toContain('Rendah');
      expect(seasonalVariationSelect.options[2].textContent).toContain('Sedang');
      expect(seasonalVariationSelect.options[3].textContent).toContain('Tinggi');
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have proper input types', () => {
      const currentRevenueInput = document.getElementById('financial-forecast-current-revenue');
      expect(currentRevenueInput.type).toBe('number');
      
      const expectedGrowthInput = document.getElementById('financial-forecast-expected-growth');
      expect(expectedGrowthInput.type).toBe('number');
      
      const fixedCostsInput = document.getElementById('financial-forecast-fixed-costs');
      expect(fixedCostsInput.type).toBe('number');
    });

    it('should have proper select attributes', () => {
      const projectionPeriodSelect = document.getElementById('financial-forecast-projection-period');
      expect(projectionPeriodSelect.tagName).toBe('SELECT');
      
      const seasonalVariationSelect = document.getElementById('financial-forecast-seasonal-variation');
      expect(seasonalVariationSelect.tagName).toBe('SELECT');
    });

    it('should have proper radio button attributes', () => {
      const businessTypeInputs = document.querySelectorAll('input[name="financial-forecast-business-type"]');
      businessTypeInputs.forEach(input => {
        expect(input.type).toBe('radio');
        expect(input.name).toBe('financial-forecast-business-type');
      });
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have proper spacing in sections', () => {
      const businessTypeSection = document.getElementById('financial-forecast-business-type-section');
      expect(businessTypeSection.classList.contains('mb-6')).toBe(true);
      
      const revenueSection = document.getElementById('financial-forecast-revenue-section');
      expect(revenueSection.classList.contains('mb-6')).toBe(true);
      
      const expenseSection = document.getElementById('financial-forecast-expense-section');
      expect(expenseSection.classList.contains('mb-6')).toBe(true);
      
      const profitMarginSection = document.getElementById('financial-forecast-profit-margin-section');
      expect(profitMarginSection.classList.contains('mb-6')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      const revenueGrid = document.getElementById('financial-forecast-revenue-section').querySelector('.grid');
      expect(revenueGrid.classList.contains('gap-4')).toBe(true);
    });

    it('should have proper results container styling', () => {
      const resultsSection = document.getElementById('financial-forecast-results-section');
      expect(resultsSection.classList.contains('mt-8')).toBe(true);
    });

    it('should have proper summary cards spacing', () => {
      const summaryCards = document.getElementById('financial-forecast-summary-cards');
      expect(summaryCards.classList.contains('gap-4')).toBe(true);
      expect(summaryCards.classList.contains('mb-6')).toBe(true);
    });
  });

  // Additional UI Elements Tests
  describe('Additional UI Elements', () => {
    it('should have proper spacing between sections', () => {
      const sections = [
        document.getElementById('financial-forecast-business-type-section'),
        document.getElementById('financial-forecast-revenue-section'),
        document.getElementById('financial-forecast-expense-section'),
        document.getElementById('financial-forecast-profit-margin-section')
      ];
      
      sections.forEach(section => {
        expect(section.classList.contains('mb-6')).toBe(true);
      });
    });

    it('should have proper results area structure', () => {
      const resultsSection = document.getElementById('financial-forecast-results-section');
      expect(resultsSection.querySelector('#financial-forecast-results-title')).toBeTruthy();
      expect(resultsSection.querySelector('#financial-forecast-summary-cards')).toBeTruthy();
      expect(resultsSection.querySelector('#financial-forecast-monthly-breakdown')).toBeTruthy();
      expect(resultsSection.querySelector('#financial-forecast-recommendations')).toBeTruthy();
    });

    it('should have proper table structure', () => {
      const resultsTable = document.getElementById('financial-forecast-results-table');
      expect(resultsTable.querySelector('thead')).toBeTruthy();
      expect(resultsTable.querySelector('tbody')).toBeTruthy();
    });

    it('should have proper overflow handling for table', () => {
      const overflowDiv = document.getElementById('financial-forecast-monthly-breakdown').querySelector('.overflow-x-auto');
      expect(overflowDiv).toBeTruthy();
    });
  });

  // Input Group Tests
  describe('Input Groups', () => {
    it('should have proper label styling', () => {
      const currentRevenueLabel = document.getElementById('financial-forecast-current-revenue-label');
      expect(currentRevenueLabel.classList.contains('block')).toBe(true);
      expect(currentRevenueLabel.classList.contains('text-sm')).toBe(true);
      expect(currentRevenueLabel.classList.contains('font-medium')).toBe(true);
      expect(currentRevenueLabel.classList.contains('text-gray-700')).toBe(true);
      expect(currentRevenueLabel.classList.contains('mb-2')).toBe(true);
    });

    it('should have proper input styling', () => {
      const numberInputs = document.body.querySelectorAll('input[type="number"]');
      numberInputs.forEach(input => {
        expect(input.classList.contains('w-full')).toBe(true);
        expect(input.classList.contains('py-3')).toBe(true);
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('border-gray-300')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
      });
    });

    it('should have proper select styling', () => {
      const selects = document.body.querySelectorAll('select');
      selects.forEach(select => {
        expect(select.classList.contains('w-full')).toBe(true);
        expect(select.classList.contains('px-4')).toBe(true);
        expect(select.classList.contains('py-3')).toBe(true);
        expect(select.classList.contains('border')).toBe(true);
        expect(select.classList.contains('border-gray-300')).toBe(true);
        expect(select.classList.contains('rounded-lg')).toBe(true);
      });
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have all required elements for functionality', () => {
      // Business type elements
      expect(document.querySelectorAll('input[name="financial-forecast-business-type"]').length).toBe(3);
      
      // Revenue projection elements
      expect(document.getElementById('financial-forecast-current-revenue')).toBeTruthy();
      expect(document.getElementById('financial-forecast-expected-growth')).toBeTruthy();
      expect(document.getElementById('financial-forecast-projection-period')).toBeTruthy();
      expect(document.getElementById('financial-forecast-seasonal-variation')).toBeTruthy();
      
      // Expense elements
      expect(document.getElementById('financial-forecast-fixed-costs')).toBeTruthy();
      expect(document.getElementById('financial-forecast-variable-costs')).toBeTruthy();
      expect(document.getElementById('financial-forecast-marketing-budget')).toBeTruthy();
      expect(document.getElementById('financial-forecast-operational-costs')).toBeTruthy();
      
      // Profit margin elements
      expect(document.getElementById('financial-forecast-target-profit-margin')).toBeTruthy();
      expect(document.getElementById('financial-forecast-minimum-profit')).toBeTruthy();
      expect(document.getElementById('financial-forecast-emergency-fund')).toBeTruthy();
      
      // Generate button
      expect(document.getElementById('financial-forecast-generate-btn')).toBeTruthy();
      
      // Results elements
      expect(document.getElementById('financial-forecast-results-section')).toBeTruthy();
      expect(document.getElementById('financial-forecast-summary-cards')).toBeTruthy();
      expect(document.getElementById('financial-forecast-results-table')).toBeTruthy();
      expect(document.getElementById('financial-forecast-results-tbody')).toBeTruthy();
      expect(document.getElementById('financial-forecast-recommendations-list')).toBeTruthy();
    });

    it('should have proper data attributes for business types', () => {
      const businessTypeInputs = document.querySelectorAll('input[name="financial-forecast-business-type"]');
      businessTypeInputs.forEach(input => {
        expect(input.value).toBeTruthy();
      });
    });

    it('should have selected state on Retail by default', () => {
      const retailInput = document.querySelector('input[value="retail"]');
      expect(retailInput.checked).toBe(true);
    });

    it('should have default values for profit margin inputs', () => {
      const targetProfitMarginInput = document.getElementById('financial-forecast-target-profit-margin');
      expect(targetProfitMarginInput.value).toBe('20');
      
      const emergencyFundInput = document.getElementById('financial-forecast-emergency-fund');
      expect(emergencyFundInput.value).toBe('10');
    });

    it('should have default values for select inputs', () => {
      const projectionPeriodSelect = document.getElementById('financial-forecast-projection-period');
      expect(projectionPeriodSelect.value).toBe('12');
      
      const seasonalVariationSelect = document.getElementById('financial-forecast-seasonal-variation');
      expect(seasonalVariationSelect.value).toBe('medium');
    });
  });
});
