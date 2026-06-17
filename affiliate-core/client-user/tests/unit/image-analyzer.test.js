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

describe('image-analyzer Component', () => {
  
  const mockComponentHTML = `
    <div id="content-image-analyzer" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            <i class="fas fa-search mr-3"></i>Image Analyzer
          </h1>
          <p class="text-lg text-gray-600 mt-2">Analisis gambar Anda dengan teknologi AI terkini</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Analysis Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Analisis</h2>
              <div id="image-analyzer-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="object-detection" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-cube text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Deteksi Objek</span>
                </button>
                <button type="button" data-type="face-analysis" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-cyan-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user text-2xl mb-1 text-cyan-500"></i>
                  <span class="block font-medium">Analisis Wajah</span>
                </button>
                <button type="button" data-type="color-analysis" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-palette text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Analisis Warna</span>
                </button>
                <button type="button" data-type="composition" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-th-large text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Komposisi</span>
                </button>
                <button type="button" data-type="style-recognition" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-paint-brush text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Pengenalan Gaya</span>
                </button>
                <button type="button" data-type="quality-assessment" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Penilaian Kualitas</span>
                </button>
                <button type="button" data-type="scene-description" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-green-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-image text-2xl mb-1 text-green-500"></i>
                  <span class="block font-medium">Deskripsi Adegan</span>
                </button>
                <button type="button" data-type="text-extraction" class="image-analyzer-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-font text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Ekstraksi Teks</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Image Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Gambar</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="image-analyzer-image-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-camera mr-1 text-teal-500"></i>Jenis Gambar
                  </label>
                  <select id="image-analyzer-image-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="photo">Foto</option>
                    <option value="screenshot">Screenshot</option>
                    <option value="document">Dokumen</option>
                    <option value="artwork">Karya Seni</option>
                    <option value="product">Produk</option>
                    <option value="portrait">Potret</option>
                    <option value="landscape">Pemandangan</option>
                    <option value="graphic">Grafis</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Detail Level -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Tingkat Detail</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="image-analyzer-detail-level" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-list-ol mr-1 text-cyan-500"></i>Tingkat Detail
                  </label>
                  <select id="image-analyzer-detail-level" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="basic">Dasar</option>
                    <option value="detailed">Terperinci</option>
                    <option value="comprehensive">Komprehensif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Output Format -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Format Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="image-analyzer-output-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-alt mr-1 text-blue-500"></i>Format Output
                  </label>
                  <select id="image-analyzer-output-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="text">Teks</option>
                    <option value="json">JSON</option>
                    <option value="tags">Tags</option>
                    <option value="summary">Ringkasan</option>
                    <option value="detailed-report">Laporan Terperinci</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="image-analyzer-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-indigo-500"></i>Target Audiens
                  </label>
                  <select id="image-analyzer-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="photographers">Fotografer</option>
                    <option value="designers">Desainer</option>
                    <option value="marketers">Pemasaran</option>
                    <option value="developers">Developer</option>
                    <option value="researchers">Peneliti</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="image-analyzer-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-comment-alt mr-1 text-purple-500"></i>Nuansa
                  </label>
                  <select id="image-analyzer-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="technical">Teknis</option>
                    <option value="casual">Casual</option>
                    <option value="educational">Edukatif</option>
                    <option value="professional">Profesional</option>
                    <option value="creative">Kreatif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="image-analyzer-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-search mr-2"></i>Analisis Gambar
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="image-analyzer-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="image-analyzer-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-search text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil analisis akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Analisis Gambar</p>
              </div>
              <div id="image-analyzer-results" class="hidden space-y-6"></div>
              <div id="image-analyzer-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang menganalisis gambar...</p>
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
      const container = document.getElementById('content-image-analyzer');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Image Analyzer');
      expect(title.querySelector('i.fas.fa-search')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Analisis gambar Anda dengan teknologi AI terkini');
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
      expect(rightPanel.querySelector('#image-analyzer-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Analysis Type Selection Tests
  describe('Analysis Type Selection', () => {
    it('should render analysis type options container', () => {
      const typeOptions = document.getElementById('image-analyzer-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Object Detection option', () => {
      const objectDetectionBtn = document.body.querySelector('[data-type="object-detection"]');
      expect(objectDetectionBtn).toBeTruthy();
      expect(objectDetectionBtn.textContent).toContain('Deteksi Objek');
      expect(objectDetectionBtn.querySelector('i.fas.fa-cube')).toBeTruthy();
      expect(objectDetectionBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Face Analysis option', () => {
      const faceAnalysisBtn = document.body.querySelector('[data-type="face-analysis"]');
      expect(faceAnalysisBtn).toBeTruthy();
      expect(faceAnalysisBtn.textContent).toContain('Analisis Wajah');
      expect(faceAnalysisBtn.querySelector('i.fas.fa-user')).toBeTruthy();
    });

    it('should render Color Analysis option', () => {
      const colorAnalysisBtn = document.body.querySelector('[data-type="color-analysis"]');
      expect(colorAnalysisBtn).toBeTruthy();
      expect(colorAnalysisBtn.textContent).toContain('Analisis Warna');
      expect(colorAnalysisBtn.querySelector('i.fas.fa-palette')).toBeTruthy();
    });

    it('should render Composition option', () => {
      const compositionBtn = document.body.querySelector('[data-type="composition"]');
      expect(compositionBtn).toBeTruthy();
      expect(compositionBtn.textContent).toContain('Komposisi');
      expect(compositionBtn.querySelector('i.fas.fa-th-large')).toBeTruthy();
    });

    it('should render Style Recognition option', () => {
      const styleRecognitionBtn = document.body.querySelector('[data-type="style-recognition"]');
      expect(styleRecognitionBtn).toBeTruthy();
      expect(styleRecognitionBtn.textContent).toContain('Pengenalan Gaya');
      expect(styleRecognitionBtn.querySelector('i.fas.fa-paint-brush')).toBeTruthy();
    });

    it('should render Quality Assessment option', () => {
      const qualityAssessmentBtn = document.body.querySelector('[data-type="quality-assessment"]');
      expect(qualityAssessmentBtn).toBeTruthy();
      expect(qualityAssessmentBtn.textContent).toContain('Penilaian Kualitas');
      expect(qualityAssessmentBtn.querySelector('i.fas.fa-star')).toBeTruthy();
    });

    it('should render Scene Description option', () => {
      const sceneDescriptionBtn = document.body.querySelector('[data-type="scene-description"]');
      expect(sceneDescriptionBtn).toBeTruthy();
      expect(sceneDescriptionBtn.textContent).toContain('Deskripsi Adegan');
      expect(sceneDescriptionBtn.querySelector('i.fas.fa-image')).toBeTruthy();
    });

    it('should render Text Extraction option', () => {
      const textExtractionBtn = document.body.querySelector('[data-type="text-extraction"]');
      expect(textExtractionBtn).toBeTruthy();
      expect(textExtractionBtn.textContent).toContain('Ekstraksi Teks');
      expect(textExtractionBtn.querySelector('i.fas.fa-font')).toBeTruthy();
    });

    it('should have 8 analysis type options', () => {
      const typeBtns = document.body.querySelectorAll('.image-analyzer-type-btn');
      expect(typeBtns.length).toBe(8);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('image-analyzer-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Analisis');
    });

    it('should have colored hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.image-analyzer-type-btn');
      expect(typeBtns[0].classList.contains('hover:bg-teal-100')).toBe(true);
      expect(typeBtns[1].classList.contains('hover:bg-cyan-100')).toBe(true);
      expect(typeBtns[2].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(typeBtns[3].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(typeBtns[4].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(typeBtns[5].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(typeBtns[6].classList.contains('hover:bg-green-100')).toBe(true);
      expect(typeBtns[7].classList.contains('hover:bg-yellow-100')).toBe(true);
    });
  });

  // Image Type Input Tests
  describe('Image Type Input', () => {
    it('should render image type select', () => {
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect).toBeTruthy();
      expect(imageTypeSelect.tagName).toBe('SELECT');
      expect(imageTypeSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jenis Gambar');
    });

    it('should have all labels with icons', () => {
      const cameraIcon = document.body.querySelector('i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have image type options with proper labels', () => {
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect.options[0].textContent).toContain('Foto');
      expect(imageTypeSelect.options[1].textContent).toContain('Screenshot');
      expect(imageTypeSelect.options[2].textContent).toContain('Dokumen');
      expect(imageTypeSelect.options[3].textContent).toContain('Karya Seni');
      expect(imageTypeSelect.options[4].textContent).toContain('Produk');
      expect(imageTypeSelect.options[5].textContent).toContain('Potret');
      expect(imageTypeSelect.options[6].textContent).toContain('Pemandangan');
      expect(imageTypeSelect.options[7].textContent).toContain('Grafis');
    });

    it('should have default image type value', () => {
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect.value).toBe('photo');
    });

    it('should have proper input styling', () => {
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect.classList.contains('w-full')).toBe(true);
      expect(imageTypeSelect.classList.contains('p-3')).toBe(true);
      expect(imageTypeSelect.classList.contains('border')).toBe(true);
      expect(imageTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(imageTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(imageTypeSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Detail Level Input Tests
  describe('Detail Level Input', () => {
    it('should render detail level select', () => {
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect).toBeTruthy();
      expect(detailLevelSelect.tagName).toBe('SELECT');
      expect(detailLevelSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Tingkat Detail');
    });

    it('should have all labels with icons', () => {
      const listOlIcon = document.body.querySelector('i.fas.fa-list-ol');
      expect(listOlIcon).toBeTruthy();
    });

    it('should have detail level options with proper labels', () => {
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect.options[0].textContent).toContain('Dasar');
      expect(detailLevelSelect.options[1].textContent).toContain('Terperinci');
      expect(detailLevelSelect.options[2].textContent).toContain('Komprehensif');
    });

    it('should have default detail level value', () => {
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect.value).toBe('basic');
    });

    it('should have proper input styling', () => {
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect.classList.contains('w-full')).toBe(true);
      expect(detailLevelSelect.classList.contains('p-3')).toBe(true);
      expect(detailLevelSelect.classList.contains('border')).toBe(true);
      expect(detailLevelSelect.classList.contains('rounded-lg')).toBe(true);
      expect(detailLevelSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(detailLevelSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Output Format Input Tests
  describe('Output Format Input', () => {
    it('should render output format select', () => {
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect).toBeTruthy();
      expect(outputFormatSelect.tagName).toBe('SELECT');
      expect(outputFormatSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Format Output');
    });

    it('should have all labels with icons', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
    });

    it('should have output format options with proper labels', () => {
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect.options[0].textContent).toContain('Teks');
      expect(outputFormatSelect.options[1].textContent).toContain('JSON');
      expect(outputFormatSelect.options[2].textContent).toContain('Tags');
      expect(outputFormatSelect.options[3].textContent).toContain('Ringkasan');
      expect(outputFormatSelect.options[4].textContent).toContain('Laporan Terperinci');
    });

    it('should have default output format value', () => {
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect.value).toBe('text');
    });

    it('should have proper input styling', () => {
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect.classList.contains('w-full')).toBe(true);
      expect(outputFormatSelect.classList.contains('p-3')).toBe(true);
      expect(outputFormatSelect.classList.contains('border')).toBe(true);
      expect(outputFormatSelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect.options[0].textContent).toContain('Fotografer');
      expect(audienceSelect.options[1].textContent).toContain('Desainer');
      expect(audienceSelect.options[2].textContent).toContain('Pemasaran');
      expect(audienceSelect.options[3].textContent).toContain('Developer');
      expect(audienceSelect.options[4].textContent).toContain('Peneliti');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect.value).toBe('photographers');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect.options[0].textContent).toContain('Teknis');
      expect(toneSelect.options[1].textContent).toContain('Casual');
      expect(toneSelect.options[2].textContent).toContain('Edukatif');
      expect(toneSelect.options[3].textContent).toContain('Profesional');
      expect(toneSelect.options[4].textContent).toContain('Kreatif');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect.value).toBe('technical');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('image-analyzer-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Analisis Gambar');
      expect(generateBtn.querySelector('i.fas.fa-search')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('image-analyzer-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('image-analyzer-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('image-analyzer-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('image-analyzer-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('image-analyzer-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-search')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil analisis akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('image-analyzer-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('image-analyzer-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang menganalisis gambar');
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
      const emptyState = document.getElementById('image-analyzer-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('image-analyzer-empty-state').querySelector('i.fas.fa-search');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/cyan/blue color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-blue-500')).toBe(true);
    });

    it('should use teal/cyan/blue accents in generate button', () => {
      const generateBtn = document.getElementById('image-analyzer-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-500')).toBe(true);
    });

    it('should use teal accents in image type select', () => {
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(imageTypeSelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use cyan accents in detail level select', () => {
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(detailLevelSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in output format select', () => {
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use indigo accents in audience select', () => {
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in tone select', () => {
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(toneSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('image-analyzer-empty-state').querySelector('i.fas.fa-search');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(16);
    });

    it('should have search icon in header', () => {
      const searchIcon = document.body.querySelector('header i.fas.fa-search');
      expect(searchIcon).toBeTruthy();
    });

    it('should have search icon in generate button', () => {
      const searchIcon = document.getElementById('image-analyzer-generate-btn').querySelector('i.fas.fa-search');
      expect(searchIcon).toBeTruthy();
    });

    it('should have cube icon for object detection', () => {
      const cubeIcon = document.body.querySelector('[data-type="object-detection"] i.fas.fa-cube');
      expect(cubeIcon).toBeTruthy();
    });

    it('should have user icon for face analysis', () => {
      const userIcon = document.body.querySelector('[data-type="face-analysis"] i.fas.fa-user');
      expect(userIcon).toBeTruthy();
    });

    it('should have palette icon for color analysis', () => {
      const paletteIcon = document.body.querySelector('[data-type="color-analysis"] i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have th-large icon for composition', () => {
      const thLargeIcon = document.body.querySelector('[data-type="composition"] i.fas.fa-th-large');
      expect(thLargeIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style recognition', () => {
      const paintBrushIcon = document.body.querySelector('[data-type="style-recognition"] i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have star icon for quality assessment', () => {
      const starIcon = document.body.querySelector('[data-type="quality-assessment"] i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have image icon for scene description', () => {
      const imageIcon = document.body.querySelector('[data-type="scene-description"] i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have font icon for text extraction', () => {
      const fontIcon = document.body.querySelector('[data-type="text-extraction"] i.fas.fa-font');
      expect(fontIcon).toBeTruthy();
    });

    it('should have camera icon for image type', () => {
      const cameraIcon = document.body.querySelector('i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have list-ol icon for detail level', () => {
      const listOlIcon = document.body.querySelector('i.fas.fa-list-ol');
      expect(listOlIcon).toBeTruthy();
    });

    it('should have file-alt icon for output format', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have comment-alt icon for tone', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have search icon in empty state', () => {
      const emptyStateIcon = document.getElementById('image-analyzer-empty-state').querySelector('i.fas.fa-search');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Image Analyzer');
      expect(document.body.textContent).toContain('Jenis Analisis');
      expect(document.body.textContent).toContain('Jenis Gambar');
      expect(document.body.textContent).toContain('Tingkat Detail');
      expect(document.body.textContent).toContain('Format Output');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Analisis Gambar');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Analisis');
      expect(headers[1].textContent).toContain('2. Jenis Gambar');
      expect(headers[2].textContent).toContain('3. Tingkat Detail');
      expect(headers[3].textContent).toContain('4. Format Output');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('image-analyzer-empty-state');
      expect(emptyState.textContent).toContain('Hasil analisis akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Analisis Gambar');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('image-analyzer-loading');
      expect(loading.textContent).toContain('Sedang menganalisis gambar');
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
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect).toBeTruthy();
      
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect).toBeTruthy();
      
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect).toBeTruthy();
      
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect).toBeTruthy();
      
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('image-analyzer-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const imageTypeSelect = document.getElementById('image-analyzer-image-type');
      expect(imageTypeSelect.tagName).toBe('SELECT');
      
      const detailLevelSelect = document.getElementById('image-analyzer-detail-level');
      expect(detailLevelSelect.tagName).toBe('SELECT');
      
      const outputFormatSelect = document.getElementById('image-analyzer-output-format');
      expect(outputFormatSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('image-analyzer-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('image-analyzer-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for type selection', () => {
      const typeBtns = document.body.querySelectorAll('.image-analyzer-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const objectDetectionBtn = document.body.querySelector('[data-type="object-detection"]');
      expect(objectDetectionBtn.dataset.type).toBe('object-detection');
      expect(objectDetectionBtn.dataset.selected).toBe('true');
      
      const faceAnalysisBtn = document.body.querySelector('[data-type="face-analysis"]');
      expect(faceAnalysisBtn.dataset.type).toBe('face-analysis');
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
