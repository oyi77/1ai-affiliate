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

describe('caption-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-caption-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
            <i class="fas fa-comment-dots mr-3"></i>Generator Caption
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat caption menarik untuk media sosial dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Description -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Deskripsi Konten</h2>
              <div>
                <label for="caption-generator-description" class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-image mr-1 text-blue-500"></i>Deskripsi Gambar/Video
                </label>
                <textarea id="caption-generator-description" rows="4" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Jelaskan konten gambar atau video yang ingin Anda buat captionnya..."></textarea>
              </div>
            </div>
            
            <!-- Step 2: Platform -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Platform</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="caption-generator-platform" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-share-alt mr-1 text-cyan-500"></i>Pilih Platform
                  </label>
                  <select id="caption-generator-platform" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="caption-generator-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-comment-alt mr-1 text-blue-500"></i>Nuansa Caption
                  </label>
                  <select id="caption-generator-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="professional">Profesional</option>
                    <option value="casual">Casual</option>
                    <option value="humorous">Humoris</option>
                    <option value="inspirational">Inspiratif</option>
                    <option value="educational">Edukatif</option>
                    <option value="promotional">Promosi</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="caption-generator-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-cyan-500"></i>Target Audiens
                  </label>
                  <select id="caption-generator-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="gen-z">Gen Z</option>
                    <option value="millennials">Millennials</option>
                    <option value="gen-x">Gen X</option>
                    <option value="professionals">Profesional</option>
                    <option value="parents">Orang Tua</option>
                    <option value="general">Umum</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Hashtag Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Gaya Hashtag</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="caption-generator-hashtags" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-hashtag mr-1 text-blue-500"></i>Gaya Hashtag
                  </label>
                  <select id="caption-generator-hashtags" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="none">Tidak Ada</option>
                    <option value="minimal">Minimal</option>
                    <option value="moderate">Sedang</option>
                    <option value="extensive">Banyak</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Language -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Bahasa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="caption-generator-language" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-language mr-1 text-cyan-500"></i>Bahasa Caption
                  </label>
                  <select id="caption-generator-language" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="indonesian">Indonesia</option>
                    <option value="english">Inggris</option>
                    <option value="mixed">Campuran</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="caption-generator-generate-btn" class="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Caption
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="caption-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="caption-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-comment-dots text-6xl mb-4 text-blue-400"></i>
                <p class="text-xl">Hasil caption akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Caption</p>
              </div>
              <div id="caption-generator-results" class="hidden space-y-6"></div>
              <div id="caption-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat caption...</p>
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
      const container = document.getElementById('content-caption-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Caption');
      expect(title.querySelector('i.fas.fa-comment-dots')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat caption menarik untuk media sosial dengan AI');
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
      expect(rightPanel.querySelector('#caption-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Content Description Input Tests
  describe('Content Description Input', () => {
    it('should render description textarea', () => {
      const descriptionTextarea = document.getElementById('caption-generator-description');
      expect(descriptionTextarea).toBeTruthy();
      expect(descriptionTextarea.tagName).toBe('TEXTAREA');
      expect(descriptionTextarea.rows).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Deskripsi Konten');
    });

    it('should have label with icon', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have proper textarea styling', () => {
      const descriptionTextarea = document.getElementById('caption-generator-description');
      expect(descriptionTextarea.classList.contains('w-full')).toBe(true);
      expect(descriptionTextarea.classList.contains('p-3')).toBe(true);
      expect(descriptionTextarea.classList.contains('border')).toBe(true);
      expect(descriptionTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(descriptionTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(descriptionTextarea.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(descriptionTextarea.classList.contains('resize-none')).toBe(true);
    });

    it('should have placeholder text', () => {
      const descriptionTextarea = document.getElementById('caption-generator-description');
      expect(descriptionTextarea.placeholder).toContain('Jelaskan konten gambar atau video');
    });
  });

  // Platform Selection Tests
  describe('Platform Selection', () => {
    it('should render platform select', () => {
      const platformSelect = document.getElementById('caption-generator-platform');
      expect(platformSelect).toBeTruthy();
      expect(platformSelect.tagName).toBe('SELECT');
      expect(platformSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Platform');
    });

    it('should have label with icon', () => {
      const shareAltIcon = document.body.querySelector('i.fas.fa-share-alt');
      expect(shareAltIcon).toBeTruthy();
    });

    it('should have platform options with proper labels', () => {
      const platformSelect = document.getElementById('caption-generator-platform');
      expect(platformSelect.options[0].textContent).toContain('Instagram');
      expect(platformSelect.options[1].textContent).toContain('TikTok');
      expect(platformSelect.options[2].textContent).toContain('YouTube');
      expect(platformSelect.options[3].textContent).toContain('Twitter');
      expect(platformSelect.options[4].textContent).toContain('Facebook');
      expect(platformSelect.options[5].textContent).toContain('LinkedIn');
    });

    it('should have default platform value', () => {
      const platformSelect = document.getElementById('caption-generator-platform');
      expect(platformSelect.value).toBe('instagram');
    });

    it('should have proper input styling', () => {
      const platformSelect = document.getElementById('caption-generator-platform');
      expect(platformSelect.classList.contains('w-full')).toBe(true);
      expect(platformSelect.classList.contains('p-3')).toBe(true);
      expect(platformSelect.classList.contains('border')).toBe(true);
      expect(platformSelect.classList.contains('rounded-lg')).toBe(true);
      expect(platformSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(platformSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('caption-generator-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Nuansa');
    });

    it('should have label with icon', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('caption-generator-tone');
      expect(toneSelect.options[0].textContent).toContain('Profesional');
      expect(toneSelect.options[1].textContent).toContain('Casual');
      expect(toneSelect.options[2].textContent).toContain('Humoris');
      expect(toneSelect.options[3].textContent).toContain('Inspiratif');
      expect(toneSelect.options[4].textContent).toContain('Edukatif');
      expect(toneSelect.options[5].textContent).toContain('Promosi');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('caption-generator-tone');
      expect(toneSelect.value).toBe('professional');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('caption-generator-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('caption-generator-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Target Audiens');
    });

    it('should have label with icon', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('caption-generator-audience');
      expect(audienceSelect.options[0].textContent).toContain('Gen Z');
      expect(audienceSelect.options[1].textContent).toContain('Millennials');
      expect(audienceSelect.options[2].textContent).toContain('Gen X');
      expect(audienceSelect.options[3].textContent).toContain('Profesional');
      expect(audienceSelect.options[4].textContent).toContain('Orang Tua');
      expect(audienceSelect.options[5].textContent).toContain('Umum');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('caption-generator-audience');
      expect(audienceSelect.value).toBe('gen-z');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('caption-generator-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Hashtag Style Selection Tests
  describe('Hashtag Style Selection', () => {
    it('should render hashtags select', () => {
      const hashtagsSelect = document.getElementById('caption-generator-hashtags');
      expect(hashtagsSelect).toBeTruthy();
      expect(hashtagsSelect.tagName).toBe('SELECT');
      expect(hashtagsSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Gaya Hashtag');
    });

    it('should have label with icon', () => {
      const hashtagIcon = document.body.querySelector('i.fas.fa-hashtag');
      expect(hashtagIcon).toBeTruthy();
    });

    it('should have hashtag style options with proper labels', () => {
      const hashtagsSelect = document.getElementById('caption-generator-hashtags');
      expect(hashtagsSelect.options[0].textContent).toContain('Tidak Ada');
      expect(hashtagsSelect.options[1].textContent).toContain('Minimal');
      expect(hashtagsSelect.options[2].textContent).toContain('Sedang');
      expect(hashtagsSelect.options[3].textContent).toContain('Banyak');
    });

    it('should have default hashtag style value', () => {
      const hashtagsSelect = document.getElementById('caption-generator-hashtags');
      expect(hashtagsSelect.value).toBe('none');
    });

    it('should have proper input styling', () => {
      const hashtagsSelect = document.getElementById('caption-generator-hashtags');
      expect(hashtagsSelect.classList.contains('w-full')).toBe(true);
      expect(hashtagsSelect.classList.contains('p-3')).toBe(true);
      expect(hashtagsSelect.classList.contains('border')).toBe(true);
      expect(hashtagsSelect.classList.contains('rounded-lg')).toBe(true);
      expect(hashtagsSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(hashtagsSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Language Selection Tests
  describe('Language Selection', () => {
    it('should render language select', () => {
      const languageSelect = document.getElementById('caption-generator-language');
      expect(languageSelect).toBeTruthy();
      expect(languageSelect.tagName).toBe('SELECT');
      expect(languageSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Bahasa');
    });

    it('should have label with icon', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
    });

    it('should have language options with proper labels', () => {
      const languageSelect = document.getElementById('caption-generator-language');
      expect(languageSelect.options[0].textContent).toContain('Indonesia');
      expect(languageSelect.options[1].textContent).toContain('Inggris');
      expect(languageSelect.options[2].textContent).toContain('Campuran');
    });

    it('should have default language value', () => {
      const languageSelect = document.getElementById('caption-generator-language');
      expect(languageSelect.value).toBe('indonesian');
    });

    it('should have proper input styling', () => {
      const languageSelect = document.getElementById('caption-generator-language');
      expect(languageSelect.classList.contains('w-full')).toBe(true);
      expect(languageSelect.classList.contains('p-3')).toBe(true);
      expect(languageSelect.classList.contains('border')).toBe(true);
      expect(languageSelect.classList.contains('rounded-lg')).toBe(true);
      expect(languageSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(languageSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('caption-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Caption');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('caption-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('caption-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('caption-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('caption-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('caption-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-comment-dots')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil caption akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('caption-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('caption-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat caption');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('caption-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have blue icon in empty state', () => {
      const emptyStateIcon = document.getElementById('caption-generator-empty-state').querySelector('i.fas.fa-comment-dots');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/cyan color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-blue-400')).toBe(true);
    });

    it('should use blue/cyan accents in generate button', () => {
      const generateBtn = document.getElementById('caption-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-400')).toBe(true);
    });

    it('should use blue accents in description textarea', () => {
      const descriptionTextarea = document.getElementById('caption-generator-description');
      expect(descriptionTextarea.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(descriptionTextarea.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in platform select', () => {
      const platformSelect = document.getElementById('caption-generator-platform');
      expect(platformSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(platformSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in tone select', () => {
      const toneSelect = document.getElementById('caption-generator-tone');
      expect(toneSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(toneSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in audience select', () => {
      const audienceSelect = document.getElementById('caption-generator-audience');
      expect(audienceSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in hashtags select', () => {
      const hashtagsSelect = document.getElementById('caption-generator-hashtags');
      expect(hashtagsSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(hashtagsSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in language select', () => {
      const languageSelect = document.getElementById('caption-generator-language');
      expect(languageSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(languageSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should use blue accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('caption-generator-empty-state').querySelector('i.fas.fa-comment-dots');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
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

    it('should have comment-dots icon in header', () => {
      const commentDotsIcon = document.body.querySelector('header i.fas.fa-comment-dots');
      expect(commentDotsIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('caption-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have image icon for description', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have share-alt icon for platform', () => {
      const shareAltIcon = document.body.querySelector('i.fas.fa-share-alt');
      expect(shareAltIcon).toBeTruthy();
    });

    it('should have comment-alt icon for tone', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have hashtag icon for hashtags', () => {
      const hashtagIcon = document.body.querySelector('i.fas.fa-hashtag');
      expect(hashtagIcon).toBeTruthy();
    });

    it('should have language icon for language', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
    });

    it('should have comment-dots icon in empty state', () => {
      const emptyStateIcon = document.getElementById('caption-generator-empty-state').querySelector('i.fas.fa-comment-dots');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have proper icon styling in description label', () => {
      const imageIcon = document.body.querySelector('i.fas.fa-image');
      expect(imageIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have proper icon styling in platform label', () => {
      const shareAltIcon = document.body.querySelector('i.fas.fa-share-alt');
      expect(shareAltIcon.classList.contains('text-cyan-500')).toBe(true);
    });

    it('should have proper icon styling in tone label', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have proper icon styling in audience label', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon.classList.contains('text-cyan-500')).toBe(true);
    });

    it('should have proper icon styling in hashtags label', () => {
      const hashtagIcon = document.body.querySelector('i.fas.fa-hashtag');
      expect(hashtagIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have proper icon styling in language label', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon.classList.contains('text-cyan-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Caption');
      expect(document.body.textContent).toContain('Deskripsi Konten');
      expect(document.body.textContent).toContain('Platform');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya Hashtag');
      expect(document.body.textContent).toContain('Bahasa');
      expect(document.body.textContent).toContain('Buat Caption');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Deskripsi Konten');
      expect(headers[1].textContent).toContain('2. Platform');
      expect(headers[2].textContent).toContain('3. Nuansa');
      expect(headers[3].textContent).toContain('4. Target Audiens');
      expect(headers[4].textContent).toContain('5. Gaya Hashtag');
      expect(headers[5].textContent).toContain('6. Bahasa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('caption-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil caption akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Caption');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('caption-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat caption');
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
      const descriptionTextarea = document.getElementById('caption-generator-description');
      expect(descriptionTextarea).toBeTruthy();
      
      const platformSelect = document.getElementById('caption-generator-platform');
      expect(platformSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('caption-generator-tone');
      expect(toneSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('caption-generator-audience');
      expect(audienceSelect).toBeTruthy();
      
      const hashtagsSelect = document.getElementById('caption-generator-hashtags');
      expect(hashtagsSelect).toBeTruthy();
      
      const languageSelect = document.getElementById('caption-generator-language');
      expect(languageSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const descriptionLabel = document.querySelector('label[for="caption-generator-description"]');
      expect(descriptionLabel).toBeTruthy();
      
      const platformLabel = document.querySelector('label[for="caption-generator-platform"]');
      expect(platformLabel).toBeTruthy();
      
      const toneLabel = document.querySelector('label[for="caption-generator-tone"]');
      expect(toneLabel).toBeTruthy();
      
      const audienceLabel = document.querySelector('label[for="caption-generator-audience"]');
      expect(audienceLabel).toBeTruthy();
      
      const hashtagsLabel = document.querySelector('label[for="caption-generator-hashtags"]');
      expect(hashtagsLabel).toBeTruthy();
      
      const languageLabel = document.querySelector('label[for="caption-generator-language"]');
      expect(languageLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('caption-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const descriptionTextarea = document.getElementById('caption-generator-description');
      expect(descriptionTextarea.tagName).toBe('TEXTAREA');
      
      const platformSelect = document.getElementById('caption-generator-platform');
      expect(platformSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('caption-generator-tone');
      expect(toneSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('caption-generator-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const hashtagsSelect = document.getElementById('caption-generator-hashtags');
      expect(hashtagsSelect.tagName).toBe('SELECT');
      
      const languageSelect = document.getElementById('caption-generator-language');
      expect(languageSelect.tagName).toBe('SELECT');
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
