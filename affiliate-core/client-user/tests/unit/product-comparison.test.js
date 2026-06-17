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

describe('product-comparison Component', () => {
  
  const mockComponentHTML = `
    <div id="content-product-comparison" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            <i class="fas fa-balance-scale mr-3"></i>Perbandingan Produk
          </h1>
          <p class="text-lg text-gray-600 mt-2">Bandingkan dua produk dengan bantuan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Product 1 Section -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-box-open mr-2 text-purple-500"></i>Produk 1
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label for="product-comparison-product1-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-purple-500"></i>Nama Produk
                  </label>
                  <input type="text" id="product-comparison-product1-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan nama produk">
                </div>
                
                <div>
                  <label for="product-comparison-product1-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-pink-500"></i>Deskripsi
                  </label>
                  <textarea id="product-comparison-product1-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Masukkan deskripsi produk"></textarea>
                </div>
                
                <div>
                  <label for="product-comparison-product1-price" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-money-bill-wave mr-1 text-rose-500"></i>Harga
                  </label>
                  <input type="number" id="product-comparison-product1-price" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="Masukkan harga">
                </div>
                
                <div>
                  <label for="product-comparison-product1-features" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-list-ul mr-1 text-purple-500"></i>Fitur (pisahkan dengan koma)
                  </label>
                  <textarea id="product-comparison-product1-features" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Fitur1, Fitur2, Fitur3"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Product 2 Section -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-box-open mr-2 text-pink-500"></i>Produk 2
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label for="product-comparison-product2-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-pink-500"></i>Nama Produk
                  </label>
                  <input type="text" id="product-comparison-product2-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Masukkan nama produk">
                </div>
                
                <div>
                  <label for="product-comparison-product2-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-rose-500"></i>Deskripsi
                  </label>
                  <textarea id="product-comparison-product2-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="Masukkan deskripsi produk"></textarea>
                </div>
                
                <div>
                  <label for="product-comparison-product2-price" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-money-bill-wave mr-1 text-purple-500"></i>Harga
                  </label>
                  <input type="number" id="product-comparison-product2-price" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan harga">
                </div>
                
                <div>
                  <label for="product-comparison-product2-features" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-list-ul mr-1 text-pink-500"></i>Fitur (pisahkan dengan koma)
                  </label>
                  <textarea id="product-comparison-product2-features" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Fitur1, Fitur2, Fitur3"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Comparison Criteria Section -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-sliders-h mr-2 text-rose-500"></i>Kriteria Perbandingan
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label for="product-comparison-criteria" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-filter mr-1 text-purple-500"></i>Kriteria Utama
                  </label>
                  <select id="product-comparison-criteria" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="price">Harga</option>
                    <option value="quality">Kualitas</option>
                    <option value="features">Fitur</option>
                    <option value="value">Nilai</option>
                    <option value="overall">Keseluruhan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="product-comparison-generate-btn" class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Perbandingan
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="product-comparison-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="product-comparison-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-balance-scale text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil perbandingan produk akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi kedua produk dan klik Buat Perbandingan</p>
              </div>
              <div id="product-comparison-results" class="hidden space-y-6"></div>
              <div id="product-comparison-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat perbandingan...</p>
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
      const container = document.getElementById('content-product-comparison');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Perbandingan Produk');
      expect(title.querySelector('i.fas.fa-balance-scale')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Bandingkan dua produk dengan bantuan AI');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(3);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#product-comparison-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Product 1 Inputs Tests
  describe('Product 1 Inputs', () => {
    it('should render Product 1 section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('Produk 1');
      expect(headers[0].querySelector('i.fas.fa-box-open')).toBeTruthy();
    });

    it('should render Product 1 name input', () => {
      const nameInput = document.getElementById('product-comparison-product1-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.tagName).toBe('INPUT');
      expect(nameInput.type).toBe('text');
      expect(nameInput.placeholder).toContain('Masukkan nama produk');
    });

    it('should render Product 1 name label with icon', () => {
      const nameLabel = document.querySelector('label[for="product-comparison-product1-name"]');
      expect(nameLabel).toBeTruthy();
      expect(nameLabel.textContent).toContain('Nama Produk');
      expect(nameLabel.querySelector('i.fas.fa-tag')).toBeTruthy();
    });

    it('should have proper Product 1 name input styling', () => {
      const nameInput = document.getElementById('product-comparison-product1-name');
      expect(nameInput.classList.contains('w-full')).toBe(true);
      expect(nameInput.classList.contains('p-3')).toBe(true);
      expect(nameInput.classList.contains('border')).toBe(true);
      expect(nameInput.classList.contains('rounded-lg')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-2')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });

    it('should render Product 1 description textarea', () => {
      const descTextarea = document.getElementById('product-comparison-product1-description');
      expect(descTextarea).toBeTruthy();
      expect(descTextarea.tagName).toBe('TEXTAREA');
      expect(descTextarea.rows).toBe(3);
      expect(descTextarea.placeholder).toContain('Masukkan deskripsi produk');
    });

    it('should render Product 1 description label with icon', () => {
      const descLabel = document.querySelector('label[for="product-comparison-product1-description"]');
      expect(descLabel).toBeTruthy();
      expect(descLabel.textContent).toContain('Deskripsi');
      expect(descLabel.querySelector('i.fas.fa-align-left')).toBeTruthy();
    });

    it('should have proper Product 1 description textarea styling', () => {
      const descTextarea = document.getElementById('product-comparison-product1-description');
      expect(descTextarea.classList.contains('w-full')).toBe(true);
      expect(descTextarea.classList.contains('p-3')).toBe(true);
      expect(descTextarea.classList.contains('border')).toBe(true);
      expect(descTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(descTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(descTextarea.classList.contains('focus:ring-pink-500')).toBe(true);
    });

    it('should render Product 1 price input', () => {
      const priceInput = document.getElementById('product-comparison-product1-price');
      expect(priceInput).toBeTruthy();
      expect(priceInput.tagName).toBe('INPUT');
      expect(priceInput.type).toBe('number');
      expect(priceInput.placeholder).toContain('Masukkan harga');
    });

    it('should render Product 1 price label with icon', () => {
      const priceLabel = document.querySelector('label[for="product-comparison-product1-price"]');
      expect(priceLabel).toBeTruthy();
      expect(priceLabel.textContent).toContain('Harga');
      expect(priceLabel.querySelector('i.fas.fa-money-bill-wave')).toBeTruthy();
    });

    it('should have proper Product 1 price input styling', () => {
      const priceInput = document.getElementById('product-comparison-product1-price');
      expect(priceInput.classList.contains('w-full')).toBe(true);
      expect(priceInput.classList.contains('p-3')).toBe(true);
      expect(priceInput.classList.contains('border')).toBe(true);
      expect(priceInput.classList.contains('rounded-lg')).toBe(true);
      expect(priceInput.classList.contains('focus:ring-2')).toBe(true);
      expect(priceInput.classList.contains('focus:ring-rose-500')).toBe(true);
    });

    it('should render Product 1 features textarea', () => {
      const featuresTextarea = document.getElementById('product-comparison-product1-features');
      expect(featuresTextarea).toBeTruthy();
      expect(featuresTextarea.tagName).toBe('TEXTAREA');
      expect(featuresTextarea.rows).toBe(2);
      expect(featuresTextarea.placeholder).toContain('Fitur1, Fitur2, Fitur3');
    });

    it('should render Product 1 features label with icon', () => {
      const featuresLabel = document.querySelector('label[for="product-comparison-product1-features"]');
      expect(featuresLabel).toBeTruthy();
      expect(featuresLabel.textContent).toContain('Fitur');
      expect(featuresLabel.querySelector('i.fas.fa-list-ul')).toBeTruthy();
    });

    it('should have proper Product 1 features textarea styling', () => {
      const featuresTextarea = document.getElementById('product-comparison-product1-features');
      expect(featuresTextarea.classList.contains('w-full')).toBe(true);
      expect(featuresTextarea.classList.contains('p-3')).toBe(true);
      expect(featuresTextarea.classList.contains('border')).toBe(true);
      expect(featuresTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(featuresTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(featuresTextarea.classList.contains('focus:ring-purple-500')).toBe(true);
    });

    it('should have Product 1 section with purple accent', () => {
      const product1Section = document.body.querySelectorAll('.card')[0];
      expect(product1Section.querySelector('i.fas.fa-box-open').classList.contains('text-purple-500')).toBe(true);
    });
  });

  // Product 2 Inputs Tests
  describe('Product 2 Inputs', () => {
    it('should render Product 2 section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('Produk 2');
      expect(headers[1].querySelector('i.fas.fa-box-open')).toBeTruthy();
    });

    it('should render Product 2 name input', () => {
      const nameInput = document.getElementById('product-comparison-product2-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.tagName).toBe('INPUT');
      expect(nameInput.type).toBe('text');
      expect(nameInput.placeholder).toContain('Masukkan nama produk');
    });

    it('should render Product 2 name label with icon', () => {
      const nameLabel = document.querySelector('label[for="product-comparison-product2-name"]');
      expect(nameLabel).toBeTruthy();
      expect(nameLabel.textContent).toContain('Nama Produk');
      expect(nameLabel.querySelector('i.fas.fa-tag')).toBeTruthy();
    });

    it('should have proper Product 2 name input styling', () => {
      const nameInput = document.getElementById('product-comparison-product2-name');
      expect(nameInput.classList.contains('w-full')).toBe(true);
      expect(nameInput.classList.contains('p-3')).toBe(true);
      expect(nameInput.classList.contains('border')).toBe(true);
      expect(nameInput.classList.contains('rounded-lg')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-2')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-pink-500')).toBe(true);
    });

    it('should render Product 2 description textarea', () => {
      const descTextarea = document.getElementById('product-comparison-product2-description');
      expect(descTextarea).toBeTruthy();
      expect(descTextarea.tagName).toBe('TEXTAREA');
      expect(descTextarea.rows).toBe(3);
      expect(descTextarea.placeholder).toContain('Masukkan deskripsi produk');
    });

    it('should render Product 2 description label with icon', () => {
      const descLabel = document.querySelector('label[for="product-comparison-product2-description"]');
      expect(descLabel).toBeTruthy();
      expect(descLabel.textContent).toContain('Deskripsi');
      expect(descLabel.querySelector('i.fas.fa-align-left')).toBeTruthy();
    });

    it('should have proper Product 2 description textarea styling', () => {
      const descTextarea = document.getElementById('product-comparison-product2-description');
      expect(descTextarea.classList.contains('w-full')).toBe(true);
      expect(descTextarea.classList.contains('p-3')).toBe(true);
      expect(descTextarea.classList.contains('border')).toBe(true);
      expect(descTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(descTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(descTextarea.classList.contains('focus:ring-rose-500')).toBe(true);
    });

    it('should render Product 2 price input', () => {
      const priceInput = document.getElementById('product-comparison-product2-price');
      expect(priceInput).toBeTruthy();
      expect(priceInput.tagName).toBe('INPUT');
      expect(priceInput.type).toBe('number');
      expect(priceInput.placeholder).toContain('Masukkan harga');
    });

    it('should render Product 2 price label with icon', () => {
      const priceLabel = document.querySelector('label[for="product-comparison-product2-price"]');
      expect(priceLabel).toBeTruthy();
      expect(priceLabel.textContent).toContain('Harga');
      expect(priceLabel.querySelector('i.fas.fa-money-bill-wave')).toBeTruthy();
    });

    it('should have proper Product 2 price input styling', () => {
      const priceInput = document.getElementById('product-comparison-product2-price');
      expect(priceInput.classList.contains('w-full')).toBe(true);
      expect(priceInput.classList.contains('p-3')).toBe(true);
      expect(priceInput.classList.contains('border')).toBe(true);
      expect(priceInput.classList.contains('rounded-lg')).toBe(true);
      expect(priceInput.classList.contains('focus:ring-2')).toBe(true);
      expect(priceInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });

    it('should render Product 2 features textarea', () => {
      const featuresTextarea = document.getElementById('product-comparison-product2-features');
      expect(featuresTextarea).toBeTruthy();
      expect(featuresTextarea.tagName).toBe('TEXTAREA');
      expect(featuresTextarea.rows).toBe(2);
      expect(featuresTextarea.placeholder).toContain('Fitur1, Fitur2, Fitur3');
    });

    it('should render Product 2 features label with icon', () => {
      const featuresLabel = document.querySelector('label[for="product-comparison-product2-features"]');
      expect(featuresLabel).toBeTruthy();
      expect(featuresLabel.textContent).toContain('Fitur');
      expect(featuresLabel.querySelector('i.fas.fa-list-ul')).toBeTruthy();
    });

    it('should have proper Product 2 features textarea styling', () => {
      const featuresTextarea = document.getElementById('product-comparison-product2-features');
      expect(featuresTextarea.classList.contains('w-full')).toBe(true);
      expect(featuresTextarea.classList.contains('p-3')).toBe(true);
      expect(featuresTextarea.classList.contains('border')).toBe(true);
      expect(featuresTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(featuresTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(featuresTextarea.classList.contains('focus:ring-pink-500')).toBe(true);
    });

    it('should have Product 2 section with pink accent', () => {
      const product2Section = document.body.querySelectorAll('.card')[1];
      expect(product2Section.querySelector('i.fas.fa-box-open').classList.contains('text-pink-500')).toBe(true);
    });
  });

  // Comparison Criteria Selection Tests
  describe('Comparison Criteria Selection', () => {
    it('should render criteria section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('Kriteria Perbandingan');
      expect(headers[2].querySelector('i.fas.fa-sliders-h')).toBeTruthy();
    });

    it('should render criteria select', () => {
      const criteriaSelect = document.getElementById('product-comparison-criteria');
      expect(criteriaSelect).toBeTruthy();
      expect(criteriaSelect.tagName).toBe('SELECT');
      expect(criteriaSelect.options.length).toBe(5);
    });

    it('should have criteria label with icon', () => {
      const criteriaLabel = document.querySelector('label[for="product-comparison-criteria"]');
      expect(criteriaLabel).toBeTruthy();
      expect(criteriaLabel.textContent).toContain('Kriteria Utama');
      expect(criteriaLabel.querySelector('i.fas.fa-filter')).toBeTruthy();
    });

    it('should have criteria options with proper labels', () => {
      const criteriaSelect = document.getElementById('product-comparison-criteria');
      expect(criteriaSelect.options[0].textContent).toContain('Harga');
      expect(criteriaSelect.options[1].textContent).toContain('Kualitas');
      expect(criteriaSelect.options[2].textContent).toContain('Fitur');
      expect(criteriaSelect.options[3].textContent).toContain('Nilai');
      expect(criteriaSelect.options[4].textContent).toContain('Keseluruhan');
    });

    it('should have default criteria value', () => {
      const criteriaSelect = document.getElementById('product-comparison-criteria');
      expect(criteriaSelect.value).toBe('price');
    });

    it('should have proper criteria select styling', () => {
      const criteriaSelect = document.getElementById('product-comparison-criteria');
      expect(criteriaSelect.classList.contains('w-full')).toBe(true);
      expect(criteriaSelect.classList.contains('p-3')).toBe(true);
      expect(criteriaSelect.classList.contains('border')).toBe(true);
      expect(criteriaSelect.classList.contains('rounded-lg')).toBe(true);
      expect(criteriaSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(criteriaSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('product-comparison-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Perbandingan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('product-comparison-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('product-comparison-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('product-comparison-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('product-comparison-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('product-comparison-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-balance-scale')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil perbandingan produk akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('product-comparison-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('product-comparison-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat perbandingan');
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
      const emptyState = document.getElementById('product-comparison-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('product-comparison-empty-state').querySelector('i.fas.fa-balance-scale');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/pink/rose color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-500')).toBe(true);
      expect(title.classList.contains('via-pink-500')).toBe(true);
      expect(title.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use purple/pink/rose accents in generate button', () => {
      const generateBtn = document.getElementById('product-comparison-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use purple accents in Product 1 name input', () => {
      const nameInput = document.getElementById('product-comparison-product1-name');
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(nameInput.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use pink accents in Product 1 description textarea', () => {
      const descTextarea = document.getElementById('product-comparison-product1-description');
      expect(descTextarea.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(descTextarea.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in Product 1 price input', () => {
      const priceInput = document.getElementById('product-comparison-product1-price');
      expect(priceInput.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(priceInput.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use pink accents in Product 2 name input', () => {
      const nameInput = document.getElementById('product-comparison-product2-name');
      expect(nameInput.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(nameInput.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in Product 2 description textarea', () => {
      const descTextarea = document.getElementById('product-comparison-product2-description');
      expect(descTextarea.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(descTextarea.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use purple accents in criteria select', () => {
      const criteriaSelect = document.getElementById('product-comparison-criteria');
      expect(criteriaSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(criteriaSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('product-comparison-empty-state').querySelector('i.fas.fa-balance-scale');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(4);
      
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
      expect(icons.length).toBeGreaterThanOrEqual(15);
    });

    it('should have balance-scale icon in header', () => {
      const balanceScaleIcon = document.body.querySelector('header i.fas.fa-balance-scale');
      expect(balanceScaleIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('product-comparison-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have box-open icon for Product 1 section', () => {
      const boxOpenIcon1 = document.body.querySelectorAll('.card h2 i.fas.fa-box-open')[0];
      expect(boxOpenIcon1).toBeTruthy();
    });

    it('should have box-open icon for Product 2 section', () => {
      const boxOpenIcon2 = document.body.querySelectorAll('.card h2 i.fas.fa-box-open')[1];
      expect(boxOpenIcon2).toBeTruthy();
    });

    it('should have tag icon for Product 1 name', () => {
      const tagIcon1 = document.querySelector('label[for="product-comparison-product1-name"] i.fas.fa-tag');
      expect(tagIcon1).toBeTruthy();
    });

    it('should have tag icon for Product 2 name', () => {
      const tagIcon2 = document.querySelector('label[for="product-comparison-product2-name"] i.fas.fa-tag');
      expect(tagIcon2).toBeTruthy();
    });

    it('should have align-left icon for Product 1 description', () => {
      const alignLeftIcon1 = document.querySelector('label[for="product-comparison-product1-description"] i.fas.fa-align-left');
      expect(alignLeftIcon1).toBeTruthy();
    });

    it('should have align-left icon for Product 2 description', () => {
      const alignLeftIcon2 = document.querySelector('label[for="product-comparison-product2-description"] i.fas.fa-align-left');
      expect(alignLeftIcon2).toBeTruthy();
    });

    it('should have money-bill-wave icon for Product 1 price', () => {
      const moneyBillWaveIcon1 = document.querySelector('label[for="product-comparison-product1-price"] i.fas.fa-money-bill-wave');
      expect(moneyBillWaveIcon1).toBeTruthy();
    });

    it('should have money-bill-wave icon for Product 2 price', () => {
      const moneyBillWaveIcon2 = document.querySelector('label[for="product-comparison-product2-price"] i.fas.fa-money-bill-wave');
      expect(moneyBillWaveIcon2).toBeTruthy();
    });

    it('should have list-ul icon for Product 1 features', () => {
      const listUlIcon1 = document.querySelector('label[for="product-comparison-product1-features"] i.fas.fa-list-ul');
      expect(listUlIcon1).toBeTruthy();
    });

    it('should have list-ul icon for Product 2 features', () => {
      const listUlIcon2 = document.querySelector('label[for="product-comparison-product2-features"] i.fas.fa-list-ul');
      expect(listUlIcon2).toBeTruthy();
    });

    it('should have sliders-h icon for criteria section', () => {
      const slidersHIcon = document.body.querySelector('h2 i.fas.fa-sliders-h');
      expect(slidersHIcon).toBeTruthy();
    });

    it('should have filter icon for criteria label', () => {
      const filterIcon = document.querySelector('label[for="product-comparison-criteria"] i.fas.fa-filter');
      expect(filterIcon).toBeTruthy();
    });

    it('should have balance-scale icon in empty state', () => {
      const emptyStateIcon = document.getElementById('product-comparison-empty-state').querySelector('i.fas.fa-balance-scale');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Perbandingan Produk');
      expect(document.body.textContent).toContain('Bandingkan dua produk dengan bantuan AI');
      expect(document.body.textContent).toContain('Produk 1');
      expect(document.body.textContent).toContain('Produk 2');
      expect(document.body.textContent).toContain('Kriteria Perbandingan');
      expect(document.body.textContent).toContain('Buat Perbandingan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(3);
      expect(headers[0].textContent).toContain('Produk 1');
      expect(headers[1].textContent).toContain('Produk 2');
      expect(headers[2].textContent).toContain('Kriteria Perbandingan');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('product-comparison-empty-state');
      expect(emptyState.textContent).toContain('Hasil perbandingan produk akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi kedua produk dan klik Buat Perbandingan');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('product-comparison-loading');
      expect(loading.textContent).toContain('Sedang membuat perbandingan');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(3);
    });

    it('should have labeled form inputs', () => {
      const product1Name = document.getElementById('product-comparison-product1-name');
      expect(product1Name).toBeTruthy();
      
      const product1Desc = document.getElementById('product-comparison-product1-description');
      expect(product1Desc).toBeTruthy();
      
      const product1Price = document.getElementById('product-comparison-product1-price');
      expect(product1Price).toBeTruthy();
      
      const product1Features = document.getElementById('product-comparison-product1-features');
      expect(product1Features).toBeTruthy();
      
      const product2Name = document.getElementById('product-comparison-product2-name');
      expect(product2Name).toBeTruthy();
      
      const product2Desc = document.getElementById('product-comparison-product2-description');
      expect(product2Desc).toBeTruthy();
      
      const product2Price = document.getElementById('product-comparison-product2-price');
      expect(product2Price).toBeTruthy();
      
      const product2Features = document.getElementById('product-comparison-product2-features');
      expect(product2Features).toBeTruthy();
      
      const criteriaSelect = document.getElementById('product-comparison-criteria');
      expect(criteriaSelect).toBeTruthy();
    });

    it('should have proper labels for all inputs', () => {
      const product1NameLabel = document.querySelector('label[for="product-comparison-product1-name"]');
      expect(product1NameLabel).toBeTruthy();
      
      const product1DescLabel = document.querySelector('label[for="product-comparison-product1-description"]');
      expect(product1DescLabel).toBeTruthy();
      
      const product1PriceLabel = document.querySelector('label[for="product-comparison-product1-price"]');
      expect(product1PriceLabel).toBeTruthy();
      
      const product1FeaturesLabel = document.querySelector('label[for="product-comparison-product1-features"]');
      expect(product1FeaturesLabel).toBeTruthy();
      
      const product2NameLabel = document.querySelector('label[for="product-comparison-product2-name"]');
      expect(product2NameLabel).toBeTruthy();
      
      const product2DescLabel = document.querySelector('label[for="product-comparison-product2-description"]');
      expect(product2DescLabel).toBeTruthy();
      
      const product2PriceLabel = document.querySelector('label[for="product-comparison-product2-price"]');
      expect(product2PriceLabel).toBeTruthy();
      
      const product2FeaturesLabel = document.querySelector('label[for="product-comparison-product2-features"]');
      expect(product2FeaturesLabel).toBeTruthy();
      
      const criteriaLabel = document.querySelector('label[for="product-comparison-criteria"]');
      expect(criteriaLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('product-comparison-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const product1Name = document.getElementById('product-comparison-product1-name');
      expect(product1Name.type).toBe('text');
      
      const product1Price = document.getElementById('product-comparison-product1-price');
      expect(product1Price.type).toBe('number');
      
      const product2Name = document.getElementById('product-comparison-product2-name');
      expect(product2Name.type).toBe('text');
      
      const product2Price = document.getElementById('product-comparison-product2-price');
      expect(product2Price.type).toBe('number');
    });

    it('should have proper textarea elements', () => {
      const product1Desc = document.getElementById('product-comparison-product1-description');
      expect(product1Desc.tagName).toBe('TEXTAREA');
      
      const product1Features = document.getElementById('product-comparison-product1-features');
      expect(product1Features.tagName).toBe('TEXTAREA');
      
      const product2Desc = document.getElementById('product-comparison-product2-description');
      expect(product2Desc.tagName).toBe('TEXTAREA');
      
      const product2Features = document.getElementById('product-comparison-product2-features');
      expect(product2Features.tagName).toBe('TEXTAREA');
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
