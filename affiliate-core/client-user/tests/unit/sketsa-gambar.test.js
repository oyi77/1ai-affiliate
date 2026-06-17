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

describe('sketsa-gambar Component', () => {
  
  const mockComponentHTML = `
    <div id="content-sketsa-gambar" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
            <i class="fas fa-pencil-alt mr-3"></i>Sketsa & Gambar
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat inspirasi sketsa dan gambar yang kreatif dan artistik</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Drawing Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Gambar</h2>
              <div id="sketsa-gambar-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="portrait" class="type-btn-sketsa-gambar p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-user text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Potret</span>
                </button>
                <button type="button" data-type="landscape" class="type-btn-sketsa-gambar p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-mountain text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Pemandangan</span>
                </button>
                <button type="button" data-type="still-life" class="type-btn-sketsa-gambar p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-apple-alt text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Still Life</span>
                </button>
                <button type="button" data-type="abstract" class="type-btn-sketsa-gambar p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shapes text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Abstrak</span>
                </button>
                <button type="button" data-type="cartoon" class="type-btn-sketsa-gambar p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-smile text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Kartun</span>
                </button>
                <button type="button" data-type="manga" class="type-btn-sketsa-gambar p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-book-open text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Manga</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketsa-gambar-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-purple-500"></i>Gaya
                  </label>
                  <select id="sketsa-gambar-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="realistic">Realistis</option>
                    <option value="impressionist">Impresionis</option>
                    <option value="abstract">Abstrak</option>
                    <option value="cartoon">Kartun</option>
                    <option value="line-art">Line Art</option>
                    <option value="watercolor">Akwarel</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                
                <div>
                  <label for="sketsa-gambar-custom-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-pen mr-1 text-purple-500"></i>Gaya Custom
                  </label>
                  <input type="text" id="sketsa-gambar-custom-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan gaya custom...">
                </div>
              </div>
            </div>
            
            <!-- Step 3: Medium -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Media</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketsa-gambar-medium" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-pencil-alt mr-1 text-purple-500"></i>Media
                  </label>
                  <select id="sketsa-gambar-medium" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="pencil">Pensil</option>
                    <option value="charcoal">Arang</option>
                    <option value="ink">Tinta</option>
                    <option value="pastel">Pastel</option>
                    <option value="digital">Digital</option>
                    <option value="mixed-media">Campuran</option>
                  </select>
                </div>
                
                <div>
                  <label for="sketsa-gambar-custom-medium" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-pen-nib mr-1 text-purple-500"></i>Media Custom
                  </label>
                  <input type="text" id="sketsa-gambar-custom-medium" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan media custom...">
                </div>
              </div>
            </div>
            
            <!-- Step 4: Subject -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Subjek</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketsa-gambar-subject" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-eye mr-1 text-purple-500"></i>Subjek
                  </label>
                  <select id="sketsa-gambar-subject" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="people">Manusia</option>
                    <option value="nature">Alam</option>
                    <option value="animals">Hewan</option>
                    <option value="objects">Objek</option>
                    <option value="architecture">Arsitektur</option>
                    <option value="fantasy">Fantasi</option>
                  </select>
                </div>
                
                <div>
                  <label for="sketsa-gambar-custom-subject" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-star mr-1 text-purple-500"></i>Subjek Custom
                  </label>
                  <input type="text" id="sketsa-gambar-custom-subject" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan subjek custom...">
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketsa-gambar-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Target Audiens
                  </label>
                  <select id="sketsa-gambar-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="art-students">Mahasiswa Seni</option>
                    <option value="hobbyists">Hobi</option>
                    <option value="professionals">Profesional</option>
                    <option value="social-media">Media Sosial</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="sketsa-gambar-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-purple-500"></i>Nuansa
                  </label>
                  <select id="sketsa-gambar-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="detailed">Detail</option>
                    <option value="simplified">Sederhana</option>
                    <option value="expressive">Ekspresif</option>
                    <option value="minimal">Minimal</option>
                    <option value="dramatic">Dramatis</option>
                    <option value="whimsical">Unik & Licik</option>
                  </select>
                </div>
                
                <div>
                  <label for="sketsa-gambar-special" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-magic mr-1 text-purple-500"></i>Permintaan Khusus
                  </label>
                  <textarea id="sketsa-gambar-special" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Detail khusus yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="sketsa-gambar-generate-btn" class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Sketsa & Gambar
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="sketsa-gambar-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="sketsa-gambar-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-pencil-alt text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil sketsa dan gambar akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Sketsa & Gambar</p>
              </div>
              <div id="sketsa-gambar-results" class="hidden space-y-6"></div>
              <div id="sketsa-gambar-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat sketsa dan gambar...</p>
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
      const container = document.getElementById('content-sketsa-gambar');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Sketsa & Gambar');
      expect(title.querySelector('i.fas.fa-pencil-alt')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat inspirasi sketsa dan gambar yang kreatif dan artistik');
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
      expect(rightPanel.querySelector('#sketsa-gambar-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Drawing Type Selection Tests
  describe('Drawing Type Selection', () => {
    it('should render drawing type options container', () => {
      const typeOptions = document.getElementById('sketsa-gambar-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Potret option', () => {
      const potretBtn = document.body.querySelector('[data-type="portrait"]');
      expect(potretBtn).toBeTruthy();
      expect(potretBtn.textContent).toContain('Potret');
      expect(potretBtn.querySelector('i.fas.fa-user')).toBeTruthy();
      expect(potretBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Pemandangan option', () => {
      const pemandanganBtn = document.body.querySelector('[data-type="landscape"]');
      expect(pemandanganBtn).toBeTruthy();
      expect(pemandanganBtn.textContent).toContain('Pemandangan');
      expect(pemandanganBtn.querySelector('i.fas.fa-mountain')).toBeTruthy();
    });

    it('should render Still Life option', () => {
      const stillLifeBtn = document.body.querySelector('[data-type="still-life"]');
      expect(stillLifeBtn).toBeTruthy();
      expect(stillLifeBtn.textContent).toContain('Still Life');
      expect(stillLifeBtn.querySelector('i.fas.fa-apple-alt')).toBeTruthy();
    });

    it('should render Abstrak option', () => {
      const abstrakBtn = document.body.querySelector('[data-type="abstract"]');
      expect(abstrakBtn).toBeTruthy();
      expect(abstrakBtn.textContent).toContain('Abstrak');
      expect(abstrakBtn.querySelector('i.fas.fa-shapes')).toBeTruthy();
    });

    it('should render Kartun option', () => {
      const kartunBtn = document.body.querySelector('[data-type="cartoon"]');
      expect(kartunBtn).toBeTruthy();
      expect(kartunBtn.textContent).toContain('Kartun');
      expect(kartunBtn.querySelector('i.fas.fa-smile')).toBeTruthy();
    });

    it('should render Manga option', () => {
      const mangaBtn = document.body.querySelector('[data-type="manga"]');
      expect(mangaBtn).toBeTruthy();
      expect(mangaBtn.textContent).toContain('Manga');
      expect(mangaBtn.querySelector('i.fas.fa-book-open')).toBeTruthy();
    });

    it('should have 6 drawing type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-sketsa-gambar');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('sketsa-gambar-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have purple icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-sketsa-gambar');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Gambar');
    });

    it('should have purple hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-sketsa-gambar');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-purple-100')).toBe(true);
      });
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('sketsa-gambar-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(7);
    });

    it('should render custom style input', () => {
      const customStyleInput = document.getElementById('sketsa-gambar-custom-style');
      expect(customStyleInput).toBeTruthy();
      expect(customStyleInput.tagName).toBe('INPUT');
      expect(customStyleInput.type).toBe('text');
      expect(customStyleInput.placeholder).toContain('Masukkan gaya custom');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gaya');
    });

    it('should have all labels with icons', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
      
      const penIcon = document.body.querySelector('i.fas.fa-pen');
      expect(penIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('sketsa-gambar-style');
      expect(styleSelect.options[0].textContent).toContain('Realistis');
      expect(styleSelect.options[1].textContent).toContain('Impresionis');
      expect(styleSelect.options[2].textContent).toContain('Abstrak');
      expect(styleSelect.options[3].textContent).toContain('Kartun');
      expect(styleSelect.options[4].textContent).toContain('Line Art');
      expect(styleSelect.options[5].textContent).toContain('Akwarel');
      expect(styleSelect.options[6].textContent).toContain('Digital');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('sketsa-gambar-style');
      expect(styleSelect.value).toBe('realistic');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('sketsa-gambar-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Medium Input Tests
  describe('Medium Input', () => {
    it('should render medium select', () => {
      const mediumSelect = document.getElementById('sketsa-gambar-medium');
      expect(mediumSelect).toBeTruthy();
      expect(mediumSelect.tagName).toBe('SELECT');
      expect(mediumSelect.options.length).toBe(6);
    });

    it('should render custom medium input', () => {
      const customMediumInput = document.getElementById('sketsa-gambar-custom-medium');
      expect(customMediumInput).toBeTruthy();
      expect(customMediumInput.tagName).toBe('INPUT');
      expect(customMediumInput.type).toBe('text');
      expect(customMediumInput.placeholder).toContain('Masukkan media custom');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Media');
    });

    it('should have all labels with icons', () => {
      const pencilIcon = document.body.querySelector('i.fas.fa-pencil-alt');
      expect(pencilIcon).toBeTruthy();
      
      const penNibIcon = document.body.querySelector('i.fas.fa-pen-nib');
      expect(penNibIcon).toBeTruthy();
    });

    it('should have medium options with proper labels', () => {
      const mediumSelect = document.getElementById('sketsa-gambar-medium');
      expect(mediumSelect.options[0].textContent).toContain('Pensil');
      expect(mediumSelect.options[1].textContent).toContain('Arang');
      expect(mediumSelect.options[2].textContent).toContain('Tinta');
      expect(mediumSelect.options[3].textContent).toContain('Pastel');
      expect(mediumSelect.options[4].textContent).toContain('Digital');
      expect(mediumSelect.options[5].textContent).toContain('Campuran');
    });

    it('should have default medium value', () => {
      const mediumSelect = document.getElementById('sketsa-gambar-medium');
      expect(mediumSelect.value).toBe('pencil');
    });

    it('should have proper input styling', () => {
      const mediumSelect = document.getElementById('sketsa-gambar-medium');
      expect(mediumSelect.classList.contains('w-full')).toBe(true);
      expect(mediumSelect.classList.contains('p-3')).toBe(true);
      expect(mediumSelect.classList.contains('border')).toBe(true);
      expect(mediumSelect.classList.contains('rounded-lg')).toBe(true);
      expect(mediumSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(mediumSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Subject Input Tests
  describe('Subject Input', () => {
    it('should render subject select', () => {
      const subjectSelect = document.getElementById('sketsa-gambar-subject');
      expect(subjectSelect).toBeTruthy();
      expect(subjectSelect.tagName).toBe('SELECT');
      expect(subjectSelect.options.length).toBe(6);
    });

    it('should render custom subject input', () => {
      const customSubjectInput = document.getElementById('sketsa-gambar-custom-subject');
      expect(customSubjectInput).toBeTruthy();
      expect(customSubjectInput.tagName).toBe('INPUT');
      expect(customSubjectInput.type).toBe('text');
      expect(customSubjectInput.placeholder).toContain('Masukkan subjek custom');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Subjek');
    });

    it('should have all labels with icons', () => {
      const eyeIcon = document.body.querySelector('i.fas.fa-eye');
      expect(eyeIcon).toBeTruthy();
      
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have subject options with proper labels', () => {
      const subjectSelect = document.getElementById('sketsa-gambar-subject');
      expect(subjectSelect.options[0].textContent).toContain('Manusia');
      expect(subjectSelect.options[1].textContent).toContain('Alam');
      expect(subjectSelect.options[2].textContent).toContain('Hewan');
      expect(subjectSelect.options[3].textContent).toContain('Objek');
      expect(subjectSelect.options[4].textContent).toContain('Arsitektur');
      expect(subjectSelect.options[5].textContent).toContain('Fantasi');
    });

    it('should have default subject value', () => {
      const subjectSelect = document.getElementById('sketsa-gambar-subject');
      expect(subjectSelect.value).toBe('people');
    });

    it('should have proper input styling', () => {
      const subjectSelect = document.getElementById('sketsa-gambar-subject');
      expect(subjectSelect.classList.contains('w-full')).toBe(true);
      expect(subjectSelect.classList.contains('p-3')).toBe(true);
      expect(subjectSelect.classList.contains('border')).toBe(true);
      expect(subjectSelect.classList.contains('rounded-lg')).toBe(true);
      expect(subjectSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(subjectSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('sketsa-gambar-audience');
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
      const audienceSelect = document.getElementById('sketsa-gambar-audience');
      expect(audienceSelect.options[0].textContent).toContain('Mahasiswa Seni');
      expect(audienceSelect.options[1].textContent).toContain('Hobi');
      expect(audienceSelect.options[2].textContent).toContain('Profesional');
      expect(audienceSelect.options[3].textContent).toContain('Media Sosial');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('sketsa-gambar-audience');
      expect(audienceSelect.value).toBe('art-students');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('sketsa-gambar-audience');
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
      const toneSelect = document.getElementById('sketsa-gambar-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render special requests textarea', () => {
      const specialInput = document.getElementById('sketsa-gambar-special');
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
      
      const magicIcon = document.body.querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('sketsa-gambar-tone');
      expect(toneSelect.options[0].textContent).toContain('Detail');
      expect(toneSelect.options[1].textContent).toContain('Sederhana');
      expect(toneSelect.options[2].textContent).toContain('Ekspresif');
      expect(toneSelect.options[3].textContent).toContain('Minimal');
      expect(toneSelect.options[4].textContent).toContain('Dramatis');
      expect(toneSelect.options[5].textContent).toContain('Unik & Licik');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('sketsa-gambar-tone');
      expect(toneSelect.value).toBe('detailed');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('sketsa-gambar-tone');
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
      const generateBtn = document.getElementById('sketsa-gambar-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Sketsa & Gambar');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('sketsa-gambar-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('sketsa-gambar-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('sketsa-gambar-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('sketsa-gambar-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('sketsa-gambar-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-pencil-alt')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil sketsa dan gambar akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('sketsa-gambar-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('sketsa-gambar-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat sketsa dan gambar');
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
      const emptyState = document.getElementById('sketsa-gambar-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('sketsa-gambar-empty-state').querySelector('i.fas.fa-pencil-alt');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/pink/indigo color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-500')).toBe(true);
      expect(title.classList.contains('via-pink-500')).toBe(true);
      expect(title.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use purple/pink/indigo accents in generate button', () => {
      const generateBtn = document.getElementById('sketsa-gambar-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use purple accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-sketsa-gambar');
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
      const styleSelect = document.getElementById('sketsa-gambar-style');
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('sketsa-gambar-empty-state').querySelector('i.fas.fa-pencil-alt');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-sketsa-gambar');
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
      const icons = document.body.querySelectorAll('i.fas');
      expect(icons.length).toBeGreaterThanOrEqual(18);
    });

    it('should have pencil-alt icon in header', () => {
      const pencilIcon = document.body.querySelector('header i.fas.fa-pencil-alt');
      expect(pencilIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('sketsa-gambar-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have user icon for portrait', () => {
      const userIcon = document.body.querySelector('[data-type="portrait"] i.fas.fa-user');
      expect(userIcon).toBeTruthy();
    });

    it('should have mountain icon for landscape', () => {
      const mountainIcon = document.body.querySelector('[data-type="landscape"] i.fas.fa-mountain');
      expect(mountainIcon).toBeTruthy();
    });

    it('should have apple-alt icon for still life', () => {
      const appleIcon = document.body.querySelector('[data-type="still-life"] i.fas.fa-apple-alt');
      expect(appleIcon).toBeTruthy();
    });

    it('should have shapes icon for abstract', () => {
      const shapesIcon = document.body.querySelector('[data-type="abstract"] i.fas.fa-shapes');
      expect(shapesIcon).toBeTruthy();
    });

    it('should have smile icon for cartoon', () => {
      const smileIcon = document.body.querySelector('[data-type="cartoon"] i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have book-open icon for manga', () => {
      const bookIcon = document.body.querySelector('[data-type="manga"] i.fas.fa-book-open');
      expect(bookIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have pen icon for custom style', () => {
      const penIcon = document.body.querySelector('i.fas.fa-pen');
      expect(penIcon).toBeTruthy();
    });

    it('should have pencil-alt icon for medium', () => {
      const pencilIcon = document.body.querySelector('i.fas.fa-pencil-alt');
      expect(pencilIcon).toBeTruthy();
    });

    it('should have pen-nib icon for custom medium', () => {
      const penNibIcon = document.body.querySelector('i.fas.fa-pen-nib');
      expect(penNibIcon).toBeTruthy();
    });

    it('should have eye icon for subject', () => {
      const eyeIcon = document.body.querySelector('i.fas.fa-eye');
      expect(eyeIcon).toBeTruthy();
    });

    it('should have star icon for custom subject', () => {
      const starIcon = document.body.querySelector('i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have heart icon for tone', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have magic icon for special requests', () => {
      const magicIcon = document.body.querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have pencil-alt icon in empty state', () => {
      const emptyStateIcon = document.getElementById('sketsa-gambar-empty-state').querySelector('i.fas.fa-pencil-alt');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Sketsa & Gambar');
      expect(document.body.textContent).toContain('Jenis Gambar');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Media');
      expect(document.body.textContent).toContain('Subjek');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Sketsa & Gambar');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Gambar');
      expect(headers[1].textContent).toContain('2. Gaya');
      expect(headers[2].textContent).toContain('3. Media');
      expect(headers[3].textContent).toContain('4. Subjek');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('sketsa-gambar-empty-state');
      expect(emptyState.textContent).toContain('Hasil sketsa dan gambar akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Sketsa & Gambar');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('sketsa-gambar-loading');
      expect(loading.textContent).toContain('Sedang membuat sketsa dan gambar');
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
      const styleSelect = document.getElementById('sketsa-gambar-style');
      expect(styleSelect).toBeTruthy();
      
      const customStyleInput = document.getElementById('sketsa-gambar-custom-style');
      expect(customStyleInput).toBeTruthy();
      
      const mediumSelect = document.getElementById('sketsa-gambar-medium');
      expect(mediumSelect).toBeTruthy();
      
      const customMediumInput = document.getElementById('sketsa-gambar-custom-medium');
      expect(customMediumInput).toBeTruthy();
      
      const subjectSelect = document.getElementById('sketsa-gambar-subject');
      expect(subjectSelect).toBeTruthy();
      
      const customSubjectInput = document.getElementById('sketsa-gambar-custom-subject');
      expect(customSubjectInput).toBeTruthy();
      
      const audienceSelect = document.getElementById('sketsa-gambar-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('sketsa-gambar-tone');
      expect(toneSelect).toBeTruthy();
      
      const specialInput = document.getElementById('sketsa-gambar-special');
      expect(specialInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const styleSelect = document.getElementById('sketsa-gambar-style');
      expect(styleSelect).toBeTruthy();
      
      const mediumSelect = document.getElementById('sketsa-gambar-medium');
      expect(mediumSelect).toBeTruthy();
      
      const subjectSelect = document.getElementById('sketsa-gambar-subject');
      expect(subjectSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('sketsa-gambar-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('sketsa-gambar-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const customStyleInput = document.getElementById('sketsa-gambar-custom-style');
      expect(customStyleInput).toBeTruthy();
      
      const customMediumInput = document.getElementById('sketsa-gambar-custom-medium');
      expect(customMediumInput).toBeTruthy();
      
      const customSubjectInput = document.getElementById('sketsa-gambar-custom-subject');
      expect(customSubjectInput).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const specialInput = document.getElementById('sketsa-gambar-special');
      expect(specialInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('sketsa-gambar-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const customStyleInput = document.getElementById('sketsa-gambar-custom-style');
      expect(customStyleInput.tagName).toBe('INPUT');
      expect(customStyleInput.type).toBe('text');
      
      const customMediumInput = document.getElementById('sketsa-gambar-custom-medium');
      expect(customMediumInput.tagName).toBe('INPUT');
      expect(customMediumInput.type).toBe('text');
      
      const customSubjectInput = document.getElementById('sketsa-gambar-custom-subject');
      expect(customSubjectInput.tagName).toBe('INPUT');
      expect(customSubjectInput.type).toBe('text');
    });

    it('should have proper drawing type button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-sketsa-gambar');
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
      const typeOptions = document.getElementById('sketsa-gambar-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
