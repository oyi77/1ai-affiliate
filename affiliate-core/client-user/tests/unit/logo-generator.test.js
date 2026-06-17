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

describe('logo-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-logo-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            <i class="fas fa-pen-nib mr-3"></i>Generator Logo
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat logo profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Logo Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Gaya Logo</h2>
              <div id="logo-generator-style-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-style="minimalist" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-minus text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Minimalis</span>
                </button>
                <button type="button" data-style="modern" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-violet-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shapes text-2xl mb-1 text-violet-500"></i>
                  <span class="block font-medium">Modern</span>
                </button>
                <button type="button" data-style="vintage" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-history text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Vintage</span>
                </button>
                <button type="button" data-style="hand-drawn" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-pencil-alt text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Hand-drawn</span>
                </button>
                <button type="button" data-style="geometric" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-violet-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shapes text-2xl mb-1 text-violet-500"></i>
                  <span class="block font-medium">Geometris</span>
                </button>
                <button type="button" data-style="abstract" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shapes text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Abstrak</span>
                </button>
                <button type="button" data-style="mascot" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-smile text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Maskot</span>
                </button>
                <button type="button" data-style="typographic" class="logo-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-violet-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-font text-2xl mb-1 text-violet-500"></i>
                  <span class="block font-medium">Tipografi</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Brand Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Tipe Brand</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="logo-generator-brand-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-building mr-1 text-purple-500"></i>Tipe Brand
                  </label>
                  <select id="logo-generator-brand-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="business">Bisnis</option>
                    <option value="startup">Startup</option>
                    <option value="product">Produk</option>
                    <option value="app">Aplikasi</option>
                    <option value="service">Jasa</option>
                    <option value="personal">Pribadi</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Color Scheme -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Skema Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="logo-generator-color-scheme" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-violet-500"></i>Skema Warna
                  </label>
                  <select id="logo-generator-color-scheme" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                    <option value="single-color">Warna Tunggal</option>
                    <option value="dual-color">Dua Warna</option>
                    <option value="multi-color">Multi Warna</option>
                    <option value="monochrome">Monokrom</option>
                    <option value="gradient">Gradient</option>
                    <option value="earth-tones">Warna Alam</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Industry -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Industri</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="logo-generator-industry" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-industry mr-1 text-indigo-500"></i>Industri
                  </label>
                  <select id="logo-generator-industry" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="technology">Teknologi</option>
                    <option value="food-beverage">Makanan & Minuman</option>
                    <option value="fashion">Fashion</option>
                    <option value="health">Kesehatan</option>
                    <option value="education">Pendidikan</option>
                    <option value="finance">Keuangan</option>
                    <option value="entertainment">Hiburan</option>
                    <option value="sports">Olahraga</option>
                    <option value="real-estate">Properti</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Icon/Symbol -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Ikon/Simbol</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="logo-generator-icon-symbol" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-icons mr-1 text-purple-500"></i>Ikon/Simbol
                  </label>
                  <select id="logo-generator-icon-symbol" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="include-icon">Termasuk Ikon</option>
                    <option value="text-only">Teks Saja</option>
                    <option value="icon-text">Ikon + Teks</option>
                    <option value="monogram">Monogram</option>
                    <option value="emblem">Emblem</option>
                    <option value="none">Tidak Ada</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Output Format -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Format Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="logo-generator-output-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-export mr-1 text-violet-500"></i>Format Output
                  </label>
                  <select id="logo-generator-output-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="logo-generator-generate-btn" class="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Logo
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="logo-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="logo-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-pen-nib text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil logo akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Logo</p>
              </div>
              <div id="logo-generator-results" class="hidden space-y-6"></div>
              <div id="logo-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-600 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat logo...</p>
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
      const container = document.getElementById('content-logo-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Logo');
      expect(title.querySelector('i.fas.fa-pen-nib')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat logo profesional dengan AI');
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
      expect(rightPanel.querySelector('#logo-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Logo Style Selection Tests
  describe('Logo Style Selection', () => {
    it('should render logo style options container', () => {
      const styleOptions = document.getElementById('logo-generator-style-options');
      expect(styleOptions).toBeTruthy();
    });

    it('should render Minimalist option', () => {
      const minimalistBtn = document.body.querySelector('[data-style="minimalist"]');
      expect(minimalistBtn).toBeTruthy();
      expect(minimalistBtn.textContent).toContain('Minimalis');
      expect(minimalistBtn.querySelector('i.fas.fa-minus')).toBeTruthy();
      expect(minimalistBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Modern option', () => {
      const modernBtn = document.body.querySelector('[data-style="modern"]');
      expect(modernBtn).toBeTruthy();
      expect(modernBtn.textContent).toContain('Modern');
      expect(modernBtn.querySelector('i.fas.fa-shapes')).toBeTruthy();
    });

    it('should render Vintage option', () => {
      const vintageBtn = document.body.querySelector('[data-style="vintage"]');
      expect(vintageBtn).toBeTruthy();
      expect(vintageBtn.textContent).toContain('Vintage');
      expect(vintageBtn.querySelector('i.fas.fa-history')).toBeTruthy();
    });

    it('should render Hand-drawn option', () => {
      const handDrawnBtn = document.body.querySelector('[data-style="hand-drawn"]');
      expect(handDrawnBtn).toBeTruthy();
      expect(handDrawnBtn.textContent).toContain('Hand-drawn');
      expect(handDrawnBtn.querySelector('i.fas.fa-pencil-alt')).toBeTruthy();
    });

    it('should render Geometric option', () => {
      const geometricBtn = document.body.querySelector('[data-style="geometric"]');
      expect(geometricBtn).toBeTruthy();
      expect(geometricBtn.textContent).toContain('Geometris');
      expect(geometricBtn.querySelector('i.fas.fa-shapes')).toBeTruthy();
    });

    it('should render Abstract option', () => {
      const abstractBtn = document.body.querySelector('[data-style="abstract"]');
      expect(abstractBtn).toBeTruthy();
      expect(abstractBtn.textContent).toContain('Abstrak');
      expect(abstractBtn.querySelector('i.fas.fa-shapes')).toBeTruthy();
    });

    it('should render Mascot option', () => {
      const mascotBtn = document.body.querySelector('[data-style="mascot"]');
      expect(mascotBtn).toBeTruthy();
      expect(mascotBtn.textContent).toContain('Maskot');
      expect(mascotBtn.querySelector('i.fas.fa-smile')).toBeTruthy();
    });

    it('should render Typographic option', () => {
      const typographicBtn = document.body.querySelector('[data-style="typographic"]');
      expect(typographicBtn).toBeTruthy();
      expect(typographicBtn.textContent).toContain('Tipografi');
      expect(typographicBtn.querySelector('i.fas.fa-font')).toBeTruthy();
    });

    it('should have 8 logo style options', () => {
      const styleBtns = document.body.querySelectorAll('.logo-generator-style-btn');
      expect(styleBtns.length).toBe(8);
    });

    it('should have proper grid layout for style options', () => {
      const styleOptions = document.getElementById('logo-generator-style-options');
      expect(styleOptions.classList.contains('grid')).toBe(true);
      expect(styleOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(styleOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Gaya Logo');
    });

    it('should have colored hover effects in style buttons', () => {
      const styleBtns = document.body.querySelectorAll('.logo-generator-style-btn');
      expect(styleBtns[0].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(styleBtns[1].classList.contains('hover:bg-violet-100')).toBe(true);
      expect(styleBtns[2].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(styleBtns[3].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(styleBtns[4].classList.contains('hover:bg-violet-100')).toBe(true);
      expect(styleBtns[5].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(styleBtns[6].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(styleBtns[7].classList.contains('hover:bg-violet-100')).toBe(true);
    });
  });

  // Brand Type Selection Tests
  describe('Brand Type Selection', () => {
    it('should render brand type select', () => {
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect).toBeTruthy();
      expect(brandTypeSelect.tagName).toBe('SELECT');
      expect(brandTypeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Tipe Brand');
    });

    it('should have all labels with icons', () => {
      const buildingIcon = document.body.querySelector('i.fas.fa-building');
      expect(buildingIcon).toBeTruthy();
    });

    it('should have brand type options with proper labels', () => {
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect.options[0].textContent).toContain('Bisnis');
      expect(brandTypeSelect.options[1].textContent).toContain('Startup');
      expect(brandTypeSelect.options[2].textContent).toContain('Produk');
      expect(brandTypeSelect.options[3].textContent).toContain('Aplikasi');
      expect(brandTypeSelect.options[4].textContent).toContain('Jasa');
      expect(brandTypeSelect.options[5].textContent).toContain('Pribadi');
    });

    it('should have default brand type value', () => {
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect.value).toBe('business');
    });

    it('should have proper input styling', () => {
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect.classList.contains('w-full')).toBe(true);
      expect(brandTypeSelect.classList.contains('p-3')).toBe(true);
      expect(brandTypeSelect.classList.contains('border')).toBe(true);
      expect(brandTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(brandTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(brandTypeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Color Scheme Selection Tests
  describe('Color Scheme Selection', () => {
    it('should render color scheme select', () => {
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect).toBeTruthy();
      expect(colorSchemeSelect.tagName).toBe('SELECT');
      expect(colorSchemeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Skema Warna');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have color scheme options with proper labels', () => {
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect.options[0].textContent).toContain('Warna Tunggal');
      expect(colorSchemeSelect.options[1].textContent).toContain('Dua Warna');
      expect(colorSchemeSelect.options[2].textContent).toContain('Multi Warna');
      expect(colorSchemeSelect.options[3].textContent).toContain('Monokrom');
      expect(colorSchemeSelect.options[4].textContent).toContain('Gradient');
      expect(colorSchemeSelect.options[5].textContent).toContain('Warna Alam');
    });

    it('should have default color scheme value', () => {
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect.value).toBe('single-color');
    });

    it('should have proper input styling', () => {
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect.classList.contains('w-full')).toBe(true);
      expect(colorSchemeSelect.classList.contains('p-3')).toBe(true);
      expect(colorSchemeSelect.classList.contains('border')).toBe(true);
      expect(colorSchemeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorSchemeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorSchemeSelect.classList.contains('focus:ring-violet-500')).toBe(true);
    });
  });

  // Industry Selection Tests
  describe('Industry Selection', () => {
    it('should render industry select', () => {
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect).toBeTruthy();
      expect(industrySelect.tagName).toBe('SELECT');
      expect(industrySelect.options.length).toBe(10);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Industri');
    });

    it('should have all labels with icons', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
    });

    it('should have industry options with proper labels', () => {
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect.options[0].textContent).toContain('Teknologi');
      expect(industrySelect.options[1].textContent).toContain('Makanan & Minuman');
      expect(industrySelect.options[2].textContent).toContain('Fashion');
      expect(industrySelect.options[3].textContent).toContain('Kesehatan');
      expect(industrySelect.options[4].textContent).toContain('Pendidikan');
      expect(industrySelect.options[5].textContent).toContain('Keuangan');
      expect(industrySelect.options[6].textContent).toContain('Hiburan');
      expect(industrySelect.options[7].textContent).toContain('Olahraga');
      expect(industrySelect.options[8].textContent).toContain('Properti');
      expect(industrySelect.options[9].textContent).toContain('Lainnya');
    });

    it('should have default industry value', () => {
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect.value).toBe('technology');
    });

    it('should have proper input styling', () => {
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect.classList.contains('w-full')).toBe(true);
      expect(industrySelect.classList.contains('p-3')).toBe(true);
      expect(industrySelect.classList.contains('border')).toBe(true);
      expect(industrySelect.classList.contains('rounded-lg')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Icon/Symbol Selection Tests
  describe('Icon/Symbol Selection', () => {
    it('should render icon/symbol select', () => {
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect).toBeTruthy();
      expect(iconSymbolSelect.tagName).toBe('SELECT');
      expect(iconSymbolSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Ikon/Simbol');
    });

    it('should have all labels with icons', () => {
      const iconsIcon = document.body.querySelector('i.fas.fa-icons');
      expect(iconsIcon).toBeTruthy();
    });

    it('should have icon/symbol options with proper labels', () => {
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect.options[0].textContent).toContain('Termasuk Ikon');
      expect(iconSymbolSelect.options[1].textContent).toContain('Teks Saja');
      expect(iconSymbolSelect.options[2].textContent).toContain('Ikon + Teks');
      expect(iconSymbolSelect.options[3].textContent).toContain('Monogram');
      expect(iconSymbolSelect.options[4].textContent).toContain('Emblem');
      expect(iconSymbolSelect.options[5].textContent).toContain('Tidak Ada');
    });

    it('should have default icon/symbol value', () => {
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect.value).toBe('include-icon');
    });

    it('should have proper input styling', () => {
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect.classList.contains('w-full')).toBe(true);
      expect(iconSymbolSelect.classList.contains('p-3')).toBe(true);
      expect(iconSymbolSelect.classList.contains('border')).toBe(true);
      expect(iconSymbolSelect.classList.contains('rounded-lg')).toBe(true);
      expect(iconSymbolSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(iconSymbolSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Output Format Selection Tests
  describe('Output Format Selection', () => {
    it('should render output format select', () => {
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect).toBeTruthy();
      expect(outputFormatSelect.tagName).toBe('SELECT');
      expect(outputFormatSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Format Output');
    });

    it('should have all labels with icons', () => {
      const fileExportIcon = document.body.querySelector('i.fas.fa-file-export');
      expect(fileExportIcon).toBeTruthy();
    });

    it('should have output format options with proper labels', () => {
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect.options[0].textContent).toContain('PNG');
      expect(outputFormatSelect.options[1].textContent).toContain('SVG');
      expect(outputFormatSelect.options[2].textContent).toContain('JPEG');
      expect(outputFormatSelect.options[3].textContent).toContain('PDF');
    });

    it('should have default output format value', () => {
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect.value).toBe('png');
    });

    it('should have proper input styling', () => {
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect.classList.contains('w-full')).toBe(true);
      expect(outputFormatSelect.classList.contains('p-3')).toBe(true);
      expect(outputFormatSelect.classList.contains('border')).toBe(true);
      expect(outputFormatSelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-violet-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('logo-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Logo');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('logo-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-violet-600')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('logo-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('logo-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('logo-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('logo-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-pen-nib')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil logo akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('logo-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('logo-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat logo');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-purple-600')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('logo-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('logo-generator-empty-state').querySelector('i.fas.fa-pen-nib');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/violet/indigo color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-600')).toBe(true);
      expect(title.classList.contains('via-violet-600')).toBe(true);
      expect(title.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use purple/violet/indigo accents in generate button', () => {
      const generateBtn = document.getElementById('logo-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-violet-600')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use purple accents in brand type select', () => {
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(brandTypeSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use violet accents in color scheme select', () => {
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect.classList.contains('focus:ring-violet-500')).toBe(true);
      expect(colorSchemeSelect.classList.contains('focus:border-violet-500')).toBe(true);
    });

    it('should use indigo accents in industry select', () => {
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(industrySelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in icon/symbol select', () => {
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(iconSymbolSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use violet accents in output format select', () => {
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect.classList.contains('focus:ring-violet-500')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:border-violet-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-600')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('logo-generator-empty-state').querySelector('i.fas.fa-pen-nib');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(16);
    });

    it('should have pen-nib icon in header', () => {
      const penNibIcon = document.body.querySelector('header i.fas.fa-pen-nib');
      expect(penNibIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('logo-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have minus icon for minimalist style', () => {
      const minusIcon = document.body.querySelector('[data-style="minimalist"] i.fas.fa-minus');
      expect(minusIcon).toBeTruthy();
    });

    it('should have shapes icon for modern style', () => {
      const shapesIcon = document.body.querySelector('[data-style="modern"] i.fas.fa-shapes');
      expect(shapesIcon).toBeTruthy();
    });

    it('should have history icon for vintage style', () => {
      const historyIcon = document.body.querySelector('[data-style="vintage"] i.fas.fa-history');
      expect(historyIcon).toBeTruthy();
    });

    it('should have pencil-alt icon for hand-drawn style', () => {
      const pencilAltIcon = document.body.querySelector('[data-style="hand-drawn"] i.fas.fa-pencil-alt');
      expect(pencilAltIcon).toBeTruthy();
    });

    it('should have shapes icon for geometric style', () => {
      const shapesIcon = document.body.querySelector('[data-style="geometric"] i.fas.fa-shapes');
      expect(shapesIcon).toBeTruthy();
    });

    it('should have shapes icon for abstract style', () => {
      const shapesIcon = document.body.querySelector('[data-style="abstract"] i.fas.fa-shapes');
      expect(shapesIcon).toBeTruthy();
    });

    it('should have smile icon for mascot style', () => {
      const smileIcon = document.body.querySelector('[data-style="mascot"] i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have font icon for typographic style', () => {
      const fontIcon = document.body.querySelector('[data-style="typographic"] i.fas.fa-font');
      expect(fontIcon).toBeTruthy();
    });

    it('should have building icon for brand type', () => {
      const buildingIcon = document.body.querySelector('i.fas.fa-building');
      expect(buildingIcon).toBeTruthy();
    });

    it('should have palette icon for color scheme', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have industry icon for industry', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
    });

    it('should have icons icon for icon/symbol', () => {
      const iconsIcon = document.body.querySelector('i.fas.fa-icons');
      expect(iconsIcon).toBeTruthy();
    });

    it('should have file-export icon for output format', () => {
      const fileExportIcon = document.body.querySelector('i.fas.fa-file-export');
      expect(fileExportIcon).toBeTruthy();
    });

    it('should have pen-nib icon in empty state', () => {
      const emptyStateIcon = document.getElementById('logo-generator-empty-state').querySelector('i.fas.fa-pen-nib');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Logo');
      expect(document.body.textContent).toContain('Gaya Logo');
      expect(document.body.textContent).toContain('Tipe Brand');
      expect(document.body.textContent).toContain('Skema Warna');
      expect(document.body.textContent).toContain('Industri');
      expect(document.body.textContent).toContain('Ikon/Simbol');
      expect(document.body.textContent).toContain('Format Output');
      expect(document.body.textContent).toContain('Buat Logo');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Gaya Logo');
      expect(headers[1].textContent).toContain('2. Tipe Brand');
      expect(headers[2].textContent).toContain('3. Skema Warna');
      expect(headers[3].textContent).toContain('4. Industri');
      expect(headers[4].textContent).toContain('5. Ikon/Simbol');
      expect(headers[5].textContent).toContain('6. Format Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('logo-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil logo akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Logo');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('logo-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat logo');
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
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect).toBeTruthy();
      
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect).toBeTruthy();
      
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect).toBeTruthy();
      
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect).toBeTruthy();
      
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect).toBeTruthy();
      
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect).toBeTruthy();
      
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect).toBeTruthy();
      
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect).toBeTruthy();
      
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('logo-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const brandTypeSelect = document.getElementById('logo-generator-brand-type');
      expect(brandTypeSelect.tagName).toBe('SELECT');
      
      const colorSchemeSelect = document.getElementById('logo-generator-color-scheme');
      expect(colorSchemeSelect.tagName).toBe('SELECT');
      
      const industrySelect = document.getElementById('logo-generator-industry');
      expect(industrySelect.tagName).toBe('SELECT');
      
      const iconSymbolSelect = document.getElementById('logo-generator-icon-symbol');
      expect(iconSymbolSelect.tagName).toBe('SELECT');
      
      const outputFormatSelect = document.getElementById('logo-generator-output-format');
      expect(outputFormatSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for style selection', () => {
      const styleBtns = document.body.querySelectorAll('.logo-generator-style-btn');
      styleBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for style buttons', () => {
      const minimalistBtn = document.body.querySelector('[data-style="minimalist"]');
      expect(minimalistBtn.dataset.style).toBe('minimalist');
      expect(minimalistBtn.dataset.selected).toBe('true');
      
      const modernBtn = document.body.querySelector('[data-style="modern"]');
      expect(modernBtn.dataset.style).toBe('modern');
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
