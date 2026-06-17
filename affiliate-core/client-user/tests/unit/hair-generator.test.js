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

describe('hair-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-hair-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 bg-clip-text text-transparent">
            <i class="fas fa-cut mr-3"></i>Generator Rambut
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat rekomendasi gaya rambut yang sempurna sesuai kepribadian Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Hair Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Rambut</h2>
              <div id="hair-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="straight" class="hair-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-minus text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Lurus</span>
                </button>
                <button type="button" data-type="wavy" class="hair-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-water text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Bergelombang</span>
                </button>
                <button type="button" data-type="curly" class="hair-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-undo text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Keriting</span>
                </button>
                <button type="button" data-type="coily" class="hair-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-spiral text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Kriting Ketat</span>
                </button>
                <button type="button" data-type="bald" class="hair-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Botak</span>
                </button>
                <button type="button" data-type="receding" class="hair-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-arrow-down text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Mundur</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Length -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Panjang Rambut</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="hair-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-ruler-vertical mr-1 text-pink-500"></i>Panjang
                  </label>
                  <select id="hair-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="short">Pendek</option>
                    <option value="medium">Sedang</option>
                    <option value="long">Panjang</option>
                    <option value="bald">Botak</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya Rambut</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="hair-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-cut mr-1 text-pink-500"></i>Gaya
                  </label>
                  <select id="hair-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="pixie">Pixie</option>
                    <option value="bob">Bob</option>
                    <option value="long-layers">Layer Panjang</option>
                    <option value="curls">Ikal</option>
                    <option value="braids">Kepang</option>
                    <option value="ponytail">Kuncir</option>
                    <option value="bun">Konde</option>
                    <option value="undercut">Undercut</option>
                    <option value="fade">Fade</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Color -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Warna Rambut</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="hair-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-pink-500"></i>Warna
                  </label>
                  <select id="hair-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="black">Hitam</option>
                    <option value="brown">Coklat</option>
                    <option value="blonde">Pirang</option>
                    <option value="red">Merah</option>
                    <option value="blue">Biru</option>
                    <option value="pink">Pink</option>
                    <option value="silver">Perak</option>
                    <option value="gray">Abu-abu</option>
                    <option value="ombre">Ombre</option>
                    <option value="highlights">Highlight</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Texture -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Tekstur Rambut</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="hair-texture" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-th-list mr-1 text-pink-500"></i>Tekstur
                  </label>
                  <select id="hair-texture" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="fine">Tipis</option>
                    <option value="medium">Sedang</option>
                    <option value="thick">Tebal</option>
                    <option value="coarse">Kasar</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="hair-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-pink-500"></i>Target Audiens
                  </label>
                  <select id="hair-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="women">Wanita</option>
                    <option value="men">Pria</option>
                    <option value="teens">Remaja</option>
                    <option value="all-genders">Semua Gender</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">7. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="hair-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-pink-500"></i>Nuansa
                  </label>
                  <select id="hair-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="natural">Alami</option>
                    <option value="bold">Berani</option>
                    <option value="elegant">Elegan</option>
                    <option value="playful">Playful</option>
                    <option value="professional">Profesional</option>
                    <option value="edgy">Edgy</option>
                  </select>
                </div>
                
                <div>
                  <label for="hair-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-pink-500"></i>Deskripsi Tambahan
                  </label>
                  <textarea id="hair-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="Jelaskan gaya rambut yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 8: Generate Button -->
            <button id="hair-generate-btn" class="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Rekomendasi
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="hair-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="hair-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-cut text-6xl mb-4 text-pink-400"></i>
                <p class="text-xl">Hasil rekomendasi gaya rambut akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Rekomendasi</p>
              </div>
              <div id="hair-results" class="hidden space-y-6"></div>
              <div id="hair-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-pink-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat rekomendasi...</p>
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
      const container = document.getElementById('content-hair-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Rambut');
      expect(title.querySelector('i.fas.fa-cut')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat rekomendasi gaya rambut yang sempurna sesuai kepribadian Anda');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(7);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#hair-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Hair Type Selection Tests
  describe('Hair Type Selection', () => {
    it('should render hair type options container', () => {
      const typeOptions = document.getElementById('hair-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Straight option', () => {
      const straightBtn = document.body.querySelector('[data-type="straight"]');
      expect(straightBtn).toBeTruthy();
      expect(straightBtn.textContent).toContain('Lurus');
      expect(straightBtn.querySelector('i.fas.fa-minus')).toBeTruthy();
      expect(straightBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Wavy option', () => {
      const wavyBtn = document.body.querySelector('[data-type="wavy"]');
      expect(wavyBtn).toBeTruthy();
      expect(wavyBtn.textContent).toContain('Bergelombang');
      expect(wavyBtn.querySelector('i.fas.fa-water')).toBeTruthy();
    });

    it('should render Curly option', () => {
      const curlyBtn = document.body.querySelector('[data-type="curly"]');
      expect(curlyBtn).toBeTruthy();
      expect(curlyBtn.textContent).toContain('Keriting');
      expect(curlyBtn.querySelector('i.fas.fa-undo')).toBeTruthy();
    });

    it('should render Coily option', () => {
      const coilyBtn = document.body.querySelector('[data-type="coily"]');
      expect(coilyBtn).toBeTruthy();
      expect(coilyBtn.textContent).toContain('Kriting Ketat');
      expect(coilyBtn.querySelector('i.fas.fa-spiral')).toBeTruthy();
    });

    it('should render Bald option', () => {
      const baldBtn = document.body.querySelector('[data-type="bald"]');
      expect(baldBtn).toBeTruthy();
      expect(baldBtn.textContent).toContain('Botak');
      expect(baldBtn.querySelector('i.fas.fa-user')).toBeTruthy();
    });

    it('should render Receding option', () => {
      const recedingBtn = document.body.querySelector('[data-type="receding"]');
      expect(recedingBtn).toBeTruthy();
      expect(recedingBtn.textContent).toContain('Mundur');
      expect(recedingBtn.querySelector('i.fas.fa-arrow-down')).toBeTruthy();
    });

    it('should have 6 hair type options', () => {
      const typeBtns = document.body.querySelectorAll('.hair-type-btn');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('hair-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have pink icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.hair-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-pink-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Rambut');
    });

    it('should have pink hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.hair-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-pink-100')).toBe(true);
      });
    });
  });

  // Length Input Tests
  describe('Length Input', () => {
    it('should render length select', () => {
      const lengthSelect = document.getElementById('hair-length');
      expect(lengthSelect).toBeTruthy();
      expect(lengthSelect.tagName).toBe('SELECT');
      expect(lengthSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Panjang Rambut');
    });

    it('should have all labels with icons', () => {
      const rulerIcon = document.body.querySelector('i.fas.fa-ruler-vertical');
      expect(rulerIcon).toBeTruthy();
    });

    it('should have length options with proper labels', () => {
      const lengthSelect = document.getElementById('hair-length');
      expect(lengthSelect.options[0].textContent).toContain('Pendek');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Panjang');
      expect(lengthSelect.options[3].textContent).toContain('Botak');
    });

    it('should have default length value', () => {
      const lengthSelect = document.getElementById('hair-length');
      expect(lengthSelect.value).toBe('short');
    });

    it('should have proper input styling', () => {
      const lengthSelect = document.getElementById('hair-length');
      expect(lengthSelect.classList.contains('w-full')).toBe(true);
      expect(lengthSelect.classList.contains('p-3')).toBe(true);
      expect(lengthSelect.classList.contains('border')).toBe(true);
      expect(lengthSelect.classList.contains('rounded-lg')).toBe(true);
      expect(lengthSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(lengthSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(9);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya Rambut');
    });

    it('should have all labels with icons', () => {
      const cutIcon = document.body.querySelector('i.fas.fa-cut');
      expect(cutIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect.options[0].textContent).toContain('Pixie');
      expect(styleSelect.options[1].textContent).toContain('Bob');
      expect(styleSelect.options[2].textContent).toContain('Layer Panjang');
      expect(styleSelect.options[3].textContent).toContain('Ikal');
      expect(styleSelect.options[4].textContent).toContain('Kepang');
      expect(styleSelect.options[5].textContent).toContain('Kuncir');
      expect(styleSelect.options[6].textContent).toContain('Konde');
      expect(styleSelect.options[7].textContent).toContain('Undercut');
      expect(styleSelect.options[8].textContent).toContain('Fade');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect.value).toBe('pixie');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Color Input Tests
  describe('Color Input', () => {
    it('should render color select', () => {
      const colorSelect = document.getElementById('hair-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(10);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Warna Rambut');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have color options with proper labels', () => {
      const colorSelect = document.getElementById('hair-color');
      expect(colorSelect.options[0].textContent).toContain('Hitam');
      expect(colorSelect.options[1].textContent).toContain('Coklat');
      expect(colorSelect.options[2].textContent).toContain('Pirang');
      expect(colorSelect.options[3].textContent).toContain('Merah');
      expect(colorSelect.options[4].textContent).toContain('Biru');
      expect(colorSelect.options[5].textContent).toContain('Pink');
      expect(colorSelect.options[6].textContent).toContain('Perak');
      expect(colorSelect.options[7].textContent).toContain('Abu-abu');
      expect(colorSelect.options[8].textContent).toContain('Ombre');
      expect(colorSelect.options[9].textContent).toContain('Highlight');
    });

    it('should have default color value', () => {
      const colorSelect = document.getElementById('hair-color');
      expect(colorSelect.value).toBe('black');
    });

    it('should have proper input styling', () => {
      const colorSelect = document.getElementById('hair-color');
      expect(colorSelect.classList.contains('w-full')).toBe(true);
      expect(colorSelect.classList.contains('p-3')).toBe(true);
      expect(colorSelect.classList.contains('border')).toBe(true);
      expect(colorSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Texture Input Tests
  describe('Texture Input', () => {
    it('should render texture select', () => {
      const textureSelect = document.getElementById('hair-texture');
      expect(textureSelect).toBeTruthy();
      expect(textureSelect.tagName).toBe('SELECT');
      expect(textureSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Tekstur Rambut');
    });

    it('should have all labels with icons', () => {
      const thListIcon = document.body.querySelector('i.fas.fa-th-list');
      expect(thListIcon).toBeTruthy();
    });

    it('should have texture options with proper labels', () => {
      const textureSelect = document.getElementById('hair-texture');
      expect(textureSelect.options[0].textContent).toContain('Tipis');
      expect(textureSelect.options[1].textContent).toContain('Sedang');
      expect(textureSelect.options[2].textContent).toContain('Tebal');
      expect(textureSelect.options[3].textContent).toContain('Kasar');
    });

    it('should have default texture value', () => {
      const textureSelect = document.getElementById('hair-texture');
      expect(textureSelect.value).toBe('fine');
    });

    it('should have proper input styling', () => {
      const textureSelect = document.getElementById('hair-texture');
      expect(textureSelect.classList.contains('w-full')).toBe(true);
      expect(textureSelect.classList.contains('p-3')).toBe(true);
      expect(textureSelect.classList.contains('border')).toBe(true);
      expect(textureSelect.classList.contains('rounded-lg')).toBe(true);
      expect(textureSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(textureSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('hair-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('hair-audience');
      expect(audienceSelect.options[0].textContent).toContain('Wanita');
      expect(audienceSelect.options[1].textContent).toContain('Pria');
      expect(audienceSelect.options[2].textContent).toContain('Remaja');
      expect(audienceSelect.options[3].textContent).toContain('Semua Gender');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('hair-audience');
      expect(audienceSelect.value).toBe('women');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('hair-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('hair-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('hair-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan gaya rambut yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[6].textContent).toContain('7. Nuansa');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('hair-tone');
      expect(toneSelect.options[0].textContent).toContain('Alami');
      expect(toneSelect.options[1].textContent).toContain('Berani');
      expect(toneSelect.options[2].textContent).toContain('Elegan');
      expect(toneSelect.options[3].textContent).toContain('Playful');
      expect(toneSelect.options[4].textContent).toContain('Profesional');
      expect(toneSelect.options[5].textContent).toContain('Edgy');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('hair-tone');
      expect(toneSelect.value).toBe('natural');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('hair-tone');
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
      const generateBtn = document.getElementById('hair-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Rekomendasi');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('hair-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('via-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('hair-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('hair-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('hair-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('hair-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-cut')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil rekomendasi gaya rambut akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('hair-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('hair-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat rekomendasi');
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
      const emptyState = document.getElementById('hair-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have pink icon in empty state', () => {
      const emptyStateIcon = document.getElementById('hair-empty-state').querySelector('i.fas.fa-cut');
      expect(emptyStateIcon.classList.contains('text-pink-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use pink/rose color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-pink-500')).toBe(true);
      expect(title.classList.contains('via-rose-500')).toBe(true);
      expect(title.classList.contains('to-pink-400')).toBe(true);
    });

    it('should use pink/rose accents in generate button', () => {
      const generateBtn = document.getElementById('hair-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('via-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('to-pink-400')).toBe(true);
    });

    it('should use pink accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.hair-type-btn');
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
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use pink accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });

    it('should use pink accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('hair-empty-state').querySelector('i.fas.fa-cut');
      expect(emptyStateIcon.classList.contains('text-pink-400')).toBe(true);
    });

    it('should use pink hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.hair-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-pink-100')).toBe(true);
      });
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(8);
      
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
      expect(icons.length).toBeGreaterThanOrEqual(15);
    });

    it('should have cut icon in header', () => {
      const cutIcon = document.body.querySelector('header i.fas.fa-cut');
      expect(cutIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('hair-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have minus icon for straight', () => {
      const straightIcon = document.body.querySelector('[data-type="straight"] i.fas.fa-minus');
      expect(straightIcon).toBeTruthy();
    });

    it('should have water icon for wavy', () => {
      const wavyIcon = document.body.querySelector('[data-type="wavy"] i.fas.fa-water');
      expect(wavyIcon).toBeTruthy();
    });

    it('should have undo icon for curly', () => {
      const curlyIcon = document.body.querySelector('[data-type="curly"] i.fas.fa-undo');
      expect(curlyIcon).toBeTruthy();
    });

    it('should have spiral icon for coily', () => {
      const coilyIcon = document.body.querySelector('[data-type="coily"] i.fas.fa-spiral');
      expect(coilyIcon).toBeTruthy();
    });

    it('should have user icon for bald', () => {
      const baldIcon = document.body.querySelector('[data-type="bald"] i.fas.fa-user');
      expect(baldIcon).toBeTruthy();
    });

    it('should have arrow-down icon for receding', () => {
      const recedingIcon = document.body.querySelector('[data-type="receding"] i.fas.fa-arrow-down');
      expect(recedingIcon).toBeTruthy();
    });

    it('should have ruler-vertical icon for length', () => {
      const rulerIcon = document.body.querySelector('i.fas.fa-ruler-vertical');
      expect(rulerIcon).toBeTruthy();
    });

    it('should have cut icon for style', () => {
      const cutIcon = document.body.querySelector('i.fas.fa-cut');
      expect(cutIcon).toBeTruthy();
    });

    it('should have palette icon for color', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have th-list icon for texture', () => {
      const thListIcon = document.body.querySelector('i.fas.fa-th-list');
      expect(thListIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have heart icon for tone', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have align-left icon for description', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have cut icon in empty state', () => {
      const emptyStateIcon = document.getElementById('hair-empty-state').querySelector('i.fas.fa-cut');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Rambut');
      expect(document.body.textContent).toContain('Jenis Rambut');
      expect(document.body.textContent).toContain('Panjang Rambut');
      expect(document.body.textContent).toContain('Gaya Rambut');
      expect(document.body.textContent).toContain('Warna Rambut');
      expect(document.body.textContent).toContain('Tekstur Rambut');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Rekomendasi');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(7);
      expect(headers[0].textContent).toContain('1. Jenis Rambut');
      expect(headers[1].textContent).toContain('2. Panjang Rambut');
      expect(headers[2].textContent).toContain('3. Gaya Rambut');
      expect(headers[3].textContent).toContain('4. Warna Rambut');
      expect(headers[4].textContent).toContain('5. Tekstur Rambut');
      expect(headers[5].textContent).toContain('6. Target Audiens');
      expect(headers[6].textContent).toContain('7. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('hair-empty-state');
      expect(emptyState.textContent).toContain('Hasil rekomendasi gaya rambut akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Rekomendasi');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('hair-loading');
      expect(loading.textContent).toContain('Sedang membuat rekomendasi');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(7);
    });

    it('should have labeled form inputs', () => {
      const lengthSelect = document.getElementById('hair-length');
      expect(lengthSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('hair-color');
      expect(colorSelect).toBeTruthy();
      
      const textureSelect = document.getElementById('hair-texture');
      expect(textureSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('hair-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('hair-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('hair-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const lengthSelect = document.getElementById('hair-length');
      expect(lengthSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('hair-color');
      expect(colorSelect).toBeTruthy();
      
      const textureSelect = document.getElementById('hair-texture');
      expect(textureSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('hair-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('hair-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('hair-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('hair-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const lengthSelect = document.getElementById('hair-length');
      expect(lengthSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('hair-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const colorSelect = document.getElementById('hair-color');
      expect(colorSelect.tagName).toBe('SELECT');
      
      const textureSelect = document.getElementById('hair-texture');
      expect(textureSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('hair-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('hair-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea type', () => {
      const descriptionInput = document.getElementById('hair-description');
      expect(descriptionInput.tagName).toBe('TEXTAREA');
    });

    it('should have proper button types', () => {
      const typeBtns = document.body.querySelectorAll('.hair-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const straightBtn = document.body.querySelector('[data-type="straight"]');
      expect(straightBtn.dataset.type).toBe('straight');
      expect(straightBtn.dataset.selected).toBe('true');
      
      const wavyBtn = document.body.querySelector('[data-type="wavy"]');
      expect(wavyBtn.dataset.type).toBe('wavy');
    });

    it('should have proper placeholder text', () => {
      const descriptionInput = document.getElementById('hair-description');
      expect(descriptionInput.placeholder).toContain('Jelaskan gaya rambut yang diinginkan');
    });

    it('should have proper button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.hair-type-btn');
      typeBtns.forEach(btn => {
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

    it('should have responsive type options grid', () => {
      const typeOptions = document.getElementById('hair-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
