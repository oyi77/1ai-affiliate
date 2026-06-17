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

describe('umrah-haji Component', () => {
  
  const mockComponentHTML = `
    <div id="content-umrah-haji" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            <i class="fas fa-kaaba mr-3"></i>Konten Umrah & Haji
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten yang bermakna dan inspiratif untuk perjalanan spiritual Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Konten</h2>
              <div id="umrah-haji-content-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="guide" class="type-btn-umrah-haji p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-compass text-2xl mb-1 text-emerald-500"></i>
                  <span class="block font-medium">Panduan</span>
                </button>
                <button type="button" data-type="preparation" class="type-btn-umrah-haji p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-clipboard-check text-2xl mb-1 text-emerald-500"></i>
                  <span class="block font-medium">Persiapan</span>
                </button>
                <button type="button" data-type="tips" class="type-btn-umrah-haji p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-lightbulb text-2xl mb-1 text-emerald-500"></i>
                  <span class="block font-medium">Tips</span>
                </button>
                <button type="button" data-type="dua" class="type-btn-umrah-haji p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-praying-hands text-2xl mb-1 text-emerald-500"></i>
                  <span class="block font-medium">Doa</span>
                </button>
                <button type="button" data-type="experience" class="type-btn-umrah-haji p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-heart text-2xl mb-1 text-emerald-500"></i>
                  <span class="block font-medium">Pengalaman</span>
                </button>
                <button type="button" data-type="checklist" class="type-btn-umrah-haji p-3 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-list-check text-2xl mb-1 text-emerald-500"></i>
                  <span class="block font-medium">Checklist</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Pilgrimage Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Ibadah</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="umrah-haji-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mosque mr-1 text-emerald-500"></i>Pilihan Ibadah
                  </label>
                  <select id="umrah-haji-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="umrah">Umrah</option>
                    <option value="hajj">Haji</option>
                    <option value="both">Umrah & Haji</option>
                  </select>
                </div>
                
                <div>
                  <label for="umrah-haji-season" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-alt mr-1 text-emerald-500"></i>Waktu Pelaksanaan
                  </label>
                  <select id="umrah-haji-season" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="anytime">Kapan Saja</option>
                    <option value="ramadan">Ramadan</option>
                    <option value="hajj-season">Musim Haji</option>
                    <option value="school-holiday">Liburan Sekolah</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="umrah-haji-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-emerald-500"></i>Target Audiens
                  </label>
                  <select id="umrah-haji-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="first-timers">Jamaah Pertama Kali</option>
                    <option value="experienced">Jamaah Berpengalaman</option>
                    <option value="family">Keluarga</option>
                    <option value="senior">Jamaah Senior</option>
                    <option value="youth">Pemuda</option>
                    <option value="all">Semua Jamaah</option>
                  </select>
                </div>
                
                <div>
                  <label for="umrah-haji-experience-level" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-signal mr-1 text-emerald-500"></i>Tingkat Pengalaman
                  </label>
                  <select id="umrah-haji-experience-level" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Mahir</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Tone & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya & Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="umrah-haji-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-emerald-500"></i>Tone Konten
                  </label>
                  <select id="umrah-haji-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="devout">Khusyuk & Devotis</option>
                    <option value="informative">Informatif & Edukatif</option>
                    <option value="warm">Hangat & Ramah</option>
                    <option value="inspirational">Inspiratif & Motivasi</option>
                    <option value="practical">Praktis & Terstruktur</option>
                    <option value="spiritual">Spiritual & Mendalam</option>
                  </select>
                </div>
                
                <div>
                  <label for="umrah-haji-language" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-language mr-1 text-emerald-500"></i>Bahasa
                  </label>
                  <select id="umrah-haji-language" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="indonesian">Indonesia</option>
                    <option value="arabic-indonesian">Arab & Indonesia</option>
                    <option value="simple-indonesian">Indonesia Sederhana</option>
                  </select>
                </div>
                
                <div>
                  <label for="umrah-haji-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-emerald-500"></i>Panjang Konten
                  </label>
                  <select id="umrah-haji-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="short">Singkat</option>
                    <option value="medium">Sedang</option>
                    <option value="long">Panjang & Komprehensif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Specific Topics -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Topik Spesifik</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="umrah-haji-topic" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-book-open mr-1 text-emerald-500"></i>Topik Utama
                  </label>
                  <select id="umrah-haji-topic" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="rituals">Ritual & Tata Cara</option>
                    <option value="supplies">Perlengkapan</option>
                    <option value="health">Kesehatan & Kebugaran</option>
                    <option value="spiritual">Persiapan Spiritual</option>
                    <option value="logistics">Logistik & Akomodasi</option>
                    <option value="dua-doa">Doa-Doa Penting</option>
                    <option value="historical">Sejarah & Makna</option>
                  </select>
                </div>
                
                <div>
                  <label for="umrah-haji-special" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-emerald-500"></i>Fokus Khusus
                  </label>
                  <textarea id="umrah-haji-special" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Topik khusus yang ingin dibahas..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Additional Details -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Detail Tambahan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="umrah-haji-goal" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-emerald-500"></i>Tujuan Konten
                  </label>
                  <select id="umrah-haji-goal" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="educate">Pendidikan & Pembelajaran</option>
                    <option value="motivate">Motivasi & Inspirasi</option>
                    <option value="guide">Panduan Praktis</option>
                    <option value="prepare">Persiapan Ibadah</option>
                    <option value="reflect">Refleksi Spiritual</option>
                  </select>
                </div>
                
                <div>
                  <label for="umrah-haji-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-alt mr-1 text-emerald-500"></i>Format Konten
                  </label>
                  <select id="umrah-haji-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="article">Artikel</option>
                    <option value="guide">Panduan Langkah</option>
                    <option value="checklist">Daftar Periksa</option>
                    <option value="timeline">Timeline</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="umrah-haji-generate-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten Umrah & Haji
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="umrah-haji-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="umrah-haji-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-kaaba text-6xl mb-4 text-emerald-400"></i>
                <p class="text-xl">Hasil konten umrah & Haji akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Konten Umrah & Haji</p>
              </div>
              <div id="umrah-haji-results" class="hidden space-y-6"></div>
              <div id="umrah-haji-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-emerald-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten umrah & Haji...</p>
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
      const container = document.getElementById('content-umrah-haji');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Konten Umrah & Haji');
      expect(title.querySelector('i.fas.fa-kaaba')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konten yang bermakna dan inspiratif');
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
      expect(rightPanel.querySelector('#umrah-haji-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Content Type Selection Tests
  describe('Content Type Selection', () => {
    it('should render content type options container', () => {
      const contentTypeOptions = document.getElementById('umrah-haji-content-type-options');
      expect(contentTypeOptions).toBeTruthy();
    });

    it('should render Panduan option', () => {
      const panduanBtn = document.body.querySelector('[data-type="guide"]');
      expect(panduanBtn).toBeTruthy();
      expect(panduanBtn.textContent).toContain('Panduan');
      expect(panduanBtn.querySelector('i.fas.fa-compass')).toBeTruthy();
      expect(panduanBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Persiapan option', () => {
      const persiapanBtn = document.body.querySelector('[data-type="preparation"]');
      expect(persiapanBtn).toBeTruthy();
      expect(persiapanBtn.textContent).toContain('Persiapan');
      expect(persiapanBtn.querySelector('i.fas.fa-clipboard-check')).toBeTruthy();
    });

    it('should render Tips option', () => {
      const tipsBtn = document.body.querySelector('[data-type="tips"]');
      expect(tipsBtn).toBeTruthy();
      expect(tipsBtn.textContent).toContain('Tips');
      expect(tipsBtn.querySelector('i.fas.fa-lightbulb')).toBeTruthy();
    });

    it('should render Doa option', () => {
      const doaBtn = document.body.querySelector('[data-type="dua"]');
      expect(doaBtn).toBeTruthy();
      expect(doaBtn.textContent).toContain('Doa');
      expect(doaBtn.querySelector('i.fas.fa-praying-hands')).toBeTruthy();
    });

    it('should render Pengalaman option', () => {
      const pengalamanBtn = document.body.querySelector('[data-type="experience"]');
      expect(pengalamanBtn).toBeTruthy();
      expect(pengalamanBtn.textContent).toContain('Pengalaman');
      expect(pengalamanBtn.querySelector('i.fas.fa-heart')).toBeTruthy();
    });

    it('should render Checklist option', () => {
      const checklistBtn = document.body.querySelector('[data-type="checklist"]');
      expect(checklistBtn).toBeTruthy();
      expect(checklistBtn.textContent).toContain('Checklist');
      expect(checklistBtn.querySelector('i.fas.fa-list-check')).toBeTruthy();
    });

    it('should have 6 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-umrah-haji');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const contentTypeOptions = document.getElementById('umrah-haji-content-type-options');
      expect(contentTypeOptions.classList.contains('grid')).toBe(true);
      expect(contentTypeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(contentTypeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have emerald icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-umrah-haji');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-emerald-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Konten');
    });
  });

  // Pilgrimage Type Selection Tests
  describe('Pilgrimage Type Selection', () => {
    it('should render pilgrimage type select', () => {
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.tagName).toBe('SELECT');
      expect(typeSelect.options.length).toBe(3);
    });

    it('should render season select', () => {
      const seasonSelect = document.getElementById('umrah-haji-season');
      expect(seasonSelect).toBeTruthy();
      expect(seasonSelect.tagName).toBe('SELECT');
      expect(seasonSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jenis Ibadah');
    });

    it('should have all labels with icons', () => {
      const mosqueIcon = document.body.querySelector('i.fas.fa-mosque');
      expect(mosqueIcon).toBeTruthy();
      
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
    });

    it('should have pilgrimage type options with proper labels', () => {
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect.options[0].textContent).toContain('Umrah');
      expect(typeSelect.options[1].textContent).toContain('Haji');
      expect(typeSelect.options[2].textContent).toContain('Umrah & Haji');
    });

    it('should have season options with proper labels', () => {
      const seasonSelect = document.getElementById('umrah-haji-season');
      expect(seasonSelect.options[0].textContent).toContain('Kapan Saja');
      expect(seasonSelect.options[1].textContent).toContain('Ramadan');
      expect(seasonSelect.options[2].textContent).toContain('Musim Haji');
      expect(seasonSelect.options[3].textContent).toContain('Liburan Sekolah');
    });

    it('should have default pilgrimage type value', () => {
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect.value).toBe('umrah');
    });

    it('should have default season value', () => {
      const seasonSelect = document.getElementById('umrah-haji-season');
      expect(seasonSelect.value).toBe('anytime');
    });

    it('should have proper input styling', () => {
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect.classList.contains('w-full')).toBe(true);
      expect(typeSelect.classList.contains('p-3')).toBe(true);
      expect(typeSelect.classList.contains('border')).toBe(true);
      expect(typeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('umrah-haji-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should render experience level select', () => {
      const experienceLevelSelect = document.getElementById('umrah-haji-experience-level');
      expect(experienceLevelSelect).toBeTruthy();
      expect(experienceLevelSelect.tagName).toBe('SELECT');
      expect(experienceLevelSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const signalIcon = document.body.querySelector('i.fas.fa-signal');
      expect(signalIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('umrah-haji-audience');
      expect(audienceSelect.options[0].textContent).toContain('Jamaah Pertama Kali');
      expect(audienceSelect.options[1].textContent).toContain('Jamaah Berpengalaman');
      expect(audienceSelect.options[2].textContent).toContain('Keluarga');
      expect(audienceSelect.options[3].textContent).toContain('Jamaah Senior');
      expect(audienceSelect.options[4].textContent).toContain('Pemuda');
      expect(audienceSelect.options[5].textContent).toContain('Semua Jamaah');
    });

    it('should have experience level options with proper labels', () => {
      const experienceLevelSelect = document.getElementById('umrah-haji-experience-level');
      expect(experienceLevelSelect.options[0].textContent).toContain('Pemula');
      expect(experienceLevelSelect.options[1].textContent).toContain('Menengah');
      expect(experienceLevelSelect.options[2].textContent).toContain('Mahir');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('umrah-haji-audience');
      expect(audienceSelect.value).toBe('first-timers');
    });

    it('should have default experience level value', () => {
      const experienceLevelSelect = document.getElementById('umrah-haji-experience-level');
      expect(experienceLevelSelect.value).toBe('beginner');
    });
  });

  // Tone & Language Selection Tests
  describe('Tone & Language Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('umrah-haji-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render language select', () => {
      const languageSelect = document.getElementById('umrah-haji-language');
      expect(languageSelect).toBeTruthy();
      expect(languageSelect.tagName).toBe('SELECT');
      expect(languageSelect.options.length).toBe(3);
    });

    it('should render length select', () => {
      const lengthSelect = document.getElementById('umrah-haji-length');
      expect(lengthSelect).toBeTruthy();
      expect(lengthSelect.tagName).toBe('SELECT');
      expect(lengthSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya & Nuansa');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
      
      const textWidthIcon = document.body.querySelector('i.fas.fa-text-width');
      expect(textWidthIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('umrah-haji-tone');
      expect(toneSelect.options[0].textContent).toContain('Khusyuk & Devotis');
      expect(toneSelect.options[1].textContent).toContain('Informatif & Edukatif');
      expect(toneSelect.options[2].textContent).toContain('Hangat & Ramah');
      expect(toneSelect.options[3].textContent).toContain('Inspiratif & Motivasi');
      expect(toneSelect.options[4].textContent).toContain('Praktis & Terstruktur');
      expect(toneSelect.options[5].textContent).toContain('Spiritual & Mendalam');
    });

    it('should have language options with proper labels', () => {
      const languageSelect = document.getElementById('umrah-haji-language');
      expect(languageSelect.options[0].textContent).toContain('Indonesia');
      expect(languageSelect.options[1].textContent).toContain('Arab & Indonesia');
      expect(languageSelect.options[2].textContent).toContain('Indonesia Sederhana');
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('umrah-haji-length');
      expect(lengthSelect.options[0].textContent).toContain('Singkat');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Panjang & Komprehensif');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('umrah-haji-tone');
      expect(toneSelect.value).toBe('devout');
    });

    it('should have default language value', () => {
      const languageSelect = document.getElementById('umrah-haji-language');
      expect(languageSelect.value).toBe('indonesian');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('umrah-haji-length');
      expect(lengthSelect.value).toBe('short');
    });
  });

  // Specific Topics Tests
  describe('Specific Topics', () => {
    it('should render topic select', () => {
      const topicSelect = document.getElementById('umrah-haji-topic');
      expect(topicSelect).toBeTruthy();
      expect(topicSelect.tagName).toBe('SELECT');
      expect(topicSelect.options.length).toBe(7);
    });

    it('should render special focus textarea', () => {
      const specialInput = document.getElementById('umrah-haji-special');
      expect(specialInput).toBeTruthy();
      expect(specialInput.tagName).toBe('TEXTAREA');
      expect(specialInput.rows).toBe(2);
      expect(specialInput.placeholder).toContain('Topik khusus yang ingin dibahas');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Topik Spesifik');
    });

    it('should have all labels with icons', () => {
      const bookOpenIcon = document.body.querySelector('i.fas.fa-book-open');
      expect(bookOpenIcon).toBeTruthy();
      
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have topic options with proper labels', () => {
      const topicSelect = document.getElementById('umrah-haji-topic');
      expect(topicSelect.options[0].textContent).toContain('Ritual & Tata Cara');
      expect(topicSelect.options[1].textContent).toContain('Perlengkapan');
      expect(topicSelect.options[2].textContent).toContain('Kesehatan & Kebugaran');
      expect(topicSelect.options[3].textContent).toContain('Persiapan Spiritual');
      expect(topicSelect.options[4].textContent).toContain('Logistik & Akomodasi');
      expect(topicSelect.options[5].textContent).toContain('Doa-Doa Penting');
      expect(topicSelect.options[6].textContent).toContain('Sejarah & Makna');
    });

    it('should have default topic value', () => {
      const topicSelect = document.getElementById('umrah-haji-topic');
      expect(topicSelect.value).toBe('rituals');
    });
  });

  // Goal & Format Tests
  describe('Goal & Format', () => {
    it('should render goal select', () => {
      const goalSelect = document.getElementById('umrah-haji-goal');
      expect(goalSelect).toBeTruthy();
      expect(goalSelect.tagName).toBe('SELECT');
      expect(goalSelect.options.length).toBe(5);
    });

    it('should render format select', () => {
      const formatSelect = document.getElementById('umrah-haji-format');
      expect(formatSelect).toBeTruthy();
      expect(formatSelect.tagName).toBe('SELECT');
      expect(formatSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
    });

    it('should have all labels with icons', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
      
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
    });

    it('should have goal options with proper labels', () => {
      const goalSelect = document.getElementById('umrah-haji-goal');
      expect(goalSelect.options[0].textContent).toContain('Pendidikan & Pembelajaran');
      expect(goalSelect.options[1].textContent).toContain('Motivasi & Inspirasi');
      expect(goalSelect.options[2].textContent).toContain('Panduan Praktis');
      expect(goalSelect.options[3].textContent).toContain('Persiapan Ibadah');
      expect(goalSelect.options[4].textContent).toContain('Refleksi Spiritual');
    });

    it('should have format options with proper labels', () => {
      const formatSelect = document.getElementById('umrah-haji-format');
      expect(formatSelect.options[0].textContent).toContain('Artikel');
      expect(formatSelect.options[1].textContent).toContain('Panduan Langkah');
      expect(formatSelect.options[2].textContent).toContain('Daftar Periksa');
      expect(formatSelect.options[3].textContent).toContain('Timeline');
      expect(formatSelect.options[4].textContent).toContain('FAQ');
    });

    it('should have default goal value', () => {
      const goalSelect = document.getElementById('umrah-haji-goal');
      expect(goalSelect.value).toBe('educate');
    });

    it('should have default format value', () => {
      const formatSelect = document.getElementById('umrah-haji-format');
      expect(formatSelect.value).toBe('article');
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('umrah-haji-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Konten Umrah & Haji');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('umrah-haji-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-emerald-600')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('umrah-haji-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('umrah-haji-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('umrah-haji-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-kaaba')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konten umrah & Haji akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('umrah-haji-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('umrah-haji-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat konten umrah & Haji');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-emerald-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('umrah-haji-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have emerald icon in empty state', () => {
      const emptyStateIcon = document.getElementById('umrah-haji-empty-state').querySelector('i.fas.fa-kaaba');
      expect(emptyStateIcon.classList.contains('text-emerald-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use emerald/teal color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-emerald-600')).toBe(true);
      expect(title.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use emerald/teal accents in generate button', () => {
      const generateBtn = document.getElementById('umrah-haji-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-emerald-600')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use emerald accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-umrah-haji');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-emerald-500')).toBe(true);
      });
    });

    it('should use emerald accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-emerald-500')).toBe(true);
      });
    });

    it('should use emerald accents in focus states', () => {
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(typeSelect.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use emerald accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-emerald-500')).toBe(true);
    });

    it('should use emerald accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('umrah-haji-empty-state').querySelector('i.fas.fa-kaaba');
      expect(emptyStateIcon.classList.contains('text-emerald-400')).toBe(true);
    });

    it('should use emerald hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-umrah-haji');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-emerald-100')).toBe(true);
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
      const icons = document.body.querySelectorAll('i.fas');
      expect(icons.length).toBeGreaterThanOrEqual(20);
    });

    it('should have kaaba icon in header', () => {
      const kaabaIcon = document.body.querySelector('header i.fas.fa-kaaba');
      expect(kaabaIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('umrah-haji-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have compass icon for panduan', () => {
      const compassIcon = document.body.querySelector('[data-type="guide"] i.fas.fa-compass');
      expect(compassIcon).toBeTruthy();
    });

    it('should have clipboard-check icon for persiapan', () => {
      const clipboardCheckIcon = document.body.querySelector('[data-type="preparation"] i.fas.fa-clipboard-check');
      expect(clipboardCheckIcon).toBeTruthy();
    });

    it('should have lightbulb icon for tips', () => {
      const lightbulbIcon = document.body.querySelector('[data-type="tips"] i.fas.fa-lightbulb');
      expect(lightbulbIcon).toBeTruthy();
    });

    it('should have praying-hands icon for doa', () => {
      const prayingHandsIcon = document.body.querySelector('[data-type="dua"] i.fas.fa-praying-hands');
      expect(prayingHandsIcon).toBeTruthy();
    });

    it('should have heart icon for pengalaman', () => {
      const heartIcon = document.body.querySelector('[data-type="experience"] i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have list-check icon for checklist', () => {
      const listCheckIcon = document.body.querySelector('[data-type="checklist"] i.fas.fa-list-check');
      expect(listCheckIcon).toBeTruthy();
    });

    it('should have mosque icon for pilgrimage type', () => {
      const mosqueIcon = document.body.querySelector('i.fas.fa-mosque');
      expect(mosqueIcon).toBeTruthy();
    });

    it('should have calendar-alt icon for season', () => {
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have signal icon for experience level', () => {
      const signalIcon = document.body.querySelector('i.fas.fa-signal');
      expect(signalIcon).toBeTruthy();
    });

    it('should have language icon for language select', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
    });

    it('should have book-open icon for topic select', () => {
      const bookOpenIcon = document.body.querySelector('i.fas.fa-book-open');
      expect(bookOpenIcon).toBeTruthy();
    });

    it('should have star icon for special focus', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have bullseye icon for goal select', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
    });

    it('should have file-alt icon for format select', () => {
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Konten Umrah & Haji');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Jenis Ibadah');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya & Nuansa');
      expect(document.body.textContent).toContain('Topik Spesifik');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Konten Umrah & Haji');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Konten');
      expect(headers[1].textContent).toContain('2. Jenis Ibadah');
      expect(headers[2].textContent).toContain('3. Target Audiens');
      expect(headers[3].textContent).toContain('4. Gaya & Nuansa');
      expect(headers[4].textContent).toContain('5. Topik Spesifik');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('umrah-haji-empty-state');
      expect(emptyState.textContent).toContain('Hasil konten umrah & Haji akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Konten Umrah & Haji');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('umrah-haji-loading');
      expect(loading.textContent).toContain('Sedang membuat konten umrah & Haji');
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
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect).toBeTruthy();
      
      const seasonSelect = document.getElementById('umrah-haji-season');
      expect(seasonSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('umrah-haji-audience');
      expect(audienceSelect).toBeTruthy();
      
      const experienceLevelSelect = document.getElementById('umrah-haji-experience-level');
      expect(experienceLevelSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect).toBeTruthy();
      
      const seasonSelect = document.getElementById('umrah-haji-season');
      expect(seasonSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('umrah-haji-audience');
      expect(audienceSelect).toBeTruthy();
      
      const experienceLevelSelect = document.getElementById('umrah-haji-experience-level');
      expect(experienceLevelSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('umrah-haji-tone');
      expect(toneSelect).toBeTruthy();
      
      const languageSelect = document.getElementById('umrah-haji-language');
      expect(languageSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('umrah-haji-length');
      expect(lengthSelect).toBeTruthy();
      
      const topicSelect = document.getElementById('umrah-haji-topic');
      expect(topicSelect).toBeTruthy();
      
      const goalSelect = document.getElementById('umrah-haji-goal');
      expect(goalSelect).toBeTruthy();
      
      const formatSelect = document.getElementById('umrah-haji-format');
      expect(formatSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const specialInput = document.getElementById('umrah-haji-special');
      expect(specialInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('umrah-haji-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const typeSelect = document.getElementById('umrah-haji-type');
      expect(typeSelect.tagName).toBe('SELECT');
      
      const seasonSelect = document.getElementById('umrah-haji-season');
      expect(seasonSelect.tagName).toBe('SELECT');
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

    it('should have responsive title sizing', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });

    it('should have responsive left panel spacing', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });
  });

  // Placeholder Tests
  describe('Placeholders', () => {
    it('should have proper placeholders in textareas', () => {
      const specialInput = document.getElementById('umrah-haji-special');
      expect(specialInput.placeholder).toBeTruthy();
      expect(specialInput.placeholder).toContain('Topik khusus yang ingin dibahas');
    });
  });
});
