import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock copyToClipboard globally
window.copyToClipboard = vi.fn().mockResolvedValue();

describe('skincare-review Component', () => {
  
  const mockComponentHTML = `
    <div id="content-skincare-review" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            <i class="fas fa-spa mr-3 text-emerald-500"></i>Skincare Review
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat review produk skincare yang informatif</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-camera mr-2 text-emerald-500"></i>1. Foto Produk
              </h2>
              <div class="upload-area">
                <label for="skincare-review-image-input" class="file-input-label block border-3 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="file" id="skincare-review-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-cloud-upload-alt text-4xl text-emerald-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto produk di sini</p>
                  <p class="text-sm text-gray-500 mt-1">Format: JPG, PNG, HEIC (maks. 10MB)</p>
                </label>
              </div>
              <div id="skincare-review-image-preview-container" class="hidden mt-4 relative">
                <img id="skincare-review-image-preview" src="#" alt="Pratinjau Produk" class="rounded-lg w-full h-auto object-contain">
                <button id="skincare-review-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-user mr-2 text-emerald-500"></i>2. Tipe Kulit
              </h2>
              <div id="skincare-review-skin-type-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-skin-type="oily" class="skin-type-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-left border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-circle mr-2 text-emerald-500"></i>
                  <span class="font-medium">Berminyak</span>
                </button>
                <button type="button" data-skin-type="dry" class="skin-type-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-tint mr-2 text-blue-500"></i>
                  <span class="font-medium">Kering</span>
                </button>
                <button type="button" data-skin-type="combination" class="skin-type-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-adjust mr-2 text-purple-500"></i>
                  <span class="font-medium">Kombinasi</span>
                </button>
                <button type="button" data-skin-type="sensitive" class="skin-type-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-exclamation-circle mr-2 text-red-500"></i>
                  <span class="font-medium">Sensitif</span>
                </button>
                <button type="button" data-skin-type="normal" class="skin-type-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-check-circle mr-2 text-green-500"></i>
                  <span class="font-medium">Normal</span>
                </button>
              </div>
            </div>
            
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-exclamation-triangle mr-2 text-emerald-500"></i>3. Masalah Kulit
              </h2>
              <div id="skincare-review-concern-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-concern="acne" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Jerawat</span>
                </button>
                <button type="button" data-concern="aging" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-clock mb-1 text-gray-500"></i>
                  <span class="block font-medium">Penuaan</span>
                </button>
                <button type="button" data-concern="hydration" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tint mb-1 text-blue-500"></i>
                  <span class="block font-medium">Hidrasi</span>
                </button>
                <button type="button" data-concern="brightening" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-sun mb-1 text-yellow-400"></i>
                  <span class="block font-medium">Brightening</span>
                </button>
                <button type="button" data-concern="sensitivity" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-exclamation-circle mb-1 text-red-400"></i>
                  <span class="block font-medium">Iritasi</span>
                </button>
                <button type="button" data-concern="pores" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-circle-notch mb-1 text-gray-400"></i>
                  <span class="block font-medium">Pori Besar</span>
                </button>
                <button type="button" data-concern="dullness" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-moon mb-1 text-indigo-400"></i>
                  <span class="block font-medium">Kusam</span>
                </button>
                <button type="button" data-concern="oiliness" class="concern-btn-skincare-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-oil-can mb-1 text-yellow-600"></i>
                  <span class="block font-medium">Kontrol minyak</span>
                </button>
              </div>
            </div>
            
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-star mr-2 text-emerald-500"></i>4. Rating
              </h2>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Rating Overall</label>
                <div id="skincare-review-overall-rating" class="flex justify-center space-x-2">
                  <button type="button" data-rating="1" class="rating-star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="2" class="rating-star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="3" class="rating-star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="4" class="rating-star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="5" class="rating-star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none">
                    <i class="fas fa-star"></i>
                  </button>
                </div>
                <p id="skincare-review-rating-text" class="text-center text-sm text-gray-500 mt-2">Pilih rating</p>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label for="skincare-review-effectiveness" class="block text-sm font-medium text-gray-700 mb-1">Efektivitas</label>
                  <input type="range" id="skincare-review-effectiveness" min="1" max="5" value="3" class="w-full accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>Tidak efektif</span>
                    <span>Sangat efektif</span>
                  </div>
                </div>
                
                <div>
                  <label for="skincare-review-texture" class="block text-sm font-medium text-gray-700 mb-1">Tekstur</label>
                  <input type="range" id="skincare-review-texture" min="1" max="5" value="3" class="w-full accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>Kurang nyaman</span>
                    <span>Sangat nyaman</span>
                  </div>
                </div>
                
                <div>
                  <label for="skincare-review-scent" class="block text-sm font-medium text-gray-700 mb-1">Aroma</label>
                  <input type="range" id="skincare-review-scent" min="1" max="5" value="3" class="w-full accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>Tidak suka</span>
                    <span>Sangat suka</span>
                  </div>
                </div>
                
                <div>
                  <label for="skincare-review-value" class="block text-sm font-medium text-gray-700 mb-1">Value for Money</label>
                  <input type="range" id="skincare-review-value" min="1" max="5" value="3" class="w-full accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500">
                    <span>Mahal</span>
                    <span>Worth it</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-edit mr-2 text-emerald-500"></i>5. Catatan Tambahan
              </h2>
              <textarea id="skincare-review-notes" rows="4" placeholder="Tulis pengalaman Anda menggunakan produk ini..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"></textarea>
            </div>
            
            <button id="skincare-review-generate-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Review
            </button>
          </div>
          
          <div class="lg:col-span-2">
            <div id="skincare-review-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="skincare-review-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-pen-fancy text-6xl mb-4 text-emerald-400"></i>
                <p class="text-xl">Hasil review akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto produk dan klik Buat Review</p>
              </div>
              <div id="skincare-review-results" class="hidden space-y-6"></div>
              <div id="skincare-review-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-emerald-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat review...</p>
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
      const container = document.getElementById('content-skincare-review');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Skincare Review');
      expect(title.querySelector('i.fas.fa-spa')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat review produk skincare yang informatif');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(5);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#skincare-review-results-container')).toBeTruthy();
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should render image upload area', () => {
      const uploadArea = document.getElementById('skincare-review-image-input');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.accept).toBe('image/*');
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('skincare-review-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview element', () => {
      const preview = document.getElementById('skincare-review-image-preview');
      expect(preview).toBeTruthy();
      expect(preview.alt).toBe('Pratinjau Produk');
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('skincare-review-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should render upload area with proper styling', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel).toBeTruthy();
      expect(uploadLabel.classList.contains('border-dashed')).toBe(true);
      expect(uploadLabel.classList.contains('border-emerald-300')).toBe(true);
    });

    it('should render upload icon', () => {
      const uploadIcon = document.body.querySelector('.fa-cloud-upload-alt');
      expect(uploadIcon).toBeTruthy();
    });

    it('should render upload helper text', () => {
      const helperText = document.body.querySelector('.upload-area p.text-gray-600');
      expect(helperText).toBeTruthy();
      expect(helperText.textContent).toContain('Klik atau seret foto produk di sini');
    });
  });

  // Skin Type Selection Tests
  describe('Skin Type Selection', () => {
    it('should render skin type options container', () => {
      const container = document.getElementById('skincare-review-skin-type-options');
      expect(container).toBeTruthy();
    });

    it('should render 5 skin type buttons', () => {
      const buttons = document.body.querySelectorAll('.skin-type-btn-skincare-review');
      expect(buttons.length).toBe(5);
    });

    it('should render oily skin type option', () => {
      const oilyBtn = document.body.querySelector('[data-skin-type="oily"]');
      expect(oilyBtn).toBeTruthy();
      expect(oilyBtn.textContent).toContain('Berminyak');
    });

    it('should render dry skin type option', () => {
      const dryBtn = document.body.querySelector('[data-skin-type="dry"]');
      expect(dryBtn).toBeTruthy();
      expect(dryBtn.textContent).toContain('Kering');
    });

    it('should render combination skin type option', () => {
      const comboBtn = document.body.querySelector('[data-skin-type="combination"]');
      expect(comboBtn).toBeTruthy();
      expect(comboBtn.textContent).toContain('Kombinasi');
    });

    it('should render sensitive skin type option', () => {
      const sensitiveBtn = document.body.querySelector('[data-skin-type="sensitive"]');
      expect(sensitiveBtn).toBeTruthy();
      expect(sensitiveBtn.textContent).toContain('Sensitif');
    });

    it('should render normal skin type option', () => {
      const normalBtn = document.body.querySelector('[data-skin-type="normal"]');
      expect(normalBtn).toBeTruthy();
      expect(normalBtn.textContent).toContain('Normal');
    });

    it('should have first skin type selected by default', () => {
      const selectedBtn = document.body.querySelector('.skin-type-btn-skincare-review.selected');
      expect(selectedBtn).toBeTruthy();
      expect(selectedBtn.dataset.skinType).toBe('oily');
    });
  });

  // Skin Concerns Selection Tests
  describe('Skin Concerns Selection', () => {
    it('should render concerns options container', () => {
      const container = document.getElementById('skincare-review-concern-options');
      expect(container).toBeTruthy();
    });

    it('should render 8 concern buttons', () => {
      const buttons = document.body.querySelectorAll('.concern-btn-skincare-review');
      expect(buttons.length).toBe(8);
    });

    it('should render acne concern option', () => {
      const acneBtn = document.body.querySelector('[data-concern="acne"]');
      expect(acneBtn).toBeTruthy();
      expect(acneBtn.textContent).toContain('Jerawat');
    });

    it('should render aging concern option', () => {
      const agingBtn = document.body.querySelector('[data-concern="aging"]');
      expect(agingBtn).toBeTruthy();
      expect(agingBtn.textContent).toContain('Penuaan');
    });

    it('should render hydration concern option', () => {
      const hydrationBtn = document.body.querySelector('[data-concern="hydration"]');
      expect(hydrationBtn).toBeTruthy();
      expect(hydrationBtn.textContent).toContain('Hidrasi');
    });

    it('should render brightening concern option', () => {
      const brighteningBtn = document.body.querySelector('[data-concern="brightening"]');
      expect(brighteningBtn).toBeTruthy();
      expect(brighteningBtn.textContent).toContain('Brightening');
    });

    it('should render sensitivity concern option', () => {
      const sensitivityBtn = document.body.querySelector('[data-concern="sensitivity"]');
      expect(sensitivityBtn).toBeTruthy();
      expect(sensitivityBtn.textContent).toContain('Iritasi');
    });

    it('should render pores concern option', () => {
      const poresBtn = document.body.querySelector('[data-concern="pores"]');
      expect(poresBtn).toBeTruthy();
      expect(poresBtn.textContent).toContain('Pori Besar');
    });

    it('should render dullness concern option', () => {
      const dullnessBtn = document.body.querySelector('[data-concern="dullness"]');
      expect(dullnessBtn).toBeTruthy();
      expect(dullnessBtn.textContent).toContain('Kusam');
    });

    it('should render oiliness concern option', () => {
      const oilinessBtn = document.body.querySelector('[data-concern="oiliness"]');
      expect(oilinessBtn).toBeTruthy();
      expect(oilinessBtn.textContent).toContain('Kontrol minyak');
    });
  });

  // Rating System Tests
  describe('Rating System', () => {
    it('should render overall rating container', () => {
      const container = document.getElementById('skincare-review-overall-rating');
      expect(container).toBeTruthy();
    });

    it('should render 5 star rating buttons', () => {
      const stars = document.body.querySelectorAll('.rating-star-btn');
      expect(stars.length).toBe(5);
    });

    it('should render rating text element', () => {
      const ratingText = document.getElementById('skincare-review-rating-text');
      expect(ratingText).toBeTruthy();
      expect(ratingText.textContent).toContain('Pilih rating');
    });

    it('should render effectiveness slider', () => {
      const slider = document.getElementById('skincare-review-effectiveness');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
      expect(slider.min).toBe('1');
      expect(slider.max).toBe('5');
    });

    it('should render texture slider', () => {
      const slider = document.getElementById('skincare-review-texture');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
    });

    it('should render scent slider', () => {
      const slider = document.getElementById('skincare-review-scent');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
    });

    it('should render value slider', () => {
      const slider = document.getElementById('skincare-review-value');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
    });

    it('should have all sliders with emerald accent color', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.classList.contains('accent-emerald-500')).toBe(true);
      });
    });
  });

  // Additional Notes Tests
  describe('Additional Notes', () => {
    it('should render notes textarea', () => {
      const textarea = document.getElementById('skincare-review-notes');
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea.rows).toBe(4);
    });

    it('should render notes placeholder', () => {
      const textarea = document.getElementById('skincare-review-notes');
      expect(textarea.placeholder).toContain('Tulis pengalaman Anda menggunakan produk ini...');
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Review');
    });

    it('should render generate button icon', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should be disabled initially', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper styling classes', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-emerald-600')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
    });
  });

  // Results Display Tests
  describe('Results Display', () => {
    it('should render results container', () => {
      const container = document.getElementById('skincare-review-results-container');
      expect(container).toBeTruthy();
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('skincare-review-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil review akan muncul di sini');
    });

    it('should render empty state icon', () => {
      const emptyState = document.getElementById('skincare-review-empty-state');
      expect(emptyState.querySelector('i.fas.fa-pen-fancy')).toBeTruthy();
    });

    it('should render empty state helper text', () => {
      const emptyState = document.getElementById('skincare-review-empty-state');
      expect(emptyState.textContent).toContain('Unggah foto produk dan klik Buat Review');
    });

    it('should render results area', () => {
      const results = document.getElementById('skincare-review-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should render loading state', () => {
      const loading = document.getElementById('skincare-review-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat review...');
    });

    it('should render loader with proper styling', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('border-emerald-500')).toBe(true);
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

    it('should have spa icon in header', () => {
      const spaIcon = document.body.querySelector('.fa-spa');
      expect(spaIcon).toBeTruthy();
    });

    it('should have camera icon in image section', () => {
      const cameraIcon = document.body.querySelector('.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have star icons for rating', () => {
      const starIcons = document.body.querySelectorAll('.rating-star-btn .fa-star');
      expect(starIcons.length).toBe(5);
    });

    it('should have magic icon for generate button', () => {
      const magicIcon = document.body.querySelector('.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have pen icon for empty state', () => {
      const penIcon = document.body.querySelector('.fa-pen-fancy');
      expect(penIcon).toBeTruthy();
    });
  });

  // Text Content (Indonesian) Tests
  describe('Text Content (Indonesian)', () => {
    it('should have Indonesian header title', () => {
      const title = document.body.querySelector('header h1');
      expect(title.textContent).toContain('Skincare Review');
    });

    it('should have Indonesian subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle.textContent).toContain('Buat review produk skincare yang informatif');
    });

    it('should have Indonesian section labels', () => {
      const labels = document.body.querySelectorAll('.card h2');
      expect(labels[0].textContent).toContain('Foto Produk');
      expect(labels[1].textContent).toContain('Tipe Kulit');
      expect(labels[2].textContent).toContain('Masalah Kulit');
      expect(labels[3].textContent).toContain('Rating');
      expect(labels[4].textContent).toContain('Catatan Tambahan');
    });

    it('should have Indonesian skin type labels', () => {
      const skinTypes = document.body.querySelectorAll('.skin-type-btn-skincare-review span');
      expect(skinTypes[0].textContent).toBe('Berminyak');
      expect(skinTypes[1].textContent).toBe('Kering');
      expect(skinTypes[2].textContent).toBe('Kombinasi');
      expect(skinTypes[3].textContent).toBe('Sensitif');
      expect(skinTypes[4].textContent).toBe('Normal');
    });

    it('should have Indonesian concern labels', () => {
      const concerns = document.body.querySelectorAll('.concern-btn-skincare-review span');
      expect(concerns[0].textContent).toBe('Jerawat');
      expect(concerns[1].textContent).toBe('Penuaan');
      expect(concerns[2].textContent).toBe('Hidrasi');
      expect(concerns[3].textContent).toBe('Brightening');
      expect(concerns[4].textContent).toBe('Iritasi');
      expect(concerns[5].textContent).toBe('Pori Besar');
      expect(concerns[6].textContent).toBe('Kusam');
      expect(concerns[7].textContent).toBe('Kontrol minyak');
    });

    it('should have Indonesian rating labels', () => {
      const effectivenessLabel = document.querySelector('label[for="skincare-review-effectiveness"]');
      expect(effectivenessLabel.textContent).toContain('Efektivitas');
    });

    it('should have Indonesian button text', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Review');
    });

    it('should have Indonesian empty state text', () => {
      const emptyState = document.getElementById('skincare-review-empty-state');
      expect(emptyState.textContent).toContain('Hasil review akan muncul di sini');
    });

    it('should have Indonesian notes placeholder', () => {
      const textarea = document.getElementById('skincare-review-notes');
      expect(textarea.placeholder).toContain('Tulis pengalaman Anda menggunakan produk ini...');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const header = document.body.querySelector('header h1');
      expect(header).toBeTruthy();
    });

    it('should have labels for all inputs', () => {
      const effectivenessLabel = document.querySelector('label[for="skincare-review-effectiveness"]');
      expect(effectivenessLabel).toBeTruthy();
    });

    it('should have accessible image upload', () => {
      const fileInput = document.getElementById('skincare-review-image-input');
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have accessible sliders', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.min).toBe('1');
        expect(slider.max).toBe('5');
      });
    });

    it('should have accessible textarea', () => {
      const textarea = document.getElementById('skincare-review-notes');
      expect(textarea.placeholder).toBeDefined();
    });

    it('should have button labels', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.textContent.trim().length).toBeGreaterThan(0);
    });

    it('should have alt text for images', () => {
      const preview = document.getElementById('skincare-review-image-preview');
      expect(preview.alt).toBe('Pratinjau Produk');
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
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use emerald/teal gradient for header', () => {
      const title = document.body.querySelector('header h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-emerald-600')).toBe(true);
      expect(title.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use emerald icons', () => {
      const icons = document.body.querySelectorAll('.card h2 i');
      icons.forEach(icon => {
        expect(icon.classList.contains('text-emerald-500')).toBe(true);
      });
    });

    it('should use emerald accent for sliders', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.classList.contains('accent-emerald-500')).toBe(true);
      });
    });

    it('should use emerald border for upload area', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel.classList.contains('border-emerald-300')).toBe(true);
    });

    it('should use yellow/gold for stars', () => {
      const stars = document.body.querySelectorAll('.rating-star-btn');
      stars.forEach(star => {
        expect(star.classList.contains('text-gray-300')).toBe(true);
      });
    });
  });

  // Placeholders Tests
  describe('Placeholders', () => {
    it('should have image upload placeholder', () => {
      const uploadText = document.body.querySelector('.upload-area p.text-gray-600');
      expect(uploadText.textContent).toContain('Klik atau seret foto produk di sini');
    });

    it('should have textarea placeholder', () => {
      const textarea = document.getElementById('skincare-review-notes');
      expect(textarea.placeholder).toContain('Tulis pengalaman Anda menggunakan produk ini...');
    });

    it('should have empty state placeholder', () => {
      const emptyState = document.getElementById('skincare-review-empty-state');
      expect(emptyState.textContent).toContain('Hasil review akan muncul di sini');
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-emerald-600')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
    });

    it('should have hover effects on buttons', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });

    it('should have transition effects', () => {
      const generateBtn = document.getElementById('skincare-review-generate-btn');
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });

    it('should have skin type button styling', () => {
      const skinTypeBtn = document.body.querySelector('.skin-type-btn-skincare-review');
      expect(skinTypeBtn.classList.contains('border-transparent')).toBe(true);
    });

    it('should have concern button styling', () => {
      const concernBtn = document.body.querySelector('.concern-btn-skincare-review');
      expect(concernBtn.classList.contains('border-transparent')).toBe(true);
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have file input with accept attribute', () => {
      const fileInput = document.getElementById('skincare-review-image-input');
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have sliders with min/max values', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.min).toBe('1');
        expect(slider.max).toBe('5');
      });
    });

    it('should have textarea with rows attribute', () => {
      const textarea = document.getElementById('skincare-review-notes');
      expect(textarea.rows).toBe(4);
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

    it('should have proper button group layout', () => {
      const skinTypeGroup = document.getElementById('skincare-review-skin-type-options');
      expect(skinTypeGroup.classList.contains('grid')).toBe(true);
      expect(skinTypeGroup.classList.contains('gap-2')).toBe(true);
    });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('should have loading spinner element', () => {
      const loading = document.getElementById('skincare-review-loading');
      expect(loading).toBeTruthy();
    });

    it('should have loading spinner icon', () => {
      const spinnerIcon = document.body.querySelector('#skincare-review-loading .loader');
      expect(spinnerIcon).toBeTruthy();
    });

    it('should have loading spinner hidden initially', () => {
      const loading = document.getElementById('skincare-review-loading');
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have loading text', () => {
      const loading = document.getElementById('skincare-review-loading');
      expect(loading.textContent).toContain('Sedang membuat review...');
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have empty state container', () => {
      const emptyState = document.getElementById('skincare-review-empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should have empty state icon', () => {
      const icon = document.body.querySelector('#skincare-review-empty-state .fa-pen-fancy');
      expect(icon).toBeTruthy();
    });

    it('should have empty state text', () => {
      const text = document.getElementById('skincare-review-empty-state');
      expect(text.textContent).toContain('Hasil review akan muncul di sini');
    });

    it('should have empty state styling', () => {
      const emptyState = document.getElementById('skincare-review-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have form that contains all inputs', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.querySelector('#skincare-review-image-input')).toBeTruthy();
      expect(leftPanel.querySelector('#skincare-review-skin-type-options')).toBeTruthy();
      expect(leftPanel.querySelector('#skincare-review-concern-options')).toBeTruthy();
      expect(leftPanel.querySelector('#skincare-review-overall-rating')).toBeTruthy();
      expect(leftPanel.querySelector('#skincare-review-notes')).toBeTruthy();
    });

    it('should have results section separate from form', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel.querySelector('#skincare-review-results-container')).toBeTruthy();
    });

    it('should have both panels in grid', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(leftPanel).toBeTruthy();
      expect(rightPanel).toBeTruthy();
    });
  });
});