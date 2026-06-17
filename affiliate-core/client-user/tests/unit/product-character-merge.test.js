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

describe('product-character-merge Component', () => {
  
  const mockComponentHTML = `
    <div id="content-product-character-merge" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 bg-clip-text text-transparent">
            <i class="fas fa-object-group mr-3"></i>Gabung Produk & Karakter
          </h1>
          <p class="text-lg text-gray-600 mt-2">Gabungkan produk dan karakter menjadi satu gambar yang menarik</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Product Image Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Gambar Produk</h2>
              <div class="space-y-4">
                <div>
                  <label for="product-character-merge-product-image" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-camera mr-1 text-pink-500"></i>Unggah Gambar Produk
                  </label>
                  <input type="file" id="product-character-merge-product-image" accept="image/*" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                </div>
              </div>
            </div>
            
            <!-- Step 2: Character Image Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gambar Karakter</h2>
              <div class="space-y-4">
                <div>
                  <label for="product-character-merge-character-image" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-user mr-1 text-rose-500"></i>Unggah Gambar Karakter
                  </label>
                  <input type="file" id="product-character-merge-character-image" accept="image/*" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                </div>
              </div>
            </div>
            
            <!-- Step 3: Merge Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Style Gabung</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="product-character-merge-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-layer-group mr-1 text-pink-500"></i>Style Penggabungan
                  </label>
                  <select id="product-character-merge-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="side-by-side">Berjejer</option>
                    <option value="overlap">Tumpang Tindih</option>
                    <option value="frame">Bingkai</option>
                    <option value="badge">Lencana</option>
                    <option value="split">Pemisahan</option>
                    <option value="composite">Komposit</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Product Position -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Posisi Produk</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="product-character-merge-product-position" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-arrows-alt mr-1 text-rose-500"></i>Posisi Produk
                  </label>
                  <select id="product-character-merge-product-position" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                    <option value="left">Kiri</option>
                    <option value="right">Kanan</option>
                    <option value="top">Atas</option>
                    <option value="bottom">Bawah</option>
                    <option value="center">Tengah</option>
                    <option value="background">Latar Belakang</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Character Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Style Karakter</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="product-character-merge-character-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-pink-500"></i>Style Karakter
                  </label>
                  <select id="product-character-merge-character-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="cartoon">Kartun</option>
                    <option value="realistic">Realistis</option>
                    <option value="silhouette">Siluet</option>
                    <option value="outline">Garis</option>
                    <option value="minimal">Minimalis</option>
                    <option value="detailed">Detail</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Background Color -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Warna Latar</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="product-character-merge-background-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-rose-500"></i>Warna Latar
                  </label>
                  <select id="product-character-merge-background-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                    <option value="white">Putih</option>
                    <option value="black">Hitam</option>
                    <option value="gradient">Gradien</option>
                    <option value="transparent">Transparan</option>
                    <option value="custom">Kustom</option>
                    <option value="match-product">Sesuai Produk</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="product-character-merge-generate-btn" class="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Gabung Gambar
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="product-character-merge-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="product-character-merge-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-object-group text-6xl mb-4 text-pink-400"></i>
                <p class="text-xl">Hasil penggabungan akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah gambar dan klik Gabung Gambar</p>
              </div>
              <div id="product-character-merge-results" class="hidden space-y-6"></div>
              <div id="product-character-merge-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-pink-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang menggabungkan gambar...</p>
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
      const container = document.getElementById('content-product-character-merge');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Gabung Produk & Karakter');
      expect(title.querySelector('i.fas.fa-object-group')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Gabungkan produk dan karakter menjadi satu gambar yang menarik');
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
      expect(rightPanel.querySelector('#product-character-merge-results-container')).toBeTruthy();
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
    it('should render product image input', () => {
      const productImageInput = document.getElementById('product-character-merge-product-image');
      expect(productImageInput).toBeTruthy();
      expect(productImageInput.type).toBe('file');
      expect(productImageInput.accept).toBe('image/*');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Gambar Produk');
    });

    it('should have label with camera icon', () => {
      const cameraIcon = document.body.querySelector('i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
      expect(cameraIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have proper input styling', () => {
      const productImageInput = document.getElementById('product-character-merge-product-image');
      expect(productImageInput.classList.contains('w-full')).toBe(true);
      expect(productImageInput.classList.contains('p-3')).toBe(true);
      expect(productImageInput.classList.contains('border')).toBe(true);
      expect(productImageInput.classList.contains('rounded-lg')).toBe(true);
      expect(productImageInput.classList.contains('focus:ring-2')).toBe(true);
      expect(productImageInput.classList.contains('focus:ring-pink-500')).toBe(true);
    });

    it('should have proper label text', () => {
      const label = document.querySelector('label[for="product-character-merge-product-image"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Unggah Gambar Produk');
    });
  });

  // Character Image Upload Tests
  describe('Character Image Upload', () => {
    it('should render character image input', () => {
      const characterImageInput = document.getElementById('product-character-merge-character-image');
      expect(characterImageInput).toBeTruthy();
      expect(characterImageInput.type).toBe('file');
      expect(characterImageInput.accept).toBe('image/*');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gambar Karakter');
    });

    it('should have label with user icon', () => {
      const userIcon = document.body.querySelector('i.fas.fa-user');
      expect(userIcon).toBeTruthy();
      expect(userIcon.classList.contains('text-rose-500')).toBe(true);
    });

    it('should have proper input styling', () => {
      const characterImageInput = document.getElementById('product-character-merge-character-image');
      expect(characterImageInput.classList.contains('w-full')).toBe(true);
      expect(characterImageInput.classList.contains('p-3')).toBe(true);
      expect(characterImageInput.classList.contains('border')).toBe(true);
      expect(characterImageInput.classList.contains('rounded-lg')).toBe(true);
      expect(characterImageInput.classList.contains('focus:ring-2')).toBe(true);
      expect(characterImageInput.classList.contains('focus:ring-rose-500')).toBe(true);
    });

    it('should have proper label text', () => {
      const label = document.querySelector('label[for="product-character-merge-character-image"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Unggah Gambar Karakter');
    });
  });

  // Merge Style Selection Tests
  describe('Merge Style Selection', () => {
    it('should render merge style select', () => {
      const mergeStyleSelect = document.getElementById('product-character-merge-style');
      expect(mergeStyleSelect).toBeTruthy();
      expect(mergeStyleSelect.tagName).toBe('SELECT');
      expect(mergeStyleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Style Gabung');
    });

    it('should have label with layer-group icon', () => {
      const layerGroupIcon = document.body.querySelector('i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have merge style options with proper labels', () => {
      const mergeStyleSelect = document.getElementById('product-character-merge-style');
      expect(mergeStyleSelect.options[0].textContent).toContain('Berjejer');
      expect(mergeStyleSelect.options[1].textContent).toContain('Tumpang Tindih');
      expect(mergeStyleSelect.options[2].textContent).toContain('Bingkai');
      expect(mergeStyleSelect.options[3].textContent).toContain('Lencana');
      expect(mergeStyleSelect.options[4].textContent).toContain('Pemisahan');
      expect(mergeStyleSelect.options[5].textContent).toContain('Komposit');
    });

    it('should have default merge style value', () => {
      const mergeStyleSelect = document.getElementById('product-character-merge-style');
      expect(mergeStyleSelect.value).toBe('side-by-side');
    });

    it('should have proper input styling', () => {
      const mergeStyleSelect = document.getElementById('product-character-merge-style');
      expect(mergeStyleSelect.classList.contains('w-full')).toBe(true);
      expect(mergeStyleSelect.classList.contains('p-3')).toBe(true);
      expect(mergeStyleSelect.classList.contains('border')).toBe(true);
      expect(mergeStyleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(mergeStyleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(mergeStyleSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Product Position Selection Tests
  describe('Product Position Selection', () => {
    it('should render product position select', () => {
      const productPositionSelect = document.getElementById('product-character-merge-product-position');
      expect(productPositionSelect).toBeTruthy();
      expect(productPositionSelect.tagName).toBe('SELECT');
      expect(productPositionSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Posisi Produk');
    });

    it('should have label with arrows-alt icon', () => {
      const arrowsAltIcon = document.body.querySelector('i.fas.fa-arrows-alt');
      expect(arrowsAltIcon).toBeTruthy();
    });

    it('should have product position options with proper labels', () => {
      const productPositionSelect = document.getElementById('product-character-merge-product-position');
      expect(productPositionSelect.options[0].textContent).toContain('Kiri');
      expect(productPositionSelect.options[1].textContent).toContain('Kanan');
      expect(productPositionSelect.options[2].textContent).toContain('Atas');
      expect(productPositionSelect.options[3].textContent).toContain('Bawah');
      expect(productPositionSelect.options[4].textContent).toContain('Tengah');
      expect(productPositionSelect.options[5].textContent).toContain('Latar Belakang');
    });

    it('should have default product position value', () => {
      const productPositionSelect = document.getElementById('product-character-merge-product-position');
      expect(productPositionSelect.value).toBe('left');
    });

    it('should have proper input styling', () => {
      const productPositionSelect = document.getElementById('product-character-merge-product-position');
      expect(productPositionSelect.classList.contains('w-full')).toBe(true);
      expect(productPositionSelect.classList.contains('p-3')).toBe(true);
      expect(productPositionSelect.classList.contains('border')).toBe(true);
      expect(productPositionSelect.classList.contains('rounded-lg')).toBe(true);
      expect(productPositionSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(productPositionSelect.classList.contains('focus:ring-rose-500')).toBe(true);
    });
  });

  // Character Style Selection Tests
  describe('Character Style Selection', () => {
    it('should render character style select', () => {
      const characterStyleSelect = document.getElementById('product-character-merge-character-style');
      expect(characterStyleSelect).toBeTruthy();
      expect(characterStyleSelect.tagName).toBe('SELECT');
      expect(characterStyleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Style Karakter');
    });

    it('should have label with paint-brush icon', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have character style options with proper labels', () => {
      const characterStyleSelect = document.getElementById('product-character-merge-character-style');
      expect(characterStyleSelect.options[0].textContent).toContain('Kartun');
      expect(characterStyleSelect.options[1].textContent).toContain('Realistis');
      expect(characterStyleSelect.options[2].textContent).toContain('Siluet');
      expect(characterStyleSelect.options[3].textContent).toContain('Garis');
      expect(characterStyleSelect.options[4].textContent).toContain('Minimalis');
      expect(characterStyleSelect.options[5].textContent).toContain('Detail');
    });

    it('should have default character style value', () => {
      const characterStyleSelect = document.getElementById('product-character-merge-character-style');
      expect(characterStyleSelect.value).toBe('cartoon');
    });

    it('should have proper input styling', () => {
      const characterStyleSelect = document.getElementById('product-character-merge-character-style');
      expect(characterStyleSelect.classList.contains('w-full')).toBe(true);
      expect(characterStyleSelect.classList.contains('p-3')).toBe(true);
      expect(characterStyleSelect.classList.contains('border')).toBe(true);
      expect(characterStyleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(characterStyleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(characterStyleSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Background Color Selection Tests
  describe('Background Color Selection', () => {
    it('should render background color select', () => {
      const backgroundColorSelect = document.getElementById('product-character-merge-background-color');
      expect(backgroundColorSelect).toBeTruthy();
      expect(backgroundColorSelect.tagName).toBe('SELECT');
      expect(backgroundColorSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Warna Latar');
    });

    it('should have label with palette icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have background color options with proper labels', () => {
      const backgroundColorSelect = document.getElementById('product-character-merge-background-color');
      expect(backgroundColorSelect.options[0].textContent).toContain('Putih');
      expect(backgroundColorSelect.options[1].textContent).toContain('Hitam');
      expect(backgroundColorSelect.options[2].textContent).toContain('Gradien');
      expect(backgroundColorSelect.options[3].textContent).toContain('Transparan');
      expect(backgroundColorSelect.options[4].textContent).toContain('Kustom');
      expect(backgroundColorSelect.options[5].textContent).toContain('Sesuai Produk');
    });

    it('should have default background color value', () => {
      const backgroundColorSelect = document.getElementById('product-character-merge-background-color');
      expect(backgroundColorSelect.value).toBe('white');
    });

    it('should have proper input styling', () => {
      const backgroundColorSelect = document.getElementById('product-character-merge-background-color');
      expect(backgroundColorSelect.classList.contains('w-full')).toBe(true);
      expect(backgroundColorSelect.classList.contains('p-3')).toBe(true);
      expect(backgroundColorSelect.classList.contains('border')).toBe(true);
      expect(backgroundColorSelect.classList.contains('rounded-lg')).toBe(true);
      expect(backgroundColorSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(backgroundColorSelect.classList.contains('focus:ring-rose-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('product-character-merge-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Gabung Gambar');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('product-character-merge-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('via-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('product-character-merge-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('product-character-merge-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('product-character-merge-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('product-character-merge-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-object-group')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil penggabungan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('product-character-merge-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('product-character-merge-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang menggabungkan gambar');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('product-character-merge-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have pink icon in empty state', () => {
      const emptyStateIcon = document.getElementById('product-character-merge-empty-state').querySelector('i.fas.fa-object-group');
      expect(emptyStateIcon.classList.contains('text-pink-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use pink/rose color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-pink-500')).toBe(true);
      expect(title.classList.contains('via-rose-500')).toBe(true);
      expect(title.classList.contains('to-pink-400')).toBe(true);
    });

    it('should use pink/rose accents in generate button', () => {
      const generateBtn = document.getElementById('product-character-merge-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('via-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-400')).toBe(true);
    });

    it('should use pink accents in product image input', () => {
      const productImageInput = document.getElementById('product-character-merge-product-image');
      expect(productImageInput.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(productImageInput.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in character image input', () => {
      const characterImageInput = document.getElementById('product-character-merge-character-image');
      expect(characterImageInput.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(characterImageInput.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use pink accents in merge style select', () => {
      const mergeStyleSelect = document.getElementById('product-character-merge-style');
      expect(mergeStyleSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(mergeStyleSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in product position select', () => {
      const productPositionSelect = document.getElementById('product-character-merge-product-position');
      expect(productPositionSelect.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(productPositionSelect.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use pink accents in character style select', () => {
      const characterStyleSelect = document.getElementById('product-character-merge-character-style');
      expect(characterStyleSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(characterStyleSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in background color select', () => {
      const backgroundColorSelect = document.getElementById('product-character-merge-background-color');
      expect(backgroundColorSelect.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(backgroundColorSelect.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use pink accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });

    it('should use pink accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('product-character-merge-empty-state').querySelector('i.fas.fa-object-group');
      expect(emptyStateIcon.classList.contains('text-pink-400')).toBe(true);
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

    it('should have object-group icon in header', () => {
      const objectGroupIcon = document.body.querySelector('header i.fas.fa-object-group');
      expect(objectGroupIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('product-character-merge-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have camera icon for product image', () => {
      const cameraIcon = document.body.querySelector('i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have user icon for character image', () => {
      const userIcon = document.body.querySelector('i.fas.fa-user');
      expect(userIcon).toBeTruthy();
    });

    it('should have layer-group icon for merge style', () => {
      const layerGroupIcon = document.body.querySelector('i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have arrows-alt icon for product position', () => {
      const arrowsAltIcon = document.body.querySelector('i.fas.fa-arrows-alt');
      expect(arrowsAltIcon).toBeTruthy();
    });

    it('should have paint-brush icon for character style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have palette icon for background color', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have object-group icon in empty state', () => {
      const emptyStateIcon = document.getElementById('product-character-merge-empty-state').querySelector('i.fas.fa-object-group');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have camera icon with pink color', () => {
      const cameraIcon = document.body.querySelector('i.fas.fa-camera');
      expect(cameraIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have user icon with rose color', () => {
      const userIcon = document.body.querySelector('i.fas.fa-user');
      expect(userIcon.classList.contains('text-rose-500')).toBe(true);
    });

    it('should have layer-group icon with pink color', () => {
      const layerGroupIcon = document.body.querySelector('i.fas.fa-layer-group');
      expect(layerGroupIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have arrows-alt icon with rose color', () => {
      const arrowsAltIcon = document.body.querySelector('i.fas.fa-arrows-alt');
      expect(arrowsAltIcon.classList.contains('text-rose-500')).toBe(true);
    });

    it('should have paint-brush icon with pink color', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have palette icon with rose color', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon.classList.contains('text-rose-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Gabung Produk & Karakter');
      expect(document.body.textContent).toContain('Gambar Produk');
      expect(document.body.textContent).toContain('Gambar Karakter');
      expect(document.body.textContent).toContain('Style Gabung');
      expect(document.body.textContent).toContain('Posisi Produk');
      expect(document.body.textContent).toContain('Style Karakter');
      expect(document.body.textContent).toContain('Warna Latar');
      expect(document.body.textContent).toContain('Gabung Gambar');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Gambar Produk');
      expect(headers[1].textContent).toContain('2. Gambar Karakter');
      expect(headers[2].textContent).toContain('3. Style Gabung');
      expect(headers[3].textContent).toContain('4. Posisi Produk');
      expect(headers[4].textContent).toContain('5. Style Karakter');
      expect(headers[5].textContent).toContain('6. Warna Latar');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('product-character-merge-empty-state');
      expect(emptyState.textContent).toContain('Hasil penggabungan akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah gambar dan klik Gabung Gambar');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('product-character-merge-loading');
      expect(loading.textContent).toContain('Sedang menggabungkan gambar');
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
      const productImageInput = document.getElementById('product-character-merge-product-image');
      expect(productImageInput).toBeTruthy();
      
      const characterImageInput = document.getElementById('product-character-merge-character-image');
      expect(characterImageInput).toBeTruthy();
      
      const mergeStyleSelect = document.getElementById('product-character-merge-style');
      expect(mergeStyleSelect).toBeTruthy();
      
      const productPositionSelect = document.getElementById('product-character-merge-product-position');
      expect(productPositionSelect).toBeTruthy();
      
      const characterStyleSelect = document.getElementById('product-character-merge-character-style');
      expect(characterStyleSelect).toBeTruthy();
      
      const backgroundColorSelect = document.getElementById('product-character-merge-background-color');
      expect(backgroundColorSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const productImageLabel = document.querySelector('label[for="product-character-merge-product-image"]');
      expect(productImageLabel).toBeTruthy();
      
      const characterImageLabel = document.querySelector('label[for="product-character-merge-character-image"]');
      expect(characterImageLabel).toBeTruthy();
      
      const mergeStyleLabel = document.querySelector('label[for="product-character-merge-style"]');
      expect(mergeStyleLabel).toBeTruthy();
      
      const productPositionLabel = document.querySelector('label[for="product-character-merge-product-position"]');
      expect(productPositionLabel).toBeTruthy();
      
      const characterStyleLabel = document.querySelector('label[for="product-character-merge-character-style"]');
      expect(characterStyleLabel).toBeTruthy();
      
      const backgroundColorLabel = document.querySelector('label[for="product-character-merge-background-color"]');
      expect(backgroundColorLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('product-character-merge-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const productImageInput = document.getElementById('product-character-merge-product-image');
      expect(productImageInput.type).toBe('file');
      
      const characterImageInput = document.getElementById('product-character-merge-character-image');
      expect(characterImageInput.type).toBe('file');
      
      const mergeStyleSelect = document.getElementById('product-character-merge-style');
      expect(mergeStyleSelect.tagName).toBe('SELECT');
      
      const productPositionSelect = document.getElementById('product-character-merge-product-position');
      expect(productPositionSelect.tagName).toBe('SELECT');
      
      const characterStyleSelect = document.getElementById('product-character-merge-character-style');
      expect(characterStyleSelect.tagName).toBe('SELECT');
      
      const backgroundColorSelect = document.getElementById('product-character-merge-background-color');
      expect(backgroundColorSelect.tagName).toBe('SELECT');
    });

    it('should have proper accept attributes for file inputs', () => {
      const productImageInput = document.getElementById('product-character-merge-product-image');
      expect(productImageInput.accept).toBe('image/*');
      
      const characterImageInput = document.getElementById('product-character-merge-character-image');
      expect(characterImageInput.accept).toBe('image/*');
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
