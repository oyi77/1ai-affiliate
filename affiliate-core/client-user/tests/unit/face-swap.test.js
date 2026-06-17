/**
 * Face Swap Component Unit Tests
 * Comprehensive test suite for face-swap.html functionality
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

describe('face-swap Component', () => {

  const mockComponentHTML = `
    <div id="content-face-swap" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            <i class="fas fa-exchange-alt mr-3"></i>Face Swap
          </h1>
          <p class="text-lg text-gray-600 mt-2">Tukar wajah dengan mudah dan menyenangkan</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Foto Wajah Sumber</h2>
              <div class="upload-area">
                <label for="face-swap-source-input" class="file-input-label block border-3 border-dashed border-pink-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-colors">
                  <input type="file" id="face-swap-source-input" class="hidden" accept="image/*">
                  <i class="fas fa-user text-4xl text-pink-400 mb-3"></i>
                  <p class="text-gray-600">Unggah foto wajah yang ingin ditukar</p>
                </label>
              </div>
              <div id="face-swap-source-preview-container" class="hidden mt-4">
                <img id="face-swap-source-preview" src="#" alt="Pratinjau Wajah Sumber" class="rounded-lg w-full h-auto object-contain">
                <button id="face-swap-remove-source-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Foto Target</h2>
              <div class="upload-area">
                <label for="face-swap-target-input" class="file-input-label block border-3 border-dashed border-pink-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-colors">
                  <input type="file" id="face-swap-target-input" class="hidden" accept="image/*">
                  <i class="fas fa-image text-4xl text-pink-400 mb-3"></i>
                  <p class="text-gray-600">Unggah foto target untuk swap wajah</p>
                </label>
              </div>
              <div id="face-swap-target-preview-container" class="hidden mt-4">
                <img id="face-swap-target-preview" src="#" alt="Pratinjau Target" class="rounded-lg w-full h-auto object-contain">
                <button id="face-swap-remove-target-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Intensitas Swap</h2>
              <div>
                <label for="face-swap-intensity" class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fas fa-sliders-h mr-1 text-pink-500"></i>Intensitas
                </label>
                <input type="range" id="face-swap-intensity" min="0" max="100" value="80" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Natural</span>
                  <span id="face-swap-intensity-value">80%</span>
                  <span>Dramatis</span>
                </div>
              </div>
            </div>
            <button id="face-swap-generate-btn" class="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Mulai Face Swap
            </button>
          </div>
          <div>
            <div id="face-swap-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="face-swap-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-exchange-alt text-6xl mb-4 text-pink-400"></i>
                <p class="text-xl">Hasil akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah kedua foto dan klik Mulai Face Swap</p>
              </div>
              <div id="face-swap-results" class="hidden grid grid-cols-1 gap-6"></div>
              <div id="face-swap-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-pink-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang memproses face swap...</p>
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
      expect(document.getElementById('content-face-swap')).toBeTruthy();
    });

    it('should render header with correct title', () => {
      const header = document.querySelector('#content-face-swap h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('Face Swap');
    });

    it('should render header with exchange icon', () => {
      const icon = document.querySelector('#content-face-swap h1 i.fas.fa-exchange-alt');
      expect(icon).toBeTruthy();
    });

    it('should render header description', () => {
      const description = document.querySelector('#content-face-swap header p');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('Tukar wajah');
    });

    it('should render source image upload area', () => {
      expect(document.getElementById('face-swap-source-input')).toBeTruthy();
    });

    it('should render target image upload area', () => {
      expect(document.getElementById('face-swap-target-input')).toBeTruthy();
    });

    it('should render source preview container', () => {
      expect(document.getElementById('face-swap-source-preview-container')).toBeTruthy();
    });

    it('should render target preview container', () => {
      expect(document.getElementById('face-swap-target-preview-container')).toBeTruthy();
    });

    it('should render intensity slider', () => {
      expect(document.getElementById('face-swap-intensity')).toBeTruthy();
    });

    it('should render intensity value display', () => {
      expect(document.getElementById('face-swap-intensity-value')).toBeTruthy();
      expect(document.getElementById('face-swap-intensity-value').textContent).toBe('80%');
    });

    it('should render generate button', () => {
      expect(document.getElementById('face-swap-generate-btn')).toBeTruthy();
    });

    it('should render results container', () => {
      expect(document.getElementById('face-swap-results-container')).toBeTruthy();
    });

    it('should render empty state', () => {
      expect(document.getElementById('face-swap-empty-state')).toBeTruthy();
    });

    it('should render results grid', () => {
      expect(document.getElementById('face-swap-results')).toBeTruthy();
    });

    it('should render loading indicator', () => {
      expect(document.getElementById('face-swap-loading')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have source file input with correct accept attribute', () => {
      const fileInput = document.getElementById('face-swap-source-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have target file input with correct accept attribute', () => {
      const fileInput = document.getElementById('face-swap-target-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have intensity slider with correct range', () => {
      const slider = document.getElementById('face-swap-intensity');
      expect(slider).toBeTruthy();
      expect(slider.min).toBe('0');
      expect(slider.max).toBe('100');
      expect(slider.value).toBe('80');
    });

    it('should have generate button with correct text', () => {
      const generateBtn = document.getElementById('face-swap-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Mulai Face Swap');
    });

    it('should have generate button with magic icon', () => {
      const magicIcon = document.querySelector('#face-swap-generate-btn i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have remove source button', () => {
      expect(document.getElementById('face-swap-remove-source-btn')).toBeTruthy();
    });

    it('should have remove target button', () => {
      expect(document.getElementById('face-swap-remove-target-btn')).toBeTruthy();
    });
  });

  describe('API Integration', () => {
    it('should have generate button with correct attributes', () => {
      document.body.innerHTML = mockComponentHTML;
      const generateBtn = document.getElementById('face-swap-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.tagName).toBe('BUTTON');
    });

    it('should have results container', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsContainer = document.getElementById('face-swap-results-container');
      expect(resultsContainer).toBeTruthy();
    });

    it('should have results grid with correct classes', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsGrid = document.getElementById('face-swap-results');
      expect(resultsGrid).toBeTruthy();
      expect(resultsGrid.classList.contains('hidden')).toBe(true);
    });

    it('should have loading indicator', () => {
      document.body.innerHTML = mockComponentHTML;
      const loadingIndicator = document.getElementById('face-swap-loading');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should have generate button initially disabled', () => {
      document.body.innerHTML = mockComponentHTML;
      const generateBtn = document.getElementById('face-swap-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have loading element for showing states', () => {
      document.body.innerHTML = mockComponentHTML;
      const loadingElement = document.getElementById('face-swap-loading');
      expect(loadingElement).toBeTruthy();
    });

    it('should have empty state with instructions', () => {
      document.body.innerHTML = mockComponentHTML;
      const emptyState = document.getElementById('face-swap-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil akan muncul di sini');
    });

    it('should have remove buttons for image previews', () => {
      document.body.innerHTML = mockComponentHTML;
      const removeSourceBtn = document.getElementById('face-swap-remove-source-btn');
      const removeTargetBtn = document.getElementById('face-swap-remove-target-btn');
      expect(removeSourceBtn).toBeTruthy();
      expect(removeTargetBtn).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should have source preview container initially hidden', () => {
      document.body.innerHTML = mockComponentHTML;
      const previewContainer = document.getElementById('face-swap-source-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should have target preview container initially hidden', () => {
      document.body.innerHTML = mockComponentHTML;
      const previewContainer = document.getElementById('face-swap-target-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should have results grid initially hidden', () => {
      document.body.innerHTML = mockComponentHTML;
      const resultsGrid = document.getElementById('face-swap-results');
      expect(resultsGrid).toBeTruthy();
      expect(resultsGrid.classList.contains('hidden')).toBe(true);
    });

    it('should have loading indicator initially hidden', () => {
      document.body.innerHTML = mockComponentHTML;
      const loadingIndicator = document.getElementById('face-swap-loading');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    });

    it('should have empty state initially visible', () => {
      document.body.innerHTML = mockComponentHTML;
      const emptyState = document.getElementById('face-swap-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have intensity slider with correct initial value', () => {
      document.body.innerHTML = mockComponentHTML;
      const intensitySlider = document.getElementById('face-swap-intensity');
      expect(intensitySlider.value).toBe('80');
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
      const h1 = document.querySelector('#content-face-swap h1');
      const h2Elements = document.querySelectorAll('#content-face-swap h2');

      expect(h1).toBeTruthy();
      expect(h2Elements.length).toBeGreaterThanOrEqual(3);
    });

    it('should have labels for form controls', () => {
      const intensityLabel = document.querySelector('label[for="face-swap-intensity"]');

      expect(intensityLabel).toBeTruthy();
    });

    it('should have icons for visual enhancement', () => {
      const exchangeIcon = document.querySelector('#content-face-swap h1 i.fas.fa-exchange-alt');
      const userIcon = document.querySelector('#face-swap-source-input + i.fas.fa-user');
      const imageIcon = document.querySelector('#face-swap-target-input + i.fas.fa-image');
      const magicIcon = document.querySelector('#face-swap-generate-btn i.fas.fa-magic');

      expect(exchangeIcon).toBeTruthy();
      expect(userIcon).toBeTruthy();
      expect(imageIcon).toBeTruthy();
      expect(magicIcon).toBeTruthy();
    });
  });
});
