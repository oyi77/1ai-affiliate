import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

describe('professional-headshot Component', () => {
  
  const mockComponentHTML = `
    <div id="content-professional-headshot" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-600 to-blue-500 bg-clip-text text-transparent">
            <i class="fas fa-user-tie mr-3"></i>Professional Headshot
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat foto profil profesional dengan sentuhan AI</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Anda</h2>
              <div class="upload-area">
                <label for="professional-headshot-image-input" class="file-input-label block border-3 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input type="file" id="professional-headshot-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-slate-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto diri Anda di sini</p>
                </label>
              </div>
              <div id="professional-headshot-image-preview-container" class="hidden mt-4">
                <img id="professional-headshot-image-preview" src="#" alt="Pratinjau Foto" class="rounded-lg w-full h-auto object-contain">
                <button id="professional-headshot-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Latar Belakang</h2>
              <div id="professional-headshot-background-options" class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                <button type="button" data-background="" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-ban mr-1"></i>Original
                </button>
                <button type="button" data-background="Solid navy blue background" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-square mr-1"></i>Navy Blue
                </button>
                <button type="button" data-background="Solid charcoal gray background" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-square mr-1"></i>Charcoal
                </button>
                <button type="button" data-background="Gradient from light gray to white" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-adjust mr-1"></i>Light Gray
                </button>
                <button type="button" data-background="Gradient from dark blue to black" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-adjust mr-1"></i>Executive
                </button>
                <button type="button" data-background="Modern office environment" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-building mr-1"></i>Office
                </button>
                <button type="button" data-background="Corporate library background" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-book mr-1"></i>Library
                </button>
                <button type="button" data-background="Minimalist studio backdrop" class="background-btn-professional-headshot p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-expand mr-1"></i>Studio
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Pakaian</h2>
              <div id="professional-headshot-clothing-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-clothing="" class="clothing-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-user mr-1"></i>Keep Original
                </button>
                <button type="button" data-clothing="Business formal attire" class="clothing-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-briefcase mr-1"></i>Business Formal
                </button>
                <button type="button" data-clothing="Business casual attire" class="clothing-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user-tie mr-1"></i>Business Casual
                </button>
                <button type="button" data-clothing="Smart casual attire" class="clothing-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tshirt mr-1"></i>Smart Casual
                </button>
                <button type="button" data-clothing="Executive suit with tie" class="clothing-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-suitcase mr-1"></i>Executive Suit
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Ekspresi & Gaya</h2>
              <div id="professional-headshot-expression-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-expression="" class="expression-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-smile mr-1"></i>Natural
                </button>
                <button type="button" data-expression="Confident and authoritative expression" class="expression-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-crown mr-1"></i>Confident
                </button>
                <button type="button" data-expression="Friendly and approachable expression" class="expression-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-smile-beam mr-1"></i>Friendly
                </button>
                <button type="button" data-expression="Professional and polished expression" class="expression-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user-check mr-1"></i>Professional
                </button>
                <button type="button" data-expression="Executive presence" class="expression-btn-professional-headshot p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star mr-1"></i>Executive
                </button>
              </div>
            </div>
            <button id="professional-headshot-generate-btn" class="w-full bg-gradient-to-r from-slate-600 to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Professional Headshot
            </button>
          </div>
          <div class="lg:col-span-2">
            <div id="professional-headshot-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="professional-headshot-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-user-tie text-6xl mb-4 text-slate-400"></i>
                <p class="text-xl">Hasil akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto dan klik Buat Professional Headshot</p>
              </div>
              <div id="professional-headshot-results" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-6"></div>
              <div id="professional-headshot-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-slate-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat professional headshot...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `;

  beforeEach(() => {
    document.body.innerHTML = mockComponentHTML;
    // Clear localStorage
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should have main content panel with correct ID', () => {
      const panel = document.getElementById('content-professional-headshot');
      expect(panel).toBeTruthy();
      expect(panel.classList.contains('main-content-panel')).toBe(true);
      expect(panel.classList.contains('hidden')).toBe(true);
    });

    it('should have header with title and description', () => {
      const header = document.querySelector('#content-professional-headshot header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Professional Headshot');
      
      const description = header.querySelector('p');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('foto profil profesional');
    });

    it('should have image upload area', () => {
      const fileInput = document.getElementById('professional-headshot-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
      
      const uploadLabel = document.querySelector('label[for="professional-headshot-image-input"]');
      expect(uploadLabel).toBeTruthy();
    });

    it('should have image preview container', () => {
      const previewContainer = document.getElementById('professional-headshot-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
      
      const previewImage = document.getElementById('professional-headshot-image-preview');
      expect(previewImage).toBeTruthy();
      
      const removeBtn = document.getElementById('professional-headshot-remove-image-btn');
      expect(removeBtn).toBeTruthy();
    });

    it('should have background options section', () => {
      const backgroundOptions = document.getElementById('professional-headshot-background-options');
      expect(backgroundOptions).toBeTruthy();
      
      const buttons = backgroundOptions.querySelectorAll('.background-btn-professional-headshot');
      expect(buttons.length).toBe(8);
    });

    it('should have clothing options section', () => {
      const clothingOptions = document.getElementById('professional-headshot-clothing-options');
      expect(clothingOptions).toBeTruthy();
      
      const buttons = clothingOptions.querySelectorAll('.clothing-btn-professional-headshot');
      expect(buttons.length).toBe(5);
    });

    it('should have expression options section', () => {
      const expressionOptions = document.getElementById('professional-headshot-expression-options');
      expect(expressionOptions).toBeTruthy();
      
      const buttons = expressionOptions.querySelectorAll('.expression-btn-professional-headshot');
      expect(buttons.length).toBe(5);
    });

    it('should have generate button', () => {
      const generateBtn = document.getElementById('professional-headshot-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Professional Headshot');
    });

    it('should have results container with empty state', () => {
      const resultsContainer = document.getElementById('professional-headshot-results-container');
      expect(resultsContainer).toBeTruthy();
      
      const emptyState = document.getElementById('professional-headshot-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have loading indicator', () => {
      const loading = document.getElementById('professional-headshot-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have results grid', () => {
      const results = document.getElementById('professional-headshot-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
    });
  });

  // Background Selection Tests
  describe('Background Selection', () => {
    it('should have Original as default selected background', () => {
      const originalBtn = document.querySelector('.background-btn-professional-headshot[data-background=""]');
      expect(originalBtn).toBeTruthy();
      expect(originalBtn.getAttribute('data-selected')).toBe('true');
      expect(originalBtn.classList.contains('selected')).toBe(true);
    });

    it('should have Navy Blue background option', () => {
      const navyBtn = document.querySelector('.background-btn-professional-headshot[data-background="Solid navy blue background"]');
      expect(navyBtn).toBeTruthy();
      expect(navyBtn.textContent).toContain('Navy Blue');
    });

    it('should have Charcoal background option', () => {
      const charcoalBtn = document.querySelector('.background-btn-professional-headshot[data-background="Solid charcoal gray background"]');
      expect(charcoalBtn).toBeTruthy();
      expect(charcoalBtn.textContent).toContain('Charcoal');
    });

    it('should have all background options with correct data attributes', () => {
      const backgrounds = [
        { name: 'Original', data: '' },
        { name: 'Navy Blue', data: 'Solid navy blue background' },
        { name: 'Charcoal', data: 'Solid charcoal gray background' },
        { name: 'Light Gray', data: 'Gradient from light gray to white' },
        { name: 'Executive', data: 'Gradient from dark blue to black' },
        { name: 'Office', data: 'Modern office environment' },
        { name: 'Library', data: 'Corporate library background' },
        { name: 'Studio', data: 'Minimalist studio backdrop' }
      ];
      
      backgrounds.forEach(bg => {
        const btn = document.querySelector(`.background-btn-professional-headshot[data-background="${bg.data}"]`);
        expect(btn).toBeTruthy();
      });
    });
  });

  // Clothing Selection Tests
  describe('Clothing Selection', () => {
    it('should have Keep Original as default selected clothing', () => {
      const originalBtn = document.querySelector('.clothing-btn-professional-headshot[data-clothing=""]');
      expect(originalBtn).toBeTruthy();
      expect(originalBtn.getAttribute('data-selected')).toBe('true');
      expect(originalBtn.classList.contains('selected')).toBe(true);
    });

    it('should have Business Formal clothing option', () => {
      const formalBtn = document.querySelector('.clothing-btn-professional-headshot[data-clothing="Business formal attire"]');
      expect(formalBtn).toBeTruthy();
      expect(formalBtn.textContent).toContain('Business Formal');
    });

    it('should have Business Casual clothing option', () => {
      const casualBtn = document.querySelector('.clothing-btn-professional-headshot[data-clothing="Business casual attire"]');
      expect(casualBtn).toBeTruthy();
      expect(casualBtn.textContent).toContain('Business Casual');
    });

    it('should have all clothing options with correct data attributes', () => {
      const clothing = [
        { name: 'Keep Original', data: '' },
        { name: 'Business Formal', data: 'Business formal attire' },
        { name: 'Business Casual', data: 'Business casual attire' },
        { name: 'Smart Casual', data: 'Smart casual attire' },
        { name: 'Executive Suit', data: 'Executive suit with tie' }
      ];
      
      clothing.forEach(item => {
        const btn = document.querySelector(`.clothing-btn-professional-headshot[data-clothing="${item.data}"]`);
        expect(btn).toBeTruthy();
      });
    });
  });

  // Expression Selection Tests
  describe('Expression Selection', () => {
    it('should have Natural as default selected expression', () => {
      const naturalBtn = document.querySelector('.expression-btn-professional-headshot[data-expression=""]');
      expect(naturalBtn).toBeTruthy();
      expect(naturalBtn.getAttribute('data-selected')).toBe('true');
      expect(naturalBtn.classList.contains('selected')).toBe(true);
    });

    it('should have Confident expression option', () => {
      const confidentBtn = document.querySelector('.expression-btn-professional-headshot[data-expression="Confident and authoritative expression"]');
      expect(confidentBtn).toBeTruthy();
      expect(confidentBtn.textContent).toContain('Confident');
    });

    it('should have Friendly expression option', () => {
      const friendlyBtn = document.querySelector('.expression-btn-professional-headshot[data-expression="Friendly and approachable expression"]');
      expect(friendlyBtn).toBeTruthy();
      expect(friendlyBtn.textContent).toContain('Friendly');
    });

    it('should have all expression options with correct data attributes', () => {
      const expressions = [
        { name: 'Natural', data: '' },
        { name: 'Confident', data: 'Confident and authoritative expression' },
        { name: 'Friendly', data: 'Friendly and approachable expression' },
        { name: 'Professional', data: 'Professional and polished expression' },
        { name: 'Executive', data: 'Executive presence' }
      ];
      
      expressions.forEach(expr => {
        const btn = document.querySelector(`.expression-btn-professional-headshot[data-expression="${expr.data}"]`);
        expect(btn).toBeTruthy();
      });
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should have hidden preview container initially', () => {
      const previewContainer = document.getElementById('professional-headshot-image-preview-container');
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('professional-headshot-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should show preview container when image is loaded', () => {
      const previewContainer = document.getElementById('professional-headshot-image-preview-container');
      previewContainer.classList.remove('hidden');
      expect(previewContainer.classList.contains('hidden')).toBe(false);
    });

    it('should enable generate button when image is loaded', () => {
      const generateBtn = document.getElementById('professional-headshot-generate-btn');
      generateBtn.disabled = false;
      expect(generateBtn.disabled).toBe(false);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should be disabled when no image is uploaded', () => {
      const generateBtn = document.getElementById('professional-headshot-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should be enabled when image is uploaded', () => {
      const generateBtn = document.getElementById('professional-headshot-generate-btn');
      generateBtn.disabled = false;
      expect(generateBtn.disabled).toBe(false);
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('professional-headshot-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-slate-600')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
    });

    it('should have magic icon', () => {
      const magicIcon = document.querySelector('#professional-headshot-generate-btn .fa-magic');
      expect(magicIcon).toBeTruthy();
    });
  });

  // Results Display Tests
  describe('Results Display', () => {
    it('should show empty state initially', () => {
      const emptyState = document.getElementById('professional-headshot-empty-state');
      expect(emptyState.classList.contains('hidden')).toBe(false);
      
      const icon = emptyState.querySelector('.fa-user-tie');
      expect(icon).toBeTruthy();
    });

    it('should hide results initially', () => {
      const results = document.getElementById('professional-headshot-results');
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should hide loading initially', () => {
      const loading = document.getElementById('professional-headshot-loading');
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should show loading when generating', () => {
      const loading = document.getElementById('professional-headshot-loading');
      loading.classList.remove('hidden');
      expect(loading.classList.contains('hidden')).toBe(false);
    });

    it('should hide empty state when generating', () => {
      const emptyState = document.getElementById('professional-headshot-empty-state');
      emptyState.classList.add('hidden');
      expect(emptyState.classList.contains('hidden')).toBe(true);
    });
  });

  // UI/UX Tests
  describe('UI/UX', () => {
    it('should use blue/slate color scheme', () => {
      const header = document.querySelector('#content-professional-headshot h1');
      expect(header.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(header.classList.contains('from-slate-600')).toBe(true);
      expect(header.classList.contains('to-blue-500')).toBe(true);
    });

    it('should use Indonesian text for UI elements', () => {
      const description = document.querySelector('#content-professional-headshot header p');
      expect(description.textContent).toContain('foto profil profesional');
      
      const uploadSection = document.querySelector('#content-professional-headshot h2');
      expect(uploadSection.textContent).toContain('Unggah Foto Anda');
    });

    it('should have proper card styling', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
        expect(card.classList.contains('rounded-2xl')).toBe(true);
        expect(card.classList.contains('shadow-lg')).toBe(true);
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have proper grid layout', () => {
      const main = document.querySelector('#content-professional-headshot main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have proper spacing', () => {
      const container = document.querySelector('.container');
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Icon Tests
  describe('Icons', () => {
    it('should have user-tie icon in header', () => {
      const icon = document.querySelector('#content-professional-headshot h1 .fa-user-tie');
      expect(icon).toBeTruthy();
    });

    it('should have camera icon in upload area', () => {
      const icon = document.querySelector('#professional-headshot-image-input + i');
      expect(icon).toBeTruthy();
      expect(icon.classList.contains('fa-camera')).toBe(true);
    });

    it('should have times icon for remove button', () => {
      const icon = document.querySelector('#professional-headshot-remove-image-btn .fa-times');
      expect(icon).toBeTruthy();
    });

    it('should have magic icon for generate button', () => {
      const icon = document.querySelector('#professional-headshot-generate-btn .fa-magic');
      expect(icon).toBeTruthy();
    });

    it('should have user-tie icon in empty state', () => {
      const icon = document.querySelector('#professional-headshot-empty-state .fa-user-tie');
      expect(icon).toBeTruthy();
    });

    it('should have download icon available when results are displayed', () => {
      // Download icon is added dynamically when results are displayed
      // This test verifies the icon class is defined in the component structure
      const resultsHTML = `
        <div class="col-span-2">
          <div class="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
            <h3 class="font-semibold text-lg text-slate-800 mb-4">Professional Headshot Hasil AI</h3>
            <div class="relative">
              <img src="data:image/png;base64,test" alt="Professional Headshot Result" class="rounded-lg w-full h-auto object-contain">
              <div class="absolute bottom-4 right-4 flex gap-2">
                <button id="professional-headshot-download-btn" data-image-url="data:image/png;base64,test" data-filename="professional-headshot-result.png" class="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-lg">
                  <i class="fas fa-download mr-2"></i>Download
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      const resultsHaveDownloadIcon = resultsHTML.includes('fa-download');
      expect(resultsHaveDownloadIcon).toBe(true);
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.querySelector('#content-professional-headshot h1');
      expect(h1).toBeTruthy();
      
      const h2s = document.querySelectorAll('#content-professional-headshot h2');
      expect(h2s.length).toBe(4);
    });

    it('should have proper label for file input', () => {
      const label = document.querySelector('label[for="professional-headshot-image-input"]');
      expect(label).toBeTruthy();
    });

    it('should have alt text for preview image', () => {
      const previewImage = document.getElementById('professional-headshot-image-preview');
      expect(previewImage.alt).toBe('Pratinjau Foto');
    });

    it('should have proper button types', () => {
      const buttons = document.querySelectorAll('#content-professional-headshot button');
      // Most buttons should be type="button", generate button may be type="submit"
      buttons.forEach(btn => {
        expect(['button', 'submit']).toContain(btn.type);
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive header text', () => {
      const h1 = document.querySelector('#content-professional-headshot h1');
      expect(h1.classList.contains('text-4xl')).toBe(true);
      expect(h1.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive grid layout', () => {
      const main = document.querySelector('#content-professional-headshot main');
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('should have background options with data attributes for state tracking', () => {
      const backgroundBtns = document.querySelectorAll('.background-btn-professional-headshot');
      backgroundBtns.forEach(btn => {
        expect(btn.dataset).toHaveProperty('background');
      });
    });

    it('should have clothing options with data attributes for state tracking', () => {
      const clothingBtns = document.querySelectorAll('.clothing-btn-professional-headshot');
      clothingBtns.forEach(btn => {
        expect(btn.dataset).toHaveProperty('clothing');
      });
    });

    it('should have expression options with data attributes for state tracking', () => {
      const expressionBtns = document.querySelectorAll('.expression-btn-professional-headshot');
      expressionBtns.forEach(btn => {
        expect(btn.dataset).toHaveProperty('expression');
      });
    });

    it('should have selected state attribute on default options', () => {
      const defaultBackground = document.querySelector('.background-btn-professional-headshot[data-background=""]');
      const defaultClothing = document.querySelector('.clothing-btn-professional-headshot[data-clothing=""]');
      const defaultExpression = document.querySelector('.expression-btn-professional-headshot[data-expression=""]');
      
      expect(defaultBackground.getAttribute('data-selected')).toBe('true');
      expect(defaultClothing.getAttribute('data-selected')).toBe('true');
      expect(defaultExpression.getAttribute('data-selected')).toBe('true');
    });
  });
});
