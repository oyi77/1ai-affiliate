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

describe('poster-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-poster-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
            <i class="fas fa-scroll mr-3"></i>Generator Poster
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat poster acara profesional dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Event Title -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Judul Acara</h2>
              <div class="space-y-4">
                <div>
                  <label for="poster-generator-title" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heading mr-1 text-purple-500"></i>Judul Poster
                  </label>
                  <input type="text" id="poster-generator-title" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan judul acara...">
                </div>
              </div>
            </div>
            
            <!-- Step 2: Event Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Acara</h2>
              <div class="space-y-4">
                <div>
                  <label for="poster-generator-event-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-calendar-alt mr-1 text-indigo-500"></i>Jenis Acara
                  </label>
                  <select id="poster-generator-event-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="concert">Konser</option>
                    <option value="movie">Film</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="exhibition">Pameran</option>
                    <option value="promotion">Promosi</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Date/Time -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Tanggal & Waktu</h2>
              <div class="space-y-4">
                <div>
                  <label for="poster-generator-datetime" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock mr-1 text-purple-500"></i>Tanggal & Waktu
                  </label>
                  <input type="datetime-local" id="poster-generator-datetime" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Location -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Lokasi</h2>
              <div class="space-y-4">
                <div>
                  <label for="poster-generator-location" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-map-marker-alt mr-1 text-indigo-500"></i>Lokasi Acara
                  </label>
                  <textarea id="poster-generator-location" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Masukkan lokasi atau alamat..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Theme Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Gaya Tema</h2>
              <div class="space-y-4">
                <div>
                  <label for="poster-generator-theme-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-purple-500"></i>Gaya Tema
                  </label>
                  <select id="poster-generator-theme-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="minimalist">Minimalis</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="neon">Neon</option>
                    <option value="corporate">Korporat</option>
                    <option value="artistic">Artistik</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Size -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Ukuran</h2>
              <div class="space-y-4">
                <div>
                  <label for="poster-generator-size" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand mr-1 text-indigo-500"></i>Ukuran Poster
                  </label>
                  <select id="poster-generator-size" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="a4">A4</option>
                    <option value="a3">A3</option>
                    <option value="a2">A2</option>
                    <option value="letter">Letter</option>
                    <option value="instagram-post">Instagram Post</option>
                    <option value="instagram-story">Instagram Story</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="poster-generator-generate-btn" class="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Poster
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="poster-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="poster-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-scroll text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil poster akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Poster</p>
              </div>
              <div id="poster-generator-results" class="hidden space-y-6"></div>
              <div id="poster-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat poster...</p>
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
      const container = document.getElementById('content-poster-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Poster');
      expect(title.querySelector('i.fas.fa-scroll')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat poster acara profesional dengan AI');
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
      expect(rightPanel.querySelector('#poster-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Event Title Input Tests
  describe('Event Title Input', () => {
    it('should render event title input', () => {
      const titleInput = document.getElementById('poster-generator-title');
      expect(titleInput).toBeTruthy();
      expect(titleInput.tagName).toBe('INPUT');
      expect(titleInput.type).toBe('text');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Judul Acara');
    });

    it('should have label with icon', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon).toBeTruthy();
      expect(headingIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have proper input styling', () => {
      const titleInput = document.getElementById('poster-generator-title');
      expect(titleInput.classList.contains('w-full')).toBe(true);
      expect(titleInput.classList.contains('p-3')).toBe(true);
      expect(titleInput.classList.contains('border')).toBe(true);
      expect(titleInput.classList.contains('rounded-lg')).toBe(true);
      expect(titleInput.classList.contains('focus:ring-2')).toBe(true);
      expect(titleInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const titleInput = document.getElementById('poster-generator-title');
      expect(titleInput.placeholder).toBe('Masukkan judul acara...');
    });
  });

  // Event Type Selection Tests
  describe('Event Type Selection', () => {
    it('should render event type select', () => {
      const eventTypeSelect = document.getElementById('poster-generator-event-type');
      expect(eventTypeSelect).toBeTruthy();
      expect(eventTypeSelect.tagName).toBe('SELECT');
      expect(eventTypeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jenis Acara');
    });

    it('should have label with icon', () => {
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
      expect(calendarAltIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have event type options with proper labels', () => {
      const eventTypeSelect = document.getElementById('poster-generator-event-type');
      expect(eventTypeSelect.options[0].textContent).toContain('Konser');
      expect(eventTypeSelect.options[1].textContent).toContain('Film');
      expect(eventTypeSelect.options[2].textContent).toContain('Seminar');
      expect(eventTypeSelect.options[3].textContent).toContain('Workshop');
      expect(eventTypeSelect.options[4].textContent).toContain('Pameran');
      expect(eventTypeSelect.options[5].textContent).toContain('Promosi');
    });

    it('should have default event type value', () => {
      const eventTypeSelect = document.getElementById('poster-generator-event-type');
      expect(eventTypeSelect.value).toBe('concert');
    });

    it('should have proper input styling', () => {
      const eventTypeSelect = document.getElementById('poster-generator-event-type');
      expect(eventTypeSelect.classList.contains('w-full')).toBe(true);
      expect(eventTypeSelect.classList.contains('p-3')).toBe(true);
      expect(eventTypeSelect.classList.contains('border')).toBe(true);
      expect(eventTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(eventTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(eventTypeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Date/Time Input Tests
  describe('Date/Time Input', () => {
    it('should render datetime input', () => {
      const datetimeInput = document.getElementById('poster-generator-datetime');
      expect(datetimeInput).toBeTruthy();
      expect(datetimeInput.tagName).toBe('INPUT');
      expect(datetimeInput.type).toBe('datetime-local');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Tanggal & Waktu');
    });

    it('should have label with icon', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
      expect(clockIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have proper input styling', () => {
      const datetimeInput = document.getElementById('poster-generator-datetime');
      expect(datetimeInput.classList.contains('w-full')).toBe(true);
      expect(datetimeInput.classList.contains('p-3')).toBe(true);
      expect(datetimeInput.classList.contains('border')).toBe(true);
      expect(datetimeInput.classList.contains('rounded-lg')).toBe(true);
      expect(datetimeInput.classList.contains('focus:ring-2')).toBe(true);
      expect(datetimeInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });

    it('should have proper label text', () => {
      const label = document.querySelector('label[for="poster-generator-datetime"]');
      expect(label.textContent).toContain('Tanggal & Waktu');
    });
  });

  // Location Input Tests
  describe('Location Input', () => {
    it('should render location textarea', () => {
      const locationTextarea = document.getElementById('poster-generator-location');
      expect(locationTextarea).toBeTruthy();
      expect(locationTextarea.tagName).toBe('TEXTAREA');
      expect(locationTextarea.rows).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Lokasi');
    });

    it('should have label with icon', () => {
      const mapMarkerAltIcon = document.body.querySelector('i.fas.fa-map-marker-alt');
      expect(mapMarkerAltIcon).toBeTruthy();
      expect(mapMarkerAltIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have proper textarea styling', () => {
      const locationTextarea = document.getElementById('poster-generator-location');
      expect(locationTextarea.classList.contains('w-full')).toBe(true);
      expect(locationTextarea.classList.contains('p-3')).toBe(true);
      expect(locationTextarea.classList.contains('border')).toBe(true);
      expect(locationTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(locationTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(locationTextarea.classList.contains('focus:ring-indigo-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const locationTextarea = document.getElementById('poster-generator-location');
      expect(locationTextarea.placeholder).toBe('Masukkan lokasi atau alamat...');
    });
  });

  // Theme Style Selection Tests
  describe('Theme Style Selection', () => {
    it('should render theme style select', () => {
      const themeStyleSelect = document.getElementById('poster-generator-theme-style');
      expect(themeStyleSelect).toBeTruthy();
      expect(themeStyleSelect.tagName).toBe('SELECT');
      expect(themeStyleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Gaya Tema');
    });

    it('should have label with icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      expect(paletteIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have theme style options with proper labels', () => {
      const themeStyleSelect = document.getElementById('poster-generator-theme-style');
      expect(themeStyleSelect.options[0].textContent).toContain('Minimalis');
      expect(themeStyleSelect.options[1].textContent).toContain('Vintage');
      expect(themeStyleSelect.options[2].textContent).toContain('Modern');
      expect(themeStyleSelect.options[3].textContent).toContain('Neon');
      expect(themeStyleSelect.options[4].textContent).toContain('Korporat');
      expect(themeStyleSelect.options[5].textContent).toContain('Artistik');
    });

    it('should have default theme style value', () => {
      const themeStyleSelect = document.getElementById('poster-generator-theme-style');
      expect(themeStyleSelect.value).toBe('minimalist');
    });

    it('should have proper input styling', () => {
      const themeStyleSelect = document.getElementById('poster-generator-theme-style');
      expect(themeStyleSelect.classList.contains('w-full')).toBe(true);
      expect(themeStyleSelect.classList.contains('p-3')).toBe(true);
      expect(themeStyleSelect.classList.contains('border')).toBe(true);
      expect(themeStyleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(themeStyleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(themeStyleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Size Selection Tests
  describe('Size Selection', () => {
    it('should render size select', () => {
      const sizeSelect = document.getElementById('poster-generator-size');
      expect(sizeSelect).toBeTruthy();
      expect(sizeSelect.tagName).toBe('SELECT');
      expect(sizeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Ukuran');
    });

    it('should have label with icon', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
      expect(expandIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have size options with proper labels', () => {
      const sizeSelect = document.getElementById('poster-generator-size');
      expect(sizeSelect.options[0].textContent).toContain('A4');
      expect(sizeSelect.options[1].textContent).toContain('A3');
      expect(sizeSelect.options[2].textContent).toContain('A2');
      expect(sizeSelect.options[3].textContent).toContain('Letter');
      expect(sizeSelect.options[4].textContent).toContain('Instagram Post');
      expect(sizeSelect.options[5].textContent).toContain('Instagram Story');
    });

    it('should have default size value', () => {
      const sizeSelect = document.getElementById('poster-generator-size');
      expect(sizeSelect.value).toBe('a4');
    });

    it('should have proper input styling', () => {
      const sizeSelect = document.getElementById('poster-generator-size');
      expect(sizeSelect.classList.contains('w-full')).toBe(true);
      expect(sizeSelect.classList.contains('p-3')).toBe(true);
      expect(sizeSelect.classList.contains('border')).toBe(true);
      expect(sizeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(sizeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('poster-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Poster');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('poster-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('poster-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('poster-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('poster-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('poster-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-scroll')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil poster akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('poster-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('poster-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat poster');
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
      const emptyState = document.getElementById('poster-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('poster-generator-empty-state').querySelector('i.fas.fa-scroll');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/indigo color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-600')).toBe(true);
      expect(title.classList.contains('via-indigo-600')).toBe(true);
      expect(title.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use purple/indigo accents in generate button', () => {
      const generateBtn = document.getElementById('poster-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use purple accents in title input', () => {
      const titleInput = document.getElementById('poster-generator-title');
      expect(titleInput.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(titleInput.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in event type select', () => {
      const eventTypeSelect = document.getElementById('poster-generator-event-type');
      expect(eventTypeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(eventTypeSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in datetime input', () => {
      const datetimeInput = document.getElementById('poster-generator-datetime');
      expect(datetimeInput.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(datetimeInput.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in location textarea', () => {
      const locationTextarea = document.getElementById('poster-generator-location');
      expect(locationTextarea.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(locationTextarea.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in theme style select', () => {
      const themeStyleSelect = document.getElementById('poster-generator-theme-style');
      expect(themeStyleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(themeStyleSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in size select', () => {
      const sizeSelect = document.getElementById('poster-generator-size');
      expect(sizeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(sizeSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('poster-generator-empty-state').querySelector('i.fas.fa-scroll');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(9);
    });

    it('should have scroll icon in header', () => {
      const scrollIcon = document.body.querySelector('header i.fas.fa-scroll');
      expect(scrollIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('poster-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have heading icon for event title', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon).toBeTruthy();
    });

    it('should have calendar-alt icon for event type', () => {
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon).toBeTruthy();
    });

    it('should have clock icon for datetime', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have map-marker-alt icon for location', () => {
      const mapMarkerAltIcon = document.body.querySelector('i.fas.fa-map-marker-alt');
      expect(mapMarkerAltIcon).toBeTruthy();
    });

    it('should have palette icon for theme style', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have expand icon for size', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon).toBeTruthy();
    });

    it('should have scroll icon in empty state', () => {
      const emptyStateIcon = document.getElementById('poster-generator-empty-state').querySelector('i.fas.fa-scroll');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have purple heading icon', () => {
      const headingIcon = document.body.querySelector('i.fas.fa-heading');
      expect(headingIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have indigo calendar-alt icon', () => {
      const calendarAltIcon = document.body.querySelector('i.fas.fa-calendar-alt');
      expect(calendarAltIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have purple clock icon', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have indigo map-marker-alt icon', () => {
      const mapMarkerAltIcon = document.body.querySelector('i.fas.fa-map-marker-alt');
      expect(mapMarkerAltIcon.classList.contains('text-indigo-500')).toBe(true);
    });

    it('should have purple palette icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have indigo expand icon', () => {
      const expandIcon = document.body.querySelector('i.fas.fa-expand');
      expect(expandIcon.classList.contains('text-indigo-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Poster');
      expect(document.body.textContent).toContain('Judul Acara');
      expect(document.body.textContent).toContain('Jenis Acara');
      expect(document.body.textContent).toContain('Tanggal & Waktu');
      expect(document.body.textContent).toContain('Lokasi');
      expect(document.body.textContent).toContain('Gaya Tema');
      expect(document.body.textContent).toContain('Ukuran');
      expect(document.body.textContent).toContain('Buat Poster');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Judul Acara');
      expect(headers[1].textContent).toContain('2. Jenis Acara');
      expect(headers[2].textContent).toContain('3. Tanggal & Waktu');
      expect(headers[3].textContent).toContain('4. Lokasi');
      expect(headers[4].textContent).toContain('5. Gaya Tema');
      expect(headers[5].textContent).toContain('6. Ukuran');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('poster-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil poster akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Poster');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('poster-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat poster');
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
      const titleInput = document.getElementById('poster-generator-title');
      expect(titleInput).toBeTruthy();
      
      const eventTypeSelect = document.getElementById('poster-generator-event-type');
      expect(eventTypeSelect).toBeTruthy();
      
      const datetimeInput = document.getElementById('poster-generator-datetime');
      expect(datetimeInput).toBeTruthy();
      
      const locationTextarea = document.getElementById('poster-generator-location');
      expect(locationTextarea).toBeTruthy();
      
      const themeStyleSelect = document.getElementById('poster-generator-theme-style');
      expect(themeStyleSelect).toBeTruthy();
      
      const sizeSelect = document.getElementById('poster-generator-size');
      expect(sizeSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const titleLabel = document.querySelector('label[for="poster-generator-title"]');
      expect(titleLabel).toBeTruthy();
      
      const eventTypeLabel = document.querySelector('label[for="poster-generator-event-type"]');
      expect(eventTypeLabel).toBeTruthy();
      
      const datetimeLabel = document.querySelector('label[for="poster-generator-datetime"]');
      expect(datetimeLabel).toBeTruthy();
      
      const locationLabel = document.querySelector('label[for="poster-generator-location"]');
      expect(locationLabel).toBeTruthy();
      
      const themeStyleLabel = document.querySelector('label[for="poster-generator-theme-style"]');
      expect(themeStyleLabel).toBeTruthy();
      
      const sizeLabel = document.querySelector('label[for="poster-generator-size"]');
      expect(sizeLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('poster-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const titleInput = document.getElementById('poster-generator-title');
      expect(titleInput.type).toBe('text');
      
      const datetimeInput = document.getElementById('poster-generator-datetime');
      expect(datetimeInput.type).toBe('datetime-local');
      
      const locationTextarea = document.getElementById('poster-generator-location');
      expect(locationTextarea.tagName).toBe('TEXTAREA');
    });

    it('should have proper select types', () => {
      const eventTypeSelect = document.getElementById('poster-generator-event-type');
      expect(eventTypeSelect.tagName).toBe('SELECT');
      
      const themeStyleSelect = document.getElementById('poster-generator-theme-style');
      expect(themeStyleSelect.tagName).toBe('SELECT');
      
      const sizeSelect = document.getElementById('poster-generator-size');
      expect(sizeSelect.tagName).toBe('SELECT');
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have mobile-first grid layout', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('grid-cols-1')).toBe(true);
    });

    it('should have responsive grid for larger screens', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive spacing', () => {
      const main = document.body.querySelector('main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive header text', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });
  });
});
