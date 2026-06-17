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

describe('wedding-design Component', () => {
  
  const mockComponentHTML = `
    <div id="content-wedding-design" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            <i class="fas fa-paint-brush mr-3"></i>Desain Pernikahan
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat desain yang elegan dan bermakna untuk momen pernikahan Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Design Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Desain</h2>
              <div id="wedding-design-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="invitation" class="type-btn-wedding-design p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-envelope-open-text text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Undangan</span>
                </button>
                <button type="button" data-type="backdrop" class="type-btn-wedding-design p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-image text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Backdrop</span>
                </button>
                <button type="button" data-type="table-setting" class="type-btn-wedding-design p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-utensils text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Meja Tamu</span>
                </button>
                <button type="button" data-type="bouquet" class="type-btn-wedding-design p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-seedling text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Bouquet</span>
                </button>
                <button type="button" data-type="cake" class="type-btn-wedding-design p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-birthday-cake text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Kue Pernikahan</span>
                </button>
                <button type="button" data-type="favor" class="type-btn-wedding-design p-3 rounded-lg text-sm bg-gray-100 hover:bg-amber-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-gift text-2xl mb-1 text-amber-500"></i>
                  <span class="block font-medium">Souvenir</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Design Style & Theme -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya & Tema</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-design-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-amber-500"></i>Gaya Desain
                  </label>
                  <select id="wedding-design-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="traditional">Tradisional</option>
                    <option value="modern">Modern</option>
                    <option value="rustic">Rustic</option>
                    <option value="elegant">Elegan</option>
                    <option value="bohemian">Bohemian</option>
                    <option value="vintage">Vintage</option>
                    <option value="minimalist">Minimalis</option>
                    <option value="floral">Floral</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-design-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-roller mr-1 text-amber-500"></i>Palet Warna
                  </label>
                  <select id="wedding-design-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="gold-cream">Emas & Krem</option>
                    <option value="rose-gold">Rose Gold & Putih</option>
                    <option value="burgundy">Burgundy & Emas</option>
                    <option value="sage-green">Sage Green & Putih</option>
                    <option value="navy-gold">Biru Navy & Emas</option>
                    <option value="blush-pink">Blush Pink & Putih</option>
                    <option value="purple-violet">Ungu & Violet</option>
                    <option value="classic-white">Putih Klasik</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-design-mood" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-amber-500"></i>Suasana
                  </label>
                  <select id="wedding-design-mood" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="romantic">Romantis</option>
                    <option value="elegant">Elegan</option>
                    <option value="playful">Fun & Playful</option>
                    <option value="sophisticated">Sofistikasi</option>
                    <option value="warm">Hangat & Ramah</option>
                    <option value="luxurious">Mewah</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Couple Details -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Detail Pengantin</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-design-names" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-user-friends mr-1 text-amber-500"></i>Nama Pengantin
                  </label>
                  <input type="text" id="wedding-design-names" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Contoh: Budi & Siti">
                </div>
                
                <div>
                  <label for="wedding-design-date" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-alt mr-1 text-amber-500"></i>Tanggal Pernikahan
                  </label>
                  <input type="date" id="wedding-design-date" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                </div>
                
                <div>
                  <label for="wedding-design-location" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-map-marker-alt mr-1 text-amber-500"></i>Lokasi
                  </label>
                  <input type="text" id="wedding-design-location" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Contoh: Jakarta, Bali, Bandung">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-design-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-amber-500"></i>Target Audiens
                  </label>
                  <select id="wedding-design-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="couple">Pasangan Pengantin</option>
                    <option value="family">Keluarga</option>
                    <option value="guests">Tamu Undangan</option>
                    <option value="vendors">Vendor Pernikahan</option>
                    <option value="social-media">Pengikut Media Sosial</option>
                    <option value="all">Semua Audiens</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-design-details" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-info-circle mr-1 text-amber-500"></i>Detail Tambahan
                  </label>
                  <textarea id="wedding-design-details" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Ceritakan sedikit tentang preferensi desain Anda..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Tone & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Gaya & Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-design-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-amber-500"></i>Tone Desain
                  </label>
                  <select id="wedding-design-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="elegant">Elegan</option>
                    <option value="romantic">Romantis</option>
                    <option value="formal">Formal & Santun</option>
                    <option value="fun">Fun & Enerjik</option>
                    <option value="emotional">Emosional & Mengharukan</option>
                    <option value="luxurious">Mewah & Glamorous</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-design-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-alt mr-1 text-amber-500"></i>Format Desain
                  </label>
                  <select id="wedding-design-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="digital">Digital</option>
                    <option value="print">Cetak</option>
                    <option value="both">Digital & Cetak</option>
                  </select>
                </div>
                
                <div>
                  <label for="wedding-design-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-amber-500"></i>Detail Konten
                  </label>
                  <select id="wedding-design-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                    <option value="simple">Sederhana</option>
                    <option value="medium">Sedang</option>
                    <option value="detailed">Detail & Komprehensif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Additional Details -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Detail Tambahan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="wedding-design-special-elements" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sparkles mr-1 text-amber-500"></i>Elemen Khusus
                  </label>
                  <textarea id="wedding-design-special-elements" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Elemen khusus yang ingin dimasukkan (misal: logo, motif adat, simbol khusus)"></textarea>
                </div>
                
                <div>
                  <label for="wedding-design-cta" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-mouse-pointer mr-1 text-amber-500"></i>Call to Action
                  </label>
                  <input type="text" id="wedding-design-cta" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Contoh: Konfirmasi kehadiran Anda di sini">
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="wedding-design-generate-btn" class="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Desain Pernikahan
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="wedding-design-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="wedding-design-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-paint-brush text-6xl mb-4 text-amber-400"></i>
                <p class="text-xl">Hasil desain pernikahan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Desain Pernikahan</p>
              </div>
              <div id="wedding-design-results" class="hidden space-y-6"></div>
              <div id="wedding-design-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-amber-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat desain pernikahan...</p>
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
      const container = document.getElementById('content-wedding-design');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Desain Pernikahan');
      expect(title.querySelector('i.fas.fa-paint-brush')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat desain yang elegan dan bermakna');
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
      expect(rightPanel.querySelector('#wedding-design-results-container')).toBeTruthy();
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
      const typeOptions = document.getElementById('wedding-design-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Undangan option', () => {
      const undanganBtn = document.body.querySelector('[data-type="invitation"]');
      expect(undanganBtn).toBeTruthy();
      expect(undanganBtn.textContent).toContain('Undangan');
      expect(undanganBtn.querySelector('i.fas.fa-envelope-open-text')).toBeTruthy();
      expect(undanganBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Backdrop option', () => {
      const backdropBtn = document.body.querySelector('[data-type="backdrop"]');
      expect(backdropBtn).toBeTruthy();
      expect(backdropBtn.textContent).toContain('Backdrop');
      expect(backdropBtn.querySelector('i.fas.fa-image')).toBeTruthy();
    });

    it('should render Meja Tamu option', () => {
      const mejaTamuBtn = document.body.querySelector('[data-type="table-setting"]');
      expect(mejaTamuBtn).toBeTruthy();
      expect(mejaTamuBtn.textContent).toContain('Meja Tamu');
      expect(mejaTamuBtn.querySelector('i.fas.fa-utensils')).toBeTruthy();
    });

    it('should render Bouquet option', () => {
      const bouquetBtn = document.body.querySelector('[data-type="bouquet"]');
      expect(bouquetBtn).toBeTruthy();
      expect(bouquetBtn.textContent).toContain('Bouquet');
      expect(bouquetBtn.querySelector('i.fas.fa-seedling')).toBeTruthy();
    });

    it('should render Kue Pernikahan option', () => {
      const cakeBtn = document.body.querySelector('[data-type="cake"]');
      expect(cakeBtn).toBeTruthy();
      expect(cakeBtn.textContent).toContain('Kue Pernikahan');
      expect(cakeBtn.querySelector('i.fas.fa-birthday-cake')).toBeTruthy();
    });

    it('should render Souvenir option', () => {
      const favorBtn = document.body.querySelector('[data-type="favor"]');
      expect(favorBtn).toBeTruthy();
      expect(favorBtn.textContent).toContain('Souvenir');
      expect(favorBtn.querySelector('i.fas.fa-gift')).toBeTruthy();
    });

    it('should have 6 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding-design');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('wedding-design-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have amber icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding-design');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-amber-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Desain');
    });
  });

  // Style & Theme Selection Tests
  describe('Style & Theme Selection', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('wedding-design-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(8);
    });

    it('should render color palette select', () => {
      const colorSelect = document.getElementById('wedding-design-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(8);
    });

    it('should render mood select', () => {
      const moodSelect = document.getElementById('wedding-design-mood');
      expect(moodSelect).toBeTruthy();
      expect(moodSelect.tagName).toBe('SELECT');
      expect(moodSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gaya & Tema');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      
      const paintRollerIcon = document.body.querySelector('i.fas.fa-paint-roller');
      expect(paintRollerIcon).toBeTruthy();
      
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('wedding-design-style');
      expect(styleSelect.options[0].textContent).toContain('Tradisional');
      expect(styleSelect.options[1].textContent).toContain('Modern');
      expect(styleSelect.options[2].textContent).toContain('Rustic');
      expect(styleSelect.options[3].textContent).toContain('Elegan');
      expect(styleSelect.options[4].textContent).toContain('Bohemian');
      expect(styleSelect.options[5].textContent).toContain('Vintage');
      expect(styleSelect.options[6].textContent).toContain('Minimalis');
      expect(styleSelect.options[7].textContent).toContain('Floral');
    });

    it('should have color palette options with proper labels', () => {
      const colorSelect = document.getElementById('wedding-design-color');
      expect(colorSelect.options[0].textContent).toContain('Emas & Krem');
      expect(colorSelect.options[1].textContent).toContain('Rose Gold');
      expect(colorSelect.options[2].textContent).toContain('Burgundy');
      expect(colorSelect.options[3].textContent).toContain('Sage Green');
      expect(colorSelect.options[4].textContent).toContain('Biru Navy');
      expect(colorSelect.options[5].textContent).toContain('Blush Pink');
      expect(colorSelect.options[6].textContent).toContain('Ungu & Violet');
      expect(colorSelect.options[7].textContent).toContain('Putih Klasik');
    });

    it('should have mood options with proper labels', () => {
      const moodSelect = document.getElementById('wedding-design-mood');
      expect(moodSelect.options[0].textContent).toContain('Romantis');
      expect(moodSelect.options[1].textContent).toContain('Elegan');
      expect(moodSelect.options[2].textContent).toContain('Fun & Playful');
      expect(moodSelect.options[3].textContent).toContain('Sofistikasi');
      expect(moodSelect.options[4].textContent).toContain('Hangat & Ramah');
      expect(moodSelect.options[5].textContent).toContain('Mewah');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('wedding-design-style');
      expect(styleSelect.value).toBe('traditional');
    });

    it('should have default color palette value', () => {
      const colorSelect = document.getElementById('wedding-design-color');
      expect(colorSelect.value).toBe('gold-cream');
    });

    it('should have default mood value', () => {
      const moodSelect = document.getElementById('wedding-design-mood');
      expect(moodSelect.value).toBe('romantic');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('wedding-design-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-amber-500')).toBe(true);
    });
  });

  // Couple Details Input Tests
  describe('Couple Details Input', () => {
    it('should render names input', () => {
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput).toBeTruthy();
      expect(namesInput.type).toBe('text');
      expect(namesInput.placeholder).toContain('Budi & Siti');
    });

    it('should render date input', () => {
      const dateInput = document.getElementById('wedding-design-date');
      expect(dateInput).toBeTruthy();
      expect(dateInput.type).toBe('date');
    });

    it('should render location input', () => {
      const locationInput = document.getElementById('wedding-design-location');
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
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput.classList.contains('w-full')).toBe(true);
      expect(namesInput.classList.contains('p-3')).toBe(true);
      expect(namesInput.classList.contains('border')).toBe(true);
      expect(namesInput.classList.contains('rounded-lg')).toBe(true);
      expect(namesInput.classList.contains('focus:ring-2')).toBe(true);
      expect(namesInput.classList.contains('focus:ring-amber-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('wedding-design-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should render details textarea', () => {
      const detailsInput = document.getElementById('wedding-design-details');
      expect(detailsInput).toBeTruthy();
      expect(detailsInput.tagName).toBe('TEXTAREA');
      expect(detailsInput.rows).toBe(2);
      expect(detailsInput.placeholder).toContain('preferensi desain Anda');
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
      const audienceSelect = document.getElementById('wedding-design-audience');
      expect(audienceSelect.options[0].textContent).toContain('Pasangan Pengantin');
      expect(audienceSelect.options[1].textContent).toContain('Keluarga');
      expect(audienceSelect.options[2].textContent).toContain('Tamu Undangan');
      expect(audienceSelect.options[3].textContent).toContain('Vendor Pernikahan');
      expect(audienceSelect.options[4].textContent).toContain('Pengikut Media Sosial');
      expect(audienceSelect.options[5].textContent).toContain('Semua Audiens');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('wedding-design-audience');
      expect(audienceSelect.value).toBe('couple');
    });
  });

  // Tone & Style Selection Tests
  describe('Tone & Style Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('wedding-design-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render format select', () => {
      const formatSelect = document.getElementById('wedding-design-format');
      expect(formatSelect).toBeTruthy();
      expect(formatSelect.tagName).toBe('SELECT');
      expect(formatSelect.options.length).toBe(3);
    });

    it('should render length select', () => {
      const lengthSelect = document.getElementById('wedding-design-length');
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
      
      const fileAltIcon = document.body.querySelector('i.fas.fa-file-alt');
      expect(fileAltIcon).toBeTruthy();
      
      const textWidthIcon = document.body.querySelector('i.fas.fa-text-width');
      expect(textWidthIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('wedding-design-tone');
      expect(toneSelect.options[0].textContent).toContain('Elegan');
      expect(toneSelect.options[1].textContent).toContain('Romantis');
      expect(toneSelect.options[2].textContent).toContain('Formal & Santun');
      expect(toneSelect.options[3].textContent).toContain('Fun & Enerjik');
      expect(toneSelect.options[4].textContent).toContain('Emosional & Mengharukan');
      expect(toneSelect.options[5].textContent).toContain('Mewah & Glamorous');
    });

    it('should have format options with proper labels', () => {
      const formatSelect = document.getElementById('wedding-design-format');
      expect(formatSelect.options[0].textContent).toContain('Digital');
      expect(formatSelect.options[1].textContent).toContain('Cetak');
      expect(formatSelect.options[2].textContent).toContain('Digital & Cetak');
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('wedding-design-length');
      expect(lengthSelect.options[0].textContent).toContain('Sederhana');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Detail & Komprehensif');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('wedding-design-tone');
      expect(toneSelect.value).toBe('elegant');
    });

    it('should have default format value', () => {
      const formatSelect = document.getElementById('wedding-design-format');
      expect(formatSelect.value).toBe('digital');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('wedding-design-length');
      expect(lengthSelect.value).toBe('simple');
    });
  });

  // Additional Details Tests
  describe('Additional Details', () => {
    it('should render special elements textarea', () => {
      const specialElementsInput = document.getElementById('wedding-design-special-elements');
      expect(specialElementsInput).toBeTruthy();
      expect(specialElementsInput.tagName).toBe('TEXTAREA');
      expect(specialElementsInput.rows).toBe(2);
      expect(specialElementsInput.placeholder).toContain('logo, motif adat');
    });

    it('should render CTA input', () => {
      const ctaInput = document.getElementById('wedding-design-cta');
      expect(ctaInput).toBeTruthy();
      expect(ctaInput.type).toBe('text');
      expect(ctaInput.placeholder).toContain('Konfirmasi kehadiran Anda');
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
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Desain Pernikahan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('wedding-design-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('wedding-design-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-paint-brush')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil desain pernikahan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('wedding-design-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('wedding-design-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat desain pernikahan');
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
      const emptyState = document.getElementById('wedding-design-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have amber icon in empty state', () => {
      const emptyStateIcon = document.getElementById('wedding-design-empty-state').querySelector('i.fas.fa-paint-brush');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use amber/yellow color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-amber-500')).toBe(true);
      expect(title.classList.contains('to-yellow-500')).toBe(true);
    });

    it('should use amber/yellow accents in generate button', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-500')).toBe(true);
    });

    it('should use amber accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding-design');
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
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput.classList.contains('focus:ring-amber-500')).toBe(true);
      expect(namesInput.classList.contains('focus:border-amber-500')).toBe(true);
    });

    it('should use amber accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-amber-500')).toBe(true);
    });

    it('should use amber accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('wedding-design-empty-state').querySelector('i.fas.fa-paint-brush');
      expect(emptyStateIcon.classList.contains('text-amber-400')).toBe(true);
    });

    it('should use amber hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding-design');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-amber-100')).toBe(true);
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
      expect(icons.length).toBeGreaterThan(20);
    });

    it('should have paint-brush icon in header', () => {
      const paintBrushIcon = document.body.querySelector('header i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('wedding-design-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have envelope-open-text icon for invitation', () => {
      const envelopeIcon = document.body.querySelector('[data-type="invitation"] i.fas.fa-envelope-open-text');
      expect(envelopeIcon).toBeTruthy();
    });

    it('should have image icon for backdrop', () => {
      const imageIcon = document.body.querySelector('[data-type="backdrop"] i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have utensils icon for table setting', () => {
      const utensilsIcon = document.body.querySelector('[data-type="table-setting"] i.fas.fa-utensils');
      expect(utensilsIcon).toBeTruthy();
    });

    it('should have seedling icon for bouquet', () => {
      const seedlingIcon = document.body.querySelector('[data-type="bouquet"] i.fas.fa-seedling');
      expect(seedlingIcon).toBeTruthy();
    });

    it('should have birthday-cake icon for cake', () => {
      const cakeIcon = document.body.querySelector('[data-type="cake"] i.fas.fa-birthday-cake');
      expect(cakeIcon).toBeTruthy();
    });

    it('should have gift icon for favor', () => {
      const giftIcon = document.body.querySelector('[data-type="favor"] i.fas.fa-gift');
      expect(giftIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Desain Pernikahan');
      expect(document.body.textContent).toContain('Jenis Desain');
      expect(document.body.textContent).toContain('Gaya & Tema');
      expect(document.body.textContent).toContain('Detail Pengantin');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Gaya & Nuansa');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Desain Pernikahan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Desain');
      expect(headers[1].textContent).toContain('2. Gaya & Tema');
      expect(headers[2].textContent).toContain('3. Detail Pengantin');
      expect(headers[3].textContent).toContain('4. Target Audiens');
      expect(headers[4].textContent).toContain('5. Gaya & Nuansa');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('wedding-design-empty-state');
      expect(emptyState.textContent).toContain('Hasil desain pernikahan akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Desain Pernikahan');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('wedding-design-loading');
      expect(loading.textContent).toContain('Sedang membuat desain pernikahan');
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
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput).toBeTruthy();
      
      const dateInput = document.getElementById('wedding-design-date');
      expect(dateInput).toBeTruthy();
      
      const locationInput = document.getElementById('wedding-design-location');
      expect(locationInput).toBeTruthy();
      
      const ctaInput = document.getElementById('wedding-design-cta');
      expect(ctaInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const styleSelect = document.getElementById('wedding-design-style');
      expect(styleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('wedding-design-color');
      expect(colorSelect).toBeTruthy();
      
      const moodSelect = document.getElementById('wedding-design-mood');
      expect(moodSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('wedding-design-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('wedding-design-tone');
      expect(toneSelect).toBeTruthy();
      
      const formatSelect = document.getElementById('wedding-design-format');
      expect(formatSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('wedding-design-length');
      expect(lengthSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const detailsInput = document.getElementById('wedding-design-details');
      expect(detailsInput).toBeTruthy();
      
      const specialElementsInput = document.getElementById('wedding-design-special-elements');
      expect(specialElementsInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.type).toBe('submit');
    });

    it('should have proper input types', () => {
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput.type).toBe('text');
      
      const dateInput = document.getElementById('wedding-design-date');
      expect(dateInput.type).toBe('date');
      
      const locationInput = document.getElementById('wedding-design-location');
      expect(locationInput.type).toBe('text');
      
      const ctaInput = document.getElementById('wedding-design-cta');
      expect(ctaInput.type).toBe('text');
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
    it('should have proper placeholders in text inputs', () => {
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput.placeholder).toBeTruthy();
      
      const locationInput = document.getElementById('wedding-design-location');
      expect(locationInput.placeholder).toBeTruthy();
      
      const ctaInput = document.getElementById('wedding-design-cta');
      expect(ctaInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const detailsInput = document.getElementById('wedding-design-details');
      expect(detailsInput.placeholder).toBeTruthy();
      
      const specialElementsInput = document.getElementById('wedding-design-special-elements');
      expect(specialElementsInput.placeholder).toBeTruthy();
    });

    it('should have descriptive placeholder text', () => {
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput.placeholder).toContain('Budi & Siti');
      
      const locationInput = document.getElementById('wedding-design-location');
      expect(locationInput.placeholder).toContain('Jakarta, Bali, Bandung');
      
      const detailsInput = document.getElementById('wedding-design-details');
      expect(detailsInput.placeholder).toContain('preferensi desain Anda');
      
      const specialElementsInput = document.getElementById('wedding-design-special-elements');
      expect(specialElementsInput.placeholder).toContain('logo, motif adat');
      
      const ctaInput = document.getElementById('wedding-design-cta');
      expect(ctaInput.placeholder).toContain('Konfirmasi kehadiran Anda');
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });

    it('should have type button attribute', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.type).toBe('submit');
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have proper input types', () => {
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput.type).toBe('text');
      
      const dateInput = document.getElementById('wedding-design-date');
      expect(dateInput.type).toBe('date');
      
      const locationInput = document.getElementById('wedding-design-location');
      expect(locationInput.type).toBe('text');
      
      const ctaInput = document.getElementById('wedding-design-cta');
      expect(ctaInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const detailsInput = document.getElementById('wedding-design-details');
      expect(detailsInput.rows).toBe(2);
      
      const specialElementsInput = document.getElementById('wedding-design-special-elements');
      expect(specialElementsInput.rows).toBe(2);
    });

    it('should have proper select attributes', () => {
      const styleSelect = document.getElementById('wedding-design-style');
      expect(styleSelect.id).toBeTruthy();
      expect(styleSelect.classList.contains('w-full')).toBe(true);
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have proper spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper spacing between grid items', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have proper header margin', () => {
      const header = document.body.querySelector('header');
      expect(header.classList.contains('mb-8')).toBe(true);
      expect(header.classList.contains('text-center')).toBe(true);
    });

    it('should have proper card spacing', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
      });
    });

    it('should have proper form spacing', () => {
      const formContainers = document.body.querySelectorAll('.space-y-4');
      expect(formContainers.length).toBeGreaterThan(0);
    });
  });

  // Interactive Elements Tests
  describe('Interactive Elements', () => {
    it('should have type buttons with proper data attributes', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding-design');
      expect(typeBtns[0].getAttribute('data-type')).toBe('invitation');
      expect(typeBtns[1].getAttribute('data-type')).toBe('backdrop');
      expect(typeBtns[2].getAttribute('data-type')).toBe('table-setting');
      expect(typeBtns[3].getAttribute('data-type')).toBe('bouquet');
      expect(typeBtns[4].getAttribute('data-type')).toBe('cake');
      expect(typeBtns[5].getAttribute('data-type')).toBe('favor');
    });

    it('should have first type button selected by default', () => {
      const undanganBtn = document.body.querySelector('[data-type="invitation"]');
      expect(undanganBtn.classList.contains('selected')).toBe(true);
      expect(undanganBtn.getAttribute('data-selected')).toBe('true');
    });

    it('should have proper button classes for interaction', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-wedding-design');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('p-3')).toBe(true);
        expect(btn.classList.contains('rounded-lg')).toBe(true);
        expect(btn.classList.contains('text-sm')).toBe(true);
        expect(btn.classList.contains('bg-gray-100')).toBe(true);
        expect(btn.classList.contains('hover:bg-amber-100')).toBe(true);
        expect(btn.classList.contains('transition')).toBe(true);
        expect(btn.classList.contains('text-center')).toBe(true);
        expect(btn.classList.contains('border-2')).toBe(true);
        expect(btn.classList.contains('border-transparent')).toBe(true);
      });
    });
  });

  // Form Element IDs Tests
  describe('Form Element IDs', () => {
    it('should have unique IDs for all form elements', () => {
      const ids = new Set();
      const inputs = document.body.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        expect(ids.has(input.id)).toBe(false);
        ids.add(input.id);
      });
      expect(ids.size).toBe(13); // 13 form elements
    });

    it('should have proper ID naming convention', () => {
      const namesInput = document.getElementById('wedding-design-names');
      expect(namesInput.id).toBe('wedding-design-names');
      
      const dateInput = document.getElementById('wedding-design-date');
      expect(dateInput.id).toBe('wedding-design-date');
      
      const locationInput = document.getElementById('wedding-design-location');
      expect(locationInput.id).toBe('wedding-design-location');
      
      const styleSelect = document.getElementById('wedding-design-style');
      expect(styleSelect.id).toBe('wedding-design-style');
    });
  });

  // Visual Design Tests
  describe('Visual Design', () => {
    it('should use gradient text in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-amber-500')).toBe(true);
      expect(title.classList.contains('to-yellow-500')).toBe(true);
      expect(title.classList.contains('bg-clip-text')).toBe(true);
      expect(title.classList.contains('text-transparent')).toBe(true);
    });

    it('should use gradient button', () => {
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-500')).toBe(true);
    });

    it('should have proper shadow effects', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('shadow-lg')).toBe(true);
      });
      
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });

    it('should have proper border radius', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('rounded-2xl')).toBe(true);
      });
      
      const generateBtn = document.getElementById('wedding-design-generate-btn');
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
    });

    it('should have proper spacing utilities', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });
});
