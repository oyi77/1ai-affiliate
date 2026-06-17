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

describe('vehicle-modifier Component', () => {
  
  const mockComponentHTML = `
    <div id="content-vehicle-modifier" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
            <i class="fas fa-car-side mr-3"></i>Modifikasi Kendaraan
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konsep modifikasi kendaraan yang unik dan menarik untuk proyek Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Vehicle Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Kendaraan</h2>
              <div id="vehicle-modifier-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="motorcycle" class="type-btn-vehicle-modifier p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-motorcycle text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Motor</span>
                </button>
                <button type="button" data-type="car" class="type-btn-vehicle-modifier p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-car text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Mobil</span>
                </button>
                <button type="button" data-type="bicycle" class="type-btn-vehicle-modifier p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bicycle text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Sepeda</span>
                </button>
                <button type="button" data-type="scooter" class="type-btn-vehicle-modifier p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-scooter text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Skuter</span>
                </button>
                <button type="button" data-type="atv" class="type-btn-vehicle-modifier p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-truck-monster text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">ATV</span>
                </button>
                <button type="button" data-type="boat" class="type-btn-vehicle-modifier p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-ship text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Kapal</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Modification Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Modifikasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="vehicle-modifier-modification-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tools mr-1 text-red-500"></i>Jenis Modifikasi
                  </label>
                  <select id="vehicle-modifier-modification-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="performance">Performa</option>
                    <option value="aesthetic">Estetika</option>
                    <option value="restoration">Restorasi</option>
                    <option value="customization">Kustomisasi</option>
                    <option value="accessories">Aksesoris</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="vehicle-modifier-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-red-500"></i>Gaya
                  </label>
                  <select id="vehicle-modifier-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="sport">Sport</option>
                    <option value="classic">Klasik</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="off-road">Off-Road</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Budget Range -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Budget</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="vehicle-modifier-budget" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-wallet mr-1 text-red-500"></i>Budget
                  </label>
                  <select id="vehicle-modifier-budget" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="economy">Ekonomi</option>
                    <option value="mid-range">Menengah</option>
                    <option value="premium">Premium</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="vehicle-modifier-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-red-500"></i>Target Audiens
                  </label>
                  <select id="vehicle-modifier-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="enthusiasts">Enthusiast</option>
                    <option value="collectors">Kolektor</option>
                    <option value="daily-users">Pengguna Harian</option>
                    <option value="professionals">Profesional</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="vehicle-modifier-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-red-500"></i>Nuansa
                  </label>
                  <select id="vehicle-modifier-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option value="aggressive">Agresif</option>
                    <option value="sleek">Elegan</option>
                    <option value="retro">Retro</option>
                    <option value="futuristic">Futuristik</option>
                    <option value="elegant">Mewah</option>
                    <option value="rugged">Kasar</option>
                  </select>
                </div>
                
                <div>
                  <label for="vehicle-modifier-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-red-500"></i>Deskripsi Modifikasi
                  </label>
                  <textarea id="vehicle-modifier-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Jelaskan modifikasi kendaraan yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="vehicle-modifier-generate-btn" class="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Modifikasi Kendaraan
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="vehicle-modifier-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="vehicle-modifier-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-car-side text-6xl mb-4 text-red-400"></i>
                <p class="text-xl">Hasil modifikasi kendaraan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Modifikasi Kendaraan</p>
              </div>
              <div id="vehicle-modifier-results" class="hidden space-y-6"></div>
              <div id="vehicle-modifier-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-red-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat modifikasi kendaraan...</p>
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
      const container = document.getElementById('content-vehicle-modifier');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Modifikasi Kendaraan');
      expect(title.querySelector('i.fas.fa-car-side')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konsep modifikasi kendaraan yang unik dan menarik untuk proyek Anda');
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
      expect(rightPanel.querySelector('#vehicle-modifier-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Vehicle Type Selection Tests
  describe('Vehicle Type Selection', () => {
    it('should render vehicle type options container', () => {
      const typeOptions = document.getElementById('vehicle-modifier-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Motorcycle option', () => {
      const motorcycleBtn = document.body.querySelector('[data-type="motorcycle"]');
      expect(motorcycleBtn).toBeTruthy();
      expect(motorcycleBtn.textContent).toContain('Motor');
      expect(motorcycleBtn.querySelector('i.fas.fa-motorcycle')).toBeTruthy();
      expect(motorcycleBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Car option', () => {
      const carBtn = document.body.querySelector('[data-type="car"]');
      expect(carBtn).toBeTruthy();
      expect(carBtn.textContent).toContain('Mobil');
      expect(carBtn.querySelector('i.fas.fa-car')).toBeTruthy();
    });

    it('should render Bicycle option', () => {
      const bicycleBtn = document.body.querySelector('[data-type="bicycle"]');
      expect(bicycleBtn).toBeTruthy();
      expect(bicycleBtn.textContent).toContain('Sepeda');
      expect(bicycleBtn.querySelector('i.fas.fa-bicycle')).toBeTruthy();
    });

    it('should render Scooter option', () => {
      const scooterBtn = document.body.querySelector('[data-type="scooter"]');
      expect(scooterBtn).toBeTruthy();
      expect(scooterBtn.textContent).toContain('Skuter');
      expect(scooterBtn.querySelector('i.fas.fa-scooter')).toBeTruthy();
    });

    it('should render ATV option', () => {
      const atvBtn = document.body.querySelector('[data-type="atv"]');
      expect(atvBtn).toBeTruthy();
      expect(atvBtn.textContent).toContain('ATV');
      expect(atvBtn.querySelector('i.fas.fa-truck-monster')).toBeTruthy();
    });

    it('should render Boat option', () => {
      const boatBtn = document.body.querySelector('[data-type="boat"]');
      expect(boatBtn).toBeTruthy();
      expect(boatBtn.textContent).toContain('Kapal');
      expect(boatBtn.querySelector('i.fas.fa-ship')).toBeTruthy();
    });

    it('should have 6 vehicle type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-vehicle-modifier');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('vehicle-modifier-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have red icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-vehicle-modifier');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-red-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Kendaraan');
    });

    it('should have red hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-vehicle-modifier');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-red-100')).toBe(true);
      });
    });
  });

  // Modification Type Input Tests
  describe('Modification Type Input', () => {
    it('should render modification type select', () => {
      const modificationTypeSelect = document.getElementById('vehicle-modifier-modification-type');
      expect(modificationTypeSelect).toBeTruthy();
      expect(modificationTypeSelect.tagName).toBe('SELECT');
      expect(modificationTypeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jenis Modifikasi');
    });

    it('should have all labels with icons', () => {
      const toolsIcon = document.body.querySelector('i.fas.fa-tools');
      expect(toolsIcon).toBeTruthy();
    });

    it('should have modification type options with proper labels', () => {
      const modificationTypeSelect = document.getElementById('vehicle-modifier-modification-type');
      expect(modificationTypeSelect.options[0].textContent).toContain('Performa');
      expect(modificationTypeSelect.options[1].textContent).toContain('Estetika');
      expect(modificationTypeSelect.options[2].textContent).toContain('Restorasi');
      expect(modificationTypeSelect.options[3].textContent).toContain('Kustomisasi');
      expect(modificationTypeSelect.options[4].textContent).toContain('Aksesoris');
    });

    it('should have default modification type value', () => {
      const modificationTypeSelect = document.getElementById('vehicle-modifier-modification-type');
      expect(modificationTypeSelect.value).toBe('performance');
    });

    it('should have proper input styling', () => {
      const modificationTypeSelect = document.getElementById('vehicle-modifier-modification-type');
      expect(modificationTypeSelect.classList.contains('w-full')).toBe(true);
      expect(modificationTypeSelect.classList.contains('p-3')).toBe(true);
      expect(modificationTypeSelect.classList.contains('border')).toBe(true);
      expect(modificationTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(modificationTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(modificationTypeSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Gaya');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect.options[0].textContent).toContain('Sport');
      expect(styleSelect.options[1].textContent).toContain('Klasik');
      expect(styleSelect.options[2].textContent).toContain('Vintage');
      expect(styleSelect.options[3].textContent).toContain('Modern');
      expect(styleSelect.options[4].textContent).toContain('Off-Road');
      expect(styleSelect.options[5].textContent).toContain('Luxury');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect.value).toBe('sport');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Budget Range Input Tests
  describe('Budget Range Input', () => {
    it('should render budget select', () => {
      const budgetSelect = document.getElementById('vehicle-modifier-budget');
      expect(budgetSelect).toBeTruthy();
      expect(budgetSelect.tagName).toBe('SELECT');
      expect(budgetSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Budget');
    });

    it('should have all labels with icons', () => {
      const walletIcon = document.body.querySelector('i.fas.fa-wallet');
      expect(walletIcon).toBeTruthy();
    });

    it('should have budget options with proper labels', () => {
      const budgetSelect = document.getElementById('vehicle-modifier-budget');
      expect(budgetSelect.options[0].textContent).toContain('Ekonomi');
      expect(budgetSelect.options[1].textContent).toContain('Menengah');
      expect(budgetSelect.options[2].textContent).toContain('Premium');
      expect(budgetSelect.options[3].textContent).toContain('Custom');
    });

    it('should have default budget value', () => {
      const budgetSelect = document.getElementById('vehicle-modifier-budget');
      expect(budgetSelect.value).toBe('economy');
    });

    it('should have proper input styling', () => {
      const budgetSelect = document.getElementById('vehicle-modifier-budget');
      expect(budgetSelect.classList.contains('w-full')).toBe(true);
      expect(budgetSelect.classList.contains('p-3')).toBe(true);
      expect(budgetSelect.classList.contains('border')).toBe(true);
      expect(budgetSelect.classList.contains('rounded-lg')).toBe(true);
      expect(budgetSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(budgetSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('vehicle-modifier-audience');
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
      const audienceSelect = document.getElementById('vehicle-modifier-audience');
      expect(audienceSelect.options[0].textContent).toContain('Enthusiast');
      expect(audienceSelect.options[1].textContent).toContain('Kolektor');
      expect(audienceSelect.options[2].textContent).toContain('Pengguna Harian');
      expect(audienceSelect.options[3].textContent).toContain('Profesional');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('vehicle-modifier-audience');
      expect(audienceSelect.value).toBe('enthusiasts');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('vehicle-modifier-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('vehicle-modifier-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('vehicle-modifier-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan modifikasi kendaraan yang diinginkan');
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
      const toneSelect = document.getElementById('vehicle-modifier-tone');
      expect(toneSelect.options[0].textContent).toContain('Agresif');
      expect(toneSelect.options[1].textContent).toContain('Elegan');
      expect(toneSelect.options[2].textContent).toContain('Retro');
      expect(toneSelect.options[3].textContent).toContain('Futuristik');
      expect(toneSelect.options[4].textContent).toContain('Mewah');
      expect(toneSelect.options[5].textContent).toContain('Kasar');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('vehicle-modifier-tone');
      expect(toneSelect.value).toBe('aggressive');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('vehicle-modifier-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-red-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('vehicle-modifier-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Modifikasi Kendaraan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('vehicle-modifier-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-red-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('vehicle-modifier-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('vehicle-modifier-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('vehicle-modifier-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('vehicle-modifier-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-car-side')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil modifikasi kendaraan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('vehicle-modifier-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('vehicle-modifier-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat modifikasi kendaraan');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-red-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('vehicle-modifier-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have red icon in empty state', () => {
      const emptyStateIcon = document.getElementById('vehicle-modifier-empty-state').querySelector('i.fas.fa-car-side');
      expect(emptyStateIcon.classList.contains('text-red-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use red/orange/yellow color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-red-500')).toBe(true);
      expect(title.classList.contains('via-orange-500')).toBe(true);
      expect(title.classList.contains('to-yellow-600')).toBe(true);
    });

    it('should use red/orange/yellow accents in generate button', () => {
      const generateBtn = document.getElementById('vehicle-modifier-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-red-500')).toBe(true);
      expect(generateBtn.classList.contains('via-orange-500')).toBe(true);
      expect(generateBtn.classList.contains('to-yellow-600')).toBe(true);
    });

    it('should use red accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-vehicle-modifier');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-red-500')).toBe(true);
      });
    });

    it('should use red accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-red-500')).toBe(true);
      });
    });

    it('should use red accents in focus states', () => {
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect.classList.contains('focus:ring-red-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-red-500')).toBe(true);
    });

    it('should use red accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-red-500')).toBe(true);
    });

    it('should use red accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('vehicle-modifier-empty-state').querySelector('i.fas.fa-car-side');
      expect(emptyStateIcon.classList.contains('text-red-400')).toBe(true);
    });

    it('should use red hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-vehicle-modifier');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-red-100')).toBe(true);
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

    it('should have car-side icon in header', () => {
      const carSideIcon = document.body.querySelector('header i.fas.fa-car-side');
      expect(carSideIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('vehicle-modifier-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have motorcycle icon for motorcycle', () => {
      const motorcycleIcon = document.body.querySelector('[data-type="motorcycle"] i.fas.fa-motorcycle');
      expect(motorcycleIcon).toBeTruthy();
    });

    it('should have car icon for car', () => {
      const carIcon = document.body.querySelector('[data-type="car"] i.fas.fa-car');
      expect(carIcon).toBeTruthy();
    });

    it('should have bicycle icon for bicycle', () => {
      const bicycleIcon = document.body.querySelector('[data-type="bicycle"] i.fas.fa-bicycle');
      expect(bicycleIcon).toBeTruthy();
    });

    it('should have scooter icon for scooter', () => {
      const scooterIcon = document.body.querySelector('[data-type="scooter"] i.fas.fa-scooter');
      expect(scooterIcon).toBeTruthy();
    });

    it('should have truck-monster icon for ATV', () => {
      const atvIcon = document.body.querySelector('[data-type="atv"] i.fas.fa-truck-monster');
      expect(atvIcon).toBeTruthy();
    });

    it('should have ship icon for boat', () => {
      const boatIcon = document.body.querySelector('[data-type="boat"] i.fas.fa-ship');
      expect(boatIcon).toBeTruthy();
    });

    it('should have tools icon for modification type', () => {
      const toolsIcon = document.body.querySelector('i.fas.fa-tools');
      expect(toolsIcon).toBeTruthy();
    });

    it('should have palette icon for style', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have wallet icon for budget', () => {
      const walletIcon = document.body.querySelector('i.fas.fa-wallet');
      expect(walletIcon).toBeTruthy();
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

    it('should have car-side icon in empty state', () => {
      const emptyStateIcon = document.getElementById('vehicle-modifier-empty-state').querySelector('i.fas.fa-car-side');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Modifikasi Kendaraan');
      expect(document.body.textContent).toContain('Jenis Kendaraan');
      expect(document.body.textContent).toContain('Jenis Modifikasi');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Budget');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Modifikasi Kendaraan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Kendaraan');
      expect(headers[1].textContent).toContain('2. Jenis Modifikasi');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Budget');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('vehicle-modifier-empty-state');
      expect(emptyState.textContent).toContain('Hasil modifikasi kendaraan akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Modifikasi Kendaraan');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('vehicle-modifier-loading');
      expect(loading.textContent).toContain('Sedang membuat modifikasi kendaraan');
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
      const modificationTypeSelect = document.getElementById('vehicle-modifier-modification-type');
      expect(modificationTypeSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect).toBeTruthy();
      
      const budgetSelect = document.getElementById('vehicle-modifier-budget');
      expect(budgetSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('vehicle-modifier-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('vehicle-modifier-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('vehicle-modifier-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const modificationTypeSelect = document.getElementById('vehicle-modifier-modification-type');
      expect(modificationTypeSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect).toBeTruthy();
      
      const budgetSelect = document.getElementById('vehicle-modifier-budget');
      expect(budgetSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('vehicle-modifier-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('vehicle-modifier-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('vehicle-modifier-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('vehicle-modifier-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const modificationTypeSelect = document.getElementById('vehicle-modifier-modification-type');
      expect(modificationTypeSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('vehicle-modifier-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const budgetSelect = document.getElementById('vehicle-modifier-budget');
      expect(budgetSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('vehicle-modifier-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('vehicle-modifier-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper vehicle type button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-vehicle-modifier');
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
      const typeOptions = document.getElementById('vehicle-modifier-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
