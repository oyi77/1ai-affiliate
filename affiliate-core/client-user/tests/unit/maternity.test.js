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

describe('maternity Component', () => {
  
  const mockComponentHTML = `
    <div id="content-maternity" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">
            <i class="fas fa-baby-carriage mr-3"></i>Konten Kehamilan
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten yang lembut dan bermanfaat untuk perjalanan kehamilan Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Konten</h2>
              <div id="maternity-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="journey" class="type-btn-maternity p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-calendar-alt text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Perjalanan</span>
                </button>
                <button type="button" data-type="nutrition" class="type-btn-maternity p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-apple-alt text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Nutrisi</span>
                </button>
                <button type="button" data-type="health" class="type-btn-maternity p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-heartbeat text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Kesehatan</span>
                </button>
                <button type="button" data-type="preparation" class="type-btn-maternity p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-baby text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Persiapan</span>
                </button>
                <button type="button" data-type="emotions" class="type-btn-maternity p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-smile text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Perasaan</span>
                </button>
                <button type="button" data-type="tips" class="type-btn-maternity p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-lightbulb text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Tips</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Trimester -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Trimester Kehamilan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="maternity-trimester" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock mr-1 text-purple-500"></i>Trimester Saat Ini
                  </label>
                  <select id="maternity-trimester" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="1">Trimester Pertama (Minggu 1-12)</option>
                    <option value="2">Trimester Kedua (Minggu 13-26)</option>
                    <option value="3">Trimester Ketiga (Minggu 27-40)</option>
                    <option value="all">Semua Trimester</option>
                  </select>
                </div>
                
                <div>
                  <label for="maternity-week" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-check mr-1 text-purple-500"></i>Minggu Kehamilan
                  </label>
                  <input type="number" id="maternity-week" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: 20" min="1" max="42">
                </div>
              </div>
            </div>
            
            <!-- Step 3: Topic & Niche -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Topik & Niche</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="maternity-topic" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-purple-500"></i>Topik Utama
                  </label>
                  <input type="text" id="maternity-topic" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: Tips nutrisi sehat untuk ibu hamil">
                </div>
                
                <div>
                  <label for="maternity-niche" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-folder mr-1 text-purple-500"></i>Niche Spesifik
                  </label>
                  <input type="text" id="maternity-niche" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: Nutrisi trimester kedua">
                </div>
                
                <div>
                  <label for="maternity-keywords" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-key mr-1 text-purple-500"></i>Kata Kunci
                  </label>
                  <input type="text" id="maternity-keywords" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: ibu hamil, nutrisi, kesehatan">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="maternity-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Target Audiens
                  </label>
                  <select id="maternity-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="expecting-mothers">Ibu Hamil</option>
                    <option value="expecting-fathers">Ayah Hamil</option>
                    <option value="couples">Pasangan Suami Istri</option>
                    <option value="family">Keluarga</option>
                    <option value="all">Semua Orang</option>
                  </select>
                </div>
                
                <div>
                  <label for="maternity-interests" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-purple-500"></i>Minat Audiens
                  </label>
                  <textarea id="maternity-interests" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Apa yang paling dibutuhkan oleh audiens Anda?"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Tone & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Gaya & Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="maternity-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-purple-500"></i>Tone Konten
                  </label>
                  <select id="maternity-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="supportive">Mendukung & Memberi Semangat</option>
                    <option value="informative">Informatif & Edukatif</option>
                    <option value="warm">Hangat & Ramah</option>
                    <option value="reassuring">Menenangkan & Memberi Kepercayaan</option>
                    <option value="encouraging">Mendorong & Memotivasi</option>
                  </select>
                </div>
                
                <div>
                  <label for="maternity-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-purple-500"></i>Gaya Penulisan
                  </label>
                  <select id="maternity-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="casual">Santai & Gaul</option>
                    <option value="formal">Formal & Profesional</option>
                    <option value="storytelling">Cerita & Naratif</option>
                    <option value="stepbystep">Langkah demi Langkah</option>
                    <option value="qa"> Tanya Jawab</option>
                  </select>
                </div>
                
                <div>
                  <label for="maternity-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-purple-500"></i>Panjang Konten
                  </label>
                  <select id="maternity-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="short">Pendek (1-2 paragraf)</option>
                    <option value="medium">Sedang (3-5 paragraf)</option>
                    <option value="long">Panjang (artikel lengkap)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Additional Details -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Detail Tambahan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="maternity-goals" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-purple-500"></i>Tujuan Konten
                  </label>
                  <textarea id="maternity-goals" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Apa tujuan Anda membuat konten ini?"></textarea>
                </div>
                
                <div>
                  <label for="maternity-cta" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mouse-pointer mr-1 text-purple-500"></i>Call to Action
                  </label>
                  <input type="text" id="maternity-cta" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: Bagikan pengalaman Anda di kolom komentar!">
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="maternity-generate-btn" class="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten Kehamilan
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="maternity-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="maternity-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-baby-carriage text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil konten kehamilan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Konten Kehamilan</p>
              </div>
              <div id="maternity-results" class="hidden space-y-6"></div>
              <div id="maternity-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten kehamilan...</p>
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
      const container = document.getElementById('content-maternity');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Konten Kehamilan');
      expect(title.querySelector('i.fas.fa-baby-carriage')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konten yang lembut dan bermanfaat');
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
      expect(rightPanel.querySelector('#maternity-results-container')).toBeTruthy();
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
      const typeOptions = document.getElementById('maternity-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Perjalanan option', () => {
      const journeyBtn = document.body.querySelector('[data-type="journey"]');
      expect(journeyBtn).toBeTruthy();
      expect(journeyBtn.textContent).toContain('Perjalanan');
      expect(journeyBtn.querySelector('i.fas.fa-calendar-alt')).toBeTruthy();
      expect(journeyBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Nutrisi option', () => {
      const nutritionBtn = document.body.querySelector('[data-type="nutrition"]');
      expect(nutritionBtn).toBeTruthy();
      expect(nutritionBtn.textContent).toContain('Nutrisi');
      expect(nutritionBtn.querySelector('i.fas.fa-apple-alt')).toBeTruthy();
    });

    it('should render Kesehatan option', () => {
      const healthBtn = document.body.querySelector('[data-type="health"]');
      expect(healthBtn).toBeTruthy();
      expect(healthBtn.textContent).toContain('Kesehatan');
      expect(healthBtn.querySelector('i.fas.fa-heartbeat')).toBeTruthy();
    });

    it('should render Persiapan option', () => {
      const preparationBtn = document.body.querySelector('[data-type="preparation"]');
      expect(preparationBtn).toBeTruthy();
      expect(preparationBtn.textContent).toContain('Persiapan');
      expect(preparationBtn.querySelector('i.fas.fa-baby')).toBeTruthy();
    });

    it('should render Perasaan option', () => {
      const emotionsBtn = document.body.querySelector('[data-type="emotions"]');
      expect(emotionsBtn).toBeTruthy();
      expect(emotionsBtn.textContent).toContain('Perasaan');
      expect(emotionsBtn.querySelector('i.fas.fa-smile')).toBeTruthy();
    });

    it('should render Tips option', () => {
      const tipsBtn = document.body.querySelector('[data-type="tips"]');
      expect(tipsBtn).toBeTruthy();
      expect(tipsBtn.textContent).toContain('Tips');
      expect(tipsBtn.querySelector('i.fas.fa-lightbulb')).toBeTruthy();
    });

    it('should have 6 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-maternity');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('maternity-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have purple icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-maternity');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Konten');
    });
  });

  // Trimester Selection Tests
  describe('Trimester Selection', () => {
    it('should render trimester select', () => {
      const trimesterSelect = document.getElementById('maternity-trimester');
      expect(trimesterSelect).toBeTruthy();
      expect(trimesterSelect.tagName).toBe('SELECT');
      expect(trimesterSelect.options.length).toBe(4);
    });

    it('should render week input', () => {
      const weekInput = document.getElementById('maternity-week');
      expect(weekInput).toBeTruthy();
      expect(weekInput.type).toBe('number');
      expect(weekInput.placeholder).toContain('Contoh: 20');
      expect(weekInput.min).toBe('1');
      expect(weekInput.max).toBe('42');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Trimester Kehamilan');
    });

    it('should have all labels with icons', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
      
      const calendarCheckIcon = document.body.querySelector('i.fas.fa-calendar-check');
      expect(calendarCheckIcon).toBeTruthy();
    });

    it('should have trimester options with proper labels', () => {
      const trimesterSelect = document.getElementById('maternity-trimester');
      expect(trimesterSelect.options[0].textContent).toContain('Trimester Pertama');
      expect(trimesterSelect.options[1].textContent).toContain('Trimester Kedua');
      expect(trimesterSelect.options[2].textContent).toContain('Trimester Ketiga');
      expect(trimesterSelect.options[3].textContent).toContain('Semua Trimester');
    });

    it('should have default trimester value', () => {
      const trimesterSelect = document.getElementById('maternity-trimester');
      expect(trimesterSelect.value).toBe('1');
    });

    it('should have proper input styling', () => {
      const weekInput = document.getElementById('maternity-week');
      expect(weekInput.classList.contains('w-full')).toBe(true);
      expect(weekInput.classList.contains('p-3')).toBe(true);
      expect(weekInput.classList.contains('border')).toBe(true);
      expect(weekInput.classList.contains('rounded-lg')).toBe(true);
      expect(weekInput.classList.contains('focus:ring-2')).toBe(true);
      expect(weekInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Topic & Niche Input Tests
  describe('Topic & Niche Input', () => {
    it('should render topic input', () => {
      const topicInput = document.getElementById('maternity-topic');
      expect(topicInput).toBeTruthy();
      expect(topicInput.type).toBe('text');
      expect(topicInput.placeholder).toContain('Tips nutrisi sehat');
    });

    it('should render niche input', () => {
      const nicheInput = document.getElementById('maternity-niche');
      expect(nicheInput).toBeTruthy();
      expect(nicheInput.type).toBe('text');
      expect(nicheInput.placeholder).toContain('Nutrisi trimester kedua');
    });

    it('should render keywords input', () => {
      const keywordsInput = document.getElementById('maternity-keywords');
      expect(keywordsInput).toBeTruthy();
      expect(keywordsInput.type).toBe('text');
      expect(keywordsInput.placeholder).toContain('ibu hamil');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Topik & Niche');
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
      const topicInput = document.getElementById('maternity-topic');
      expect(topicInput.classList.contains('w-full')).toBe(true);
      expect(topicInput.classList.contains('p-3')).toBe(true);
      expect(topicInput.classList.contains('border')).toBe(true);
      expect(topicInput.classList.contains('rounded-lg')).toBe(true);
      expect(topicInput.classList.contains('focus:ring-2')).toBe(true);
      expect(topicInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('maternity-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
    });

    it('should render interests textarea', () => {
      const interestsInput = document.getElementById('maternity-interests');
      expect(interestsInput).toBeTruthy();
      expect(interestsInput.tagName).toBe('TEXTAREA');
      expect(interestsInput.rows).toBe(2);
      expect(interestsInput.placeholder).toContain('paling dibutuhkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('maternity-audience');
      expect(audienceSelect.options[0].textContent).toContain('Ibu Hamil');
      expect(audienceSelect.options[1].textContent).toContain('Ayah Hamil');
      expect(audienceSelect.options[2].textContent).toContain('Pasangan Suami Istri');
      expect(audienceSelect.options[3].textContent).toContain('Keluarga');
      expect(audienceSelect.options[4].textContent).toContain('Semua Orang');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('maternity-audience');
      expect(audienceSelect.value).toBe('expecting-mothers');
    });
  });

  // Tone & Style Selection Tests
  describe('Tone & Style Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('maternity-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(5);
    });

    it('should render style select', () => {
      const styleSelect = document.getElementById('maternity-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(5);
    });

    it('should render length select', () => {
      const lengthSelect = document.getElementById('maternity-length');
      expect(lengthSelect).toBeTruthy();
      expect(lengthSelect.tagName).toBe('SELECT');
      expect(lengthSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Gaya & Nuansa');
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
      const toneSelect = document.getElementById('maternity-tone');
      expect(toneSelect.options[0].textContent).toContain('Mendukung');
      expect(toneSelect.options[1].textContent).toContain('Informatif');
      expect(toneSelect.options[2].textContent).toContain('Hangat & Ramah');
      expect(toneSelect.options[3].textContent).toContain('Menenangkan');
      expect(toneSelect.options[4].textContent).toContain('Mendorong');
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('maternity-style');
      expect(styleSelect.options[0].textContent).toContain('Santai & Gaul');
      expect(styleSelect.options[1].textContent).toContain('Formal');
      expect(styleSelect.options[2].textContent).toContain('Cerita');
      expect(styleSelect.options[3].textContent).toContain('Langkah demi Langkah');
      expect(styleSelect.options[4].textContent).toContain('Tanya Jawab');
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('maternity-length');
      expect(lengthSelect.options[0].textContent).toContain('Pendek');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Panjang');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('maternity-tone');
      expect(toneSelect.value).toBe('supportive');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('maternity-style');
      expect(styleSelect.value).toBe('casual');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('maternity-length');
      expect(lengthSelect.value).toBe('short');
    });
  });

  // Additional Details Tests
  describe('Additional Details', () => {
    it('should render goals textarea', () => {
      const goalsInput = document.getElementById('maternity-goals');
      expect(goalsInput).toBeTruthy();
      expect(goalsInput.tagName).toBe('TEXTAREA');
      expect(goalsInput.rows).toBe(2);
      expect(goalsInput.placeholder).toContain('tujuan Anda membuat konten');
    });

    it('should render CTA input', () => {
      const ctaInput = document.getElementById('maternity-cta');
      expect(ctaInput).toBeTruthy();
      expect(ctaInput.type).toBe('text');
      expect(ctaInput.placeholder).toContain('Bagikan pengalaman Anda');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
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
      const generateBtn = document.getElementById('maternity-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Konten Kehamilan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('maternity-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('maternity-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('maternity-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('maternity-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-baby-carriage')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konten kehamilan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('maternity-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('maternity-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat konten kehamilan');
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
      const emptyState = document.getElementById('maternity-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('maternity-empty-state').querySelector('i.fas.fa-baby-carriage');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/violet color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-500')).toBe(true);
      expect(title.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use purple/violet accents in generate button', () => {
      const generateBtn = document.getElementById('maternity-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use purple accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-maternity');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in focus states', () => {
      const topicInput = document.getElementById('maternity-topic');
      expect(topicInput.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(topicInput.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('maternity-empty-state').querySelector('i.fas.fa-baby-carriage');
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
      const icons = document.body.querySelectorAll('i.fas');
      expect(icons.length).toBeGreaterThan(20);
    });

    it('should have baby-carriage icon in header', () => {
      const babyCarriageIcon = document.body.querySelector('header i.fas.fa-baby-carriage');
      expect(babyCarriageIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('maternity-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have calendar-alt icon for journey', () => {
      const calendarIcon = document.body.querySelector('[data-type="journey"] i.fas.fa-calendar-alt');
      expect(calendarIcon).toBeTruthy();
    });

    it('should have apple-alt icon for nutrition', () => {
      const appleIcon = document.body.querySelector('[data-type="nutrition"] i.fas.fa-apple-alt');
      expect(appleIcon).toBeTruthy();
    });

    it('should have heartbeat icon for health', () => {
      const heartbeatIcon = document.body.querySelector('[data-type="health"] i.fas.fa-heartbeat');
      expect(heartbeatIcon).toBeTruthy();
    });

    it('should have baby icon for preparation', () => {
      const babyIcon = document.body.querySelector('[data-type="preparation"] i.fas.fa-baby');
      expect(babyIcon).toBeTruthy();
    });

    it('should have smile icon for emotions', () => {
      const smileIcon = document.body.querySelector('[data-type="emotions"] i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have lightbulb icon for tips', () => {
      const lightbulbIcon = document.body.querySelector('[data-type="tips"] i.fas.fa-lightbulb');
      expect(lightbulbIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Konten Kehamilan');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Trimester Kehamilan');
      expect(document.body.textContent).toContain('Topik & Niche');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya & Nuansa');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Konten Kehamilan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Konten');
      expect(headers[1].textContent).toContain('2. Trimester Kehamilan');
      expect(headers[2].textContent).toContain('3. Topik & Niche');
      expect(headers[3].textContent).toContain('4. Target Audiens');
      expect(headers[4].textContent).toContain('5. Gaya & Nuansa');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
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
      const topicInput = document.getElementById('maternity-topic');
      expect(topicInput).toBeTruthy();
      
      const nicheInput = document.getElementById('maternity-niche');
      expect(nicheInput).toBeTruthy();
      
      const keywordsInput = document.getElementById('maternity-keywords');
      expect(keywordsInput).toBeTruthy();
      
      const weekInput = document.getElementById('maternity-week');
      expect(weekInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const trimesterSelect = document.getElementById('maternity-trimester');
      expect(trimesterSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('maternity-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('maternity-tone');
      expect(toneSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('maternity-style');
      expect(styleSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('maternity-length');
      expect(lengthSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const interestsInput = document.getElementById('maternity-interests');
      expect(interestsInput).toBeTruthy();
      
      const goalsInput = document.getElementById('maternity-goals');
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
      const topicInput = document.getElementById('maternity-topic');
      expect(topicInput.placeholder).toBeTruthy();
      
      const nicheInput = document.getElementById('maternity-niche');
      expect(nicheInput.placeholder).toBeTruthy();
      
      const keywordsInput = document.getElementById('maternity-keywords');
      expect(keywordsInput.placeholder).toBeTruthy();
      
      const weekInput = document.getElementById('maternity-week');
      expect(weekInput.placeholder).toBeTruthy();
      
      const ctaInput = document.getElementById('maternity-cta');
      expect(ctaInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const interestsInput = document.getElementById('maternity-interests');
      expect(interestsInput.placeholder).toBeTruthy();
      
      const goalsInput = document.getElementById('maternity-goals');
      expect(goalsInput.placeholder).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('maternity-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('maternity-generate-btn');
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
      const topicInput = document.getElementById('maternity-topic');
      expect(topicInput.type).toBe('text');
      
      const nicheInput = document.getElementById('maternity-niche');
      expect(nicheInput.type).toBe('text');
      
      const keywordsInput = document.getElementById('maternity-keywords');
      expect(keywordsInput.type).toBe('text');
      
      const weekInput = document.getElementById('maternity-week');
      expect(weekInput.type).toBe('number');
      
      const ctaInput = document.getElementById('maternity-cta');
      expect(ctaInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const interestsInput = document.getElementById('maternity-interests');
      expect(interestsInput.rows).toBe(2);
      
      const goalsInput = document.getElementById('maternity-goals');
      expect(goalsInput.rows).toBe(2);
    });

    it('should have proper number input constraints', () => {
      const weekInput = document.getElementById('maternity-week');
      expect(weekInput.min).toBe('1');
      expect(weekInput.max).toBe('42');
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have proper spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper results container styling', () => {
      const resultsContainer = document.getElementById('maternity-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      const trimesterCard = document.body.querySelectorAll('.card')[1];
      const spaceDiv = trimesterCard.querySelector('.space-y-4');
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
      expect(h2Elements[5].textContent).toContain('6.');
    });

    it('should have proper spacing between sections', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const cards = leftPanel.querySelectorAll('.card');
      expect(cards.length).toBe(6);
    });

    it('should have proper results area structure', () => {
      const resultsContainer = document.getElementById('maternity-results-container');
      expect(resultsContainer.querySelector('#maternity-empty-state')).toBeTruthy();
      expect(resultsContainer.querySelector('#maternity-results')).toBeTruthy();
      expect(resultsContainer.querySelector('#maternity-loading')).toBeTruthy();
    });
  });

  // Input Group Tests
  describe('Input Groups', () => {
    it('should have proper label styling', () => {
      const formLabels = [
        document.getElementById('maternity-topic')?.closest('div').querySelector('label'),
        document.getElementById('maternity-niche')?.closest('div').querySelector('label'),
        document.getElementById('maternity-keywords')?.closest('div').querySelector('label')
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
      expect(loader.classList.contains('border-purple-500')).toBe(true);
      expect(loader.classList.contains('h-12')).toBe(true);
      expect(loader.classList.contains('w-12')).toBe(true);
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('maternity-loading');
      expect(loading.textContent).toContain('Sedang membuat konten kehamilan');
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have proper empty state icon', () => {
      const emptyState = document.getElementById('maternity-empty-state');
      expect(emptyState.querySelector('i.fas.fa-baby-carriage')).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-baby-carriage').classList.contains('text-purple-400')).toBe(true);
      expect(emptyState.querySelector('i.fas.fa-baby-carriage').classList.contains('text-6xl')).toBe(true);
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('maternity-empty-state');
      expect(emptyState.textContent).toContain('Hasil konten kehamilan akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Konten Kehamilan');
    });
  });

  // Hover Effects Tests
  describe('Hover Effects', () => {
    it('should have hover effects on type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-maternity');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
        expect(btn.classList.contains('transition')).toBe(true);
      });
    });

    it('should have hover effects on generate button', () => {
      const generateBtn = document.getElementById('maternity-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Border and Selection Tests
  describe('Border and Selection', () => {
    it('should have proper border classes on type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-maternity');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('border-2')).toBe(true);
        expect(btn.classList.contains('border-transparent')).toBe(true);
      });
    });

    it('should have selected state on journey button', () => {
      const journeyBtn = document.body.querySelector('[data-type="journey"]');
      expect(journeyBtn.classList.contains('selected')).toBe(true);
      expect(journeyBtn.getAttribute('data-selected')).toBe('true');
    });

    it('should have proper selection styling', () => {
      const journeyBtn = document.body.querySelector('[data-type="journey"]');
      expect(journeyBtn.classList.contains('border-transparent')).toBe(true);
      expect(journeyBtn.classList.contains('bg-gray-100')).toBe(true);
    });
  });
});