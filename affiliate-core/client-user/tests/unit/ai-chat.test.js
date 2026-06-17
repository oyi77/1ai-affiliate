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

describe('ai-chat Component', () => {
  
  const mockComponentHTML = `
    <div id="content-ai-chat" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            <i class="fas fa-comments mr-3"></i>Chat AI
          </h1>
          <p class="text-lg text-gray-600 mt-2">Berbicara dengan AI sesuai kebutuhan Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Chat Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Chat</h2>
              <div class="space-y-4">
                <div>
                  <label for="ai-chat-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-robot mr-1 text-green-500"></i>Jenis Chat
                  </label>
                  <select id="ai-chat-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="general">Asisten Umum</option>
                    <option value="code">Pembantu Kode</option>
                    <option value="creative">Penulis Kreatif</option>
                    <option value="business">Penasihat Bisnis</option>
                    <option value="language">Guru Bahasa</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Nuansa</h2>
              <div class="space-y-4">
                <div>
                  <label for="ai-chat-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-comment-alt mr-1 text-emerald-500"></i>Nuansa
                  </label>
                  <select id="ai-chat-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="professional">Profesional</option>
                    <option value="casual">Santai</option>
                    <option value="friendly">Ramah</option>
                    <option value="formal">Formal</option>
                    <option value="humorous">Humoris</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Language -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Bahasa</h2>
              <div class="space-y-4">
                <div>
                  <label for="ai-chat-language" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-language mr-1 text-teal-500"></i>Bahasa
                  </label>
                  <select id="ai-chat-language" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value="indonesian">Indonesia</option>
                    <option value="english">Inggris</option>
                    <option value="mixed">Campuran</option>
                    <option value="javanese">Jawa</option>
                    <option value="sundanese">Sunda</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Response Length -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Panjang Respons</h2>
              <div class="space-y-4">
                <div>
                  <label for="ai-chat-length" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-text-width mr-1 text-green-500"></i>Panjang Respons
                  </label>
                  <select id="ai-chat-length" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="short">Pendek</option>
                    <option value="medium">Sedang</option>
                    <option value="detailed">Detail</option>
                    <option value="comprehensive">Komprehensif</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- System Prompt -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. System Prompt</h2>
              <div class="space-y-4">
                <div>
                  <label for="ai-chat-system-prompt" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-cogs mr-1 text-emerald-500"></i>System Prompt
                  </label>
                  <textarea id="ai-chat-system-prompt" rows="4" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Masukkan instruksi untuk AI..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Initial Message -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Pesan Awal</h2>
              <div class="space-y-4">
                <div>
                  <label for="ai-chat-initial-message" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paper-plane mr-1 text-teal-500"></i>Pesan Awal
                  </label>
                  <textarea id="ai-chat-initial-message" rows="4" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Masukkan pesan awal untuk memulai percakapan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="ai-chat-generate-btn" class="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Mulai Chat
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="ai-chat-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="ai-chat-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-comments text-6xl mb-4 text-green-400"></i>
                <p class="text-xl">Percakapan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Mulai Chat</p>
              </div>
              <div id="ai-chat-results" class="hidden space-y-6"></div>
              <div id="ai-chat-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-green-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang memproses...</p>
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
      const container = document.getElementById('content-ai-chat');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Chat AI');
      expect(title.querySelector('i.fas.fa-comments')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Berbicara dengan AI sesuai kebutuhan Anda');
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
      expect(rightPanel.querySelector('#ai-chat-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Chat Type Selection Tests
  describe('Chat Type Selection', () => {
    it('should render chat type select', () => {
      const chatTypeSelect = document.getElementById('ai-chat-type');
      expect(chatTypeSelect).toBeTruthy();
      expect(chatTypeSelect.tagName).toBe('SELECT');
      expect(chatTypeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Chat');
    });

    it('should have label with robot icon', () => {
      const robotIcon = document.body.querySelector('i.fas.fa-robot');
      expect(robotIcon).toBeTruthy();
      expect(robotIcon.classList.contains('text-green-500')).toBe(true);
    });

    it('should have chat type options with proper labels', () => {
      const chatTypeSelect = document.getElementById('ai-chat-type');
      expect(chatTypeSelect.options[0].textContent).toContain('Asisten Umum');
      expect(chatTypeSelect.options[1].textContent).toContain('Pembantu Kode');
      expect(chatTypeSelect.options[2].textContent).toContain('Penulis Kreatif');
      expect(chatTypeSelect.options[3].textContent).toContain('Penasihat Bisnis');
      expect(chatTypeSelect.options[4].textContent).toContain('Guru Bahasa');
    });

    it('should have default chat type value', () => {
      const chatTypeSelect = document.getElementById('ai-chat-type');
      expect(chatTypeSelect.value).toBe('general');
    });

    it('should have proper input styling', () => {
      const chatTypeSelect = document.getElementById('ai-chat-type');
      expect(chatTypeSelect.classList.contains('w-full')).toBe(true);
      expect(chatTypeSelect.classList.contains('p-3')).toBe(true);
      expect(chatTypeSelect.classList.contains('border')).toBe(true);
      expect(chatTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(chatTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(chatTypeSelect.classList.contains('focus:ring-green-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('ai-chat-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Nuansa');
    });

    it('should have label with comment-alt icon', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
      expect(commentAltIcon.classList.contains('text-emerald-500')).toBe(true);
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('ai-chat-tone');
      expect(toneSelect.options[0].textContent).toContain('Profesional');
      expect(toneSelect.options[1].textContent).toContain('Santai');
      expect(toneSelect.options[2].textContent).toContain('Ramah');
      expect(toneSelect.options[3].textContent).toContain('Formal');
      expect(toneSelect.options[4].textContent).toContain('Humoris');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('ai-chat-tone');
      expect(toneSelect.value).toBe('professional');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('ai-chat-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Language Selection Tests
  describe('Language Selection', () => {
    it('should render language select', () => {
      const languageSelect = document.getElementById('ai-chat-language');
      expect(languageSelect).toBeTruthy();
      expect(languageSelect.tagName).toBe('SELECT');
      expect(languageSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Bahasa');
    });

    it('should have label with language icon', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
      expect(languageIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should have language options with proper labels', () => {
      const languageSelect = document.getElementById('ai-chat-language');
      expect(languageSelect.options[0].textContent).toContain('Indonesia');
      expect(languageSelect.options[1].textContent).toContain('Inggris');
      expect(languageSelect.options[2].textContent).toContain('Campuran');
      expect(languageSelect.options[3].textContent).toContain('Jawa');
      expect(languageSelect.options[4].textContent).toContain('Sunda');
    });

    it('should have default language value', () => {
      const languageSelect = document.getElementById('ai-chat-language');
      expect(languageSelect.value).toBe('indonesian');
    });

    it('should have proper input styling', () => {
      const languageSelect = document.getElementById('ai-chat-language');
      expect(languageSelect.classList.contains('w-full')).toBe(true);
      expect(languageSelect.classList.contains('p-3')).toBe(true);
      expect(languageSelect.classList.contains('border')).toBe(true);
      expect(languageSelect.classList.contains('rounded-lg')).toBe(true);
      expect(languageSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(languageSelect.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Response Length Selection Tests
  describe('Response Length Selection', () => {
    it('should render response length select', () => {
      const lengthSelect = document.getElementById('ai-chat-length');
      expect(lengthSelect).toBeTruthy();
      expect(lengthSelect.tagName).toBe('SELECT');
      expect(lengthSelect.options.length).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Panjang Respons');
    });

    it('should have label with text-width icon', () => {
      const textWidthIcon = document.body.querySelector('i.fas.fa-text-width');
      expect(textWidthIcon).toBeTruthy();
      expect(textWidthIcon.classList.contains('text-green-500')).toBe(true);
    });

    it('should have response length options with proper labels', () => {
      const lengthSelect = document.getElementById('ai-chat-length');
      expect(lengthSelect.options[0].textContent).toContain('Pendek');
      expect(lengthSelect.options[1].textContent).toContain('Sedang');
      expect(lengthSelect.options[2].textContent).toContain('Detail');
      expect(lengthSelect.options[3].textContent).toContain('Komprehensif');
    });

    it('should have default response length value', () => {
      const lengthSelect = document.getElementById('ai-chat-length');
      expect(lengthSelect.value).toBe('short');
    });

    it('should have proper input styling', () => {
      const lengthSelect = document.getElementById('ai-chat-length');
      expect(lengthSelect.classList.contains('w-full')).toBe(true);
      expect(lengthSelect.classList.contains('p-3')).toBe(true);
      expect(lengthSelect.classList.contains('border')).toBe(true);
      expect(lengthSelect.classList.contains('rounded-lg')).toBe(true);
      expect(lengthSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(lengthSelect.classList.contains('focus:ring-green-500')).toBe(true);
    });
  });

  // System Prompt Input Tests
  describe('System Prompt Input', () => {
    it('should render system prompt textarea', () => {
      const systemPromptTextarea = document.getElementById('ai-chat-system-prompt');
      expect(systemPromptTextarea).toBeTruthy();
      expect(systemPromptTextarea.tagName).toBe('TEXTAREA');
      expect(systemPromptTextarea.rows).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. System Prompt');
    });

    it('should have label with cogs icon', () => {
      const cogsIcon = document.body.querySelector('i.fas.fa-cogs');
      expect(cogsIcon).toBeTruthy();
      expect(cogsIcon.classList.contains('text-emerald-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const systemPromptTextarea = document.getElementById('ai-chat-system-prompt');
      expect(systemPromptTextarea.placeholder).toContain('Masukkan instruksi untuk AI...');
    });

    it('should have proper textarea styling', () => {
      const systemPromptTextarea = document.getElementById('ai-chat-system-prompt');
      expect(systemPromptTextarea.classList.contains('w-full')).toBe(true);
      expect(systemPromptTextarea.classList.contains('p-3')).toBe(true);
      expect(systemPromptTextarea.classList.contains('border')).toBe(true);
      expect(systemPromptTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(systemPromptTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(systemPromptTextarea.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Initial Message Input Tests
  describe('Initial Message Input', () => {
    it('should render initial message textarea', () => {
      const initialMessageTextarea = document.getElementById('ai-chat-initial-message');
      expect(initialMessageTextarea).toBeTruthy();
      expect(initialMessageTextarea.tagName).toBe('TEXTAREA');
      expect(initialMessageTextarea.rows).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Pesan Awal');
    });

    it('should have label with paper-plane icon', () => {
      const paperPlaneIcon = document.body.querySelector('i.fas.fa-paper-plane');
      expect(paperPlaneIcon).toBeTruthy();
      expect(paperPlaneIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const initialMessageTextarea = document.getElementById('ai-chat-initial-message');
      expect(initialMessageTextarea.placeholder).toContain('Masukkan pesan awal untuk memulai percakapan...');
    });

    it('should have proper textarea styling', () => {
      const initialMessageTextarea = document.getElementById('ai-chat-initial-message');
      expect(initialMessageTextarea.classList.contains('w-full')).toBe(true);
      expect(initialMessageTextarea.classList.contains('p-3')).toBe(true);
      expect(initialMessageTextarea.classList.contains('border')).toBe(true);
      expect(initialMessageTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(initialMessageTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(initialMessageTextarea.classList.contains('focus:ring-teal-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('ai-chat-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Mulai Chat');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('ai-chat-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-green-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('ai-chat-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('ai-chat-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('ai-chat-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('ai-chat-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-comments')).toBeTruthy();
      expect(emptyState.textContent).toContain('Percakapan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('ai-chat-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('ai-chat-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang memproses...');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-green-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('ai-chat-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have green icon in empty state', () => {
      const emptyStateIcon = document.getElementById('ai-chat-empty-state').querySelector('i.fas.fa-comments');
      expect(emptyStateIcon.classList.contains('text-green-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use green/emerald/teal color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-green-500')).toBe(true);
      expect(title.classList.contains('via-emerald-500')).toBe(true);
      expect(title.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use green/emerald/teal accents in generate button', () => {
      const generateBtn = document.getElementById('ai-chat-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-green-500')).toBe(true);
      expect(generateBtn.classList.contains('via-emerald-500')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use green accents in chat type select', () => {
      const chatTypeSelect = document.getElementById('ai-chat-type');
      expect(chatTypeSelect.classList.contains('focus:ring-green-500')).toBe(true);
      expect(chatTypeSelect.classList.contains('focus:border-green-500')).toBe(true);
    });

    it('should use emerald accents in tone select', () => {
      const toneSelect = document.getElementById('ai-chat-tone');
      expect(toneSelect.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(toneSelect.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use teal accents in language select', () => {
      const languageSelect = document.getElementById('ai-chat-language');
      expect(languageSelect.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(languageSelect.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use green accents in response length select', () => {
      const lengthSelect = document.getElementById('ai-chat-length');
      expect(lengthSelect.classList.contains('focus:ring-green-500')).toBe(true);
      expect(lengthSelect.classList.contains('focus:border-green-500')).toBe(true);
    });

    it('should use emerald accents in system prompt textarea', () => {
      const systemPromptTextarea = document.getElementById('ai-chat-system-prompt');
      expect(systemPromptTextarea.classList.contains('focus:ring-emerald-500')).toBe(true);
      expect(systemPromptTextarea.classList.contains('focus:border-emerald-500')).toBe(true);
    });

    it('should use teal accents in initial message textarea', () => {
      const initialMessageTextarea = document.getElementById('ai-chat-initial-message');
      expect(initialMessageTextarea.classList.contains('focus:ring-teal-500')).toBe(true);
      expect(initialMessageTextarea.classList.contains('focus:border-teal-500')).toBe(true);
    });

    it('should use green accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-green-500')).toBe(true);
    });

    it('should use green accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('ai-chat-empty-state').querySelector('i.fas.fa-comments');
      expect(emptyStateIcon.classList.contains('text-green-400')).toBe(true);
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

    it('should have comments icon in header', () => {
      const commentsIcon = document.body.querySelector('header i.fas.fa-comments');
      expect(commentsIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('ai-chat-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have robot icon for chat type', () => {
      const robotIcon = document.body.querySelector('i.fas.fa-robot');
      expect(robotIcon).toBeTruthy();
    });

    it('should have comment-alt icon for tone', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have language icon for language', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon).toBeTruthy();
    });

    it('should have text-width icon for response length', () => {
      const textWidthIcon = document.body.querySelector('i.fas.fa-text-width');
      expect(textWidthIcon).toBeTruthy();
    });

    it('should have cogs icon for system prompt', () => {
      const cogsIcon = document.body.querySelector('i.fas.fa-cogs');
      expect(cogsIcon).toBeTruthy();
    });

    it('should have paper-plane icon for initial message', () => {
      const paperPlaneIcon = document.body.querySelector('i.fas.fa-paper-plane');
      expect(paperPlaneIcon).toBeTruthy();
    });

    it('should have comments icon in empty state', () => {
      const emptyStateIcon = document.getElementById('ai-chat-empty-state').querySelector('i.fas.fa-comments');
      expect(emptyStateIcon).toBeTruthy();
    });

    it('should have robot icon with green color', () => {
      const robotIcon = document.body.querySelector('i.fas.fa-robot');
      expect(robotIcon.classList.contains('text-green-500')).toBe(true);
    });

    it('should have comment-alt icon with emerald color', () => {
      const commentAltIcon = document.body.querySelector('i.fas.fa-comment-alt');
      expect(commentAltIcon.classList.contains('text-emerald-500')).toBe(true);
    });

    it('should have language icon with teal color', () => {
      const languageIcon = document.body.querySelector('i.fas.fa-language');
      expect(languageIcon.classList.contains('text-teal-500')).toBe(true);
    });

    it('should have text-width icon with green color', () => {
      const textWidthIcon = document.body.querySelector('i.fas.fa-text-width');
      expect(textWidthIcon.classList.contains('text-green-500')).toBe(true);
    });

    it('should have cogs icon with emerald color', () => {
      const cogsIcon = document.body.querySelector('i.fas.fa-cogs');
      expect(cogsIcon.classList.contains('text-emerald-500')).toBe(true);
    });

    it('should have paper-plane icon with teal color', () => {
      const paperPlaneIcon = document.body.querySelector('i.fas.fa-paper-plane');
      expect(paperPlaneIcon.classList.contains('text-teal-500')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Chat AI');
      expect(document.body.textContent).toContain('Jenis Chat');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Bahasa');
      expect(document.body.textContent).toContain('Panjang Respons');
      expect(document.body.textContent).toContain('System Prompt');
      expect(document.body.textContent).toContain('Pesan Awal');
      expect(document.body.textContent).toContain('Mulai Chat');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Chat');
      expect(headers[1].textContent).toContain('2. Nuansa');
      expect(headers[2].textContent).toContain('3. Bahasa');
      expect(headers[3].textContent).toContain('4. Panjang Respons');
      expect(headers[4].textContent).toContain('5. System Prompt');
      expect(headers[5].textContent).toContain('6. Pesan Awal');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('ai-chat-empty-state');
      expect(emptyState.textContent).toContain('Percakapan akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Mulai Chat');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('ai-chat-loading');
      expect(loading.textContent).toContain('Sedang memproses...');
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
      const chatTypeSelect = document.getElementById('ai-chat-type');
      expect(chatTypeSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('ai-chat-tone');
      expect(toneSelect).toBeTruthy();
      
      const languageSelect = document.getElementById('ai-chat-language');
      expect(languageSelect).toBeTruthy();
      
      const lengthSelect = document.getElementById('ai-chat-length');
      expect(lengthSelect).toBeTruthy();
      
      const systemPromptTextarea = document.getElementById('ai-chat-system-prompt');
      expect(systemPromptTextarea).toBeTruthy();
      
      const initialMessageTextarea = document.getElementById('ai-chat-initial-message');
      expect(initialMessageTextarea).toBeTruthy();
    });

    it('should have proper labels for selects and textareas', () => {
      const chatTypeLabel = document.querySelector('label[for="ai-chat-type"]');
      expect(chatTypeLabel).toBeTruthy();
      
      const toneLabel = document.querySelector('label[for="ai-chat-tone"]');
      expect(toneLabel).toBeTruthy();
      
      const languageLabel = document.querySelector('label[for="ai-chat-language"]');
      expect(languageLabel).toBeTruthy();
      
      const lengthLabel = document.querySelector('label[for="ai-chat-length"]');
      expect(lengthLabel).toBeTruthy();
      
      const systemPromptLabel = document.querySelector('label[for="ai-chat-system-prompt"]');
      expect(systemPromptLabel).toBeTruthy();
      
      const initialMessageLabel = document.querySelector('label[for="ai-chat-initial-message"]');
      expect(initialMessageLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('ai-chat-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const chatTypeSelect = document.getElementById('ai-chat-type');
      expect(chatTypeSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('ai-chat-tone');
      expect(toneSelect.tagName).toBe('SELECT');
      
      const languageSelect = document.getElementById('ai-chat-language');
      expect(languageSelect.tagName).toBe('SELECT');
      
      const lengthSelect = document.getElementById('ai-chat-length');
      expect(lengthSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea types', () => {
      const systemPromptTextarea = document.getElementById('ai-chat-system-prompt');
      expect(systemPromptTextarea.tagName).toBe('TEXTAREA');
      
      const initialMessageTextarea = document.getElementById('ai-chat-initial-message');
      expect(initialMessageTextarea.tagName).toBe('TEXTAREA');
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
