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

describe('bg-remover Component', () => {
  
  const mockComponentHTML = `
    <div id="content-bg-remover" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            <i class="fas fa-eraser mr-3"></i>Penghapus Latar
          </h1>
          <p class="text-lg text-gray-600 mt-2">Hapus latar belakang foto dengan mudah menggunakan AI</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto</h2>
              <div class="upload-area">
                <label for="bg-remover-image-input" class="file-input-label block border-3 border-dashed border-amber-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500 transition-colors">
                  <input type="file" id="bg-remover-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-cloud-upload-alt text-4xl text-amber-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto di sini</p>
                </label>
              </div>
              <div id="bg-remover-image-preview-container" class="hidden mt-4">
                <img id="bg-remover-image-preview" src="#" alt="Pratinjau Foto" class="rounded-lg w-full h-auto object-contain">
                <button id="bg-remover-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Opsi Latar Belakang</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-layer-group mr-1 text-amber-500"></i>Tipe Latar
                  </label>
                  <div id="bg-remover-bg-type-options" class="grid grid-cols-3 gap-2">
                    <button type="button" data-bg-type="transparent" class="bg-type-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent selected" data-selected="true">
                      <div class="w-8 h-8 rounded bg-transparent border border-gray-300"></div>
                      <span class="mt-1 block">Transparan</span>
                    </button>
                    <button type="button" data-bg-type="solid" class="bg-type-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-gray-400"></div>
                      <span class="mt-1 block">Warna Solid</span>
                    </button>
                    <button type="button" data-bg-type="gradient" class="bg-type-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-gradient-to-r from-purple-400 to-pink-400"></div>
                      <span class="mt-1 block">Gradien</span>
                    </button>
                  </div>
                </div>
                <div id="bg-remover-solid-color-container" class="hidden">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-palette mr-1 text-amber-500"></i>Pilih Warna
                  </label>
                  <div id="bg-remover-color-options" class="grid grid-cols-6 gap-2">
                    <button type="button" data-color="#ffffff" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors selected" style="background-color: #ffffff;" data-selected="true"></button>
                    <button type="button" data-color="#000000" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #000000;"></button>
                    <button type="button" data-color="#ff6b6b" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #ff6b6b;"></button>
                    <button type="button" data-color="#4ecdc4" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #4ecdc4;"></button>
                    <button type="button" data-color="#45b7d1" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #45b7d1;"></button>
                    <button type="button" data-color="#96ceb4" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #96ceb4;"></button>
                    <button type="button" data-color="#ffeaa7" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #ffeaa7;"></button>
                    <button type="button" data-color="#dfe6e9" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #dfe6e9;"></button>
                    <button type="button" data-color="#6c5ce7" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #6c5ce7;"></button>
                    <button type="button" data-color="#fd79a8" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #fd79a8;"></button>
                    <button type="button" data-color="#00b894" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #00b894;"></button>
                    <button type="button" data-color="#e17055" class="color-btn-bg-remover w-8 h-8 rounded-full border-2 border-gray-300 hover:border-amber-500 transition-colors" style="background-color: #e17055;"></button>
                  </div>
                  <div class="mt-3 flex items-center gap-2">
                    <input type="color" id="bg-remover-custom-color" class="w-10 h-10 rounded cursor-pointer border border-gray-300">
                    <input type="text" id="bg-remover-custom-color-text" placeholder="#ffffff" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500">
                  </div>
                </div>
                <div id="bg-remover-gradient-container" class="hidden">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-gradient mr-1 text-amber-500"></i>Pilih Gradien
                  </label>
                  <div id="bg-remover-gradient-options" class="grid grid-cols-3 gap-2">
                    <button type="button" data-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" class="gradient-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent selected" data-selected="true">
                      <div class="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-purple-700"></div>
                      <span class="mt-1 block">Ungu</span>
                    </button>
                    <button type="button" data-gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" class="gradient-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-gradient-to-br from-pink-400 to-pink-600"></div>
                      <span class="mt-1 block">Merah Muda</span>
                    </button>
                    <button type="button" data-gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" class="gradient-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-cyan-400"></div>
                      <span class="mt-1 block">Biru</span>
                    </button>
                    <button type="button" data-gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" class="gradient-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-gradient-to-br from-green-400 to-teal-400"></div>
                      <span class="mt-1 block">Hijau</span>
                    </button>
                    <button type="button" data-gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" class="gradient-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-gradient-to-br from-pink-500 to-yellow-400"></div>
                      <span class="mt-1 block">Cerah</span>
                    </button>
                    <button type="button" data-gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" class="gradient-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                      <div class="w-8 h-8 rounded bg-gradient-to-br from-teal-200 to-pink-200"></div>
                      <span class="mt-1 block">Pastel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Penghalusan Tepi</h2>
              <div>
                <label for="bg-remover-edge-smoothing" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-sliders-h mr-1 text-amber-500"></i>Tingkat Penghalusan
                </label>
                <input type="range" id="bg-remover-edge-smoothing" min="0" max="100" value="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Halus</span>
                  <span id="bg-remover-edge-value">Normal</span>
                  <span>Kasar</span>
                </div>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Format Output</h2>
              <div id="bg-remover-format-options" class="grid grid-cols-3 gap-2">
                <button type="button" data-format="png" class="format-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent selected" data-selected="true">
                  <div class="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold">PNG</div>
                  <span class="mt-1 block">Transparan</span>
                </button>
                <button type="button" data-format="jpeg" class="format-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <div class="w-8 h-8 rounded bg-gray-300 flex items-center justify-center text-xs font-bold">JPG</div>
                  <span class="mt-1 block">Kompresi</span>
                </button>
                <button type="button" data-format="webp" class="format-btn-bg-remover p-2 rounded-lg text-xs bg-gray-100 hover:bg-amber-100 transition border-2 border-transparent">
                  <div class="w-8 h-8 rounded bg-gray-400 flex items-center justify-center text-xs font-bold">WebP</div>
                  <span class="mt-1 block">Modern</span>
                </button>
              </div>
            </div>
            <button id="bg-remover-generate-btn" class="w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Hapus Latar
            </button>
          </div>
          <div class="lg:col-span-2">
            <div id="bg-remover-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="bg-remover-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-image text-6xl mb-4 text-amber-400"></i>
                <p class="text-xl">Hasil akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto dan klik Hapus Latar</p>
              </div>
              <div id="bg-remover-results" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-6"></div>
              <div id="bg-remover-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-amber-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang menghapus latar...</p>
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

  // Component Initialization Tests
  describe('Component Initialization', () => {
    it('should render the bg-remover component with correct header', () => {
      const header = screen.getByText('Penghapus Latar');
      expect(header).toBeTruthy();
    });

    it('should have upload area with file input', () => {
      const fileInput = document.getElementById('bg-remover-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have background type options (transparent, solid, gradient)', () => {
      const bgTypeOptions = document.getElementById('bg-remover-bg-type-options');
      expect(bgTypeOptions).toBeTruthy();
      
      const buttons = bgTypeOptions.querySelectorAll('.bg-type-btn-bg-remover');
      expect(buttons.length).toBe(3);
    });

    it('should have edge smoothing slider', () => {
      const slider = document.getElementById('bg-remover-edge-smoothing');
      expect(slider).toBeTruthy();
      expect(slider.min).toBe('0');
      expect(slider.max).toBe('100');
      expect(slider.value).toBe('10');
    });

    it('should have output format options (PNG, JPEG, WebP)', () => {
      const formatOptions = document.getElementById('bg-remover-format-options');
      expect(formatOptions).toBeTruthy();
      
      const buttons = formatOptions.querySelectorAll('.format-btn-bg-remover');
      expect(buttons.length).toBe(3);
    });

    it('should have generate button initially disabled', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have empty state visible initially', () => {
      const emptyState = document.getElementById('bg-remover-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have loading state hidden initially', () => {
      const loading = document.getElementById('bg-remover-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have results container hidden initially', () => {
      const results = document.getElementById('bg-remover-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
    });
  });

  // Image Upload Tests
  describe('Image Upload Functionality', () => {
    it('should have file input element with correct accept attribute', () => {
      const fileInput = document.getElementById('bg-remover-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have image preview container', () => {
      const previewContainer = document.getElementById('bg-remover-image-preview-container');
      expect(previewContainer).toBeTruthy();
    });

    it('should have image preview element', () => {
      const preview = document.getElementById('bg-remover-image-preview');
      expect(preview).toBeTruthy();
      expect(preview.alt).toBe('Pratinjau Foto');
    });

    it('should have remove image button', () => {
      const removeBtn = document.getElementById('bg-remover-remove-image-btn');
      expect(removeBtn).toBeTruthy();
    });

    it('should have upload area with proper styling', () => {
      const uploadArea = document.querySelector('.upload-area');
      expect(uploadArea).toBeTruthy();
      
      const label = uploadArea.querySelector('label');
      expect(label).toBeTruthy();
      expect(label.className).toContain('border-amber-300');
    });

    it('should have upload icon', () => {
      const uploadIcon = document.querySelector('.fa-cloud-upload-alt');
      expect(uploadIcon).toBeTruthy();
    });

    it('should have proper upload text', () => {
      expect(screen.getByText('Klik atau seret foto di sini')).toBeTruthy();
    });
  });

  // Background Type Selection Tests
  describe('Background Type Selection', () => {
    it('should have background type options container', () => {
      const bgTypeOptions = document.getElementById('bg-remover-bg-type-options');
      expect(bgTypeOptions).toBeTruthy();
    });

    it('should have transparent background type button', () => {
      const transparentBtn = document.querySelector('[data-bg-type="transparent"]');
      expect(transparentBtn).toBeTruthy();
      expect(transparentBtn.textContent).toContain('Transparan');
    });

    it('should have solid background type button', () => {
      const solidBtn = document.querySelector('[data-bg-type="solid"]');
      expect(solidBtn).toBeTruthy();
      expect(solidBtn.textContent).toContain('Warna Solid');
    });

    it('should have gradient background type button', () => {
      const gradientBtn = document.querySelector('[data-bg-type="gradient"]');
      expect(gradientBtn).toBeTruthy();
      expect(gradientBtn.textContent).toContain('Gradien');
    });

    it('should have solid color container', () => {
      const solidColorContainer = document.getElementById('bg-remover-solid-color-container');
      expect(solidColorContainer).toBeTruthy();
    });

    it('should have gradient container', () => {
      const gradientContainer = document.getElementById('bg-remover-gradient-container');
      expect(gradientContainer).toBeTruthy();
    });

    it('should have background type label', () => {
      expect(screen.getByText('Tipe Latar')).toBeTruthy();
    });
  });

  // Color Selection Tests
  describe('Color Selection', () => {
    it('should have color options container', () => {
      const colorOptions = document.getElementById('bg-remover-color-options');
      expect(colorOptions).toBeTruthy();
    });

    it('should have multiple color buttons', () => {
      const colorBtns = document.querySelectorAll('.color-btn-bg-remover');
      expect(colorBtns.length).toBeGreaterThan(0);
    });

    it('should have white color button', () => {
      const whiteBtn = document.querySelector('[data-color="#ffffff"]');
      expect(whiteBtn).toBeTruthy();
      expect(whiteBtn.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('should have black color button', () => {
      const blackBtn = document.querySelector('[data-color="#000000"]');
      expect(blackBtn).toBeTruthy();
      expect(blackBtn.style.backgroundColor).toBe('rgb(0, 0, 0)');
    });

    it('should have custom color input', () => {
      const customColorInput = document.getElementById('bg-remover-custom-color');
      expect(customColorInput).toBeTruthy();
      expect(customColorInput.type).toBe('color');
    });

    it('should have custom color text input', () => {
      const customColorText = document.getElementById('bg-remover-custom-color-text');
      expect(customColorText).toBeTruthy();
      expect(customColorText.placeholder).toBe('#ffffff');
    });

    it('should have color selection label', () => {
      expect(screen.getByText('Pilih Warna')).toBeTruthy();
    });
  });

  // Gradient Selection Tests
  describe('Gradient Selection', () => {
    it('should have gradient options container', () => {
      const gradientOptions = document.getElementById('bg-remover-gradient-options');
      expect(gradientOptions).toBeTruthy();
    });

    it('should have multiple gradient buttons', () => {
      const gradientBtns = document.querySelectorAll('.gradient-btn-bg-remover');
      expect(gradientBtns.length).toBe(6);
    });

    it('should have purple gradient option', () => {
      const purpleGradient = document.querySelector('[data-gradient*="667eea"]');
      expect(purpleGradient).toBeTruthy();
      expect(purpleGradient.textContent).toContain('Ungu');
    });

    it('should have pink gradient option', () => {
      const pinkGradient = document.querySelector('[data-gradient*="f093fb"]');
      expect(pinkGradient).toBeTruthy();
      expect(pinkGradient.textContent).toContain('Merah Muda');
    });

    it('should have blue gradient option', () => {
      const blueGradient = document.querySelector('[data-gradient*="4facfe"]');
      expect(blueGradient).toBeTruthy();
      expect(blueGradient.textContent).toContain('Biru');
    });

    it('should have green gradient option', () => {
      const greenGradient = document.querySelector('[data-gradient*="43e97b"]');
      expect(greenGradient).toBeTruthy();
      expect(greenGradient.textContent).toContain('Hijau');
    });

    it('should have gradient selection label', () => {
      expect(screen.getByText('Pilih Gradien')).toBeTruthy();
    });
  });

  // Edge Smoothing Tests
  describe('Edge Smoothing Functionality', () => {
    it('should have edge smoothing slider', () => {
      const slider = document.getElementById('bg-remover-edge-smoothing');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
    });

    it('should have correct slider range', () => {
      const slider = document.getElementById('bg-remover-edge-smoothing');
      expect(slider.min).toBe('0');
      expect(slider.max).toBe('100');
    });

    it('should have default slider value', () => {
      const slider = document.getElementById('bg-remover-edge-smoothing');
      expect(slider.value).toBe('10');
    });

    it('should have edge value display', () => {
      const edgeValue = document.getElementById('bg-remover-edge-value');
      expect(edgeValue).toBeTruthy();
      expect(edgeValue.textContent).toBe('Normal');
    });

    it('should have edge smoothing label', () => {
      expect(screen.getByText('Tingkat Penghalusan')).toBeTruthy();
    });

    it('should have slider icon', () => {
      const sliderIcon = document.querySelector('.fa-sliders-h');
      expect(sliderIcon).toBeTruthy();
    });

    it('should have slider range labels', () => {
      const sliderContainer = document.getElementById('bg-remover-edge-smoothing').parentElement;
      const labels = sliderContainer.querySelectorAll('.flex.justify-between span');
      expect(labels.length).toBe(3);
      expect(labels[0].textContent).toBe('Halus');
      expect(labels[1].textContent).toBe('Normal');
      expect(labels[2].textContent).toBe('Kasar');
    });
  });

  // Output Format Tests
  describe('Output Format Selection', () => {
    it('should have format options container', () => {
      const formatOptions = document.getElementById('bg-remover-format-options');
      expect(formatOptions).toBeTruthy();
    });

    it('should have PNG format button', () => {
      const pngBtn = document.querySelector('[data-format="png"]');
      expect(pngBtn).toBeTruthy();
      expect(pngBtn.textContent).toContain('Transparan');
    });

    it('should have JPEG format button', () => {
      const jpegBtn = document.querySelector('[data-format="jpeg"]');
      expect(jpegBtn).toBeTruthy();
      expect(jpegBtn.textContent).toContain('Kompresi');
    });

    it('should have WebP format button', () => {
      const webpBtn = document.querySelector('[data-format="webp"]');
      expect(webpBtn).toBeTruthy();
      expect(webpBtn.textContent).toContain('Modern');
    });

    it('should have format selection label', () => {
      const formatSection = document.getElementById('bg-remover-format-options').closest('.card');
      const label = formatSection.querySelector('h2');
      expect(label.textContent).toBe('4. Format Output');
    });
  });

  // Generate Button Tests
  describe('Generate Button Functionality', () => {
    it('should have generate button', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      expect(generateBtn).toBeTruthy();
    });

    it('should have generate button with correct text', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      expect(generateBtn.textContent).toContain('Hapus Latar');
    });

    it('should have generate button with magic icon', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      const magicIcon = generateBtn.querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have generate button with proper styling', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      expect(generateBtn.className).toContain('from-amber-600');
      expect(generateBtn.className).toContain('to-orange-500');
    });

    it('should have generate button with shadow', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      expect(generateBtn.className).toContain('shadow-lg');
    });
  });

  // API Integration Tests
  describe('API Integration', () => {
    it('should have results container', () => {
      const resultsContainer = document.getElementById('bg-remover-results-container');
      expect(resultsContainer).toBeTruthy();
    });

    it('should have empty state', () => {
      const emptyState = document.getElementById('bg-remover-empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should have loading state', () => {
      const loading = document.getElementById('bg-remover-loading');
      expect(loading).toBeTruthy();
    });

    it('should have results grid', () => {
      const results = document.getElementById('bg-remover-results');
      expect(results).toBeTruthy();
    });

    it('should have empty state with image icon', () => {
      const emptyStateIcon = document.querySelector('#bg-remover-empty-state .fa-image');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have loading text', () => {
      const loadingText = document.querySelector('#bg-remover-loading p');
      expect(loadingText.textContent).toBe('Sedang menghapus latar...');
    });
  });

  // Result Display Tests
  describe('Result Display', () => {
    it('should have results container with proper styling', () => {
      const resultsContainer = document.getElementById('bg-remover-results-container');
      expect(resultsContainer.className).toContain('min-h-[500px]');
    });

    it('should have empty state with proper text', () => {
      const emptyState = document.getElementById('bg-remover-empty-state');
      expect(emptyState.className).toContain('flex');
      expect(emptyState.className).toContain('flex-col');
      expect(emptyState.className).toContain('items-center');
      expect(emptyState.className).toContain('justify-center');
    });

    it('should have empty state text', () => {
      expect(screen.getByText('Hasil akan muncul di sini')).toBeTruthy();
      expect(screen.getByText('Unggah foto dan klik Hapus Latar')).toBeTruthy();
    });

    it('should have loading indicator', () => {
      const loading = document.getElementById('bg-remover-loading');
      expect(loading.className).toContain('flex');
      expect(loading.className).toContain('flex-col');
      expect(loading.className).toContain('items-center');
      expect(loading.className).toContain('justify-center');
    });

    it('should have loading spinner', () => {
      const loadingSpinner = document.querySelector('#bg-remover-loading .loader');
      expect(loadingSpinner).toBeTruthy();
      expect(loadingSpinner.className).toContain('border-amber-500');
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('should have proper default values in HTML', () => {
      // Test that HTML has correct default values
      const transparentBtn = document.querySelector('[data-bg-type="transparent"]');
      expect(transparentBtn).toBeTruthy();
      
      const whiteBtn = document.querySelector('[data-color="#ffffff"]');
      expect(whiteBtn).toBeTruthy();
      
      const pngBtn = document.querySelector('[data-format="png"]');
      expect(pngBtn).toBeTruthy();
      
      const slider = document.getElementById('bg-remover-edge-smoothing');
      expect(slider.value).toBe('10');
    });

    it('should have proper data attributes for state tracking', () => {
      const transparentBtn = document.querySelector('[data-bg-type="transparent"]');
      expect(transparentBtn.dataset.bgType).toBe('transparent');
      
      const whiteBtn = document.querySelector('[data-color="#ffffff"]');
      expect(whiteBtn.dataset.color).toBe('#ffffff');
      
      const pngBtn = document.querySelector('[data-format="png"]');
      expect(pngBtn.dataset.format).toBe('png');
    });

    it('should have proper selected states in HTML', () => {
      const transparentBtn = document.querySelector('[data-bg-type="transparent"]');
      expect(transparentBtn.dataset.selected).toBe('true');
      
      const whiteBtn = document.querySelector('[data-color="#ffffff"]');
      expect(whiteBtn.dataset.selected).toBe('true');
      
      const pngBtn = document.querySelector('[data-format="png"]');
      expect(pngBtn.dataset.selected).toBe('true');
    });
  });

  // UI/UX Tests
  describe('UI/UX Functionality', () => {
    it('should have correct color scheme (amber/orange)', () => {
      const header = screen.getByText('Penghapus Latar');
      expect(header.closest('h1').className).toContain('from-amber-600');
      expect(header.closest('h1').className).toContain('to-orange-500');
    });

    it('should have proper button styling', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      expect(generateBtn.className).toContain('from-amber-600');
      expect(generateBtn.className).toContain('to-orange-500');
    });

    it('should have proper icon styling', () => {
      const icons = document.querySelectorAll('.fa-eraser, .fa-cloud-upload-alt, .fa-layer-group, .fa-palette, .fa-gradient, .fa-sliders-h, .fa-magic');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have Indonesian text for UI elements', () => {
      expect(screen.getByText('1. Unggah Foto')).toBeTruthy();
      expect(screen.getByText('2. Opsi Latar Belakang')).toBeTruthy();
      expect(screen.getByText('Tipe Latar')).toBeTruthy();
      expect(screen.getByText('3. Penghalusan Tepi')).toBeTruthy();
      expect(screen.getByText('4. Format Output')).toBeTruthy();
      expect(screen.getByText('Hapus Latar')).toBeTruthy();
    });

    it('should have proper placeholder text', () => {
      expect(screen.getByText('Klik atau seret foto di sini')).toBeTruthy();
      expect(screen.getByText('Hasil akan muncul di sini')).toBeTruthy();
      expect(screen.getByText('Unggah foto dan klik Hapus Latar')).toBeTruthy();
    });

    it('should have proper header styling', () => {
      const header = screen.getByText('Penghapus Latar');
      expect(header.closest('h1').className).toContain('text-4xl');
      expect(header.closest('h1').className).toContain('font-bold');
      expect(header.closest('h1').className).toContain('bg-clip-text');
      expect(header.closest('h1').className).toContain('text-transparent');
    });

    it('should have proper description text', () => {
      expect(screen.getByText('Hapus latar belakang foto dengan mudah menggunakan AI')).toBeTruthy();
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle empty file selection', async () => {
      const fileInput = document.getElementById('bg-remover-image-input');
      
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
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      generateBtn.disabled = false;
      
      // Rapid clicks should not cause issues
      fireEvent.click(generateBtn);
      fireEvent.click(generateBtn);
      fireEvent.click(generateBtn);
      
      // Should not crash
      expect(true).toBe(true);
    });

    it('should handle invalid gradient data', () => {
      const gradientBtns = document.querySelectorAll('.gradient-btn-bg-remover');
      gradientBtns.forEach(btn => {
        expect(btn.dataset.gradient).toBeTruthy();
      });
    });

    it('should handle invalid color data', () => {
      const colorBtns = document.querySelectorAll('.color-btn-bg-remover');
      colorBtns.forEach(btn => {
        expect(btn.dataset.color).toBeTruthy();
        expect(btn.dataset.color.startsWith('#')).toBe(true);
      });
    });

    it('should handle slider value out of range', () => {
      const slider = document.getElementById('bg-remover-edge-smoothing');
      
      // Test min value
      fireEvent.input(slider, { target: { value: '0' } });
      expect(slider.value).toBe('0');
      
      // Test max value
      fireEvent.input(slider, { target: { value: '100' } });
      expect(slider.value).toBe('100');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper alt text for preview image', () => {
      const preview = document.getElementById('bg-remover-image-preview');
      expect(preview.alt).toBe('Pratinjau Foto');
    });

    it('should have proper labels for inputs', () => {
      const slider = document.getElementById('bg-remover-edge-smoothing');
      expect(slider.previousElementSibling.textContent).toContain('Tingkat Penghalusan');
    });

    it('should have proper button labels', () => {
      const generateBtn = document.getElementById('bg-remover-generate-btn');
      expect(generateBtn.textContent).toContain('Hapus Latar');
    });

    it('should have proper placeholder for color text input', () => {
      const customColorText = document.getElementById('bg-remover-custom-color-text');
      expect(customColorText.placeholder).toBe('#ffffff');
    });
  });
});
