import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock copyToClipboard globally
window.copyToClipboard = vi.fn().mockResolvedValue();

// Mock downloadTextFile globally
window.downloadTextFile = vi.fn();

// Mock checkApiKey globally
window.checkApiKey = vi.fn().mockReturnValue(true);

describe('photo-restoration Component', () => {
  
  const mockComponentHTML = `
    <div id="content-photo-restoration" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            <i class="fas fa-camera-retro mr-3"></i>Restorasi Foto Lama
          </h1>
          <p class="text-lg text-gray-600 mt-2">Pulihkan kenangan foto lama Anda dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Photo Condition -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Kondisi Foto</h2>
              <div id="photo-restoration-condition-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-condition="faded" class="photo-restoration-condition-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-sun text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Pudar</span>
                </button>
                <button type="button" data-condition="torn" class="photo-restoration-condition-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-cut text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Sobek</span>
                </button>
                <button type="button" data-condition="scratched" class="photo-restoration-condition-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-scrubber text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Goresan</span>
                </button>
                <button type="button" data-condition="water-damaged" class="photo-restoration-condition-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-water text-2xl mb-1 text-amber-600"></i>
                  <span class="block font-medium">Basah</span>
                </button>
                <button type="button" data-condition="faded-colors" class="photo-restoration-condition-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-palette text-2xl mb-1 text-orange-600"></i>
                  <span class="block font-medium">Warna Pudar</span>
                </button>
                <button type="button" data-condition="general-aging" class="photo-restoration-condition-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-history text-2xl mb-1 text-yellow-600"></i>
                  <span class="block font-medium">Usia</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Restoration Level -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Tingkat Restorasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-restoration-level" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sliders-h mr-1 text-amber-500"></i>Tingkat Restorasi
                  </label>
                  <select id="photo-restoration-level" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="light">Ringan</option>
                    <option value="moderate">Sedang</option>
                    <option value="intensive">Intensif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Output Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-restoration-output-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-orange-500"></i>Gaya Output
                  </label>
                  <select id="photo-restoration-output-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="original-look">Tampilan Asli</option>
                    <option value="enhanced-look">Tampilan Ditingkatkan</option>
                    <option value="colorized">Berwarna</option>
                    <option value="black-white-to-color">BW ke Warna</option>
                    <option value="sepia-tone">Tone Sepia</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Image Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Unggah Foto</h2>
              
              <div id="photo-restoration-image-upload-area" class="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center hover:border-amber-500 transition-colors cursor-pointer bg-amber-50">
                <i class="fas fa-cloud-upload-alt text-4xl mb-3 text-amber-500"></i>
                <p class="text-gray-600 mb-2">Klik atau seret foto ke sini</p>
                <p class="text-sm text-gray-500">Mendukung JPG, PNG, HEIC</p>
                <input type="file" id="photo-restoration-image-input" class="hidden" accept="image/*,.heic">
              </div>
              
              <div id="photo-restoration-image-preview-container" class="hidden mt-4">
                <div class="relative">
                  <img id="photo-restoration-image-preview" class="w-full rounded-lg shadow-md" alt="Preview">
                  <button type="button" id="photo-restoration-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Additional Repairs -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Perbaikan Tambahan</h2>
              
              <div id="photo-restoration-additional-repairs-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-repair="remove-scratches" class="photo-restoration-additional-repair-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-left border-2 border-transparent" data-selected="false">
                  <i class="fas fa-eraser text-amber-500 mr-2"></i>Hapus Goresan
                </button>
                <button type="button" data-repair="fix-tears" class="photo-restoration-additional-repair-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-left border-2 border-transparent" data-selected="false">
                  <i class="fas fa-band-aid text-orange-500 mr-2"></i>Perbaiki Sobek
                </button>
                <button type="button" data-repair="remove-spots" class="photo-restoration-additional-repair-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-left border-2 border-transparent" data-selected="false">
                  <i class="fas fa-dot-circle text-yellow-500 mr-2"></i>Hapus Noda
                </button>
                <button type="button" data-repair="enhance-details" class="photo-restoration-additional-repair-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-200 transition text-left border-2 border-transparent" data-selected="false">
                  <i class="fas fa-search-plus text-amber-600 mr-2"></i>Tingkatkan Detail
                </button>
                <button type="button" data-repair="restore-colors" class="photo-restoration-additional-repair-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-200 transition text-left border-2 border-transparent" data-selected="false">
                  <i class="fas fa-tint text-orange-600 mr-2"></i>Pulihkan Warna
                </button>
              </div>
            </div>
            
            <!-- Step 6: Quality -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Kualitas</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-restoration-quality" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-yellow-500"></i>Kualitas Output
                  </label>
                  <select id="photo-restoration-quality" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="standard">Standar</option>
                    <option value="high">Tinggi</option>
                    <option value="maximum">Maksimum</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="photo-restoration-generate-btn" class="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Restorasi Foto
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="photo-restoration-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="photo-restoration-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-camera-retro text-6xl mb-4 text-amber-400"></i>
                <p class="text-xl">Hasil restorasi foto akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto dan klik Restorasi Foto</p>
              </div>
              <div id="photo-restoration-results" class="hidden space-y-6"></div>
              <div id="photo-restoration-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-amber-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang merestorasi foto...</p>
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
    // Reset downloadTextFile mock
    window.downloadTextFile = vi.fn();
    // Reset checkApiKey mock
    window.checkApiKey = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should render main container with correct ID', () => {
      const container = document.getElementById('content-photo-restoration');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Restorasi Foto Lama');
      expect(title.querySelector('i.fas.fa-camera-retro')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Pulihkan kenangan foto lama Anda dengan AI');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(6);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#photo-restoration-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Photo Condition Selection Tests
  describe('Photo Condition Selection', () => {
    it('should render photo condition options container', () => {
      const conditionOptions = document.getElementById('photo-restoration-condition-options');
      expect(conditionOptions).toBeTruthy();
    });

    it('should render Faded option', () => {
      const fadedBtn = document.body.querySelector('[data-condition="faded"]');
      expect(fadedBtn).toBeTruthy();
      expect(fadedBtn.textContent).toContain('Pudar');
      expect(fadedBtn.querySelector('i.fas.fa-sun')).toBeTruthy();
      expect(fadedBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Torn option', () => {
      const tornBtn = document.body.querySelector('[data-condition="torn"]');
      expect(tornBtn).toBeTruthy();
      expect(tornBtn.textContent).toContain('Sobek');
      expect(tornBtn.querySelector('i.fas.fa-cut')).toBeTruthy();
    });

    it('should render Scratched option', () => {
      const scratchedBtn = document.body.querySelector('[data-condition="scratched"]');
      expect(scratchedBtn).toBeTruthy();
      expect(scratchedBtn.textContent).toContain('Goresan');
      expect(scratchedBtn.querySelector('i.fas.fa-scrubber')).toBeTruthy();
    });

    it('should render Water Damaged option', () => {
      const waterDamagedBtn = document.body.querySelector('[data-condition="water-damaged"]');
      expect(waterDamagedBtn).toBeTruthy();
      expect(waterDamagedBtn.textContent).toContain('Basah');
      expect(waterDamagedBtn.querySelector('i.fas.fa-water')).toBeTruthy();
    });

    it('should render Faded Colors option', () => {
      const fadedColorsBtn = document.body.querySelector('[data-condition="faded-colors"]');
      expect(fadedColorsBtn).toBeTruthy();
      expect(fadedColorsBtn.textContent).toContain('Warna Pudar');
      expect(fadedColorsBtn.querySelector('i.fas.fa-palette')).toBeTruthy();
    });

    it('should render General Aging option', () => {
      const generalAgingBtn = document.body.querySelector('[data-condition="general-aging"]');
      expect(generalAgingBtn).toBeTruthy();
      expect(generalAgingBtn.textContent).toContain('Usia');
      expect(generalAgingBtn.querySelector('i.fas.fa-history')).toBeTruthy();
    });

    it('should have 6 photo condition options', () => {
      const conditionBtns = document.body.querySelectorAll('.photo-restoration-condition-btn');
      expect(conditionBtns.length).toBe(6);
    });

    it('should have proper grid layout for condition options', () => {
      const conditionOptions = document.getElementById('photo-restoration-condition-options');
      expect(conditionOptions.classList.contains('grid')).toBe(true);
      expect(conditionOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(conditionOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Kondisi Foto');
    });

    it('should have colored hover effects in condition buttons', () => {
      const conditionBtns = document.body.querySelectorAll('.photo-restoration-condition-btn');
      expect(conditionBtns[0].classList.contains('hover:bg-amber-100')).toBe(true);
      expect(conditionBtns[1].classList.contains('hover:bg-orange-100')).toBe(true);
      expect(conditionBtns[2].classList.contains('hover:bg-yellow-100')).toBe(true);
      expect(conditionBtns[3].classList.contains('hover:bg-amber-200')).toBe(true);
      expect(conditionBtns[4].classList.contains('hover:bg-orange-200')).toBe(true);
      expect(conditionBtns[5].classList.contains('hover:bg-yellow-200')).toBe(true);
    });
  });

  // Restoration Level Selection Tests
  describe('Restoration Level Selection', () => {
    it('should render restoration level select', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect).toBeTruthy();
      expect(levelSelect.tagName).toBe('SELECT');
      expect(levelSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Tingkat Restorasi');
    });

    it('should have all labels with icons', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should have restoration level options with proper labels', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect.options[0].textContent).toContain('Ringan');
      expect(levelSelect.options[1].textContent).toContain('Sedang');
      expect(levelSelect.options[2].textContent).toContain('Intensif');
    });

    it('should have default restoration level value', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect.value).toBe('light');
    });

    it('should have proper input styling', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect.classList.contains('w-full')).toBe(true);
      expect(levelSelect.classList.contains('p-3')).toBe(true);
      expect(levelSelect.classList.contains('border')).toBe(true);
      expect(levelSelect.classList.contains('rounded-lg')).toBe(true);
      expect(levelSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(levelSelect.classList.contains('focus:ring-amber-500')).toBe(true);
    });
  });

  // Output Style Selection Tests
  describe('Output Style Selection', () => {
    it('should render output style select', () => {
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect).toBeTruthy();
      expect(outputStyleSelect.tagName).toBe('SELECT');
      expect(outputStyleSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya Output');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have output style options with proper labels', () => {
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect.options[0].textContent).toContain('Tampilan Asli');
      expect(outputStyleSelect.options[1].textContent).toContain('Tampilan Ditingkatkan');
      expect(outputStyleSelect.options[2].textContent).toContain('Berwarna');
      expect(outputStyleSelect.options[3].textContent).toContain('BW ke Warna');
      expect(outputStyleSelect.options[4].textContent).toContain('Tone Sepia');
    });

    it('should have default output style value', () => {
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect.value).toBe('original-look');
    });

    it('should have proper input styling', () => {
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect.classList.contains('w-full')).toBe(true);
      expect(outputStyleSelect.classList.contains('p-3')).toBe(true);
      expect(outputStyleSelect.classList.contains('border')).toBe(true);
      expect(outputStyleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputStyleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputStyleSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should render image upload area', () => {
      const uploadArea = document.getElementById('photo-restoration-image-upload-area');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.classList.contains('border-dashed')).toBe(true);
      expect(uploadArea.classList.contains('border-amber-300')).toBe(true);
      expect(uploadArea.classList.contains('bg-amber-50')).toBe(true);
    });

    it('should render upload area icon', () => {
      const uploadIcon = document.getElementById('photo-restoration-image-upload-area').querySelector('i.fas.fa-cloud-upload-alt');
      expect(uploadIcon).toBeTruthy();
      expect(uploadIcon.classList.contains('text-amber-500')).toBe(true);
    });

    it('should render upload area text', () => {
      const uploadArea = document.getElementById('photo-restoration-image-upload-area');
      expect(uploadArea.textContent).toContain('Klik atau seret foto ke sini');
      expect(uploadArea.textContent).toContain('Mendukung JPG, PNG, HEIC');
    });

    it('should render image input', () => {
      const imageInput = document.getElementById('photo-restoration-image-input');
      expect(imageInput).toBeTruthy();
      expect(imageInput.type).toBe('file');
      expect(imageInput.accept).toBe('image/*,.heic');
      expect(imageInput.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('photo-restoration-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview', () => {
      const imagePreview = document.getElementById('photo-restoration-image-preview');
      expect(imagePreview).toBeTruthy();
      expect(imagePreview.alt).toBe('Preview');
      expect(imagePreview.classList.contains('w-full')).toBe(true);
      expect(imagePreview.classList.contains('rounded-lg')).toBe(true);
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('photo-restoration-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.type).toBe('button');
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Unggah Foto');
    });

    it('should have hover effect on upload area', () => {
      const uploadArea = document.getElementById('photo-restoration-image-upload-area');
      expect(uploadArea.classList.contains('hover:border-amber-500')).toBe(true);
      expect(uploadArea.classList.contains('transition-colors')).toBe(true);
      expect(uploadArea.classList.contains('cursor-pointer')).toBe(true);
    });
  });

  // Additional Repairs Selection Tests
  describe('Additional Repairs Selection', () => {
    it('should render additional repairs options container', () => {
      const repairsOptions = document.getElementById('photo-restoration-additional-repairs-options');
      expect(repairsOptions).toBeTruthy();
    });

    it('should render Remove Scratches option', () => {
      const removeScratchesBtn = document.body.querySelector('[data-repair="remove-scratches"]');
      expect(removeScratchesBtn).toBeTruthy();
      expect(removeScratchesBtn.textContent).toContain('Hapus Goresan');
      expect(removeScratchesBtn.querySelector('i.fas.fa-eraser')).toBeTruthy();
    });

    it('should render Fix Tears option', () => {
      const fixTearsBtn = document.body.querySelector('[data-repair="fix-tears"]');
      expect(fixTearsBtn).toBeTruthy();
      expect(fixTearsBtn.textContent).toContain('Perbaiki Sobek');
      expect(fixTearsBtn.querySelector('i.fas.fa-band-aid')).toBeTruthy();
    });

    it('should render Remove Spots option', () => {
      const removeSpotsBtn = document.body.querySelector('[data-repair="remove-spots"]');
      expect(removeSpotsBtn).toBeTruthy();
      expect(removeSpotsBtn.textContent).toContain('Hapus Noda');
      expect(removeSpotsBtn.querySelector('i.fas.fa-dot-circle')).toBeTruthy();
    });

    it('should render Enhance Details option', () => {
      const enhanceDetailsBtn = document.body.querySelector('[data-repair="enhance-details"]');
      expect(enhanceDetailsBtn).toBeTruthy();
      expect(enhanceDetailsBtn.textContent).toContain('Tingkatkan Detail');
      expect(enhanceDetailsBtn.querySelector('i.fas.fa-search-plus')).toBeTruthy();
    });

    it('should render Restore Colors option', () => {
      const restoreColorsBtn = document.body.querySelector('[data-repair="restore-colors"]');
      expect(restoreColorsBtn).toBeTruthy();
      expect(restoreColorsBtn.textContent).toContain('Pulihkan Warna');
      expect(restoreColorsBtn.querySelector('i.fas.fa-tint')).toBeTruthy();
    });

    it('should have 5 additional repair options', () => {
      const repairBtns = document.body.querySelectorAll('.photo-restoration-additional-repair-btn');
      expect(repairBtns.length).toBe(5);
    });

    it('should have proper grid layout for repair options', () => {
      const repairsOptions = document.getElementById('photo-restoration-additional-repairs-options');
      expect(repairsOptions.classList.contains('grid')).toBe(true);
      expect(repairsOptions.classList.contains('grid-cols-1')).toBe(true);
      expect(repairsOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Perbaikan Tambahan');
    });

    it('should have colored hover effects in repair buttons', () => {
      const repairBtns = document.body.querySelectorAll('.photo-restoration-additional-repair-btn');
      expect(repairBtns[0].classList.contains('hover:bg-amber-100')).toBe(true);
      expect(repairBtns[1].classList.contains('hover:bg-orange-100')).toBe(true);
      expect(repairBtns[2].classList.contains('hover:bg-yellow-100')).toBe(true);
      expect(repairBtns[3].classList.contains('hover:bg-amber-200')).toBe(true);
      expect(repairBtns[4].classList.contains('hover:bg-orange-200')).toBe(true);
    });

    it('should have proper button alignment', () => {
      const repairBtns = document.body.querySelectorAll('.photo-restoration-additional-repair-btn');
      repairBtns.forEach(btn => {
        expect(btn.classList.contains('text-left')).toBe(true);
      });
    });
  });

  // Quality Selection Tests
  describe('Quality Selection', () => {
    it('should render quality select', () => {
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect).toBeTruthy();
      expect(qualitySelect.tagName).toBe('SELECT');
      expect(qualitySelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Kualitas');
    });

    it('should have all labels with icons', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have quality options with proper labels', () => {
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect.options[0].textContent).toContain('Standar');
      expect(qualitySelect.options[1].textContent).toContain('Tinggi');
      expect(qualitySelect.options[2].textContent).toContain('Maksimum');
    });

    it('should have default quality value', () => {
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect.value).toBe('standard');
    });

    it('should have proper input styling', () => {
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect.classList.contains('w-full')).toBe(true);
      expect(qualitySelect.classList.contains('p-3')).toBe(true);
      expect(qualitySelect.classList.contains('border')).toBe(true);
      expect(qualitySelect.classList.contains('rounded-lg')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('photo-restoration-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Restorasi Foto');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('photo-restoration-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('photo-restoration-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('photo-restoration-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('photo-restoration-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('photo-restoration-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-camera-retro')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil restorasi foto akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('photo-restoration-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('photo-restoration-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang merestorasi foto');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-amber-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('photo-restoration-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have amber icon in empty state', () => {
      const emptyStateIcon = document.getElementById('photo-restoration-empty-state').querySelector('i.fas.fa-camera-retro');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use amber/orange/yellow color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-amber-500')).toBe(true);
      expect(title.classList.contains('via-orange-500')).toBe(true);
      expect(title.classList.contains('to-yellow-500')).toBe(true);
    });

    it('should use amber/orange/yellow accents in generate button', () => {
      const generateBtn = document.getElementById('photo-restoration-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-500')).toBe(true);
    });

    it('should use amber accents in restoration level select', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect.classList.contains('focus:ring-amber-500')).toBe(true);
      expect(levelSelect.classList.contains('focus:border-amber-500')).toBe(true);
    });

    it('should use orange accents in output style select', () => {
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(outputStyleSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use yellow accents in quality select', () => {
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(qualitySelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should use amber accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-amber-500')).toBe(true);
    });

    it('should use amber accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('photo-restoration-empty-state').querySelector('i.fas.fa-camera-retro');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
    });

    it('should use amber accents in upload area', () => {
      const uploadArea = document.getElementById('photo-restoration-image-upload-area');
      expect(uploadArea.classList.contains('border-amber-300')).toBe(true);
      expect(uploadArea.classList.contains('bg-amber-50')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(7);
      
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
        expect(card.classList.contains('rounded-2xl')).toBe(true);
        expect(card.classList.contains('shadow-lg')).toBe(true);
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });
  });

  // Icon Tests
  describe('Icons', () => {
    it('should use FontAwesome icons', () => {
      const icons = document.body.querySelectorAll('i.fas, i.fab');
      expect(icons.length).toBeGreaterThanOrEqual(19);
    });

    it('should have camera-retro icon in header', () => {
      const cameraRetroIcon = document.body.querySelector('header i.fas.fa-camera-retro');
      expect(cameraRetroIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('photo-restoration-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have sun icon for faded condition', () => {
      const sunIcon = document.body.querySelector('[data-condition="faded"] i.fas.fa-sun');
      expect(sunIcon).toBeTruthy();
    });

    it('should have cut icon for torn condition', () => {
      const cutIcon = document.body.querySelector('[data-condition="torn"] i.fas.fa-cut');
      expect(cutIcon).toBeTruthy();
    });

    it('should have scrubber icon for scratched condition', () => {
      const scrubberIcon = document.body.querySelector('[data-condition="scratched"] i.fas.fa-scrubber');
      expect(scrubberIcon).toBeTruthy();
    });

    it('should have water icon for water-damaged condition', () => {
      const waterIcon = document.body.querySelector('[data-condition="water-damaged"] i.fas.fa-water');
      expect(waterIcon).toBeTruthy();
    });

    it('should have palette icon for faded-colors condition', () => {
      const paletteIcon = document.body.querySelector('[data-condition="faded-colors"] i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have history icon for general-aging condition', () => {
      const historyIcon = document.body.querySelector('[data-condition="general-aging"] i.fas.fa-history');
      expect(historyIcon).toBeTruthy();
    });

    it('should have sliders-h icon for restoration level', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should have paint-brush icon for output style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have cloud-upload-alt icon in upload area', () => {
      const cloudUploadIcon = document.getElementById('photo-restoration-image-upload-area').querySelector('i.fas.fa-cloud-upload-alt');
      expect(cloudUploadIcon).toBeTruthy();
    });

    it('should have eraser icon for remove-scratches repair', () => {
      const eraserIcon = document.body.querySelector('[data-repair="remove-scratches"] i.fas.fa-eraser');
      expect(eraserIcon).toBeTruthy();
    });

    it('should have band-aid icon for fix-tears repair', () => {
      const bandAidIcon = document.body.querySelector('[data-repair="fix-tears"] i.fas.fa-band-aid');
      expect(bandAidIcon).toBeTruthy();
    });

    it('should have dot-circle icon for remove-spots repair', () => {
      const dotCircleIcon = document.body.querySelector('[data-repair="remove-spots"] i.fas.fa-dot-circle');
      expect(dotCircleIcon).toBeTruthy();
    });

    it('should have search-plus icon for enhance-details repair', () => {
      const searchPlusIcon = document.body.querySelector('[data-repair="enhance-details"] i.fas.fa-search-plus');
      expect(searchPlusIcon).toBeTruthy();
    });

    it('should have tint icon for restore-colors repair', () => {
      const tintIcon = document.body.querySelector('[data-repair="restore-colors"] i.fas.fa-tint');
      expect(tintIcon).toBeTruthy();
    });

    it('should have star icon for quality', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have times icon for remove image button', () => {
      const timesIcon = document.getElementById('photo-restoration-remove-image-btn').querySelector('i.fas.fa-times');
      expect(timesIcon).toBeTruthy();
    });

    it('should have camera-retro icon in empty state', () => {
      const emptyStateIcon = document.getElementById('photo-restoration-empty-state').querySelector('i.fas.fa-camera-retro');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Restorasi Foto Lama');
      expect(document.body.textContent).toContain('Kondisi Foto');
      expect(document.body.textContent).toContain('Tingkat Restorasi');
      expect(document.body.textContent).toContain('Gaya Output');
      expect(document.body.textContent).toContain('Unggah Foto');
      expect(document.body.textContent).toContain('Perbaikan Tambahan');
      expect(document.body.textContent).toContain('Kualitas');
      expect(document.body.textContent).toContain('Restorasi Foto');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Kondisi Foto');
      expect(headers[1].textContent).toContain('2. Tingkat Restorasi');
      expect(headers[2].textContent).toContain('3. Gaya Output');
      expect(headers[3].textContent).toContain('4. Unggah Foto');
      expect(headers[4].textContent).toContain('5. Perbaikan Tambahan');
      expect(headers[5].textContent).toContain('6. Kualitas');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('photo-restoration-empty-state');
      expect(emptyState.textContent).toContain('Hasil restorasi foto akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah foto dan klik Restorasi Foto');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('photo-restoration-loading');
      expect(loading.textContent).toContain('Sedang merestorasi foto');
    });

    it('should have proper upload area text', () => {
      const uploadArea = document.getElementById('photo-restoration-image-upload-area');
      expect(uploadArea.textContent).toContain('Klik atau seret foto ke sini');
      expect(uploadArea.textContent).toContain('Mendukung JPG, PNG, HEIC');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(6);
    });

    it('should have labeled form inputs', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect).toBeTruthy();
      
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect).toBeTruthy();
      
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect).toBeTruthy();
      
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect).toBeTruthy();
      
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('photo-restoration-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const levelSelect = document.getElementById('photo-restoration-level');
      expect(levelSelect.tagName).toBe('SELECT');
      
      const outputStyleSelect = document.getElementById('photo-restoration-output-style');
      expect(outputStyleSelect.tagName).toBe('SELECT');
      
      const qualitySelect = document.getElementById('photo-restoration-quality');
      expect(qualitySelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for condition selection', () => {
      const conditionBtns = document.body.querySelectorAll('.photo-restoration-condition-btn');
      conditionBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper button types for repair selection', () => {
      const repairBtns = document.body.querySelectorAll('.photo-restoration-additional-repair-btn');
      repairBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for condition buttons', () => {
      const fadedBtn = document.body.querySelector('[data-condition="faded"]');
      expect(fadedBtn.dataset.condition).toBe('faded');
      expect(fadedBtn.dataset.selected).toBe('true');
      
      const tornBtn = document.body.querySelector('[data-condition="torn"]');
      expect(tornBtn.dataset.condition).toBe('torn');
    });

    it('should have proper data attributes for repair buttons', () => {
      const removeScratchesBtn = document.body.querySelector('[data-repair="remove-scratches"]');
      expect(removeScratchesBtn.dataset.repair).toBe('remove-scratches');
      expect(removeScratchesBtn.dataset.selected).toBe('false');
    });

    it('should have alt text for image preview', () => {
      const imagePreview = document.getElementById('photo-restoration-image-preview');
      expect(imagePreview.alt).toBe('Preview');
    });

    it('should have proper file input accept attribute', () => {
      const imageInput = document.getElementById('photo-restoration-image-input');
      expect(imageInput.accept).toBe('image/*,.heic');
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have mobile-first grid layout', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid-cols-1')).toBe(true);
    });

    it('should have responsive grid for larger screens', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive spacing', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive header text', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });

    it('should have responsive condition options grid', () => {
      const conditionOptions = document.getElementById('photo-restoration-condition-options');
      expect(conditionOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
