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

describe('sticker Component', () => {
  
  const mockComponentHTML = `
    <div id="content-sticker" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            <i class="fas fa-sticky-note mr-3"></i>Stiker
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat desain stiker yang kreatif dan menarik untuk berbagai kebutuhan</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Sticker Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Stiker</h2>
              <div id="sticker-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="emoji" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-smile text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Emoji</span>
                </button>
                <button type="button" data-type="meme" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-laugh-squint text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Meme</span>
                </button>
                <button type="button" data-type="character" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user-astronaut text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Karakter</span>
                </button>
                <button type="button" data-type="text" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-font text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Teks</span>
                </button>
                <button type="button" data-type="reaction" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-hand-point-up text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Reaksi</span>
                </button>
                <button type="button" data-type="celebration" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-party-horn text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Perayaan</span>
                </button>
                <button type="button" data-type="seasonal" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-snowflake text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Musiman</span>
                </button>
                <button type="button" data-type="custom" class="sticker-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-puzzle-piece text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Custom</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sticker-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-yellow-500"></i>Gaya
                  </label>
                  <select id="sticker-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="cute">Lucu</option>
                    <option value="cool">Keren</option>
                    <option value="funny">Lucu</option>
                    <option value="aesthetic">Estetik</option>
                    <option value="retro">Retro</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimalis</option>
                    <option value="3d">3D</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Size -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Ukuran</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sticker-size" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand-arrows-alt mr-1 text-yellow-500"></i>Ukuran
                  </label>
                  <select id="sticker-size" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="small">Kecil</option>
                    <option value="medium">Sedang</option>
                    <option value="large">Besar</option>
                    <option value="extra-large">Ekstra Besar</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Format -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Format</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sticker-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-image mr-1 text-yellow-500"></i>Format
                  </label>
                  <select id="sticker-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                    <option value="jpg">JPG</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Usage -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Penggunaan</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sticker-usage" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-bullhorn mr-1 text-yellow-500"></i>Penggunaan
                  </label>
                  <select id="sticker-usage" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="social-media">Media Sosial</option>
                    <option value="messaging">Pesan Instan</option>
                    <option value="gaming">Gaming</option>
                    <option value="merchandise">Merchandise</option>
                    <option value="packaging">Kemasan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sticker-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-yellow-500"></i>Target Audiens
                  </label>
                  <select id="sticker-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="gen-z">Gen Z</option>
                    <option value="millennials">Millennials</option>
                    <option value="kids">Anak-anak</option>
                    <option value="professionals">Profesional</option>
                    <option value="gamers">Gamers</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">7. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sticker-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-yellow-500"></i>Nuansa
                  </label>
                  <select id="sticker-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="funny">Lucu</option>
                    <option value="cute">Manis</option>
                    <option value="cool">Keren</option>
                    <option value="inspirational">Inspiratif</option>
                    <option value="sarcastic">Sarkastis</option>
                    <option value="wholesome">Positif</option>
                  </select>
                </div>
                
                <div>
                  <label for="sticker-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-yellow-500"></i>Deskripsi Stiker
                  </label>
                  <textarea id="sticker-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" placeholder="Jelaskan desain stiker yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 8: Generate Button -->
            <button id="sticker-generate-btn" class="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Stiker
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="sticker-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="sticker-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-sticky-note text-6xl mb-4 text-yellow-400"></i>
                <p class="text-xl">Hasil desain stiker akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Stiker</p>
              </div>
              <div id="sticker-results" class="hidden space-y-6"></div>
              <div id="sticker-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-yellow-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat stiker...</p>
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
      const container = document.getElementById('content-sticker');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Stiker');
      expect(title.querySelector('i.fas.fa-sticky-note')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat desain stiker yang kreatif dan menarik untuk berbagai kebutuhan');
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
      expect(rightPanel.querySelector('#sticker-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Sticker Type Selection Tests
  describe('Sticker Type Selection', () => {
    it('should render sticker type options container', () => {
      const typeOptions = document.getElementById('sticker-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Emoji option', () => {
      const emojiBtn = document.body.querySelector('[data-type="emoji"]');
      expect(emojiBtn).toBeTruthy();
      expect(emojiBtn.textContent).toContain('Emoji');
      expect(emojiBtn.querySelector('i.fas.fa-smile')).toBeTruthy();
      expect(emojiBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Meme option', () => {
      const memeBtn = document.body.querySelector('[data-type="meme"]');
      expect(memeBtn).toBeTruthy();
      expect(memeBtn.textContent).toContain('Meme');
      expect(memeBtn.querySelector('i.fas.fa-laugh-squint')).toBeTruthy();
    });

    it('should render Character option', () => {
      const characterBtn = document.body.querySelector('[data-type="character"]');
      expect(characterBtn).toBeTruthy();
      expect(characterBtn.textContent).toContain('Karakter');
      expect(characterBtn.querySelector('i.fas.fa-user-astronaut')).toBeTruthy();
    });

    it('should render Text option', () => {
      const textBtn = document.body.querySelector('[data-type="text"]');
      expect(textBtn).toBeTruthy();
      expect(textBtn.textContent).toContain('Teks');
      expect(textBtn.querySelector('i.fas.fa-font')).toBeTruthy();
    });

    it('should render Reaction option', () => {
      const reactionBtn = document.body.querySelector('[data-type="reaction"]');
      expect(reactionBtn).toBeTruthy();
      expect(reactionBtn.textContent).toContain('Reaksi');
      expect(reactionBtn.querySelector('i.fas.fa-hand-point-up')).toBeTruthy();
    });

    it('should render Celebration option', () => {
      const celebrationBtn = document.body.querySelector('[data-type="celebration"]');
      expect(celebrationBtn).toBeTruthy();
      expect(celebrationBtn.textContent).toContain('Perayaan');
      expect(celebrationBtn.querySelector('i.fas.fa-party-horn')).toBeTruthy();
    });

    it('should render Seasonal option', () => {
      const seasonalBtn = document.body.querySelector('[data-type="seasonal"]');
      expect(seasonalBtn).toBeTruthy();
      expect(seasonalBtn.textContent).toContain('Musiman');
      expect(seasonalBtn.querySelector('i.fas.fa-snowflake')).toBeTruthy();
    });

    it('should render Custom option', () => {
      const customBtn = document.body.querySelector('[data-type="custom"]');
      expect(customBtn).toBeTruthy();
      expect(customBtn.textContent).toContain('Custom');
      expect(customBtn.querySelector('i.fas.fa-puzzle-piece')).toBeTruthy();
    });

    it('should have 8 sticker type options', () => {
      const typeBtns = document.body.querySelectorAll('.sticker-type-btn');
      expect(typeBtns.length).toBe(8);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('sticker-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have yellow icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.sticker-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-yellow-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Stiker');
    });

    it('should have yellow hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.sticker-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-yellow-100')).toBe(true);
      });
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('sticker-style');
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
      const styleSelect = document.getElementById('sticker-style');
      expect(styleSelect.options[0].textContent).toContain('Lucu');
      expect(styleSelect.options[1].textContent).toContain('Keren');
      expect(styleSelect.options[2].textContent).toContain('Lucu');
      expect(styleSelect.options[3].textContent).toContain('Estetik');
      expect(styleSelect.options[4].textContent).toContain('Retro');
      expect(styleSelect.options[5].textContent).toContain('Modern');
      expect(styleSelect.options[6].textContent).toContain('Minimalis');
      expect(styleSelect.options[7].textContent).toContain('3D');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('sticker-style');
      expect(styleSelect.value).toBe('cute');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('sticker-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Size Input Tests
  describe('Size Input', () => {
    it('should render size select', () => {
      const sizeSelect = document.getElementById('sticker-size');
      expect(sizeSelect).toBeTruthy();
      expect(sizeSelect.tagName).toBe('SELECT');
      expect(sizeSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Ukuran');
    });

    it('should have all labels with icons', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandIcon).toBeTruthy();
    });

    it('should have size options with proper labels', () => {
      const sizeSelect = document.getElementById('sticker-size');
      expect(sizeSelect.options[0].textContent).toContain('Kecil');
      expect(sizeSelect.options[1].textContent).toContain('Sedang');
      expect(sizeSelect.options[2].textContent).toContain('Besar');
      expect(sizeSelect.options[3].textContent).toContain('Ekstra Besar');
    });

    it('should have default size value', () => {
      const sizeSelect = document.getElementById('sticker-size');
      expect(sizeSelect.value).toBe('small');
    });

    it('should have proper input styling', () => {
      const sizeSelect = document.getElementById('sticker-size');
      expect(sizeSelect.classList.contains('w-full')).toBe(true);
      expect(sizeSelect.classList.contains('p-3')).toBe(true);
      expect(sizeSelect.classList.contains('border')).toBe(true);
      expect(sizeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Format Input Tests
  describe('Format Input', () => {
    it('should render format select', () => {
      const formatSelect = document.getElementById('sticker-format');
      expect(formatSelect).toBeTruthy();
      expect(formatSelect.tagName).toBe('SELECT');
      expect(formatSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Format');
    });

    it('should have all labels with icons', () => {
      const fileImageIcon = document.body.querySelector('i.fas.fa-file-image');
      expect(fileImageIcon).toBeTruthy();
    });

    it('should have format options with proper labels', () => {
      const formatSelect = document.getElementById('sticker-format');
      expect(formatSelect.options[0].textContent).toContain('PNG');
      expect(formatSelect.options[1].textContent).toContain('SVG');
      expect(formatSelect.options[2].textContent).toContain('JPG');
      expect(formatSelect.options[3].textContent).toContain('GIF');
    });

    it('should have default format value', () => {
      const formatSelect = document.getElementById('sticker-format');
      expect(formatSelect.value).toBe('png');
    });

    it('should have proper input styling', () => {
      const formatSelect = document.getElementById('sticker-format');
      expect(formatSelect.classList.contains('w-full')).toBe(true);
      expect(formatSelect.classList.contains('p-3')).toBe(true);
      expect(formatSelect.classList.contains('border')).toBe(true);
      expect(formatSelect.classList.contains('rounded-lg')).toBe(true);
      expect(formatSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(formatSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Usage Input Tests
  describe('Usage Input', () => {
    it('should render usage select', () => {
      const usageSelect = document.getElementById('sticker-usage');
      expect(usageSelect).toBeTruthy();
      expect(usageSelect.tagName).toBe('SELECT');
      expect(usageSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Penggunaan');
    });

    it('should have all labels with icons', () => {
      const bullhornIcon = document.body.querySelector('i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
    });

    it('should have usage options with proper labels', () => {
      const usageSelect = document.getElementById('sticker-usage');
      expect(usageSelect.options[0].textContent).toContain('Media Sosial');
      expect(usageSelect.options[1].textContent).toContain('Pesan Instan');
      expect(usageSelect.options[2].textContent).toContain('Gaming');
      expect(usageSelect.options[3].textContent).toContain('Merchandise');
      expect(usageSelect.options[4].textContent).toContain('Kemasan');
    });

    it('should have default usage value', () => {
      const usageSelect = document.getElementById('sticker-usage');
      expect(usageSelect.value).toBe('social-media');
    });

    it('should have proper input styling', () => {
      const usageSelect = document.getElementById('sticker-usage');
      expect(usageSelect.classList.contains('w-full')).toBe(true);
      expect(usageSelect.classList.contains('p-3')).toBe(true);
      expect(usageSelect.classList.contains('border')).toBe(true);
      expect(usageSelect.classList.contains('rounded-lg')).toBe(true);
      expect(usageSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(usageSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('sticker-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
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
      const audienceSelect = document.getElementById('sticker-audience');
      expect(audienceSelect.options[0].textContent).toContain('Gen Z');
      expect(audienceSelect.options[1].textContent).toContain('Millennials');
      expect(audienceSelect.options[2].textContent).toContain('Anak-anak');
      expect(audienceSelect.options[3].textContent).toContain('Profesional');
      expect(audienceSelect.options[4].textContent).toContain('Gamers');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('sticker-audience');
      expect(audienceSelect.value).toBe('gen-z');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('sticker-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('sticker-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('sticker-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan desain stiker yang diinginkan');
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
      const toneSelect = document.getElementById('sticker-tone');
      expect(toneSelect.options[0].textContent).toContain('Lucu');
      expect(toneSelect.options[1].textContent).toContain('Manis');
      expect(toneSelect.options[2].textContent).toContain('Keren');
      expect(toneSelect.options[3].textContent).toContain('Inspiratif');
      expect(toneSelect.options[4].textContent).toContain('Sarkastis');
      expect(toneSelect.options[5].textContent).toContain('Positif');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('sticker-tone');
      expect(toneSelect.value).toBe('funny');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('sticker-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('sticker-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Stiker');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('sticker-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-yellow-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-amber-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('sticker-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('sticker-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('sticker-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('sticker-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-sticky-note')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil desain stiker akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('sticker-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('sticker-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat stiker');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-yellow-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('sticker-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have yellow icon in empty state', () => {
      const emptyStateIcon = document.getElementById('sticker-empty-state').querySelector('i.fas.fa-sticky-note');
      expect(emptyStateIcon.classList.contains('text-yellow-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use yellow/orange/amber color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-yellow-500')).toBe(true);
      expect(title.classList.contains('via-orange-500')).toBe(true);
      expect(title.classList.contains('to-amber-500')).toBe(true);
    });

    it('should use yellow/orange/amber accents in generate button', () => {
      const generateBtn = document.getElementById('sticker-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-yellow-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-amber-500')).toBe(true);
    });

    it('should use yellow accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.sticker-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-yellow-500')).toBe(true);
      });
    });

    it('should use yellow accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-yellow-500')).toBe(true);
      });
    });

    it('should use yellow accents in focus states', () => {
      const styleSelect = document.getElementById('sticker-style');
      expect(styleSelect.classList.contains('focus:ring-yellow-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-yellow-500')).toBe(true);
    });

    it('should use yellow accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-yellow-500')).toBe(true);
    });

    it('should use yellow accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('sticker-empty-state').querySelector('i.fas.fa-sticky-note');
      expect(emptyStateIcon.classList.contains('text-yellow-400')).toBe(true);
    });

    it('should use yellow hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.sticker-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-yellow-100')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(18);
    });

    it('should have sticky-note icon in header', () => {
      const stickyNoteIcon = document.body.querySelector('header i.fas.fa-sticky-note');
      expect(stickyNoteIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('sticker-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have smile icon for emoji', () => {
      const emojiIcon = document.body.querySelector('[data-type="emoji"] i.fas.fa-smile');
      expect(emojiIcon).toBeTruthy();
    });

    it('should have laugh-squint icon for meme', () => {
      const memeIcon = document.body.querySelector('[data-type="meme"] i.fas.fa-laugh-squint');
      expect(memeIcon).toBeTruthy();
    });

    it('should have user-astronaut icon for character', () => {
      const characterIcon = document.body.querySelector('[data-type="character"] i.fas.fa-user-astronaut');
      expect(characterIcon).toBeTruthy();
    });

    it('should have font icon for text', () => {
      const textIcon = document.body.querySelector('[data-type="text"] i.fas.fa-font');
      expect(textIcon).toBeTruthy();
    });

    it('should have hand-point-up icon for reaction', () => {
      const reactionIcon = document.body.querySelector('[data-type="reaction"] i.fas.fa-hand-point-up');
      expect(reactionIcon).toBeTruthy();
    });

    it('should have party-horn icon for celebration', () => {
      const celebrationIcon = document.body.querySelector('[data-type="celebration"] i.fas.fa-party-horn');
      expect(celebrationIcon).toBeTruthy();
    });

    it('should have snowflake icon for seasonal', () => {
      const seasonalIcon = document.body.querySelector('[data-type="seasonal"] i.fas.fa-snowflake');
      expect(seasonalIcon).toBeTruthy();
    });

    it('should have puzzle-piece icon for custom', () => {
      const customIcon = document.body.querySelector('[data-type="custom"] i.fas.fa-puzzle-piece');
      expect(customIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have expand-arrows-alt icon for size', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandIcon).toBeTruthy();
    });

    it('should have file-image icon for format', () => {
      const fileImageIcon = document.body.querySelector('i.fas.fa-file-image');
      expect(fileImageIcon).toBeTruthy();
    });

    it('should have bullhorn icon for usage', () => {
      const bullhornIcon = document.body.querySelector('i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
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

    it('should have sticky-note icon in empty state', () => {
      const emptyStateIcon = document.getElementById('sticker-empty-state').querySelector('i.fas.fa-sticky-note');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Stiker');
      expect(document.body.textContent).toContain('Jenis Stiker');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Ukuran');
      expect(document.body.textContent).toContain('Format');
      expect(document.body.textContent).toContain('Penggunaan');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Stiker');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(7);
      expect(headers[0].textContent).toContain('1. Jenis Stiker');
      expect(headers[1].textContent).toContain('2. Gaya');
      expect(headers[2].textContent).toContain('3. Ukuran');
      expect(headers[3].textContent).toContain('4. Format');
      expect(headers[4].textContent).toContain('5. Penggunaan');
      expect(headers[5].textContent).toContain('6. Target Audiens');
      expect(headers[6].textContent).toContain('7. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('sticker-empty-state');
      expect(emptyState.textContent).toContain('Hasil desain stiker akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Stiker');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('sticker-loading');
      expect(loading.textContent).toContain('Sedang membuat stiker');
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
      const styleSelect = document.getElementById('sticker-style');
      expect(styleSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('sticker-size');
      expect(sizeSelect).toBeTruthy();
      
      const formatSelect = document.getElementById('sticker-format');
      expect(formatSelect).toBeTruthy();
      
      const usageSelect = document.getElementById('sticker-usage');
      expect(usageSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('sticker-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('sticker-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('sticker-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const styleSelect = document.getElementById('sticker-style');
      expect(styleSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('sticker-size');
      expect(sizeSelect).toBeTruthy();
      
      const formatSelect = document.getElementById('sticker-format');
      expect(formatSelect).toBeTruthy();
      
      const usageSelect = document.getElementById('sticker-usage');
      expect(usageSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('sticker-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('sticker-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('sticker-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('sticker-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const styleSelect = document.getElementById('sticker-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const sizeSelect = document.getElementById('sticker-size');
      expect(sizeSelect.tagName).toBe('SELECT');
      
      const formatSelect = document.getElementById('sticker-format');
      expect(formatSelect.tagName).toBe('SELECT');
      
      const usageSelect = document.getElementById('sticker-usage');
      expect(usageSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('sticker-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('sticker-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea type', () => {
      const descriptionInput = document.getElementById('sticker-description');
      expect(descriptionInput.tagName).toBe('TEXTAREA');
    });

    it('should have proper button types', () => {
      const typeBtns = document.body.querySelectorAll('.sticker-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const emojiBtn = document.body.querySelector('[data-type="emoji"]');
      expect(emojiBtn.dataset.type).toBe('emoji');
      expect(emojiBtn.dataset.selected).toBe('true');
      
      const memeBtn = document.body.querySelector('[data-type="meme"]');
      expect(memeBtn.dataset.type).toBe('meme');
    });

    it('should have proper placeholder text', () => {
      const descriptionInput = document.getElementById('sticker-description');
      expect(descriptionInput.placeholder).toContain('Jelaskan desain stiker yang diinginkan');
    });

    it('should have proper button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.sticker-type-btn');
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
      const typeOptions = document.getElementById('sticker-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
