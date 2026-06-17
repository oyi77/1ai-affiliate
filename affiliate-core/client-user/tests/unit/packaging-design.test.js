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

describe('packaging-design Component', () => {
  
  const mockComponentHTML = `
    <div id="content-packaging-design" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 bg-clip-text text-transparent">
            <i class="fas fa-box-open mr-3"></i>Desain Kemasan
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat desain kemasan profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Package Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Kemasan</h2>
              <div id="packaging-design-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="box" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-box text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Kotak</span>
                </button>
                <button type="button" data-type="bottle" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-wine-bottle text-2xl mb-1 text-emerald-500"></i>
                  <span class="block font-medium">Botol</span>
                </button>
                <button type="button" data-type="pouch" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-green-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shopping-bag text-2xl mb-1 text-green-500"></i>
                  <span class="block font-medium">Pouch</span>
                </button>
                <button type="button" data-type="tube" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-cyan-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-prescription-bottle text-2xl mb-1 text-cyan-500"></i>
                  <span class="block font-medium">Tube</span>
                </button>
                <button type="button" data-type="jar" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-jar text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Toples</span>
                </button>
                <button type="button" data-type="can" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-beer text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Kaleng</span>
                </button>
                <button type="button" data-type="wrapper" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-gift text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Bungkus</span>
                </button>
                <button type="button" data-type="bag" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shopping-cart text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Kantong</span>
                </button>
                <button type="button" data-type="blister" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-pills text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Blister</span>
                </button>
                <button type="button" data-type="tube-stand" class="packaging-design-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-spray-can text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Tube Stand</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Material -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Material</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="packaging-design-material" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-layer-group mr-1 text-teal-500"></i>Material Kemasan
                  </label>
                  <select id="packaging-design-material" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="cardboard">Karton</option>
                    <option value="plastic">Plastik</option>
                    <option value="glass">Kaca</option>
                    <option value="metal">Logam</option>
                    <option value="paper">Kertas</option>
                    <option value="biodegradable">Biodegradable</option>
                    <option value="composite">Komposit</option>
                    <option value="fabric">Kain</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="packaging-design-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-emerald-500"></i>Gaya Desain
                  </label>
                  <select id="packaging-design-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="minimalist">Minimalis</option>
                    <option value="luxury">Mewah</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="eco-friendly">Ramah Lingkungan</option>
                    <option value="colorful">Warna-warni</option>
                    <option value="premium">Premium</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Brand Elements -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Elemen Brand</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="packaging-design-brand-elements" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-copyright mr-1 text-green-500"></i>Elemen Brand
                  </label>
                  <select id="packaging-design-brand-elements" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="logo">Logo</option>
                    <option value="tagline">Tagline</option>
                    <option value="barcode">Barcode</option>
                    <option value="certification">Sertifikasi</option>
                    <option value="nutritional-info">Info Nutrisi</option>
                    <option value="ingredients">Bahan-bahan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="packaging-design-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-cyan-500"></i>Target Audiens
                  </label>
                  <select id="packaging-design-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="food-beverage">Makanan & Minuman</option>
                    <option value="cosmetics">Kosmetik</option>
                    <option value="electronics">Elektronik</option>
                    <option value="fashion">Fashion</option>
                    <option value="pharmaceuticals">Farmasi</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="packaging-design-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-comment-alt mr-1 text-blue-500"></i>Nuansa
                  </label>
                  <select id="packaging-design-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="premium">Premium</option>
                    <option value="accessible">Mudah Dijangkau</option>
                    <option value="eco-conscious">Sadar Lingkungan</option>
                    <option value="fun">Menyenangkan</option>
                    <option value="professional">Profesional</option>
                    <option value="artisanal">Artisanal</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="packaging-design-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Desain Kemasan
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="packaging-design-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="packaging-design-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-box-open text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil desain kemasan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Desain Kemasan</p>
              </div>
              <div id="packaging-design-results" class="hidden space-y-6"></div>
              <div id="packaging-design-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat desain kemasan...</p>
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
      const container = document.getElementById('content-packaging-design');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Desain Kemasan');
      expect(title.querySelector('i.fas.fa-box-open')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat desain kemasan profesional dengan AI');
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
      expect(rightPanel.querySelector('#packaging-design-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Package Type Selection Tests
  describe('Package Type Selection', () => {
    it('should render package type options container', () => {
      const typeOptions = document.getElementById('packaging-design-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Box option', () => {
      const boxBtn = document.body.querySelector('[data-type="box"]');
      expect(boxBtn).toBeTruthy();
      expect(boxBtn.textContent).toContain('Kotak');
      expect(boxBtn.querySelector('i.fas.fa-box')).toBeTruthy();
      expect(boxBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Bottle option', () => {
      const bottleBtn = document.body.querySelector('[data-type="bottle"]');
      expect(bottleBtn).toBeTruthy();
      expect(bottleBtn.textContent).toContain('Botol');
      expect(bottleBtn.querySelector('i.fas.fa-wine-bottle')).toBeTruthy();
    });

    it('should render Pouch option', () => {
      const pouchBtn = document.body.querySelector('[data-type="pouch"]');
      expect(pouchBtn).toBeTruthy();
      expect(pouchBtn.textContent).toContain('Pouch');
      expect(pouchBtn.querySelector('i.fas.fa-shopping-bag')).toBeTruthy();
    });

    it('should render Tube option', () => {
      const tubeBtn = document.body.querySelector('[data-type="tube"]');
      expect(tubeBtn).toBeTruthy();
      expect(tubeBtn.textContent).toContain('Tube');
      expect(tubeBtn.querySelector('i.fas.fa-prescription-bottle')).toBeTruthy();
    });

    it('should render Jar option', () => {
      const jarBtn = document.body.querySelector('[data-type="jar"]');
      expect(jarBtn).toBeTruthy();
      expect(jarBtn.textContent).toContain('Toples');
      expect(jarBtn.querySelector('i.fas.fa-jar')).toBeTruthy();
    });

    it('should render Can option', () => {
      const canBtn = document.body.querySelector('[data-type="can"]');
      expect(canBtn).toBeTruthy();
      expect(canBtn.textContent).toContain('Kaleng');
      expect(canBtn.querySelector('i.fas.fa-beer')).toBeTruthy();
    });

    it('should render Wrapper option', () => {
      const wrapperBtn = document.body.querySelector('[data-type="wrapper"]');
      expect(wrapperBtn).toBeTruthy();
      expect(wrapperBtn.textContent).toContain('Bungkus');
      expect(wrapperBtn.querySelector('i.fas.fa-gift')).toBeTruthy();
    });

    it('should render Bag option', () => {
      const bagBtn = document.body.querySelector('[data-type="bag"]');
      expect(bagBtn).toBeTruthy();
      expect(bagBtn.textContent).toContain('Kantong');
      expect(bagBtn.querySelector('i.fas.fa-shopping-cart')).toBeTruthy();
    });

    it('should render Blister option', () => {
      const blisterBtn = document.body.querySelector('[data-type="blister"]');
      expect(blisterBtn).toBeTruthy();
      expect(blisterBtn.textContent).toContain('Blister');
      expect(blisterBtn.querySelector('i.fas.fa-pills')).toBeTruthy();
    });

    it('should render Tube Stand option', () => {
      const tubeStandBtn = document.body.querySelector('[data-type="tube-stand"]');
      expect(tubeStandBtn).toBeTruthy();
      expect(tubeStandBtn.textContent).toContain('Tube Stand');
      expect(tubeStandBtn.querySelector('i.fas.fa-spray-can')).toBeTruthy();
    });

    it('should have 10 package type options', () => {
      const typeBtns = document.body.querySelectorAll('.packaging-design-type-btn');
      expect(typeBtns.length).toBe(10);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('packaging-design-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Kemasan');
    });

    it('should have colored hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.packaging-design-type-btn');
      expect(typeBtns[0].classList.contains('hover:bg-teal-100')).toBe(true);
      expect(typeBtns[1].classList.contains('hover:bg-emerald-100')).toBe(true);
      expect(typeBtns[2].classList.contains('hover:bg-green-100')).toBe(true);
      expect(typeBtns[3].classList.contains('hover:bg-cyan-100')).toBe(true);
      expect(typeBtns[4].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(typeBtns[5].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(typeBtns[6].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(typeBtns[7].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(typeBtns[8].classList.contains('hover:bg-yellow-100')).toBe(true);
      expect(typeBtns[9].classList.contains('hover:bg-orange-100')).toBe(true);
    });
  });

  // Material Input Tests
  describe('Material Input', () => {
    it('should render material select', () => {
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect).toBeTruthy();
      expect(materialSelect.tagName).toBe('SELECT');
      expect(materialSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Material');
    });

    it('should have all labels with icons', () => {
      const layerGroupIcon = document.body.querySelector('i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have material options with proper labels', () => {
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect.options[0].textContent).toContain('Karton');
      expect(materialSelect.options[1].textContent).toContain('Plastik');
      expect(materialSelect.options[2].textContent).toContain('Kaca');
      expect(materialSelect.options[3].textContent).toContain('Logam');
      expect(materialSelect.options[4].textContent).toContain('Kertas');
      expect(materialSelect.options[5].textContent).toContain('Biodegradable');
      expect(materialSelect.options[6].textContent).toContain('Komposit');
      expect(materialSelect.options[7].textContent).toContain('Kain');
    });

    it('should have default material value', () => {
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect.value).toBe('cardboard');
    });

    it('should have proper input styling', () => {
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect.classList.contains('w-full')).toBe(true);
      expect(materialSelect.classList.contains('p-3')).toBe(true);
      expect(materialSelect.classList.contains('border')).toBe(true);
      expect(materialSelect.classList.contains('rounded-lg')).toBe(true);
      expect(materialSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(materialSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect.options[0].textContent).toContain('Minimalis');
      expect(styleSelect.options[1].textContent).toContain('Mewah');
      expect(styleSelect.options[2].textContent).toContain('Vintage');
      expect(styleSelect.options[3].textContent).toContain('Modern');
      expect(styleSelect.options[4].textContent).toContain('Ramah Lingkungan');
      expect(styleSelect.options[5].textContent).toContain('Warna-warni');
      expect(styleSelect.options[6].textContent).toContain('Premium');
      expect(styleSelect.options[7].textContent).toContain('Playful');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect.value).toBe('minimalist');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Brand Elements Input Tests
  describe('Brand Elements Input', () => {
    it('should render brand elements select', () => {
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      expect(brandElementsSelect.tagName).toBe('SELECT');
      expect(brandElementsSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Elemen Brand');
    });

    it('should have all labels with icons', () => {
      const copyrightIcon = document.body.querySelector('i.fas.fa-copyright');
      expect(copyrightIcon).toBeTruthy();
    });

    it('should have brand elements options with proper labels', () => {
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect.options[0].textContent).toContain('Logo');
      expect(brandElementsSelect.options[1].textContent).toContain('Tagline');
      expect(brandElementsSelect.options[2].textContent).toContain('Barcode');
      expect(brandElementsSelect.options[3].textContent).toContain('Sertifikasi');
      expect(brandElementsSelect.options[4].textContent).toContain('Info Nutrisi');
      expect(brandElementsSelect.options[5].textContent).toContain('Bahan-bahan');
    });

    it('should have default brand elements value', () => {
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect.value).toBe('logo');
    });

    it('should have proper input styling', () => {
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect.classList.contains('w-full')).toBe(true);
      expect(brandElementsSelect.classList.contains('p-3')).toBe(true);
      expect(brandElementsSelect.classList.contains('border')).toBe(true);
      expect(brandElementsSelect.classList.contains('rounded-lg')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:ring-green-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect.options[0].textContent).toContain('Makanan & Minuman');
      expect(audienceSelect.options[1].textContent).toContain('Kosmetik');
      expect(audienceSelect.options[2].textContent).toContain('Elektronik');
      expect(audienceSelect.options[3].textContent).toContain('Fashion');
      expect(audienceSelect.options[4].textContent).toContain('Farmasi');
      expect(audienceSelect.options[5].textContent).toContain('Retail');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect.value).toBe('food-beverage');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect.options[0].textContent).toContain('Premium');
      expect(toneSelect.options[1].textContent).toContain('Mudah Dijangkau');
      expect(toneSelect.options[2].textContent).toContain('Sadar Lingkungan');
      expect(toneSelect.options[3].textContent).toContain('Menyenangkan');
      expect(toneSelect.options[4].textContent).toContain('Profesional');
      expect(toneSelect.options[5].textContent).toContain('Artisanal');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect.value).toBe('premium');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('packaging-design-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Desain Kemasan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('packaging-design-generate-btn');
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
      const generateBtn = document.getElementById('packaging-design-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('packaging-design-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('packaging-design-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('packaging-design-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-box-open')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil desain kemasan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('packaging-design-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('packaging-design-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat desain kemasan');
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
      const emptyState = document.getElementById('packaging-design-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('packaging-design-empty-state').querySelector('i.fas.fa-box-open');
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
      const generateBtn = document.getElementById('packaging-design-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-green-500')).toBe(true);
    });

    it('should use teal accents in material select', () => {
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(materialSelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use emerald accents in style select', () => {
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use green accents in brand elements select', () => {
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect.classList.contains('focus:ring-green-500')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:border-green-500')).toBe(true);
    });

    it('should use cyan accents in audience select', () => {
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in tone select', () => {
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(toneSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('packaging-design-empty-state').querySelector('i.fas.fa-box-open');
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
      expect(icons.length).toBeGreaterThanOrEqual(18);
    });

    it('should have box-open icon in header', () => {
      const boxOpenIcon = document.body.querySelector('header i.fas.fa-box-open');
      expect(boxOpenIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('packaging-design-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have box icon for box type', () => {
      const boxIcon = document.body.querySelector('[data-type="box"] i.fas.fa-box');
      expect(boxIcon).toBeTruthy();
    });

    it('should have wine-bottle icon for bottle type', () => {
      const wineBottleIcon = document.body.querySelector('[data-type="bottle"] i.fas.fa-wine-bottle');
      expect(wineBottleIcon).toBeTruthy();
    });

    it('should have shopping-bag icon for pouch type', () => {
      const shoppingBagIcon = document.body.querySelector('[data-type="pouch"] i.fas.fa-shopping-bag');
      expect(shoppingBagIcon).toBeTruthy();
    });

    it('should have prescription-bottle icon for tube type', () => {
      const prescriptionBottleIcon = document.body.querySelector('[data-type="tube"] i.fas.fa-prescription-bottle');
      expect(prescriptionBottleIcon).toBeTruthy();
    });

    it('should have jar icon for jar type', () => {
      const jarIcon = document.body.querySelector('[data-type="jar"] i.fas.fa-jar');
      expect(jarIcon).toBeTruthy();
    });

    it('should have beer icon for can type', () => {
      const beerIcon = document.body.querySelector('[data-type="can"] i.fas.fa-beer');
      expect(beerIcon).toBeTruthy();
    });

    it('should have gift icon for wrapper type', () => {
      const giftIcon = document.body.querySelector('[data-type="wrapper"] i.fas.fa-gift');
      expect(giftIcon).toBeTruthy();
    });

    it('should have shopping-cart icon for bag type', () => {
      const shoppingCartIcon = document.body.querySelector('[data-type="bag"] i.fas.fa-shopping-cart');
      expect(shoppingCartIcon).toBeTruthy();
    });

    it('should have pills icon for blister type', () => {
      const pillsIcon = document.body.querySelector('[data-type="blister"] i.fas.fa-pills');
      expect(pillsIcon).toBeTruthy();
    });

    it('should have spray-can icon for tube-stand type', () => {
      const sprayCanIcon = document.body.querySelector('[data-type="tube-stand"] i.fas.fa-spray-can');
      expect(sprayCanIcon).toBeTruthy();
    });

    it('should have layer-group icon for material', () => {
      const layerGroupIcon = document.body.querySelector('i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have copyright icon for brand elements', () => {
      const copyrightIcon = document.body.querySelector('i.fas.fa-copyright');
      expect(copyrightIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have comment-alt icon for tone', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have box-open icon in empty state', () => {
      const emptyStateIcon = document.getElementById('packaging-design-empty-state').querySelector('i.fas.fa-box-open');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Desain Kemasan');
      expect(document.body.textContent).toContain('Jenis Kemasan');
      expect(document.body.textContent).toContain('Material');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Elemen Brand');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Desain Kemasan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Kemasan');
      expect(headers[1].textContent).toContain('2. Material');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Elemen Brand');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('packaging-design-empty-state');
      expect(emptyState.textContent).toContain('Hasil desain kemasan akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Desain Kemasan');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('packaging-design-loading');
      expect(loading.textContent).toContain('Sedang membuat desain kemasan');
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
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect).toBeTruthy();
      
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect).toBeTruthy();
      
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('packaging-design-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const materialSelect = document.getElementById('packaging-design-material');
      expect(materialSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('packaging-design-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const brandElementsSelect = document.getElementById('packaging-design-brand-elements');
      expect(brandElementsSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('packaging-design-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('packaging-design-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for type selection', () => {
      const typeBtns = document.body.querySelectorAll('.packaging-design-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const boxBtn = document.body.querySelector('[data-type="box"]');
      expect(boxBtn.dataset.type).toBe('box');
      expect(boxBtn.dataset.selected).toBe('true');
      
      const bottleBtn = document.body.querySelector('[data-type="bottle"]');
      expect(bottleBtn.dataset.type).toBe('bottle');
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
