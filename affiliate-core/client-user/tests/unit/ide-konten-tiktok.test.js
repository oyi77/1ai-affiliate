import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock clipboard API
global.navigator.clipboard = {
  writeText: vi.fn().mockResolvedValue()
};

// Mock alert
global.alert = vi.fn();

describe('ide-konten-tiktok Component', () => {
  
  const mockComponentHTML = `
    <!-- Ide Konten TikTok Component -->
    <div id="ide-konten-tiktok-container" class="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl p-6 shadow-lg">
      <!-- Header -->
      <div id="ide-konten-tiktok-header" class="mb-6">
        <h2 id="ide-konten-tiktok-title" class="text-2xl font-bold text-white mb-2">
          💡 Ide Konten TikTok
        </h2>
        <p id="ide-konten-tiktok-subtitle" class="text-white/90 text-sm">
          Dapatkan ide konten kreatif untuk TikTok Anda
        </p>
      </div>

      <!-- Form Container -->
      <div id="ide-konten-tiktok-form" class="bg-white rounded-lg p-6 shadow-md">
        <!-- Content Category Selection -->
        <div id="ide-konten-tiktok-category-group" class="mb-5">
          <label id="ide-konten-tiktok-category-label" for="ide-konten-tiktok-category" class="block text-gray-700 font-semibold mb-2">
            📂 Kategori Konten
          </label>
          <select id="ide-konten-tiktok-category" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all">
            <option value="">-- Pilih Kategori --</option>
            <option value="edukasi">🎓 Edukasi</option>
            <option value="hiburan">🎭 Hiburan</option>
            <option value="lifestyle">🌟 Lifestyle</option>
            <option value="bisnis">💼 Bisnis</option>
            <option value="kecantikan">💄 Kecantikan</option>
            <option value="makanan">🍳 Makanan & Kuliner</option>
            <option value="travel">✈️ Travel</option>
            <option value="teknologi">💻 Teknologi</option>
            <option value="kesehatan">🏃 Kesehatan & Fitness</option>
            <option value="komedi">😂 Komedi</option>
          </select>
        </div>

        <!-- Niche/Topic Input -->
        <div id="ide-konten-tiktok-niche-group" class="mb-5">
          <label id="ide-konten-tiktok-niche-label" for="ide-konten-tiktok-niche" class="block text-gray-700 font-semibold mb-2">
            🎯 Niche / Topik
          </label>
          <input 
            type="text" 
            id="ide-konten-tiktok-niche" 
            placeholder="Contoh: Digital marketing, Makeup artist, Traveling..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
          >
          <p id="ide-konten-tiktok-niche-help" class="text-gray-500 text-xs mt-1">
            Tuliskan niche atau topik spesifik yang Anda minati
          </p>
        </div>

        <!-- Target Audience Selection -->
        <div id="ide-konten-tiktok-audience-group" class="mb-5">
          <label id="ide-konten-tiktok-audience-label" for="ide-konten-tiktok-audience" class="block text-gray-700 font-semibold mb-2">
            👥 Target Audiens
          </label>
          <select id="ide-konten-tiktok-audience" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all">
            <option value="">-- Pilih Target Audiens --</option>
            <option value="remaja">👶 Remaja (13-19 tahun)</option>
            <option value="dewasa-muda">👨 Dewasa Muda (20-35 tahun)</option>
            <option value="dewasa">👴 Dewasa (36-50 tahun)</option>
            <option value="profesional">💼 Profesional</option>
            <option value="mahasiswa">🎓 Mahasiswa</option>
            <option value="ibu-rumah-tangga">🏠 Ibu Rumah Tangga</option>
            <option value="pebisnis">🚀 Pebisnis & Entrepreneur</option>
          </select>
        </div>

        <!-- Trend Incorporation Option -->
        <div id="ide-konten-tiktok-trend-group" class="mb-6">
          <label class="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              id="ide-konten-tiktok-trend" 
              class="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            >
            <span id="ide-konten-tiktok-trend-label" class="ml-3 text-gray-700 font-medium">
              🔥 Sertakan Tren Terkini
            </span>
          </label>
          <p id="ide-konten-tiktok-trend-help" class="text-gray-500 text-xs mt-1 ml-8">
            Ide akan disesuaikan dengan tren viral saat ini di TikTok
          </p>
        </div>

        <!-- Generate Button -->
        <button 
          id="ide-konten-tiktok-generate-btn"
          class="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-teal-600 transform hover:scale-[1.02] transition-all shadow-md hover:shadow-lg"
        >
          🚀 Generate Ide Konten
        </button>
      </div>

      <!-- Results Container (Hidden by default) -->
      <div id="ide-konten-tiktok-results" class="hidden mt-6">
        <div id="ide-konten-tiktok-results-header" class="flex items-center justify-between mb-4">
          <h3 id="ide-konten-tiktok-results-title" class="text-xl font-bold text-white">
            ✨ Ide Konten yang Dihasilkan
          </h3>
          <button 
            id="ide-konten-tiktok-clear-btn"
            class="text-white/80 hover:text-white text-sm underline"
          >
            Hapus Hasil
          </button>
        </div>
        
        <div id="ide-konten-tiktok-ideas-list" class="space-y-4">
          <!-- Ideas will be injected here -->
        </div>
      </div>
    </div>
  `;

  beforeEach(() => {
    document.body.innerHTML = mockComponentHTML;
    // Reset clipboard mock
    global.navigator.clipboard.writeText = vi.fn().mockResolvedValue();
    // Reset alert mock
    global.alert = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should render main container with correct ID', () => {
      const container = document.getElementById('ide-konten-tiktok-container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(container.classList.contains('from-cyan-500')).toBe(true);
      expect(container.classList.contains('to-teal-500')).toBe(true);
      expect(container.classList.contains('rounded-xl')).toBe(true);
      expect(container.classList.contains('p-6')).toBe(true);
      expect(container.classList.contains('shadow-lg')).toBe(true);
    });

    it('should render header with title', () => {
      const header = document.getElementById('ide-konten-tiktok-header');
      expect(header).toBeTruthy();
      expect(header.classList.contains('mb-6')).toBe(true);
      
      const title = document.getElementById('ide-konten-tiktok-title');
      expect(title).toBeTruthy();
      expect(title.classList.contains('text-2xl')).toBe(true);
      expect(title.classList.contains('font-bold')).toBe(true);
      expect(title.classList.contains('text-white')).toBe(true);
      expect(title.textContent).toContain('Ide Konten TikTok');
    });

    it('should render header with subtitle', () => {
      const subtitle = document.getElementById('ide-konten-tiktok-subtitle');
      expect(subtitle).toBeTruthy();
      expect(subtitle.classList.contains('text-white/90')).toBe(true);
      expect(subtitle.classList.contains('text-sm')).toBe(true);
      expect(subtitle.textContent).toContain('Dapatkan ide konten kreatif');
    });

    it('should render form container', () => {
      const form = document.getElementById('ide-konten-tiktok-form');
      expect(form).toBeTruthy();
      expect(form.classList.contains('bg-white')).toBe(true);
      expect(form.classList.contains('rounded-lg')).toBe(true);
      expect(form.classList.contains('p-6')).toBe(true);
      expect(form.classList.contains('shadow-md')).toBe(true);
    });

    it('should have all form groups', () => {
      const categoryGroup = document.getElementById('ide-konten-tiktok-category-group');
      expect(categoryGroup).toBeTruthy();
      expect(categoryGroup.classList.contains('mb-5')).toBe(true);
      
      const nicheGroup = document.getElementById('ide-konten-tiktok-niche-group');
      expect(nicheGroup).toBeTruthy();
      expect(nicheGroup.classList.contains('mb-5')).toBe(true);
      
      const audienceGroup = document.getElementById('ide-konten-tiktok-audience-group');
      expect(audienceGroup).toBeTruthy();
      expect(audienceGroup.classList.contains('mb-5')).toBe(true);
      
      const trendGroup = document.getElementById('ide-konten-tiktok-trend-group');
      expect(trendGroup).toBeTruthy();
      expect(trendGroup.classList.contains('mb-6')).toBe(true);
    });

    it('should render results container', () => {
      const results = document.getElementById('ide-konten-tiktok-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('mt-6')).toBe(true);
    });

    it('should render results header', () => {
      const resultsHeader = document.getElementById('ide-konten-tiktok-results-header');
      expect(resultsHeader).toBeTruthy();
      expect(resultsHeader.classList.contains('flex')).toBe(true);
      expect(resultsHeader.classList.contains('items-center')).toBe(true);
      expect(resultsHeader.classList.contains('justify-between')).toBe(true);
      expect(resultsHeader.classList.contains('mb-4')).toBe(true);
      
      const resultsTitle = document.getElementById('ide-konten-tiktok-results-title');
      expect(resultsTitle).toBeTruthy();
      expect(resultsTitle.classList.contains('text-xl')).toBe(true);
      expect(resultsTitle.classList.contains('font-bold')).toBe(true);
      expect(resultsTitle.classList.contains('text-white')).toBe(true);
      expect(resultsTitle.textContent).toContain('Ide Konten yang Dihasilkan');
    });

    it('should render clear button', () => {
      const clearBtn = document.getElementById('ide-konten-tiktok-clear-btn');
      expect(clearBtn).toBeTruthy();
      expect(clearBtn.classList.contains('text-white/80')).toBe(true);
      expect(clearBtn.classList.contains('hover:text-white')).toBe(true);
      expect(clearBtn.textContent).toContain('Hapus Hasil');
    });

    it('should render ideas list container', () => {
      const ideasList = document.getElementById('ide-konten-tiktok-ideas-list');
      expect(ideasList).toBeTruthy();
      expect(ideasList.classList.contains('space-y-4')).toBe(true);
    });
  });

  // Content Category Selection Tests
  describe('Content Category Selection', () => {
    it('should render category label', () => {
      const label = document.getElementById('ide-konten-tiktok-category-label');
      expect(label).toBeTruthy();
      expect(label.getAttribute('for')).toBe('ide-konten-tiktok-category');
      expect(label.classList.contains('block')).toBe(true);
      expect(label.classList.contains('text-gray-700')).toBe(true);
      expect(label.classList.contains('font-semibold')).toBe(true);
      expect(label.textContent).toContain('Kategori Konten');
    });

    it('should render category select dropdown', () => {
      const select = document.getElementById('ide-konten-tiktok-category');
      expect(select).toBeTruthy();
      expect(select.tagName).toBe('SELECT');
      expect(select.classList.contains('w-full')).toBe(true);
      expect(select.classList.contains('px-4')).toBe(true);
      expect(select.classList.contains('py-3')).toBe(true);
      expect(select.classList.contains('border')).toBe(true);
      expect(select.classList.contains('border-gray-300')).toBe(true);
      expect(select.classList.contains('rounded-lg')).toBe(true);
      expect(select.classList.contains('focus:ring-2')).toBe(true);
      expect(select.classList.contains('focus:ring-cyan-500')).toBe(true);
    });

    it('should have correct category options', () => {
      const select = document.getElementById('ide-konten-tiktok-category');
      const options = select.querySelectorAll('option');
      expect(options.length).toBe(11); // 1 default + 10 categories
      
      expect(options[0].value).toBe('');
      expect(options[0].textContent).toContain('-- Pilih Kategori --');
      
      expect(options[1].value).toBe('edukasi');
      expect(options[1].textContent).toContain('Edukasi');
      
      expect(options[2].value).toBe('hiburan');
      expect(options[2].textContent).toContain('Hiburan');
      
      expect(options[3].value).toBe('lifestyle');
      expect(options[3].textContent).toContain('Lifestyle');
      
      expect(options[4].value).toBe('bisnis');
      expect(options[4].textContent).toContain('Bisnis');
      
      expect(options[5].value).toBe('kecantikan');
      expect(options[5].textContent).toContain('Kecantikan');
      
      expect(options[6].value).toBe('makanan');
      expect(options[6].textContent).toContain('Makanan');
      
      expect(options[7].value).toBe('travel');
      expect(options[7].textContent).toContain('Travel');
      
      expect(options[8].value).toBe('teknologi');
      expect(options[8].textContent).toContain('Teknologi');
      
      expect(options[9].value).toBe('kesehatan');
      expect(options[9].textContent).toContain('Kesehatan');
      
      expect(options[10].value).toBe('komedi');
      expect(options[10].textContent).toContain('Komedi');
    });

    it('should have focus ring with cyan color on category select', () => {
      const select = document.getElementById('ide-konten-tiktok-category');
      expect(select.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(select.classList.contains('focus:border-cyan-500')).toBe(true);
    });
  });

  // Niche/Topic Input Tests
  describe('Niche/Topic Input', () => {
    it('should render niche label', () => {
      const label = document.getElementById('ide-konten-tiktok-niche-label');
      expect(label).toBeTruthy();
      expect(label.getAttribute('for')).toBe('ide-konten-tiktok-niche');
      expect(label.classList.contains('block')).toBe(true);
      expect(label.classList.contains('text-gray-700')).toBe(true);
      expect(label.classList.contains('font-semibold')).toBe(true);
      expect(label.textContent).toContain('Niche / Topik');
    });

    it('should render niche text input', () => {
      const input = document.getElementById('ide-konten-tiktok-niche');
      expect(input).toBeTruthy();
      expect(input.tagName).toBe('INPUT');
      expect(input.type).toBe('text');
      expect(input.classList.contains('w-full')).toBe(true);
      expect(input.classList.contains('px-4')).toBe(true);
      expect(input.classList.contains('py-3')).toBe(true);
      expect(input.classList.contains('border')).toBe(true);
      expect(input.classList.contains('border-gray-300')).toBe(true);
      expect(input.classList.contains('rounded-lg')).toBe(true);
      expect(input.classList.contains('focus:ring-2')).toBe(true);
      expect(input.classList.contains('focus:ring-cyan-500')).toBe(true);
    });

    it('should have correct placeholder text', () => {
      const input = document.getElementById('ide-konten-tiktok-niche');
      expect(input.placeholder).toContain('Digital marketing');
      expect(input.placeholder).toContain('Makeup artist');
      expect(input.placeholder).toContain('Traveling');
    });

    it('should render niche help text', () => {
      const help = document.getElementById('ide-konten-tiktok-niche-help');
      expect(help).toBeTruthy();
      expect(help.classList.contains('text-gray-500')).toBe(true);
      expect(help.classList.contains('text-xs')).toBe(true);
      expect(help.classList.contains('mt-1')).toBe(true);
      expect(help.textContent).toContain('niche atau topik spesifik');
    });

    it('should have focus ring with cyan color on niche input', () => {
      const input = document.getElementById('ide-konten-tiktok-niche');
      expect(input.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(input.classList.contains('focus:border-cyan-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience label', () => {
      const label = document.getElementById('ide-konten-tiktok-audience-label');
      expect(label).toBeTruthy();
      expect(label.getAttribute('for')).toBe('ide-konten-tiktok-audience');
      expect(label.classList.contains('block')).toBe(true);
      expect(label.classList.contains('text-gray-700')).toBe(true);
      expect(label.classList.contains('font-semibold')).toBe(true);
      expect(label.textContent).toContain('Target Audiens');
    });

    it('should render audience select dropdown', () => {
      const select = document.getElementById('ide-konten-tiktok-audience');
      expect(select).toBeTruthy();
      expect(select.tagName).toBe('SELECT');
      expect(select.classList.contains('w-full')).toBe(true);
      expect(select.classList.contains('px-4')).toBe(true);
      expect(select.classList.contains('py-3')).toBe(true);
      expect(select.classList.contains('border')).toBe(true);
      expect(select.classList.contains('border-gray-300')).toBe(true);
      expect(select.classList.contains('rounded-lg')).toBe(true);
      expect(select.classList.contains('focus:ring-2')).toBe(true);
      expect(select.classList.contains('focus:ring-cyan-500')).toBe(true);
    });

    it('should have correct audience options', () => {
      const select = document.getElementById('ide-konten-tiktok-audience');
      const options = select.querySelectorAll('option');
      expect(options.length).toBe(8); // 1 default + 7 audiences
      
      expect(options[0].value).toBe('');
      expect(options[0].textContent).toContain('-- Pilih Target Audiens --');
      
      expect(options[1].value).toBe('remaja');
      expect(options[1].textContent).toContain('Remaja');
      
      expect(options[2].value).toBe('dewasa-muda');
      expect(options[2].textContent).toContain('Dewasa Muda');
      
      expect(options[3].value).toBe('dewasa');
      expect(options[3].textContent).toContain('Dewasa');
      
      expect(options[4].value).toBe('profesional');
      expect(options[4].textContent).toContain('Profesional');
      
      expect(options[5].value).toBe('mahasiswa');
      expect(options[5].textContent).toContain('Mahasiswa');
      
      expect(options[6].value).toBe('ibu-rumah-tangga');
      expect(options[6].textContent).toContain('Ibu Rumah Tangga');
      
      expect(options[7].value).toBe('pebisnis');
      expect(options[7].textContent).toContain('Pebisnis');
    });

    it('should have focus ring with cyan color on audience select', () => {
      const select = document.getElementById('ide-konten-tiktok-audience');
      expect(select.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(select.classList.contains('focus:border-cyan-500')).toBe(true);
    });
  });

  // Trend Incorporation Tests
  describe('Trend Incorporation', () => {
    it('should render trend group', () => {
      const group = document.getElementById('ide-konten-tiktok-trend-group');
      expect(group).toBeTruthy();
      expect(group.classList.contains('mb-6')).toBe(true);
    });

    it('should render trend checkbox', () => {
      const checkbox = document.getElementById('ide-konten-tiktok-trend');
      expect(checkbox).toBeTruthy();
      expect(checkbox.type).toBe('checkbox');
      expect(checkbox.classList.contains('w-5')).toBe(true);
      expect(checkbox.classList.contains('h-5')).toBe(true);
      expect(checkbox.classList.contains('text-cyan-600')).toBe(true);
      expect(checkbox.classList.contains('border-gray-300')).toBe(true);
      expect(checkbox.classList.contains('rounded')).toBe(true);
      expect(checkbox.classList.contains('focus:ring-cyan-500')).toBe(true);
    });

    it('should render trend label', () => {
      const label = document.getElementById('ide-konten-tiktok-trend-label');
      expect(label).toBeTruthy();
      expect(label.classList.contains('ml-3')).toBe(true);
      expect(label.classList.contains('text-gray-700')).toBe(true);
      expect(label.classList.contains('font-medium')).toBe(true);
      expect(label.textContent).toContain('Sertakan Tren Terkini');
    });

    it('should render trend help text', () => {
      const help = document.getElementById('ide-konten-tiktok-trend-help');
      expect(help).toBeTruthy();
      expect(help.classList.contains('text-gray-500')).toBe(true);
      expect(help.classList.contains('text-xs')).toBe(true);
      expect(help.classList.contains('mt-1')).toBe(true);
      expect(help.classList.contains('ml-8')).toBe(true);
      expect(help.textContent).toContain('tren viral');
    });

    it('should have checkbox unchecked by default', () => {
      const checkbox = document.getElementById('ide-konten-tiktok-trend');
      expect(checkbox.checked).toBe(false);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn).toBeTruthy();
      expect(btn.type).toBe('submit');
      expect(btn.textContent).toContain('Generate Ide Konten');
    });

    it('should have correct styling classes', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('w-full')).toBe(true);
      expect(btn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(btn.classList.contains('from-cyan-500')).toBe(true);
      expect(btn.classList.contains('to-teal-500')).toBe(true);
      expect(btn.classList.contains('text-white')).toBe(true);
      expect(btn.classList.contains('font-bold')).toBe(true);
      expect(btn.classList.contains('py-3')).toBe(true);
      expect(btn.classList.contains('px-6')).toBe(true);
      expect(btn.classList.contains('rounded-lg')).toBe(true);
      expect(btn.classList.contains('shadow-md')).toBe(true);
    });

    it('should have hover effects', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('hover:from-cyan-600')).toBe(true);
      expect(btn.classList.contains('hover:to-teal-600')).toBe(true);
      expect(btn.classList.contains('hover:shadow-lg')).toBe(true);
    });

    it('should have transition and transform classes', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('transition-all')).toBe(true);
      expect(btn.classList.contains('transform')).toBe(true);
      expect(btn.classList.contains('hover:scale-[1.02]')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should have results container hidden by default', () => {
      const results = document.getElementById('ide-konten-tiktok-results');
      expect(results.classList.contains('hidden')).toBe(true);
    });

    it('should have results header with proper styling', () => {
      const title = document.getElementById('ide-konten-tiktok-results-title');
      expect(title).toBeTruthy();
      expect(title.classList.contains('text-xl')).toBe(true);
      expect(title.classList.contains('font-bold')).toBe(true);
      expect(title.classList.contains('text-white')).toBe(true);
      expect(title.textContent).toContain('Ide Konten yang Dihasilkan');
    });

    it('should have clear button with proper styling', () => {
      const clearBtn = document.getElementById('ide-konten-tiktok-clear-btn');
      expect(clearBtn).toBeTruthy();
      expect(clearBtn.classList.contains('text-white/80')).toBe(true);
      expect(clearBtn.classList.contains('hover:text-white')).toBe(true);
      expect(clearBtn.classList.contains('text-sm')).toBe(true);
      expect(clearBtn.classList.contains('underline')).toBe(true);
    });

    it('should have ideas list container', () => {
      const ideasList = document.getElementById('ide-konten-tiktok-ideas-list');
      expect(ideasList).toBeTruthy();
      expect(ideasList.classList.contains('space-y-4')).toBe(true);
    });
  });

  // Color Scheme Tests (Cyan/Teal)
  describe('Color Scheme (Cyan/Teal)', () => {
    it('should use cyan/teal gradient in main container', () => {
      const container = document.getElementById('ide-konten-tiktok-container');
      expect(container.classList.contains('bg-gradient-to-br')).toBe(true);
      expect(container.classList.contains('from-cyan-500')).toBe(true);
      expect(container.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use cyan accents in form inputs', () => {
      const categorySelect = document.getElementById('ide-konten-tiktok-category');
      expect(categorySelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(categorySelect.classList.contains('focus:border-cyan-500')).toBe(true);
      
      const nicheInput = document.getElementById('ide-konten-tiktok-niche');
      expect(nicheInput.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(nicheInput.classList.contains('focus:border-cyan-500')).toBe(true);
      
      const audienceSelect = document.getElementById('ide-konten-tiktok-audience');
      expect(audienceSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use cyan/teal gradient in generate button', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(btn.classList.contains('from-cyan-500')).toBe(true);
      expect(btn.classList.contains('to-teal-500')).toBe(true);
    });

    it('should use cyan/teal in button hover states', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('hover:from-cyan-600')).toBe(true);
      expect(btn.classList.contains('hover:to-teal-600')).toBe(true);
    });

    it('should use cyan color in trend checkbox', () => {
      const checkbox = document.getElementById('ide-konten-tiktok-trend');
      expect(checkbox.classList.contains('text-cyan-600')).toBe(true);
      expect(checkbox.classList.contains('focus:ring-cyan-500')).toBe(true);
    });

    it('should use white text in header and results', () => {
      const title = document.getElementById('ide-konten-tiktok-title');
      expect(title.classList.contains('text-white')).toBe(true);
      
      const subtitle = document.getElementById('ide-konten-tiktok-subtitle');
      expect(subtitle.classList.contains('text-white/90')).toBe(true);
      
      const resultsTitle = document.getElementById('ide-konten-tiktok-results-title');
      expect(resultsTitle.classList.contains('text-white')).toBe(true);
    });

    it('should use white text with opacity in clear button', () => {
      const clearBtn = document.getElementById('ide-konten-tiktok-clear-btn');
      expect(clearBtn.classList.contains('text-white/80')).toBe(true);
      expect(clearBtn.classList.contains('hover:text-white')).toBe(true);
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Ide Konten TikTok');
      expect(document.body.textContent).toContain('Dapatkan ide konten kreatif');
      expect(document.body.textContent).toContain('Kategori Konten');
      expect(document.body.textContent).toContain('Niche / Topik');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Sertakan Tren Terkini');
      expect(document.body.textContent).toContain('Generate Ide Konten');
      expect(document.body.textContent).toContain('Ide Konten yang Dihasilkan');
      expect(document.body.textContent).toContain('Hapus Hasil');
    });

    it('should have proper placeholder texts', () => {
      const nicheInput = document.getElementById('ide-konten-tiktok-niche');
      expect(nicheInput.placeholder).toContain('Digital marketing');
      expect(nicheInput.placeholder).toContain('Makeup artist');
      expect(nicheInput.placeholder).toContain('Traveling');
    });

    it('should have help text for niche input', () => {
      const nicheHelp = document.getElementById('ide-konten-tiktok-niche-help');
      expect(nicheHelp.textContent).toContain('niche atau topik spesifik');
    });

    it('should have help text for trend checkbox', () => {
      const trendHelp = document.getElementById('ide-konten-tiktok-trend-help');
      expect(trendHelp.textContent).toContain('tren viral');
    });
  });

  // Input Styling Tests
  describe('Input Styling', () => {
    it('should have consistent input styling', () => {
      const inputs = document.body.querySelectorAll('input[type="text"], select');
      inputs.forEach(input => {
        expect(input.classList.contains('w-full')).toBe(true);
        expect(input.classList.contains('px-4')).toBe(true);
        expect(input.classList.contains('py-3')).toBe(true);
        expect(input.classList.contains('border')).toBe(true);
        expect(input.classList.contains('border-gray-300')).toBe(true);
        expect(input.classList.contains('rounded-lg')).toBe(true);
        expect(input.classList.contains('focus:ring-2')).toBe(true);
        expect(input.classList.contains('focus:ring-cyan-500')).toBe(true);
        expect(input.classList.contains('outline-none')).toBe(true);
        expect(input.classList.contains('transition-all')).toBe(true);
      });
    });
  });

  // Form Group Styling Tests
  describe('Form Group Styling', () => {
    it('should have proper margin for category group', () => {
      const group = document.getElementById('ide-konten-tiktok-category-group');
      expect(group.classList.contains('mb-5')).toBe(true);
    });

    it('should have proper margin for niche group', () => {
      const group = document.getElementById('ide-konten-tiktok-niche-group');
      expect(group.classList.contains('mb-5')).toBe(true);
    });

    it('should have proper margin for audience group', () => {
      const group = document.getElementById('ide-konten-tiktok-audience-group');
      expect(group.classList.contains('mb-5')).toBe(true);
    });

    it('should have proper margin for trend group', () => {
      const group = document.getElementById('ide-konten-tiktok-trend-group');
      expect(group.classList.contains('mb-6')).toBe(true);
    });

    it('should have proper label styling', () => {
      const labels = document.body.querySelectorAll('#ide-konten-tiktok-form label');
      // Only check the first 3 form labels (category, niche, audience), not the trend label
      // which is inside a flex container and doesn't have "block" class
      for (let i = 0; i < 3; i++) {
        expect(labels[i].classList.contains('block')).toBe(true);
        expect(labels[i].classList.contains('text-gray-700')).toBe(true);
        expect(labels[i].classList.contains('font-semibold')).toBe(true);
        expect(labels[i].classList.contains('mb-2')).toBe(true);
      }
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      const categoryLabel = document.getElementById('ide-konten-tiktok-category-label');
      expect(categoryLabel.getAttribute('for')).toBe('ide-konten-tiktok-category');
      
      const nicheLabel = document.getElementById('ide-konten-tiktok-niche-label');
      expect(nicheLabel.getAttribute('for')).toBe('ide-konten-tiktok-niche');
      
      const audienceLabel = document.getElementById('ide-konten-tiktok-audience-label');
      expect(audienceLabel.getAttribute('for')).toBe('ide-konten-tiktok-audience');
    });

    it('should have proper heading structure', () => {
      const title = document.getElementById('ide-konten-tiktok-title');
      expect(title.tagName).toBe('H2');
      
      const resultsTitle = document.getElementById('ide-konten-tiktok-results-title');
      expect(resultsTitle.tagName).toBe('H3');
    });

    it('should have checkbox with proper labeling', () => {
      const checkbox = document.getElementById('ide-konten-tiktok-trend');
      const label = checkbox.closest('label');
      expect(label).toBeTruthy();
      expect(label.classList.contains('flex')).toBe(true);
      expect(label.classList.contains('items-center')).toBe(true);
      expect(label.classList.contains('cursor-pointer')).toBe(true);
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have proper container padding', () => {
      const container = document.getElementById('ide-konten-tiktok-container');
      expect(container.classList.contains('p-6')).toBe(true);
    });

    it('should have proper form container padding', () => {
      const form = document.getElementById('ide-konten-tiktok-form');
      expect(form.classList.contains('p-6')).toBe(true);
    });

    it('should have proper results margin', () => {
      const results = document.getElementById('ide-konten-tiktok-results');
      expect(results.classList.contains('mt-6')).toBe(true);
    });

    it('should have proper results header margin', () => {
      const header = document.getElementById('ide-konten-tiktok-results-header');
      expect(header.classList.contains('mb-4')).toBe(true);
    });
  });

  // Button Styling Tests
  describe('Button Styling', () => {
    it('should have proper button dimensions', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('w-full')).toBe(true);
      expect(btn.classList.contains('py-3')).toBe(true);
      expect(btn.classList.contains('px-6')).toBe(true);
    });

    it('should have proper button border radius', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have proper button shadow', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('shadow-md')).toBe(true);
      expect(btn.classList.contains('hover:shadow-lg')).toBe(true);
    });

    it('should have proper button text styling', () => {
      const btn = document.getElementById('ide-konten-tiktok-generate-btn');
      expect(btn.classList.contains('text-white')).toBe(true);
      expect(btn.classList.contains('font-bold')).toBe(true);
    });
  });
});
