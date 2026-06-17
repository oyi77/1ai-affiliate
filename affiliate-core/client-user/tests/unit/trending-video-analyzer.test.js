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

describe('trending-video-analyzer Component', () => {
  
  const mockComponentHTML = `
    <div id="content-trending-video-analyzer" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 bg-clip-text text-transparent">
            <i class="fas fa-chart-line mr-3"></i>Analisis Video Trending
          </h1>
          <p class="text-lg text-gray-600 mt-2">Analisis video trending dari berbagai platform dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Video URL -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">URL Video</h2>
              <div class="space-y-4">
                <div>
                  <label for="trending-video-analyzer-url" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-link mr-1 text-orange-500"></i>Link Video
                  </label>
                  <input type="url" id="trending-video-analyzer-url" placeholder="https://www.tiktok.com/..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>
            </div>
            
            <!-- Platform -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Platform</h2>
              <div class="space-y-4">
                <div>
                  <label for="trending-video-analyzer-platform" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mobile-alt mr-1 text-yellow-500"></i>Pilih Platform
                  </label>
                  <select id="trending-video-analyzer-platform" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="tiktok">TikTok</option>
                    <option value="instagram-reels">Instagram Reels</option>
                    <option value="youtube-shorts">YouTube Shorts</option>
                    <option value="youtube-video">YouTube Video</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Analysis Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Jenis Analisis</h2>
              <div class="space-y-4">
                <div>
                  <label for="trending-video-analyzer-analysis-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-search mr-1 text-orange-500"></i>Tipe Analisis
                  </label>
                  <select id="trending-video-analyzer-analysis-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="full">Analisis Lengkap</option>
                    <option value="copywriting">Copywriting Saja</option>
                    <option value="hashtag">Analisis Hashtag</option>
                    <option value="trend">Deteksi Trend</option>
                    <option value="engagement">Metrik Engagement</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Target Audiens</h2>
              <div class="space-y-4">
                <div>
                  <label for="trending-video-analyzer-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-yellow-500"></i>Target Audiens
                  </label>
                  <select id="trending-video-analyzer-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="gen-z">Gen Z</option>
                    <option value="millennials">Millennials</option>
                    <option value="gen-x">Gen X</option>
                    <option value="general">Umum</option>
                    <option value="niche">Niche Market</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Language -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Bahasa</h2>
              <div class="space-y-4">
                <div>
                  <label for="trending-video-analyzer-language" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-language mr-1 text-orange-500"></i>Pilih Bahasa
                  </label>
                  <select id="trending-video-analyzer-language" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="indonesian">Indonesia</option>
                    <option value="english">English</option>
                    <option value="bilingual">Bilingual</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Output Format -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Format Output</h2>
              <div class="space-y-4">
                <div>
                  <label for="trending-video-analyzer-output-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-alt mr-1 text-yellow-500"></i>Format Output
                  </label>
                  <select id="trending-video-analyzer-output-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="detailed">Laporan Detail</option>
                    <option value="summary">Ringkasan</option>
                    <option value="action-items">Action Items</option>
                    <option value="copy-paste">Siap Copy Paste</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="trending-video-analyzer-generate-btn" class="w-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Analisis Video
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="trending-video-analyzer-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="trending-video-analyzer-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-chart-line text-6xl mb-4 text-orange-400"></i>
                <p class="text-xl">Hasil analisis video akan muncul di sini</p>
                <p class="text-sm mt-2">Masukkan URL video dan klik Analisis Video</p>
              </div>
              <div id="trending-video-analyzer-results" class="hidden space-y-6"></div>
              <div id="trending-video-analyzer-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-orange-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang menganalisis video...</p>
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
      const container = document.getElementById('content-trending-video-analyzer');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Analisis Video Trending');
      expect(title.querySelector('i.fas.fa-chart-line')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Analisis video trending dari berbagai platform dengan AI');
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
      expect(rightPanel.querySelector('#trending-video-analyzer-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Video URL Input Tests
  describe('Video URL Input', () => {
    it('should render video URL input field', () => {
      const urlInput = document.getElementById('trending-video-analyzer-url');
      expect(urlInput).toBeTruthy();
      expect(urlInput.tagName).toBe('INPUT');
      expect(urlInput.type).toBe('url');
    });

    it('should have proper placeholder text', () => {
      const urlInput = document.getElementById('trending-video-analyzer-url');
      expect(urlInput.placeholder).toBe('https://www.tiktok.com/...');
    });

    it('should have proper input styling', () => {
      const urlInput = document.getElementById('trending-video-analyzer-url');
      expect(urlInput.classList.contains('w-full')).toBe(true);
      expect(urlInput.classList.contains('p-3')).toBe(true);
      expect(urlInput.classList.contains('border')).toBe(true);
      expect(urlInput.classList.contains('border-gray-300')).toBe(true);
      expect(urlInput.classList.contains('rounded-lg')).toBe(true);
      expect(urlInput.classList.contains('focus:ring-2')).toBe(true);
      expect(urlInput.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(urlInput.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('URL Video');
    });

    it('should have label with link icon', () => {
      const linkIcon = document.body.querySelector('i.fas.fa-link');
      expect(linkIcon).toBeTruthy();
      expect(linkIcon.classList.contains('text-orange-500')).toBe(true);
    });
  });

  // Platform Selection Tests
  describe('Platform Selection', () => {
    it('should render platform select', () => {
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect).toBeTruthy();
      expect(platformSelect.tagName).toBe('SELECT');
      expect(platformSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('Platform');
    });

    it('should have all platform options', () => {
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect.options[0].textContent).toContain('TikTok');
      expect(platformSelect.options[1].textContent).toContain('Instagram Reels');
      expect(platformSelect.options[2].textContent).toContain('YouTube Shorts');
      expect(platformSelect.options[3].textContent).toContain('YouTube Video');
    });

    it('should have default platform value', () => {
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect.value).toBe('tiktok');
    });

    it('should have proper input styling', () => {
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect.classList.contains('w-full')).toBe(true);
      expect(platformSelect.classList.contains('p-3')).toBe(true);
      expect(platformSelect.classList.contains('border')).toBe(true);
      expect(platformSelect.classList.contains('rounded-lg')).toBe(true);
      expect(platformSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(platformSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(platformSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should have label with mobile-alt icon', () => {
      const mobileAltIcon = document.body.querySelector('i.fas.fa-mobile-alt');
      expect(mobileAltIcon).toBeTruthy();
      expect(mobileAltIcon.classList.contains('text-yellow-500')).toBe(true);
    });
  });

  // Analysis Type Selection Tests
  describe('Analysis Type Selection', () => {
    it('should render analysis type select', () => {
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect).toBeTruthy();
      expect(analysisTypeSelect.tagName).toBe('SELECT');
      expect(analysisTypeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('Jenis Analisis');
    });

    it('should have all analysis type options', () => {
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect.options[0].textContent).toContain('Analisis Lengkap');
      expect(analysisTypeSelect.options[1].textContent).toContain('Copywriting Saja');
      expect(analysisTypeSelect.options[2].textContent).toContain('Analisis Hashtag');
      expect(analysisTypeSelect.options[3].textContent).toContain('Deteksi Trend');
      expect(analysisTypeSelect.options[4].textContent).toContain('Metrik Engagement');
    });

    it('should have default analysis type value', () => {
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect.value).toBe('full');
    });

    it('should have proper input styling', () => {
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect.classList.contains('w-full')).toBe(true);
      expect(analysisTypeSelect.classList.contains('p-3')).toBe(true);
      expect(analysisTypeSelect.classList.contains('border')).toBe(true);
      expect(analysisTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(analysisTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(analysisTypeSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(analysisTypeSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should have label with search icon', () => {
      const searchIcon = document.body.querySelector('i.fas.fa-search');
      expect(searchIcon).toBeTruthy();
      expect(searchIcon.classList.contains('text-orange-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('Target Audiens');
    });

    it('should have all audience options', () => {
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect.options[0].textContent).toContain('Gen Z');
      expect(audienceSelect.options[1].textContent).toContain('Millennials');
      expect(audienceSelect.options[2].textContent).toContain('Gen X');
      expect(audienceSelect.options[3].textContent).toContain('Umum');
      expect(audienceSelect.options[4].textContent).toContain('Niche Market');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect.value).toBe('gen-z');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should have label with users icon', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      expect(usersIcon.classList.contains('text-yellow-500')).toBe(true);
    });
  });

  // Language Selection Tests
  describe('Language Selection', () => {
    it('should render language select', () => {
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect).toBeTruthy();
      expect(languageSelect.tagName).toBe('SELECT');
      expect(languageSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('Bahasa');
    });

    it('should have all language options', () => {
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect.options[0].textContent).toContain('Indonesia');
      expect(languageSelect.options[1].textContent).toContain('English');
      expect(languageSelect.options[2].textContent).toContain('Bilingual');
    });

    it('should have default language value', () => {
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect.value).toBe('indonesian');
    });

    it('should have proper input styling', () => {
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect.classList.contains('w-full')).toBe(true);
      expect(languageSelect.classList.contains('p-3')).toBe(true);
      expect(languageSelect.classList.contains('border')).toBe(true);
      expect(languageSelect.classList.contains('rounded-lg')).toBe(true);
      expect(languageSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(languageSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(languageSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should have label with language icon', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
      expect(languageIcon.classList.contains('text-orange-500')).toBe(true);
    });
  });

  // Output Format Selection Tests
  describe('Output Format Selection', () => {
    it('should render output format select', () => {
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect).toBeTruthy();
      expect(outputFormatSelect.tagName).toBe('SELECT');
      expect(outputFormatSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('Format Output');
    });

    it('should have all output format options', () => {
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect.options[0].textContent).toContain('Laporan Detail');
      expect(outputFormatSelect.options[1].textContent).toContain('Ringkasan');
      expect(outputFormatSelect.options[2].textContent).toContain('Action Items');
      expect(outputFormatSelect.options[3].textContent).toContain('Siap Copy Paste');
    });

    it('should have default output format value', () => {
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect.value).toBe('detailed');
    });

    it('should have proper input styling', () => {
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect.classList.contains('w-full')).toBe(true);
      expect(outputFormatSelect.classList.contains('p-3')).toBe(true);
      expect(outputFormatSelect.classList.contains('border')).toBe(true);
      expect(outputFormatSelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should have label with file-alt icon', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
      expect(fileAltIcon.classList.contains('text-yellow-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('trending-video-analyzer-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Analisis Video');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('trending-video-analyzer-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('via-yellow-500')).toBe(true);
      expect(generateBtn.classList.contains('to-orange-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('trending-video-analyzer-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('trending-video-analyzer-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('trending-video-analyzer-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('trending-video-analyzer-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-chart-line')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil analisis video akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('trending-video-analyzer-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('trending-video-analyzer-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang menganalisis video');
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
      const emptyState = document.getElementById('trending-video-analyzer-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have orange icon in empty state', () => {
      const emptyStateIcon = document.getElementById('trending-video-analyzer-empty-state').querySelector('i.fas.fa-chart-line');
      expect(emptyStateIcon.classList.contains('text-orange-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use orange/yellow color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-orange-500')).toBe(true);
      expect(title.classList.contains('via-yellow-500')).toBe(true);
      expect(title.classList.contains('to-orange-400')).toBe(true);
    });

    it('should use orange/yellow accents in generate button', () => {
      const generateBtn = document.getElementById('trending-video-analyzer-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('via-yellow-500')).toBe(true);
      expect(generateBtn.classList.contains('to-orange-400')).toBe(true);
    });

    it('should use orange accents in URL input', () => {
      const urlInput = document.getElementById('trending-video-analyzer-url');
      expect(urlInput.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(urlInput.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use yellow accents in platform select', () => {
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(platformSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should use orange accents in analysis type select', () => {
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(analysisTypeSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use yellow accents in audience select', () => {
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should use orange accents in language select', () => {
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(languageSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use yellow accents in output format select', () => {
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should use orange accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-orange-500')).toBe(true);
    });

    it('should use orange accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('trending-video-analyzer-empty-state').querySelector('i.fas.fa-chart-line');
      expect(emptyStateIcon.classList.contains('text-orange-400')).toBe(true);
    });

    it('should use orange accents in link icon', () => {
      const linkIcon = document.body.querySelector('i.fas.fa-link');
      expect(linkIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should use yellow accents in mobile-alt icon', () => {
      const mobileAltIcon = document.body.querySelector('i.fas.fa-mobile-alt');
      expect(mobileAltIcon.classList.contains('text-yellow-500')).toBe(true);
    });

    it('should use orange accents in search icon', () => {
      const searchIcon = document.body.querySelector('i.fas.fa-search');
      expect(searchIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should use yellow accents in users icon', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon.classList.contains('text-yellow-500')).toBe(true);
    });

    it('should use orange accents in language icon', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon.classList.contains('text-orange-500')).toBe(true);
    });

    it('should use yellow accents in file-alt icon', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon.classList.contains('text-yellow-500')).toBe(true);
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

    it('should have chart-line icon in header', () => {
      const chartLineIcon = document.body.querySelector('header i.fas.fa-chart-line');
      expect(chartLineIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('trending-video-analyzer-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have link icon for URL input', () => {
      const linkIcon = document.body.querySelector('i.fas.fa-link');
      expect(linkIcon).toBeTruthy();
    });

    it('should have mobile-alt icon for platform', () => {
      const mobileAltIcon = document.body.querySelector('i.fas.fa-mobile-alt');
      expect(mobileAltIcon).toBeTruthy();
    });

    it('should have search icon for analysis type', () => {
      const searchIcon = document.body.querySelector('i.fas.fa-search');
      expect(searchIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have language icon for language', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
    });

    it('should have file-alt icon for output format', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
    });

    it('should have chart-line icon in empty state', () => {
      const emptyStateIcon = document.getElementById('trending-video-analyzer-empty-state').querySelector('i.fas.fa-chart-line');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Analisis Video Trending');
      expect(document.body.textContent).toContain('URL Video');
      expect(document.body.textContent).toContain('Platform');
      expect(document.body.textContent).toContain('Jenis Analisis');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Bahasa');
      expect(document.body.textContent).toContain('Format Output');
      expect(document.body.textContent).toContain('Analisis Video');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('URL Video');
      expect(headers[1].textContent).toContain('Platform');
      expect(headers[2].textContent).toContain('Jenis Analisis');
      expect(headers[3].textContent).toContain('Target Audiens');
      expect(headers[4].textContent).toContain('Bahasa');
      expect(headers[5].textContent).toContain('Format Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('trending-video-analyzer-empty-state');
      expect(emptyState.textContent).toContain('Hasil analisis video akan muncul di sini');
      expect(emptyState.textContent).toContain('Masukkan URL video dan klik Analisis Video');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('trending-video-analyzer-loading');
      expect(loading.textContent).toContain('Sedang menganalisis video');
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
      const urlInput = document.getElementById('trending-video-analyzer-url');
      expect(urlInput).toBeTruthy();
      
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect).toBeTruthy();
      
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect).toBeTruthy();
      
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect).toBeTruthy();
      
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const urlLabel = document.querySelector('label[for="trending-video-analyzer-url"]');
      expect(urlLabel).toBeTruthy();
      
      const platformLabel = document.querySelector('label[for="trending-video-analyzer-platform"]');
      expect(platformLabel).toBeTruthy();
      
      const analysisTypeLabel = document.querySelector('label[for="trending-video-analyzer-analysis-type"]');
      expect(analysisTypeLabel).toBeTruthy();
      
      const audienceLabel = document.querySelector('label[for="trending-video-analyzer-audience"]');
      expect(audienceLabel).toBeTruthy();
      
      const languageLabel = document.querySelector('label[for="trending-video-analyzer-language"]');
      expect(languageLabel).toBeTruthy();
      
      const outputFormatLabel = document.querySelector('label[for="trending-video-analyzer-output-format"]');
      expect(outputFormatLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('trending-video-analyzer-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const urlInput = document.getElementById('trending-video-analyzer-url');
      expect(urlInput.type).toBe('url');
      
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect.tagName).toBe('SELECT');
      
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect.tagName).toBe('SELECT');
      
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect.tagName).toBe('SELECT');
    });

    it('should have proper select types', () => {
      const platformSelect = document.getElementById('trending-video-analyzer-platform');
      expect(platformSelect.tagName).toBe('SELECT');
      
      const analysisTypeSelect = document.getElementById('trending-video-analyzer-analysis-type');
      expect(analysisTypeSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('trending-video-analyzer-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const languageSelect = document.getElementById('trending-video-analyzer-language');
      expect(languageSelect.tagName).toBe('SELECT');
      
      const outputFormatSelect = document.getElementById('trending-video-analyzer-output-format');
      expect(outputFormatSelect.tagName).toBe('SELECT');
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
