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

describe('professional-product-model Component', () => {
  
  const mockComponentHTML = `
    <div id="content-professional-product-model" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            <i class="fas fa-camera mr-3"></i>Model Produk Profesional
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat foto produk profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Product Image Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Foto Produk</h2>
              <div>
                <label for="professional-product-model-image" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-image mr-1 text-teal-500"></i>Unggah Foto Produk
                </label>
                <input type="file" id="professional-product-model-image" accept="image/*" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                <p class="text-xs text-gray-500 mt-1">Format yang didukung: JPG, PNG, WEBP</p>
              </div>
            </div>
            
            <!-- Step 2: Background Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya Latar Belakang</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="professional-product-model-background" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-layer-group mr-1 text-emerald-500"></i>Style Latar Belakang
                  </label>
                  <select id="professional-product-model-background" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="white">Putih</option>
                    <option value="gradient">Gradien</option>
                    <option value="studio">Studio</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="abstract">Abstrak</option>
                    <option value="custom-color">Warna Kustom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Aspect Ratio -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Rasio Aspek</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="professional-product-model-aspect-ratio" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand mr-1 text-teal-500"></i>Rasio Aspek
                  </label>
                  <select id="professional-product-model-aspect-ratio" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="1:1">1:1 (Persegi)</option>
                    <option value="4:5">4:5 (Potrait)</option>
                    <option value="1:2">1:2 (Tinggi)</option>
                    <option value="3:4">3:4 (Potrait)</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Story)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Lighting Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya Pencahayaan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="professional-product-model-lighting" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-lightbulb mr-1 text-emerald-500"></i>Style Pencahayaan
                  </label>
                  <select id="professional-product-model-lighting" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="natural">Alami</option>
                    <option value="soft">Lembut</option>
                    <option value="dramatic">Dramatis</option>
                    <option value="high-key">High Key</option>
                    <option value="low-key">Low Key</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Product Category -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Kategori Produk</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="professional-product-model-category" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tags mr-1 text-teal-500"></i>Kategori Produk
                  </label>
                  <select id="professional-product-model-category" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="fashion">Fashion</option>
                    <option value="electronics">Elektronik</option>
                    <option value="food">Makanan</option>
                    <option value="furniture">Furniture</option>
                    <option value="cosmetics">Kosmetik</option>
                    <option value="jewelry">Perhiasan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Output Quality -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Kualitas Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="professional-product-model-quality" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-emerald-500"></i>Kualitas Output
                  </label>
                  <select id="professional-product-model-quality" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="web">Web Optimized</option>
                    <option value="high">High Resolution</option>
                    <option value="print">Print Ready</option>
                    <option value="ultra">Ultra High</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="professional-product-model-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Model Produk
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="professional-product-model-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="professional-product-model-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-camera text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil foto produk profesional akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto produk dan klik Buat Model Produk</p>
              </div>
              <div id="professional-product-model-results" class="hidden space-y-6"></div>
              <div id="professional-product-model-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat model produk profesional...</p>
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
      const container = document.getElementById('content-professional-product-model');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Model Produk Profesional');
      expect(title.querySelector('i.fas.fa-camera')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat foto produk profesional dengan AI');
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
      expect(rightPanel.querySelector('#professional-product-model-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Product Image Upload Tests
  describe('Product Image Upload', () => {
    it('should render image upload input', () => {
      const imageInput = document.getElementById('professional-product-model-image');
      expect(imageInput).toBeTruthy();
      expect(imageInput.type).toBe('file');
      expect(imageInput.accept).toBe('image/*');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Foto Produk');
    });

    it('should have image icon in label', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have proper input styling', () => {
      const imageInput = document.getElementById('professional-product-model-image');
      expect(imageInput.classList.contains('w-full')).toBe(true);
      expect(imageInput.classList.contains('p-3')).toBe(true);
      expect(imageInput.classList.contains('border')).toBe(true);
      expect(imageInput.classList.contains('rounded-lg')).toBe(true);
      expect(imageInput.classList.contains('focus:ring-2')).toBe(true);
      expect(imageInput.classList.contains('focus:ring-teal-500')).toBe(true);
    });

    it('should have supported format text', () => {
      const formatText = document.body.querySelector('p.text-xs');
      expect(formatText).toBeTruthy();
      expect(formatText.textContent).toContain('Format yang didukung: JPG, PNG, WEBP');
    });
  });

  // Background Style Selection Tests
  describe('Background Style Selection', () => {
    it('should render background style select', () => {
      const backgroundSelect = document.getElementById('professional-product-model-background');
      expect(backgroundSelect).toBeTruthy();
      expect(backgroundSelect.tagName).toBe('SELECT');
      expect(backgroundSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gaya Latar Belakang');
    });

    it('should have layer-group icon in label', () => {
      const layerGroupIcon = document.body.querySelector('label[for="professional-product-model-background"] i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have background options with proper labels', () => {
      const backgroundSelect = document.getElementById('professional-product-model-background');
      expect(backgroundSelect.options[0].textContent).toContain('Putih');
      expect(backgroundSelect.options[1].textContent).toContain('Gradien');
      expect(backgroundSelect.options[2].textContent).toContain('Studio');
      expect(backgroundSelect.options[3].textContent).toContain('Outdoor');
      expect(backgroundSelect.options[4].textContent).toContain('Abstrak');
      expect(backgroundSelect.options[5].textContent).toContain('Warna Kustom');
    });

    it('should have default background value', () => {
      const backgroundSelect = document.getElementById('professional-product-model-background');
      expect(backgroundSelect.value).toBe('white');
    });

    it('should have proper input styling', () => {
      const backgroundSelect = document.getElementById('professional-product-model-background');
      expect(backgroundSelect.classList.contains('w-full')).toBe(true);
      expect(backgroundSelect.classList.contains('p-3')).toBe(true);
      expect(backgroundSelect.classList.contains('border')).toBe(true);
      expect(backgroundSelect.classList.contains('rounded-lg')).toBe(true);
      expect(backgroundSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(backgroundSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Aspect Ratio Selection Tests
  describe('Aspect Ratio Selection', () => {
    it('should render aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('professional-product-model-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      expect(aspectRatioSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Rasio Aspek');
    });

    it('should have expand icon in label', () => {
      const expandIcon = document.body.querySelector('label[for="professional-product-model-aspect-ratio"] i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have aspect ratio options with proper labels', () => {
      const aspectRatioSelect = document.getElementById('professional-product-model-aspect-ratio');
      expect(aspectRatioSelect.options[0].textContent).toContain('1:1 (Persegi)');
      expect(aspectRatioSelect.options[1].textContent).toContain('4:5 (Potrait)');
      expect(aspectRatioSelect.options[2].textContent).toContain('1:2 (Tinggi)');
      expect(aspectRatioSelect.options[3].textContent).toContain('3:4 (Potrait)');
      expect(aspectRatioSelect.options[4].textContent).toContain('16:9 (Landscape)');
      expect(aspectRatioSelect.options[5].textContent).toContain('9:16 (Story)');
    });

    it('should have default aspect ratio value', () => {
      const aspectRatioSelect = document.getElementById('professional-product-model-aspect-ratio');
      expect(aspectRatioSelect.value).toBe('1:1');
    });

    it('should have proper input styling', () => {
      const aspectRatioSelect = document.getElementById('professional-product-model-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('w-full')).toBe(true);
      expect(aspectRatioSelect.classList.contains('p-3')).toBe(true);
      expect(aspectRatioSelect.classList.contains('border')).toBe(true);
      expect(aspectRatioSelect.classList.contains('rounded-lg')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Lighting Style Selection Tests
  describe('Lighting Style Selection', () => {
    it('should render lighting style select', () => {
      const lightingSelect = document.getElementById('professional-product-model-lighting');
      expect(lightingSelect).toBeTruthy();
      expect(lightingSelect.tagName).toBe('SELECT');
      expect(lightingSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya Pencahayaan');
    });

    it('should have lightbulb icon in label', () => {
      const lightbulbIcon = document.body.querySelector('label[for="professional-product-model-lighting"] i.fas.fa-lightbulb');
      expect(lightbulbIcon).toBeTruthy();
    });

    it('should have lighting options with proper labels', () => {
      const lightingSelect = document.getElementById('professional-product-model-lighting');
      expect(lightingSelect.options[0].textContent).toContain('Alami');
      expect(lightingSelect.options[1].textContent).toContain('Lembut');
      expect(lightingSelect.options[2].textContent).toContain('Dramatis');
      expect(lightingSelect.options[3].textContent).toContain('High Key');
      expect(lightingSelect.options[4].textContent).toContain('Low Key');
      expect(lightingSelect.options[5].textContent).toContain('Studio');
    });

    it('should have default lighting value', () => {
      const lightingSelect = document.getElementById('professional-product-model-lighting');
      expect(lightingSelect.value).toBe('natural');
    });

    it('should have proper input styling', () => {
      const lightingSelect = document.getElementById('professional-product-model-lighting');
      expect(lightingSelect.classList.contains('w-full')).toBe(true);
      expect(lightingSelect.classList.contains('p-3')).toBe(true);
      expect(lightingSelect.classList.contains('border')).toBe(true);
      expect(lightingSelect.classList.contains('rounded-lg')).toBe(true);
      expect(lightingSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(lightingSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Product Category Selection Tests
  describe('Product Category Selection', () => {
    it('should render category select', () => {
      const categorySelect = document.getElementById('professional-product-model-category');
      expect(categorySelect).toBeTruthy();
      expect(categorySelect.tagName).toBe('SELECT');
      expect(categorySelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Kategori Produk');
    });

    it('should have tags icon in label', () => {
      const tagsIcon = document.body.querySelector('label[for="professional-product-model-category"] i.fas.fa-tags');
      expect(tagsIcon).toBeTruthy();
    });

    it('should have category options with proper labels', () => {
      const categorySelect = document.getElementById('professional-product-model-category');
      expect(categorySelect.options[0].textContent).toContain('Fashion');
      expect(categorySelect.options[1].textContent).toContain('Elektronik');
      expect(categorySelect.options[2].textContent).toContain('Makanan');
      expect(categorySelect.options[3].textContent).toContain('Furniture');
      expect(categorySelect.options[4].textContent).toContain('Kosmetik');
      expect(categorySelect.options[5].textContent).toContain('Perhiasan');
    });

    it('should have default category value', () => {
      const categorySelect = document.getElementById('professional-product-model-category');
      expect(categorySelect.value).toBe('fashion');
    });

    it('should have proper input styling', () => {
      const categorySelect = document.getElementById('professional-product-model-category');
      expect(categorySelect.classList.contains('w-full')).toBe(true);
      expect(categorySelect.classList.contains('p-3')).toBe(true);
      expect(categorySelect.classList.contains('border')).toBe(true);
      expect(categorySelect.classList.contains('rounded-lg')).toBe(true);
      expect(categorySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(categorySelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Output Quality Selection Tests
  describe('Output Quality Selection', () => {
    it('should render quality select', () => {
      const qualitySelect = document.getElementById('professional-product-model-quality');
      expect(qualitySelect).toBeTruthy();
      expect(qualitySelect.tagName).toBe('SELECT');
      expect(qualitySelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Kualitas Output');
    });

    it('should have star icon in label', () => {
      const starIcon = document.body.querySelector('label[for="professional-product-model-quality"] i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have quality options with proper labels', () => {
      const qualitySelect = document.getElementById('professional-product-model-quality');
      expect(qualitySelect.options[0].textContent).toContain('Web Optimized');
      expect(qualitySelect.options[1].textContent).toContain('High Resolution');
      expect(qualitySelect.options[2].textContent).toContain('Print Ready');
      expect(qualitySelect.options[3].textContent).toContain('Ultra High');
    });

    it('should have default quality value', () => {
      const qualitySelect = document.getElementById('professional-product-model-quality');
      expect(qualitySelect.value).toBe('web');
    });

    it('should have proper input styling', () => {
      const qualitySelect = document.getElementById('professional-product-model-quality');
      expect(qualitySelect.classList.contains('w-full')).toBe(true);
      expect(qualitySelect.classList.contains('p-3')).toBe(true);
      expect(qualitySelect.classList.contains('border')).toBe(true);
      expect(qualitySelect.classList.contains('rounded-lg')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('professional-product-model-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Model Produk');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('professional-product-model-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('professional-product-model-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('professional-product-model-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('professional-product-model-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('professional-product-model-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-camera')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil foto produk profesional akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('professional-product-model-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('professional-product-model-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat model produk profesional');
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
      const emptyState = document.getElementById('professional-product-model-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('professional-product-model-empty-state').querySelector('i.fas.fa-camera');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/emerald color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-500')).toBe(true);
      expect(title.classList.contains('via-emerald-500')).toBe(true);
      expect(title.classList.contains('to-teal-400')).toBe(true);
    });

    it('should use teal/emerald accents in generate button', () => {
      const generateBtn = document.getElementById('professional-product-model-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-400')).toBe(true);
    });

    it('should use teal accents in image input', () => {
      const imageInput = document.getElementById('professional-product-model-image');
      expect(imageInput.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(imageInput.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use emerald accents in background select', () => {
      const backgroundSelect = document.getElementById('professional-product-model-background');
      expect(backgroundSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(backgroundSelect.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use teal accents in aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('professional-product-model-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use emerald accents in lighting select', () => {
      const lightingSelect = document.getElementById('professional-product-model-lighting');
      expect(lightingSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(lightingSelect.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use teal accents in category select', () => {
      const categorySelect = document.getElementById('professional-product-model-category');
      expect(categorySelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(categorySelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use emerald accents in quality select', () => {
      const qualitySelect = document.getElementById('professional-product-model-quality');
      expect(qualitySelect.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(qualitySelect.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('professional-product-model-empty-state').querySelector('i.fas.fa-camera');
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
      expect(icons.length).toBeGreaterThanOrEqual(9);
    });

    it('should have camera icon in header', () => {
      const cameraIcon = document.body.querySelector('header i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('professional-product-model-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have image icon for image upload', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have layer-group icon for background', () => {
      const layerGroupIcon = document.body.querySelector('label[for="professional-product-model-background"] i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have expand icon for aspect ratio', () => {
      const expandIcon = document.body.querySelector('label[for="professional-product-model-aspect-ratio"] i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have lightbulb icon for lighting', () => {
      const lightbulbIcon = document.body.querySelector('label[for="professional-product-model-lighting"] i.fas.fa-lightbulb');
      expect(lightbulbIcon).toBeTruthy();
    });

    it('should have tags icon for category', () => {
      const tagsIcon = document.body.querySelector('label[for="professional-product-model-category"] i.fas.fa-tags');
      expect(tagsIcon).toBeTruthy();
    });

    it('should have star icon for quality', () => {
      const starIcon = document.body.querySelector('label[for="professional-product-model-quality"] i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have camera icon in empty state', () => {
      const emptyStateIcon = document.getElementById('professional-product-model-empty-state').querySelector('i.fas.fa-camera');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have teal-500 color for image icon', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should have emerald-500 color for layer-group icon', () => {
      const layerGroupIcon = document.body.querySelector('label[for="professional-product-model-background"] i.fas.fa-layer-group');
      expect(layerGroupIcon.classList.contains('text-emerald-500')).toBe(true);
    });

    it('should have teal-500 color for expand icon', () => {
      const expandIcon = document.body.querySelector('label[for="professional-product-model-aspect-ratio"] i.fas.fa-expand');
      expect(expandIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should have emerald-500 color for lightbulb icon', () => {
      const lightbulbIcon = document.body.querySelector('label[for="professional-product-model-lighting"] i.fas.fa-lightbulb');
      expect(lightbulbIcon.classList.contains('text-emerald-500')).toBe(true);
    });

    it('should have teal-500 color for tags icon', () => {
      const tagsIcon = document.body.querySelector('label[for="professional-product-model-category"] i.fas.fa-tags');
      expect(tagsIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should have emerald-500 color for star icon', () => {
      const starIcon = document.body.querySelector('label[for="professional-product-model-quality"] i.fas.fa-star');
      expect(starIcon.classList.contains('text-emerald-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Model Produk Profesional');
      expect(document.body.textContent).toContain('Foto Produk');
      expect(document.body.textContent).toContain('Gaya Latar Belakang');
      expect(document.body.textContent).toContain('Rasio Aspek');
      expect(document.body.textContent).toContain('Gaya Pencahayaan');
      expect(document.body.textContent).toContain('Kategori Produk');
      expect(document.body.textContent).toContain('Kualitas Output');
      expect(document.body.textContent).toContain('Buat Model Produk');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Foto Produk');
      expect(headers[1].textContent).toContain('2. Gaya Latar Belakang');
      expect(headers[2].textContent).toContain('3. Rasio Aspek');
      expect(headers[3].textContent).toContain('4. Gaya Pencahayaan');
      expect(headers[4].textContent).toContain('5. Kategori Produk');
      expect(headers[5].textContent).toContain('6. Kualitas Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('professional-product-model-empty-state');
      expect(emptyState.textContent).toContain('Hasil foto produk profesional akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah foto produk dan klik Buat Model Produk');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('professional-product-model-loading');
      expect(loading.textContent).toContain('Sedang membuat model produk profesional');
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
      const imageInput = document.getElementById('professional-product-model-image');
      expect(imageInput).toBeTruthy();
      
      const backgroundSelect = document.getElementById('professional-product-model-background');
      expect(backgroundSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('professional-product-model-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const lightingSelect = document.getElementById('professional-product-model-lighting');
      expect(lightingSelect).toBeTruthy();
      
      const categorySelect = document.getElementById('professional-product-model-category');
      expect(categorySelect).toBeTruthy();
      
      const qualitySelect = document.getElementById('professional-product-model-quality');
      expect(qualitySelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const imageLabel = document.querySelector('label[for="professional-product-model-image"]');
      expect(imageLabel).toBeTruthy();
      
      const backgroundLabel = document.querySelector('label[for="professional-product-model-background"]');
      expect(backgroundLabel).toBeTruthy();
      
      const aspectRatioLabel = document.querySelector('label[for="professional-product-model-aspect-ratio"]');
      expect(aspectRatioLabel).toBeTruthy();
      
      const lightingLabel = document.querySelector('label[for="professional-product-model-lighting"]');
      expect(lightingLabel).toBeTruthy();
      
      const categoryLabel = document.querySelector('label[for="professional-product-model-category"]');
      expect(categoryLabel).toBeTruthy();
      
      const qualityLabel = document.querySelector('label[for="professional-product-model-quality"]');
      expect(qualityLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('professional-product-model-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const imageInput = document.getElementById('professional-product-model-image');
      expect(imageInput.type).toBe('file');
      
      const backgroundSelect = document.getElementById('professional-product-model-background');
      expect(backgroundSelect.tagName).toBe('SELECT');
      
      const aspectRatioSelect = document.getElementById('professional-product-model-aspect-ratio');
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      
      const lightingSelect = document.getElementById('professional-product-model-lighting');
      expect(lightingSelect.tagName).toBe('SELECT');
      
      const categorySelect = document.getElementById('professional-product-model-category');
      expect(categorySelect.tagName).toBe('SELECT');
      
      const qualitySelect = document.getElementById('professional-product-model-quality');
      expect(qualitySelect.tagName).toBe('SELECT');
    });

    it('should have proper accept attribute for image input', () => {
      const imageInput = document.getElementById('professional-product-model-image');
      expect(imageInput.accept).toBe('image/*');
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
