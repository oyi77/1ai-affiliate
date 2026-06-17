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

describe('sketch-catalog Component', () => {
  
  const mockComponentHTML = `
    <div id="content-sketch-catalog" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-500 via-slate-500 to-gray-400 bg-clip-text text-transparent">
            <i class="fas fa-pencil-ruler mr-3"></i>Katalog Sketsa
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat katalog sketsa profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Sketch Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Sketsa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketch-catalog-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-pencil-alt mr-1 text-gray-500"></i>Jenis Sketsa
                  </label>
                  <select id="sketch-catalog-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                    <option value="portrait">Potret</option>
                    <option value="landscape">Pemandangan</option>
                    <option value="still-life">Still Life</option>
                    <option value="architecture">Arsitektur</option>
                    <option value="fashion">Fashion</option>
                    <option value="character">Karakter</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 2: Technique -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Teknik</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketch-catalog-technique" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-slate-500"></i>Teknik Gambar
                  </label>
                  <select id="sketch-catalog-technique" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                    <option value="graphite">Grafit</option>
                    <option value="charcoal">Arang</option>
                    <option value="ink">Tinta</option>
                    <option value="pastel">Pastel</option>
                    <option value="mixed-media">Media Campuran</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Detail Level -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Tingkat Detail</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketch-catalog-detail" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-search mr-1 text-gray-500"></i>Tingkat Detail
                  </label>
                  <select id="sketch-catalog-detail" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                    <option value="sketch">Sketsa</option>
                    <option value="detailed">Detail</option>
                    <option value="highly-detailed">Sangat Detail</option>
                    <option value="outline-only">Garis Saja</option>
                    <option value="shaded">Bayangan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketch-catalog-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-artstation mr-1 text-slate-500"></i>Gaya Seni
                  </label>
                  <select id="sketch-catalog-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                    <option value="realistic">Realistis</option>
                    <option value="abstract">Abstrak</option>
                    <option value="impressionist">Impresionis</option>
                    <option value="manga">Manga</option>
                    <option value="comic">Komik</option>
                    <option value="minimalist">Minimalis</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Size -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Ukuran</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketch-catalog-size" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand mr-1 text-gray-500"></i>Ukuran Kertas
                  </label>
                  <select id="sketch-catalog-size" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                    <option value="a4">A4</option>
                    <option value="a3">A3</option>
                    <option value="a2">A2</option>
                    <option value="letter">Letter</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Orientation -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Orientasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketch-catalog-orientation" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-columns mr-1 text-slate-500"></i>Orientasi
                  </label>
                  <select id="sketch-catalog-orientation" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                    <option value="portrait">Potret</option>
                    <option value="landscape">Pemandangan</option>
                    <option value="square">Kotak</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="sketch-catalog-generate-btn" class="w-full bg-gradient-to-r from-gray-500 via-slate-500 to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Katalog Sketsa
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="sketch-catalog-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="sketch-catalog-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-pencil-ruler text-6xl mb-4 text-gray-400"></i>
                <p class="text-xl">Hasil katalog sketsa akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Katalog Sketsa</p>
              </div>
              <div id="sketch-catalog-results" class="hidden space-y-6"></div>
              <div id="sketch-catalog-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat katalog sketsa...</p>
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
      const container = document.getElementById('content-sketch-catalog');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Katalog Sketsa');
      expect(title.querySelector('i.fas.fa-pencil-ruler')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat katalog sketsa profesional dengan AI');
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
      expect(rightPanel.querySelector('#sketch-catalog-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Sketch Type Selection Tests
  describe('Sketch Type Selection', () => {
    it('should render sketch type select', () => {
      const typeSelect = document.getElementById('sketch-catalog-type');
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.tagName).toBe('SELECT');
      expect(typeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Sketsa');
    });

    it('should have pencil-alt icon for type', () => {
      const pencilAltIcon = document.body.querySelector('i.fas.fa-pencil-alt');
      expect(pencilAltIcon).toBeTruthy();
    });

    it('should have sketch type options with proper labels', () => {
      const typeSelect = document.getElementById('sketch-catalog-type');
      expect(typeSelect.options[0].textContent).toContain('Potret');
      expect(typeSelect.options[1].textContent).toContain('Pemandangan');
      expect(typeSelect.options[2].textContent).toContain('Still Life');
      expect(typeSelect.options[3].textContent).toContain('Arsitektur');
      expect(typeSelect.options[4].textContent).toContain('Fashion');
      expect(typeSelect.options[5].textContent).toContain('Karakter');
    });

    it('should have default sketch type value', () => {
      const typeSelect = document.getElementById('sketch-catalog-type');
      expect(typeSelect.value).toBe('portrait');
    });

    it('should have proper input styling', () => {
      const typeSelect = document.getElementById('sketch-catalog-type');
      expect(typeSelect.classList.contains('w-full')).toBe(true);
      expect(typeSelect.classList.contains('p-3')).toBe(true);
      expect(typeSelect.classList.contains('border')).toBe(true);
      expect(typeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-gray-500')).toBe(true);
    });
  });

  // Technique Selection Tests
  describe('Technique Selection', () => {
    it('should render technique select', () => {
      const techniqueSelect = document.getElementById('sketch-catalog-technique');
      expect(techniqueSelect).toBeTruthy();
      expect(techniqueSelect.tagName).toBe('SELECT');
      expect(techniqueSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Teknik');
    });

    it('should have paint-brush icon for technique', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have technique options with proper labels', () => {
      const techniqueSelect = document.getElementById('sketch-catalog-technique');
      expect(techniqueSelect.options[0].textContent).toContain('Grafit');
      expect(techniqueSelect.options[1].textContent).toContain('Arang');
      expect(techniqueSelect.options[2].textContent).toContain('Tinta');
      expect(techniqueSelect.options[3].textContent).toContain('Pastel');
      expect(techniqueSelect.options[4].textContent).toContain('Media Campuran');
      expect(techniqueSelect.options[5].textContent).toContain('Digital');
    });

    it('should have default technique value', () => {
      const techniqueSelect = document.getElementById('sketch-catalog-technique');
      expect(techniqueSelect.value).toBe('graphite');
    });

    it('should have proper input styling', () => {
      const techniqueSelect = document.getElementById('sketch-catalog-technique');
      expect(techniqueSelect.classList.contains('w-full')).toBe(true);
      expect(techniqueSelect.classList.contains('p-3')).toBe(true);
      expect(techniqueSelect.classList.contains('border')).toBe(true);
      expect(techniqueSelect.classList.contains('rounded-lg')).toBe(true);
      expect(techniqueSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(techniqueSelect.classList.contains('focus:ring-slate-500')).toBe(true);
    });
  });

  // Detail Level Selection Tests
  describe('Detail Level Selection', () => {
    it('should render detail level select', () => {
      const detailSelect = document.getElementById('sketch-catalog-detail');
      expect(detailSelect).toBeTruthy();
      expect(detailSelect.tagName).toBe('SELECT');
      expect(detailSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Tingkat Detail');
    });

    it('should have search icon for detail', () => {
      const searchIcon = document.body.querySelector('i.fas.fa-search');
      expect(searchIcon).toBeTruthy();
    });

    it('should have detail level options with proper labels', () => {
      const detailSelect = document.getElementById('sketch-catalog-detail');
      expect(detailSelect.options[0].textContent).toContain('Sketsa');
      expect(detailSelect.options[1].textContent).toContain('Detail');
      expect(detailSelect.options[2].textContent).toContain('Sangat Detail');
      expect(detailSelect.options[3].textContent).toContain('Garis Saja');
      expect(detailSelect.options[4].textContent).toContain('Bayangan');
    });

    it('should have default detail level value', () => {
      const detailSelect = document.getElementById('sketch-catalog-detail');
      expect(detailSelect.value).toBe('sketch');
    });

    it('should have proper input styling', () => {
      const detailSelect = document.getElementById('sketch-catalog-detail');
      expect(detailSelect.classList.contains('w-full')).toBe(true);
      expect(detailSelect.classList.contains('p-3')).toBe(true);
      expect(detailSelect.classList.contains('border')).toBe(true);
      expect(detailSelect.classList.contains('rounded-lg')).toBe(true);
      expect(detailSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(detailSelect.classList.contains('focus:ring-gray-500')).toBe(true);
    });
  });

  // Style Selection Tests
  describe('Style Selection', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('sketch-catalog-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya');
    });

    it('should have artstation icon for style', () => {
      const artstationIcon = document.body.querySelector('i.fas.fa-artstation');
      expect(artstationIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('sketch-catalog-style');
      expect(styleSelect.options[0].textContent).toContain('Realistis');
      expect(styleSelect.options[1].textContent).toContain('Abstrak');
      expect(styleSelect.options[2].textContent).toContain('Impresionis');
      expect(styleSelect.options[3].textContent).toContain('Manga');
      expect(styleSelect.options[4].textContent).toContain('Komik');
      expect(styleSelect.options[5].textContent).toContain('Minimalis');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('sketch-catalog-style');
      expect(styleSelect.value).toBe('realistic');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('sketch-catalog-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-slate-500')).toBe(true);
    });
  });

  // Size Selection Tests
  describe('Size Selection', () => {
    it('should render size select', () => {
      const sizeSelect = document.getElementById('sketch-catalog-size');
      expect(sizeSelect).toBeTruthy();
      expect(sizeSelect.tagName).toBe('SELECT');
      expect(sizeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Ukuran');
    });

    it('should have expand icon for size', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have size options with proper labels', () => {
      const sizeSelect = document.getElementById('sketch-catalog-size');
      expect(sizeSelect.options[0].textContent).toContain('A4');
      expect(sizeSelect.options[1].textContent).toContain('A3');
      expect(sizeSelect.options[2].textContent).toContain('A2');
      expect(sizeSelect.options[3].textContent).toContain('Letter');
      expect(sizeSelect.options[4].textContent).toContain('Custom');
    });

    it('should have default size value', () => {
      const sizeSelect = document.getElementById('sketch-catalog-size');
      expect(sizeSelect.value).toBe('a4');
    });

    it('should have proper input styling', () => {
      const sizeSelect = document.getElementById('sketch-catalog-size');
      expect(sizeSelect.classList.contains('w-full')).toBe(true);
      expect(sizeSelect.classList.contains('p-3')).toBe(true);
      expect(sizeSelect.classList.contains('border')).toBe(true);
      expect(sizeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-gray-500')).toBe(true);
    });
  });

  // Orientation Selection Tests
  describe('Orientation Selection', () => {
    it('should render orientation select', () => {
      const orientationSelect = document.getElementById('sketch-catalog-orientation');
      expect(orientationSelect).toBeTruthy();
      expect(orientationSelect.tagName).toBe('SELECT');
      expect(orientationSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Orientasi');
    });

    it('should have columns icon for orientation', () => {
      const columnsIcon = document.body.querySelector('i.fas.fa-columns');
      expect(columnsIcon).toBeTruthy();
    });

    it('should have orientation options with proper labels', () => {
      const orientationSelect = document.getElementById('sketch-catalog-orientation');
      expect(orientationSelect.options[0].textContent).toContain('Potret');
      expect(orientationSelect.options[1].textContent).toContain('Pemandangan');
      expect(orientationSelect.options[2].textContent).toContain('Kotak');
    });

    it('should have default orientation value', () => {
      const orientationSelect = document.getElementById('sketch-catalog-orientation');
      expect(orientationSelect.value).toBe('portrait');
    });

    it('should have proper input styling', () => {
      const orientationSelect = document.getElementById('sketch-catalog-orientation');
      expect(orientationSelect.classList.contains('w-full')).toBe(true);
      expect(orientationSelect.classList.contains('p-3')).toBe(true);
      expect(orientationSelect.classList.contains('border')).toBe(true);
      expect(orientationSelect.classList.contains('rounded-lg')).toBe(true);
      expect(orientationSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(orientationSelect.classList.contains('focus:ring-slate-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('sketch-catalog-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Katalog Sketsa');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('sketch-catalog-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-gray-500')).toBe(true);
      expect(generateBtn.classList.contains('via-slate-500')).toBe(true);
      expect(generateBtn.classList.contains('to-gray-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('sketch-catalog-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('sketch-catalog-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('sketch-catalog-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('sketch-catalog-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-pencil-ruler')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil katalog sketsa akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('sketch-catalog-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('sketch-catalog-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat katalog sketsa');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-gray-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('sketch-catalog-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have gray icon in empty state', () => {
      const emptyStateIcon = document.getElementById('sketch-catalog-empty-state').querySelector('i.fas.fa-pencil-ruler');
      expect(emptyStateIcon.classList.contains('text-gray-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use gray/slate color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-gray-500')).toBe(true);
      expect(title.classList.contains('via-slate-500')).toBe(true);
      expect(title.classList.contains('to-gray-400')).toBe(true);
    });

    it('should use gray/slate accents in generate button', () => {
      const generateBtn = document.getElementById('sketch-catalog-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-gray-500')).toBe(true);
      expect(generateBtn.classList.contains('via-slate-500')).toBe(true);
      expect(generateBtn.classList.contains('to-gray-400')).toBe(true);
    });

    it('should use gray accents in type select', () => {
      const typeSelect = document.getElementById('sketch-catalog-type');
      expect(typeSelect.classList.contains('focus:ring-gray-500')).toBe(true);
      expect(typeSelect.classList.contains('focus:border-gray-500')).toBe(true);
    });

    it('should use slate accents in technique select', () => {
      const techniqueSelect = document.getElementById('sketch-catalog-technique');
      expect(techniqueSelect.classList.contains('focus:ring-slate-500')).toBe(true);
      expect(techniqueSelect.classList.contains('focus:border-slate-500')).toBe(true);
    });

    it('should use gray accents in detail select', () => {
      const detailSelect = document.getElementById('sketch-catalog-detail');
      expect(detailSelect.classList.contains('focus:ring-gray-500')).toBe(true);
      expect(detailSelect.classList.contains('focus:border-gray-500')).toBe(true);
    });

    it('should use slate accents in style select', () => {
      const styleSelect = document.getElementById('sketch-catalog-style');
      expect(styleSelect.classList.contains('focus:ring-slate-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-slate-500')).toBe(true);
    });

    it('should use gray accents in size select', () => {
      const sizeSelect = document.getElementById('sketch-catalog-size');
      expect(sizeSelect.classList.contains('focus:ring-gray-500')).toBe(true);
      expect(sizeSelect.classList.contains('focus:border-gray-500')).toBe(true);
    });

    it('should use slate accents in orientation select', () => {
      const orientationSelect = document.getElementById('sketch-catalog-orientation');
      expect(orientationSelect.classList.contains('focus:ring-slate-500')).toBe(true);
      expect(orientationSelect.classList.contains('focus:border-slate-500')).toBe(true);
    });

    it('should use gray accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-gray-500')).toBe(true);
    });

    it('should use gray accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('sketch-catalog-empty-state').querySelector('i.fas.fa-pencil-ruler');
      expect(emptyStateIcon.classList.contains('text-gray-400')).toBe(true);
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

    it('should have pencil-ruler icon in header', () => {
      const pencilRulerIcon = document.body.querySelector('header i.fas.fa-pencil-ruler');
      expect(pencilRulerIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('sketch-catalog-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have pencil-alt icon for type', () => {
      const pencilAltIcon = document.body.querySelector('i.fas.fa-pencil-alt');
      expect(pencilAltIcon).toBeTruthy();
    });

    it('should have paint-brush icon for technique', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have search icon for detail', () => {
      const searchIcon = document.body.querySelector('i.fas.fa-search');
      expect(searchIcon).toBeTruthy();
    });

    it('should have artstation icon for style', () => {
      const artstationIcon = document.body.querySelector('i.fas.fa-artstation');
      expect(artstationIcon).toBeTruthy();
    });

    it('should have expand icon for size', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have columns icon for orientation', () => {
      const columnsIcon = document.body.querySelector('i.fas.fa-columns');
      expect(columnsIcon).toBeTruthy();
    });

    it('should have pencil-ruler icon in empty state', () => {
      const emptyStateIcon = document.getElementById('sketch-catalog-empty-state').querySelector('i.fas.fa-pencil-ruler');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have proper icon colors for type', () => {
      const typeIcon = document.body.querySelector('i.fas.fa-pencil-alt');
      expect(typeIcon.classList.contains('text-gray-500')).toBe(true);
    });

    it('should have proper icon colors for technique', () => {
      const techniqueIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(techniqueIcon.classList.contains('text-slate-500')).toBe(true);
    });

    it('should have proper icon colors for detail', () => {
      const detailIcon = document.body.querySelector('i.fas.fa-search');
      expect(detailIcon.classList.contains('text-gray-500')).toBe(true);
    });

    it('should have proper icon colors for style', () => {
      const styleIcon = document.body.querySelector('i.fas.fa-artstation');
      expect(styleIcon.classList.contains('text-slate-500')).toBe(true);
    });

    it('should have proper icon colors for size', () => {
      const sizeIcon = document.body.querySelector('i.fas.fa-expand');
      expect(sizeIcon.classList.contains('text-gray-500')).toBe(true);
    });

    it('should have proper icon colors for orientation', () => {
      const orientationIcon = document.body.querySelector('i.fas.fa-columns');
      expect(orientationIcon.classList.contains('text-slate-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Katalog Sketsa');
      expect(document.body.textContent).toContain('Jenis Sketsa');
      expect(document.body.textContent).toContain('Teknik');
      expect(document.body.textContent).toContain('Tingkat Detail');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Ukuran');
      expect(document.body.textContent).toContain('Orientasi');
      expect(document.body.textContent).toContain('Buat Katalog Sketsa');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Sketsa');
      expect(headers[1].textContent).toContain('2. Teknik');
      expect(headers[2].textContent).toContain('3. Tingkat Detail');
      expect(headers[3].textContent).toContain('4. Gaya');
      expect(headers[4].textContent).toContain('5. Ukuran');
      expect(headers[5].textContent).toContain('6. Orientasi');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('sketch-catalog-empty-state');
      expect(emptyState.textContent).toContain('Hasil katalog sketsa akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Katalog Sketsa');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('sketch-catalog-loading');
      expect(loading.textContent).toContain('Sedang membuat katalog sketsa');
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
      const typeSelect = document.getElementById('sketch-catalog-type');
      expect(typeSelect).toBeTruthy();
      
      const techniqueSelect = document.getElementById('sketch-catalog-technique');
      expect(techniqueSelect).toBeTruthy();
      
      const detailSelect = document.getElementById('sketch-catalog-detail');
      expect(detailSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('sketch-catalog-style');
      expect(styleSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('sketch-catalog-size');
      expect(sizeSelect).toBeTruthy();
      
      const orientationSelect = document.getElementById('sketch-catalog-orientation');
      expect(orientationSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const typeLabel = document.querySelector('label[for="sketch-catalog-type"]');
      expect(typeLabel).toBeTruthy();
      
      const techniqueLabel = document.querySelector('label[for="sketch-catalog-technique"]');
      expect(techniqueLabel).toBeTruthy();
      
      const detailLabel = document.querySelector('label[for="sketch-catalog-detail"]');
      expect(detailLabel).toBeTruthy();
      
      const styleLabel = document.querySelector('label[for="sketch-catalog-style"]');
      expect(styleLabel).toBeTruthy();
      
      const sizeLabel = document.querySelector('label[for="sketch-catalog-size"]');
      expect(sizeLabel).toBeTruthy();
      
      const orientationLabel = document.querySelector('label[for="sketch-catalog-orientation"]');
      expect(orientationLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('sketch-catalog-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const typeSelect = document.getElementById('sketch-catalog-type');
      expect(typeSelect.tagName).toBe('SELECT');
      
      const techniqueSelect = document.getElementById('sketch-catalog-technique');
      expect(techniqueSelect.tagName).toBe('SELECT');
      
      const detailSelect = document.getElementById('sketch-catalog-detail');
      expect(detailSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('sketch-catalog-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const sizeSelect = document.getElementById('sketch-catalog-size');
      expect(sizeSelect.tagName).toBe('SELECT');
      
      const orientationSelect = document.getElementById('sketch-catalog-orientation');
      expect(orientationSelect.tagName).toBe('SELECT');
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
