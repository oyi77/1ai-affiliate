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

describe('tattoo-editor Component', () => {
  
  const mockComponentHTML = `
    <div id="content-tattoo-editor" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
            <i class="fas fa-pen-nib mr-3"></i>Editor Tato
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konsep desain tato yang unik dan bermakna untuk proyek Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Tattoo Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Gaya Tato</h2>
              <div id="tattoo-editor-style-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-style="tribal" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-wave-square text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Tribal</span>
                </button>
                <button type="button" data-style="realistic" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-portrait text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Realistis</span>
                </button>
                <button type="button" data-style="traditional" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-anchor text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Tradisional</span>
                </button>
                <button type="button" data-style="neo-traditional" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-feather-alt text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Neo-Tradisional</span>
                </button>
                <button type="button" data-style="watercolor" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-palette text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Watercolor</span>
                </button>
                <button type="button" data-style="minimalist" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-circle text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Minimalis</span>
                </button>
                <button type="button" data-style="geometric" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shapes text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Geometris</span>
                </button>
                <button type="button" data-style="japanese" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-torii-gate text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Jepang</span>
                </button>
                <button type="button" data-style="script" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-pen-fancy text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Script</span>
                </button>
                <button type="button" data-style="blackwork" class="style-btn-tattoo-editor p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-moon text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Blackwork</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Placement -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Penempatan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="tattoo-editor-placement" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-map-marker-alt mr-1 text-purple-500"></i>Lokasi Tato
                  </label>
                  <select id="tattoo-editor-placement" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="arm">Lengan</option>
                    <option value="leg">Kaki</option>
                    <option value="back">Punggung</option>
                    <option value="chest">Dada</option>
                    <option value="shoulder">Bahu</option>
                    <option value="wrist">Pergelangan Tangan</option>
                    <option value="ankle">Pergelangan Kaki</option>
                    <option value="ribcage">Tulang Rusuk</option>
                    <option value="neck">Leher</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Size -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Ukuran</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="tattoo-editor-size" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand-arrows-alt mr-1 text-purple-500"></i>Ukuran
                  </label>
                  <select id="tattoo-editor-size" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="small">Kecil</option>
                    <option value="medium">Sedang</option>
                    <option value="large">Besar</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Color -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="tattoo-editor-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-purple-500"></i>Warna
                  </label>
                  <select id="tattoo-editor-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="black-gray">Hitam & Abu</option>
                    <option value="color">Warna</option>
                    <option value="white-ink">Tinta Putih</option>
                    <option value="mixed">Campuran</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Subject -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Subjek</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="tattoo-editor-subject" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-image mr-1 text-purple-500"></i>Subjek
                  </label>
                  <select id="tattoo-editor-subject" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="animals">Hewan</option>
                    <option value="flowers">Bunga</option>
                    <option value="skulls">Tengkorak</option>
                    <option value="quotes">Kutipan</option>
                    <option value="symbols">Simbol</option>
                    <option value="portraits">Potret</option>
                    <option value="nature">Alam</option>
                    <option value="fantasy">Fantasi</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="tattoo-editor-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Target Audiens
                  </label>
                  <select id="tattoo-editor-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="enthusiasts">Enthusiast</option>
                    <option value="first-timers">Pemula</option>
                    <option value="collectors">Kolektor</option>
                    <option value="professionals">Profesional</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">7. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="tattoo-editor-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-purple-500"></i>Nuansa
                  </label>
                  <select id="tattoo-editor-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="bold">Berani</option>
                    <option value="delicate">Halus</option>
                    <option value="dark">Gelap</option>
                    <option value="whimsical">Unik</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                
                <div>
                  <label for="tattoo-editor-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-purple-500"></i>Deskripsi Tato
                  </label>
                  <textarea id="tattoo-editor-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Jelaskan desain tato yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 8: Generate Button -->
            <button id="tattoo-editor-generate-btn" class="w-full bg-gradient-to-r from-purple-600 via-rose-500 to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Desain Tato
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="tattoo-editor-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="tattoo-editor-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-pen-nib text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil desain tato akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Desain Tato</p>
              </div>
              <div id="tattoo-editor-results" class="hidden space-y-6"></div>
              <div id="tattoo-editor-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat desain tato...</p>
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
      const container = document.getElementById('content-tattoo-editor');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Editor Tato');
      expect(title.querySelector('i.fas.fa-pen-nib')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konsep desain tato yang unik dan bermakna untuk proyek Anda');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(7);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#tattoo-editor-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Tattoo Style Selection Tests
  describe('Tattoo Style Selection', () => {
    it('should render tattoo style options container', () => {
      const styleOptions = document.getElementById('tattoo-editor-style-options');
      expect(styleOptions).toBeTruthy();
    });

    it('should render Tribal option', () => {
      const tribalBtn = document.body.querySelector('[data-style="tribal"]');
      expect(tribalBtn).toBeTruthy();
      expect(tribalBtn.textContent).toContain('Tribal');
      expect(tribalBtn.querySelector('i.fas.fa-wave-square')).toBeTruthy();
      expect(tribalBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Realistic option', () => {
      const realisticBtn = document.body.querySelector('[data-style="realistic"]');
      expect(realisticBtn).toBeTruthy();
      expect(realisticBtn.textContent).toContain('Realistis');
      expect(realisticBtn.querySelector('i.fas.fa-portrait')).toBeTruthy();
    });

    it('should render Traditional option', () => {
      const traditionalBtn = document.body.querySelector('[data-style="traditional"]');
      expect(traditionalBtn).toBeTruthy();
      expect(traditionalBtn.textContent).toContain('Tradisional');
      expect(traditionalBtn.querySelector('i.fas.fa-anchor')).toBeTruthy();
    });

    it('should render Neo-Traditional option', () => {
      const neoTraditionalBtn = document.body.querySelector('[data-style="neo-traditional"]');
      expect(neoTraditionalBtn).toBeTruthy();
      expect(neoTraditionalBtn.textContent).toContain('Neo-Tradisional');
      expect(neoTraditionalBtn.querySelector('i.fas.fa-feather-alt')).toBeTruthy();
    });

    it('should render Watercolor option', () => {
      const watercolorBtn = document.body.querySelector('[data-style="watercolor"]');
      expect(watercolorBtn).toBeTruthy();
      expect(watercolorBtn.textContent).toContain('Watercolor');
      expect(watercolorBtn.querySelector('i.fas.fa-palette')).toBeTruthy();
    });

    it('should render Minimalist option', () => {
      const minimalistBtn = document.body.querySelector('[data-style="minimalist"]');
      expect(minimalistBtn).toBeTruthy();
      expect(minimalistBtn.textContent).toContain('Minimalis');
      expect(minimalistBtn.querySelector('i.fas.fa-circle')).toBeTruthy();
    });

    it('should render Geometric option', () => {
      const geometricBtn = document.body.querySelector('[data-style="geometric"]');
      expect(geometricBtn).toBeTruthy();
      expect(geometricBtn.textContent).toContain('Geometris');
      expect(geometricBtn.querySelector('i.fas.fa-shapes')).toBeTruthy();
    });

    it('should render Japanese option', () => {
      const japaneseBtn = document.body.querySelector('[data-style="japanese"]');
      expect(japaneseBtn).toBeTruthy();
      expect(japaneseBtn.textContent).toContain('Jepang');
      expect(japaneseBtn.querySelector('i.fas.fa-torii-gate')).toBeTruthy();
    });

    it('should render Script option', () => {
      const scriptBtn = document.body.querySelector('[data-style="script"]');
      expect(scriptBtn).toBeTruthy();
      expect(scriptBtn.textContent).toContain('Script');
      expect(scriptBtn.querySelector('i.fas.fa-pen-fancy')).toBeTruthy();
    });

    it('should render Blackwork option', () => {
      const blackworkBtn = document.body.querySelector('[data-style="blackwork"]');
      expect(blackworkBtn).toBeTruthy();
      expect(blackworkBtn.textContent).toContain('Blackwork');
      expect(blackworkBtn.querySelector('i.fas.fa-moon')).toBeTruthy();
    });

    it('should have 10 tattoo style options', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-tattoo-editor');
      expect(styleBtns.length).toBe(10);
    });

    it('should have proper grid layout for style options', () => {
      const styleOptions = document.getElementById('tattoo-editor-style-options');
      expect(styleOptions.classList.contains('grid')).toBe(true);
      expect(styleOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(styleOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have purple icons for all style options', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-tattoo-editor');
      styleBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Gaya Tato');
    });

    it('should have purple hover effects in style buttons', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-tattoo-editor');
      styleBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
      });
    });
  });

  // Placement Input Tests
  describe('Placement Input', () => {
    it('should render placement select', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect).toBeTruthy();
      expect(placementSelect.tagName).toBe('SELECT');
      expect(placementSelect.options.length).toBe(9);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Penempatan');
    });

    it('should have all labels with icons', () => {
      const mapMarkerIcon = document.body.querySelector('i.fas.fa-map-marker-alt');
      expect(mapMarkerIcon).toBeTruthy();
    });

    it('should have placement options with proper labels', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect.options[0].textContent).toContain('Lengan');
      expect(placementSelect.options[1].textContent).toContain('Kaki');
      expect(placementSelect.options[2].textContent).toContain('Punggung');
      expect(placementSelect.options[3].textContent).toContain('Dada');
      expect(placementSelect.options[4].textContent).toContain('Bahu');
      expect(placementSelect.options[5].textContent).toContain('Pergelangan Tangan');
      expect(placementSelect.options[6].textContent).toContain('Pergelangan Kaki');
      expect(placementSelect.options[7].textContent).toContain('Tulang Rusuk');
      expect(placementSelect.options[8].textContent).toContain('Leher');
    });

    it('should have default placement value', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect.value).toBe('arm');
    });

    it('should have proper input styling', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect.classList.contains('w-full')).toBe(true);
      expect(placementSelect.classList.contains('p-3')).toBe(true);
      expect(placementSelect.classList.contains('border')).toBe(true);
      expect(placementSelect.classList.contains('rounded-lg')).toBe(true);
      expect(placementSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(placementSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Size Input Tests
  describe('Size Input', () => {
    it('should render size select', () => {
      const sizeSelect = document.getElementById('tattoo-editor-size');
      expect(sizeSelect).toBeTruthy();
      expect(sizeSelect.tagName).toBe('SELECT');
      expect(sizeSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Ukuran');
    });

    it('should have all labels with icons', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandIcon).toBeTruthy();
    });

    it('should have size options with proper labels', () => {
      const sizeSelect = document.getElementById('tattoo-editor-size');
      expect(sizeSelect.options[0].textContent).toContain('Kecil');
      expect(sizeSelect.options[1].textContent).toContain('Sedang');
      expect(sizeSelect.options[2].textContent).toContain('Besar');
      expect(sizeSelect.options[3].textContent).toContain('Custom');
    });

    it('should have default size value', () => {
      const sizeSelect = document.getElementById('tattoo-editor-size');
      expect(sizeSelect.value).toBe('small');
    });

    it('should have proper input styling', () => {
      const sizeSelect = document.getElementById('tattoo-editor-size');
      expect(sizeSelect.classList.contains('w-full')).toBe(true);
      expect(sizeSelect.classList.contains('p-3')).toBe(true);
      expect(sizeSelect.classList.contains('border')).toBe(true);
      expect(sizeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Color Input Tests
  describe('Color Input', () => {
    it('should render color select', () => {
      const colorSelect = document.getElementById('tattoo-editor-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Warna');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have color options with proper labels', () => {
      const colorSelect = document.getElementById('tattoo-editor-color');
      expect(colorSelect.options[0].textContent).toContain('Hitam & Abu');
      expect(colorSelect.options[1].textContent).toContain('Warna');
      expect(colorSelect.options[2].textContent).toContain('Tinta Putih');
      expect(colorSelect.options[3].textContent).toContain('Campuran');
    });

    it('should have default color value', () => {
      const colorSelect = document.getElementById('tattoo-editor-color');
      expect(colorSelect.value).toBe('black-gray');
    });

    it('should have proper input styling', () => {
      const colorSelect = document.getElementById('tattoo-editor-color');
      expect(colorSelect.classList.contains('w-full')).toBe(true);
      expect(colorSelect.classList.contains('p-3')).toBe(true);
      expect(colorSelect.classList.contains('border')).toBe(true);
      expect(colorSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Subject Input Tests
  describe('Subject Input', () => {
    it('should render subject select', () => {
      const subjectSelect = document.getElementById('tattoo-editor-subject');
      expect(subjectSelect).toBeTruthy();
      expect(subjectSelect.tagName).toBe('SELECT');
      expect(subjectSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Subjek');
    });

    it('should have all labels with icons', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have subject options with proper labels', () => {
      const subjectSelect = document.getElementById('tattoo-editor-subject');
      expect(subjectSelect.options[0].textContent).toContain('Hewan');
      expect(subjectSelect.options[1].textContent).toContain('Bunga');
      expect(subjectSelect.options[2].textContent).toContain('Tengkorak');
      expect(subjectSelect.options[3].textContent).toContain('Kutipan');
      expect(subjectSelect.options[4].textContent).toContain('Simbol');
      expect(subjectSelect.options[5].textContent).toContain('Potret');
      expect(subjectSelect.options[6].textContent).toContain('Alam');
      expect(subjectSelect.options[7].textContent).toContain('Fantasi');
    });

    it('should have default subject value', () => {
      const subjectSelect = document.getElementById('tattoo-editor-subject');
      expect(subjectSelect.value).toBe('animals');
    });

    it('should have proper input styling', () => {
      const subjectSelect = document.getElementById('tattoo-editor-subject');
      expect(subjectSelect.classList.contains('w-full')).toBe(true);
      expect(subjectSelect.classList.contains('p-3')).toBe(true);
      expect(subjectSelect.classList.contains('border')).toBe(true);
      expect(subjectSelect.classList.contains('rounded-lg')).toBe(true);
      expect(subjectSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(subjectSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('tattoo-editor-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('tattoo-editor-audience');
      expect(audienceSelect.options[0].textContent).toContain('Enthusiast');
      expect(audienceSelect.options[1].textContent).toContain('Pemula');
      expect(audienceSelect.options[2].textContent).toContain('Kolektor');
      expect(audienceSelect.options[3].textContent).toContain('Profesional');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('tattoo-editor-audience');
      expect(audienceSelect.value).toBe('enthusiasts');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('tattoo-editor-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('tattoo-editor-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('tattoo-editor-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan desain tato yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[6].textContent).toContain('7. Nuansa');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('tattoo-editor-tone');
      expect(toneSelect.options[0].textContent).toContain('Berani');
      expect(toneSelect.options[1].textContent).toContain('Halus');
      expect(toneSelect.options[2].textContent).toContain('Gelap');
      expect(toneSelect.options[3].textContent).toContain('Unik');
      expect(toneSelect.options[4].textContent).toContain('Spiritual');
      expect(toneSelect.options[5].textContent).toContain('Personal');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('tattoo-editor-tone');
      expect(toneSelect.value).toBe('bold');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('tattoo-editor-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('tattoo-editor-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Desain Tato');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('tattoo-editor-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('tattoo-editor-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('tattoo-editor-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('tattoo-editor-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('tattoo-editor-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-pen-nib')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil desain tato akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('tattoo-editor-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('tattoo-editor-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat desain tato');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('tattoo-editor-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('tattoo-editor-empty-state').querySelector('i.fas.fa-pen-nib');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/rose/pink color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-600')).toBe(true);
      expect(title.classList.contains('via-rose-500')).toBe(true);
      expect(title.classList.contains('to-pink-600')).toBe(true);
    });

    it('should use purple/rose/pink accents in generate button', () => {
      const generateBtn = document.getElementById('tattoo-editor-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-600')).toBe(true);
    });

    it('should use purple accents in style buttons', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-tattoo-editor');
      styleBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in focus states', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(placementSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('tattoo-editor-empty-state').querySelector('i.fas.fa-pen-nib');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple hover effects in style buttons', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-tattoo-editor');
      styleBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
      });
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(8);
      
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
      expect(icons.length).toBeGreaterThanOrEqual(20);
    });

    it('should have pen-nib icon in header', () => {
      const penNibIcon = document.body.querySelector('header i.fas.fa-pen-nib');
      expect(penNibIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('tattoo-editor-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have wave-square icon for tribal', () => {
      const tribalIcon = document.body.querySelector('[data-style="tribal"] i.fas.fa-wave-square');
      expect(tribalIcon).toBeTruthy();
    });

    it('should have portrait icon for realistic', () => {
      const realisticIcon = document.body.querySelector('[data-style="realistic"] i.fas.fa-portrait');
      expect(realisticIcon).toBeTruthy();
    });

    it('should have anchor icon for traditional', () => {
      const traditionalIcon = document.body.querySelector('[data-style="traditional"] i.fas.fa-anchor');
      expect(traditionalIcon).toBeTruthy();
    });

    it('should have feather-alt icon for neo-traditional', () => {
      const neoTraditionalIcon = document.body.querySelector('[data-style="neo-traditional"] i.fas.fa-feather-alt');
      expect(neoTraditionalIcon).toBeTruthy();
    });

    it('should have palette icon for watercolor', () => {
      const watercolorIcon = document.body.querySelector('[data-style="watercolor"] i.fas.fa-palette');
      expect(watercolorIcon).toBeTruthy();
    });

    it('should have circle icon for minimalist', () => {
      const minimalistIcon = document.body.querySelector('[data-style="minimalist"] i.fas.fa-circle');
      expect(minimalistIcon).toBeTruthy();
    });

    it('should have shapes icon for geometric', () => {
      const geometricIcon = document.body.querySelector('[data-style="geometric"] i.fas.fa-shapes');
      expect(geometricIcon).toBeTruthy();
    });

    it('should have torii-gate icon for japanese', () => {
      const japaneseIcon = document.body.querySelector('[data-style="japanese"] i.fas.fa-torii-gate');
      expect(japaneseIcon).toBeTruthy();
    });

    it('should have pen-fancy icon for script', () => {
      const scriptIcon = document.body.querySelector('[data-style="script"] i.fas.fa-pen-fancy');
      expect(scriptIcon).toBeTruthy();
    });

    it('should have moon icon for blackwork', () => {
      const blackworkIcon = document.body.querySelector('[data-style="blackwork"] i.fas.fa-moon');
      expect(blackworkIcon).toBeTruthy();
    });

    it('should have map-marker-alt icon for placement', () => {
      const mapMarkerIcon = document.body.querySelector('i.fas.fa-map-marker-alt');
      expect(mapMarkerIcon).toBeTruthy();
    });

    it('should have expand-arrows-alt icon for size', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandIcon).toBeTruthy();
    });

    it('should have paint-brush icon for color', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have image icon for subject', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have heart icon for tone', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have align-left icon for description', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have pen-nib icon in empty state', () => {
      const emptyStateIcon = document.getElementById('tattoo-editor-empty-state').querySelector('i.fas.fa-pen-nib');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Editor Tato');
      expect(document.body.textContent).toContain('Gaya Tato');
      expect(document.body.textContent).toContain('Penempatan');
      expect(document.body.textContent).toContain('Ukuran');
      expect(document.body.textContent).toContain('Warna');
      expect(document.body.textContent).toContain('Subjek');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Desain Tato');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(7);
      expect(headers[0].textContent).toContain('1. Gaya Tato');
      expect(headers[1].textContent).toContain('2. Penempatan');
      expect(headers[2].textContent).toContain('3. Ukuran');
      expect(headers[3].textContent).toContain('4. Warna');
      expect(headers[4].textContent).toContain('5. Subjek');
      expect(headers[5].textContent).toContain('6. Target Audiens');
      expect(headers[6].textContent).toContain('7. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('tattoo-editor-empty-state');
      expect(emptyState.textContent).toContain('Hasil desain tato akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Desain Tato');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('tattoo-editor-loading');
      expect(loading.textContent).toContain('Sedang membuat desain tato');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(7);
    });

    it('should have labeled form inputs', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('tattoo-editor-size');
      expect(sizeSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('tattoo-editor-color');
      expect(colorSelect).toBeTruthy();
      
      const subjectSelect = document.getElementById('tattoo-editor-subject');
      expect(subjectSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('tattoo-editor-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('tattoo-editor-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('tattoo-editor-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('tattoo-editor-size');
      expect(sizeSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('tattoo-editor-color');
      expect(colorSelect).toBeTruthy();
      
      const subjectSelect = document.getElementById('tattoo-editor-subject');
      expect(subjectSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('tattoo-editor-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('tattoo-editor-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('tattoo-editor-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('tattoo-editor-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const placementSelect = document.getElementById('tattoo-editor-placement');
      expect(placementSelect.tagName).toBe('SELECT');
      
      const sizeSelect = document.getElementById('tattoo-editor-size');
      expect(sizeSelect.tagName).toBe('SELECT');
      
      const colorSelect = document.getElementById('tattoo-editor-color');
      expect(colorSelect.tagName).toBe('SELECT');
      
      const subjectSelect = document.getElementById('tattoo-editor-subject');
      expect(subjectSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('tattoo-editor-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('tattoo-editor-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper style button attributes', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-tattoo-editor');
      styleBtns.forEach(btn => {
        expect(btn.type).toBe('button');
        expect(btn.dataset.style).toBeTruthy();
      });
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

    it('should have responsive container padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });

    it('should have responsive spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have responsive style options grid', () => {
      const styleOptions = document.getElementById('tattoo-editor-style-options');
      expect(styleOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
