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

describe('video-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-video-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-400 bg-clip-text text-transparent">
            <i class="fas fa-video mr-3"></i>Generator Video AI
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat video profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Video Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Video</h2>
              <div class="space-y-4">
                <div>
                  <label for="video-generator-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-film mr-1 text-red-500"></i>Jenis Video
                  </label>
                  <select id="video-generator-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="short">Short Video</option>
                    <option value="long">Long Video</option>
                    <option value="reels">Reels</option>
                    <option value="story">Story</option>
                    <option value="commercial">Commercial</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 2: Topic Description -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Deskripsi Topik</h2>
              <div class="space-y-4">
                <div>
                  <label for="video-generator-topic" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-orange-500"></i>Deskripsi Topik
                  </label>
                  <textarea id="video-generator-topic" rows="4" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Jelaskan topik atau konten video yang ingin dibuat..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Duration -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Durasi</h2>
              <div class="space-y-4">
                <div>
                  <label for="video-generator-duration" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock mr-1 text-red-500"></i>Durasi Video
                  </label>
                  <select id="video-generator-duration" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="15">15 Detik</option>
                    <option value="30">30 Detik</option>
                    <option value="60">1 Menit</option>
                    <option value="180">3 Menit</option>
                    <option value="300">5 Menit</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya</h2>
              <div class="space-y-4">
                <div>
                  <label for="video-generator-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-orange-500"></i>Gaya Video
                  </label>
                  <select id="video-generator-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="cinematic">Cinematic</option>
                    <option value="documentary">Documentary</option>
                    <option value="vlog">Vlog</option>
                    <option value="animation">Animation</option>
                    <option value="commercial">Commercial</option>
                    <option value="social-media">Social Media</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Aspect Ratio -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Aspect Ratio</h2>
              <div class="space-y-4">
                <div>
                  <label for="video-generator-aspect-ratio" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand-arrows-alt mr-1 text-red-500"></i>Aspect Ratio
                  </label>
                  <select id="video-generator-aspect-ratio" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Portrait)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Voiceover -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Voiceover</h2>
              <div class="space-y-4">
                <div>
                  <label for="video-generator-voiceover" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-microphone mr-1 text-orange-500"></i>Voiceover
                  </label>
                  <select id="video-generator-voiceover" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="none">Tidak Ada</option>
                    <option value="male">Male AI</option>
                    <option value="female">Female AI</option>
                    <option value="background-music">Music Background Saja</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="video-generator-generate-btn" class="w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Video
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="video-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="video-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-video text-6xl mb-4 text-orange-400"></i>
                <p class="text-xl">Hasil video akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Video</p>
              </div>
              <div id="video-generator-results" class="hidden space-y-6"></div>
              <div id="video-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-orange-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat video...</p>
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
      const container = document.getElementById('content-video-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Video AI');
      expect(title.querySelector('i.fas.fa-video')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat video profesional dengan AI');
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
      expect(rightPanel.querySelector('#video-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Video Type Selection Tests
  describe('Video Type Selection', () => {
    it('should render video type select', () => {
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.tagName).toBe('SELECT');
      expect(typeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Video');
    });

    it('should have label with film icon', () => {
      const filmIcon = document.body.querySelector('i.fas.fa-film');
      expect(filmIcon).toBeTruthy();
      expect(filmIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have video type options with proper labels', () => {
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect.options[0].textContent).toContain('Short Video');
      expect(typeSelect.options[1].textContent).toContain('Long Video');
      expect(typeSelect.options[2].textContent).toContain('Reels');
      expect(typeSelect.options[3].textContent).toContain('Story');
      expect(typeSelect.options[4].textContent).toContain('Commercial');
      expect(typeSelect.options[5].textContent).toContain('Tutorial');
    });

    it('should have default video type value', () => {
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect.value).toBe('short');
    });

    it('should have proper input styling', () => {
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect.classList.contains('w-full')).toBe(true);
      expect(typeSelect.classList.contains('p-3')).toBe(true);
      expect(typeSelect.classList.contains('border')).toBe(true);
      expect(typeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Topic Description Input Tests
  describe('Topic Description Input', () => {
    it('should render topic description textarea', () => {
      const topicTextarea = document.getElementById('video-generator-topic');
      expect(topicTextarea).toBeTruthy();
      expect(topicTextarea.tagName).toBe('TEXTAREA');
      expect(topicTextarea.rows).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Deskripsi Topik');
    });

    it('should have label with align-left icon', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
      expect(alignLeftIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have proper textarea styling', () => {
      const topicTextarea = document.getElementById('video-generator-topic');
      expect(topicTextarea.classList.contains('w-full')).toBe(true);
      expect(topicTextarea.classList.contains('p-3')).toBe(true);
      expect(topicTextarea.classList.contains('border')).toBe(true);
      expect(topicTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(topicTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(topicTextarea.classList.contains('focus:ring-orange-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const topicTextarea = document.getElementById('video-generator-topic');
      expect(topicTextarea.placeholder).toContain('Jelaskan topik atau konten video yang ingin dibuat');
    });
  });

  // Duration Selection Tests
  describe('Duration Selection', () => {
    it('should render duration select', () => {
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect).toBeTruthy();
      expect(durationSelect.tagName).toBe('SELECT');
      expect(durationSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Durasi');
    });

    it('should have label with clock icon', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
      expect(clockIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have duration options with proper labels', () => {
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect.options[0].textContent).toContain('15 Detik');
      expect(durationSelect.options[1].textContent).toContain('30 Detik');
      expect(durationSelect.options[2].textContent).toContain('1 Menit');
      expect(durationSelect.options[3].textContent).toContain('3 Menit');
      expect(durationSelect.options[4].textContent).toContain('5 Menit');
    });

    it('should have default duration value', () => {
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect.value).toBe('15');
    });

    it('should have proper input styling', () => {
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect.classList.contains('w-full')).toBe(true);
      expect(durationSelect.classList.contains('p-3')).toBe(true);
      expect(durationSelect.classList.contains('border')).toBe(true);
      expect(durationSelect.classList.contains('rounded-lg')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Style Selection Tests
  describe('Style Selection', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya');
    });

    it('should have label with palette icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      expect(paletteIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect.options[0].textContent).toContain('Cinematic');
      expect(styleSelect.options[1].textContent).toContain('Documentary');
      expect(styleSelect.options[2].textContent).toContain('Vlog');
      expect(styleSelect.options[3].textContent).toContain('Animation');
      expect(styleSelect.options[4].textContent).toContain('Commercial');
      expect(styleSelect.options[5].textContent).toContain('Social Media');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect.value).toBe('cinematic');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Aspect Ratio Selection Tests
  describe('Aspect Ratio Selection', () => {
    it('should render aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      expect(aspectRatioSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Aspect Ratio');
    });

    it('should have label with expand-arrows-alt icon', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon).toBeTruthy();
      expect(expandArrowsAltIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have aspect ratio options with proper labels', () => {
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect.options[0].textContent).toContain('16:9');
      expect(aspectRatioSelect.options[1].textContent).toContain('9:16');
      expect(aspectRatioSelect.options[2].textContent).toContain('1:1');
      expect(aspectRatioSelect.options[3].textContent).toContain('4:5');
      expect(aspectRatioSelect.options[4].textContent).toContain('21:9');
    });

    it('should have default aspect ratio value', () => {
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect.value).toBe('16:9');
    });

    it('should have proper input styling', () => {
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('w-full')).toBe(true);
      expect(aspectRatioSelect.classList.contains('p-3')).toBe(true);
      expect(aspectRatioSelect.classList.contains('border')).toBe(true);
      expect(aspectRatioSelect.classList.contains('rounded-lg')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Voiceover Selection Tests
  describe('Voiceover Selection', () => {
    it('should render voiceover select', () => {
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect).toBeTruthy();
      expect(voiceoverSelect.tagName).toBe('SELECT');
      expect(voiceoverSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Voiceover');
    });

    it('should have label with microphone icon', () => {
      const microphoneIcon = document.body.querySelector('i.fas.fa-microphone');
      expect(microphoneIcon).toBeTruthy();
      expect(microphoneIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have voiceover options with proper labels', () => {
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect.options[0].textContent).toContain('Tidak Ada');
      expect(voiceoverSelect.options[1].textContent).toContain('Male AI');
      expect(voiceoverSelect.options[2].textContent).toContain('Female AI');
      expect(voiceoverSelect.options[3].textContent).toContain('Music Background Saja');
    });

    it('should have default voiceover value', () => {
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect.value).toBe('none');
    });

    it('should have proper input styling', () => {
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect.classList.contains('w-full')).toBe(true);
      expect(voiceoverSelect.classList.contains('p-3')).toBe(true);
      expect(voiceoverSelect.classList.contains('border')).toBe(true);
      expect(voiceoverSelect.classList.contains('rounded-lg')).toBe(true);
      expect(voiceoverSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(voiceoverSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('video-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Video');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('video-generator-generate-btn');
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
      const generateBtn = document.getElementById('video-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('video-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('video-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('video-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-video')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil video akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('video-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('video-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat video');
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
      const emptyState = document.getElementById('video-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have orange icon in empty state', () => {
      const emptyStateIcon = document.getElementById('video-generator-empty-state').querySelector('i.fas.fa-video');
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
      const generateBtn = document.getElementById('video-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-red-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-red-400')).toBe(true);
    });

    it('should use red accents in video type select', () => {
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect.classList.contains('focus:ring-red-500')).toBe(true);
      expect(typeSelect.classList.contains('focus:border-red-500')).toBe(true);
    });

    it('should use orange accents in topic textarea', () => {
      const topicTextarea = document.getElementById('video-generator-topic');
      expect(topicTextarea.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(topicTextarea.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use red accents in duration select', () => {
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect.classList.contains('focus:ring-red-500')).toBe(true);
      expect(durationSelect.classList.contains('focus:border-red-500')).toBe(true);
    });

    it('should use orange accents in style select', () => {
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use red accents in aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('focus:ring-red-500')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:border-red-500')).toBe(true);
    });

    it('should use orange accents in voiceover select', () => {
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(voiceoverSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use orange accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-orange-500')).toBe(true);
    });

    it('should use orange accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('video-generator-empty-state').querySelector('i.fas.fa-video');
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

    it('should have video icon in header', () => {
      const videoIcon = document.body.querySelector('header i.fas.fa-video');
      expect(videoIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('video-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have film icon for video type', () => {
      const filmIcon = document.body.querySelector('i.fas.fa-film');
      expect(filmIcon).toBeTruthy();
    });

    it('should have align-left icon for topic description', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have clock icon for duration', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have palette icon for style', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have expand-arrows-alt icon for aspect ratio', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon).toBeTruthy();
    });

    it('should have microphone icon for voiceover', () => {
      const microphoneIcon = document.body.querySelector('i.fas.fa-microphone');
      expect(microphoneIcon).toBeTruthy();
    });

    it('should have video icon in empty state', () => {
      const emptyStateIcon = document.getElementById('video-generator-empty-state').querySelector('i.fas.fa-video');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have red-500 icon for video type label', () => {
      const filmIcon = document.body.querySelector('i.fas.fa-film');
      expect(filmIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have orange-500 icon for topic description label', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have red-500 icon for duration label', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have orange-500 icon for style label', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should have red-500 icon for aspect ratio label', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon.classList.contains('text-red-500')).toBe(true);
    });

    it('should have orange-500 icon for voiceover label', () => {
      const microphoneIcon = document.body.querySelector('i.fas.fa-microphone');
      expect(microphoneIcon.classList.contains('text-orange-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Video AI');
      expect(document.body.textContent).toContain('Jenis Video');
      expect(document.body.textContent).toContain('Deskripsi Topik');
      expect(document.body.textContent).toContain('Durasi');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Aspect Ratio');
      expect(document.body.textContent).toContain('Voiceover');
      expect(document.body.textContent).toContain('Buat Video');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Video');
      expect(headers[1].textContent).toContain('2. Deskripsi Topik');
      expect(headers[2].textContent).toContain('3. Durasi');
      expect(headers[3].textContent).toContain('4. Gaya');
      expect(headers[4].textContent).toContain('5. Aspect Ratio');
      expect(headers[5].textContent).toContain('6. Voiceover');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('video-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil video akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Video');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('video-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat video');
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
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect).toBeTruthy();
      
      const topicTextarea = document.getElementById('video-generator-topic');
      expect(topicTextarea).toBeTruthy();
      
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect).toBeTruthy();
    });

    it('should have proper labels for selects and textarea', () => {
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect).toBeTruthy();
      
      const topicTextarea = document.getElementById('video-generator-topic');
      expect(topicTextarea).toBeTruthy();
      
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('video-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const typeSelect = document.getElementById('video-generator-type');
      expect(typeSelect.tagName).toBe('SELECT');
      
      const durationSelect = document.getElementById('video-generator-duration');
      expect(durationSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('video-generator-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const aspectRatioSelect = document.getElementById('video-generator-aspect-ratio');
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      
      const voiceoverSelect = document.getElementById('video-generator-voiceover');
      expect(voiceoverSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea type', () => {
      const topicTextarea = document.getElementById('video-generator-topic');
      expect(topicTextarea.tagName).toBe('TEXTAREA');
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
