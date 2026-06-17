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

describe('family Component', () => {
  
  const mockComponentHTML = `
    <div id="content-family" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            <i class="fas fa-users mr-3"></i>Konten Keluarga
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten yang hangat dan bermakna untuk keluarga</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Konten</h2>
              <div id="family-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="activities" class="type-btn-family p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-child text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Aktivitas</span>
                </button>
                <button type="button" data-type="parenting" class="type-btn-family p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-hands-helping text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Parenting</span>
                </button>
                <button type="button" data-type="events" class="type-btn-family p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-birthday-cake text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Acara</span>
                </button>
                <button type="button" data-type="tips" class="type-btn-family p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-lightbulb text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Tips</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Topic & Niche -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Topik & Niche</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="family-topic" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-amber-500"></i>Topik Utama
                  </label>
                  <input type="text" id="family-topic" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Contoh: Aktivitas akhir pekan bersama keluarga">
                </div>
                
                <div>
                  <label for="family-niche" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-folder mr-1 text-amber-500"></i>Niche Spesifik
                  </label>
                  <input type="text" id="family-niche" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Contoh: Edukasi anak usia dini">
                </div>
                
                <div>
                  <label for="family-keywords" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-key mr-1 text-amber-500"></i>Kata Kunci
                  </label>
                  <input type="text" id="family-keywords" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Contoh: keluarga bahagia, quality time, bonding">
                </div>
              </div>
            </div>
            
            <!-- Step 3: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="family-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-amber-500"></i>Target Audiens
                  </label>
                  <select id="family-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="parents">Orang Tua (Ibu/Bapak)</option>
                    <option value="expecting">Calon Orang Tua</option>
                    <option value="grandparents">Kakek/Nenek</option>
                    <option value="siblings">Saudara Kandung</option>
                    <option value="extended">Keluarga Besar</option>
                    <option value="all">Semua Anggota Keluarga</option>
                  </select>
                </div>
                
                <div>
                  <label for="family-age-group" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-baby-carriage mr-1 text-amber-500"></i>Target Usia Anak
                  </label>
                  <select id="family-age-group" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="all">Semua Usia</option>
                    <option value="0-3">Bayi (0-3 tahun)</option>
                    <option value="4-6">Balita (4-6 tahun)</option>
                    <option value="7-12">Anak-anak (7-12 tahun)</option>
                    <option value="13-18">Remaja (13-18 tahun)</option>
                  </select>
                </div>
                
                <div>
                  <label for="family-interests" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-amber-500"></i>Minat Audiens
                  </label>
                  <textarea id="family-interests" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Apa yang menarik bagi audiens Anda?"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Tone & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya & Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="family-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-amber-500"></i>Tone Konten
                  </label>
                  <select id="family-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="warm">Hangat & Ramah</option>
                    <option value="fun">Seru & Menyenangkan</option>
                    <option value="educational">Edukatif & Informatif</option>
                    <option value="inspirational">Inspiratif & Memotivasi</option>
                    <option value="humorous">Lucu & Humoris</option>
                  </select>
                </div>
                
                <div>
                  <label for="family-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-amber-500"></i>Gaya Penulisan
                  </label>
                  <select id="family-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="casual">Santai & Gaul</option>
                    <option value="formal">Formal & Profesional</option>
                    <option value="storytelling">Cerita & Naratif</option>
                    <option value="stepbystep">Langkah demi Langkah</option>
                  </select>
                </div>
                
                <div>
                  <label for="family-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-amber-500"></i>Panjang Konten
                  </label>
                  <select id="family-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="short">Pendek (1-2 paragraf)</option>
                    <option value="medium">Sedang (3-5 paragraf)</option>
                    <option value="long">Panjang (artikel lengkap)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Additional Details -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Detail Tambahan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="family-goals" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-amber-500"></i>Tujuan Konten
                  </label>
                  <textarea id="family-goals" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Apa tujuan Anda membuat konten ini?"></textarea>
                </div>
                
                <div>
                  <label for="family-cta" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mouse-pointer mr-1 text-amber-500"></i>Call to Action
                  </label>
                  <input type="text" id="family-cta" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Contoh: Bagikan pengalaman Anda di kolom komentar!">
                </div>
              </div>
            </div>
            
            <!-- Step 6: Generate Button -->
            <button id="family-generate-btn" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten Keluarga
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="family-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="family-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-users text-6xl mb-4 text-amber-400"></i>
                <p class="text-xl">Hasil konten keluarga akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Konten Keluarga</p>
              </div>
              <div id="family-results" class="hidden space-y-6"></div>
              <div id="family-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-amber-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten keluarga...</p>
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
      const container = document.getElementById('content-family');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Konten Keluarga');
      expect(title.querySelector('i.fas.fa-users')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konten yang hangat dan bermakna');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(5);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#family-results-container')).toBeTruthy();
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
    it('should render type options container', () => {
      const typeOptions = document.getElementById('family-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Aktivitas option', () => {
      const activitiesBtn = document.body.querySelector('[data-type="activities"]');
      expect(activitiesBtn).toBeTruthy();
      expect(activitiesBtn.textContent).toContain('Aktivitas');
      expect(activitiesBtn.querySelector('i.fas.fa-child')).toBeTruthy();
      expect(activitiesBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Parenting option', () => {
      const parentingBtn = document.body.querySelector('[data-type="parenting"]');
      expect(parentingBtn).toBeTruthy();
      expect(parentingBtn.textContent).toContain('Parenting');
      expect(parentingBtn.querySelector('i.fas.fa-hands-helping')).toBeTruthy();
    });

    it('should render Acara option', () => {
      const eventsBtn = document.body.querySelector('[data-type="events"]');
      expect(eventsBtn).toBeTruthy();
      expect(eventsBtn.textContent).toContain('Acara');
      expect(eventsBtn.querySelector('i.fas.fa-birthday-cake')).toBeTruthy();
    });

    it('should render Tips option', () => {
      const tipsBtn = document.body.querySelector('[data-type="tips"]');
      expect(tipsBtn).toBeTruthy();
      expect(tipsBtn.textContent).toContain('Tips');
      expect(tipsBtn.querySelector('i.fas.fa-lightbulb')).toBeTruthy();
    });

    it('should have 4 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-family');
      expect(typeBtns.length).toBe(4);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('family-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have amber icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-family');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-amber-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Konten');
    });
  });

  // Topic & Niche Input Tests
  describe('Topic & Niche Input', () => {
    it('should render topic input', () => {
      const topicInput = document.getElementById('family-topic');
      expect(topicInput).toBeTruthy();
      expect(topicInput.type).toBe('text');
      expect(topicInput.placeholder).toContain('Aktivitas akhir pekan');
    });

    it('should render niche input', () => {
      const nicheInput = document.getElementById('family-niche');
      expect(nicheInput).toBeTruthy();
      expect(nicheInput.type).toBe('text');
      expect(nicheInput.placeholder).toContain('Edukasi anak usia dini');
    });

    it('should render keywords input', () => {
      const keywordsInput = document.getElementById('family-keywords');
      expect(keywordsInput).toBeTruthy();
      expect(keywordsInput.type).toBe('text');
      expect(keywordsInput.placeholder).toContain('keluarga bahagia');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Topik & Niche');
    });

    it('should have all labels with icons', () => {
      const tagIcon = document.body.querySelector('i.fas.fa-tag');
      expect(tagIcon).toBeTruthy();
      
      const folderIcon = document.body.querySelector('i.fas.fa-folder');
      expect(folderIcon).toBeTruthy();
      
      const keyIcon = document.body.querySelector('i.fas.fa-key');
      expect(keyIcon).toBeTruthy();
    });

    it('should have proper input styling', () => {
      const topicInput = document.getElementById('family-topic');
      expect(topicInput.classList.contains('w-full')).toBe(true);
      expect(topicInput.classList.contains('p-3')).toBe(true);
      expect(topicInput.classList.contains('border')).toBe(true);
      expect(topicInput.classList.contains('rounded-lg')).toBe(true);
      expect(topicInput.classList.contains('focus:ring-2')).toBe(true);
      expect(topicInput.classList.contains('focus:ring-amber-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('family-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should render age group select', () => {
      const ageGroupSelect = document.getElementById('family-age-group');
      expect(ageGroupSelect).toBeTruthy();
      expect(ageGroupSelect.tagName).toBe('SELECT');
      expect(ageGroupSelect.options.length).toBe(5);
    });

    it('should render interests textarea', () => {
      const interestsInput = document.getElementById('family-interests');
      expect(interestsInput).toBeTruthy();
      expect(interestsInput.tagName).toBe('TEXTAREA');
      expect(interestsInput.rows).toBe(2);
      expect(interestsInput.placeholder).toContain('menarik bagi audiens');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const babyCarriageIcon = document.body.querySelector('i.fas.fa-baby-carriage');
      expect(babyCarriageIcon).toBeTruthy();
      
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('family-audience');
      expect(audienceSelect.options[0].textContent).toContain('Orang Tua');
      expect(audienceSelect.options[1].textContent).toContain('Calon Orang Tua');
      expect(audienceSelect.options[2].textContent).toContain('Kakek/Nenek');
      expect(audienceSelect.options[3].textContent).toContain('Saudara Kandung');
      expect(audienceSelect.options[4].textContent).toContain('Keluarga Besar');
      expect(audienceSelect.options[5].textContent).toContain('Semua Anggota');
    });

    it('should have age group options with proper labels', () => {
      const ageGroupSelect = document.getElementById('family-age-group');
      expect(ageGroupSelect.options[0].textContent).toContain('Semua Usia');
      expect(ageGroupSelect.options[1].textContent).toContain('Bayi');
      expect(ageGroupSelect.options[2].textContent).toContain('Balita');
      expect(ageGroupSelect.options[3].textContent).toContain('Anak-anak');
      expect(ageGroupSelect.options[4].textContent).toContain('Remaja');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('family-audience');
      expect(audienceSelect.value).toBe('parents');
    });

    it('should have default age group value', () => {
      const ageGroupSelect = document.getElementById('family-age-group');
      expect(ageGroupSelect.value).toBe('all');
    });
  });

  // Tone & Style Selection Tests
  describe('Tone & Style Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('family-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(5);
    });

    it('should render style select', () => {
      const styleSelect = document.getElementById('family-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(4);
    });

    it('should render length select', () => {
      const lengthSelect = document.getElementById('family-length');
      expect(lengthSelect).toBeTruthy();
      expect(lengthSelect.tagName).toBe('SELECT');
      expect(lengthSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya & Nuansa');
    });

    it('should have all labels with icons', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
      
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
      
      const textWidthIcon = document.body.querySelector('i.fas.fa-text-width');
      expect(textWidthIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('family-tone');
      expect(toneSelect.options[0].textContent).toContain('Hangat & Ramah');
      expect(toneSelect.options[1].textContent).toContain('Seru & Menyenangkan');
      expect(toneSelect.options[2].textContent).toContain('Edukatif');
      expect(toneSelect.options[3].textContent).toContain('Inspiratif');
      expect(toneSelect.options[4].textContent).toContain('Lucu & Humoris');
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('family-style');
      expect(styleSelect.options[0].textContent).toContain('Santai & Gaul');
      expect(styleSelect.options[1].textContent).toContain('Formal');
      expect(styleSelect.options[2].textContent).toContain('Cerita');
      expect(styleSelect.options[3].textContent).toContain('Langkah demi Langkah');
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('family-length');
      expect(lengthSelect.options[0].textContent).toContain('Pendek');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Panjang');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('family-tone');
      expect(toneSelect.value).toBe('warm');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('family-style');
      expect(styleSelect.value).toBe('casual');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('family-length');
      expect(lengthSelect.value).toBe('short');
    });
  });

  // Additional Details Tests
  describe('Additional Details', () => {
    it('should render goals textarea', () => {
      const goalsInput = document.getElementById('family-goals');
      expect(goalsInput).toBeTruthy();
      expect(goalsInput.tagName).toBe('TEXTAREA');
      expect(goalsInput.rows).toBe(2);
      expect(goalsInput.placeholder).toContain('tujuan Anda membuat konten');
    });

    it('should render CTA input', () => {
      const ctaInput = document.getElementById('family-cta');
      expect(ctaInput).toBeTruthy();
      expect(ctaInput.type).toBe('text');
      expect(ctaInput.placeholder).toContain('Bagikan pengalaman Anda');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Detail Tambahan');
    });

    it('should have all labels with icons', () => {
      const bullseyeIcon = document.body.querySelector('i.fas.fa-bullseye');
      expect(bullseyeIcon).toBeTruthy();
      
      const mousePointerIcon = document.body.querySelector('i.fas.fa-mouse-pointer');
      expect(mousePointerIcon).toBeTruthy();
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('family-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Konten Keluarga');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('family-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('to-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('family-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('family-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('family-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-users')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konten keluarga akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('family-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('family-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat konten keluarga');
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
      const emptyState = document.getElementById('family-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have amber icon in empty state', () => {
      const emptyStateIcon = document.getElementById('family-empty-state').querySelector('i.fas.fa-users');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use amber/orange color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-amber-500')).toBe(true);
      expect(title.classList.contains('to-orange-500')).toBe(true);
    });

    it('should use amber/orange accents in generate button', () => {
      const generateBtn = document.getElementById('family-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('to-orange-500')).toBe(true);
    });

    it('should use amber accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-family');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-amber-500')).toBe(true);
      });
    });

    it('should use amber accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-amber-500')).toBe(true);
      });
    });

    it('should use amber accents in focus states', () => {
      const topicInput = document.getElementById('family-topic');
      expect(topicInput.classList.contains('focus:ring-amber-500')).toBe(true);
      expect(topicInput.classList.contains('focus:border-amber-500')).toBe(true);
    });

    it('should use amber accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-amber-500')).toBe(true);
    });

    it('should use amber accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('family-empty-state').querySelector('i.fas.fa-users');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(6);
      
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
      expect(icons.length).toBeGreaterThan(15);
    });

    it('should have users icon in header', () => {
      const usersIcon = document.body.querySelector('header i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('family-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have child icon for activities', () => {
      const childIcon = document.body.querySelector('[data-type="activities"] i.fas.fa-child');
      expect(childIcon).toBeTruthy();
    });

    it('should have hands-helping icon for parenting', () => {
      const handsIcon = document.body.querySelector('[data-type="parenting"] i.fas.fa-hands-helping');
      expect(handsIcon).toBeTruthy();
    });

    it('should have birthday-cake icon for events', () => {
      const cakeIcon = document.body.querySelector('[data-type="events"] i.fas.fa-birthday-cake');
      expect(cakeIcon).toBeTruthy();
    });

    it('should have lightbulb icon for tips', () => {
      const bulbIcon = document.body.querySelector('[data-type="tips"] i.fas.fa-lightbulb');
      expect(bulbIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Konten Keluarga');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Topik & Niche');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya & Nuansa');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Konten Keluarga');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(5);
      expect(headers[0].textContent).toContain('1. Jenis Konten');
      expect(headers[1].textContent).toContain('2. Topik & Niche');
      expect(headers[2].textContent).toContain('3. Target Audiens');
      expect(headers[3].textContent).toContain('4. Gaya & Nuansa');
      expect(headers[4].textContent).toContain('5. Detail Tambahan');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(5);
    });

    it('should have labeled form inputs', () => {
      const topicInput = document.getElementById('family-topic');
      expect(topicInput).toBeTruthy();
      
      const nicheInput = document.getElementById('family-niche');
      expect(nicheInput).toBeTruthy();
      
      const keywordsInput = document.getElementById('family-keywords');
      expect(keywordsInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const audienceSelect = document.getElementById('family-audience');
      expect(audienceSelect).toBeTruthy();
      
      const ageGroupSelect = document.getElementById('family-age-group');
      expect(ageGroupSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('family-tone');
      expect(toneSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('family-style');
      expect(styleSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('family-length');
      expect(lengthSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const interestsInput = document.getElementById('family-interests');
      expect(interestsInput).toBeTruthy();
      
      const goalsInput = document.getElementById('family-goals');
      expect(goalsInput).toBeTruthy();
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
  });

  // Placeholder Tests
  describe('Placeholders', () => {
    it('should have proper placeholders in text inputs', () => {
      const topicInput = document.getElementById('family-topic');
      expect(topicInput.placeholder).toBeTruthy();
      
      const nicheInput = document.getElementById('family-niche');
      expect(nicheInput.placeholder).toBeTruthy();
      
      const keywordsInput = document.getElementById('family-keywords');
      expect(keywordsInput.placeholder).toBeTruthy();
      
      const ctaInput = document.getElementById('family-cta');
      expect(ctaInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const interestsInput = document.getElementById('family-interests');
      expect(interestsInput.placeholder).toBeTruthy();
      
      const goalsInput = document.getElementById('family-goals');
      expect(goalsInput.placeholder).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('family-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('family-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have proper input types', () => {
      const topicInput = document.getElementById('family-topic');
      expect(topicInput.type).toBe('text');
      
      const nicheInput = document.getElementById('family-niche');
      expect(nicheInput.type).toBe('text');
      
      const keywordsInput = document.getElementById('family-keywords');
      expect(keywordsInput.type).toBe('text');
      
      const ctaInput = document.getElementById('family-cta');
      expect(ctaInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const interestsInput = document.getElementById('family-interests');
      expect(interestsInput.rows).toBe(2);
      
      const goalsInput = document.getElementById('family-goals');
      expect(goalsInput.rows).toBe(2);
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have proper spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper results container styling', () => {
      const resultsContainer = document.getElementById('family-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      const topicCard = document.body.querySelectorAll('.card')[1];
      const spaceDiv = topicCard.querySelector('.space-y-4');
      expect(spaceDiv).toBeTruthy();
    });
  });

  // Additional UI Elements Tests
  describe('Additional UI Elements', () => {
    it('should have proper section numbering', () => {
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements[0].textContent).toContain('1.');
      expect(h2Elements[1].textContent).toContain('2.');
      expect(h2Elements[2].textContent).toContain('3.');
      expect(h2Elements[3].textContent).toContain('4.');
      expect(h2Elements[4].textContent).toContain('5.');
    });

    it('should have proper spacing between sections', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const cards = leftPanel.querySelectorAll('.card');
      expect(cards.length).toBe(5);
    });

    it('should have proper results area structure', () => {
      const resultsContainer = document.getElementById('family-results-container');
      expect(resultsContainer.querySelector('#family-empty-state')).toBeTruthy();
      expect(resultsContainer.querySelector('#family-results')).toBeTruthy();
      expect(resultsContainer.querySelector('#family-loading')).toBeTruthy();
    });
  });

  // Input Group Tests
  describe('Input Groups', () => {
    it('should have proper label styling', () => {
      const formLabels = [
        document.getElementById('family-topic')?.closest('div').querySelector('label'),
        document.getElementById('family-niche')?.closest('div').querySelector('label'),
        document.getElementById('family-keywords')?.closest('div').querySelector('label')
      ].filter(Boolean);
      
      formLabels.forEach(label => {
        expect(label.classList.contains('block')).toBe(true);
        expect(label.classList.contains('text-sm')).toBe(true);
        expect(label.classList.contains('font-medium')).toBe(true);
      });
    });

    it('should have proper input styling', () => {
      const inputs = document.body.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        expect(input.classList.contains('w-full')).toBe(true);
        expect(input.classList.contains('p-3')).toBe(true);
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
      });
    });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-amber-500')).toBe(true);
      expect(loader.classList.contains('h-12')).toBe(true);
      expect(loader.classList.contains('w-12')).toBe(true);
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('family-loading');
      expect(loading.textContent).toContain('Sedang membuat konten keluarga');
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have proper empty state icon', () => {
      const emptyState = document.getElementById('family-empty-state');
      expect(emptyState.querySelector('i.fas.fa-users')).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-users').classList.contains('text-amber-400')).toBe(true);
      expect(emptyState.querySelector('i.fas.fa-users').classList.contains('text-6xl')).toBe(true);
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('family-empty-state');
      expect(emptyState.textContent).toContain('Hasil konten keluarga akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Konten Keluarga');
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('family-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
      expect(emptyState.classList.contains('text-gray-500')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have all required elements for functionality', () => {
      // Content type elements
      expect(document.getElementById('family-type-options')).toBeTruthy();
      
      // Topic & niche elements
      expect(document.getElementById('family-topic')).toBeTruthy();
      expect(document.getElementById('family-niche')).toBeTruthy();
      expect(document.getElementById('family-keywords')).toBeTruthy();
      
      // Target audience elements
      expect(document.getElementById('family-audience')).toBeTruthy();
      expect(document.getElementById('family-age-group')).toBeTruthy();
      expect(document.getElementById('family-interests')).toBeTruthy();
      
      // Tone & style elements
      expect(document.getElementById('family-tone')).toBeTruthy();
      expect(document.getElementById('family-style')).toBeTruthy();
      expect(document.getElementById('family-length')).toBeTruthy();
      
      // Additional details elements
      expect(document.getElementById('family-goals')).toBeTruthy();
      expect(document.getElementById('family-cta')).toBeTruthy();
      
      // Generate button
      expect(document.getElementById('family-generate-btn')).toBeTruthy();
      
      // Results elements
      expect(document.getElementById('family-results')).toBeTruthy();
      expect(document.getElementById('family-empty-state')).toBeTruthy();
      expect(document.getElementById('family-loading')).toBeTruthy();
    });

    it('should have proper data attributes for content types', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-family');
      typeBtns.forEach(btn => {
        expect(btn.dataset.type).toBeTruthy();
      });
    });

    it('should have selected state on Aktivitas by default', () => {
      const activitiesBtn = document.body.querySelector('[data-type="activities"]');
      expect(activitiesBtn.dataset.selected).toBe('true');
      expect(activitiesBtn.classList.contains('selected')).toBe(true);
    });
  });
});
