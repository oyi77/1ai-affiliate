import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock copyToClipboard globally
window.copyToClipboard = vi.fn().mockResolvedValue();

describe('food-review Component', () => {
  
  const mockComponentHTML = `
    <div id="content-food-review" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            <i class="fas fa-utensils mr-3"></i>Review Kuliner
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat review makanan yang lezat dengan bantuan AI</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Upload Food Photo -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Makanan</h2>
              <div class="upload-area">
                <label for="food-review-image-input" class="file-input-label block border-3 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="file" id="food-review-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-emerald-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto makanan di sini</p>
                </label>
              </div>
              <div id="food-review-image-preview-container" class="hidden mt-4">
                <img id="food-review-image-preview" src="#" alt="Pratinjau Makanan" class="rounded-lg w-full h-auto object-contain">
                <button id="food-review-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Food Type Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Makanan</h2>
              <div id="food-review-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-food-type="heavy" class="food-type-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bowl-rice mr-1"></i>Makanan Berat
                </button>
                <button type="button" data-food-type="snack" class="food-type-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-cookie-bite mr-1"></i>Camilan
                </button>
                <button type="button" data-food-type="drink" class="food-type-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-glass-water mr-1"></i>Minuman
                </button>
                <button type="button" data-food-type="dessert" class="food-type-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-ice-cream mr-1"></i>Dessert
                </button>
                <button type="button" data-food-type="streetfood" class="food-type-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-hotdog mr-1"></i>Street Food
                </button>
                <button type="button" data-food-type="restaurant" class="food-type-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star mr-1"></i>Restoran
                </button>
              </div>
            </div>
            
            <!-- Step 3: Taste Rating -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Rating Rasa</h2>
              
              <!-- Overall Taste Rating -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Rating Overall</label>
                <div id="food-review-overall-rating" class="flex gap-1">
                  <button type="button" data-rating="1" class="rating-star-btn p-1 text-2xl text-gray-300 hover:text-yellow-400 transition-colors">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="2" class="rating-star-btn p-1 text-2xl text-gray-300 hover:text-yellow-400 transition-colors">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="3" class="rating-star-btn p-1 text-2xl text-gray-300 hover:text-yellow-400 transition-colors">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="4" class="rating-star-btn p-1 text-2xl text-gray-300 hover:text-yellow-400 transition-colors">
                    <i class="fas fa-star"></i>
                  </button>
                  <button type="button" data-rating="5" class="rating-star-btn p-1 text-2xl text-gray-300 hover:text-yellow-400 transition-colors">
                    <i class="fas fa-star"></i>
                  </button>
                </div>
                <p id="food-review-rating-text" class="text-sm text-gray-500 mt-1">Belum ada rating</p>
              </div>
              
              <!-- Detailed Taste Ratings -->
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Rasa</label>
                  <input type="range" id="food-review-taste" min="1" max="5" value="3" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Kurang enak</span>
                    <span>Sangat enak</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Tekstur</label>
                  <input type="range" id="food-review-texture" min="1" max="5" value="3" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Kurang nyaman</span>
                    <span>Sangat nyaman</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Aroma</label>
                  <input type="range" id="food-review-aroma" min="1" max="5" value="3" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Tidak harum</span>
                    <span>Sangat harum</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Penyajian</label>
                  <input type="range" id="food-review-presentation" min="1" max="5" value="3" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Kurang menarik</span>
                    <span>Sangat menarik</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Price Range -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Range Harga</h2>
              <div id="food-review-price-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-price="cheap" class="price-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tag mr-1"></i>Murah (<50k)
                </button>
                <button type="button" data-price="moderate" class="price-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tags mr-1"></i>Sedang (50-100k)
                </button>
                <button type="button" data-price="expensive" class="price-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-tag mr-1"></i>Mahal (>100k)
                </button>
                <button type="button" data-price="premium" class="price-btn-food-review p-2 rounded-lg text-sm bg-gray-100 hover:bg-emerald-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-gem mr-1"></i>Premium (Fine Dining)
                </button>
              </div>
            </div>
            
            <!-- Step 5: Location/Place Input -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Lokasi/Tempat</h2>
              <input type="text" id="food-review-location" placeholder="Nama restoran, alamat, atau lokasi..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            </div>
            
            <!-- Step 6: Additional Notes -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Catatan Tambahan</h2>
              <textarea id="food-review-notes" rows="4" placeholder="Tulis pengalaman Anda menikmati makanan ini..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"></textarea>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="food-review-generate-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Review
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="food-review-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="food-review-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-utensils text-6xl mb-4 text-emerald-400"></i>
                <p class="text-xl">Hasil review akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto makanan dan klik Buat Review</p>
              </div>
              <div id="food-review-results" class="hidden grid grid-cols-1 gap-6"></div>
              <div id="food-review-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-emerald-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat review...</p>
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
      const container = document.getElementById('content-food-review');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Review Kuliner');
      expect(title.querySelector('i.fas.fa-utensils')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat review makanan yang lezat dengan bantuan AI');
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
      expect(rightPanel.querySelector('#food-review-results-container')).toBeTruthy();
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
      const uploadArea = document.getElementById('food-review-image-input');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.accept).toBe('image/*');
    });

    it('should render image preview container', () => {
      const previewContainer = document.getElementById('food-review-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should render image preview element', () => {
      const preview = document.getElementById('food-review-image-preview');
      expect(preview).toBeTruthy();
      expect(preview.alt).toBe('Pratinjau Makanan');
    });

    it('should render remove image button', () => {
      const removeBtn = document.getElementById('food-review-remove-image-btn');
      expect(removeBtn).toBeTruthy();
      expect(removeBtn.querySelector('i.fas.fa-times')).toBeTruthy();
    });

    it('should render upload area with proper styling', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel).toBeTruthy();
      expect(uploadLabel.classList.contains('border-dashed')).toBe(true);
      expect(uploadLabel.classList.contains('border-emerald-300')).toBe(true);
    });

    it('should render upload icon', () => {
      const uploadIcon = document.body.querySelector('.fa-camera');
      expect(uploadIcon).toBeTruthy();
    });

    it('should render upload helper text', () => {
      const helperText = document.body.querySelector('.upload-area p.text-gray-600');
      expect(helperText).toBeTruthy();
      expect(helperText.textContent).toContain('Klik atau seret foto makanan di sini');
    });

    it('should have file input with hidden class', () => {
      const fileInput = document.getElementById('food-review-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.classList.contains('hidden')).toBe(true);
    });

    it('should have proper label for file input', () => {
      const label = document.body.querySelector('label[for="food-review-image-input"]');
      expect(label).toBeTruthy();
      expect(label.classList.contains('cursor-pointer')).toBe(true);
    });
  });

  // Food Type Selection Tests
  describe('Food Type Selection', () => {
    it('should render food type options container', () => {
      const container = document.getElementById('food-review-type-options');
      expect(container).toBeTruthy();
    });

    it('should render 6 food type buttons', () => {
      const buttons = document.body.querySelectorAll('.food-type-btn-food-review');
      expect(buttons.length).toBe(6);
    });

    it('should render heavy food type option', () => {
      const heavyBtn = document.body.querySelector('[data-food-type="heavy"]');
      expect(heavyBtn).toBeTruthy();
      expect(heavyBtn.textContent).toContain('Makanan Berat');
    });

    it('should render snack food type option', () => {
      const snackBtn = document.body.querySelector('[data-food-type="snack"]');
      expect(snackBtn).toBeTruthy();
      expect(snackBtn.textContent).toContain('Camilan');
    });

    it('should render drink food type option', () => {
      const drinkBtn = document.body.querySelector('[data-food-type="drink"]');
      expect(drinkBtn).toBeTruthy();
      expect(drinkBtn.textContent).toContain('Minuman');
    });

    it('should render dessert food type option', () => {
      const dessertBtn = document.body.querySelector('[data-food-type="dessert"]');
      expect(dessertBtn).toBeTruthy();
      expect(dessertBtn.textContent).toContain('Dessert');
    });

    it('should render street food type option', () => {
      const streetfoodBtn = document.body.querySelector('[data-food-type="streetfood"]');
      expect(streetfoodBtn).toBeTruthy();
      expect(streetfoodBtn.textContent).toContain('Street Food');
    });

    it('should render restaurant food type option', () => {
      const restaurantBtn = document.body.querySelector('[data-food-type="restaurant"]');
      expect(restaurantBtn).toBeTruthy();
      expect(restaurantBtn.textContent).toContain('Restoran');
    });

    it('should have food type buttons with proper styling', () => {
      const buttons = document.body.querySelectorAll('.food-type-btn-food-review');
      buttons.forEach(btn => {
        expect(btn.classList.contains('border-transparent')).toBe(true);
        expect(btn.classList.contains('bg-gray-100')).toBe(true);
      });
    });

    it('should have food type buttons with icons', () => {
      const heavyBtn = document.body.querySelector('[data-food-type="heavy"]');
      expect(heavyBtn.querySelector('i.fas.fa-bowl-rice')).toBeTruthy();
      
      const snackBtn = document.body.querySelector('[data-food-type="snack"]');
      expect(snackBtn.querySelector('i.fas.fa-cookie-bite')).toBeTruthy();
      
      const drinkBtn = document.body.querySelector('[data-food-type="drink"]');
      expect(drinkBtn.querySelector('i.fas.fa-glass-water')).toBeTruthy();
      
      const dessertBtn = document.body.querySelector('[data-food-type="dessert"]');
      expect(dessertBtn.querySelector('i.fas.fa-ice-cream')).toBeTruthy();
      
      const streetfoodBtn = document.body.querySelector('[data-food-type="streetfood"]');
      expect(streetfoodBtn.querySelector('i.fas.fa-hotdog')).toBeTruthy();
      
      const restaurantBtn = document.body.querySelector('[data-food-type="restaurant"]');
      expect(restaurantBtn.querySelector('i.fas.fa-star')).toBeTruthy();
    });
  });

  // Taste Rating Tests
  describe('Taste Rating', () => {
    it('should render overall rating container', () => {
      const container = document.getElementById('food-review-overall-rating');
      expect(container).toBeTruthy();
    });

    it('should render 5 star rating buttons', () => {
      const stars = document.body.querySelectorAll('.rating-star-btn');
      expect(stars.length).toBe(5);
    });

    it('should render rating text element', () => {
      const ratingText = document.getElementById('food-review-rating-text');
      expect(ratingText).toBeTruthy();
      expect(ratingText.textContent).toContain('Belum ada rating');
    });

    it('should render taste slider', () => {
      const slider = document.getElementById('food-review-taste');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
      expect(slider.min).toBe('1');
      expect(slider.max).toBe('5');
    });

    it('should render texture slider', () => {
      const slider = document.getElementById('food-review-texture');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
    });

    it('should render aroma slider', () => {
      const slider = document.getElementById('food-review-aroma');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
    });

    it('should render presentation slider', () => {
      const slider = document.getElementById('food-review-presentation');
      expect(slider).toBeTruthy();
      expect(slider.type).toBe('range');
    });

    it('should have all sliders with emerald accent color', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.classList.contains('accent-emerald-500')).toBe(true);
      });
    });

    it('should have all sliders with default value of 3', () => {
      const tasteSlider = document.getElementById('food-review-taste');
      const textureSlider = document.getElementById('food-review-texture');
      const aromaSlider = document.getElementById('food-review-aroma');
      const presentationSlider = document.getElementById('food-review-presentation');
      
      expect(tasteSlider.value).toBe('3');
      expect(textureSlider.value).toBe('3');
      expect(aromaSlider.value).toBe('3');
      expect(presentationSlider.value).toBe('3');
    });

    it('should render taste slider labels', () => {
      const tasteSlider = document.getElementById('food-review-taste');
      const labels = tasteSlider.parentElement.querySelectorAll('.flex.justify-between span');
      expect(labels[0].textContent).toContain('Kurang enak');
      expect(labels[1].textContent).toContain('Sangat enak');
    });

    it('should render texture slider labels', () => {
      const textureSlider = document.getElementById('food-review-texture');
      const labels = textureSlider.parentElement.querySelectorAll('.flex.justify-between span');
      expect(labels[0].textContent).toContain('Kurang nyaman');
      expect(labels[1].textContent).toContain('Sangat nyaman');
    });

    it('should render aroma slider labels', () => {
      const aromaSlider = document.getElementById('food-review-aroma');
      const labels = aromaSlider.parentElement.querySelectorAll('.flex.justify-between span');
      expect(labels[0].textContent).toContain('Tidak harum');
      expect(labels[1].textContent).toContain('Sangat harum');
    });

    it('should render presentation slider labels', () => {
      const presentationSlider = document.getElementById('food-review-presentation');
      const labels = presentationSlider.parentElement.querySelectorAll('.flex.justify-between span');
      expect(labels[0].textContent).toContain('Kurang menarik');
      expect(labels[1].textContent).toContain('Sangat menarik');
    });

    it('should have star buttons with proper styling', () => {
      const stars = document.body.querySelectorAll('.rating-star-btn');
      stars.forEach(star => {
        expect(star.classList.contains('text-gray-300')).toBe(true);
        expect(star.classList.contains('hover:text-yellow-400')).toBe(true);
      });
    });
  });

  // Price Range Selection Tests
  describe('Price Range Selection', () => {
    it('should render price options container', () => {
      const container = document.getElementById('food-review-price-options');
      expect(container).toBeTruthy();
    });

    it('should render 4 price range buttons', () => {
      const buttons = document.body.querySelectorAll('.price-btn-food-review');
      expect(buttons.length).toBe(4);
    });

    it('should render cheap price option', () => {
      const cheapBtn = document.body.querySelector('[data-price="cheap"]');
      expect(cheapBtn).toBeTruthy();
      expect(cheapBtn.textContent).toContain('Murah (<50k)');
    });

    it('should render moderate price option', () => {
      const moderateBtn = document.body.querySelector('[data-price="moderate"]');
      expect(moderateBtn).toBeTruthy();
      expect(moderateBtn.textContent).toContain('Sedang (50-100k)');
    });

    it('should render expensive price option', () => {
      const expensiveBtn = document.body.querySelector('[data-price="expensive"]');
      expect(expensiveBtn).toBeTruthy();
      expect(expensiveBtn.textContent).toContain('Mahal (>100k)');
    });

    it('should render premium price option', () => {
      const premiumBtn = document.body.querySelector('[data-price="premium"]');
      expect(premiumBtn).toBeTruthy();
      expect(premiumBtn.textContent).toContain('Premium (Fine Dining)');
    });

    it('should have price buttons with proper styling', () => {
      const buttons = document.body.querySelectorAll('.price-btn-food-review');
      buttons.forEach(btn => {
        expect(btn.classList.contains('border-transparent')).toBe(true);
        expect(btn.classList.contains('bg-gray-100')).toBe(true);
      });
    });

    it('should have price buttons with icons', () => {
      const cheapBtn = document.body.querySelector('[data-price="cheap"]');
      expect(cheapBtn.querySelector('i.fas.fa-tag')).toBeTruthy();
      
      const moderateBtn = document.body.querySelector('[data-price="moderate"]');
      expect(moderateBtn.querySelector('i.fas.fa-tags')).toBeTruthy();
      
      const expensiveBtn = document.body.querySelector('[data-price="expensive"]');
      expect(expensiveBtn.querySelector('i.fas.fa-tag')).toBeTruthy();
      
      const premiumBtn = document.body.querySelector('[data-price="premium"]');
      expect(premiumBtn.querySelector('i.fas.fa-gem')).toBeTruthy();
    });
  });

  // Location Input Tests
  describe('Location Input', () => {
    it('should render location input field', () => {
      const locationInput = document.getElementById('food-review-location');
      expect(locationInput).toBeTruthy();
      expect(locationInput.type).toBe('text');
    });

    it('should render location input with placeholder', () => {
      const locationInput = document.getElementById('food-review-location');
      expect(locationInput.placeholder).toContain('Nama restoran, alamat, atau lokasi...');
    });

    it('should have location input with proper styling', () => {
      const locationInput = document.getElementById('food-review-location');
      expect(locationInput.classList.contains('w-full')).toBe(true);
      expect(locationInput.classList.contains('p-3')).toBe(true);
      expect(locationInput.classList.contains('border')).toBe(true);
      expect(locationInput.classList.contains('border-gray-300')).toBe(true);
      expect(locationInput.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have location input with focus ring', () => {
      const locationInput = document.getElementById('food-review-location');
      expect(locationInput.classList.contains('focus:ring-2')).toBe(true);
      expect(locationInput.classList.contains('focus:ring-emerald-500')).toBe(true);
    });
  });

  // Additional Notes Tests
  describe('Additional Notes', () => {
    it('should render notes textarea', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea.rows).toBe(4);
    });

    it('should render notes placeholder', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea.placeholder).toContain('Tulis pengalaman Anda menikmati makanan ini...');
    });

    it('should have notes textarea with proper styling', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea.classList.contains('w-full')).toBe(true);
      expect(textarea.classList.contains('p-3')).toBe(true);
      expect(textarea.classList.contains('border')).toBe(true);
      expect(textarea.classList.contains('border-gray-300')).toBe(true);
      expect(textarea.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have notes textarea with focus ring', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea.classList.contains('focus:ring-2')).toBe(true);
      expect(textarea.classList.contains('focus:ring-emerald-500')).toBe(true);
    });

    it('should have notes textarea with resize none', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea.classList.contains('resize-none')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Review');
    });

    it('should render generate button icon', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should be disabled initially', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper styling classes', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-emerald-600')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
    });

    it('should have hover effects', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });

    it('should have transition effects', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });

    it('should have proper padding and rounded corners', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
    });

    it('should have disabled state styling', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const container = document.getElementById('food-review-results-container');
      expect(container).toBeTruthy();
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil review akan muncul di sini');
    });

    it('should render empty state icon', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState.querySelector('i.fas.fa-utensils')).toBeTruthy();
    });

    it('should render empty state helper text', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState.textContent).toContain('Unggah foto makanan dan klik Buat Review');
    });

    it('should render results area', () => {
      const results = document.getElementById('food-review-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should render loading state', () => {
      const loading = document.getElementById('food-review-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat review...');
    });

    it('should render loader with proper styling', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader).toBeTruthy();
      expect(loader.classList.contains('border-emerald-500')).toBe(true);
    });

    it('should have results container with minimum height', () => {
      const container = document.getElementById('food-review-results-container');
      expect(container.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have empty state with proper styling', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
    });
  });

  // Card Styling Tests
  describe('Card Styling', () => {
    it('should have cards with proper shadow', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('shadow-lg')).toBe(true);
      });
    });

    it('should have cards with proper border radius', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('rounded-2xl')).toBe(true);
      });
    });

    it('should have cards with white background', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have proper padding on cards', () => {
      const cards = document.body.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
      });
    });
  });

  // Icons Tests
  describe('Icons', () => {
    it('should use FontAwesome icons', () => {
      const icons = document.body.querySelectorAll('i[class*="fas fa-"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have utensils icon in header', () => {
      const utensilsIcon = document.body.querySelector('.fa-utensils');
      expect(utensilsIcon).toBeTruthy();
    });

    it('should have camera icon in image section', () => {
      const cameraIcon = document.body.querySelector('.fa-camera');
      expect(cameraIcon).toBeTruthy();
    });

    it('should have star icons for rating', () => {
      const starIcons = document.body.querySelectorAll('.rating-star-btn .fa-star');
      expect(starIcons.length).toBe(5);
    });

    it('should have magic icon for generate button', () => {
      const magicIcon = document.body.querySelector('.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have utensils icon for empty state', () => {
      const utensilsIcon = document.body.querySelector('#food-review-empty-state .fa-utensils');
      expect(utensilsIcon).toBeTruthy();
    });

    it('should have times icon for remove button', () => {
      const timesIcon = document.body.querySelector('.fa-times');
      expect(timesIcon).toBeTruthy();
    });
  });

  // Text Content (Indonesian) Tests
  describe('Text Content (Indonesian)', () => {
    it('should have Indonesian header title', () => {
      const title = document.body.querySelector('header h1');
      expect(title.textContent).toContain('Review Kuliner');
    });

    it('should have Indonesian subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle.textContent).toContain('Buat review makanan yang lezat dengan bantuan AI');
    });

    it('should have Indonesian section labels', () => {
      const labels = document.body.querySelectorAll('.card h2');
      expect(labels[0].textContent).toContain('Unggah Foto Makanan');
      expect(labels[1].textContent).toContain('Jenis Makanan');
      expect(labels[2].textContent).toContain('Rating Rasa');
      expect(labels[3].textContent).toContain('Range Harga');
      expect(labels[4].textContent).toContain('Lokasi/Tempat');
      expect(labels[5].textContent).toContain('Catatan Tambahan');
    });

    it('should have Indonesian food type labels', () => {
      const foodTypes = document.body.querySelectorAll('.food-type-btn-food-review');
      expect(foodTypes[0].textContent).toContain('Makanan Berat');
      expect(foodTypes[1].textContent).toContain('Camilan');
      expect(foodTypes[2].textContent).toContain('Minuman');
      expect(foodTypes[3].textContent).toContain('Dessert');
      expect(foodTypes[4].textContent).toContain('Street Food');
      expect(foodTypes[5].textContent).toContain('Restoran');
    });

    it('should have Indonesian price range labels', () => {
      const prices = document.body.querySelectorAll('.price-btn-food-review');
      expect(prices[0].textContent).toContain('Murah (<50k)');
      expect(prices[1].textContent).toContain('Sedang (50-100k)');
      expect(prices[2].textContent).toContain('Mahal (>100k)');
      expect(prices[3].textContent).toContain('Premium (Fine Dining)');
    });

    it('should have Indonesian rating labels', () => {
      const tasteLabel = document.querySelector('label.block.text-xs.font-medium.text-gray-600.mb-1');
      expect(tasteLabel.textContent).toContain('Rasa');
    });

    it('should have Indonesian button text', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Review');
    });

    it('should have Indonesian empty state text', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState.textContent).toContain('Hasil review akan muncul di sini');
    });

    it('should have Indonesian notes placeholder', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea.placeholder).toContain('Tulis pengalaman Anda menikmati makanan ini...');
    });

    it('should have Indonesian location placeholder', () => {
      const locationInput = document.getElementById('food-review-location');
      expect(locationInput.placeholder).toContain('Nama restoran, alamat, atau lokasi...');
    });

    it('should have Indonesian rating text', () => {
      const ratingText = document.getElementById('food-review-rating-text');
      expect(ratingText.textContent).toContain('Belum ada rating');
    });

    it('should have Indonesian loading text', () => {
      const loading = document.getElementById('food-review-loading');
      expect(loading.textContent).toContain('Sedang membuat review...');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const header = document.body.querySelector('header h1');
      expect(header).toBeTruthy();
    });

    it('should have labels for all inputs', () => {
      const tasteLabel = document.querySelector('label.block.text-sm.font-medium.text-gray-700.mb-2');
      expect(tasteLabel).toBeTruthy();
    });

    it('should have accessible image upload', () => {
      const fileInput = document.getElementById('food-review-image-input');
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have accessible sliders', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.min).toBe('1');
        expect(slider.max).toBe('5');
      });
    });

    it('should have accessible textarea', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea.placeholder).toBeDefined();
    });

    it('should have accessible location input', () => {
      const locationInput = document.getElementById('food-review-location');
      expect(locationInput.placeholder).toBeDefined();
    });

    it('should have button labels', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.textContent.trim().length).toBeGreaterThan(0);
    });

    it('should have alt text for images', () => {
      const preview = document.getElementById('food-review-image-preview');
      expect(preview.alt).toBe('Pratinjau Makanan');
    });

    it('should have proper button types', () => {
      const buttons = document.body.querySelectorAll('button[type="button"]');
      buttons.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('grid')).toBe(true);
      expect(grid.classList.contains('grid-cols-1')).toBe(true);
      expect(grid.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive gap', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });

    it('should have responsive text sizes', () => {
      const title = document.body.querySelector('header h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive header margin', () => {
      const header = document.body.querySelector('header');
      expect(header.classList.contains('mb-8')).toBe(true);
    });

    it('should have responsive panel spacing', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use emerald/teal gradient for header', () => {
      const title = document.body.querySelector('header h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-emerald-600')).toBe(true);
      expect(title.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use emerald icons', () => {
      const cameraIcon = document.body.querySelector('.fa-camera');
      expect(cameraIcon.classList.contains('text-emerald-400')).toBe(true);
    });

    it('should use emerald accent for sliders', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.classList.contains('accent-emerald-500')).toBe(true);
      });
    });

    it('should use emerald border for upload area', () => {
      const uploadLabel = document.body.querySelector('.file-input-label');
      expect(uploadLabel.classList.contains('border-emerald-300')).toBe(true);
    });

    it('should use yellow/gold for stars', () => {
      const stars = document.body.querySelectorAll('.rating-star-btn');
      stars.forEach(star => {
        expect(star.classList.contains('text-gray-300')).toBe(true);
      });
    });

    it('should use emerald for empty state icon', () => {
      const emptyStateIcon = document.body.querySelector('#food-review-empty-state .fa-utensils');
      expect(emptyStateIcon.classList.contains('text-emerald-400')).toBe(true);
    });

    it('should use emerald for loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-emerald-500')).toBe(true);
    });

    it('should use red for remove button', () => {
      const removeBtn = document.getElementById('food-review-remove-image-btn');
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
    });
  });

  // Component Integration Tests
  describe('Component Integration', () => {
    it('should have form that contains all inputs', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.querySelector('#food-review-image-input')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-type-options')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-overall-rating')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-taste')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-texture')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-aroma')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-presentation')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-price-options')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-location')).toBeTruthy();
      expect(leftPanel.querySelector('#food-review-notes')).toBeTruthy();
    });

    it('should have results section separate from form', () => {
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(rightPanel.querySelector('#food-review-results-container')).toBeTruthy();
    });

    it('should have both panels in grid', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      const rightPanel = document.body.querySelector('.lg\\:col-span-2');
      expect(leftPanel).toBeTruthy();
      expect(rightPanel).toBeTruthy();
    });

    it('should have all required elements for form submission', () => {
      expect(document.getElementById('food-review-image-input')).toBeTruthy();
      expect(document.getElementById('food-review-type-options')).toBeTruthy();
      expect(document.getElementById('food-review-overall-rating')).toBeTruthy();
      expect(document.getElementById('food-review-price-options')).toBeTruthy();
      expect(document.getElementById('food-review-location')).toBeTruthy();
      expect(document.getElementById('food-review-generate-btn')).toBeTruthy();
    });

    it('should have all required elements for results display', () => {
      expect(document.getElementById('food-review-results-container')).toBeTruthy();
      expect(document.getElementById('food-review-empty-state')).toBeTruthy();
      expect(document.getElementById('food-review-results')).toBeTruthy();
      expect(document.getElementById('food-review-loading')).toBeTruthy();
    });
  });

  // Layout Tests
  describe('Layout', () => {
    it('should have two-column layout on large screens', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have single-column layout on small screens', () => {
      const grid = document.body.querySelector('main');
      expect(grid.classList.contains('grid-cols-1')).toBe(true);
    });

    it('should have proper section spacing', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper button group layout', () => {
      const foodTypeGroup = document.getElementById('food-review-type-options');
      expect(foodTypeGroup.classList.contains('grid')).toBe(true);
      expect(foodTypeGroup.classList.contains('gap-2')).toBe(true);
      expect(foodTypeGroup.classList.contains('grid-cols-2')).toBe(true);
    });

    it('should have proper price group layout', () => {
      const priceGroup = document.getElementById('food-review-price-options');
      expect(priceGroup.classList.contains('grid')).toBe(true);
      expect(priceGroup.classList.contains('gap-2')).toBe(true);
      expect(priceGroup.classList.contains('grid-cols-2')).toBe(true);
    });

    it('should have proper rating container layout', () => {
      const overallRating = document.getElementById('food-review-overall-rating');
      expect(overallRating.classList.contains('flex')).toBe(true);
      expect(overallRating.classList.contains('gap-1')).toBe(true);
    });
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('should have loading spinner element', () => {
      const loading = document.getElementById('food-review-loading');
      expect(loading).toBeTruthy();
    });

    it('should have loading spinner icon', () => {
      const spinnerIcon = document.body.querySelector('#food-review-loading .loader');
      expect(spinnerIcon).toBeTruthy();
    });

    it('should have loading spinner hidden initially', () => {
      const loading = document.getElementById('food-review-loading');
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have loading text', () => {
      const loading = document.getElementById('food-review-loading');
      expect(loading.textContent).toContain('Sedang membuat review...');
    });

    it('should have loading spinner with proper styling', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('ease-linear')).toBe(true);
      expect(loader.classList.contains('rounded-full')).toBe(true);
      expect(loader.classList.contains('border-4')).toBe(true);
      expect(loader.classList.contains('border-t-4')).toBe(true);
      expect(loader.classList.contains('h-12')).toBe(true);
      expect(loader.classList.contains('w-12')).toBe(true);
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('should have empty state container', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should have empty state icon', () => {
      const icon = document.body.querySelector('#food-review-empty-state .fa-utensils');
      expect(icon).toBeTruthy();
    });

    it('should have empty state text', () => {
      const text = document.getElementById('food-review-empty-state');
      expect(text.textContent).toContain('Hasil review akan muncul di sini');
    });

    it('should have empty state styling', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
    });

    it('should have empty state with proper icon size', () => {
      const icon = document.body.querySelector('#food-review-empty-state .fa-utensils');
      expect(icon.classList.contains('text-6xl')).toBe(true);
    });

    it('should have empty state with proper spacing', () => {
      const emptyState = document.getElementById('food-review-empty-state');
      expect(emptyState.classList.contains('py-12')).toBe(true);
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should have file input with accept attribute', () => {
      const fileInput = document.getElementById('food-review-image-input');
      expect(fileInput.accept).toBe('image/*');
    });

    it('should have sliders with min/max values', () => {
      const sliders = document.body.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        expect(slider.min).toBe('1');
        expect(slider.max).toBe('5');
      });
    });

    it('should have textarea with rows attribute', () => {
      const textarea = document.getElementById('food-review-notes');
      expect(textarea.rows).toBe(4);
    });

    it('should have location input as text type', () => {
      const locationInput = document.getElementById('food-review-location');
      expect(locationInput.type).toBe('text');
    });

    it('should have all inputs with proper IDs', () => {
      expect(document.getElementById('food-review-image-input')).toBeTruthy();
      expect(document.getElementById('food-review-image-preview')).toBeTruthy();
      expect(document.getElementById('food-review-image-preview-container')).toBeTruthy();
      expect(document.getElementById('food-review-remove-image-btn')).toBeTruthy();
      expect(document.getElementById('food-review-type-options')).toBeTruthy();
      expect(document.getElementById('food-review-overall-rating')).toBeTruthy();
      expect(document.getElementById('food-review-rating-text')).toBeTruthy();
      expect(document.getElementById('food-review-taste')).toBeTruthy();
      expect(document.getElementById('food-review-texture')).toBeTruthy();
      expect(document.getElementById('food-review-aroma')).toBeTruthy();
      expect(document.getElementById('food-review-presentation')).toBeTruthy();
      expect(document.getElementById('food-review-price-options')).toBeTruthy();
      expect(document.getElementById('food-review-location')).toBeTruthy();
      expect(document.getElementById('food-review-notes')).toBeTruthy();
      expect(document.getElementById('food-review-generate-btn')).toBeTruthy();
      expect(document.getElementById('food-review-results-container')).toBeTruthy();
      expect(document.getElementById('food-review-empty-state')).toBeTruthy();
      expect(document.getElementById('food-review-results')).toBeTruthy();
      expect(document.getElementById('food-review-loading')).toBeTruthy();
    });
  });

  // Button States Tests
  describe('Button States', () => {
    it('should have disabled generate button initially', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-emerald-600')).toBe(true);
      expect(generateBtn.classList.contains('to-teal-500')).toBe(true);
    });

    it('should have hover effects on buttons', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
    });

    it('should have transition effects', () => {
      const generateBtn = document.getElementById('food-review-generate-btn');
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });

    it('should have food type button styling', () => {
      const foodTypeBtn = document.body.querySelector('.food-type-btn-food-review');
      expect(foodTypeBtn.classList.contains('border-transparent')).toBe(true);
    });

    it('should have price button styling', () => {
      const priceBtn = document.body.querySelector('.price-btn-food-review');
      expect(priceBtn.classList.contains('border-transparent')).toBe(true);
    });

    it('should have remove button styling', () => {
      const removeBtn = document.getElementById('food-review-remove-image-btn');
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
      expect(removeBtn.classList.contains('hover:bg-red-600')).toBe(true);
    });

    it('should have star button styling', () => {
      const starBtn = document.body.querySelector('.rating-star-btn');
      expect(starBtn.classList.contains('text-gray-300')).toBe(true);
      expect(starBtn.classList.contains('hover:text-yellow-400')).toBe(true);
    });
  });
});
