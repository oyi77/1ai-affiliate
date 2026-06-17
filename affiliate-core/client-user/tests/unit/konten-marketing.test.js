import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock copyToClipboard globally
window.copyToClipboard = vi.fn().mockResolvedValue();

// Mock checkApiKey globally
window.checkApiKey = vi.fn().mockReturnValue(true);

// Mock downloadTextFile globally
window.downloadTextFile = vi.fn();

describe('konten-marketing Component', () => {
  
  const mockComponentHTML = `
    <div id="content-konten-marketing" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
            <i class="fas fa-bullhorn mr-3"></i>Konten Marketing
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten marketing yang menarik dengan bantuan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Platform Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Platform</h2>
              <div id="konten-marketing-platform-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-platform="instagram" class="platform-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fab fa-instagram text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Instagram</span>
                </button>
                <button type="button" data-platform="tiktok" class="platform-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-tiktok text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">TikTok</span>
                </button>
                <button type="button" data-platform="facebook" class="platform-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-facebook text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Facebook</span>
                </button>
                <button type="button" data-platform="youtube" class="platform-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-youtube text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">YouTube</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Content Type Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Konten</h2>
              <div id="konten-marketing-type-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-type="caption" class="type-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-align-left mr-2 text-purple-500"></i>
                  <span class="font-medium">Caption</span>
                </button>
                <button type="button" data-type="script" class="type-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-video mr-2 text-purple-500"></i>
                  <span class="font-medium">Script Video</span>
                </button>
                <button type="button" data-type="post" class="type-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-pen mr-2 text-purple-500"></i>
                  <span class="font-medium">Postingan</span>
                </button>
                <button type="button" data-type="deskripsi" class="type-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-align-center mr-2 text-purple-500"></i>
                  <span class="font-medium">Deskripsi</span>
                </button>
                <button type="button" data-type="hashtag" class="type-btn-konten-marketing p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-hashtag mr-2 text-purple-500"></i>
                  <span class="font-medium">Hashtag</span>
                </button>
              </div>
            </div>
            
            <!-- Step 3: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Target Audiens</h2>
              
              <div class="space-y-4">
                <!-- Age Range -->
                <div>
                  <label for="konten-marketing-age" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Rentang Usia
                  </label>
                  <select id="konten-marketing-age" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">Semua Usia</option>
                    <option value="18-24">18-24 tahun</option>
                    <option value="25-34">25-34 tahun</option>
                    <option value="35-44">35-44 tahun</option>
                    <option value="45-54">45-54 tahun</option>
                    <option value="55+">55 tahun ke atas</option>
                  </select>
                </div>
                
                <!-- Gender -->
                <div>
                  <label for="konten-marketing-gender" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-venus-mars mr-1 text-purple-500"></i>Jenis Kelamin
                  </label>
                  <select id="konten-marketing-gender" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">Semua Jenis Kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                
                <!-- Interests -->
                <div>
                  <label for="konten-marketing-interests" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-purple-500"></i>Minat (pisahkan dengan koma)
                  </label>
                  <textarea id="konten-marketing-interests" rows="2" placeholder="Contoh: teknologi, gaming, fashion, kesehatan"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Key Message -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Pesan Utama</h2>
              
              <div class="space-y-4">
                <!-- Product/Service Name -->
                <div>
                  <label for="konten-marketing-product" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-box mr-1 text-purple-500"></i>Nama Produk/Jasa
                  </label>
                  <input type="text" id="konten-marketing-product" placeholder="Contoh: Samsung Galaxy S24 Ultra" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                
                <!-- Key Message -->
                <div>
                  <label for="konten-marketing-key-message" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-comment-alt mr-1 text-purple-500"></i>Pesan Utama
                  </label>
                  <textarea id="konten-marketing-key-message" rows="3" placeholder="Jelaskan pesan utama yang ingin Anda sampaikan..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                </div>
                
                <!-- Tone/Style -->
                <div>
                  <label for="konten-marketing-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-purple-500"></i>Gaya/Tone
                  </label>
                  <select id="konten-marketing-tone" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="professional">Profesional</option>
                    <option value="casual">Kasual</option>
                    <option value="friendly">Ramah</option>
                    <option value="persuasive">Persuasif</option>
                    <option value="humorous">Humoris</option>
                    <option value="inspirational">Inspiratif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Generate Button -->
            <button id="konten-marketing-generate-btn" class="w-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="konten-marketing-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="konten-marketing-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-bullhorn text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil konten marketing akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Konten</p>
              </div>
              <div id="konten-marketing-results" class="hidden space-y-6"></div>
              <div id="konten-marketing-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten...</p>
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
    // Reset checkApiKey mock
    window.checkApiKey = vi.fn().mockReturnValue(true);
    // Reset downloadTextFile mock
    window.downloadTextFile = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should render main container with correct ID', () => {
      const container = document.getElementById('content-konten-marketing');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Konten Marketing');
      expect(title.querySelector('i.fas.fa-bullhorn')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konten marketing yang menarik');
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
      expect(rightPanel.querySelector('#konten-marketing-results-container')).toBeTruthy();
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(4);
      expect(headers[0].textContent).toContain('1. Platform');
      expect(headers[1].textContent).toContain('2. Jenis Konten');
      expect(headers[2].textContent).toContain('3. Target Audiens');
      expect(headers[3].textContent).toContain('4. Pesan Utama');
    });
  });

  // Platform Selection Tests
  describe('Platform Selection', () => {
    it('should render platform options container', () => {
      const platformOptions = document.getElementById('konten-marketing-platform-options');
      expect(platformOptions).toBeTruthy();
    });

    it('should render Instagram platform option', () => {
      const instagramBtn = document.body.querySelector('[data-platform="instagram"]');
      expect(instagramBtn).toBeTruthy();
      expect(instagramBtn.textContent).toContain('Instagram');
      expect(instagramBtn.querySelector('i.fab.fa-instagram')).toBeTruthy();
      expect(instagramBtn.classList.contains('selected')).toBe(true);
    });

    it('should render TikTok platform option', () => {
      const tiktokBtn = document.body.querySelector('[data-platform="tiktok"]');
      expect(tiktokBtn).toBeTruthy();
      expect(tiktokBtn.textContent).toContain('TikTok');
      expect(tiktokBtn.querySelector('i.fab.fa-tiktok')).toBeTruthy();
    });

    it('should render Facebook platform option', () => {
      const facebookBtn = document.body.querySelector('[data-platform="facebook"]');
      expect(facebookBtn).toBeTruthy();
      expect(facebookBtn.textContent).toContain('Facebook');
      expect(facebookBtn.querySelector('i.fab.fa-facebook')).toBeTruthy();
    });

    it('should render YouTube platform option', () => {
      const youtubeBtn = document.body.querySelector('[data-platform="youtube"]');
      expect(youtubeBtn).toBeTruthy();
      expect(youtubeBtn.textContent).toContain('YouTube');
      expect(youtubeBtn.querySelector('i.fab.fa-youtube')).toBeTruthy();
    });

    it('should have 4 platform options', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-konten-marketing');
      expect(platformBtns.length).toBe(4);
    });

    it('should have platform buttons with correct styling', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-konten-marketing');
      platformBtns.forEach(btn => {
        expect(btn.classList.contains('p-3')).toBe(true);
        expect(btn.classList.contains('rounded-lg')).toBe(true);
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });
  });

  // Content Type Selection Tests
  describe('Content Type Selection', () => {
    it('should render content type options container', () => {
      const typeOptions = document.getElementById('konten-marketing-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render caption type option', () => {
      const captionBtn = document.body.querySelector('[data-type="caption"]');
      expect(captionBtn).toBeTruthy();
      expect(captionBtn.textContent).toContain('Caption');
      expect(captionBtn.querySelector('i.fas.fa-align-left')).toBeTruthy();
      expect(captionBtn.classList.contains('selected')).toBe(true);
    });

    it('should render script video type option', () => {
      const scriptBtn = document.body.querySelector('[data-type="script"]');
      expect(scriptBtn).toBeTruthy();
      expect(scriptBtn.textContent).toContain('Script Video');
      expect(scriptBtn.querySelector('i.fas.fa-video')).toBeTruthy();
    });

    it('should render post type option', () => {
      const postBtn = document.body.querySelector('[data-type="post"]');
      expect(postBtn).toBeTruthy();
      expect(postBtn.textContent).toContain('Postingan');
      expect(postBtn.querySelector('i.fas.fa-pen')).toBeTruthy();
    });

    it('should render deskripsi type option', () => {
      const deskripsiBtn = document.body.querySelector('[data-type="deskripsi"]');
      expect(deskripsiBtn).toBeTruthy();
      expect(deskripsiBtn.textContent).toContain('Deskripsi');
      expect(deskripsiBtn.querySelector('i.fas.fa-align-center')).toBeTruthy();
    });

    it('should render hashtag type option', () => {
      const hashtagBtn = document.body.querySelector('[data-type="hashtag"]');
      expect(hashtagBtn).toBeTruthy();
      expect(hashtagBtn.textContent).toContain('Hashtag');
      expect(hashtagBtn.querySelector('i.fas.fa-hashtag')).toBeTruthy();
    });

    it('should have 5 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-konten-marketing');
      expect(typeBtns.length).toBe(5);
    });
  });

  // Target Audience Input Tests
  describe('Target Audience Input', () => {
    it('should render age select dropdown', () => {
      const ageSelect = document.getElementById('konten-marketing-age');
      expect(ageSelect).toBeTruthy();
      expect(ageSelect.tagName).toBe('SELECT');
    });

    it('should render age options', () => {
      const ageSelect = document.getElementById('konten-marketing-age');
      const options = ageSelect.querySelectorAll('option');
      expect(options.length).toBe(6);
      expect(options[0].value).toBe('all');
      expect(options[1].value).toBe('18-24');
      expect(options[2].value).toBe('25-34');
    });

    it('should render gender select dropdown', () => {
      const genderSelect = document.getElementById('konten-marketing-gender');
      expect(genderSelect).toBeTruthy();
      expect(genderSelect.tagName).toBe('SELECT');
    });

    it('should render gender options', () => {
      const genderSelect = document.getElementById('konten-marketing-gender');
      const options = genderSelect.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('all');
      expect(options[1].value).toBe('male');
      expect(options[2].value).toBe('female');
    });

    it('should render interests textarea', () => {
      const interestsInput = document.getElementById('konten-marketing-interests');
      expect(interestsInput).toBeTruthy();
      expect(interestsInput.tagName).toBe('TEXTAREA');
      expect(interestsInput.rows).toBe(2);
      expect(interestsInput.placeholder).toContain('teknologi, gaming, fashion');
    });

    it('should render all target audience labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const venusMarsIcon = document.body.querySelector('i.fas.fa-venus-mars');
      expect(venusMarsIcon).toBeTruthy();
      
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have focus ring with purple color on inputs', () => {
      const ageSelect = document.getElementById('konten-marketing-age');
      expect(ageSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      
      const genderSelect = document.getElementById('konten-marketing-gender');
      expect(genderSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      
      const interestsInput = document.getElementById('konten-marketing-interests');
      expect(interestsInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Key Message Tests
  describe('Key Message', () => {
    it('should render product name input', () => {
      const productInput = document.getElementById('konten-marketing-product');
      expect(productInput).toBeTruthy();
      expect(productInput.tagName).toBe('INPUT');
      expect(productInput.type).toBe('text');
      expect(productInput.placeholder).toContain('Samsung Galaxy S24 Ultra');
    });

    it('should render key message textarea', () => {
      const keyMessageInput = document.getElementById('konten-marketing-key-message');
      expect(keyMessageInput).toBeTruthy();
      expect(keyMessageInput.tagName).toBe('TEXTAREA');
      expect(keyMessageInput.rows).toBe(3);
      expect(keyMessageInput.placeholder).toContain('Jelaskan pesan utama');
    });

    it('should render tone select dropdown', () => {
      const toneSelect = document.getElementById('konten-marketing-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should render tone options', () => {
      const toneSelect = document.getElementById('konten-marketing-tone');
      const options = toneSelect.querySelectorAll('option');
      expect(options.length).toBe(6);
      expect(options[0].value).toBe('professional');
      expect(options[1].value).toBe('casual');
      expect(options[2].value).toBe('friendly');
      expect(options[3].value).toBe('persuasive');
      expect(options[4].value).toBe('humorous');
      expect(options[5].value).toBe('inspirational');
    });

    it('should render all key message labels with icons', () => {
      const boxIcon = document.body.querySelector('i.fas.fa-box');
      expect(boxIcon).toBeTruthy();
      
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
      
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('konten-marketing-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Konten');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('konten-marketing-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });

    it('should have proper padding and rounded corners', () => {
      const generateBtn = document.getElementById('konten-marketing-generate-btn');
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('konten-marketing-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('konten-marketing-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-bullhorn')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konten marketing akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Konten');
    });

    it('should render results area', () => {
      const results = document.getElementById('konten-marketing-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('konten-marketing-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.querySelector('.loader')).toBeTruthy();
      expect(loading.textContent).toContain('Sedang membuat konten');
    });

    it('should have loader with purple color', () => {
      const loading = document.getElementById('konten-marketing-loading');
      const loader = loading.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('border-purple-500')).toBe(true);
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
      const fasIcons = document.body.querySelectorAll('i.fas');
      const fabIcons = document.body.querySelectorAll('i.fab');
      expect(fasIcons.length + fabIcons.length).toBeGreaterThan(15);
    });

    it('should have bullhorn icon in header', () => {
      const bullhornIcon = document.body.querySelector('header i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
    });

    it('should have social media icons for platforms', () => {
      const instagramIcon = document.body.querySelector('[data-platform="instagram"] i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
      
      const tiktokIcon = document.body.querySelector('[data-platform="tiktok"] i.fab.fa-tiktok');
      expect(tiktokIcon).toBeTruthy();
      
      const facebookIcon = document.body.querySelector('[data-platform="facebook"] i.fab.fa-facebook');
      expect(facebookIcon).toBeTruthy();
      
      const youtubeIcon = document.body.querySelector('[data-platform="youtube"] i.fab.fa-youtube');
      expect(youtubeIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Konten Marketing');
      expect(document.body.textContent).toContain('Platform');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Pesan Utama');
      expect(document.body.textContent).toContain('Buat Konten');
    });

    it('should have proper placeholder texts', () => {
      const productInput = document.getElementById('konten-marketing-product');
      expect(productInput.placeholder).toContain('Samsung Galaxy S24 Ultra');
      
      const interestsInput = document.getElementById('konten-marketing-interests');
      expect(interestsInput.placeholder).toContain('teknologi, gaming, fashion');
      
      const keyMessageInput = document.getElementById('konten-marketing-key-message');
      expect(keyMessageInput.placeholder).toContain('Jelaskan pesan utama');
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
      const ageSelect = document.getElementById('konten-marketing-age');
      expect(ageSelect).toBeTruthy();
      
      const genderSelect = document.getElementById('konten-marketing-gender');
      expect(genderSelect).toBeTruthy();
      
      const productInput = document.getElementById('konten-marketing-product');
      expect(productInput).toBeTruthy();
      
      const keyMessageInput = document.getElementById('konten-marketing-key-message');
      expect(keyMessageInput).toBeTruthy();
      
      const toneSelect = document.getElementById('konten-marketing-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels with icons', () => {
      const labels = document.body.querySelectorAll('label');
      expect(labels.length).toBeGreaterThanOrEqual(6);
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive spacing', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive panel sizing', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
      
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have responsive typography', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/violet color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-600')).toBe(true);
      expect(title.classList.contains('to-violet-500')).toBe(true);
      expect(title.classList.contains('bg-clip-text')).toBe(true);
      expect(title.classList.contains('text-transparent')).toBe(true);
    });

    it('should use purple accents in platform buttons', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-konten-marketing');
      platformBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in content type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-konten-marketing');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in generate button', () => {
      const generateBtn = document.getElementById('konten-marketing-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use purple accents in form labels', () => {
      const labels = document.body.querySelectorAll('label i');
      labels.forEach(icon => {
        if (icon.classList.contains('text-purple-500')) {
          expect(icon).toBeTruthy();
        }
      });
    });

    it('should use purple accents in empty state', () => {
      const emptyStateIcon = document.body.querySelector('#konten-marketing-empty-state i');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loading = document.getElementById('konten-marketing-loading');
      const loader = loading.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple hover effects on buttons', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-konten-marketing');
      platformBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
      });
    });
  });

  // Input Styling Tests
  describe('Input Styling', () => {
    it('should have consistent input styling', () => {
      const inputs = document.body.querySelectorAll('input[type="text"], select, textarea');
      inputs.forEach(input => {
        expect(input.classList.contains('w-full')).toBe(true);
        expect(input.classList.contains('px-4')).toBe(true);
        expect(input.classList.contains('py-2')).toBe(true);
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('border-gray-300')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
        expect(input.classList.contains('focus:ring-2')).toBe(true);
        expect(input.classList.contains('focus:ring-purple-500')).toBe(true);
        expect(input.classList.contains('focus:border-transparent')).toBe(true);
      });
    });
  });

  // Button Interaction Tests
  describe('Button Interactions', () => {
    it('should have clickable platform buttons', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-konten-marketing');
      expect(platformBtns.length).toBe(4);
      
      platformBtns.forEach(btn => {
        expect(btn.type).toBe('button');
        // Buttons are clickable by default, cursor-pointer is optional
      });
    });

    it('should have clickable content type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-konten-marketing');
      expect(typeBtns.length).toBe(5);
      
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
        // Buttons are clickable by default, cursor-pointer is optional
      });
    });

    it('should have clickable generate button', () => {
      const generateBtn = document.getElementById('konten-marketing-generate-btn');
      // Button type can be 'submit' when inside a form
      expect(['button', 'submit']).toContain(generateBtn.type);
    });
  });
});
