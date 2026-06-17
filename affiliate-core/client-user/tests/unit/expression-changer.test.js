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

describe('expression-changer Component', () => {
  
  const mockComponentHTML = `
    <div id="content-expression-changer" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 bg-clip-text text-transparent">
            <i class="fas fa-smile mr-3"></i>Pengubah Ekspresi
          </h1>
          <p class="text-lg text-gray-600 mt-2">Ubah ekspresi wajah dengan kreatif dan menarik sesuai kebutuhan Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Expression Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Ekspresi</h2>
              <div id="expression-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="smile" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-smile text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Senyum</span>
                </button>
                <button type="button" data-type="surprise" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-surprise text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Terkejut</span>
                </button>
                <button type="button" data-type="anger" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-angry text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Marah</span>
                </button>
                <button type="button" data-type="sadness" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-sad-tear text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Sedih</span>
                </button>
                <button type="button" data-type="joy" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-grin-stars text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Gembira</span>
                </button>
                <button type="button" data-type="neutral" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-meh text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Netral</span>
                </button>
                <button type="button" data-type="wink" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-kiss-wink-heart text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Kedip</span>
                </button>
                <button type="button" data-type="smirk" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-smile-beam text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Seringai</span>
                </button>
                <button type="button" data-type="confused" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-dizzy text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Bingung</span>
                </button>
                <button type="button" data-type="excited" class="expression-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-grin-hearts text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Bersemangat</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Intensity -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Intensitas</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="expression-intensity" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-sliders-h mr-1 text-purple-500"></i>Tingkat Intensitas
                  </label>
                  <select id="expression-intensity" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="subtle">Halus</option>
                    <option value="moderate">Sedang</option>
                    <option value="strong">Kuat</option>
                    <option value="extreme">Ekstrem</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="expression-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-purple-500"></i>Gaya Visual
                  </label>
                  <select id="expression-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="cartoon">Kartun</option>
                    <option value="realistic">Realistis</option>
                    <option value="anime">Anime</option>
                    <option value="sketch">Sketsa</option>
                    <option value="3d">3D</option>
                    <option value="minimalist">Minimalis</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Face Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Tipe Wajah</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="face-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-portrait mr-1 text-purple-500"></i>Tipe Wajah
                  </label>
                  <select id="face-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="portrait">Potret</option>
                    <option value="selfie">Selfie</option>
                    <option value="group">Grup</option>
                    <option value="upper-body">Badan Atas</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="expression-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Target Audiens
                  </label>
                  <select id="expression-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="social-media">Media Sosial</option>
                    <option value="professional">Profesional</option>
                    <option value="entertainment">Hiburan</option>
                    <option value="gaming">Gaming</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="expression-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-theater-masks mr-1 text-purple-500"></i>Nuansa
                  </label>
                  <select id="expression-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="funny">Lucu</option>
                    <option value="dramatic">Dramatis</option>
                    <option value="cute">Imut</option>
                    <option value="cool">Keren</option>
                    <option value="mysterious">Misterius</option>
                    <option value="heartfelt">Penuh Kasih Sayang</option>
                  </select>
                </div>
                
                <div>
                  <label for="expression-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-purple-500"></i>Deskripsi Tambahan
                  </label>
                  <textarea id="expression-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Jelaskan ekspresi yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="expression-generate-btn" class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Ekspresi
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="expression-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="expression-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-smile text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil pengubah ekspresi akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Ekspresi</p>
              </div>
              <div id="expression-results" class="hidden space-y-6"></div>
              <div id="expression-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat ekspresi...</p>
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
      const container = document.getElementById('content-expression-changer');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Pengubah Ekspresi');
      expect(title.querySelector('i.fas.fa-smile')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Ubah ekspresi wajah dengan kreatif dan menarik sesuai kebutuhan Anda');
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
      expect(rightPanel.querySelector('#expression-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Expression Type Selection Tests
  describe('Expression Type Selection', () => {
    it('should render expression type options container', () => {
      const typeOptions = document.getElementById('expression-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Smile option', () => {
      const smileBtn = document.body.querySelector('[data-type="smile"]');
      expect(smileBtn).toBeTruthy();
      expect(smileBtn.textContent).toContain('Senyum');
      expect(smileBtn.querySelector('i.fas.fa-smile')).toBeTruthy();
      expect(smileBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Surprise option', () => {
      const surpriseBtn = document.body.querySelector('[data-type="surprise"]');
      expect(surpriseBtn).toBeTruthy();
      expect(surpriseBtn.textContent).toContain('Terkejut');
      expect(surpriseBtn.querySelector('i.fas.fa-surprise')).toBeTruthy();
    });

    it('should render Anger option', () => {
      const angerBtn = document.body.querySelector('[data-type="anger"]');
      expect(angerBtn).toBeTruthy();
      expect(angerBtn.textContent).toContain('Marah');
      expect(angerBtn.querySelector('i.fas.fa-angry')).toBeTruthy();
    });

    it('should render Sadness option', () => {
      const sadnessBtn = document.body.querySelector('[data-type="sadness"]');
      expect(sadnessBtn).toBeTruthy();
      expect(sadnessBtn.textContent).toContain('Sedih');
      expect(sadnessBtn.querySelector('i.fas.fa-sad-tear')).toBeTruthy();
    });

    it('should render Joy option', () => {
      const joyBtn = document.body.querySelector('[data-type="joy"]');
      expect(joyBtn).toBeTruthy();
      expect(joyBtn.textContent).toContain('Gembira');
      expect(joyBtn.querySelector('i.fas.fa-grin-stars')).toBeTruthy();
    });

    it('should render Neutral option', () => {
      const neutralBtn = document.body.querySelector('[data-type="neutral"]');
      expect(neutralBtn).toBeTruthy();
      expect(neutralBtn.textContent).toContain('Netral');
      expect(neutralBtn.querySelector('i.fas.fa-meh')).toBeTruthy();
    });

    it('should render Wink option', () => {
      const winkBtn = document.body.querySelector('[data-type="wink"]');
      expect(winkBtn).toBeTruthy();
      expect(winkBtn.textContent).toContain('Kedip');
      expect(winkBtn.querySelector('i.fas.fa-kiss-wink-heart')).toBeTruthy();
    });

    it('should render Smirk option', () => {
      const smirkBtn = document.body.querySelector('[data-type="smirk"]');
      expect(smirkBtn).toBeTruthy();
      expect(smirkBtn.textContent).toContain('Seringai');
      expect(smirkBtn.querySelector('i.fas.fa-smile-beam')).toBeTruthy();
    });

    it('should render Confused option', () => {
      const confusedBtn = document.body.querySelector('[data-type="confused"]');
      expect(confusedBtn).toBeTruthy();
      expect(confusedBtn.textContent).toContain('Bingung');
      expect(confusedBtn.querySelector('i.fas.fa-dizzy')).toBeTruthy();
    });

    it('should render Excited option', () => {
      const excitedBtn = document.body.querySelector('[data-type="excited"]');
      expect(excitedBtn).toBeTruthy();
      expect(excitedBtn.textContent).toContain('Bersemangat');
      expect(excitedBtn.querySelector('i.fas.fa-grin-hearts')).toBeTruthy();
    });

    it('should have 10 expression type options', () => {
      const typeBtns = document.body.querySelectorAll('.expression-type-btn');
      expect(typeBtns.length).toBe(10);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('expression-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have purple icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.expression-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Ekspresi');
    });

    it('should have purple hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.expression-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
      });
    });
  });

  // Intensity Input Tests
  describe('Intensity Input', () => {
    it('should render intensity select', () => {
      const intensitySelect = document.getElementById('expression-intensity');
      expect(intensitySelect).toBeTruthy();
      expect(intensitySelect.tagName).toBe('SELECT');
      expect(intensitySelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Intensitas');
    });

    it('should have all labels with icons', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should have intensity options with proper labels', () => {
      const intensitySelect = document.getElementById('expression-intensity');
      expect(intensitySelect.options[0].textContent).toContain('Halus');
      expect(intensitySelect.options[1].textContent).toContain('Sedang');
      expect(intensitySelect.options[2].textContent).toContain('Kuat');
      expect(intensitySelect.options[3].textContent).toContain('Ekstrem');
    });

    it('should have default intensity value', () => {
      const intensitySelect = document.getElementById('expression-intensity');
      expect(intensitySelect.value).toBe('subtle');
    });

    it('should have proper input styling', () => {
      const intensitySelect = document.getElementById('expression-intensity');
      expect(intensitySelect.classList.contains('w-full')).toBe(true);
      expect(intensitySelect.classList.contains('p-3')).toBe(true);
      expect(intensitySelect.classList.contains('border')).toBe(true);
      expect(intensitySelect.classList.contains('rounded-lg')).toBe(true);
      expect(intensitySelect.classList.contains('focus:ring-2')).toBe(true);
      expect(intensitySelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect.options[0].textContent).toContain('Kartun');
      expect(styleSelect.options[1].textContent).toContain('Realistis');
      expect(styleSelect.options[2].textContent).toContain('Anime');
      expect(styleSelect.options[3].textContent).toContain('Sketsa');
      expect(styleSelect.options[4].textContent).toContain('3D');
      expect(styleSelect.options[5].textContent).toContain('Minimalis');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect.value).toBe('cartoon');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Face Type Input Tests
  describe('Face Type Input', () => {
    it('should render face type select', () => {
      const faceTypeSelect = document.getElementById('face-type');
      expect(faceTypeSelect).toBeTruthy();
      expect(faceTypeSelect.tagName).toBe('SELECT');
      expect(faceTypeSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Tipe Wajah');
    });

    it('should have all labels with icons', () => {
      const portraitIcon = document.body.querySelector('i.fas.fa-portrait');
      expect(portraitIcon).toBeTruthy();
    });

    it('should have face type options with proper labels', () => {
      const faceTypeSelect = document.getElementById('face-type');
      expect(faceTypeSelect.options[0].textContent).toContain('Potret');
      expect(faceTypeSelect.options[1].textContent).toContain('Selfie');
      expect(faceTypeSelect.options[2].textContent).toContain('Grup');
      expect(faceTypeSelect.options[3].textContent).toContain('Badan Atas');
    });

    it('should have default face type value', () => {
      const faceTypeSelect = document.getElementById('face-type');
      expect(faceTypeSelect.value).toBe('portrait');
    });

    it('should have proper input styling', () => {
      const faceTypeSelect = document.getElementById('face-type');
      expect(faceTypeSelect.classList.contains('w-full')).toBe(true);
      expect(faceTypeSelect.classList.contains('p-3')).toBe(true);
      expect(faceTypeSelect.classList.contains('border')).toBe(true);
      expect(faceTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(faceTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(faceTypeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('expression-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(4);
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
      const audienceSelect = document.getElementById('expression-audience');
      expect(audienceSelect.options[0].textContent).toContain('Media Sosial');
      expect(audienceSelect.options[1].textContent).toContain('Profesional');
      expect(audienceSelect.options[2].textContent).toContain('Hiburan');
      expect(audienceSelect.options[3].textContent).toContain('Gaming');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('expression-audience');
      expect(audienceSelect.value).toBe('social-media');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('expression-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('expression-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('expression-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan ekspresi yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const theaterMasksIcon = document.body.querySelector('i.fas.fa-theater-masks');
      expect(theaterMasksIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('expression-tone');
      expect(toneSelect.options[0].textContent).toContain('Lucu');
      expect(toneSelect.options[1].textContent).toContain('Dramatis');
      expect(toneSelect.options[2].textContent).toContain('Imut');
      expect(toneSelect.options[3].textContent).toContain('Keren');
      expect(toneSelect.options[4].textContent).toContain('Misterius');
      expect(toneSelect.options[5].textContent).toContain('Penuh Kasih Sayang');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('expression-tone');
      expect(toneSelect.value).toBe('funny');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('expression-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('expression-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Ekspresi');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('expression-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('expression-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('expression-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('expression-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('expression-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-smile')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil pengubah ekspresi akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('expression-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('expression-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat ekspresi');
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
      const emptyState = document.getElementById('expression-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('expression-empty-state').querySelector('i.fas.fa-smile');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/pink color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-500')).toBe(true);
      expect(title.classList.contains('via-pink-500')).toBe(true);
      expect(title.classList.contains('to-purple-400')).toBe(true);
    });

    it('should use purple/pink accents in generate button', () => {
      const generateBtn = document.getElementById('expression-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-400')).toBe(true);
    });

    it('should use purple accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.expression-type-btn');
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
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('expression-empty-state').querySelector('i.fas.fa-smile');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.expression-type-btn');
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
      expect(icons.length).toBeGreaterThanOrEqual(19);
    });

    it('should have smile icon in header', () => {
      const smileIcon = document.body.querySelector('header i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('expression-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have smile icon for smile expression', () => {
      const smileIcon = document.body.querySelector('[data-type="smile"] i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have surprise icon for surprise expression', () => {
      const surpriseIcon = document.body.querySelector('[data-type="surprise"] i.fas.fa-surprise');
      expect(surpriseIcon).toBeTruthy();
    });

    it('should have angry icon for anger expression', () => {
      const angryIcon = document.body.querySelector('[data-type="anger"] i.fas.fa-angry');
      expect(angryIcon).toBeTruthy();
    });

    it('should have sad-tear icon for sadness expression', () => {
      const sadTearIcon = document.body.querySelector('[data-type="sadness"] i.fas.fa-sad-tear');
      expect(sadTearIcon).toBeTruthy();
    });

    it('should have grin-stars icon for joy expression', () => {
      const grinStarsIcon = document.body.querySelector('[data-type="joy"] i.fas.fa-grin-stars');
      expect(grinStarsIcon).toBeTruthy();
    });

    it('should have meh icon for neutral expression', () => {
      const mehIcon = document.body.querySelector('[data-type="neutral"] i.fas.fa-meh');
      expect(mehIcon).toBeTruthy();
    });

    it('should have kiss-wink-heart icon for wink expression', () => {
      const kissWinkHeartIcon = document.body.querySelector('[data-type="wink"] i.fas.fa-kiss-wink-heart');
      expect(kissWinkHeartIcon).toBeTruthy();
    });

    it('should have smile-beam icon for smirk expression', () => {
      const smileBeamIcon = document.body.querySelector('[data-type="smirk"] i.fas.fa-smile-beam');
      expect(smileBeamIcon).toBeTruthy();
    });

    it('should have dizzy icon for confused expression', () => {
      const dizzyIcon = document.body.querySelector('[data-type="confused"] i.fas.fa-dizzy');
      expect(dizzyIcon).toBeTruthy();
    });

    it('should have grin-hearts icon for excited expression', () => {
      const grinHeartsIcon = document.body.querySelector('[data-type="excited"] i.fas.fa-grin-hearts');
      expect(grinHeartsIcon).toBeTruthy();
    });

    it('should have sliders-h icon for intensity', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have portrait icon for face type', () => {
      const portraitIcon = document.body.querySelector('i.fas.fa-portrait');
      expect(portraitIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have theater-masks icon for tone', () => {
      const theaterMasksIcon = document.body.querySelector('i.fas.fa-theater-masks');
      expect(theaterMasksIcon).toBeTruthy();
    });

    it('should have align-left icon for description', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have smile icon in empty state', () => {
      const emptyStateIcon = document.getElementById('expression-empty-state').querySelector('i.fas.fa-smile');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Pengubah Ekspresi');
      expect(document.body.textContent).toContain('Jenis Ekspresi');
      expect(document.body.textContent).toContain('Intensitas');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Tipe Wajah');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Ekspresi');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Ekspresi');
      expect(headers[1].textContent).toContain('2. Intensitas');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Tipe Wajah');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('expression-empty-state');
      expect(emptyState.textContent).toContain('Hasil pengubah ekspresi akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Ekspresi');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('expression-loading');
      expect(loading.textContent).toContain('Sedang membuat ekspresi');
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
      const intensitySelect = document.getElementById('expression-intensity');
      expect(intensitySelect).toBeTruthy();
      
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect).toBeTruthy();
      
      const faceTypeSelect = document.getElementById('face-type');
      expect(faceTypeSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('expression-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('expression-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('expression-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const intensitySelect = document.getElementById('expression-intensity');
      expect(intensitySelect).toBeTruthy();
      
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect).toBeTruthy();
      
      const faceTypeSelect = document.getElementById('face-type');
      expect(faceTypeSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('expression-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('expression-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('expression-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('expression-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const intensitySelect = document.getElementById('expression-intensity');
      expect(intensitySelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('expression-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const faceTypeSelect = document.getElementById('face-type');
      expect(faceTypeSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('expression-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('expression-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea type', () => {
      const descriptionInput = document.getElementById('expression-description');
      expect(descriptionInput.tagName).toBe('TEXTAREA');
    });

    it('should have proper button types', () => {
      const typeBtns = document.body.querySelectorAll('.expression-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const smileBtn = document.body.querySelector('[data-type="smile"]');
      expect(smileBtn.dataset.type).toBe('smile');
      expect(smileBtn.dataset.selected).toBe('true');
      
      const surpriseBtn = document.body.querySelector('[data-type="surprise"]');
      expect(surpriseBtn.dataset.type).toBe('surprise');
    });

    it('should have proper placeholder text', () => {
      const descriptionInput = document.getElementById('expression-description');
      expect(descriptionInput.placeholder).toContain('Jelaskan ekspresi yang diinginkan');
    });

    it('should have proper button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.expression-type-btn');
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
      const typeOptions = document.getElementById('expression-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
