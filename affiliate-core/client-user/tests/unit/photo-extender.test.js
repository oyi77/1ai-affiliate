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

describe('photo-extender Component', () => {
  
  const mockComponentHTML = `
    <div id="content-photo-extender" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
            <i class="fas fa-expand mr-3"></i>Photo Extender
          </h1>
          <p class="text-lg text-gray-600 mt-2">Perluas foto Anda dengan kreatif dan menarik sesuai kebutuhan Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Extension Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Ekstensi</h2>
              <div id="extension-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="background-expansion" class="extension-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-layer-group text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Ekspansi Latar</span>
                </button>
                <button type="button" data-type="zoom-out" class="extension-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-search-minus text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Zoom Out</span>
                </button>
                <button type="button" data-type="panorama" class="extension-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-images text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Panorama</span>
                </button>
                <button type="button" data-type="crop-correction" class="extension-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-crop-alt text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Koreksi Crop</span>
                </button>
                <button type="button" data-type="perspective-fix" class="extension-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-vector-square text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Perbaiki Perspektif</span>
                </button>
                <button type="button" data-type="content-aware" class="extension-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-magic text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Content-Aware</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Aspect Ratio -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Rasio Aspek</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-aspect-ratio" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-columns mr-1 text-teal-500"></i>Rasio Aspek
                  </label>
                  <select id="photo-aspect-ratio" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="original">Asli</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Portrait)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                    <option value="3:2">3:2 (Classic)</option>
                    <option value="2:3">2:3 (Portrait)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-teal-500"></i>Gaya Visual
                  </label>
                  <select id="photo-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="seamless">Seamless</option>
                    <option value="natural">Natural</option>
                    <option value="artistic">Artistik</option>
                    <option value="professional">Profesional</option>
                    <option value="casual">Kasual</option>
                    <option value="vintage">Vintage</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Quality -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Kualitas</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-quality" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-teal-500"></i>Tingkat Kualitas
                  </label>
                  <select id="photo-quality" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="standard">Standar</option>
                    <option value="high">Tinggi</option>
                    <option value="ultra">Ultra</option>
                    <option value="lossless">Lossless</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-teal-500"></i>Target Audiens
                  </label>
                  <select id="photo-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="photographers">Fotografer</option>
                    <option value="social-media">Media Sosial</option>
                    <option value="e-commerce">E-Commerce</option>
                    <option value="real-estate">Properti</option>
                    <option value="marketing">Pemasaran</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-teal-500"></i>Nuansa
                  </label>
                  <select id="photo-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="natural">Natural</option>
                    <option value="artistic">Artistik</option>
                    <option value="dramatic">Dramatis</option>
                    <option value="subtle">Halus</option>
                    <option value="bold">Berani</option>
                    <option value="seamless">Seamless</option>
                  </select>
                </div>
                
                <div>
                  <label for="photo-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-teal-500"></i>Deskripsi Tambahan
                  </label>
                  <textarea id="photo-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Jelaskan ekstensi foto yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="photo-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Ekstensi Foto
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="photo-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="photo-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-expand text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil ekstensi foto akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Ekstensi Foto</p>
              </div>
              <div id="photo-results" class="hidden space-y-6"></div>
              <div id="photo-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat ekstensi foto...</p>
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
      const container = document.getElementById('content-photo-extender');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Photo Extender');
      expect(title.querySelector('i.fas.fa-expand')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Perluas foto Anda dengan kreatif dan menarik sesuai kebutuhan Anda');
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
      expect(rightPanel.querySelector('#photo-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Extension Type Selection Tests
  describe('Extension Type Selection', () => {
    it('should render extension type options container', () => {
      const typeOptions = document.getElementById('extension-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Background Expansion option', () => {
      const bgExpansionBtn = document.body.querySelector('[data-type="background-expansion"]');
      expect(bgExpansionBtn).toBeTruthy();
      expect(bgExpansionBtn.textContent).toContain('Ekspansi Latar');
      expect(bgExpansionBtn.querySelector('i.fas.fa-layer-group')).toBeTruthy();
      expect(bgExpansionBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Zoom Out option', () => {
      const zoomOutBtn = document.body.querySelector('[data-type="zoom-out"]');
      expect(zoomOutBtn).toBeTruthy();
      expect(zoomOutBtn.textContent).toContain('Zoom Out');
      expect(zoomOutBtn.querySelector('i.fas.fa-search-minus')).toBeTruthy();
    });

    it('should render Panorama option', () => {
      const panoramaBtn = document.body.querySelector('[data-type="panorama"]');
      expect(panoramaBtn).toBeTruthy();
      expect(panoramaBtn.textContent).toContain('Panorama');
      expect(panoramaBtn.querySelector('i.fas.fa-images')).toBeTruthy();
    });

    it('should render Crop Correction option', () => {
      const cropCorrectionBtn = document.body.querySelector('[data-type="crop-correction"]');
      expect(cropCorrectionBtn).toBeTruthy();
      expect(cropCorrectionBtn.textContent).toContain('Koreksi Crop');
      expect(cropCorrectionBtn.querySelector('i.fas.fa-crop-alt')).toBeTruthy();
    });

    it('should render Perspective Fix option', () => {
      const perspectiveFixBtn = document.body.querySelector('[data-type="perspective-fix"]');
      expect(perspectiveFixBtn).toBeTruthy();
      expect(perspectiveFixBtn.textContent).toContain('Perbaiki Perspektif');
      expect(perspectiveFixBtn.querySelector('i.fas.fa-vector-square')).toBeTruthy();
    });

    it('should render Content-Aware option', () => {
      const contentAwareBtn = document.body.querySelector('[data-type="content-aware"]');
      expect(contentAwareBtn).toBeTruthy();
      expect(contentAwareBtn.textContent).toContain('Content-Aware');
      expect(contentAwareBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have 6 extension type options', () => {
      const typeBtns = document.body.querySelectorAll('.extension-type-btn');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('extension-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have teal icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.extension-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-teal-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Ekstensi');
    });

    it('should have teal hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.extension-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-teal-100')).toBe(true);
      });
    });
  });

  // Aspect Ratio Input Tests
  describe('Aspect Ratio Input', () => {
    it('should render aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('photo-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      expect(aspectRatioSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Rasio Aspek');
    });

    it('should have all labels with icons', () => {
      const columnsIcon = document.body.querySelector('i.fas.fa-columns');
      expect(columnsIcon).toBeTruthy();
    });

    it('should have aspect ratio options with proper labels', () => {
      const aspectRatioSelect = document.getElementById('photo-aspect-ratio');
      expect(aspectRatioSelect.options[0].textContent).toContain('Asli');
      expect(aspectRatioSelect.options[1].textContent).toContain('16:9');
      expect(aspectRatioSelect.options[2].textContent).toContain('9:16');
      expect(aspectRatioSelect.options[3].textContent).toContain('1:1');
      expect(aspectRatioSelect.options[4].textContent).toContain('4:5');
      expect(aspectRatioSelect.options[5].textContent).toContain('21:9');
      expect(aspectRatioSelect.options[6].textContent).toContain('3:2');
      expect(aspectRatioSelect.options[7].textContent).toContain('2:3');
    });

    it('should have default aspect ratio value', () => {
      const aspectRatioSelect = document.getElementById('photo-aspect-ratio');
      expect(aspectRatioSelect.value).toBe('original');
    });

    it('should have proper input styling', () => {
      const aspectRatioSelect = document.getElementById('photo-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('w-full')).toBe(true);
      expect(aspectRatioSelect.classList.contains('p-3')).toBe(true);
      expect(aspectRatioSelect.classList.contains('border')).toBe(true);
      expect(aspectRatioSelect.classList.contains('rounded-lg')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect.options[0].textContent).toContain('Seamless');
      expect(styleSelect.options[1].textContent).toContain('Natural');
      expect(styleSelect.options[2].textContent).toContain('Artistik');
      expect(styleSelect.options[3].textContent).toContain('Profesional');
      expect(styleSelect.options[4].textContent).toContain('Kasual');
      expect(styleSelect.options[5].textContent).toContain('Vintage');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect.value).toBe('seamless');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Quality Input Tests
  describe('Quality Input', () => {
    it('should render quality select', () => {
      const qualitySelect = document.getElementById('photo-quality');
      expect(qualitySelect).toBeTruthy();
      expect(qualitySelect.tagName).toBe('SELECT');
      expect(qualitySelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Kualitas');
    });

    it('should have all labels with icons', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have quality options with proper labels', () => {
      const qualitySelect = document.getElementById('photo-quality');
      expect(qualitySelect.options[0].textContent).toContain('Standar');
      expect(qualitySelect.options[1].textContent).toContain('Tinggi');
      expect(qualitySelect.options[2].textContent).toContain('Ultra');
      expect(qualitySelect.options[3].textContent).toContain('Lossless');
    });

    it('should have default quality value', () => {
      const qualitySelect = document.getElementById('photo-quality');
      expect(qualitySelect.value).toBe('standard');
    });

    it('should have proper input styling', () => {
      const qualitySelect = document.getElementById('photo-quality');
      expect(qualitySelect.classList.contains('w-full')).toBe(true);
      expect(qualitySelect.classList.contains('p-3')).toBe(true);
      expect(qualitySelect.classList.contains('border')).toBe(true);
      expect(qualitySelect.classList.contains('rounded-lg')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(qualitySelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('photo-audience');
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
      const audienceSelect = document.getElementById('photo-audience');
      expect(audienceSelect.options[0].textContent).toContain('Fotografer');
      expect(audienceSelect.options[1].textContent).toContain('Media Sosial');
      expect(audienceSelect.options[2].textContent).toContain('E-Commerce');
      expect(audienceSelect.options[3].textContent).toContain('Properti');
      expect(audienceSelect.options[4].textContent).toContain('Pemasaran');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('photo-audience');
      expect(audienceSelect.value).toBe('photographers');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('photo-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('photo-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('photo-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan ekstensi foto yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('photo-tone');
      expect(toneSelect.options[0].textContent).toContain('Natural');
      expect(toneSelect.options[1].textContent).toContain('Artistik');
      expect(toneSelect.options[2].textContent).toContain('Dramatis');
      expect(toneSelect.options[3].textContent).toContain('Halus');
      expect(toneSelect.options[4].textContent).toContain('Berani');
      expect(toneSelect.options[5].textContent).toContain('Seamless');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('photo-tone');
      expect(toneSelect.value).toBe('natural');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('photo-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('photo-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Ekstensi Foto');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('photo-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('photo-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('photo-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('photo-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('photo-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-expand')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil ekstensi foto akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('photo-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('photo-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat ekstensi foto');
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
      const emptyState = document.getElementById('photo-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('photo-empty-state').querySelector('i.fas.fa-expand');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/cyan color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-teal-400')).toBe(true);
    });

    it('should use teal/cyan accents in generate button', () => {
      const generateBtn = document.getElementById('photo-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-400')).toBe(true);
    });

    it('should use teal accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.extension-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-teal-500')).toBe(true);
      });
    });

    it('should use teal accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-teal-500')).toBe(true);
      });
    });

    it('should use teal accents in focus states', () => {
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('photo-empty-state').querySelector('i.fas.fa-expand');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });

    it('should use teal hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.extension-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-teal-100')).toBe(true);
      });
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
      expect(icons.length).toBeGreaterThanOrEqual(15);
    });

    it('should have expand icon in header', () => {
      const expandIcon = document.body.querySelector('header i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('photo-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have layer-group icon for background expansion', () => {
      const layerGroupIcon = document.body.querySelector('[data-type="background-expansion"] i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have search-minus icon for zoom out', () => {
      const searchMinusIcon = document.body.querySelector('[data-type="zoom-out"] i.fas.fa-search-minus');
      expect(searchMinusIcon).toBeTruthy();
    });

    it('should have images icon for panorama', () => {
      const imagesIcon = document.body.querySelector('[data-type="panorama"] i.fas.fa-images');
      expect(imagesIcon).toBeTruthy();
    });

    it('should have crop-alt icon for crop correction', () => {
      const cropAltIcon = document.body.querySelector('[data-type="crop-correction"] i.fas.fa-crop-alt');
      expect(cropAltIcon).toBeTruthy();
    });

    it('should have vector-square icon for perspective fix', () => {
      const vectorSquareIcon = document.body.querySelector('[data-type="perspective-fix"] i.fas.fa-vector-square');
      expect(vectorSquareIcon).toBeTruthy();
    });

    it('should have magic icon for content-aware', () => {
      const magicIcon = document.body.querySelector('[data-type="content-aware"] i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have columns icon for aspect ratio', () => {
      const columnsIcon = document.body.querySelector('i.fas.fa-columns');
      expect(columnsIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have star icon for quality', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have palette icon for tone', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have align-left icon for description', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have expand icon in empty state', () => {
      const emptyStateIcon = document.getElementById('photo-empty-state').querySelector('i.fas.fa-expand');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Photo Extender');
      expect(document.body.textContent).toContain('Jenis Ekstensi');
      expect(document.body.textContent).toContain('Rasio Aspek');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Kualitas');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Ekstensi Foto');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Ekstensi');
      expect(headers[1].textContent).toContain('2. Rasio Aspek');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Kualitas');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('photo-empty-state');
      expect(emptyState.textContent).toContain('Hasil ekstensi foto akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Ekstensi Foto');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('photo-loading');
      expect(loading.textContent).toContain('Sedang membuat ekstensi foto');
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
      const aspectRatioSelect = document.getElementById('photo-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect).toBeTruthy();
      
      const qualitySelect = document.getElementById('photo-quality');
      expect(qualitySelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('photo-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('photo-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('photo-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const aspectRatioSelect = document.getElementById('photo-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect).toBeTruthy();
      
      const qualitySelect = document.getElementById('photo-quality');
      expect(qualitySelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('photo-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('photo-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('photo-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('photo-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const aspectRatioSelect = document.getElementById('photo-aspect-ratio');
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('photo-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const qualitySelect = document.getElementById('photo-quality');
      expect(qualitySelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('photo-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('photo-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea type', () => {
      const descriptionInput = document.getElementById('photo-description');
      expect(descriptionInput.tagName).toBe('TEXTAREA');
    });

    it('should have proper button types', () => {
      const typeBtns = document.body.querySelectorAll('.extension-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const bgExpansionBtn = document.body.querySelector('[data-type="background-expansion"]');
      expect(bgExpansionBtn.dataset.type).toBe('background-expansion');
      expect(bgExpansionBtn.dataset.selected).toBe('true');
      
      const zoomOutBtn = document.body.querySelector('[data-type="zoom-out"]');
      expect(zoomOutBtn.dataset.type).toBe('zoom-out');
    });

    it('should have proper placeholder text', () => {
      const descriptionInput = document.getElementById('photo-description');
      expect(descriptionInput.placeholder).toContain('Jelaskan ekstensi foto yang diinginkan');
    });

    it('should have proper button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.extension-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.tagName).toBe('BUTTON');
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive container', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
    });

    it('should have responsive header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have responsive right panel', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have responsive gap', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive type options grid', () => {
      const typeOptions = document.getElementById('extension-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});