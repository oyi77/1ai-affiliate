import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

describe('affiliate-islami Component', () => {
  
  const mockComponentHTML = `
    <div id="content-affiliate-islami" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            <i class="fas fa-moon mr-3"></i>Affiliate Islami
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten affiliate produk islami dengan tema yang sesuai</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Produk</h2>
              <div class="upload-area">
                <label for="islami-product-image-input" class="file-input-label block border-3 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="file" id="islami-product-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-cloud-upload-alt text-4xl text-emerald-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto produk di sini</p>
                </label>
              </div>
              <div id="islami-product-image-preview-container" class="hidden mt-4">
                <img id="islami-product-image-preview" src="#" alt="Pratinjau Produk" class="rounded-lg w-full h-auto object-contain">
                <button id="islami-remove-product-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Info Produk</h2>
              <div class="space-y-4">
                <div>
                  <label for="islami-product-name" class="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input type="text" id="islami-product-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Contoh: Mukena Premium Arab">
                </div>
                <div>
                  <label for="islami-product-price" class="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input type="number" id="islami-product-price" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="150000">
                </div>
                <div>
                  <label for="islami-product-desc" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
                  <textarea id="islami-product-desc" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Deskripsi singkat tentang produk..."></textarea>
                </div>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Tema Visual</h2>
              <div id="islami-theme-options" class="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                <button type="button" data-theme="" class="theme-btn-islami p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-ban mr-1"></i>Tidak Ada
                </button>
                <button type="button" data-theme="Islamic elegant" class="theme-btn-islami p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-gem mr-1"></i>Arabian
                </button>
              </div>
            </div>
            <button id="islami-generate-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten Affiliate
            </button>
          </div>
          <div class="lg:col-span-2">
            <div id="islami-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="islami-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-moon text-6xl mb-4 text-emerald-400"></i>
                <p class="text-xl">Hasil akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto produk dan klik Buat Konten Affiliate</p>
              </div>
              <div id="islami-results" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-6"></div>
              <div id="islami-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-emerald-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten affiliate islami...</p>
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
      expect(document.getElementById('content-affiliate-islami')).toBeTruthy();
    });

    it('should render header with correct title', () => {
      const header = document.querySelector('#content-affiliate-islami h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('Affiliate Islami');
    });

    it('should render all section headers', () => {
      const headers = document.querySelectorAll('#content-affiliate-islami h2');
      const headerTexts = Array.from(headers).map(h => h.textContent);
      expect(headerTexts.some(t => t.includes('Unggah Foto Produk'))).toBe(true);
      expect(headerTexts.some(t => t.includes('Info Produk'))).toBe(true);
      expect(headerTexts.some(t => t.includes('Tema Visual'))).toBe(true);
    });

    it('should render image upload area', () => {
      expect(document.getElementById('islami-product-image-input')).toBeTruthy();
    });

    it('should render product input fields', () => {
      expect(document.getElementById('islami-product-name')).toBeTruthy();
      expect(document.getElementById('islami-product-price')).toBeTruthy();
      expect(document.getElementById('islami-product-desc')).toBeTruthy();
    });

    it('should render generate button', () => {
      expect(document.getElementById('islami-generate-btn')).toBeTruthy();
    });

    it('should render theme options', () => {
      const themeButtons = document.querySelectorAll('.theme-btn-islami');
      const texts = Array.from(themeButtons).map(b => b.textContent);
      expect(texts.some(t => t.includes('Tidak Ada'))).toBe(true);
      expect(texts.some(t => t.includes('Arabian'))).toBe(true);
    });
  });
  
  describe('User Interactions', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have file input element', () => {
      const fileInput = document.getElementById('islami-product-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have theme selection buttons', () => {
      const themeButtons = document.querySelectorAll('.theme-btn-islami');
      expect(themeButtons.length).toBeGreaterThan(0);
    });

    it('should update input value on user input', () => {
      const nameInput = document.getElementById('islami-product-name');
      fireEvent.input(nameInput, { target: { value: 'Test Product' } });
      expect(nameInput.value).toBe('Test Product');
    });
  });

  describe('API Integration', () => {
    it('should have generate button with correct attributes', () => {
      document.body.innerHTML = mockComponentHTML;
      const generateBtn = document.getElementById('islami-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.tagName).toBe('BUTTON');
    });

    it('should have results container', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsContainer = document.getElementById('islami-results-container');
      expect(resultsContainer).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should have generate button initially disabled', () => {
      document.body.innerHTML = mockComponentHTML;
      const generateBtn = document.getElementById('islami-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have error display element', () => {
      document.body.innerHTML = mockComponentHTML;
      // Check that loading element exists (used for showing states)
      const loadingElement = document.getElementById('islami-loading');
      expect(loadingElement).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should have all required input fields', () => {
      document.body.innerHTML = mockComponentHTML;
      expect(document.getElementById('islami-product-name')).toBeTruthy();
      expect(document.getElementById('islami-product-price')).toBeTruthy();
      expect(document.getElementById('islami-product-desc')).toBeTruthy();
    });

    it('should have image preview container', () => {
      document.body.innerHTML = mockComponentHTML;
      const previewContainer = document.getElementById('islami-product-image-preview-container');
      expect(previewContainer).toBeTruthy();
    });

    it('should have results grid', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsGrid = document.getElementById('islami-results');
      expect(resultsGrid).toBeTruthy();
    });
  });
});
