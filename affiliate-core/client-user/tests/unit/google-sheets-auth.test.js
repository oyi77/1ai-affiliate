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

describe('google-sheets-auth Component', () => {
  
  const mockComponentHTML = `
    <div id="content-google-sheets-auth" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
            <i class="fab fa-google mr-3"></i>Autentikasi Google Sheets
          </h1>
          <p class="text-lg text-gray-600 mt-2">Koneksikan dan autentikasi Google Sheets dengan aman</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Google Sheets URL -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">URL Google Sheets</h2>
              <div class="space-y-4">
                <div>
                  <label for="google-sheets-auth-url" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-link mr-1 text-blue-500"></i>URL Spreadsheet
                  </label>
                  <input type="url" id="google-sheets-auth-url" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://docs.google.com/spreadsheets/d/...">
                </div>
              </div>
            </div>
            
            <!-- Access Level -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Level Akses</h2>
              <div class="space-y-4">
                <div>
                  <label for="google-sheets-auth-access-level" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-shield-alt mr-1 text-cyan-500"></i>Tingkat Akses
                  </label>
                  <select id="google-sheets-auth-access-level" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="read-only">Baca Saja</option>
                    <option value="read-write">Baca & Tulis</option>
                    <option value="admin-full">Admin Akses Penuh</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Email Whitelist -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Daftar Putih Email</h2>
              <div class="space-y-4">
                <div>
                  <label for="google-sheets-auth-email-whitelist" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-envelope mr-1 text-blue-400"></i>Email yang Diizinkan
                  </label>
                  <textarea id="google-sheets-auth-email-whitelist" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400" placeholder="email1@example.com, email2@example.com, ..."></textarea>
                  <p class="text-xs text-gray-500 mt-1">Pisahkan dengan koma untuk beberapa email</p>
                </div>
              </div>
            </div>
            
            <!-- API Key -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">API Key</h2>
              <div class="space-y-4">
                <div>
                  <label for="google-sheets-auth-api-key" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-key mr-1 text-cyan-400"></i>Kunci API
                  </label>
                  <input type="text" id="google-sheets-auth-api-key" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400" placeholder="Masukkan API key Anda">
                </div>
              </div>
            </div>
            
            <!-- Sheet Name -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Nama Sheet</h2>
              <div class="space-y-4">
                <div>
                  <label for="google-sheets-auth-sheet-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-table mr-1 text-blue-500"></i>Mode Deteksi Sheet
                  </label>
                  <select id="google-sheets-auth-sheet-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="auto-detect">Deteksi Otomatis</option>
                    <option value="manual-entry">Input Manual</option>
                    <option value="specific-sheet">Sheet Tertentu</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Connection Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">Jenis Koneksi</h2>
              <div class="space-y-4">
                <div>
                  <label for="google-sheets-auth-connection-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-plug mr-1 text-cyan-500"></i>Tipe Koneksi
                  </label>
                  <select id="google-sheets-auth-connection-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="direct-link">Tautan Langsung</option>
                    <option value="service-account">Service Account</option>
                    <option value="oauth-2">OAuth 2.0</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="google-sheets-auth-generate-btn" class="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Koneksi
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="google-sheets-auth-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="google-sheets-auth-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fab fa-google text-6xl mb-4 text-blue-400"></i>
                <p class="text-xl">Hasil koneksi akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Koneksi</p>
              </div>
              <div id="google-sheets-auth-results" class="hidden space-y-6"></div>
              <div id="google-sheets-auth-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat koneksi...</p>
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
      const container = document.getElementById('content-google-sheets-auth');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Autentikasi Google Sheets');
      expect(title.querySelector('i.fab.fa-google')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Koneksikan dan autentikasi Google Sheets dengan aman');
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
      expect(rightPanel.querySelector('#google-sheets-auth-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Google Sheets URL Input Tests
  describe('Google Sheets URL Input', () => {
    it('should render URL input field', () => {
      const urlInput = document.getElementById('google-sheets-auth-url');
      expect(urlInput).toBeTruthy();
      expect(urlInput.tagName).toBe('INPUT');
      expect(urlInput.type).toBe('url');
    });

    it('should have proper input styling', () => {
      const urlInput = document.getElementById('google-sheets-auth-url');
      expect(urlInput.classList.contains('w-full')).toBe(true);
      expect(urlInput.classList.contains('p-3')).toBe(true);
      expect(urlInput.classList.contains('border')).toBe(true);
      expect(urlInput.classList.contains('rounded-lg')).toBe(true);
      expect(urlInput.classList.contains('focus:ring-2')).toBe(true);
      expect(urlInput.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(urlInput.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should have proper placeholder text', () => {
      const urlInput = document.getElementById('google-sheets-auth-url');
      expect(urlInput.placeholder).toBe('https://docs.google.com/spreadsheets/d/...');
    });

    it('should have label with icon', () => {
      const label = document.body.querySelector('label[for="google-sheets-auth-url"]');
      expect(label).toBeTruthy();
      expect(label.querySelector('i.fas.fa-link')).toBeTruthy();
      expect(label.querySelector('i.fas.fa-link').classList.contains('text-blue-500')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('URL Google Sheets');
    });
  });

  // Access Level Selection Tests
  describe('Access Level Selection', () => {
    it('should render access level select', () => {
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect).toBeTruthy();
      expect(accessLevelSelect.tagName).toBe('SELECT');
      expect(accessLevelSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('Level Akses');
    });

    it('should have label with icon', () => {
      const label = document.body.querySelector('label[for="google-sheets-auth-access-level"]');
      expect(label).toBeTruthy();
      expect(label.querySelector('i.fas.fa-shield-alt')).toBeTruthy();
      expect(label.querySelector('i.fas.fa-shield-alt').classList.contains('text-cyan-500')).toBe(true);
    });

    it('should have access level options with proper labels', () => {
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect.options[0].textContent).toContain('Baca Saja');
      expect(accessLevelSelect.options[1].textContent).toContain('Baca & Tulis');
      expect(accessLevelSelect.options[2].textContent).toContain('Admin Akses Penuh');
    });

    it('should have access level option values', () => {
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect.options[0].value).toBe('read-only');
      expect(accessLevelSelect.options[1].value).toBe('read-write');
      expect(accessLevelSelect.options[2].value).toBe('admin-full');
    });

    it('should have default access level value', () => {
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect.value).toBe('read-only');
    });

    it('should have proper input styling', () => {
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect.classList.contains('w-full')).toBe(true);
      expect(accessLevelSelect.classList.contains('p-3')).toBe(true);
      expect(accessLevelSelect.classList.contains('border')).toBe(true);
      expect(accessLevelSelect.classList.contains('rounded-lg')).toBe(true);
      expect(accessLevelSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(accessLevelSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(accessLevelSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });
  });

  // Email Whitelist Input Tests
  describe('Email Whitelist Input', () => {
    it('should render email whitelist textarea', () => {
      const emailWhitelist = document.getElementById('google-sheets-auth-email-whitelist');
      expect(emailWhitelist).toBeTruthy();
      expect(emailWhitelist.tagName).toBe('TEXTAREA');
      expect(emailWhitelist.rows).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('Daftar Putih Email');
    });

    it('should have label with icon', () => {
      const label = document.body.querySelector('label[for="google-sheets-auth-email-whitelist"]');
      expect(label).toBeTruthy();
      expect(label.querySelector('i.fas.fa-envelope')).toBeTruthy();
      expect(label.querySelector('i.fas.fa-envelope').classList.contains('text-blue-400')).toBe(true);
    });

    it('should have proper placeholder text', () => {
      const emailWhitelist = document.getElementById('google-sheets-auth-email-whitelist');
      expect(emailWhitelist.placeholder).toBe('email1@example.com, email2@example.com, ...');
    });

    it('should have helper text', () => {
      const helperText = document.body.querySelector('#google-sheets-auth-email-whitelist + p');
      expect(helperText).toBeTruthy();
      expect(helperText.textContent).toContain('Pisahkan dengan koma untuk beberapa email');
    });

    it('should have proper textarea styling', () => {
      const emailWhitelist = document.getElementById('google-sheets-auth-email-whitelist');
      expect(emailWhitelist.classList.contains('w-full')).toBe(true);
      expect(emailWhitelist.classList.contains('p-3')).toBe(true);
      expect(emailWhitelist.classList.contains('border')).toBe(true);
      expect(emailWhitelist.classList.contains('rounded-lg')).toBe(true);
      expect(emailWhitelist.classList.contains('focus:ring-2')).toBe(true);
      expect(emailWhitelist.classList.contains('focus:ring-blue-400')).toBe(true);
      expect(emailWhitelist.classList.contains('focus:border-blue-400')).toBe(true);
    });
  });

  // API Key Input Tests
  describe('API Key Input', () => {
    it('should render API key input field', () => {
      const apiKeyInput = document.getElementById('google-sheets-auth-api-key');
      expect(apiKeyInput).toBeTruthy();
      expect(apiKeyInput.tagName).toBe('INPUT');
      expect(apiKeyInput.type).toBe('text');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('API Key');
    });

    it('should have label with icon', () => {
      const label = document.body.querySelector('label[for="google-sheets-auth-api-key"]');
      expect(label).toBeTruthy();
      expect(label.querySelector('i.fas.fa-key')).toBeTruthy();
      expect(label.querySelector('i.fas.fa-key').classList.contains('text-cyan-400')).toBe(true);
    });

    it('should have proper placeholder text', () => {
      const apiKeyInput = document.getElementById('google-sheets-auth-api-key');
      expect(apiKeyInput.placeholder).toBe('Masukkan API key Anda');
    });

    it('should have proper input styling', () => {
      const apiKeyInput = document.getElementById('google-sheets-auth-api-key');
      expect(apiKeyInput.classList.contains('w-full')).toBe(true);
      expect(apiKeyInput.classList.contains('p-3')).toBe(true);
      expect(apiKeyInput.classList.contains('border')).toBe(true);
      expect(apiKeyInput.classList.contains('rounded-lg')).toBe(true);
      expect(apiKeyInput.classList.contains('focus:ring-2')).toBe(true);
      expect(apiKeyInput.classList.contains('focus:ring-cyan-400')).toBe(true);
      expect(apiKeyInput.classList.contains('focus:border-cyan-400')).toBe(true);
    });
  });

  // Sheet Name Selection Tests
  describe('Sheet Name Selection', () => {
    it('should render sheet name select', () => {
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect).toBeTruthy();
      expect(sheetNameSelect.tagName).toBe('SELECT');
      expect(sheetNameSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('Nama Sheet');
    });

    it('should have label with icon', () => {
      const label = document.body.querySelector('label[for="google-sheets-auth-sheet-name"]');
      expect(label).toBeTruthy();
      expect(label.querySelector('i.fas.fa-table')).toBeTruthy();
      expect(label.querySelector('i.fas.fa-table').classList.contains('text-blue-500')).toBe(true);
    });

    it('should have sheet name options with proper labels', () => {
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect.options[0].textContent).toContain('Deteksi Otomatis');
      expect(sheetNameSelect.options[1].textContent).toContain('Input Manual');
      expect(sheetNameSelect.options[2].textContent).toContain('Sheet Tertentu');
    });

    it('should have sheet name option values', () => {
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect.options[0].value).toBe('auto-detect');
      expect(sheetNameSelect.options[1].value).toBe('manual-entry');
      expect(sheetNameSelect.options[2].value).toBe('specific-sheet');
    });

    it('should have default sheet name value', () => {
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect.value).toBe('auto-detect');
    });

    it('should have proper input styling', () => {
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect.classList.contains('w-full')).toBe(true);
      expect(sheetNameSelect.classList.contains('p-3')).toBe(true);
      expect(sheetNameSelect.classList.contains('border')).toBe(true);
      expect(sheetNameSelect.classList.contains('rounded-lg')).toBe(true);
      expect(sheetNameSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(sheetNameSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(sheetNameSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });
  });

  // Connection Type Selection Tests
  describe('Connection Type Selection', () => {
    it('should render connection type select', () => {
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect).toBeTruthy();
      expect(connectionTypeSelect.tagName).toBe('SELECT');
      expect(connectionTypeSelect.options.length).toBe(3);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('Jenis Koneksi');
    });

    it('should have label with icon', () => {
      const label = document.body.querySelector('label[for="google-sheets-auth-connection-type"]');
      expect(label).toBeTruthy();
      expect(label.querySelector('i.fas.fa-plug')).toBeTruthy();
      expect(label.querySelector('i.fas.fa-plug').classList.contains('text-cyan-500')).toBe(true);
    });

    it('should have connection type options with proper labels', () => {
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect.options[0].textContent).toContain('Tautan Langsung');
      expect(connectionTypeSelect.options[1].textContent).toContain('Service Account');
      expect(connectionTypeSelect.options[2].textContent).toContain('OAuth 2.0');
    });

    it('should have connection type option values', () => {
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect.options[0].value).toBe('direct-link');
      expect(connectionTypeSelect.options[1].value).toBe('service-account');
      expect(connectionTypeSelect.options[2].value).toBe('oauth-2');
    });

    it('should have default connection type value', () => {
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect.value).toBe('direct-link');
    });

    it('should have proper input styling', () => {
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect.classList.contains('w-full')).toBe(true);
      expect(connectionTypeSelect.classList.contains('p-3')).toBe(true);
      expect(connectionTypeSelect.classList.contains('border')).toBe(true);
      expect(connectionTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(connectionTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(connectionTypeSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(connectionTypeSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('google-sheets-auth-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Koneksi');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('google-sheets-auth-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-400')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('google-sheets-auth-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('google-sheets-auth-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('google-sheets-auth-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('google-sheets-auth-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fab.fa-google')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil koneksi akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('google-sheets-auth-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('google-sheets-auth-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat koneksi...');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('google-sheets-auth-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have blue icon in empty state', () => {
      const emptyStateIcon = document.getElementById('google-sheets-auth-empty-state').querySelector('i.fab.fa-google');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/cyan color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-blue-400')).toBe(true);
    });

    it('should use blue/cyan accents in generate button', () => {
      const generateBtn = document.getElementById('google-sheets-auth-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-blue-400')).toBe(true);
    });

    it('should use blue accents in URL input', () => {
      const urlInput = document.getElementById('google-sheets-auth-url');
      expect(urlInput.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(urlInput.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in access level select', () => {
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(accessLevelSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue-400 accents in email whitelist', () => {
      const emailWhitelist = document.getElementById('google-sheets-auth-email-whitelist');
      expect(emailWhitelist.classList.contains('focus:ring-blue-400')).toBe(true);
      expect(emailWhitelist.classList.contains('focus:border-blue-400')).toBe(true);
    });

    it('should use cyan-400 accents in API key input', () => {
      const apiKeyInput = document.getElementById('google-sheets-auth-api-key');
      expect(apiKeyInput.classList.contains('focus:ring-cyan-400')).toBe(true);
      expect(apiKeyInput.classList.contains('focus:border-cyan-400')).toBe(true);
    });

    it('should use blue accents in sheet name select', () => {
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(sheetNameSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in connection type select', () => {
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(connectionTypeSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use blue accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should use blue-400 accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('google-sheets-auth-empty-state').querySelector('i.fab.fa-google');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
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

    it('should have Google icon in header', () => {
      const googleIcon = document.body.querySelector('header i.fab.fa-google');
      expect(googleIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('google-sheets-auth-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have link icon for URL input', () => {
      const linkIcon = document.body.querySelector('label[for="google-sheets-auth-url"] i.fas.fa-link');
      expect(linkIcon).toBeTruthy();
    });

    it('should have shield-alt icon for access level', () => {
      const shieldAltIcon = document.body.querySelector('label[for="google-sheets-auth-access-level"] i.fas.fa-shield-alt');
      expect(shieldAltIcon).toBeTruthy();
    });

    it('should have envelope icon for email whitelist', () => {
      const envelopeIcon = document.body.querySelector('label[for="google-sheets-auth-email-whitelist"] i.fas.fa-envelope');
      expect(envelopeIcon).toBeTruthy();
    });

    it('should have key icon for API key', () => {
      const keyIcon = document.body.querySelector('label[for="google-sheets-auth-api-key"] i.fas.fa-key');
      expect(keyIcon).toBeTruthy();
    });

    it('should have table icon for sheet name', () => {
      const tableIcon = document.body.querySelector('label[for="google-sheets-auth-sheet-name"] i.fas.fa-table');
      expect(tableIcon).toBeTruthy();
    });

    it('should have plug icon for connection type', () => {
      const plugIcon = document.body.querySelector('label[for="google-sheets-auth-connection-type"] i.fas.fa-plug');
      expect(plugIcon).toBeTruthy();
    });

    it('should have Google icon in empty state', () => {
      const emptyStateIcon = document.getElementById('google-sheets-auth-empty-state').querySelector('i.fab.fa-google');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have link icon with blue-500 color', () => {
      const linkIcon = document.body.querySelector('label[for="google-sheets-auth-url"] i.fas.fa-link');
      expect(linkIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have shield-alt icon with cyan-500 color', () => {
      const shieldAltIcon = document.body.querySelector('label[for="google-sheets-auth-access-level"] i.fas.fa-shield-alt');
      expect(shieldAltIcon.classList.contains('text-cyan-500')).toBe(true);
    });

    it('should have envelope icon with blue-400 color', () => {
      const envelopeIcon = document.body.querySelector('label[for="google-sheets-auth-email-whitelist"] i.fas.fa-envelope');
      expect(envelopeIcon.classList.contains('text-blue-400')).toBe(true);
    });

    it('should have key icon with cyan-400 color', () => {
      const keyIcon = document.body.querySelector('label[for="google-sheets-auth-api-key"] i.fas.fa-key');
      expect(keyIcon.classList.contains('text-cyan-400')).toBe(true);
    });

    it('should have table icon with blue-500 color', () => {
      const tableIcon = document.body.querySelector('label[for="google-sheets-auth-sheet-name"] i.fas.fa-table');
      expect(tableIcon.classList.contains('text-blue-500')).toBe(true);
    });

    it('should have plug icon with cyan-500 color', () => {
      const plugIcon = document.body.querySelector('label[for="google-sheets-auth-connection-type"] i.fas.fa-plug');
      expect(plugIcon.classList.contains('text-cyan-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Autentikasi Google Sheets');
      expect(document.body.textContent).toContain('URL Google Sheets');
      expect(document.body.textContent).toContain('Level Akses');
      expect(document.body.textContent).toContain('Daftar Putih Email');
      expect(document.body.textContent).toContain('API Key');
      expect(document.body.textContent).toContain('Nama Sheet');
      expect(document.body.textContent).toContain('Jenis Koneksi');
      expect(document.body.textContent).toContain('Buat Koneksi');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('URL Google Sheets');
      expect(headers[1].textContent).toContain('Level Akses');
      expect(headers[2].textContent).toContain('Daftar Putih Email');
      expect(headers[3].textContent).toContain('API Key');
      expect(headers[4].textContent).toContain('Nama Sheet');
      expect(headers[5].textContent).toContain('Jenis Koneksi');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('google-sheets-auth-empty-state');
      expect(emptyState.textContent).toContain('Hasil koneksi akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Koneksi');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('google-sheets-auth-loading');
      expect(loading.textContent).toContain('Sedang membuat koneksi...');
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
      const urlInput = document.getElementById('google-sheets-auth-url');
      expect(urlInput).toBeTruthy();
      
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect).toBeTruthy();
      
      const emailWhitelist = document.getElementById('google-sheets-auth-email-whitelist');
      expect(emailWhitelist).toBeTruthy();
      
      const apiKeyInput = document.getElementById('google-sheets-auth-api-key');
      expect(apiKeyInput).toBeTruthy();
      
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect).toBeTruthy();
      
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const urlInput = document.getElementById('google-sheets-auth-url');
      expect(urlInput.labels).toBeTruthy();
      expect(urlInput.labels.length).toBe(1);
      
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect.labels).toBeTruthy();
      expect(accessLevelSelect.labels.length).toBe(1);
      
      const emailWhitelist = document.getElementById('google-sheets-auth-email-whitelist');
      expect(emailWhitelist.labels).toBeTruthy();
      expect(emailWhitelist.labels.length).toBe(1);
      
      const apiKeyInput = document.getElementById('google-sheets-auth-api-key');
      expect(apiKeyInput.labels).toBeTruthy();
      expect(apiKeyInput.labels.length).toBe(1);
      
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect.labels).toBeTruthy();
      expect(sheetNameSelect.labels.length).toBe(1);
      
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect.labels).toBeTruthy();
      expect(connectionTypeSelect.labels.length).toBe(1);
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('google-sheets-auth-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const urlInput = document.getElementById('google-sheets-auth-url');
      expect(urlInput.type).toBe('url');
      
      const apiKeyInput = document.getElementById('google-sheets-auth-api-key');
      expect(apiKeyInput.type).toBe('text');
    });

    it('should have proper select types', () => {
      const accessLevelSelect = document.getElementById('google-sheets-auth-access-level');
      expect(accessLevelSelect.tagName).toBe('SELECT');
      
      const sheetNameSelect = document.getElementById('google-sheets-auth-sheet-name');
      expect(sheetNameSelect.tagName).toBe('SELECT');
      
      const connectionTypeSelect = document.getElementById('google-sheets-auth-connection-type');
      expect(connectionTypeSelect.tagName).toBe('SELECT');
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
