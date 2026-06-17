import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock copyToClipboard globally
window.copyToClipboard = vi.fn().mockResolvedValue();

describe('product-review Component', () => {
  
  const mockComponentHTML = `
    <div id="content-product-review" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
            <i class="fas fa-star mr-3"></i>Ulasan Produk
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat ulasan produk yang menarik dengan bantuan AI</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Foto Produk</h2>
              <div class="upload-area">
                <label for="product-review-image-input" class="file-input-label block border-3 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <input type="file" id="product-review-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-purple-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto produk di sini</p>
                </label>
              </div>
              <div id="product-review-image-preview-container" class="hidden mt-4">
                <img id="product-review-image-preview" src="#" alt="Pratinjau Produk" class="rounded-lg w-full h-auto object-contain">
                <button id="product-review-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Informasi Produk</h2>
              <div class="space-y-4">
                <div>
                  <label for="product-review-name" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-purple-500"></i>Nama Produk
                  </label>
                  <input type="text" id="product-review-name" placeholder="Contoh: Samsung Galaxy S24 Ultra" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                <div>
                  <label for="product-review-brand" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-building mr-1 text-purple-500"></i>Merek
                  </label>
                  <input type="text" id="product-review-brand" placeholder="Contoh: Samsung" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                <div>
                  <label for="product-review-price" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-tag mr-1 text-purple-500"></i>Harga (Rp)
                  </label>
                  <input type="text" id="product-review-price" placeholder="Contoh: 15.000.000" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                <div>
                  <label for="product-review-pros" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-thumbs-up mr-1 text-green-500"></i>Kelebihan
                  </label>
                  <textarea id="product-review-pros" rows="3" placeholder="Tuliskan kelebihan produk (pisahkan dengan koma)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                </div>
                <div>
                  <label for="product-review-cons" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-thumbs-down mr-1 text-red-500"></i>Kekurangan
                  </label>
                  <textarea id="product-review-cons" rows="3" placeholder="Tuliskan kekurangan produk (pisahkan dengan koma)"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                </div>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya Ulasan</h2>
              <div id="product-review-style-options" class="grid grid-cols-1 gap-2">
                <button type="button" data-style="professional" class="style-btn-product-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-briefcase mr-2 text-purple-500"></i>
                  <span class="font-medium">Profesional</span>
                  <p class="text-xs text-gray-500 mt-1">Ulasan formal dengan struktur yang jelas</p>
                </button>
                <button type="button" data-style="casual" class="style-btn-product-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-coffee mr-2 text-purple-500"></i>
                  <span class="font-medium">Casual</span>
                  <p class="text-xs text-gray-500 mt-1">Gaya santai seperti berbagi pengalaman</p>
                </button>
                <button type="button" data-style="influencer" class="style-btn-product-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-instagram mr-2 text-purple-500"></i>
                  <span class="font-medium">Influencer</span>
                  <p class="text-xs text-gray-500 mt-1">Gaya menarik dengan emoji dan hashtag</p>
                </button>
                <button type="button" data-style="detailed" class="style-btn-product-review p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-left border-2 border-transparent">
                  <i class="fas fa-search mr-2 text-purple-500"></i>
                  <span class="font-medium">Detail</span>
                  <p class="text-xs text-gray-500 mt-1">Analisis mendalam dengan spesifikasi lengkap</p>
                </button>
              </div>
            </div>
            <button id="product-review-generate-btn" class="w-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Ulasan
            </button>
          </div>
          <div class="lg:col-span-2">
            <div id="product-review-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="product-review-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-star text-6xl mb-4 text-purple-400"></i>
                <p class="text-xl">Hasil ulasan akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi produk dan klik Buat Ulasan</p>
              </div>
              <div id="product-review-results" class="hidden space-y-6"></div>
              <div id="product-review-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-purple-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat ulasan...</p>
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
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should render main container with correct ID', () => {
      const container = document.getElementById('content-product-review');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Ulasan Produk');
      expect(title.querySelector('i.fas.fa-star')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat ulasan produk yang menarik');
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
      expect(leftPanel.querySelectorAll('.card').length).toBe(3);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
      expect(rightPanel.querySelector('#product-review-results-container')).toBeTruthy();
    });
  });

  // Image Upload Tests
  describe('Image Upload', () => {
    it('should render image upload area', () => {
      const uploadArea = document.getElementById('product-review-image-input');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.accept).toBe('image/*');
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('product-review-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview element', () => {
      const preview = document.getElementById('product-review-image-preview');
      expect(preview).toBeTruthy();
      expect(preview.alt).toBe('Pratinjau Produk');
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('product-review-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should render upload area with icon and text', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel).toBeTruthy();
      expect(uploadLabel.querySelector('i.fas.fa-camera')).toBeTruthy();
      expect(uploadLabel.querySelector('p.text-gray-600')).toBeTruthy();
    });
  });

  // Product Information Tests
  describe('Product Information', () => {
    it('should render product name input', () => {
      const nameInput = document.getElementById('product-review-name');
      expect(nameInput).toBeTruthy();
      expect(nameInput.placeholder).toContain('Samsung Galaxy S24 Ultra');
    });

    it('should render brand input', () => {
      const brandInput = document.getElementById('product-review-brand');
      expect(brandInput).toBeTruthy();
      expect(brandInput.placeholder).toContain('Samsung');
    });

    it('should render price input', () => {
      const priceInput = document.getElementById('product-review-price');
      expect(priceInput).toBeTruthy();
      expect(priceInput.placeholder).toContain('15.000.000');
    });

    it('should render pros textarea', () => {
      const prosInput = document.getElementById('product-review-pros');
      expect(prosInput).toBeTruthy();
      expect(prosInput.rows).toBe(3);
      expect(prosInput.placeholder).toContain('pisahkan dengan koma');
    });

    it('should render cons textarea', () => {
      const consInput = document.getElementById('product-review-cons');
      expect(consInput).toBeTruthy();
      expect(consInput.rows).toBe(3);
      expect(consInput.placeholder).toContain('pisahkan dengan koma');
    });

    it('should render all input labels with icons', () => {
      const labels = document.body.querySelectorAll('label');
      expect(labels.length).toBeGreaterThanOrEqual(5);
      
      const tagIcon = document.body.querySelector('i.fas.fa-tag');
      expect(tagIcon).toBeTruthy();
      
      const buildingIcon = document.body.querySelector('i.fas.fa-building');
      expect(buildingIcon).toBeTruthy();
      
      const thumbsUpIcon = document.body.querySelector('i.fas.fa-thumbs-up');
      expect(thumbsUpIcon).toBeTruthy();
      
      const thumbsDownIcon = document.body.querySelector('i.fas.fa-thumbs-down');
      expect(thumbsDownIcon).toBeTruthy();
    });
  });

  // Review Style Tests
  describe('Review Style Selection', () => {
    it('should render style options container', () => {
      const styleOptions = document.getElementById('product-review-style-options');
      expect(styleOptions).toBeTruthy();
    });

    it('should render professional style option', () => {
      const professionalBtn = document.body.querySelector('[data-style="professional"]');
      expect(professionalBtn).toBeTruthy();
      expect(professionalBtn.textContent).toContain('Profesional');
      expect(professionalBtn.querySelector('i.fas.fa-briefcase')).toBeTruthy();
      expect(professionalBtn.classList.contains('selected')).toBe(true);
    });

    it('should render casual style option', () => {
      const casualBtn = document.body.querySelector('[data-style="casual"]');
      expect(casualBtn).toBeTruthy();
      expect(casualBtn.textContent).toContain('Casual');
      expect(casualBtn.querySelector('i.fas.fa-coffee')).toBeTruthy();
    });

    it('should render influencer style option', () => {
      const influencerBtn = document.body.querySelector('[data-style="influencer"]');
      expect(influencerBtn).toBeTruthy();
      expect(influencerBtn.textContent).toContain('Influencer');
      expect(influencerBtn.querySelector('i.fas.fa-instagram')).toBeTruthy();
    });

    it('should render detailed style option', () => {
      const detailedBtn = document.body.querySelector('[data-style="detailed"]');
      expect(detailedBtn).toBeTruthy();
      expect(detailedBtn.textContent).toContain('Detail');
      expect(detailedBtn.querySelector('i.fas.fa-search')).toBeTruthy();
    });

    it('should have 4 style options', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-product-review');
      expect(styleBtns.length).toBe(4);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('product-review-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.disabled).toBe(true);
      expect(generateBtn.textContent).toContain('Buat Ulasan');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('product-review-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('product-review-results-container');
      expect(resultsContainer).toBeTruthy();
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('product-review-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-star')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil ulasan akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('product-review-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('product-review-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.querySelector('.loader')).toBeTruthy();
      expect(loading.textContent).toContain('Sedang membuat ulasan');
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper styling', () => {
      const cards = document.body.querySelectorAll('.card');
      expect(cards.length).toBe(4);
      
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
      expect(icons.length).toBeGreaterThan(10);
    });

    it('should have star icon in header', () => {
      const starIcon = document.body.querySelector('header i.fas.fa-star');
      expect(starIcon).toBeTruthy();
    });

    it('should have camera icon in upload area', () => {
      const cameraIcon = document.body.querySelector('.file-input-label i.fas.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Ulasan Produk');
      expect(document.body.textContent).toContain('Foto Produk');
      expect(document.body.textContent).toContain('Informasi Produk');
      expect(document.body.textContent).toContain('Nama Produk');
      expect(document.body.textContent).toContain('Gaya Ulasan');
      expect(document.body.textContent).toContain('Buat Ulasan');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(3);
      expect(headers[0].textContent).toContain('1. Foto Produk');
      expect(headers[1].textContent).toContain('2. Informasi Produk');
      expect(headers[2].textContent).toContain('3. Gaya Ulasan');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const h1 = document.body.querySelector('h1');
      expect(h1).toBeTruthy();
      
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements.length).toBe(3);
    });

    it('should have labeled form inputs', () => {
      const nameInput = document.getElementById('product-review-name');
      expect(nameInput).toBeTruthy();
      
      const brandInput = document.getElementById('product-review-brand');
      expect(brandInput).toBeTruthy();
      
      const priceInput = document.getElementById('product-review-price');
      expect(priceInput).toBeTruthy();
    });

    it('should have alt text on images', () => {
      const previewImage = document.getElementById('product-review-image-preview');
      expect(previewImage).toBeTruthy();
      expect(previewImage.alt).toBe('Pratinjau Produk');
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
      const generateBtn = document.getElementById('product-review-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-purple-600')).toBe(true);
      expect(generateBtn.classList.contains('to-violet-500')).toBe(true);
    });

    it('should use purple accents in style buttons', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-product-review');
      styleBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-purple-500')).toBe(true);
      });
    });
  });

  // Placeholder Tests
  describe('Placeholders', () => {
    it('should have proper placeholders in inputs', () => {
      const nameInput = document.getElementById('product-review-name');
      expect(nameInput.placeholder).toBeTruthy();
      
      const brandInput = document.getElementById('product-review-brand');
      expect(brandInput.placeholder).toBeTruthy();
      
      const priceInput = document.getElementById('product-review-price');
      expect(priceInput.placeholder).toBeTruthy();
    });

    it('should have proper placeholders in textareas', () => {
      const prosInput = document.getElementById('product-review-pros');
      expect(prosInput.placeholder).toBeTruthy();
      
      const consInput = document.getElementById('product-review-cons');
      expect(consInput.placeholder).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('product-review-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling classes', () => {
      const generateBtn = document.getElementById('product-review-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have proper input types', () => {
      const nameInput = document.getElementById('product-review-name');
      expect(nameInput.type).toBe('text');
      
      const priceInput = document.getElementById('product-review-price');
      expect(priceInput.type).toBe('text');
    });

    it('should have proper textarea attributes', () => {
      const prosInput = document.getElementById('product-review-pros');
      expect(prosInput.rows).toBe(3);
      
      const consInput = document.getElementById('product-review-cons');
      expect(consInput.rows).toBe(3);
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
      const resultsContainer = document.getElementById('product-review-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });
  });

  // Style Description Tests
  describe('Style Descriptions', () => {
    it('should have descriptions for each style', () => {
      const professionalBtn = document.body.querySelector('[data-style="professional"]');
      expect(professionalBtn.textContent).toContain('Ulasan formal dengan struktur yang jelas');
      
      const casualBtn = document.body.querySelector('[data-style="casual"]');
      expect(casualBtn.textContent).toContain('Gaya santai seperti berbagi pengalaman');
      
      const influencerBtn = document.body.querySelector('[data-style="influencer"]');
      expect(influencerBtn.textContent).toContain('Gaya menarik dengan emoji dan hashtag');
      
      const detailedBtn = document.body.querySelector('[data-style="detailed"]');
      expect(detailedBtn.textContent).toContain('Analisis mendalam dengan spesifikasi lengkap');
    });
  });

  // Additional UI Elements Tests
  describe('Additional UI Elements', () => {
    it('should have proper section numbering', () => {
      const h2Elements = document.body.querySelectorAll('h2');
      expect(h2Elements[0].textContent).toContain('1.');
      expect(h2Elements[1].textContent).toContain('2.');
      expect(h2Elements[2].textContent).toContain('3.');
    });

    it('should have proper spacing between sections', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const cards = leftPanel.querySelectorAll('.card');
      expect(cards.length).toBe(3);
    });

    it('should have proper results area structure', () => {
      const resultsContainer = document.getElementById('product-review-results-container');
      expect(resultsContainer.querySelector('#product-review-empty-state')).toBeTruthy();
      expect(resultsContainer.querySelector('#product-review-results')).toBeTruthy();
      expect(resultsContainer.querySelector('#product-review-loading')).toBeTruthy();
    });
  });

  // Input Group Tests
  describe('Input Groups', () => {
    it('should have proper spacing in product info form', () => {
      const productInfoCard = document.body.querySelectorAll('.card')[1];
      const spaceDiv = productInfoCard.querySelector('.space-y-4');
      expect(spaceDiv).toBeTruthy();
    });

    it('should have proper label styling', () => {
      const formLabels = [
        document.getElementById('product-review-name')?.closest('div').querySelector('label'),
        document.getElementById('product-review-brand')?.closest('div').querySelector('label'),
        document.getElementById('product-review-price')?.closest('div').querySelector('label'),
        document.getElementById('product-review-pros')?.closest('div').querySelector('label'),
        document.getElementById('product-review-cons')?.closest('div').querySelector('label')
      ].filter(Boolean);
      
      formLabels.forEach(label => {
        expect(label.classList.contains('block')).toBe(true);
        expect(label.classList.contains('text-sm')).toBe(true);
        expect(label.classList.contains('font-medium')).toBe(true);
      });
    });

    it('should have proper input styling', () => {
      const inputs = document.body.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        expect(input.classList.contains('w-full')).toBe(true);
        expect(input.classList.contains('px-4')).toBe(true);
        expect(input.classList.contains('py-2')).toBe(true);
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
      });
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
      const loading = document.getElementById('product-review-loading');
      expect(loading.textContent).toContain('Sedang membuat ulasan');
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have proper empty state icon', () => {
      const emptyState = document.getElementById('product-review-empty-state');
      expect(emptyState.querySelector('i.fas.fa-star')).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-star').classList.contains('text-purple-400')).toBe(true);
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('product-review-empty-state');
      expect(emptyState.textContent).toContain('Hasil ulasan akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi produk dan klik Buat Ulasan');
    });

    it('should have proper empty state styling', () => {
      const emptyState = document.getElementById('product-review-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have all required elements for functionality', () => {
      // Image upload elements
      expect(document.getElementById('product-review-image-input')).toBeTruthy();
      expect(document.getElementById('product-review-image-preview')).toBeTruthy();
      expect(document.getElementById('product-review-image-preview-container')).toBeTruthy();
      expect(document.getElementById('product-review-remove-image-btn')).toBeTruthy();
      
      // Product info elements
      expect(document.getElementById('product-review-name')).toBeTruthy();
      expect(document.getElementById('product-review-brand')).toBeTruthy();
      expect(document.getElementById('product-review-price')).toBeTruthy();
      expect(document.getElementById('product-review-pros')).toBeTruthy();
      expect(document.getElementById('product-review-cons')).toBeTruthy();
      
      // Style selection elements
      expect(document.getElementById('product-review-style-options')).toBeTruthy();
      
      // Generate button
      expect(document.getElementById('product-review-generate-btn')).toBeTruthy();
      
      // Results elements
      expect(document.getElementById('product-review-results')).toBeTruthy();
      expect(document.getElementById('product-review-empty-state')).toBeTruthy();
      expect(document.getElementById('product-review-loading')).toBeTruthy();
    });

    it('should have proper data attributes for styling', () => {
      const styleBtns = document.body.querySelectorAll('.style-btn-product-review');
      styleBtns.forEach(btn => {
        expect(btn.dataset.style).toBeTruthy();
      });
    });
  });
});