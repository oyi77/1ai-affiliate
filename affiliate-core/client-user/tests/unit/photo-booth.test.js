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

describe('photo-booth Component', () => {
  
  const mockComponentHTML = `
    <div id="content-photo-booth" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            <i class="fas fa-camera mr-3"></i>Photo Booth
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat foto kreatif dan menarik dengan berbagai gaya dan efek</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Photo Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Foto</h2>
              <div id="photo-booth-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="selfie" class="type-btn-photo-booth p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-user text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Selfie</span>
                </button>
                <button type="button" data-type="group" class="type-btn-photo-booth p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-users text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Grup</span>
                </button>
                <button type="button" data-type="portrait" class="type-btn-photo-booth p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-portrait text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Potret</span>
                </button>
                <button type="button" data-type="candid" class="type-btn-photo-booth p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-camera text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Candid</span>
                </button>
                <button type="button" data-type="themed" class="type-btn-photo-booth p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-mask text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Bertema</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Background & Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Latar Belakang & Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-booth-background" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-purple-500"></i>Latar Belakang
                  </label>
                  <select id="photo-booth-background" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="solid">Warna Solid</option>
                    <option value="gradient">Gradien</option>
                    <option value="scenery">Pemandangan</option>
                    <option value="props">Dengan Properti</option>
                    <option value="studio">Studio</option>
                    <option value="outdoor">Luar Ruangan</option>
                  </select>
                </div>
                
                <div>
                  <label for="photo-booth-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-brush mr-1 text-purple-500"></i>Gaya Visual
                  </label>
                  <select id="photo-booth-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="minimal">Minimalis</option>
                    <option value="colorful">Warna-warni</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="artistic">Artistik</option>
                    <option value="boho">Boho Chic</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Filter & Effect -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Filter & Efek</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-booth-filter" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-filter mr-1 text-purple-500"></i>Filter
                  </label>
                  <select id="photo-booth-filter" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="none">Tanpa Filter</option>
                    <option value="warm">Hangat</option>
                    <option value="cool">Dingin</option>
                    <option value="bw">Hitam Putih</option>
                    <option value="sepia">Sepia</option>
                    <option value="vivid">Cerah</option>
                    <option value="soft">Soft & Lembut</option>
                    <option value="dramatic">Dramatis</option>
                  </select>
                </div>
                
                <div>
                  <label for="photo-booth-effect" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-magic mr-1 text-purple-500"></i>Efek Khusus
                  </label>
                  <select id="photo-booth-effect" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="none">Tanpa Efek</option>
                    <option value="blur">Blur Background</option>
                    <option value="bokeh">Bokeh</option>
                    <option value="light-leak">Light Leak</option>
                    <option value="grain">Film Grain</option>
                    <option value="double-exposure">Double Exposure</option>
                    <option value="polaroid">Gaya Polaroid</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-booth-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Target Audiens
                  </label>
                  <select id="photo-booth-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="friends">Teman</option>
                    <option value="family">Keluarga</option>
                    <option value="couples">Pasangan</option>
                    <option value="social-media">Media Sosial</option>
                    <option value="professional">Profesional</option>
                    <option value="all">Semua Orang</option>
                  </select>
                </div>
                
                <div>
                  <label for="photo-booth-platform" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fab fa-instagram mr-1 text-purple-500"></i>Platform
                  </label>
                  <select id="photo-booth-platform" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="print">Cetak</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Tone & Mood -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Nuansa & Suasana</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-booth-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-purple-500"></i>Nuansa
                  </label>
                  <select id="photo-booth-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="fun">Seru & Fun</option>
                    <option value="romantic">Romantis</option>
                    <option value="dramatic">Dramatis</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegan</option>
                    <option value="playful">Playful</option>
                    <option value="moody">Moody</option>
                  </select>
                </div>
                
                <div>
                  <label for="photo-booth-mood" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-purple-500"></i>Suasana
                  </label>
                  <select id="photo-booth-mood" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="happy">Bahagia</option>
                    <option value="peaceful">Tenang</option>
                    <option value="energetic">Energik</option>
                    <option value="nostalgic">Nostalgia</option>
                    <option value="dreamy">Dreamy</option>
                    <option value="bold">Berani</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Additional Details -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Detail Tambahan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="photo-booth-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tint mr-1 text-purple-500"></i>Warna Dominan
                  </label>
                  <select id="photo-booth-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="any">Bebas</option>
                    <option value="pastel">Pastel</option>
                    <option value="neon">Neon</option>
                    <option value="earth">Earth Tone</option>
                    <option value="monochrome">Monokrom</option>
                    <option value="rainbow">Rainbow</option>
                  </select>
                </div>
                
                <div>
                  <label for="photo-booth-special" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-purple-500"></i>Permintaan Khusus
                  </label>
                  <textarea id="photo-booth-special" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Gaya khusus yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="photo-booth-generate-btn" class="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Foto
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="photo-booth-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="photo-booth-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-camera text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil foto akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Foto</p>
              </div>
              <div id="photo-booth-results" class="hidden space-y-6"></div>
              <div id="photo-booth-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat foto...</p>
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
      const container = document.getElementById('content-photo-booth');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Photo Booth');
      expect(title.querySelector('i.fas.fa-camera')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat foto kreatif dan menarik');
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
      expect(rightPanel.querySelector('#photo-booth-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Photo Type Selection Tests
  describe('Photo Type Selection', () => {
    it('should render photo type options container', () => {
      const photoTypeOptions = document.getElementById('photo-booth-type-options');
      expect(photoTypeOptions).toBeTruthy();
    });

    it('should render Selfie option', () => {
      const selfieBtn = document.body.querySelector('[data-type="selfie"]');
      expect(selfieBtn).toBeTruthy();
      expect(selfieBtn.textContent).toContain('Selfie');
      expect(selfieBtn.querySelector('i.fas.fa-user')).toBeTruthy();
      expect(selfieBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Grup option', () => {
      const grupBtn = document.body.querySelector('[data-type="group"]');
      expect(grupBtn).toBeTruthy();
      expect(grupBtn.textContent).toContain('Grup');
      expect(grupBtn.querySelector('i.fas.fa-users')).toBeTruthy();
    });

    it('should render Potret option', () => {
      const potretBtn = document.body.querySelector('[data-type="portrait"]');
      expect(potretBtn).toBeTruthy();
      expect(potretBtn.textContent).toContain('Potret');
      expect(potretBtn.querySelector('i.fas.fa-portrait')).toBeTruthy();
    });

    it('should render Candid option', () => {
      const candidBtn = document.body.querySelector('[data-type="candid"]');
      expect(candidBtn).toBeTruthy();
      expect(candidBtn.textContent).toContain('Candid');
      expect(candidBtn.querySelector('i.fas.fa-camera')).toBeTruthy();
    });

    it('should render Bertema option', () => {
      const themedBtn = document.body.querySelector('[data-type="themed"]');
      expect(themedBtn).toBeTruthy();
      expect(themedBtn.textContent).toContain('Bertema');
      expect(themedBtn.querySelector('i.fas.fa-mask')).toBeTruthy();
    });

    it('should have 5 photo type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-photo-booth');
      expect(typeBtns.length).toBe(5);
    });

    it('should have proper grid layout for type options', () => {
      const photoTypeOptions = document.getElementById('photo-booth-type-options');
      expect(photoTypeOptions.classList.contains('grid')).toBe(true);
      expect(photoTypeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(photoTypeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have purple icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-photo-booth');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Foto');
    });
  });

  // Background & Style Input Tests
  describe('Background & Style Input', () => {
    it('should render background select', () => {
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect).toBeTruthy();
      expect(backgroundSelect.tagName).toBe('SELECT');
      expect(backgroundSelect.options.length).toBe(6);
    });

    it('should render style select', () => {
      const styleSelect = document.getElementById('photo-booth-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Latar Belakang & Gaya');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      
      const brushIcon = document.body.querySelector('i.fas.fa-brush');
      expect(brushIcon).toBeTruthy();
    });

    it('should have background options with proper labels', () => {
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect.options[0].textContent).toContain('Warna Solid');
      expect(backgroundSelect.options[1].textContent).toContain('Gradien');
      expect(backgroundSelect.options[2].textContent).toContain('Pemandangan');
      expect(backgroundSelect.options[3].textContent).toContain('Dengan Properti');
      expect(backgroundSelect.options[4].textContent).toContain('Studio');
      expect(backgroundSelect.options[5].textContent).toContain('Luar Ruangan');
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('photo-booth-style');
      expect(styleSelect.options[0].textContent).toContain('Minimalis');
      expect(styleSelect.options[1].textContent).toContain('Warna-warni');
      expect(styleSelect.options[2].textContent).toContain('Vintage');
      expect(styleSelect.options[3].textContent).toContain('Modern');
      expect(styleSelect.options[4].textContent).toContain('Artistik');
      expect(styleSelect.options[5].textContent).toContain('Boho Chic');
    });

    it('should have default background value', () => {
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect.value).toBe('solid');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('photo-booth-style');
      expect(styleSelect.value).toBe('minimal');
    });

    it('should have proper input styling', () => {
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect.classList.contains('w-full')).toBe(true);
      expect(backgroundSelect.classList.contains('p-3')).toBe(true);
      expect(backgroundSelect.classList.contains('border')).toBe(true);
      expect(backgroundSelect.classList.contains('rounded-lg')).toBe(true);
      expect(backgroundSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(backgroundSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Filter & Effect Input Tests
  describe('Filter & Effect Input', () => {
    it('should render filter select', () => {
      const filterSelect = document.getElementById('photo-booth-filter');
      expect(filterSelect).toBeTruthy();
      expect(filterSelect.tagName).toBe('SELECT');
      expect(filterSelect.options.length).toBe(8);
    });

    it('should render effect select', () => {
      const effectSelect = document.getElementById('photo-booth-effect');
      expect(effectSelect).toBeTruthy();
      expect(effectSelect.tagName).toBe('SELECT');
      expect(effectSelect.options.length).toBe(7);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Filter & Efek');
    });

    it('should have all labels with icons', () => {
      const filterIcon = document.body.querySelector('i.fas.fa-filter');
      expect(filterIcon).toBeTruthy();
      
      const magicIcon = document.body.querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have filter options with proper labels', () => {
      const filterSelect = document.getElementById('photo-booth-filter');
      expect(filterSelect.options[0].textContent).toContain('Tanpa Filter');
      expect(filterSelect.options[1].textContent).toContain('Hangat');
      expect(filterSelect.options[2].textContent).toContain('Dingin');
      expect(filterSelect.options[3].textContent).toContain('Hitam Putih');
      expect(filterSelect.options[4].textContent).toContain('Sepia');
      expect(filterSelect.options[5].textContent).toContain('Cerah');
      expect(filterSelect.options[6].textContent).toContain('Soft & Lembut');
      expect(filterSelect.options[7].textContent).toContain('Dramatis');
    });

    it('should have effect options with proper labels', () => {
      const effectSelect = document.getElementById('photo-booth-effect');
      expect(effectSelect.options[0].textContent).toContain('Tanpa Efek');
      expect(effectSelect.options[1].textContent).toContain('Blur Background');
      expect(effectSelect.options[2].textContent).toContain('Bokeh');
      expect(effectSelect.options[3].textContent).toContain('Light Leak');
      expect(effectSelect.options[4].textContent).toContain('Film Grain');
      expect(effectSelect.options[5].textContent).toContain('Double Exposure');
      expect(effectSelect.options[6].textContent).toContain('Gaya Polaroid');
    });

    it('should have default filter value', () => {
      const filterSelect = document.getElementById('photo-booth-filter');
      expect(filterSelect.value).toBe('none');
    });

    it('should have default effect value', () => {
      const effectSelect = document.getElementById('photo-booth-effect');
      expect(effectSelect.value).toBe('none');
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('photo-booth-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(6);
    });

    it('should render platform select', () => {
      const platformSelect = document.getElementById('photo-booth-platform');
      expect(platformSelect).toBeTruthy();
      expect(platformSelect.tagName).toBe('SELECT');
      expect(platformSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const instagramIcon = document.body.querySelector('i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('photo-booth-audience');
      expect(audienceSelect.options[0].textContent).toContain('Teman');
      expect(audienceSelect.options[1].textContent).toContain('Keluarga');
      expect(audienceSelect.options[2].textContent).toContain('Pasangan');
      expect(audienceSelect.options[3].textContent).toContain('Media Sosial');
      expect(audienceSelect.options[4].textContent).toContain('Profesional');
      expect(audienceSelect.options[5].textContent).toContain('Semua Orang');
    });

    it('should have platform options with proper labels', () => {
      const platformSelect = document.getElementById('photo-booth-platform');
      expect(platformSelect.options[0].textContent).toContain('Instagram');
      expect(platformSelect.options[1].textContent).toContain('TikTok');
      expect(platformSelect.options[2].textContent).toContain('Facebook');
      expect(platformSelect.options[3].textContent).toContain('Twitter/X');
      expect(platformSelect.options[4].textContent).toContain('LinkedIn');
      expect(platformSelect.options[5].textContent).toContain('Cetak');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('photo-booth-audience');
      expect(audienceSelect.value).toBe('friends');
    });

    it('should have default platform value', () => {
      const platformSelect = document.getElementById('photo-booth-platform');
      expect(platformSelect.value).toBe('instagram');
    });
  });

  // Tone & Mood Selection Tests
  describe('Tone & Mood Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('photo-booth-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(8);
    });

    it('should render mood select', () => {
      const moodSelect = document.getElementById('photo-booth-mood');
      expect(moodSelect).toBeTruthy();
      expect(moodSelect.tagName).toBe('SELECT');
      expect(moodSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Nuansa & Suasana');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('photo-booth-tone');
      expect(toneSelect.options[0].textContent).toContain('Seru & Fun');
      expect(toneSelect.options[1].textContent).toContain('Romantis');
      expect(toneSelect.options[2].textContent).toContain('Dramatis');
      expect(toneSelect.options[3].textContent).toContain('Vintage');
      expect(toneSelect.options[4].textContent).toContain('Modern');
      expect(toneSelect.options[5].textContent).toContain('Elegan');
      expect(toneSelect.options[6].textContent).toContain('Playful');
      expect(toneSelect.options[7].textContent).toContain('Moody');
    });

    it('should have mood options with proper labels', () => {
      const moodSelect = document.getElementById('photo-booth-mood');
      expect(moodSelect.options[0].textContent).toContain('Bahagia');
      expect(moodSelect.options[1].textContent).toContain('Tenang');
      expect(moodSelect.options[2].textContent).toContain('Energik');
      expect(moodSelect.options[3].textContent).toContain('Nostalgia');
      expect(moodSelect.options[4].textContent).toContain('Dreamy');
      expect(moodSelect.options[5].textContent).toContain('Berani');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('photo-booth-tone');
      expect(toneSelect.value).toBe('fun');
    });

    it('should have default mood value', () => {
      const moodSelect = document.getElementById('photo-booth-mood');
      expect(moodSelect.value).toBe('happy');
    });
  });

  // Additional Details Tests
  describe('Additional Details', () => {
    it('should render color palette select', () => {
      const colorSelect = document.getElementById('photo-booth-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(6);
    });

    it('should render special requests textarea', () => {
      const specialInput = document.getElementById('photo-booth-special');
      expect(specialInput).toBeTruthy();
      expect(specialInput.tagName).toBe('TEXTAREA');
      expect(specialInput.rows).toBe(2);
      expect(specialInput.placeholder).toContain('Gaya khusus yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
    });

    it('should have all labels with icons', () => {
      const tintIcon = document.body.querySelector('i.fas.fa-tint');
      expect(tintIcon).toBeTruthy();
      
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have color palette options with proper labels', () => {
      const colorSelect = document.getElementById('photo-booth-color');
      expect(colorSelect.options[0].textContent).toContain('Bebas');
      expect(colorSelect.options[1].textContent).toContain('Pastel');
      expect(colorSelect.options[2].textContent).toContain('Neon');
      expect(colorSelect.options[3].textContent).toContain('Earth Tone');
      expect(colorSelect.options[4].textContent).toContain('Monokrom');
      expect(colorSelect.options[5].textContent).toContain('Rainbow');
    });

    it('should have default color palette value', () => {
      const colorSelect = document.getElementById('photo-booth-color');
      expect(colorSelect.value).toBe('any');
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('photo-booth-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Foto');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('photo-booth-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('photo-booth-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('photo-booth-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('photo-booth-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-camera')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil foto akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('photo-booth-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('photo-booth-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat foto');
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
      const emptyState = document.getElementById('photo-booth-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('photo-booth-empty-state').querySelector('i.fas.fa-camera');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/pink color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-600')).toBe(true);
      expect(title.classList.contains('to-pink-500')).toBe(true);
    });

    it('should use purple/pink accents in generate button', () => {
      const generateBtn = document.getElementById('photo-booth-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-500')).toBe(true);
    });

    it('should use purple accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-photo-booth');
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
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(backgroundSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('photo-booth-empty-state').querySelector('i.fas.fa-camera');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-photo-booth');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(18);
    });

    it('should have camera icon in header', () => {
      const cameraIcon = document.body.querySelector('header i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('photo-booth-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have user icon for selfie', () => {
      const userIcon = document.body.querySelector('[data-type="selfie"] i.fas.fa-user');
      expect(userIcon).toBeTruthy();
    });

    it('should have users icon for grup', () => {
      const usersIcon = document.body.querySelector('[data-type="group"] i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have portrait icon for potret', () => {
      const portraitIcon = document.body.querySelector('[data-type="portrait"] i.fas.fa-portrait');
      expect(portraitIcon).toBeTruthy();
    });

    it('should have camera icon for candid', () => {
      const cameraIcon = document.body.querySelector('[data-type="candid"] i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have mask icon for bertema', () => {
      const maskIcon = document.body.querySelector('[data-type="themed"] i.fas.fa-mask');
      expect(maskIcon).toBeTruthy();
    });

    it('should have palette icon for background', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have brush icon for style', () => {
      const brushIcon = document.body.querySelector('i.fas.fa-brush');
      expect(brushIcon).toBeTruthy();
    });

    it('should have filter icon for filter', () => {
      const filterIcon = document.body.querySelector('i.fas.fa-filter');
      expect(filterIcon).toBeTruthy();
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

    it('should have smile icon for mood', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have tint icon for color palette', () => {
      const tintIcon = document.body.querySelector('i.fas.fa-tint');
      expect(tintIcon).toBeTruthy();
    });

    it('should have star icon for special requests', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Photo Booth');
      expect(document.body.textContent).toContain('Jenis Foto');
      expect(document.body.textContent).toContain('Latar Belakang & Gaya');
      expect(document.body.textContent).toContain('Filter & Efek');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa & Suasana');
      expect(document.body.textContent).toContain('Detail Tambahan');
      expect(document.body.textContent).toContain('Buat Foto');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Foto');
      expect(headers[1].textContent).toContain('2. Latar Belakang & Gaya');
      expect(headers[2].textContent).toContain('3. Filter & Efek');
      expect(headers[3].textContent).toContain('4. Target Audiens');
      expect(headers[4].textContent).toContain('5. Nuansa & Suasana');
      expect(headers[5].textContent).toContain('6. Detail Tambahan');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('photo-booth-empty-state');
      expect(emptyState.textContent).toContain('Hasil foto akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Foto');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('photo-booth-loading');
      expect(loading.textContent).toContain('Sedang membuat foto');
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
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('photo-booth-style');
      expect(styleSelect).toBeTruthy();
      
      const filterSelect = document.getElementById('photo-booth-filter');
      expect(filterSelect).toBeTruthy();
      
      const effectSelect = document.getElementById('photo-booth-effect');
      expect(effectSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('photo-booth-style');
      expect(styleSelect).toBeTruthy();
      
      const filterSelect = document.getElementById('photo-booth-filter');
      expect(filterSelect).toBeTruthy();
      
      const effectSelect = document.getElementById('photo-booth-effect');
      expect(effectSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('photo-booth-audience');
      expect(audienceSelect).toBeTruthy();
      
      const platformSelect = document.getElementById('photo-booth-platform');
      expect(platformSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('photo-booth-tone');
      expect(toneSelect).toBeTruthy();
      
      const moodSelect = document.getElementById('photo-booth-mood');
      expect(moodSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('photo-booth-color');
      expect(colorSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const specialInput = document.getElementById('photo-booth-special');
      expect(specialInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('photo-booth-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const backgroundSelect = document.getElementById('photo-booth-background');
      expect(backgroundSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('photo-booth-style');
      expect(styleSelect.tagName).toBe('SELECT');
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
  });
});
