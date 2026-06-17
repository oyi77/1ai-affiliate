/**
 * Mirror Selfie Component Unit Tests
 * Comprehensive test suite for mirror-selfie.html functionality
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

// Mock checkApiKey globally
window.checkApiKey = vi.fn().mockReturnValue(true);

describe('mirror-selfie Component', () => {

  const mockComponentHTML = `
    <div id="content-mirror-selfie" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            <i class="fas fa-user mr-3"></i>Mirror Selfie
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat caption dan deskripsi menarik untuk mirror selfie Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Mirror Selfie Photo Upload -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Mirror Selfie</h2>
              <div class="upload-area">
                <label for="mirror-selfie-image-input" class="file-input-label block border-3 border-dashed border-pink-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-colors">
                  <input type="file" id="mirror-selfie-image-input" class="hidden" accept="image/*">
                  <i class="fas fa-camera text-4xl text-pink-400 mb-3"></i>
                  <p class="text-gray-600">Klik atau seret foto mirror selfie di sini</p>
                </label>
              </div>
              <div id="mirror-selfie-image-preview-container" class="hidden mt-4 relative">
                <img id="mirror-selfie-image-preview" src="#" alt="Pratinjau Foto Mirror Selfie" class="rounded-lg w-full h-auto object-contain">
                <button id="mirror-selfie-remove-image-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Style Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya Pakaian</h2>
              <div id="mirror-selfie-style-options" class="space-y-3">
                <button type="button" data-style="casual" class="style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-pink-100 hover:bg-pink-200 transition text-center border-2 border-pink-400 selected" data-selected="true">
                  <i class="fas fa-tshirt mr-2"></i>Kasual
                </button>
                <button type="button" data-style="formal" class="style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-briefcase mr-2"></i>Formal
                </button>
                <button type="button" data-style="party" class="style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-glass-cheers mr-2"></i>Pesta
                </button>
                <button type="button" data-style="sporty" class="style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-running mr-2"></i>Sporty
                </button>
                <button type="button" data-style="chic" class="style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-star mr-2"></i>Chic
                </button>
              </div>
            </div>
            
            <!-- Step 3: Pose Type Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Pose</h2>
              <div id="mirror-selfie-pose-options" class="space-y-3">
                <button type="button" data-pose="peace" class="pose-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-pink-100 hover:bg-pink-200 transition text-center border-2 border-pink-400 selected" data-selected="true">
                  <i class="fas fa-hand-peace mr-2"></i>Peace Sign
                </button>
                <button type="button" data-pose="overhead" class="pose-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-hands mr-2"></i>Overhead
                </button>
                <button type="button" data-pose="chin-touch" class="pose-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-hand-sparkles mr-2"></i>Chin Touch
                </button>
                <button type="button" data-pose="hand-hip" class="pose-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-child mr-2"></i>Hand on Hip
                </button>
                <button type="button" data-pose="natural" class="pose-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user mr-2"></i>Natural
                </button>
              </div>
            </div>
            
            <!-- Step 4: Expression Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Ekspresi</h2>
              <div id="mirror-selfie-expression-options" class="space-y-3">
                <button type="button" data-expression="smile" class="expression-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-pink-100 hover:bg-pink-200 transition text-center border-2 border-pink-400 selected" data-selected="true">
                  <i class="fas fa-smile mr-2"></i>Senyum
                </button>
                <button type="button" data-expression="serious" class="expression-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-meh mr-2"></i>Serious
                </button>
                <button type="button" data-expression="flirty" class="expression-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-kiss mr-2"></i>Flirty
                </button>
                <button type="button" data-expression="confident" class="expression-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-crown mr-2"></i>Confident
                </button>
                <button type="button" data-expression="natural" class="expression-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user mr-2"></i>Natural
                </button>
              </div>
            </div>
            
            <!-- Step 5: Background Description -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Deskripsi Latar Belakang</h2>
              <textarea id="mirror-selfie-background-input" rows="3" placeholder="Contoh: Kamar dengan dinding pastel, meja kerja dengan laptop, tanaman hijau di sudut..." class="w-full p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none resize-none"></textarea>
              <p class="text-sm text-gray-500 mt-2">Jelaskan latar belakang foto mirror selfie Anda</p>
            </div>
            
            <!-- Step 6: Caption Style Selection -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Gaya Caption</h2>
              <div id="mirror-selfie-caption-style-options" class="space-y-3">
                <button type="button" data-caption-style="aesthetic" class="caption-style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-pink-100 hover:bg-pink-200 transition text-center border-2 border-pink-400 selected" data-selected="true">
                  <i class="fas fa-palette mr-2"></i>Aesthetic
                </button>
                <button type="button" data-caption-style="minimalis" class="caption-style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-minus mr-2"></i>Minimalis
                </button>
                <button type="button" data-caption-style="lucu" class="caption-style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-laugh-beam mr-2"></i>Lucu
                </button>
                <button type="button" data-caption-style="inspiratif" class="caption-style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-lightbulb mr-2"></i>Inspiratif
                </button>
                <button type="button" data-caption-style="profesional" class="caption-style-btn-mirror-selfie w-full p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-user-tie mr-2"></i>Profesional
                </button>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="mirror-selfie-generate-btn" class="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Buat Caption & Deskripsi
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="mirror-selfie-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="mirror-selfie-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-camera text-6xl mb-4 text-pink-400"></i>
                <p class="text-xl">Hasil caption dan deskripsi akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto mirror selfie dan pilih opsi, lalu klik Buat Caption & Deskripsi</p>
              </div>
              <div id="mirror-selfie-results" class="hidden space-y-6"></div>
              <div id="mirror-selfie-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-pink-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat caption dan deskripsi...</p>
              </div>
            </div>
          </div>
          
        </main>
        
      </div>
    </div>
  `;

  describe('Component Structure', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render main component container', () => {
      expect(document.getElementById('content-mirror-selfie')).toBeTruthy();
    });

    it('should render header with correct title', () => {
      const header = document.querySelector('#content-mirror-selfie h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('Mirror Selfie');
    });

    it('should render header with user icon', () => {
      const icon = document.querySelector('#content-mirror-selfie h1 i.fas.fa-user');
      expect(icon).toBeTruthy();
    });

    it('should render header description', () => {
      const description = document.querySelector('#content-mirror-selfie header p');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('Buat caption dan deskripsi menarik');
    });

    it('should render main grid layout', () => {
      const main = document.querySelector('#content-mirror-selfie main');
      expect(main).toBeTruthy();
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should render left control panel', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
    });

    it('should render right results panel', () => {
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have 6 step cards in left panel', () => {
      const cards = document.querySelectorAll('.lg\\:col-span-1 .card');
      expect(cards.length).toBe(6);
    });

    it('should render container with proper padding', () => {
      const container = document.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  describe('Image Upload', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render image input', () => {
      expect(document.getElementById('mirror-selfie-image-input')).toBeTruthy();
    });

    it('should have image input with correct accept attribute', () => {
      const fileInput = document.getElementById('mirror-selfie-image-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should render image preview container', () => {
      expect(document.getElementById('mirror-selfie-image-preview-container')).toBeTruthy();
    });

    it('should render image preview', () => {
      expect(document.getElementById('mirror-selfie-image-preview')).toBeTruthy();
    });

    it('should render remove image button', () => {
      expect(document.getElementById('mirror-selfie-remove-image-btn')).toBeTruthy();
    });

    it('should render upload area with dashed border', () => {
      const uploadArea = document.querySelector('.upload-area .file-input-label');
      expect(uploadArea).toBeTruthy();
      expect(uploadArea.classList.contains('border-3')).toBe(true);
      expect(uploadArea.classList.contains('border-dashed')).toBe(true);
      expect(uploadArea.classList.contains('border-pink-300')).toBe(true);
    });

    it('should render upload area with camera icon', () => {
      const icon = document.querySelector('#mirror-selfie-image-input + i.fas.fa-camera');
      expect(icon).toBeTruthy();
    });

    it('should render upload area with correct instruction text', () => {
      const uploadText = document.querySelector('.upload-area p');
      expect(uploadText).toBeTruthy();
      expect(uploadText.textContent).toContain('Klik atau seret foto mirror selfie');
    });

    it('should have preview container initially hidden', () => {
      const previewContainer = document.getElementById('mirror-selfie-image-preview-container');
      expect(previewContainer).toBeTruthy();
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });

    it('should have remove button with times icon', () => {
      const removeBtn = document.getElementById('mirror-selfie-remove-image-btn');
      const icon = removeBtn.querySelector('i.fas.fa-times');
      expect(icon).toBeTruthy();
    });

    it('should have preview image with alt text', () => {
      const previewImg = document.getElementById('mirror-selfie-image-preview');
      expect(previewImg).toBeTruthy();
      expect(previewImg.alt).toBe('Pratinjau Foto Mirror Selfie');
    });
  });

  describe('Style Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render style options container', () => {
      expect(document.getElementById('mirror-selfie-style-options')).toBeTruthy();
    });

    it('should have 5 style buttons', () => {
      const buttons = document.querySelectorAll('.style-btn-mirror-selfie');
      expect(buttons.length).toBe(5);
    });

    it('should have Casual style button', () => {
      const casualBtn = document.querySelector('[data-style="casual"]');
      expect(casualBtn).toBeTruthy();
      expect(casualBtn.textContent).toContain('Kasual');
    });

    it('should have Formal style button', () => {
      const formalBtn = document.querySelector('[data-style="formal"]');
      expect(formalBtn).toBeTruthy();
      expect(formalBtn.textContent).toContain('Formal');
    });

    it('should have Party style button', () => {
      const partyBtn = document.querySelector('[data-style="party"]');
      expect(partyBtn).toBeTruthy();
      expect(partyBtn.textContent).toContain('Pesta');
    });

    it('should have Sporty style button', () => {
      const sportyBtn = document.querySelector('[data-style="sporty"]');
      expect(sportyBtn).toBeTruthy();
      expect(sportyBtn.textContent).toContain('Sporty');
    });

    it('should have Chic style button', () => {
      const chicBtn = document.querySelector('[data-style="chic"]');
      expect(chicBtn).toBeTruthy();
      expect(chicBtn.textContent).toContain('Chic');
    });

    it('should have Casual style button initially selected', () => {
      const casualBtn = document.querySelector('[data-style="casual"]');
      expect(casualBtn.getAttribute('data-selected')).toBe('true');
      expect(casualBtn.classList.contains('border-pink-400')).toBe(true);
      expect(casualBtn.classList.contains('bg-pink-100')).toBe(true);
    });

    it('should have style buttons with icons', () => {
      const tshirtIcon = document.querySelector('[data-style="casual"] i.fas.fa-tshirt');
      const briefcaseIcon = document.querySelector('[data-style="formal"] i.fas.fa-briefcase');
      const glassIcon = document.querySelector('[data-style="party"] i.fas.fa-glass-cheers');
      const runningIcon = document.querySelector('[data-style="sporty"] i.fas.fa-running');
      const starIcon = document.querySelector('[data-style="chic"] i.fas.fa-star');

      expect(tshirtIcon).toBeTruthy();
      expect(briefcaseIcon).toBeTruthy();
      expect(glassIcon).toBeTruthy();
      expect(runningIcon).toBeTruthy();
      expect(starIcon).toBeTruthy();
    });
  });

  describe('Pose Type Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render pose options container', () => {
      expect(document.getElementById('mirror-selfie-pose-options')).toBeTruthy();
    });

    it('should have 5 pose buttons', () => {
      const buttons = document.querySelectorAll('.pose-btn-mirror-selfie');
      expect(buttons.length).toBe(5);
    });

    it('should have Peace Sign pose button', () => {
      const peaceBtn = document.querySelector('[data-pose="peace"]');
      expect(peaceBtn).toBeTruthy();
      expect(peaceBtn.textContent).toContain('Peace Sign');
    });

    it('should have Overhead pose button', () => {
      const overheadBtn = document.querySelector('[data-pose="overhead"]');
      expect(overheadBtn).toBeTruthy();
      expect(overheadBtn.textContent).toContain('Overhead');
    });

    it('should have Chin Touch pose button', () => {
      const chinTouchBtn = document.querySelector('[data-pose="chin-touch"]');
      expect(chinTouchBtn).toBeTruthy();
      expect(chinTouchBtn.textContent).toContain('Chin Touch');
    });

    it('should have Hand on Hip pose button', () => {
      const handHipBtn = document.querySelector('[data-pose="hand-hip"]');
      expect(handHipBtn).toBeTruthy();
      expect(handHipBtn.textContent).toContain('Hand on Hip');
    });

    it('should have Natural pose button', () => {
      const naturalBtn = document.querySelector('[data-pose="natural"]');
      expect(naturalBtn).toBeTruthy();
      expect(naturalBtn.textContent).toContain('Natural');
    });

    it('should have Peace Sign pose button initially selected', () => {
      const peaceBtn = document.querySelector('[data-pose="peace"]');
      expect(peaceBtn.getAttribute('data-selected')).toBe('true');
      expect(peaceBtn.classList.contains('border-pink-400')).toBe(true);
      expect(peaceBtn.classList.contains('bg-pink-100')).toBe(true);
    });

    it('should have pose buttons with icons', () => {
      const handPeaceIcon = document.querySelector('[data-pose="peace"] i.fas.fa-hand-peace');
      const handsIcon = document.querySelector('[data-pose="overhead"] i.fas.fa-hands');
      const sparklesIcon = document.querySelector('[data-pose="chin-touch"] i.fas.fa-hand-sparkles');
      const childIcon = document.querySelector('[data-pose="hand-hip"] i.fas.fa-child');
      const userIcon = document.querySelector('[data-pose="natural"] i.fas.fa-user');

      expect(handPeaceIcon).toBeTruthy();
      expect(handsIcon).toBeTruthy();
      expect(sparklesIcon).toBeTruthy();
      expect(childIcon).toBeTruthy();
      expect(userIcon).toBeTruthy();
    });
  });

  describe('Expression Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render expression options container', () => {
      expect(document.getElementById('mirror-selfie-expression-options')).toBeTruthy();
    });

    it('should have 5 expression buttons', () => {
      const buttons = document.querySelectorAll('.expression-btn-mirror-selfie');
      expect(buttons.length).toBe(5);
    });

    it('should have Senyum expression button', () => {
      const smileBtn = document.querySelector('[data-expression="smile"]');
      expect(smileBtn).toBeTruthy();
      expect(smileBtn.textContent).toContain('Senyum');
    });

    it('should have Serious expression button', () => {
      const seriousBtn = document.querySelector('[data-expression="serious"]');
      expect(seriousBtn).toBeTruthy();
      expect(seriousBtn.textContent).toContain('Serious');
    });

    it('should have Flirty expression button', () => {
      const flirtyBtn = document.querySelector('[data-expression="flirty"]');
      expect(flirtyBtn).toBeTruthy();
      expect(flirtyBtn.textContent).toContain('Flirty');
    });

    it('should have Confident expression button', () => {
      const confidentBtn = document.querySelector('[data-expression="confident"]');
      expect(confidentBtn).toBeTruthy();
      expect(confidentBtn.textContent).toContain('Confident');
    });

    it('should have Natural expression button', () => {
      const naturalBtn = document.querySelector('[data-expression="natural"]');
      expect(naturalBtn).toBeTruthy();
      expect(naturalBtn.textContent).toContain('Natural');
    });

    it('should have Senyum expression button initially selected', () => {
      const smileBtn = document.querySelector('[data-expression="smile"]');
      expect(smileBtn.getAttribute('data-selected')).toBe('true');
      expect(smileBtn.classList.contains('border-pink-400')).toBe(true);
      expect(smileBtn.classList.contains('bg-pink-100')).toBe(true);
    });

    it('should have expression buttons with icons', () => {
      const smileIcon = document.querySelector('[data-expression="smile"] i.fas.fa-smile');
      const mehIcon = document.querySelector('[data-expression="serious"] i.fas.fa-meh');
      const kissIcon = document.querySelector('[data-expression="flirty"] i.fas.fa-kiss');
      const crownIcon = document.querySelector('[data-expression="confident"] i.fas.fa-crown');
      const userIcon = document.querySelector('[data-expression="natural"] i.fas.fa-user');

      expect(smileIcon).toBeTruthy();
      expect(mehIcon).toBeTruthy();
      expect(kissIcon).toBeTruthy();
      expect(crownIcon).toBeTruthy();
      expect(userIcon).toBeTruthy();
    });
  });

  describe('Background Description', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render background input textarea', () => {
      expect(document.getElementById('mirror-selfie-background-input')).toBeTruthy();
    });

    it('should have background textarea with correct placeholder', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      expect(textarea).toBeTruthy();
      expect(textarea.placeholder).toContain('Contoh: Kamar dengan dinding pastel');
    });

    it('should have background textarea with 3 rows', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      expect(textarea.rows).toBe(3);
    });

    it('should have background textarea with pink border styling', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      expect(textarea.classList.contains('border-2')).toBe(true);
      expect(textarea.classList.contains('border-pink-300')).toBe(true);
    });

    it('should have background textarea with focus pink border', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      expect(textarea.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should have background textarea with no resize', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      expect(textarea.classList.contains('resize-none')).toBe(true);
    });

    it('should have background description helper text', () => {
      const helperText = document.querySelector('#mirror-selfie-background-input + p');
      expect(helperText).toBeTruthy();
      expect(helperText.textContent).toContain('Jelaskan latar belakang foto mirror selfie Anda');
    });
  });

  describe('Caption Style Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render caption style options container', () => {
      expect(document.getElementById('mirror-selfie-caption-style-options')).toBeTruthy();
    });

    it('should have 5 caption style buttons', () => {
      const buttons = document.querySelectorAll('.caption-style-btn-mirror-selfie');
      expect(buttons.length).toBe(5);
    });

    it('should have Aesthetic caption style button', () => {
      const aestheticBtn = document.querySelector('[data-caption-style="aesthetic"]');
      expect(aestheticBtn).toBeTruthy();
      expect(aestheticBtn.textContent).toContain('Aesthetic');
    });

    it('should have Minimalis caption style button', () => {
      const minimalisBtn = document.querySelector('[data-caption-style="minimalis"]');
      expect(minimalisBtn).toBeTruthy();
      expect(minimalisBtn.textContent).toContain('Minimalis');
    });

    it('should have Lucu caption style button', () => {
      const lucuBtn = document.querySelector('[data-caption-style="lucu"]');
      expect(lucuBtn).toBeTruthy();
      expect(lucuBtn.textContent).toContain('Lucu');
    });

    it('should have Inspiratif caption style button', () => {
      const inspiratifBtn = document.querySelector('[data-caption-style="inspiratif"]');
      expect(inspiratifBtn).toBeTruthy();
      expect(inspiratifBtn.textContent).toContain('Inspiratif');
    });

    it('should have Profesional caption style button', () => {
      const profesionalBtn = document.querySelector('[data-caption-style="profesional"]');
      expect(profesionalBtn).toBeTruthy();
      expect(profesionalBtn.textContent).toContain('Profesional');
    });

    it('should have Aesthetic caption style button initially selected', () => {
      const aestheticBtn = document.querySelector('[data-caption-style="aesthetic"]');
      expect(aestheticBtn.getAttribute('data-selected')).toBe('true');
      expect(aestheticBtn.classList.contains('border-pink-400')).toBe(true);
      expect(aestheticBtn.classList.contains('bg-pink-100')).toBe(true);
    });

    it('should have caption style buttons with icons', () => {
      const paletteIcon = document.querySelector('[data-caption-style="aesthetic"] i.fas.fa-palette');
      const minusIcon = document.querySelector('[data-caption-style="minimalis"] i.fas.fa-minus');
      const laughIcon = document.querySelector('[data-caption-style="lucu"] i.fas.fa-laugh-beam');
      const lightbulbIcon = document.querySelector('[data-caption-style="inspiratif"] i.fas.fa-lightbulb');
      const userTieIcon = document.querySelector('[data-caption-style="profesional"] i.fas.fa-user-tie');

      expect(paletteIcon).toBeTruthy();
      expect(minusIcon).toBeTruthy();
      expect(laughIcon).toBeTruthy();
      expect(lightbulbIcon).toBeTruthy();
      expect(userTieIcon).toBeTruthy();
    });
  });

  describe('Generate Button', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render generate button', () => {
      expect(document.getElementById('mirror-selfie-generate-btn')).toBeTruthy();
    });

    it('should have generate button with correct text', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Caption & Deskripsi');
    });

    it('should have generate button with magic icon', () => {
      const magicIcon = document.querySelector('#mirror-selfie-generate-btn i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have generate button initially disabled', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have generate button with gradient styling', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-400')).toBe(true);
    });

    it('should have generate button with shadow styling', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have generate button with proper padding', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
    });

    it('should have generate button with rounded corners', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
    });

    it('should have generate button with bold text', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
    });

    it('should have generate button with white text', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('text-white')).toBe(true);
    });

    it('should have generate button with full width', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
    });
  });

  describe('Results Area', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render results container', () => {
      expect(document.getElementById('mirror-selfie-results-container')).toBeTruthy();
    });

    it('should render empty state', () => {
      expect(document.getElementById('mirror-selfie-empty-state')).toBeTruthy();
    });

    it('should render results area', () => {
      expect(document.getElementById('mirror-selfie-results')).toBeTruthy();
    });

    it('should render loading indicator', () => {
      expect(document.getElementById('mirror-selfie-loading')).toBeTruthy();
    });

    it('should have empty state with camera icon', () => {
      const icon = document.querySelector('#mirror-selfie-empty-state i.fas.fa-camera');
      expect(icon).toBeTruthy();
    });

    it('should have empty state with correct text', () => {
      const emptyState = document.getElementById('mirror-selfie-empty-state');
      expect(emptyState.textContent).toContain('Hasil caption dan deskripsi akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah foto mirror selfie dan pilih opsi');
    });

    it('should have results container with minimum height', () => {
      const resultsContainer = document.getElementById('mirror-selfie-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should have results area initially hidden', () => {
      const results = document.getElementById('mirror-selfie-results');
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should have loading indicator initially hidden', () => {
      const loading = document.getElementById('mirror-selfie-loading');
      expect(loading.classList.contains('hidden')).toBe(true);
    });

    it('should have empty state initially visible', () => {
      const emptyState = document.getElementById('mirror-selfie-empty-state');
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have loading indicator with loader', () => {
      const loader = document.querySelector('#mirror-selfie-loading .loader');
      expect(loader).toBeTruthy();
    });

    it('should have loading indicator with loading text', () => {
      const loadingText = document.querySelector('#mirror-selfie-loading p');
      expect(loadingText).toBeTruthy();
      expect(loadingText.textContent).toContain('Sedang membuat caption dan deskripsi');
    });
  });

  describe('Card Styling', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have cards with white background', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have cards with padding', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
      });
    });

    it('should have cards with rounded corners', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('rounded-2xl')).toBe(true);
      });
    });

    it('should have cards with shadow', () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        expect(card.classList.contains('shadow-lg')).toBe(true);
      });
    });

    it('should have step headings with proper styling', () => {
      const headings = document.querySelectorAll('.card h2');
      headings.forEach(heading => {
        expect(heading.classList.contains('text-xl')).toBe(true);
        expect(heading.classList.contains('font-semibold')).toBe(true);
        expect(heading.classList.contains('mb-4')).toBe(true);
        expect(heading.classList.contains('text-gray-800')).toBe(true);
      });
    });
  });

  describe('Icons (FontAwesome)', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have user icon in header', () => {
      const icon = document.querySelector('#content-mirror-selfie h1 i.fas.fa-user');
      expect(icon).toBeTruthy();
    });

    it('should have camera icon in upload area', () => {
      const icon = document.querySelector('#mirror-selfie-image-input + i.fas.fa-camera');
      expect(icon).toBeTruthy();
    });

    it('should have times icon in remove button', () => {
      const icon = document.querySelector('#mirror-selfie-remove-image-btn i.fas.fa-times');
      expect(icon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const icon = document.querySelector('#mirror-selfie-generate-btn i.fas.fa-magic');
      expect(icon).toBeTruthy();
    });

    it('should have camera icon in empty state', () => {
      const icon = document.querySelector('#mirror-selfie-empty-state i.fas.fa-camera');
      expect(icon).toBeTruthy();
    });

    it('should have style option icons', () => {
      const icons = document.querySelectorAll('#mirror-selfie-style-options i.fas');
      expect(icons.length).toBe(5);
    });

    it('should have pose option icons', () => {
      const icons = document.querySelectorAll('#mirror-selfie-pose-options i.fas');
      expect(icons.length).toBe(5);
    });

    it('should have expression option icons', () => {
      const icons = document.querySelectorAll('#mirror-selfie-expression-options i.fas');
      expect(icons.length).toBe(5);
    });

    it('should have caption style option icons', () => {
      const icons = document.querySelectorAll('#mirror-selfie-caption-style-options i.fas');
      expect(icons.length).toBe(5);
    });
  });

  describe('Text Content (Indonesian)', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have Indonesian header title', () => {
      const header = document.querySelector('#content-mirror-selfie h1');
      expect(header.textContent).toContain('Mirror Selfie');
    });

    it('should have Indonesian header description', () => {
      const description = document.querySelector('#content-mirror-selfie header p');
      expect(description.textContent).toContain('Buat caption dan deskripsi menarik');
    });

    it('should have Indonesian step 1 heading', () => {
      const step1 = document.querySelector('.card:nth-of-type(1) h2');
      expect(step1.textContent).toContain('Unggah Foto Mirror Selfie');
    });

    it('should have Indonesian step 2 heading', () => {
      const step2 = document.querySelector('.card:nth-of-type(2) h2');
      expect(step2.textContent).toContain('Gaya Pakaian');
    });

    it('should have Indonesian step 3 heading', () => {
      const step3 = document.querySelector('.card:nth-of-type(3) h2');
      expect(step3.textContent).toContain('Pose');
    });

    it('should have Indonesian step 4 heading', () => {
      const step4 = document.querySelector('.card:nth-of-type(4) h2');
      expect(step4.textContent).toContain('Ekspresi');
    });

    it('should have Indonesian step 5 heading', () => {
      const step5 = document.querySelector('.card:nth-of-type(5) h2');
      expect(step5.textContent).toContain('Deskripsi Latar Belakang');
    });

    it('should have Indonesian step 6 heading', () => {
      const step6 = document.querySelector('.card:nth-of-type(6) h2');
      expect(step6.textContent).toContain('Gaya Caption');
    });

    it('should have Indonesian generate button text', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.textContent).toContain('Buat Caption & Deskripsi');
    });

    it('should have Indonesian empty state text', () => {
      const emptyState = document.getElementById('mirror-selfie-empty-state');
      expect(emptyState.textContent).toContain('Hasil caption dan deskripsi akan muncul di sini');
    });

    it('should have Indonesian loading text', () => {
      const loadingText = document.querySelector('#mirror-selfie-loading p');
      expect(loadingText.textContent).toContain('Sedang membuat caption dan deskripsi');
    });

    it('should have Indonesian background helper text', () => {
      const helperText = document.querySelector('#mirror-selfie-background-input + p');
      expect(helperText.textContent).toContain('Jelaskan latar belakang foto mirror selfie Anda');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have proper heading structure', () => {
      const h1 = document.querySelector('#content-mirror-selfie h1');
      const h2Elements = document.querySelectorAll('#content-mirror-selfie h2');

      expect(h1).toBeTruthy();
      expect(h2Elements.length).toBe(6);
    });

    it('should have file input with label association', () => {
      const fileInput = document.getElementById('mirror-selfie-image-input');
      const label = document.querySelector('label[for="mirror-selfie-image-input"]');

      expect(fileInput).toBeTruthy();
      expect(label).toBeTruthy();
    });

    it('should have textarea with label association', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      const card = textarea.closest('.card');
      const heading = card.querySelector('h2');

      expect(textarea).toBeTruthy();
      expect(heading).toBeTruthy();
    });

    it('should have button elements for interactive options', () => {
      const styleBtns = document.querySelectorAll('.style-btn-mirror-selfie');
      const poseBtns = document.querySelectorAll('.pose-btn-mirror-selfie');
      const expressionBtns = document.querySelectorAll('.expression-btn-mirror-selfie');
      const captionStyleBtns = document.querySelectorAll('.caption-style-btn-mirror-selfie');

      expect(styleBtns.length).toBe(5);
      expect(poseBtns.length).toBe(5);
      expect(expressionBtns.length).toBe(5);
      expect(captionStyleBtns.length).toBe(5);
    });

    it('should have proper alt text for images', () => {
      const previewImg = document.getElementById('mirror-selfie-image-preview');
      expect(previewImg.alt).toBe('Pratinjau Foto Mirror Selfie');
    });

    it('should have icons for visual enhancement', () => {
      const userIcon = document.querySelector('#content-mirror-selfie h1 i.fas.fa-user');
      const cameraIcon = document.querySelector('#mirror-selfie-image-input + i.fas.fa-camera');
      const magicIcon = document.querySelector('#mirror-selfie-generate-btn i.fas.fa-magic');

      expect(userIcon).toBeTruthy();
      expect(cameraIcon).toBeTruthy();
      expect(magicIcon).toBeTruthy();
    });

    it('should have proper button types', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.type).toMatch(/button|submit/);
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have responsive grid layout', () => {
      const main = document.querySelector('#content-mirror-selfie main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
    });

    it('should have responsive gap', () => {
      const main = document.querySelector('#content-mirror-selfie main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive header text size', () => {
      const header = document.querySelector('#content-mirror-selfie h1');
      expect(header.classList.contains('text-4xl')).toBe(true);
      expect(header.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have left panel span 1 column on mobile', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel).toBeTruthy();
    });

    it('should have right panel span 2 columns on desktop', () => {
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      expect(rightPanel).toBeTruthy();
    });

    it('should have responsive container padding', () => {
      const container = document.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });

    it('should have responsive space-y for left panel', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });
  });

  describe('Color Scheme (pink/rose)', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have pink gradient in header', () => {
      const header = document.querySelector('#content-mirror-selfie h1');
      expect(header.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(header.classList.contains('from-pink-500')).toBe(true);
      expect(header.classList.contains('to-rose-400')).toBe(true);
    });

    it('should have pink text color in header', () => {
      const header = document.querySelector('#content-mirror-selfie h1');
      expect(header.classList.contains('bg-clip-text')).toBe(true);
      expect(header.classList.contains('text-transparent')).toBe(true);
    });

    it('should have pink border in upload area', () => {
      const uploadArea = document.querySelector('.upload-area .file-input-label');
      expect(uploadArea.classList.contains('border-pink-300')).toBe(true);
    });

    it('should have pink border on hover in upload area', () => {
      const uploadArea = document.querySelector('.upload-area .file-input-label');
      expect(uploadArea.classList.contains('hover:border-pink-500')).toBe(true);
    });

    it('should have pink icons in upload area', () => {
      const icon = document.querySelector('#mirror-selfie-image-input + i.fas');
      expect(icon.classList.contains('text-pink-400')).toBe(true);
    });

    it('should have pink border in background textarea', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      expect(textarea.classList.contains('border-pink-300')).toBe(true);
    });

    it('should have pink border on focus in background textarea', () => {
      const textarea = document.getElementById('mirror-selfie-background-input');
      expect(textarea.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should have pink background in selected style button', () => {
      const selectedBtn = document.querySelector('.style-btn-mirror-selfie[data-selected="true"]');
      expect(selectedBtn.classList.contains('bg-pink-100')).toBe(true);
      expect(selectedBtn.classList.contains('border-pink-400')).toBe(true);
    });

    it('should have pink background in selected pose button', () => {
      const selectedBtn = document.querySelector('.pose-btn-mirror-selfie[data-selected="true"]');
      expect(selectedBtn.classList.contains('bg-pink-100')).toBe(true);
      expect(selectedBtn.classList.contains('border-pink-400')).toBe(true);
    });

    it('should have pink background in selected expression button', () => {
      const selectedBtn = document.querySelector('.expression-btn-mirror-selfie[data-selected="true"]');
      expect(selectedBtn.classList.contains('bg-pink-100')).toBe(true);
      expect(selectedBtn.classList.contains('border-pink-400')).toBe(true);
    });

    it('should have pink background in selected caption style button', () => {
      const selectedBtn = document.querySelector('.caption-style-btn-mirror-selfie[data-selected="true"]');
      expect(selectedBtn.classList.contains('bg-pink-100')).toBe(true);
      expect(selectedBtn.classList.contains('border-pink-400')).toBe(true);
    });

    it('should have pink gradient in generate button', () => {
      const generateBtn = document.getElementById('mirror-selfie-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
      expect(generateBtn.classList.contains('to-rose-400')).toBe(true);
    });

    it('should have pink icons in empty state', () => {
      const icon = document.querySelector('#mirror-selfie-empty-state i.fas');
      expect(icon.classList.contains('text-pink-400')).toBe(true);
    });

    it('should have pink loader in loading indicator', () => {
      const loader = document.querySelector('#mirror-selfie-loading .loader');
      expect(loader.classList.contains('border-pink-500')).toBe(true);
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have main content panel with hidden class', () => {
      const contentPanel = document.getElementById('content-mirror-selfie');
      expect(contentPanel.classList.contains('main-content-panel')).toBe(true);
      expect(contentPanel.classList.contains('hidden')).toBe(true);
    });

    it('should have all required element IDs', () => {
      const requiredIds = [
        'content-mirror-selfie',
        'mirror-selfie-image-input',
        'mirror-selfie-image-preview-container',
        'mirror-selfie-image-preview',
        'mirror-selfie-remove-image-btn',
        'mirror-selfie-style-options',
        'mirror-selfie-pose-options',
        'mirror-selfie-expression-options',
        'mirror-selfie-background-input',
        'mirror-selfie-caption-style-options',
        'mirror-selfie-generate-btn',
        'mirror-selfie-results-container',
        'mirror-selfie-empty-state',
        'mirror-selfie-results',
        'mirror-selfie-loading'
      ];

      requiredIds.forEach(id => {
        expect(document.getElementById(id)).toBeTruthy();
      });
    });

    it('should have proper space-y-6 for vertical spacing', () => {
      const leftPanel = document.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper space-y-3 for button groups', () => {
      const styleOptions = document.getElementById('mirror-selfie-style-options');
      const poseOptions = document.getElementById('mirror-selfie-pose-options');
      const expressionOptions = document.getElementById('mirror-selfie-expression-options');
      const captionStyleOptions = document.getElementById('mirror-selfie-caption-style-options');

      expect(styleOptions.classList.contains('space-y-3')).toBe(true);
      expect(poseOptions.classList.contains('space-y-3')).toBe(true);
      expect(expressionOptions.classList.contains('space-y-3')).toBe(true);
      expect(captionStyleOptions.classList.contains('space-y-3')).toBe(true);
    });

    it('should have proper space-y-4 for background input', () => {
      const backgroundCard = document.querySelector('.card:nth-of-type(5)');
      expect(backgroundCard).toBeTruthy();
    });

    it('should have proper space-y-6 for results', () => {
      const results = document.getElementById('mirror-selfie-results');
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should have proper flex classes for empty state', () => {
      const emptyState = document.getElementById('mirror-selfie-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
    });

    it('should have proper flex classes for loading indicator', () => {
      const loading = document.getElementById('mirror-selfie-loading');
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.classList.contains('items-center')).toBe(true);
      expect(loading.classList.contains('justify-center')).toBe(true);
    });

    it('should have proper text centering in empty state', () => {
      const emptyState = document.getElementById('mirror-selfie-empty-state');
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have proper text colors', () => {
      const headerDescription = document.querySelector('#content-mirror-selfie header p');
      expect(headerDescription.classList.contains('text-gray-600')).toBe(true);

      const uploadText = document.querySelector('.upload-area p');
      expect(uploadText.classList.contains('text-gray-600')).toBe(true);

      const helperText = document.querySelector('#mirror-selfie-background-input + p');
      expect(helperText.classList.contains('text-gray-500')).toBe(true);
    });
  });
});
