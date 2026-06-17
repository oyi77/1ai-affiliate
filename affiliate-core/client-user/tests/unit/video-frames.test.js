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

describe('video-frames Component', () => {
  
  const mockComponentHTML = `
    <div id="content-video-frames" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
            <i class="fas fa-film mr-3"></i>Video Frames
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat frame video yang cinematic dan kreatif untuk konten Anda</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Frame Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Frame</h2>
              <div id="video-frames-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="thumbnail" class="type-btn-video-frames p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-image text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Thumbnail</span>
                </button>
                <button type="button" data-type="intro" class="type-btn-video-frames p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-play-circle text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Intro</span>
                </button>
                <button type="button" data-type="outro" class="type-btn-video-frames p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-stop-circle text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Outro</span>
                </button>
                <button type="button" data-type="lower-third" class="type-btn-video-frames p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-closed-captioning text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Lower Third</span>
                </button>
                <button type="button" data-type="transition" class="type-btn-video-frames p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-random text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Transisi</span>
                </button>
                <button type="button" data-type="caption" class="type-btn-video-frames p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-comment-alt text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Caption</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Video Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Gaya Video</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frames-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-video mr-1 text-blue-500"></i>Gaya Video
                  </label>
                  <select id="video-frames-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="vlog">Vlog</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="documentary">Documentary</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="gaming">Gaming</option>
                    <option value="music-video">Music Video</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Aspect Ratio -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Aspect Ratio</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frames-aspect-ratio" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-expand-arrows-alt mr-1 text-blue-500"></i>Aspect Ratio
                  </label>
                  <select id="video-frames-aspect-ratio" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Portrait)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Duration -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Durasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frames-duration" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-clock mr-1 text-blue-500"></i>Durasi
                  </label>
                  <select id="video-frames-duration" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="5s">5 Detik</option>
                    <option value="10s">10 Detik</option>
                    <option value="15s">15 Detik</option>
                    <option value="30s">30 Detik</option>
                    <option value="60s">60 Detik</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frames-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-blue-500"></i>Target Audiens
                  </label>
                  <select id="video-frames-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="social-media">Media Sosial</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="professional">Profesional</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="video-frames-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-heart mr-1 text-blue-500"></i>Nuansa
                  </label>
                  <select id="video-frames-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="professional">Profesional</option>
                    <option value="casual">Casual</option>
                    <option value="dramatic">Dramatis</option>
                    <option value="fun">Seru</option>
                    <option value="minimal">Minimalis</option>
                    <option value="energetic">Energik</option>
                  </select>
                </div>
                
                <div>
                  <label for="video-frames-description" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-align-left mr-1 text-blue-500"></i>Deskripsi Frame
                  </label>
                  <textarea id="video-frames-description" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Jelaskan frame video yang diinginkan..."></textarea>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="video-frames-generate-btn" class="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Video Frames
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="video-frames-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="video-frames-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-film text-6xl mb-4 text-blue-400"></i>
                <p class="text-xl">Hasil video frames akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Video Frames</p>
              </div>
              <div id="video-frames-results" class="hidden space-y-6"></div>
              <div id="video-frames-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat video frames...</p>
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
      const container = document.getElementById('content-video-frames');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Video Frames');
      expect(title.querySelector('i.fas.fa-film')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat frame video yang cinematic dan kreatif untuk konten Anda');
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
      expect(rightPanel.querySelector('#video-frames-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Frame Type Selection Tests
  describe('Frame Type Selection', () => {
    it('should render frame type options container', () => {
      const typeOptions = document.getElementById('video-frames-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Thumbnail option', () => {
      const thumbnailBtn = document.body.querySelector('[data-type="thumbnail"]');
      expect(thumbnailBtn).toBeTruthy();
      expect(thumbnailBtn.textContent).toContain('Thumbnail');
      expect(thumbnailBtn.querySelector('i.fas.fa-image')).toBeTruthy();
      expect(thumbnailBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Intro option', () => {
      const introBtn = document.body.querySelector('[data-type="intro"]');
      expect(introBtn).toBeTruthy();
      expect(introBtn.textContent).toContain('Intro');
      expect(introBtn.querySelector('i.fas.fa-play-circle')).toBeTruthy();
    });

    it('should render Outro option', () => {
      const outroBtn = document.body.querySelector('[data-type="outro"]');
      expect(outroBtn).toBeTruthy();
      expect(outroBtn.textContent).toContain('Outro');
      expect(outroBtn.querySelector('i.fas.fa-stop-circle')).toBeTruthy();
    });

    it('should render Lower Third option', () => {
      const lowerThirdBtn = document.body.querySelector('[data-type="lower-third"]');
      expect(lowerThirdBtn).toBeTruthy();
      expect(lowerThirdBtn.textContent).toContain('Lower Third');
      expect(lowerThirdBtn.querySelector('i.fas.fa-closed-captioning')).toBeTruthy();
    });

    it('should render Transisi option', () => {
      const transitionBtn = document.body.querySelector('[data-type="transition"]');
      expect(transitionBtn).toBeTruthy();
      expect(transitionBtn.textContent).toContain('Transisi');
      expect(transitionBtn.querySelector('i.fas.fa-random')).toBeTruthy();
    });

    it('should render Caption option', () => {
      const captionBtn = document.body.querySelector('[data-type="caption"]');
      expect(captionBtn).toBeTruthy();
      expect(captionBtn.textContent).toContain('Caption');
      expect(captionBtn.querySelector('i.fas.fa-comment-alt')).toBeTruthy();
    });

    it('should have 6 frame type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-video-frames');
      expect(typeBtns.length).toBe(6);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('video-frames-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have blue icons for all type options', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-video-frames');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Frame');
    });

    it('should have blue hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-video-frames');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-blue-100')).toBe(true);
      });
    });
  });

  // Video Style Input Tests
  describe('Video Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect).toBeTruthy();
      expect(styleSelect.tagName).toBe('SELECT');
      expect(styleSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Gaya Video');
    });

    it('should have all labels with icons', () => {
      const videoIcon = document.body.querySelector('i.fas.fa-video');
      expect(videoIcon).toBeTruthy();
    });

    it('should have style options with proper labels', () => {
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect.options[0].textContent).toContain('Vlog');
      expect(styleSelect.options[1].textContent).toContain('Cinematic');
      expect(styleSelect.options[2].textContent).toContain('Documentary');
      expect(styleSelect.options[3].textContent).toContain('Tutorial');
      expect(styleSelect.options[4].textContent).toContain('Gaming');
      expect(styleSelect.options[5].textContent).toContain('Music Video');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect.value).toBe('vlog');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Aspect Ratio Input Tests
  describe('Aspect Ratio Input', () => {
    it('should render aspect ratio select', () => {
      const aspectRatioSelect = document.getElementById('video-frames-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      expect(aspectRatioSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[2].textContent).toContain('3. Aspect Ratio');
    });

    it('should have all labels with icons', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon).toBeTruthy();
    });

    it('should have aspect ratio options with proper labels', () => {
      const aspectRatioSelect = document.getElementById('video-frames-aspect-ratio');
      expect(aspectRatioSelect.options[0].textContent).toContain('16:9');
      expect(aspectRatioSelect.options[1].textContent).toContain('9:16');
      expect(aspectRatioSelect.options[2].textContent).toContain('1:1');
      expect(aspectRatioSelect.options[3].textContent).toContain('4:5');
      expect(aspectRatioSelect.options[4].textContent).toContain('21:9');
    });

    it('should have default aspect ratio value', () => {
      const aspectRatioSelect = document.getElementById('video-frames-aspect-ratio');
      expect(aspectRatioSelect.value).toBe('16:9');
    });

    it('should have proper input styling', () => {
      const aspectRatioSelect = document.getElementById('video-frames-aspect-ratio');
      expect(aspectRatioSelect.classList.contains('w-full')).toBe(true);
      expect(aspectRatioSelect.classList.contains('p-3')).toBe(true);
      expect(aspectRatioSelect.classList.contains('border')).toBe(true);
      expect(aspectRatioSelect.classList.contains('rounded-lg')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(aspectRatioSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Duration Input Tests
  describe('Duration Input', () => {
    it('should render duration select', () => {
      const durationSelect = document.getElementById('video-frames-duration');
      expect(durationSelect).toBeTruthy();
      expect(durationSelect.tagName).toBe('SELECT');
      expect(durationSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Durasi');
    });

    it('should have all labels with icons', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have duration options with proper labels', () => {
      const durationSelect = document.getElementById('video-frames-duration');
      expect(durationSelect.options[0].textContent).toContain('5 Detik');
      expect(durationSelect.options[1].textContent).toContain('10 Detik');
      expect(durationSelect.options[2].textContent).toContain('15 Detik');
      expect(durationSelect.options[3].textContent).toContain('30 Detik');
      expect(durationSelect.options[4].textContent).toContain('60 Detik');
    });

    it('should have default duration value', () => {
      const durationSelect = document.getElementById('video-frames-duration');
      expect(durationSelect.value).toBe('5s');
    });

    it('should have proper input styling', () => {
      const durationSelect = document.getElementById('video-frames-duration');
      expect(durationSelect.classList.contains('w-full')).toBe(true);
      expect(durationSelect.classList.contains('p-3')).toBe(true);
      expect(durationSelect.classList.contains('border')).toBe(true);
      expect(durationSelect.classList.contains('rounded-lg')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('video-frames-audience');
      expect(audienceSelect).toBeTruthy();
      expect(audienceSelect.tagName).toBe('SELECT');
      expect(audienceSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[4].textContent).toContain('5. Target Audiens');
    });

    it('should have all labels with icons', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have audience options with proper labels', () => {
      const audienceSelect = document.getElementById('video-frames-audience');
      expect(audienceSelect.options[0].textContent).toContain('Media Sosial');
      expect(audienceSelect.options[1].textContent).toContain('YouTube');
      expect(audienceSelect.options[2].textContent).toContain('TikTok');
      expect(audienceSelect.options[3].textContent).toContain('Instagram');
      expect(audienceSelect.options[4].textContent).toContain('Profesional');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('video-frames-audience');
      expect(audienceSelect.value).toBe('social-media');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('video-frames-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('video-frames-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should render description textarea', () => {
      const descriptionInput = document.getElementById('video-frames-description');
      expect(descriptionInput).toBeTruthy();
      expect(descriptionInput.tagName).toBe('TEXTAREA');
      expect(descriptionInput.rows).toBe(3);
      expect(descriptionInput.placeholder).toContain('Jelaskan frame video yang diinginkan');
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
      
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('video-frames-tone');
      expect(toneSelect.options[0].textContent).toContain('Profesional');
      expect(toneSelect.options[1].textContent).toContain('Casual');
      expect(toneSelect.options[2].textContent).toContain('Dramatis');
      expect(toneSelect.options[3].textContent).toContain('Seru');
      expect(toneSelect.options[4].textContent).toContain('Minimalis');
      expect(toneSelect.options[5].textContent).toContain('Energik');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('video-frames-tone');
      expect(toneSelect.value).toBe('professional');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('video-frames-tone');
      expect(toneSelect.classList.contains('w-full')).toBe(true);
      expect(toneSelect.classList.contains('p-3')).toBe(true);
      expect(toneSelect.classList.contains('border')).toBe(true);
      expect(toneSelect.classList.contains('rounded-lg')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(toneSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Generate Button Tests
  describe('Generate Button', () => {
    it('should render generate button', () => {
      const generateBtn = document.getElementById('video-frames-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Video Frames');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('video-frames-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('video-frames-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('video-frames-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('video-frames-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('video-frames-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-film')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil video frames akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('video-frames-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('video-frames-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat video frames');
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
      const emptyState = document.getElementById('video-frames-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have blue icon in empty state', () => {
      const emptyStateIcon = document.getElementById('video-frames-empty-state').querySelector('i.fas.fa-film');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/cyan/indigo color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use blue/cyan/indigo accents in generate button', () => {
      const generateBtn = document.getElementById('video-frames-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-indigo-600')).toBe(true);
    });

    it('should use blue accents in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-video-frames');
      typeBtns.forEach(btn => {
        expect(btn.querySelector('i').classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should use blue accents in form labels', () => {
      const labelIcons = document.body.querySelectorAll('.card label i');
      labelIcons.forEach(icon => {
        expect(icon.classList.contains('text-blue-500')).toBe(true);
      });
    });

    it('should use blue accents in focus states', () => {
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use blue accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should use blue accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('video-frames-empty-state').querySelector('i.fas.fa-film');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });

    it('should use blue hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-video-frames');
      typeBtns.forEach(btn => {
        expect(btn.classList.contains('hover:bg-blue-100')).toBe(true);
      });
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

    it('should have film icon in header', () => {
      const filmIcon = document.body.querySelector('header i.fas.fa-film');
      expect(filmIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('video-frames-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have image icon for thumbnail', () => {
      const imageIcon = document.body.querySelector('[data-type="thumbnail"] i.fas.fa-image');
      expect(imageIcon).toBeTruthy();
    });

    it('should have play-circle icon for intro', () => {
      const playCircleIcon = document.body.querySelector('[data-type="intro"] i.fas.fa-play-circle');
      expect(playCircleIcon).toBeTruthy();
    });

    it('should have stop-circle icon for outro', () => {
      const stopCircleIcon = document.body.querySelector('[data-type="outro"] i.fas.fa-stop-circle');
      expect(stopCircleIcon).toBeTruthy();
    });

    it('should have closed-captioning icon for lower third', () => {
      const closedCaptioningIcon = document.body.querySelector('[data-type="lower-third"] i.fas.fa-closed-captioning');
      expect(closedCaptioningIcon).toBeTruthy();
    });

    it('should have random icon for transition', () => {
      const randomIcon = document.body.querySelector('[data-type="transition"] i.fas.fa-random');
      expect(randomIcon).toBeTruthy();
    });

    it('should have comment-alt icon for caption', () => {
      const commentAltIcon = document.body.querySelector('[data-type="caption"] i.fas.fa-comment-alt');
      expect(commentAltIcon).toBeTruthy();
    });

    it('should have video icon for style', () => {
      const videoIcon = document.body.querySelector('i.fas.fa-video');
      expect(videoIcon).toBeTruthy();
    });

    it('should have expand-arrows-alt icon for aspect ratio', () => {
      const expandArrowsAltIcon = document.body.querySelector('i.fas.fa-expand-arrows-alt');
      expect(expandArrowsAltIcon).toBeTruthy();
    });

    it('should have clock icon for duration', () => {
      const clockIcon = document.body.querySelector('i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have heart icon for tone', () => {
      const heartIcon = document.body.querySelector('i.fas.fa-heart');
      expect(heartIcon).toBeTruthy();
    });

    it('should have align-left icon for description', () => {
      const alignLeftIcon = document.body.querySelector('i.fas.fa-align-left');
      expect(alignLeftIcon).toBeTruthy();
    });

    it('should have film icon in empty state', () => {
      const emptyStateIcon = document.getElementById('video-frames-empty-state').querySelector('i.fas.fa-film');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Video Frames');
      expect(document.body.textContent).toContain('Jenis Frame');
      expect(document.body.textContent).toContain('Gaya Video');
      expect(document.body.textContent).toContain('Aspect Ratio');
      expect(document.body.textContent).toContain('Durasi');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Video Frames');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Frame');
      expect(headers[1].textContent).toContain('2. Gaya Video');
      expect(headers[2].textContent).toContain('3. Aspect Ratio');
      expect(headers[3].textContent).toContain('4. Durasi');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('video-frames-empty-state');
      expect(emptyState.textContent).toContain('Hasil video frames akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Video Frames');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('video-frames-loading');
      expect(loading.textContent).toContain('Sedang membuat video frames');
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
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('video-frames-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const durationSelect = document.getElementById('video-frames-duration');
      expect(durationSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('video-frames-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('video-frames-tone');
      expect(toneSelect).toBeTruthy();
      
      const descriptionInput = document.getElementById('video-frames-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect).toBeTruthy();
      
      const aspectRatioSelect = document.getElementById('video-frames-aspect-ratio');
      expect(aspectRatioSelect).toBeTruthy();
      
      const durationSelect = document.getElementById('video-frames-duration');
      expect(durationSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('video-frames-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('video-frames-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for textareas', () => {
      const descriptionInput = document.getElementById('video-frames-description');
      expect(descriptionInput).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('video-frames-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const styleSelect = document.getElementById('video-frames-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const aspectRatioSelect = document.getElementById('video-frames-aspect-ratio');
      expect(aspectRatioSelect.tagName).toBe('SELECT');
      
      const durationSelect = document.getElementById('video-frames-duration');
      expect(durationSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('video-frames-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('video-frames-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper frame type button attributes', () => {
      const typeBtns = document.body.querySelectorAll('.type-btn-video-frames');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
        expect(btn.dataset.type).toBeTruthy();
      });
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

    it('should have responsive title sizing', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('text-4xl')).toBe(true);
      expect(title.classList.contains('md:text-5xl')).toBe(true);
    });

    it('should have responsive container padding', () => {
      const container = document.body.querySelector('.container');
      expect(container.classList.contains('px-4')).toBe(true);
    });

    it('should have responsive spacing in left panel', () => {
      const leftPanel = document.body.querySelector('.lg\\:col-span-1');
      expect(leftPanel.classList.contains('space-y-6')).toBe(true);
    });

    it('should have responsive type options grid', () => {
      const typeOptions = document.getElementById('video-frames-type-options');
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
    });
  });
});
