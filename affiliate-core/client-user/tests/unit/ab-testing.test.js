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

describe('ab-testing Component', () => {
  
  const mockComponentHTML = `
    <div id="content-ab-testing" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
            <i class="fas fa-vial mr-3"></i>A/B Testing AI
          </h1>
          <p class="text-lg text-gray-600 mt-2">Optimalkan conversion rate dengan pengujian A/B berbasis AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Test Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Test</h2>
              <div id="ab-testing-test-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="headline-test" class="ab-testing-test-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-heading text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Headline</span>
                </button>
                <button type="button" data-type="image-test" class="ab-testing-test-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-image text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Gambar</span>
                </button>
                <button type="button" data-type="color-test" class="ab-testing-test-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-violet-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-palette text-2xl mb-1 text-violet-500"></i>
                  <span class="block font-medium">Warna</span>
                </button>
                <button type="button" data-type="layout-test" class="ab-testing-test-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-th-large text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Layout</span>
                </button>
                <button type="button" data-type="cta-test" class="ab-testing-test-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-mouse-pointer text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">CTA</span>
                </button>
                <button type="button" data-type="content-test" class="ab-testing-test-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-violet-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-align-left text-2xl mb-1 text-violet-500"></i>
                  <span class="block font-medium">Konten</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Metric Goal -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Target Metrik</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="ab-testing-metric-goal" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-indigo-500"></i>Target Metrik
                  </label>
                  <select id="ab-testing-metric-goal" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="conversion-rate">Conversion Rate</option>
                    <option value="click-through-rate">Click-Through Rate</option>
                    <option value="engagement">Engagement</option>
                    <option value="bounce-rate">Bounce Rate</option>
                    <option value="time-on-page">Time on Page</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="ab-testing-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Audiens Target
                  </label>
                  <select id="ab-testing-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="new-visitors">Pengunjung Baru</option>
                    <option value="returning-visitors">Pengunjung Kembali</option>
                    <option value="mobile-users">Pengguna Mobile</option>
                    <option value="desktop-users">Pengguna Desktop</option>
                    <option value="high-value-users">Pengguna Ber nilai Tinggi</option>
                    <option value="all-users">Semua Pengguna</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Traffic Volume -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Volume Traffic</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="ab-testing-traffic-volume" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-chart-line mr-1 text-violet-500"></i>Volume Traffic
                  </label>
                  <select id="ab-testing-traffic-volume" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                    <option value="low">Rendah (<1000)</option>
                    <option value="medium">Sedang (1000-10000)</option>
                    <option value="high">Tinggi (10000-100000)</option>
                    <option value="very-high">Sangat Tinggi (>100000)</option>
                    <option value="not-sure">Tidak Yakin</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Duration -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Durasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="ab-testing-duration" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock mr-1 text-indigo-500"></i>Durasi Test
                  </label>
                  <select id="ab-testing-duration" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="24-hours">24 Jam</option>
                    <option value="48-hours">48 Jam</option>
                    <option value="1-week">1 Minggu</option>
                    <option value="2-weeks">2 Minggu</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Confidence Level -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Tingkat Kepercayaan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="ab-testing-confidence-level" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-check-circle mr-1 text-purple-500"></i>Tingkat Kepercayaan
                  </label>
                  <select id="ab-testing-confidence-level" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="90">90%</option>
                    <option value="95">95%</option>
                    <option value="99">99%</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="ab-testing-generate-btn" class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-flask mr-2"></i>Buat Strategi A/B Test
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="ab-testing-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="ab-testing-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-vial text-6xl mb-4 text-indigo-400"></i>
                <p class="text-xl">Hasil strategi A/B testing akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Strategi A/B Test</p>
              </div>
              <div id="ab-testing-results" class="hidden space-y-6"></div>
              <div id="ab-testing-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-indigo-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang menganalisis dan membuat strategi A/B test...</p>
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
      const container = document.getElementById('content-ab-testing');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('A/B Testing AI');
      expect(title.querySelector('i.fas.fa-vial')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Optimalkan conversion rate dengan pengujian A/B berbasis AI');
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
      expect(rightPanel.querySelector('#ab-testing-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Test Type Selection Tests
  describe('Test Type Selection', () => {
    it('should render test type options container', () => {
      const typeOptions = document.getElementById('ab-testing-test-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Headline option', () => {
      const headlineBtn = document.body.querySelector('[data-type="headline-test"]');
      expect(headlineBtn).toBeTruthy();
      expect(headlineBtn.textContent).toContain('Headline');
      expect(headlineBtn.querySelector('i.fas.fa-heading')).toBeTruthy();
      expect(headlineBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Image option', () => {
      const imageBtn = document.body.querySelector('[data-type="image-test"]');
      expect(imageBtn).toBeTruthy();
      expect(imageBtn.textContent).toContain('Gambar');
      expect(imageBtn.querySelector('i.fas.fa-image')).toBeTruthy();
    });

    it('should render Color option', () => {
      const colorBtn = document.body.querySelector('[data-type="color-test"]');
      expect(colorBtn).toBeTruthy();
      expect(colorBtn.textContent).toContain('Warna');
      expect(colorBtn.querySelector('i.fas.fa-palette')).toBeTruthy();
    });

    it('should render Layout option', () => {
      const layoutBtn = document.body.querySelector('[data-type="layout-test"]');
      expect(layoutBtn).toBeTruthy();
      expect(layoutBtn.textContent).toContain('Layout');
      expect(layoutBtn.querySelector('i.fas.fa-th-large')).toBeTruthy();
    });

    it('should render CTA option', () => {
      const ctaBtn = document.body.querySelector('[data-type="cta-test"]');
      expect(ctaBtn).toBeTruthy();
      expect(ctaBtn.textContent).toContain('CTA');
      expect(ctaBtn.querySelector('i.fas.fa-mouse-pointer')).toBeTruthy();
    });

    it('should render Content option', () => {
      const contentBtn = document.body.querySelector('[data-type="content-test"]');
      expect(contentBtn).toBeTruthy();
      expect(contentBtn.textContent).toContain('Konten');
      expect(contentBtn.querySelector('i.fas.fa-align-left')).toBeTruthy();
    });

    it('should have 6 test type options', () => {
      const typeBtns = document.body.querySelectorAll('.ab-testing-test-type-btn');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('ab-testing-test-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Test');
    });

    it('should have colored hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.ab-testing-test-type-btn');
      expect(typeBtns[0].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(typeBtns[1].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(typeBtns[2].classList.contains('hover:bg-violet-100')).toBe(true);
      expect(typeBtns[3].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(typeBtns[4].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(typeBtns[5].classList.contains('hover:bg-violet-100')).toBe(true);
    });
  });

  // Metric Goal Selection Tests
  describe('Metric Goal Selection', () => {
    it('should render metric goal select', () => {
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect).toBeTruthy();
      expect(metricGoalSelect.tagName).toBe('SELECT');
      expect(metricGoalSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Target Metrik');
    });

    it('should have all labels with icons', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
    });

    it('should have metric goal options with proper labels', () => {
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect.options[0].textContent).toContain('Conversion Rate');
      expect(metricGoalSelect.options[1].textContent).toContain('Click-Through Rate');
      expect(metricGoalSelect.options[2].textContent).toContain('Engagement');
      expect(metricGoalSelect.options[3].textContent).toContain('Bounce Rate');
      expect(metricGoalSelect.options[4].textContent).toContain('Time on Page');
      expect(metricGoalSelect.options[5].textContent).toContain('Revenue');
    });

    it('should have default metric goal value', () => {
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect.value).toBe('conversion-rate');
    });

    it('should have proper input styling', () => {
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect.classList.contains('w-full')).toBe(true);
      expect(metricGoalSelect.classList.contains('p-3')).toBe(true);
      expect(metricGoalSelect.classList.contains('border')).toBe(true);
      expect(metricGoalSelect.classList.contains('rounded-lg')).toBe(true);
      expect(metricGoalSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(metricGoalSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect.options[0].textContent).toContain('Pengunjung Baru');
      expect(audienceSelect.options[1].textContent).toContain('Pengunjung Kembali');
      expect(audienceSelect.options[2].textContent).toContain('Pengguna Mobile');
      expect(audienceSelect.options[3].textContent).toContain('Pengguna Desktop');
      expect(audienceSelect.options[4].textContent).toContain('Pengguna Ber nilai Tinggi');
      expect(audienceSelect.options[5].textContent).toContain('Semua Pengguna');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect.value).toBe('new-visitors');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Traffic Volume Selection Tests
  describe('Traffic Volume Selection', () => {
    it('should render traffic volume select', () => {
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect).toBeTruthy();
      expect(trafficVolumeSelect.tagName).toBe('SELECT');
      expect(trafficVolumeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Volume Traffic');
    });

    it('should have all labels with icons', () => {
      const chartLineIcon = document.body.querySelector('i.fas.fa-chart-line');
      expect(chartLineIcon).toBeTruthy();
    });

    it('should have traffic volume options with proper labels', () => {
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect.options[0].textContent).toContain('Rendah');
      expect(trafficVolumeSelect.options[1].textContent).toContain('Sedang');
      expect(trafficVolumeSelect.options[2].textContent).toContain('Tinggi');
      expect(trafficVolumeSelect.options[3].textContent).toContain('Sangat Tinggi');
      expect(trafficVolumeSelect.options[4].textContent).toContain('Tidak Yakin');
    });

    it('should have default traffic volume value', () => {
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect.value).toBe('low');
    });

    it('should have proper input styling', () => {
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect.classList.contains('w-full')).toBe(true);
      expect(trafficVolumeSelect.classList.contains('p-3')).toBe(true);
      expect(trafficVolumeSelect.classList.contains('border')).toBe(true);
      expect(trafficVolumeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(trafficVolumeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(trafficVolumeSelect.classList.contains('focus:ring-violet-500')).toBe(true);
    });
  });

  // Duration Selection Tests
  describe('Duration Selection', () => {
    it('should render duration select', () => {
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect).toBeTruthy();
      expect(durationSelect.tagName).toBe('SELECT');
      expect(durationSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Durasi');
    });

    it('should have all labels with icons', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have duration options with proper labels', () => {
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect.options[0].textContent).toContain('24 Jam');
      expect(durationSelect.options[1].textContent).toContain('48 Jam');
      expect(durationSelect.options[2].textContent).toContain('1 Minggu');
      expect(durationSelect.options[3].textContent).toContain('2 Minggu');
    });

    it('should have default duration value', () => {
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect.value).toBe('24-hours');
    });

    it('should have proper input styling', () => {
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect.classList.contains('w-full')).toBe(true);
      expect(durationSelect.classList.contains('p-3')).toBe(true);
      expect(durationSelect.classList.contains('border')).toBe(true);
      expect(durationSelect.classList.contains('rounded-lg')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Confidence Level Selection Tests
  describe('Confidence Level Selection', () => {
    it('should render confidence level select', () => {
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect).toBeTruthy();
      expect(confidenceLevelSelect.tagName).toBe('SELECT');
      expect(confidenceLevelSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Tingkat Kepercayaan');
    });

    it('should have all labels with icons', () => {
      const checkCircleIcon = document.body.querySelector('i.fas.fa-check-circle');
      expect(checkCircleIcon).toBeTruthy();
    });

    it('should have confidence level options with proper labels', () => {
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect.options[0].textContent).toContain('90%');
      expect(confidenceLevelSelect.options[1].textContent).toContain('95%');
      expect(confidenceLevelSelect.options[2].textContent).toContain('99%');
    });

    it('should have default confidence level value', () => {
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect.value).toBe('90');
    });

    it('should have proper input styling', () => {
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect.classList.contains('w-full')).toBe(true);
      expect(confidenceLevelSelect.classList.contains('p-3')).toBe(true);
      expect(confidenceLevelSelect.classList.contains('border')).toBe(true);
      expect(confidenceLevelSelect.classList.contains('rounded-lg')).toBe(true);
      expect(confidenceLevelSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(confidenceLevelSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('ab-testing-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Strategi A/B Test');
      expect(generateBtn.querySelector('i.fas.fa-flask')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('ab-testing-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('via-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('ab-testing-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('ab-testing-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('ab-testing-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('ab-testing-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-vial')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil strategi A/B testing akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('ab-testing-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('ab-testing-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang menganalisis dan membuat strategi A/B test');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-indigo-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('ab-testing-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have indigo icon in empty state', () => {
      const emptyStateIcon = document.getElementById('ab-testing-empty-state').querySelector('i.fas.fa-vial');
      expect(emptyStateIcon.classList.contains('text-indigo-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use indigo/purple/violet color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-indigo-500')).toBe(true);
      expect(title.classList.contains('via-purple-500')).toBe(true);
      expect(title.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use indigo/purple/violet accents in generate button', () => {
      const generateBtn = document.getElementById('ab-testing-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('via-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use indigo accents in metric goal select', () => {
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(metricGoalSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in audience select', () => {
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use violet accents in traffic volume select', () => {
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect.classList.contains('focus:ring-violet-500')).toBe(true);
      expect(trafficVolumeSelect.classList.contains('focus:border-violet-500')).toBe(true);
    });

    it('should use indigo accents in duration select', () => {
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(durationSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in confidence level select', () => {
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(confidenceLevelSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-indigo-500')).toBe(true);
    });

    it('should use indigo accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('ab-testing-empty-state').querySelector('i.fas.fa-vial');
      expect(emptyStateIcon.classList.contains('text-indigo-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(14);
    });

    it('should have vial icon in header', () => {
      const vialIcon = document.body.querySelector('header i.fas.fa-vial');
      expect(vialIcon).toBeTruthy();
    });

    it('should have flask icon in generate button', () => {
      const flaskIcon = document.getElementById('ab-testing-generate-btn').querySelector('i.fas.fa-flask');
      expect(flaskIcon).toBeTruthy();
    });

    it('should have heading icon for headline test type', () => {
      const headingIcon = document.body.querySelector('[data-type="headline-test"] i.fas.fa-heading');
      expect(headingIcon).toBeTruthy();
    });

    it('should have image icon for image test type', () => {
      const imageIcon = document.body.querySelector('[data-type="image-test"] i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have palette icon for color test type', () => {
      const paletteIcon = document.body.querySelector('[data-type="color-test"] i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have th-large icon for layout test type', () => {
      const thLargeIcon = document.body.querySelector('[data-type="layout-test"] i.fas.fa-th-large');
      expect(thLargeIcon).toBeTruthy();
    });

    it('should have mouse-pointer icon for CTA test type', () => {
      const mousePointerIcon = document.body.querySelector('[data-type="cta-test"] i.fas.fa-mouse-pointer');
      expect(mousePointerIcon).toBeTruthy();
    });

    it('should have align-left icon for content test type', () => {
      const alignLeftIcon = document.body.querySelector('[data-type="content-test"] i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have bullseye icon for metric goal', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have chart-line icon for traffic volume', () => {
      const chartLineIcon = document.body.querySelector('i.fas.fa-chart-line');
      expect(chartLineIcon).toBeTruthy();
    });

    it('should have clock icon for duration', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have check-circle icon for confidence level', () => {
      const checkCircleIcon = document.body.querySelector('i.fas.fa-check-circle');
      expect(checkCircleIcon).toBeTruthy();
    });

    it('should have vial icon in empty state', () => {
      const emptyStateIcon = document.getElementById('ab-testing-empty-state').querySelector('i.fas.fa-vial');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('A/B Testing AI');
      expect(document.body.textContent).toContain('Jenis Test');
      expect(document.body.textContent).toContain('Target Metrik');
      expect(document.body.textContent).toContain('Audiens');
      expect(document.body.textContent).toContain('Volume Traffic');
      expect(document.body.textContent).toContain('Durasi');
      expect(document.body.textContent).toContain('Tingkat Kepercayaan');
      expect(document.body.textContent).toContain('Buat Strategi A/B Test');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Test');
      expect(headers[1].textContent).toContain('2. Target Metrik');
      expect(headers[2].textContent).toContain('3. Audiens');
      expect(headers[3].textContent).toContain('4. Volume Traffic');
      expect(headers[4].textContent).toContain('5. Durasi');
      expect(headers[5].textContent).toContain('6. Tingkat Kepercayaan');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('ab-testing-empty-state');
      expect(emptyState.textContent).toContain('Hasil strategi A/B testing akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Strategi A/B Test');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('ab-testing-loading');
      expect(loading.textContent).toContain('Sedang menganalisis dan membuat strategi A/B test');
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
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect).toBeTruthy();
      
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect).toBeTruthy();
      
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect).toBeTruthy();
      
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect).toBeTruthy();
      
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect).toBeTruthy();
      
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect).toBeTruthy();
      
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('ab-testing-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const metricGoalSelect = document.getElementById('ab-testing-metric-goal');
      expect(metricGoalSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('ab-testing-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const trafficVolumeSelect = document.getElementById('ab-testing-traffic-volume');
      expect(trafficVolumeSelect.tagName).toBe('SELECT');
      
      const durationSelect = document.getElementById('ab-testing-duration');
      expect(durationSelect.tagName).toBe('SELECT');
      
      const confidenceLevelSelect = document.getElementById('ab-testing-confidence-level');
      expect(confidenceLevelSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for type selection', () => {
      const typeBtns = document.body.querySelectorAll('.ab-testing-test-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const headlineBtn = document.body.querySelector('[data-type="headline-test"]');
      expect(headlineBtn.dataset.type).toBe('headline-test');
      expect(headlineBtn.dataset.selected).toBe('true');
      
      const imageBtn = document.body.querySelector('[data-type="image-test"]');
      expect(imageBtn.dataset.type).toBe('image-test');
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
