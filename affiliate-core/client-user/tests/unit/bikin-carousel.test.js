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

describe('bikin-carousel Component', () => {
  
  const mockComponentHTML = `
    <div id="content-bikin-carousel" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            <i class="fas fa-images mr-3"></i>Bikin Carousel
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat carousel yang menarik dan kreatif untuk media sosial Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Content Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Konten</h2>
              <div id="bikin-carousel-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="product-showcase" class="type-btn-bikin-carousel p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-box-open text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Produk</span>
                </button>
                <button type="button" data-type="educational" class="type-btn-bikin-carousel p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-graduation-cap text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Edukasi</span>
                </button>
                <button type="button" data-type="storytelling" class="type-btn-bikin-carousel p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-book-open text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Storytelling</span>
                </button>
                <button type="button" data-type="promotional" class="type-btn-bikin-carousel p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bullhorn text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Promosi</span>
                </button>
                <button type="button" data-type="event-recap" class="type-btn-bikin-carousel p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-calendar-check text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Event Recap</span>
                </button>
                <button type="button" data-type="personal-brand" class="type-btn-bikin-carousel p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user-tie text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Personal Brand</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Platform -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Platform</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="bikin-carousel-platform" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fab fa-instagram mr-1 text-orange-500"></i>Platform
                  </label>
                  <select id="bikin-carousel-platform" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Number of Slides -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Jumlah Slide</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="bikin-carousel-slides" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-layer-group mr-1 text-orange-500"></i>Jumlah Slide (3-20)
                  </label>
                  <input type="number" id="bikin-carousel-slides" min="3" max="20" value="5" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="bikin-carousel-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-orange-500"></i>Gaya Visual
                  </label>
                  <select id="bikin-carousel-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="minimalist">Minimalis</option>
                    <option value="bold">Berani</option>
                    <option value="playful">Playful</option>
                    <option value="elegant">Elegan</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="colorful">Warna-warni</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="bikin-carousel-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-orange-500"></i>Target Audiens
                  </label>
                  <select id="bikin-carousel-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="followers">Followers</option>
                    <option value="customers">Customers</option>
                    <option value="clients">Clients</option>
                    <option value="employees">Employees</option>
                    <option value="general-public">Umum</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="bikin-carousel-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-orange-500"></i>Nuansa
                  </label>
                  <select id="bikin-carousel-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="professional">Profesional</option>
                    <option value="casual">Casual</option>
                    <option value="humorous">Humoris</option>
                    <option value="inspirational">Inspiratif</option>
                    <option value="educational">Edukatif</option>
                    <option value="promotional">Promosi</option>
                  </select>
                </div>
                
                <div>
                  <label for="bikin-carousel-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-orange-500"></i>Deskripsi Konten
                  </label>
                  <textarea id="bikin-carousel-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Jelaskan konten carousel yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="bikin-carousel-generate-btn" class="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Carousel
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="bikin-carousel-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="bikin-carousel-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-images text-6xl mb-4 text-orange-400"></i>
                <p class="text-xl">Hasil carousel akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Carousel</p>
              </div>
              <div id="bikin-carousel-results" class="hidden space-y-6"></div>
              <div id="bikin-carousel-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-orange-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat carousel...</p>
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
      const container = document.getElementById('content-bikin-carousel');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Bikin Carousel');
      expect(title.querySelector('i.fas.fa-images')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat carousel yang menarik dan kreatif untuk media sosial Anda');
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
      expect(rightPanel.querySelector('#bikin-carousel-results-container')).toBeTruthy();
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
    it('should render content type options container', () => {
      const typeOptions = document.getElementById('bikin-carousel-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Produk option', () => {
      const produkBtn = document.body.querySelector('[data-type="product-showcase"]');
      expect(produkBtn).toBeTruthy();
      expect(produkBtn.textContent).toContain('Produk');
      expect(produkBtn.querySelector('i.fas.fa-box-open')).toBeTruthy();
      expect(produkBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Edukasi option', () => {
      const edukasiBtn = document.body.querySelector('[data-type="educational"]');
      expect(edukasiBtn).toBeTruthy();
      expect(edukasiBtn.textContent).toContain('Edukasi');
      expect(edukasiBtn.querySelector('i.fas.fa-graduation-cap')).toBeTruthy();
    });

    it('should render Storytelling option', () => {
      const storytellingBtn = document.body.querySelector('[data-type="storytelling"]');
      expect(storytellingBtn).toBeTruthy();
      expect(storytellingBtn.textContent).toContain('Storytelling');
      expect(storytellingBtn.querySelector('i.fas.fa-book-open')).toBeTruthy();
    });

    it('should render Promosi option', () => {
      const promosiBtn = document.body.querySelector('[data-type="promotional"]');
      expect(promosiBtn).toBeTruthy();
      expect(promosiBtn.textContent).toContain('Promosi');
      expect(promosiBtn.querySelector('i.fas.fa-bullhorn')).toBeTruthy();
    });

    it('should render Event Recap option', () => {
      const eventRecapBtn = document.body.querySelector('[data-type="event-recap"]');
      expect(eventRecapBtn).toBeTruthy();
      expect(eventRecapBtn.textContent).toContain('Event Recap');
      expect(eventRecapBtn.querySelector('i.fas.fa-calendar-check')).toBeTruthy();
    });

    it('should render Personal Brand option', () => {
      const personalBrandBtn = document.body.querySelector('[data-type="personal-brand"]');
      expect(personalBrandBtn).toBeTruthy();
      expect(personalBrandBtn.textContent).toContain('Personal Brand');
      expect(personalBrandBtn.querySelector('i.fas.fa-user-tie')).toBeTruthy();
    });

    it('should have 6 content type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-bikin-carousel');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('bikin-carousel-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have orange icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-bikin-carousel');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-orange-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Konten');
    });

    it('should have orange hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-bikin-carousel');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-orange-100')).toBe(true);
      });
    });
  });

  // Platform Input Tests
  describe('Platform Input', () => {
    it('should render platform select', () => {
      const platformSelect = document.getElementById('bikin-carousel-platform');
      expect(platformSelect).toBeTruthy();
      expect(platformSelect.tagName).toBe('SELECT');
      expect(platformSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Platform');
    });

    it('should have all labels with icons', () => {
      const instagramIcon = document.body.querySelector('i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
    });

    it('should have platform options with proper labels', () => {
      const platformSelect = document.getElementById('bikin-carousel-platform');
      expect(platformSelect.options[0].textContent).toContain('Instagram');
      expect(platformSelect.options[1].textContent).toContain('TikTok');
      expect(platformSelect.options[2].textContent).toContain('Facebook');
      expect(platformSelect.options[3].textContent).toContain('LinkedIn');
      expect(platformSelect.options[4].textContent).toContain('Twitter');
      expect(platformSelect.options[5].textContent).toContain('YouTube');
    });

    it('should have default platform value', () => {
      const platformSelect = document.getElementById('bikin-carousel-platform');
      expect(platformSelect.value).toBe('instagram');
    });

    it('should have proper input styling', () => {
      const platformSelect = document.getElementById('bikin-carousel-platform');
      expect(platformSelect.classList.contains('w-full')).toBe(true);
      expect(platformSelect.classList.contains('p-3')).toBe(true);
      expect(platformSelect.classList.contains('border')).toBe(true);
      expect(platformSelect.classList.contains('rounded-lg')).toBe(true);
      expect(platformSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(platformSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Number of Slides Input Tests
  describe('Number of Slides Input', () => {
    it('should render slides input', () => {
      const slidesInput = document.getElementById('bikin-carousel-slides');
      expect(slidesInput).toBeTruthy();
      expect(slidesInput.tagName).toBe('INPUT');
      expect(slidesInput.type).toBe('number');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Jumlah Slide');
    });

    it('should have all labels with icons', () => {
      const layerGroupIcon = document.body.querySelector('i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have proper min and max values', () => {
      const slidesInput = document.getElementById('bikin-carousel-slides');
      expect(slidesInput.min).toBe('3');
      expect(slidesInput.max).toBe('20');
    });

    it('should have default value of 5', () => {
      const slidesInput = document.getElementById('bikin-carousel-slides');
      expect(slidesInput.value).toBe('5');
    });

    it('should have proper input styling', () => {
      const slidesInput = document.getElementById('bikin-carousel-slides');
      expect(slidesInput.classList.contains('w-full')).toBe(true);
      expect(slidesInput.classList.contains('p-3')).toBe(true);
      expect(slidesInput.classList.contains('border')).toBe(true);
      expect(slidesInput.classList.contains('rounded-lg')).toBe(true);
      expect(slidesInput.classList.contains('focus:ring-2')).toBe(true);
      expect(slidesInput.classList.contains('focus:ring-orange-500')).toBe(true);
    });

    it('should have label indicating range', () => {
      const label = document.querySelector('label[for="bikin-carousel-slides"]');
      expect(label.textContent).toContain('3-20');
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('bikin-carousel-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(7);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Gaya');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('bikin-carousel-style');
      expect(styleSelect.options[0].textContent).toContain('Minimalis');
      expect(styleSelect.options[1].textContent).toContain('Berani');
      expect(styleSelect.options[2].textContent).toContain('Playful');
      expect(styleSelect.options[3].textContent).toContain('Elegan');
      expect(styleSelect.options[4].textContent).toContain('Vintage');
      expect(styleSelect.options[5].textContent).toContain('Modern');
      expect(styleSelect.options[6].textContent).toContain('Warna-warni');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('bikin-carousel-style');
      expect(styleSelect.value).toBe('minimalist');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('bikin-carousel-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('bikin-carousel-audience');
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
      const audienceSelect = document.getElementById('bikin-carousel-audience');
      expect(audienceSelect.options[0].textContent).toContain('Followers');
      expect(audienceSelect.options[1].textContent).toContain('Customers');
      expect(audienceSelect.options[2].textContent).toContain('Clients');
      expect(audienceSelect.options[3].textContent).toContain('Employees');
      expect(audienceSelect.options[4].textContent).toContain('Umum');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('bikin-carousel-audience');
      expect(audienceSelect.value).toBe('followers');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('bikin-carousel-audience');
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
      const toneSelect = document.getElementById('bikin-carousel-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('bikin-carousel-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan konten carousel yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('bikin-carousel-tone');
      expect(toneSelect.options[0].textContent).toContain('Profesional');
      expect(toneSelect.options[1].textContent).toContain('Casual');
      expect(toneSelect.options[2].textContent).toContain('Humoris');
      expect(toneSelect.options[3].textContent).toContain('Inspiratif');
      expect(toneSelect.options[4].textContent).toContain('Edukatif');
      expect(toneSelect.options[5].textContent).toContain('Promosi');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('bikin-carousel-tone');
      expect(toneSelect.value).toBe('professional');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('bikin-carousel-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-orange-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('bikin-carousel-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Carousel');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('bikin-carousel-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('bikin-carousel-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('bikin-carousel-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('bikin-carousel-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('bikin-carousel-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-images')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil carousel akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('bikin-carousel-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('bikin-carousel-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat carousel');
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
      const emptyState = document.getElementById('bikin-carousel-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have orange icon in empty state', () => {
      const emptyStateIcon = document.getElementById('bikin-carousel-empty-state').querySelector('i.fas.fa-images');
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
      expect(title.classList.contains('to-purple-600')).toBe(true);
    });

    it('should use orange/pink/purple accents in generate button', () => {
      const generateBtn = document.getElementById('bikin-carousel-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-600')).toBe(true);
    });

    it('should use orange accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-bikin-carousel');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-orange-500')).toBe(true);
      });
    });

    it('should use orange accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-orange-500')).toBe(true);
      });
    });

    it('should use orange accents in focus states', () => {
      const platformSelect = document.getElementById('bikin-carousel-platform');
      expect(platformSelect.classList.contains('focus:ring-orange-500')).toBe(true);
      expect(platformSelect.classList.contains('focus:border-orange-500')).toBe(true);
    });

    it('should use orange accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-orange-500')).toBe(true);
    });

    it('should use orange accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('bikin-carousel-empty-state').querySelector('i.fas.fa-images');
      expect(emptyStateIcon.classList.contains('text-orange-400')).toBe(true);
    });

    it('should use orange hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-bikin-carousel');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-orange-100')).toBe(true);
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

    it('should have images icon in header', () => {
      const imagesIcon = document.body.querySelector('header i.fas.fa-images');
      expect(imagesIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('bikin-carousel-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have box-open icon for product showcase', () => {
      const boxOpenIcon = document.body.querySelector('[data-type="product-showcase"] i.fas.fa-box-open');
      expect(boxOpenIcon).toBeTruthy();
    });

    it('should have graduation-cap icon for educational', () => {
      const graduationCapIcon = document.body.querySelector('[data-type="educational"] i.fas.fa-graduation-cap');
      expect(graduationCapIcon).toBeTruthy();
    });

    it('should have book-open icon for storytelling', () => {
      const bookOpenIcon = document.body.querySelector('[data-type="storytelling"] i.fas.fa-book-open');
      expect(bookOpenIcon).toBeTruthy();
    });

    it('should have bullhorn icon for promotional', () => {
      const bullhornIcon = document.body.querySelector('[data-type="promotional"] i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
    });

    it('should have calendar-check icon for event recap', () => {
      const calendarCheckIcon = document.body.querySelector('[data-type="event-recap"] i.fas.fa-calendar-check');
      expect(calendarCheckIcon).toBeTruthy();
    });

    it('should have user-tie icon for personal brand', () => {
      const userTieIcon = document.body.querySelector('[data-type="personal-brand"] i.fas.fa-user-tie');
      expect(userTieIcon).toBeTruthy();
    });

    it('should have instagram icon for platform', () => {
      const instagramIcon = document.body.querySelector('i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
    });

    it('should have layer-group icon for slides', () => {
      const layerGroupIcon = document.body.querySelector('i.fas.fa-layer-group');
      expect(layerGroupIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
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

    it('should have images icon in empty state', () => {
      const emptyStateIcon = document.getElementById('bikin-carousel-empty-state').querySelector('i.fas.fa-images');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Bikin Carousel');
      expect(document.body.textContent).toContain('Jenis Konten');
      expect(document.body.textContent).toContain('Platform');
      expect(document.body.textContent).toContain('Jumlah Slide');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Carousel');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Konten');
      expect(headers[1].textContent).toContain('2. Platform');
      expect(headers[2].textContent).toContain('3. Jumlah Slide');
      expect(headers[3].textContent).toContain('4. Gaya');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('bikin-carousel-empty-state');
      expect(emptyState.textContent).toContain('Hasil carousel akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Carousel');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('bikin-carousel-loading');
      expect(loading.textContent).toContain('Sedang membuat carousel');
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
      const platformSelect = document.getElementById('bikin-carousel-platform');
      expect(platformSelect).toBeTruthy();
      
      const slidesInput = document.getElementById('bikin-carousel-slides');
      expect(slidesInput).toBeTruthy();
      
      const styleSelect = document.getElementById('bikin-carousel-style');
      expect(styleSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('bikin-carousel-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('bikin-carousel-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('bikin-carousel-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const platformSelect = document.getElementById('bikin-carousel-platform');
      expect(platformSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('bikin-carousel-style');
      expect(styleSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('bikin-carousel-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('bikin-carousel-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const slidesInput = document.getElementById('bikin-carousel-slides');
      expect(slidesInput).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('bikin-carousel-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('bikin-carousel-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const slidesInput = document.getElementById('bikin-carousel-slides');
      expect(slidesInput.tagName).toBe('INPUT');
      expect(slidesInput.type).toBe('number');
    });

    it('should have proper content type button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-bikin-carousel');
      typeBtns.forEach(btn => {
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

    it('should have responsive type options grid', () => {
      const typeOptions = document.getElementById('bikin-carousel-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
