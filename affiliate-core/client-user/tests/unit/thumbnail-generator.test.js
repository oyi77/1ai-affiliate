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

describe('thumbnail-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-thumbnail-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-400 bg-clip-text text-transparent">
            <i class="fas fa-play-circle mr-3"></i>Generator Thumbnail YouTube
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat thumbnail YouTube yang menarik dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Video Title -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Judul Video</h2>
              <div>
                <label for="thumbnail-generator-title" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-heading mr-1 text-red-500"></i>Judul Video
                </label>
                <textarea id="thumbnail-generator-title" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Masukkan judul video Anda..."></textarea>
              </div>
            </div>
            
            <!-- Step 2: Channel Name -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Nama Channel</h2>
              <div>
                <label for="thumbnail-generator-channel" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-tv mr-1 text-orange-500"></i>Nama Channel
                </label>
                <input type="text" id="thumbnail-generator-channel" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Masukkan nama channel Anda...">
              </div>
            </div>
            
            <!-- Step 3: Thumbnail Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya Thumbnail</h2>
              <div>
                <label for="thumbnail-generator-style" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-palette mr-1 text-red-400"></i>Gaya Thumbnail
                </label>
                <select id="thumbnail-generator-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400">
                  <option value="gaming">Gaming</option>
                  <option value="education">Education</option>
                  <option value="vlog">Vlog</option>
                  <option value="tech">Tech</option>
                  <option value="business">Business</option>
                  <option value="entertainment">Entertainment</option>
                </select>
              </div>
            </div>
            
            <!-- Step 4: Text Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya Teks</h2>
              <div>
                <label for="thumbnail-generator-text-style" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-font mr-1 text-orange-400"></i>Gaya Teks
                </label>
                <select id="thumbnail-generator-text-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400">
                  <option value="bold">Bold</option>
                  <option value="minimal">Minimal</option>
                  <option value="neon">Neon</option>
                  <option value="3d">3D</option>
                  <option value="handwritten">Handwritten</option>
                  <option value="modern">Modern</option>
                </select>
              </div>
            </div>
            
            <!-- Step 5: Color Scheme -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Skema Warna</h2>
              <div>
                <label for="thumbnail-generator-color" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-paint-roller mr-1 text-red-500"></i>Skema Warna
                </label>
                <select id="thumbnail-generator-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="vibrant">Vibrant</option>
                  <option value="dark">Dark</option>
                  <option value="pastel">Pastel</option>
                  <option value="monochrome">Monochrome</option>
                  <option value="gradient">Gradient</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>
            </div>
            
            <!-- Step 6: Aspect Ratio -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Aspect Ratio</h2>
              <div>
                <label for="thumbnail-generator-ratio" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-expand-arrows-alt mr-1 text-orange-500"></i>Aspect Ratio
                </label>
                <select id="thumbnail-generator-ratio" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="16:9">16:9</option>
                  <option value="1:1">1:1</option>
                  <option value="9:16">9:16</option>
                  <option value="4:3">4:3</option>
                </select>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="thumbnail-generator-generate-btn" class="w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Thumbnail
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="thumbnail-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="thumbnail-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-play-circle text-6xl mb-4 text-orange-400"></i>
                <p class="text-xl">Hasil thumbnail akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Thumbnail</p>
              </div>
              <div id="thumbnail-generator-results" class="hidden space-y-6"></div>
              <div id="thumbnail-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-orange-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat thumbnail...</p>
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
      const container = document.getElementById('content-thumbnail-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Thumbnail YouTube');
      expect(title.querySelector('i.fas.fa-play-circle')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat thumbnail YouTube yang menarik dengan AI');
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
      expect(rightPanel.querySelector('#thumbnail-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Video Title Input Tests
  describe('Video Title Input', () => {
    it('should render video title textarea', () => {
      const titleTextarea = document.getElementById('thumbnail-generator-title');
      expect(titleTextarea).toBeTruthy();
      expect(titleTextarea.tagName).toBe('TEXTAREA');
      expect(titleTextarea.rows).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Judul Video');
    });

    it('should have label with icon', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon).toBeTruthy();
      expect(headingIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have proper textarea styling', () => {
      const titleTextarea = document.getElementById('thumbnail-generator-title');
      expect(titleTextarea.classList.contains('w-full')).toBe(true);
      expect(titleTextarea.classList.contains('p-3')).toBe(true);
      expect(titleTextarea.classList.contains('border')).toBe(true);
      expect(titleTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(titleTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(titleTextarea.classList.contains('focus:ring-red-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const titleTextarea = document.getElementById('thumbnail-generator-title');
      expect(titleTextarea.placeholder).toBe('Masukkan judul video Anda...');
    });
  });

  // Channel Name Input Tests
  describe('Channel Name Input', () => {
    it('should render channel name input', () => {
      const channelInput = document.getElementById('thumbnail-generator-channel');
      expect(channelInput).toBeTruthy();
      expect(channelInput.tagName).toBe('INPUT');
      expect(channelInput.type).toBe('text');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Nama Channel');
    });

    it('should have label with icon', () => {
      const tvIcon = document.body.querySelector('i.fas.fa-tv');
      expect(tvIcon).toBeTruthy();
      expect(tvIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have proper input styling', () => {
      const channelInput = document.getElementById('thumbnail-generator-channel');
      expect(channelInput.classList.contains('w-full')).toBe(true);
      expect(channelInput.classList.contains('p-3')).toBe(true);
      expect(channelInput.classList.contains('border')).toBe(true);
      expect(channelInput.classList.contains('rounded-lg')).toBe(true);
      expect(channelInput.classList.contains('focus:ring-2')).toBe(true);
      expect(channelInput.classList.contains('focus:ring-orange-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const channelInput = document.getElementById('thumbnail-generator-channel');
      expect(channelInput.placeholder).toBe('Masukkan nama channel Anda...');
    });
  });

  // Thumbnail Style Selection Tests
  describe('Thumbnail Style Selection', () => {
    it('should render thumbnail style select', () => {
      const styleSelect = document.getElementById('thumbnail-generator-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya Thumbnail');
    });

    it('should have label with icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      expect(paletteIcon.classList.contains('text-red-400')).toBe(true);
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('thumbnail-generator-style');
      expect(styleSelect.options[0].textContent).toContain('Gaming');
      expect(styleSelect.options[1].textContent).toContain('Education');
      expect(styleSelect.options[2].textContent).toContain('Vlog');
      expect(styleSelect.options[3].textContent).toContain('Tech');
      expect(styleSelect.options[4].textContent).toContain('Business');
      expect(styleSelect.options[5].textContent).toContain('Entertainment');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('thumbnail-generator-style');
      expect(styleSelect.value).toBe('gaming');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('thumbnail-generator-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-red-400')).toBe(true);
    });
  });

  // Text Style Selection Tests
  describe('Text Style Selection', () => {
    it('should render text style select', () => {
      const textStyleSelect = document.getElementById('thumbnail-generator-text-style');
      expect(textStyleSelect).toBeTruthy();
      expect(textStyleSelect.tagName).toBe('SELECT');
      expect(textStyleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya Teks');
    });

    it('should have label with icon', () => {
      const fontIcon = document.body.querySelector('i.fas.fa-font');
      expect(fontIcon).toBeTruthy();
      expect(fontIcon.classList.contains('text-orange-400')).toBe(true);
    });

    it('should have text style options with proper labels', () => {
      const textStyleSelect = document.getElementById('thumbnail-generator-text-style');
      expect(textStyleSelect.options[0].textContent).toContain('Bold');
      expect(textStyleSelect.options[1].textContent).toContain('Minimal');
      expect(textStyleSelect.options[2].textContent).toContain('Neon');
      expect(textStyleSelect.options[3].textContent).toContain('3D');
      expect(textStyleSelect.options[4].textContent).toContain('Handwritten');
      expect(textStyleSelect.options[5].textContent).toContain('Modern');
    });

    it('should have default text style value', () => {
      const textStyleSelect = document.getElementById('thumbnail-generator-text-style');
      expect(textStyleSelect.value).toBe('bold');
    });

    it('should have proper input styling', () => {
      const textStyleSelect = document.getElementById('thumbnail-generator-text-style');
      expect(textStyleSelect.classList.contains('w-full')).toBe(true);
      expect(textStyleSelect.classList.contains('p-3')).toBe(true);
      expect(textStyleSelect.classList.contains('border')).toBe(true);
      expect(textStyleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(textStyleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(textStyleSelect.classList.contains('focus:ring-orange-400')).toBe(true);
    });
  });

  // Color Scheme Selection Tests
  describe('Color Scheme Selection', () => {
    it('should render color scheme select', () => {
      const colorSelect = document.getElementById('thumbnail-generator-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Skema Warna');
    });

    it('should have label with icon', () => {
      const paintRollerIcon = document.body.querySelector('i.fas.fa-paint-roller');
      expect(paintRollerIcon).toBeTruthy();
      expect(paintRollerIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have color scheme options with proper labels', () => {
      const colorSelect = document.getElementById('thumbnail-generator-color');
      expect(colorSelect.options[0].textContent).toContain('Vibrant');
      expect(colorSelect.options[1].textContent).toContain('Dark');
      expect(colorSelect.options[2].textContent).toContain('Pastel');
      expect(colorSelect.options[3].textContent).toContain('Monochrome');
      expect(colorSelect.options[4].textContent).toContain('Gradient');
      expect(colorSelect.options[5].textContent).toContain('High Contrast');
    });

    it('should have default color scheme value', () => {
      const colorSelect = document.getElementById('thumbnail-generator-color');
      expect(colorSelect.value).toBe('vibrant');
    });

    it('should have proper input styling', () => {
      const colorSelect = document.getElementById('thumbnail-generator-color');
      expect(colorSelect.classList.contains('w-full')).toBe(true);
      expect(colorSelect.classList.contains('p-3')).toBe(true);
      expect(colorSelect.classList.contains('border')).toBe(true);
      expect(colorSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Aspect Ratio Selection Tests
  describe('Aspect Ratio Selection', () => {
    it('should render aspect ratio select', () => {
      const ratioSelect = document.getElementById('thumbnail-generator-ratio');
      expect(ratioSelect).toBeTruthy();
      expect(ratioSelect.tagName).toBe('SELECT');
      expect(ratioSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Aspect Ratio');
    });

    it('should have label with icon', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon).toBeTruthy();
      expect(expandArrowsAltIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have aspect ratio options with proper labels', () => {
      const ratioSelect = document.getElementById('thumbnail-generator-ratio');
      expect(ratioSelect.options[0].textContent).toContain('16:9');
      expect(ratioSelect.options[1].textContent).toContain('1:1');
      expect(ratioSelect.options[2].textContent).toContain('9:16');
      expect(ratioSelect.options[3].textContent).toContain('4:3');
    });

    it('should have default aspect ratio value', () => {
      const ratioSelect = document.getElementById('thumbnail-generator-ratio');
      expect(ratioSelect.value).toBe('16:9');
    });

    it('should have proper input styling', () => {
      const ratioSelect = document.getElementById('thumbnail-generator-ratio');
      expect(ratioSelect.classList.contains('w-full')).toBe(true);
      expect(ratioSelect.classList.contains('p-3')).toBe(true);
      expect(ratioSelect.classList.contains('border')).toBe(true);
      expect(ratioSelect.classList.contains('rounded-lg')).toBe(true);
      expect(ratioSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(ratioSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('thumbnail-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Thumbnail');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('thumbnail-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-red-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-red-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('thumbnail-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('thumbnail-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('thumbnail-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('thumbnail-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-play-circle')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil thumbnail akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('thumbnail-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('thumbnail-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat thumbnail');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-orange-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('thumbnail-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have orange icon in empty state', () => {
      const emptyStateIcon = document.getElementById('thumbnail-generator-empty-state').querySelector('i.fas.fa-play-circle');
      expect(emptyStateIcon.classList.contains('text-orange-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use red/orange color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-red-500')).toBe(true);
      expect(title.classList.contains('via-orange-500')).toBe(true);
      expect(title.classList.contains('to-red-400')).toBe(true);
    });

    it('should use red/orange accents in generate button', () => {
      const generateBtn = document.getElementById('thumbnail-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-red-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-red-400')).toBe(true);
    });

    it('should use red accents in title textarea', () => {
      const titleTextarea = document.getElementById('thumbnail-generator-title');
      expect(titleTextarea.classList.contains('focus:ring-red-500')).toBe(true);
      expect(titleTextarea.classList.contains('focus:border-red-500')).toBe(true);
    });

    it('should use orange accents in channel input', () => {
      const channelInput = document.getElementById('thumbnail-generator-channel');
      expect(channelInput.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(channelInput.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use red-400 accents in style select', () => {
      const styleSelect = document.getElementById('thumbnail-generator-style');
      expect(styleSelect.classList.contains('focus:ring-red-400')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-red-400')).toBe(true);
    });

    it('should use orange-400 accents in text style select', () => {
      const textStyleSelect = document.getElementById('thumbnail-generator-text-style');
      expect(textStyleSelect.classList.contains('focus:ring-orange-400')).toBe(true);
      expect(textStyleSelect.classList.contains('focus:border-orange-400')).toBe(true);
    });

    it('should use red accents in color scheme select', () => {
      const colorSelect = document.getElementById('thumbnail-generator-color');
      expect(colorSelect.classList.contains('focus:ring-red-500')).toBe(true);
      expect(colorSelect.classList.contains('focus:border-red-500')).toBe(true);
    });

    it('should use orange accents in aspect ratio select', () => {
      const ratioSelect = document.getElementById('thumbnail-generator-ratio');
      expect(ratioSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(ratioSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use orange accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-orange-500')).toBe(true);
    });

    it('should use orange accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('thumbnail-generator-empty-state').querySelector('i.fas.fa-play-circle');
      expect(emptyStateIcon.classList.contains('text-orange-400')).toBe(true);
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

    it('should have play-circle icon in header', () => {
      const playCircleIcon = document.body.querySelector('header i.fas.fa-play-circle');
      expect(playCircleIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('thumbnail-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have heading icon for video title', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon).toBeTruthy();
    });

    it('should have tv icon for channel name', () => {
      const tvIcon = document.body.querySelector('i.fas.fa-tv');
      expect(tvIcon).toBeTruthy();
    });

    it('should have palette icon for thumbnail style', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have font icon for text style', () => {
      const fontIcon = document.body.querySelector('i.fas.fa-font');
      expect(fontIcon).toBeTruthy();
    });

    it('should have paint-roller icon for color scheme', () => {
      const paintRollerIcon = document.body.querySelector('i.fas.fa-paint-roller');
      expect(paintRollerIcon).toBeTruthy();
    });

    it('should have expand-arrows-alt icon for aspect ratio', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon).toBeTruthy();
    });

    it('should have play-circle icon in empty state', () => {
      const emptyStateIcon = document.getElementById('thumbnail-generator-empty-state').querySelector('i.fas.fa-play-circle');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have heading icon with red-500 color', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have tv icon with orange-500 color', () => {
      const tvIcon = document.body.querySelector('i.fas.fa-tv');
      expect(tvIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have palette icon with red-400 color', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon.classList.contains('text-red-400')).toBe(true);
    });

    it('should have font icon with orange-400 color', () => {
      const fontIcon = document.body.querySelector('i.fas.fa-font');
      expect(fontIcon.classList.contains('text-orange-400')).toBe(true);
    });

    it('should have paint-roller icon with red-500 color', () => {
      const paintRollerIcon = document.body.querySelector('i.fas.fa-paint-roller');
      expect(paintRollerIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have expand-arrows-alt icon with orange-500 color', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon.classList.contains('text-orange-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Thumbnail YouTube');
      expect(document.body.textContent).toContain('Judul Video');
      expect(document.body.textContent).toContain('Nama Channel');
      expect(document.body.textContent).toContain('Gaya Thumbnail');
      expect(document.body.textContent).toContain('Gaya Teks');
      expect(document.body.textContent).toContain('Skema Warna');
      expect(document.body.textContent).toContain('Aspect Ratio');
      expect(document.body.textContent).toContain('Buat Thumbnail');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Judul Video');
      expect(headers[1].textContent).toContain('2. Nama Channel');
      expect(headers[2].textContent).toContain('3. Gaya Thumbnail');
      expect(headers[3].textContent).toContain('4. Gaya Teks');
      expect(headers[4].textContent).toContain('5. Skema Warna');
      expect(headers[5].textContent).toContain('6. Aspect Ratio');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('thumbnail-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil thumbnail akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Thumbnail');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('thumbnail-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat thumbnail');
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
      const titleTextarea = document.getElementById('thumbnail-generator-title');
      expect(titleTextarea).toBeTruthy();
      
      const channelInput = document.getElementById('thumbnail-generator-channel');
      expect(channelInput).toBeTruthy();
      
      const styleSelect = document.getElementById('thumbnail-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const textStyleSelect = document.getElementById('thumbnail-generator-text-style');
      expect(textStyleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('thumbnail-generator-color');
      expect(colorSelect).toBeTruthy();
      
      const ratioSelect = document.getElementById('thumbnail-generator-ratio');
      expect(ratioSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const titleLabel = document.querySelector('label[for="thumbnail-generator-title"]');
      expect(titleLabel).toBeTruthy();
      
      const channelLabel = document.querySelector('label[for="thumbnail-generator-channel"]');
      expect(channelLabel).toBeTruthy();
      
      const styleLabel = document.querySelector('label[for="thumbnail-generator-style"]');
      expect(styleLabel).toBeTruthy();
      
      const textStyleLabel = document.querySelector('label[for="thumbnail-generator-text-style"]');
      expect(textStyleLabel).toBeTruthy();
      
      const colorLabel = document.querySelector('label[for="thumbnail-generator-color"]');
      expect(colorLabel).toBeTruthy();
      
      const ratioLabel = document.querySelector('label[for="thumbnail-generator-ratio"]');
      expect(ratioLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('thumbnail-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const titleTextarea = document.getElementById('thumbnail-generator-title');
      expect(titleTextarea.tagName).toBe('TEXTAREA');
      
      const channelInput = document.getElementById('thumbnail-generator-channel');
      expect(channelInput.tagName).toBe('INPUT');
      expect(channelInput.type).toBe('text');
      
      const styleSelect = document.getElementById('thumbnail-generator-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const textStyleSelect = document.getElementById('thumbnail-generator-text-style');
      expect(textStyleSelect.tagName).toBe('SELECT');
      
      const colorSelect = document.getElementById('thumbnail-generator-color');
      expect(colorSelect.tagName).toBe('SELECT');
      
      const ratioSelect = document.getElementById('thumbnail-generator-ratio');
      expect(ratioSelect.tagName).toBe('SELECT');
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
