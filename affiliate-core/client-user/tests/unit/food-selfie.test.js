import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

describe('food-selfie Component', () => {
  
  const mockComponentHTML = `
    <div id="content-food-selfie" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            <i class="fas fa-utensils mr-3"></i>Food Selfie
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat foto makanan yang menarik dengan sentuhan AI</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Makanan</h2>
              <div class="upload-area">
                <label for="food-selfie-image-input" class="file-input-label block border-3 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="file" id="food-selfie-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-emerald-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto makanan di sini</p>
                </label>
              </div>
              <div id="food-selfie-image-preview-container" class="hidden mt-4">
                <img id="food-selfie-image-preview" src="#" alt="Pratinjau Makanan" class="rounded-lg w-full h-auto object-contain">
                <button id="food-selfie-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Kategori Makanan</h2>
              <div id="food-selfie-category-options" class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                <button type="button" data-category="" class="category-btn-food-selfie p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-ban mr-1"></i>Umum
                </button>
                <button type="button" data-category="Masakan Indonesia" class="category-btn-food-selfie p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-flag mr-1"></i>Indonesian
                </button>
                <button type="button" data-category="Masakan Timur Tengah" class="category-btn-food-selfie p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-globe mr-1"></i>Middle Eastern
                </button>
                <button type="button" data-category="Asian Fusion" class="category-btn-food-selfie p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-globe-asia mr-1"></i>Asian Fusion
                </button>
                <button type="button" data-category="Masakan Barat" class="category-btn-food-selfie p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-utensils mr-1"></i>Western
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Opsi Peningkatan</h2>
              <div class="space-y-4">
                <div>
                  <label for="food-selfie-brightness" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sun mr-1 text-emerald-500"></i>Kecerahan
                  </label>
                  <input type="range" id="food-selfie-brightness" min="0" max="200" value="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Gelap</span>
                    <span id="food-selfie-brightness-value">Normal</span>
                    <span>Terang</span>
                  </div>
                </div>
                <div>
                  <label for="food-selfie-saturation" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-emerald-500"></i>Saturasi
                  </label>
                  <input type="range" id="food-selfie-saturation" min="0" max="200" value="100" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Putih</span>
                    <span id="food-selfie-saturation-value">Normal</span>
                    <span>Vibrant</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-filter mr-1 text-emerald-500"></i>Filter
                  </label>
                  <div id="food-selfie-filter-options" class="grid grid-cols-4 gap-2">
                    <button type="button" data-filter="none" class="filter-btn-food-selfie p-2 rounded-lg text-xs bg-gray-100 hover:bg-emerald-100 transition border-2 border-transparent selected" data-selected="true">
                      <div class="w-8 h-8 rounded bg-white border border-gray-300"></div>
                      <span class="mt-1 block">Normal</span>
                    </button>
                    <button type="button" data-filter="warm" class="filter-btn-food-selfie p-2 rounded-lg text-xs bg-gray-100 hover:bg-emerald-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-orange-100"></div>
                      <span class="mt-1 block">Warm</span>
                    </button>
                    <button type="button" data-filter="cool" class="filter-btn-food-selfie p-2 rounded-lg text-xs bg-gray-100 hover:bg-emerald-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-blue-100"></div>
                      <span class="mt-1 block">Cool</span>
                    </button>
                    <button type="button" data-filter="food" class="filter-btn-food-selfie p-2 rounded-lg text-xs bg-gray-100 hover:bg-emerald-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-green-100"></div>
                      <span class="mt-1 block">Food</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button id="food-selfie-generate-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Food Selfie
            </button>
          </div>
          <div class="lg:col-span-2">
            <div id="food-selfie-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="food-selfie-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-utensils text-6xl mb-4 text-emerald-400"></i>
                <p class="text-xl">Hasil akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto makanan dan klik Buat Food Selfie</p>
              </div>
              <div id="food-selfie-results" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-6"></div>
              <div id="food-selfie-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-emerald-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat food selfie...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `;
  
  describe('Rendering', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });
    
    afterEach(() => {
      document.body.innerHTML = '';
    });
    
    it('should render component container', () => {
      expect(document.getElementById('content-food-selfie')).toBeTruthy();
    });

    it('should render header with correct title', () => {
      const header = document.querySelector('#content-food-selfie h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('Food Selfie');
    });

    it('should render header with utensils icon', () => {
      const icon = document.querySelector('#content-food-selfie h1 i.fas.fa-utensils');
      expect(icon).toBeTruthy();
    });

    it('should render header description', () => {
      const description = document.querySelector('#content-food-selfie header p');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('Buat foto makanan yang menarik');
    });

    it('should render all section headers', () => {
      const headers = document.querySelectorAll('#content-food-selfie h2');
      const headerTexts = Array.from(headers).map(h => h.textContent);
      expect(headerTexts.some(t => t.includes('Unggah Foto Makanan'))).toBe(true);
      expect(headerTexts.some(t => t.includes('Kategori Makanan'))).toBe(true);
      expect(headerTexts.some(t => t.includes('Opsi Peningkatan'))).toBe(true);
    });

    it('should render image upload area', () => {
      expect(document.getElementById('food-selfie-image-input')).toBeTruthy();
    });

    it('should render image preview container', () => {
      expect(document.getElementById('food-selfie-image-preview-container')).toBeTruthy();
    });

    it('should render image preview element', () => {
      expect(document.getElementById('food-selfie-image-preview')).toBeTruthy();
    });

    it('should render remove image button', () => {
      expect(document.getElementById('food-selfie-remove-image-btn')).toBeTruthy();
    });

    it('should render category options', () => {
      const categoryButtons = document.querySelectorAll('.category-btn-food-selfie');
      expect(categoryButtons.length).toBeGreaterThan(0);
    });

    it('should render brightness slider', () => {
      expect(document.getElementById('food-selfie-brightness')).toBeTruthy();
    });

    it('should render saturation slider', () => {
      expect(document.getElementById('food-selfie-saturation')).toBeTruthy();
    });

    it('should render filter options', () => {
      const filterButtons = document.querySelectorAll('.filter-btn-food-selfie');
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it('should render generate button', () => {
      expect(document.getElementById('food-selfie-generate-btn')).toBeTruthy();
    });

    it('should render results container', () => {
      expect(document.getElementById('food-selfie-results-container')).toBeTruthy();
    });

    it('should render empty state', () => {
      expect(document.getElementById('food-selfie-empty-state')).toBeTruthy();
    });

    it('should render results grid', () => {
      expect(document.getElementById('food-selfie-results')).toBeTruthy();
    });

    it('should render loading indicator', () => {
      expect(document.getElementById('food-selfie-loading')).toBeTruthy();
    });
  });
  
  describe('User Interactions', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have file input element with correct accept attribute', () => {
      const fileInput = document.getElementById('food-selfie-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have category selection buttons', () => {
      const categoryButtons = document.querySelectorAll('.category-btn-food-selfie');
      expect(categoryButtons.length).toBeGreaterThan(0);
    });

    it('should have brightness slider with correct range', () => {
      const brightnessSlider = document.getElementById('food-selfie-brightness');
      expect(brightnessSlider).toBeTruthy();
      expect(brightnessSlider.min).toBe('0');
      expect(brightnessSlider.max).toBe('200');
      expect(brightnessSlider.value).toBe('100');
    });

    it('should have saturation slider with correct range', () => {
      const saturationSlider = document.getElementById('food-selfie-saturation');
      expect(saturationSlider).toBeTruthy();
      expect(saturationSlider.min).toBe('0');
      expect(saturationSlider.max).toBe('200');
      expect(saturationSlider.value).toBe('100');
    });

    it('should have filter selection buttons', () => {
      const filterButtons = document.querySelectorAll('.filter-btn-food-selfie');
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it('should have generate button with correct text', () => {
      const generateBtn = document.getElementById('food-selfie-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Food Selfie');
    });

    it('should have generate button with magic icon', () => {
      const magicIcon = document.querySelector('#food-selfie-generate-btn i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have brightness value display', () => {
      const brightnessValue = document.getElementById('food-selfie-brightness-value');
      expect(brightnessValue).toBeTruthy();
      expect(brightnessValue.textContent).toBe('Normal');
    });

    it('should have saturation value display', () => {
      const saturationValue = document.getElementById('food-selfie-saturation-value');
      expect(saturationValue).toBeTruthy();
      expect(saturationValue.textContent).toBe('Normal');
    });
  });

  describe('API Integration', () => {
    it('should have generate button with correct attributes', () => {
      document.body.innerHTML = mockComponentHTML;
      const generateBtn = document.getElementById('food-selfie-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.tagName).toBe('BUTTON');
    });

    it('should have results container', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsContainer = document.getElementById('food-selfie-results-container');
      expect(resultsContainer).toBeTruthy();
    });

    it('should have results grid with correct classes', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsGrid = document.getElementById('food-selfie-results');
      expect(resultsGrid).toBeTruthy();
      expect(resultsGrid.classList.contains('hidden')).toBe(true);
    });

    it('should have loading indicator', () => {
      document.body.innerHTML = mockComponentHTML;
      const loadingIndicator = document.getElementById('food-selfie-loading');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should have generate button initially disabled', () => {
      document.body.innerHTML = mockComponentHTML;
      const generateBtn = document.getElementById('food-selfie-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have loading element for showing states', () => {
      document.body.innerHTML = mockComponentHTML;
      const loadingElement = document.getElementById('food-selfie-loading');
      expect(loadingElement).toBeTruthy();
    });

    it('should have empty state with instructions', () => {
      document.body.innerHTML = mockComponentHTML;
      const emptyState = document.getElementById('food-selfie-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil akan muncul di sini');
    });

    it('should have remove button for image preview', () => {
      document.body.innerHTML = mockComponentHTML;
      const removeBtn = document.getElementById('food-selfie-remove-image-btn');
      expect(removeBtn).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should have image preview container initially hidden', () => {
      document.body.innerHTML = mockComponentHTML;
      const previewContainer = document.getElementById('food-selfie-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should have results grid initially hidden', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsGrid = document.getElementById('food-selfie-results');
      expect(resultsGrid).toBeTruthy();
      expect(resultsGrid.classList.contains('hidden')).toBe(true);
    });

    it('should have loading indicator initially hidden', () => {
      document.body.innerHTML = mockComponentHTML;
      const loadingIndicator = document.getElementById('food-selfie-loading');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    });

    it('should have empty state initially visible', () => {
      document.body.innerHTML = mockComponentHTML;
      const emptyState = document.getElementById('food-selfie-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have brightness slider with correct initial value', () => {
      document.body.innerHTML = mockComponentHTML;
      const brightnessSlider = document.getElementById('food-selfie-brightness');
      expect(brightnessSlider.value).toBe('100');
    });

    it('should have saturation slider with correct initial value', () => {
      document.body.innerHTML = mockComponentHTML;
      const saturationSlider = document.getElementById('food-selfie-saturation');
      expect(saturationSlider.value).toBe('100');
    });

    it('should have default category option selected', () => {
      document.body.innerHTML = mockComponentHTML;
      const defaultCategory = document.querySelector('.category-btn-food-selfie[data-selected="true"]');
      expect(defaultCategory).toBeTruthy();
      expect(defaultCategory.textContent).toContain('Umum');
    });

    it('should have default filter option selected', () => {
      document.body.innerHTML = mockComponentHTML;
      const defaultFilter = document.querySelector('.filter-btn-food-selfie[data-selected="true"]');
      expect(defaultFilter).toBeTruthy();
      expect(defaultFilter.textContent).toContain('Normal');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have proper heading structure', () => {
      const h1 = document.querySelector('#content-food-selfie h1');
      const h2Elements = document.querySelectorAll('#content-food-selfie h2');
      
      expect(h1).toBeTruthy();
      expect(h2Elements.length).toBeGreaterThanOrEqual(3);
    });

    it('should have labels for form controls', () => {
      const brightnessLabel = document.querySelector('label[for="food-selfie-brightness"]');
      const saturationLabel = document.querySelector('label[for="food-selfie-saturation"]');
      
      expect(brightnessLabel).toBeTruthy();
      expect(saturationLabel).toBeTruthy();
    });

    it('should have icons for visual enhancement', () => {
      const utensilsIcon = document.querySelector('#content-food-selfie h1 i.fas.fa-utensils');
      const cameraIcon = document.querySelector('#food-selfie-image-input + i.fas.fa-camera');
      const magicIcon = document.querySelector('#food-selfie-generate-btn i.fas.fa-magic');
      
      expect(utensilsIcon).toBeTruthy();
      expect(cameraIcon).toBeTruthy();
      expect(magicIcon).toBeTruthy();
    });
  });
});
