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

describe('banner-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-banner-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
            <i class="fas fa-columns mr-3"></i>Generator Banner
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat banner profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Banner Text -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Teks Banner</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="banner-generator-text" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heading mr-1 text-blue-500"></i>Teks Banner
                  </label>
                  <input type="text" id="banner-generator-text" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan teks banner...">
                </div>
              </div>
            </div>
            
            <!-- Step 2: Banner Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Tipe Banner</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="banner-generator-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullhorn mr-1 text-cyan-500"></i>Tipe Banner
                  </label>
                  <select id="banner-generator-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="website-header">Header Website</option>
                    <option value="social-media">Media Sosial</option>
                    <option value="email-header">Header Email</option>
                    <option value="landing-page">Halaman Landing</option>
                    <option value="ad-banner">Banner Iklan</option>
                    <option value="promo-strip">Strip Promo</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Industry -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Industri</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="banner-generator-industry" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-industry mr-1 text-blue-500"></i>Industri
                  </label>
                  <select id="banner-generator-industry" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="technology">Teknologi</option>
                    <option value="fashion">Fashion</option>
                    <option value="food-beverage">Makanan & Minuman</option>
                    <option value="health">Kesehatan</option>
                    <option value="education">Pendidikan</option>
                    <option value="finance">Keuangan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="banner-generator-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-cyan-500"></i>Gaya Desain
                  </label>
                  <select id="banner-generator-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="corporate">Korporat</option>
                    <option value="creative">Kreatif</option>
                    <option value="minimal">Minimal</option>
                    <option value="bold">Berani</option>
                    <option value="elegant">Elegan</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Color Theme -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Tema Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="banner-generator-color-theme" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-blue-500"></i>Tema Warna
                  </label>
                  <select id="banner-generator-color-theme" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="blue">Biru</option>
                    <option value="red">Merah</option>
                    <option value="green">Hijau</option>
                    <option value="purple">Ungu</option>
                    <option value="orange">Oranye</option>
                    <option value="black-white">Hitam/Putih</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Size -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Ukuran</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="banner-generator-size" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand mr-1 text-cyan-500"></i>Ukuran Banner
                  </label>
                  <select id="banner-generator-size" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="728x90">728x90 (Leaderboard)</option>
                    <option value="300x250">300x250 (Medium Rectangle)</option>
                    <option value="160x600">160x600 (Wide Skyscraper)</option>
                    <option value="320x50">320x50 (Mobile Leaderboard)</option>
                    <option value="1200x628">1200x628 (Social Media)</option>
                    <option value="1920x1080">1920x1080 (Full HD)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="banner-generator-generate-btn" class="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Banner
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="banner-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="banner-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-columns text-6xl mb-4 text-blue-400"></i>
                <p class="text-xl">Hasil banner akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Banner</p>
              </div>
              <div id="banner-generator-results" class="hidden space-y-6"></div>
              <div id="banner-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat banner...</p>
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
      const container = document.getElementById('content-banner-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Banner');
      expect(title.querySelector('i.fas.fa-columns')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat banner profesional dengan AI');
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
      expect(rightPanel.querySelector('#banner-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Banner Text Input Tests
  describe('Banner Text Input', () => {
    it('should render banner text input', () => {
      const textInput = document.getElementById('banner-generator-text');
      expect(textInput).toBeTruthy();
      expect(textInput.tagName).toBe('INPUT');
      expect(textInput.type).toBe('text');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Teks Banner');
    });

    it('should have label with icon', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon).toBeTruthy();
    });

    it('should have proper input styling', () => {
      const textInput = document.getElementById('banner-generator-text');
      expect(textInput.classList.contains('w-full')).toBe(true);
      expect(textInput.classList.contains('p-3')).toBe(true);
      expect(textInput.classList.contains('border')).toBe(true);
      expect(textInput.classList.contains('rounded-lg')).toBe(true);
      expect(textInput.classList.contains('focus:ring-2')).toBe(true);
      expect(textInput.classList.contains('focus:ring-blue-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const textInput = document.getElementById('banner-generator-text');
      expect(textInput.placeholder).toBe('Masukkan teks banner...');
    });
  });

  // Banner Type Selection Tests
  describe('Banner Type Selection', () => {
    it('should render banner type select', () => {
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.tagName).toBe('SELECT');
      expect(typeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Tipe Banner');
    });

    it('should have label with icon', () => {
      const bullhornIcon = document.body.querySelector('i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
    });

    it('should have banner type options with proper labels', () => {
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect.options[0].textContent).toContain('Header Website');
      expect(typeSelect.options[1].textContent).toContain('Media Sosial');
      expect(typeSelect.options[2].textContent).toContain('Header Email');
      expect(typeSelect.options[3].textContent).toContain('Halaman Landing');
      expect(typeSelect.options[4].textContent).toContain('Banner Iklan');
      expect(typeSelect.options[5].textContent).toContain('Strip Promo');
    });

    it('should have default banner type value', () => {
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect.value).toBe('website-header');
    });

    it('should have proper input styling', () => {
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect.classList.contains('w-full')).toBe(true);
      expect(typeSelect.classList.contains('p-3')).toBe(true);
      expect(typeSelect.classList.contains('border')).toBe(true);
      expect(typeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Industry Selection Tests
  describe('Industry Selection', () => {
    it('should render industry select', () => {
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect).toBeTruthy();
      expect(industrySelect.tagName).toBe('SELECT');
      expect(industrySelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Industri');
    });

    it('should have label with icon', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
    });

    it('should have industry options with proper labels', () => {
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect.options[0].textContent).toContain('Teknologi');
      expect(industrySelect.options[1].textContent).toContain('Fashion');
      expect(industrySelect.options[2].textContent).toContain('Makanan & Minuman');
      expect(industrySelect.options[3].textContent).toContain('Kesehatan');
      expect(industrySelect.options[4].textContent).toContain('Pendidikan');
      expect(industrySelect.options[5].textContent).toContain('Keuangan');
    });

    it('should have default industry value', () => {
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect.value).toBe('technology');
    });

    it('should have proper input styling', () => {
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect.classList.contains('w-full')).toBe(true);
      expect(industrySelect.classList.contains('p-3')).toBe(true);
      expect(industrySelect.classList.contains('border')).toBe(true);
      expect(industrySelect.classList.contains('rounded-lg')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Style Selection Tests
  describe('Style Selection', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya');
    });

    it('should have label with icon', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect.options[0].textContent).toContain('Korporat');
      expect(styleSelect.options[1].textContent).toContain('Kreatif');
      expect(styleSelect.options[2].textContent).toContain('Minimal');
      expect(styleSelect.options[3].textContent).toContain('Berani');
      expect(styleSelect.options[4].textContent).toContain('Elegan');
      expect(styleSelect.options[5].textContent).toContain('Playful');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect.value).toBe('corporate');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Color Theme Selection Tests
  describe('Color Theme Selection', () => {
    it('should render color theme select', () => {
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect).toBeTruthy();
      expect(colorThemeSelect.tagName).toBe('SELECT');
      expect(colorThemeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Tema Warna');
    });

    it('should have label with icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have color theme options with proper labels', () => {
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect.options[0].textContent).toContain('Biru');
      expect(colorThemeSelect.options[1].textContent).toContain('Merah');
      expect(colorThemeSelect.options[2].textContent).toContain('Hijau');
      expect(colorThemeSelect.options[3].textContent).toContain('Ungu');
      expect(colorThemeSelect.options[4].textContent).toContain('Oranye');
      expect(colorThemeSelect.options[5].textContent).toContain('Hitam/Putih');
    });

    it('should have default color theme value', () => {
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect.value).toBe('blue');
    });

    it('should have proper input styling', () => {
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect.classList.contains('w-full')).toBe(true);
      expect(colorThemeSelect.classList.contains('p-3')).toBe(true);
      expect(colorThemeSelect.classList.contains('border')).toBe(true);
      expect(colorThemeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorThemeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorThemeSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Size Selection Tests
  describe('Size Selection', () => {
    it('should render size select', () => {
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect).toBeTruthy();
      expect(sizeSelect.tagName).toBe('SELECT');
      expect(sizeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Ukuran');
    });

    it('should have label with icon', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have size options with proper labels', () => {
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect.options[0].textContent).toContain('728x90');
      expect(sizeSelect.options[1].textContent).toContain('300x250');
      expect(sizeSelect.options[2].textContent).toContain('160x600');
      expect(sizeSelect.options[3].textContent).toContain('320x50');
      expect(sizeSelect.options[4].textContent).toContain('1200x628');
      expect(sizeSelect.options[5].textContent).toContain('1920x1080');
    });

    it('should have default size value', () => {
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect.value).toBe('728x90');
    });

    it('should have proper input styling', () => {
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect.classList.contains('w-full')).toBe(true);
      expect(sizeSelect.classList.contains('p-3')).toBe(true);
      expect(sizeSelect.classList.contains('border')).toBe(true);
      expect(sizeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('banner-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Banner');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('banner-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('banner-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('banner-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('banner-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('banner-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-columns')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil banner akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('banner-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('banner-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat banner');
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
      const emptyState = document.getElementById('banner-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have blue icon in empty state', () => {
      const emptyStateIcon = document.getElementById('banner-generator-empty-state').querySelector('i.fas.fa-columns');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/cyan color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-blue-400')).toBe(true);
    });

    it('should use blue/cyan accents in generate button', () => {
      const generateBtn = document.getElementById('banner-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-400')).toBe(true);
    });

    it('should use blue accents in text input', () => {
      const textInput = document.getElementById('banner-generator-text');
      expect(textInput.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(textInput.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in type select', () => {
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(typeSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in industry select', () => {
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(industrySelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in style select', () => {
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in color theme select', () => {
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(colorThemeSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in size select', () => {
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(sizeSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should use blue accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('banner-generator-empty-state').querySelector('i.fas.fa-columns');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(9);
    });

    it('should have columns icon in header', () => {
      const columnsIcon = document.body.querySelector('header i.fas.fa-columns');
      expect(columnsIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('banner-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have heading icon for text input', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon).toBeTruthy();
    });

    it('should have bullhorn icon for banner type', () => {
      const bullhornIcon = document.body.querySelector('i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
    });

    it('should have industry icon for industry', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have palette icon for color theme', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have expand icon for size', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have columns icon in empty state', () => {
      const emptyStateIcon = document.getElementById('banner-generator-empty-state').querySelector('i.fas.fa-columns');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have blue heading icon', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have cyan bullhorn icon', () => {
      const bullhornIcon = document.body.querySelector('i.fas.fa-bullhorn');
      expect(bullhornIcon.classList.contains('text-cyan-500')).toBe(true);
    });

    it('should have blue industry icon', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have cyan paint-brush icon', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon.classList.contains('text-cyan-500')).toBe(true);
    });

    it('should have blue palette icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have cyan expand icon', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon.classList.contains('text-cyan-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Banner');
      expect(document.body.textContent).toContain('Teks Banner');
      expect(document.body.textContent).toContain('Tipe Banner');
      expect(document.body.textContent).toContain('Industri');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Tema Warna');
      expect(document.body.textContent).toContain('Ukuran');
      expect(document.body.textContent).toContain('Buat Banner');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Teks Banner');
      expect(headers[1].textContent).toContain('2. Tipe Banner');
      expect(headers[2].textContent).toContain('3. Industri');
      expect(headers[3].textContent).toContain('4. Gaya');
      expect(headers[4].textContent).toContain('5. Tema Warna');
      expect(headers[5].textContent).toContain('6. Ukuran');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('banner-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil banner akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Banner');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('banner-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat banner');
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
      const textInput = document.getElementById('banner-generator-text');
      expect(textInput).toBeTruthy();
      
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect).toBeTruthy();
      
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect).toBeTruthy();
      
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const textInput = document.getElementById('banner-generator-text');
      expect(textInput).toBeTruthy();
      
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect).toBeTruthy();
      
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect).toBeTruthy();
      
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('banner-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const textInput = document.getElementById('banner-generator-text');
      expect(textInput.tagName).toBe('INPUT');
      expect(textInput.type).toBe('text');
      
      const typeSelect = document.getElementById('banner-generator-type');
      expect(typeSelect.tagName).toBe('SELECT');
      
      const industrySelect = document.getElementById('banner-generator-industry');
      expect(industrySelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('banner-generator-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const colorThemeSelect = document.getElementById('banner-generator-color-theme');
      expect(colorThemeSelect.tagName).toBe('SELECT');
      
      const sizeSelect = document.getElementById('banner-generator-size');
      expect(sizeSelect.tagName).toBe('SELECT');
    });

    it('should have proper label associations', () => {
      const textLabel = document.querySelector('label[for="banner-generator-text"]');
      expect(textLabel).toBeTruthy();
      
      const typeLabel = document.querySelector('label[for="banner-generator-type"]');
      expect(typeLabel).toBeTruthy();
      
      const industryLabel = document.querySelector('label[for="banner-generator-industry"]');
      expect(industryLabel).toBeTruthy();
      
      const styleLabel = document.querySelector('label[for="banner-generator-style"]');
      expect(styleLabel).toBeTruthy();
      
      const colorThemeLabel = document.querySelector('label[for="banner-generator-color-theme"]');
      expect(colorThemeLabel).toBeTruthy();
      
      const sizeLabel = document.querySelector('label[for="banner-generator-size"]');
      expect(sizeLabel).toBeTruthy();
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
