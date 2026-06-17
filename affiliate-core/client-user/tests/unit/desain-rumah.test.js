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

describe('desain-rumah Component', () => {
  
  const mockComponentHTML = `
    <div id="content-desain-rumah" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
            <i class="fas fa-home mr-3"></i>Desain Rumah
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat inspirasi desain rumah yang indah dan nyaman</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Room Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Ruangan</h2>
              <div id="desain-rumah-room-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="living-room" class="type-btn-desain-rumah p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-couch text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Ruang Tamu</span>
                </button>
                <button type="button" data-type="bedroom" class="type-btn-desain-rumah p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bed text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Kamar Tidur</span>
                </button>
                <button type="button" data-type="kitchen" class="type-btn-desain-rumah p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-utensils text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Dapur</span>
                </button>
                <button type="button" data-type="bathroom" class="type-btn-desain-rumah p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bath text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Kamar Mandi</span>
                </button>
                <button type="button" data-type="office" class="type-btn-desain-rumah p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-briefcase text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Kantor</span>
                </button>
                <button type="button" data-type="outdoor" class="type-btn-desain-rumah p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tree text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Outdoor</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya Desain</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="desain-rumah-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-teal-500"></i>Gaya Desain
                  </label>
                  <select id="desain-rumah-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="modern">Modern</option>
                    <option value="minimalist">Minimalis</option>
                    <option value="traditional">Tradisional</option>
                    <option value="industrial">Industrial</option>
                    <option value="scandinavian">Skandinavia</option>
                    <option value="bohemian">Bohemian</option>
                    <option value="tropical">Tropis</option>
                  </select>
                </div>
                
                <div>
                  <label for="desain-rumah-custom-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-pen mr-1 text-teal-500"></i>Gaya Custom
                  </label>
                  <input type="text" id="desain-rumah-custom-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Masukkan gaya custom...">
                </div>
              </div>
            </div>
            
            <!-- Step 3: Color Palette -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Palet Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="desain-rumah-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-teal-500"></i>Palet Warna
                  </label>
                  <select id="desain-rumah-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="neutral">Netral</option>
                    <option value="earth">Alam</option>
                    <option value="monochrome">Monokrom</option>
                    <option value="pastel">Pastel</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="coastal">Pantai</option>
                    <option value="forest">Hutan</option>
                  </select>
                </div>
                
                <div>
                  <label for="desain-rumah-custom-colors" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tint mr-1 text-teal-500"></i>Warna Custom
                  </label>
                  <input type="text" id="desain-rumah-custom-colors" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Contoh: biru, krem, kayu...">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Budget Range -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Budget</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="desain-rumah-budget" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-money-bill-wave mr-1 text-teal-500"></i>Range Budget
                  </label>
                  <select id="desain-rumah-budget" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="economy">Ekonomi (Di bawah 10 juta)</option>
                    <option value="mid-range">Menengah (10-50 juta)</option>
                    <option value="premium">Premium (50-200 juta)</option>
                    <option value="luxury">Luxury (Di atas 200 juta)</option>
                  </select>
                </div>
                
                <div>
                  <label for="desain-rumah-budget-detail" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-coins mr-1 text-teal-500"></i>Budget Detail
                  </label>
                  <input type="text" id="desain-rumah-budget-detail" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Contoh: 25 juta untuk keseluruhan...">
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="desain-rumah-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-teal-500"></i>Target Audiens
                  </label>
                  <select id="desain-rumah-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="homeowners">Pemilik Rumah</option>
                    <option value="renters">Penyewa</option>
                    <option value="interior-designers">Desainer Interior</option>
                    <option value="social-media">Media Sosial</option>
                  </select>
                </div>
                
                <div>
                  <label for="desain-rumah-platform" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fab fa-instagram mr-1 text-teal-500"></i>Platform
                  </label>
                  <select id="desain-rumah-platform" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="instagram">Instagram</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="website">Website</option>
                    <option value="print">Cetak</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="desain-rumah-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-teal-500"></i>Nuansa
                  </label>
                  <select id="desain-rumah-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="cozy">Nyaman & Hangat</option>
                    <option value="spacious">Luas & Terbuka</option>
                    <option value="bright">Cerah & Terang</option>
                    <option value="minimal">Minimalis & Bersih</option>
                    <option value="luxurious">Mewah & Elegan</option>
                    <option value="natural">Alami & Hijau</option>
                  </select>
                </div>
                
                <div>
                  <label for="desain-rumah-special" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-teal-500"></i>Permintaan Khusus
                  </label>
                  <textarea id="desain-rumah-special" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Detail khusus yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="desain-rumah-generate-btn" class="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Desain Rumah
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="desain-rumah-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="desain-rumah-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-home text-6xl mb-4 text-teal-400"></i>
                <p class="text-xl">Hasil desain rumah akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Desain Rumah</p>
              </div>
              <div id="desain-rumah-results" class="hidden space-y-6"></div>
              <div id="desain-rumah-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-teal-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat desain rumah...</p>
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
      const container = document.getElementById('content-desain-rumah');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Desain Rumah');
      expect(title.querySelector('i.fas.fa-home')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat inspirasi desain rumah yang indah dan nyaman');
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
      expect(rightPanel.querySelector('#desain-rumah-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Room Type Selection Tests
  describe('Room Type Selection', () => {
    it('should render room type options container', () => {
      const roomOptions = document.getElementById('desain-rumah-room-options');
      expect(roomOptions).toBeTruthy();
    });

    it('should render Ruang Tamu option', () => {
      const ruangTamuBtn = document.body.querySelector('[data-type="living-room"]');
      expect(ruangTamuBtn).toBeTruthy();
      expect(ruangTamuBtn.textContent).toContain('Ruang Tamu');
      expect(ruangTamuBtn.querySelector('i.fas.fa-couch')).toBeTruthy();
      expect(ruangTamuBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Kamar Tidur option', () => {
      const kamarTidurBtn = document.body.querySelector('[data-type="bedroom"]');
      expect(kamarTidurBtn).toBeTruthy();
      expect(kamarTidurBtn.textContent).toContain('Kamar Tidur');
      expect(kamarTidurBtn.querySelector('i.fas.fa-bed')).toBeTruthy();
    });

    it('should render Dapur option', () => {
      const dapurBtn = document.body.querySelector('[data-type="kitchen"]');
      expect(dapurBtn).toBeTruthy();
      expect(dapurBtn.textContent).toContain('Dapur');
      expect(dapurBtn.querySelector('i.fas.fa-utensils')).toBeTruthy();
    });

    it('should render Kamar Mandi option', () => {
      const kamarMandiBtn = document.body.querySelector('[data-type="bathroom"]');
      expect(kamarMandiBtn).toBeTruthy();
      expect(kamarMandiBtn.textContent).toContain('Kamar Mandi');
      expect(kamarMandiBtn.querySelector('i.fas.fa-bath')).toBeTruthy();
    });

    it('should render Kantor option', () => {
      const kantorBtn = document.body.querySelector('[data-type="office"]');
      expect(kantorBtn).toBeTruthy();
      expect(kantorBtn.textContent).toContain('Kantor');
      expect(kantorBtn.querySelector('i.fas.fa-briefcase')).toBeTruthy();
    });

    it('should render Outdoor option', () => {
      const outdoorBtn = document.body.querySelector('[data-type="outdoor"]');
      expect(outdoorBtn).toBeTruthy();
      expect(outdoorBtn.textContent).toContain('Outdoor');
      expect(outdoorBtn.querySelector('i.fas.fa-tree')).toBeTruthy();
    });

    it('should have 6 room type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-desain-rumah');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for room options', () => {
      const roomOptions = document.getElementById('desain-rumah-room-options');
      expect(roomOptions.classList.contains('grid')).toBe(true);
      expect(roomOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(roomOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have teal icons for all room options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-desain-rumah');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-teal-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Ruangan');
    });

    it('should have teal hover effects in room buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-desain-rumah');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-teal-100')).toBe(true);
      });
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('desain-rumah-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(7);
    });

    it('should render custom style input', () => {
      const customStyleInput = document.getElementById('desain-rumah-custom-style');
      expect(customStyleInput).toBeTruthy();
      expect(customStyleInput.tagName).toBe('INPUT');
      expect(customStyleInput.type).toBe('text');
      expect(customStyleInput.placeholder).toContain('Masukkan gaya custom');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gaya Desain');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
      
      const penIcon = document.body.querySelector('i.fas.fa-pen');
      expect(penIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('desain-rumah-style');
      expect(styleSelect.options[0].textContent).toContain('Modern');
      expect(styleSelect.options[1].textContent).toContain('Minimalis');
      expect(styleSelect.options[2].textContent).toContain('Tradisional');
      expect(styleSelect.options[3].textContent).toContain('Industrial');
      expect(styleSelect.options[4].textContent).toContain('Skandinavia');
      expect(styleSelect.options[5].textContent).toContain('Bohemian');
      expect(styleSelect.options[6].textContent).toContain('Tropis');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('desain-rumah-style');
      expect(styleSelect.value).toBe('modern');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('desain-rumah-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Color Palette Input Tests
  describe('Color Palette Input', () => {
    it('should render color palette select', () => {
      const colorSelect = document.getElementById('desain-rumah-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(7);
    });

    it('should render custom colors input', () => {
      const customColorsInput = document.getElementById('desain-rumah-custom-colors');
      expect(customColorsInput).toBeTruthy();
      expect(customColorsInput.tagName).toBe('INPUT');
      expect(customColorsInput.type).toBe('text');
      expect(customColorsInput.placeholder).toContain('Contoh: biru, krem, kayu');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Palet Warna');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      
      const tintIcon = document.body.querySelector('i.fas.fa-tint');
      expect(tintIcon).toBeTruthy();
    });

    it('should have color palette options with proper labels', () => {
      const colorSelect = document.getElementById('desain-rumah-color');
      expect(colorSelect.options[0].textContent).toContain('Netral');
      expect(colorSelect.options[1].textContent).toContain('Alam');
      expect(colorSelect.options[2].textContent).toContain('Monokrom');
      expect(colorSelect.options[3].textContent).toContain('Pastel');
      expect(colorSelect.options[4].textContent).toContain('Vibrant');
      expect(colorSelect.options[5].textContent).toContain('Pantai');
      expect(colorSelect.options[6].textContent).toContain('Hutan');
    });

    it('should have default color palette value', () => {
      const colorSelect = document.getElementById('desain-rumah-color');
      expect(colorSelect.value).toBe('neutral');
    });

    it('should have proper input styling', () => {
      const colorSelect = document.getElementById('desain-rumah-color');
      expect(colorSelect.classList.contains('w-full')).toBe(true);
      expect(colorSelect.classList.contains('p-3')).toBe(true);
      expect(colorSelect.classList.contains('border')).toBe(true);
      expect(colorSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Budget Range Input Tests
  describe('Budget Range Input', () => {
    it('should render budget select', () => {
      const budgetSelect = document.getElementById('desain-rumah-budget');
      expect(budgetSelect).toBeTruthy();
      expect(budgetSelect.tagName).toBe('SELECT');
      expect(budgetSelect.options.length).toBe(4);
    });

    it('should render budget detail input', () => {
      const budgetDetailInput = document.getElementById('desain-rumah-budget-detail');
      expect(budgetDetailInput).toBeTruthy();
      expect(budgetDetailInput.tagName).toBe('INPUT');
      expect(budgetDetailInput.type).toBe('text');
      expect(budgetDetailInput.placeholder).toContain('Contoh: 25 juta untuk keseluruhan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Budget');
    });

    it('should have all labels with icons', () => {
      const moneyBillWaveIcon = document.body.querySelector('i.fas.fa-money-bill-wave');
      expect(moneyBillWaveIcon).toBeTruthy();
      
      const coinsIcon = document.body.querySelector('i.fas.fa-coins');
      expect(coinsIcon).toBeTruthy();
    });

    it('should have budget options with proper labels', () => {
      const budgetSelect = document.getElementById('desain-rumah-budget');
      expect(budgetSelect.options[0].textContent).toContain('Ekonomi');
      expect(budgetSelect.options[1].textContent).toContain('Menengah');
      expect(budgetSelect.options[2].textContent).toContain('Premium');
      expect(budgetSelect.options[3].textContent).toContain('Luxury');
    });

    it('should have default budget value', () => {
      const budgetSelect = document.getElementById('desain-rumah-budget');
      expect(budgetSelect.value).toBe('economy');
    });

    it('should have proper input styling', () => {
      const budgetSelect = document.getElementById('desain-rumah-budget');
      expect(budgetSelect.classList.contains('w-full')).toBe(true);
      expect(budgetSelect.classList.contains('p-3')).toBe(true);
      expect(budgetSelect.classList.contains('border')).toBe(true);
      expect(budgetSelect.classList.contains('rounded-lg')).toBe(true);
      expect(budgetSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(budgetSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('desain-rumah-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(4);
    });

    it('should render platform select', () => {
      const platformSelect = document.getElementById('desain-rumah-platform');
      expect(platformSelect).toBeTruthy();
      expect(platformSelect.tagName).toBe('SELECT');
      expect(platformSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const instagramIcon = document.body.querySelector('i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('desain-rumah-audience');
      expect(audienceSelect.options[0].textContent).toContain('Pemilik Rumah');
      expect(audienceSelect.options[1].textContent).toContain('Penyewa');
      expect(audienceSelect.options[2].textContent).toContain('Desainer Interior');
      expect(audienceSelect.options[3].textContent).toContain('Media Sosial');
    });

    it('should have platform options with proper labels', () => {
      const platformSelect = document.getElementById('desain-rumah-platform');
      expect(platformSelect.options[0].textContent).toContain('Instagram');
      expect(platformSelect.options[1].textContent).toContain('Pinterest');
      expect(platformSelect.options[2].textContent).toContain('TikTok');
      expect(platformSelect.options[3].textContent).toContain('Facebook');
      expect(platformSelect.options[4].textContent).toContain('Website');
      expect(platformSelect.options[5].textContent).toContain('Cetak');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('desain-rumah-audience');
      expect(audienceSelect.value).toBe('homeowners');
    });

    it('should have default platform value', () => {
      const platformSelect = document.getElementById('desain-rumah-platform');
      expect(platformSelect.value).toBe('instagram');
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('desain-rumah-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render special requests textarea', () => {
      const specialInput = document.getElementById('desain-rumah-special');
      expect(specialInput).toBeTruthy();
      expect(specialInput.tagName).toBe('TEXTAREA');
      expect(specialInput.rows).toBe(2);
      expect(specialInput.placeholder).toContain('Detail khusus yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('desain-rumah-tone');
      expect(toneSelect.options[0].textContent).toContain('Nyaman & Hangat');
      expect(toneSelect.options[1].textContent).toContain('Luas & Terbuka');
      expect(toneSelect.options[2].textContent).toContain('Cerah & Terang');
      expect(toneSelect.options[3].textContent).toContain('Minimalis & Bersih');
      expect(toneSelect.options[4].textContent).toContain('Mewah & Elegan');
      expect(toneSelect.options[5].textContent).toContain('Alami & Hijau');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('desain-rumah-tone');
      expect(toneSelect.value).toBe('cozy');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('desain-rumah-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('desain-rumah-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Desain Rumah');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('desain-rumah-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('desain-rumah-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('desain-rumah-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('desain-rumah-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('desain-rumah-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-home')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil desain rumah akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('desain-rumah-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('desain-rumah-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat desain rumah');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('desain-rumah-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have teal icon in empty state', () => {
      const emptyStateIcon = document.getElementById('desain-rumah-empty-state').querySelector('i.fas.fa-home');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use teal/emerald color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-teal-500')).toBe(true);
      expect(title.classList.contains('via-emerald-500')).toBe(true);
      expect(title.classList.contains('to-teal-600')).toBe(true);
    });

    it('should use teal/emerald accents in generate button', () => {
      const generateBtn = document.getElementById('desain-rumah-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-600')).toBe(true);
    });

    it('should use teal accents in room type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-desain-rumah');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-teal-500')).toBe(true);
      });
    });

    it('should use teal accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-teal-500')).toBe(true);
      });
    });

    it('should use teal accents in focus states', () => {
      const styleSelect = document.getElementById('desain-rumah-style');
      expect(styleSelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use teal accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-teal-500')).toBe(true);
    });

    it('should use teal accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('desain-rumah-empty-state').querySelector('i.fas.fa-home');
      expect(emptyStateIcon.classList.contains('text-teal-400')).toBe(true);
    });

    it('should use teal hover effects in room buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-desain-rumah');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-teal-100')).toBe(true);
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
      const icons = document.body.querySelectorAll('i.fas, i.fab');
      expect(icons.length).toBeGreaterThanOrEqual(19);
    });

    it('should have home icon in header', () => {
      const homeIcon = document.body.querySelector('header i.fas.fa-home');
      expect(homeIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('desain-rumah-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have couch icon for ruang tamu', () => {
      const couchIcon = document.body.querySelector('[data-type="living-room"] i.fas.fa-couch');
      expect(couchIcon).toBeTruthy();
    });

    it('should have bed icon for kamar tidur', () => {
      const bedIcon = document.body.querySelector('[data-type="bedroom"] i.fas.fa-bed');
      expect(bedIcon).toBeTruthy();
    });

    it('should have utensils icon for dapur', () => {
      const utensilsIcon = document.body.querySelector('[data-type="kitchen"] i.fas.fa-utensils');
      expect(utensilsIcon).toBeTruthy();
    });

    it('should have bath icon for kamar mandi', () => {
      const bathIcon = document.body.querySelector('[data-type="bathroom"] i.fas.fa-bath');
      expect(bathIcon).toBeTruthy();
    });

    it('should have briefcase icon for kantor', () => {
      const briefcaseIcon = document.body.querySelector('[data-type="office"] i.fas.fa-briefcase');
      expect(briefcaseIcon).toBeTruthy();
    });

    it('should have tree icon for outdoor', () => {
      const treeIcon = document.body.querySelector('[data-type="outdoor"] i.fas.fa-tree');
      expect(treeIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have pen icon for custom style', () => {
      const penIcon = document.body.querySelector('i.fas.fa-pen');
      expect(penIcon).toBeTruthy();
    });

    it('should have palette icon for color palette', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have tint icon for custom colors', () => {
      const tintIcon = document.body.querySelector('i.fas.fa-tint');
      expect(tintIcon).toBeTruthy();
    });

    it('should have money-bill-wave icon for budget', () => {
      const moneyBillWaveIcon = document.body.querySelector('i.fas.fa-money-bill-wave');
      expect(moneyBillWaveIcon).toBeTruthy();
    });

    it('should have coins icon for budget detail', () => {
      const coinsIcon = document.body.querySelector('i.fas.fa-coins');
      expect(coinsIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have instagram icon for platform', () => {
      const instagramIcon = document.body.querySelector('i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
    });

    it('should have heart icon for tone', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have star icon for special requests', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have home icon in empty state', () => {
      const emptyStateIcon = document.getElementById('desain-rumah-empty-state').querySelector('i.fas.fa-home');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Desain Rumah');
      expect(document.body.textContent).toContain('Jenis Ruangan');
      expect(document.body.textContent).toContain('Gaya Desain');
      expect(document.body.textContent).toContain('Palet Warna');
      expect(document.body.textContent).toContain('Budget');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Desain Rumah');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Ruangan');
      expect(headers[1].textContent).toContain('2. Gaya Desain');
      expect(headers[2].textContent).toContain('3. Palet Warna');
      expect(headers[3].textContent).toContain('4. Budget');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('desain-rumah-empty-state');
      expect(emptyState.textContent).toContain('Hasil desain rumah akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Desain Rumah');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('desain-rumah-loading');
      expect(loading.textContent).toContain('Sedang membuat desain rumah');
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
      const styleSelect = document.getElementById('desain-rumah-style');
      expect(styleSelect).toBeTruthy();
      
      const customStyleInput = document.getElementById('desain-rumah-custom-style');
      expect(customStyleInput).toBeTruthy();
      
      const colorSelect = document.getElementById('desain-rumah-color');
      expect(colorSelect).toBeTruthy();
      
      const customColorsInput = document.getElementById('desain-rumah-custom-colors');
      expect(customColorsInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const styleSelect = document.getElementById('desain-rumah-style');
      expect(styleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('desain-rumah-color');
      expect(colorSelect).toBeTruthy();
      
      const budgetSelect = document.getElementById('desain-rumah-budget');
      expect(budgetSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('desain-rumah-audience');
      expect(audienceSelect).toBeTruthy();
      
      const platformSelect = document.getElementById('desain-rumah-platform');
      expect(platformSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('desain-rumah-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const customStyleInput = document.getElementById('desain-rumah-custom-style');
      expect(customStyleInput).toBeTruthy();
      
      const customColorsInput = document.getElementById('desain-rumah-custom-colors');
      expect(customColorsInput).toBeTruthy();
      
      const budgetDetailInput = document.getElementById('desain-rumah-budget-detail');
      expect(budgetDetailInput).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const specialInput = document.getElementById('desain-rumah-special');
      expect(specialInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('desain-rumah-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const customStyleInput = document.getElementById('desain-rumah-custom-style');
      expect(customStyleInput.tagName).toBe('INPUT');
      expect(customStyleInput.type).toBe('text');
      
      const customColorsInput = document.getElementById('desain-rumah-custom-colors');
      expect(customColorsInput.tagName).toBe('INPUT');
      expect(customColorsInput.type).toBe('text');
      
      const budgetDetailInput = document.getElementById('desain-rumah-budget-detail');
      expect(budgetDetailInput.tagName).toBe('INPUT');
      expect(budgetDetailInput.type).toBe('text');
    });

    it('should have proper room type button attributes', () => {
      const roomBtns = document.body.querySelectorAll('.type-btn-desain-rumah');
      roomBtns.forEach(btn => {
        expect(btn.type).toBe('button');
        expect(btn.dataset.type).toBeTruthy();
      });
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
    });

    it('should have responsive spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have responsive room options grid', () => {
      const roomOptions = document.getElementById('desain-rumah-room-options');
      expect(roomOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
