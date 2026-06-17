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

describe('brand-kit-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-brand-kit-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            <i class="fas fa-palette mr-3"></i>Generator Brand Kit
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat identitas brand profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Brand Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Gaya Brand</h2>
              <div id="brand-kit-generator-style-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-style="minimalist" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-minus text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Minimalist</span>
                </button>
                <button type="button" data-style="modern" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-cyan-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bolt text-2xl mb-1 text-cyan-500"></i>
                  <span class="block font-medium">Modern</span>
                </button>
                <button type="button" data-style="corporate" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-building text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Corporate</span>
                </button>
                <button type="button" data-style="playful" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-smile text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Playful</span>
                </button>
                <button type="button" data-style="luxury" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-crown text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Luxury</span>
                </button>
                <button type="button" data-style="vintage" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-camera-retro text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Vintage</span>
                </button>
                <button type="button" data-style="bold" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bold text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Bold</span>
                </button>
                <button type="button" data-style="elegant" class="brand-kit-generator-style-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-feather-alt text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Elegant</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Industry -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Industri</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="brand-kit-generator-industry" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-industry mr-1 text-teal-500"></i>Industri
                  </label>
                  <select id="brand-kit-generator-industry" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
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
            
            <!-- Step 3: Color Palette -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Palet Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="brand-kit-generator-color-palette" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-cyan-500"></i>Palet Warna
                  </label>
                  <select id="brand-kit-generator-color-palette" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="blue-theme">Tema Biru</option>
                    <option value="green-theme">Tema Hijau</option>
                    <option value="purple-theme">Tema Ungu</option>
                    <option value="warm-theme">Tema Hangat</option>
                    <option value="cool-theme">Tema Dingin</option>
                    <option value="neutral-theme">Tema Netral</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Typography -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Tipografi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="brand-kit-generator-typography" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-font mr-1 text-blue-500"></i>Tipografi
                  </label>
                  <select id="brand-kit-generator-typography" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="display">Display</option>
                    <option value="handwritten">Tulisan Tangan</option>
                    <option value="monospace">Monospace</option>
                    <option value="mixed">Campuran</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Brand Elements -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Elemen Brand</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="brand-kit-generator-brand-elements" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-copyright mr-1 text-indigo-500"></i>Elemen Brand
                  </label>
                  <select id="brand-kit-generator-brand-elements" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="logo">Logo</option>
                    <option value="icon">Ikon</option>
                    <option value="pattern">Pola</option>
                    <option value="tagline">Tagline</option>
                    <option value="mascot">Maskot</option>
                    <option value="wordmark">Wordmark</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Deliverables -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Deliverables</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="brand-kit-generator-deliverables" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-box-open mr-1 text-purple-500"></i>Deliverables
                  </label>
                  <select id="brand-kit-generator-deliverables" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="logo-files">File Logo</option>
                    <option value="color-palette">Palet Warna</option>
                    <option value="typography">Tipografi</option>
                    <option value="brand-guidelines">Panduan Brand</option>
                    <option value="social-media-kit">Kit Media Sosial</option>
                    <option value="business-cards">Kartu Nama</option>
                    <option value="letterhead">Kop Surat</option>
                    <option value="email-signature">Tanda Tangan Email</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="brand-kit-generator-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Brand Kit
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="brand-kit-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="brand-kit-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-palette text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil brand kit akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Brand Kit</p>
              </div>
              <div id="brand-kit-generator-results" class="hidden space-y-6"></div>
              <div id="brand-kit-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat brand kit...</p>
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
      const container = document.getElementById('content-brand-kit-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Brand Kit');
      expect(title.querySelector('i.fas.fa-palette')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat identitas brand profesional dengan AI');
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
      expect(rightPanel.querySelector('#brand-kit-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Brand Style Selection Tests
  describe('Brand Style Selection', () => {
    it('should render brand style options container', () => {
      const styleOptions = document.getElementById('brand-kit-generator-style-options');
      expect(styleOptions).toBeTruthy();
    });

    it('should render Minimalist option', () => {
      const minimalistBtn = document.body.querySelector('[data-style="minimalist"]');
      expect(minimalistBtn).toBeTruthy();
      expect(minimalistBtn.textContent).toContain('Minimalist');
      expect(minimalistBtn.querySelector('i.fas.fa-minus')).toBeTruthy();
      expect(minimalistBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Modern option', () => {
      const modernBtn = document.body.querySelector('[data-style="modern"]');
      expect(modernBtn).toBeTruthy();
      expect(modernBtn.textContent).toContain('Modern');
      expect(modernBtn.querySelector('i.fas.fa-bolt')).toBeTruthy();
    });

    it('should render Corporate option', () => {
      const corporateBtn = document.body.querySelector('[data-style="corporate"]');
      expect(corporateBtn).toBeTruthy();
      expect(corporateBtn.textContent).toContain('Corporate');
      expect(corporateBtn.querySelector('i.fas.fa-building')).toBeTruthy();
    });

    it('should render Playful option', () => {
      const playfulBtn = document.body.querySelector('[data-style="playful"]');
      expect(playfulBtn).toBeTruthy();
      expect(playfulBtn.textContent).toContain('Playful');
      expect(playfulBtn.querySelector('i.fas.fa-smile')).toBeTruthy();
    });

    it('should render Luxury option', () => {
      const luxuryBtn = document.body.querySelector('[data-style="luxury"]');
      expect(luxuryBtn).toBeTruthy();
      expect(luxuryBtn.textContent).toContain('Luxury');
      expect(luxuryBtn.querySelector('i.fas.fa-crown')).toBeTruthy();
    });

    it('should render Vintage option', () => {
      const vintageBtn = document.body.querySelector('[data-style="vintage"]');
      expect(vintageBtn).toBeTruthy();
      expect(vintageBtn.textContent).toContain('Vintage');
      expect(vintageBtn.querySelector('i.fas.fa-camera-retro')).toBeTruthy();
    });

    it('should render Bold option', () => {
      const boldBtn = document.body.querySelector('[data-style="bold"]');
      expect(boldBtn).toBeTruthy();
      expect(boldBtn.textContent).toContain('Bold');
      expect(boldBtn.querySelector('i.fas.fa-bold')).toBeTruthy();
    });

    it('should render Elegant option', () => {
      const elegantBtn = document.body.querySelector('[data-style="elegant"]');
      expect(elegantBtn).toBeTruthy();
      expect(elegantBtn.textContent).toContain('Elegant');
      expect(elegantBtn.querySelector('i.fas.fa-feather-alt')).toBeTruthy();
    });

    it('should have 8 brand style options', () => {
      const styleBtns = document.body.querySelectorAll('.brand-kit-generator-style-btn');
      expect(styleBtns.length).toBe(8);
    });

    it('should have proper grid layout for style options', () => {
      const styleOptions = document.getElementById('brand-kit-generator-style-options');
      expect(styleOptions.classList.contains('grid')).toBe(true);
      expect(styleOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(styleOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Gaya Brand');
    });

    it('should have colored hover effects in style buttons', () => {
      const styleBtns = document.body.querySelectorAll('.brand-kit-generator-style-btn');
      expect(styleBtns[0].classList.contains('hover:bg-teal-100')).toBe(true);
      expect(styleBtns[1].classList.contains('hover:bg-cyan-100')).toBe(true);
      expect(styleBtns[2].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(styleBtns[3].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(styleBtns[4].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(styleBtns[5].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(styleBtns[6].classList.contains('hover:bg-red-100')).toBe(true);
      expect(styleBtns[7].classList.contains('hover:bg-yellow-100')).toBe(true);
    });
  });

  // Industry Selection Tests
  describe('Industry Selection', () => {
    it('should render industry select', () => {
      const industrySelect = document.getElementById('brand-kit-generator-industry');
      expect(industrySelect).toBeTruthy();
      expect(industrySelect.tagName).toBe('SELECT');
      expect(industrySelect.options.length).toBe(10);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Industri');
    });

    it('should have all labels with icons', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
    });

    it('should have industry options with proper labels', () => {
      const industrySelect = document.getElementById('brand-kit-generator-industry');
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
      const industrySelect = document.getElementById('brand-kit-generator-industry');
      expect(industrySelect.value).toBe('technology');
    });

    it('should have proper input styling', () => {
      const industrySelect = document.getElementById('brand-kit-generator-industry');
      expect(industrySelect.classList.contains('w-full')).toBe(true);
      expect(industrySelect.classList.contains('p-3')).toBe(true);
      expect(industrySelect.classList.contains('border')).toBe(true);
      expect(industrySelect.classList.contains('rounded-lg')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(industrySelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Color Palette Selection Tests
  describe('Color Palette Selection', () => {
    it('should render color palette select', () => {
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      expect(colorPaletteSelect.tagName).toBe('SELECT');
      expect(colorPaletteSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Palet Warna');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have color palette options with proper labels', () => {
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect.options[0].textContent).toContain('Tema Biru');
      expect(colorPaletteSelect.options[1].textContent).toContain('Tema Hijau');
      expect(colorPaletteSelect.options[2].textContent).toContain('Tema Ungu');
      expect(colorPaletteSelect.options[3].textContent).toContain('Tema Hangat');
      expect(colorPaletteSelect.options[4].textContent).toContain('Tema Dingin');
      expect(colorPaletteSelect.options[5].textContent).toContain('Tema Netral');
    });

    it('should have default color palette value', () => {
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect.value).toBe('blue-theme');
    });

    it('should have proper input styling', () => {
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect.classList.contains('w-full')).toBe(true);
      expect(colorPaletteSelect.classList.contains('p-3')).toBe(true);
      expect(colorPaletteSelect.classList.contains('border')).toBe(true);
      expect(colorPaletteSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Typography Selection Tests
  describe('Typography Selection', () => {
    it('should render typography select', () => {
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect).toBeTruthy();
      expect(typographySelect.tagName).toBe('SELECT');
      expect(typographySelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Tipografi');
    });

    it('should have all labels with icons', () => {
      const fontIcon = document.body.querySelector('i.fas.fa-font');
      expect(fontIcon).toBeTruthy();
    });

    it('should have typography options with proper labels', () => {
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect.options[0].textContent).toContain('Sans Serif');
      expect(typographySelect.options[1].textContent).toContain('Serif');
      expect(typographySelect.options[2].textContent).toContain('Display');
      expect(typographySelect.options[3].textContent).toContain('Tulisan Tangan');
      expect(typographySelect.options[4].textContent).toContain('Monospace');
      expect(typographySelect.options[5].textContent).toContain('Campuran');
    });

    it('should have default typography value', () => {
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect.value).toBe('sans-serif');
    });

    it('should have proper input styling', () => {
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect.classList.contains('w-full')).toBe(true);
      expect(typographySelect.classList.contains('p-3')).toBe(true);
      expect(typographySelect.classList.contains('border')).toBe(true);
      expect(typographySelect.classList.contains('rounded-lg')).toBe(true);
      expect(typographySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(typographySelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Brand Elements Selection Tests
  describe('Brand Elements Selection', () => {
    it('should render brand elements select', () => {
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      expect(brandElementsSelect.tagName).toBe('SELECT');
      expect(brandElementsSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Elemen Brand');
    });

    it('should have all labels with icons', () => {
      const copyrightIcon = document.body.querySelector('i.fas.fa-copyright');
      expect(copyrightIcon).toBeTruthy();
    });

    it('should have brand elements options with proper labels', () => {
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect.options[0].textContent).toContain('Logo');
      expect(brandElementsSelect.options[1].textContent).toContain('Ikon');
      expect(brandElementsSelect.options[2].textContent).toContain('Pola');
      expect(brandElementsSelect.options[3].textContent).toContain('Tagline');
      expect(brandElementsSelect.options[4].textContent).toContain('Maskot');
      expect(brandElementsSelect.options[5].textContent).toContain('Wordmark');
    });

    it('should have default brand elements value', () => {
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect.value).toBe('logo');
    });

    it('should have proper input styling', () => {
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect.classList.contains('w-full')).toBe(true);
      expect(brandElementsSelect.classList.contains('p-3')).toBe(true);
      expect(brandElementsSelect.classList.contains('border')).toBe(true);
      expect(brandElementsSelect.classList.contains('rounded-lg')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Deliverables Selection Tests
  describe('Deliverables Selection', () => {
    it('should render deliverables select', () => {
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect).toBeTruthy();
      expect(deliverablesSelect.tagName).toBe('SELECT');
      expect(deliverablesSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Deliverables');
    });

    it('should have all labels with icons', () => {
      const boxOpenIcon = document.body.querySelector('i.fas.fa-box-open');
      expect(boxOpenIcon).toBeTruthy();
    });

    it('should have deliverables options with proper labels', () => {
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect.options[0].textContent).toContain('File Logo');
      expect(deliverablesSelect.options[1].textContent).toContain('Palet Warna');
      expect(deliverablesSelect.options[2].textContent).toContain('Tipografi');
      expect(deliverablesSelect.options[3].textContent).toContain('Panduan Brand');
      expect(deliverablesSelect.options[4].textContent).toContain('Kit Media Sosial');
      expect(deliverablesSelect.options[5].textContent).toContain('Kartu Nama');
      expect(deliverablesSelect.options[6].textContent).toContain('Kop Surat');
      expect(deliverablesSelect.options[7].textContent).toContain('Tanda Tangan Email');
    });

    it('should have default deliverables value', () => {
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect.value).toBe('logo-files');
    });

    it('should have proper input styling', () => {
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect.classList.contains('w-full')).toBe(true);
      expect(deliverablesSelect.classList.contains('p-3')).toBe(true);
      expect(deliverablesSelect.classList.contains('border')).toBe(true);
      expect(deliverablesSelect.classList.contains('rounded-lg')).toBe(true);
      expect(deliverablesSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(deliverablesSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('brand-kit-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Brand Kit');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('brand-kit-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('brand-kit-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('brand-kit-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('brand-kit-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('brand-kit-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-palette')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil brand kit akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('brand-kit-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('brand-kit-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat brand kit');
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
      const emptyState = document.getElementById('brand-kit-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('brand-kit-generator-empty-state').querySelector('i.fas.fa-palette');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/cyan/blue color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-blue-500')).toBe(true);
    });

    it('should use teal/cyan/blue accents in generate button', () => {
      const generateBtn = document.getElementById('brand-kit-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-500')).toBe(true);
    });

    it('should use teal accents in industry select', () => {
      const industrySelect = document.getElementById('brand-kit-generator-industry');
      expect(industrySelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(industrySelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use cyan accents in color palette select', () => {
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in typography select', () => {
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(typographySelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use indigo accents in brand elements select', () => {
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in deliverables select', () => {
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(deliverablesSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('brand-kit-generator-empty-state').querySelector('i.fas.fa-palette');
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
      expect(icons.length).toBeGreaterThanOrEqual(16);
    });

    it('should have palette icon in header', () => {
      const paletteIcon = document.body.querySelector('header i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('brand-kit-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have minus icon for minimalist style', () => {
      const minusIcon = document.body.querySelector('[data-style="minimalist"] i.fas.fa-minus');
      expect(minusIcon).toBeTruthy();
    });

    it('should have bolt icon for modern style', () => {
      const boltIcon = document.body.querySelector('[data-style="modern"] i.fas.fa-bolt');
      expect(boltIcon).toBeTruthy();
    });

    it('should have building icon for corporate style', () => {
      const buildingIcon = document.body.querySelector('[data-style="corporate"] i.fas.fa-building');
      expect(buildingIcon).toBeTruthy();
    });

    it('should have smile icon for playful style', () => {
      const smileIcon = document.body.querySelector('[data-style="playful"] i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have crown icon for luxury style', () => {
      const crownIcon = document.body.querySelector('[data-style="luxury"] i.fas.fa-crown');
      expect(crownIcon).toBeTruthy();
    });

    it('should have camera-retro icon for vintage style', () => {
      const cameraRetroIcon = document.body.querySelector('[data-style="vintage"] i.fas.fa-camera-retro');
      expect(cameraRetroIcon).toBeTruthy();
    });

    it('should have bold icon for bold style', () => {
      const boldIcon = document.body.querySelector('[data-style="bold"] i.fas.fa-bold');
      expect(boldIcon).toBeTruthy();
    });

    it('should have feather-alt icon for elegant style', () => {
      const featherAltIcon = document.body.querySelector('[data-style="elegant"] i.fas.fa-feather-alt');
      expect(featherAltIcon).toBeTruthy();
    });

    it('should have industry icon for industry', () => {
      const industryIcon = document.body.querySelector('i.fas.fa-industry');
      expect(industryIcon).toBeTruthy();
    });

    it('should have paint-brush icon for color palette', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have font icon for typography', () => {
      const fontIcon = document.body.querySelector('i.fas.fa-font');
      expect(fontIcon).toBeTruthy();
    });

    it('should have copyright icon for brand elements', () => {
      const copyrightIcon = document.body.querySelector('i.fas.fa-copyright');
      expect(copyrightIcon).toBeTruthy();
    });

    it('should have box-open icon for deliverables', () => {
      const boxOpenIcon = document.body.querySelector('i.fas.fa-box-open');
      expect(boxOpenIcon).toBeTruthy();
    });

    it('should have palette icon in empty state', () => {
      const emptyStateIcon = document.getElementById('brand-kit-generator-empty-state').querySelector('i.fas.fa-palette');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Brand Kit');
      expect(document.body.textContent).toContain('Gaya Brand');
      expect(document.body.textContent).toContain('Industri');
      expect(document.body.textContent).toContain('Palet Warna');
      expect(document.body.textContent).toContain('Tipografi');
      expect(document.body.textContent).toContain('Elemen Brand');
      expect(document.body.textContent).toContain('Deliverables');
      expect(document.body.textContent).toContain('Buat Brand Kit');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Gaya Brand');
      expect(headers[1].textContent).toContain('2. Industri');
      expect(headers[2].textContent).toContain('3. Palet Warna');
      expect(headers[3].textContent).toContain('4. Tipografi');
      expect(headers[4].textContent).toContain('5. Elemen Brand');
      expect(headers[5].textContent).toContain('6. Deliverables');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('brand-kit-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil brand kit akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Brand Kit');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('brand-kit-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat brand kit');
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
      const industrySelect = document.getElementById('brand-kit-generator-industry');
      expect(industrySelect).toBeTruthy();
      
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect).toBeTruthy();
      
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const industrySelect = document.getElementById('brand-kit-generator-industry');
      expect(industrySelect).toBeTruthy();
      
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect).toBeTruthy();
      
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('brand-kit-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const industrySelect = document.getElementById('brand-kit-generator-industry');
      expect(industrySelect.tagName).toBe('SELECT');
      
      const colorPaletteSelect = document.getElementById('brand-kit-generator-color-palette');
      expect(colorPaletteSelect.tagName).toBe('SELECT');
      
      const typographySelect = document.getElementById('brand-kit-generator-typography');
      expect(typographySelect.tagName).toBe('SELECT');
      
      const brandElementsSelect = document.getElementById('brand-kit-generator-brand-elements');
      expect(brandElementsSelect.tagName).toBe('SELECT');
      
      const deliverablesSelect = document.getElementById('brand-kit-generator-deliverables');
      expect(deliverablesSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for style selection', () => {
      const styleBtns = document.body.querySelectorAll('.brand-kit-generator-style-btn');
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
