/**
 * POV Tangan Component Unit Tests
 * Comprehensive test suite for pov-tangan.html functionality
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

describe('pov-tangan Component', () => {

  const mockComponentHTML = `
    <div id="content-pov-tangan" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            <i class="fas fa-hand-paper mr-3"></i>POV Tangan
          </h1>
          <p class="text-lg text-gray-600 mt-2">Hasilkan foto POV tangan yang menakjubkan</p>
        </header>
        <main class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Unggah Foto Tangan</h2>
              <div class="upload-area">
                <label for="pov-tangan-input" class="file-input-label block border-3 border-dashed border-indigo-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="file" id="pov-tangan-input" class="hidden" accept="image/*">
                  <i class="fas fa-hand-paper text-4xl text-indigo-400 mb-3"></i>
                  <p class="text-gray-600">Unggah foto tangan yang ingin dijadikan POV</p>
                </label>
              </div>
              <div id="pov-tangan-preview-container" class="hidden mt-4">
                <img id="pov-tangan-preview" src="#" alt="Pratinjau Tangan" class="rounded-lg w-full h-auto object-contain">
                <button id="pov-tangan-remove-btn" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis POV</h2>
              <div class="grid grid-cols-1 gap-3">
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="pov-type" value="selfie" class="w-5 h-5 text-indigo-600" checked>
                  <i class="fas fa-user text-indigo-500 mr-3 ml-2"></i>
                  <span class="text-gray-700">Selfie Tangan</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="pov-type" value="holding" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-hand-holding text-indigo-500 mr-3 ml-2"></i>
                  <span class="text-gray-700">Tangan Memegang</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="pov-type" value="pointing" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-hand-point-up text-indigo-500 mr-3 ml-2"></i>
                  <span class="text-gray-700">Tangan Menunjuk</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="pov-type" value="peace" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-hand-peace text-indigo-500 mr-3 ml-2"></i>
                  <span class="text-gray-700">Tangan Peace</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="pov-type" value="fist" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-fist-raised text-indigo-500 mr-3 ml-2"></i>
                  <span class="text-gray-700">Tangan Kepalan</span>
                </label>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Sudut Pandang</h2>
              <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="angle" value="front" class="w-5 h-5 text-indigo-600" checked>
                  <i class="fas fa-eye text-indigo-500 mr-2"></i>
                  <span class="text-gray-700 text-sm">Depan</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="angle" value="side" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-arrow-right text-indigo-500 mr-2"></i>
                  <span class="text-gray-700 text-sm">Samping</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="angle" value="top" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-arrow-up text-indigo-500 mr-2"></i>
                  <span class="text-gray-700 text-sm">Atas</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="angle" value="bottom" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-arrow-down text-indigo-500 mr-2"></i>
                  <span class="text-gray-700 text-sm">Bawah</span>
                </label>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Kondisi Pencahayaan</h2>
              <div class="grid grid-cols-1 gap-3">
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="lighting" value="natural" class="w-5 h-5 text-indigo-600" checked>
                  <i class="fas fa-sun text-yellow-500 mr-3 ml-2"></i>
                  <span class="text-gray-700">Alami</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="lighting" value="studio" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-lightbulb text-yellow-400 mr-3 ml-2"></i>
                  <span class="text-gray-700">Studio</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="lighting" value="soft" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-cloud-sun text-blue-400 mr-3 ml-2"></i>
                  <span class="text-gray-700">Soft Light</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="lighting" value="dramatic" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-moon text-indigo-400 mr-3 ml-2"></i>
                  <span class="text-gray-700">Dramatis</span>
                </label>
                <label class="flex items-center p-3 border-2 border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                  <input type="radio" name="lighting" value="neon" class="w-5 h-5 text-indigo-600">
                  <i class="fas fa-bolt text-purple-500 mr-3 ml-2"></i>
                  <span class="text-gray-700">Neon</span>
                </label>
              </div>
            </div>
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Deskripsi Latar Belakang</h2>
              <textarea id="pov-tangan-background" class="w-full p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none" rows="4" placeholder="Jelaskan latar belakang yang diinginkan..."></textarea>
            </div>
            <button id="pov-tangan-generate-btn" class="w-full bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-magic mr-2"></i>Hasilkan POV Tangan
            </button>
          </div>
          <div>
            <div id="pov-tangan-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="pov-tangan-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-hand-paper text-6xl mb-4 text-indigo-400"></i>
                <p class="text-xl">Hasil akan muncul di sini</p>
                <p class="text-sm mt-2">Unggah foto tangan dan klik Hasilkan POV Tangan</p>
              </div>
              <div id="pov-tangan-results" class="hidden grid grid-cols-1 gap-6"></div>
              <div id="pov-tangan-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-indigo-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang memproses POV tangan...</p>
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
      expect(document.getElementById('content-pov-tangan')).toBeTruthy();
    });

    it('should have correct container structure', () => {
      const container = document.querySelector('#content-pov-tangan .container');
      expect(container).toBeTruthy();
    });

    it('should render header section', () => {
      const header = document.querySelector('#content-pov-tangan header');
      expect(header).toBeTruthy();
    });

    it('should render main content area', () => {
      const main = document.querySelector('#content-pov-tangan main');
      expect(main).toBeTruthy();
    });

    it('should have grid layout with correct classes', () => {
      const main = document.querySelector('#content-pov-tangan main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-2')).toBe(true);
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should render left panel with input controls', () => {
      const leftPanel = document.querySelector('#content-pov-tangan main > div:first-child');
      expect(leftPanel).toBeTruthy();
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should render right panel for results', () => {
      const rightPanel = document.querySelector('#content-pov-tangan main > div:last-child');
      expect(rightPanel).toBeTruthy();
    });

    it('should have 5 card elements in left panel', () => {
      const cards = document.querySelectorAll('#content-pov-tangan main > div:first-child .card');
      expect(cards.length).toBe(5);
    });

    it('should have proper card styling', () => {
      const card = document.querySelector('#content-pov-tangan .card');
      expect(card.classList.contains('p-6')).toBe(true);
      expect(card.classList.contains('rounded-2xl')).toBe(true);
      expect(card.classList.contains('shadow-lg')).toBe(true);
      expect(card.classList.contains('bg-white')).toBe(true);
    });
  });

  describe('Header Section', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render header with correct title', () => {
      const header = document.querySelector('#content-pov-tangan h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('POV Tangan');
    });

    it('should render header with hand icon', () => {
      const icon = document.querySelector('#content-pov-tangan h1 i.fas.fa-hand-paper');
      expect(icon).toBeTruthy();
    });

    it('should render header with gradient text', () => {
      const header = document.querySelector('#content-pov-tangan h1');
      expect(header.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(header.classList.contains('from-indigo-600')).toBe(true);
      expect(header.classList.contains('to-purple-500')).toBe(true);
      expect(header.classList.contains('bg-clip-text')).toBe(true);
      expect(header.classList.contains('text-transparent')).toBe(true);
    });

    it('should render header description', () => {
      const description = document.querySelector('#content-pov-tangan header p');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('POV');
      expect(description.textContent).toContain('foto');
    });

    it('should have proper header text styling', () => {
      const header = document.querySelector('#content-pov-tangan h1');
      expect(header).toBeTruthy();
      expect(header.textContent).toContain('POV Tangan');
    });
  });

  describe('Image Upload', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render file input element', () => {
      expect(document.getElementById('pov-tangan-input')).toBeTruthy();
    });

    it('should have file input with correct accept attribute', () => {
      const fileInput = document.getElementById('pov-tangan-input');
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe('image/*');
    });

    it('should render upload area label', () => {
      const label = document.querySelector('label[for="pov-tangan-input"]');
      expect(label).toBeTruthy();
    });

    it('should have upload area with dashed border styling', () => {
      const label = document.querySelector('label[for="pov-tangan-input"]');
      expect(label.classList.contains('border-3')).toBe(true);
      expect(label.classList.contains('border-dashed')).toBe(true);
      expect(label.classList.contains('border-indigo-300')).toBe(true);
    });

    it('should render upload area with hand icon', () => {
      const icon = document.querySelector('label[for="pov-tangan-input"] i.fas.fa-hand-paper');
      expect(icon).toBeTruthy();
    });

    it('should render upload area with instruction text', () => {
      const label = document.querySelector('label[for="pov-tangan-input"]');
      expect(label.textContent).toContain('Unggah foto tangan');
    });

    it('should render preview container', () => {
      expect(document.getElementById('pov-tangan-preview-container')).toBeTruthy();
    });

    it('should render preview image element', () => {
      expect(document.getElementById('pov-tangan-preview')).toBeTruthy();
    });

    it('should render remove button', () => {
      expect(document.getElementById('pov-tangan-remove-btn')).toBeTruthy();
    });

    it('should have remove button with times icon', () => {
      const icon = document.querySelector('#pov-tangan-remove-btn i.fas.fa-times');
      expect(icon).toBeTruthy();
    });

    it('should have remove button with correct styling', () => {
      const removeBtn = document.getElementById('pov-tangan-remove-btn');
      expect(removeBtn.classList.contains('bg-red-500')).toBe(true);
      expect(removeBtn.classList.contains('text-white')).toBe(true);
      expect(removeBtn.classList.contains('rounded-full')).toBe(true);
    });

    it('should have preview container initially hidden', () => {
      const previewContainer = document.getElementById('pov-tangan-preview-container');
      expect(previewContainer.classList.contains('hidden')).toBe(true);
    });
  });

  describe('POV Type Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render 5 POV type options', () => {
      const radioButtons = document.querySelectorAll('input[name="pov-type"]');
      expect(radioButtons.length).toBe(5);
    });

    it('should have selfie option', () => {
      const selfieOption = document.querySelector('input[value="selfie"]');
      expect(selfieOption).toBeTruthy();
      expect(selfieOption.checked).toBe(true);
    });

    it('should have holding option', () => {
      const holdingOption = document.querySelector('input[value="holding"]');
      expect(holdingOption).toBeTruthy();
    });

    it('should have pointing option', () => {
      const pointingOption = document.querySelector('input[value="pointing"]');
      expect(pointingOption).toBeTruthy();
    });

    it('should have peace option', () => {
      const peaceOption = document.querySelector('input[value="peace"]');
      expect(peaceOption).toBeTruthy();
    });

    it('should have fist option', () => {
      const fistOption = document.querySelector('input[value="fist"]');
      expect(fistOption).toBeTruthy();
    });

    it('should have proper labels for each POV type', () => {
      const labels = document.querySelectorAll('input[name="pov-type"]');
      labels.forEach(radio => {
        const label = radio.closest('label');
        expect(label).toBeTruthy();
        expect(label.classList.contains('cursor-pointer')).toBe(true);
      });
    });

    it('should have icons for each POV type', () => {
      const icons = document.querySelectorAll('input[name="pov-type"] + i.fas');
      expect(icons.length).toBeGreaterThanOrEqual(5);
    });

    it('should have correct icon classes for POV types', () => {
      const icons = document.querySelectorAll('input[name="pov-type"] + i.fas');
      expect(icons.length).toBeGreaterThanOrEqual(5);
      icons.forEach(icon => {
        expect(icon.className).toContain('fas');
      });
    });

    it('should have proper styling for POV type labels', () => {
      const labels = document.querySelectorAll('input[name="pov-type"]');
      labels.forEach(radio => {
        const label = radio.closest('label');
        expect(label.classList.contains('flex')).toBe(true);
        expect(label.classList.contains('items-center')).toBe(true);
        expect(label.classList.contains('p-3')).toBe(true);
        expect(label.classList.contains('border-2')).toBe(true);
        expect(label.classList.contains('border-indigo-200')).toBe(true);
        expect(label.classList.contains('rounded-xl')).toBe(true);
      });
    });
  });

  describe('Angle Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render 4 angle options', () => {
      const radioButtons = document.querySelectorAll('input[name="angle"]');
      expect(radioButtons.length).toBe(4);
    });

    it('should have front option with correct styling', () => {
      const frontOption = document.querySelector('input[value="front"]');
      expect(frontOption).toBeTruthy();
      expect(frontOption.checked).toBe(true);
    });

    it('should have side option', () => {
      const sideOption = document.querySelector('input[value="side"]');
      expect(sideOption).toBeTruthy();
    });

    it('should have top option', () => {
      const topOption = document.querySelector('input[value="top"]');
      expect(topOption).toBeTruthy();
    });

    it('should have bottom option', () => {
      const bottomOption = document.querySelector('input[value="bottom"]');
      expect(bottomOption).toBeTruthy();
    });

    it('should have angle options in 2x2 grid', () => {
      const angleContainer = document.querySelector('input[name="angle"]').closest('.grid');
      expect(angleContainer.classList.contains('grid-cols-2')).toBe(true);
      expect(angleContainer.classList.contains('gap-3')).toBe(true);
    });

    it('should have icons for each angle', () => {
      const icons = document.querySelectorAll('input[name="angle"] + i.fas');
      expect(icons.length).toBeGreaterThanOrEqual(4);
    });

    it('should have proper text labels for angles', () => {
      const frontLabel = document.querySelector('input[value="front"]').closest('label');
      expect(frontLabel.textContent).toContain('Depan');

      const sideLabel = document.querySelector('input[value="side"]').closest('label');
      expect(sideLabel.textContent).toContain('Samping');

      const topLabel = document.querySelector('input[value="top"]').closest('label');
      expect(topLabel.textContent).toContain('Atas');

      const bottomLabel = document.querySelector('input[value="bottom"]').closest('label');
      expect(bottomLabel.textContent).toContain('Bawah');
    });
  });

  describe('Lighting Condition Selection', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render 5 lighting options', () => {
      const radioButtons = document.querySelectorAll('input[name="lighting"]');
      expect(radioButtons.length).toBe(5);
    });

    it('should have natural lighting option', () => {
      const naturalOption = document.querySelector('input[value="natural"]');
      expect(naturalOption).toBeTruthy();
      expect(naturalOption.checked).toBe(true);
    });

    it('should have studio lighting option', () => {
      const studioOption = document.querySelector('input[value="studio"]');
      expect(studioOption).toBeTruthy();
    });

    it('should have soft lighting option', () => {
      const softOption = document.querySelector('input[value="soft"]');
      expect(softOption).toBeTruthy();
    });

    it('should have dramatic lighting option', () => {
      const dramaticOption = document.querySelector('input[value="dramatic"]');
      expect(dramaticOption).toBeTruthy();
    });

    it('should have neon lighting option', () => {
      const neonOption = document.querySelector('input[value="neon"]');
      expect(neonOption).toBeTruthy();
    });

    it('should have icons for each lighting condition', () => {
      const icons = document.querySelectorAll('input[name="lighting"] + i.fas');
      expect(icons.length).toBeGreaterThanOrEqual(5);
    });

    it('should have proper Indonesian text labels', () => {
      const naturalLabel = document.querySelector('input[value="natural"]').closest('label');
      expect(naturalLabel.textContent).toContain('Alami');

      const studioLabel = document.querySelector('input[value="studio"]').closest('label');
      expect(studioLabel.textContent).toContain('Studio');

      const softLabel = document.querySelector('input[value="soft"]').closest('label');
      expect(softLabel.textContent).toContain('Soft Light');

      const dramaticLabel = document.querySelector('input[value="dramatic"]').closest('label');
      expect(dramaticLabel.textContent).toContain('Dramatis');

      const neonLabel = document.querySelector('input[value="neon"]').closest('label');
      expect(neonLabel.textContent).toContain('Neon');
    });
  });

  describe('Background Description', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should render textarea element', () => {
      expect(document.getElementById('pov-tangan-background')).toBeTruthy();
    });

    it('should have textarea with correct attributes', () => {
      const textarea = document.getElementById('pov-tangan-background');
      expect(textarea).toBeTruthy();
      expect(textarea.rows).toBe(4);
      expect(textarea.placeholder).toBeTruthy();
    });

    it('should have proper textarea styling', () => {
      const textarea = document.getElementById('pov-tangan-background');
      expect(textarea.classList.contains('w-full')).toBe(true);
      expect(textarea.classList.contains('p-4')).toBe(true);
      expect(textarea.classList.contains('border-2')).toBe(true);
      expect(textarea.classList.contains('border-indigo-200')).toBe(true);
      expect(textarea.classList.contains('rounded-xl')).toBe(true);
      expect(textarea.classList.contains('resize-none')).toBe(true);
    });

    it('should have focus state styling', () => {
      const textarea = document.getElementById('pov-tangan-background');
      expect(textarea.classList.contains('focus:border-indigo-500')).toBe(true);
      expect(textarea.classList.contains('focus:outline-none')).toBe(true);
    });

    it('should have section header for background description', () => {
      const header = document.querySelector('#pov-tangan-background').closest('.card').querySelector('h2');
      expect(header.textContent).toContain('Deskripsi Latar Belakang');
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
      expect(document.getElementById('pov-tangan-generate-btn')).toBeTruthy();
    });

    it('should have generate button with correct text', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Hasilkan POV Tangan');
    });

    it('should have generate button with magic icon', () => {
      const magicIcon = document.querySelector('#pov-tangan-generate-btn i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have generate button initially disabled', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      expect(generateBtn.disabled).toBe(true);
    });

    it('should have proper button styling', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have hover state styling', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });

    it('should have disabled state styling', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
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
      expect(document.getElementById('pov-tangan-results-container')).toBeTruthy();
    });

    it('should render empty state', () => {
      expect(document.getElementById('pov-tangan-empty-state')).toBeTruthy();
    });

    it('should render results grid', () => {
      expect(document.getElementById('pov-tangan-results')).toBeTruthy();
    });

    it('should render loading indicator', () => {
      expect(document.getElementById('pov-tangan-loading')).toBeTruthy();
    });

    it('should have empty state with hand icon', () => {
      const icon = document.querySelector('#pov-tangan-empty-state i.fas.fa-hand-paper');
      expect(icon).toBeTruthy();
    });

    it('should have empty state with instruction text', () => {
      const emptyState = document.getElementById('pov-tangan-empty-state');
      expect(emptyState.textContent).toContain('Hasil akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah foto tangan');
    });

    it('should have results grid initially hidden', () => {
      const resultsGrid = document.getElementById('pov-tangan-results');
      expect(resultsGrid.classList.contains('hidden')).toBe(true);
    });

    it('should have loading indicator initially hidden', () => {
      const loadingIndicator = document.getElementById('pov-tangan-loading');
      expect(loadingIndicator.classList.contains('hidden')).toBe(true);
    });

    it('should have empty state initially visible', () => {
      const emptyState = document.getElementById('pov-tangan-empty-state');
      expect(emptyState.classList.contains('hidden')).toBe(false);
    });

    it('should have loading indicator with spinner', () => {
      const spinner = document.querySelector('#pov-tangan-loading .loader');
      expect(spinner).toBeTruthy();
    });

    it('should have loading text in Indonesian', () => {
      const loadingText = document.querySelector('#pov-tangan-loading p');
      expect(loadingText.textContent).toContain('Sedang memproses POV tangan');
    });

    it('should have results container with minimum height', () => {
      const resultsContainer = document.getElementById('pov-tangan-results-container');
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });
  });

  describe('Card Styling', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have consistent card padding', () => {
      const cards = document.querySelectorAll('#content-pov-tangan .card');
      cards.forEach(card => {
        expect(card.classList.contains('p-6')).toBe(true);
      });
    });

    it('should have consistent card border radius', () => {
      const cards = document.querySelectorAll('#content-pov-tangan .card');
      cards.forEach(card => {
        expect(card.classList.contains('rounded-2xl')).toBe(true);
      });
    });

    it('should have consistent card shadow', () => {
      const cards = document.querySelectorAll('#content-pov-tangan .card');
      cards.forEach(card => {
        expect(card.classList.contains('shadow-lg')).toBe(true);
      });
    });

    it('should have consistent card background', () => {
      const cards = document.querySelectorAll('#content-pov-tangan .card');
      cards.forEach(card => {
        expect(card.classList.contains('bg-white')).toBe(true);
      });
    });

    it('should have section headers with proper styling', () => {
      const headers = document.querySelectorAll('#content-pov-tangan .card h2');
      headers.forEach(header => {
        expect(header.classList.contains('text-xl')).toBe(true);
        expect(header.classList.contains('font-semibold')).toBe(true);
        expect(header.classList.contains('mb-4')).toBe(true);
        expect(header.classList.contains('text-gray-800')).toBe(true);
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

    it('should use FontAwesome icon classes', () => {
      const icons = document.querySelectorAll('#content-pov-tangan i.fas');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have hand icon in header', () => {
      const headerIcon = document.querySelector('#content-pov-tangan h1 i.fas');
      expect(headerIcon).toBeTruthy();
      expect(headerIcon.classList.contains('fa-hand-paper')).toBe(true);
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.querySelector('#pov-tangan-generate-btn i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have times icon in remove button', () => {
      const timesIcon = document.querySelector('#pov-tangan-remove-btn i.fas.fa-times');
      expect(timesIcon).toBeTruthy();
    });

    it('should have proper icon spacing', () => {
      const icons = document.querySelectorAll('#content-pov-tangan label i.fas');
      expect(icons.length).toBeGreaterThan(0);
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
      const header = document.querySelector('#content-pov-tangan h1');
      expect(header.textContent).toContain('POV Tangan');
    });

    it('should have Indonesian header description', () => {
      const description = document.querySelector('#content-pov-tangan header p');
      expect(description.textContent).toContain('POV');
      expect(description.textContent).toContain('foto');
    });

    it('should have Indonesian section headers', () => {
      const sectionHeaders = document.querySelectorAll('#content-pov-tangan .card h2');
      expect(sectionHeaders[0].textContent).toContain('Unggah Foto Tangan');
      expect(sectionHeaders[1].textContent).toContain('Jenis POV');
      expect(sectionHeaders[2].textContent).toContain('Sudut Pandang');
      expect(sectionHeaders[3].textContent).toContain('Kondisi Pencahayaan');
      expect(sectionHeaders[4].textContent).toContain('Deskripsi Latar Belakang');
    });

    it('should have Indonesian upload instruction', () => {
      const uploadLabel = document.querySelector('label[for="pov-tangan-input"] p');
      expect(uploadLabel.textContent).toContain('Unggah foto tangan');
    });

    it('should have Indonesian generate button text', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      expect(generateBtn.textContent).toContain('Hasilkan POV Tangan');
    });

    it('should have Indonesian empty state text', () => {
      const emptyState = document.getElementById('pov-tangan-empty-state');
      expect(emptyState.textContent).toContain('Hasil akan muncul di sini');
      expect(emptyState.textContent).toContain('Unggah foto tangan');
    });

    it('should have Indonesian loading text', () => {
      const loadingText = document.querySelector('#pov-tangan-loading p');
      expect(loadingText.textContent).toContain('Sedang memproses POV tangan');
    });

    it('should have Indonesian POV type labels', () => {
      expect(document.body.textContent).toContain('Selfie Tangan');
      expect(document.body.textContent).toContain('Tangan Memegang');
      expect(document.body.textContent).toContain('Tangan Menunjuk');
      expect(document.body.textContent).toContain('Tangan Peace');
      expect(document.body.textContent).toContain('Tangan Kepalan');
    });

    it('should have Indonesian angle labels', () => {
      expect(document.body.textContent).toContain('Depan');
      expect(document.body.textContent).toContain('Samping');
      expect(document.body.textContent).toContain('Atas');
      expect(document.body.textContent).toContain('Bawah');
    });

    it('should have Indonesian lighting labels', () => {
      expect(document.body.textContent).toContain('Alami');
      expect(document.body.textContent).toContain('Studio');
      expect(document.body.textContent).toContain('Soft Light');
      expect(document.body.textContent).toContain('Dramatis');
      expect(document.body.textContent).toContain('Neon');
    });

    it('should have Indonesian textarea placeholder', () => {
      const textarea = document.getElementById('pov-tangan-background');
      expect(textarea.placeholder).toContain('Jelaskan latar belakang');
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
      const h1 = document.querySelector('#content-pov-tangan h1');
      const h2Elements = document.querySelectorAll('#content-pov-tangan h2');

      expect(h1).toBeTruthy();
      expect(h2Elements.length).toBe(5);
    });

    it('should have labels for form controls', () => {
      const fileInput = document.getElementById('pov-tangan-input');
      expect(fileInput).toBeTruthy();

      const textarea = document.getElementById('pov-tangan-background');
      expect(textarea).toBeTruthy();
    });

    it('should have radio buttons with proper grouping', () => {
      const povTypeRadios = document.querySelectorAll('input[name="pov-type"]');
      const angleRadios = document.querySelectorAll('input[name="angle"]');
      const lightingRadios = document.querySelectorAll('input[name="lighting"]');

      expect(povTypeRadios.length).toBe(5);
      expect(angleRadios.length).toBe(4);
      expect(lightingRadios.length).toBe(5);
    });

    it('should have icons for visual enhancement', () => {
      const icons = document.querySelectorAll('#content-pov-tangan i.fas');
      expect(icons.length).toBeGreaterThan(10);
    });

    it('should have proper button roles', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      const removeBtn = document.getElementById('pov-tangan-remove-btn');

      expect(generateBtn.tagName).toBe('BUTTON');
      expect(removeBtn.tagName).toBe('BUTTON');
    });

    it('should have proper input types', () => {
      const fileInput = document.getElementById('pov-tangan-input');
      const radioButtons = document.querySelectorAll('input[type="radio"]');

      expect(fileInput.type).toBe('file');
      radioButtons.forEach(radio => {
        expect(radio.type).toBe('radio');
      });
    });

    it('should have alt text for images', () => {
      const previewImage = document.getElementById('pov-tangan-preview');
      expect(previewImage.alt).toContain('Pratinjau Tangan');
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
      const main = document.querySelector('#content-pov-tangan main');
      expect(main.classList.contains('grid')).toBe(true);
      expect(main.classList.contains('grid-cols-1')).toBe(true);
      expect(main.classList.contains('lg:grid-cols-2')).toBe(true);
    });

    it('should have responsive header text size', () => {
      const header = document.querySelector('#content-pov-tangan h1');
      expect(header.classList.contains('text-4xl')).toBe(true);
      expect(header.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.querySelector('#content-pov-tangan .container');
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });

    it('should have responsive gap between grid items', () => {
      const main = document.querySelector('#content-pov-tangan main');
      expect(main.classList.contains('gap-8')).toBe(true);
    });

    it('should have responsive space between cards', () => {
      const leftPanel = document.querySelector('#content-pov-tangan main > div:first-child');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });
  });

  describe('Color Scheme (Indigo/Purple)', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should use indigo gradient in header', () => {
      const header = document.querySelector('#content-pov-tangan h1');
      expect(header.classList.contains('from-indigo-600')).toBe(true);
      expect(header.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use indigo/purple in generate button', () => {
      const generateBtn = document.getElementById('pov-tangan-generate-btn');
      expect(generateBtn.classList.contains('from-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use indigo for upload area border', () => {
      const uploadLabel = document.querySelector('label[for="pov-tangan-input"]');
      expect(uploadLabel.classList.contains('border-indigo-300')).toBe(true);
      expect(uploadLabel.classList.contains('hover:border-indigo-500')).toBe(true);
    });

    it('should use indigo for form control borders', () => {
      const textarea = document.getElementById('pov-tangan-background');
      expect(textarea.classList.contains('border-indigo-200')).toBe(true);
      expect(textarea.classList.contains('focus:border-indigo-500')).toBe(true);
    });

    it('should use indigo for radio option borders', () => {
      const radioLabels = document.querySelectorAll('input[name="pov-type"]');
      radioLabels.forEach(radio => {
        const label = radio.closest('label');
        expect(label.classList.contains('border-indigo-200')).toBe(true);
        expect(label.classList.contains('hover:border-indigo-500')).toBe(true);
      });
    });

    it('should use indigo for icons in upload area', () => {
      const uploadIcon = document.querySelector('label[for="pov-tangan-input"] i.fas.fa-hand-paper');
      expect(uploadIcon.classList.contains('text-indigo-400')).toBe(true);
    });

    it('should use indigo for empty state icon', () => {
      const emptyStateIcon = document.querySelector('#pov-tangan-empty-state i.fas.fa-hand-paper');
      expect(emptyStateIcon.classList.contains('text-indigo-400')).toBe(true);
    });

    it('should use indigo for loading spinner', () => {
      const loadingSpinner = document.querySelector('#pov-tangan-loading .loader');
      expect(loadingSpinner.classList.contains('border-indigo-500')).toBe(true);
      expect(loadingSpinner.classList.contains('border-t-4')).toBe(true);
    });

    it('should use indigo for radio button colors', () => {
      const radioButtons = document.querySelectorAll('input[type="radio"]');
      radioButtons.forEach(radio => {
        expect(radio.classList.contains('text-indigo-600')).toBe(true);
      });
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should have all required element IDs', () => {
      expect(document.getElementById('content-pov-tangan')).toBeTruthy();
      expect(document.getElementById('pov-tangan-input')).toBeTruthy();
      expect(document.getElementById('pov-tangan-preview-container')).toBeTruthy();
      expect(document.getElementById('pov-tangan-preview')).toBeTruthy();
      expect(document.getElementById('pov-tangan-remove-btn')).toBeTruthy();
      expect(document.getElementById('pov-tangan-background')).toBeTruthy();
      expect(document.getElementById('pov-tangan-generate-btn')).toBeTruthy();
      expect(document.getElementById('pov-tangan-results-container')).toBeTruthy();
      expect(document.getElementById('pov-tangan-empty-state')).toBeTruthy();
      expect(document.getElementById('pov-tangan-results')).toBeTruthy();
      expect(document.getElementById('pov-tangan-loading')).toBeTruthy();
    });

    it('should have proper element hierarchy', () => {
      const content = document.getElementById('content-pov-tangan');
      const container = content.querySelector('.container');
      const header = container.querySelector('header');
      const main = container.querySelector('main');

      expect(container).toBeTruthy();
      expect(header).toBeTruthy();
      expect(main).toBeTruthy();
    });

    it('should have all radio groups properly structured', () => {
      const povTypeGroup = document.querySelectorAll('input[name="pov-type"]');
      const angleGroup = document.querySelectorAll('input[name="angle"]');
      const lightingGroup = document.querySelectorAll('input[name="lighting"]');

      expect(povTypeGroup.length).toBe(5);
      expect(angleGroup.length).toBe(4);
      expect(lightingGroup.length).toBe(5);
    });

    it('should have proper card structure for each section', () => {
      const cards = document.querySelectorAll('.card');
      expect(cards.length).toBeGreaterThanOrEqual(5);
    });

    it('should have proper results area structure', () => {
      const resultsContainer = document.getElementById('pov-tangan-results-container');
      const emptyState = document.getElementById('pov-tangan-empty-state');
      const results = document.getElementById('pov-tangan-results');
      const loading = document.getElementById('pov-tangan-loading');

      expect(resultsContainer).toBeTruthy();
      expect(emptyState).toBeTruthy();
      expect(results).toBeTruthy();
      expect(loading).toBeTruthy();
    });

    it('should have all icons properly placed', () => {
      expect(document.querySelectorAll('#content-pov-tangan h1 i.fas').length).toBe(1);
      expect(document.querySelectorAll('#content-pov-tangan .upload-area i.fas').length).toBe(1);
      expect(document.querySelectorAll('#content-pov-tangan #pov-tangan-generate-btn i.fas').length).toBe(1);
      expect(document.querySelectorAll('#content-pov-tangan #pov-tangan-remove-btn i.fas').length).toBe(1);
      expect(document.querySelectorAll('#content-pov-tangan #pov-tangan-empty-state i.fas').length).toBe(1);
    });
  });
});
