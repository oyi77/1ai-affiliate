import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

describe('before-after Component', () => {
  
  const mockComponentHTML = `
    <div id="content-before-after" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-600 to-blue-500 bg-clip-text text-transparent">
            <i class="fas fa-history mr-3"></i>Before After Transformation
          </h1>
          <p class="text-lg text-gray-600 mt-2">Visualisasikan perubahan dengan perbandingan before-after yang menarik</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Foto Before</h2>
              <div class="upload-area">
                <label for="before-after-before-image-input" class="file-input-label block border-3 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input type="file" id="before-after-before-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-slate-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto before di sini</p>
                </label>
              </div>
              <div id="before-after-before-image-preview-container" class="hidden mt-4">
                <img id="before-after-before-image-preview" src="#" alt="Pratinjau Foto Before" class="rounded-lg w-full h-auto object-contain">
                <button id="before-after-before-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Foto After</h2>
              <div class="upload-area">
                <label for="before-after-after-image-input" class="file-input-label block border-3 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input type="file" id="before-after-after-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-slate-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto after di sini</p>
                </label>
              </div>
              <div id="before-after-after-image-preview-container" class="hidden mt-4">
                <img id="before-after-after-image-preview" src="#" alt="Pratinjau Foto After" class="rounded-lg w-full h-auto object-contain">
                <button id="before-after-after-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Jenis Transformasi</h2>
              <div id="before-after-transformation-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-transformation="" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-random mr-1"></i>General
                </button>
                <button type="button" data-transformation="Renovasi rumah" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-home mr-1"></i>Renovasi Rumah
                </button>
                <button type="button" data-transformation="Transformasi tubuh" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-dumbbell mr-1"></i>Transformasi Tubuh
                </button>
                <button type="button" data-transformation="Restorasi kendaraan" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-car mr-1"></i>Restorasi Kendaraan
                </button>
                <button type="button" data-transformation="Rekomendasi fashion" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tshirt mr-1"></i>Rekomendasi Fashion
                </button>
                <button type="button" data-transformation="Perawatan kulit" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-spa mr-1"></i>Perawatan Kulit
                </button>
                <button type="button" data-transformation="Tata ruang" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-couch mr-1"></i>Tata Ruang
                </button>
                <button type="button" data-transformation="Proyek kreatif" class="transformation-btn-before-after p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-palette mr-1"></i>Proyek Kreatif
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Periode Waktu</h2>
              <div id="before-after-period-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-period="" class="period-btn-before-after p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-clock mr-1"></i>Custom
                </button>
                <button type="button" data-period="1 minggu" class="period-btn-before-after p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-calendar-week mr-1"></i>1 Minggu
                </button>
                <button type="button" data-period="1 bulan" class="period-btn-before-after p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-calendar-alt mr-1"></i>1 Bulan
                </button>
                <button type="button" data-period="3 bulan" class="period-btn-before-after p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-calendar mr-1"></i>3 Bulan
                </button>
                <button type="button" data-period="6 bulan" class="period-btn-before-after p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-calendar mr-1"></i>6 Bulan
                </button>
                <button type="button" data-period="1 tahun" class="period-btn-before-after p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-calendar mr-1"></i>1 Tahun
                </button>
                <button type="button" data-period="5 tahun" class="period-btn-before-after p-2 rounded-lg text-sm bg-gray-100 hover:bg-slate-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-history mr-1"></i>5 Tahun
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Deskripsi Perubahan</h2>
              <textarea id="before-after-description" class="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none h-32" placeholder="Jelaskan perubahan yang terjadi..."></textarea>
            </div>
            <button id="before-after-generate-btn" class="w-full bg-gradient-to-r from-slate-600 to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Before After
            </button>
          </div>
          <div class="lg:col-span-2">
            <div id="before-after-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="before-after-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-columns text-6xl mb-4 text-slate-400"></i>
                <p class="text-xl">Hasil akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto before dan after, lalu klik Buat Before After</p>
              </div>
              <div id="before-after-results" class="hidden grid grid-cols-1 gap-6"></div>
              <div id="before-after-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-slate-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat before after...</p>
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
      const panel = document.getElementById('content-before-after');
      expect(panel).toBeTruthy();
      expect(panel.classList.contains('main-content-panel')).toBe(true);
      expect(panel.classList.contains('hidden')).toBe(true);
    });

    it('should have header with title and description', () => {
      const header = document.querySelector('#content-before-after header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Before After');
      
      const description = header.querySelector('p');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('perbandingan before-after');
    });

    it('should have grid layout with correct classes', () => {
      const main = document.querySelector('#content-before-after main');
      expect(main).toBeTruthy();
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have left panel for controls', () => {
      const leftPanel = document.querySelector('#content-before-after .lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have right panel for results', () => {
      const rightPanel = document.querySelector('#content-before-after .lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });
  });

  // Before Image Upload Tests
  describe('Before Image Upload', () => {
    it('should have before image input', () => {
      const fileInput = document.getElementById('before-after-before-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
      
      const uploadLabel = document.querySelector('label[for="before-after-before-image-input"]');
      expect(uploadLabel).toBeTruthy();
    });

    it('should have before image preview container', () => {
      const previewContainer = document.getElementById('before-after-before-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
      
      const previewImage = document.getElementById('before-after-before-image-preview');
      expect(previewImage).toBeTruthy();
      expect(previewImage.alt).toBe('Pratinjau Foto Before');
      
      const removeBtn = document.getElementById('before-after-before-remove-image-btn');
      expect(removeBtn).toBeTruthy();
    });

    it('should have camera icon in before upload area', () => {
      const icon = document.querySelector('#before-after-before-image-input + i');
      expect(icon).toBeTruthy();
      expect(icon.classList.contains('fa-camera')).toBe(true);
    });

    it('should have correct before upload text', () => {
      const beforeInput = document.getElementById('before-after-before-image-input');
      expect(beforeInput).toBeTruthy();
      expect(beforeInput.accept).toBe('image/*');
    });

    it('should have times icon for before remove button', () => {
      const icon = document.querySelector('#before-after-before-remove-image-btn .fa-times');
      expect(icon).toBeTruthy();
    });
  });

  // After Image Upload Tests
  describe('After Image Upload', () => {
    it('should have after image input', () => {
      const fileInput = document.getElementById('before-after-after-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
      
      const uploadLabel = document.querySelector('label[for="before-after-after-image-input"]');
      expect(uploadLabel).toBeTruthy();
    });

    it('should have after image preview container', () => {
      const previewContainer = document.getElementById('before-after-after-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
      
      const previewImage = document.getElementById('before-after-after-image-preview');
      expect(previewImage).toBeTruthy();
      expect(previewImage.alt).toBe('Pratinjau Foto After');
      
      const removeBtn = document.getElementById('before-after-after-remove-image-btn');
      expect(removeBtn).toBeTruthy();
    });

    it('should have camera icon in after upload area', () => {
      const icon = document.querySelector('#before-after-after-image-input + i');
      expect(icon).toBeTruthy();
      expect(icon.classList.contains('fa-camera')).toBe(true);
    });

    it('should have correct after upload text', () => {
      const afterInput = document.getElementById('before-after-after-image-input');
      expect(afterInput).toBeTruthy();
      expect(afterInput.accept).toBe('image/*');
    });

    it('should have times icon for after remove button', () => {
      const icon = document.querySelector('#before-after-after-remove-image-btn .fa-times');
      expect(icon).toBeTruthy();
    });
  });

  // Transformation Type Selection Tests
  describe('Transformation Type Selection', () => {
    it('should have transformation options section', () => {
      const transformationOptions = document.getElementById('before-after-transformation-options');
      expect(transformationOptions).toBeTruthy();
      
      const buttons = transformationOptions.querySelectorAll('.transformation-btn-before-after');
      expect(buttons.length).toBe(8);
    });

    it('should have General as default selected transformation', () => {
      const defaultBtn = document.querySelector('.transformation-btn-before-after[data-transformation=""]');
      expect(defaultBtn).toBeTruthy();
      expect(defaultBtn.getAttribute('data-selected')).toBe('true');
      expect(defaultBtn.classList.contains('selected')).toBe(true);
    });

    it('should have Renovasi Rumah transformation option', () => {
      const renovasiBtn = document.querySelector('.transformation-btn-before-after[data-transformation="Renovasi rumah"]');
      expect(renovasiBtn).toBeTruthy();
      expect(renovasiBtn.textContent).toContain('Renovasi Rumah');
    });

    it('should have Transformasi Tubuh transformation option', () => {
      const transformasiBtn = document.querySelector('.transformation-btn-before-after[data-transformation="Transformasi tubuh"]');
      expect(transformasiBtn).toBeTruthy();
      expect(transformasiBtn.textContent).toContain('Transformasi Tubuh');
    });

    it('should have Restorasi Kendaraan transformation option', () => {
      const restorasiBtn = document.querySelector('.transformation-btn-before-after[data-transformation="Restorasi kendaraan"]');
      expect(restorasiBtn).toBeTruthy();
      expect(restorasiBtn.textContent).toContain('Restorasi Kendaraan');
    });

    it('should have Rekomendasi Fashion transformation option', () => {
      const fashionBtn = document.querySelector('.transformation-btn-before-after[data-transformation="Rekomendasi fashion"]');
      expect(fashionBtn).toBeTruthy();
      expect(fashionBtn.textContent).toContain('Rekomendasi Fashion');
    });

    it('should have Perawatan Kulit transformation option', () => {
      const perawatanBtn = document.querySelector('.transformation-btn-before-after[data-transformation="Perawatan kulit"]');
      expect(perawatanBtn).toBeTruthy();
      expect(perawatanBtn.textContent).toContain('Perawatan Kulit');
    });

    it('should have Tata Ruang transformation option', () => {
      const tataRuangBtn = document.querySelector('.transformation-btn-before-after[data-transformation="Tata ruang"]');
      expect(tataRuangBtn).toBeTruthy();
      expect(tataRuangBtn.textContent).toContain('Tata Ruang');
    });

    it('should have Proyek Kreatif transformation option', () => {
      const kreatifBtn = document.querySelector('.transformation-btn-before-after[data-transformation="Proyek kreatif"]');
      expect(kreatifBtn).toBeTruthy();
      expect(kreatifBtn.textContent).toContain('Proyek Kreatif');
    });

    it('should have all transformation options with correct data attributes', () => {
      const transformations = [
        { name: 'General', data: '' },
        { name: 'Renovasi Rumah', data: 'Renovasi rumah' },
        { name: 'Transformasi Tubuh', data: 'Transformasi tubuh' },
        { name: 'Restorasi Kendaraan', data: 'Restorasi kendaraan' },
        { name: 'Rekomendasi Fashion', data: 'Rekomendasi fashion' },
        { name: 'Perawatan Kulit', data: 'Perawatan kulit' },
        { name: 'Tata Ruang', data: 'Tata ruang' },
        { name: 'Proyek Kreatif', data: 'Proyek kreatif' }
      ];
      
      transformations.forEach(t => {
        const btn = document.querySelector(`.transformation-btn-before-after[data-transformation="${t.data}"]`);
        expect(btn).toBeTruthy();
      });
    });
  });

  // Time Period Selection Tests
  describe('Time Period Selection', () => {
    it('should have period options section', () => {
      const periodOptions = document.getElementById('before-after-period-options');
      expect(periodOptions).toBeTruthy();
      
      const buttons = periodOptions.querySelectorAll('.period-btn-before-after');
      expect(buttons.length).toBe(7);
    });

    it('should have Custom as default selected period', () => {
      const defaultBtn = document.querySelector('.period-btn-before-after[data-period=""]');
      expect(defaultBtn).toBeTruthy();
      expect(defaultBtn.getAttribute('data-selected')).toBe('true');
      expect(defaultBtn.classList.contains('selected')).toBe(true);
    });

    it('should have 1 Minggu period option', () => {
      const mingguBtn = document.querySelector('.period-btn-before-after[data-period="1 minggu"]');
      expect(mingguBtn).toBeTruthy();
      expect(mingguBtn.textContent).toContain('1 Minggu');
    });

    it('should have 1 Bulan period option', () => {
      const bulanBtn = document.querySelector('.period-btn-before-after[data-period="1 bulan"]');
      expect(bulanBtn).toBeTruthy();
      expect(bulanBtn.textContent).toContain('1 Bulan');
    });

    it('should have 3 Bulan period option', () => {
      const tigaBulanBtn = document.querySelector('.period-btn-before-after[data-period="3 bulan"]');
      expect(tigaBulanBtn).toBeTruthy();
      expect(tigaBulanBtn.textContent).toContain('3 Bulan');
    });

    it('should have 6 Bulan period option', () => {
      const enamBulanBtn = document.querySelector('.period-btn-before-after[data-period="6 bulan"]');
      expect(enamBulanBtn).toBeTruthy();
      expect(enamBulanBtn.textContent).toContain('6 Bulan');
    });

    it('should have 1 Tahun period option', () => {
      const tahunBtn = document.querySelector('.period-btn-before-after[data-period="1 tahun"]');
      expect(tahunBtn).toBeTruthy();
      expect(tahunBtn.textContent).toContain('1 Tahun');
    });

    it('should have 5 Tahun period option', () => {
      const limaTahunBtn = document.querySelector('.period-btn-before-after[data-period="5 tahun"]');
      expect(limaTahunBtn).toBeTruthy();
      expect(limaTahunBtn.textContent).toContain('5 Tahun');
    });

    it('should have all period options with correct data attributes', () => {
      const periods = [
        { name: 'Custom', data: '' },
        { name: '1 Minggu', data: '1 minggu' },
        { name: '1 Bulan', data: '1 bulan' },
        { name: '3 Bulan', data: '3 bulan' },
        { name: '6 Bulan', data: '6 bulan' },
        { name: '1 Tahun', data: '1 tahun' },
        { name: '5 Tahun', data: '5 tahun' }
      ];
      
      periods.forEach(p => {
        const btn = document.querySelector(`.period-btn-before-after[data-period="${p.data}"]`);
        expect(btn).toBeTruthy();
      });
    });
  });

  // Key Changes Description Tests
  describe('Key Changes Description', () => {
    it('should have description textarea', () => {
      const textarea = document.getElementById('before-after-description');
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should have correct textarea attributes', () => {
      const textarea = document.getElementById('before-after-description');
      expect(textarea.classList.contains('w-full')).toBe(true);
      expect(textarea.classList.contains('p-4')).toBe(true);
      expect(textarea.classList.contains('border-2')).toBe(true);
      expect(textarea.classList.contains('border-slate-200')).toBe(true);
      expect(textarea.classList.contains('rounded-xl')).toBe(true);
      expect(textarea.classList.contains('resize-none')).toBe(true);
      expect(textarea.classList.contains('h-32')).toBe(true);
    });

    it('should have placeholder text', () => {
      const textarea = document.getElementById('before-after-description');
      expect(textarea.placeholder).toBe('Jelaskan perubahan yang terjadi...');
    });

    it('should have focus states', () => {
      const textarea = document.getElementById('before-after-description');
      expect(textarea.classList.contains('focus:border-blue-500')).toBe(true);
      expect(textarea.classList.contains('focus:outline-none')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should have generate button', () => {
      const generateBtn = document.getElementById('before-after-generate-btn');
      expect(generateBtn).toBeTruthy();
    });

    it('should be disabled initially', () => {
      const generateBtn = document.getElementById('before-after-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have correct button text', () => {
      const generateBtn = document.getElementById('before-after-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Before After');
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('before-after-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-slate-600')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have magic icon', () => {
      const magicIcon = document.querySelector('#before-after-generate-btn .fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have disabled state styling', () => {
      const generateBtn = document.getElementById('before-after-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should have results container', () => {
      const resultsContainer = document.getElementById('before-after-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('card')).toBe(true);
      expect(resultsContainer.classList.contains('p-6')).toBe(true);
      expect(resultsContainer.classList.contains('rounded-2xl')).toBe(true);
      expect(resultsContainer.classList.contains('shadow-lg')).toBe(true);
      expect(resultsContainer.classList.contains('bg-white')).toBe(true);
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have empty state', () => {
      const emptyState = document.getElementById('before-after-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.classList.contains('hidden')).toBe(false);
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
    });

    it('should have columns icon in empty state', () => {
      const icon = document.querySelector('#before-after-empty-state .fa-columns');
      expect(icon).toBeTruthy();
    });

    it('should have correct empty state text', () => {
      const emptyState = document.getElementById('before-after-empty-state');
      expect(emptyState.textContent).toContain('Hasil akan muncul di sini');
      expect(emptyState.textContent).toContain('foto before dan after');
    });

    it('should have results grid', () => {
      const results = document.getElementById('before-after-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('grid')).toBe(true);
      expect(results.classList.contains('grid-cols-1')).toBe(true);
      expect(results.classList.contains('gap-6')).toBe(true);
    });

    it('should have loading indicator', () => {
      const loading = document.getElementById('before-after-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.classList.contains('items-center')).toBe(true);
      expect(loading.classList.contains('justify-center')).toBe(true);
    });

    it('should have correct loading text', () => {
      const loading = document.getElementById('before-after-loading');
      expect(loading.textContent).toContain('Sedang membuat before after...');
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have proper card styling for all cards', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
        expect(card.classList.contains('rounded-2xl')).toBe(true);
        expect(card.classList.contains('shadow-lg')).toBe(true);
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have proper section headers', () => {
      const headers = document.querySelectorAll('#content-before-after h2');
      expect(headers.length).toBe(5);
      headers.forEach(header => {
        expect(header.classList.contains('text-xl')).toBe(true);
        expect(header.classList.contains('font-semibold')).toBe(true);
        expect(header.classList.contains('mb-4')).toBe(true);
        expect(header.classList.contains('text-gray-800')).toBe(true);
      });
    });
  });

  // Icons Tests
  describe('Icons', () => {
    it('should have history icon in header', () => {
      const icon = document.querySelector('#content-before-after h1 .fa-history');
      expect(icon).toBeTruthy();
    });

    it('should have home icon for Renovasi Rumah', () => {
      const icon = document.querySelector('.transformation-btn-before-after[data-transformation="Renovasi rumah"] .fa-home');
      expect(icon).toBeTruthy();
    });

    it('should have dumbbell icon for Transformasi Tubuh', () => {
      const icon = document.querySelector('.transformation-btn-before-after[data-transformation="Transformasi tubuh"] .fa-dumbbell');
      expect(icon).toBeTruthy();
    });

    it('should have car icon for Restorasi Kendaraan', () => {
      const icon = document.querySelector('.transformation-btn-before-after[data-transformation="Restorasi kendaraan"] .fa-car');
      expect(icon).toBeTruthy();
    });

    it('should have tshirt icon for Rekomendasi Fashion', () => {
      const icon = document.querySelector('.transformation-btn-before-after[data-transformation="Rekomendasi fashion"] .fa-tshirt');
      expect(icon).toBeTruthy();
    });

    it('should have spa icon for Perawatan Kulit', () => {
      const icon = document.querySelector('.transformation-btn-before-after[data-transformation="Perawatan kulit"] .fa-spa');
      expect(icon).toBeTruthy();
    });

    it('should have couch icon for Tata Ruang', () => {
      const icon = document.querySelector('.transformation-btn-before-after[data-transformation="Tata ruang"] .fa-couch');
      expect(icon).toBeTruthy();
    });

    it('should have palette icon for Proyek Kreatif', () => {
      const icon = document.querySelector('.transformation-btn-before-after[data-transformation="Proyek kreatif"] .fa-palette');
      expect(icon).toBeTruthy();
    });

    it('should have clock icon for Custom period', () => {
      const icon = document.querySelector('.period-btn-before-after[data-period=""] .fa-clock');
      expect(icon).toBeTruthy();
    });

    it('should have calendar icons for time periods', () => {
      const weekIcon = document.querySelector('.period-btn-before-after[data-period="1 minggu"] .fa-calendar-week');
      expect(weekIcon).toBeTruthy();
      
      const altIcon = document.querySelector('.period-btn-before-after[data-period="1 bulan"] .fa-calendar-alt');
      expect(altIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content (Indonesian)', () => {
    it('should have Indonesian header title', () => {
      const title = document.querySelector('#content-before-after h1');
      expect(title.textContent).toContain('Before After Transformation');
    });

    it('should have Indonesian description', () => {
      const description = document.querySelector('#content-before-after header p');
      expect(description.textContent).toContain('Visualisasikan perubahan');
      expect(description.textContent).toContain('perbandingan before-after');
    });

    it('should have Indonesian section headers', () => {
      const headers = document.querySelectorAll('#content-before-after h2');
      expect(headers[0].textContent).toContain('Foto Before');
      expect(headers[1].textContent).toContain('Foto After');
      expect(headers[2].textContent).toContain('Jenis Transformasi');
      expect(headers[3].textContent).toContain('Periode Waktu');
      expect(headers[4].textContent).toContain('Deskripsi Perubahan');
    });

    it('should have Indonesian upload prompts', () => {
      const beforeInput = document.getElementById('before-after-before-image-input');
      expect(beforeInput).toBeTruthy();
      expect(beforeInput.accept).toBe('image/*');
      
      const afterInput = document.getElementById('before-after-after-image-input');
      expect(afterInput).toBeTruthy();
      expect(afterInput.accept).toBe('image/*');
    });

    it('should have Indonesian empty state text', () => {
      const emptyState = document.getElementById('before-after-empty-state');
      expect(emptyState.textContent).toContain('Hasil akan muncul di sini');
      expect(emptyState.textContent).toContain('foto before dan after');
    });

    it('should have Indonesian loading text', () => {
      const loading = document.getElementById('before-after-loading');
      expect(loading.textContent).toContain('Sedang membuat before after');
    });

    it('should have Indonesian button text', () => {
      const generateBtn = document.getElementById('before-after-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Before After');
    });

    it('should have Indonesian textarea placeholder', () => {
      const textarea = document.getElementById('before-after-description');
      expect(textarea.placeholder).toContain('Jelaskan perubahan');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.querySelector('#content-before-after h1');
      expect(h1).toBeTruthy();
      
      const h2s = document.querySelectorAll('#content-before-after h2');
      expect(h2s.length).toBe(5);
    });

    it('should have proper labels for file inputs', () => {
      const beforeLabel = document.querySelector('label[for="before-after-before-image-input"]');
      expect(beforeLabel).toBeTruthy();
      
      const afterLabel = document.querySelector('label[for="before-after-after-image-input"]');
      expect(afterLabel).toBeTruthy();
    });

    it('should have alt text for preview images', () => {
      const beforePreview = document.getElementById('before-after-before-image-preview');
      expect(beforePreview.alt).toBe('Pratinjau Foto Before');
      
      const afterPreview = document.getElementById('before-after-after-image-preview');
      expect(afterPreview.alt).toBe('Pratinjau Foto After');
    });

    it('should have proper button types', () => {
      const buttons = document.querySelectorAll('#content-before-after button');
      buttons.forEach(btn => {
        expect(['button', 'submit']).toContain(btn.type);
      });
    });

    it('should have proper textarea labeling', () => {
      const textarea = document.getElementById('before-after-description');
      expect(textarea).toBeTruthy();
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive header text', () => {
      const h1 = document.querySelector('#content-before-after h1');
      expect(h1.classList.contains('text-4xl')).toBe(true);
      expect(h1.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive grid layout', () => {
      const main = document.querySelector('#content-before-after main');
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.querySelector('.container');
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });

    it('should have responsive period options grid', () => {
      const periodOptions = document.getElementById('before-after-period-options');
      expect(periodOptions.classList.contains('grid-cols-2')).toBe(true);
    });

    it('should have responsive transformation options grid', () => {
      const transformationOptions = document.getElementById('before-after-transformation-options');
      expect(transformationOptions.classList.contains('grid-cols-1')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/slate color scheme in header', () => {
      const header = document.querySelector('#content-before-after h1');
      expect(header.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(header.classList.contains('from-slate-600')).toBe(true);
      expect(header.classList.contains('to-blue-500')).toBe(true);
    });

    it('should use slate/blue color scheme in generate button', () => {
      const generateBtn = document.getElementById('before-after-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-slate-600')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-500')).toBe(true);
    });

    it('should use slate colors for icons and text', () => {
      const emptyStateIcon = document.querySelector('#before-after-empty-state .fa-columns');
      expect(emptyStateIcon.classList.contains('text-slate-400')).toBe(true);
    });

    it('should use gray colors for text and descriptions', () => {
      const description = document.querySelector('#content-before-after header p');
      expect(description.classList.contains('text-gray-600')).toBe(true);
    });

    it('should use slate/gray for section headers', () => {
      const headers = document.querySelectorAll('#content-before-after h2');
      headers.forEach(header => {
        expect(header.classList.contains('text-gray-800')).toBe(true);
      });
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('should have transformation options with data attributes for state tracking', () => {
      const transformationBtns = document.querySelectorAll('.transformation-btn-before-after');
      transformationBtns.forEach(btn => {
        expect(btn.dataset).toHaveProperty('transformation');
      });
    });

    it('should have period options with data attributes for state tracking', () => {
      const periodBtns = document.querySelectorAll('.period-btn-before-after');
      periodBtns.forEach(btn => {
        expect(btn.dataset).toHaveProperty('period');
      });
    });

    it('should have selected state attribute on default options', () => {
      const defaultTransformation = document.querySelector('.transformation-btn-before-after[data-transformation=""]');
      const defaultPeriod = document.querySelector('.period-btn-before-after[data-period=""]');
      
      expect(defaultTransformation.getAttribute('data-selected')).toBe('true');
      expect(defaultPeriod.getAttribute('data-selected')).toBe('true');
    });

    it('should have selected class on default options', () => {
      const defaultTransformation = document.querySelector('.transformation-btn-before-after[data-transformation=""]');
      const defaultPeriod = document.querySelector('.period-btn-before-after[data-period=""]');
      
      expect(defaultTransformation.classList.contains('selected')).toBe(true);
      expect(defaultPeriod.classList.contains('selected')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have both before and after upload sections', () => {
      const beforeInput = document.getElementById('before-after-before-image-input');
      const afterInput = document.getElementById('before-after-after-image-input');
      expect(beforeInput).toBeTruthy();
      expect(afterInput).toBeTruthy();
    });

    it('should have both before and after preview containers', () => {
      const beforePreview = document.getElementById('before-after-before-image-preview-container');
      const afterPreview = document.getElementById('before-after-after-image-preview-container');
      expect(beforePreview).toBeTruthy();
      expect(afterPreview).toBeTruthy();
    });

    it('should have both before and after remove buttons', () => {
      const beforeRemove = document.getElementById('before-after-before-remove-image-btn');
      const afterRemove = document.getElementById('before-after-after-remove-image-btn');
      expect(beforeRemove).toBeTruthy();
      expect(afterRemove).toBeTruthy();
    });

    it('should have all required input sections', () => {
      const transformationOptions = document.getElementById('before-after-transformation-options');
      const periodOptions = document.getElementById('before-after-period-options');
      const description = document.getElementById('before-after-description');
      const generateBtn = document.getElementById('before-after-generate-btn');
      
      expect(transformationOptions).toBeTruthy();
      expect(periodOptions).toBeTruthy();
      expect(description).toBeTruthy();
      expect(generateBtn).toBeTruthy();
    });

    it('should have results area with all states', () => {
      const emptyState = document.getElementById('before-after-empty-state');
      const results = document.getElementById('before-after-results');
      const loading = document.getElementById('before-after-loading');
      
      expect(emptyState).toBeTruthy();
      expect(results).toBeTruthy();
      expect(loading).toBeTruthy();
    });

    it('should have proper upload area styling', () => {
      const uploadLabels = document.querySelectorAll('.file-input-label');
      uploadLabels.forEach(label => {
        expect(label.classList.contains('block')).toBe(true);
        expect(label.classList.contains('border-3')).toBe(true);
        expect(label.classList.contains('border-dashed')).toBe(true);
        expect(label.classList.contains('border-slate-300')).toBe(true);
        expect(label.classList.contains('rounded-xl')).toBe(true);
        expect(label.classList.contains('p-8')).toBe(true);
        expect(label.classList.contains('text-center')).toBe(true);
        expect(label.classList.contains('cursor-pointer')).toBe(true);
        expect(label.classList.contains('hover:border-blue-500')).toBe(true);
      });
    });
  });
});
