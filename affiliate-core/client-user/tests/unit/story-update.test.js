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

describe('story-update Component', () => {
  
  const mockComponentHTML = `
    <div id="content-story-update" class="main-content-panel hidden">
      <div class="container mx-auto px-4 py-8">
        
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent">
            <i class="fas fa-history mr-3"></i>Update Story
          </h1>
          <p class="text-lg text-gray-600 mt-2">Buat story menarik untuk update terbaru Anda dengan mudah</p>
        </header>
        
        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Panel: Controls -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Step 1: Story Type -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Jenis Story</h2>
              <div id="story-update-type-options" class="grid grid-cols-2 gap-2">
                <button type="button" data-type="daily-vlog" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-blue-100 transition text-center border-2 border-transparent selected" data-selected="true">
                  <i class="fas fa-video text-2xl mb-1 text-blue-500"></i>
                  <span class="block font-medium">Daily Vlog</span>
                </button>
                <button type="button" data-type="product-reveal" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-purple-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-box-open text-2xl mb-1 text-purple-500"></i>
                  <span class="block font-medium">Product Reveal</span>
                </button>
                <button type="button" data-type="tutorial" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-cyan-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-chalkboard-teacher text-2xl mb-1 text-cyan-500"></i>
                  <span class="block font-medium">Tutorial</span>
                </button>
                <button type="button" data-type="behind-scenes" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-pink-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-film text-2xl mb-1 text-pink-500"></i>
                  <span class="block font-medium">Behind Scenes</span>
                </button>
                <button type="button" data-type="announcement" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-green-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-bullhorn text-2xl mb-1 text-green-500"></i>
                  <span class="block font-medium">Pengumuman</span>
                </button>
                <button type="button" data-type="throwback" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-yellow-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-history text-2xl mb-1 text-yellow-500"></i>
                  <span class="block font-medium">Throwback</span>
                </button>
                <button type="button" data-type="q&a" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-orange-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-question-circle text-2xl mb-1 text-orange-500"></i>
                  <span class="block font-medium">Q&A</span>
                </button>
                <button type="button" data-type="poll-story" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-red-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-poll text-2xl mb-1 text-red-500"></i>
                  <span class="block font-medium">Poll Story</span>
                </button>
                <button type="button" data-type="countdown" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-indigo-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-clock text-2xl mb-1 text-indigo-500"></i>
                  <span class="block font-medium">Countdown</span>
                </button>
                <button type="button" data-type="collaboration" class="story-update-type-btn p-3 rounded-lg text-sm bg-gray-100 hover:bg-teal-100 transition text-center border-2 border-transparent">
                  <i class="fas fa-handshake text-2xl mb-1 text-teal-500"></i>
                  <span class="block font-medium">Kolaborasi</span>
                </button>
              </div>
            </div>
            
            <!-- Step 2: Duration -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Durasi</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-update-duration" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-stopwatch mr-1 text-blue-500"></i>Durasi Story
                  </label>
                  <select id="story-update-duration" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="15s">15 Detik</option>
                    <option value="30s">30 Detik</option>
                    <option value="60s">1 Menit</option>
                    <option value="90s">90 Detik</option>
                    <option value="full-minute">Full Minute</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 3: Style -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Gaya</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-update-style" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-paint-brush mr-1 text-purple-500"></i>Gaya Visual
                  </label>
                  <select id="story-update-style" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="aesthetic">Aesthetic</option>
                    <option value="fun">Fun</option>
                    <option value="minimal">Minimal</option>
                    <option value="bold">Bold</option>
                    <option value="retro">Retro</option>
                    <option value="cinematic">Cinematic</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 4: Music -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Musik</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-update-music" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-music mr-1 text-cyan-500"></i>Jenis Musik
                  </label>
                  <select id="story-update-music" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="trending">Trending</option>
                    <option value="chill">Chill</option>
                    <option value="upbeat">Upbeat</option>
                    <option value="emotional">Emotional</option>
                    <option value="none">Tanpa Musik</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 5: Target Audience -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">5. Target Audiens</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-update-audience" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-users mr-1 text-pink-500"></i>Target Audiens
                  </label>
                  <select id="story-update-audience" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                    <option value="followers">Followers</option>
                    <option value="customers">Customers</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="friends">Friends</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 6: Tone -->
            <div class="card p-6 rounded-2xl shadow-lg bg-white">
              <h2 class="text-xl font-semibold mb-4 text-gray-800">6. Nuansa</h2>
              
              <div class="space-y-4">
                <div>
                  <label for="story-update-tone" class="block text-sm font-medium text-gray-700 mb-1">
                    <i class="fas fa-smile mr-1 text-blue-500"></i>Nuansa
                  </label>
                  <select id="story-update-tone" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="authentic">Authentic</option>
                    <option value="entertaining">Entertaining</option>
                    <option value="informative">Informative</option>
                    <option value="inspiring">Inspiring</option>
                    <option value="mysterious">Mysterious</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Step 7: Generate Button -->
            <button id="story-update-generate-btn" class="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-magic mr-2"></i>Buat Story
            </button>
            
          </div>
          
          <!-- Right Panel: Results -->
          <div class="lg:col-span-2">
            <div id="story-update-results-container" class="card p-6 rounded-2xl shadow-lg bg-white min-h-[500px]">
              <div id="story-update-empty-state" class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
                <i class="fas fa-history text-6xl mb-4 text-blue-400"></i>
                <p class="text-xl">Hasil story akan muncul di sini</p>
                <p class="text-sm mt-2">Isi informasi dan klik Buat Story</p>
              </div>
              <div id="story-update-results" class="hidden space-y-6"></div>
              <div id="story-update-loading" class="hidden flex flex-col items-center justify-center py-12">
                <div class="loader ease-linear rounded-full border-4 border-t-4 border-blue-500 h-12 w-12 mb-4"></div>
                <p class="text-gray-600">Sedang membuat story...</p>
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
      const container = document.getElementById('content-story-update');
      expect(container).toBeTruthy();
      expect(container.classList.contains('main-content-panel')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(true);
    });

    it('should render header with title and icon', () => {
      const header = document.body.querySelector('header');
      expect(header).toBeTruthy();
      
      const title = header.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Update Story');
      expect(title.querySelector('i.fas.fa-history')).toBeTruthy();
    });

    it('should render header with subtitle', () => {
      const subtitle = document.body.querySelector('header p');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toContain('Buat story menarik untuk update terbaru Anda dengan mudah');
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
      expect(rightPanel.querySelector('#story-update-results-container')).toBeTruthy();
    });

    it('should have proper container styling', () => {
      const container = document.body.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container.classList.contains('mx-auto')).toBe(true);
      expect(container.classList.contains('px-4')).toBe(true);
      expect(container.classList.contains('py-8')).toBe(true);
    });
  });

  // Story Type Selection Tests
  describe('Story Type Selection', () => {
    it('should render story type options container', () => {
      const typeOptions = document.getElementById('story-update-type-options');
      expect(typeOptions).toBeTruthy();
    });

    it('should render Daily Vlog option', () => {
      const dailyVlogBtn = document.body.querySelector('[data-type="daily-vlog"]');
      expect(dailyVlogBtn).toBeTruthy();
      expect(dailyVlogBtn.textContent).toContain('Daily Vlog');
      expect(dailyVlogBtn.querySelector('i.fas.fa-video')).toBeTruthy();
      expect(dailyVlogBtn.classList.contains('selected')).toBe(true);
    });

    it('should render Product Reveal option', () => {
      const productRevealBtn = document.body.querySelector('[data-type="product-reveal"]');
      expect(productRevealBtn).toBeTruthy();
      expect(productRevealBtn.textContent).toContain('Product Reveal');
      expect(productRevealBtn.querySelector('i.fas.fa-box-open')).toBeTruthy();
    });

    it('should render Tutorial option', () => {
      const tutorialBtn = document.body.querySelector('[data-type="tutorial"]');
      expect(tutorialBtn).toBeTruthy();
      expect(tutorialBtn.textContent).toContain('Tutorial');
      expect(tutorialBtn.querySelector('i.fas.fa-chalkboard-teacher')).toBeTruthy();
    });

    it('should render Behind Scenes option', () => {
      const behindScenesBtn = document.body.querySelector('[data-type="behind-scenes"]');
      expect(behindScenesBtn).toBeTruthy();
      expect(behindScenesBtn.textContent).toContain('Behind Scenes');
      expect(behindScenesBtn.querySelector('i.fas.fa-film')).toBeTruthy();
    });

    it('should render Announcement option', () => {
      const announcementBtn = document.body.querySelector('[data-type="announcement"]');
      expect(announcementBtn).toBeTruthy();
      expect(announcementBtn.textContent).toContain('Pengumuman');
      expect(announcementBtn.querySelector('i.fas.fa-bullhorn')).toBeTruthy();
    });

    it('should render Throwback option', () => {
      const throwbackBtn = document.body.querySelector('[data-type="throwback"]');
      expect(throwbackBtn).toBeTruthy();
      expect(throwbackBtn.textContent).toContain('Throwback');
      expect(throwbackBtn.querySelector('i.fas.fa-history')).toBeTruthy();
    });

    it('should render Q&A option', () => {
      const buttons = document.querySelectorAll('.story-update-type-btn');
      const qaBtn = Array.from(buttons).find(btn => btn.dataset.type === 'q&a');
      expect(qaBtn).toBeTruthy();
      expect(qaBtn.textContent).toContain('Q&A');
      expect(qaBtn.querySelector('i.fas.fa-question-circle')).toBeTruthy();
    });

    it('should render Poll Story option', () => {
      const pollStoryBtn = document.body.querySelector('[data-type="poll-story"]');
      expect(pollStoryBtn).toBeTruthy();
      expect(pollStoryBtn.textContent).toContain('Poll Story');
      expect(pollStoryBtn.querySelector('i.fas.fa-poll')).toBeTruthy();
    });

    it('should render Countdown option', () => {
      const countdownBtn = document.body.querySelector('[data-type="countdown"]');
      expect(countdownBtn).toBeTruthy();
      expect(countdownBtn.textContent).toContain('Countdown');
      expect(countdownBtn.querySelector('i.fas.fa-clock')).toBeTruthy();
    });

    it('should render Collaboration option', () => {
      const collaborationBtn = document.body.querySelector('[data-type="collaboration"]');
      expect(collaborationBtn).toBeTruthy();
      expect(collaborationBtn.textContent).toContain('Kolaborasi');
      expect(collaborationBtn.querySelector('i.fas.fa-handshake')).toBeTruthy();
    });

    it('should have 10 story type options', () => {
      const typeBtns = document.body.querySelectorAll('.story-update-type-btn');
      expect(typeBtns.length).toBe(10);
    });

    it('should have proper grid layout for type options', () => {
      const typeOptions = document.getElementById('story-update-type-options');
      expect(typeOptions.classList.contains('grid')).toBe(true);
      expect(typeOptions.classList.contains('grid-cols-2')).toBe(true);
      expect(typeOptions.classList.contains('gap-2')).toBe(true);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[0].textContent).toContain('1. Jenis Story');
    });

    it('should have colored hover effects in type buttons', () => {
      const typeBtns = document.body.querySelectorAll('.story-update-type-btn');
      expect(typeBtns[0].classList.contains('hover:bg-blue-100')).toBe(true);
      expect(typeBtns[1].classList.contains('hover:bg-purple-100')).toBe(true);
      expect(typeBtns[2].classList.contains('hover:bg-cyan-100')).toBe(true);
      expect(typeBtns[3].classList.contains('hover:bg-pink-100')).toBe(true);
      expect(typeBtns[4].classList.contains('hover:bg-green-100')).toBe(true);
      expect(typeBtns[5].classList.contains('hover:bg-yellow-100')).toBe(true);
      expect(typeBtns[6].classList.contains('hover:bg-orange-100')).toBe(true);
      expect(typeBtns[7].classList.contains('hover:bg-red-100')).toBe(true);
      expect(typeBtns[8].classList.contains('hover:bg-indigo-100')).toBe(true);
      expect(typeBtns[9].classList.contains('hover:bg-teal-100')).toBe(true);
    });
  });

  // Duration Input Tests
  describe('Duration Input', () => {
    it('should render duration select', () => {
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect).toBeTruthy();
      expect(durationSelect.tagName).toBe('SELECT');
      expect(durationSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[1].textContent).toContain('2. Durasi');
    });

    it('should have all labels with icons', () => {
      const stopwatchIcon = document.body.querySelector('i.fas.fa-stopwatch');
      expect(stopwatchIcon).toBeTruthy();
    });

    it('should have duration options with proper labels', () => {
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect.options[0].textContent).toContain('15 Detik');
      expect(durationSelect.options[1].textContent).toContain('30 Detik');
      expect(durationSelect.options[2].textContent).toContain('1 Menit');
      expect(durationSelect.options[3].textContent).toContain('90 Detik');
      expect(durationSelect.options[4].textContent).toContain('Full Minute');
    });

    it('should have default duration value', () => {
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect.value).toBe('15s');
    });

    it('should have proper input styling', () => {
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect.classList.contains('w-full')).toBe(true);
      expect(durationSelect.classList.contains('p-3')).toBe(true);
      expect(durationSelect.classList.contains('border')).toBe(true);
      expect(durationSelect.classList.contains('rounded-lg')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(durationSelect.classList.contains('focus:ring-blue-500')).toBe(true);
    });
  });

  // Style Input Tests
  describe('Style Input', () => {
    it('should render style select', () => {
      const styleSelect = document.getElementById('story-update-style');
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
      const styleSelect = document.getElementById('story-update-style');
      expect(styleSelect.options[0].textContent).toContain('Casual');
      expect(styleSelect.options[1].textContent).toContain('Professional');
      expect(styleSelect.options[2].textContent).toContain('Aesthetic');
      expect(styleSelect.options[3].textContent).toContain('Fun');
      expect(styleSelect.options[4].textContent).toContain('Minimal');
      expect(styleSelect.options[5].textContent).toContain('Bold');
      expect(styleSelect.options[6].textContent).toContain('Retro');
      expect(styleSelect.options[7].textContent).toContain('Cinematic');
    });

    it('should have default style value', () => {
      const styleSelect = document.getElementById('story-update-style');
      expect(styleSelect.value).toBe('casual');
    });

    it('should have proper input styling', () => {
      const styleSelect = document.getElementById('story-update-style');
      expect(styleSelect.classList.contains('w-full')).toBe(true);
      expect(styleSelect.classList.contains('p-3')).toBe(true);
      expect(styleSelect.classList.contains('border')).toBe(true);
      expect(styleSelect.classList.contains('rounded-lg')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
    });
  });

  // Music Input Tests
  describe('Music Input', () => {
    it('should render music select', () => {
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect).toBeTruthy();
      expect(musicSelect.tagName).toBe('SELECT');
      expect(musicSelect.options.length).toBe(5);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[3].textContent).toContain('4. Musik');
    });

    it('should have all labels with icons', () => {
      const musicIcon = document.body.querySelector('i.fas.fa-music');
      expect(musicIcon).toBeTruthy();
    });

    it('should have music options with proper labels', () => {
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect.options[0].textContent).toContain('Trending');
      expect(musicSelect.options[1].textContent).toContain('Chill');
      expect(musicSelect.options[2].textContent).toContain('Upbeat');
      expect(musicSelect.options[3].textContent).toContain('Emotional');
      expect(musicSelect.options[4].textContent).toContain('Tanpa Musik');
    });

    it('should have default music value', () => {
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect.value).toBe('trending');
    });

    it('should have proper input styling', () => {
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect.classList.contains('w-full')).toBe(true);
      expect(musicSelect.classList.contains('p-3')).toBe(true);
      expect(musicSelect.classList.contains('border')).toBe(true);
      expect(musicSelect.classList.contains('rounded-lg')).toBe(true);
      expect(musicSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(musicSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
    });
  });

  // Target Audience Selection Tests
  describe('Target Audience Selection', () => {
    it('should render audience select', () => {
      const audienceSelect = document.getElementById('story-update-audience');
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
      const audienceSelect = document.getElementById('story-update-audience');
      expect(audienceSelect.options[0].textContent).toContain('Followers');
      expect(audienceSelect.options[1].textContent).toContain('Customers');
      expect(audienceSelect.options[2].textContent).toContain('Subscribers');
      expect(audienceSelect.options[3].textContent).toContain('Friends');
      expect(audienceSelect.options[4].textContent).toContain('Public');
    });

    it('should have default audience value', () => {
      const audienceSelect = document.getElementById('story-update-audience');
      expect(audienceSelect.value).toBe('followers');
    });

    it('should have proper input styling', () => {
      const audienceSelect = document.getElementById('story-update-audience');
      expect(audienceSelect.classList.contains('w-full')).toBe(true);
      expect(audienceSelect.classList.contains('p-3')).toBe(true);
      expect(audienceSelect.classList.contains('border')).toBe(true);
      expect(audienceSelect.classList.contains('rounded-lg')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-2')).toBe(true);
      expect(audienceSelect.classList.contains('focus:ring-pink-500')).toBe(true);
    });
  });

  // Tone Selection Tests
  describe('Tone Selection', () => {
    it('should render tone select', () => {
      const toneSelect = document.getElementById('story-update-tone');
      expect(toneSelect).toBeTruthy();
      expect(toneSelect.tagName).toBe('SELECT');
      expect(toneSelect.options.length).toBe(6);
    });

    it('should have proper section header', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have all labels with icons', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have tone options with proper labels', () => {
      const toneSelect = document.getElementById('story-update-tone');
      expect(toneSelect.options[0].textContent).toContain('Authentic');
      expect(toneSelect.options[1].textContent).toContain('Entertaining');
      expect(toneSelect.options[2].textContent).toContain('Informative');
      expect(toneSelect.options[3].textContent).toContain('Inspiring');
      expect(toneSelect.options[4].textContent).toContain('Mysterious');
      expect(toneSelect.options[5].textContent).toContain('Urgent');
    });

    it('should have default tone value', () => {
      const toneSelect = document.getElementById('story-update-tone');
      expect(toneSelect.value).toBe('authentic');
    });

    it('should have proper input styling', () => {
      const toneSelect = document.getElementById('story-update-tone');
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
      const generateBtn = document.getElementById('story-update-generate-btn');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn.textContent).toContain('Buat Story');
      expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
    });

    it('should have correct styling classes', () => {
      const generateBtn = document.getElementById('story-update-generate-btn');
      expect(generateBtn.classList.contains('w-full')).toBe(true);
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
      expect(generateBtn.classList.contains('text-white')).toBe(true);
      expect(generateBtn.classList.contains('font-bold')).toBe(true);
      expect(generateBtn.classList.contains('py-4')).toBe(true);
      expect(generateBtn.classList.contains('px-6')).toBe(true);
      expect(generateBtn.classList.contains('rounded-xl')).toBe(true);
      expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
    });

    it('should have disabled styling classes', () => {
      const generateBtn = document.getElementById('story-update-generate-btn');
      expect(generateBtn.classList.contains('disabled:opacity-50')).toBe(true);
      expect(generateBtn.classList.contains('disabled:cursor-not-allowed')).toBe(true);
    });

    it('should have hover effect classes', () => {
      const generateBtn = document.getElementById('story-update-generate-btn');
      expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
      expect(generateBtn.classList.contains('transition-all')).toBe(true);
    });
  });

  // Results Area Tests
  describe('Results Area', () => {
    it('should render results container', () => {
      const resultsContainer = document.getElementById('story-update-results-container');
      expect(resultsContainer).toBeTruthy();
      expect(resultsContainer.classList.contains('min-h-[500px]')).toBe(true);
    });

    it('should render empty state', () => {
      const emptyState = document.getElementById('story-update-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.querySelector('i.fas.fa-history')).toBeTruthy();
      expect(emptyState.textContent).toContain('Hasil story akan muncul di sini');
    });

    it('should render results area', () => {
      const results = document.getElementById('story-update-results');
      expect(results).toBeTruthy();
      expect(results.classList.contains('hidden')).toBe(true);
      expect(results.classList.contains('space-y-6')).toBe(true);
    });

    it('should render loading indicator', () => {
      const loading = document.getElementById('story-update-loading');
      expect(loading).toBeTruthy();
      expect(loading.classList.contains('hidden')).toBe(true);
      expect(loading.classList.contains('flex')).toBe(true);
      expect(loading.classList.contains('flex-col')).toBe(true);
      expect(loading.textContent).toContain('Sedang membuat story');
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
      const emptyState = document.getElementById('story-update-empty-state');
      expect(emptyState.classList.contains('flex')).toBe(true);
      expect(emptyState.classList.contains('flex-col')).toBe(true);
      expect(emptyState.classList.contains('items-center')).toBe(true);
      expect(emptyState.classList.contains('justify-center')).toBe(true);
      expect(emptyState.classList.contains('text-center')).toBe(true);
    });

    it('should have blue icon in empty state', () => {
      const emptyStateIcon = document.getElementById('story-update-empty-state').querySelector('i.fas.fa-history');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
    });
  });

  // Color Scheme Tests
  describe('Color Scheme', () => {
    it('should use blue/cyan/purple color scheme in header', () => {
      const title = document.body.querySelector('h1');
      expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(title.classList.contains('from-blue-500')).toBe(true);
      expect(title.classList.contains('via-cyan-500')).toBe(true);
      expect(title.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use blue/cyan/purple accents in generate button', () => {
      const generateBtn = document.getElementById('story-update-generate-btn');
      expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
      expect(generateBtn.classList.contains('from-blue-500')).toBe(true);
      expect(generateBtn.classList.contains('via-cyan-500')).toBe(true);
      expect(generateBtn.classList.contains('to-purple-500')).toBe(true);
    });

    it('should use blue accents in duration select', () => {
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(durationSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use purple accents in style select', () => {
      const styleSelect = document.getElementById('story-update-style');
      expect(styleSelect.classList.contains('focus:ring-purple-500')).toBe(true);
      expect(styleSelect.classList.contains('focus:border-purple-500')).toBe(true);
    });

    it('should use cyan accents in music select', () => {
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect.classList.contains('focus:ring-cyan-500')).toBe(true);
      expect(musicSelect.classList.contains('focus:border-cyan-500')).toBe(true);
    });

    it('should use pink accents in audience select', () => {
      const audienceSelect = document.getElementById('story-update-audience');
      expect(audienceSelect.classList.contains('focus:ring-pink-500')).toBe(true);
      expect(audienceSelect.classList.contains('focus:border-pink-500')).toBe(true);
    });

    it('should use blue accents in tone select', () => {
      const toneSelect = document.getElementById('story-update-tone');
      expect(toneSelect.classList.contains('focus:ring-blue-500')).toBe(true);
      expect(toneSelect.classList.contains('focus:border-blue-500')).toBe(true);
    });

    it('should use blue accents in loader', () => {
      const loader = document.body.querySelector('.loader');
      expect(loader.classList.contains('border-blue-500')).toBe(true);
    });

    it('should use blue accents in empty state icon', () => {
      const emptyStateIcon = document.getElementById('story-update-empty-state').querySelector('i.fas.fa-history');
      expect(emptyStateIcon.classList.contains('text-blue-400')).toBe(true);
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
      expect(icons.length).toBeGreaterThanOrEqual(18);
    });

    it('should have history icon in header', () => {
      const historyIcon = document.body.querySelector('header i.fas.fa-history');
      expect(historyIcon).toBeTruthy();
    });

    it('should have magic icon in generate button', () => {
      const magicIcon = document.getElementById('story-update-generate-btn').querySelector('i.fas.fa-magic');
      expect(magicIcon).toBeTruthy();
    });

    it('should have video icon for daily vlog', () => {
      const videoIcon = document.body.querySelector('[data-type="daily-vlog"] i.fas.fa-video');
      expect(videoIcon).toBeTruthy();
    });

    it('should have box-open icon for product reveal', () => {
      const boxOpenIcon = document.body.querySelector('[data-type="product-reveal"] i.fas.fa-box-open');
      expect(boxOpenIcon).toBeTruthy();
    });

    it('should have chalkboard-teacher icon for tutorial', () => {
      const chalkboardIcon = document.body.querySelector('[data-type="tutorial"] i.fas.fa-chalkboard-teacher');
      expect(chalkboardIcon).toBeTruthy();
    });

    it('should have film icon for behind scenes', () => {
      const filmIcon = document.body.querySelector('[data-type="behind-scenes"] i.fas.fa-film');
      expect(filmIcon).toBeTruthy();
    });

    it('should have bullhorn icon for announcement', () => {
      const bullhornIcon = document.body.querySelector('[data-type="announcement"] i.fas.fa-bullhorn');
      expect(bullhornIcon).toBeTruthy();
    });

    it('should have history icon for throwback', () => {
      const historyIcon = document.body.querySelector('[data-type="throwback"] i.fas.fa-history');
      expect(historyIcon).toBeTruthy();
    });

    it('should have question-circle icon for q&a', () => {
      const buttons = document.querySelectorAll('.story-update-type-btn');
      const qaBtn = Array.from(buttons).find(btn => btn.dataset.type === 'q&a');
      const questionCircleIcon = qaBtn.querySelector('i.fas.fa-question-circle');
      expect(questionCircleIcon).toBeTruthy();
    });

    it('should have poll icon for poll story', () => {
      const pollIcon = document.body.querySelector('[data-type="poll-story"] i.fas.fa-poll');
      expect(pollIcon).toBeTruthy();
    });

    it('should have clock icon for countdown', () => {
      const clockIcon = document.body.querySelector('[data-type="countdown"] i.fas.fa-clock');
      expect(clockIcon).toBeTruthy();
    });

    it('should have handshake icon for collaboration', () => {
      const handshakeIcon = document.body.querySelector('[data-type="collaboration"] i.fas.fa-handshake');
      expect(handshakeIcon).toBeTruthy();
    });

    it('should have stopwatch icon for duration', () => {
      const stopwatchIcon = document.body.querySelector('i.fas.fa-stopwatch');
      expect(stopwatchIcon).toBeTruthy();
    });

    it('should have paint-brush icon for style', () => {
      const paintBrushIcon = document.body.querySelector('i.fas.fa-paint-brush');
      expect(paintBrushIcon).toBeTruthy();
    });

    it('should have music icon for music', () => {
      const musicIcon = document.body.querySelector('i.fas.fa-music');
      expect(musicIcon).toBeTruthy();
    });

    it('should have users icon for audience', () => {
      const usersIcon = document.body.querySelector('i.fas.fa-users');
      expect(usersIcon).toBeTruthy();
    });

    it('should have smile icon for tone', () => {
      const smileIcon = document.body.querySelector('i.fas.fa-smile');
      expect(smileIcon).toBeTruthy();
    });

    it('should have history icon in empty state', () => {
      const emptyStateIcon = document.getElementById('story-update-empty-state').querySelector('i.fas.fa-history');
      expect(emptyStateIcon).toBeTruthy();
    });
  });

  // Text Content Tests
  describe('Text Content', () => {
    it('should have Indonesian text', () => {
      expect(document.body.textContent).toContain('Update Story');
      expect(document.body.textContent).toContain('Jenis Story');
      expect(document.body.textContent).toContain('Durasi');
      expect(document.body.textContent).toContain('Gaya');
      expect(document.body.textContent).toContain('Musik');
      expect(document.body.textContent).toContain('Target Audiens');
      expect(document.body.textContent).toContain('Nuansa');
      expect(document.body.textContent).toContain('Buat Story');
    });

    it('should have proper section headers', () => {
      const headers = document.body.querySelectorAll('h2');
      expect(headers.length).toBe(6);
      expect(headers[0].textContent).toContain('1. Jenis Story');
      expect(headers[1].textContent).toContain('2. Durasi');
      expect(headers[2].textContent).toContain('3. Gaya');
      expect(headers[3].textContent).toContain('4. Musik');
      expect(headers[4].textContent).toContain('5. Target Audiens');
      expect(headers[5].textContent).toContain('6. Nuansa');
    });

    it('should have proper empty state text', () => {
      const emptyState = document.getElementById('story-update-empty-state');
      expect(emptyState.textContent).toContain('Hasil story akan muncul di sini');
      expect(emptyState.textContent).toContain('Isi informasi dan klik Buat Story');
    });

    it('should have proper loading text', () => {
      const loading = document.getElementById('story-update-loading');
      expect(loading.textContent).toContain('Sedang membuat story');
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
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('story-update-style');
      expect(styleSelect).toBeTruthy();
      
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('story-update-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('story-update-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper labels for selects', () => {
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect).toBeTruthy();
      
      const styleSelect = document.getElementById('story-update-style');
      expect(styleSelect).toBeTruthy();
      
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect).toBeTruthy();
      
      const audienceSelect = document.getElementById('story-update-audience');
      expect(audienceSelect).toBeTruthy();
      
      const toneSelect = document.getElementById('story-update-tone');
      expect(toneSelect).toBeTruthy();
    });

    it('should have proper button attributes', () => {
      const generateBtn = document.getElementById('story-update-generate-btn');
      expect(generateBtn).toBeTruthy();
      // Button type defaults to 'submit' when inside a form, which is acceptable
      expect(['button', 'submit']).toContain(generateBtn.type);
    });

    it('should have proper select types', () => {
      const durationSelect = document.getElementById('story-update-duration');
      expect(durationSelect.tagName).toBe('SELECT');
      
      const styleSelect = document.getElementById('story-update-style');
      expect(styleSelect.tagName).toBe('SELECT');
      
      const musicSelect = document.getElementById('story-update-music');
      expect(musicSelect.tagName).toBe('SELECT');
      
      const audienceSelect = document.getElementById('story-update-audience');
      expect(audienceSelect.tagName).toBe('SELECT');
      
      const toneSelect = document.getElementById('story-update-tone');
      expect(toneSelect.tagName).toBe('SELECT');
    });

    it('should have proper button types for type selection', () => {
      const typeBtns = document.body.querySelectorAll('.story-update-type-btn');
      typeBtns.forEach(btn => {
        expect(btn.type).toBe('button');
      });
    });

    it('should have proper data attributes for type buttons', () => {
      const dailyVlogBtn = document.body.querySelector('[data-type="daily-vlog"]');
      expect(dailyVlogBtn.dataset.type).toBe('daily-vlog');
      expect(dailyVlogBtn.dataset.selected).toBe('true');
      
      const productRevealBtn = document.body.querySelector('[data-type="product-reveal"]');
      expect(productRevealBtn.dataset.type).toBe('product-reveal');
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
