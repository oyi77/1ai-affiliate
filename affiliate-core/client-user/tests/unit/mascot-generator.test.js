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

describe('mascot-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-mascot-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            <i class="fas fa-star mr-3"></i>Generator Mascot
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat mascot unik dan menarik dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Mascot Name -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Nama Mascot</h2>
              <div class="space-y-4">
                <div>
                  <label for="mascot-generator-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-purple-500"></i>Nama Mascot
                  </label>
                  <input type="text" id="mascot-generator-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Masukkan nama mascot...">
                </div>
              </div>
            </div>
            
            <!-- Step 2: Mascot Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Tipe Mascot</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="mascot-generator-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paw mr-1 text-pink-500"></i>Tipe Mascot
                  </label>
                  <select id="mascot-generator-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="animal">Hewan</option>
                    <option value="humanoid">Humanoid</option>
                    <option value="robot">Robot</option>
                    <option value="monster">Monster</option>
                    <option value="mythical">Mitologis</option>
                    <option value="abstract">Abstrak</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="mascot-generator-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-rose-500"></i>Gaya Mascot
                  </label>
                  <select id="mascot-generator-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                    <option value="cartoon">Kartun</option>
                    <option value="flat">Flat</option>
                    <option value="3d">3D</option>
                    <option value="minimalist">Minimalis</option>
                    <option value="detailed">Detail</option>
                    <option value="hand-drawn">Tangan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Color Scheme -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Skema Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="mascot-generator-color" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-purple-500"></i>Skema Warna
                  </label>
                  <select id="mascot-generator-color" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="single">Warna Tunggal</option>
                    <option value="dual">Dua Warna</option>
                    <option value="multi">Multi Warna</option>
                    <option value="monochrome">Monokrom</option>
                    <option value="vibrant">Vibrant</option>
                    <option value="pastel">Pastel</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Expression -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Ekspresi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="mascot-generator-expression" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-pink-500"></i>Ekspresi
                  </label>
                  <select id="mascot-generator-expression" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="happy">Bahagia</option>
                    <option value="serious">Serius</option>
                    <option value="playful">Playful</option>
                    <option value="wise">Bijaksana</option>
                    <option value="fierce">Galak</option>
                    <option value="cute">Lucu</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Accessories -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Aksesoris</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="mascot-generator-accessories" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-glasses mr-1 text-rose-500"></i>Aksesoris
                  </label>
                  <select id="mascot-generator-accessories" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                    <option value="none">Tidak Ada</option>
                    <option value="glasses">Kacamata</option>
                    <option value="hat">Topi</option>
                    <option value="wings">Sayap</option>
                    <option value="cape">Jubah</option>
                    <option value="badge">Lencana</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="mascot-generator-generate-btn" class="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Mascot
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="mascot-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="mascot-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-star text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil mascot akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Mascot</p>
              </div>
              <div id="mascot-generator-results" class="hidden space-y-6"></div>
              <div id="mascot-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat mascot...</p>
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
      const container = document.getElementById('content-mascot-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Mascot');
      expect(title.querySelector('i.fas.fa-star')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat mascot unik dan menarik dengan AI');
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
      expect(rightPanel.querySelector('#mascot-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Mascot Name Input Tests
  describe('Mascot Name Input', () => {
    it('should render name input field', () => {
      const nameInput = document.getElementById('mascot-generator-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.tagName).toBe('INPUT');
      expect(nameInput.type).toBe('text');
    });

    it('should have proper placeholder text', () => {
      const nameInput = document.getElementById('mascot-generator-name');
      expect(nameInput.placeholder).toBe('Masukkan nama mascot...');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Nama Mascot');
    });

    it('should have label with icon', () => {
      const tagIcon = document.body.querySelector('i.fas.fa-tag');
      expect(tagIcon).toBeTruthy();
      expect(tagIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have proper input styling', () => {
      const nameInput = document.getElementById('mascot-generator-name');
      expect(nameInput.classList.contains('w-full')).toBe(true);
      expect(nameInput.classList.contains('p-3')).toBe(true);
      expect(nameInput.classList.contains('border')).toBe(true);
      expect(nameInput.classList.contains('rounded-lg')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-2')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Mascot Type Selection Tests
  describe('Mascot Type Selection', () => {
    it('should render type select', () => {
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.tagName).toBe('SELECT');
      expect(typeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Tipe Mascot');
    });

    it('should have label with icon', () => {
      const pawIcon = document.body.querySelector('i.fas.fa-paw');
      expect(pawIcon).toBeTruthy();
      expect(pawIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have type options with proper labels', () => {
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect.options[0].textContent).toContain('Hewan');
      expect(typeSelect.options[1].textContent).toContain('Humanoid');
      expect(typeSelect.options[2].textContent).toContain('Robot');
      expect(typeSelect.options[3].textContent).toContain('Monster');
      expect(typeSelect.options[4].textContent).toContain('Mitologis');
      expect(typeSelect.options[5].textContent).toContain('Abstrak');
    });

    it('should have default type value', () => {
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect.value).toBe('animal');
    });

    it('should have proper input styling', () => {
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect.classList.contains('w-full')).toBe(true);
      expect(typeSelect.classList.contains('p-3')).toBe(true);
      expect(typeSelect.classList.contains('border')).toBe(true);
      expect(typeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Style Selection Tests
  describe('Style Selection', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya');
    });

    it('should have label with icon', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
      expect(paintBrushIcon.classList.contains('text-rose-500')).toBe(true);
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect.options[0].textContent).toContain('Kartun');
      expect(styleSelect.options[1].textContent).toContain('Flat');
      expect(styleSelect.options[2].textContent).toContain('3D');
      expect(styleSelect.options[3].textContent).toContain('Minimalis');
      expect(styleSelect.options[4].textContent).toContain('Detail');
      expect(styleSelect.options[5].textContent).toContain('Tangan');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect.value).toBe('cartoon');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-rose-500')).toBe(true);
    });
  });

  // Color Scheme Selection Tests
  describe('Color Scheme Selection', () => {
    it('should render color select', () => {
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect).toBeTruthy();
      expect(colorSelect.tagName).toBe('SELECT');
      expect(colorSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Skema Warna');
    });

    it('should have label with icon', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
      expect(paletteIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have color options with proper labels', () => {
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect.options[0].textContent).toContain('Warna Tunggal');
      expect(colorSelect.options[1].textContent).toContain('Dua Warna');
      expect(colorSelect.options[2].textContent).toContain('Multi Warna');
      expect(colorSelect.options[3].textContent).toContain('Monokrom');
      expect(colorSelect.options[4].textContent).toContain('Vibrant');
      expect(colorSelect.options[5].textContent).toContain('Pastel');
    });

    it('should have default color value', () => {
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect.value).toBe('single');
    });

    it('should have proper input styling', () => {
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect.classList.contains('w-full')).toBe(true);
      expect(colorSelect.classList.contains('p-3')).toBe(true);
      expect(colorSelect.classList.contains('border')).toBe(true);
      expect(colorSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Expression Selection Tests
  describe('Expression Selection', () => {
    it('should render expression select', () => {
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect).toBeTruthy();
      expect(expressionSelect.tagName).toBe('SELECT');
      expect(expressionSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Ekspresi');
    });

    it('should have label with icon', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
      expect(smileIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have expression options with proper labels', () => {
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect.options[0].textContent).toContain('Bahagia');
      expect(expressionSelect.options[1].textContent).toContain('Serius');
      expect(expressionSelect.options[2].textContent).toContain('Playful');
      expect(expressionSelect.options[3].textContent).toContain('Bijaksana');
      expect(expressionSelect.options[4].textContent).toContain('Galak');
      expect(expressionSelect.options[5].textContent).toContain('Lucu');
    });

    it('should have default expression value', () => {
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect.value).toBe('happy');
    });

    it('should have proper input styling', () => {
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect.classList.contains('w-full')).toBe(true);
      expect(expressionSelect.classList.contains('p-3')).toBe(true);
      expect(expressionSelect.classList.contains('border')).toBe(true);
      expect(expressionSelect.classList.contains('rounded-lg')).toBe(true);
      expect(expressionSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(expressionSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Accessories Selection Tests
  describe('Accessories Selection', () => {
    it('should render accessories select', () => {
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect).toBeTruthy();
      expect(accessoriesSelect.tagName).toBe('SELECT');
      expect(accessoriesSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Aksesoris');
    });

    it('should have label with icon', () => {
      const glassesIcon = document.body.querySelector('i.fas.fa-glasses');
      expect(glassesIcon).toBeTruthy();
      expect(glassesIcon.classList.contains('text-rose-500')).toBe(true);
    });

    it('should have accessories options with proper labels', () => {
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect.options[0].textContent).toContain('Tidak Ada');
      expect(accessoriesSelect.options[1].textContent).toContain('Kacamata');
      expect(accessoriesSelect.options[2].textContent).toContain('Topi');
      expect(accessoriesSelect.options[3].textContent).toContain('Sayap');
      expect(accessoriesSelect.options[4].textContent).toContain('Jubah');
      expect(accessoriesSelect.options[5].textContent).toContain('Lencana');
    });

    it('should have default accessories value', () => {
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect.value).toBe('none');
    });

    it('should have proper input styling', () => {
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect.classList.contains('w-full')).toBe(true);
      expect(accessoriesSelect.classList.contains('p-3')).toBe(true);
      expect(accessoriesSelect.classList.contains('border')).toBe(true);
      expect(accessoriesSelect.classList.contains('rounded-lg')).toBe(true);
      expect(accessoriesSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(accessoriesSelect.classList.contains('focus:ring-rose-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('mascot-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Mascot');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('mascot-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('mascot-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('mascot-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('mascot-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('mascot-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-star')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil mascot akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('mascot-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('mascot-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat mascot');
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
      const emptyState = document.getElementById('mascot-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('mascot-generator-empty-state').querySelector('i.fas.fa-star');
      expect(emptyStateIcon.classList.contains('text-purple-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/pink/rose color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-500')).toBe(true);
      expect(title.classList.contains('via-pink-500')).toBe(true);
      expect(title.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use purple/pink/rose accents in generate button', () => {
      const generateBtn = document.getElementById('mascot-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('via-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
    });

    it('should use purple accents in name input', () => {
      const nameInput = document.getElementById('mascot-generator-name');
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(nameInput.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use pink accents in type select', () => {
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(typeSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in style select', () => {
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use purple accents in color select', () => {
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(colorSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use pink accents in expression select', () => {
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(expressionSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use rose accents in accessories select', () => {
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect.classList.contains('focus:ring-rose-500')).toBe(true);
      expect(accessoriesSelect.classList.contains('focus:border-rose-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('mascot-generator-empty-state').querySelector('i.fas.fa-star');
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

    it('should have star icon in header', () => {
      const starIcon = document.body.querySelector('header i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('mascot-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have tag icon for name input', () => {
      const tagIcon = document.body.querySelector('i.fas.fa-tag');
      expect(tagIcon).toBeTruthy();
    });

    it('should have paw icon for type select', () => {
      const pawIcon = document.body.querySelector('i.fas.fa-paw');
      expect(pawIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style select', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have palette icon for color select', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have smile icon for expression select', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have glasses icon for accessories select', () => {
      const glassesIcon = document.body.querySelector('i.fas.fa-glasses');
      expect(glassesIcon).toBeTruthy();
    });

    it('should have star icon in empty state', () => {
      const emptyStateIcon = document.getElementById('mascot-generator-empty-state').querySelector('i.fas.fa-star');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have tag icon with purple color', () => {
      const tagIcon = document.body.querySelector('i.fas.fa-tag');
      expect(tagIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have paw icon with pink color', () => {
      const pawIcon = document.body.querySelector('i.fas.fa-paw');
      expect(pawIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have paint-brush icon with rose color', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon.classList.contains('text-rose-500')).toBe(true);
    });

    it('should have palette icon with purple color', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon.classList.contains('text-purple-500')).toBe(true);
    });

    it('should have smile icon with pink color', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon.classList.contains('text-pink-500')).toBe(true);
    });

    it('should have glasses icon with rose color', () => {
      const glassesIcon = document.body.querySelector('i.fas.fa-glasses');
      expect(glassesIcon.classList.contains('text-rose-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Mascot');
      expect(document.body.textContent).toContain('Nama Mascot');
      expect(document.body.textContent).toContain('Tipe Mascot');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Skema Warna');
      expect(document.body.textContent).toContain('Ekspresi');
      expect(document.body.textContent).toContain('Aksesoris');
      expect(document.body.textContent).toContain('Buat Mascot');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Nama Mascot');
      expect(headers[1].textContent).toContain('2. Tipe Mascot');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Skema Warna');
      expect(headers[4].textContent).toContain('5. Ekspresi');
      expect(headers[5].textContent).toContain('6. Aksesoris');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('mascot-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil mascot akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Mascot');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('mascot-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat mascot');
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
      const nameInput = document.getElementById('mascot-generator-name');
      expect(nameInput).toBeTruthy();
      
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect).toBeTruthy();
      
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect).toBeTruthy();
      
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const nameLabel = document.querySelector('label[for="mascot-generator-name"]');
      expect(nameLabel).toBeTruthy();
      
      const typeLabel = document.querySelector('label[for="mascot-generator-type"]');
      expect(typeLabel).toBeTruthy();
      
      const styleLabel = document.querySelector('label[for="mascot-generator-style"]');
      expect(styleLabel).toBeTruthy();
      
      const colorLabel = document.querySelector('label[for="mascot-generator-color"]');
      expect(colorLabel).toBeTruthy();
      
      const expressionLabel = document.querySelector('label[for="mascot-generator-expression"]');
      expect(expressionLabel).toBeTruthy();
      
      const accessoriesLabel = document.querySelector('label[for="mascot-generator-accessories"]');
      expect(accessoriesLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('mascot-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const nameInput = document.getElementById('mascot-generator-name');
      expect(nameInput.type).toBe('text');
      
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect.tagName).toBe('SELECT');
      
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect.tagName).toBe('SELECT');
      
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect.tagName).toBe('SELECT');
    });

    it('should have proper select types', () => {
      const typeSelect = document.getElementById('mascot-generator-type');
      expect(typeSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('mascot-generator-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const colorSelect = document.getElementById('mascot-generator-color');
      expect(colorSelect.tagName).toBe('SELECT');
      
      const expressionSelect = document.getElementById('mascot-generator-expression');
      expect(expressionSelect.tagName).toBe('SELECT');
      
      const accessoriesSelect = document.getElementById('mascot-generator-accessories');
      expect(accessoriesSelect.tagName).toBe('SELECT');
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
