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

describe('profesi-anak Component', () => {
  
  const mockComponentHTML = `
    <div id="content-profesi-anak" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            <i class="fas fa-child mr-3"></i>Konten Profesi Anak
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten yang inspiratif dan edukatif untuk perjalanan karier anak Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Konten</h2>
              <div id="profesi-anak-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="career-exploration" class="type-btn-profesi-anak p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-search text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Eksplorasi</span>
                </button>
                <button type="button" data-type="skills" class="type-btn-profesi-anak p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Keterampilan</span>
                </button>
                <button type="button" data-type="education" class="type-btn-profesi-anak p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-graduation-cap text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Pendidikan</span>
                </button>
                <button type="button" data-type="inspiration" class="type-btn-profesi-anak p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-lightbulb text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Inspirasi</span>
                </button>
                <button type="button" data-type="role-models" class="type-btn-profesi-anak p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user-astronaut text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Idola</span>
                </button>
                <button type="button" data-type="tips" class="type-btn-profesi-anak p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-rocket text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Tips</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Age & Grade -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Usia & Tingkat</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="profesi-anak-age" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-birthday-cake mr-1 text-blue-500"></i>Usia Anak
                  </label>
                  <select id="profesi-anak-age" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="3-5">Usia 3-5 tahun (Pra-sekolah)</option>
                    <option value="6-12">Usia 6-12 tahun (Sekolah Dasar)</option>
                    <option value="13-15">Usia 13-15 tahun (SMP)</option>
                    <option value="16-18">Usia 16-18 tahun (SMA/SMK)</option>
                    <option value="all">Semua Usia</option>
                  </select>
                </div>
                
                <div>
                  <label for="profesi-anak-grade" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-school mr-1 text-blue-500"></i>Tingkat Pendidikan
                  </label>
                  <select id="profesi-anak-grade" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="preschool">Pra-sekolah</option>
                    <option value="elementary">Sekolah Dasar</option>
                    <option value="junior-high">SMP</option>
                    <option value="senior-high">SMA/SMK</option>
                    <option value="all">Semua Tingkat</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Profession Category -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Kategori Profesi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="profesi-anak-category" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-briefcase mr-1 text-blue-500"></i>Kategori Profesi
                  </label>
                  <select id="profesi-anak-category" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="science">Sains & Teknologi</option>
                    <option value="arts">Seni & Kreativitas</option>
                    <option value="sports">Olahraga & Kesehatan</option>
                    <option value="business">Bisnis & Kewirausahaan</option>
                    <option value="education">Pendidikan & Pengajaran</option>
                    <option value="healthcare">Kesehatan & Medis</option>
                    <option value="engineering">Teknik & Engineering</option>
                    <option value="public-service">Layanan Publik</option>
                    <option value="all">Semua Kategori</option>
                  </select>
                </div>
                
                <div>
                  <label for="profesi-anak-profession" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-user-tie mr-1 text-blue-500"></i>Profesi Spesifik
                  </label>
                  <input type="text" id="profesi-anak-profession" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Dokter, Pilot, Seniman, Programmer">
                </div>
                
                <div>
                  <label for="profesi-anak-keywords" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-key mr-1 text-blue-500"></i>Kata Kunci
                  </label>
                  <input type="text" id="profesi-anak-keywords" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: karier, masa depan, pendidikan">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="profesi-anak-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-blue-500"></i>Target Audiens
                  </label>
                  <select id="profesi-anak-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="children">Anak-anak</option>
                    <option value="parents">Orang Tua</option>
                    <option value="educators">Pendidik/Guru</option>
                    <option value="counselors">Konselor Karier</option>
                    <option value="all">Semua Audiens</option>
                  </select>
                </div>
                
                <div>
                  <label for="profesi-anak-interests" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-blue-500"></i>Minat Audiens
                  </label>
                  <textarea id="profesi-anak-interests" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Apa yang paling dibutuhkan oleh audiens Anda?"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Tone & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Gaya & Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="profesi-anak-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-blue-500"></i>Tone Konten
                  </label>
                  <select id="profesi-anak-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="encouraging">Mendorong & Memotivasi</option>
                    <option value="educational">Edukatif & Informatif</option>
                    <option value="fun">Menyenangkan & Seru</option>
                    <option value="inspiring">Inspiratif & Menginspirasi</option>
                    <option value="supportive">Mendukung & Memberi Semangat</option>
                  </select>
                </div>
                
                <div>
                  <label for="profesi-anak-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-blue-500"></i>Gaya Penulisan
                  </label>
                  <select id="profesi-anak-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="storytelling">Cerita & Naratif</option>
                    <option value="casual">Santai & Gaul</option>
                    <option value="question-answer">Tanya Jawab</option>
                    <option value="stepbystep">Langkah demi Langkah</option>
                    <option value="fact-based">Fakta & Data</option>
                  </select>
                </div>
                
                <div>
                  <label for="profesi-anak-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-blue-500"></i>Panjang Konten
                  </label>
                  <select id="profesi-anak-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
                  <label for="profesi-anak-goals" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullseye mr-1 text-blue-500"></i>Tujuan Konten
                  </label>
                  <textarea id="profesi-anak-goals" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Apa tujuan Anda membuat konten ini?"></textarea>
                </div>
                
                <div>
                  <label for="profesi-anak-cta" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mouse-pointer mr-1 text-blue-500"></i>Call to Action
                  </label>
                  <input type="text" id="profesi-anak-cta" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Siapa profesi idamanmu? Tulis di kolom komentar!">
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="profesi-anak-generate-btn" class="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten Profesi Anak
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="profesi-anak-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="profesi-anak-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-child text-6xl mb-4 text-blue-400"></i>
                <p class="text-xl">Hasil konten profesi anak akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Konten Profesi Anak</p>
              </div>
              <div id="profesi-anak-results" class="hidden space-y-6"></div>
              <div id="profesi-anak-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten profesi anak...</p>
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
      const container = document.getElementById('content-profesi-anak');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Konten Profesi Anak');
      expect(title.querySelector('i.fas.fa-child')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konten yang inspiratif dan edukatif');
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
      expect(rightPanel.querySelector('#profesi-anak-results-container')).toBeTruthy();
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
      const typeOptions = document.getElementById('profesi-anak-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Eksplorasi option', () => {
      const eksplorasiBtn = document.body.querySelector('[data-type="career-exploration"]');
      expect(eksplorasiBtn).toBeTruthy();
      expect(eksplorasiBtn.textContent).toContain('Eksplorasi');
      expect(eksplorasiBtn.querySelector('i.fas.fa-search')).toBeTruthy();
      expect(eksplorasiBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Keterampilan option', () => {
      const keterampilanBtn = document.body.querySelector('[data-type="skills"]');
      expect(keterampilanBtn).toBeTruthy();
      expect(keterampilanBtn.textContent).toContain('Keterampilan');
      expect(keterampilanBtn.querySelector('i.fas.fa-star')).toBeTruthy();
    });

    it('should render Pendidikan option', () => {
      const pendidikanBtn = document.body.querySelector('[data-type="education"]');
      expect(pendidikanBtn).toBeTruthy();
      expect(pendidikanBtn.textContent).toContain('Pendidikan');
      expect(pendidikanBtn.querySelector('i.fas.fa-graduation-cap')).toBeTruthy();
    });

    it('should render Inspirasi option', () => {
      const inspirasiBtn = document.body.querySelector('[data-type="inspiration"]');
      expect(inspirasiBtn).toBeTruthy();
      expect(inspirasiBtn.textContent).toContain('Inspirasi');
      expect(inspirasiBtn.querySelector('i.fas.fa-lightbulb')).toBeTruthy();
    });

    it('should render Idola option', () => {
      const idolaBtn = document.body.querySelector('[data-type="role-models"]');
      expect(idolaBtn).toBeTruthy();
      expect(idolaBtn.textContent).toContain('Idola');
      expect(idolaBtn.querySelector('i.fas.fa-user-astronaut')).toBeTruthy();
    });

    it('should render Tips option', () => {
      const tipsBtn = document.body.querySelector('[data-type="tips"]');
      expect(tipsBtn).toBeTruthy();
      expect(tipsBtn.textContent).toContain('Tips');
      expect(tipsBtn.querySelector('i.fas.fa-rocket')).toBeTruthy();
    });

    it('should have 6 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('profesi-anak-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have blue icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Konten');
    });
  });

  // Age & Grade Selection Tests
  describe('Age & Grade Selection', () => {
    it('should render age select', () => {
      const ageSelect = document.getElementById('profesi-anak-age');
      expect(ageSelect).toBeTruthy();
      expect(ageSelect.tagName).toBe('SELECT');
      expect(ageSelect.options.length).toBe(5);
    });

    it('should render grade select', () => {
      const gradeSelect = document.getElementById('profesi-anak-grade');
      expect(gradeSelect).toBeTruthy();
      expect(gradeSelect.tagName).toBe('SELECT');
      expect(gradeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Usia & Tingkat');
    });

    it('should have all labels with icons', () => {
      const birthdayCakeIcon = document.body.querySelector('i.fas.fa-birthday-cake');
      expect(birthdayCakeIcon).toBeTruthy();
      
      const schoolIcon = document.body.querySelector('i.fas.fa-school');
      expect(schoolIcon).toBeTruthy();
    });

    it('should have age options with proper labels', () => {
      const ageSelect = document.getElementById('profesi-anak-age');
      expect(ageSelect.options[0].textContent).toContain('Usia 3-5 tahun');
      expect(ageSelect.options[1].textContent).toContain('Usia 6-12 tahun');
      expect(ageSelect.options[2].textContent).toContain('Usia 13-15 tahun');
      expect(ageSelect.options[3].textContent).toContain('Usia 16-18 tahun');
      expect(ageSelect.options[4].textContent).toContain('Semua Usia');
    });

    it('should have grade options with proper labels', () => {
      const gradeSelect = document.getElementById('profesi-anak-grade');
      expect(gradeSelect.options[0].textContent).toContain('Pra-sekolah');
      expect(gradeSelect.options[1].textContent).toContain('Sekolah Dasar');
      expect(gradeSelect.options[2].textContent).toContain('SMP');
      expect(gradeSelect.options[3].textContent).toContain('SMA/SMK');
      expect(gradeSelect.options[4].textContent).toContain('Semua Tingkat');
    });

    it('should have default age value', () => {
      const ageSelect = document.getElementById('profesi-anak-age');
      expect(ageSelect.value).toBe('3-5');
    });

    it('should have default grade value', () => {
      const gradeSelect = document.getElementById('profesi-anak-grade');
      expect(gradeSelect.value).toBe('preschool');
    });

    it('should have proper input styling', () => {
      const ageSelect = document.getElementById('profesi-anak-age');
      expect(ageSelect.classList.contains('w-full')).toBe(true);
      expect(ageSelect.classList.contains('p-3')).toBe(true);
      expect(ageSelect.classList.contains('border')).toBe(true);
      expect(ageSelect.classList.contains('rounded-lg')).toBe(true);
      expect(ageSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(ageSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Profession Category Input Tests
  describe('Profession Category Input', () => {
    it('should render category select', () => {
      const categorySelect = document.getElementById('profesi-anak-category');
      expect(categorySelect).toBeTruthy();
      expect(categorySelect.tagName).toBe('SELECT');
      expect(categorySelect.options.length).toBe(9);
    });

    it('should render profession input', () => {
      const professionInput = document.getElementById('profesi-anak-profession');
      expect(professionInput).toBeTruthy();
      expect(professionInput.type).toBe('text');
      expect(professionInput.placeholder).toContain('Dokter, Pilot');
    });

    it('should render keywords input', () => {
      const keywordsInput = document.getElementById('profesi-anak-keywords');
      expect(keywordsInput).toBeTruthy();
      expect(keywordsInput.type).toBe('text');
      expect(keywordsInput.placeholder).toContain('karier, masa depan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Kategori Profesi');
    });

    it('should have all labels with icons', () => {
      const briefcaseIcon = document.body.querySelector('i.fas.fa-briefcase');
      expect(briefcaseIcon).toBeTruthy();
      
      const userTieIcon = document.body.querySelector('i.fas.fa-user-tie');
      expect(userTieIcon).toBeTruthy();
      
      const keyIcon = document.body.querySelector('i.fas.fa-key');
      expect(keyIcon).toBeTruthy();
    });

    it('should have category options with proper labels', () => {
      const categorySelect = document.getElementById('profesi-anak-category');
      expect(categorySelect.options[0].textContent).toContain('Sains & Teknologi');
      expect(categorySelect.options[1].textContent).toContain('Seni & Kreativitas');
      expect(categorySelect.options[2].textContent).toContain('Olahraga & Kesehatan');
      expect(categorySelect.options[3].textContent).toContain('Bisnis & Kewirausahaan');
      expect(categorySelect.options[4].textContent).toContain('Pendidikan & Pengajaran');
      expect(categorySelect.options[5].textContent).toContain('Kesehatan & Medis');
      expect(categorySelect.options[6].textContent).toContain('Teknik & Engineering');
      expect(categorySelect.options[7].textContent).toContain('Layanan Publik');
      expect(categorySelect.options[8].textContent).toContain('Semua Kategori');
    });

    it('should have default category value', () => {
      const categorySelect = document.getElementById('profesi-anak-category');
      expect(categorySelect.value).toBe('science');
    });

    it('should have proper input styling', () => {
      const professionInput = document.getElementById('profesi-anak-profession');
      expect(professionInput.classList.contains('w-full')).toBe(true);
      expect(professionInput.classList.contains('p-3')).toBe(true);
      expect(professionInput.classList.contains('border')).toBe(true);
      expect(professionInput.classList.contains('rounded-lg')).toBe(true);
      expect(professionInput.classList.contains('focus:ring-2')).toBe(true);
      expect(professionInput.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('profesi-anak-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
    });

    it('should render interests textarea', () => {
      const interestsInput = document.getElementById('profesi-anak-interests');
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
      const audienceSelect = document.getElementById('profesi-anak-audience');
      expect(audienceSelect.options[0].textContent).toContain('Anak-anak');
      expect(audienceSelect.options[1].textContent).toContain('Orang Tua');
      expect(audienceSelect.options[2].textContent).toContain('Pendidik/Guru');
      expect(audienceSelect.options[3].textContent).toContain('Konselor Karier');
      expect(audienceSelect.options[4].textContent).toContain('Semua Audiens');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('profesi-anak-audience');
      expect(audienceSelect.value).toBe('children');
    });
  });

  // Tone & Style Selection Tests
  describe('Tone & Style Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('profesi-anak-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(5);
    });

    it('should render style select', () => {
      const styleSelect = document.getElementById('profesi-anak-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(5);
    });

    it('should render length select', () => {
      const lengthSelect = document.getElementById('profesi-anak-length');
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
      const toneSelect = document.getElementById('profesi-anak-tone');
      expect(toneSelect.options[0].textContent).toContain('Mendorong & Memotivasi');
      expect(toneSelect.options[1].textContent).toContain('Edukatif & Informatif');
      expect(toneSelect.options[2].textContent).toContain('Menyenangkan & Seru');
      expect(toneSelect.options[3].textContent).toContain('Inspiratif & Menginspirasi');
      expect(toneSelect.options[4].textContent).toContain('Mendukung & Memberi Semangat');
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('profesi-anak-style');
      expect(styleSelect.options[0].textContent).toContain('Cerita & Naratif');
      expect(styleSelect.options[1].textContent).toContain('Santai & Gaul');
      expect(styleSelect.options[2].textContent).toContain('Tanya Jawab');
      expect(styleSelect.options[3].textContent).toContain('Langkah demi Langkah');
      expect(styleSelect.options[4].textContent).toContain('Fakta & Data');
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('profesi-anak-length');
      expect(lengthSelect.options[0].textContent).toContain('Pendek');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Panjang');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('profesi-anak-tone');
      expect(toneSelect.value).toBe('encouraging');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('profesi-anak-style');
      expect(styleSelect.value).toBe('storytelling');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('profesi-anak-length');
      expect(lengthSelect.value).toBe('short');
    });
  });

  // Additional Details Tests
  describe('Additional Details', () => {
    it('should render goals textarea', () => {
      const goalsInput = document.getElementById('profesi-anak-goals');
      expect(goalsInput).toBeTruthy();
      expect(goalsInput.tagName).toBe('TEXTAREA');
      expect(goalsInput.rows).toBe(2);
      expect(goalsInput.placeholder).toContain('tujuan Anda membuat konten');
    });

    it('should render CTA input', () => {
      const ctaInput = document.getElementById('profesi-anak-cta');
      expect(ctaInput).toBeTruthy();
      expect(ctaInput.type).toBe('text');
      expect(ctaInput.placeholder).toContain('Siapa profesi idamanmu');
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
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Konten Profesi Anak');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('profesi-anak-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('profesi-anak-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-child')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konten profesi anak akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('profesi-anak-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('profesi-anak-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat konten profesi anak');
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
      const emptyState = document.getElementById('profesi-anak-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have blue icon in empty state', () => {
      const emptyStateIcon = document.getElementById('profesi-anak-empty-state').querySelector('i.fas.fa-child');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/indigo color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-500')).toBe(true);
      expect(title.classList.contains('to-indigo-500')).toBe(true);
    });

    it('should use blue/indigo accents in generate button', () => {
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-500')).toBe(true);
    });

    it('should use blue accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should use blue accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should use blue accents in focus states', () => {
      const professionInput = document.getElementById('profesi-anak-profession');
      expect(professionInput.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(professionInput.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use blue accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should use blue accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('profesi-anak-empty-state').querySelector('i.fas.fa-child');
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
      const icons = document.body.querySelectorAll('i.fas');
      expect(icons.length).toBeGreaterThan(20);
    });

    it('should have child icon in header', () => {
      const childIcon = document.body.querySelector('header i.fas.fa-child');
      expect(childIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('profesi-anak-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have search icon for career exploration', () => {
      const searchIcon = document.body.querySelector('[data-type="career-exploration"] i.fas.fa-search');
      expect(searchIcon).toBeTruthy();
    });

    it('should have star icon for skills', () => {
      const starIcon = document.body.querySelector('[data-type="skills"] i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have graduation-cap icon for education', () => {
      const graduationIcon = document.body.querySelector('[data-type="education"] i.fas.fa-graduation-cap');
      expect(graduationIcon).toBeTruthy();
    });

    it('should have lightbulb icon for inspiration', () => {
      const lightbulbIcon = document.body.querySelector('[data-type="inspiration"] i.fas.fa-lightbulb');
      expect(lightbulbIcon).toBeTruthy();
    });

    it('should have user-astronaut icon for role models', () => {
      const userAstronautIcon = document.body.querySelector('[data-type="role-models"] i.fas.fa-user-astronaut');
      expect(userAstronautIcon).toBeTruthy();
    });

    it('should have rocket icon for tips', () => {
      const rocketIcon = document.body.querySelector('[data-type="tips"] i.fas.fa-rocket');
      expect(rocketIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Konten Profesi Anak');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Usia & Tingkat');
      expect(document.body.textContent).toContain('Kategori Profesi');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya & Nuansa');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Konten Profesi Anak');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Konten');
      expect(headers[1].textContent).toContain('2. Usia & Tingkat');
      expect(headers[2].textContent).toContain('3. Kategori Profesi');
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
      const professionInput = document.getElementById('profesi-anak-profession');
      expect(professionInput).toBeTruthy();
      
      const keywordsInput = document.getElementById('profesi-anak-keywords');
      expect(keywordsInput).toBeTruthy();
      
      const ctaInput = document.getElementById('profesi-anak-cta');
      expect(ctaInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const ageSelect = document.getElementById('profesi-anak-age');
      expect(ageSelect).toBeTruthy();
      
      const categorySelect = document.getElementById('profesi-anak-category');
      expect(categorySelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('profesi-anak-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('profesi-anak-tone');
      expect(toneSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('profesi-anak-style');
      expect(styleSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('profesi-anak-length');
      expect(lengthSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const interestsInput = document.getElementById('profesi-anak-interests');
      expect(interestsInput).toBeTruthy();
      
      const goalsInput = document.getElementById('profesi-anak-goals');
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
      const professionInput = document.getElementById('profesi-anak-profession');
      expect(professionInput.placeholder).toBeTruthy();
      
      const keywordsInput = document.getElementById('profesi-anak-keywords');
      expect(keywordsInput.placeholder).toBeTruthy();
      
      const ctaInput = document.getElementById('profesi-anak-cta');
      expect(ctaInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const interestsInput = document.getElementById('profesi-anak-interests');
      expect(interestsInput.placeholder).toBeTruthy();
      
      const goalsInput = document.getElementById('profesi-anak-goals');
      expect(goalsInput.placeholder).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
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
      const professionInput = document.getElementById('profesi-anak-profession');
      expect(professionInput.type).toBe('text');
      
      const keywordsInput = document.getElementById('profesi-anak-keywords');
      expect(keywordsInput.type).toBe('text');
      
      const ctaInput = document.getElementById('profesi-anak-cta');
      expect(ctaInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const interestsInput = document.getElementById('profesi-anak-interests');
      expect(interestsInput.rows).toBe(2);
      
      const goalsInput = document.getElementById('profesi-anak-goals');
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
      const resultsContainer = document.getElementById('profesi-anak-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      // Cards 2-6 (Age & Grade, Profession Category, Target Audience, Tone & Style, Additional Details) have form groups
      const formCards = Array.from(document.body.querySelectorAll('.card')).slice(1, 6);
      formCards.forEach(card => {
        const spaceDiv = card.querySelector('.space-y-4');
        expect(spaceDiv).toBeTruthy();
      });
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
      const resultsContainer = document.getElementById('profesi-anak-results-container');
      expect(resultsContainer.querySelector('#profesi-anak-empty-state')).toBeTruthy();
      expect(resultsContainer.querySelector('#profesi-anak-results')).toBeTruthy();
      expect(resultsContainer.querySelector('#profesi-anak-loading')).toBeTruthy();
    });
  });

  // Input Group Tests
  describe('Input Groups', () => {
    it('should have proper label styling', () => {
      const formLabels = [
        document.getElementById('profesi-anak-profession')?.closest('div').querySelector('label'),
        document.getElementById('profesi-anak-keywords')?.closest('div').querySelector('label')
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
      expect(loader.classList.contains('border-blue-500')).toBe(true);
      expect(loader.classList.contains('h-12')).toBe(true);
      expect(loader.classList.contains('w-12')).toBe(true);
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('profesi-anak-loading');
      expect(loading.textContent).toContain('Sedang membuat konten profesi anak');
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have proper empty state icon', () => {
      const emptyStateIcon = document.getElementById('profesi-anak-empty-state').querySelector('i.fas.fa-child');
      expect(emptyStateIcon).toBeTruthy();
      expect(emptyStateIcon.classList.contains('text-6xl')).toBe(true);
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('profesi-anak-empty-state');
      expect(emptyState.textContent).toContain('Hasil konten profesi anak akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Konten Profesi Anak');
    });

    it('should have proper empty state layout', () => {
      const emptyState = document.getElementById('profesi-anak-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
      expect(emptyState.classList.contains('text-gray-500')).toBe(true);
      expect(emptyState.classList.contains('py-12')).toBe(true);
    });
  });

  // Hover Effects Tests
  describe('Hover Effects', () => {
    it('should have hover effects on type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-blue-100')).toBe(true);
        expect(btn.classList.contains('transition')).toBe(true);
      });
    });

    it('should have hover effects on generate button', () => {
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Border and Focus States Tests
  describe('Border and Focus States', () => {
    it('should have proper border styling on inputs', () => {
      const inputs = document.body.querySelectorAll('input[type="text"], select');
      inputs.forEach(input => {
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('border-gray-300')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
      });
    });

    it('should have proper focus ring styling', () => {
      const inputs = document.body.querySelectorAll('input[type="text"], select, textarea');
      inputs.forEach(input => {
        expect(input.classList.contains('focus:ring-2')).toBe(true);
        expect(input.classList.contains('focus:ring-blue-500')).toBe(true);
        expect(input.classList.contains('focus:border-blue-500')).toBe(true);
      });
    });

    it('should have proper border styling on type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('border-2')).toBe(true);
        expect(btn.classList.contains('border-transparent')).toBe(true);
      });
    });
  });

  // Spacing and Padding Tests
  describe('Spacing and Padding', () => {
    it('should have proper padding on cards', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
      });
    });

    it('should have proper padding on generate button', () => {
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
    });

    it('should have proper spacing between cards', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      // Cards 2-6 (Age & Grade, Profession Category, Target Audience, Tone & Style, Additional Details) have form groups
      const formCards = Array.from(document.body.querySelectorAll('.card')).slice(1, 6);
      formCards.forEach(card => {
        const spaceDiv = card.querySelector('.space-y-4');
        expect(spaceDiv).toBeTruthy();
      });
    });
  });

  // Typography Tests
  describe('Typography', () => {
    it('should have proper title styling', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
      expect(title.classList.contains('font-bold')).toBe(true);
    });

    it('should have proper subtitle styling', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle.classList.contains('text-lg')).toBe(true);
      expect(subtitle.classList.contains('text-gray-600')).toBe(true);
      expect(subtitle.classList.contains('mt-2')).toBe(true);
    });

    it('should have proper section header styling', () => {
      const headers = document.body.querySelectorAll('h2');
      headers.forEach(header => {
        expect(header.classList.contains('text-xl')).toBe(true);
        expect(header.classList.contains('font-semibold')).toBe(true);
        expect(header.classList.contains('mb-4')).toBe(true);
      });
    });

    it('should have proper label styling', () => {
      const labels = document.body.querySelectorAll('label');
      labels.forEach(label => {
        expect(label.classList.contains('text-sm')).toBe(true);
        expect(label.classList.contains('font-medium')).toBe(true);
        expect(label.classList.contains('mb-1')).toBe(true);
      });
    });

    it('should have proper button text styling', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('text-sm')).toBe(true);
        expect(btn.querySelector('span').classList.contains('font-medium')).toBe(true);
      });
    });
  });

  // Background and Color Tests
  describe('Background and Color', () => {
    it('should have proper background colors', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have proper type button background', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('bg-gray-100')).toBe(true);
      });
    });

    it('should have proper text colors', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle.classList.contains('text-gray-600')).toBe(true);
      
      const sectionHeaders = document.body.querySelectorAll('h2');
      sectionHeaders.forEach(header => {
        expect(header.classList.contains('text-gray-800')).toBe(true);
      });
    });

    it('should have proper shadow effects', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('shadow-lg')).toBe(true);
      });
      
      const generateBtn = document.getElementById('profesi-anak-generate-btn');
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });
  });

  // Grid and Flex Layout Tests
  describe('Grid and Flex Layout', () => {
    it('should have proper main grid layout', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have proper type options grid layout', () => {
      const typeOptions = document.getElementById('profesi-anak-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper empty state flex layout', () => {
      const emptyState = document.getElementById('profesi-anak-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
    });

    it('should have proper loading flex layout', () => {
      const loading = document.getElementById('profesi-anak-loading');
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.classList.contains('items-center')).toBe(true);
      expect(loading.classList.contains('justify-center')).toBe(true);
    });

    it('should have proper results flex layout', () => {
      const results = document.getElementById('profesi-anak-results');
      expect(results.classList.contains('space-y-6')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have all required IDs', () => {
      expect(document.getElementById('content-profesi-anak')).toBeTruthy();
      expect(document.getElementById('profesi-anak-type-options')).toBeTruthy();
      expect(document.getElementById('profesi-anak-age')).toBeTruthy();
      expect(document.getElementById('profesi-anak-grade')).toBeTruthy();
      expect(document.getElementById('profesi-anak-category')).toBeTruthy();
      expect(document.getElementById('profesi-anak-profession')).toBeTruthy();
      expect(document.getElementById('profesi-anak-keywords')).toBeTruthy();
      expect(document.getElementById('profesi-anak-audience')).toBeTruthy();
      expect(document.getElementById('profesi-anak-interests')).toBeTruthy();
      expect(document.getElementById('profesi-anak-tone')).toBeTruthy();
      expect(document.getElementById('profesi-anak-style')).toBeTruthy();
      expect(document.getElementById('profesi-anak-length')).toBeTruthy();
      expect(document.getElementById('profesi-anak-goals')).toBeTruthy();
      expect(document.getElementById('profesi-anak-cta')).toBeTruthy();
      expect(document.getElementById('profesi-anak-generate-btn')).toBeTruthy();
      expect(document.getElementById('profesi-anak-results-container')).toBeTruthy();
      expect(document.getElementById('profesi-anak-empty-state')).toBeTruthy();
      expect(document.getElementById('profesi-anak-results')).toBeTruthy();
      expect(document.getElementById('profesi-anak-loading')).toBeTruthy();
    });

    it('should have proper data attributes on type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-profesi-anak');
      expect(typeBtns[0].getAttribute('data-type')).toBe('career-exploration');
      expect(typeBtns[1].getAttribute('data-type')).toBe('skills');
      expect(typeBtns[2].getAttribute('data-type')).toBe('education');
      expect(typeBtns[3].getAttribute('data-type')).toBe('inspiration');
      expect(typeBtns[4].getAttribute('data-type')).toBe('role-models');
      expect(typeBtns[5].getAttribute('data-type')).toBe('tips');
    });

    it('should have proper data-selected attribute on default type', () => {
      const defaultTypeBtn = document.body.querySelector('[data-type="career-exploration"]');
      expect(defaultTypeBtn.getAttribute('data-selected')).toBe('true');
      expect(defaultTypeBtn.classList.contains('selected')).toBe(true);
    });
  });
});
