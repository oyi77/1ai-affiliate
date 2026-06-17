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

describe('new-born Component', () => {
  
  const mockComponentHTML = `
    <div id="content-new-born" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            <i class="fas fa-baby mr-3"></i>Konten Bayi
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten yang lembut dan bermanfaat untuk si kecil</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Konten</h2>
              <div id="new-born-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="milestone" class="type-btn-new-born p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-baby-carriage text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Milestone</span>
                </button>
                <button type="button" data-type="feeding" class="type-btn-new-born p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-utensils text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Pemberian Makan</span>
                </button>
                <button type="button" data-type="sleep" class="type-btn-new-born p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-moon text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Tidur</span>
                </button>
                <button type="button" data-type="health" class="type-btn-new-born p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-heartbeat text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Kesehatan</span>
                </button>
                <button type="button" data-type="development" class="type-btn-new-born p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-brain text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Perkembangan</span>
                </button>
                <button type="button" data-type="care" class="type-btn-new-born p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-hands text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Perawatan</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Baby's Age & Stage -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Usia & Tahapan Bayi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="new-born-age" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-alt mr-1 text-pink-500"></i>Usia Bayi
                  </label>
                  <select id="new-born-age" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="0-3">Bayi Baru Lahir (0-3 bulan)</option>
                    <option value="4-6">Bayi (4-6 bulan)</option>
                    <option value="7-9">Bayi (7-9 bulan)</option>
                    <option value="10-12">Bayi (10-12 bulan)</option>
                    <option value="13-18">Batita (13-18 bulan)</option>
                    <option value="19-24">Batita (19-24 bulan)</option>
                    <option value="24+">Balita (24+ bulan)</option>
                  </select>
                </div>
                
                <div>
                  <label for="new-born-stage" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-flag mr-1 text-pink-500"></i>Tahapan Saat Ini
                  </label>
                  <input type="text" id="new-born-stage" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: Mulai makan makanan padat">
                </div>
              </div>
            </div>
            
            <!-- Step 3: Topic & Niche -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Topik & Niche</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="new-born-topic" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-pink-500"></i>Topik Utama
                  </label>
                  <input type="text" id="new-born-topic" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: Tips tidur nyenyak untuk bayi">
                </div>
                
                <div>
                  <label for="new-born-niche" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-folder mr-1 text-pink-500"></i>Niche Spesifik
                  </label>
                  <input type="text" id="new-born-niche" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: Kesehatan tidur bayi baru lahir">
                </div>
                
                <div>
                  <label for="new-born-keywords" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-key mr-1 text-pink-500"></i>Kata Kunci
                  </label>
                  <input type="text" id="new-born-keywords" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: bayi baru lahir, tidur nyenyak, asi">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="new-born-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-pink-500"></i>Target Audiens
                  </label>
                  <select id="new-born-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="parents">Orang Tua Baru</option>
                    <option value="expecting">Calon Orang Tua</option>
                    <option value="grandparents">Kakek/Nenek</option>
                    <option value="caregivers">Pengasuh Bayi</option>
                    <option value="all">Semua Orang</option>
                  </select>
                </div>
                
                <div>
                  <label for="new-born-interests" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-pink-500"></i>Minat Audiens
                  </label>
                  <textarea id="new-born-interests" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Apa yang paling dibutuhkan oleh audiens Anda?"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Tone & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Gaya & Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="new-born-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-pink-500"></i>Tone Konten
                  </label>
                  <select id="new-born-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="gentle">Lemah Lembut & Menenangkan</option>
                    <option value="informative">Informatif & Edukatif</option>
                    <option value="warm">Hangat & Ramah</option>
                    <option value="reassuring">Menenangkan & Memberi Kepercayaan</option>
                    <option value="encouraging">Mendorong & Memotivasi</option>
                  </select>
                </div>
                
                <div>
                  <label for="new-born-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-pink-500"></i>Gaya Penulisan
                  </label>
                  <select id="new-born-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="casual">Santai & Gaul</option>
                    <option value="formal">Formal & Profesional</option>
                    <option value="storytelling">Cerita & Naratif</option>
                    <option value="stepbystep">Langkah demi Langkah</option>
                    <option value="qa"> Tanya Jawab</option>
                  </select>
                </div>
                
                <div>
                  <label for="new-born-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-pink-500"></i>Panjang Konten
                  </label>
                  <select id="new-born-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
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
                  <label for="new-born-goals" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-pink-500"></i>Tujuan Konten
                  </label>
                  <textarea id="new-born-goals" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Apa tujuan Anda membuat konten ini?"></textarea>
                </div>
                
                <div>
                  <label for="new-born-cta" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mouse-pointer mr-1 text-pink-500"></i>Call to Action
                  </label>
                  <input type="text" id="new-born-cta" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: Bagikan pengalaman Anda di kolom komentar!">
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="new-born-generate-btn" class="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten Bayi
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="new-born-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="new-born-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-baby text-6xl mb-4 text-pink-400"></i>
                <p class="text-xl">Hasil konten bayi akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Konten Bayi</p>
              </div>
              <div id="new-born-results" class="hidden space-y-6"></div>
              <div id="new-born-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-pink-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten bayi...</p>
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
      const container = document.getElementById('content-new-born');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Konten Bayi');
      expect(title.querySelector('i.fas.fa-baby')).toBeTruthy();
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
      expect(rightPanel.querySelector('#new-born-results-container')).toBeTruthy();
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
      const typeOptions = document.getElementById('new-born-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Milestone option', () => {
      const milestoneBtn = document.body.querySelector('[data-type="milestone"]');
      expect(milestoneBtn).toBeTruthy();
      expect(milestoneBtn.textContent).toContain('Milestone');
      expect(milestoneBtn.querySelector('i.fas.fa-baby-carriage')).toBeTruthy();
      expect(milestoneBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Pemberian Makan option', () => {
      const feedingBtn = document.body.querySelector('[data-type="feeding"]');
      expect(feedingBtn).toBeTruthy();
      expect(feedingBtn.textContent).toContain('Pemberian Makan');
      expect(feedingBtn.querySelector('i.fas.fa-utensils')).toBeTruthy();
    });

    it('should render Tidur option', () => {
      const sleepBtn = document.body.querySelector('[data-type="sleep"]');
      expect(sleepBtn).toBeTruthy();
      expect(sleepBtn.textContent).toContain('Tidur');
      expect(sleepBtn.querySelector('i.fas.fa-moon')).toBeTruthy();
    });

    it('should render Kesehatan option', () => {
      const healthBtn = document.body.querySelector('[data-type="health"]');
      expect(healthBtn).toBeTruthy();
      expect(healthBtn.textContent).toContain('Kesehatan');
      expect(healthBtn.querySelector('i.fas.fa-heartbeat')).toBeTruthy();
    });

    it('should render Perkembangan option', () => {
      const developmentBtn = document.body.querySelector('[data-type="development"]');
      expect(developmentBtn).toBeTruthy();
      expect(developmentBtn.textContent).toContain('Perkembangan');
      expect(developmentBtn.querySelector('i.fas.fa-brain')).toBeTruthy();
    });

    it('should render Perawatan option', () => {
      const careBtn = document.body.querySelector('[data-type="care"]');
      expect(careBtn).toBeTruthy();
      expect(careBtn.textContent).toContain('Perawatan');
      expect(careBtn.querySelector('i.fas.fa-hands')).toBeTruthy();
    });

    it('should have 6 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-new-born');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('new-born-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have pink icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-new-born');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-pink-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Konten');
    });
  });

  // Baby's Age & Stage Tests
  describe("Baby's Age & Stage", () => {
    it('should render age select', () => {
      const ageSelect = document.getElementById('new-born-age');
      expect(ageSelect).toBeTruthy();
      expect(ageSelect.tagName).toBe('SELECT');
      expect(ageSelect.options.length).toBe(7);
    });

    it('should render stage input', () => {
      const stageInput = document.getElementById('new-born-stage');
      expect(stageInput).toBeTruthy();
      expect(stageInput.type).toBe('text');
      expect(stageInput.placeholder).toContain('Mulai makan makanan padat');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Usia & Tahapan Bayi');
    });

    it('should have all labels with icons', () => {
      const calendarIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarIcon).toBeTruthy();
      
      const flagIcon = document.body.querySelector('i.fas.fa-flag');
      expect(flagIcon).toBeTruthy();
    });

    it('should have age options with proper labels', () => {
      const ageSelect = document.getElementById('new-born-age');
      expect(ageSelect.options[0].textContent).toContain('Bayi Baru Lahir');
      expect(ageSelect.options[1].textContent).toContain('Bayi (4-6 bulan)');
      expect(ageSelect.options[2].textContent).toContain('Bayi (7-9 bulan)');
      expect(ageSelect.options[3].textContent).toContain('Bayi (10-12 bulan)');
      expect(ageSelect.options[4].textContent).toContain('Batita (13-18 bulan)');
      expect(ageSelect.options[5].textContent).toContain('Batita (19-24 bulan)');
      expect(ageSelect.options[6].textContent).toContain('Balita (24+ bulan)');
    });

    it('should have default age value', () => {
      const ageSelect = document.getElementById('new-born-age');
      expect(ageSelect.value).toBe('0-3');
    });

    it('should have proper input styling', () => {
      const stageInput = document.getElementById('new-born-stage');
      expect(stageInput.classList.contains('w-full')).toBe(true);
      expect(stageInput.classList.contains('p-3')).toBe(true);
      expect(stageInput.classList.contains('border')).toBe(true);
      expect(stageInput.classList.contains('rounded-lg')).toBe(true);
      expect(stageInput.classList.contains('focus:ring-2')).toBe(true);
      expect(stageInput.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Topic & Niche Input Tests
  describe('Topic & Niche Input', () => {
    it('should render topic input', () => {
      const topicInput = document.getElementById('new-born-topic');
      expect(topicInput).toBeTruthy();
      expect(topicInput.type).toBe('text');
      expect(topicInput.placeholder).toContain('Tips tidur nyenyak');
    });

    it('should render niche input', () => {
      const nicheInput = document.getElementById('new-born-niche');
      expect(nicheInput).toBeTruthy();
      expect(nicheInput.type).toBe('text');
      expect(nicheInput.placeholder).toContain('Kesehatan tidur');
    });

    it('should render keywords input', () => {
      const keywordsInput = document.getElementById('new-born-keywords');
      expect(keywordsInput).toBeTruthy();
      expect(keywordsInput.type).toBe('text');
      expect(keywordsInput.placeholder).toContain('bayi baru lahir');
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
      const topicInput = document.getElementById('new-born-topic');
      expect(topicInput.classList.contains('w-full')).toBe(true);
      expect(topicInput.classList.contains('p-3')).toBe(true);
      expect(topicInput.classList.contains('border')).toBe(true);
      expect(topicInput.classList.contains('rounded-lg')).toBe(true);
      expect(topicInput.classList.contains('focus:ring-2')).toBe(true);
      expect(topicInput.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('new-born-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
    });

    it('should render interests textarea', () => {
      const interestsInput = document.getElementById('new-born-interests');
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
      const audienceSelect = document.getElementById('new-born-audience');
      expect(audienceSelect.options[0].textContent).toContain('Orang Tua Baru');
      expect(audienceSelect.options[1].textContent).toContain('Calon Orang Tua');
      expect(audienceSelect.options[2].textContent).toContain('Kakek/Nenek');
      expect(audienceSelect.options[3].textContent).toContain('Pengasuh Bayi');
      expect(audienceSelect.options[4].textContent).toContain('Semua Orang');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('new-born-audience');
      expect(audienceSelect.value).toBe('parents');
    });
  });

  // Tone & Style Selection Tests
  describe('Tone & Style Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('new-born-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(5);
    });

    it('should render style select', () => {
      const styleSelect = document.getElementById('new-born-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(5);
    });

    it('should render length select', () => {
      const lengthSelect = document.getElementById('new-born-length');
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
      const toneSelect = document.getElementById('new-born-tone');
      expect(toneSelect.options[0].textContent).toContain('Lemah Lembut');
      expect(toneSelect.options[1].textContent).toContain('Informatif');
      expect(toneSelect.options[2].textContent).toContain('Hangat & Ramah');
      expect(toneSelect.options[3].textContent).toContain('Menenangkan');
      expect(toneSelect.options[4].textContent).toContain('Mendorong');
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('new-born-style');
      expect(styleSelect.options[0].textContent).toContain('Santai & Gaul');
      expect(styleSelect.options[1].textContent).toContain('Formal');
      expect(styleSelect.options[2].textContent).toContain('Cerita');
      expect(styleSelect.options[3].textContent).toContain('Langkah demi Langkah');
      expect(styleSelect.options[4].textContent).toContain('Tanya Jawab');
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('new-born-length');
      expect(lengthSelect.options[0].textContent).toContain('Pendek');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Panjang');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('new-born-tone');
      expect(toneSelect.value).toBe('gentle');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('new-born-style');
      expect(styleSelect.value).toBe('casual');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('new-born-length');
      expect(lengthSelect.value).toBe('short');
    });
  });

  // Additional Details Tests
  describe('Additional Details', () => {
    it('should render goals textarea', () => {
      const goalsInput = document.getElementById('new-born-goals');
      expect(goalsInput).toBeTruthy();
      expect(goalsInput.tagName).toBe('TEXTAREA');
      expect(goalsInput.rows).toBe(2);
      expect(goalsInput.placeholder).toContain('tujuan Anda membuat konten');
    });

    it('should render CTA input', () => {
      const ctaInput = document.getElementById('new-born-cta');
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
      const generateBtn = document.getElementById('new-born-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Konten Bayi');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('new-born-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('new-born-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('new-born-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('new-born-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-baby')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konten bayi akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('new-born-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('new-born-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat konten bayi');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('new-born-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have pink icon in empty state', () => {
      const emptyStateIcon = document.getElementById('new-born-empty-state').querySelector('i.fas.fa-baby');
      expect(emptyStateIcon.classList.contains('text-pink-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use pink/rose color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-pink-500')).toBe(true);
      expect(title.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use pink/rose accents in generate button', () => {
      const generateBtn = document.getElementById('new-born-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use pink accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-new-born');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-pink-500')).toBe(true);
      });
    });

    it('should use pink accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-pink-500')).toBe(true);
      });
    });

    it('should use pink accents in focus states', () => {
      const topicInput = document.getElementById('new-born-topic');
      expect(topicInput.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(topicInput.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use pink accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });

    it('should use pink accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('new-born-empty-state').querySelector('i.fas.fa-baby');
      expect(emptyStateIcon.classList.contains('text-pink-400')).toBe(true);
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

    it('should have baby icon in header', () => {
      const babyIcon = document.body.querySelector('header i.fas.fa-baby');
      expect(babyIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('new-born-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have baby-carriage icon for milestone', () => {
      const carriageIcon = document.body.querySelector('[data-type="milestone"] i.fas.fa-baby-carriage');
      expect(carriageIcon).toBeTruthy();
    });

    it('should have utensils icon for feeding', () => {
      const utensilsIcon = document.body.querySelector('[data-type="feeding"] i.fas.fa-utensils');
      expect(utensilsIcon).toBeTruthy();
    });

    it('should have moon icon for sleep', () => {
      const moonIcon = document.body.querySelector('[data-type="sleep"] i.fas.fa-moon');
      expect(moonIcon).toBeTruthy();
    });

    it('should have heartbeat icon for health', () => {
      const heartbeatIcon = document.body.querySelector('[data-type="health"] i.fas.fa-heartbeat');
      expect(heartbeatIcon).toBeTruthy();
    });

    it('should have brain icon for development', () => {
      const brainIcon = document.body.querySelector('[data-type="development"] i.fas.fa-brain');
      expect(brainIcon).toBeTruthy();
    });

    it('should have hands icon for care', () => {
      const handsIcon = document.body.querySelector('[data-type="care"] i.fas.fa-hands');
      expect(handsIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Konten Bayi');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Usia & Tahapan');
      expect(document.body.textContent).toContain('Topik & Niche');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya & Nuansa');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Konten Bayi');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Konten');
      expect(headers[1].textContent).toContain('2. Usia & Tahapan Bayi');
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
      const topicInput = document.getElementById('new-born-topic');
      expect(topicInput).toBeTruthy();
      
      const nicheInput = document.getElementById('new-born-niche');
      expect(nicheInput).toBeTruthy();
      
      const keywordsInput = document.getElementById('new-born-keywords');
      expect(keywordsInput).toBeTruthy();
      
      const stageInput = document.getElementById('new-born-stage');
      expect(stageInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const ageSelect = document.getElementById('new-born-age');
      expect(ageSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('new-born-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('new-born-tone');
      expect(toneSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('new-born-style');
      expect(styleSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('new-born-length');
      expect(lengthSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const interestsInput = document.getElementById('new-born-interests');
      expect(interestsInput).toBeTruthy();
      
      const goalsInput = document.getElementById('new-born-goals');
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
      const topicInput = document.getElementById('new-born-topic');
      expect(topicInput.placeholder).toBeTruthy();
      
      const nicheInput = document.getElementById('new-born-niche');
      expect(nicheInput.placeholder).toBeTruthy();
      
      const keywordsInput = document.getElementById('new-born-keywords');
      expect(keywordsInput.placeholder).toBeTruthy();
      
      const stageInput = document.getElementById('new-born-stage');
      expect(stageInput.placeholder).toBeTruthy();
      
      const ctaInput = document.getElementById('new-born-cta');
      expect(ctaInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const interestsInput = document.getElementById('new-born-interests');
      expect(interestsInput.placeholder).toBeTruthy();
      
      const goalsInput = document.getElementById('new-born-goals');
      expect(goalsInput.placeholder).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('new-born-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('new-born-generate-btn');
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
      const topicInput = document.getElementById('new-born-topic');
      expect(topicInput.type).toBe('text');
      
      const nicheInput = document.getElementById('new-born-niche');
      expect(nicheInput.type).toBe('text');
      
      const keywordsInput = document.getElementById('new-born-keywords');
      expect(keywordsInput.type).toBe('text');
      
      const stageInput = document.getElementById('new-born-stage');
      expect(stageInput.type).toBe('text');
      
      const ctaInput = document.getElementById('new-born-cta');
      expect(ctaInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const interestsInput = document.getElementById('new-born-interests');
      expect(interestsInput.rows).toBe(2);
      
      const goalsInput = document.getElementById('new-born-goals');
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
      const resultsContainer = document.getElementById('new-born-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      const ageCard = document.body.querySelectorAll('.card')[1];
      const spaceDiv = ageCard.querySelector('.space-y-4');
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
      const resultsContainer = document.getElementById('new-born-results-container');
      expect(resultsContainer.querySelector('#new-born-empty-state')).toBeTruthy();
      expect(resultsContainer.querySelector('#new-born-results')).toBeTruthy();
      expect(resultsContainer.querySelector('#new-born-loading')).toBeTruthy();
    });
  });

  // Input Group Tests
  describe('Input Groups', () => {
    it('should have proper label styling', () => {
      const formLabels = [
        document.getElementById('new-born-topic')?.closest('div').querySelector('label'),
        document.getElementById('new-born-niche')?.closest('div').querySelector('label'),
        document.getElementById('new-born-keywords')?.closest('div').querySelector('label')
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
      expect(loader.classList.contains('border-pink-500')).toBe(true);
      expect(loader.classList.contains('h-12')).toBe(true);
      expect(loader.classList.contains('w-12')).toBe(true);
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('new-born-loading');
      expect(loading.textContent).toContain('Sedang membuat konten bayi');
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have proper empty state icon', () => {
      const emptyState = document.getElementById('new-born-empty-state');
      expect(emptyState.querySelector('i.fas.fa-baby')).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-baby').classList.contains('text-pink-400')).toBe(true);
      expect(emptyState.querySelector('i.fas.fa-baby').classList.contains('text-6xl')).toBe(true);
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('new-born-empty-state');
      expect(emptyState.textContent).toContain('Hasil konten bayi akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Konten Bayi');
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('new-born-empty-state');
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
      expect(document.getElementById('new-born-type-options')).toBeTruthy();
      
      // Age & stage elements
      expect(document.getElementById('new-born-age')).toBeTruthy();
      expect(document.getElementById('new-born-stage')).toBeTruthy();
      
      // Topic & niche elements
      expect(document.getElementById('new-born-topic')).toBeTruthy();
      expect(document.getElementById('new-born-niche')).toBeTruthy();
      expect(document.getElementById('new-born-keywords')).toBeTruthy();
      
      // Target audience elements
      expect(document.getElementById('new-born-audience')).toBeTruthy();
      expect(document.getElementById('new-born-interests')).toBeTruthy();
      
      // Tone & style elements
      expect(document.getElementById('new-born-tone')).toBeTruthy();
      expect(document.getElementById('new-born-style')).toBeTruthy();
      expect(document.getElementById('new-born-length')).toBeTruthy();
      
      // Additional details elements
      expect(document.getElementById('new-born-goals')).toBeTruthy();
      expect(document.getElementById('new-born-cta')).toBeTruthy();
      
      // Generate button
      expect(document.getElementById('new-born-generate-btn')).toBeTruthy();
      
      // Results elements
      expect(document.getElementById('new-born-results')).toBeTruthy();
      expect(document.getElementById('new-born-empty-state')).toBeTruthy();
      expect(document.getElementById('new-born-loading')).toBeTruthy();
    });

    it('should have proper data attributes for content types', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-new-born');
      typeBtns.forEach(btn => {
        expect(btn.dataset.type).toBeTruthy();
      });
    });

    it('should have selected state on Milestone by default', () => {
      const milestoneBtn = document.body.querySelector('[data-type="milestone"]');
      expect(milestoneBtn.dataset.selected).toBe('true');
      expect(milestoneBtn.classList.contains('selected')).toBe(true);
    });
  });
});
