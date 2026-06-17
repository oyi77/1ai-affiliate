/**
 * Size Guide Component Unit Tests
 * Comprehensive test suite for size-guide.html functionality
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock checkApiKey globally
window.checkApiKey = vi.fn().mockReturnValue(true);

describe('size-guide Component', () => {

  const mockComponentHTML = `
    <div id="content-size-guide" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            <i class="fas fa-ruler mr-3"></i>Panduan Ukuran
          </h1>
          <p class="text-lg text-gray-600 mt-2">Dapatkan rekomendasi ukuran yang tepat berdasarkan pengukuran tubuh Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Product Photo Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Produk</h2>
              <div class="upload-area">
                <label for="size-guide-product-image-input" class="file-input-label block border-3 border-dashed border-pink-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-colors">
                  <input type="file" id="size-guide-product-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-tshirt text-4xl text-pink-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto produk di sini</p>
                </label>
              </div>
              <div id="size-guide-product-image-preview-container" class="hidden mt-4 relative">
                <img id="size-guide-product-image-preview" src="#" alt="Pratinjau Foto Produk" class="rounded-lg w-full h-auto object-contain">
                <button id="size-guide-remove-product-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Product Category Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Kategori Produk</h2>
              <select id="size-guide-category-select" class="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none">
                <option value="">Pilih kategori produk...</option>
                <option value="tops">Pakaian Atas (Tops)</option>
                <option value="bottoms">Pakaian Bawah (Bottoms)</option>
                <option value="dresses">Gaun (Dresses)</option>
                <option value="jackets">Jaket & Mantel (Jackets)</option>
                <option value="shoes">Sepatu (Shoes)</option>
                <option value="bags">Tas (Bags)</option>
              </select>
            </div>
            
            <!-- Step 3: Size Chart Type Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Tipe Size Chart</h2>
              <div id="size-guide-chart-type-options" class="space-y-3">
                <button type="button" data-chart-type="sml" class="chart-type-btn-size-guide w-full p-3 rounded-lg text-sm bg-pink-100 hover:bg-pink-200 transition text-center border-2 border-pink-400 selected" data-selected="true">
                  <i class="fas fa-th-large mr-2"></i>S/M/L/XL/XXL
                </button>
                <button type="button" data-chart-type="number" class="chart-type-btn-size-guide w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-hashtag mr-2"></i>Angka (28, 30, 32...)
                </button>
                <button type="button" data-chart-type="international" class="chart-type-btn-size-guide w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-globe mr-2"></i>Internasional (XS, S, M, L, XL)
                </button>
                <button type="button" data-chart-type="custom" class="chart-type-btn-size-guide w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-ruler-combined mr-2"></i>Custom (Ukuran Khusus)
                </button>
              </div>
            </div>
            
            <!-- Step 4: Body Measurements -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Pengukuran Tubuh</h2>
              <div class="space-y-4">
                <div>
                  <label for="size-guide-height" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-arrows-alt-v mr-1 text-pink-500"></i>Tinggi Badan (cm)
                  </label>
                  <input type="number" id="size-guide-height" placeholder="170" class="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none">
                </div>
                <div>
                  <label for="size-guide-weight" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-weight mr-1 text-pink-500"></i>Berat Badan (kg)
                  </label>
                  <input type="number" id="size-guide-weight" placeholder="65" class="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none">
                </div>
                <div>
                  <label for="size-guide-chest" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-chest-alt mr-1 text-pink-500"></i>Lingkar Dada (cm)
                  </label>
                  <input type="number" id="size-guide-chest" placeholder="90" class="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none">
                </div>
                <div>
                  <label for="size-guide-waist" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-circle mr-1 text-pink-500"></i>Lingkar Pinggang (cm)
                  </label>
                  <input type="number" id="size-guide-waist" placeholder="75" class="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none">
                </div>
                <div>
                  <label for="size-guide-hip" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-hippo mr-1 text-pink-500"></i>Lingkar Pinggul (cm)
                  </label>
                  <input type="number" id="size-guide-hip" placeholder="95" class="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none">
                </div>
              </div>
            </div>
            
            <!-- Step 5: Fit Preference Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Preferensi Fit</h2>
              <div id="size-guide-fit-options" class="space-y-3">
                <button type="button" data-fit="slim" class="fit-btn-size-guide w-full p-3 rounded-lg text-sm bg-pink-100 hover:bg-pink-200 transition text-center border-2 border-pink-400 selected" data-selected="true">
                  <i class="fas fa-compress-arrows-alt mr-2"></i>Slim Fit
                </button>
                <button type="button" data-fit="regular" class="fit-btn-size-guide w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-arrows-alt-h mr-2"></i>Regular Fit
                </button>
                <button type="button" data-fit="loose" class="fit-btn-size-guide w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-expand-arrows-alt mr-2"></i>Loose Fit
                </button>
                <button type="button" data-fit="oversized" class="fit-btn-size-guide w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-expand mr-2"></i>Oversized
                </button>
              </div>
            </div>
            
            <!-- Step 6: Generate Button -->
            <button id="size-guide-generate-btn" class="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Panduan Ukuran
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="size-guide-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="size-guide-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-ruler text-6xl mb-4 text-pink-400"></i>
                <p class="text-xl">Hasil panduan ukuran akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi produk dan pengukuran tubuh, lalu klik Buat Panduan Ukuran</p>
              </div>
              <div id="size-guide-results" class="hidden space-y-6"></div>
              <div id="size-guide-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-pink-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat panduan ukuran...</p>
              </div>
            </div>
          </div>
          
        </main>
        
      </div>
    </div>
  `;

  describe('Component Structure', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render main component container', () => {
      expect(document.getElementById('content-size-guide')).toBeTruthy();
    });

    it('should render header with correct title', () => {
      const header = document.querySelector('#content-size-guide h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('Panduan Ukuran');
    });

    it('should render header with ruler icon', () => {
      const icon = document.querySelector('#content-size-guide h1 i.fas.fa-ruler');
      expect(icon).toBeTruthy();
    });

    it('should render header description', () => {
      const description = document.querySelector('#content-size-guide header p');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('Dapatkan rekomendasi ukuran');
    });

    it('should render main grid layout', () => {
      const main = document.querySelector('#content-size-guide main');
      expect(main).toBeTruthy();
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should render left control panel', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
    });

    it('should render right results panel', () => {
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have 5 step cards in left panel', () => {
      const cards = document.querySelectorAll('.lg\\:col-span-1 .card');
      expect(cards.length).toBe(5);
    });

    it('should render container with proper padding', () => {
      const container = document.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  describe('Image Upload', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render product image input', () => {
      expect(document.getElementById('size-guide-product-image-input')).toBeTruthy();
    });

    it('should have product image input with correct accept attribute', () => {
      const fileInput = document.getElementById('size-guide-product-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should render product image preview container', () => {
      expect(document.getElementById('size-guide-product-image-preview-container')).toBeTruthy();
    });

    it('should render product image preview', () => {
      expect(document.getElementById('size-guide-product-image-preview')).toBeTruthy();
    });

    it('should render remove product image button', () => {
      expect(document.getElementById('size-guide-remove-product-image-btn')).toBeTruthy();
    });

    it('should render upload area with dashed border', () => {
      const uploadArea = document.querySelector('.upload-area .file-input-label');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.classList.contains('border-3')).toBe(true);
      expect(uploadArea.classList.contains('border-dashed')).toBe(true);
      expect(uploadArea.classList.contains('border-pink-300')).toBe(true);
    });

    it('should render upload area with t-shirt icon', () => {
      const icon = document.querySelector('#size-guide-product-image-input + i.fas.fa-tshirt');
      expect(icon).toBeTruthy();
    });

    it('should render upload area with correct instruction text', () => {
      const uploadText = document.querySelector('.upload-area p');
      expect(uploadText).toBeTruthy();
      expect(uploadText.textContent).toContain('Klik atau seret foto produk');
    });

    it('should have preview container initially hidden', () => {
      const previewContainer = document.getElementById('size-guide-product-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should have remove button with times icon', () => {
      const removeBtn = document.getElementById('size-guide-remove-product-image-btn');
      const icon = removeBtn.querySelector('i.fas.fa-times');
      expect(icon).toBeTruthy();
    });

    it('should have preview image with alt text', () => {
      const previewImg = document.getElementById('size-guide-product-image-preview');
      expect(previewImg).toBeTruthy();
      expect(previewImg.alt).toBe('Pratinjau Foto Produk');
    });
  });

  describe('Product Category Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render category select dropdown', () => {
      expect(document.getElementById('size-guide-category-select')).toBeTruthy();
    });

    it('should have 6 product categories', () => {
      const select = document.getElementById('size-guide-category-select');
      const options = select.querySelectorAll('option');
      expect(options.length).toBe(7); // 1 default + 6 categories
    });

    it('should have default placeholder option', () => {
      const select = document.getElementById('size-guide-category-select');
      const defaultOption = select.querySelector('option[value=""]');
      expect(defaultOption).toBeTruthy();
      expect(defaultOption.textContent).toContain('Pilih kategori produk');
    });

    it('should have tops category option', () => {
      const select = document.getElementById('size-guide-category-select');
      const topsOption = select.querySelector('option[value="tops"]');
      expect(topsOption).toBeTruthy();
      expect(topsOption.textContent).toContain('Pakaian Atas');
    });

    it('should have bottoms category option', () => {
      const select = document.getElementById('size-guide-category-select');
      const bottomsOption = select.querySelector('option[value="bottoms"]');
      expect(bottomsOption).toBeTruthy();
      expect(bottomsOption.textContent).toContain('Pakaian Bawah');
    });

    it('should have dresses category option', () => {
      const select = document.getElementById('size-guide-category-select');
      const dressesOption = select.querySelector('option[value="dresses"]');
      expect(dressesOption).toBeTruthy();
      expect(dressesOption.textContent).toContain('Gaun');
    });

    it('should have jackets category option', () => {
      const select = document.getElementById('size-guide-category-select');
      const jacketsOption = select.querySelector('option[value="jackets"]');
      expect(jacketsOption).toBeTruthy();
      expect(jacketsOption.textContent).toContain('Jaket');
    });

    it('should have shoes category option', () => {
      const select = document.getElementById('size-guide-category-select');
      const shoesOption = select.querySelector('option[value="shoes"]');
      expect(shoesOption).toBeTruthy();
      expect(shoesOption.textContent).toContain('Sepatu');
    });

    it('should have bags category option', () => {
      const select = document.getElementById('size-guide-category-select');
      const bagsOption = select.querySelector('option[value="bags"]');
      expect(bagsOption).toBeTruthy();
      expect(bagsOption.textContent).toContain('Tas');
    });

    it('should have category select with pink border styling', () => {
      const select = document.getElementById('size-guide-category-select');
      expect(select.classList.contains('border-2')).toBe(true);
      expect(select.classList.contains('border-pink-300')).toBe(true);
    });
  });

  describe('Size Chart Type Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render chart type options container', () => {
      expect(document.getElementById('size-guide-chart-type-options')).toBeTruthy();
    });

    it('should have 4 chart type buttons', () => {
      const buttons = document.querySelectorAll('.chart-type-btn-size-guide');
      expect(buttons.length).toBe(4);
    });

    it('should have S/M/L/XL/XXL chart type button', () => {
      const smlBtn = document.querySelector('[data-chart-type="sml"]');
      expect(smlBtn).toBeTruthy();
      expect(smlBtn.textContent).toContain('S/M/L/XL/XXL');
    });

    it('should have Angka chart type button', () => {
      const numberBtn = document.querySelector('[data-chart-type="number"]');
      expect(numberBtn).toBeTruthy();
      expect(numberBtn.textContent).toContain('Angka');
    });

    it('should have Internasional chart type button', () => {
      const intlBtn = document.querySelector('[data-chart-type="international"]');
      expect(intlBtn).toBeTruthy();
      expect(intlBtn.textContent).toContain('Internasional');
    });

    it('should have Custom chart type button', () => {
      const customBtn = document.querySelector('[data-chart-type="custom"]');
      expect(customBtn).toBeTruthy();
      expect(customBtn.textContent).toContain('Custom');
    });

    it('should have S/M/L button initially selected', () => {
      const smlBtn = document.querySelector('[data-chart-type="sml"]');
      expect(smlBtn.getAttribute('data-selected')).toBe('true');
      expect(smlBtn.classList.contains('border-pink-400')).toBe(true);
      expect(smlBtn.classList.contains('bg-pink-100')).toBe(true);
    });

    it('should have chart type buttons with icons', () => {
      const thLargeIcon = document.querySelector('[data-chart-type="sml"] i.fas.fa-th-large');
      const hashtagIcon = document.querySelector('[data-chart-type="number"] i.fas.fa-hashtag');
      const globeIcon = document.querySelector('[data-chart-type="international"] i.fas.fa-globe');
      const rulerCombinedIcon = document.querySelector('[data-chart-type="custom"] i.fas.fa-ruler-combined');

      expect(thLargeIcon).toBeTruthy();
      expect(hashtagIcon).toBeTruthy();
      expect(globeIcon).toBeTruthy();
      expect(rulerCombinedIcon).toBeTruthy();
    });
  });

  describe('Body Measurements Input', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render height input field', () => {
      expect(document.getElementById('size-guide-height')).toBeTruthy();
    });

    it('should render weight input field', () => {
      expect(document.getElementById('size-guide-weight')).toBeTruthy();
    });

    it('should render chest input field', () => {
      expect(document.getElementById('size-guide-chest')).toBeTruthy();
    });

    it('should render waist input field', () => {
      expect(document.getElementById('size-guide-waist')).toBeTruthy();
    });

    it('should render hip input field', () => {
      expect(document.getElementById('size-guide-hip')).toBeTruthy();
    });

    it('should have height input with correct label', () => {
      const label = document.querySelector('label[for="size-guide-height"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Tinggi Badan');
      expect(label.textContent).toContain('cm');
    });

    it('should have weight input with correct label', () => {
      const label = document.querySelector('label[for="size-guide-weight"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Berat Badan');
      expect(label.textContent).toContain('kg');
    });

    it('should have chest input with correct label', () => {
      const label = document.querySelector('label[for="size-guide-chest"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Lingkar Dada');
      expect(label.textContent).toContain('cm');
    });

    it('should have waist input with correct label', () => {
      const label = document.querySelector('label[for="size-guide-waist"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Lingkar Pinggang');
      expect(label.textContent).toContain('cm');
    });

    it('should have hip input with correct label', () => {
      const label = document.querySelector('label[for="size-guide-hip"]');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Lingkar Pinggul');
      expect(label.textContent).toContain('cm');
    });

    it('should have measurement inputs with number type', () => {
      const heightInput = document.getElementById('size-guide-height');
      const weightInput = document.getElementById('size-guide-weight');
      const chestInput = document.getElementById('size-guide-chest');
      const waistInput = document.getElementById('size-guide-waist');
      const hipInput = document.getElementById('size-guide-hip');

      expect(heightInput.type).toBe('number');
      expect(weightInput.type).toBe('number');
      expect(chestInput.type).toBe('number');
      expect(waistInput.type).toBe('number');
      expect(hipInput.type).toBe('number');
    });

    it('should have measurement inputs with placeholders', () => {
      const heightInput = document.getElementById('size-guide-height');
      const weightInput = document.getElementById('size-guide-weight');
      const chestInput = document.getElementById('size-guide-chest');
      const waistInput = document.getElementById('size-guide-waist');
      const hipInput = document.getElementById('size-guide-hip');

      expect(heightInput.placeholder).toBe('170');
      expect(weightInput.placeholder).toBe('65');
      expect(chestInput.placeholder).toBe('90');
      expect(waistInput.placeholder).toBe('75');
      expect(hipInput.placeholder).toBe('95');
    });

    it('should have measurement inputs with pink border styling', () => {
      const inputs = [
        document.getElementById('size-guide-height'),
        document.getElementById('size-guide-weight'),
        document.getElementById('size-guide-chest'),
        document.getElementById('size-guide-waist'),
        document.getElementById('size-guide-hip')
      ];

      inputs.forEach(input => {
        expect(input.classList.contains('border-2')).toBe(true);
        expect(input.classList.contains('border-pink-300')).toBe(true);
      });
    });

    it('should have measurement inputs with icons', () => {
      const heightIcon = document.querySelector('#size-guide-height + i, label[for="size-guide-height"] i.fas.fa-arrows-alt-v');
      const weightIcon = document.querySelector('#size-guide-weight + i, label[for="size-guide-weight"] i.fas.fa-weight');
      const chestIcon = document.querySelector('#size-guide-chest + i, label[for="size-guide-chest"] i.fas.fa-chest-alt');
      const waistIcon = document.querySelector('#size-guide-waist + i, label[for="size-guide-waist"] i.fas.fa-circle');
      const hipIcon = document.querySelector('#size-guide-hip + i, label[for="size-guide-hip"] i.fas.fa-hippo');

      expect(heightIcon).toBeTruthy();
      expect(weightIcon).toBeTruthy();
      expect(chestIcon).toBeTruthy();
      expect(waistIcon).toBeTruthy();
      expect(hipIcon).toBeTruthy();
    });
  });

  describe('Fit Preference Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render fit options container', () => {
      expect(document.getElementById('size-guide-fit-options')).toBeTruthy();
    });

    it('should have 4 fit preference buttons', () => {
      const buttons = document.querySelectorAll('.fit-btn-size-guide');
      expect(buttons.length).toBe(4);
    });

    it('should have Slim Fit button', () => {
      const slimBtn = document.querySelector('[data-fit="slim"]');
      expect(slimBtn).toBeTruthy();
      expect(slimBtn.textContent).toContain('Slim Fit');
    });

    it('should have Regular Fit button', () => {
      const regularBtn = document.querySelector('[data-fit="regular"]');
      expect(regularBtn).toBeTruthy();
      expect(regularBtn.textContent).toContain('Regular Fit');
    });

    it('should have Loose Fit button', () => {
      const looseBtn = document.querySelector('[data-fit="loose"]');
      expect(looseBtn).toBeTruthy();
      expect(looseBtn.textContent).toContain('Loose Fit');
    });

    it('should have Oversized button', () => {
      const oversizedBtn = document.querySelector('[data-fit="oversized"]');
      expect(oversizedBtn).toBeTruthy();
      expect(oversizedBtn.textContent).toContain('Oversized');
    });

    it('should have Slim Fit button initially selected', () => {
      const slimBtn = document.querySelector('[data-fit="slim"]');
      expect(slimBtn.getAttribute('data-selected')).toBe('true');
      expect(slimBtn.classList.contains('border-pink-400')).toBe(true);
      expect(slimBtn.classList.contains('bg-pink-100')).toBe(true);
    });

    it('should have fit preference buttons with icons', () => {
      const compressIcon = document.querySelector('[data-fit="slim"] i.fas.fa-compress-arrows-alt');
      const arrowsHIcon = document.querySelector('[data-fit="regular"] i.fas.fa-arrows-alt-h');
      const expandArrowsIcon = document.querySelector('[data-fit="loose"] i.fas.fa-expand-arrows-alt');
      const expandIcon = document.querySelector('[data-fit="oversized"] i.fas.fa-expand');

      expect(compressIcon).toBeTruthy();
      expect(arrowsHIcon).toBeTruthy();
      expect(expandArrowsIcon).toBeTruthy();
      expect(expandIcon).toBeTruthy();
    });
  });

  describe('Generate Button', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render generate button', () => {
      expect(document.getElementById('size-guide-generate-btn')).toBeTruthy();
    });

    it('should have generate button with correct text', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Panduan Ukuran');
    });

    it('should have generate button with magic icon', () => {
      const magicIcon = document.querySelector('#size-guide-generate-btn i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have generate button initially disabled', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have generate button with gradient styling', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-400')).toBe(true);
    });

    it('should have generate button with shadow styling', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have generate button with proper padding', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
    });

    it('should have generate button with rounded corners', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
    });

    it('should have generate button with bold text', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
    });

    it('should have generate button with white text', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('text-white')).toBe(true);
    });

    it('should have generate button with full width', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
    });
  });

  describe('Results Area', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render results container', () => {
      expect(document.getElementById('size-guide-results-container')).toBeTruthy();
    });

    it('should render empty state', () => {
      expect(document.getElementById('size-guide-empty-state')).toBeTruthy();
    });

    it('should render results area', () => {
      expect(document.getElementById('size-guide-results')).toBeTruthy();
    });

    it('should render loading indicator', () => {
      expect(document.getElementById('size-guide-loading')).toBeTruthy();
    });

    it('should have empty state with ruler icon', () => {
      const icon = document.querySelector('#size-guide-empty-state i.fas.fa-ruler');
      expect(icon).toBeTruthy();
    });

    it('should have empty state with correct text', () => {
      const emptyState = document.getElementById('size-guide-empty-state');
      expect(emptyState.textContent).toContain('Hasil panduan ukuran akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi produk dan pengukuran tubuh');
    });

    it('should have results container with minimum height', () => {
      const resultsContainer = document.getElementById('size-guide-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have results area initially hidden', () => {
      const results = document.getElementById('size-guide-results');
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should have loading indicator initially hidden', () => {
      const loading = document.getElementById('size-guide-loading');
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have empty state initially visible', () => {
      const emptyState = document.getElementById('size-guide-empty-state');
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have loading indicator with loader', () => {
      const loader = document.querySelector('#size-guide-loading .loader');
      expect(loader).toBeTruthy();
    });

    it('should have loading indicator with loading text', () => {
      const loadingText = document.querySelector('#size-guide-loading p');
      expect(loadingText).toBeTruthy();
      expect(loadingText.textContent).toContain('Sedang membuat panduan ukuran');
    });
  });

  describe('Card Styling', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have cards with white background', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have cards with padding', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
      });
    });

    it('should have cards with rounded corners', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('rounded-2xl')).toBe(true);
      });
    });

    it('should have cards with shadow', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('shadow-lg')).toBe(true);
      });
    });

    it('should have step headings with proper styling', () => {
      const headings = document.querySelectorAll('.card h2');
      headings.forEach(heading => {
        expect(heading.classList.contains('text-xl')).toBe(true);
        expect(heading.classList.contains('font-semibold')).toBe(true);
        expect(heading.classList.contains('mb-4')).toBe(true);
        expect(heading.classList.contains('text-gray-800')).toBe(true);
      });
    });
  });

  describe('Icons (FontAwesome)', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have ruler icon in header', () => {
      const icon = document.querySelector('#content-size-guide h1 i.fas.fa-ruler');
      expect(icon).toBeTruthy();
    });

    it('should have t-shirt icon in upload area', () => {
      const icon = document.querySelector('#size-guide-product-image-input + i.fas.fa-tshirt');
      expect(icon).toBeTruthy();
    });

    it('should have times icon in remove button', () => {
      const icon = document.querySelector('#size-guide-remove-product-image-btn i.fas.fa-times');
      expect(icon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const icon = document.querySelector('#size-guide-generate-btn i.fas.fa-magic');
      expect(icon).toBeTruthy();
    });

    it('should have ruler icon in empty state', () => {
      const icon = document.querySelector('#size-guide-empty-state i.fas.fa-ruler');
      expect(icon).toBeTruthy();
    });

    it('should have chart type icons', () => {
      const icons = document.querySelectorAll('#size-guide-chart-type-options i.fas');
      expect(icons.length).toBe(4);
    });

    it('should have fit preference icons', () => {
      const icons = document.querySelectorAll('#size-guide-fit-options i.fas');
      expect(icons.length).toBe(4);
    });

    it('should have measurement input icons', () => {
      const icons = document.querySelectorAll('.card:nth-of-type(4) i.fas');
      expect(icons.length).toBe(5);
    });
  });

  describe('Text Content (Indonesian)', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have Indonesian header title', () => {
      const header = document.querySelector('#content-size-guide h1');
      expect(header.textContent).toContain('Panduan Ukuran');
    });

    it('should have Indonesian header description', () => {
      const description = document.querySelector('#content-size-guide header p');
      expect(description.textContent).toContain('Dapatkan rekomendasi ukuran yang tepat');
    });

    it('should have Indonesian step 1 heading', () => {
      const step1 = document.querySelector('.card:nth-of-type(1) h2');
      expect(step1.textContent).toContain('Unggah Foto Produk');
    });

    it('should have Indonesian step 2 heading', () => {
      const step2 = document.querySelector('.card:nth-of-type(2) h2');
      expect(step2.textContent).toContain('Kategori Produk');
    });

    it('should have Indonesian step 3 heading', () => {
      const step3 = document.querySelector('.card:nth-of-type(3) h2');
      expect(step3.textContent).toContain('Tipe Size Chart');
    });

    it('should have Indonesian step 4 heading', () => {
      const step4 = document.querySelector('.card:nth-of-type(4) h2');
      expect(step4.textContent).toContain('Pengukuran Tubuh');
    });

    it('should have Indonesian step 5 heading', () => {
      const step5 = document.querySelector('.card:nth-of-type(5) h2');
      expect(step5.textContent).toContain('Preferensi Fit');
    });

    it('should have Indonesian generate button text', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Panduan Ukuran');
    });

    it('should have Indonesian empty state text', () => {
      const emptyState = document.getElementById('size-guide-empty-state');
      expect(emptyState.textContent).toContain('Hasil panduan ukuran akan muncul di sini');
    });

    it('should have Indonesian loading text', () => {
      const loadingText = document.querySelector('#size-guide-loading p');
      expect(loadingText.textContent).toContain('Sedang membuat panduan ukuran');
    });

    it('should have Indonesian measurement labels', () => {
      const labels = document.querySelectorAll('.card:nth-of-type(4) label');
      expect(labels[0].textContent).toContain('Tinggi Badan');
      expect(labels[1].textContent).toContain('Berat Badan');
      expect(labels[2].textContent).toContain('Lingkar Dada');
      expect(labels[3].textContent).toContain('Lingkar Pinggang');
      expect(labels[4].textContent).toContain('Lingkar Pinggul');
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
      const h1 = document.querySelector('#content-size-guide h1');
      const h2Elements = document.querySelectorAll('#content-size-guide h2');

      expect(h1).toBeTruthy();
      expect(h2Elements.length).toBe(5);
    });

    it('should have labels for form controls', () => {
      const heightLabel = document.querySelector('label[for="size-guide-height"]');
      const weightLabel = document.querySelector('label[for="size-guide-weight"]');
      const chestLabel = document.querySelector('label[for="size-guide-chest"]');
      const waistLabel = document.querySelector('label[for="size-guide-waist"]');
      const hipLabel = document.querySelector('label[for="size-guide-hip"]');

      expect(heightLabel).toBeTruthy();
      expect(weightLabel).toBeTruthy();
      expect(chestLabel).toBeTruthy();
      expect(waistLabel).toBeTruthy();
      expect(hipLabel).toBeTruthy();
    });

    it('should have file input with label association', () => {
      const fileInput = document.getElementById('size-guide-product-image-input');
      const label = document.querySelector('label[for="size-guide-product-image-input"]');

      expect(fileInput).toBeTruthy();
      expect(label).toBeTruthy();
    });

    it('should have select with label association', () => {
      const select = document.getElementById('size-guide-category-select');
      const card = select.closest('.card');
      const heading = card.querySelector('h2');

      expect(select).toBeTruthy();
      expect(heading).toBeTruthy();
    });

    it('should have button elements for interactive options', () => {
      const chartTypeBtns = document.querySelectorAll('.chart-type-btn-size-guide');
      const fitBtns = document.querySelectorAll('.fit-btn-size-guide');

      expect(chartTypeBtns.length).toBe(4);
      expect(fitBtns.length).toBe(4);
    });

    it('should have proper alt text for images', () => {
      const previewImg = document.getElementById('size-guide-product-image-preview');
      expect(previewImg.alt).toBe('Pratinjau Foto Produk');
    });

    it('should have icons for visual enhancement', () => {
      const rulerIcon = document.querySelector('#content-size-guide h1 i.fas.fa-ruler');
      const tshirtIcon = document.querySelector('#size-guide-product-image-input + i.fas.fa-tshirt');
      const magicIcon = document.querySelector('#size-guide-generate-btn i.fas.fa-magic');

      expect(rulerIcon).toBeTruthy();
      expect(tshirtIcon).toBeTruthy();
      expect(magicIcon).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have responsive grid layout', () => {
      const main = document.querySelector('#content-size-guide main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive gap', () => {
      const main = document.querySelector('#content-size-guide main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive header text size', () => {
      const header = document.querySelector('#content-size-guide h1');
      expect(header.classList.contains('text-4xl')).toBe(true);
      expect(header.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have left panel span 1 column on mobile', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
    });

    it('should have right panel span 2 columns on desktop', () => {
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have responsive container padding', () => {
      const container = document.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });
  });

  describe('Color Scheme (pink/rose)', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have pink gradient in header', () => {
      const header = document.querySelector('#content-size-guide h1');
      expect(header.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(header.classList.contains('from-pink-500')).toBe(true);
      expect(header.classList.contains('to-rose-400')).toBe(true);
    });

    it('should have pink text color in header', () => {
      const header = document.querySelector('#content-size-guide h1');
      expect(header.classList.contains('bg-clip-text')).toBe(true);
      expect(header.classList.contains('text-transparent')).toBe(true);
    });

    it('should have pink border in upload area', () => {
      const uploadArea = document.querySelector('.upload-area .file-input-label');
      expect(uploadArea.classList.contains('border-pink-300')).toBe(true);
    });

    it('should have pink border on hover in upload area', () => {
      const uploadArea = document.querySelector('.upload-area .file-input-label');
      expect(uploadArea.classList.contains('hover:border-pink-500')).toBe(true);
    });

    it('should have pink icons in upload area', () => {
      const icon = document.querySelector('#size-guide-product-image-input + i.fas');
      expect(icon.classList.contains('text-pink-400')).toBe(true);
    });

    it('should have pink border in category select', () => {
      const select = document.getElementById('size-guide-category-select');
      expect(select.classList.contains('border-pink-300')).toBe(true);
    });

    it('should have pink border on focus in category select', () => {
      const select = document.getElementById('size-guide-category-select');
      expect(select.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should have pink border in measurement inputs', () => {
      const inputs = [
        document.getElementById('size-guide-height'),
        document.getElementById('size-guide-weight'),
        document.getElementById('size-guide-chest'),
        document.getElementById('size-guide-waist'),
        document.getElementById('size-guide-hip')
      ];

      inputs.forEach(input => {
        expect(input.classList.contains('border-pink-300')).toBe(true);
      });
    });

    it('should have pink border on focus in measurement inputs', () => {
      const inputs = [
        document.getElementById('size-guide-height'),
        document.getElementById('size-guide-weight'),
        document.getElementById('size-guide-chest'),
        document.getElementById('size-guide-waist'),
        document.getElementById('size-guide-hip')
      ];

      inputs.forEach(input => {
        expect(input.classList.contains('focus:border-pink-500')).toBe(true);
      });
    });

    it('should have pink icons in measurement labels', () => {
      const icons = document.querySelectorAll('.card:nth-of-type(4) i.fas');
      icons.forEach(icon => {
        expect(icon.classList.contains('text-pink-500')).toBe(true);
      });
    });

    it('should have pink background in selected chart type button', () => {
      const selectedBtn = document.querySelector('.chart-type-btn-size-guide[data-selected="true"]');
      expect(selectedBtn.classList.contains('bg-pink-100')).toBe(true);
      expect(selectedBtn.classList.contains('border-pink-400')).toBe(true);
    });

    it('should have pink background in selected fit button', () => {
      const selectedBtn = document.querySelector('.fit-btn-size-guide[data-selected="true"]');
      expect(selectedBtn.classList.contains('bg-pink-100')).toBe(true);
      expect(selectedBtn.classList.contains('border-pink-400')).toBe(true);
    });

    it('should have pink gradient in generate button', () => {
      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-400')).toBe(true);
    });

    it('should have pink icons in empty state', () => {
      const icon = document.querySelector('#size-guide-empty-state i.fas');
      expect(icon.classList.contains('text-pink-400')).toBe(true);
    });

    it('should have pink loader in loading indicator', () => {
      const loader = document.querySelector('#size-guide-loading .loader');
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have main content panel with hidden class', () => {
      const contentPanel = document.getElementById('content-size-guide');
      expect(contentPanel.classList.contains('main-content-panel')).toBe(true);
      expect(contentPanel.classList.contains('hidden')).toBe(true);
    });

    it('should have all required element IDs', () => {
      const requiredIds = [
        'content-size-guide',
        'size-guide-product-image-input',
        'size-guide-product-image-preview-container',
        'size-guide-product-image-preview',
        'size-guide-remove-product-image-btn',
        'size-guide-category-select',
        'size-guide-chart-type-options',
        'size-guide-fit-options',
        'size-guide-height',
        'size-guide-weight',
        'size-guide-chest',
        'size-guide-waist',
        'size-guide-hip',
        'size-guide-generate-btn',
        'size-guide-results-container',
        'size-guide-empty-state',
        'size-guide-results',
        'size-guide-loading'
      ];

      requiredIds.forEach(id => {
        expect(document.getElementById(id)).toBeTruthy();
      });
    });

    it('should have proper space-y-6 for vertical spacing', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper space-y-3 for button groups', () => {
      const chartTypeOptions = document.getElementById('size-guide-chart-type-options');
      const fitOptions = document.getElementById('size-guide-fit-options');

      expect(chartTypeOptions.classList.contains('space-y-3')).toBe(true);
      expect(fitOptions.classList.contains('space-y-3')).toBe(true);
    });

    it('should have proper space-y-4 for measurement inputs', () => {
      const measurementsContainer = document.querySelector('.card:nth-of-type(4) .space-y-4');
      expect(measurementsContainer).toBeTruthy();
    });

    it('should have proper space-y-6 for results', () => {
      const results = document.getElementById('size-guide-results');
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should have all step cards with proper structure', () => {
      const cards = document.querySelectorAll('.lg\\:col-span-1 .card');
      cards.forEach((card, index) => {
        expect(card.querySelector('h2')).toBeTruthy();
        expect(card.querySelector('h2').textContent).toContain(`${index + 1}.`);
      });
    });

    it('should have proper transition classes for interactive elements', () => {
      const uploadArea = document.querySelector('.upload-area .file-input-label');
      expect(uploadArea.classList.contains('transition-colors')).toBe(true);

      const chartTypeBtns = document.querySelectorAll('.chart-type-btn-size-guide');
      chartTypeBtns.forEach(btn => {
        expect(btn.classList.contains('transition')).toBe(true);
      });

      const fitBtns = document.querySelectorAll('.fit-btn-size-guide');
      fitBtns.forEach(btn => {
        expect(btn.classList.contains('transition')).toBe(true);
      });

      const generateBtn = document.getElementById('size-guide-generate-btn');
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });
});
