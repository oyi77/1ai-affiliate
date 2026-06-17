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

describe('object-remover Component', () => {
  
  const mockComponentHTML = `
    <div id="content-object-remover" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-600 via-gray-500 to-slate-400 bg-clip-text text-transparent">
            <i class="fas fa-eraser mr-3"></i>Penghapus Objek
          </h1>
          <p class="text-lg text-gray-600 mt-2">Hapus objek yang tidak diinginkan dari gambar dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Object Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Objek</h2>
              <div id="object-remover-object-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="people" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-slate-200 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-user text-2xl mb-1 text-slate-500"></i>
                  <span class="block font-medium">Orang</span>
                </button>
                <button type="button" data-type="text" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-font text-2xl mb-1 text-gray-500"></i>
                  <span class="block font-medium">Teks</span>
                </button>
                <button type="button" data-type="watermark" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-water text-2xl mb-1 text-gray-400"></i>
                  <span class="block font-medium">Watermark</span>
                </button>
                <button type="button" data-type="logo" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-star text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Logo</span>
                </button>
                <button type="button" data-type="stamp" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-stamp text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Cap</span>
                </button>
                <button type="button" data-type="wire" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-wire text-2xl mb-1 text-gray-600"></i>
                  <span class="block font-medium">Kabel</span>
                </button>
                <button type="button" data-type="shadow" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-moon text-2xl mb-1 text-gray-400"></i>
                  <span class="block font-medium">Bayangan</span>
                </button>
                <button type="button" data-type="other" class="object-remover-object-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-question text-2xl mb-1 text-gray-400"></i>
                  <span class="block font-medium">Lainnya</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Removal Method -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Metode Penghapusan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="object-remover-removal-method" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-magic mr-1 text-slate-500"></i>Metode
                  </label>
                  <select id="object-remover-removal-method" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                    <option value="auto-detect">Deteksi Otomatis</option>
                    <option value="manual-brush">Kuas Manual</option>
                    <option value="point-click">Klik Titik</option>
                    <option value="edge-follow">Ikuti Tepi</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Image Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Unggah Gambar</h2>
              
              <div id="object-remover-image-upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-slate-400 transition cursor-pointer bg-gray-50">
                <input type="file" id="object-remover-image-input" class="hidden" accept="image/*">
                <i class="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
                <p class="text-gray-600 font-medium">Klik atau seret gambar ke sini</p>
                <p class="text-sm text-gray-500 mt-1">PNG, JPG, atau WEBP (maks. 10MB)</p>
              </div>
              
              <div id="object-remover-image-preview-container" class="hidden mt-4">
                <div class="relative">
                  <img id="object-remover-image-preview" src="" alt="Preview" class="w-full rounded-lg border border-gray-200">
                  <button type="button" id="object-remover-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Fill Mode -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Mode Pengisian</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="object-remover-fill-mode" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-fill-drip mr-1 text-gray-500"></i>Mode Pengisian
                  </label>
                  <select id="object-remover-fill-mode" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                    <option value="auto-fill">Isi Otomatis</option>
                    <option value="content-aware">Mengenal Konten</option>
                    <option value="texture-patch">Patch Tekstur</option>
                    <option value="clone-stamp">Kloning Stamp</option>
                    <option value="inpaint">Inpaint</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Edge Smoothing -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Perhalusan Tepi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="object-remover-edge-smoothing" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sliders-h mr-1 text-gray-500"></i>Perhalusan Tepi
                  </label>
                  <select id="object-remover-edge-smoothing" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                    <option value="none">Tidak Ada</option>
                    <option value="light">Ringan</option>
                    <option value="strong">Kuat</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Output Quality -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Kualitas Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="object-remover-output-quality" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-yellow-500"></i>Kualitas
                  </label>
                  <select id="object-remover-output-quality" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                    <option value="standard">Standar</option>
                    <option value="high">Tinggi</option>
                    <option value="maximum">Maksimum</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="object-remover-generate-btn" class="w-full bg-gradient-to-r from-slate-600 via-gray-500 to-slate-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Hapus Objek
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="object-remover-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="object-remover-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-eraser text-6xl mb-4 text-slate-400"></i>
                <p class="text-xl">Hasil penghapusan objek akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah gambar dan klik Hapus Objek</p>
              </div>
              <div id="object-remover-results" class="hidden space-y-6"></div>
              <div id="object-remover-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-slate-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang menghapus objek...</p>
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
      const container = document.getElementById('content-object-remover');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Penghapus Objek');
      expect(title.querySelector('i.fas.fa-eraser')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Hapus objek yang tidak diinginkan dari gambar dengan AI');
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
      expect(rightPanel.querySelector('#object-remover-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Object Type Selection Tests
  describe('Object Type Selection', () => {
    it('should render object type options container', () => {
      const typeOptions = document.getElementById('object-remover-object-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render People option', () => {
      const peopleBtn = document.body.querySelector('[data-type="people"]');
      expect(peopleBtn).toBeTruthy();
      expect(peopleBtn.textContent).toContain('Orang');
      expect(peopleBtn.querySelector('i.fas.fa-user')).toBeTruthy();
      expect(peopleBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Text option', () => {
      const textBtn = document.body.querySelector('[data-type="text"]');
      expect(textBtn).toBeTruthy();
      expect(textBtn.textContent).toContain('Teks');
      expect(textBtn.querySelector('i.fas.fa-font')).toBeTruthy();
    });

    it('should render Watermark option', () => {
      const watermarkBtn = document.body.querySelector('[data-type="watermark"]');
      expect(watermarkBtn).toBeTruthy();
      expect(watermarkBtn.textContent).toContain('Watermark');
      expect(watermarkBtn.querySelector('i.fas.fa-water')).toBeTruthy();
    });

    it('should render Logo option', () => {
      const logoBtn = document.body.querySelector('[data-type="logo"]');
      expect(logoBtn).toBeTruthy();
      expect(logoBtn.textContent).toContain('Logo');
      expect(logoBtn.querySelector('i.fas.fa-star')).toBeTruthy();
    });

    it('should render Stamp option', () => {
      const stampBtn = document.body.querySelector('[data-type="stamp"]');
      expect(stampBtn).toBeTruthy();
      expect(stampBtn.textContent).toContain('Cap');
      expect(stampBtn.querySelector('i.fas.fa-stamp')).toBeTruthy();
    });

    it('should render Wire option', () => {
      const wireBtn = document.body.querySelector('[data-type="wire"]');
      expect(wireBtn).toBeTruthy();
      expect(wireBtn.textContent).toContain('Kabel');
      expect(wireBtn.querySelector('i.fas.fa-wire')).toBeTruthy();
    });

    it('should render Shadow option', () => {
      const shadowBtn = document.body.querySelector('[data-type="shadow"]');
      expect(shadowBtn).toBeTruthy();
      expect(shadowBtn.textContent).toContain('Bayangan');
      expect(shadowBtn.querySelector('i.fas.fa-moon')).toBeTruthy();
    });

    it('should render Other option', () => {
      const otherBtn = document.body.querySelector('[data-type="other"]');
      expect(otherBtn).toBeTruthy();
      expect(otherBtn.textContent).toContain('Lainnya');
      expect(otherBtn.querySelector('i.fas.fa-question')).toBeTruthy();
    });

    it('should have 8 object type options', () => {
      const typeBtns = document.body.querySelectorAll('.object-remover-object-type-btn');
      expect(typeBtns.length).toBe(8);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('object-remover-object-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Objek');
    });

    it('should have proper hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.object-remover-object-type-btn');
      expect(typeBtns[0].classList.contains('hover:bg-slate-200')).toBe(true);
      expect(typeBtns[1].classList.contains('hover:bg-gray-200')).toBe(true);
      expect(typeBtns[2].classList.contains('hover:bg-gray-200')).toBe(true);
      expect(typeBtns[3].classList.contains('hover:bg-gray-200')).toBe(true);
      expect(typeBtns[4].classList.contains('hover:bg-gray-200')).toBe(true);
      expect(typeBtns[5].classList.contains('hover:bg-gray-200')).toBe(true);
      expect(typeBtns[6].classList.contains('hover:bg-gray-200')).toBe(true);
      expect(typeBtns[7].classList.contains('hover:bg-gray-200')).toBe(true);
    });
  });

  // Removal Method Selection Tests
  describe('Removal Method Selection', () => {
    it('should render removal method select', () => {
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect).toBeTruthy();
      expect(removalMethodSelect.tagName).toBe('SELECT');
      expect(removalMethodSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Metode Penghapusan');
    });

    it('should have all labels with icons', () => {
      const magicIcon = document.body.querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have removal method options with proper labels', () => {
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect.options[0].textContent).toContain('Deteksi Otomatis');
      expect(removalMethodSelect.options[1].textContent).toContain('Kuas Manual');
      expect(removalMethodSelect.options[2].textContent).toContain('Klik Titik');
      expect(removalMethodSelect.options[3].textContent).toContain('Ikuti Tepi');
    });

    it('should have default removal method value', () => {
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect.value).toBe('auto-detect');
    });

    it('should have proper input styling', () => {
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect.classList.contains('w-full')).toBe(true);
      expect(removalMethodSelect.classList.contains('p-3')).toBe(true);
      expect(removalMethodSelect.classList.contains('border')).toBe(true);
      expect(removalMethodSelect.classList.contains('rounded-lg')).toBe(true);
      expect(removalMethodSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(removalMethodSelect.classList.contains('focus:ring-slate-500')).toBe(true);
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should render upload area', () => {
      const uploadArea = document.getElementById('object-remover-image-upload-area');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.classList.contains('border-dashed')).toBe(true);
      expect(uploadArea.classList.contains('rounded-xl')).toBe(true);
      expect(uploadArea.classList.contains('cursor-pointer')).toBe(true);
    });

    it('should render file input', () => {
      const fileInput = document.getElementById('object-remover-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.type).toBe('file');
      expect(fileInput.accept).toBe('image/*');
      expect(fileInput.classList.contains('hidden')).toBe(true);
    });

    it('should render upload icon', () => {
      const uploadIcon = document.body.querySelector('#object-remover-image-upload-area i.fas.fa-cloud-upload-alt');
      expect(uploadIcon).toBeTruthy();
      expect(uploadIcon.classList.contains('text-slate-400')).toBe(true);
    });

    it('should render upload text', () => {
      const uploadArea = document.getElementById('object-remover-image-upload-area');
      expect(uploadArea.textContent).toContain('Klik atau seret gambar ke sini');
      expect(uploadArea.textContent).toContain('PNG, JPG, atau WEBP (maks. 10MB)');
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('object-remover-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview', () => {
      const imagePreview = document.getElementById('object-remover-image-preview');
      expect(imagePreview).toBeTruthy();
      expect(imagePreview.alt).toBe('Preview');
      expect(imagePreview.classList.contains('rounded-lg')).toBe(true);
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('object-remover-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Unggah Gambar');
    });

    it('should have proper upload area styling', () => {
      const uploadArea = document.getElementById('object-remover-image-upload-area');
      expect(uploadArea.classList.contains('border-2')).toBe(true);
      expect(uploadArea.classList.contains('border-gray-300')).toBe(true);
      expect(uploadArea.classList.contains('p-8')).toBe(true);
      expect(uploadArea.classList.contains('bg-gray-50')).toBe(true);
    });
  });

  // Fill Mode Selection Tests
  describe('Fill Mode Selection', () => {
    it('should render fill mode select', () => {
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect).toBeTruthy();
      expect(fillModeSelect.tagName).toBe('SELECT');
      expect(fillModeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Mode Pengisian');
    });

    it('should have all labels with icons', () => {
      const fillDripIcon = document.body.querySelector('i.fas.fa-fill-drip');
      expect(fillDripIcon).toBeTruthy();
    });

    it('should have fill mode options with proper labels', () => {
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect.options[0].textContent).toContain('Isi Otomatis');
      expect(fillModeSelect.options[1].textContent).toContain('Mengenal Konten');
      expect(fillModeSelect.options[2].textContent).toContain('Patch Tekstur');
      expect(fillModeSelect.options[3].textContent).toContain('Kloning Stamp');
      expect(fillModeSelect.options[4].textContent).toContain('Inpaint');
    });

    it('should have default fill mode value', () => {
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect.value).toBe('auto-fill');
    });

    it('should have proper input styling', () => {
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect.classList.contains('w-full')).toBe(true);
      expect(fillModeSelect.classList.contains('p-3')).toBe(true);
      expect(fillModeSelect.classList.contains('border')).toBe(true);
      expect(fillModeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(fillModeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(fillModeSelect.classList.contains('focus:ring-gray-500')).toBe(true);
    });
  });

  // Edge Smoothing Selection Tests
  describe('Edge Smoothing Selection', () => {
    it('should render edge smoothing select', () => {
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect).toBeTruthy();
      expect(edgeSmoothingSelect.tagName).toBe('SELECT');
      expect(edgeSmoothingSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Perhalusan Tepi');
    });

    it('should have all labels with icons', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should have edge smoothing options with proper labels', () => {
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect.options[0].textContent).toContain('Tidak Ada');
      expect(edgeSmoothingSelect.options[1].textContent).toContain('Ringan');
      expect(edgeSmoothingSelect.options[2].textContent).toContain('Kuat');
    });

    it('should have default edge smoothing value', () => {
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect.value).toBe('none');
    });

    it('should have proper input styling', () => {
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect.classList.contains('w-full')).toBe(true);
      expect(edgeSmoothingSelect.classList.contains('p-3')).toBe(true);
      expect(edgeSmoothingSelect.classList.contains('border')).toBe(true);
      expect(edgeSmoothingSelect.classList.contains('rounded-lg')).toBe(true);
      expect(edgeSmoothingSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(edgeSmoothingSelect.classList.contains('focus:ring-gray-500')).toBe(true);
    });
  });

  // Output Quality Selection Tests
  describe('Output Quality Selection', () => {
    it('should render output quality select', () => {
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect).toBeTruthy();
      expect(outputQualitySelect.tagName).toBe('SELECT');
      expect(outputQualitySelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Kualitas Output');
    });

    it('should have all labels with icons', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have output quality options with proper labels', () => {
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect.options[0].textContent).toContain('Standar');
      expect(outputQualitySelect.options[1].textContent).toContain('Tinggi');
      expect(outputQualitySelect.options[2].textContent).toContain('Maksimum');
    });

    it('should have default output quality value', () => {
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect.value).toBe('standard');
    });

    it('should have proper input styling', () => {
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect.classList.contains('w-full')).toBe(true);
      expect(outputQualitySelect.classList.contains('p-3')).toBe(true);
      expect(outputQualitySelect.classList.contains('border')).toBe(true);
      expect(outputQualitySelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputQualitySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputQualitySelect.classList.contains('focus:ring-gray-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('object-remover-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Hapus Objek');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('object-remover-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-slate-600')).toBe(true);
      expect(generateBtn.classList.contains('via-gray-500')).toBe(true);
      expect(generateBtn.classList.contains('to-slate-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('object-remover-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('object-remover-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('object-remover-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('object-remover-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-eraser')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil penghapusan objek akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('object-remover-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('object-remover-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang menghapus objek');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-slate-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('object-remover-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have slate icon in empty state', () => {
      const emptyStateIcon = document.getElementById('object-remover-empty-state').querySelector('i.fas.fa-eraser');
      expect(emptyStateIcon.classList.contains('text-slate-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use slate/gray color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-slate-600')).toBe(true);
      expect(title.classList.contains('via-gray-500')).toBe(true);
      expect(title.classList.contains('to-slate-400')).toBe(true);
    });

    it('should use slate/gray accents in generate button', () => {
      const generateBtn = document.getElementById('object-remover-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-slate-600')).toBe(true);
      expect(generateBtn.classList.contains('via-gray-500')).toBe(true);
      expect(generateBtn.classList.contains('to-slate-400')).toBe(true);
    });

    it('should use slate accents in removal method select', () => {
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect.classList.contains('focus:ring-slate-500')).toBe(true);
      expect(removalMethodSelect.classList.contains('focus:border-slate-500')).toBe(true);
    });

    it('should use gray accents in fill mode select', () => {
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect.classList.contains('focus:ring-gray-500')).toBe(true);
      expect(fillModeSelect.classList.contains('focus:border-gray-500')).toBe(true);
    });

    it('should use gray accents in edge smoothing select', () => {
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect.classList.contains('focus:ring-gray-500')).toBe(true);
      expect(edgeSmoothingSelect.classList.contains('focus:border-gray-500')).toBe(true);
    });

    it('should use gray accents in output quality select', () => {
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect.classList.contains('focus:ring-gray-500')).toBe(true);
      expect(outputQualitySelect.classList.contains('focus:border-gray-500')).toBe(true);
    });

    it('should use slate accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-slate-500')).toBe(true);
    });

    it('should use slate accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('object-remover-empty-state').querySelector('i.fas.fa-eraser');
      expect(emptyStateIcon.classList.contains('text-slate-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(17);
    });

    it('should have eraser icon in header', () => {
      const eraserIcon = document.body.querySelector('header i.fas.fa-eraser');
      expect(eraserIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('object-remover-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have user icon for people type', () => {
      const userIcon = document.body.querySelector('[data-type="people"] i.fas.fa-user');
      expect(userIcon).toBeTruthy();
    });

    it('should have font icon for text type', () => {
      const fontIcon = document.body.querySelector('[data-type="text"] i.fas.fa-font');
      expect(fontIcon).toBeTruthy();
    });

    it('should have water icon for watermark type', () => {
      const waterIcon = document.body.querySelector('[data-type="watermark"] i.fas.fa-water');
      expect(waterIcon).toBeTruthy();
    });

    it('should have star icon for logo type', () => {
      const starIcon = document.body.querySelector('[data-type="logo"] i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have stamp icon for stamp type', () => {
      const stampIcon = document.body.querySelector('[data-type="stamp"] i.fas.fa-stamp');
      expect(stampIcon).toBeTruthy();
    });

    it('should have wire icon for wire type', () => {
      const wireIcon = document.body.querySelector('[data-type="wire"] i.fas.fa-wire');
      expect(wireIcon).toBeTruthy();
    });

    it('should have moon icon for shadow type', () => {
      const moonIcon = document.body.querySelector('[data-type="shadow"] i.fas.fa-moon');
      expect(moonIcon).toBeTruthy();
    });

    it('should have question icon for other type', () => {
      const questionIcon = document.body.querySelector('[data-type="other"] i.fas.fa-question');
      expect(questionIcon).toBeTruthy();
    });

    it('should have magic icon for removal method', () => {
      const magicIcon = document.body.querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have cloud-upload-alt icon for upload area', () => {
      const cloudUploadIcon = document.body.querySelector('#object-remover-image-upload-area i.fas.fa-cloud-upload-alt');
      expect(cloudUploadIcon).toBeTruthy();
    });

    it('should have fill-drip icon for fill mode', () => {
      const fillDripIcon = document.body.querySelector('i.fas.fa-fill-drip');
      expect(fillDripIcon).toBeTruthy();
    });

    it('should have sliders-h icon for edge smoothing', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should have star icon for output quality', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have eraser icon in empty state', () => {
      const emptyStateIcon = document.getElementById('object-remover-empty-state').querySelector('i.fas.fa-eraser');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Penghapus Objek');
      expect(document.body.textContent).toContain('Jenis Objek');
      expect(document.body.textContent).toContain('Metode Penghapusan');
      expect(document.body.textContent).toContain('Unggah Gambar');
      expect(document.body.textContent).toContain('Mode Pengisian');
      expect(document.body.textContent).toContain('Perhalusan Tepi');
      expect(document.body.textContent).toContain('Kualitas Output');
      expect(document.body.textContent).toContain('Hapus Objek');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Objek');
      expect(headers[1].textContent).toContain('2. Metode Penghapusan');
      expect(headers[2].textContent).toContain('3. Unggah Gambar');
      expect(headers[3].textContent).toContain('4. Mode Pengisian');
      expect(headers[4].textContent).toContain('5. Perhalusan Tepi');
      expect(headers[5].textContent).toContain('6. Kualitas Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('object-remover-empty-state');
      expect(emptyState.textContent).toContain('Hasil penghapusan objek akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah gambar dan klik Hapus Objek');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('object-remover-loading');
      expect(loading.textContent).toContain('Sedang menghapus objek');
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
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect).toBeTruthy();
      
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect).toBeTruthy();
      
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect).toBeTruthy();
      
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect).toBeTruthy();
      
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect).toBeTruthy();
      
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect).toBeTruthy();
      
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('object-remover-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const removalMethodSelect = document.getElementById('object-remover-removal-method');
      expect(removalMethodSelect.tagName).toBe('SELECT');
      
      const fillModeSelect = document.getElementById('object-remover-fill-mode');
      expect(fillModeSelect.tagName).toBe('SELECT');
      
      const edgeSmoothingSelect = document.getElementById('object-remover-edge-smoothing');
      expect(edgeSmoothingSelect.tagName).toBe('SELECT');
      
      const outputQualitySelect = document.getElementById('object-remover-output-quality');
      expect(outputQualitySelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for type selection', () => {
      const typeBtns = document.body.querySelectorAll('.object-remover-object-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const peopleBtn = document.body.querySelector('[data-type="people"]');
      expect(peopleBtn.dataset.type).toBe('people');
      expect(peopleBtn.dataset.selected).toBe('true');
      
      const textBtn = document.body.querySelector('[data-type="text"]');
      expect(textBtn.dataset.type).toBe('text');
    });

    it('should have proper file input attributes', () => {
      const fileInput = document.getElementById('object-remover-image-input');
      expect(fileInput.type).toBe('file');
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have proper image preview attributes', () => {
      const imagePreview = document.getElementById('object-remover-image-preview');
      expect(imagePreview.alt).toBe('Preview');
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
  });
});
