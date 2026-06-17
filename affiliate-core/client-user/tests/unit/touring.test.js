import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock copyToClipboard globally
window.copyToClipboard = vi.fn().mockResolvedValue();

describe('touring Component', () => {
  
  const mockComponentHTML = `
    <div id="content-touring" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            <i class="fas fa-map-marked-alt mr-3"></i>Virtual Tour
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat panduan wisata menarik dengan bantuan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Upload Place Photo -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Tempat</h2>
              <div class="upload-area">
                <label for="touring-image-input" class="file-input-label block border-3 border-dashed border-teal-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-500 transition-colors">
                  <input type="file" id="touring-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-teal-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto tempat wisata di sini</p>
                </label>
              </div>
              <div id="touring-image-preview-container" class="hidden mt-4">
                <img id="touring-image-preview" src="#" alt="Pratinjau Tempat" class="rounded-lg w-full h-auto object-contain">
                <button id="touring-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Tour Type Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Tour</h2>
              <div id="touring-type-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-tour-type="guide" class="tour-type-btn-touring p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-map-signs mr-2"></i>Panduan Tempat
                </button>
                <button type="button" data-tour-type="review" class="tour-type-btn-touring p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star mr-2"></i>Ulasan Lokasi
                </button>
                <button type="button" data-tour-type="tips" class="tour-type-btn-touring p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-lightbulb mr-2"></i>Tips Pariwisata
                </button>
                <button type="button" data-tour-type="virtual" class="tour-type-btn-touring p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-vr-cardboard mr-2"></i>Deskripsi Virtual Tour
                </button>
                <button type="button" data-tour-type="itinerary" class="tour-type-btn-touring p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-route mr-2"></i>Generator Itinerary
                </button>
              </div>
            </div>
            
            <!-- Step 3: Place Category Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Kategori Tempat</h2>
              <div id="touring-category-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-category="nature" class="category-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tree mr-1"></i>Alam
                </button>
                <button type="button" data-category="food" class="category-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-utensils mr-1"></i>Kuliner
                </button>
                <button type="button" data-category="culture" class="category-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-landmark mr-1"></i>Budaya
                </button>
                <button type="button" data-category="entertainment" class="category-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-film mr-1"></i>Hiburan
                </button>
                <button type="button" data-category="shopping" class="category-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shopping-bag mr-1"></i>Belanja
                </button>
                <button type="button" data-category="accommodation" class="category-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bed mr-1"></i>Akomodasi
                </button>
              </div>
            </div>
            
            <!-- Step 4: Place Name/Location -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Nama Tempat/Lokasi</h2>
              <input type="text" id="touring-place-name" placeholder="Nama tempat wisata atau lokasi..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            </div>
            
            <!-- Step 5: Key Attractions -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Daya Tarik Utama</h2>
              <textarea id="touring-attractions" rows="3" placeholder="Tuliskan daya tarik utama tempat wisata ini (pisahkan dengan koma)..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"></textarea>
            </div>
            
            <!-- Step 6: Best Time to Visit -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Waktu Terbaik Berkunjung</h2>
              <div id="touring-time-options" class="grid grid-cols-2 gap-2 mb-4">
                <button type="button" data-time="morning" class="time-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-sun mr-1"></i>Pagi
                </button>
                <button type="button" data-time="afternoon" class="time-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-cloud-sun mr-1"></i>Siang
                </button>
                <button type="button" data-time="evening" class="time-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-moon mr-1"></i>Sore
                </button>
                <button type="button" data-time="night" class="time-btn-touring p-2 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star mr-1"></i>Malam
                </button>
              </div>
              <input type="text" id="touring-best-season" placeholder="Musim terbaik (contoh: Musim kemarau, Liburan sekolah...)" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            </div>
            
            <!-- Step 7: Tips and Recommendations -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">7. Tips & Rekomendasi</h2>
              <textarea id="touring-tips" rows="4" placeholder="Tuliskan tips, rekomendasi, atau informasi penting lainnya untuk wisatawan..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"></textarea>
            </div>
            
            <!-- Step 8: Generate Button -->
            <button id="touring-generate-btn" class="w-full bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Tour Guide
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="touring-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="touring-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-map-marked-alt text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil tour guide akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto tempat dan klik Buat Tour Guide</p>
              </div>
              <div id="touring-results" class="hidden grid grid-cols-1 gap-6"></div>
              <div id="touring-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat tour guide...</p>
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
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should render main container with correct ID', () => {
      const container = document.getElementById('content-touring');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Virtual Tour');
      expect(title.querySelector('i.fas.fa-map-marked-alt')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat panduan wisata menarik dengan bantuan AI');
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
      expect(rightPanel.querySelector('#touring-results-container')).toBeTruthy();
    });

    it('should have proper container classes', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });

    it('should have proper gap between grid items', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should render image upload area', () => {
      const uploadArea = document.getElementById('touring-image-input');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.accept).toBe('image/*');
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('touring-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview element', () => {
      const preview = document.getElementById('touring-image-preview');
      expect(preview).toBeTruthy();
      expect(preview.alt).toBe('Pratinjau Tempat');
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('touring-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should render upload area with proper styling', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel).toBeTruthy();
      expect(uploadLabel.classList.contains('border-dashed')).toBe(true);
      expect(uploadLabel.classList.contains('border-teal-300')).toBe(true);
    });

    it('should render upload icon', () => {
      const uploadIcon = document.body.querySelector('.fa-camera');
      expect(uploadIcon).toBeTruthy();
    });

    it('should render upload helper text', () => {
      const helperText = document.body.querySelector('.upload-area p.text-gray-600');
      expect(helperText).toBeTruthy();
      expect(helperText.textContent).toContain('Klik atau seret foto tempat wisata di sini');
    });

    it('should have file input with hidden class', () => {
      const fileInput = document.getElementById('touring-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.classList.contains('hidden')).toBe(true);
    });

    it('should have proper label for file input', () => {
      const label = document.body.querySelector('label[for="touring-image-input"]');
      expect(label).toBeTruthy();
      expect(label.classList.contains('cursor-pointer')).toBe(true);
    });

    it('should have remove button with red background', () => {
      const removeBtn = document.getElementById('touring-remove-image-btn');
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
      expect(removeBtn.classList.contains('hover:bg-red-600')).toBe(true);
    });
  });

  // Tour Type Selection Tests
  describe('Tour Type Selection', () => {
    it('should render tour type options container', () => {
      const container = document.getElementById('touring-type-options');
      expect(container).toBeTruthy();
    });

    it('should render 5 tour type buttons', () => {
      const buttons = document.body.querySelectorAll('.tour-type-btn-touring');
      expect(buttons.length).toBe(5);
    });

    it('should render guide tour type option', () => {
      const guideBtn = document.body.querySelector('[data-tour-type="guide"]');
      expect(guideBtn).toBeTruthy();
      expect(guideBtn.textContent).toContain('Panduan Tempat');
    });

    it('should render review tour type option', () => {
      const reviewBtn = document.body.querySelector('[data-tour-type="review"]');
      expect(reviewBtn).toBeTruthy();
      expect(reviewBtn.textContent).toContain('Ulasan Lokasi');
    });

    it('should render tips tour type option', () => {
      const tipsBtn = document.body.querySelector('[data-tour-type="tips"]');
      expect(tipsBtn).toBeTruthy();
      expect(tipsBtn.textContent).toContain('Tips Pariwisata');
    });

    it('should render virtual tour type option', () => {
      const virtualBtn = document.body.querySelector('[data-tour-type="virtual"]');
      expect(virtualBtn).toBeTruthy();
      expect(virtualBtn.textContent).toContain('Deskripsi Virtual Tour');
    });

    it('should render itinerary tour type option', () => {
      const itineraryBtn = document.body.querySelector('[data-tour-type="itinerary"]');
      expect(itineraryBtn).toBeTruthy();
      expect(itineraryBtn.textContent).toContain('Generator Itinerary');
    });

    it('should have tour type buttons with proper styling', () => {
      const buttons = document.body.querySelectorAll('.tour-type-btn-touring');
      buttons.forEach(btn => {
        expect(btn.classList.contains('border-transparent')).toBe(true);
        expect(btn.classList.contains('bg-gray-100')).toBe(true);
      });
    });

    it('should have tour type buttons with icons', () => {
      const guideBtn = document.body.querySelector('[data-tour-type="guide"]');
      expect(guideBtn.querySelector('i.fas.fa-map-signs')).toBeTruthy();
      
      const reviewBtn = document.body.querySelector('[data-tour-type="review"]');
      expect(reviewBtn.querySelector('i.fas.fa-star')).toBeTruthy();
      
      const tipsBtn = document.body.querySelector('[data-tour-type="tips"]');
      expect(tipsBtn.querySelector('i.fas.fa-lightbulb')).toBeTruthy();
      
      const virtualBtn = document.body.querySelector('[data-tour-type="virtual"]');
      expect(virtualBtn.querySelector('i.fas.fa-vr-cardboard')).toBeTruthy();
      
      const itineraryBtn = document.body.querySelector('[data-tour-type="itinerary"]');
      expect(itineraryBtn.querySelector('i.fas.fa-route')).toBeTruthy();
    });

    it('should have tour type buttons with single column layout', () => {
      const container = document.getElementById('touring-type-options');
      expect(container.classList.contains('grid-cols-1')).toBe(true);
      expect(container.classList.contains('gap-2')).toBe(true);
    });
  });

  // Place Category Selection Tests
  describe('Place Category Selection', () => {
    it('should render category options container', () => {
      const container = document.getElementById('touring-category-options');
      expect(container).toBeTruthy();
    });

    it('should render 6 category buttons', () => {
      const buttons = document.body.querySelectorAll('.category-btn-touring');
      expect(buttons.length).toBe(6);
    });

    it('should render nature category option', () => {
      const natureBtn = document.body.querySelector('[data-category="nature"]');
      expect(natureBtn).toBeTruthy();
      expect(natureBtn.textContent).toContain('Alam');
    });

    it('should render food category option', () => {
      const foodBtn = document.body.querySelector('[data-category="food"]');
      expect(foodBtn).toBeTruthy();
      expect(foodBtn.textContent).toContain('Kuliner');
    });

    it('should render culture category option', () => {
      const cultureBtn = document.body.querySelector('[data-category="culture"]');
      expect(cultureBtn).toBeTruthy();
      expect(cultureBtn.textContent).toContain('Budaya');
    });

    it('should render entertainment category option', () => {
      const entertainmentBtn = document.body.querySelector('[data-category="entertainment"]');
      expect(entertainmentBtn).toBeTruthy();
      expect(entertainmentBtn.textContent).toContain('Hiburan');
    });

    it('should render shopping category option', () => {
      const shoppingBtn = document.body.querySelector('[data-category="shopping"]');
      expect(shoppingBtn).toBeTruthy();
      expect(shoppingBtn.textContent).toContain('Belanja');
    });

    it('should render accommodation category option', () => {
      const accommodationBtn = document.body.querySelector('[data-category="accommodation"]');
      expect(accommodationBtn).toBeTruthy();
      expect(accommodationBtn.textContent).toContain('Akomodasi');
    });

    it('should have category buttons with proper styling', () => {
      const buttons = document.body.querySelectorAll('.category-btn-touring');
      buttons.forEach(btn => {
        expect(btn.classList.contains('border-transparent')).toBe(true);
        expect(btn.classList.contains('bg-gray-100')).toBe(true);
      });
    });

    it('should have category buttons with icons', () => {
      const natureBtn = document.body.querySelector('[data-category="nature"]');
      expect(natureBtn.querySelector('i.fas.fa-tree')).toBeTruthy();
      
      const foodBtn = document.body.querySelector('[data-category="food"]');
      expect(foodBtn.querySelector('i.fas.fa-utensils')).toBeTruthy();
      
      const cultureBtn = document.body.querySelector('[data-category="culture"]');
      expect(cultureBtn.querySelector('i.fas.fa-landmark')).toBeTruthy();
      
      const entertainmentBtn = document.body.querySelector('[data-category="entertainment"]');
      expect(entertainmentBtn.querySelector('i.fas.fa-film')).toBeTruthy();
      
      const shoppingBtn = document.body.querySelector('[data-category="shopping"]');
      expect(shoppingBtn.querySelector('i.fas.fa-shopping-bag')).toBeTruthy();
      
      const accommodationBtn = document.body.querySelector('[data-category="accommodation"]');
      expect(accommodationBtn.querySelector('i.fas.fa-bed')).toBeTruthy();
    });

    it('should have category buttons with two column layout', () => {
      const container = document.getElementById('touring-category-options');
      expect(container.classList.contains('grid-cols-2')).toBe(true);
      expect(container.classList.contains('gap-2')).toBe(true);
    });
  });

  // Key Attractions Input Tests
  describe('Key Attractions Input', () => {
    it('should render attractions textarea', () => {
      const textarea = document.getElementById('touring-attractions');
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea.rows).toBe(3);
    });

    it('should render attractions placeholder', () => {
      const textarea = document.getElementById('touring-attractions');
      expect(textarea.placeholder).toContain('Tuliskan daya tarik utama tempat wisata ini (pisahkan dengan koma)...');
    });

    it('should have attractions textarea with proper styling', () => {
      const textarea = document.getElementById('touring-attractions');
      expect(textarea.classList.contains('w-full')).toBe(true);
      expect(textarea.classList.contains('p-3')).toBe(true);
      expect(textarea.classList.contains('border')).toBe(true);
      expect(textarea.classList.contains('border-gray-300')).toBe(true);
      expect(textarea.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have attractions textarea with focus ring', () => {
      const textarea = document.getElementById('touring-attractions');
      expect(textarea.classList.contains('focus:ring-2')).toBe(true);
      expect(textarea.classList.contains('focus:ring-teal-500')).toBe(true);
    });

    it('should have attractions textarea with resize none', () => {
      const textarea = document.getElementById('touring-attractions');
      expect(textarea.classList.contains('resize-none')).toBe(true);
    });
  });

  // Best Time to Visit Selection Tests
  describe('Best Time to Visit Selection', () => {
    it('should render time options container', () => {
      const container = document.getElementById('touring-time-options');
      expect(container).toBeTruthy();
    });

    it('should render 4 time option buttons', () => {
      const buttons = document.body.querySelectorAll('.time-btn-touring');
      expect(buttons.length).toBe(4);
    });

    it('should render morning time option', () => {
      const morningBtn = document.body.querySelector('[data-time="morning"]');
      expect(morningBtn).toBeTruthy();
      expect(morningBtn.textContent).toContain('Pagi');
    });

    it('should render afternoon time option', () => {
      const afternoonBtn = document.body.querySelector('[data-time="afternoon"]');
      expect(afternoonBtn).toBeTruthy();
      expect(afternoonBtn.textContent).toContain('Siang');
    });

    it('should render evening time option', () => {
      const eveningBtn = document.body.querySelector('[data-time="evening"]');
      expect(eveningBtn).toBeTruthy();
      expect(eveningBtn.textContent).toContain('Sore');
    });

    it('should render night time option', () => {
      const nightBtn = document.body.querySelector('[data-time="night"]');
      expect(nightBtn).toBeTruthy();
      expect(nightBtn.textContent).toContain('Malam');
    });

    it('should have time buttons with proper styling', () => {
      const buttons = document.body.querySelectorAll('.time-btn-touring');
      buttons.forEach(btn => {
        expect(btn.classList.contains('border-transparent')).toBe(true);
        expect(btn.classList.contains('bg-gray-100')).toBe(true);
      });
    });

    it('should have time buttons with icons', () => {
      const morningBtn = document.body.querySelector('[data-time="morning"]');
      expect(morningBtn.querySelector('i.fas.fa-sun')).toBeTruthy();
      
      const afternoonBtn = document.body.querySelector('[data-time="afternoon"]');
      expect(afternoonBtn.querySelector('i.fas.fa-cloud-sun')).toBeTruthy();
      
      const eveningBtn = document.body.querySelector('[data-time="evening"]');
      expect(eveningBtn.querySelector('i.fas.fa-moon')).toBeTruthy();
      
      const nightBtn = document.body.querySelector('[data-time="night"]');
      expect(nightBtn.querySelector('i.fas.fa-star')).toBeTruthy();
    });

    it('should render best season input field', () => {
      const seasonInput = document.getElementById('touring-best-season');
      expect(seasonInput).toBeTruthy();
      expect(seasonInput.type).toBe('text');
    });

    it('should render best season placeholder', () => {
      const seasonInput = document.getElementById('touring-best-season');
      expect(seasonInput.placeholder).toContain('Musim terbaik (contoh: Musim kemarau, Liburan sekolah...)');
    });

    it('should have time options with two column layout', () => {
      const container = document.getElementById('touring-time-options');
      expect(container.classList.contains('grid-cols-2')).toBe(true);
      expect(container.classList.contains('gap-2')).toBe(true);
    });
  });

  // Tips and Recommendations Tests
  describe('Tips and Recommendations', () => {
    it('should render tips textarea', () => {
      const textarea = document.getElementById('touring-tips');
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea.rows).toBe(4);
    });

    it('should render tips placeholder', () => {
      const textarea = document.getElementById('touring-tips');
      expect(textarea.placeholder).toContain('Tuliskan tips, rekomendasi, atau informasi penting lainnya untuk wisatawan...');
    });

    it('should have tips textarea with proper styling', () => {
      const textarea = document.getElementById('touring-tips');
      expect(textarea.classList.contains('w-full')).toBe(true);
      expect(textarea.classList.contains('p-3')).toBe(true);
      expect(textarea.classList.contains('border')).toBe(true);
      expect(textarea.classList.contains('border-gray-300')).toBe(true);
      expect(textarea.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have tips textarea with focus ring', () => {
      const textarea = document.getElementById('touring-tips');
      expect(textarea.classList.contains('focus:ring-2')).toBe(true);
      expect(textarea.classList.contains('focus:ring-teal-500')).toBe(true);
    });

    it('should have tips textarea with resize none', () => {
      const textarea = document.getElementById('touring-tips');
      expect(textarea.classList.contains('resize-none')).toBe(true);
    });
  });

  // Place Name Input Tests
  describe('Place Name Input', () => {
    it('should render place name input field', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      expect(placeNameInput).toBeTruthy();
      expect(placeNameInput.type).toBe('text');
    });

    it('should render place name input with placeholder', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      expect(placeNameInput.placeholder).toContain('Nama tempat wisata atau lokasi...');
    });

    it('should have place name input with proper styling', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      expect(placeNameInput.classList.contains('w-full')).toBe(true);
      expect(placeNameInput.classList.contains('p-3')).toBe(true);
      expect(placeNameInput.classList.contains('border')).toBe(true);
      expect(placeNameInput.classList.contains('border-gray-300')).toBe(true);
      expect(placeNameInput.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have place name input with focus ring', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      expect(placeNameInput.classList.contains('focus:ring-2')).toBe(true);
      expect(placeNameInput.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Tour Guide');
    });

    it('should render generate button icon', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should be disabled initially', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper styling classes', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-600')).toBe(true);
      expect(generateBtn.classList.contains('to-cyan-500')).toBe(true);
    });

    it('should have hover effects', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });

    it('should have transition effects', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });

    it('should have proper padding and rounded corners', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
    });

    it('should have disabled state styling', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have full width', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const container = document.getElementById('touring-results-container');
      expect(container).toBeTruthy();
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('touring-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil tour guide akan muncul di sini');
    });

    it('should render empty state icon', () => {
      const emptyState = document.getElementById('touring-empty-state');
      expect(emptyState.querySelector('i.fas.fa-map-marked-alt')).toBeTruthy();
    });

    it('should render empty state helper text', () => {
      const emptyState = document.getElementById('touring-empty-state');
      expect(emptyState.textContent).toContain('Unggah foto tempat dan klik Buat Tour Guide');
    });

    it('should render results area', () => {
      const results = document.getElementById('touring-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should render loading state', () => {
      const loading = document.getElementById('touring-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat tour guide...');
    });

    it('should render loader with proper styling', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should have results container with minimum height', () => {
      const container = document.getElementById('touring-results-container');
      expect(container.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have empty state with proper styling', () => {
      const emptyState = document.getElementById('touring-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
    });

    it('should have empty state icon with teal color', () => {
      const emptyStateIcon = document.body.querySelector('#touring-empty-state .fa-map-marked-alt');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper shadow', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('shadow-lg')).toBe(true);
      });
    });

    it('should have cards with proper border radius', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('rounded-2xl')).toBe(true);
      });
    });

    it('should have cards with white background', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have proper padding on cards', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
      });
    });
  });

  // Icons Tests
  describe('Icons', () => {
    it('should use FontAwesome icons', () => {
      const icons = document.body.querySelectorAll('i[class*="fas fa-"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have map-marked-alt icon in header', () => {
      const mapIcon = document.body.querySelector('.fa-map-marked-alt');
      expect(mapIcon).toBeTruthy();
    });

    it('should have camera icon in image section', () => {
      const cameraIcon = document.body.querySelector('.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have magic icon for generate button', () => {
      const magicIcon = document.body.querySelector('.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have map-marked-alt icon for empty state', () => {
      const mapIcon = document.body.querySelector('#touring-empty-state .fa-map-marked-alt');
      expect(mapIcon).toBeTruthy();
    });

    it('should have times icon for remove button', () => {
      const timesIcon = document.body.querySelector('.fa-times');
      expect(timesIcon).toBeTruthy();
    });

    it('should have all tour type icons', () => {
      expect(document.body.querySelector('.fa-map-signs')).toBeTruthy();
      expect(document.body.querySelector('.fa-star')).toBeTruthy();
      expect(document.body.querySelector('.fa-lightbulb')).toBeTruthy();
      expect(document.body.querySelector('.fa-vr-cardboard')).toBeTruthy();
      expect(document.body.querySelector('.fa-route')).toBeTruthy();
    });

    it('should have all category icons', () => {
      expect(document.body.querySelector('.fa-tree')).toBeTruthy();
      expect(document.body.querySelector('.fa-utensils')).toBeTruthy();
      expect(document.body.querySelector('.fa-landmark')).toBeTruthy();
      expect(document.body.querySelector('.fa-film')).toBeTruthy();
      expect(document.body.querySelector('.fa-shopping-bag')).toBeTruthy();
      expect(document.body.querySelector('.fa-bed')).toBeTruthy();
    });

    it('should have all time option icons', () => {
      expect(document.body.querySelector('.fa-sun')).toBeTruthy();
      expect(document.body.querySelector('.fa-cloud-sun')).toBeTruthy();
      expect(document.body.querySelector('.fa-moon')).toBeTruthy();
      expect(document.body.querySelector('.fa-star')).toBeTruthy();
    });
  });

  // Text Content (Indonesian) Tests
  describe('Text Content (Indonesian)', () => {
    it('should have Indonesian header title', () => {
      const title = document.body.querySelector('header h1');
      expect(title.textContent).toContain('Virtual Tour');
    });

    it('should have Indonesian subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle.textContent).toContain('Buat panduan wisata menarik dengan bantuan AI');
    });

    it('should have Indonesian section labels', () => {
      const labels = document.body.querySelectorAll('.card h2');
      expect(labels[0].textContent).toContain('Unggah Foto Tempat');
      expect(labels[1].textContent).toContain('Jenis Tour');
      expect(labels[2].textContent).toContain('Kategori Tempat');
      expect(labels[3].textContent).toContain('Nama Tempat/Lokasi');
      expect(labels[4].textContent).toContain('Daya Tarik Utama');
      expect(labels[5].textContent).toContain('Waktu Terbaik Berkunjung');
      expect(labels[6].textContent).toContain('Tips & Rekomendasi');
    });

    it('should have Indonesian tour type labels', () => {
      const tourTypes = document.body.querySelectorAll('.tour-type-btn-touring');
      expect(tourTypes[0].textContent).toContain('Panduan Tempat');
      expect(tourTypes[1].textContent).toContain('Ulasan Lokasi');
      expect(tourTypes[2].textContent).toContain('Tips Pariwisata');
      expect(tourTypes[3].textContent).toContain('Deskripsi Virtual Tour');
      expect(tourTypes[4].textContent).toContain('Generator Itinerary');
    });

    it('should have Indonesian category labels', () => {
      const categories = document.body.querySelectorAll('.category-btn-touring');
      expect(categories[0].textContent).toContain('Alam');
      expect(categories[1].textContent).toContain('Kuliner');
      expect(categories[2].textContent).toContain('Budaya');
      expect(categories[3].textContent).toContain('Hiburan');
      expect(categories[4].textContent).toContain('Belanja');
      expect(categories[5].textContent).toContain('Akomodasi');
    });

    it('should have Indonesian time labels', () => {
      const times = document.body.querySelectorAll('.time-btn-touring');
      expect(times[0].textContent).toContain('Pagi');
      expect(times[1].textContent).toContain('Siang');
      expect(times[2].textContent).toContain('Sore');
      expect(times[3].textContent).toContain('Malam');
    });

    it('should have Indonesian button text', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Tour Guide');
    });

    it('should have Indonesian empty state text', () => {
      const emptyState = document.getElementById('touring-empty-state');
      expect(emptyState.textContent).toContain('Hasil tour guide akan muncul di sini');
    });

    it('should have Indonesian tips placeholder', () => {
      const textarea = document.getElementById('touring-tips');
      expect(textarea.placeholder).toContain('Tuliskan tips, rekomendasi, atau informasi penting lainnya untuk wisatawan...');
    });

    it('should have Indonesian attractions placeholder', () => {
      const textarea = document.getElementById('touring-attractions');
      expect(textarea.placeholder).toContain('Tuliskan daya tarik utama tempat wisata ini (pisahkan dengan koma)...');
    });

    it('should have Indonesian place name placeholder', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      expect(placeNameInput.placeholder).toContain('Nama tempat wisata atau lokasi...');
    });

    it('should have Indonesian best season placeholder', () => {
      const seasonInput = document.getElementById('touring-best-season');
      expect(seasonInput.placeholder).toContain('Musim terbaik (contoh: Musim kemarau, Liburan sekolah...)');
    });

    it('should have Indonesian loading text', () => {
      const loading = document.getElementById('touring-loading');
      expect(loading.textContent).toContain('Sedang membuat tour guide...');
    });

    it('should have Indonesian upload helper text', () => {
      const helperText = document.body.querySelector('.upload-area p.text-gray-600');
      expect(helperText.textContent).toContain('Klik atau seret foto tempat wisata di sini');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const header = document.body.querySelector('header h1');
      expect(header).toBeTruthy();
    });

    it('should have accessible image upload', () => {
      const fileInput = document.getElementById('touring-image-input');
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have accessible textarea', () => {
      const textarea = document.getElementById('touring-attractions');
      expect(textarea.placeholder).toBeDefined();
    });

    it('should have accessible tips textarea', () => {
      const textarea = document.getElementById('touring-tips');
      expect(textarea.placeholder).toBeDefined();
    });

    it('should have accessible place name input', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      expect(placeNameInput.placeholder).toBeDefined();
    });

    it('should have accessible best season input', () => {
      const seasonInput = document.getElementById('touring-best-season');
      expect(seasonInput.placeholder).toBeDefined();
    });

    it('should have button labels', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.textContent.trim().length).toBeGreaterThan(0);
    });

    it('should have alt text for images', () => {
      const preview = document.getElementById('touring-image-preview');
      expect(preview.alt).toBe('Pratinjau Tempat');
    });

    it('should have proper button types', () => {
      const buttons = document.body.querySelectorAll('button[type="button"]');
      buttons.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper input types', () => {
      const textInputs = document.body.querySelectorAll('input[type="text"]');
      textInputs.forEach(input => {
        expect(input.type).toBe('text');
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('grid')).toBe(true);
      expect(grid.classList.contains('grid-cols-1')).toBe(true);
      expect(grid.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive gap', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });

    it('should have responsive text sizes', () => {
      const title = document.body.querySelector('header h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive header margin', () => {
      const header = document.body.querySelector('header');
      expect(header.classList.contains('mb-8')).toBe(true);
    });

    it('should have responsive panel spacing', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have responsive category grid', () => {
      const categoryContainer = document.getElementById('touring-category-options');
      expect(categoryContainer.classList.contains('grid-cols-2')).toBe(true);
    });

    it('should have responsive time grid', () => {
      const timeContainer = document.getElementById('touring-time-options');
      expect(timeContainer.classList.contains('grid-cols-2')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/cyan gradient for header', () => {
      const title = document.body.querySelector('header h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-600')).toBe(true);
      expect(title.classList.contains('to-cyan-500')).toBe(true);
    });

    it('should use teal icons', () => {
      const cameraIcon = document.body.querySelector('.fa-camera');
      expect(cameraIcon.classList.contains('text-teal-400')).toBe(true);
    });

    it('should use teal border for upload area', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel.classList.contains('border-teal-300')).toBe(true);
    });

    it('should use teal for empty state icon', () => {
      const emptyStateIcon = document.body.querySelector('#touring-empty-state .fa-map-marked-alt');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });

    it('should use teal for loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use red for remove button', () => {
      const removeBtn = document.getElementById('touring-remove-image-btn');
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
    });

    it('should use teal/cyan gradient for generate button', () => {
      const generateBtn = document.getElementById('touring-generate-btn');
      expect(generateBtn.classList.contains('from-teal-600')).toBe(true);
      expect(generateBtn.classList.contains('to-cyan-500')).toBe(true);
    });

    it('should use teal for hover states on buttons', () => {
      const tourTypeBtn = document.body.querySelector('.tour-type-btn-touring');
      expect(tourTypeBtn.classList.contains('hover:bg-teal-100')).toBe(true);
      
      const categoryBtn = document.body.querySelector('.category-btn-touring');
      expect(categoryBtn.classList.contains('hover:bg-teal-100')).toBe(true);
      
      const timeBtn = document.body.querySelector('.time-btn-touring');
      expect(timeBtn.classList.contains('hover:bg-teal-100')).toBe(true);
    });

    it('should use teal for focus rings on inputs', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      expect(placeNameInput.classList.contains('focus:ring-teal-500')).toBe(true);
      
      const attractionsInput = document.getElementById('touring-attractions');
      expect(attractionsInput.classList.contains('focus:ring-teal-500')).toBe(true);
      
      const tipsInput = document.getElementById('touring-tips');
      expect(tipsInput.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have form that contains all inputs', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.querySelector('#touring-image-input')).toBeTruthy();
      expect(leftPanel.querySelector('#touring-type-options')).toBeTruthy();
      expect(leftPanel.querySelector('#touring-category-options')).toBeTruthy();
      expect(leftPanel.querySelector('#touring-time-options')).toBeTruthy();
      expect(leftPanel.querySelector('#touring-place-name')).toBeTruthy();
      expect(leftPanel.querySelector('#touring-attractions')).toBeTruthy();
      expect(leftPanel.querySelector('#touring-best-season')).toBeTruthy();
      expect(leftPanel.querySelector('#touring-tips')).toBeTruthy();
    });

    it('should have results section separate from form', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel.querySelector('#touring-results-container')).toBeTruthy();
    });

    it('should have both panels in grid', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(leftPanel).toBeTruthy();
      expect(rightPanel).toBeTruthy();
    });

    it('should have all required elements for form submission', () => {
      expect(document.getElementById('touring-image-input')).toBeTruthy();
      expect(document.getElementById('touring-type-options')).toBeTruthy();
      expect(document.getElementById('touring-category-options')).toBeTruthy();
      expect(document.getElementById('touring-place-name')).toBeTruthy();
      expect(document.getElementById('touring-generate-btn')).toBeTruthy();
    });

    it('should have all required elements for results display', () => {
      expect(document.getElementById('touring-results-container')).toBeTruthy();
      expect(document.getElementById('touring-empty-state')).toBeTruthy();
      expect(document.getElementById('touring-results')).toBeTruthy();
      expect(document.getElementById('touring-loading')).toBeTruthy();
    });

    it('should have image preview functionality', () => {
      expect(document.getElementById('touring-image-preview')).toBeTruthy();
      expect(document.getElementById('touring-image-preview-container')).toBeTruthy();
      expect(document.getElementById('touring-remove-image-btn')).toBeTruthy();
    });

    it('should have all selection option groups', () => {
      expect(document.getElementById('touring-type-options')).toBeTruthy();
      expect(document.getElementById('touring-category-options')).toBeTruthy();
      expect(document.getElementById('touring-time-options')).toBeTruthy();
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have two-column layout on large screens', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have single-column layout on small screens', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('grid-cols-1')).toBe(true);
    });

    it('should have proper section spacing', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper tour type group layout', () => {
      const tourTypeGroup = document.getElementById('touring-type-options');
      expect(tourTypeGroup.classList.contains('grid')).toBe(true);
      expect(tourTypeGroup.classList.contains('gap-2')).toBe(true);
      expect(tourTypeGroup.classList.contains('grid-cols-1')).toBe(true);
    });

    it('should have proper category group layout', () => {
      const categoryGroup = document.getElementById('touring-category-options');
      expect(categoryGroup.classList.contains('grid')).toBe(true);
      expect(categoryGroup.classList.contains('gap-2')).toBe(true);
      expect(categoryGroup.classList.contains('grid-cols-2')).toBe(true);
    });

    it('should have proper time group layout', () => {
      const timeGroup = document.getElementById('touring-time-options');
      expect(timeGroup.classList.contains('grid')).toBe(true);
      expect(timeGroup.classList.contains('gap-2')).toBe(true);
      expect(timeGroup.classList.contains('grid-cols-2')).toBe(true);
    });

    it('should have proper results layout', () => {
      const results = document.getElementById('touring-results');
      expect(results.classList.contains('grid')).toBe(true);
      expect(results.classList.contains('grid-cols-1')).toBe(true);
      expect(results.classList.contains('gap-6')).toBe(true);
    });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('should have loading spinner element', () => {
      const loading = document.getElementById('touring-loading');
      expect(loading).toBeTruthy();
    });

    it('should have loading spinner icon', () => {
      const spinnerIcon = document.body.querySelector('#touring-loading .loader');
      expect(spinnerIcon).toBeTruthy();
    });

    it('should have loading spinner hidden initially', () => {
      const loading = document.getElementById('touring-loading');
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have loading text', () => {
      const loading = document.getElementById('touring-loading');
      expect(loading.textContent).toContain('Sedang membuat tour guide...');
    });

    it('should have loading spinner with proper styling', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-t-4')).toBe(true);
      expect(loader.classList.contains('border-teal-500')).toBe(true);
      expect(loader.classList.contains('h-12')).toBe(true);
      expect(loader.classList.contains('w-12')).toBe(true);
    });

    it('should have loading container with flex layout', () => {
      const loading = document.getElementById('touring-loading');
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.classList.contains('items-center')).toBe(true);
      expect(loading.classList.contains('justify-center')).toBe(true);
    });
  });

  // Button Styling Tests
  describe('Button Styling', () => {
    it('should have tour type buttons with proper padding', () => {
      const tourTypeBtn = document.body.querySelector('.tour-type-btn-touring');
      expect(tourTypeBtn.classList.contains('p-3')).toBe(true);
    });

    it('should have category buttons with proper padding', () => {
      const categoryBtn = document.body.querySelector('.category-btn-touring');
      expect(categoryBtn.classList.contains('p-2')).toBe(true);
    });

    it('should have time buttons with proper padding', () => {
      const timeBtn = document.body.querySelector('.time-btn-touring');
      expect(timeBtn.classList.contains('p-2')).toBe(true);
    });

    it('should have all selection buttons with border', () => {
      const tourTypeBtns = document.body.querySelectorAll('.tour-type-btn-touring');
      tourTypeBtns.forEach(btn => {
        expect(btn.classList.contains('border-2')).toBe(true);
      });

      const categoryBtns = document.body.querySelectorAll('.category-btn-touring');
      categoryBtns.forEach(btn => {
        expect(btn.classList.contains('border-2')).toBe(true);
      });

      const timeBtns = document.body.querySelectorAll('.time-btn-touring');
      timeBtns.forEach(btn => {
        expect(btn.classList.contains('border-2')).toBe(true);
      });
    });

    it('should have all selection buttons with rounded corners', () => {
      const tourTypeBtns = document.body.querySelectorAll('.tour-type-btn-touring');
      tourTypeBtns.forEach(btn => {
        expect(btn.classList.contains('rounded-lg')).toBe(true);
      });

      const categoryBtns = document.body.querySelectorAll('.category-btn-touring');
      categoryBtns.forEach(btn => {
        expect(btn.classList.contains('rounded-lg')).toBe(true);
      });

      const timeBtns = document.body.querySelectorAll('.time-btn-touring');
      timeBtns.forEach(btn => {
        expect(btn.classList.contains('rounded-lg')).toBe(true);
      });
    });

    it('should have all selection buttons with transition', () => {
      const tourTypeBtn = document.body.querySelector('.tour-type-btn-touring');
      expect(tourTypeBtn.classList.contains('transition')).toBe(true);
    });

    it('should have all selection buttons with text center', () => {
      const tourTypeBtn = document.body.querySelector('.tour-type-btn-touring');
      expect(tourTypeBtn.classList.contains('text-center')).toBe(true);
    });
  });

  // Input Styling Tests
  describe('Input Styling', () => {
    it('should have all text inputs with full width', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      const bestSeasonInput = document.getElementById('touring-best-season');
      expect(placeNameInput.classList.contains('w-full')).toBe(true);
      expect(bestSeasonInput.classList.contains('w-full')).toBe(true);
    });

    it('should have all text inputs with proper padding', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      const bestSeasonInput = document.getElementById('touring-best-season');
      expect(placeNameInput.classList.contains('p-3')).toBe(true);
      expect(bestSeasonInput.classList.contains('p-3')).toBe(true);
    });

    it('should have all text inputs with border', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      const bestSeasonInput = document.getElementById('touring-best-season');
      expect(placeNameInput.classList.contains('border')).toBe(true);
      expect(placeNameInput.classList.contains('border-gray-300')).toBe(true);
      expect(bestSeasonInput.classList.contains('border')).toBe(true);
      expect(bestSeasonInput.classList.contains('border-gray-300')).toBe(true);
    });

    it('should have all text inputs with rounded corners', () => {
      const placeNameInput = document.getElementById('touring-place-name');
      const bestSeasonInput = document.getElementById('touring-best-season');
      expect(placeNameInput.classList.contains('rounded-lg')).toBe(true);
      expect(bestSeasonInput.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have all textareas with full width', () => {
      const attractionsInput = document.getElementById('touring-attractions');
      const tipsInput = document.getElementById('touring-tips');
      expect(attractionsInput.classList.contains('w-full')).toBe(true);
      expect(tipsInput.classList.contains('w-full')).toBe(true);
    });

    it('should have all textareas with proper padding', () => {
      const attractionsInput = document.getElementById('touring-attractions');
      const tipsInput = document.getElementById('touring-tips');
      expect(attractionsInput.classList.contains('p-3')).toBe(true);
      expect(tipsInput.classList.contains('p-3')).toBe(true);
    });

    it('should have all textareas with border', () => {
      const attractionsInput = document.getElementById('touring-attractions');
      const tipsInput = document.getElementById('touring-tips');
      expect(attractionsInput.classList.contains('border')).toBe(true);
      expect(attractionsInput.classList.contains('border-gray-300')).toBe(true);
      expect(tipsInput.classList.contains('border')).toBe(true);
      expect(tipsInput.classList.contains('border-gray-300')).toBe(true);
    });

    it('should have all textareas with rounded corners', () => {
      const attractionsInput = document.getElementById('touring-attractions');
      const tipsInput = document.getElementById('touring-tips');
      expect(attractionsInput.classList.contains('rounded-lg')).toBe(true);
      expect(tipsInput.classList.contains('rounded-lg')).toBe(true);
    });
  });
});
