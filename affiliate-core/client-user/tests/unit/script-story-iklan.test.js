import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock showToast globally
window.showToast = vi.fn();

// Mock clipboard API
navigator.clipboard = {
    writeText: vi.fn().mockResolvedValue()
};

// Mock checkApiKey globally
window.checkApiKey = vi.fn().mockReturnValue(true);

describe('script-story-iklan Component', () => {
    
    const mockComponentHTML = `
        <div id="content-script-story-iklan" class="main-content-panel hidden">
            <div class="container mx-auto px-4 py-8">
                
                <!-- Header -->
                <header class="text-center mb-8">
                    <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-coral-500 bg-clip-text text-transparent">
                        <i class="fas fa-script mr-3"></i>Script & Story Iklan
                    </h1>
                    <p class="text-lg text-gray-600 mt-2">Buat script dan story iklan yang menarik dengan bantuan AI</p>
                </header>
                
                <!-- Main Content -->
                <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <!-- Left Panel: Controls -->
                    <div class="lg:col-span-1 space-y-6">
                        
                        <!-- Step 1: Platform Selection -->
                        <div class="card p-6 rounded-2xl shadow-lg bg-white">
                            <h2 class="text-xl font-semibold mb-4 text-gray-800">1. Pilih Platform</h2>
                            
                            <div class="grid grid-cols-3 gap-3">
                                <!-- Instagram -->
                                <label for="script-story-iklan-platform-instagram" class="platform-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-platform-instagram" name="script-story-iklan-platform" value="instagram" class="hidden peer">
                                    <div class="platform-card p-4 rounded-xl border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <i class="fab fa-instagram text-3xl text-pink-600 mb-2"></i>
                                        <p class="text-sm font-medium text-gray-700">Instagram</p>
                                    </div>
                                </label>
                                
                                <!-- TikTok -->
                                <label for="script-story-iklan-platform-tiktok" class="platform-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-platform-tiktok" name="script-story-iklan-platform" value="tiktok" class="hidden peer">
                                    <div class="platform-card p-4 rounded-xl border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <i class="fab fa-tiktok text-3xl text-black mb-2"></i>
                                        <p class="text-sm font-medium text-gray-700">TikTok</p>
                                    </div>
                                </label>
                                
                                <!-- YouTube -->
                                <label for="script-story-iklan-platform-youtube" class="platform-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-platform-youtube" name="script-story-iklan-platform" value="youtube" class="hidden peer">
                                    <div class="platform-card p-4 rounded-xl border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <i class="fab fa-youtube text-3xl text-red-600 mb-2"></i>
                                        <p class="text-sm font-medium text-gray-700">YouTube</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Step 2: Ad Type Selection -->
                        <div class="card p-6 rounded-2xl shadow-lg bg-white">
                            <h2 class="text-xl font-semibold mb-4 text-gray-800">2. Jenis Iklan</h2>
                            
                            <div class="space-y-3">
                                <!-- Story -->
                                <label for="script-story-iklan-type-story" class="ad-type-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-type-story" name="script-story-iklan-type" value="story" class="hidden peer">
                                    <div class="ad-type-card p-4 rounded-xl border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all flex items-center gap-3">
                                        <i class="fas fa-history text-2xl text-red-500"></i>
                                        <div>
                                            <p class="font-medium text-gray-800">Story</p>
                                            <p class="text-sm text-gray-500">Konten singkat 15-30 detik</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <!-- Reels/Shorts -->
                                <label for="script-story-iklan-type-reels" class="ad-type-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-type-reels" name="script-story-iklan-type" value="reels" class="hidden peer">
                                    <div class="ad-type-card p-4 rounded-xl border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all flex items-center gap-3">
                                        <i class="fas fa-video text-2xl text-red-500"></i>
                                        <div>
                                            <p class="font-medium text-gray-800">Reels/Shorts</p>
                                            <p class="text-sm text-gray-500">Video pendek 15-60 detik</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <!-- Feed Post -->
                                <label for="script-story-iklan-type-feed" class="ad-type-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-type-feed" name="script-story-iklan-type" value="feed" class="hidden peer">
                                    <div class="ad-type-card p-4 rounded-xl border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all flex items-center gap-3">
                                        <i class="fas fa-image text-2xl text-red-500"></i>
                                        <div>
                                            <p class="font-medium text-gray-800">Feed Post</p>
                                            <p class="text-sm text-gray-500">Postingan feed dengan caption</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <!-- Live Stream -->
                                <label for="script-story-iklan-type-live" class="ad-type-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-type-live" name="script-story-iklan-type" value="live" class="hidden peer">
                                    <div class="ad-type-card p-4 rounded-xl border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all flex items-center gap-3">
                                        <i class="fas fa-broadcast-tower text-2xl text-red-500"></i>
                                        <div>
                                            <p class="font-medium text-gray-800">Live Streaming</p>
                                            <p class="text-sm text-gray-500">Siaran langsung interaktif</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Step 3: Product/Service Information -->
                        <div class="card p-6 rounded-2xl shadow-lg bg-white">
                            <h2 class="text-xl font-semibold mb-4 text-gray-800">3. Informasi Produk/Jasa</h2>
                            
                            <div class="space-y-4">
                                <!-- Product/Service Name -->
                                <div>
                                    <label for="script-story-iklan-product-name" class="block text-sm font-medium text-gray-700 mb-1">
                                        <i class="fas fa-tag mr-1 text-red-500"></i>Nama Produk/Jasa
                                    </label>
                                    <input type="text" id="script-story-iklan-product-name" placeholder="Contoh: Serum Wajah Glow & Shine" 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                </div>
                                
                                <!-- Product Description -->
                                <div>
                                    <label for="script-story-iklan-product-desc" class="block text-sm font-medium text-gray-700 mb-1">
                                        <i class="fas fa-align-left mr-1 text-red-500"></i>Deskripsi Produk
                                    </label>
                                    <textarea id="script-story-iklan-product-desc" rows="3" placeholder="Jelaskan produk/jasa Anda secara singkat..." 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"></textarea>
                                </div>
                                
                                <!-- Product Price -->
                                <div>
                                    <label for="script-story-iklan-product-price" class="block text-sm font-medium text-gray-700 mb-1">
                                        <i class="fas fa-tag mr-1 text-red-500"></i>Harga (Opsional)
                                    </label>
                                    <input type="text" id="script-story-iklan-product-price" placeholder="Contoh: Rp 150.000" 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                </div>
                                
                                <!-- Product Benefits -->
                                <div>
                                    <label for="script-story-iklan-product-benefits" class="block text-sm font-medium text-gray-700 mb-1">
                                        <i class="fas fa-check-circle mr-1 text-red-500"></i>Keunggulan Produk
                                    </label>
                                    <textarea id="script-story-iklan-product-benefits" rows="2" placeholder="Contoh: Melembapkan, brighten, anti-aging..." 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Step 4: Call-to-Action Selection -->
                        <div class="card p-6 rounded-2xl shadow-lg bg-white">
                            <h2 class="text-xl font-semibold mb-4 text-gray-800">4. Call-to-Action</h2>
                            
                            <div class="grid grid-cols-2 gap-3">
                                <!-- Beli Sekarang -->
                                <label for="script-story-iklan-cta-buy" class="cta-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-cta-buy" name="script-story-iklan-cta" value="beli sekarang" class="hidden peer">
                                    <div class="cta-card p-3 rounded-lg border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <p class="text-sm font-medium text-gray-700">Beli Sekarang</p>
                                    </div>
                                </label>
                                
                                <!-- Klik Link di Bio -->
                                <label for="script-story-iklan-cta-link" class="cta-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-cta-link" name="script-story-iklan-cta" value="klik link di bio" class="hidden peer">
                                    <div class="cta-card p-3 rounded-lg border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <p class="text-sm font-medium text-gray-700">Klik Link di Bio</p>
                                    </div>
                                </label>
                                
                                <!-- Hubungi Kami -->
                                <label for="script-story-iklan-cta-contact" class="cta-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-cta-contact" name="script-story-iklan-cta" value="hubungi kami" class="hidden peer">
                                    <div class="cta-card p-3 rounded-lg border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <p class="text-sm font-medium text-gray-700">Hubungi Kami</p>
                                    </div>
                                </label>
                                
                                <!-- Daftar Sekarang -->
                                <label for="script-story-iklan-cta-register" class="cta-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-cta-register" name="script-story-iklan-cta" value="daftar sekarang" class="hidden peer">
                                    <div class="cta-card p-3 rounded-lg border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <p class="text-sm font-medium text-gray-700">Daftar Sekarang</p>
                                    </div>
                                </label>
                                
                                <!-- Chat Sekarang -->
                                <label for="script-story-iklan-cta-chat" class="cta-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-cta-chat" name="script-story-iklan-cta" value="chat sekarang" class="hidden peer">
                                    <div class="cta-card p-3 rounded-lg border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <p class="text-sm font-medium text-gray-700">Chat Sekarang</p>
                                    </div>
                                </label>
                                
                                <!-- Kustom CTA -->
                                <label for="script-story-iklan-cta-custom" class="cta-option cursor-pointer">
                                    <input type="radio" id="script-story-iklan-cta-custom" name="script-story-iklan-cta" value="custom" class="hidden peer">
                                    <div class="cta-card p-3 rounded-lg border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300 transition-all text-center">
                                        <p class="text-sm font-medium text-gray-700">Lainnya...</p>
                                    </div>
                                </label>
                            </div>
                            
                            <!-- Custom CTA Input -->
                            <div id="script-story-iklan-custom-cta-container" class="hidden mt-3">
                                <input type="text" id="script-story-iklan-custom-cta-input" placeholder="Masukkan CTA kustom..." 
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            </div>
                        </div>
                        
                        <!-- Generate Button -->
                        <button id="script-story-iklan-generate-btn" class="w-full py-4 bg-gradient-to-r from-red-500 to-coral-500 text-white font-bold rounded-2xl shadow-lg hover:from-red-600 hover:to-coral-600 transition-all transform hover:scale-[1.02]">
                            <i class="fas fa-magic mr-2"></i>Buat Script & Story
                        </button>
                        
                    </div>
                    
                    <!-- Right Panel: Output -->
                    <div class="lg:col-span-2">
                        
                        <!-- Output Container -->
                        <div class="card p-6 rounded-2xl shadow-lg bg-white min-h-[600px]">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-xl font-semibold text-gray-800">
                                    <i class="fas fa-file-alt mr-2 text-red-500"></i>Hasil Script & Story
                                </h2>
                                
                                <!-- Copy Button -->
                                <button id="script-story-iklan-copy-btn" class="hidden px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                    <i class="fas fa-copy mr-1"></i>Salin
                                </button>
                            </div>
                            
                            <!-- Loading State -->
                            <div id="script-story-iklan-loading" class="hidden flex flex-col items-center justify-center py-12">
                                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                                <p class="text-gray-600">Sedang membuat script dan story iklan...</p>
                            </div>
                            
                            <!-- Empty State -->
                            <div id="script-story-iklan-empty" class="flex flex-col items-center justify-center py-12 text-center">
                                <div class="bg-gradient-to-r from-red-100 to-coral-100 rounded-full p-6 mb-4">
                                    <i class="fas fa-script text-5xl text-red-400"></i>
                                </div>
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">Belum Ada Script</h3>
                                <p class="text-gray-600 max-w-md">Isi form di sebelah kiri dan klik tombol "Buat Script & Story" untuk menghasilkan script iklan yang menarik.</p>
                            </div>
                            
                            <!-- Result Container -->
                            <div id="script-story-iklan-result" class="hidden space-y-6">
                                
                                <!-- Script Section -->
                                <div class="bg-gray-50 rounded-xl p-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <i class="fas fa-list-ul mr-2 text-red-500"></i>Script Iklan
                                    </h3>
                                    <div id="script-story-iklan-script-content" class="prose prose-red max-w-none text-gray-700 whitespace-pre-wrap"></div>
                                </div>
                                
                                <!-- Story Section -->
                                <div class="bg-gradient-to-r from-red-50 to-coral-50 rounded-xl p-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <i class="fas fa-history mr-2 text-red-500"></i>Story Line
                                    </h3>
                                    <div id="script-story-iklan-story-content" class="prose prose-red max-w-none text-gray-700 whitespace-pre-wrap"></div>
                                </div>
                                
                                <!-- Tips Section -->
                                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>Tips Produksi
                                    </h3>
                                    <ul id="script-story-iklan-tips-content" class="space-y-2 text-gray-700"></ul>
                                </div>
                                
                            </div>
                            
                        </div>
                        
                    </div>
                    
                </main>
                
            </div>
        </div>
        
        <style>
            /* Custom coral color */
            .to-coral-500 {
                --tw-gradient-to: #ff6b6b;
            }
            
            /* Platform card hover effects */
            .platform-card:hover,
            .ad-type-card:hover,
            .cta-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            /* Smooth transitions */
            .platform-card,
            .ad-type-card,
            .cta-card {
                transition: all 0.3s ease;
            }
            
            /* Loading animation */
            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }
            
            .animate-spin {
                animation: spin 1s linear infinite;
            }
        </style>
    `;

    beforeEach(() => {
        document.body.innerHTML = mockComponentHTML;
        // Reset toast mock
        window.showToast = vi.fn();
        // Reset clipboard mock
        navigator.clipboard.writeText = vi.fn().mockResolvedValue();
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
            const container = document.getElementById('content-script-story-iklan');
            expect(container).toBeTruthy();
            expect(container.classList.contains('main-content-panel')).toBe(true);
            expect(container.classList.contains('hidden')).toBe(true);
        });

        it('should render header with title and icon', () => {
            const header = document.body.querySelector('header');
            expect(header).toBeTruthy();
            expect(header.classList.contains('text-center')).toBe(true);
            expect(header.classList.contains('mb-8')).toBe(true);
            
            const title = header.querySelector('h1');
            expect(title).toBeTruthy();
            expect(title.textContent).toContain('Script & Story Iklan');
            expect(title.querySelector('i.fas.fa-script')).toBeTruthy();
            expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(title.classList.contains('from-red-500')).toBe(true);
            expect(title.classList.contains('to-coral-500')).toBe(true);
        });

        it('should render header with subtitle', () => {
            const subtitle = document.body.querySelector('header p');
            expect(subtitle).toBeTruthy();
            expect(subtitle.textContent).toContain('Buat script dan story iklan yang menarik dengan bantuan AI');
        });

        it('should render main grid layout', () => {
            const main = document.body.querySelector('main');
            expect(main).toBeTruthy();
            expect(main.classList.contains('grid')).toBe(true);
            expect(main.classList.contains('grid-cols-1')).toBe(true);
            expect(main.classList.contains('lg:grid-cols-3')).toBe(true);
            expect(main.classList.contains('gap-8')).toBe(true);
        });

        it('should render left panel with controls', () => {
            const leftPanel = document.body.querySelector('.lg\\:col-span-1');
            expect(leftPanel).toBeTruthy();
            expect(leftPanel.classList.contains('space-y-6')).toBe(true);
            expect(leftPanel.querySelectorAll('.card').length).toBe(4);
        });

        it('should render right panel for output', () => {
            const rightPanel = document.body.querySelector('.lg\\:col-span-2');
            expect(rightPanel).toBeTruthy();
            expect(rightPanel.querySelector('.card')).toBeTruthy();
        });

        it('should have proper container classes', () => {
            const container = document.body.querySelector('.container');
            expect(container).toBeTruthy();
            expect(container.classList.contains('mx-auto')).toBe(true);
            expect(container.classList.contains('px-4')).toBe(true);
            expect(container.classList.contains('py-8')).toBe(true);
        });
    });

    // Platform Selection Tests
    describe('Platform Selection', () => {
        it('should render platform selection section', () => {
            const platformSection = document.body.querySelector('h2');
            expect(platformSection).toBeTruthy();
            expect(platformSection.textContent).toContain('1. Pilih Platform');
        });

        it('should render Instagram platform option', () => {
            const instagramInput = document.getElementById('script-story-iklan-platform-instagram');
            expect(instagramInput).toBeTruthy();
            expect(instagramInput.type).toBe('radio');
            expect(instagramInput.name).toBe('script-story-iklan-platform');
            expect(instagramInput.value).toBe('instagram');
            
            const instagramLabel = instagramInput.closest('label');
            expect(instagramLabel).toBeTruthy();
            expect(instagramLabel.querySelector('i.fab.fa-instagram')).toBeTruthy();
            expect(instagramLabel.textContent).toContain('Instagram');
        });

        it('should render TikTok platform option', () => {
            const tiktokInput = document.getElementById('script-story-iklan-platform-tiktok');
            expect(tiktokInput).toBeTruthy();
            expect(tiktokInput.type).toBe('radio');
            expect(tiktokInput.name).toBe('script-story-iklan-platform');
            expect(tiktokInput.value).toBe('tiktok');
            
            const tiktokLabel = tiktokInput.closest('label');
            expect(tiktokLabel).toBeTruthy();
            expect(tiktokLabel.querySelector('i.fab.fa-tiktok')).toBeTruthy();
            expect(tiktokLabel.textContent).toContain('TikTok');
        });

        it('should render YouTube platform option', () => {
            const youtubeInput = document.getElementById('script-story-iklan-platform-youtube');
            expect(youtubeInput).toBeTruthy();
            expect(youtubeInput.type).toBe('radio');
            expect(youtubeInput.name).toBe('script-story-iklan-platform');
            expect(youtubeInput.value).toBe('youtube');
            
            const youtubeLabel = youtubeInput.closest('label');
            expect(youtubeLabel).toBeTruthy();
            expect(youtubeLabel.querySelector('i.fab.fa-youtube')).toBeTruthy();
            expect(youtubeLabel.textContent).toContain('YouTube');
        });

        it('should have 3 platform options in grid layout', () => {
            const platformGrid = document.body.querySelector('.grid.grid-cols-3');
            expect(platformGrid).toBeTruthy();
            expect(platformGrid.classList.contains('gap-3')).toBe(true);
            
            const platformOptions = platformGrid.querySelectorAll('.platform-option');
            expect(platformOptions.length).toBe(3);
        });

        it('should have proper platform card styling', () => {
            const platformCards = document.body.querySelectorAll('.platform-card');
            expect(platformCards.length).toBe(3);
            
            platformCards.forEach(card => {
                expect(card.classList.contains('p-4')).toBe(true);
                expect(card.classList.contains('rounded-xl')).toBe(true);
                expect(card.classList.contains('border-2')).toBe(true);
                expect(card.classList.contains('border-gray-200')).toBe(true);
                expect(card.classList.contains('text-center')).toBe(true);
            });
        });

        it('should have peer-checked styling for platform selection', () => {
            const platformCards = document.body.querySelectorAll('.platform-card');
            platformCards.forEach(card => {
                expect(card.classList.contains('peer-checked:border-red-500')).toBe(true);
                expect(card.classList.contains('peer-checked:bg-red-50')).toBe(true);
                expect(card.classList.contains('hover:border-red-300')).toBe(true);
            });
        });
    });

    // Ad Type Selection Tests
    describe('Ad Type Selection', () => {
        it('should render ad type selection section', () => {
            const adTypeSection = document.body.querySelectorAll('h2')[1];
            expect(adTypeSection).toBeTruthy();
            expect(adTypeSection.textContent).toContain('2. Jenis Iklan');
        });

        it('should render Story ad type option', () => {
            const storyInput = document.getElementById('script-story-iklan-type-story');
            expect(storyInput).toBeTruthy();
            expect(storyInput.type).toBe('radio');
            expect(storyInput.name).toBe('script-story-iklan-type');
            expect(storyInput.value).toBe('story');
            
            const storyLabel = storyInput.closest('label');
            expect(storyLabel).toBeTruthy();
            expect(storyLabel.querySelector('i.fas.fa-history')).toBeTruthy();
            expect(storyLabel.textContent).toContain('Story');
            expect(storyLabel.textContent).toContain('Konten singkat 15-30 detik');
        });

        it('should render Reels/Shorts ad type option', () => {
            const reelsInput = document.getElementById('script-story-iklan-type-reels');
            expect(reelsInput).toBeTruthy();
            expect(reelsInput.type).toBe('radio');
            expect(reelsInput.name).toBe('script-story-iklan-type');
            expect(reelsInput.value).toBe('reels');
            
            const reelsLabel = reelsInput.closest('label');
            expect(reelsLabel).toBeTruthy();
            expect(reelsLabel.querySelector('i.fas.fa-video')).toBeTruthy();
            expect(reelsLabel.textContent).toContain('Reels/Shorts');
            expect(reelsLabel.textContent).toContain('Video pendek 15-60 detik');
        });

        it('should render Feed Post ad type option', () => {
            const feedInput = document.getElementById('script-story-iklan-type-feed');
            expect(feedInput).toBeTruthy();
            expect(feedInput.type).toBe('radio');
            expect(feedInput.name).toBe('script-story-iklan-type');
            expect(feedInput.value).toBe('feed');
            
            const feedLabel = feedInput.closest('label');
            expect(feedLabel).toBeTruthy();
            expect(feedLabel.querySelector('i.fas.fa-image')).toBeTruthy();
            expect(feedLabel.textContent).toContain('Feed Post');
            expect(feedLabel.textContent).toContain('Postingan feed dengan caption');
        });

        it('should render Live Streaming ad type option', () => {
            const liveInput = document.getElementById('script-story-iklan-type-live');
            expect(liveInput).toBeTruthy();
            expect(liveInput.type).toBe('radio');
            expect(liveInput.name).toBe('script-story-iklan-type');
            expect(liveInput.value).toBe('live');
            
            const liveLabel = liveInput.closest('label');
            expect(liveLabel).toBeTruthy();
            expect(liveLabel.querySelector('i.fas.fa-broadcast-tower')).toBeTruthy();
            expect(liveLabel.textContent).toContain('Live Streaming');
            expect(liveLabel.textContent).toContain('Siaran langsung interaktif');
        });

        it('should have 4 ad type options in vertical layout', () => {
            const adTypeContainer = document.body.querySelector('.space-y-3');
            expect(adTypeContainer).toBeTruthy();
            
            const adTypeOptions = adTypeContainer.querySelectorAll('.ad-type-option');
            expect(adTypeOptions.length).toBe(4);
        });

        it('should have proper ad type card styling', () => {
            const adTypeCards = document.body.querySelectorAll('.ad-type-card');
            expect(adTypeCards.length).toBe(4);
            
            adTypeCards.forEach(card => {
                expect(card.classList.contains('p-4')).toBe(true);
                expect(card.classList.contains('rounded-xl')).toBe(true);
                expect(card.classList.contains('border-2')).toBe(true);
                expect(card.classList.contains('flex')).toBe(true);
                expect(card.classList.contains('items-center')).toBe(true);
                expect(card.classList.contains('gap-3')).toBe(true);
            });
        });
    });

    // Product/Service Input Tests
    describe('Product/Service Input', () => {
        it('should render product/service information section', () => {
            const productSection = document.body.querySelectorAll('h2')[2];
            expect(productSection).toBeTruthy();
            expect(productSection.textContent).toContain('3. Informasi Produk/Jasa');
        });

        it('should render product name input', () => {
            const nameInput = document.getElementById('script-story-iklan-product-name');
            expect(nameInput).toBeTruthy();
            expect(nameInput.type).toBe('text');
            expect(nameInput.placeholder).toContain('Contoh: Serum Wajah Glow & Shine');
        });

        it('should render product description textarea', () => {
            const descInput = document.getElementById('script-story-iklan-product-desc');
            expect(descInput).toBeTruthy();
            expect(descInput.tagName).toBe('TEXTAREA');
            expect(descInput.rows).toBe(3);
            expect(descInput.placeholder).toContain('Jelaskan produk/jasa Anda secara singkat');
        });

        it('should render product price input', () => {
            const priceInput = document.getElementById('script-story-iklan-product-price');
            expect(priceInput).toBeTruthy();
            expect(priceInput.type).toBe('text');
            expect(priceInput.placeholder).toContain('Contoh: Rp 150.000');
        });

        it('should render product benefits textarea', () => {
            const benefitsInput = document.getElementById('script-story-iklan-product-benefits');
            expect(benefitsInput).toBeTruthy();
            expect(benefitsInput.tagName).toBe('TEXTAREA');
            expect(benefitsInput.rows).toBe(2);
            expect(benefitsInput.placeholder).toContain('Melembapkan, brighten, anti-aging');
        });

        it('should have proper input labels with icons', () => {
            const nameLabel = document.querySelector('label[for="script-story-iklan-product-name"]');
            expect(nameLabel).toBeTruthy();
            expect(nameLabel.textContent).toContain('Nama Produk/Jasa');
            expect(nameLabel.querySelector('i.fas.fa-tag')).toBeTruthy();
            expect(nameLabel.querySelector('i').classList.contains('text-red-500')).toBe(true);
            
            const descLabel = document.querySelector('label[for="script-story-iklan-product-desc"]');
            expect(descLabel).toBeTruthy();
            expect(descLabel.textContent).toContain('Deskripsi Produk');
            expect(descLabel.querySelector('i.fas.fa-align-left')).toBeTruthy();
            
            const benefitsLabel = document.querySelector('label[for="script-story-iklan-product-benefits"]');
            expect(benefitsLabel).toBeTruthy();
            expect(benefitsLabel.textContent).toContain('Keunggulan Produk');
            expect(benefitsLabel.querySelector('i.fas.fa-check-circle')).toBeTruthy();
        });

        it('should have proper input styling', () => {
            const inputs = document.body.querySelectorAll('#script-story-iklan-product-name, #script-story-iklan-product-desc, #script-story-iklan-product-price, #script-story-iklan-product-benefits');
            
            inputs.forEach(input => {
                expect(input.classList.contains('w-full')).toBe(true);
                expect(input.classList.contains('px-4')).toBe(true);
                expect(input.classList.contains('py-2')).toBe(true);
                expect(input.classList.contains('border')).toBe(true);
                expect(input.classList.contains('border-gray-300')).toBe(true);
                expect(input.classList.contains('rounded-lg')).toBe(true);
                expect(input.classList.contains('focus:ring-2')).toBe(true);
                expect(input.classList.contains('focus:ring-red-500')).toBe(true);
            });
        });

        it('should have proper spacing in product info form', () => {
            const productInfoCard = document.body.querySelectorAll('.card')[2];
            const spaceDiv = productInfoCard.querySelector('.space-y-4');
            expect(spaceDiv).toBeTruthy();
        });
    });

    // Call-to-Action Selection Tests
    describe('Call-to-Action Selection', () => {
        it('should render CTA selection section', () => {
            const ctaSection = document.body.querySelectorAll('h2')[3];
            expect(ctaSection).toBeTruthy();
            expect(ctaSection.textContent).toContain('4. Call-to-Action');
        });

        it('should render Beli Sekarang CTA option', () => {
            const buyInput = document.getElementById('script-story-iklan-cta-buy');
            expect(buyInput).toBeTruthy();
            expect(buyInput.type).toBe('radio');
            expect(buyInput.name).toBe('script-story-iklan-cta');
            expect(buyInput.value).toBe('beli sekarang');
            
            const buyLabel = buyInput.closest('label');
            expect(buyLabel).toBeTruthy();
            expect(buyLabel.textContent).toContain('Beli Sekarang');
        });

        it('should render Klik Link di Bio CTA option', () => {
            const linkInput = document.getElementById('script-story-iklan-cta-link');
            expect(linkInput).toBeTruthy();
            expect(linkInput.type).toBe('radio');
            expect(linkInput.name).toBe('script-story-iklan-cta');
            expect(linkInput.value).toBe('klik link di bio');
            
            const linkLabel = linkInput.closest('label');
            expect(linkLabel).toBeTruthy();
            expect(linkLabel.textContent).toContain('Klik Link di Bio');
        });

        it('should render Hubungi Kami CTA option', () => {
            const contactInput = document.getElementById('script-story-iklan-cta-contact');
            expect(contactInput).toBeTruthy();
            expect(contactInput.type).toBe('radio');
            expect(contactInput.name).toBe('script-story-iklan-cta');
            expect(contactInput.value).toBe('hubungi kami');
            
            const contactLabel = contactInput.closest('label');
            expect(contactLabel).toBeTruthy();
            expect(contactLabel.textContent).toContain('Hubungi Kami');
        });

        it('should render Daftar Sekarang CTA option', () => {
            const registerInput = document.getElementById('script-story-iklan-cta-register');
            expect(registerInput).toBeTruthy();
            expect(registerInput.type).toBe('radio');
            expect(registerInput.name).toBe('script-story-iklan-cta');
            expect(registerInput.value).toBe('daftar sekarang');
            
            const registerLabel = registerInput.closest('label');
            expect(registerLabel).toBeTruthy();
            expect(registerLabel.textContent).toContain('Daftar Sekarang');
        });

        it('should render Chat Sekarang CTA option', () => {
            const chatInput = document.getElementById('script-story-iklan-cta-chat');
            expect(chatInput).toBeTruthy();
            expect(chatInput.type).toBe('radio');
            expect(chatInput.name).toBe('script-story-iklan-cta');
            expect(chatInput.value).toBe('chat sekarang');
            
            const chatLabel = chatInput.closest('label');
            expect(chatLabel).toBeTruthy();
            expect(chatLabel.textContent).toContain('Chat Sekarang');
        });

        it('should render Kustom CTA option', () => {
            const customInput = document.getElementById('script-story-iklan-cta-custom');
            expect(customInput).toBeTruthy();
            expect(customInput.type).toBe('radio');
            expect(customInput.name).toBe('script-story-iklan-cta');
            expect(customInput.value).toBe('custom');
            
            const customLabel = customInput.closest('label');
            expect(customLabel).toBeTruthy();
            expect(customLabel.textContent).toContain('Lainnya...');
        });

        it('should have 6 CTA options in 2-column grid', () => {
            const ctaGrid = document.body.querySelector('.grid.grid-cols-2');
            expect(ctaGrid).toBeTruthy();
            expect(ctaGrid.classList.contains('gap-3')).toBe(true);
            
            const ctaOptions = ctaGrid.querySelectorAll('.cta-option');
            expect(ctaOptions.length).toBe(6);
        });

        it('should render custom CTA input container', () => {
            const customCtaContainer = document.getElementById('script-story-iklan-custom-cta-container');
            expect(customCtaContainer).toBeTruthy();
            expect(customCtaContainer.classList.contains('hidden')).toBe(true);
            expect(customCtaContainer.classList.contains('mt-3')).toBe(true);
        });

        it('should render custom CTA input', () => {
            const customCtaInput = document.getElementById('script-story-iklan-custom-cta-input');
            expect(customCtaInput).toBeTruthy();
            expect(customCtaInput.type).toBe('text');
            expect(customCtaInput.placeholder).toContain('Masukkan CTA kustom');
        });

        it('should have proper CTA card styling', () => {
            const ctaCards = document.body.querySelectorAll('.cta-card');
            expect(ctaCards.length).toBe(6);
            
            ctaCards.forEach(card => {
                expect(card.classList.contains('p-3')).toBe(true);
                expect(card.classList.contains('rounded-lg')).toBe(true);
                expect(card.classList.contains('border-2')).toBe(true);
                expect(card.classList.contains('border-gray-200')).toBe(true);
                expect(card.classList.contains('text-center')).toBe(true);
            });
        });
    });

    // Generate Button Tests
    describe('Generate Button', () => {
        it('should render generate button', () => {
            const generateBtn = document.getElementById('script-story-iklan-generate-btn');
            expect(generateBtn).toBeTruthy();
            expect(generateBtn.tagName).toBe('BUTTON');
        });

        it('should have correct button text', () => {
            const generateBtn = document.getElementById('script-story-iklan-generate-btn');
            expect(generateBtn.textContent).toContain('Buat Script & Story');
        });

        it('should have magic icon', () => {
            const generateBtn = document.getElementById('script-story-iklan-generate-btn');
            expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
        });

        it('should have correct styling classes', () => {
            const generateBtn = document.getElementById('script-story-iklan-generate-btn');
            expect(generateBtn.classList.contains('w-full')).toBe(true);
            expect(generateBtn.classList.contains('py-4')).toBe(true);
            expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(generateBtn.classList.contains('from-red-500')).toBe(true);
            expect(generateBtn.classList.contains('to-coral-500')).toBe(true);
            expect(generateBtn.classList.contains('text-white')).toBe(true);
            expect(generateBtn.classList.contains('font-bold')).toBe(true);
            expect(generateBtn.classList.contains('rounded-2xl')).toBe(true);
            expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
            expect(generateBtn.classList.contains('hover:from-red-600')).toBe(true);
            expect(generateBtn.classList.contains('hover:to-coral-600')).toBe(true);
            expect(generateBtn.classList.contains('transition-all')).toBe(true);
            expect(generateBtn.classList.contains('transform')).toBe(true);
            expect(generateBtn.classList.contains('hover:scale-[1.02]')).toBe(true);
        });
    });

    // Results Area Tests
    describe('Results Area', () => {
        it('should render results container', () => {
            const resultsContainer = document.body.querySelector('.lg\\:col-span-2 .card');
            expect(resultsContainer).toBeTruthy();
            expect(resultsContainer.classList.contains('min-h-[600px]')).toBe(true);
        });

        it('should render results header', () => {
            const resultsHeader = document.body.querySelector('.lg\\:col-span-2 h2');
            expect(resultsHeader).toBeTruthy();
            expect(resultsHeader.textContent).toContain('Hasil Script & Story');
            expect(resultsHeader.querySelector('i.fas.fa-file-alt')).toBeTruthy();
            expect(resultsHeader.querySelector('i').classList.contains('text-red-500')).toBe(true);
        });

        it('should render copy button', () => {
            const copyBtn = document.getElementById('script-story-iklan-copy-btn');
            expect(copyBtn).toBeTruthy();
            expect(copyBtn.classList.contains('hidden')).toBe(true);
            expect(copyBtn.textContent).toContain('Salin');
            expect(copyBtn.querySelector('i.fas.fa-copy')).toBeTruthy();
            expect(copyBtn.classList.contains('bg-red-500')).toBe(true);
            expect(copyBtn.classList.contains('text-white')).toBe(true);
        });

        it('should render loading state', () => {
            const loading = document.getElementById('script-story-iklan-loading');
            expect(loading).toBeTruthy();
            expect(loading.classList.contains('hidden')).toBe(true);
            expect(loading.classList.contains('flex')).toBe(true);
            expect(loading.classList.contains('flex-col')).toBe(true);
            expect(loading.classList.contains('items-center')).toBe(true);
            expect(loading.classList.contains('justify-center')).toBe(true);
            
            const spinner = loading.querySelector('.animate-spin');
            expect(spinner).toBeTruthy();
            expect(spinner.classList.contains('rounded-full')).toBe(true);
            expect(spinner.classList.contains('h-12')).toBe(true);
            expect(spinner.classList.contains('w-12')).toBe(true);
            expect(spinner.classList.contains('border-b-2')).toBe(true);
            expect(spinner.classList.contains('border-red-500')).toBe(true);
            
            expect(loading.textContent).toContain('Sedang membuat script dan story iklan');
        });

        it('should render empty state', () => {
            const emptyState = document.getElementById('script-story-iklan-empty');
            expect(emptyState).toBeTruthy();
            expect(emptyState.classList.contains('flex')).toBe(true);
            expect(emptyState.classList.contains('flex-col')).toBe(true);
            expect(emptyState.classList.contains('items-center')).toBe(true);
            expect(emptyState.classList.contains('justify-center')).toBe(true);
            expect(emptyState.classList.contains('text-center')).toBe(true);
            
            const emptyIcon = emptyState.querySelector('.bg-gradient-to-r');
            expect(emptyIcon).toBeTruthy();
            expect(emptyIcon.classList.contains('from-red-100')).toBe(true);
            expect(emptyIcon.classList.contains('to-coral-100')).toBe(true);
            expect(emptyIcon.classList.contains('rounded-full')).toBe(true);
            
            const scriptIcon = emptyState.querySelector('i.fas.fa-script');
            expect(scriptIcon).toBeTruthy();
            expect(scriptIcon.classList.contains('text-red-400')).toBe(true);
            
            expect(emptyState.textContent).toContain('Belum Ada Script');
            expect(emptyState.textContent).toContain('Isi form di sebelah kiri');
        });

        it('should render result container', () => {
            const result = document.getElementById('script-story-iklan-result');
            expect(result).toBeTruthy();
            expect(result.classList.contains('hidden')).toBe(true);
            expect(result.classList.contains('space-y-6')).toBe(true);
        });

        it('should render script section', () => {
            const scriptSection = document.body.querySelector('#script-story-iklan-result .bg-gray-50');
            expect(scriptSection).toBeTruthy();
            expect(scriptSection.classList.contains('rounded-xl')).toBe(true);
            expect(scriptSection.classList.contains('p-6')).toBe(true);
            
            const scriptHeader = scriptSection.querySelector('h3');
            expect(scriptHeader).toBeTruthy();
            expect(scriptHeader.textContent).toContain('Script Iklan');
            expect(scriptHeader.querySelector('i.fas.fa-list-ul')).toBeTruthy();
            
            const scriptContent = document.getElementById('script-story-iklan-script-content');
            expect(scriptContent).toBeTruthy();
            expect(scriptContent.classList.contains('prose')).toBe(true);
            expect(scriptContent.classList.contains('prose-red')).toBe(true);
        });

        it('should render story section', () => {
            const storySection = document.body.querySelector('#script-story-iklan-result .bg-gradient-to-r');
            expect(storySection).toBeTruthy();
            expect(storySection.classList.contains('from-red-50')).toBe(true);
            expect(storySection.classList.contains('to-coral-50')).toBe(true);
            expect(storySection.classList.contains('rounded-xl')).toBe(true);
            expect(storySection.classList.contains('p-6')).toBe(true);
            
            const storyHeader = storySection.querySelector('h3');
            expect(storyHeader).toBeTruthy();
            expect(storyHeader.textContent).toContain('Story Line');
            expect(storyHeader.querySelector('i.fas.fa-history')).toBeTruthy();
            
            const storyContent = document.getElementById('script-story-iklan-story-content');
            expect(storyContent).toBeTruthy();
            expect(storyContent.classList.contains('prose')).toBe(true);
            expect(storyContent.classList.contains('prose-red')).toBe(true);
        });

        it('should render tips section', () => {
            const tipsSection = document.body.querySelector('#script-story-iklan-result .bg-yellow-50');
            expect(tipsSection).toBeTruthy();
            expect(tipsSection.classList.contains('border')).toBe(true);
            expect(tipsSection.classList.contains('border-yellow-200')).toBe(true);
            expect(tipsSection.classList.contains('rounded-xl')).toBe(true);
            expect(tipsSection.classList.contains('p-6')).toBe(true);
            
            const tipsHeader = tipsSection.querySelector('h3');
            expect(tipsHeader).toBeTruthy();
            expect(tipsHeader.textContent).toContain('Tips Produksi');
            expect(tipsHeader.querySelector('i.fas.fa-lightbulb')).toBeTruthy();
            expect(tipsHeader.querySelector('i').classList.contains('text-yellow-500')).toBe(true);
            
            const tipsContent = document.getElementById('script-story-iklan-tips-content');
            expect(tipsContent).toBeTruthy();
            expect(tipsContent.classList.contains('space-y-2')).toBe(true);
        });
    });

    // Color Scheme Tests
    describe('Color Scheme (red/coral)', () => {
        it('should use red/coral gradient in header title', () => {
            const title = document.body.querySelector('h1');
            expect(title.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(title.classList.contains('from-red-500')).toBe(true);
            expect(title.classList.contains('to-coral-500')).toBe(true);
        });

        it('should use red accents in generate button', () => {
            const generateBtn = document.getElementById('script-story-iklan-generate-btn');
            expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(generateBtn.classList.contains('from-red-500')).toBe(true);
            expect(generateBtn.classList.contains('to-coral-500')).toBe(true);
            expect(generateBtn.classList.contains('hover:from-red-600')).toBe(true);
            expect(generateBtn.classList.contains('hover:to-coral-600')).toBe(true);
        });

        it('should use red accents in form labels', () => {
            const labels = document.body.querySelectorAll('label i.text-red-500');
            expect(labels.length).toBe(8); // product name, description, price, benefits, plus CTA section icons
        });

        it('should use red accents in focus states', () => {
            const nameInput = document.getElementById('script-story-iklan-product-name');
            expect(nameInput.classList.contains('focus:ring-red-500')).toBe(true);
            
            const descInput = document.getElementById('script-story-iklan-product-desc');
            expect(descInput.classList.contains('focus:ring-red-500')).toBe(true);
            
            const priceInput = document.getElementById('script-story-iklan-product-price');
            expect(priceInput.classList.contains('focus:ring-red-500')).toBe(true);
            
            const benefitsInput = document.getElementById('script-story-iklan-product-benefits');
            expect(benefitsInput.classList.contains('focus:ring-red-500')).toBe(true);
        });

        it('should use red accents in platform selection', () => {
            const platformCards = document.body.querySelectorAll('.platform-card');
            platformCards.forEach(card => {
                expect(card.classList.contains('peer-checked:border-red-500')).toBe(true);
                expect(card.classList.contains('peer-checked:bg-red-50')).toBe(true);
                expect(card.classList.contains('hover:border-red-300')).toBe(true);
            });
        });

        it('should use red accents in ad type selection', () => {
            const adTypeCards = document.body.querySelectorAll('.ad-type-card');
            adTypeCards.forEach(card => {
                expect(card.classList.contains('peer-checked:border-red-500')).toBe(true);
                expect(card.classList.contains('peer-checked:bg-red-50')).toBe(true);
                expect(card.classList.contains('hover:border-red-300')).toBe(true);
                expect(card.querySelector('i').classList.contains('text-red-500')).toBe(true);
            });
        });

        it('should use red accents in CTA selection', () => {
            const ctaCards = document.body.querySelectorAll('.cta-card');
            ctaCards.forEach(card => {
                expect(card.classList.contains('peer-checked:border-red-500')).toBe(true);
                expect(card.classList.contains('peer-checked:bg-red-50')).toBe(true);
                expect(card.classList.contains('hover:border-red-300')).toBe(true);
            });
        });

        it('should use red accents in copy button', () => {
            const copyBtn = document.getElementById('script-story-iklan-copy-btn');
            expect(copyBtn.classList.contains('bg-red-500')).toBe(true);
            expect(copyBtn.classList.contains('hover:bg-red-600')).toBe(true);
        });

        it('should use red accents in results header', () => {
            const resultsIcon = document.body.querySelector('.lg\\:col-span-2 h2 i.text-red-500');
            expect(resultsIcon).toBeTruthy();
        });

        it('should use red accents in loading spinner', () => {
            const loadingSpinner = document.body.querySelector('#script-story-iklan-loading .border-red-500');
            expect(loadingSpinner).toBeTruthy();
        });

        it('should use red accents in empty state', () => {
            const emptyIcon = document.body.querySelector('#script-story-iklan-empty i.text-red-400');
            expect(emptyIcon).toBeTruthy();
        });

        it('should use red accents in result sections', () => {
            const scriptIcon = document.body.querySelector('#script-story-iklan-script-content').previousElementSibling.querySelector('i');
            expect(scriptIcon.classList.contains('text-red-500')).toBe(true);
            
            const storyIcon = document.body.querySelector('#script-story-iklan-story-content').previousElementSibling.querySelector('i');
            expect(storyIcon.classList.contains('text-red-500')).toBe(true);
        });

        it('should use prose-red for output styling', () => {
            const scriptContent = document.getElementById('script-story-iklan-script-content');
            expect(scriptContent.classList.contains('prose-red')).toBe(true);
            
            const storyContent = document.getElementById('script-story-iklan-story-content');
            expect(storyContent.classList.contains('prose-red')).toBe(true);
        });

        it('should have custom coral color defined', () => {
            const style = document.body.querySelector('style');
            expect(style).toBeTruthy();
            expect(style.textContent).toContain('.to-coral-500');
            expect(style.textContent).toContain('#ff6b6b');
        });
    });

    // Card Styling Tests
    describe('Card Styling', () => {
        it('should have cards with proper styling', () => {
            const cards = document.body.querySelectorAll('.card');
            expect(cards.length).toBe(5); // 4 in left panel + 1 output container
            
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

        it('should have script icon in header', () => {
            const scriptIcon = document.body.querySelector('header i.fas.fa-script');
            expect(scriptIcon).toBeTruthy();
        });

        it('should have social media icons for platforms', () => {
            const instagramIcon = document.body.querySelector('[for="script-story-iklan-platform-instagram"] i.fab.fa-instagram');
            expect(instagramIcon).toBeTruthy();
            
            const tiktokIcon = document.body.querySelector('[for="script-story-iklan-platform-tiktok"] i.fab.fa-tiktok');
            expect(tiktokIcon).toBeTruthy();
            
            const youtubeIcon = document.body.querySelector('[for="script-story-iklan-platform-youtube"] i.fab.fa-youtube');
            expect(youtubeIcon).toBeTruthy();
        });

        it('should have content type icons for ad types', () => {
            const historyIcon = document.body.querySelector('[for="script-story-iklan-type-story"] i.fas.fa-history');
            expect(historyIcon).toBeTruthy();
            
            const videoIcon = document.body.querySelector('[for="script-story-iklan-type-reels"] i.fas.fa-video');
            expect(videoIcon).toBeTruthy();
            
            const imageIcon = document.body.querySelector('[for="script-story-iklan-type-feed"] i.fas.fa-image');
            expect(imageIcon).toBeTruthy();
            
            const broadcastIcon = document.body.querySelector('[for="script-story-iklan-type-live"] i.fas.fa-broadcast-tower');
            expect(broadcastIcon).toBeTruthy();
        });

        it('should have magic icon for generate button', () => {
            const magicIcon = document.getElementById('script-story-iklan-generate-btn').querySelector('i.fas.fa-magic');
            expect(magicIcon).toBeTruthy();
        });

        it('should have file-alt icon for results header', () => {
            const fileIcon = document.body.querySelector('.lg\\:col-span-2 h2 i.fas.fa-file-alt');
            expect(fileIcon).toBeTruthy();
        });

        it('should have copy icon for copy button', () => {
            const copyIcon = document.getElementById('script-story-iklan-copy-btn').querySelector('i.fas.fa-copy');
            expect(copyIcon).toBeTruthy();
        });

        it('should have list-ul icon for script section', () => {
            const listIcon = document.body.querySelector('#script-story-iklan-script-content').previousElementSibling.querySelector('i.fas.fa-list-ul');
            expect(listIcon).toBeTruthy();
        });

        it('should have history icon for story section', () => {
            const historyIcon = document.body.querySelector('#script-story-iklan-story-content').previousElementSibling.querySelector('i.fas.fa-history');
            expect(historyIcon).toBeTruthy();
        });

        it('should have lightbulb icon for tips section', () => {
            const lightbulbIcon = document.body.querySelector('#script-story-iklan-tips-content').previousElementSibling.querySelector('i.fas.fa-lightbulb');
            expect(lightbulbIcon).toBeTruthy();
        });
    });

    // Text Content Tests
    describe('Text Content', () => {
        it('should have Indonesian text', () => {
            expect(document.body.textContent).toContain('Script & Story Iklan');
            expect(document.body.textContent).toContain('Buat script dan story iklan yang menarik dengan bantuan AI');
            expect(document.body.textContent).toContain('Pilih Platform');
            expect(document.body.textContent).toContain('Jenis Iklan');
            expect(document.body.textContent).toContain('Informasi Produk/Jasa');
            expect(document.body.textContent).toContain('Call-to-Action');
            expect(document.body.textContent).toContain('Buat Script & Story');
            expect(document.body.textContent).toContain('Hasil Script & Story');
        });

        it('should have proper section headers', () => {
            const headers = document.body.querySelectorAll('h2');
            expect(headers.length).toBe(5);
            expect(headers[0].textContent).toContain('1. Pilih Platform');
            expect(headers[1].textContent).toContain('2. Jenis Iklan');
            expect(headers[2].textContent).toContain('3. Informasi Produk/Jasa');
            expect(headers[3].textContent).toContain('4. Call-to-Action');
            expect(headers[4].textContent).toContain('Hasil Script & Story');
        });

        it('should have proper placeholder texts', () => {
            const nameInput = document.getElementById('script-story-iklan-product-name');
            expect(nameInput.placeholder).toContain('Contoh: Serum Wajah Glow & Shine');
            
            const descInput = document.getElementById('script-story-iklan-product-desc');
            expect(descInput.placeholder).toContain('Jelaskan produk/jasa Anda secara singkat');
            
            const priceInput = document.getElementById('script-story-iklan-product-price');
            expect(priceInput.placeholder).toContain('Contoh: Rp 150.000');
        });
    });

    // Accessibility Tests
    describe('Accessibility', () => {
        it('should have proper heading structure', () => {
            const h1 = document.body.querySelector('h1');
            expect(h1).toBeTruthy();
            
            const h2Elements = document.body.querySelectorAll('h2');
            expect(h2Elements.length).toBe(5);
            
            const h3Elements = document.body.querySelectorAll('h3');
            expect(h3Elements.length).toBe(4); // 3 in results + 1 in empty state
        });

        it('should have proper label associations', () => {
            // Platform labels
            expect(document.querySelector('label[for="script-story-iklan-platform-instagram"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-platform-tiktok"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-platform-youtube"]')).toBeTruthy();
            
            // Ad type labels
            expect(document.querySelector('label[for="script-story-iklan-type-story"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-type-reels"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-type-feed"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-type-live"]')).toBeTruthy();
            
            // CTA labels
            expect(document.querySelector('label[for="script-story-iklan-cta-buy"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-cta-link"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-cta-contact"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-cta-register"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-cta-chat"]')).toBeTruthy();
            expect(document.querySelector('label[for="script-story-iklan-cta-custom"]')).toBeTruthy();
        });

        it('should have proper form input labels', () => {
            const nameLabel = document.querySelector('label[for="script-story-iklan-product-name"]');
            expect(nameLabel).toBeTruthy();
            
            const descLabel = document.querySelector('label[for="script-story-iklan-product-desc"]');
            expect(descLabel).toBeTruthy();
            
            const priceLabel = document.querySelector('label[for="script-story-iklan-product-price"]');
            expect(priceLabel).toBeTruthy();
            
            const benefitsLabel = document.querySelector('label[for="script-story-iklan-product-benefits"]');
            expect(benefitsLabel).toBeTruthy();
        });

        it('should have proper radio input types', () => {
            const platformInputs = document.querySelectorAll('input[name="script-story-iklan-platform"]');
            platformInputs.forEach(input => {
                expect(input.type).toBe('radio');
            });
            
            const typeInputs = document.querySelectorAll('input[name="script-story-iklan-type"]');
            typeInputs.forEach(input => {
                expect(input.type).toBe('radio');
            });
            
            const ctaInputs = document.querySelectorAll('input[name="script-story-iklan-cta"]');
            ctaInputs.forEach(input => {
                expect(input.type).toBe('radio');
            });
        });

        it('should have proper text input types', () => {
            const nameInput = document.getElementById('script-story-iklan-product-name');
            expect(nameInput.type).toBe('text');
            
            const priceInput = document.getElementById('script-story-iklan-product-price');
            expect(priceInput.type).toBe('text');
            
            const customCtaInput = document.getElementById('script-story-iklan-custom-cta-input');
            expect(customCtaInput.type).toBe('text');
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

        it('should have responsive typography', () => {
            const title = document.body.querySelector('h1');
            expect(title.classList.contains('text-4xl')).toBe(true);
            expect(title.classList.contains('md:text-5xl')).toBe(true);
        });

        it('should have responsive container padding', () => {
            const container = document.body.querySelector('.container');
            expect(container.classList.contains('px-4')).toBe(true);
            expect(container.classList.contains('py-8')).toBe(true);
        });
    });

    // Input Validation Tests
    describe('Input Validation', () => {
        it('should have proper input types', () => {
            const nameInput = document.getElementById('script-story-iklan-product-name');
            expect(nameInput.type).toBe('text');
            
            const priceInput = document.getElementById('script-story-iklan-product-price');
            expect(priceInput.type).toBe('text');
            
            const customCtaInput = document.getElementById('script-story-iklan-custom-cta-input');
            expect(customCtaInput.type).toBe('text');
        });

        it('should have proper textarea attributes', () => {
            const descInput = document.getElementById('script-story-iklan-product-desc');
            expect(descInput.rows).toBe(3);
            expect(descInput.classList.contains('resize-none')).toBe(true);
            
            const benefitsInput = document.getElementById('script-story-iklan-product-benefits');
            expect(benefitsInput.rows).toBe(2);
            expect(benefitsInput.classList.contains('resize-none')).toBe(true);
        });

        it('should have proper radio button groups', () => {
            const platformInputs = document.querySelectorAll('input[name="script-story-iklan-platform"]');
            expect(platformInputs.length).toBe(3);
            
            const typeInputs = document.querySelectorAll('input[name="script-story-iklan-type"]');
            expect(typeInputs.length).toBe(4);
            
            const ctaInputs = document.querySelectorAll('input[name="script-story-iklan-cta"]');
            expect(ctaInputs.length).toBe(6);
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
                expect(input.classList.contains('focus:ring-red-500')).toBe(true);
            });
        });
    });

    // Loading State Tests
    describe('Loading State', () => {
        it('should have loader element', () => {
            const loader = document.body.querySelector('.animate-spin');
            expect(loader).toBeTruthy();
            expect(loader.classList.contains('ease-linear')).toBe(false); // Uses default animation
            expect(loader.classList.contains('rounded-full')).toBe(true);
            expect(loader.classList.contains('h-12')).toBe(true);
            expect(loader.classList.contains('w-12')).toBe(true);
            expect(loader.classList.contains('border-b-2')).toBe(true);
            expect(loader.classList.contains('border-red-500')).toBe(true);
        });

        it('should have proper loading text', () => {
            const loading = document.getElementById('script-story-iklan-loading');
            expect(loading.textContent).toContain('Sedang membuat script dan story iklan');
        });

        it('should have proper loading container styling', () => {
            const loading = document.getElementById('script-story-iklan-loading');
            expect(loading.classList.contains('flex')).toBe(true);
            expect(loading.classList.contains('flex-col')).toBe(true);
            expect(loading.classList.contains('items-center')).toBe(true);
            expect(loading.classList.contains('justify-center')).toBe(true);
        });
    });

    // Empty State Tests
    describe('Empty State', () => {
        it('should have proper empty state icon', () => {
            const emptyState = document.getElementById('script-story-iklan-empty');
            const scriptIcon = emptyState.querySelector('i.fas.fa-script');
            expect(scriptIcon).toBeTruthy();
            expect(scriptIcon.classList.contains('text-5xl')).toBe(true);
            expect(scriptIcon.classList.contains('text-red-400')).toBe(true);
        });

        it('should have proper empty state text', () => {
            const emptyState = document.getElementById('script-story-iklan-empty');
            expect(emptyState.textContent).toContain('Belum Ada Script');
            expect(emptyState.textContent).toContain('Isi form di sebelah kiri');
            expect(emptyState.textContent).toContain('Buat Script & Story');
        });

        it('should have proper empty state styling', () => {
            const emptyState = document.getElementById('script-story-iklan-empty');
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
            const resultsContainer = document.body.querySelector('.lg\\:col-span-2 .card');
            expect(resultsContainer.classList.contains('min-h-[600px]')).toBe(true);
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
        });

        it('should have proper spacing between sections', () => {
            const leftPanel = document.body.querySelector('.lg\\:col-span-1');
            const cards = leftPanel.querySelectorAll('.card');
            expect(cards.length).toBe(4);
        });
    });

    // Form Label Tests
    describe('Form Labels', () => {
        it('should have proper label styling', () => {
            const formLabels = [
                document.getElementById('script-story-iklan-product-name')?.closest('div').querySelector('label'),
                document.getElementById('script-story-iklan-product-desc')?.closest('div').querySelector('label'),
                document.getElementById('script-story-iklan-product-price')?.closest('div').querySelector('label'),
                document.getElementById('script-story-iklan-product-benefits')?.closest('div').querySelector('label')
            ].filter(Boolean);
            
            formLabels.forEach(label => {
                expect(label.classList.contains('block')).toBe(true);
                expect(label.classList.contains('text-sm')).toBe(true);
                expect(label.classList.contains('font-medium')).toBe(true);
            });
        });

        it('should have proper label text', () => {
            const nameLabel = document.getElementById('script-story-iklan-product-name')?.closest('div').querySelector('label');
            expect(nameLabel.textContent).toContain('Nama Produk/Jasa');
            
            const descLabel = document.getElementById('script-story-iklan-product-desc')?.closest('div').querySelector('label');
            expect(descLabel.textContent).toContain('Deskripsi Produk');
            
            const priceLabel = document.getElementById('script-story-iklan-product-price')?.closest('div').querySelector('label');
            expect(priceLabel.textContent).toContain('Harga (Opsional)');
        });
    });

    // Component Integration Tests
    describe('Component Integration', () => {
        it('should have all required elements for functionality', () => {
            // Platform selection elements
            expect(document.getElementById('script-story-iklan-platform-instagram')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-platform-tiktok')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-platform-youtube')).toBeTruthy();
            
            // Ad type selection elements
            expect(document.getElementById('script-story-iklan-type-story')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-type-reels')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-type-feed')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-type-live')).toBeTruthy();
            
            // Product info elements
            expect(document.getElementById('script-story-iklan-product-name')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-product-desc')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-product-price')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-product-benefits')).toBeTruthy();
            
            // CTA selection elements
            expect(document.getElementById('script-story-iklan-cta-buy')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-cta-link')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-cta-contact')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-cta-register')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-cta-chat')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-cta-custom')).toBeTruthy();
            
            // Generate button
            expect(document.getElementById('script-story-iklan-generate-btn')).toBeTruthy();
            
            // Results elements
            expect(document.getElementById('script-story-iklan-copy-btn')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-loading')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-empty')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-result')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-script-content')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-story-content')).toBeTruthy();
            expect(document.getElementById('script-story-iklan-tips-content')).toBeTruthy();
        });

        it('should have proper data attributes for platform selection', () => {
            const platformInputs = document.querySelectorAll('input[name="script-story-iklan-platform"]');
            platformInputs.forEach(input => {
                expect(input.value).toBeTruthy();
                expect(['instagram', 'tiktok', 'youtube']).toContain(input.value);
            });
        });

        it('should have proper data attributes for ad type selection', () => {
            const typeInputs = document.querySelectorAll('input[name="script-story-iklan-type"]');
            typeInputs.forEach(input => {
                expect(input.value).toBeTruthy();
                expect(['story', 'reels', 'feed', 'live']).toContain(input.value);
            });
        });

        it('should have proper data attributes for CTA selection', () => {
            const ctaInputs = document.querySelectorAll('input[name="script-story-iklan-cta"]');
            ctaInputs.forEach(input => {
                expect(input.value).toBeTruthy();
                expect(['beli sekarang', 'klik link di bio', 'hubungi kami', 'daftar sekarang', 'chat sekarang', 'custom']).toContain(input.value);
            });
        });

        it('should have proper element hierarchy', () => {
            const container = document.getElementById('content-script-story-iklan');
            expect(container.querySelector('.container')).toBeTruthy();
            expect(container.querySelector('header')).toBeTruthy();
            expect(container.querySelector('main')).toBeTruthy();
            expect(container.querySelector('.lg\\:col-span-1')).toBeTruthy();
            expect(container.querySelector('.lg\\:col-span-2')).toBeTruthy();
        });
    });

    // Animation Tests
    describe('Animations', () => {
        it('should have spin animation defined', () => {
            const style = document.body.querySelector('style');
            expect(style).toBeTruthy();
            expect(style.textContent).toContain('@keyframes spin');
            expect(style.textContent).toContain('transform: rotate(360deg)');
        });

        it('should have animate-spin class applied', () => {
            const spinner = document.body.querySelector('.animate-spin');
            expect(spinner).toBeTruthy();
            expect(spinner.classList.contains('animate-spin')).toBe(true);
        });

        it('should have hover effects on platform cards', () => {
            const style = document.body.querySelector('style');
            expect(style.textContent).toContain('.platform-card:hover');
            expect(style.textContent).toContain('transform: translateY(-2px)');
            expect(style.textContent).toContain('box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)');
        });

        it('should have hover effects on ad type cards', () => {
            const style = document.body.querySelector('style');
            expect(style.textContent).toContain('.ad-type-card:hover');
        });

        it('should have hover effects on CTA cards', () => {
            const style = document.body.querySelector('style');
            expect(style.textContent).toContain('.cta-card:hover');
        });

        it('should have smooth transitions on cards', () => {
            const style = document.body.querySelector('style');
            expect(style.textContent).toContain('transition: all 0.3s ease');
        });
    });
});
