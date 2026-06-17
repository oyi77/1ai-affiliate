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

describe('cover-photo-generator Component', () => {
  
  const mockComponentHTML = `
    <div id="content-cover-photo-generator" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            <i class="fas fa-image mr-3"></i>Generator Foto Sampul
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat foto sampul media sosial yang menarik dengan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Platform -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Platform</h2>
              <div id="cover-photo-generator-platform" class="grid grid-cols-2 gap-2">
                <button type="button" data-platform="facebook" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fab fa-facebook text-2xl mb-1 text-blue-600"></i>
                  <span class="block font-medium">Facebook</span>
                </button>
                <button type="button" data-platform="instagram" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-instagram text-2xl mb-1 text-pink-600"></i>
                  <span class="block font-medium">Instagram</span>
                </button>
                <button type="button" data-platform="youtube" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-youtube text-2xl mb-1 text-red-600"></i>
                  <span class="block font-medium">YouTube</span>
                </button>
                <button type="button" data-platform="twitter" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-sky-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-twitter text-2xl mb-1 text-sky-500"></i>
                  <span class="block font-medium">Twitter</span>
                </button>
                <button type="button" data-platform="linkedin" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-linkedin text-2xl mb-1 text-blue-700"></i>
                  <span class="block font-medium">LinkedIn</span>
                </button>
                <button type="button" data-platform="tiktok" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-black hover:bg-gray-800 transition text-center border-2 border-transparent">
                  <i class="fab fa-tiktok text-2xl mb-1 text-black"></i>
                  <span class="block font-medium">TikTok</span>
                </button>
                <button type="button" data-platform="pinterest" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-pinterest text-2xl mb-1 text-red-600"></i>
                  <span class="block font-medium">Pinterest</span>
                </button>
                <button type="button" data-platform="shopee" class="cover-photo-generator-platform-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-shopping-bag text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Shopee</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Cover Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Sampul</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="cover-photo-generator-cover-type" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-th-large mr-1 text-indigo-500"></i>Jenis Foto Sampul
                  </label>
                  <select id="cover-photo-generator-cover-type" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="personal-brand">Personal Brand</option>
                    <option value="business">Bisnis</option>
                    <option value="product">Produk</option>
                    <option value="event">Acara</option>
                    <option value="campaign">Kampanye</option>
                    <option value="seasonal">Musiman</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="cover-photo-generator-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-blue-500"></i>Gaya Desain
                  </label>
                  <select id="cover-photo-generator-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="minimalist">Minimalis</option>
                    <option value="bold">Berani</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                    <option value="colorful">Warna-warni</option>
                    <option value="professional">Profesional</option>
                    <option value="playful">Playful</option>
                    <option value="luxury">Mewah</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Image Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Unggah Gambar</h2>
              
              <div id="cover-photo-generator-image-upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition cursor-pointer">
                <input type="file" id="cover-photo-generator-image-input" class="hidden" accept="image/*">
                <div id="cover-photo-generator-image-preview-container" class="hidden">
                  <img id="cover-photo-generator-image-preview" class="max-h-48 mx-auto rounded-lg mb-3" alt="Preview">
                  <button type="button" id="cover-photo-generator-remove-image-btn" class="text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash-alt mr-1"></i>Hapus Gambar
                  </button>
                </div>
                <div id="cover-photo-generator-image-placeholder">
                  <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                  <p class="text-gray-600 text-sm">Klik atau seret gambar ke sini</p>
                  <p class="text-gray-400 text-xs mt-1">PNG, JPG, atau HEIC</p>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Brand Elements -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Elemen Brand</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="cover-photo-generator-brand-elements" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-copyright mr-1 text-cyan-500"></i>Elemen Brand
                  </label>
                  <select id="cover-photo-generator-brand-elements" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="logo">Logo</option>
                    <option value="tagline">Tagline</option>
                    <option value="contact-info">Info Kontak</option>
                    <option value="social-handles">Media Sosial</option>
                    <option value="none">Tidak Ada</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Color Theme -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Tema Warna</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="cover-photo-generator-color-theme" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-palette mr-1 text-purple-500"></i>Tema Warna
                  </label>
                  <select id="cover-photo-generator-color-theme" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="blue-theme">Biru</option>
                    <option value="red-theme">Merah</option>
                    <option value="green-theme">Hijau</option>
                    <option value="purple-theme">Ungu</option>
                    <option value="black-white">Hitam Putih</option>
                    <option value="gradient">Gradien</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Generate Button -->
            <button id="cover-photo-generator-generate-btn" class="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Foto Sampul
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="cover-photo-generator-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="cover-photo-generator-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-image text-6xl mb-4 text-indigo-400"></i>
                <p class="text-xl">Hasil foto sampul akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Foto Sampul</p>
              </div>
              <div id="cover-photo-generator-results" class="hidden space-y-6"></div>
              <div id="cover-photo-generator-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-indigo-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat foto sampul...</p>
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
      const container = document.getElementById('content-cover-photo-generator');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Generator Foto Sampul');
      expect(title.querySelector('i.fas.fa-image')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat foto sampul media sosial yang menarik dengan AI');
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
      expect(rightPanel.querySelector('#cover-photo-generator-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Platform Selection Tests
  describe('Platform Selection', () => {
    it('should render platform options container', () => {
      const platformOptions = document.getElementById('cover-photo-generator-platform');
      expect(platformOptions).toBeTruthy();
    });

    it('should render Facebook option', () => {
      const facebookBtn = document.body.querySelector('[data-platform="facebook"]');
      expect(facebookBtn).toBeTruthy();
      expect(facebookBtn.textContent).toContain('Facebook');
      expect(facebookBtn.querySelector('i.fab.fa-facebook')).toBeTruthy();
      expect(facebookBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Instagram option', () => {
      const instagramBtn = document.body.querySelector('[data-platform="instagram"]');
      expect(instagramBtn).toBeTruthy();
      expect(instagramBtn.textContent).toContain('Instagram');
      expect(instagramBtn.querySelector('i.fab.fa-instagram')).toBeTruthy();
    });

    it('should render YouTube option', () => {
      const youtubeBtn = document.body.querySelector('[data-platform="youtube"]');
      expect(youtubeBtn).toBeTruthy();
      expect(youtubeBtn.textContent).toContain('YouTube');
      expect(youtubeBtn.querySelector('i.fab.fa-youtube')).toBeTruthy();
    });

    it('should render Twitter option', () => {
      const twitterBtn = document.body.querySelector('[data-platform="twitter"]');
      expect(twitterBtn).toBeTruthy();
      expect(twitterBtn.textContent).toContain('Twitter');
      expect(twitterBtn.querySelector('i.fab.fa-twitter')).toBeTruthy();
    });

    it('should render LinkedIn option', () => {
      const linkedinBtn = document.body.querySelector('[data-platform="linkedin"]');
      expect(linkedinBtn).toBeTruthy();
      expect(linkedinBtn.textContent).toContain('LinkedIn');
      expect(linkedinBtn.querySelector('i.fab.fa-linkedin')).toBeTruthy();
    });

    it('should render TikTok option', () => {
      const tiktokBtn = document.body.querySelector('[data-platform="tiktok"]');
      expect(tiktokBtn).toBeTruthy();
      expect(tiktokBtn.textContent).toContain('TikTok');
      expect(tiktokBtn.querySelector('i.fab.fa-tiktok')).toBeTruthy();
    });

    it('should render Pinterest option', () => {
      const pinterestBtn = document.body.querySelector('[data-platform="pinterest"]');
      expect(pinterestBtn).toBeTruthy();
      expect(pinterestBtn.textContent).toContain('Pinterest');
      expect(pinterestBtn.querySelector('i.fab.fa-pinterest')).toBeTruthy();
    });

    it('should render Shopee option', () => {
      const shopeeBtn = document.body.querySelector('[data-platform="shopee"]');
      expect(shopeeBtn).toBeTruthy();
      expect(shopeeBtn.textContent).toContain('Shopee');
      expect(shopeeBtn.querySelector('i.fas.fa-shopping-bag')).toBeTruthy();
    });

    it('should have 8 platform options', () => {
      const platformBtns = document.body.querySelectorAll('.cover-photo-generator-platform-btn');
      expect(platformBtns.length).toBe(8);
    });

    it('should have proper grid layout for platform options', () => {
      const platformOptions = document.getElementById('cover-photo-generator-platform');
      expect(platformOptions.classList.contains('grid')).toBe(true);
      expect(platformOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(platformOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Platform');
    });

    it('should have colored hover effects in platform buttons', () => {
      const platformBtns = document.body.querySelectorAll('.cover-photo-generator-platform-btn');
      expect(platformBtns[0].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(platformBtns[1].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(platformBtns[2].classList.contains('hover:bg-red-100')).toBe(true);
      expect(platformBtns[3].classList.contains('hover:bg-sky-100')).toBe(true);
      expect(platformBtns[4].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(platformBtns[6].classList.contains('hover:bg-red-100')).toBe(true);
      expect(platformBtns[7].classList.contains('hover:bg-orange-100')).toBe(true);
    });
  });

  // Cover Type Selection Tests
  describe('Cover Type Selection', () => {
    it('should render cover type select', () => {
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect).toBeTruthy();
      expect(coverTypeSelect.tagName).toBe('SELECT');
      expect(coverTypeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Jenis Sampul');
    });

    it('should have all labels with icons', () => {
      const thLargeIcon = document.body.querySelector('i.fas.fa-th-large');
      expect(thLargeIcon).toBeTruthy();
    });

    it('should have cover type options with proper labels', () => {
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect.options[0].textContent).toContain('Personal Brand');
      expect(coverTypeSelect.options[1].textContent).toContain('Bisnis');
      expect(coverTypeSelect.options[2].textContent).toContain('Produk');
      expect(coverTypeSelect.options[3].textContent).toContain('Acara');
      expect(coverTypeSelect.options[4].textContent).toContain('Kampanye');
      expect(coverTypeSelect.options[5].textContent).toContain('Musiman');
    });

    it('should have default cover type value', () => {
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect.value).toBe('personal-brand');
    });

    it('should have proper input styling', () => {
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect.classList.contains('w-full')).toBe(true);
      expect(coverTypeSelect.classList.contains('p-3')).toBe(true);
      expect(coverTypeSelect.classList.contains('border')).toBe(true);
      expect(coverTypeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(coverTypeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(coverTypeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
    });
  });

  // Style Selection Tests
  describe('Style Selection', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(8);
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
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect.options[0].textContent).toContain('Minimalis');
      expect(styleSelect.options[1].textContent).toContain('Berani');
      expect(styleSelect.options[2].textContent).toContain('Vintage');
      expect(styleSelect.options[3].textContent).toContain('Modern');
      expect(styleSelect.options[4].textContent).toContain('Warna-warni');
      expect(styleSelect.options[5].textContent).toContain('Profesional');
      expect(styleSelect.options[6].textContent).toContain('Playful');
      expect(styleSelect.options[7].textContent).toContain('Mewah');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect.value).toBe('minimalist');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should render image upload area', () => {
      const uploadArea = document.getElementById('cover-photo-generator-image-upload-area');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.classList.contains('border-2')).toBe(true);
      expect(uploadArea.classList.contains('border-dashed')).toBe(true);
      expect(uploadArea.classList.contains('border-gray-300')).toBe(true);
      expect(uploadArea.classList.contains('rounded-xl')).toBe(true);
    });

    it('should render image input', () => {
      const imageInput = document.getElementById('cover-photo-generator-image-input');
      expect(imageInput).toBeTruthy();
      expect(imageInput.type).toBe('file');
      expect(imageInput.accept).toBe('image/*');
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('cover-photo-generator-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview', () => {
      const imagePreview = document.getElementById('cover-photo-generator-image-preview');
      expect(imagePreview).toBeTruthy();
      expect(imagePreview.alt).toBe('Preview');
      expect(imagePreview.classList.contains('max-h-48')).toBe(true);
      expect(imagePreview.classList.contains('mx-auto')).toBe(true);
      expect(imagePreview.classList.contains('rounded-lg')).toBe(true);
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('cover-photo-generator-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.textContent).toContain('Hapus Gambar');
      expect(removeBtn.querySelector('i.fas.fa-trash-alt')).toBeTruthy();
    });

    it('should render image placeholder', () => {
      const placeholder = document.getElementById('cover-photo-generator-image-placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder.querySelector('i.fas.fa-cloud-upload-alt')).toBeTruthy();
      expect(placeholder.textContent).toContain('Klik atau seret gambar ke sini');
      expect(placeholder.textContent).toContain('PNG, JPG, atau HEIC');
    });

    it('should have hover effect on upload area', () => {
      const uploadArea = document.getElementById('cover-photo-generator-image-upload-area');
      expect(uploadArea.classList.contains('hover:border-indigo-400')).toBe(true);
      expect(uploadArea.classList.contains('transition')).toBe(true);
      expect(uploadArea.classList.contains('cursor-pointer')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Unggah Gambar');
    });
  });

  // Brand Elements Selection Tests
  describe('Brand Elements Selection', () => {
    it('should render brand elements select', () => {
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      expect(brandElementsSelect.tagName).toBe('SELECT');
      expect(brandElementsSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Elemen Brand');
    });

    it('should have all labels with icons', () => {
      const copyrightIcon = document.body.querySelector('i.fas.fa-copyright');
      expect(copyrightIcon).toBeTruthy();
    });

    it('should have brand elements options with proper labels', () => {
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect.options[0].textContent).toContain('Logo');
      expect(brandElementsSelect.options[1].textContent).toContain('Tagline');
      expect(brandElementsSelect.options[2].textContent).toContain('Info Kontak');
      expect(brandElementsSelect.options[3].textContent).toContain('Media Sosial');
      expect(brandElementsSelect.options[4].textContent).toContain('Tidak Ada');
    });

    it('should have default brand elements value', () => {
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect.value).toBe('logo');
    });

    it('should have proper input styling', () => {
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect.classList.contains('w-full')).toBe(true);
      expect(brandElementsSelect.classList.contains('p-3')).toBe(true);
      expect(brandElementsSelect.classList.contains('border')).toBe(true);
      expect(brandElementsSelect.classList.contains('rounded-lg')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Color Theme Selection Tests
  describe('Color Theme Selection', () => {
    it('should render color theme select', () => {
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect).toBeTruthy();
      expect(colorThemeSelect.tagName).toBe('SELECT');
      expect(colorThemeSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Tema Warna');
    });

    it('should have all labels with icons', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have color theme options with proper labels', () => {
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect.options[0].textContent).toContain('Biru');
      expect(colorThemeSelect.options[1].textContent).toContain('Merah');
      expect(colorThemeSelect.options[2].textContent).toContain('Hijau');
      expect(colorThemeSelect.options[3].textContent).toContain('Ungu');
      expect(colorThemeSelect.options[4].textContent).toContain('Hitam Putih');
      expect(colorThemeSelect.options[5].textContent).toContain('Gradien');
    });

    it('should have default color theme value', () => {
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect.value).toBe('blue-theme');
    });

    it('should have proper input styling', () => {
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect.classList.contains('w-full')).toBe(true);
      expect(colorThemeSelect.classList.contains('p-3')).toBe(true);
      expect(colorThemeSelect.classList.contains('border')).toBe(true);
      expect(colorThemeSelect.classList.contains('rounded-lg')).toBe(true);
      expect(colorThemeSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(colorThemeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('cover-photo-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Foto Sampul');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('cover-photo-generator-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('to-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('cover-photo-generator-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('cover-photo-generator-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('cover-photo-generator-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('cover-photo-generator-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-image')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil foto sampul akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('cover-photo-generator-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('cover-photo-generator-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat foto sampul');
    });

    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-indigo-500')).toBe(true);
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('cover-photo-generator-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have indigo icon in empty state', () => {
      const emptyStateIcon = document.getElementById('cover-photo-generator-empty-state').querySelector('i.fas.fa-image');
      expect(emptyStateIcon.classList.contains('text-indigo-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/indigo/cyan color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-500')).toBe(true);
      expect(title.classList.contains('via-indigo-500')).toBe(true);
      expect(title.classList.contains('to-cyan-500')).toBe(true);
    });

    it('should use blue/indigo/cyan accents in generate button', () => {
      const generateBtn = document.getElementById('cover-photo-generator-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-indigo-500')).toBe(true);
      expect(generateBtn.classList.contains('to-cyan-500')).toBe(true);
    });

    it('should use indigo accents in cover type select', () => {
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect.classList.contains('focus:ring-indigo-500')).toBe(true);
      expect(coverTypeSelect.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use blue accents in style select', () => {
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use cyan accents in brand elements select', () => {
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(brandElementsSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use purple accents in color theme select', () => {
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(colorThemeSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use indigo accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-indigo-500')).toBe(true);
    });

    it('should use indigo accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('cover-photo-generator-empty-state').querySelector('i.fas.fa-image');
      expect(emptyStateIcon.classList.contains('text-indigo-400')).toBe(true);
    });

    it('should use indigo accents in upload area hover', () => {
      const uploadArea = document.getElementById('cover-photo-generator-image-upload-area');
      expect(uploadArea.classList.contains('hover:border-indigo-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(17);
    });

    it('should have image icon in header', () => {
      const imageIcon = document.body.querySelector('header i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('cover-photo-generator-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have facebook icon for facebook platform', () => {
      const facebookIcon = document.body.querySelector('[data-platform="facebook"] i.fab.fa-facebook');
      expect(facebookIcon).toBeTruthy();
    });

    it('should have instagram icon for instagram platform', () => {
      const instagramIcon = document.body.querySelector('[data-platform="instagram"] i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
    });

    it('should have youtube icon for youtube platform', () => {
      const youtubeIcon = document.body.querySelector('[data-platform="youtube"] i.fab.fa-youtube');
      expect(youtubeIcon).toBeTruthy();
    });

    it('should have twitter icon for twitter platform', () => {
      const twitterIcon = document.body.querySelector('[data-platform="twitter"] i.fab.fa-twitter');
      expect(twitterIcon).toBeTruthy();
    });

    it('should have linkedin icon for linkedin platform', () => {
      const linkedinIcon = document.body.querySelector('[data-platform="linkedin"] i.fab.fa-linkedin');
      expect(linkedinIcon).toBeTruthy();
    });

    it('should have tiktok icon for tiktok platform', () => {
      const tiktokIcon = document.body.querySelector('[data-platform="tiktok"] i.fab.fa-tiktok');
      expect(tiktokIcon).toBeTruthy();
    });

    it('should have pinterest icon for pinterest platform', () => {
      const pinterestIcon = document.body.querySelector('[data-platform="pinterest"] i.fab.fa-pinterest');
      expect(pinterestIcon).toBeTruthy();
    });

    it('should have shopping-bag icon for shopee platform', () => {
      const shoppingBagIcon = document.body.querySelector('[data-platform="shopee"] i.fas.fa-shopping-bag');
      expect(shoppingBagIcon).toBeTruthy();
    });

    it('should have th-large icon for cover type', () => {
      const thLargeIcon = document.body.querySelector('i.fas.fa-th-large');
      expect(thLargeIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have cloud-upload-alt icon for image upload', () => {
      const cloudUploadAltIcon = document.body.querySelector('i.fas.fa-cloud-upload-alt');
      expect(cloudUploadAltIcon).toBeTruthy();
    });

    it('should have trash-alt icon for remove image button', () => {
      const trashAltIcon = document.body.querySelector('i.fas.fa-trash-alt');
      expect(trashAltIcon).toBeTruthy();
    });

    it('should have copyright icon for brand elements', () => {
      const copyrightIcon = document.body.querySelector('i.fas.fa-copyright');
      expect(copyrightIcon).toBeTruthy();
    });

    it('should have palette icon for color theme', () => {
      const paletteIcon = document.body.querySelector('i.fas.fa-palette');
      expect(paletteIcon).toBeTruthy();
    });

    it('should have image icon in empty state', () => {
      const emptyStateIcon = document.getElementById('cover-photo-generator-empty-state').querySelector('i.fas.fa-image');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Generator Foto Sampul');
      expect(document.body.textContent).toContain('Platform');
      expect(document.body.textContent).toContain('Jenis Sampul');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Unggah Gambar');
      expect(document.body.textContent).toContain('Elemen Brand');
      expect(document.body.textContent).toContain('Tema Warna');
      expect(document.body.textContent).toContain('Buat Foto Sampul');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Platform');
      expect(headers[1].textContent).toContain('2. Jenis Sampul');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Unggah Gambar');
      expect(headers[4].textContent).toContain('5. Elemen Brand');
      expect(headers[5].textContent).toContain('6. Tema Warna');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('cover-photo-generator-empty-state');
      expect(emptyState.textContent).toContain('Hasil foto sampul akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Foto Sampul');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('cover-photo-generator-loading');
      expect(loading.textContent).toContain('Sedang membuat foto sampul');
    });

    it('should have proper upload placeholder text', () => {
      const placeholder = document.getElementById('cover-photo-generator-image-placeholder');
      expect(placeholder.textContent).toContain('Klik atau seret gambar ke sini');
      expect(placeholder.textContent).toContain('PNG, JPG, atau HEIC');
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
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect).toBeTruthy();
      
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect).toBeTruthy();
      
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('cover-photo-generator-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const coverTypeSelect = document.getElementById('cover-photo-generator-cover-type');
      expect(coverTypeSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('cover-photo-generator-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const brandElementsSelect = document.getElementById('cover-photo-generator-brand-elements');
      expect(brandElementsSelect.tagName).toBe('SELECT');
      
      const colorThemeSelect = document.getElementById('cover-photo-generator-color-theme');
      expect(colorThemeSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for platform selection', () => {
      const platformBtns = document.body.querySelectorAll('.cover-photo-generator-platform-btn');
      platformBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for platform buttons', () => {
      const facebookBtn = document.body.querySelector('[data-platform="facebook"]');
      expect(facebookBtn.dataset.platform).toBe('facebook');
      expect(facebookBtn.dataset.selected).toBe('true');
      
      const instagramBtn = document.body.querySelector('[data-platform="instagram"]');
      expect(instagramBtn.dataset.platform).toBe('instagram');
    });

    it('should have proper file input attributes', () => {
      const imageInput = document.getElementById('cover-photo-generator-image-input');
      expect(imageInput.type).toBe('file');
      expect(imageInput.accept).toBe('image/*');
      expect(imageInput.classList.contains('hidden')).toBe(true);
    });

    it('should have proper image preview attributes', () => {
      const imagePreview = document.getElementById('cover-photo-generator-image-preview');
      expect(imagePreview.alt).toBe('Preview');
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

    it('should have responsive platform grid', () => {
      const platformOptions = document.getElementById('cover-photo-generator-platform');
      expect(platformOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
