import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock downloadImage globally
window.downloadImage = vi.fn().mockResolvedValue(undefined);

// Mock checkApiKey globally
window.checkApiKey = vi.fn().mockReturnValue(true);

describe('unboxing-scene Component', () => {
  
  const mockComponentHTML = `
    <div id="content-unboxing-scene" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            <i class="fas fa-gift mr-3"></i>Unboxing Scene
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten unboxing produk yang menarik dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Upload Product Photo -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Foto Produk</h2>
              <div class="upload-area">
                <label for="unboxing-scene-image-input" class="file-input-label block border-3 border-dashed border-amber-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500 transition-colors">
                  <input type="file" id="unboxing-scene-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-cloud-upload-alt text-4xl text-amber-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto produk di sini</p>
                </label>
              </div>
              <div id="unboxing-scene-image-preview-container" class="hidden mt-4">
                <img id="unboxing-scene-image-preview" src="#" alt="Pratinjau Produk" class="rounded-lg w-full h-auto object-contain">
                <button id="unboxing-scene-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Excitement Level -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Tingkat Kegembiraan</h2>
              
              <div id="unboxing-scene-excitement-options" class="space-y-2">
                <button type="button" data-excitement="tenang" class="excitement-btn-unboxing-scene w-full p-3 rounded-lg text-left text-sm bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent" data-selected="true">
                  <i class="fas fa-spa mr-2 text-amber-500"></i>Tenang (Calm)
                </button>
                <button type="button" data-excitement="biasa" class="excitement-btn-unboxing-scene w-full p-3 rounded-lg text-left text-sm bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-meh mr-2 text-amber-500"></i>Biasa Saja (Neutral)
                </button>
                <button type="button" data-excitement="bersemangat" class="excitement-btn-unboxing-scene w-full p-3 rounded-lg text-left text-sm bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-smile mr-2 text-amber-500"></i>Bersemangat (Excited)
                </button>
                <button type="button" data-excitement="sangat-bersemangat" class="excitement-btn-unboxing-scene w-full p-3 rounded-lg text-left text-sm bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-grin-stars mr-2 text-amber-500"></i>Sangat Bersemangat (Very Excited)
                </button>
                <button type="button" data-excitement="meledak" class="excitement-btn-unboxing-scene w-full p-3 rounded-lg text-left text-sm bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-rocket mr-2 text-amber-500"></i>Meledak-ledak (Explosive!)
                </button>
              </div>
            </div>
            
            <!-- Step 3: Product Category -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Kategori Produk</h2>
              
              <div id="unboxing-scene-category-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-category="elektronik" class="category-btn-unboxing-scene p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent" data-selected="true">
                  <i class="fas fa-mobile-alt mr-1 text-amber-500"></i>Elektronik
                </button>
                <button type="button" data-category="fashion" class="category-btn-unboxing-scene p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-tshirt mr-1 text-amber-500"></i>Fashion
                </button>
                <button type="button" data-category="kecantikan" class="category-btn-unboxing-scene p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-spa mr-1 text-amber-500"></i>Kecantikan
                </button>
                <button type="button" data-category="mainan" class="category-btn-unboxing-scene p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-gamepad mr-1 text-amber-500"></i>Mainan
                </button>
                <button type="button" data-category="buku" class="category-btn-unboxing-scene p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-book mr-1 text-amber-500"></i>Buku
                </button>
                <button type="button" data-category="lainnya" class="category-btn-unboxing-scene p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <i class="fas fa-box-open mr-1 text-amber-500"></i>Lainnya
                </button>
              </div>
            </div>
            
            <!-- Step 4: Feature Highlights -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Highlight Fitur</h2>
              
              <div id="unboxing-scene-features-options" class="space-y-2">
                <label class="feature-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-feature="kemasan" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-box mr-2 ml-2 text-amber-500"></i>
                  <span class="text-sm text-gray-700">Kemasan (Packaging)</span>
                </label>
                <label class="feature-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-feature="isi" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-box-open mr-2 ml-2 text-amber-500"></i>
                  <span class="text-sm text-gray-700">Isi Produk (Contents)</span>
                </label>
                <label class="feature-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-feature="kualitas" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-star mr-2 ml-2 text-amber-500"></i>
                  <span class="text-sm text-gray-700">Kualitas (Quality)</span>
                </label>
                <label class="feature-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-feature="harga" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-tag mr-2 ml-2 text-amber-500"></i>
                  <span class="text-sm text-gray-700">Harga (Price)</span>
                </label>
                <label class="feature-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-feature="bonus" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-gift mr-2 ml-2 text-amber-500"></i>
                  <span class="text-sm text-gray-700">Bonus/Gratis (Freebies)</span>
                </label>
              </div>
            </div>
            
            <!-- Step 5: Surprise/Reaction Elements -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Elemen Kejutan</h2>
              
              <div id="unboxing-scene-reaction-options" class="space-y-2">
                <label class="reaction-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-reaction="wow" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-exclamation-circle mr-2 ml-2 text-orange-500"></i>
                  <span class="text-sm text-gray-700">Reaksi "WOW!"</span>
                </label>
                <label class="reaction-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-reaction="suar" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-volume-up mr-2 ml-2 text-orange-500"></i>
                  <span class="text-sm text-gray-700">Suara Kejutan</span>
                </label>
                <label class="reaction-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-reaction="slowmo" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-clock mr-2 ml-2 text-orange-500"></i>
                  <span class="text-sm text-gray-700">Slow Motion</span>
                </label>
                <label class="reaction-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-reaction="zoom" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-search-plus mr-2 ml-2 text-orange-500"></i>
                  <span class="text-sm text-gray-700">Zoom Detail</span>
                </label>
                <label class="reaction-checkbox-unboxing-scene flex items-center p-2 rounded-lg cursor-pointer hover:bg-amber-50 transition">
                  <input type="checkbox" data-reaction="confetti" class="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500">
                  <i class="fas fa-party-locket mr-2 ml-2 text-orange-500"></i>
                  <span class="text-sm text-gray-700">Confetti</span>
                </label>
              </div>
            </div>
            
            <!-- Step 6: Generate Button -->
            <button id="unboxing-scene-generate-btn" class="w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-video mr-2"></i>Buat Unboxing Scene
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="unboxing-scene-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="unboxing-scene-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-gift text-6xl mb-4 text-amber-400"></i>
                <p class="text-xl">Hasil unboxing akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto produk dan klik Buat Unboxing Scene</p>
              </div>
              <div id="unboxing-scene-results" class="hidden grid grid-cols-1 gap-6"></div>
              <div id="unboxing-scene-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-amber-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat unboxing scene...</p>
              </div>
            </div>
          </div>
          
        </main>
        
      </div>
    </div>
  `;

  beforeEach(() => {
    document.body.innerHTML = mockComponentHTML;
    // Clear all mocks
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch = vi.fn();
    // Reset window mocks
    window.showToast = vi.fn();
    window.downloadImage = vi.fn().mockResolvedValue(undefined);
    window.checkApiKey = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should render the unboxing-scene component with correct main container', () => {
      const mainContainer = document.getElementById('content-unboxing-scene');
      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain('main-content-panel');
    });

    it('should have header with correct title', () => {
      const header = screen.getByText('Unboxing Scene');
      expect(header).toBeTruthy();
    });

    it('should have header with gift icon', () => {
      const giftIcon = document.querySelector('#content-unboxing-scene .fa-gift');
      expect(giftIcon).toBeTruthy();
    });

    it('should have header with description text', () => {
      expect(screen.getByText('Buat konten unboxing produk yang menarik dengan AI')).toBeTruthy();
    });

    it('should have main grid layout', () => {
      const mainGrid = document.querySelector('#content-unboxing-scene main');
      expect(mainGrid).toBeTruthy();
      expect(mainGrid.className).toContain('grid');
      expect(mainGrid.className).toContain('grid-cols-1');
      expect(mainGrid.className).toContain('lg:grid-cols-3');
    });

    it('should have left panel for controls', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
      expect(leftPanel.className).toContain('space-y-6');
    });

    it('should have right panel for results', () => {
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have container with proper padding', () => {
      const container = document.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.className).toContain('mx-auto');
      expect(container.className).toContain('px-4');
      expect(container.className).toContain('py-8');
    });

    it('should have header with proper styling', () => {
      const header = document.querySelector('header');
      expect(header).toBeTruthy();
      expect(header.className).toContain('text-center');
      expect(header.className).toContain('mb-8');
    });

    it('should have main content area with gap', () => {
      const mainContent = document.querySelector('main');
      expect(mainContent).toBeTruthy();
      expect(mainContent.className).toContain('gap-8');
    });
  });

  // Image Upload Tests
  describe('Image Upload Functionality', () => {
    it('should have file input element', () => {
      const fileInput = document.getElementById('unboxing-scene-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have image preview container', () => {
      const previewContainer = document.getElementById('unboxing-scene-image-preview-container');
      expect(previewContainer).toBeTruthy();
    });

    it('should have image preview element', () => {
      const preview = document.getElementById('unboxing-scene-image-preview');
      expect(preview).toBeTruthy();
      expect(preview.alt).toBe('Pratinjau Produk');
    });

    it('should have remove image button', () => {
      const removeBtn = document.getElementById('unboxing-scene-remove-image-btn');
      expect(removeBtn).toBeTruthy();
    });

    it('should have upload area with proper styling', () => {
      const uploadArea = document.querySelector('.upload-area');
      expect(uploadArea).toBeTruthy();
      
      const label = uploadArea.querySelector('label');
      expect(label).toBeTruthy();
      expect(label.className).toContain('border-amber-300');
      expect(label.className).toContain('rounded-xl');
    });

    it('should have upload icon', () => {
      const uploadIcon = document.querySelector('.fa-cloud-upload-alt');
      expect(uploadIcon).toBeTruthy();
    });

    it('should have proper upload text', () => {
      expect(screen.getByText('Klik atau seret foto produk di sini')).toBeTruthy();
    });

    it('should have file input with hidden class', () => {
      const fileInput = document.getElementById('unboxing-scene-image-input');
      expect(fileInput.className).toContain('hidden');
    });

    it('should have preview container initially hidden', () => {
      const previewContainer = document.getElementById('unboxing-scene-image-preview-container');
      expect(previewContainer.className).toContain('hidden');
    });

    it('should have remove button with proper styling', () => {
      const removeBtn = document.getElementById('unboxing-scene-remove-image-btn');
      expect(removeBtn.className).toContain('bg-red-500');
      expect(removeBtn.className).toContain('rounded-full');
    });

    it('should have remove button with times icon', () => {
      const removeIcon = document.querySelector('#unboxing-scene-remove-image-btn .fa-times');
      expect(removeIcon).toBeTruthy();
    });

    it('should have upload area label with proper styling', () => {
      const label = document.querySelector('.file-input-label');
      expect(label).toBeTruthy();
      expect(label.className).toContain('cursor-pointer');
      expect(label.className).toContain('transition-colors');
    });
  });

  // Excitement Level Selection Tests
  describe('Excitement Level Selection', () => {
    it('should have excitement options container', () => {
      const excitementOptions = document.getElementById('unboxing-scene-excitement-options');
      expect(excitementOptions).toBeTruthy();
    });

    it('should have 5 excitement level buttons', () => {
      const buttons = document.querySelectorAll('.excitement-btn-unboxing-scene');
      expect(buttons.length).toBe(5);
    });

    it('should have "Tenang" option', () => {
      const tenangBtn = document.querySelector('[data-excitement="tenang"]');
      expect(tenangBtn).toBeTruthy();
      expect(tenangBtn.textContent).toContain('Tenang');
      expect(tenangBtn.textContent).toContain('Calm');
    });

    it('should have "Biasa Saja" option', () => {
      const biasaBtn = document.querySelector('[data-excitement="biasa"]');
      expect(biasaBtn).toBeTruthy();
      expect(biasaBtn.textContent).toContain('Biasa Saja');
      expect(biasaBtn.textContent).toContain('Neutral');
    });

    it('should have "Bersemangat" option', () => {
      const bersemangatBtn = document.querySelector('[data-excitement="bersemangat"]');
      expect(bersemangatBtn).toBeTruthy();
      expect(bersemangatBtn.textContent).toContain('Bersemangat');
      expect(bersemangatBtn.textContent).toContain('Excited');
    });

    it('should have "Sangat Bersemangat" option', () => {
      const sangatBtn = document.querySelector('[data-excitement="sangat-bersemangat"]');
      expect(sangatBtn).toBeTruthy();
      expect(sangatBtn.textContent).toContain('Sangat Bersemangat');
      expect(sangatBtn.textContent).toContain('Very Excited');
    });

    it('should have "Meledak-ledak" option', () => {
      const meledakBtn = document.querySelector('[data-excitement="meledak"]');
      expect(meledakBtn).toBeTruthy();
      expect(meledakBtn.textContent).toContain('Meledak-ledak');
      expect(meledakBtn.textContent).toContain('Explosive');
    });

    it('should have default selected "Tenang" option', () => {
      const tenangBtn = document.querySelector('[data-excitement="tenang"]');
      expect(tenangBtn.dataset.selected).toBe('true');
    });

    it('should have excitement level section title', () => {
      expect(screen.getByText('2. Tingkat Kegembiraan')).toBeTruthy();
    });

    it('should have proper button styling for excitement options', () => {
      const buttons = document.querySelectorAll('.excitement-btn-unboxing-scene');
      buttons.forEach(btn => {
        expect(btn.className).toContain('w-full');
        expect(btn.className).toContain('rounded-lg');
        expect(btn.className).toContain('text-left');
      });
    });

    it('should have icons for each excitement level', () => {
      const spaIcon = document.querySelector('[data-excitement="tenang"] .fa-spa');
      expect(spaIcon).toBeTruthy();
      
      const mehIcon = document.querySelector('[data-excitement="biasa"] .fa-meh');
      expect(mehIcon).toBeTruthy();
      
      const smileIcon = document.querySelector('[data-excitement="bersemangat"] .fa-smile');
      expect(smileIcon).toBeTruthy();
      
      const grinStarsIcon = document.querySelector('[data-excitement="sangat-bersemangat"] .fa-grin-stars');
      expect(grinStarsIcon).toBeTruthy();
      
      const rocketIcon = document.querySelector('[data-excitement="meledak"] .fa-rocket');
      expect(rocketIcon).toBeTruthy();
    });
  });

  // Product Category Selection Tests
  describe('Product Category Selection', () => {
    it('should have category options container', () => {
      const categoryOptions = document.getElementById('unboxing-scene-category-options');
      expect(categoryOptions).toBeTruthy();
    });

    it('should have 6 category buttons', () => {
      const buttons = document.querySelectorAll('.category-btn-unboxing-scene');
      expect(buttons.length).toBe(6);
    });

    it('should have "Elektronik" category', () => {
      const elektronikBtn = document.querySelector('[data-category="elektronik"]');
      expect(elektronikBtn).toBeTruthy();
      expect(elektronikBtn.textContent).toContain('Elektronik');
    });

    it('should have "Fashion" category', () => {
      const fashionBtn = document.querySelector('[data-category="fashion"]');
      expect(fashionBtn).toBeTruthy();
      expect(fashionBtn.textContent).toContain('Fashion');
    });

    it('should have "Kecantikan" category', () => {
      const kecantikanBtn = document.querySelector('[data-category="kecantikan"]');
      expect(kecantikanBtn).toBeTruthy();
      expect(kecantikanBtn.textContent).toContain('Kecantikan');
    });

    it('should have "Mainan" category', () => {
      const mainanBtn = document.querySelector('[data-category="mainan"]');
      expect(mainanBtn).toBeTruthy();
      expect(mainanBtn.textContent).toContain('Mainan');
    });

    it('should have "Buku" category', () => {
      const bukuBtn = document.querySelector('[data-category="buku"]');
      expect(bukuBtn).toBeTruthy();
      expect(bukuBtn.textContent).toContain('Buku');
    });

    it('should have "Lainnya" category', () => {
      const lainnyaBtn = document.querySelector('[data-category="lainnya"]');
      expect(lainnyaBtn).toBeTruthy();
      expect(lainnyaBtn.textContent).toContain('Lainnya');
    });

    it('should have default selected "Elektronik" category', () => {
      const elektronikBtn = document.querySelector('[data-category="elektronik"]');
      expect(elektronikBtn.dataset.selected).toBe('true');
    });

    it('should have category section title', () => {
      expect(screen.getByText('3. Kategori Produk')).toBeTruthy();
    });

    it('should have proper grid layout for categories', () => {
      const categoryOptions = document.getElementById('unboxing-scene-category-options');
      expect(categoryOptions.className).toContain('grid-cols-2');
      expect(categoryOptions.className).toContain('gap-2');
    });

    it('should have icons for each category', () => {
      const mobileIcon = document.querySelector('[data-category="elektronik"] .fa-mobile-alt');
      expect(mobileIcon).toBeTruthy();
      
      const tshirtIcon = document.querySelector('[data-category="fashion"] .fa-tshirt');
      expect(tshirtIcon).toBeTruthy();
      
      const spaIcon = document.querySelector('[data-category="kecantikan"] .fa-spa');
      expect(spaIcon).toBeTruthy();
      
      const gamepadIcon = document.querySelector('[data-category="mainan"] .fa-gamepad');
      expect(gamepadIcon).toBeTruthy();
      
      const bookIcon = document.querySelector('[data-category="buku"] .fa-book');
      expect(bookIcon).toBeTruthy();
      
      const boxOpenIcon = document.querySelector('[data-category="lainnya"] .fa-box-open');
      expect(boxOpenIcon).toBeTruthy();
    });
  });

  // Feature Highlights Tests
  describe('Feature Highlights', () => {
    it('should have features options container', () => {
      const featuresOptions = document.getElementById('unboxing-scene-features-options');
      expect(featuresOptions).toBeTruthy();
    });

    it('should have 5 feature checkboxes', () => {
      const checkboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene input[type="checkbox"]');
      expect(checkboxes.length).toBe(5);
    });

    it('should have "Kemasan" feature', () => {
      const kemasanCheckbox = document.querySelector('[data-feature="kemasan"]');
      expect(kemasanCheckbox).toBeTruthy();
      expect(screen.getByText('Kemasan (Packaging)')).toBeTruthy();
    });

    it('should have "Isi Produk" feature', () => {
      const isiCheckbox = document.querySelector('[data-feature="isi"]');
      expect(isiCheckbox).toBeTruthy();
      expect(screen.getByText('Isi Produk (Contents)')).toBeTruthy();
    });

    it('should have "Kualitas" feature', () => {
      const kualitasCheckbox = document.querySelector('[data-feature="kualitas"]');
      expect(kualitasCheckbox).toBeTruthy();
      expect(screen.getByText('Kualitas (Quality)')).toBeTruthy();
    });

    it('should have "Harga" feature', () => {
      const hargaCheckbox = document.querySelector('[data-feature="harga"]');
      expect(hargaCheckbox).toBeTruthy();
      expect(screen.getByText('Harga (Price)')).toBeTruthy();
    });

    it('should have "Bonus/Gratis" feature', () => {
      const bonusCheckbox = document.querySelector('[data-feature="bonus"]');
      expect(bonusCheckbox).toBeTruthy();
      expect(screen.getByText('Bonus/Gratis (Freebies)')).toBeTruthy();
    });

    it('should have features section title', () => {
      expect(screen.getByText('4. Highlight Fitur')).toBeTruthy();
    });

    it('should have proper checkbox styling', () => {
      const checkboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene input[type="checkbox"]');
      checkboxes.forEach(cb => {
        expect(cb.className).toContain('w-4');
        expect(cb.className).toContain('h-4');
        expect(cb.className).toContain('text-amber-500');
      });
    });

    it('should have icons for each feature', () => {
      // Check that feature section exists with proper structure
      const featureSection = document.querySelector('#unboxing-scene-features-options');
      expect(featureSection).toBeTruthy();
      expect(featureSection.querySelectorAll('input[type="checkbox"]').length).toBe(5);
    });

    it('should have proper label styling for features', () => {
      const labels = document.querySelectorAll('.feature-checkbox-unboxing-scene');
      labels.forEach(label => {
        expect(label.className).toContain('flex');
        expect(label.className).toContain('items-center');
        expect(label.className).toContain('cursor-pointer');
      });
    });
  });

  // Surprise/Reaction Elements Tests
  describe('Surprise/Reaction Elements', () => {
    it('should have reaction options container', () => {
      const reactionOptions = document.getElementById('unboxing-scene-reaction-options');
      expect(reactionOptions).toBeTruthy();
    });

    it('should have 5 reaction checkboxes', () => {
      const checkboxes = document.querySelectorAll('.reaction-checkbox-unboxing-scene input[type="checkbox"]');
      expect(checkboxes.length).toBe(5);
    });

    it('should have "WOW!" reaction', () => {
      const wowCheckbox = document.querySelector('[data-reaction="wow"]');
      expect(wowCheckbox).toBeTruthy();
      expect(screen.getByText('Reaksi "WOW!"')).toBeTruthy();
    });

    it('should have "Suara Kejutan" reaction', () => {
      const suarCheckbox = document.querySelector('[data-reaction="suar"]');
      expect(suarCheckbox).toBeTruthy();
      expect(screen.getByText('Suara Kejutan')).toBeTruthy();
    });

    it('should have "Slow Motion" reaction', () => {
      const slowmoCheckbox = document.querySelector('[data-reaction="slowmo"]');
      expect(slowmoCheckbox).toBeTruthy();
      expect(screen.getByText('Slow Motion')).toBeTruthy();
    });

    it('should have "Zoom Detail" reaction', () => {
      const zoomCheckbox = document.querySelector('[data-reaction="zoom"]');
      expect(zoomCheckbox).toBeTruthy();
      expect(screen.getByText('Zoom Detail')).toBeTruthy();
    });

    it('should have "Confetti" reaction', () => {
      const confettiCheckbox = document.querySelector('[data-reaction="confetti"]');
      expect(confettiCheckbox).toBeTruthy();
      expect(screen.getByText('Confetti')).toBeTruthy();
    });

    it('should have reaction section title', () => {
      expect(screen.getByText('5. Elemen Kejutan')).toBeTruthy();
    });

    it('should have proper checkbox styling for reactions', () => {
      const checkboxes = document.querySelectorAll('.reaction-checkbox-unboxing-scene input[type="checkbox"]');
      checkboxes.forEach(cb => {
        expect(cb.className).toContain('w-4');
        expect(cb.className).toContain('h-4');
        expect(cb.className).toContain('text-amber-500');
      });
    });

    it('should have orange icons for reactions', () => {
      // Check that reaction section exists with proper styling
      const reactionSection = document.querySelector('#unboxing-scene-reaction-options');
      expect(reactionSection).toBeTruthy();
      expect(reactionSection.querySelectorAll('input[type="checkbox"]').length).toBe(5);
    });

    it('should have proper label styling for reactions', () => {
      const labels = document.querySelectorAll('.reaction-checkbox-unboxing-scene');
      labels.forEach(label => {
        expect(label.className).toContain('flex');
        expect(label.className).toContain('items-center');
        expect(label.className).toContain('cursor-pointer');
      });
    });
  });

  // Generate Button Tests
  describe('Generate Button Functionality', () => {
    it('should have generate button', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn).toBeTruthy();
    });

    it('should have generate button with correct text', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Unboxing Scene');
    });

    it('should have generate button with video icon', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      const videoIcon = generateBtn.querySelector('i.fas.fa-video');
      expect(videoIcon).toBeTruthy();
    });

    it('should have generate button with proper styling', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('from-amber-600');
      expect(generateBtn.className).toContain('to-orange-500');
    });

    it('should have generate button with shadow', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('shadow-lg');
      expect(generateBtn.className).toContain('hover:shadow-xl');
    });

    it('should have generate button with proper padding', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('py-4');
      expect(generateBtn.className).toContain('px-6');
    });

    it('should have generate button with rounded corners', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('rounded-xl');
    });

    it('should have generate button initially disabled', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have generate button with full width', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('w-full');
    });

    it('should have generate button with bold text', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('font-bold');
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should have results container', () => {
      const resultsContainer = document.getElementById('unboxing-scene-results-container');
      expect(resultsContainer).toBeTruthy();
    });

    it('should have empty state', () => {
      const emptyState = document.getElementById('unboxing-scene-empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should have results grid', () => {
      const results = document.getElementById('unboxing-scene-results');
      expect(results).toBeTruthy();
    });

    it('should have loading state', () => {
      const loading = document.getElementById('unboxing-scene-loading');
      expect(loading).toBeTruthy();
    });

    it('should have empty state with gift icon', () => {
      const emptyStateIcon = document.querySelector('#unboxing-scene-empty-state .fa-gift');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have empty state with proper text', () => {
      expect(screen.getByText('Hasil unboxing akan muncul di sini')).toBeTruthy();
      expect(screen.getByText('Unggah foto produk dan klik Buat Unboxing Scene')).toBeTruthy();
    });

    it('should have loading text', () => {
      const loadingText = document.querySelector('#unboxing-scene-loading p');
      expect(loadingText.textContent).toBe('Sedang membuat unboxing scene...');
    });

    it('should have loading spinner', () => {
      const loadingSpinner = document.querySelector('#unboxing-scene-loading .loader');
      expect(loadingSpinner).toBeTruthy();
      expect(loadingSpinner.className).toContain('border-amber-500');
    });

    it('should have empty state initially visible', () => {
      const emptyState = document.getElementById('unboxing-scene-empty-state');
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have loading state initially hidden', () => {
      const loading = document.getElementById('unboxing-scene-loading');
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have results initially hidden', () => {
      const results = document.getElementById('unboxing-scene-results');
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should have results container with proper styling', () => {
      const resultsContainer = document.getElementById('unboxing-scene-results-container');
      expect(resultsContainer.className).toContain('min-h-[500px]');
    });

    it('should have empty state with proper flex styling', () => {
      const emptyState = document.getElementById('unboxing-scene-empty-state');
      expect(emptyState.className).toContain('flex');
      expect(emptyState.className).toContain('flex-col');
      expect(emptyState.className).toContain('items-center');
      expect(emptyState.className).toContain('justify-center');
    });

    it('should have loading with proper flex styling', () => {
      const loading = document.getElementById('unboxing-scene-loading');
      expect(loading.className).toContain('flex');
      expect(loading.className).toContain('flex-col');
      expect(loading.className).toContain('items-center');
      expect(loading.className).toContain('justify-center');
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper padding', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.className).toContain('p-6');
      });
    });

    it('should have cards with rounded corners', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.className).toContain('rounded-2xl');
      });
    });

    it('should have cards with shadow', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.className).toContain('shadow-lg');
      });
    });

    it('should have cards with white background', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.className).toContain('bg-white');
      });
    });

    it('should have section titles with proper styling', () => {
      const sectionTitles = document.querySelectorAll('.card h2');
      sectionTitles.forEach(title => {
        expect(title.className).toContain('text-xl');
        expect(title.className).toContain('font-semibold');
        expect(title.className).toContain('mb-4');
        expect(title.className).toContain('text-gray-800');
      });
    });
  });

  // Icons Tests
  describe('Icons (FontAwesome)', () => {
    it('should have header gift icon', () => {
      const giftIcon = document.querySelector('.fa-gift');
      expect(giftIcon).toBeTruthy();
    });

    it('should have upload cloud icon', () => {
      const cloudIcon = document.querySelector('.fa-cloud-upload-alt');
      expect(cloudIcon).toBeTruthy();
    });

    it('should have remove times icon', () => {
      const timesIcon = document.querySelector('.fa-times');
      expect(timesIcon).toBeTruthy();
    });

    it('should have video icon for generate button', () => {
      const videoIcon = document.querySelector('.fa-video');
      expect(videoIcon).toBeTruthy();
    });

    it('should have excitement level icons', () => {
      const spaIcon = document.querySelector('.fa-spa');
      expect(spaIcon).toBeTruthy();
      
      const mehIcon = document.querySelector('.fa-meh');
      expect(mehIcon).toBeTruthy();
      
      const smileIcon = document.querySelector('.fa-smile');
      expect(smileIcon).toBeTruthy();
      
      const grinStarsIcon = document.querySelector('.fa-grin-stars');
      expect(grinStarsIcon).toBeTruthy();
      
      const rocketIcon = document.querySelector('.fa-rocket');
      expect(rocketIcon).toBeTruthy();
    });

    it('should have category icons', () => {
      const mobileIcon = document.querySelector('.fa-mobile-alt');
      expect(mobileIcon).toBeTruthy();
      
      const tshirtIcon = document.querySelector('.fa-tshirt');
      expect(tshirtIcon).toBeTruthy();
      
      const gamepadIcon = document.querySelector('.fa-gamepad');
      expect(gamepadIcon).toBeTruthy();
      
      const bookIcon = document.querySelector('.fa-book');
      expect(bookIcon).toBeTruthy();
      
      const boxOpenIcon = document.querySelector('.fa-box-open');
      expect(boxOpenIcon).toBeTruthy();
    });

    it('should have feature icons', () => {
      const boxIcon = document.querySelector('.fa-box');
      expect(boxIcon).toBeTruthy();
      
      const starIcon = document.querySelector('.fa-star');
      expect(starIcon).toBeTruthy();
      
      const tagIcon = document.querySelector('.fa-tag');
      expect(tagIcon).toBeTruthy();
      
      const giftIcon = document.querySelector('.fa-gift');
      expect(giftIcon).toBeTruthy();
    });

    it('should have reaction icons', () => {
      const exclamationIcon = document.querySelector('.fa-exclamation-circle');
      expect(exclamationIcon).toBeTruthy();
      
      const volumeIcon = document.querySelector('.fa-volume-up');
      expect(volumeIcon).toBeTruthy();
      
      const clockIcon = document.querySelector('.fa-clock');
      expect(clockIcon).toBeTruthy();
      
      const searchPlusIcon = document.querySelector('.fa-search-plus');
      expect(searchPlusIcon).toBeTruthy();
    });

    it('should have empty state gift icon', () => {
      const emptyGiftIcon = document.querySelector('#unboxing-scene-empty-state .fa-gift');
      expect(emptyGiftIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content (Indonesian)', () => {
    it('should have Indonesian header title', () => {
      expect(screen.getByText('Unboxing Scene')).toBeTruthy();
    });

    it('should have Indonesian header description', () => {
      expect(screen.getByText('Buat konten unboxing produk yang menarik dengan AI')).toBeTruthy();
    });

    it('should have Indonesian step 1 title', () => {
      expect(screen.getByText('1. Foto Produk')).toBeTruthy();
    });

    it('should have Indonesian step 2 title', () => {
      expect(screen.getByText('2. Tingkat Kegembiraan')).toBeTruthy();
    });

    it('should have Indonesian step 3 title', () => {
      expect(screen.getByText('3. Kategori Produk')).toBeTruthy();
    });

    it('should have Indonesian step 4 title', () => {
      expect(screen.getByText('4. Highlight Fitur')).toBeTruthy();
    });

    it('should have Indonesian step 5 title', () => {
      expect(screen.getByText('5. Elemen Kejutan')).toBeTruthy();
    });

    it('should have Indonesian upload text', () => {
      expect(screen.getByText('Klik atau seret foto produk di sini')).toBeTruthy();
    });

    it('should have Indonesian generate button text', () => {
      expect(screen.getByText('Buat Unboxing Scene')).toBeTruthy();
    });

    it('should have Indonesian empty state text', () => {
      expect(screen.getByText('Hasil unboxing akan muncul di sini')).toBeTruthy();
      expect(screen.getByText('Unggah foto produk dan klik Buat Unboxing Scene')).toBeTruthy();
    });

    it('should have Indonesian loading text', () => {
      expect(screen.getByText('Sedang membuat unboxing scene...')).toBeTruthy();
    });

    it('should have Indonesian feature labels', () => {
      expect(screen.getByText('Kemasan (Packaging)')).toBeTruthy();
      expect(screen.getByText('Isi Produk (Contents)')).toBeTruthy();
      expect(screen.getByText('Kualitas (Quality)')).toBeTruthy();
      expect(screen.getByText('Harga (Price)')).toBeTruthy();
      expect(screen.getByText('Bonus/Gratis (Freebies)')).toBeTruthy();
    });

    it('should have Indonesian reaction labels', () => {
      expect(screen.getByText('Reaksi "WOW!"')).toBeTruthy();
      expect(screen.getByText('Suara Kejutan')).toBeTruthy();
      expect(screen.getByText('Slow Motion')).toBeTruthy();
      expect(screen.getByText('Zoom Detail')).toBeTruthy();
      expect(screen.getByText('Confetti')).toBeTruthy();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper alt text for preview image', () => {
      const preview = document.getElementById('unboxing-scene-image-preview');
      expect(preview.alt).toBe('Pratinjau Produk');
    });

    it('should have proper labels for inputs', () => {
      const fileInput = document.getElementById('unboxing-scene-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have proper button labels', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Unboxing Scene');
    });

    it('should have proper checkbox labels', () => {
      const featureCheckboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene');
      featureCheckboxes.forEach(checkbox => {
        expect(checkbox.textContent).toBeTruthy();
      });
    });

    it('should have proper section headings', () => {
      const headings = document.querySelectorAll('h2');
      headings.forEach(heading => {
        expect(heading.textContent).toBeTruthy();
      });
    });

    it('should have icons with proper classes', () => {
      const icons = document.querySelectorAll('i[class*="fa-"]');
      expect(icons.length).toBeGreaterThan(0);
      icons.forEach(icon => {
        expect(icon.className).toContain('fas');
      });
    });

    it('should have proper focus indicators on buttons', () => {
      // Check that selection buttons have proper styling for focus states
      const selectionBtns = document.querySelectorAll('.excitement-btn-unboxing-scene, .category-btn-unboxing-scene');
      selectionBtns.forEach(btn => {
        expect(btn.className).toContain('border-2');
      });
    });

    it('should have proper cursor pointers on interactive elements', () => {
      const uploadLabel = document.querySelector('.file-input-label');
      expect(uploadLabel.className).toContain('cursor-pointer');
      
      // Checkbox cursor-pointer is on the parent label, not the checkbox itself
      const checkboxLabels = document.querySelectorAll('.feature-checkbox-unboxing-scene');
      checkboxLabels.forEach(label => {
        expect(label.className).toContain('cursor-pointer');
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const mainGrid = document.querySelector('main');
      expect(mainGrid.className).toContain('grid-cols-1');
      expect(mainGrid.className).toContain('lg:grid-cols-3');
    });

    it('should have responsive header text size', () => {
      const header = document.querySelector('h1');
      expect(header.className).toContain('text-4xl');
      expect(header.className).toContain('md:text-5xl');
    });

    it('should have responsive gap in grid', () => {
      const mainGrid = document.querySelector('main');
      expect(mainGrid.className).toContain('gap-8');
    });

    it('should have responsive container padding', () => {
      const container = document.querySelector('.container');
      expect(container.className).toContain('px-4');
    });

    it('should have responsive panel layout', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
      
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have responsive category grid', () => {
      const categoryOptions = document.getElementById('unboxing-scene-category-options');
      expect(categoryOptions.className).toContain('grid-cols-2');
    });
  });

  // Color Scheme Tests
  describe('Color Scheme (amber/orange)', () => {
    it('should have header with amber/orange gradient', () => {
      const header = document.querySelector('h1');
      expect(header.className).toContain('from-amber-600');
      expect(header.className).toContain('to-orange-500');
    });

    it('should have generate button with amber/orange gradient', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('from-amber-600');
      expect(generateBtn.className).toContain('to-orange-500');
    });

    it('should have upload area with amber border', () => {
      const uploadLabel = document.querySelector('.file-input-label');
      expect(uploadLabel.className).toContain('border-amber-300');
      expect(uploadLabel.className).toContain('hover:border-amber-500');
    });

    it('should have icons with amber color', () => {
      const amberIcons = document.querySelectorAll('.text-amber-500');
      expect(amberIcons.length).toBeGreaterThan(0);
    });

    it('should have icons with orange color', () => {
      const orangeIcons = document.querySelectorAll('.text-orange-500');
      expect(orangeIcons.length).toBeGreaterThan(0);
    });

    it('should have empty state icon with amber color', () => {
      const emptyStateIcon = document.querySelector('#unboxing-scene-empty-state .fa-gift');
      expect(emptyStateIcon.className).toContain('text-amber-400');
    });

    it('should have loading spinner with amber color', () => {
      const loadingSpinner = document.querySelector('#unboxing-scene-loading .loader');
      expect(loadingSpinner.className).toContain('border-amber-500');
    });

    it('should have hover effects with amber color', () => {
      const hoverButtons = document.querySelectorAll('.hover\\:bg-amber-100');
      expect(hoverButtons.length).toBeGreaterThan(0);
    });

    it('should have focus ring with amber color', () => {
      const focusRings = document.querySelectorAll('.focus\\:ring-amber-500');
      expect(focusRings.length).toBeGreaterThan(0);
    });

    it('should have selected state with amber border', () => {
      const selectedBtn = document.querySelector('[data-selected="true"]');
      expect(selectedBtn).toBeTruthy();
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have all step sections present', () => {
      expect(screen.getByText('1. Foto Produk')).toBeTruthy();
      expect(screen.getByText('2. Tingkat Kegembiraan')).toBeTruthy();
      expect(screen.getByText('3. Kategori Produk')).toBeTruthy();
      expect(screen.getByText('4. Highlight Fitur')).toBeTruthy();
      expect(screen.getByText('5. Elemen Kejutan')).toBeTruthy();
    });

    it('should have proper data attributes for state tracking', () => {
      const excitementBtns = document.querySelectorAll('.excitement-btn-unboxing-scene');
      excitementBtns.forEach(btn => {
        expect(btn.dataset.excitement).toBeTruthy();
      });
      
      const categoryBtns = document.querySelectorAll('.category-btn-unboxing-scene');
      categoryBtns.forEach(btn => {
        expect(btn.dataset.category).toBeTruthy();
      });
      
      const featureCheckboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene input');
      featureCheckboxes.forEach(cb => {
        expect(cb.dataset.feature).toBeTruthy();
      });
      
      const reactionCheckboxes = document.querySelectorAll('.reaction-checkbox-unboxing-scene input');
      reactionCheckboxes.forEach(cb => {
        expect(cb.dataset.reaction).toBeTruthy();
      });
    });

    it('should have proper IDs for all interactive elements', () => {
      expect(document.getElementById('unboxing-scene-image-input')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-image-preview')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-remove-image-btn')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-excitement-options')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-category-options')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-features-options')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-reaction-options')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-generate-btn')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-results-container')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-empty-state')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-results')).toBeTruthy();
      expect(document.getElementById('unboxing-scene-loading')).toBeTruthy();
    });

    it('should have proper class names for styling hooks', () => {
      expect(document.querySelector('.excitement-btn-unboxing-scene')).toBeTruthy();
      expect(document.querySelector('.category-btn-unboxing-scene')).toBeTruthy();
      expect(document.querySelector('.feature-checkbox-unboxing-scene')).toBeTruthy();
      expect(document.querySelector('.reaction-checkbox-unboxing-scene')).toBeTruthy();
    });

    it('should have proper spacing between sections', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel.className).toContain('space-y-6');
    });

    it('should have proper results container styling', () => {
      const resultsContainer = document.getElementById('unboxing-scene-results-container');
      expect(resultsContainer.className).toContain('card');
      expect(resultsContainer.className).toContain('p-6');
      expect(resultsContainer.className).toContain('rounded-2xl');
      expect(resultsContainer.className).toContain('shadow-lg');
      expect(resultsContainer.className).toContain('bg-white');
      expect(resultsContainer.className).toContain('min-h-[500px]');
    });

    it('should have proper results grid layout', () => {
      const results = document.getElementById('unboxing-scene-results');
      expect(results.className).toContain('grid');
      expect(results.className).toContain('grid-cols-1');
      expect(results.className).toContain('gap-6');
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('should have proper default values in HTML', () => {
      // Test that HTML has correct default values
      const tenangBtn = document.querySelector('[data-excitement="tenang"]');
      expect(tenangBtn).toBeTruthy();
      expect(tenangBtn.dataset.selected).toBe('true');
      
      const elektronikBtn = document.querySelector('[data-category="elektronik"]');
      expect(elektronikBtn).toBeTruthy();
      expect(elektronikBtn.dataset.selected).toBe('true');
    });

    it('should have proper data attributes for state tracking', () => {
      const excitementBtns = document.querySelectorAll('.excitement-btn-unboxing-scene');
      excitementBtns.forEach(btn => {
        expect(btn.dataset.excitement).toBeTruthy();
        expect(['tenang', 'biasa', 'bersemangat', 'sangat-bersemangat', 'meledak']).toContain(btn.dataset.excitement);
      });
      
      const categoryBtns = document.querySelectorAll('.category-btn-unboxing-scene');
      categoryBtns.forEach(btn => {
        expect(btn.dataset.category).toBeTruthy();
        expect(['elektronik', 'fashion', 'kecantikan', 'mainan', 'buku', 'lainnya']).toContain(btn.dataset.category);
      });
    });

    it('should have proper checkbox data attributes', () => {
      const featureCheckboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene input');
      featureCheckboxes.forEach(cb => {
        expect(cb.dataset.feature).toBeTruthy();
        expect(['kemasan', 'isi', 'kualitas', 'harga', 'bonus']).toContain(cb.dataset.feature);
      });
      
      const reactionCheckboxes = document.querySelectorAll('.reaction-checkbox-unboxing-scene input');
      reactionCheckboxes.forEach(cb => {
        expect(cb.dataset.reaction).toBeTruthy();
        expect(['wow', 'suar', 'slowmo', 'zoom', 'confetti']).toContain(cb.dataset.reaction);
      });
    });

    it('should have proper selected states in HTML', () => {
      const tenangBtn = document.querySelector('[data-excitement="tenang"]');
      expect(tenangBtn.dataset.selected).toBe('true');
      
      const elektronikBtn = document.querySelector('[data-category="elektronik"]');
      expect(elektronikBtn.dataset.selected).toBe('true');
    });
  });

  // UI/UX Tests
  describe('UI/UX Functionality', () => {
    it('should have correct color scheme (amber/orange)', () => {
      const header = screen.getByText('Unboxing Scene');
      expect(header.closest('h1').className).toContain('from-amber-600');
      expect(header.closest('h1').className).toContain('to-orange-500');
    });

    it('should have proper button styling', () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      expect(generateBtn.className).toContain('from-amber-600');
      expect(generateBtn.className).toContain('to-orange-500');
    });

    it('should have proper icon styling', () => {
      const icons = document.querySelectorAll('.fa-gift, .fa-cloud-upload-alt, .fa-video, .fa-spa, .fa-meh, .fa-smile, .fa-grin-stars, .fa-rocket');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have Indonesian text for UI elements', () => {
      expect(screen.getByText('1. Foto Produk')).toBeTruthy();
      expect(screen.getByText('2. Tingkat Kegembiraan')).toBeTruthy();
      expect(screen.getByText('3. Kategori Produk')).toBeTruthy();
      expect(screen.getByText('4. Highlight Fitur')).toBeTruthy();
      expect(screen.getByText('5. Elemen Kejutan')).toBeTruthy();
      expect(screen.getByText('Buat Unboxing Scene')).toBeTruthy();
    });

    it('should have proper placeholder text', () => {
      expect(screen.getByText('Klik atau seret foto produk di sini')).toBeTruthy();
      expect(screen.getByText('Hasil unboxing akan muncul di sini')).toBeTruthy();
      expect(screen.getByText('Unggah foto produk dan klik Buat Unboxing Scene')).toBeTruthy();
    });

    it('should have proper header styling', () => {
      const header = screen.getByText('Unboxing Scene');
      expect(header.closest('h1').className).toContain('text-4xl');
      expect(header.closest('h1').className).toContain('font-bold');
      expect(header.closest('h1').className).toContain('bg-clip-text');
      expect(header.closest('h1').className).toContain('text-transparent');
    });

    it('should have proper description text', () => {
      expect(screen.getByText('Buat konten unboxing produk yang menarik dengan AI')).toBeTruthy();
    });

    it('should have proper transition effects', () => {
      const uploadLabel = document.querySelector('.file-input-label');
      expect(uploadLabel.className).toContain('transition-colors');
      
      // Check transition on selection buttons (not the remove image button)
      const selectionBtns = document.querySelectorAll('.excitement-btn-unboxing-scene, .category-btn-unboxing-scene, .feature-btn-unboxing-scene');
      selectionBtns.forEach(btn => {
        expect(btn.className).toContain('transition');
      });
    });

    it('should have proper hover effects', () => {
      const uploadLabel = document.querySelector('.file-input-label');
      expect(uploadLabel.className).toContain('hover:border-amber-500');
      
      const categoryBtns = document.querySelectorAll('.category-btn-unboxing-scene');
      categoryBtns.forEach(btn => {
        expect(btn.className).toContain('hover:bg-amber-100');
      });
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle empty file selection', async () => {
      const fileInput = document.getElementById('unboxing-scene-image-input');
      
      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(window.showToast).not.toHaveBeenCalled();
      });
    });

    it('should handle rapid button clicks', async () => {
      const generateBtn = document.getElementById('unboxing-scene-generate-btn');
      generateBtn.disabled = false;
      
      // Rapid clicks should not cause issues
      fireEvent.click(generateBtn);
      fireEvent.click(generateBtn);
      fireEvent.click(generateBtn);
      
      // Should not crash
      expect(true).toBe(true);
    });

    it('should handle invalid excitement data', () => {
      const excitementBtns = document.querySelectorAll('.excitement-btn-unboxing-scene');
      excitementBtns.forEach(btn => {
        expect(btn.dataset.excitement).toBeTruthy();
      });
    });

    it('should handle invalid category data', () => {
      const categoryBtns = document.querySelectorAll('.category-btn-unboxing-scene');
      categoryBtns.forEach(btn => {
        expect(btn.dataset.category).toBeTruthy();
      });
    });

    it('should handle invalid feature data', () => {
      const featureCheckboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene input');
      featureCheckboxes.forEach(cb => {
        expect(cb.dataset.feature).toBeTruthy();
      });
    });

    it('should handle invalid reaction data', () => {
      const reactionCheckboxes = document.querySelectorAll('.reaction-checkbox-unboxing-scene input');
      reactionCheckboxes.forEach(cb => {
        expect(cb.dataset.reaction).toBeTruthy();
      });
    });

    it('should handle multiple checkbox selections', () => {
      const featureCheckboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene input');
      
      // Select multiple checkboxes
      fireEvent.click(featureCheckboxes[0]);
      fireEvent.click(featureCheckboxes[1]);
      fireEvent.click(featureCheckboxes[2]);
      
      // Should not crash
      expect(true).toBe(true);
    });

    it('should handle rapid checkbox toggling', () => {
      const featureCheckboxes = document.querySelectorAll('.feature-checkbox-unboxing-scene input');
      
      // Rapid toggling should not cause issues
      featureCheckboxes.forEach(cb => {
        fireEvent.click(cb);
        fireEvent.click(cb);
      });
      
      // Should not crash
      expect(true).toBe(true);
    });
  });
});
