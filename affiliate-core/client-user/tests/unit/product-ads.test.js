import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

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

describe('product-ads Component', () => {
  
  const mockComponentHTML = `
    <div id="content-product-ads" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
            <i class="fas fa-bullhorn mr-3"></i>Iklan Produk
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat konten iklan produk yang menarik dengan bantuan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Upload Product Photo -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Foto Produk</h2>
              <div class="upload-area">
                <label for="product-ads-image-input" class="file-input-label block text-sm border-3 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <input type="file" id="product-ads-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-purple-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto produk di sini</p>
                </label>
              </div>
              <div id="product-ads-image-preview-container" class="hidden mt-4">
                <img id="product-ads-image-preview" src="#" alt="Pratinjau Produk" class="rounded-lg w-full h-auto object-contain">
                <button id="product-ads-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Product Information -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Informasi Produk</h2>
              
              <div class="space-y-4">
                <!-- Product Name -->
                <div>
                  <label for="product-ads-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-purple-500"></i>Nama Produk
                  </label>
                  <input type="text" id="product-ads-name" placeholder="Contoh: Samsung Galaxy S24 Ultra" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                
                <!-- Product Description -->
                <div>
                  <label for="product-ads-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-purple-500"></i>Deskripsi Produk
                  </label>
                  <textarea id="product-ads-description" rows="3" placeholder="Jelaskan produk Anda secara singkat..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                </div>
                
                <!-- Price -->
                <div>
                  <label for="product-ads-price" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-purple-500"></i>Harga (Rp)
                  </label>
                  <input type="text" id="product-ads-price" placeholder="Contoh: 15.000.000" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                
                <!-- Discount Price (Optional) -->
                <div>
                  <label for="product-ads-discount" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-percent mr-1 text-purple-500"></i>Harga Diskon (Rp) - Opsional
                  </label>
                  <input type="text" id="product-ads-discount" placeholder="Contoh: 12.000.000" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
              </div>
            </div>
            
            <!-- Step 3: Ad Platform Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Platform Iklan</h2>
              <div id="product-ads-platform-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-platform="instagram" class="platform-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fab fa-instagram text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Instagram</span>
                </button>
                <button type="button" data-platform="tiktok" class="platform-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-tiktok text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">TikTok</span>
                </button>
                <button type="button" data-platform="facebook" class="platform-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-facebook text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Facebook</span>
                </button>
                <button type="button" data-platform="youtube" class="platform-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fab fa-youtube text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">YouTube</span>
                </button>
              </div>
            </div>
            
            <!-- Step 4: CTA Button Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Tombol CTA</h2>
              <div id="product-ads-cta-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-cta="beli_sekarang" class="cta-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-shopping-cart mr-2 text-purple-500"></i>
                  <span class="font-medium">Beli Sekarang</span>
                </button>
                <button type="button" data-cta="daftar_sekarang" class="cta-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-user-plus mr-2 text-purple-500"></i>
                  <span class="font-medium">Daftar Sekarang</span>
                </button>
                <button type="button" data-cta="pelajari_lebih_lanjut" class="cta-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-info-circle mr-2 text-purple-500"></i>
                  <span class="font-medium">Pelajari Lebih Lanjut</span>
                </button>
                <button type="button" data-cta="hubungi_kami" class="cta-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-envelope mr-2 text-purple-500"></i>
                  <span class="font-medium">Hubungi Kami</span>
                </button>
                <button type="button" data-cta="dapatkan_diskon" class="cta-btn-product-ads p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-tag mr-2 text-purple-500"></i>
                  <span class="font-medium">Dapatkan Diskon</span>
                </button>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <!-- Age Range -->
                <div>
                  <label for="product-ads-age" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-purple-500"></i>Rentang Usia
                  </label>
                  <select id="product-ads-age" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">Semua Usia</option>
                    <option value="18-24">18-24 tahun</option>
                    <option value="25-34">25-34 tahun</option>
                    <option value="35-44">35-44 tahun</option>
                    <option value="45-54">45-54 tahun</option>
                    <option value="55+">55 tahun ke atas</option>
                  </select>
                </div>
                
                <!-- Gender -->
                <div>
                  <label for="product-ads-gender" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-venus-mars mr-1 text-purple-500"></i>Jenis Kelamin
                  </label>
                  <select id="product-ads-gender" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">Semua Jenis Kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                
                <!-- Interests -->
                <div>
                  <label for="product-ads-interests" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-purple-500"></i>Minat (pisahkan dengan koma)
                  </label>
                  <textarea id="product-ads-interests" rows="2" placeholder="Contoh: teknologi, gaming, fashion, kesehatan"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Generate Button -->
            <button id="product-ads-generate-btn" class="w-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Iklan
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="product-ads-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="product-ads-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-bullhorn text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil iklan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi produk dan klik Buat Iklan</p>
              </div>
              <div id="product-ads-results" class="hidden space-y-6"></div>
              <div id="product-ads-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat iklan...</p>
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
      const container = document.getElementById('content-product-ads');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Iklan Produk');
      expect(title.querySelector('i.fas.fa-bullhorn')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat konten iklan produk yang menarik');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(5);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#product-ads-results-container')).toBeTruthy();
    });

    it('should have proper container classes', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should render image upload area', () => {
      const uploadArea = document.getElementById('product-ads-image-input');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.accept).toBe('image/*');
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('product-ads-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview element', () => {
      const preview = document.getElementById('product-ads-image-preview');
      expect(preview).toBeTruthy();
      expect(preview.alt).toBe('Pratinjau Produk');
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('product-ads-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should render upload area with icon and text', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel).toBeTruthy();
      expect(uploadLabel.querySelector('i.fas.fa-camera')).toBeTruthy();
      expect(uploadLabel.querySelector('p.text-gray-600')).toBeTruthy();
      expect(uploadLabel.textContent).toContain('Klik atau seret foto produk di sini');
    });

    it('should have proper upload area styling', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel.classList.contains('border-3')).toBe(true);
      expect(uploadLabel.classList.contains('border-dashed')).toBe(true);
      expect(uploadLabel.classList.contains('border-purple-300')).toBe(true);
      expect(uploadLabel.classList.contains('rounded-xl')).toBe(true);
      expect(uploadLabel.classList.contains('p-8')).toBe(true);
    });
  });

  // Product Information Tests
  describe('Product Information', () => {
    it('should render product name input', () => {
      const nameInput = document.getElementById('product-ads-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.placeholder).toContain('Samsung Galaxy S24 Ultra');
    });

    it('should render product description textarea', () => {
      const descInput = document.getElementById('product-ads-description');
      expect(descInput).toBeTruthy();
      expect(descInput.rows).toBe(3);
      expect(descInput.placeholder).toContain('Jelaskan produk Anda secara singkat');
    });

    it('should render price input', () => {
      const priceInput = document.getElementById('product-ads-price');
      expect(priceInput).toBeTruthy();
      expect(priceInput.placeholder).toContain('15.000.000');
    });

    it('should render discount price input', () => {
      const discountInput = document.getElementById('product-ads-discount');
      expect(discountInput).toBeTruthy();
      expect(discountInput.placeholder).toContain('12.000.000');
    });

    it('should render all input labels with icons', () => {
      const tagIcons = document.body.querySelectorAll('i.fas.fa-tag');
      expect(tagIcons.length).toBeGreaterThanOrEqual(2);
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
      
      const percentIcon = document.body.querySelector('i.fas.fa-percent');
      expect(percentIcon).toBeTruthy();
    });

    it('should have proper spacing in product info form', () => {
      const productInfoCard = document.body.querySelectorAll('.card')[1];
      const spaceDiv = productInfoCard.querySelector('.space-y-4');
      expect(spaceDiv).toBeTruthy();
    });
  });

  // Ad Platform Selection Tests
  describe('Ad Platform Selection', () => {
    it('should render platform options container', () => {
      const platformOptions = document.getElementById('product-ads-platform-options');
      expect(platformOptions).toBeTruthy();
    });

    it('should render Instagram platform option', () => {
      const instagramBtn = document.body.querySelector('[data-platform="instagram"]');
      expect(instagramBtn).toBeTruthy();
      expect(instagramBtn.textContent).toContain('Instagram');
      expect(instagramBtn.querySelector('i.fab.fa-instagram')).toBeTruthy();
      expect(instagramBtn.classList.contains('selected')).toBe(true);
    });

    it('should render TikTok platform option', () => {
      const tiktokBtn = document.body.querySelector('[data-platform="tiktok"]');
      expect(tiktokBtn).toBeTruthy();
      expect(tiktokBtn.textContent).toContain('TikTok');
      expect(tiktokBtn.querySelector('i.fab.fa-tiktok')).toBeTruthy();
    });

    it('should render Facebook platform option', () => {
      const facebookBtn = document.body.querySelector('[data-platform="facebook"]');
      expect(facebookBtn).toBeTruthy();
      expect(facebookBtn.textContent).toContain('Facebook');
      expect(facebookBtn.querySelector('i.fab.fa-facebook')).toBeTruthy();
    });

    it('should render YouTube platform option', () => {
      const youtubeBtn = document.body.querySelector('[data-platform="youtube"]');
      expect(youtubeBtn).toBeTruthy();
      expect(youtubeBtn.textContent).toContain('YouTube');
      expect(youtubeBtn.querySelector('i.fab.fa-youtube')).toBeTruthy();
    });

    it('should have 4 platform options', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-product-ads');
      expect(platformBtns.length).toBe(4);
    });

    it('should have grid layout for platform options', () => {
      const platformOptions = document.getElementById('product-ads-platform-options');
      expect(platformOptions.classList.contains('grid')).toBe(true);
      expect(platformOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(platformOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper platform button styling', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-product-ads');
      platformBtns.forEach(btn => {
        expect(btn.classList.contains('p-3')).toBe(true);
        expect(btn.classList.contains('rounded-lg')).toBe(true);
        expect(btn.classList.contains('text-center')).toBe(true);
      });
    });
  });

  // CTA Button Selection Tests
  describe('CTA Button Selection', () => {
    it('should render CTA options container', () => {
      const ctaOptions = document.getElementById('product-ads-cta-options');
      expect(ctaOptions).toBeTruthy();
    });

    it('should render Beli Sekarang CTA option', () => {
      const ctaBtn = document.body.querySelector('[data-cta="beli_sekarang"]');
      expect(ctaBtn).toBeTruthy();
      expect(ctaBtn.textContent).toContain('Beli Sekarang');
      expect(ctaBtn.querySelector('i.fas.fa-shopping-cart')).toBeTruthy();
      expect(ctaBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Daftar Sekarang CTA option', () => {
      const ctaBtn = document.body.querySelector('[data-cta="daftar_sekarang"]');
      expect(ctaBtn).toBeTruthy();
      expect(ctaBtn.textContent).toContain('Daftar Sekarang');
      expect(ctaBtn.querySelector('i.fas.fa-user-plus')).toBeTruthy();
    });

    it('should render Pelajari Lebih Lanjut CTA option', () => {
      const ctaBtn = document.body.querySelector('[data-cta="pelajari_lebih_lanjut"]');
      expect(ctaBtn).toBeTruthy();
      expect(ctaBtn.textContent).toContain('Pelajari Lebih Lanjut');
      expect(ctaBtn.querySelector('i.fas.fa-info-circle')).toBeTruthy();
    });

    it('should render Hubungi Kami CTA option', () => {
      const ctaBtn = document.body.querySelector('[data-cta="hubungi_kami"]');
      expect(ctaBtn).toBeTruthy();
      expect(ctaBtn.textContent).toContain('Hubungi Kami');
      expect(ctaBtn.querySelector('i.fas.fa-envelope')).toBeTruthy();
    });

    it('should render Dapatkan Diskon CTA option', () => {
      const ctaBtn = document.body.querySelector('[data-cta="dapatkan_diskon"]');
      expect(ctaBtn).toBeTruthy();
      expect(ctaBtn.textContent).toContain('Dapatkan Diskon');
      expect(ctaBtn.querySelector('i.fas.fa-tag')).toBeTruthy();
    });

    it('should have 5 CTA options', () => {
      const ctaBtns = document.body.querySelectorAll('.cta-btn-product-ads');
      expect(ctaBtns.length).toBe(5);
    });

    it('should have proper CTA button styling', () => {
      const ctaBtns = document.body.querySelectorAll('.cta-btn-product-ads');
      ctaBtns.forEach(btn => {
        expect(btn.classList.contains('p-3')).toBe(true);
        expect(btn.classList.contains('rounded-lg')).toBe(true);
        expect(btn.classList.contains('text-left')).toBe(true);
      });
    });
  });

  // Target Audience Tests
  describe('Target Audience', () => {
    it('should render age select dropdown', () => {
      const ageSelect = document.getElementById('product-ads-age');
      expect(ageSelect).toBeTruthy();
      expect(ageSelect.tagName).toBe('SELECT');
    });

    it('should render age options', () => {
      const ageSelect = document.getElementById('product-ads-age');
      const options = ageSelect.querySelectorAll('option');
      expect(options.length).toBe(6);
      expect(options[0].value).toBe('all');
      expect(options[0].textContent).toContain('Semua Usia');
    });

    it('should render gender select dropdown', () => {
      const genderSelect = document.getElementById('product-ads-gender');
      expect(genderSelect).toBeTruthy();
      expect(genderSelect.tagName).toBe('SELECT');
    });

    it('should render gender options', () => {
      const genderSelect = document.getElementById('product-ads-gender');
      const options = genderSelect.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('all');
      expect(options[0].textContent).toContain('Semua Jenis Kelamin');
    });

    it('should render interests textarea', () => {
      const interestsInput = document.getElementById('product-ads-interests');
      expect(interestsInput).toBeTruthy();
      expect(interestsInput.rows).toBe(2);
      expect(interestsInput.placeholder).toContain('teknologi, gaming, fashion, kesehatan');
    });

    it('should render audience labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
      
      const venusMarsIcon = document.body.querySelector('i.fas.fa-venus-mars');
      expect(venusMarsIcon).toBeTruthy();
      
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('product-ads-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Iklan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('product-ads-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('product-ads-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('product-ads-results-container');
      expect(resultsContainer).toBeTruthy();
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('product-ads-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-bullhorn')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil iklan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('product-ads-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('product-ads-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.querySelector('.loader')).toBeTruthy();
      expect(loading.textContent).toContain('Sedang membuat iklan');
    });

    it('should have proper results container styling', () => {
      const resultsContainer = document.getElementById('product-ads-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(6);
      
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
      expect(icons.length).toBeGreaterThan(15);
    });

    it('should have bullhorn icon in header', () => {
      const bullhornIcon = document.body.querySelector('header i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
    });

    it('should have camera icon in upload area', () => {
      const cameraIcon = document.body.querySelector('.file-input-label i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have social media icons for platforms', () => {
      const instagramIcon = document.body.querySelector('[data-platform="instagram"] i.fab.fa-instagram');
      expect(instagramIcon).toBeTruthy();
      
      const tiktokIcon = document.body.querySelector('[data-platform="tiktok"] i.fab.fa-tiktok');
      expect(tiktokIcon).toBeTruthy();
      
      const facebookIcon = document.body.querySelector('[data-platform="facebook"] i.fab.fa-facebook');
      expect(facebookIcon).toBeTruthy();
      
      const youtubeIcon = document.body.querySelector('[data-platform="youtube"] i.fab.fa-youtube');
      expect(youtubeIcon).toBeTruthy();
    });

    it('should have action icons for CTA buttons', () => {
      const shoppingCartIcon = document.body.querySelector('[data-cta="beli_sekarang"] i.fas.fa-shopping-cart');
      expect(shoppingCartIcon).toBeTruthy();
      
      const userPlusIcon = document.body.querySelector('[data-cta="daftar_sekarang"] i.fas.fa-user-plus');
      expect(userPlusIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Iklan Produk');
      expect(document.body.textContent).toContain('Foto Produk');
      expect(document.body.textContent).toContain('Informasi Produk');
      expect(document.body.textContent).toContain('Platform Iklan');
      expect(document.body.textContent).toContain('Tombol CTA');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Buat Iklan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(5);
      expect(headers[0].textContent).toContain('1. Foto Produk');
      expect(headers[1].textContent).toContain('2. Informasi Produk');
      expect(headers[2].textContent).toContain('3. Platform Iklan');
      expect(headers[3].textContent).toContain('4. Tombol CTA');
      expect(headers[4].textContent).toContain('5. Target Audiens');
    });

    it('should have proper placeholder texts', () => {
      const nameInput = document.getElementById('product-ads-name');
      expect(nameInput.placeholder).toContain('Contoh: Samsung Galaxy S24 Ultra');
      
      const descInput = document.getElementById('product-ads-description');
      expect(descInput.placeholder).toContain('Jelaskan produk Anda secara singkat');
      
      const priceInput = document.getElementById('product-ads-price');
      expect(priceInput.placeholder).toContain('Contoh: 15.000.000');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(5);
    });

    it('should have labeled form inputs', () => {
      const nameInput = document.getElementById('product-ads-name');
      expect(nameInput).toBeTruthy();
      
      const descInput = document.getElementById('product-ads-description');
      expect(descInput).toBeTruthy();
      
      const priceInput = document.getElementById('product-ads-price');
      expect(priceInput).toBeTruthy();
      
      const discountInput = document.getElementById('product-ads-discount');
      expect(discountInput).toBeTruthy();
    });

    it('should have alt text on images', () => {
      const previewImage = document.getElementById('product-ads-image-preview');
      expect(previewImage).toBeTruthy();
      expect(previewImage.alt).toBe('Pratinjau Produk');
    });

    it('should have proper labels for select elements', () => {
      const ageSelect = document.getElementById('product-ads-age');
      expect(ageSelect).toBeTruthy();
      
      const genderSelect = document.getElementById('product-ads-gender');
      expect(genderSelect).toBeTruthy();
    });

    it('should have proper file input attributes', () => {
      const fileInput = document.getElementById('product-ads-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.type).toBe('file');
      expect(fileInput.accept).toBe('image/*');
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

    it('should have responsive spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have responsive typography', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use purple/violet color scheme', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-purple-600')).toBe(true);
      expect(title.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use purple accents in upload area', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel.classList.contains('border-purple-300')).toBe(true);
      expect(uploadLabel.classList.contains('hover:border-purple-500')).toBe(true);
      
      const cameraIcon = document.body.querySelector('.file-input-label i.fas.fa-camera');
      expect(cameraIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple accents in generate button', () => {
      const generateBtn = document.getElementById('product-ads-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use purple accents in platform buttons', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-product-ads');
      platformBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in CTA buttons', () => {
      const ctaBtns = document.body.querySelectorAll('.cta-btn-product-ads');
      ctaBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });

    it('should use purple accents in form labels', () => {
      const labels = document.body.querySelectorAll('label i.text-purple-500');
      expect(labels.length).toBeGreaterThan(5);
    });

    it('should use purple accents in empty state', () => {
      const emptyState = document.getElementById('product-ads-empty-state');
      const bullhornIcon = emptyState.querySelector('i.fas.fa-bullhorn');
      expect(bullhornIcon.classList.contains('text-purple-400')).toBe(true);
    });

    it('should use purple accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have proper input types', () => {
      const nameInput = document.getElementById('product-ads-name');
      expect(nameInput.type).toBe('text');
      
      const priceInput = document.getElementById('product-ads-price');
      expect(priceInput.type).toBe('text');
      
      const discountInput = document.getElementById('product-ads-discount');
      expect(discountInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const descInput = document.getElementById('product-ads-description');
      expect(descInput.rows).toBe(3);
      
      const interestsInput = document.getElementById('product-ads-interests');
      expect(interestsInput.rows).toBe(2);
    });

    it('should have proper select attributes', () => {
      const ageSelect = document.getElementById('product-ads-age');
      expect(ageSelect.tagName).toBe('SELECT');
      
      const genderSelect = document.getElementById('product-ads-gender');
      expect(genderSelect.tagName).toBe('SELECT');
    });

    it('should have proper input styling', () => {
      const inputs = document.body.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        expect(input.classList.contains('w-full')).toBe(true);
        expect(input.classList.contains('px-4')).toBe(true);
        expect(input.classList.contains('py-2')).toBe(true);
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
        expect(input.classList.contains('focus:ring-2')).toBe(true);
        expect(input.classList.contains('focus:ring-purple-500')).toBe(true);
      });
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('product-ads-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('product-ads-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });

    it('should have proper platform button states', () => {
      const selectedPlatform = document.body.querySelector('[data-platform="instagram"]');
      expect(selectedPlatform.classList.contains('selected')).toBe(true);
      expect(selectedPlatform.getAttribute('data-selected')).toBe('true');
      
      const unselectedPlatform = document.body.querySelector('[data-platform="tiktok"]');
      expect(unselectedPlatform.classList.contains('selected')).toBe(false);
    });

    it('should have proper CTA button states', () => {
      const selectedCTA = document.body.querySelector('[data-cta="beli_sekarang"]');
      expect(selectedCTA.classList.contains('selected')).toBe(true);
      expect(selectedCTA.getAttribute('data-selected')).toBe('true');
      
      const unselectedCTA = document.body.querySelector('[data-cta="daftar_sekarang"]');
      expect(unselectedCTA.classList.contains('selected')).toBe(false);
    });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('should have loader element', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-purple-500')).toBe(true);
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('product-ads-loading');
      expect(loading.textContent).toContain('Sedang membuat iklan');
    });

    it('should have proper loading container styling', () => {
      const loading = document.getElementById('product-ads-loading');
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.classList.contains('items-center')).toBe(true);
      expect(loading.classList.contains('justify-center')).toBe(true);
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have proper empty state icon', () => {
      const emptyState = document.getElementById('product-ads-empty-state');
      expect(emptyState.querySelector('i.fas.fa-bullhorn')).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-bullhorn').classList.contains('text-purple-400')).toBe(true);
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('product-ads-empty-state');
      expect(emptyState.textContent).toContain('Hasil iklan akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi produk dan klik Buat Iklan');
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('product-ads-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have proper container', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });

    it('should have proper spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper results container styling', () => {
      const resultsContainer = document.getElementById('product-ads-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have proper header styling', () => {
      const header = document.body.querySelector('header');
      expect(header.classList.contains('text-center')).toBe(true);
      expect(header.classList.contains('mb-8')).toBe(true);
    });
  });

  // Section Numbering Tests
  describe('Section Numbering', () => {
    it('should have proper section numbering', () => {
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements[0].textContent).toContain('1.');
      expect(h2Elements[1].textContent).toContain('2.');
      expect(h2Elements[2].textContent).toContain('3.');
      expect(h2Elements[3].textContent).toContain('4.');
      expect(h2Elements[4].textContent).toContain('5.');
    });

    it('should have proper spacing between sections', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const cards = leftPanel.querySelectorAll('.card');
      expect(cards.length).toBe(5);
    });
  });

  // Form Label Tests
  describe('Form Labels', () => {
    it('should have proper label styling', () => {
      const formLabels = [
        document.getElementById('product-ads-name')?.closest('div').querySelector('label'),
        document.getElementById('product-ads-description')?.closest('div').querySelector('label'),
        document.getElementById('product-ads-price')?.closest('div').querySelector('label'),
        document.getElementById('product-ads-discount')?.closest('div').querySelector('label'),
        document.getElementById('product-ads-age')?.closest('div').querySelector('label'),
        document.getElementById('product-ads-gender')?.closest('div').querySelector('label'),
        document.getElementById('product-ads-interests')?.closest('div').querySelector('label')
      ].filter(Boolean);
      
      formLabels.forEach(label => {
        expect(label.classList.contains('block')).toBe(true);
        expect(label.classList.contains('text-sm')).toBe(true);
        expect(label.classList.contains('font-medium')).toBe(true);
      });
    });

    it('should have proper label text', () => {
      const nameLabel = document.getElementById('product-ads-name')?.closest('div').querySelector('label');
      expect(nameLabel.textContent).toContain('Nama Produk');
      
      const descLabel = document.getElementById('product-ads-description')?.closest('div').querySelector('label');
      expect(descLabel.textContent).toContain('Deskripsi Produk');
      
      const priceLabel = document.getElementById('product-ads-price')?.closest('div').querySelector('label');
      expect(priceLabel.textContent).toContain('Harga (Rp)');
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have all required elements for functionality', () => {
      // Image upload elements
      expect(document.getElementById('product-ads-image-input')).toBeTruthy();
      expect(document.getElementById('product-ads-image-preview')).toBeTruthy();
      expect(document.getElementById('product-ads-image-preview-container')).toBeTruthy();
      expect(document.getElementById('product-ads-remove-image-btn')).toBeTruthy();
      
      // Product info elements
      expect(document.getElementById('product-ads-name')).toBeTruthy();
      expect(document.getElementById('product-ads-description')).toBeTruthy();
      expect(document.getElementById('product-ads-price')).toBeTruthy();
      expect(document.getElementById('product-ads-discount')).toBeTruthy();
      
      // Platform selection elements
      expect(document.getElementById('product-ads-platform-options')).toBeTruthy();
      
      // CTA selection elements
      expect(document.getElementById('product-ads-cta-options')).toBeTruthy();
      
      // Target audience elements
      expect(document.getElementById('product-ads-age')).toBeTruthy();
      expect(document.getElementById('product-ads-gender')).toBeTruthy();
      expect(document.getElementById('product-ads-interests')).toBeTruthy();
      
      // Generate button
      expect(document.getElementById('product-ads-generate-btn')).toBeTruthy();
      
      // Results elements
      expect(document.getElementById('product-ads-results')).toBeTruthy();
      expect(document.getElementById('product-ads-empty-state')).toBeTruthy();
      expect(document.getElementById('product-ads-loading')).toBeTruthy();
    });

    it('should have proper data attributes for platform selection', () => {
      const platformBtns = document.body.querySelectorAll('.platform-btn-product-ads');
      platformBtns.forEach(btn => {
        expect(btn.dataset.platform).toBeTruthy();
        expect(['instagram', 'tiktok', 'facebook', 'youtube']).toContain(btn.dataset.platform);
      });
    });

    it('should have proper data attributes for CTA selection', () => {
      const ctaBtns = document.body.querySelectorAll('.cta-btn-product-ads');
      ctaBtns.forEach(btn => {
        expect(btn.dataset.cta).toBeTruthy();
        expect(['beli_sekarang', 'daftar_sekarang', 'pelajari_lebih_lanjut', 'hubungi_kami', 'dapatkan_diskon']).toContain(btn.dataset.cta);
      });
    });

    it('should have proper data attributes for selection state', () => {
      const selectedPlatform = document.body.querySelector('[data-platform="instagram"]');
      expect(selectedPlatform.dataset.selected).toBe('true');
      
      const selectedCTA = document.body.querySelector('[data-cta="beli_sekarang"]');
      expect(selectedCTA.dataset.selected).toBe('true');
    });
  });

  // Additional UI Elements Tests
  describe('Additional UI Elements', () => {
    it('should have proper upload area structure', () => {
      const uploadArea = document.body.querySelector('.upload-area');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.querySelector('.file-input-label')).toBeTruthy();
    });

    it('should have proper results area structure', () => {
      const resultsContainer = document.getElementById('product-ads-results-container');
      expect(resultsContainer.querySelector('#product-ads-empty-state')).toBeTruthy();
      expect(resultsContainer.querySelector('#product-ads-results')).toBeTruthy();
      expect(resultsContainer.querySelector('#product-ads-loading')).toBeTruthy();
    });

    it('should have proper platform grid layout', () => {
      const platformOptions = document.getElementById('product-ads-platform-options');
      expect(platformOptions.classList.contains('grid')).toBe(true);
      expect(platformOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(platformOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper CTA grid layout', () => {
      const ctaOptions = document.getElementById('product-ads-cta-options');
      expect(ctaOptions.classList.contains('grid')).toBe(true);
      expect(ctaOptions.classList.contains('grid-cols-1')).toBe(true);
      expect(ctaOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper target audience form layout', () => {
      const targetAudienceCard = document.body.querySelectorAll('.card')[4];
      const spaceDiv = targetAudienceCard.querySelector('.space-y-4');
      expect(spaceDiv).toBeTruthy();
    });
  });

  // Platform-specific Tests
  describe('Platform-specific Features', () => {
    it('should have Instagram as default platform', () => {
      const instagramBtn = document.body.querySelector('[data-platform="instagram"]');
      expect(instagramBtn.classList.contains('selected')).toBe(true);
      expect(instagramBtn.getAttribute('data-selected')).toBe('true');
    });

    it('should have Beli Sekarang as default CTA', () => {
      const ctaBtn = document.body.querySelector('[data-cta="beli_sekarang"]');
      expect(ctaBtn.classList.contains('selected')).toBe(true);
      expect(ctaBtn.getAttribute('data-selected')).toBe('true');
    });

    it('should have all age options', () => {
      const ageSelect = document.getElementById('product-ads-age');
      const options = ageSelect.querySelectorAll('option');
      const values = Array.from(options).map(opt => opt.value);
      expect(values).toContain('all');
      expect(values).toContain('18-24');
      expect(values).toContain('25-34');
      expect(values).toContain('35-44');
      expect(values).toContain('45-54');
      expect(values).toContain('55+');
    });

    it('should have all gender options', () => {
      const genderSelect = document.getElementById('product-ads-gender');
      const options = genderSelect.querySelectorAll('option');
      const values = Array.from(options).map(opt => opt.value);
      expect(values).toContain('all');
      expect(values).toContain('male');
      expect(values).toContain('female');
    });
  });

  // Discount Price Tests
  describe('Discount Price', () => {
    it('should render discount price input', () => {
      const discountInput = document.getElementById('product-ads-discount');
      expect(discountInput).toBeTruthy();
    });

    it('should have proper discount price label', () => {
      const discountLabel = document.getElementById('product-ads-discount')?.closest('div').querySelector('label');
      expect(discountLabel).toBeTruthy();
      expect(discountLabel.textContent).toContain('Harga Diskon (Rp)');
      expect(discountLabel.textContent).toContain('Opsional');
    });

    it('should have percent icon for discount', () => {
      const percentIcon = document.getElementById('product-ads-discount')?.closest('div').querySelector('i.fas.fa-percent');
      expect(percentIcon).toBeTruthy();
    });
  });

  // Textarea Tests
  describe('Textarea Features', () => {
    it('should have proper description textarea', () => {
      const descInput = document.getElementById('product-ads-description');
      expect(descInput).toBeTruthy();
      expect(descInput.rows).toBe(3);
      expect(descInput.classList.contains('w-full')).toBe(true);
      expect(descInput.classList.contains('px-4')).toBe(true);
      expect(descInput.classList.contains('py-2')).toBe(true);
      expect(descInput.classList.contains('border')).toBe(true);
      expect(descInput.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have proper interests textarea', () => {
      const interestsInput = document.getElementById('product-ads-interests');
      expect(interestsInput).toBeTruthy();
      expect(interestsInput.rows).toBe(2);
      expect(interestsInput.placeholder).toContain('Contoh');
    });
  });
});
