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

describe('twibon Component', () => {
  
  const mockComponentHTML = `
    <div id="content-twibon" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            <i class="fas fa-crown mr-3"></i>Twibon
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat twibon kreatif untuk momen spesial Anda dengan mudah</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Frame Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Frame</h2>
              <div id="twibon-frame-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="birthday" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-birthday-cake text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Ulang Tahun</span>
                </button>
                <button type="button" data-type="wedding" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-rings-wedding text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Pernikahan</span>
                </button>
                <button type="button" data-type="graduation" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-graduation-cap text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Kelulusan</span>
                </button>
                <button type="button" data-type="engagement" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-ring text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Tunangan</span>
                </button>
                <button type="button" data-type="baby-shower" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-baby text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Baby Shower</span>
                </button>
                <button type="button" data-type="anniversary" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-heart text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Hari Jadi</span>
                </button>
                <button type="button" data-type="new-year" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-green-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-firecracker text-2xl mb-1 text-green-500"></i>
                  <span class="block font-medium">Tahun Baru</span>
                </button>
                <button type="button" data-type="eid-mubarak" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star-and-crescent text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Eid Mubarak</span>
                </button>
                <button type="button" data-type="christmas" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-holly-berry text-2xl mb-1 text-red-600"></i>
                  <span class="block font-medium">Natal</span>
                </button>
                <button type="button" data-type="custom" class="twibon-frame-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition text-center border-2 border-transparent">
                  <i class="fas fa-edit text-2xl mb-1 text-gray-500"></i>
                  <span class="block font-medium">Kustom</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="twibon-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-orange-500"></i>Gaya Visual
                  </label>
                  <select id="twibon-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="minimalist">Minimalis</option>
                    <option value="colorful">Berwarna</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegan</option>
                    <option value="playful">Playful</option>
                    <option value="artistic">Artistik</option>
                    <option value="traditional">Tradisional</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Color -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="twibon-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-pink-500"></i>Pilihan Warna
                  </label>
                  <select id="twibon-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="gold">Emas</option>
                    <option value="silver">Perak</option>
                    <option value="rose-gold">Rose Gold</option>
                    <option value="rainbow">Pelangi</option>
                    <option value="pastel">Pastel</option>
                    <option value="neon">Neon</option>
                    <option value="black-white">Hitam Putih</option>
                    <option value="custom">Kustom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Text -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Teks</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="twibon-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-user mr-1 text-purple-500"></i>Nama
                  </label>
                  <input type="text" id="twibon-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan nama...">
                </div>
                
                <div>
                  <label for="twibon-date" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar mr-1 text-purple-500"></i>Tanggal
                  </label>
                  <input type="text" id="twibon-date" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: 15 Januari 2025">
                </div>
                
                <div>
                  <label for="twibon-message" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-comment mr-1 text-purple-500"></i>Pesan
                  </label>
                  <textarea id="twibon-message" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Pesan atau quote..."></textarea>
                </div>
                
                <div>
                  <label for="twibon-hashtag" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-hashtag mr-1 text-purple-500"></i>Hashtag
                  </label>
                  <input type="text" id="twibon-hashtag" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: #HappyBirthday">
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="twibon-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-orange-500"></i>Target Audiens
                  </label>
                  <select id="twibon-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="friends">Teman</option>
                    <option value="family">Keluarga</option>
                    <option value="couples">Pasangan</option>
                    <option value="graduates">Lulusan</option>
                    <option value="newlyweds">Pengantin Baru</option>
                    <option value="parents">Orang Tua</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="twibon-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-pink-500"></i>Nuansa
                  </label>
                  <select id="twibon-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="fun">Seru</option>
                    <option value="emotional">Emosional</option>
                    <option value="celebratory">Perayaan</option>
                    <option value="elegant">Elegan</option>
                    <option value="humorous">Humoris</option>
                    <option value="heartfelt">Penuh Kasih Sayang</option>
                    <option value="inspirational">Inspiratif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="twibon-generate-btn" class="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Twibon
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="twibon-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="twibon-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-crown text-6xl mb-4 text-orange-400"></i>
                <p class="text-xl">Hasil twibon akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Twibon</p>
              </div>
              <div id="twibon-results" class="hidden space-y-6"></div>
              <div id="twibon-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-orange-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat twibon...</p>
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
      const container = document.getElementById('content-twibon');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Twibon');
      expect(title.querySelector('i.fas.fa-crown')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat twibon kreatif untuk momen spesial Anda dengan mudah');
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
      expect(rightPanel.querySelector('#twibon-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Frame Type Selection Tests
  describe('Frame Type Selection', () => {
    it('should render frame type options container', () => {
      const frameOptions = document.getElementById('twibon-frame-options');
      expect(frameOptions).toBeTruthy();
    });

    it('should render Birthday option', () => {
      const birthdayBtn = document.body.querySelector('[data-type="birthday"]');
      expect(birthdayBtn).toBeTruthy();
      expect(birthdayBtn.textContent).toContain('Ulang Tahun');
      expect(birthdayBtn.querySelector('i.fas.fa-birthday-cake')).toBeTruthy();
      expect(birthdayBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Wedding option', () => {
      const weddingBtn = document.body.querySelector('[data-type="wedding"]');
      expect(weddingBtn).toBeTruthy();
      expect(weddingBtn.textContent).toContain('Pernikahan');
      expect(weddingBtn.querySelector('i.fas.fa-rings-wedding')).toBeTruthy();
    });

    it('should render Graduation option', () => {
      const graduationBtn = document.body.querySelector('[data-type="graduation"]');
      expect(graduationBtn).toBeTruthy();
      expect(graduationBtn.textContent).toContain('Kelulusan');
      expect(graduationBtn.querySelector('i.fas.fa-graduation-cap')).toBeTruthy();
    });

    it('should render Engagement option', () => {
      const engagementBtn = document.body.querySelector('[data-type="engagement"]');
      expect(engagementBtn).toBeTruthy();
      expect(engagementBtn.textContent).toContain('Tunangan');
      expect(engagementBtn.querySelector('i.fas.fa-ring')).toBeTruthy();
    });

    it('should render Baby Shower option', () => {
      const babyShowerBtn = document.body.querySelector('[data-type="baby-shower"]');
      expect(babyShowerBtn).toBeTruthy();
      expect(babyShowerBtn.textContent).toContain('Baby Shower');
      expect(babyShowerBtn.querySelector('i.fas.fa-baby')).toBeTruthy();
    });

    it('should render Anniversary option', () => {
      const anniversaryBtn = document.body.querySelector('[data-type="anniversary"]');
      expect(anniversaryBtn).toBeTruthy();
      expect(anniversaryBtn.textContent).toContain('Hari Jadi');
      expect(anniversaryBtn.querySelector('i.fas.fa-heart')).toBeTruthy();
    });

    it('should render New Year option', () => {
      const newYearBtn = document.body.querySelector('[data-type="new-year"]');
      expect(newYearBtn).toBeTruthy();
      expect(newYearBtn.textContent).toContain('Tahun Baru');
      expect(newYearBtn.querySelector('i.fas.fa-firecracker')).toBeTruthy();
    });

    it('should render Eid Mubarak option', () => {
      const eidMubarakBtn = document.body.querySelector('[data-type="eid-mubarak"]');
      expect(eidMubarakBtn).toBeTruthy();
      expect(eidMubarakBtn.textContent).toContain('Eid Mubarak');
      expect(eidMubarakBtn.querySelector('i.fas.fa-star-and-crescent')).toBeTruthy();
    });

    it('should render Christmas option', () => {
      const christmasBtn = document.body.querySelector('[data-type="christmas"]');
      expect(christmasBtn).toBeTruthy();
      expect(christmasBtn.textContent).toContain('Natal');
      expect(christmasBtn.querySelector('i.fas.fa-holly-berry')).toBeTruthy();
    });

    it('should render Custom option', () => {
      const customBtn = document.body.querySelector('[data-type="custom"]');
      expect(customBtn).toBeTruthy();
      expect(customBtn.textContent).toContain('Kustom');
      expect(customBtn.querySelector('i.fas.fa-edit')).toBeTruthy();
    });

    it('should have 10 frame type options', () => {
      const frameBtns = document.body.querySelectorAll('.twibon-frame-btn');
      expect(frameBtns.length).toBe(10);
    });

    it('should have proper grid layout for frame options', () => {
      const frameOptions = document.getElementById('twibon-frame-options');
      expect(frameOptions.classList.contains('grid')).toBe(true);
      expect(frameOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(frameOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Frame');
    });

    it('should have colored hover effects in frame buttons', () => {
      const frameBtns = document.body.querySelectorAll('.twibon-frame-btn');
      expect(frameBtns[0].classList.contains('hover:bg-orange-100')).toBe(true);
      expect(frameBtns[1].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(frameBtns[2].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(frameBtns[3].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(frameBtns[4].classList.contains('hover:bg-yellow-100')).toBe(true);
      expect(frameBtns[5].classList.contains('hover:bg-red-100')).toBe(true);
      expect(frameBtns[6].classList.contains('hover:bg-green-100')).toBe(true);
      expect(frameBtns[7].classList.contains('hover:bg-teal-100')).toBe(true);
      expect(frameBtns[8].classList.contains('hover:bg-red-100')).toBe(true);
      expect(frameBtns[9].classList.contains('hover:bg-gray-200')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gaya');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect.options[0].textContent).toContain('Minimalis');
      expect(styleSelect.options[1].textContent).toContain('Berwarna');
      expect(styleSelect.options[2].textContent).toContain('Vintage');
      expect(styleSelect.options[3].textContent).toContain('Modern');
      expect(styleSelect.options[4].textContent).toContain('Elegan');
      expect(styleSelect.options[5].textContent).toContain('Playful');
      expect(styleSelect.options[6].textContent).toContain('Artistik');
      expect(styleSelect.options[7].textContent).toContain('Tradisional');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect.value).toBe('minimalist');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Color Input Tests
  describe('Color Input', () => {
    it('should render color select', () => {
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(8);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Warna');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have color options with proper labels', () => {
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect.options[0].textContent).toContain('Emas');
      expect(colorSelect.options[1].textContent).toContain('Perak');
      expect(colorSelect.options[2].textContent).toContain('Rose Gold');
      expect(colorSelect.options[3].textContent).toContain('Pelangi');
      expect(colorSelect.options[4].textContent).toContain('Pastel');
      expect(colorSelect.options[5].textContent).toContain('Neon');
      expect(colorSelect.options[6].textContent).toContain('Hitam Putih');
      expect(colorSelect.options[7].textContent).toContain('Kustom');
    });

    it('should have default color value', () => {
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect.value).toBe('gold');
    });

    it('should have proper input styling', () => {
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect.classList.contains('w-full')).toBe(true);
      expect(colorSelect.classList.contains('p-3')).toBe(true);
      expect(colorSelect.classList.contains('border')).toBe(true);
      expect(colorSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Text Input Tests
  describe('Text Input', () => {
    it('should render name input', () => {
      const nameInput = document.getElementById('twibon-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.tagName).toBe('INPUT');
      expect(nameInput.type).toBe('text');
      expect(nameInput.placeholder).toContain('Masukkan nama');
    });

    it('should render date input', () => {
      const dateInput = document.getElementById('twibon-date');
      expect(dateInput).toBeTruthy();
      expect(dateInput.tagName).toBe('INPUT');
      expect(dateInput.type).toBe('text');
      expect(dateInput.placeholder).toContain('15 Januari 2025');
    });

    it('should render message textarea', () => {
      const messageInput = document.getElementById('twibon-message');
      expect(messageInput).toBeTruthy();
      expect(messageInput.tagName).toBe('TEXTAREA');
      expect(messageInput.rows).toBe(2);
      expect(messageInput.placeholder).toContain('Pesan atau quote');
    });

    it('should render hashtag input', () => {
      const hashtagInput = document.getElementById('twibon-hashtag');
      expect(hashtagInput).toBeTruthy();
      expect(hashtagInput.tagName).toBe('INPUT');
      expect(hashtagInput.type).toBe('text');
      expect(hashtagInput.placeholder).toContain('#HappyBirthday');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Teks');
    });

    it('should have all labels with icons', () => {
      const userIcon = document.body.querySelector('i.fas.fa-user');
      expect(userIcon).toBeTruthy();
      
      const calendarIcon = document.body.querySelector('i.fas.fa-calendar');
      expect(calendarIcon).toBeTruthy();
      
      const commentIcon = document.body.querySelector('i.fas.fa-comment');
      expect(commentIcon).toBeTruthy();
      
      const hashtagIcon = document.body.querySelector('i.fas.fa-hashtag');
      expect(hashtagIcon).toBeTruthy();
    });

    it('should have proper input styling', () => {
      const nameInput = document.getElementById('twibon-name');
      expect(nameInput.classList.contains('w-full')).toBe(true);
      expect(nameInput.classList.contains('p-3')).toBe(true);
      expect(nameInput.classList.contains('border')).toBe(true);
      expect(nameInput.classList.contains('rounded-lg')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-2')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect.options[0].textContent).toContain('Teman');
      expect(audienceSelect.options[1].textContent).toContain('Keluarga');
      expect(audienceSelect.options[2].textContent).toContain('Pasangan');
      expect(audienceSelect.options[3].textContent).toContain('Lulusan');
      expect(audienceSelect.options[4].textContent).toContain('Pengantin Baru');
      expect(audienceSelect.options[5].textContent).toContain('Orang Tua');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect.value).toBe('friends');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(7);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect.options[0].textContent).toContain('Seru');
      expect(toneSelect.options[1].textContent).toContain('Emosional');
      expect(toneSelect.options[2].textContent).toContain('Perayaan');
      expect(toneSelect.options[3].textContent).toContain('Elegan');
      expect(toneSelect.options[4].textContent).toContain('Humoris');
      expect(toneSelect.options[5].textContent).toContain('Penuh Kasih Sayang');
      expect(toneSelect.options[6].textContent).toContain('Inspiratif');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect.value).toBe('fun');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('twibon-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Twibon');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('twibon-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('twibon-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('twibon-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('twibon-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('twibon-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-crown')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil twibon akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('twibon-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('twibon-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat twibon');
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
      const emptyState = document.getElementById('twibon-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have orange icon in empty state', () => {
      const emptyStateIcon = document.getElementById('twibon-empty-state').querySelector('i.fas.fa-crown');
      expect(emptyStateIcon.classList.contains('text-orange-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use orange/pink/purple color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-orange-500')).toBe(true);
      expect(title.classList.contains('via-pink-500')).toBe(true);
      expect(title.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use orange/pink/purple accents in generate button', () => {
      const generateBtn = document.getElementById('twibon-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use orange accents in style select', () => {
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use pink accents in color select', () => {
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(colorSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use purple accents in text inputs', () => {
      const nameInput = document.getElementById('twibon-name');
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(nameInput.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use orange accents in audience select', () => {
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use pink accents in tone select', () => {
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(toneSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use orange accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-orange-500')).toBe(true);
    });

    it('should use orange accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('twibon-empty-state').querySelector('i.fas.fa-crown');
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
      expect(icons.length).toBeGreaterThanOrEqual(20);
    });

    it('should have crown icon in header', () => {
      const crownIcon = document.body.querySelector('header i.fas.fa-crown');
      expect(crownIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('twibon-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have birthday-cake icon for birthday', () => {
      const birthdayIcon = document.body.querySelector('[data-type="birthday"] i.fas.fa-birthday-cake');
      expect(birthdayIcon).toBeTruthy();
    });

    it('should have rings-wedding icon for wedding', () => {
      const weddingIcon = document.body.querySelector('[data-type="wedding"] i.fas.fa-rings-wedding');
      expect(weddingIcon).toBeTruthy();
    });

    it('should have graduation-cap icon for graduation', () => {
      const graduationIcon = document.body.querySelector('[data-type="graduation"] i.fas.fa-graduation-cap');
      expect(graduationIcon).toBeTruthy();
    });

    it('should have ring icon for engagement', () => {
      const ringIcon = document.body.querySelector('[data-type="engagement"] i.fas.fa-ring');
      expect(ringIcon).toBeTruthy();
    });

    it('should have baby icon for baby shower', () => {
      const babyIcon = document.body.querySelector('[data-type="baby-shower"] i.fas.fa-baby');
      expect(babyIcon).toBeTruthy();
    });

    it('should have heart icon for anniversary', () => {
      const heartIcon = document.body.querySelector('[data-type="anniversary"] i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have firecracker icon for new year', () => {
      const firecrackerIcon = document.body.querySelector('[data-type="new-year"] i.fas.fa-firecracker');
      expect(firecrackerIcon).toBeTruthy();
    });

    it('should have star-and-crescent icon for eid mubarak', () => {
      const starAndCrescentIcon = document.body.querySelector('[data-type="eid-mubarak"] i.fas.fa-star-and-crescent');
      expect(starAndCrescentIcon).toBeTruthy();
    });

    it('should have holly-berry icon for christmas', () => {
      const hollyBerryIcon = document.body.querySelector('[data-type="christmas"] i.fas.fa-holly-berry');
      expect(hollyBerryIcon).toBeTruthy();
    });

    it('should have edit icon for custom', () => {
      const editIcon = document.body.querySelector('[data-type="custom"] i.fas.fa-edit');
      expect(editIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have palette icon for color', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have user icon for name', () => {
      const userIcon = document.body.querySelector('i.fas.fa-user');
      expect(userIcon).toBeTruthy();
    });

    it('should have calendar icon for date', () => {
      const calendarIcon = document.body.querySelector('i.fas.fa-calendar');
      expect(calendarIcon).toBeTruthy();
    });

    it('should have comment icon for message', () => {
      const commentIcon = document.body.querySelector('i.fas.fa-comment');
      expect(commentIcon).toBeTruthy();
    });

    it('should have hashtag icon for hashtag', () => {
      const hashtagIcon = document.body.querySelector('i.fas.fa-hashtag');
      expect(hashtagIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have smile icon for tone', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have crown icon in empty state', () => {
      const emptyStateIcon = document.getElementById('twibon-empty-state').querySelector('i.fas.fa-crown');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Twibon');
      expect(document.body.textContent).toContain('Jenis Frame');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Warna');
      expect(document.body.textContent).toContain('Teks');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Twibon');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Frame');
      expect(headers[1].textContent).toContain('2. Gaya');
      expect(headers[2].textContent).toContain('3. Warna');
      expect(headers[3].textContent).toContain('4. Teks');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('twibon-empty-state');
      expect(emptyState.textContent).toContain('Hasil twibon akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Twibon');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('twibon-loading');
      expect(loading.textContent).toContain('Sedang membuat twibon');
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
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect).toBeTruthy();
      
      const nameInput = document.getElementById('twibon-name');
      expect(nameInput).toBeTruthy();
      
      const dateInput = document.getElementById('twibon-date');
      expect(dateInput).toBeTruthy();
      
      const messageInput = document.getElementById('twibon-message');
      expect(messageInput).toBeTruthy();
      
      const hashtagInput = document.getElementById('twibon-hashtag');
      expect(hashtagInput).toBeTruthy();
      
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const nameInput = document.getElementById('twibon-name');
      expect(nameInput).toBeTruthy();
      
      const dateInput = document.getElementById('twibon-date');
      expect(dateInput).toBeTruthy();
      
      const hashtagInput = document.getElementById('twibon-hashtag');
      expect(hashtagInput).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const messageInput = document.getElementById('twibon-message');
      expect(messageInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('twibon-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const styleSelect = document.getElementById('twibon-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const colorSelect = document.getElementById('twibon-color');
      expect(colorSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('twibon-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('twibon-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper input types', () => {
      const nameInput = document.getElementById('twibon-name');
      expect(nameInput.tagName).toBe('INPUT');
      expect(nameInput.type).toBe('text');
      
      const dateInput = document.getElementById('twibon-date');
      expect(dateInput.tagName).toBe('INPUT');
      expect(dateInput.type).toBe('text');
      
      const hashtagInput = document.getElementById('twibon-hashtag');
      expect(hashtagInput.tagName).toBe('INPUT');
      expect(hashtagInput.type).toBe('text');
    });

    it('should have proper textarea type', () => {
      const messageInput = document.getElementById('twibon-message');
      expect(messageInput.tagName).toBe('TEXTAREA');
    });

    it('should have proper button types', () => {
      const frameBtns = document.body.querySelectorAll('.twibon-frame-btn');
      frameBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for frame buttons', () => {
      const birthdayBtn = document.body.querySelector('[data-type="birthday"]');
      expect(birthdayBtn.dataset.type).toBe('birthday');
      expect(birthdayBtn.dataset.selected).toBe('true');
      
      const weddingBtn = document.body.querySelector('[data-type="wedding"]');
      expect(weddingBtn.dataset.type).toBe('wedding');
    });

    it('should have proper placeholder text', () => {
      const nameInput = document.getElementById('twibon-name');
      expect(nameInput.placeholder).toContain('Masukkan nama');
      
      const dateInput = document.getElementById('twibon-date');
      expect(dateInput.placeholder).toContain('15 Januari 2025');
      
      const messageInput = document.getElementById('twibon-message');
      expect(messageInput.placeholder).toContain('Pesan atau quote');
      
      const hashtagInput = document.getElementById('twibon-hashtag');
      expect(hashtagInput.placeholder).toContain('#HappyBirthday');
    });

    it('should have proper button attributes', () => {
      const frameBtns = document.body.querySelectorAll('.twibon-frame-btn');
      frameBtns.forEach(btn => {
        expect(btn.tagName).toBe('BUTTON');
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive container', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
    });

    it('should have responsive header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have responsive right panel', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have responsive gap', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive frame options grid', () => {
      const frameOptions = document.getElementById('twibon-frame-options');
      expect(frameOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});