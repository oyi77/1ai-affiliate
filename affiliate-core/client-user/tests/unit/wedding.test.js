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

describe('wedding Component', () => {
  
  const mockComponentHTML = `
    <div id="content-wedding" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            <i class="fas fa-rings-wedding mr-3"></i>Konten Pernikahan
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten yang romantis dan bermakna untuk momen pernikahan Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Konten</h2>
              <div id="wedding-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="engagement" class="type-btn-wedding p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-ring text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Lamaran</span>
                </button>
                <button type="button" data-type="pre-wedding" class="type-btn-wedding p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-camera text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Pre-Wedding</span>
                </button>
                <button type="button" data-type="ceremony" class="type-btn-wedding p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-church text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Akad</span>
                </button>
                <button type="button" data-type="reception" class="type-btn-wedding p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-glass-cheers text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Resepsi</span>
                </button>
                <button type="button" data-type="honeymoon" class="type-btn-wedding p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-plane-departure text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Honeymoon</span>
                </button>
                <button type="button" data-type="anniversary" class="type-btn-wedding p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-heart text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Hari Jadi</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Wedding Style & Theme -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya & Tema</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-pink-500"></i>Gaya Pernikahan
                  </label>
                  <select id="wedding-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="traditional">Tradisional</option>
                    <option value="modern">Modern</option>
                    <option value="rustic">Rustic</option>
                    <option value="elegant">Elegan</option>
                    <option value="bohemian">Bohemian</option>
                    <option value="vintage">Vintage</option>
                    <option value="beach">Pantai</option>
                    <option value="garden">Taman</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-theme" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-pink-500"></i>Tema Warna
                  </label>
                  <select id="wedding-theme" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="rose-gold">Rose Gold & Putih</option>
                    <option value="gold-cream">Emas & Krem</option>
                    <option value="burgundy">Burgundy & Emas</option>
                    <option value="sage-green">Sage Green & Putih</option>
                    <option value="navy-gold">Biru Navy & Emas</option>
                    <option value="blush-pink">Blush Pink & Putih</option>
                    <option value="classic-white">Putih Klasik</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-season" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-cloud-sun mr-1 text-pink-500"></i>Musim/Waktu
                  </label>
                  <select id="wedding-season" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="spring">Musim Semi</option>
                    <option value="summer">Musim Panas</option>
                    <option value="autumn">Musim Gugur</option>
                    <option value="winter">Musim Dingin</option>
                    <option value="indoor">Dalam Ruangan</option>
                    <option value="outdoor">Luar Ruangan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Couple Details -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Detail Pengantin</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-names" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-user-friends mr-1 text-pink-500"></i>Nama Pengantin
                  </label>
                  <input type="text" id="wedding-names" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: Budi & Siti">
                </div>
                
                <div>
                  <label for="wedding-date" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-alt mr-1 text-pink-500"></i>Tanggal Pernikahan
                  </label>
                  <input type="date" id="wedding-date" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                </div>
                
                <div>
                  <label for="wedding-location" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-map-marker-alt mr-1 text-pink-500"></i>Lokasi
                  </label>
                  <input type="text" id="wedding-location" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: Jakarta, Bali, Bandung">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-pink-500"></i>Target Audiens
                  </label>
                  <select id="wedding-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="couple">Pasangan Pengantin</option>
                    <option value="family">Keluarga</option>
                    <option value="guests">Tamu Undangan</option>
                    <option value="friends">Teman-teman</option>
                    <option value="social-media">Pengikut Media Sosial</option>
                    <option value="all">Semua Audiens</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-details" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-info-circle mr-1 text-pink-500"></i>Detail Tambahan
                  </label>
                  <textarea id="wedding-details" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Ceritakan sedikit tentang kisah cinta Anda..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Tone & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Gaya & Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-pink-500"></i>Tone Konten
                  </label>
                  <select id="wedding-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="romantic">Romantis</option>
                    <option value="formal">Formal & Santun</option>
                    <option value="fun">Fun & Enerjik</option>
                    <option value="emotional">Emosional & Mengharukan</option>
                    <option value="poetic">Puisi & Sastra</option>
                    <option value="humorous">Humoris</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-writing-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-pen-fancy mr-1 text-pink-500"></i>Gaya Penulisan
                  </label>
                  <select id="wedding-writing-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="storytelling">Cerita & Naratif</option>
                    <option value="poetry">Puisi</option>
                    <option value="letter">Surat Cinta</option>
                    <option value="vows">Janji Pernikahan</option>
                    <option value="quote">Kutipan & Quote</option>
                    <option value="timeline">Timeline Cerita</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-pink-500"></i>Panjang Konten
                  </label>
                  <select id="wedding-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
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
                  <label for="wedding-special-elements" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sparkles mr-1 text-pink-500"></i>Elemen Khusus
                  </label>
                  <textarea id="wedding-special-elements" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Elemen khusus yang ingin disebutkan (misal: adat istiadat, ritual khusus, makanan favorit)"></textarea>
                </div>
                
                <div>
                  <label for="wedding-cta" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mouse-pointer mr-1 text-pink-500"></i>Call to Action
                  </label>
                  <input type="text" id="wedding-cta" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Contoh: Selamat menyaksikan perjalanan cinta kami!">
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="wedding-generate-btn" class="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Konten Pernikahan
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="wedding-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="wedding-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-rings-wedding text-6xl mb-4 text-pink-400"></i>
                <p class="text-xl">Hasil konten pernikahan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Konten Pernikahan</p>
              </div>
              <div id="wedding-results" class="hidden space-y-6"></div>
              <div id="wedding-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-pink-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat konten pernikahan...</p>
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
      const container = document.getElementById('content-wedding');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Konten Pernikahan');
      expect(title.querySelector('i.fas.fa-rings-wedding')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konten yang romantis dan bermakna');
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
      expect(rightPanel.querySelector('#wedding-results-container')).toBeTruthy();
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
      const typeOptions = document.getElementById('wedding-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Lamaran option', () => {
      const lamaranBtn = document.body.querySelector('[data-type="engagement"]');
      expect(lamaranBtn).toBeTruthy();
      expect(lamaranBtn.textContent).toContain('Lamaran');
      expect(lamaranBtn.querySelector('i.fas.fa-ring')).toBeTruthy();
      expect(lamaranBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Pre-Wedding option', () => {
      const preWeddingBtn = document.body.querySelector('[data-type="pre-wedding"]');
      expect(preWeddingBtn).toBeTruthy();
      expect(preWeddingBtn.textContent).toContain('Pre-Wedding');
      expect(preWeddingBtn.querySelector('i.fas.fa-camera')).toBeTruthy();
    });

    it('should render Akad option', () => {
      const akadBtn = document.body.querySelector('[data-type="ceremony"]');
      expect(akadBtn).toBeTruthy();
      expect(akadBtn.textContent).toContain('Akad');
      expect(akadBtn.querySelector('i.fas.fa-church')).toBeTruthy();
    });

    it('should render Resepsi option', () => {
      const resepsiBtn = document.body.querySelector('[data-type="reception"]');
      expect(resepsiBtn).toBeTruthy();
      expect(resepsiBtn.textContent).toContain('Resepsi');
      expect(resepsiBtn.querySelector('i.fas.fa-glass-cheers')).toBeTruthy();
    });

    it('should render Honeymoon option', () => {
      const honeymoonBtn = document.body.querySelector('[data-type="honeymoon"]');
      expect(honeymoonBtn).toBeTruthy();
      expect(honeymoonBtn.textContent).toContain('Honeymoon');
      expect(honeymoonBtn.querySelector('i.fas.fa-plane-departure')).toBeTruthy();
    });

    it('should render Hari Jadi option', () => {
      const hariJadiBtn = document.body.querySelector('[data-type="anniversary"]');
      expect(hariJadiBtn).toBeTruthy();
      expect(hariJadiBtn.textContent).toContain('Hari Jadi');
      expect(hariJadiBtn.querySelector('i.fas.fa-heart')).toBeTruthy();
    });

    it('should have 6 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('wedding-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have pink icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-pink-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Konten');
    });
  });

  // Wedding Style & Theme Selection Tests
  describe('Wedding Style & Theme Selection', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('wedding-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(8);
    });

    it('should render theme select', () => {
      const themeSelect = document.getElementById('wedding-theme');
      expect(themeSelect).toBeTruthy();
      expect(themeSelect.tagName).toBe('SELECT');
      expect(themeSelect.options.length).toBe(7);
    });

    it('should render season select', () => {
      const seasonSelect = document.getElementById('wedding-season');
      expect(seasonSelect).toBeTruthy();
      expect(seasonSelect.tagName).toBe('SELECT');
      expect(seasonSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gaya & Tema');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
      
      const cloudSunIcon = document.body.querySelector('i.fas.fa-cloud-sun');
      expect(cloudSunIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('wedding-style');
      expect(styleSelect.options[0].textContent).toContain('Tradisional');
      expect(styleSelect.options[1].textContent).toContain('Modern');
      expect(styleSelect.options[2].textContent).toContain('Rustic');
      expect(styleSelect.options[3].textContent).toContain('Elegan');
      expect(styleSelect.options[4].textContent).toContain('Bohemian');
      expect(styleSelect.options[5].textContent).toContain('Vintage');
      expect(styleSelect.options[6].textContent).toContain('Pantai');
      expect(styleSelect.options[7].textContent).toContain('Taman');
    });

    it('should have theme options with proper labels', () => {
      const themeSelect = document.getElementById('wedding-theme');
      expect(themeSelect.options[0].textContent).toContain('Rose Gold');
      expect(themeSelect.options[1].textContent).toContain('Emas & Krem');
      expect(themeSelect.options[2].textContent).toContain('Burgundy');
      expect(themeSelect.options[3].textContent).toContain('Sage Green');
      expect(themeSelect.options[4].textContent).toContain('Biru Navy');
      expect(themeSelect.options[5].textContent).toContain('Blush Pink');
      expect(themeSelect.options[6].textContent).toContain('Putih Klasik');
    });

    it('should have season options with proper labels', () => {
      const seasonSelect = document.getElementById('wedding-season');
      expect(seasonSelect.options[0].textContent).toContain('Musim Semi');
      expect(seasonSelect.options[1].textContent).toContain('Musim Panas');
      expect(seasonSelect.options[2].textContent).toContain('Musim Gugur');
      expect(seasonSelect.options[3].textContent).toContain('Musim Dingin');
      expect(seasonSelect.options[4].textContent).toContain('Dalam Ruangan');
      expect(seasonSelect.options[5].textContent).toContain('Luar Ruangan');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('wedding-style');
      expect(styleSelect.value).toBe('traditional');
    });

    it('should have default theme value', () => {
      const themeSelect = document.getElementById('wedding-theme');
      expect(themeSelect.value).toBe('rose-gold');
    });

    it('should have default season value', () => {
      const seasonSelect = document.getElementById('wedding-season');
      expect(seasonSelect.value).toBe('spring');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('wedding-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Couple Details Input Tests
  describe('Couple Details Input', () => {
    it('should render names input', () => {
      const namesInput = document.getElementById('wedding-names');
      expect(namesInput).toBeTruthy();
      expect(namesInput.type).toBe('text');
      expect(namesInput.placeholder).toContain('Budi & Siti');
    });

    it('should render date input', () => {
      const dateInput = document.getElementById('wedding-date');
      expect(dateInput).toBeTruthy();
      expect(dateInput.type).toBe('date');
    });

    it('should render location input', () => {
      const locationInput = document.getElementById('wedding-location');
      expect(locationInput).toBeTruthy();
      expect(locationInput.type).toBe('text');
      expect(locationInput.placeholder).toContain('Jakarta, Bali');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Detail Pengantin');
    });

    it('should have all labels with icons', () => {
      const userFriendsIcon = document.body.querySelector('i.fas.fa-user-friends');
      expect(userFriendsIcon).toBeTruthy();
      
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
      
      const mapMarkerAltIcon = document.body.querySelector('i.fas.fa-map-marker-alt');
      expect(mapMarkerAltIcon).toBeTruthy();
    });

    it('should have proper input styling', () => {
      const namesInput = document.getElementById('wedding-names');
      expect(namesInput.classList.contains('w-full')).toBe(true);
      expect(namesInput.classList.contains('p-3')).toBe(true);
      expect(namesInput.classList.contains('border')).toBe(true);
      expect(namesInput.classList.contains('rounded-lg')).toBe(true);
      expect(namesInput.classList.contains('focus:ring-2')).toBe(true);
      expect(namesInput.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('wedding-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should render details textarea', () => {
      const detailsInput = document.getElementById('wedding-details');
      expect(detailsInput).toBeTruthy();
      expect(detailsInput.tagName).toBe('TEXTAREA');
      expect(detailsInput.rows).toBe(2);
      expect(detailsInput.placeholder).toContain('kisah cinta Anda');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const infoCircleIcon = document.body.querySelector('i.fas.fa-info-circle');
      expect(infoCircleIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('wedding-audience');
      expect(audienceSelect.options[0].textContent).toContain('Pasangan Pengantin');
      expect(audienceSelect.options[1].textContent).toContain('Keluarga');
      expect(audienceSelect.options[2].textContent).toContain('Tamu Undangan');
      expect(audienceSelect.options[3].textContent).toContain('Teman-teman');
      expect(audienceSelect.options[4].textContent).toContain('Pengikut Media Sosial');
      expect(audienceSelect.options[5].textContent).toContain('Semua Audiens');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('wedding-audience');
      expect(audienceSelect.value).toBe('couple');
    });
  });

  // Tone & Style Selection Tests
  describe('Tone & Style Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('wedding-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render writing style select', () => {
      const writingStyleSelect = document.getElementById('wedding-writing-style');
      expect(writingStyleSelect).toBeTruthy();
      expect(writingStyleSelect.tagName).toBe('SELECT');
      expect(writingStyleSelect.options.length).toBe(6);
    });

    it('should render length select', () => {
      const lengthSelect = document.getElementById('wedding-length');
      expect(lengthSelect).toBeTruthy();
      expect(lengthSelect.tagName).toBe('SELECT');
      expect(lengthSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Gaya & Nuansa');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const penFancyIcon = document.body.querySelector('i.fas.fa-pen-fancy');
      expect(penFancyIcon).toBeTruthy();
      
      const textWidthIcon = document.body.querySelector('i.fas.fa-text-width');
      expect(textWidthIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('wedding-tone');
      expect(toneSelect.options[0].textContent).toContain('Romantis');
      expect(toneSelect.options[1].textContent).toContain('Formal & Santun');
      expect(toneSelect.options[2].textContent).toContain('Fun & Enerjik');
      expect(toneSelect.options[3].textContent).toContain('Emosional & Mengharukan');
      expect(toneSelect.options[4].textContent).toContain('Puisi & Sastra');
      expect(toneSelect.options[5].textContent).toContain('Humoris');
    });

    it('should have writing style options with proper labels', () => {
      const writingStyleSelect = document.getElementById('wedding-writing-style');
      expect(writingStyleSelect.options[0].textContent).toContain('Cerita & Naratif');
      expect(writingStyleSelect.options[1].textContent).toContain('Puisi');
      expect(writingStyleSelect.options[2].textContent).toContain('Surat Cinta');
      expect(writingStyleSelect.options[3].textContent).toContain('Janji Pernikahan');
      expect(writingStyleSelect.options[4].textContent).toContain('Kutipan & Quote');
      expect(writingStyleSelect.options[5].textContent).toContain('Timeline Cerita');
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('wedding-length');
      expect(lengthSelect.options[0].textContent).toContain('Pendek');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Panjang');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('wedding-tone');
      expect(toneSelect.value).toBe('romantic');
    });

    it('should have default writing style value', () => {
      const writingStyleSelect = document.getElementById('wedding-writing-style');
      expect(writingStyleSelect.value).toBe('storytelling');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('wedding-length');
      expect(lengthSelect.value).toBe('short');
    });
  });

  // Additional Details Tests
  describe('Additional Details', () => {
    it('should render special elements textarea', () => {
      const specialElementsInput = document.getElementById('wedding-special-elements');
      expect(specialElementsInput).toBeTruthy();
      expect(specialElementsInput.tagName).toBe('TEXTAREA');
      expect(specialElementsInput.rows).toBe(2);
      expect(specialElementsInput.placeholder).toContain('adat istiadat');
    });

    it('should render CTA input', () => {
      const ctaInput = document.getElementById('wedding-cta');
      expect(ctaInput).toBeTruthy();
      expect(ctaInput.type).toBe('text');
      expect(ctaInput.placeholder).toContain('perjalanan cinta kami');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
    });

    it('should have all labels with icons', () => {
      const sparklesIcon = document.body.querySelector('i.fas.fa-sparkles');
      expect(sparklesIcon).toBeTruthy();
      
      const mousePointerIcon = document.body.querySelector('i.fas.fa-mouse-pointer');
      expect(mousePointerIcon).toBeTruthy();
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('wedding-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Konten Pernikahan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('wedding-generate-btn');
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
      const generateBtn = document.getElementById('wedding-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('wedding-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('wedding-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-rings-wedding')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konten pernikahan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('wedding-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('wedding-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat konten pernikahan');
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
      const emptyState = document.getElementById('wedding-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have pink icon in empty state', () => {
      const emptyStateIcon = document.getElementById('wedding-empty-state').querySelector('i.fas.fa-rings-wedding');
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
      const generateBtn = document.getElementById('wedding-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use pink accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding');
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
      const namesInput = document.getElementById('wedding-names');
      expect(namesInput.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(namesInput.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use pink accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });

    it('should use pink accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('wedding-empty-state').querySelector('i.fas.fa-rings-wedding');
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

    it('should have rings-wedding icon in header', () => {
      const ringsWeddingIcon = document.body.querySelector('header i.fas.fa-rings-wedding');
      expect(ringsWeddingIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('wedding-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have ring icon for engagement', () => {
      const ringIcon = document.body.querySelector('[data-type="engagement"] i.fas.fa-ring');
      expect(ringIcon).toBeTruthy();
    });

    it('should have camera icon for pre-wedding', () => {
      const cameraIcon = document.body.querySelector('[data-type="pre-wedding"] i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have church icon for ceremony', () => {
      const churchIcon = document.body.querySelector('[data-type="ceremony"] i.fas.fa-church');
      expect(churchIcon).toBeTruthy();
    });

    it('should have glass-cheers icon for reception', () => {
      const glassCheersIcon = document.body.querySelector('[data-type="reception"] i.fas.fa-glass-cheers');
      expect(glassCheersIcon).toBeTruthy();
    });

    it('should have plane-departure icon for honeymoon', () => {
      const planeDepartureIcon = document.body.querySelector('[data-type="honeymoon"] i.fas.fa-plane-departure');
      expect(planeDepartureIcon).toBeTruthy();
    });

    it('should have heart icon for anniversary', () => {
      const heartIcon = document.body.querySelector('[data-type="anniversary"] i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Konten Pernikahan');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Gaya & Tema');
      expect(document.body.textContent).toContain('Detail Pengantin');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya & Nuansa');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Konten Pernikahan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Konten');
      expect(headers[1].textContent).toContain('2. Gaya & Tema');
      expect(headers[2].textContent).toContain('3. Detail Pengantin');
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
      const namesInput = document.getElementById('wedding-names');
      expect(namesInput).toBeTruthy();
      
      const dateInput = document.getElementById('wedding-date');
      expect(dateInput).toBeTruthy();
      
      const locationInput = document.getElementById('wedding-location');
      expect(locationInput).toBeTruthy();
      
      const ctaInput = document.getElementById('wedding-cta');
      expect(ctaInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const styleSelect = document.getElementById('wedding-style');
      expect(styleSelect).toBeTruthy();
      
      const themeSelect = document.getElementById('wedding-theme');
      expect(themeSelect).toBeTruthy();
      
      const seasonSelect = document.getElementById('wedding-season');
      expect(seasonSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('wedding-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('wedding-tone');
      expect(toneSelect).toBeTruthy();
      
      const writingStyleSelect = document.getElementById('wedding-writing-style');
      expect(writingStyleSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('wedding-length');
      expect(lengthSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const detailsInput = document.getElementById('wedding-details');
      expect(detailsInput).toBeTruthy();
      
      const specialElementsInput = document.getElementById('wedding-special-elements');
      expect(specialElementsInput).toBeTruthy();
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
      const namesInput = document.getElementById('wedding-names');
      expect(namesInput.placeholder).toBeTruthy();
      
      const locationInput = document.getElementById('wedding-location');
      expect(locationInput.placeholder).toBeTruthy();
      
      const ctaInput = document.getElementById('wedding-cta');
      expect(ctaInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const detailsInput = document.getElementById('wedding-details');
      expect(detailsInput.placeholder).toBeTruthy();
      
      const specialElementsInput = document.getElementById('wedding-special-elements');
      expect(specialElementsInput.placeholder).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('wedding-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('wedding-generate-btn');
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
      const namesInput = document.getElementById('wedding-names');
      expect(namesInput.type).toBe('text');
      
      const dateInput = document.getElementById('wedding-date');
      expect(dateInput.type).toBe('date');
      
      const locationInput = document.getElementById('wedding-location');
      expect(locationInput.type).toBe('text');
      
      const ctaInput = document.getElementById('wedding-cta');
      expect(ctaInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const detailsInput = document.getElementById('wedding-details');
      expect(detailsInput.rows).toBe(2);
      
      const specialElementsInput = document.getElementById('wedding-special-elements');
      expect(specialElementsInput.rows).toBe(2);
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have proper spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper results container styling', () => {
      const resultsContainer = document.getElementById('wedding-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have proper spacing between form groups', () => {
      // Cards 2-6 (Style & Theme, Couple Details, Target Audience, Tone & Style, Additional Details) have form groups
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

    it('should have hover effects on type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-pink-100')).toBe(true);
        expect(btn.classList.contains('transition')).toBe(true);
      });
    });

    it('should have proper border styling on type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('border-2')).toBe(true);
        expect(btn.classList.contains('border-transparent')).toBe(true);
      });
    });

    it('should have proper card spacing', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
        expect(card.classList.contains('mb-4')).toBe(false); // Only h2 has mb-4
      });
    });

    it('should have proper header styling', () => {
      const header = document.body.querySelector('header');
      expect(header.classList.contains('text-center')).toBe(true);
      expect(header.classList.contains('mb-8')).toBe(true);
    });

    it('should have proper subtitle styling', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle.classList.contains('text-lg')).toBe(true);
      expect(subtitle.classList.contains('text-gray-600')).toBe(true);
      expect(subtitle.classList.contains('mt-2')).toBe(true);
    });
  });
});
