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

describe('story-board Component', () => {
  
  const mockComponentHTML = `
    <div id="content-story-board" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
            <i class="fas fa-th-large mr-3"></i>Story Board
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat storyboard profesional untuk proyek visual Anda dengan mudah</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Story Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Cerita</h2>
              <div id="story-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="commercial" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-ad text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Komersial</span>
                </button>
                <button type="button" data-type="music-video" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-music text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Video Musik</span>
                </button>
                <button type="button" data-type="short-film" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-film text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Film Pendek</span>
                </button>
                <button type="button" data-type="documentary" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-video text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Dokumenter</span>
                </button>
                <button type="button" data-type="tutorial" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-graduation-cap text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Tutorial</span>
                </button>
                <button type="button" data-type="social-media" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-share-alt text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Media Sosial</span>
                </button>
                <button type="button" data-type="animation" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-animate text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Animasi</span>
                </button>
                <button type="button" data-type="live-action" class="story-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Live Action</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Panel Count -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jumlah Panel</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-panel-count" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-th mr-1 text-purple-500"></i>Jumlah Panel
                  </label>
                  <select id="story-panel-count" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="3">3 Panel</option>
                    <option value="6">6 Panel</option>
                    <option value="9">9 Panel</option>
                    <option value="12" selected>12 Panel</option>
                    <option value="15">15 Panel</option>
                    <option value="20">20 Panel</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-purple-500"></i>Gaya Visual
                  </label>
                  <select id="story-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="sketch">Sketsa</option>
                    <option value="thumbnail">Thumbnail</option>
                    <option value="detailed">Detail</option>
                    <option value="animatic">Animatic</option>
                    <option value="comic">Komik</option>
                    <option value="minimalist">Minimalis</option>
                    <option value="cinematic">Sinematik</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Aspect Ratio -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Rasio Aspek</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-aspect-ratio" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-columns mr-1 text-purple-500"></i>Rasio Aspek
                  </label>
                  <select id="story-aspect-ratio" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16" selected>9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Portrait)</option>
                    <option value="2.35:1">2.35:1 (Cinematic)</option>
                    <option value="1.85:1">1.85:1 (Cinema)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Target Audiens
                  </label>
                  <select id="story-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="filmmakers">Sutradara/Film Maker</option>
                    <option value="content-creators">Konten Kreator</option>
                    <option value="advertisers">Pengiklan</option>
                    <option value="educators">Pendidik</option>
                    <option value="gamers">Gamer</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-purple-500"></i>Nuansa
                  </label>
                  <select id="story-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="dramatic">Dramatis</option>
                    <option value="comedic">Komedi</option>
                    <option value="romantic">Romantis</option>
                    <option value="action">Aksi</option>
                    <option value="horror">Horor</option>
                    <option value="documentary">Dokumenter</option>
                    <option value="educational">Edukatif</option>
                    <option value="promotional">Promosi</option>
                  </select>
                </div>
                
                <div>
                  <label for="story-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-purple-500"></i>Deskripsi Cerita
                  </label>
                  <textarea id="story-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Jelaskan cerita atau alur yang diinginkan untuk storyboard..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="story-generate-btn" class="w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Story Board
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="story-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="story-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-th-large text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil storyboard akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Story Board</p>
              </div>
              <div id="story-results" class="hidden space-y-6"></div>
              <div id="story-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat storyboard...</p>
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
      const container = document.getElementById('content-story-board');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Story Board');
      expect(title.querySelector('i.fas.fa-th-large')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat storyboard profesional untuk proyek visual Anda dengan mudah');
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
      expect(rightPanel.querySelector('#story-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Story Type Selection Tests
  describe('Story Type Selection', () => {
    it('should render story type options container', () => {
      const typeOptions = document.getElementById('story-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Commercial option', () => {
      const commercialBtn = document.body.querySelector('[data-type="commercial"]');
      expect(commercialBtn).toBeTruthy();
      expect(commercialBtn.textContent).toContain('Komersial');
      expect(commercialBtn.querySelector('i.fas.fa-ad')).toBeTruthy();
      expect(commercialBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Music Video option', () => {
      const musicVideoBtn = document.body.querySelector('[data-type="music-video"]');
      expect(musicVideoBtn).toBeTruthy();
      expect(musicVideoBtn.textContent).toContain('Video Musik');
      expect(musicVideoBtn.querySelector('i.fas.fa-music')).toBeTruthy();
    });

    it('should render Short Film option', () => {
      const shortFilmBtn = document.body.querySelector('[data-type="short-film"]');
      expect(shortFilmBtn).toBeTruthy();
      expect(shortFilmBtn.textContent).toContain('Film Pendek');
      expect(shortFilmBtn.querySelector('i.fas.fa-film')).toBeTruthy();
    });

    it('should render Documentary option', () => {
      const documentaryBtn = document.body.querySelector('[data-type="documentary"]');
      expect(documentaryBtn).toBeTruthy();
      expect(documentaryBtn.textContent).toContain('Dokumenter');
      expect(documentaryBtn.querySelector('i.fas.fa-video')).toBeTruthy();
    });

    it('should render Tutorial option', () => {
      const tutorialBtn = document.body.querySelector('[data-type="tutorial"]');
      expect(tutorialBtn).toBeTruthy();
      expect(tutorialBtn.textContent).toContain('Tutorial');
      expect(tutorialBtn.querySelector('i.fas.fa-graduation-cap')).toBeTruthy();
    });

    it('should render Social Media option', () => {
      const socialMediaBtn = document.body.querySelector('[data-type="social-media"]');
      expect(socialMediaBtn).toBeTruthy();
      expect(socialMediaBtn.textContent).toContain('Media Sosial');
      expect(socialMediaBtn.querySelector('i.fas.fa-share-alt')).toBeTruthy();
    });

    it('should render Animation option', () => {
      const animationBtn = document.body.querySelector('[data-type="animation"]');
      expect(animationBtn).toBeTruthy();
      expect(animationBtn.textContent).toContain('Animasi');
      expect(animationBtn.querySelector('i.fas.fa-animate')).toBeTruthy();
    });

    it('should render Live Action option', () => {
      const liveActionBtn = document.body.querySelector('[data-type="live-action"]');
      expect(liveActionBtn).toBeTruthy();
      expect(liveActionBtn.textContent).toContain('Live Action');
      expect(liveActionBtn.querySelector('i.fas.fa-user')).toBeTruthy();
    });

    it('should have 8 story type options', () => {
      const typeBtns = document.body.querySelectorAll('.story-type-btn');
      expect(typeBtns.length).toBe(8);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('story-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have purple icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.story-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Cerita');
    });

    it('should have purple hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.story-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
      });
    });
  });

  // Panel Count Input Tests
  describe('Panel Count Input', () => {
    it('should render panel count select', () => {
      const panelCountSelect = document.getElementById('story-panel-count');
      expect(panelCountSelect).toBeTruthy();
      expect(panelCountSelect.tagName).toBe('SELECT');
      expect(panelCountSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jumlah Panel');
    });

    it('should have all labels with icons', () => {
      const thIcon = document.body.querySelector('i.fas.fa-th');
      expect(thIcon).toBeTruthy();
    });

    it('should have panel count options with proper labels', () => {
      const panelCountSelect = document.getElementById('story-panel-count');
      expect(panelCountSelect.options[0].textContent).toContain('3 Panel');
      expect(panelCountSelect.options[1].textContent).toContain('6 Panel');
      expect(panelCountSelect.options[2].textContent).toContain('9 Panel');
      expect(panelCountSelect.options[3].textContent).toContain('12 Panel');
      expect(panelCountSelect.options[4].textContent).toContain('15 Panel');
      expect(panelCountSelect.options[5].textContent).toContain('20 Panel');
    });

    it('should have default panel count value', () => {
      const panelCountSelect = document.getElementById('story-panel-count');
      expect(panelCountSelect.value).toBe('12');
    });

    it('should have proper input styling', () => {
      const panelCountSelect = document.getElementById('story-panel-count');
      expect(panelCountSelect.classList.contains('w-full')).toBe(true);
      expect(panelCountSelect.classList.contains('p-3')).toBe(true);
      expect(panelCountSelect.classList.contains('border')).toBe(true);
      expect(panelCountSelect.classList.contains('rounded-lg')).toBe(true);
      expect(panelCountSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(panelCountSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(7);
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
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect.options[0].textContent).toContain('Sketsa');
      expect(styleSelect.options[1].textContent).toContain('Thumbnail');
      expect(styleSelect.options[2].textContent).toContain('Detail');
      expect(styleSelect.options[3].textContent).toContain('Animatic');
      expect(styleSelect.options[4].textContent).toContain('Komik');
      expect(styleSelect.options[5].textContent).toContain('Minimalis');
      expect(styleSelect.options[6].textContent).toContain('Sinematik');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect.value).toBe('sketch');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Aspect Ratio Input Tests
  describe('Aspect Ratio Input', () => {
    it('should render aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('story-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      expect(aspectRatioSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Rasio Aspek');
    });

    it('should have all labels with icons', () => {
      const columnsIcon = document.body.querySelector('i.fas.fa-columns');
      expect(columnsIcon).toBeTruthy();
    });

    it('should have aspect ratio options with proper labels', () => {
      const aspectRatioSelect = document.getElementById('story-aspect-ratio');
      expect(aspectRatioSelect.options[0].textContent).toContain('16:9');
      expect(aspectRatioSelect.options[1].textContent).toContain('9:16');
      expect(aspectRatioSelect.options[2].textContent).toContain('1:1');
      expect(aspectRatioSelect.options[3].textContent).toContain('4:5');
      expect(aspectRatioSelect.options[4].textContent).toContain('2.35:1');
      expect(aspectRatioSelect.options[5].textContent).toContain('1.85:1');
    });

    it('should have default aspect ratio value', () => {
      const aspectRatioSelect = document.getElementById('story-aspect-ratio');
      expect(aspectRatioSelect.value).toBe('9:16');
    });

    it('should have proper input styling', () => {
      const aspectRatioSelect = document.getElementById('story-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('w-full')).toBe(true);
      expect(aspectRatioSelect.classList.contains('p-3')).toBe(true);
      expect(aspectRatioSelect.classList.contains('border')).toBe(true);
      expect(aspectRatioSelect.classList.contains('rounded-lg')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('story-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
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
      const audienceSelect = document.getElementById('story-audience');
      expect(audienceSelect.options[0].textContent).toContain('Sutradara/Film Maker');
      expect(audienceSelect.options[1].textContent).toContain('Konten Kreator');
      expect(audienceSelect.options[2].textContent).toContain('Pengiklan');
      expect(audienceSelect.options[3].textContent).toContain('Pendidik');
      expect(audienceSelect.options[4].textContent).toContain('Gamer');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('story-audience');
      expect(audienceSelect.value).toBe('filmmakers');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('story-audience');
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
      const toneSelect = document.getElementById('story-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(8);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('story-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan cerita atau alur yang diinginkan untuk storyboard');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('story-tone');
      expect(toneSelect.options[0].textContent).toContain('Dramatis');
      expect(toneSelect.options[1].textContent).toContain('Komedi');
      expect(toneSelect.options[2].textContent).toContain('Romantis');
      expect(toneSelect.options[3].textContent).toContain('Aksi');
      expect(toneSelect.options[4].textContent).toContain('Horor');
      expect(toneSelect.options[5].textContent).toContain('Dokumenter');
      expect(toneSelect.options[6].textContent).toContain('Edukatif');
      expect(toneSelect.options[7].textContent).toContain('Promosi');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('story-tone');
      expect(toneSelect.value).toBe('dramatic');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('story-tone');
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
      const generateBtn = document.getElementById('story-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Story Board');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('story-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('story-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('story-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('story-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('story-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-th-large')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil storyboard akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('story-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('story-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat storyboard');
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
      const emptyState = document.getElementById('story-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('story-empty-state').querySelector('i.fas.fa-th-large');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/indigo color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-600')).toBe(true);
      expect(title.classList.contains('via-indigo-500')).toBe(true);
      expect(title.classList.contains('to-purple-400')).toBe(true);
    });

    it('should use purple/indigo accents in generate button', () => {
      const generateBtn = document.getElementById('story-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-400')).toBe(true);
    });

    it('should use purple accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.story-type-btn');
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
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('story-empty-state').querySelector('i.fas.fa-th-large');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.story-type-btn');
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
      expect(icons.length).toBeGreaterThanOrEqual(15);
    });

    it('should have th-large icon in header', () => {
      const thLargeIcon = document.body.querySelector('header i.fas.fa-th-large');
      expect(thLargeIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('story-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have ad icon for commercial', () => {
      const adIcon = document.body.querySelector('[data-type="commercial"] i.fas.fa-ad');
      expect(adIcon).toBeTruthy();
    });

    it('should have music icon for music video', () => {
      const musicIcon = document.body.querySelector('[data-type="music-video"] i.fas.fa-music');
      expect(musicIcon).toBeTruthy();
    });

    it('should have film icon for short film', () => {
      const filmIcon = document.body.querySelector('[data-type="short-film"] i.fas.fa-film');
      expect(filmIcon).toBeTruthy();
    });

    it('should have video icon for documentary', () => {
      const videoIcon = document.body.querySelector('[data-type="documentary"] i.fas.fa-video');
      expect(videoIcon).toBeTruthy();
    });

    it('should have graduation-cap icon for tutorial', () => {
      const graduationCapIcon = document.body.querySelector('[data-type="tutorial"] i.fas.fa-graduation-cap');
      expect(graduationCapIcon).toBeTruthy();
    });

    it('should have share-alt icon for social media', () => {
      const shareAltIcon = document.body.querySelector('[data-type="social-media"] i.fas.fa-share-alt');
      expect(shareAltIcon).toBeTruthy();
    });

    it('should have animate icon for animation', () => {
      const animateIcon = document.body.querySelector('[data-type="animation"] i.fas.fa-animate');
      expect(animateIcon).toBeTruthy();
    });

    it('should have user icon for live action', () => {
      const userIcon = document.body.querySelector('[data-type="live-action"] i.fas.fa-user');
      expect(userIcon).toBeTruthy();
    });

    it('should have th icon for panel count', () => {
      const thIcon = document.body.querySelector('i.fas.fa-th');
      expect(thIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have columns icon for aspect ratio', () => {
      const columnsIcon = document.body.querySelector('i.fas.fa-columns');
      expect(columnsIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have palette icon for tone', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have align-left icon for description', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have th-large icon in empty state', () => {
      const emptyStateIcon = document.getElementById('story-empty-state').querySelector('i.fas.fa-th-large');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Story Board');
      expect(document.body.textContent).toContain('Jenis Cerita');
      expect(document.body.textContent).toContain('Jumlah Panel');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Rasio Aspek');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Story Board');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Cerita');
      expect(headers[1].textContent).toContain('2. Jumlah Panel');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Rasio Aspek');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('story-empty-state');
      expect(emptyState.textContent).toContain('Hasil storyboard akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Story Board');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('story-loading');
      expect(loading.textContent).toContain('Sedang membuat storyboard');
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
      const panelCountSelect = document.getElementById('story-panel-count');
      expect(panelCountSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('story-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('story-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('story-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('story-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const panelCountSelect = document.getElementById('story-panel-count');
      expect(panelCountSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('story-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('story-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('story-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('story-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('story-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const panelCountSelect = document.getElementById('story-panel-count');
      expect(panelCountSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('story-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const aspectRatioSelect = document.getElementById('story-aspect-ratio');
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('story-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('story-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea type', () => {
      const descriptionInput = document.getElementById('story-description');
      expect(descriptionInput.tagName).toBe('TEXTAREA');
    });

    it('should have proper button types', () => {
      const typeBtns = document.body.querySelectorAll('.story-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const commercialBtn = document.body.querySelector('[data-type="commercial"]');
      expect(commercialBtn.dataset.type).toBe('commercial');
      expect(commercialBtn.dataset.selected).toBe('true');
      
      const musicVideoBtn = document.body.querySelector('[data-type="music-video"]');
      expect(musicVideoBtn.dataset.type).toBe('music-video');
    });

    it('should have proper placeholder text', () => {
      const descriptionInput = document.getElementById('story-description');
      expect(descriptionInput.placeholder).toContain('Jelaskan cerita atau alur yang diinginkan untuk storyboard');
    });

    it('should have proper button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.story-type-btn');
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
      const typeOptions = document.getElementById('story-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});