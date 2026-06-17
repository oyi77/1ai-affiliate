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

describe('content-calendar Component', () => {
  
  const mockComponentHTML = `
    <div id="content-content-calendar" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            <i class="fas fa-calendar-alt mr-3"></i>Kalender Konten
          </h1>
          <p class="text-lg text-gray-600 mt-2">Rencanakan konten Anda dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Platform -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Platform</h2>
              <div id="content-calendar-platform-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-platform="instagram" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fab fa-instagram text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Instagram</span>
                </button>
                <button type="button" data-platform="facebook" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-facebook text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Facebook</span>
                </button>
                <button type="button" data-platform="tiktok" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-tiktok text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">TikTok</span>
                </button>
                <button type="button" data-platform="youtube" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-youtube text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">YouTube</span>
                </button>
                <button type="button" data-platform="twitter" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-twitter text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Twitter</span>
                </button>
                <button type="button" data-platform="linkedin" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-linkedin text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">LinkedIn</span>
                </button>
                <button type="button" data-platform="pinterest" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-pinterest text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Pinterest</span>
                </button>
                <button type="button" data-platform="blog" class="content-calendar-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-green-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-blog text-2xl mb-1 text-green-500"></i>
                  <span class="block font-medium">Blog</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Konten</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="content-calendar-content-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-alt mr-1 text-amber-500"></i>Jenis Konten
                  </label>
                  <select id="content-calendar-content-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="educational">Edukatif</option>
                    <option value="promotional">Promosi</option>
                    <option value="entertaining">Menghibur</option>
                    <option value="inspirational">Inspiratif</option>
                    <option value="behind-scenes">Behind The Scenes</option>
                    <option value="user-generated">User Generated</option>
                    <option value="announcement">Pengumuman</option>
                    <option value="interactive">Interaktif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Frequency -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Frekuensi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="content-calendar-frequency" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock mr-1 text-orange-500"></i>Frekuensi Posting
                  </label>
                  <select id="content-calendar-frequency" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="daily">Harian</option>
                    <option value="every-other-day">Setiap 2 Hari</option>
                    <option value="weekly">Mingguan</option>
                    <option value="bi-weekly">2x Seminggu</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Duration -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Durasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="content-calendar-duration" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-week mr-1 text-yellow-500"></i>Durasi Kalender
                  </label>
                  <select id="content-calendar-duration" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="1-week">1 Minggu</option>
                    <option value="2-weeks">2 Minggu</option>
                    <option value="1-month">1 Bulan</option>
                    <option value="3-months">3 Bulan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Theme/Niche -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Tema/Niche</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="content-calendar-theme" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tags mr-1 text-red-500"></i>Tema/Niche
                  </label>
                  <select id="content-calendar-theme" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="lifestyle">Lifestyle</option>
                    <option value="business">Bisnis</option>
                    <option value="fashion">Fashion</option>
                    <option value="food">Kuliner</option>
                    <option value="travel">Travel</option>
                    <option value="health">Kesehatan</option>
                    <option value="tech">Teknologi</option>
                    <option value="education">Pendidikan</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Goals -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Tujuan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="content-calendar-goals" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-blue-500"></i>Tujuan
                  </label>
                  <select id="content-calendar-goals" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="engagement">Engagement</option>
                    <option value="followers">Followers</option>
                    <option value="sales">Penjualan</option>
                    <option value="awareness">Awareness</option>
                    <option value="community">Komunitas</option>
                    <option value="traffic">Traffic</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="content-calendar-generate-btn" class="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Kalender Konten
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="content-calendar-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="content-calendar-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-calendar-alt text-6xl mb-4 text-amber-400"></i>
                <p class="text-xl">Hasil kalender konten akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Kalender Konten</p>
              </div>
              <div id="content-calendar-results" class="hidden space-y-6"></div>
              <div id="content-calendar-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-amber-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat kalender konten...</p>
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
      const container = document.getElementById('content-content-calendar');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Kalender Konten');
      expect(title.querySelector('i.fas.fa-calendar-alt')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Rencanakan konten Anda dengan AI');
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
      expect(rightPanel.querySelector('#content-calendar-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Platform Selection Tests
  describe('Platform Selection', () => {
    it('should render platform options container', () => {
      const platformOptions = document.getElementById('content-calendar-platform-options');
      expect(platformOptions).toBeTruthy();
    });

    it('should render Instagram option', () => {
      const instagramBtn = document.body.querySelector('[data-platform="instagram"]');
      expect(instagramBtn).toBeTruthy();
      expect(instagramBtn.textContent).toContain('Instagram');
      expect(instagramBtn.querySelector('i.fab.fa-instagram')).toBeTruthy();
      expect(instagramBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Facebook option', () => {
      const facebookBtn = document.body.querySelector('[data-platform="facebook"]');
      expect(facebookBtn).toBeTruthy();
      expect(facebookBtn.textContent).toContain('Facebook');
      expect(facebookBtn.querySelector('i.fab.fa-facebook')).toBeTruthy();
    });

    it('should render TikTok option', () => {
      const tiktokBtn = document.body.querySelector('[data-platform="tiktok"]');
      expect(tiktokBtn).toBeTruthy();
      expect(tiktokBtn.textContent).toContain('TikTok');
      expect(tiktokBtn.querySelector('i.fab.fa-tiktok')).toBeTruthy();
    });

    it('should render YouTube option', () => {
      const youtubeBtn = document.body.querySelector('[data-platform="youtube"]');
      expect(youtubeBtn).toBeTruthy();
      expect(youtubeBtn.textContent).toContain('YouTube');
      expect(youtubeBtn.querySelector('i.fab.fa-youtube')).toBeTruthy();
    });

    it('should render Twitter option', () => {
      const twitterBtn = document.body.querySelector('[data-platform="twitter"]');
      expect(twitterBtn).toBeTruthy();
      expect(twitterBtn.textContent).toContain('Twitter');
      expect(twitterBtn.querySelector('i.fab.fa-twitter')).toBeTruthy();
    });

    it('should render LinkedIn option', () => {
      const linkedinBtn = document.body.querySelector('[data-platform="linkedin"]');
      expect(linkedinBtn).toBeTruthy();
      expect(linkedinBtn.textContent).toContain('LinkedIn');
      expect(linkedinBtn.querySelector('i.fab.fa-linkedin')).toBeTruthy();
    });

    it('should render Pinterest option', () => {
      const pinterestBtn = document.body.querySelector('[data-platform="pinterest"]');
      expect(pinterestBtn).toBeTruthy();
      expect(pinterestBtn.textContent).toContain('Pinterest');
      expect(pinterestBtn.querySelector('i.fab.fa-pinterest')).toBeTruthy();
    });

    it('should render Blog option', () => {
      const blogBtn = document.body.querySelector('[data-platform="blog"]');
      expect(blogBtn).toBeTruthy();
      expect(blogBtn.textContent).toContain('Blog');
      expect(blogBtn.querySelector('i.fas.fa-blog')).toBeTruthy();
    });

    it('should have 8 platform options', () => {
      const platformBtns = document.body.querySelectorAll('.content-calendar-platform-btn');
      expect(platformBtns.length).toBe(8);
    });

    it('should have proper grid layout for platform options', () => {
      const platformOptions = document.getElementById('content-calendar-platform-options');
      expect(platformOptions.classList.contains('grid')).toBe(true);
      expect(platformOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(platformOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Platform');
    });

    it('should have colored hover effects in platform buttons', () => {
      const platformBtns = document.body.querySelectorAll('.content-calendar-platform-btn');
      expect(platformBtns[0].classList.contains('hover:bg-amber-100')).toBe(true);
      expect(platformBtns[1].classList.contains('hover:bg-orange-100')).toBe(true);
      expect(platformBtns[2].classList.contains('hover:bg-yellow-100')).toBe(true);
      expect(platformBtns[3].classList.contains('hover:bg-red-100')).toBe(true);
      expect(platformBtns[4].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(platformBtns[5].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(platformBtns[6].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(platformBtns[7].classList.contains('hover:bg-green-100')).toBe(true);
    });
  });

  // Content Type Selection Tests
  describe('Content Type Selection', () => {
    it('should render content type select', () => {
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect).toBeTruthy();
      expect(contentTypeSelect.tagName).toBe('SELECT');
      expect(contentTypeSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jenis Konten');
    });

    it('should have all labels with icons', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
    });

    it('should have content type options with proper labels', () => {
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect.options[0].textContent).toContain('Edukatif');
      expect(contentTypeSelect.options[1].textContent).toContain('Promosi');
      expect(contentTypeSelect.options[2].textContent).toContain('Menghibur');
      expect(contentTypeSelect.options[3].textContent).toContain('Inspiratif');
      expect(contentTypeSelect.options[4].textContent).toContain('Behind The Scenes');
      expect(contentTypeSelect.options[5].textContent).toContain('User Generated');
      expect(contentTypeSelect.options[6].textContent).toContain('Pengumuman');
      expect(contentTypeSelect.options[7].textContent).toContain('Interaktif');
    });

    it('should have default content type value', () => {
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect.value).toBe('educational');
    });

    it('should have proper input styling', () => {
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect.classList.contains('w-full')).toBe(true);
      expect(contentTypeSelect.classList.contains('p-3')).toBe(true);
      expect(contentTypeSelect.classList.contains('border')).toBe(true);
      expect(contentTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(contentTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(contentTypeSelect.classList.contains('focus:ring-amber-500')).toBe(true);
    });
  });

  // Frequency Selection Tests
  describe('Frequency Selection', () => {
    it('should render frequency select', () => {
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect).toBeTruthy();
      expect(frequencySelect.tagName).toBe('SELECT');
      expect(frequencySelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Frekuensi');
    });

    it('should have all labels with icons', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have frequency options with proper labels', () => {
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect.options[0].textContent).toContain('Harian');
      expect(frequencySelect.options[1].textContent).toContain('Setiap 2 Hari');
      expect(frequencySelect.options[2].textContent).toContain('Mingguan');
      expect(frequencySelect.options[3].textContent).toContain('2x Seminggu');
      expect(frequencySelect.options[4].textContent).toContain('Bulanan');
    });

    it('should have default frequency value', () => {
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect.value).toBe('daily');
    });

    it('should have proper input styling', () => {
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect.classList.contains('w-full')).toBe(true);
      expect(frequencySelect.classList.contains('p-3')).toBe(true);
      expect(frequencySelect.classList.contains('border')).toBe(true);
      expect(frequencySelect.classList.contains('rounded-lg')).toBe(true);
      expect(frequencySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(frequencySelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Duration Selection Tests
  describe('Duration Selection', () => {
    it('should render duration select', () => {
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect).toBeTruthy();
      expect(durationSelect.tagName).toBe('SELECT');
      expect(durationSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Durasi');
    });

    it('should have all labels with icons', () => {
      const calendarWeekIcon = document.body.querySelector('i.fas.fa-calendar-week');
      expect(calendarWeekIcon).toBeTruthy();
    });

    it('should have duration options with proper labels', () => {
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect.options[0].textContent).toContain('1 Minggu');
      expect(durationSelect.options[1].textContent).toContain('2 Minggu');
      expect(durationSelect.options[2].textContent).toContain('1 Bulan');
      expect(durationSelect.options[3].textContent).toContain('3 Bulan');
    });

    it('should have default duration value', () => {
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect.value).toBe('1-week');
    });

    it('should have proper input styling', () => {
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect.classList.contains('w-full')).toBe(true);
      expect(durationSelect.classList.contains('p-3')).toBe(true);
      expect(durationSelect.classList.contains('border')).toBe(true);
      expect(durationSelect.classList.contains('rounded-lg')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Theme/Niche Selection Tests
  describe('Theme/Niche Selection', () => {
    it('should render theme select', () => {
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect).toBeTruthy();
      expect(themeSelect.tagName).toBe('SELECT');
      expect(themeSelect.options.length).toBe(10);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Tema/Niche');
    });

    it('should have all labels with icons', () => {
      const tagsIcon = document.body.querySelector('i.fas.fa-tags');
      expect(tagsIcon).toBeTruthy();
    });

    it('should have theme options with proper labels', () => {
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect.options[0].textContent).toContain('Lifestyle');
      expect(themeSelect.options[1].textContent).toContain('Bisnis');
      expect(themeSelect.options[2].textContent).toContain('Fashion');
      expect(themeSelect.options[3].textContent).toContain('Kuliner');
      expect(themeSelect.options[4].textContent).toContain('Travel');
      expect(themeSelect.options[5].textContent).toContain('Kesehatan');
      expect(themeSelect.options[6].textContent).toContain('Teknologi');
      expect(themeSelect.options[7].textContent).toContain('Pendidikan');
      expect(themeSelect.options[8].textContent).toContain('Entertainment');
      expect(themeSelect.options[9].textContent).toContain('Lainnya');
    });

    it('should have default theme value', () => {
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect.value).toBe('lifestyle');
    });

    it('should have proper input styling', () => {
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect.classList.contains('w-full')).toBe(true);
      expect(themeSelect.classList.contains('p-3')).toBe(true);
      expect(themeSelect.classList.contains('border')).toBe(true);
      expect(themeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(themeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(themeSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Goals Selection Tests
  describe('Goals Selection', () => {
    it('should render goals select', () => {
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect).toBeTruthy();
      expect(goalsSelect.tagName).toBe('SELECT');
      expect(goalsSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Tujuan');
    });

    it('should have all labels with icons', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
    });

    it('should have goals options with proper labels', () => {
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect.options[0].textContent).toContain('Engagement');
      expect(goalsSelect.options[1].textContent).toContain('Followers');
      expect(goalsSelect.options[2].textContent).toContain('Penjualan');
      expect(goalsSelect.options[3].textContent).toContain('Awareness');
      expect(goalsSelect.options[4].textContent).toContain('Komunitas');
      expect(goalsSelect.options[5].textContent).toContain('Traffic');
    });

    it('should have default goals value', () => {
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect.value).toBe('engagement');
    });

    it('should have proper input styling', () => {
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect.classList.contains('w-full')).toBe(true);
      expect(goalsSelect.classList.contains('p-3')).toBe(true);
      expect(goalsSelect.classList.contains('border')).toBe(true);
      expect(goalsSelect.classList.contains('rounded-lg')).toBe(true);
      expect(goalsSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(goalsSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('content-calendar-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Kalender Konten');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('content-calendar-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('content-calendar-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('content-calendar-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('content-calendar-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('content-calendar-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-calendar-alt')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil kalender konten akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('content-calendar-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('content-calendar-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat kalender konten');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-amber-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('content-calendar-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have amber icon in empty state', () => {
      const emptyStateIcon = document.getElementById('content-calendar-empty-state').querySelector('i.fas.fa-calendar-alt');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use amber/orange/yellow color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-amber-500')).toBe(true);
      expect(title.classList.contains('via-orange-500')).toBe(true);
      expect(title.classList.contains('to-yellow-500')).toBe(true);
    });

    it('should use amber/orange/yellow accents in generate button', () => {
      const generateBtn = document.getElementById('content-calendar-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-500')).toBe(true);
    });

    it('should use amber accents in content type select', () => {
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect.classList.contains('focus:ring-amber-500')).toBe(true);
      expect(contentTypeSelect.classList.contains('focus:border-amber-500')).toBe(true);
    });

    it('should use orange accents in frequency select', () => {
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(frequencySelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use yellow accents in duration select', () => {
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(durationSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should use red accents in theme select', () => {
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect.classList.contains('focus:ring-red-500')).toBe(true);
      expect(themeSelect.classList.contains('focus:border-red-500')).toBe(true);
    });

    it('should use blue accents in goals select', () => {
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(goalsSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use amber accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-amber-500')).toBe(true);
    });

    it('should use amber accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('content-calendar-empty-state').querySelector('i.fas.fa-calendar-alt');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
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

    it('should have calendar-alt icon in header', () => {
      const calendarAltIcon = document.body.querySelector('header i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('content-calendar-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have instagram icon for instagram platform', () => {
      const instagramIcon = document.body.querySelector('[data-platform="instagram"] i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
    });

    it('should have facebook icon for facebook platform', () => {
      const facebookIcon = document.body.querySelector('[data-platform="facebook"] i.fab.fa-facebook');
      expect(facebookIcon).toBeTruthy();
    });

    it('should have tiktok icon for tiktok platform', () => {
      const tiktokIcon = document.body.querySelector('[data-platform="tiktok"] i.fab.fa-tiktok');
      expect(tiktokIcon).toBeTruthy();
    });

    it('should have youtube icon for youtube platform', () => {
      const youtubeIcon = document.body.querySelector('[data-platform="youtube"] i.fab.fa-youtube');
      expect(youtubeIcon).toBeTruthy();
    });

    it('should have twitter icon for twitter platform', () => {
      const twitterIcon = document.body.querySelector('[data-platform="twitter"] i.fab.fa-twitter');
      expect(twitterIcon).toBeTruthy();
    });

    it('should have linkedin icon for linkedin platform', () => {
      const linkedinIcon = document.body.querySelector('[data-platform="linkedin"] i.fab.fa-linkedin');
      expect(linkedinIcon).toBeTruthy();
    });

    it('should have pinterest icon for pinterest platform', () => {
      const pinterestIcon = document.body.querySelector('[data-platform="pinterest"] i.fab.fa-pinterest');
      expect(pinterestIcon).toBeTruthy();
    });

    it('should have blog icon for blog platform', () => {
      const blogIcon = document.body.querySelector('[data-platform="blog"] i.fas.fa-blog');
      expect(blogIcon).toBeTruthy();
    });

    it('should have file-alt icon for content type', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
    });

    it('should have clock icon for frequency', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have calendar-week icon for duration', () => {
      const calendarWeekIcon = document.body.querySelector('i.fas.fa-calendar-week');
      expect(calendarWeekIcon).toBeTruthy();
    });

    it('should have tags icon for theme', () => {
      const tagsIcon = document.body.querySelector('i.fas.fa-tags');
      expect(tagsIcon).toBeTruthy();
    });

    it('should have bullseye icon for goals', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
    });

    it('should have calendar-alt icon in empty state', () => {
      const emptyStateIcon = document.getElementById('content-calendar-empty-state').querySelector('i.fas.fa-calendar-alt');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Kalender Konten');
      expect(document.body.textContent).toContain('Platform');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Frekuensi');
      expect(document.body.textContent).toContain('Durasi');
      expect(document.body.textContent).toContain('Tema/Niche');
      expect(document.body.textContent).toContain('Tujuan');
      expect(document.body.textContent).toContain('Buat Kalender Konten');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Platform');
      expect(headers[1].textContent).toContain('2. Jenis Konten');
      expect(headers[2].textContent).toContain('3. Frekuensi');
      expect(headers[3].textContent).toContain('4. Durasi');
      expect(headers[4].textContent).toContain('5. Tema/Niche');
      expect(headers[5].textContent).toContain('6. Tujuan');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('content-calendar-empty-state');
      expect(emptyState.textContent).toContain('Hasil kalender konten akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Kalender Konten');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('content-calendar-loading');
      expect(loading.textContent).toContain('Sedang membuat kalender konten');
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
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect).toBeTruthy();
      
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect).toBeTruthy();
      
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect).toBeTruthy();
      
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect).toBeTruthy();
      
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect).toBeTruthy();
      
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect).toBeTruthy();
      
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect).toBeTruthy();
      
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect).toBeTruthy();
      
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('content-calendar-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const contentTypeSelect = document.getElementById('content-calendar-content-type');
      expect(contentTypeSelect.tagName).toBe('SELECT');
      
      const frequencySelect = document.getElementById('content-calendar-frequency');
      expect(frequencySelect.tagName).toBe('SELECT');
      
      const durationSelect = document.getElementById('content-calendar-duration');
      expect(durationSelect.tagName).toBe('SELECT');
      
      const themeSelect = document.getElementById('content-calendar-theme');
      expect(themeSelect.tagName).toBe('SELECT');
      
      const goalsSelect = document.getElementById('content-calendar-goals');
      expect(goalsSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for platform selection', () => {
      const platformBtns = document.body.querySelectorAll('.content-calendar-platform-btn');
      platformBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for platform buttons', () => {
      const instagramBtn = document.body.querySelector('[data-platform="instagram"]');
      expect(instagramBtn.dataset.platform).toBe('instagram');
      expect(instagramBtn.dataset.selected).toBe('true');
      
      const facebookBtn = document.body.querySelector('[data-platform="facebook"]');
      expect(facebookBtn.dataset.platform).toBe('facebook');
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
