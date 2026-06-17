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

describe('photo-angle Component', () => {
  
  const mockComponentHTML = `
    <div id="content-photo-angle" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 bg-clip-text text-transparent">
            <i class="fas fa-sync-alt mr-3"></i>Ubah Sudut Foto
          </h1>
          <p class="text-lg text-gray-600 mt-2">Ubah sudut dan perspektif foto dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Upload Image -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto</h2>
              
              <div id="photo-angle-image-upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer">
                <i class="fas fa-cloud-upload-alt text-4xl text-teal-500 mb-3"></i>
                <p class="text-gray-600">Klik atau tarik foto ke sini</p>
                <p class="text-sm text-gray-400 mt-1">JPG, PNG, HEIC (max 10MB)</p>
                <input type="file" id="photo-angle-image-input" accept="image/*,.heic" class="hidden">
              </div>
              
              <div id="photo-angle-image-preview-container" class="hidden mt-4">
                <div class="relative">
                  <img id="photo-angle-image-preview" class="w-full rounded-lg shadow-md" alt="Pratinjau Foto">
                  <button id="photo-angle-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Step 2: Angle Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Perubahan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-angle-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-random mr-1 text-teal-500"></i>Jenis Perubahan Sudut
                  </label>
                  <select id="photo-angle-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="rotate-90-cw">Rotasi 90° Searah Jarum Jam</option>
                    <option value="rotate-90-ccw">Rotasi 90° Berlawanan Jarum Jam</option>
                    <option value="rotate-180">Rotasi 180°</option>
                    <option value="flip-horizontal">Balik Horizontal</option>
                    <option value="flip-vertical">Balik Vertikal</option>
                    <option value="perspective-left">Perspektif Kiri</option>
                    <option value="perspective-right">Perspektif Kanan</option>
                    <option value="perspective-top">Perspektif Atas</option>
                    <option value="perspective-bottom">Perspektif Bawah</option>
                    <option value="tilt-left">Miring Kiri 15°</option>
                    <option value="tilt-right">Miring Kanan 15°</option>
                    <option value="straighten">Luruskan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Custom Angle -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Sudut Kustom</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-angle-custom" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sliders-h mr-1 text-emerald-500"></i>Sudut Kustom (-45° hingga 45°)
                  </label>
                  <input type="range" id="photo-angle-custom" min="-45" max="45" value="0" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500">
                  <div class="flex justify-between text-sm text-gray-500 mt-1">
                    <span>-45°</span>
                    <span id="photo-angle-custom-value">0°</span>
                    <span>45°</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Output Format -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Format Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-angle-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-image mr-1 text-green-500"></i>Format Gambar
                  </label>
                  <select id="photo-angle-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
                
                <div>
                  <label for="photo-angle-quality" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sliders-h mr-1 text-cyan-500"></i>Kualitas
                  </label>
                  <select id="photo-angle-quality" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="high">Tinggi (Best Quality)</option>
                    <option value="medium">Sedang (Balanced)</option>
                    <option value="low">Rendah (Small File)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Generate Button -->
            <button id="photo-angle-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Ubah Sudut Foto
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="photo-angle-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="photo-angle-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-sync-alt text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil foto dengan sudut baru akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto dan pilih perubahan sudut yang diinginkan</p>
              </div>
              <div id="photo-angle-results" class="hidden space-y-6"></div>
              <div id="photo-angle-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang mengubah sudut foto...</p>
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
      const container = document.getElementById('content-photo-angle');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Ubah Sudut Foto');
      expect(title.querySelector('i.fas.fa-sync-alt')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Ubah sudut dan perspektif foto dengan AI');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(4);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#photo-angle-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Image Upload Area Tests
  describe('Image Upload Area', () => {
    it('should render image upload area', () => {
      const uploadArea = document.getElementById('photo-angle-image-upload-area');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.classList.contains('border-2')).toBe(true);
      expect(uploadArea.classList.contains('border-dashed')).toBe(true);
      expect(uploadArea.classList.contains('border-gray-300')).toBe(true);
      expect(uploadArea.classList.contains('rounded-xl')).toBe(true);
      expect(uploadArea.classList.contains('cursor-pointer')).toBe(true);
    });

    it('should render upload area icon', () => {
      const uploadIcon = document.getElementById('photo-angle-image-upload-area').querySelector('i.fas.fa-cloud-upload-alt');
      expect(uploadIcon).toBeTruthy();
      expect(uploadIcon.classList.contains('text-4xl')).toBe(true);
      expect(uploadIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should render upload area text', () => {
      const uploadArea = document.getElementById('photo-angle-image-upload-area');
      expect(uploadArea.textContent).toContain('Klik atau tarik foto ke sini');
      expect(uploadArea.textContent).toContain('JPG, PNG, HEIC (max 10MB)');
    });

    it('should render file input', () => {
      const fileInput = document.getElementById('photo-angle-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.type).toBe('file');
      expect(fileInput.accept).toBe('image/*,.heic');
      expect(fileInput.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('photo-angle-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview', () => {
      const imagePreview = document.getElementById('photo-angle-image-preview');
      expect(imagePreview).toBeTruthy();
      expect(imagePreview.alt).toBe('Pratinjau Foto');
      expect(imagePreview.classList.contains('w-full')).toBe(true);
      expect(imagePreview.classList.contains('rounded-lg')).toBe(true);
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('photo-angle-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
      expect(removeBtn.classList.contains('text-white')).toBe(true);
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should have hover effects on upload area', () => {
      const uploadArea = document.getElementById('photo-angle-image-upload-area');
      expect(uploadArea.classList.contains('hover:border-teal-500')).toBe(true);
      expect(uploadArea.classList.contains('hover:bg-teal-50')).toBe(true);
      expect(uploadArea.classList.contains('transition-colors')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Unggah Foto');
    });
  });

  // Angle Type Selection Tests
  describe('Angle Type Selection', () => {
    it('should render angle type select', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect).toBeTruthy();
      expect(angleTypeSelect.tagName).toBe('SELECT');
      expect(angleTypeSelect.options.length).toBe(12);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jenis Perubahan');
    });

    it('should have all labels with icons', () => {
      const randomIcon = document.body.querySelector('i.fas.fa-random');
      expect(randomIcon).toBeTruthy();
    });

    it('should have angle type options with proper labels', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect.options[0].textContent).toContain('Rotasi 90° Searah Jarum Jam');
      expect(angleTypeSelect.options[1].textContent).toContain('Rotasi 90° Berlawanan Jarum Jam');
      expect(angleTypeSelect.options[2].textContent).toContain('Rotasi 180°');
      expect(angleTypeSelect.options[3].textContent).toContain('Balik Horizontal');
      expect(angleTypeSelect.options[4].textContent).toContain('Balik Vertikal');
      expect(angleTypeSelect.options[5].textContent).toContain('Perspektif Kiri');
      expect(angleTypeSelect.options[6].textContent).toContain('Perspektif Kanan');
      expect(angleTypeSelect.options[7].textContent).toContain('Perspektif Atas');
      expect(angleTypeSelect.options[8].textContent).toContain('Perspektif Bawah');
      expect(angleTypeSelect.options[9].textContent).toContain('Miring Kiri 15°');
      expect(angleTypeSelect.options[10].textContent).toContain('Miring Kanan 15°');
      expect(angleTypeSelect.options[11].textContent).toContain('Luruskan');
    });

    it('should have angle type option values', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect.options[0].value).toBe('rotate-90-cw');
      expect(angleTypeSelect.options[1].value).toBe('rotate-90-ccw');
      expect(angleTypeSelect.options[2].value).toBe('rotate-180');
      expect(angleTypeSelect.options[3].value).toBe('flip-horizontal');
      expect(angleTypeSelect.options[4].value).toBe('flip-vertical');
      expect(angleTypeSelect.options[5].value).toBe('perspective-left');
      expect(angleTypeSelect.options[6].value).toBe('perspective-right');
      expect(angleTypeSelect.options[7].value).toBe('perspective-top');
      expect(angleTypeSelect.options[8].value).toBe('perspective-bottom');
      expect(angleTypeSelect.options[9].value).toBe('tilt-left');
      expect(angleTypeSelect.options[10].value).toBe('tilt-right');
      expect(angleTypeSelect.options[11].value).toBe('straighten');
    });

    it('should have default angle type value', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect.value).toBe('rotate-90-cw');
    });

    it('should have proper input styling', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect.classList.contains('w-full')).toBe(true);
      expect(angleTypeSelect.classList.contains('p-3')).toBe(true);
      expect(angleTypeSelect.classList.contains('border')).toBe(true);
      expect(angleTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(angleTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(angleTypeSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Custom Angle Input Tests
  describe('Custom Angle Input', () => {
    it('should render custom angle slider', () => {
      const customSlider = document.getElementById('photo-angle-custom');
      expect(customSlider).toBeTruthy();
      expect(customSlider.type).toBe('range');
      expect(customSlider.min).toBe('-45');
      expect(customSlider.max).toBe('45');
      expect(customSlider.value).toBe('0');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Sudut Kustom');
    });

    it('should have all labels with icons', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should render custom angle value display', () => {
      const customValue = document.getElementById('photo-angle-custom-value');
      expect(customValue).toBeTruthy();
      expect(customValue.textContent).toBe('0°');
    });

    it('should have slider range labels', () => {
      const uploadArea = document.getElementById('photo-angle-custom').parentElement;
      expect(uploadArea.textContent).toContain('-45°');
      expect(uploadArea.textContent).toContain('45°');
    });

    it('should have proper slider styling', () => {
      const customSlider = document.getElementById('photo-angle-custom');
      expect(customSlider.classList.contains('w-full')).toBe(true);
      expect(customSlider.classList.contains('h-2')).toBe(true);
      expect(customSlider.classList.contains('bg-gray-200')).toBe(true);
      expect(customSlider.classList.contains('rounded-lg')).toBe(true);
      expect(customSlider.classList.contains('appearance-none')).toBe(true);
      expect(customSlider.classList.contains('cursor-pointer')).toBe(true);
      expect(customSlider.classList.contains('accent-teal-500')).toBe(true);
    });

    it('should have proper value display styling', () => {
      const customValue = document.getElementById('photo-angle-custom-value');
      expect(customValue).toBeTruthy();
      expect(customValue.textContent).toContain('0°');
    });
  });

  // Output Format Tests
  describe('Output Format', () => {
    it('should render format select', () => {
      const formatSelect = document.getElementById('photo-angle-format');
      expect(formatSelect).toBeTruthy();
      expect(formatSelect.tagName).toBe('SELECT');
      expect(formatSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Format Output');
    });

    it('should have format label with icon', () => {
      const fileImageIcon = document.body.querySelector('i.fas.fa-file-image');
      expect(fileImageIcon).toBeTruthy();
    });

    it('should have format options with proper labels', () => {
      const formatSelect = document.getElementById('photo-angle-format');
      expect(formatSelect.options[0].textContent).toContain('JPEG');
      expect(formatSelect.options[1].textContent).toContain('PNG');
      expect(formatSelect.options[2].textContent).toContain('WebP');
    });

    it('should have default format value', () => {
      const formatSelect = document.getElementById('photo-angle-format');
      expect(formatSelect.value).toBe('jpeg');
    });

    it('should have proper format select styling', () => {
      const formatSelect = document.getElementById('photo-angle-format');
      expect(formatSelect.classList.contains('w-full')).toBe(true);
      expect(formatSelect.classList.contains('p-3')).toBe(true);
      expect(formatSelect.classList.contains('border')).toBe(true);
      expect(formatSelect.classList.contains('rounded-lg')).toBe(true);
      expect(formatSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(formatSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
    });

    it('should render quality select', () => {
      const qualitySelect = document.getElementById('photo-angle-quality');
      expect(qualitySelect).toBeTruthy();
      expect(qualitySelect.tagName).toBe('SELECT');
      expect(qualitySelect.options.length).toBe(3);
    });

    it('should have quality label with icon', () => {
      const qualitySlidersIcon = document.body.querySelectorAll('i.fas.fa-sliders-h')[1];
      expect(qualitySlidersIcon).toBeTruthy();
    });

    it('should have quality options with proper labels', () => {
      const qualitySelect = document.getElementById('photo-angle-quality');
      expect(qualitySelect.options[0].textContent).toContain('Tinggi (Best Quality)');
      expect(qualitySelect.options[1].textContent).toContain('Sedang (Balanced)');
      expect(qualitySelect.options[2].textContent).toContain('Rendah (Small File)');
    });

    it('should have default quality value', () => {
      const qualitySelect = document.getElementById('photo-angle-quality');
      expect(qualitySelect.value).toBe('high');
    });

    it('should have proper quality select styling', () => {
      const qualitySelect = document.getElementById('photo-angle-quality');
      expect(qualitySelect.classList.contains('w-full')).toBe(true);
      expect(qualitySelect.classList.contains('p-3')).toBe(true);
      expect(qualitySelect.classList.contains('border')).toBe(true);
      expect(qualitySelect.classList.contains('rounded-lg')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('photo-angle-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Ubah Sudut Foto');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('photo-angle-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-green-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('photo-angle-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('photo-angle-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('photo-angle-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('photo-angle-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-sync-alt')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil foto dengan sudut baru akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('photo-angle-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('photo-angle-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang mengubah sudut foto');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('photo-angle-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('photo-angle-empty-state').querySelector('i.fas.fa-sync-alt');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });

    it('should have proper empty state instruction text', () => {
      const emptyState = document.getElementById('photo-angle-empty-state');
      expect(emptyState.textContent).toContain('Unggah foto dan pilih perubahan sudut yang diinginkan');
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/emerald/green color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-500')).toBe(true);
      expect(title.classList.contains('via-emerald-500')).toBe(true);
      expect(title.classList.contains('to-green-500')).toBe(true);
    });

    it('should use teal/emerald/green accents in generate button', () => {
      const generateBtn = document.getElementById('photo-angle-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-green-500')).toBe(true);
    });

    it('should use teal accents in upload area icon', () => {
      const uploadIcon = document.getElementById('photo-angle-image-upload-area').querySelector('i.fas.fa-cloud-upload-alt');
      expect(uploadIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should use teal accents in angle type select', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(angleTypeSelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use emerald accents in custom angle slider', () => {
      const customSlider = document.getElementById('photo-angle-custom');
      expect(customSlider.classList.contains('accent-teal-500')).toBe(true);
    });

    it('should use emerald accents in format select', () => {
      const formatSelect = document.getElementById('photo-angle-format');
      expect(formatSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(formatSelect.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use cyan accents in quality select', () => {
      const qualitySelect = document.getElementById('photo-angle-quality');
      expect(qualitySelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(qualitySelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('photo-angle-empty-state').querySelector('i.fas.fa-sync-alt');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });

    it('should use teal hover effects in upload area', () => {
      const uploadArea = document.getElementById('photo-angle-image-upload-area');
      expect(uploadArea.classList.contains('hover:border-teal-500')).toBe(true);
      expect(uploadArea.classList.contains('hover:bg-teal-50')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(5);
      
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
      expect(icons.length).toBeGreaterThanOrEqual(9);
    });

    it('should have sync-alt icon in header', () => {
      const syncAltIcon = document.body.querySelector('header i.fas.fa-sync-alt');
      expect(syncAltIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('photo-angle-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have cloud-upload-alt icon in upload area', () => {
      const cloudUploadIcon = document.getElementById('photo-angle-image-upload-area').querySelector('i.fas.fa-cloud-upload-alt');
      expect(cloudUploadIcon).toBeTruthy();
    });

    it('should have times icon in remove button', () => {
      const timesIcon = document.getElementById('photo-angle-remove-image-btn').querySelector('i.fas.fa-times');
      expect(timesIcon).toBeTruthy();
    });

    it('should have random icon for angle type', () => {
      const randomIcon = document.body.querySelector('i.fas.fa-random');
      expect(randomIcon).toBeTruthy();
    });

    it('should have sliders-h icon for custom angle', () => {
      const slidersIcons = document.body.querySelectorAll('i.fas.fa-sliders-h');
      expect(slidersIcons.length).toBe(2);
    });

    it('should have file-image icon for format', () => {
      const fileImageIcon = document.body.querySelector('i.fas.fa-file-image');
      expect(fileImageIcon).toBeTruthy();
    });

    it('should have sync-alt icon in empty state', () => {
      const emptyStateIcon = document.getElementById('photo-angle-empty-state').querySelector('i.fas.fa-sync-alt');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Ubah Sudut Foto');
      expect(document.body.textContent).toContain('Unggah Foto');
      expect(document.body.textContent).toContain('Jenis Perubahan');
      expect(document.body.textContent).toContain('Sudut Kustom');
      expect(document.body.textContent).toContain('Format Output');
      expect(document.body.textContent).toContain('Ubah Sudut Foto');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(4);
      expect(headers[0].textContent).toContain('1. Unggah Foto');
      expect(headers[1].textContent).toContain('2. Jenis Perubahan');
      expect(headers[2].textContent).toContain('3. Sudut Kustom');
      expect(headers[3].textContent).toContain('4. Format Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('photo-angle-empty-state');
      expect(emptyState.textContent).toContain('Hasil foto dengan sudut baru akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah foto dan pilih perubahan sudut yang diinginkan');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('photo-angle-loading');
      expect(loading.textContent).toContain('Sedang mengubah sudut foto');
    });

    it('should have proper upload area text', () => {
      const uploadArea = document.getElementById('photo-angle-image-upload-area');
      expect(uploadArea.textContent).toContain('Klik atau tarik foto ke sini');
      expect(uploadArea.textContent).toContain('JPG, PNG, HEIC (max 10MB)');
    });

    it('should have proper custom angle slider labels', () => {
      const customSlider = document.getElementById('photo-angle-custom').parentElement;
      expect(customSlider.textContent).toContain('Sudut Kustom (-45° hingga 45°)');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(4);
    });

    it('should have labeled form inputs', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect).toBeTruthy();
      
      const customSlider = document.getElementById('photo-angle-custom');
      expect(customSlider).toBeTruthy();
      
      const formatSelect = document.getElementById('photo-angle-format');
      expect(formatSelect).toBeTruthy();
      
      const qualitySelect = document.getElementById('photo-angle-quality');
      expect(qualitySelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const angleTypeLabel = document.querySelector('label[for="photo-angle-type"]');
      expect(angleTypeLabel).toBeTruthy();
      
      const formatLabel = document.querySelector('label[for="photo-angle-format"]');
      expect(formatLabel).toBeTruthy();
      
      const qualityLabel = document.querySelector('label[for="photo-angle-quality"]');
      expect(qualityLabel).toBeTruthy();
    });

    it('should have proper label for custom angle slider', () => {
      const customLabel = document.querySelector('label[for="photo-angle-custom"]');
      expect(customLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('photo-angle-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const angleTypeSelect = document.getElementById('photo-angle-type');
      expect(angleTypeSelect.tagName).toBe('SELECT');
      
      const formatSelect = document.getElementById('photo-angle-format');
      expect(formatSelect.tagName).toBe('SELECT');
      
      const qualitySelect = document.getElementById('photo-angle-quality');
      expect(qualitySelect.tagName).toBe('SELECT');
    });

    it('should have proper file input type', () => {
      const fileInput = document.getElementById('photo-angle-image-input');
      expect(fileInput.type).toBe('file');
    });

    it('should have proper range input type', () => {
      const customSlider = document.getElementById('photo-angle-custom');
      expect(customSlider.type).toBe('range');
    });

    it('should have alt text for image preview', () => {
      const imagePreview = document.getElementById('photo-angle-image-preview');
      expect(imagePreview.alt).toBe('Pratinjau Foto');
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

    it('should have responsive upload area padding', () => {
      const uploadArea = document.getElementById('photo-angle-image-upload-area');
      expect(uploadArea.classList.contains('p-8')).toBe(true);
    });
  });
});
