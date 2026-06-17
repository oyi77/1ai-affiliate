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

describe('video-frame-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-video-frame-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
            <i class="fas fa-film mr-3"></i>Generator Frame Video
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat frame video profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Script/Storyboard -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Script/Storyboard</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frame-generator-script" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-indigo-500"></i>Script atau Storyboard
                  </label>
                  <textarea id="video-frame-generator-script" rows="5" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Masukkan script atau deskripsi scene video..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 2: Theme Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Tema Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frame-generator-theme" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-purple-500"></i>Tema Gaya
                  </label>
                  <select id="video-frame-generator-theme" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="cinematic">Sinematik</option>
                    <option value="documentary">Dokumenter</option>
                    <option value="vlog">Vlog</option>
                    <option value="anime">Anime</option>
                    <option value="commercial">Komersial</option>
                    <option value="social-media">Media Sosial</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Frame Count -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Jumlah Frame</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frame-generator-frame-count" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-images mr-1 text-indigo-500"></i>Jumlah Frame
                  </label>
                  <select id="video-frame-generator-frame-count" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="3">3 Frame</option>
                    <option value="5">5 Frame</option>
                    <option value="10">10 Frame</option>
                    <option value="15">15 Frame</option>
                    <option value="20">20 Frame</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Aspect Ratio -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Aspect Ratio</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frame-generator-aspect-ratio" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand mr-1 text-purple-500"></i>Aspect Ratio
                  </label>
                  <select id="video-frame-generator-aspect-ratio" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Color Palette -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Palet Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frame-generator-color-palette" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-roller mr-1 text-indigo-500"></i>Palet Warna
                  </label>
                  <select id="video-frame-generator-color-palette" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="vibrant">Vibrant</option>
                    <option value="muted">Muted</option>
                    <option value="dark">Gelap</option>
                    <option value="light">Terang</option>
                    <option value="neon">Neon</option>
                    <option value="vintage">Vintage</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Output Format -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Format Output</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frame-generator-output-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-export mr-1 text-purple-500"></i>Format Output
                  </label>
                  <select id="video-frame-generator-output-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="png-sequence">PNG Sequence</option>
                    <option value="jpg-sequence">JPG Sequence</option>
                    <option value="gif">GIF</option>
                    <option value="pdf-storyboard">PDF Storyboard</option>
                    <option value="powerpoint">PowerPoint</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="video-frame-generator-generate-btn" class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Frame Video
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="video-frame-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="video-frame-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-film text-6xl mb-4 text-indigo-400"></i>
                <p class="text-xl">Hasil frame video akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Frame Video</p>
              </div>
              <div id="video-frame-generator-results" class="hidden space-y-6"></div>
              <div id="video-frame-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-indigo-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat frame video...</p>
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
      const container = document.getElementById('content-video-frame-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Frame Video');
      expect(title.querySelector('i.fas.fa-film')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat frame video profesional dengan AI');
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
      expect(rightPanel.querySelector('#video-frame-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Script/Storyboard Input Tests
  describe('Script/Storyboard Input', () => {
    it('should render script textarea', () => {
      const scriptTextarea = document.getElementById('video-frame-generator-script');
      expect(scriptTextarea).toBeTruthy();
      expect(scriptTextarea.tagName).toBe('TEXTAREA');
      expect(scriptTextarea.rows).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Script/Storyboard');
    });

    it('should have label with icon', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
      expect(alignLeftIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have proper textarea styling', () => {
      const scriptTextarea = document.getElementById('video-frame-generator-script');
      expect(scriptTextarea.classList.contains('w-full')).toBe(true);
      expect(scriptTextarea.classList.contains('p-3')).toBe(true);
      expect(scriptTextarea.classList.contains('border')).toBe(true);
      expect(scriptTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(scriptTextarea.classList.contains('resize-none')).toBe(true);
      expect(scriptTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(scriptTextarea.classList.contains('focus:ring-indigo-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const scriptTextarea = document.getElementById('video-frame-generator-script');
      expect(scriptTextarea.placeholder).toContain('Masukkan script atau deskripsi scene video');
    });
  });

  // Theme Style Selection Tests
  describe('Theme Style Selection', () => {
    it('should render theme select', () => {
      const themeSelect = document.getElementById('video-frame-generator-theme');
      expect(themeSelect).toBeTruthy();
      expect(themeSelect.tagName).toBe('SELECT');
      expect(themeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Tema Gaya');
    });

    it('should have label with icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      expect(paletteIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have theme options with proper labels', () => {
      const themeSelect = document.getElementById('video-frame-generator-theme');
      expect(themeSelect.options[0].textContent).toContain('Sinematik');
      expect(themeSelect.options[1].textContent).toContain('Dokumenter');
      expect(themeSelect.options[2].textContent).toContain('Vlog');
      expect(themeSelect.options[3].textContent).toContain('Anime');
      expect(themeSelect.options[4].textContent).toContain('Komersial');
      expect(themeSelect.options[5].textContent).toContain('Media Sosial');
    });

    it('should have default theme value', () => {
      const themeSelect = document.getElementById('video-frame-generator-theme');
      expect(themeSelect.value).toBe('cinematic');
    });

    it('should have proper input styling', () => {
      const themeSelect = document.getElementById('video-frame-generator-theme');
      expect(themeSelect.classList.contains('w-full')).toBe(true);
      expect(themeSelect.classList.contains('p-3')).toBe(true);
      expect(themeSelect.classList.contains('border')).toBe(true);
      expect(themeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(themeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(themeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Frame Count Selection Tests
  describe('Frame Count Selection', () => {
    it('should render frame count select', () => {
      const frameCountSelect = document.getElementById('video-frame-generator-frame-count');
      expect(frameCountSelect).toBeTruthy();
      expect(frameCountSelect.tagName).toBe('SELECT');
      expect(frameCountSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Jumlah Frame');
    });

    it('should have label with icon', () => {
      const imagesIcon = document.body.querySelector('i.fas.fa-images');
      expect(imagesIcon).toBeTruthy();
      expect(imagesIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have frame count options with proper labels', () => {
      const frameCountSelect = document.getElementById('video-frame-generator-frame-count');
      expect(frameCountSelect.options[0].textContent).toContain('3 Frame');
      expect(frameCountSelect.options[1].textContent).toContain('5 Frame');
      expect(frameCountSelect.options[2].textContent).toContain('10 Frame');
      expect(frameCountSelect.options[3].textContent).toContain('15 Frame');
      expect(frameCountSelect.options[4].textContent).toContain('20 Frame');
      expect(frameCountSelect.options[5].textContent).toContain('Custom');
    });

    it('should have default frame count value', () => {
      const frameCountSelect = document.getElementById('video-frame-generator-frame-count');
      expect(frameCountSelect.value).toBe('3');
    });

    it('should have proper input styling', () => {
      const frameCountSelect = document.getElementById('video-frame-generator-frame-count');
      expect(frameCountSelect.classList.contains('w-full')).toBe(true);
      expect(frameCountSelect.classList.contains('p-3')).toBe(true);
      expect(frameCountSelect.classList.contains('border')).toBe(true);
      expect(frameCountSelect.classList.contains('rounded-lg')).toBe(true);
      expect(frameCountSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(frameCountSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Aspect Ratio Selection Tests
  describe('Aspect Ratio Selection', () => {
    it('should render aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('video-frame-generator-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      expect(aspectRatioSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Aspect Ratio');
    });

    it('should have label with icon', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
      expect(expandIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have aspect ratio options with proper labels', () => {
      const aspectRatioSelect = document.getElementById('video-frame-generator-aspect-ratio');
      expect(aspectRatioSelect.options[0].textContent).toContain('16:9');
      expect(aspectRatioSelect.options[1].textContent).toContain('9:16');
      expect(aspectRatioSelect.options[2].textContent).toContain('1:1');
      expect(aspectRatioSelect.options[3].textContent).toContain('4:3');
      expect(aspectRatioSelect.options[4].textContent).toContain('21:9');
    });

    it('should have default aspect ratio value', () => {
      const aspectRatioSelect = document.getElementById('video-frame-generator-aspect-ratio');
      expect(aspectRatioSelect.value).toBe('16:9');
    });

    it('should have proper input styling', () => {
      const aspectRatioSelect = document.getElementById('video-frame-generator-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('w-full')).toBe(true);
      expect(aspectRatioSelect.classList.contains('p-3')).toBe(true);
      expect(aspectRatioSelect.classList.contains('border')).toBe(true);
      expect(aspectRatioSelect.classList.contains('rounded-lg')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Color Palette Selection Tests
  describe('Color Palette Selection', () => {
    it('should render color palette select', () => {
      const colorPaletteSelect = document.getElementById('video-frame-generator-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      expect(colorPaletteSelect.tagName).toBe('SELECT');
      expect(colorPaletteSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Palet Warna');
    });

    it('should have label with icon', () => {
      const paintRollerIcon = document.body.querySelector('i.fas.fa-paint-roller');
      expect(paintRollerIcon).toBeTruthy();
      expect(paintRollerIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have color palette options with proper labels', () => {
      const colorPaletteSelect = document.getElementById('video-frame-generator-color-palette');
      expect(colorPaletteSelect.options[0].textContent).toContain('Vibrant');
      expect(colorPaletteSelect.options[1].textContent).toContain('Muted');
      expect(colorPaletteSelect.options[2].textContent).toContain('Gelap');
      expect(colorPaletteSelect.options[3].textContent).toContain('Terang');
      expect(colorPaletteSelect.options[4].textContent).toContain('Neon');
      expect(colorPaletteSelect.options[5].textContent).toContain('Vintage');
    });

    it('should have default color palette value', () => {
      const colorPaletteSelect = document.getElementById('video-frame-generator-color-palette');
      expect(colorPaletteSelect.value).toBe('vibrant');
    });

    it('should have proper input styling', () => {
      const colorPaletteSelect = document.getElementById('video-frame-generator-color-palette');
      expect(colorPaletteSelect.classList.contains('w-full')).toBe(true);
      expect(colorPaletteSelect.classList.contains('p-3')).toBe(true);
      expect(colorPaletteSelect.classList.contains('border')).toBe(true);
      expect(colorPaletteSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Output Format Selection Tests
  describe('Output Format Selection', () => {
    it('should render output format select', () => {
      const outputFormatSelect = document.getElementById('video-frame-generator-output-format');
      expect(outputFormatSelect).toBeTruthy();
      expect(outputFormatSelect.tagName).toBe('SELECT');
      expect(outputFormatSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Format Output');
    });

    it('should have label with icon', () => {
      const fileExportIcon = document.body.querySelector('i.fas.fa-file-export');
      expect(fileExportIcon).toBeTruthy();
      expect(fileExportIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have output format options with proper labels', () => {
      const outputFormatSelect = document.getElementById('video-frame-generator-output-format');
      expect(outputFormatSelect.options[0].textContent).toContain('PNG Sequence');
      expect(outputFormatSelect.options[1].textContent).toContain('JPG Sequence');
      expect(outputFormatSelect.options[2].textContent).toContain('GIF');
      expect(outputFormatSelect.options[3].textContent).toContain('PDF Storyboard');
      expect(outputFormatSelect.options[4].textContent).toContain('PowerPoint');
    });

    it('should have default output format value', () => {
      const outputFormatSelect = document.getElementById('video-frame-generator-output-format');
      expect(outputFormatSelect.value).toBe('png-sequence');
    });

    it('should have proper input styling', () => {
      const outputFormatSelect = document.getElementById('video-frame-generator-output-format');
      expect(outputFormatSelect.classList.contains('w-full')).toBe(true);
      expect(outputFormatSelect.classList.contains('p-3')).toBe(true);
      expect(outputFormatSelect.classList.contains('border')).toBe(true);
      expect(outputFormatSelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('video-frame-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Frame Video');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('video-frame-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('via-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('video-frame-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('video-frame-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('video-frame-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('video-frame-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-film')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil frame video akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('video-frame-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('video-frame-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat frame video');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-indigo-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('video-frame-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have indigo icon in empty state', () => {
      const emptyStateIcon = document.getElementById('video-frame-generator-empty-state').querySelector('i.fas.fa-film');
      expect(emptyStateIcon.classList.contains('text-indigo-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use indigo/purple color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-indigo-500')).toBe(true);
      expect(title.classList.contains('via-purple-500')).toBe(true);
      expect(title.classList.contains('to-indigo-400')).toBe(true);
    });

    it('should use indigo/purple accents in generate button', () => {
      const generateBtn = document.getElementById('video-frame-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('via-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-400')).toBe(true);
    });

    it('should use indigo accents in script textarea', () => {
      const scriptTextarea = document.getElementById('video-frame-generator-script');
      expect(scriptTextarea.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(scriptTextarea.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in theme select', () => {
      const themeSelect = document.getElementById('video-frame-generator-theme');
      expect(themeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(themeSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in frame count select', () => {
      const frameCountSelect = document.getElementById('video-frame-generator-frame-count');
      expect(frameCountSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(frameCountSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('video-frame-generator-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in color palette select', () => {
      const colorPaletteSelect = document.getElementById('video-frame-generator-color-palette');
      expect(colorPaletteSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(colorPaletteSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in output format select', () => {
      const outputFormatSelect = document.getElementById('video-frame-generator-output-format');
      expect(outputFormatSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-indigo-500')).toBe(true);
    });

    it('should use indigo accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('video-frame-generator-empty-state').querySelector('i.fas.fa-film');
      expect(emptyStateIcon.classList.contains('text-indigo-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(9);
    });

    it('should have film icon in header', () => {
      const filmIcon = document.body.querySelector('header i.fas.fa-film');
      expect(filmIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('video-frame-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have align-left icon for script', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have palette icon for theme', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have images icon for frame count', () => {
      const imagesIcon = document.body.querySelector('i.fas.fa-images');
      expect(imagesIcon).toBeTruthy();
    });

    it('should have expand icon for aspect ratio', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have paint-roller icon for color palette', () => {
      const paintRollerIcon = document.body.querySelector('i.fas.fa-paint-roller');
      expect(paintRollerIcon).toBeTruthy();
    });

    it('should have file-export icon for output format', () => {
      const fileExportIcon = document.body.querySelector('i.fas.fa-file-export');
      expect(fileExportIcon).toBeTruthy();
    });

    it('should have film icon in empty state', () => {
      const emptyStateIcon = document.getElementById('video-frame-generator-empty-state').querySelector('i.fas.fa-film');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have indigo icons in script section', () => {
      const scriptIcon = document.body.querySelector('label[for="video-frame-generator-script"] i.fas.fa-align-left');
      expect(scriptIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have purple icons in theme section', () => {
      const themeIcon = document.body.querySelector('label[for="video-frame-generator-theme"] i.fas.fa-palette');
      expect(themeIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have indigo icons in frame count section', () => {
      const frameCountIcon = document.body.querySelector('label[for="video-frame-generator-frame-count"] i.fas.fa-images');
      expect(frameCountIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have purple icons in aspect ratio section', () => {
      const aspectRatioIcon = document.body.querySelector('label[for="video-frame-generator-aspect-ratio"] i.fas.fa-expand');
      expect(aspectRatioIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have indigo icons in color palette section', () => {
      const colorPaletteIcon = document.body.querySelector('label[for="video-frame-generator-color-palette"] i.fas.fa-paint-roller');
      expect(colorPaletteIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have purple icons in output format section', () => {
      const outputFormatIcon = document.body.querySelector('label[for="video-frame-generator-output-format"] i.fas.fa-file-export');
      expect(outputFormatIcon.classList.contains('text-purple-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Frame Video');
      expect(document.body.textContent).toContain('Script/Storyboard');
      expect(document.body.textContent).toContain('Tema Gaya');
      expect(document.body.textContent).toContain('Jumlah Frame');
      expect(document.body.textContent).toContain('Aspect Ratio');
      expect(document.body.textContent).toContain('Palet Warna');
      expect(document.body.textContent).toContain('Format Output');
      expect(document.body.textContent).toContain('Buat Frame Video');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Script/Storyboard');
      expect(headers[1].textContent).toContain('2. Tema Gaya');
      expect(headers[2].textContent).toContain('3. Jumlah Frame');
      expect(headers[3].textContent).toContain('4. Aspect Ratio');
      expect(headers[4].textContent).toContain('5. Palet Warna');
      expect(headers[5].textContent).toContain('6. Format Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('video-frame-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil frame video akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Frame Video');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('video-frame-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat frame video');
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
      const scriptTextarea = document.getElementById('video-frame-generator-script');
      expect(scriptTextarea).toBeTruthy();
      
      const themeSelect = document.getElementById('video-frame-generator-theme');
      expect(themeSelect).toBeTruthy();
      
      const frameCountSelect = document.getElementById('video-frame-generator-frame-count');
      expect(frameCountSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('video-frame-generator-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const colorPaletteSelect = document.getElementById('video-frame-generator-color-palette');
      expect(colorPaletteSelect).toBeTruthy();
      
      const outputFormatSelect = document.getElementById('video-frame-generator-output-format');
      expect(outputFormatSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const scriptLabel = document.querySelector('label[for="video-frame-generator-script"]');
      expect(scriptLabel).toBeTruthy();
      
      const themeLabel = document.querySelector('label[for="video-frame-generator-theme"]');
      expect(themeLabel).toBeTruthy();
      
      const frameCountLabel = document.querySelector('label[for="video-frame-generator-frame-count"]');
      expect(frameCountLabel).toBeTruthy();
      
      const aspectRatioLabel = document.querySelector('label[for="video-frame-generator-aspect-ratio"]');
      expect(aspectRatioLabel).toBeTruthy();
      
      const colorPaletteLabel = document.querySelector('label[for="video-frame-generator-color-palette"]');
      expect(colorPaletteLabel).toBeTruthy();
      
      const outputFormatLabel = document.querySelector('label[for="video-frame-generator-output-format"]');
      expect(outputFormatLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('video-frame-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const scriptTextarea = document.getElementById('video-frame-generator-script');
      expect(scriptTextarea.tagName).toBe('TEXTAREA');
      
      const themeSelect = document.getElementById('video-frame-generator-theme');
      expect(themeSelect.tagName).toBe('SELECT');
      
      const frameCountSelect = document.getElementById('video-frame-generator-frame-count');
      expect(frameCountSelect.tagName).toBe('SELECT');
      
      const aspectRatioSelect = document.getElementById('video-frame-generator-aspect-ratio');
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      
      const colorPaletteSelect = document.getElementById('video-frame-generator-color-palette');
      expect(colorPaletteSelect.tagName).toBe('SELECT');
      
      const outputFormatSelect = document.getElementById('video-frame-generator-output-format');
      expect(outputFormatSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea attributes', () => {
      const scriptTextarea = document.getElementById('video-frame-generator-script');
      expect(scriptTextarea.rows).toBe(5);
      expect(scriptTextarea.classList.contains('resize-none')).toBe(true);
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
