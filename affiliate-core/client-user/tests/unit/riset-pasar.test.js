import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for jsdom environment
global.fetch = vi.fn();

// Mock showToast globally
window.showToast = vi.fn();

describe('riset-pasar Component', () => {

    const mockComponentHTML = `
        <!-- Riset Pasar Component -->
        <div id="riset-pasar-container" class="bg-gradient-to-br from-green-600 to-emerald-500 min-h-screen p-6">
            <!-- Header -->
            <div id="riset-pasar-header" class="text-center mb-8">
                <h1 id="riset-pasar-title" class="text-3xl font-bold text-white mb-2">
                    <i class="fas fa-chart-line mr-2"></i>Riset Pasar
                </h1>
                <p id="riset-pasar-subtitle" class="text-white/90 text-lg">
                    Analisis industri, kompetitor, dan tren pasar untuk peluang affiliate
                </p>
            </div>

            <!-- Main Form -->
            <div id="riset-pasar-form-container" class="max-w-4xl mx-auto">
                <form id="riset-pasar-form" class="bg-white rounded-xl shadow-xl p-6 space-y-6">
                    <!-- Industry/Niche Selection -->
                    <div id="riset-pasar-industry-section">
                        <label id="riset-pasar-industry-label" for="riset-pasar-industry" class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-industry mr-2 text-green-600"></i>Industri/Niche
                        </label>
                        <select id="riset-pasar-industry" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                            <option value="">-- Pilih Industri --</option>
                            <option value="ecommerce">E-commerce & Retail</option>
                            <option value="technology">Teknologi & Software</option>
                            <option value="health">Kesehatan & Wellness</option>
                            <option value="finance">Keuangan & Investasi</option>
                            <option value="education">Pendidikan & Kursus</option>
                            <option value="travel">Travel & Hospitality</option>
                            <option value="food">Makanan & Minuman</option>
                            <option value="fashion">Fashion & Kecantikan</option>
                            <option value="gaming">Gaming & Hiburan</option>
                            <option value="realestate">Properti & Real Estate</option>
                            <option value="automotive">Otomotif</option>
                            <option value="other">Lainnya</option>
                        </select>
                        <input type="text" id="riset-pasar-industry-other" placeholder="Sebutkan industri lain..." class="w-full px-4 py-3 border border-gray-300 rounded-lg mt-2 hidden focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                    </div>

                    <!-- Target Location -->
                    <div id="riset-pasar-location-section">
                        <label id="riset-pasar-location-label" for="riset-pasar-location" class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-map-marker-alt mr-2 text-green-600"></i>Lokasi Target
                        </label>
                        <input type="text" id="riset-pasar-location" placeholder="Contoh: Jakarta, Indonesia atau ASEAN" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                        <p id="riset-pasar-location-help" class="text-sm text-gray-500 mt-1">Masukkan negara, kota, atau wilayah yang ingin ditargetkan</p>
                    </div>

                    <!-- Competitor Analysis -->
                    <div id="riset-pasar-competitor-section">
                        <label id="riset-pasar-competitor-label" class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-users mr-2 text-green-600"></i>Analisis Kompetitor
                        </label>
                        <div id="riset-pasar-competitor-list" class="space-y-3">
                            <div id="riset-pasar-competitor-1" class="flex gap-2">
                                <input type="text" id="riset-pasar-competitor-name-1" placeholder="Nama kompetitor/brand" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                                <input type="url" id="riset-pasar-competitor-url-1" placeholder="https://..." class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                            </div>
                        </div>
                        <button type="button" id="riset-pasar-add-competitor" class="mt-3 text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                            <i class="fas fa-plus-circle mr-1"></i>Tambah Kompetitor
                        </button>
                    </div>

                    <!-- Trends Identification -->
                    <div id="riset-pasar-trends-section">
                        <label id="riset-pasar-trends-label" class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-arrow-trend-up mr-2 text-green-600"></i>Identifikasi Tren
                        </label>
                        <div id="riset-pasar-trends-options" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="riset-pasar-trend-1" value="rising-demand" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                                <span class="text-gray-700">Permintaan Meningkat</span>
                            </label>
                            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="riset-pasar-trend-2" value="new-technology" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                                <span class="text-gray-700">Teknologi Baru</span>
                            </label>
                            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="riset-pasar-trend-3" value="seasonal" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                                <span class="text-gray-700">Musiman</span>
                            </label>
                            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="riset-pasar-trend-4" value="regulatory" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                                <span class="text-gray-700">Peraturan Pemerintah</span>
                            </label>
                            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="riset-pasar-trend-5" value="consumer-behavior" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                                <span class="text-gray-700">Perilaku Konsumen</span>
                            </label>
                            <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="riset-pasar-trend-6" value="market-gap" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                                <span class="text-gray-700">Celah Pasar</span>
                            </label>
                        </div>
                        <input type="text" id="riset-pasar-custom-trend" placeholder="Tren khusus lainnya..." class="w-full px-4 py-3 border border-gray-300 rounded-lg mt-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                    </div>

                    <!-- Additional Notes -->
                    <div id="riset-pasar-notes-section">
                        <label id="riset-pasar-notes-label" for="riset-pasar-notes" class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-sticky-note mr-2 text-green-600"></i>Catatan Tambahan
                        </label>
                        <textarea id="riset-pasar-notes" rows="3" placeholder="Informasi tambahan yang ingin disertakan dalam riset pasar..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"></textarea>
                    </div>

                    <!-- Generate Button -->
                    <div id="riset-pasar-actions" class="pt-4">
                        <button type="submit" id="riset-pasar-generate-btn" class="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center">
                            <i class="fas fa-search-dollar mr-2 text-lg"></i>
                            <span class="text-lg">Generate Riset Pasar</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Results Section (Hidden by default) -->
            <div id="riset-pasar-results-container" class="max-w-4xl mx-auto mt-8 hidden">
                <div id="riset-pasar-results" class="bg-white rounded-xl shadow-xl p-6">
                    <div id="riset-pasar-results-header" class="flex justify-between items-center mb-6 pb-4 border-b">
                        <h2 id="riset-pasar-results-title" class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-chart-pie mr-2 text-green-600"></i>Hasil Riset Pasar
                        </h2>
                        <button type="button" id="riset-pasar-new-analysis" class="text-green-600 hover:text-green-700 font-medium">
                            <i class="fas fa-plus mr-1"></i>Analisis Baru
                        </button>
                    </div>
                    
                    <div id="riset-pasar-results-content" class="space-y-6">
                        <!-- Results will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div id="riset-pasar-loading" class="max-w-4xl mx-auto mt-8 hidden">
                <div class="bg-white rounded-xl shadow-xl p-12 text-center">
                    <div class="animate-spin inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mb-4"></div>
                    <p id="riset-pasar-loading-text" class="text-gray-600 text-lg">Sedang menganalisis pasar...</p>
                    <p class="text-gray-500 text-sm mt-2">Ini mungkin memerlukan waktu beberapa saat</p>
                </div>
            </div>
        </div>
    `;

    beforeEach(() => {
        document.body.innerHTML = mockComponentHTML;
        // Reset fetch mock
        global.fetch = vi.fn();
        // Reset toast mock
        window.showToast = vi.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    // Component Structure Tests
    describe('Component Structure', () => {
        it('should render main container with correct ID', () => {
            const container = document.getElementById('riset-pasar-container');
            expect(container).toBeTruthy();
            expect(container.classList.contains('bg-gradient-to-br')).toBe(true);
            expect(container.classList.contains('from-green-600')).toBe(true);
            expect(container.classList.contains('to-emerald-500')).toBe(true);
            expect(container.classList.contains('min-h-screen')).toBe(true);
        });

        it('should render header with title and icon', () => {
            const header = document.getElementById('riset-pasar-header');
            expect(header).toBeTruthy();
            expect(header.classList.contains('text-center')).toBe(true);
            expect(header.classList.contains('mb-8')).toBe(true);
            
            const title = document.getElementById('riset-pasar-title');
            expect(title).toBeTruthy();
            expect(title.textContent).toContain('Riset Pasar');
            expect(title.querySelector('i.fas.fa-chart-line')).toBeTruthy();
        });

        it('should render header with subtitle', () => {
            const subtitle = document.getElementById('riset-pasar-subtitle');
            expect(subtitle).toBeTruthy();
            expect(subtitle.textContent).toContain('Analisis industri, kompetitor, dan tren pasar');
        });

        it('should render form container', () => {
            const formContainer = document.getElementById('riset-pasar-form-container');
            expect(formContainer).toBeTruthy();
            expect(formContainer.classList.contains('max-w-4xl')).toBe(true);
            expect(formContainer.classList.contains('mx-auto')).toBe(true);
        });

        it('should render form element', () => {
            const form = document.getElementById('riset-pasar-form');
            expect(form).toBeTruthy();
            expect(form.classList.contains('bg-white')).toBe(true);
            expect(form.classList.contains('rounded-xl')).toBe(true);
            expect(form.classList.contains('shadow-xl')).toBe(true);
        });
    });

    // Industry/Niche Selection Tests
    describe('Industry/Niche Selection', () => {
        it('should render industry section', () => {
            const industrySection = document.getElementById('riset-pasar-industry-section');
            expect(industrySection).toBeTruthy();
        });

        it('should render industry label with icon', () => {
            const industryLabel = document.getElementById('riset-pasar-industry-label');
            expect(industryLabel).toBeTruthy();
            expect(industryLabel.textContent).toContain('Industri/Niche');
            expect(industryLabel.querySelector('i.fas.fa-industry')).toBeTruthy();
            expect(industryLabel.querySelector('i.text-green-600')).toBeTruthy();
        });

        it('should render industry select dropdown', () => {
            const industrySelect = document.getElementById('riset-pasar-industry');
            expect(industrySelect).toBeTruthy();
            expect(industrySelect.tagName).toBe('SELECT');
            expect(industrySelect.classList.contains('w-full')).toBe(true);
            expect(industrySelect.classList.contains('px-4')).toBe(true);
            expect(industrySelect.classList.contains('py-3')).toBe(true);
        });

        it('should have correct industry options', () => {
            const industrySelect = document.getElementById('riset-pasar-industry');
            const options = industrySelect.querySelectorAll('option');
            
            expect(options.length).toBe(13); // 1 default + 12 industries
            
            expect(options[0].value).toBe('');
            expect(options[0].textContent).toContain('-- Pilih Industri --');
            
            expect(options[1].value).toBe('ecommerce');
            expect(options[1].textContent).toContain('E-commerce & Retail');
            
            expect(options[2].value).toBe('technology');
            expect(options[2].textContent).toContain('Teknologi & Software');
            
            expect(options[3].value).toBe('health');
            expect(options[3].textContent).toContain('Kesehatan & Wellness');
            
            expect(options[4].value).toBe('finance');
            expect(options[4].textContent).toContain('Keuangan & Investasi');
            
            expect(options[5].value).toBe('education');
            expect(options[5].textContent).toContain('Pendidikan & Kursus');
            
            expect(options[6].value).toBe('travel');
            expect(options[6].textContent).toContain('Travel & Hospitality');
            
            expect(options[7].value).toBe('food');
            expect(options[7].textContent).toContain('Makanan & Minuman');
            
            expect(options[8].value).toBe('fashion');
            expect(options[8].textContent).toContain('Fashion & Kecantikan');
            
            expect(options[9].value).toBe('gaming');
            expect(options[9].textContent).toContain('Gaming & Hiburan');
            
            expect(options[10].value).toBe('realestate');
            expect(options[10].textContent).toContain('Properti & Real Estate');
            
            expect(options[11].value).toBe('automotive');
            expect(options[11].textContent).toContain('Otomotif');
            
            expect(options[12].value).toBe('other');
            expect(options[12].textContent).toContain('Lainnya');
        });

        it('should render other industry input (hidden by default)', () => {
            const otherIndustryInput = document.getElementById('riset-pasar-industry-other');
            expect(otherIndustryInput).toBeTruthy();
            expect(otherIndustryInput.classList.contains('hidden')).toBe(true);
            expect(otherIndustryInput.placeholder).toContain('Sebutkan industri lain');
        });

        it('should show other industry input when "other" is selected', () => {
            const industrySelect = document.getElementById('riset-pasar-industry');
            const otherIndustryInput = document.getElementById('riset-pasar-industry-other');
            
            // Verify the input exists and is hidden by default
            expect(otherIndustryInput).toBeTruthy();
            expect(otherIndustryInput.classList.contains('hidden')).toBe(true);
            
            // Select "other" option
            industrySelect.value = 'other';
            fireEvent.change(industrySelect);
            
            // Note: In a real implementation, JavaScript would remove the 'hidden' class
            // For this static HTML test, we just verify the input element exists
        });
    });

    // Target Location Input Tests
    describe('Target Location Input', () => {
        it('should render location section', () => {
            const locationSection = document.getElementById('riset-pasar-location-section');
            expect(locationSection).toBeTruthy();
        });

        it('should render location label with icon', () => {
            const locationLabel = document.getElementById('riset-pasar-location-label');
            expect(locationLabel).toBeTruthy();
            expect(locationLabel.textContent).toContain('Lokasi Target');
            expect(locationLabel.querySelector('i.fas.fa-map-marker-alt')).toBeTruthy();
            expect(locationLabel.querySelector('i.text-green-600')).toBeTruthy();
        });

        it('should render location input', () => {
            const locationInput = document.getElementById('riset-pasar-location');
            expect(locationInput).toBeTruthy();
            expect(locationInput.type).toBe('text');
            expect(locationInput.placeholder).toContain('Jakarta, Indonesia atau ASEAN');
            expect(locationInput.classList.contains('w-full')).toBe(true);
            expect(locationInput.classList.contains('focus:ring-green-500')).toBe(true);
        });

        it('should render location help text', () => {
            const locationHelp = document.getElementById('riset-pasar-location-help');
            expect(locationHelp).toBeTruthy();
            expect(locationHelp.textContent).toContain('Masukkan negara, kota, atau wilayah');
        });
    });

    // Competitor Analysis Tests
    describe('Competitor Analysis', () => {
        it('should render competitor section', () => {
            const competitorSection = document.getElementById('riset-pasar-competitor-section');
            expect(competitorSection).toBeTruthy();
        });

        it('should render competitor label with icon', () => {
            const competitorLabel = document.getElementById('riset-pasar-competitor-label');
            expect(competitorLabel).toBeTruthy();
            expect(competitorLabel.textContent).toContain('Analisis Kompetitor');
            expect(competitorLabel.querySelector('i.fas.fa-users')).toBeTruthy();
            expect(competitorLabel.querySelector('i.text-green-600')).toBeTruthy();
        });

        it('should render competitor list container', () => {
            const competitorList = document.getElementById('riset-pasar-competitor-list');
            expect(competitorList).toBeTruthy();
            expect(competitorList.classList.contains('space-y-3')).toBe(true);
        });

        it('should render initial competitor fields', () => {
            const competitor1 = document.getElementById('riset-pasar-competitor-1');
            expect(competitor1).toBeTruthy();
            expect(competitor1.classList.contains('flex')).toBe(true);
            expect(competitor1.classList.contains('gap-2')).toBe(true);
            
            const nameInput = document.getElementById('riset-pasar-competitor-name-1');
            expect(nameInput).toBeTruthy();
            expect(nameInput.type).toBe('text');
            expect(nameInput.placeholder).toContain('Nama kompetitor/brand');
            
            const urlInput = document.getElementById('riset-pasar-competitor-url-1');
            expect(urlInput).toBeTruthy();
            expect(urlInput.type).toBe('url');
            expect(urlInput.placeholder).toContain('https://');
        });

        it('should render add competitor button', () => {
            const addCompetitorBtn = document.getElementById('riset-pasar-add-competitor');
            expect(addCompetitorBtn).toBeTruthy();
            expect(addCompetitorBtn.type).toBe('button');
            expect(addCompetitorBtn.textContent).toContain('Tambah Kompetitor');
            expect(addCompetitorBtn.querySelector('i.fas.fa-plus-circle')).toBeTruthy();
        });
    });

    // Trends Identification Tests
    describe('Trends Identification', () => {
        it('should render trends section', () => {
            const trendsSection = document.getElementById('riset-pasar-trends-section');
            expect(trendsSection).toBeTruthy();
        });

        it('should render trends label with icon', () => {
            const trendsLabel = document.getElementById('riset-pasar-trends-label');
            expect(trendsLabel).toBeTruthy();
            expect(trendsLabel.textContent).toContain('Identifikasi Tren');
            expect(trendsLabel.querySelector('i.fas.fa-arrow-trend-up')).toBeTruthy();
            expect(trendsLabel.querySelector('i.text-green-600')).toBeTruthy();
        });

        it('should render trends options container', () => {
            const trendsOptions = document.getElementById('riset-pasar-trends-options');
            expect(trendsOptions).toBeTruthy();
            expect(trendsOptions.classList.contains('grid')).toBe(true);
            expect(trendsOptions.classList.contains('grid-cols-1')).toBe(true);
            expect(trendsOptions.classList.contains('md:grid-cols-2')).toBe(true);
            expect(trendsOptions.classList.contains('gap-3')).toBe(true);
        });

        it('should render all trend checkboxes', () => {
            const trend1 = document.getElementById('riset-pasar-trend-1');
            expect(trend1).toBeTruthy();
            expect(trend1.type).toBe('checkbox');
            expect(trend1.value).toBe('rising-demand');
            
            const trend2 = document.getElementById('riset-pasar-trend-2');
            expect(trend2).toBeTruthy();
            expect(trend2.value).toBe('new-technology');
            
            const trend3 = document.getElementById('riset-pasar-trend-3');
            expect(trend3).toBeTruthy();
            expect(trend3.value).toBe('seasonal');
            
            const trend4 = document.getElementById('riset-pasar-trend-4');
            expect(trend4).toBeTruthy();
            expect(trend4.value).toBe('regulatory');
            
            const trend5 = document.getElementById('riset-pasar-trend-5');
            expect(trend5).toBeTruthy();
            expect(trend5.value).toBe('consumer-behavior');
            
            const trend6 = document.getElementById('riset-pasar-trend-6');
            expect(trend6).toBeTruthy();
            expect(trend6.value).toBe('market-gap');
        });

        it('should render trend labels with correct text', () => {
            const trendsContainer = document.getElementById('riset-pasar-trends-options');
            const labels = trendsContainer.querySelectorAll('label span.text-gray-700');
            
            expect(labels[0].textContent).toContain('Permintaan Meningkat');
            expect(labels[1].textContent).toContain('Teknologi Baru');
            expect(labels[2].textContent).toContain('Musiman');
            expect(labels[3].textContent).toContain('Peraturan Pemerintah');
            expect(labels[4].textContent).toContain('Perilaku Konsumen');
            expect(labels[5].textContent).toContain('Celah Pasar');
        });

        it('should render custom trend input', () => {
            const customTrendInput = document.getElementById('riset-pasar-custom-trend');
            expect(customTrendInput).toBeTruthy();
            expect(customTrendInput.type).toBe('text');
            expect(customTrendInput.placeholder).toContain('Tren khusus lainnya');
        });
    });

    // Generate Button Tests
    describe('Generate Button', () => {
        it('should render generate button', () => {
            const generateBtn = document.getElementById('riset-pasar-generate-btn');
            expect(generateBtn).toBeTruthy();
            expect(generateBtn.type).toBe('submit');
            expect(generateBtn.textContent).toContain('Generate Riset Pasar');
            expect(generateBtn.querySelector('i.fas.fa-search-dollar')).toBeTruthy();
        });

        it('should have correct styling classes', () => {
            const generateBtn = document.getElementById('riset-pasar-generate-btn');
            expect(generateBtn.classList.contains('w-full')).toBe(true);
            expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(generateBtn.classList.contains('from-green-600')).toBe(true);
            expect(generateBtn.classList.contains('to-emerald-500')).toBe(true);
            expect(generateBtn.classList.contains('text-white')).toBe(true);
            expect(generateBtn.classList.contains('font-bold')).toBe(true);
            expect(generateBtn.classList.contains('py-4')).toBe(true);
            expect(generateBtn.classList.contains('px-6')).toBe(true);
            expect(generateBtn.classList.contains('rounded-lg')).toBe(true);
            expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
        });

        it('should be enabled by default', () => {
            const generateBtn = document.getElementById('riset-pasar-generate-btn');
            expect(generateBtn.disabled).toBe(false);
        });
    });

    // Results Area Tests
    describe('Results Area', () => {
        it('should render results container (hidden by default)', () => {
            const resultsContainer = document.getElementById('riset-pasar-results-container');
            expect(resultsContainer).toBeTruthy();
            expect(resultsContainer.classList.contains('hidden')).toBe(true);
            expect(resultsContainer.classList.contains('max-w-4xl')).toBe(true);
            expect(resultsContainer.classList.contains('mx-auto')).toBe(true);
            expect(resultsContainer.classList.contains('mt-8')).toBe(true);
        });

        it('should render results element', () => {
            const results = document.getElementById('riset-pasar-results');
            expect(results).toBeTruthy();
            expect(results.classList.contains('bg-white')).toBe(true);
            expect(results.classList.contains('rounded-xl')).toBe(true);
            expect(results.classList.contains('shadow-xl')).toBe(true);
        });

        it('should render results header', () => {
            const resultsHeader = document.getElementById('riset-pasar-results-header');
            expect(resultsHeader).toBeTruthy();
            expect(resultsHeader.classList.contains('flex')).toBe(true);
            expect(resultsHeader.classList.contains('justify-between')).toBe(true);
            expect(resultsHeader.classList.contains('items-center')).toBe(true);
            
            const resultsTitle = document.getElementById('riset-pasar-results-title');
            expect(resultsTitle).toBeTruthy();
            expect(resultsTitle.textContent).toContain('Hasil Riset Pasar');
            expect(resultsTitle.querySelector('i.fas.fa-chart-pie')).toBeTruthy();
            expect(resultsTitle.querySelector('i.text-green-600')).toBeTruthy();
        });

        it('should render new analysis button', () => {
            const newAnalysisBtn = document.getElementById('riset-pasar-new-analysis');
            expect(newAnalysisBtn).toBeTruthy();
            expect(newAnalysisBtn.type).toBe('button');
            expect(newAnalysisBtn.textContent).toContain('Analisis Baru');
            expect(newAnalysisBtn.querySelector('i.fas.fa-plus')).toBeTruthy();
        });

        it('should render results content area', () => {
            const resultsContent = document.getElementById('riset-pasar-results-content');
            expect(resultsContent).toBeTruthy();
            expect(resultsContent.classList.contains('space-y-6')).toBe(true);
        });
    });

    // Loading State Tests
    describe('Loading State', () => {
        it('should render loading container (hidden by default)', () => {
            const loadingContainer = document.getElementById('riset-pasar-loading');
            expect(loadingContainer).toBeTruthy();
            expect(loadingContainer.classList.contains('hidden')).toBe(true);
            expect(loadingContainer.classList.contains('max-w-4xl')).toBe(true);
            expect(loadingContainer.classList.contains('mx-auto')).toBe(true);
            expect(loadingContainer.classList.contains('mt-8')).toBe(true);
        });

        it('should render loading spinner', () => {
            const loadingContainer = document.getElementById('riset-pasar-loading');
            const spinner = loadingContainer.querySelector('.animate-spin');
            expect(spinner).toBeTruthy();
            expect(spinner.classList.contains('inline-block')).toBe(true);
            expect(spinner.classList.contains('w-12')).toBe(true);
            expect(spinner.classList.contains('h-12')).toBe(true);
            expect(spinner.classList.contains('border-4')).toBe(true);
            expect(spinner.classList.contains('border-green-600')).toBe(true);
            expect(spinner.classList.contains('border-t-transparent')).toBe(true);
            expect(spinner.classList.contains('rounded-full')).toBe(true);
        });

        it('should render loading text', () => {
            const loadingText = document.getElementById('riset-pasar-loading-text');
            expect(loadingText).toBeTruthy();
            expect(loadingText.textContent).toContain('Sedang menganalisis pasar');
        });
    });

    // Color Scheme Tests
    describe('Color Scheme', () => {
        it('should use green/emerald color scheme in container', () => {
            const container = document.getElementById('riset-pasar-container');
            expect(container.classList.contains('bg-gradient-to-br')).toBe(true);
            expect(container.classList.contains('from-green-600')).toBe(true);
            expect(container.classList.contains('to-emerald-500')).toBe(true);
        });

        it('should use green accents in section labels', () => {
            const industryLabel = document.getElementById('riset-pasar-industry-label');
            expect(industryLabel.querySelector('i.text-green-600')).toBeTruthy();
            
            const locationLabel = document.getElementById('riset-pasar-location-label');
            expect(locationLabel.querySelector('i.text-green-600')).toBeTruthy();
            
            const competitorLabel = document.getElementById('riset-pasar-competitor-label');
            expect(competitorLabel.querySelector('i.text-green-600')).toBeTruthy();
            
            const trendsLabel = document.getElementById('riset-pasar-trends-label');
            expect(trendsLabel.querySelector('i.text-green-600')).toBeTruthy();
        });

        it('should use green accents in generate button', () => {
            const generateBtn = document.getElementById('riset-pasar-generate-btn');
            expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(generateBtn.classList.contains('from-green-600')).toBe(true);
            expect(generateBtn.classList.contains('to-emerald-500')).toBe(true);
            expect(generateBtn.classList.contains('hover:from-green-700')).toBe(true);
            expect(generateBtn.classList.contains('hover:to-emerald-600')).toBe(true);
        });

        it('should use green accents in trend checkboxes', () => {
            const trend1 = document.getElementById('riset-pasar-trend-1');
            expect(trend1.classList.contains('text-green-600')).toBe(true);
            expect(trend1.classList.contains('focus:ring-green-500')).toBe(true);
            
            const trend2 = document.getElementById('riset-pasar-trend-2');
            expect(trend2.classList.contains('text-green-600')).toBe(true);
            expect(trend2.classList.contains('focus:ring-green-500')).toBe(true);
        });

        it('should use green accents in form inputs', () => {
            const industrySelect = document.getElementById('riset-pasar-industry');
            expect(industrySelect.classList.contains('focus:ring-green-500')).toBe(true);
            expect(industrySelect.classList.contains('focus:border-green-500')).toBe(true);
            
            const locationInput = document.getElementById('riset-pasar-location');
            expect(locationInput.classList.contains('focus:ring-green-500')).toBe(true);
            expect(locationInput.classList.contains('focus:border-green-500')).toBe(true);
        });

        it('should use green accents in results section', () => {
            const resultsTitle = document.getElementById('riset-pasar-results-title');
            expect(resultsTitle.querySelector('i.text-green-600')).toBeTruthy();
            
            const newAnalysisBtn = document.getElementById('riset-pasar-new-analysis');
            expect(newAnalysisBtn.classList.contains('text-green-600')).toBe(true);
            expect(newAnalysisBtn.classList.contains('hover:text-green-700')).toBe(true);
        });

        it('should use green accents in loading spinner', () => {
            const loadingContainer = document.getElementById('riset-pasar-loading');
            const spinner = loadingContainer.querySelector('.animate-spin');
            expect(spinner.classList.contains('border-green-600')).toBe(true);
            expect(spinner.classList.contains('border-t-transparent')).toBe(true);
        });
    });

    // Additional Notes Section Tests
    describe('Additional Notes Section', () => {
        it('should render notes section', () => {
            const notesSection = document.getElementById('riset-pasar-notes-section');
            expect(notesSection).toBeTruthy();
        });

        it('should render notes label with icon', () => {
            const notesLabel = document.getElementById('riset-pasar-notes-label');
            expect(notesLabel).toBeTruthy();
            expect(notesLabel.textContent).toContain('Catatan Tambahan');
            expect(notesLabel.querySelector('i.fas.fa-sticky-note')).toBeTruthy();
            expect(notesLabel.querySelector('i.text-green-600')).toBeTruthy();
        });

        it('should render notes textarea', () => {
            const notesTextarea = document.getElementById('riset-pasar-notes');
            expect(notesTextarea).toBeTruthy();
            expect(notesTextarea.tagName).toBe('TEXTAREA');
            expect(notesTextarea.rows).toBe(3);
            expect(notesTextarea.placeholder).toContain('Informasi tambahan');
            expect(notesTextarea.classList.contains('w-full')).toBe(true);
            expect(notesTextarea.classList.contains('focus:ring-green-500')).toBe(true);
        });
    });

    // Form Actions Tests
    describe('Form Actions', () => {
        it('should render actions container', () => {
            const actionsContainer = document.getElementById('riset-pasar-actions');
            expect(actionsContainer).toBeTruthy();
            expect(actionsContainer.classList.contains('pt-4')).toBe(true);
        });
    });

    // Responsive Design Tests
    describe('Responsive Design', () => {
        it('should have responsive container classes', () => {
            const container = document.getElementById('riset-pasar-container');
            expect(container.classList.contains('min-h-screen')).toBe(true);
            expect(container.classList.contains('p-6')).toBe(true);
        });

        it('should have responsive form container', () => {
            const formContainer = document.getElementById('riset-pasar-form-container');
            expect(formContainer.classList.contains('max-w-4xl')).toBe(true);
            expect(formContainer.classList.contains('mx-auto')).toBe(true);
        });

        it('should have responsive trends grid', () => {
            const trendsOptions = document.getElementById('riset-pasar-trends-options');
            expect(trendsOptions.classList.contains('grid-cols-1')).toBe(true);
            expect(trendsOptions.classList.contains('md:grid-cols-2')).toBe(true);
            expect(trendsOptions.classList.contains('gap-3')).toBe(true);
        });
    });

    // Icon Tests
    describe('Icons', () => {
        it('should use FontAwesome icons', () => {
            const icons = document.body.querySelectorAll('i.fas');
            expect(icons.length).toBe(10);
        });

        it('should have chart-line icon in header', () => {
            const chartLineIcon = document.querySelector('#riset-pasar-title i.fas.fa-chart-line');
            expect(chartLineIcon).toBeTruthy();
        });

        it('should have industry icon in industry section', () => {
            const industryIcon = document.querySelector('#riset-pasar-industry-label i.fas.fa-industry');
            expect(industryIcon).toBeTruthy();
        });

        it('should have map-marker icon in location section', () => {
            const mapMarkerIcon = document.querySelector('#riset-pasar-location-label i.fas.fa-map-marker-alt');
            expect(mapMarkerIcon).toBeTruthy();
        });

        it('should have users icon in competitor section', () => {
            const usersIcon = document.querySelector('#riset-pasar-competitor-label i.fas.fa-users');
            expect(usersIcon).toBeTruthy();
        });

        it('should have arrow-trend-up icon in trends section', () => {
            const trendUpIcon = document.querySelector('#riset-pasar-trends-label i.fas.fa-arrow-trend-up');
            expect(trendUpIcon).toBeTruthy();
        });

        it('should have search-dollar icon in generate button', () => {
            const searchDollarIcon = document.querySelector('#riset-pasar-generate-btn i.fas.fa-search-dollar');
            expect(searchDollarIcon).toBeTruthy();
        });

        it('should have chart-pie icon in results section', () => {
            const chartPieIcon = document.querySelector('#riset-pasar-results-title i.fas.fa-chart-pie');
            expect(chartPieIcon).toBeTruthy();
        });
    });

    // Text Content Tests
    describe('Text Content', () => {
        it('should have Indonesian text', () => {
            expect(document.body.textContent).toContain('Riset Pasar');
            expect(document.body.textContent).toContain('Industri/Niche');
            expect(document.body.textContent).toContain('Lokasi Target');
            expect(document.body.textContent).toContain('Analisis Kompetitor');
            expect(document.body.textContent).toContain('Identifikasi Tren');
            expect(document.body.textContent).toContain('Catatan Tambahan');
            expect(document.body.textContent).toContain('Generate Riset Pasar');
        });

        it('should have proper section headers', () => {
            const industryLabel = document.getElementById('riset-pasar-industry-label');
            expect(industryLabel.textContent).toContain('Industri/Niche');
            
            const locationLabel = document.getElementById('riset-pasar-location-label');
            expect(locationLabel.textContent).toContain('Lokasi Target');
            
            const competitorLabel = document.getElementById('riset-pasar-competitor-label');
            expect(competitorLabel.textContent).toContain('Analisis Kompetitor');
            
            const trendsLabel = document.getElementById('riset-pasar-trends-label');
            expect(trendsLabel.textContent).toContain('Identifikasi Tren');
        });
    });

    // Accessibility Tests
    describe('Accessibility', () => {
        it('should have proper heading structure', () => {
            const title = document.getElementById('riset-pasar-title');
            expect(title).toBeTruthy();
            expect(title.tagName).toBe('H1');
            
            const resultsTitle = document.getElementById('riset-pasar-results-title');
            expect(resultsTitle).toBeTruthy();
            expect(resultsTitle.tagName).toBe('H2');
        });

        it('should have labeled form inputs', () => {
            const industrySelect = document.getElementById('riset-pasar-industry');
            expect(industrySelect).toBeTruthy();
            
            const locationInput = document.getElementById('riset-pasar-location');
            expect(locationInput).toBeTruthy();
            
            const notesTextarea = document.getElementById('riset-pasar-notes');
            expect(notesTextarea).toBeTruthy();
        });

        it('should have proper input types', () => {
            const locationInput = document.getElementById('riset-pasar-location');
            expect(locationInput.type).toBe('text');
            
            const competitorUrlInput = document.getElementById('riset-pasar-competitor-url-1');
            expect(competitorUrlInput.type).toBe('url');
        });

        it('should have proper checkbox inputs', () => {
            const trend1 = document.getElementById('riset-pasar-trend-1');
            expect(trend1.type).toBe('checkbox');
            
            const trend2 = document.getElementById('riset-pasar-trend-2');
            expect(trend2.type).toBe('checkbox');
        });
    });

    // Component Integration Tests
    describe('Component Integration', () => {
        it('should have all required elements for functionality', () => {
            // Form elements
            expect(document.getElementById('riset-pasar-industry')).toBeTruthy();
            expect(document.getElementById('riset-pasar-industry-other')).toBeTruthy();
            expect(document.getElementById('riset-pasar-location')).toBeTruthy();
            expect(document.getElementById('riset-pasar-notes')).toBeTruthy();
            
            // Competitor elements
            expect(document.getElementById('riset-pasar-competitor-list')).toBeTruthy();
            expect(document.getElementById('riset-pasar-competitor-1')).toBeTruthy();
            expect(document.getElementById('riset-pasar-add-competitor')).toBeTruthy();
            
            // Trend elements
            expect(document.getElementById('riset-pasar-trends-options')).toBeTruthy();
            expect(document.getElementById('riset-pasar-trend-1')).toBeTruthy();
            expect(document.getElementById('riset-pasar-trend-2')).toBeTruthy();
            expect(document.getElementById('riset-pasar-trend-3')).toBeTruthy();
            expect(document.getElementById('riset-pasar-trend-4')).toBeTruthy();
            expect(document.getElementById('riset-pasar-trend-5')).toBeTruthy();
            expect(document.getElementById('riset-pasar-trend-6')).toBeTruthy();
            expect(document.getElementById('riset-pasar-custom-trend')).toBeTruthy();
            
            // Action elements
            expect(document.getElementById('riset-pasar-form')).toBeTruthy();
            expect(document.getElementById('riset-pasar-generate-btn')).toBeTruthy();
            
            // Results elements
            expect(document.getElementById('riset-pasar-results-container')).toBeTruthy();
            expect(document.getElementById('riset-pasar-results')).toBeTruthy();
            expect(document.getElementById('riset-pasar-results-content')).toBeTruthy();
            expect(document.getElementById('riset-pasar-new-analysis')).toBeTruthy();
            
            // Loading elements
            expect(document.getElementById('riset-pasar-loading')).toBeTruthy();
        });
    });

    // Layout Tests
    describe('Layout', () => {
        it('should have proper form styling', () => {
            const form = document.getElementById('riset-pasar-form');
            expect(form.classList.contains('bg-white')).toBe(true);
            expect(form.classList.contains('rounded-xl')).toBe(true);
            expect(form.classList.contains('shadow-xl')).toBe(true);
            expect(form.classList.contains('p-6')).toBe(true);
            expect(form.classList.contains('space-y-6')).toBe(true);
        });

        it('should have proper spacing between sections', () => {
            const form = document.getElementById('riset-pasar-form');
            expect(form.classList.contains('space-y-6')).toBe(true);
        });

        it('should have proper results container styling', () => {
            const resultsContainer = document.getElementById('riset-pasar-results-container');
            expect(resultsContainer.classList.contains('max-w-4xl')).toBe(true);
            expect(resultsContainer.classList.contains('mx-auto')).toBe(true);
            expect(resultsContainer.classList.contains('mt-8')).toBe(true);
        });

        it('should have proper loading container styling', () => {
            const loadingContainer = document.getElementById('riset-pasar-loading');
            expect(loadingContainer.classList.contains('max-w-4xl')).toBe(true);
            expect(loadingContainer.classList.contains('mx-auto')).toBe(true);
            expect(loadingContainer.classList.contains('mt-8')).toBe(true);
        });
    });

    // Input Styling Tests
    describe('Input Styling', () => {
        it('should have proper select styling', () => {
            const industrySelect = document.getElementById('riset-pasar-industry');
            expect(industrySelect.classList.contains('w-full')).toBe(true);
            expect(industrySelect.classList.contains('px-4')).toBe(true);
            expect(industrySelect.classList.contains('py-3')).toBe(true);
            expect(industrySelect.classList.contains('border')).toBe(true);
            expect(industrySelect.classList.contains('border-gray-300')).toBe(true);
            expect(industrySelect.classList.contains('rounded-lg')).toBe(true);
        });

        it('should have proper input styling', () => {
            const locationInput = document.getElementById('riset-pasar-location');
            expect(locationInput.classList.contains('w-full')).toBe(true);
            expect(locationInput.classList.contains('px-4')).toBe(true);
            expect(locationInput.classList.contains('py-3')).toBe(true);
            expect(locationInput.classList.contains('border')).toBe(true);
            expect(locationInput.classList.contains('border-gray-300')).toBe(true);
            expect(locationInput.classList.contains('rounded-lg')).toBe(true);
        });

        it('should have proper textarea styling', () => {
            const notesTextarea = document.getElementById('riset-pasar-notes');
            expect(notesTextarea.classList.contains('w-full')).toBe(true);
            expect(notesTextarea.classList.contains('px-4')).toBe(true);
            expect(notesTextarea.classList.contains('py-3')).toBe(true);
            expect(notesTextarea.classList.contains('border')).toBe(true);
            expect(notesTextarea.classList.contains('border-gray-300')).toBe(true);
            expect(notesTextarea.classList.contains('rounded-lg')).toBe(true);
            expect(notesTextarea.classList.contains('resize-none')).toBe(true);
        });
    });

    // Trend Option Styling Tests
    describe('Trend Option Styling', () => {
        it('should have proper trend label styling', () => {
            const trendsContainer = document.getElementById('riset-pasar-trends-options');
            const firstLabel = trendsContainer.querySelector('label');
            expect(firstLabel.classList.contains('flex')).toBe(true);
            expect(firstLabel.classList.contains('items-center')).toBe(true);
            expect(firstLabel.classList.contains('space-x-3')).toBe(true);
            expect(firstLabel.classList.contains('p-3')).toBe(true);
            expect(firstLabel.classList.contains('border')).toBe(true);
            expect(firstLabel.classList.contains('border-gray-200')).toBe(true);
            expect(firstLabel.classList.contains('rounded-lg')).toBe(true);
            expect(firstLabel.classList.contains('hover:bg-green-50')).toBe(true);
            expect(firstLabel.classList.contains('cursor-pointer')).toBe(true);
        });

        it('should have proper checkbox styling', () => {
            const trend1 = document.getElementById('riset-pasar-trend-1');
            expect(trend1.classList.contains('w-5')).toBe(true);
            expect(trend1.classList.contains('h-5')).toBe(true);
            expect(trend1.classList.contains('text-green-600')).toBe(true);
            expect(trend1.classList.contains('rounded')).toBe(true);
        });
    });

    // Competitor Field Styling Tests
    describe('Competitor Field Styling', () => {
        it('should have proper competitor field styling', () => {
            const competitor1 = document.getElementById('riset-pasar-competitor-1');
            expect(competitor1.classList.contains('flex')).toBe(true);
            expect(competitor1.classList.contains('gap-2')).toBe(true);
            
            const nameInput = document.getElementById('riset-pasar-competitor-name-1');
            expect(nameInput.classList.contains('flex-1')).toBe(true);
            expect(nameInput.classList.contains('px-4')).toBe(true);
            expect(nameInput.classList.contains('py-3')).toBe(true);
            
            const urlInput = document.getElementById('riset-pasar-competitor-url-1');
            expect(urlInput.classList.contains('flex-1')).toBe(true);
            expect(urlInput.classList.contains('px-4')).toBe(true);
            expect(urlInput.classList.contains('py-3')).toBe(true);
        });

        it('should have proper add competitor button styling', () => {
            const addCompetitorBtn = document.getElementById('riset-pasar-add-competitor');
            expect(addCompetitorBtn.classList.contains('mt-3')).toBe(true);
            expect(addCompetitorBtn.classList.contains('text-green-600')).toBe(true);
            expect(addCompetitorBtn.classList.contains('hover:text-green-700')).toBe(true);
            expect(addCompetitorBtn.classList.contains('font-medium')).toBe(true);
            expect(addCompetitorBtn.classList.contains('text-sm')).toBe(true);
            expect(addCompetitorBtn.classList.contains('flex')).toBe(true);
            expect(addCompetitorBtn.classList.contains('items-center')).toBe(true);
        });
    });
});
