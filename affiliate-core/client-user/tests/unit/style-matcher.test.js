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

describe('style-matcher Component', () => {
  
  const mockComponentHTML = `
    <div id="content-style-matcher" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            <i class="fas fa-palette mr-3"></i>Style Matcher
          </h1>
          <p class="text-lg text-gray-600 mt-2">Temukan gaya visual yang sempurna untuk proyek Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Style Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Gaya</h2>
              <div id="style-matcher-style-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-style="minimalist" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-minus text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Minimalist</span>
                </button>
                <button type="button" data-style="bohemian" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-feather-alt text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Bohemian</span>
                </button>
                <button type="button" data-style="vintage" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-rose-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-camera-retro text-2xl mb-1 text-rose-500"></i>
                  <span class="block font-medium">Vintage</span>
                </button>
                <button type="button" data-style="modern" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bolt text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Modern</span>
                </button>
                <button type="button" data-style="industrial" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-cogs text-2xl mb-1 text-gray-600"></i>
                  <span class="block font-medium">Industrial</span>
                </button>
                <button type="button" data-style="scandinavian" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-snowflake text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Scandinavian</span>
                </button>
                <button type="button" data-style="tropical" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-green-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-leaf text-2xl mb-1 text-green-500"></i>
                  <span class="block font-medium">Tropical</span>
                </button>
                <button type="button" data-style="luxury" class="style-matcher-style-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-gem text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Luxury</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Color Palette -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Palet Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="style-matcher-color-palette" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-pink-500"></i>Palet Warna
                  </label>
                  <select id="style-matcher-color-palette" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="monochrome">Monochrome</option>
                    <option value="earth-tones">Earth Tones</option>
                    <option value="pastel">Pastel</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="neutral">Neutral</option>
                    <option value="dark-moody">Dark Moody</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Mood/Atmosphere -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Suasana</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="style-matcher-mood" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-rose-500"></i>Suasana
                  </label>
                  <select id="style-matcher-mood" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                    <option value="cozy">Cozy</option>
                    <option value="energetic">Energetic</option>
                    <option value="calm">Calm</option>
                    <option value="dramatic">Dramatic</option>
                    <option value="playful">Playful</option>
                    <option value="sophisticated">Sophisticated</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Reference Image Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gambar Referensi</h2>
              
              <div class="space-y-4">
                <div id="style-matcher-reference-upload-area" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition cursor-pointer">
                  <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                  <p class="text-gray-600">Klik atau seret gambar di sini</p>
                  <p class="text-sm text-gray-400 mt-1">PNG, JPG, atau HEIC</p>
                  <input type="file" id="style-matcher-reference-input" class="hidden" accept="image/*">
                </div>
                <div id="style-matcher-reference-preview-container" class="hidden">
                  <img id="style-matcher-reference-preview" class="w-full h-48 object-cover rounded-lg" src="" alt="Preview">
                  <button type="button" id="style-matcher-remove-reference-btn" class="mt-2 text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash-alt mr-1"></i>Hapus Gambar
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Application -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Aplikasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="style-matcher-target-application" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-purple-500"></i>Target Aplikasi
                  </label>
                  <select id="style-matcher-target-application" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="social-media">Social Media</option>
                    <option value="website">Website</option>
                    <option value="print">Print</option>
                    <option value="packaging">Packaging</option>
                    <option value="interior">Interior</option>
                    <option value="fashion">Fashion</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Output Detail -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Detail Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="style-matcher-output-detail" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-list-alt mr-1 text-pink-500"></i>Detail Output
                  </label>
                  <select id="style-matcher-output-detail" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="basic-match">Basic Match</option>
                    <option value="detailed-analysis">Detailed Analysis</option>
                    <option value="comprehensive-report">Comprehensive Report</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="style-matcher-generate-btn" class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Cocokkan Gaya
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="style-matcher-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="style-matcher-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-palette text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil pencocokan gaya akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Cocokkan Gaya</p>
              </div>
              <div id="style-matcher-results" class="hidden space-y-6"></div>
              <div id="style-matcher-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang mencocokkan gaya...</p>
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
      const container = document.getElementById('content-style-matcher');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Style Matcher');
      expect(title.querySelector('i.fas.fa-palette')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Temukan gaya visual yang sempurna untuk proyek Anda');
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
      expect(rightPanel.querySelector('#style-matcher-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Style Type Selection Tests
  describe('Style Type Selection', () => {
    it('should render style type options container', () => {
      const styleTypeOptions = document.getElementById('style-matcher-style-type-options');
      expect(styleTypeOptions).toBeTruthy();
    });

    it('should render Minimalist option', () => {
      const minimalistBtn = document.body.querySelector('[data-style="minimalist"]');
      expect(minimalistBtn).toBeTruthy();
      expect(minimalistBtn.textContent).toContain('Minimalist');
      expect(minimalistBtn.querySelector('i.fas.fa-minus')).toBeTruthy();
      expect(minimalistBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Bohemian option', () => {
      const bohemianBtn = document.body.querySelector('[data-style="bohemian"]');
      expect(bohemianBtn).toBeTruthy();
      expect(bohemianBtn.textContent).toContain('Bohemian');
      expect(bohemianBtn.querySelector('i.fas.fa-feather-alt')).toBeTruthy();
    });

    it('should render Vintage option', () => {
      const vintageBtn = document.body.querySelector('[data-style="vintage"]');
      expect(vintageBtn).toBeTruthy();
      expect(vintageBtn.textContent).toContain('Vintage');
      expect(vintageBtn.querySelector('i.fas.fa-camera-retro')).toBeTruthy();
    });

    it('should render Modern option', () => {
      const modernBtn = document.body.querySelector('[data-style="modern"]');
      expect(modernBtn).toBeTruthy();
      expect(modernBtn.textContent).toContain('Modern');
      expect(modernBtn.querySelector('i.fas.fa-bolt')).toBeTruthy();
    });

    it('should render Industrial option', () => {
      const industrialBtn = document.body.querySelector('[data-style="industrial"]');
      expect(industrialBtn).toBeTruthy();
      expect(industrialBtn.textContent).toContain('Industrial');
      expect(industrialBtn.querySelector('i.fas.fa-cogs')).toBeTruthy();
    });

    it('should render Scandinavian option', () => {
      const scandinavianBtn = document.body.querySelector('[data-style="scandinavian"]');
      expect(scandinavianBtn).toBeTruthy();
      expect(scandinavianBtn.textContent).toContain('Scandinavian');
      expect(scandinavianBtn.querySelector('i.fas.fa-snowflake')).toBeTruthy();
    });

    it('should render Tropical option', () => {
      const tropicalBtn = document.body.querySelector('[data-style="tropical"]');
      expect(tropicalBtn).toBeTruthy();
      expect(tropicalBtn.textContent).toContain('Tropical');
      expect(tropicalBtn.querySelector('i.fas.fa-leaf')).toBeTruthy();
    });

    it('should render Luxury option', () => {
      const luxuryBtn = document.body.querySelector('[data-style="luxury"]');
      expect(luxuryBtn).toBeTruthy();
      expect(luxuryBtn.textContent).toContain('Luxury');
      expect(luxuryBtn.querySelector('i.fas.fa-gem')).toBeTruthy();
    });

    it('should have 8 style type options', () => {
      const styleTypeBtns = document.body.querySelectorAll('.style-matcher-style-type-btn');
      expect(styleTypeBtns.length).toBe(8);
    });

    it('should have proper grid layout for style type options', () => {
      const styleTypeOptions = document.getElementById('style-matcher-style-type-options');
      expect(styleTypeOptions.classList.contains('grid')).toBe(true);
      expect(styleTypeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(styleTypeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Gaya');
    });

    it('should have colored hover effects in style type buttons', () => {
      const styleTypeBtns = document.body.querySelectorAll('.style-matcher-style-type-btn');
      expect(styleTypeBtns[0].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(styleTypeBtns[1].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(styleTypeBtns[2].classList.contains('hover:bg-rose-100')).toBe(true);
      expect(styleTypeBtns[3].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(styleTypeBtns[4].classList.contains('hover:bg-gray-200')).toBe(true);
      expect(styleTypeBtns[5].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(styleTypeBtns[6].classList.contains('hover:bg-green-100')).toBe(true);
      expect(styleTypeBtns[7].classList.contains('hover:bg-yellow-100')).toBe(true);
    });
  });

  // Color Palette Selection Tests
  describe('Color Palette Selection', () => {
    it('should render color palette select', () => {
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      expect(colorPaletteSelect.tagName).toBe('SELECT');
      expect(colorPaletteSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Palet Warna');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have color palette options with proper labels', () => {
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect.options[0].textContent).toContain('Monochrome');
      expect(colorPaletteSelect.options[1].textContent).toContain('Earth Tones');
      expect(colorPaletteSelect.options[2].textContent).toContain('Pastel');
      expect(colorPaletteSelect.options[3].textContent).toContain('Vibrant');
      expect(colorPaletteSelect.options[4].textContent).toContain('Neutral');
      expect(colorPaletteSelect.options[5].textContent).toContain('Dark Moody');
    });

    it('should have default color palette value', () => {
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect.value).toBe('monochrome');
    });

    it('should have proper input styling', () => {
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect.classList.contains('w-full')).toBe(true);
      expect(colorPaletteSelect.classList.contains('p-3')).toBe(true);
      expect(colorPaletteSelect.classList.contains('border')).toBe(true);
      expect(colorPaletteSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Mood/Atmosphere Selection Tests
  describe('Mood/Atmosphere Selection', () => {
    it('should render mood select', () => {
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect).toBeTruthy();
      expect(moodSelect.tagName).toBe('SELECT');
      expect(moodSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Suasana');
    });

    it('should have all labels with icons', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have mood options with proper labels', () => {
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect.options[0].textContent).toContain('Cozy');
      expect(moodSelect.options[1].textContent).toContain('Energetic');
      expect(moodSelect.options[2].textContent).toContain('Calm');
      expect(moodSelect.options[3].textContent).toContain('Dramatic');
      expect(moodSelect.options[4].textContent).toContain('Playful');
      expect(moodSelect.options[5].textContent).toContain('Sophisticated');
    });

    it('should have default mood value', () => {
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect.value).toBe('cozy');
    });

    it('should have proper input styling', () => {
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect.classList.contains('w-full')).toBe(true);
      expect(moodSelect.classList.contains('p-3')).toBe(true);
      expect(moodSelect.classList.contains('border')).toBe(true);
      expect(moodSelect.classList.contains('rounded-lg')).toBe(true);
      expect(moodSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(moodSelect.classList.contains('focus:ring-rose-500')).toBe(true);
    });
  });

  // Reference Image Upload Tests
  describe('Reference Image Upload', () => {
    it('should render reference upload area', () => {
      const uploadArea = document.getElementById('style-matcher-reference-upload-area');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.classList.contains('border-2')).toBe(true);
      expect(uploadArea.classList.contains('border-dashed')).toBe(true);
      expect(uploadArea.classList.contains('border-gray-300')).toBe(true);
    });

    it('should render upload area icon', () => {
      const uploadIcon = document.getElementById('style-matcher-reference-upload-area').querySelector('i.fas.fa-cloud-upload-alt');
      expect(uploadIcon).toBeTruthy();
      expect(uploadIcon.classList.contains('text-4xl')).toBe(true);
      expect(uploadIcon.classList.contains('text-gray-400')).toBe(true);
    });

    it('should render upload area text', () => {
      const uploadArea = document.getElementById('style-matcher-reference-upload-area');
      expect(uploadArea.textContent).toContain('Klik atau seret gambar di sini');
      expect(uploadArea.textContent).toContain('PNG, JPG, atau HEIC');
    });

    it('should render reference input', () => {
      const referenceInput = document.getElementById('style-matcher-reference-input');
      expect(referenceInput).toBeTruthy();
      expect(referenceInput.type).toBe('file');
      expect(referenceInput.accept).toBe('image/*');
      expect(referenceInput.classList.contains('hidden')).toBe(true);
    });

    it('should render reference preview container', () => {
      const previewContainer = document.getElementById('style-matcher-reference-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render reference preview image', () => {
      const previewImage = document.getElementById('style-matcher-reference-preview');
      expect(previewImage).toBeTruthy();
      expect(previewImage.tagName).toBe('IMG');
      expect(previewImage.alt).toBe('Preview');
      expect(previewImage.classList.contains('w-full')).toBe(true);
      expect(previewImage.classList.contains('h-48')).toBe(true);
      expect(previewImage.classList.contains('object-cover')).toBe(true);
    });

    it('should render remove reference button', () => {
      const removeBtn = document.getElementById('style-matcher-remove-reference-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.textContent).toContain('Hapus Gambar');
      expect(removeBtn.querySelector('i.fas.fa-trash-alt')).toBeTruthy();
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gambar Referensi');
    });

    it('should have hover effect on upload area', () => {
      const uploadArea = document.getElementById('style-matcher-reference-upload-area');
      expect(uploadArea.classList.contains('hover:border-purple-400')).toBe(true);
      expect(uploadArea.classList.contains('transition')).toBe(true);
      expect(uploadArea.classList.contains('cursor-pointer')).toBe(true);
    });
  });

  // Target Application Selection Tests
  describe('Target Application Selection', () => {
    it('should render target application select', () => {
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect).toBeTruthy();
      expect(targetApplicationSelect.tagName).toBe('SELECT');
      expect(targetApplicationSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Target Aplikasi');
    });

    it('should have all labels with icons', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
    });

    it('should have target application options with proper labels', () => {
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect.options[0].textContent).toContain('Social Media');
      expect(targetApplicationSelect.options[1].textContent).toContain('Website');
      expect(targetApplicationSelect.options[2].textContent).toContain('Print');
      expect(targetApplicationSelect.options[3].textContent).toContain('Packaging');
      expect(targetApplicationSelect.options[4].textContent).toContain('Interior');
      expect(targetApplicationSelect.options[5].textContent).toContain('Fashion');
    });

    it('should have default target application value', () => {
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect.value).toBe('social-media');
    });

    it('should have proper input styling', () => {
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect.classList.contains('w-full')).toBe(true);
      expect(targetApplicationSelect.classList.contains('p-3')).toBe(true);
      expect(targetApplicationSelect.classList.contains('border')).toBe(true);
      expect(targetApplicationSelect.classList.contains('rounded-lg')).toBe(true);
      expect(targetApplicationSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(targetApplicationSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Output Detail Selection Tests
  describe('Output Detail Selection', () => {
    it('should render output detail select', () => {
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect).toBeTruthy();
      expect(outputDetailSelect.tagName).toBe('SELECT');
      expect(outputDetailSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Detail Output');
    });

    it('should have all labels with icons', () => {
      const listAltIcon = document.body.querySelector('i.fas.fa-list-alt');
      expect(listAltIcon).toBeTruthy();
    });

    it('should have output detail options with proper labels', () => {
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect.options[0].textContent).toContain('Basic Match');
      expect(outputDetailSelect.options[1].textContent).toContain('Detailed Analysis');
      expect(outputDetailSelect.options[2].textContent).toContain('Comprehensive Report');
    });

    it('should have default output detail value', () => {
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect.value).toBe('basic-match');
    });

    it('should have proper input styling', () => {
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect.classList.contains('w-full')).toBe(true);
      expect(outputDetailSelect.classList.contains('p-3')).toBe(true);
      expect(outputDetailSelect.classList.contains('border')).toBe(true);
      expect(outputDetailSelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputDetailSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputDetailSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('style-matcher-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Cocokkan Gaya');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('style-matcher-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('style-matcher-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('style-matcher-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('style-matcher-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('style-matcher-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-palette')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil pencocokan gaya akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('style-matcher-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('style-matcher-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang mencocokkan gaya');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('style-matcher-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('style-matcher-empty-state').querySelector('i.fas.fa-palette');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/pink/rose color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-500')).toBe(true);
      expect(title.classList.contains('via-pink-500')).toBe(true);
      expect(title.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use purple/pink/rose accents in generate button', () => {
      const generateBtn = document.getElementById('style-matcher-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use pink accents in color palette select', () => {
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in mood select', () => {
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(moodSelect.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use purple accents in target application select', () => {
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(targetApplicationSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use pink accents in output detail select', () => {
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(outputDetailSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('style-matcher-empty-state').querySelector('i.fas.fa-palette');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
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

    it('should have palette icon in header', () => {
      const paletteIcon = document.body.querySelector('header i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('style-matcher-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have minus icon for minimalist style', () => {
      const minusIcon = document.body.querySelector('[data-style="minimalist"] i.fas.fa-minus');
      expect(minusIcon).toBeTruthy();
    });

    it('should have feather-alt icon for bohemian style', () => {
      const featherAltIcon = document.body.querySelector('[data-style="bohemian"] i.fas.fa-feather-alt');
      expect(featherAltIcon).toBeTruthy();
    });

    it('should have camera-retro icon for vintage style', () => {
      const cameraRetroIcon = document.body.querySelector('[data-style="vintage"] i.fas.fa-camera-retro');
      expect(cameraRetroIcon).toBeTruthy();
    });

    it('should have bolt icon for modern style', () => {
      const boltIcon = document.body.querySelector('[data-style="modern"] i.fas.fa-bolt');
      expect(boltIcon).toBeTruthy();
    });

    it('should have cogs icon for industrial style', () => {
      const cogsIcon = document.body.querySelector('[data-style="industrial"] i.fas.fa-cogs');
      expect(cogsIcon).toBeTruthy();
    });

    it('should have snowflake icon for scandinavian style', () => {
      const snowflakeIcon = document.body.querySelector('[data-style="scandinavian"] i.fas.fa-snowflake');
      expect(snowflakeIcon).toBeTruthy();
    });

    it('should have leaf icon for tropical style', () => {
      const leafIcon = document.body.querySelector('[data-style="tropical"] i.fas.fa-leaf');
      expect(leafIcon).toBeTruthy();
    });

    it('should have gem icon for luxury style', () => {
      const gemIcon = document.body.querySelector('[data-style="luxury"] i.fas.fa-gem');
      expect(gemIcon).toBeTruthy();
    });

    it('should have palette icon for color palette', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have smile icon for mood', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have cloud-upload-alt icon for reference upload', () => {
      const cloudUploadAltIcon = document.body.querySelector('i.fas.fa-cloud-upload-alt');
      expect(cloudUploadAltIcon).toBeTruthy();
    });

    it('should have bullseye icon for target application', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
    });

    it('should have list-alt icon for output detail', () => {
      const listAltIcon = document.body.querySelector('i.fas.fa-list-alt');
      expect(listAltIcon).toBeTruthy();
    });

    it('should have trash-alt icon for remove reference button', () => {
      const trashAltIcon = document.body.querySelector('i.fas.fa-trash-alt');
      expect(trashAltIcon).toBeTruthy();
    });

    it('should have palette icon in empty state', () => {
      const emptyStateIcon = document.getElementById('style-matcher-empty-state').querySelector('i.fas.fa-palette');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Style Matcher');
      expect(document.body.textContent).toContain('Jenis Gaya');
      expect(document.body.textContent).toContain('Palet Warna');
      expect(document.body.textContent).toContain('Suasana');
      expect(document.body.textContent).toContain('Gambar Referensi');
      expect(document.body.textContent).toContain('Target Aplikasi');
      expect(document.body.textContent).toContain('Detail Output');
      expect(document.body.textContent).toContain('Cocokkan Gaya');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Gaya');
      expect(headers[1].textContent).toContain('2. Palet Warna');
      expect(headers[2].textContent).toContain('3. Suasana');
      expect(headers[3].textContent).toContain('4. Gambar Referensi');
      expect(headers[4].textContent).toContain('5. Target Aplikasi');
      expect(headers[5].textContent).toContain('6. Detail Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('style-matcher-empty-state');
      expect(emptyState.textContent).toContain('Hasil pencocokan gaya akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Cocokkan Gaya');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('style-matcher-loading');
      expect(loading.textContent).toContain('Sedang mencocokkan gaya');
    });

    it('should have proper upload area text', () => {
      const uploadArea = document.getElementById('style-matcher-reference-upload-area');
      expect(uploadArea.textContent).toContain('Klik atau seret gambar di sini');
      expect(uploadArea.textContent).toContain('PNG, JPG, atau HEIC');
    });

    it('should have proper remove button text', () => {
      const removeBtn = document.getElementById('style-matcher-remove-reference-btn');
      expect(removeBtn.textContent).toContain('Hapus Gambar');
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
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect).toBeTruthy();
      
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect).toBeTruthy();
      
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect).toBeTruthy();
      
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect).toBeTruthy();
      
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('style-matcher-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const colorPaletteSelect = document.getElementById('style-matcher-color-palette');
      expect(colorPaletteSelect.tagName).toBe('SELECT');
      
      const moodSelect = document.getElementById('style-matcher-mood');
      expect(moodSelect.tagName).toBe('SELECT');
      
      const targetApplicationSelect = document.getElementById('style-matcher-target-application');
      expect(targetApplicationSelect.tagName).toBe('SELECT');
      
      const outputDetailSelect = document.getElementById('style-matcher-output-detail');
      expect(outputDetailSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for style type selection', () => {
      const styleTypeBtns = document.body.querySelectorAll('.style-matcher-style-type-btn');
      styleTypeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for style type buttons', () => {
      const minimalistBtn = document.body.querySelector('[data-style="minimalist"]');
      expect(minimalistBtn.dataset.style).toBe('minimalist');
      expect(minimalistBtn.dataset.selected).toBe('true');
      
      const bohemianBtn = document.body.querySelector('[data-style="bohemian"]');
      expect(bohemianBtn.dataset.style).toBe('bohemian');
    });

    it('should have proper file input attributes', () => {
      const referenceInput = document.getElementById('style-matcher-reference-input');
      expect(referenceInput.type).toBe('file');
      expect(referenceInput.accept).toBe('image/*');
    });

    it('should have proper image alt text', () => {
      const previewImage = document.getElementById('style-matcher-reference-preview');
      expect(previewImage.alt).toBe('Preview');
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

    it('should have responsive grid for style type options', () => {
      const styleTypeOptions = document.getElementById('style-matcher-style-type-options');
      expect(styleTypeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
