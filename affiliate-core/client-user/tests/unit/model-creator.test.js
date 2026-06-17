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

describe('model-creator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-model-creator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
            <i class="fas fa-robot mr-3"></i>Pembuat Model AI
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konfigurasi model AI dengan mudah menggunakan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Model Name -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-tag mr-2 text-purple-500"></i>Nama Model
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="model-creator-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-signature mr-1 text-purple-500"></i>Nama Model AI
                  </label>
                  <input type="text" id="model-creator-name" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Contoh: Model Analisis Sentimen">
                </div>
              </div>
            </div>
            
            <!-- Model Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-microchip mr-2 text-indigo-500"></i>Tipe Model
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="model-creator-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-cogs mr-1 text-indigo-500"></i>Tipe Model AI
                  </label>
                  <select id="model-creator-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="text-generation">Text Generation</option>
                    <option value="image-generation">Image Generation</option>
                    <option value="code-generation">Code Generation</option>
                    <option value="voice-synthesis">Voice Synthesis</option>
                    <option value="multimodal">Multimodal</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Description -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-align-left mr-2 text-purple-500"></i>Deskripsi
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="model-creator-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paragraph mr-1 text-purple-500"></i>Deskripsi Model
                  </label>
                  <textarea id="model-creator-description" rows="4" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Jelaskan fungsi dan tujuan model AI ini..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Training Data Source -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-database mr-2 text-indigo-500"></i>Sumber Data Training
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="model-creator-data-source" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-server mr-1 text-indigo-500"></i>Sumber Data
                  </label>
                  <select id="model-creator-data-source" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="public-dataset">Public Dataset</option>
                    <option value="custom-dataset">Custom Dataset</option>
                    <option value="web-scraping">Web Scraping</option>
                    <option value="api-integration">API Integration</option>
                    <option value="pre-trained">Pre-trained</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Parameters -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-sliders-h mr-2 text-purple-500"></i>Parameter
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="model-creator-parameters" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-code mr-1 text-purple-500"></i>Parameter Model (JSON)
                  </label>
                  <textarea id="model-creator-parameters" rows="6" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm" placeholder='{
  "learning_rate": 0.001,
  "batch_size": 32,
  "epochs": 100,
  "model_size": "large"
}'></textarea>
                </div>
              </div>
            </div>
            
            <!-- Output Format -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-file-export mr-2 text-indigo-500"></i>Format Output
              </h2>
              <div class="space-y-4">
                <div>
                  <label for="model-creator-output-format" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-file-code mr-1 text-indigo-500"></i>Format Output Model
                  </label>
                  <select id="model-creator-output-format" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="json">JSON</option>
                    <option value="yaml">YAML</option>
                    <option value="python">Python</option>
                    <option value="onnx">ONNX</option>
                    <option value="torchscript">TorchScript</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="model-creator-generate-btn" class="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Model AI
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="model-creator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="model-creator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-robot text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil konfigurasi model akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Model AI</p>
              </div>
              <div id="model-creator-results" class="hidden space-y-6"></div>
              <div id="model-creator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat model AI...</p>
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
      const container = document.getElementById('content-model-creator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Pembuat Model AI');
      expect(title.querySelector('i.fas.fa-robot')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konfigurasi model AI dengan mudah menggunakan AI');
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
      expect(rightPanel.querySelector('#model-creator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Model Name Input Tests
  describe('Model Name Input', () => {
    it('should render model name input', () => {
      const nameInput = document.getElementById('model-creator-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.tagName).toBe('INPUT');
      expect(nameInput.type).toBe('text');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('Nama Model');
    });

    it('should have label with icon', () => {
      const signatureIcon = document.body.querySelector('i.fas.fa-signature');
      expect(signatureIcon).toBeTruthy();
    });

    it('should have proper input styling', () => {
      const nameInput = document.getElementById('model-creator-name');
      expect(nameInput.classList.contains('w-full')).toBe(true);
      expect(nameInput.classList.contains('p-3')).toBe(true);
      expect(nameInput.classList.contains('border')).toBe(true);
      expect(nameInput.classList.contains('rounded-lg')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-2')).toBe(true);
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const nameInput = document.getElementById('model-creator-name');
      expect(nameInput.placeholder).toContain('Contoh: Model Analisis Sentimen');
    });
  });

  // Model Type Selection Tests
  describe('Model Type Selection', () => {
    it('should render model type select', () => {
      const typeSelect = document.getElementById('model-creator-type');
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.tagName).toBe('SELECT');
      expect(typeSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('Tipe Model');
    });

    it('should have label with icon', () => {
      const cogsIcon = document.body.querySelector('i.fas.fa-cogs');
      expect(cogsIcon).toBeTruthy();
    });

    it('should have model type options with proper labels', () => {
      const typeSelect = document.getElementById('model-creator-type');
      expect(typeSelect.options[0].textContent).toContain('Text Generation');
      expect(typeSelect.options[1].textContent).toContain('Image Generation');
      expect(typeSelect.options[2].textContent).toContain('Code Generation');
      expect(typeSelect.options[3].textContent).toContain('Voice Synthesis');
      expect(typeSelect.options[4].textContent).toContain('Multimodal');
    });

    it('should have default model type value', () => {
      const typeSelect = document.getElementById('model-creator-type');
      expect(typeSelect.value).toBe('text-generation');
    });

    it('should have proper input styling', () => {
      const typeSelect = document.getElementById('model-creator-type');
      expect(typeSelect.classList.contains('w-full')).toBe(true);
      expect(typeSelect.classList.contains('p-3')).toBe(true);
      expect(typeSelect.classList.contains('border')).toBe(true);
      expect(typeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(typeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Description Input Tests
  describe('Description Input', () => {
    it('should render description textarea', () => {
      const descriptionTextarea = document.getElementById('model-creator-description');
      expect(descriptionTextarea).toBeTruthy();
      expect(descriptionTextarea.tagName).toBe('TEXTAREA');
      expect(descriptionTextarea.rows).toBe(4);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('Deskripsi');
    });

    it('should have label with icon', () => {
      const paragraphIcon = document.body.querySelector('i.fas.fa-paragraph');
      expect(paragraphIcon).toBeTruthy();
    });

    it('should have proper textarea styling', () => {
      const descriptionTextarea = document.getElementById('model-creator-description');
      expect(descriptionTextarea.classList.contains('w-full')).toBe(true);
      expect(descriptionTextarea.classList.contains('p-3')).toBe(true);
      expect(descriptionTextarea.classList.contains('border')).toBe(true);
      expect(descriptionTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(descriptionTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(descriptionTextarea.classList.contains('focus:ring-purple-500')).toBe(true);
    });

    it('should have placeholder text', () => {
      const descriptionTextarea = document.getElementById('model-creator-description');
      expect(descriptionTextarea.placeholder).toContain('Jelaskan fungsi dan tujuan model AI ini');
    });
  });

  // Training Data Source Selection Tests
  describe('Training Data Source Selection', () => {
    it('should render data source select', () => {
      const dataSourceSelect = document.getElementById('model-creator-data-source');
      expect(dataSourceSelect).toBeTruthy();
      expect(dataSourceSelect.tagName).toBe('SELECT');
      expect(dataSourceSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('Sumber Data Training');
    });

    it('should have label with icon', () => {
      const serverIcon = document.body.querySelector('i.fas.fa-server');
      expect(serverIcon).toBeTruthy();
    });

    it('should have data source options with proper labels', () => {
      const dataSourceSelect = document.getElementById('model-creator-data-source');
      expect(dataSourceSelect.options[0].textContent).toContain('Public Dataset');
      expect(dataSourceSelect.options[1].textContent).toContain('Custom Dataset');
      expect(dataSourceSelect.options[2].textContent).toContain('Web Scraping');
      expect(dataSourceSelect.options[3].textContent).toContain('API Integration');
      expect(dataSourceSelect.options[4].textContent).toContain('Pre-trained');
    });

    it('should have default data source value', () => {
      const dataSourceSelect = document.getElementById('model-creator-data-source');
      expect(dataSourceSelect.value).toBe('public-dataset');
    });

    it('should have proper input styling', () => {
      const dataSourceSelect = document.getElementById('model-creator-data-source');
      expect(dataSourceSelect.classList.contains('w-full')).toBe(true);
      expect(dataSourceSelect.classList.contains('p-3')).toBe(true);
      expect(dataSourceSelect.classList.contains('border')).toBe(true);
      expect(dataSourceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(dataSourceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(dataSourceSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Parameters Input Tests
  describe('Parameters Input', () => {
    it('should render parameters textarea', () => {
      const parametersTextarea = document.getElementById('model-creator-parameters');
      expect(parametersTextarea).toBeTruthy();
      expect(parametersTextarea.tagName).toBe('TEXTAREA');
      expect(parametersTextarea.rows).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('Parameter');
    });

    it('should have label with icon', () => {
      const codeIcon = document.body.querySelector('i.fas.fa-code');
      expect(codeIcon).toBeTruthy();
    });

    it('should have proper textarea styling', () => {
      const parametersTextarea = document.getElementById('model-creator-parameters');
      expect(parametersTextarea.classList.contains('w-full')).toBe(true);
      expect(parametersTextarea.classList.contains('p-3')).toBe(true);
      expect(parametersTextarea.classList.contains('border')).toBe(true);
      expect(parametersTextarea.classList.contains('rounded-lg')).toBe(true);
      expect(parametersTextarea.classList.contains('focus:ring-2')).toBe(true);
      expect(parametersTextarea.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(parametersTextarea.classList.contains('font-mono')).toBe(true);
      expect(parametersTextarea.classList.contains('text-sm')).toBe(true);
    });

    it('should have JSON placeholder text', () => {
      const parametersTextarea = document.getElementById('model-creator-parameters');
      expect(parametersTextarea.placeholder).toContain('learning_rate');
      expect(parametersTextarea.placeholder).toContain('batch_size');
      expect(parametersTextarea.placeholder).toContain('epochs');
      expect(parametersTextarea.placeholder).toContain('model_size');
    });
  });

  // Output Format Selection Tests
  describe('Output Format Selection', () => {
    it('should render output format select', () => {
      const outputFormatSelect = document.getElementById('model-creator-output-format');
      expect(outputFormatSelect).toBeTruthy();
      expect(outputFormatSelect.tagName).toBe('SELECT');
      expect(outputFormatSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('Format Output');
    });

    it('should have label with icon', () => {
      const fileCodeIcon = document.body.querySelector('i.fas.fa-file-code');
      expect(fileCodeIcon).toBeTruthy();
    });

    it('should have output format options with proper labels', () => {
      const outputFormatSelect = document.getElementById('model-creator-output-format');
      expect(outputFormatSelect.options[0].textContent).toContain('JSON');
      expect(outputFormatSelect.options[1].textContent).toContain('YAML');
      expect(outputFormatSelect.options[2].textContent).toContain('Python');
      expect(outputFormatSelect.options[3].textContent).toContain('ONNX');
      expect(outputFormatSelect.options[4].textContent).toContain('TorchScript');
    });

    it('should have default output format value', () => {
      const outputFormatSelect = document.getElementById('model-creator-output-format');
      expect(outputFormatSelect.value).toBe('json');
    });

    it('should have proper input styling', () => {
      const outputFormatSelect = document.getElementById('model-creator-output-format');
      expect(outputFormatSelect.classList.contains('w-full')).toBe(true);
      expect(outputFormatSelect.classList.contains('p-3')).toBe(true);
      expect(outputFormatSelect.classList.contains('border')).toBe(true);
      expect(outputFormatSelect.classList.contains('rounded-lg')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('model-creator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Model AI');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('model-creator-generate-btn');
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
      const generateBtn = document.getElementById('model-creator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('model-creator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('model-creator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('model-creator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-robot')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil konfigurasi model akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('model-creator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('model-creator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat model AI');
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
      const emptyState = document.getElementById('model-creator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have purple icon in empty state', () => {
      const emptyStateIcon = document.getElementById('model-creator-empty-state').querySelector('i.fas.fa-robot');
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
      const generateBtn = document.getElementById('model-creator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('via-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use purple accents in name input', () => {
      const nameInput = document.getElementById('model-creator-name');
      expect(nameInput.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(nameInput.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in type select', () => {
      const typeSelect = document.getElementById('model-creator-type');
      expect(typeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(typeSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in description textarea', () => {
      const descriptionTextarea = document.getElementById('model-creator-description');
      expect(descriptionTextarea.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(descriptionTextarea.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in data source select', () => {
      const dataSourceSelect = document.getElementById('model-creator-data-source');
      expect(dataSourceSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(dataSourceSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in parameters textarea', () => {
      const parametersTextarea = document.getElementById('model-creator-parameters');
      expect(parametersTextarea.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(parametersTextarea.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in output format select', () => {
      const outputFormatSelect = document.getElementById('model-creator-output-format');
      expect(outputFormatSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(outputFormatSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should use purple accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('model-creator-empty-state').querySelector('i.fas.fa-robot');
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
      expect(icons.length).toBeGreaterThanOrEqual(15);
    });

    it('should have robot icon in header', () => {
      const robotIcon = document.body.querySelector('header i.fas.fa-robot');
      expect(robotIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('model-creator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have tag icon for model name section', () => {
      const tagIcon = document.body.querySelector('i.fas.fa-tag');
      expect(tagIcon).toBeTruthy();
    });

    it('should have signature icon for model name input', () => {
      const signatureIcon = document.body.querySelector('i.fas.fa-signature');
      expect(signatureIcon).toBeTruthy();
    });

    it('should have microchip icon for model type section', () => {
      const microchipIcon = document.body.querySelector('i.fas.fa-microchip');
      expect(microchipIcon).toBeTruthy();
    });

    it('should have cogs icon for model type select', () => {
      const cogsIcon = document.body.querySelector('i.fas.fa-cogs');
      expect(cogsIcon).toBeTruthy();
    });

    it('should have align-left icon for description section', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have paragraph icon for description textarea', () => {
      const paragraphIcon = document.body.querySelector('i.fas.fa-paragraph');
      expect(paragraphIcon).toBeTruthy();
    });

    it('should have database icon for data source section', () => {
      const databaseIcon = document.body.querySelector('i.fas.fa-database');
      expect(databaseIcon).toBeTruthy();
    });

    it('should have server icon for data source select', () => {
      const serverIcon = document.body.querySelector('i.fas.fa-server');
      expect(serverIcon).toBeTruthy();
    });

    it('should have sliders-h icon for parameters section', () => {
      const slidersIcon = document.body.querySelector('i.fas.fa-sliders-h');
      expect(slidersIcon).toBeTruthy();
    });

    it('should have code icon for parameters textarea', () => {
      const codeIcon = document.body.querySelector('i.fas.fa-code');
      expect(codeIcon).toBeTruthy();
    });

    it('should have file-export icon for output format section', () => {
      const fileExportIcon = document.body.querySelector('i.fas.fa-file-export');
      expect(fileExportIcon).toBeTruthy();
    });

    it('should have file-code icon for output format select', () => {
      const fileCodeIcon = document.body.querySelector('i.fas.fa-file-code');
      expect(fileCodeIcon).toBeTruthy();
    });

    it('should have robot icon in empty state', () => {
      const emptyStateIcon = document.getElementById('model-creator-empty-state').querySelector('i.fas.fa-robot');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Pembuat Model AI');
      expect(document.body.textContent).toContain('Nama Model');
      expect(document.body.textContent).toContain('Tipe Model');
      expect(document.body.textContent).toContain('Deskripsi');
      expect(document.body.textContent).toContain('Sumber Data Training');
      expect(document.body.textContent).toContain('Parameter');
      expect(document.body.textContent).toContain('Format Output');
      expect(document.body.textContent).toContain('Buat Model AI');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('Nama Model');
      expect(headers[1].textContent).toContain('Tipe Model');
      expect(headers[2].textContent).toContain('Deskripsi');
      expect(headers[3].textContent).toContain('Sumber Data Training');
      expect(headers[4].textContent).toContain('Parameter');
      expect(headers[5].textContent).toContain('Format Output');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('model-creator-empty-state');
      expect(emptyState.textContent).toContain('Hasil konfigurasi model akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Model AI');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('model-creator-loading');
      expect(loading.textContent).toContain('Sedang membuat model AI');
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
      const nameInput = document.getElementById('model-creator-name');
      expect(nameInput).toBeTruthy();
      
      const typeSelect = document.getElementById('model-creator-type');
      expect(typeSelect).toBeTruthy();
      
      const descriptionTextarea = document.getElementById('model-creator-description');
      expect(descriptionTextarea).toBeTruthy();
      
      const dataSourceSelect = document.getElementById('model-creator-data-source');
      expect(dataSourceSelect).toBeTruthy();
      
      const parametersTextarea = document.getElementById('model-creator-parameters');
      expect(parametersTextarea).toBeTruthy();
      
      const outputFormatSelect = document.getElementById('model-creator-output-format');
      expect(outputFormatSelect).toBeTruthy();
    });

    it('should have proper labels for inputs', () => {
      const nameLabel = document.querySelector('label[for="model-creator-name"]');
      expect(nameLabel).toBeTruthy();
      
      const typeLabel = document.querySelector('label[for="model-creator-type"]');
      expect(typeLabel).toBeTruthy();
      
      const descriptionLabel = document.querySelector('label[for="model-creator-description"]');
      expect(descriptionLabel).toBeTruthy();
      
      const dataSourceLabel = document.querySelector('label[for="model-creator-data-source"]');
      expect(dataSourceLabel).toBeTruthy();
      
      const parametersLabel = document.querySelector('label[for="model-creator-parameters"]');
      expect(parametersLabel).toBeTruthy();
      
      const outputFormatLabel = document.querySelector('label[for="model-creator-output-format"]');
      expect(outputFormatLabel).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('model-creator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper input types', () => {
      const nameInput = document.getElementById('model-creator-name');
      expect(nameInput.type).toBe('text');
      
      const typeSelect = document.getElementById('model-creator-type');
      expect(typeSelect.tagName).toBe('SELECT');
      
      const descriptionTextarea = document.getElementById('model-creator-description');
      expect(descriptionTextarea.tagName).toBe('TEXTAREA');
      
      const dataSourceSelect = document.getElementById('model-creator-data-source');
      expect(dataSourceSelect.tagName).toBe('SELECT');
      
      const parametersTextarea = document.getElementById('model-creator-parameters');
      expect(parametersTextarea.tagName).toBe('TEXTAREA');
      
      const outputFormatSelect = document.getElementById('model-creator-output-format');
      expect(outputFormatSelect.tagName).toBe('SELECT');
    });

    it('should have proper textarea row attributes', () => {
      const descriptionTextarea = document.getElementById('model-creator-description');
      expect(descriptionTextarea.rows).toBe(4);
      
      const parametersTextarea = document.getElementById('model-creator-parameters');
      expect(parametersTextarea.rows).toBe(6);
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
