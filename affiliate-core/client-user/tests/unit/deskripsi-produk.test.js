import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock showToast globally
window.showToast = vi.fn();

// Mock clipboard API
navigator.clipboard = {
    writeText: vi.fn().mockResolvedValue()
};

describe('deskripsi-produk Component', () => {
    
    const mockComponentHTML = `
        <div id="deskripsi-produk-container" class="w-full max-w-4xl mx-auto p-6">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                    <i class="fas fa-box-open text-white text-2xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Deskripsi Produk</h2>
                <p class="text-gray-600">Buat deskripsi produk yang menarik dan persuasif</p>
            </div>

            <!-- Form Container -->
            <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <!-- Product Category Selection -->
                <div class="mb-6">
                    <label for="deskripsi-produk-kategori" class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-tag mr-2 text-pink-500"></i>Kategori Produk
                    </label>
                    <select id="deskripsi-produk-kategori" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-white">
                        <option value="">Pilih kategori produk...</option>
                        <option value="fashion">Fashion & Pakaian</option>
                        <option value="beauty">Beauty & Skincare</option>
                        <option value="elektronik">Elektronik & Gadget</option>
                        <option value="rumah">Rumah & Dapur</option>
                        <option value="kesehatan">Kesehatan & Fitness</option>
                        <option value="makanan">Makanan & Minuman</option>
                        <option value="otomotif">Otomotif</option>
                        <option value="lainnya">Lainnya</option>
                    </select>
                </div>

                <!-- Product Name Input -->
                <div class="mb-6">
                    <label for="deskripsi-produk-nama" class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-box mr-2 text-pink-500"></i>Nama Produk
                    </label>
                    <input 
                        type="text" 
                        id="deskripsi-produk-nama" 
                        placeholder="Masukkan nama produk Anda..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    >
                </div>

                <!-- Key Features Input -->
                <div class="mb-6">
                    <label for="deskripsi-produk-fitur" class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-star mr-2 text-pink-500"></i>Fitur Utama Produk
                    </label>
                    <textarea 
                        id="deskripsi-produk-fitur" 
                        rows="4"
                        placeholder="Masukkan fitur utama produk (pisahkan dengan baris baru):&#10;- Bahan berkualitas tinggi&#10;- Desain modern&#10;- Tahan lama"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-y"
                    ></textarea>
                    <p class="text-xs text-gray-500 mt-1">Satu fitur per baris, maksimal 5 fitur</p>
                </div>

                <!-- Target Audience Selection -->
                <div class="mb-8">
                    <label for="deskripsi-produk-target" class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-users mr-2 text-pink-500"></i>Target Audiens
                    </label>
                    <select id="deskripsi-produk-target" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-white">
                        <option value="">Pilih target audiens...</option>
                        <option value="remaja">Remaja (15-24 tahun)</option>
                        <option value="dewasa-muda">Dewasa Muda (25-35 tahun)</option>
                        <option value="dewasa">Dewasa (36-50 tahun)</option>
                        <option value="orang-tua">Orang Tua (50+ tahun)</option>
                        <option value="profesional">Profesional</option>
                        <option value="mahasiswa">Mahasiswa</option>
                        <option value="ibu-rumah-tangga">Ibu Rumah Tangga</option>
                        <option value="semua">Semua Umur</option>
                    </select>
                </div>

                <!-- Generate Button -->
                <button 
                    id="deskripsi-produk-generate"
                    class="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <i class="fas fa-magic"></i>
                    <span>Generate Deskripsi Produk</span>
                </button>
            </div>

            <!-- Result Section (Hidden by default) -->
            <div id="deskripsi-produk-result" class="hidden mt-8">
                <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-file-alt mr-2 text-pink-500"></i>Hasil Deskripsi Produk
                        </h3>
                        <button 
                            id="deskripsi-produk-copy"
                            class="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors flex items-center gap-2"
                        >
                            <i class="fas fa-copy"></i>
                            <span>Salin</span>
                        </button>
                    </div>
                    <div id="deskripsi-produk-output" class="prose prose-pink max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <!-- Generated content will appear here -->
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div id="deskripsi-produk-loading" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl p-8 flex flex-col items-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mb-4"></div>
                    <p class="text-gray-600">Sedang membuat deskripsi produk...</p>
                </div>
            </div>
        </div>
    `;

    beforeEach(() => {
        document.body.innerHTML = mockComponentHTML;
        // Reset toast mock
        window.showToast = vi.fn();
        // Reset clipboard mock
        navigator.clipboard.writeText = vi.fn().mockResolvedValue();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    // Component Structure Tests
    describe('Component Structure', () => {
        it('should render main container with correct ID', () => {
            const container = document.getElementById('deskripsi-produk-container');
            expect(container).toBeTruthy();
            expect(container.classList.contains('w-full')).toBe(true);
            expect(container.classList.contains('max-w-4xl')).toBe(true);
            expect(container.classList.contains('mx-auto')).toBe(true);
        });

        it('should render header with title and icon', () => {
            const header = document.body.querySelector('.text-center');
            expect(header).toBeTruthy();
            
            const iconContainer = header.querySelector('.rounded-full');
            expect(iconContainer).toBeTruthy();
            expect(iconContainer.classList.contains('bg-gradient-to-br')).toBe(true);
            expect(iconContainer.classList.contains('from-pink-500')).toBe(true);
            expect(iconContainer.classList.contains('to-rose-500')).toBe(true);
            
            const icon = iconContainer.querySelector('i.fas.fa-box-open');
            expect(icon).toBeTruthy();
            expect(icon.classList.contains('text-white')).toBe(true);
        });

        it('should render header with title', () => {
            const title = document.body.querySelector('h2');
            expect(title).toBeTruthy();
            expect(title.textContent).toContain('Deskripsi Produk');
            expect(title.classList.contains('text-3xl')).toBe(true);
            expect(title.classList.contains('font-bold')).toBe(true);
        });

        it('should render header with subtitle', () => {
            const subtitle = document.body.querySelector('.text-center p');
            expect(subtitle).toBeTruthy();
            expect(subtitle.textContent).toContain('Buat deskripsi produk yang menarik dan persuasif');
        });

        it('should render form container', () => {
            const formContainer = document.body.querySelector('.bg-white.rounded-2xl');
            expect(formContainer).toBeTruthy();
            expect(formContainer.classList.contains('shadow-lg')).toBe(true);
        });
    });

    // Product Category Selection Tests
    describe('Product Category Selection', () => {
        it('should render category select element', () => {
            const categorySelect = document.getElementById('deskripsi-produk-kategori');
            expect(categorySelect).toBeTruthy();
            expect(categorySelect.tagName).toBe('SELECT');
        });

        it('should have correct placeholder option', () => {
            const categorySelect = document.getElementById('deskripsi-produk-kategori');
            const firstOption = categorySelect.querySelector('option');
            expect(firstOption).toBeTruthy();
            expect(firstOption.value).toBe('');
            expect(firstOption.textContent).toContain('Pilih kategori produk...');
        });

        it('should have all category options', () => {
            const categorySelect = document.getElementById('deskripsi-produk-kategori');
            const options = categorySelect.querySelectorAll('option');
            expect(options.length).toBe(9); // 1 placeholder + 8 categories
            
            expect(options[1].value).toBe('fashion');
            expect(options[1].textContent).toContain('Fashion & Pakaian');
            
            expect(options[2].value).toBe('beauty');
            expect(options[2].textContent).toContain('Beauty & Skincare');
            
            expect(options[3].value).toBe('elektronik');
            expect(options[3].textContent).toContain('Elektronik & Gadget');
            
            expect(options[4].value).toBe('rumah');
            expect(options[4].textContent).toContain('Rumah & Dapur');
            
            expect(options[5].value).toBe('kesehatan');
            expect(options[5].textContent).toContain('Kesehatan & Fitness');
            
            expect(options[6].value).toBe('makanan');
            expect(options[6].textContent).toContain('Makanan & Minuman');
            
            expect(options[7].value).toBe('otomotif');
            expect(options[7].textContent).toContain('Otomotif');
            
            expect(options[8].value).toBe('lainnya');
            expect(options[8].textContent).toContain('Lainnya');
        });

        it('should have category label with icon', () => {
            const categoryLabel = document.querySelector('label[for="deskripsi-produk-kategori"]');
            expect(categoryLabel).toBeTruthy();
            expect(categoryLabel.textContent).toContain('Kategori Produk');
            expect(categoryLabel.querySelector('i.fas.fa-tag')).toBeTruthy();
            expect(categoryLabel.querySelector('i').classList.contains('text-pink-500')).toBe(true);
        });

        it('should have proper select styling', () => {
            const categorySelect = document.getElementById('deskripsi-produk-kategori');
            expect(categorySelect.classList.contains('w-full')).toBe(true);
            expect(categorySelect.classList.contains('px-4')).toBe(true);
            expect(categorySelect.classList.contains('py-3')).toBe(true);
            expect(categorySelect.classList.contains('border')).toBe(true);
            expect(categorySelect.classList.contains('rounded-lg')).toBe(true);
            expect(categorySelect.classList.contains('focus:ring-pink-500')).toBe(true);
            expect(categorySelect.classList.contains('bg-white')).toBe(true);
        });
    });

    // Product Name Input Tests
    describe('Product Name Input', () => {
        it('should render name input element', () => {
            const nameInput = document.getElementById('deskripsi-produk-nama');
            expect(nameInput).toBeTruthy();
            expect(nameInput.tagName).toBe('INPUT');
            expect(nameInput.type).toBe('text');
        });

        it('should have correct placeholder', () => {
            const nameInput = document.getElementById('deskripsi-produk-nama');
            expect(nameInput.placeholder).toContain('Masukkan nama produk Anda...');
        });

        it('should have name label with icon', () => {
            const nameLabel = document.querySelector('label[for="deskripsi-produk-nama"]');
            expect(nameLabel).toBeTruthy();
            expect(nameLabel.textContent).toContain('Nama Produk');
            expect(nameLabel.querySelector('i.fas.fa-box')).toBeTruthy();
            expect(nameLabel.querySelector('i').classList.contains('text-pink-500')).toBe(true);
        });

        it('should have proper input styling', () => {
            const nameInput = document.getElementById('deskripsi-produk-nama');
            expect(nameInput.classList.contains('w-full')).toBe(true);
            expect(nameInput.classList.contains('px-4')).toBe(true);
            expect(nameInput.classList.contains('py-3')).toBe(true);
            expect(nameInput.classList.contains('border')).toBe(true);
            expect(nameInput.classList.contains('rounded-lg')).toBe(true);
            expect(nameInput.classList.contains('focus:ring-pink-500')).toBe(true);
        });
    });

    // Key Features Input Tests
    describe('Key Features Input', () => {
        it('should render features textarea element', () => {
            const featuresTextarea = document.getElementById('deskripsi-produk-fitur');
            expect(featuresTextarea).toBeTruthy();
            expect(featuresTextarea.tagName).toBe('TEXTAREA');
        });

        it('should have correct number of rows', () => {
            const featuresTextarea = document.getElementById('deskripsi-produk-fitur');
            expect(featuresTextarea.rows).toBe(4);
        });

        it('should have correct placeholder', () => {
            const featuresTextarea = document.getElementById('deskripsi-produk-fitur');
            expect(featuresTextarea.placeholder).toContain('Masukkan fitur utama produk');
            expect(featuresTextarea.placeholder).toContain('pisahkan dengan baris baru');
        });

        it('should have features label with icon', () => {
            const featuresLabel = document.querySelector('label[for="deskripsi-produk-fitur"]');
            expect(featuresLabel).toBeTruthy();
            expect(featuresLabel.textContent).toContain('Fitur Utama Produk');
            expect(featuresLabel.querySelector('i.fas.fa-star')).toBeTruthy();
            expect(featuresLabel.querySelector('i').classList.contains('text-pink-500')).toBe(true);
        });

        it('should have helper text', () => {
            const helperText = document.body.querySelector('#deskripsi-produk-fitur + p');
            expect(helperText).toBeTruthy();
            expect(helperText.textContent).toContain('Satu fitur per baris');
            expect(helperText.textContent).toContain('maksimal 5 fitur');
            expect(helperText.classList.contains('text-xs')).toBe(true);
            expect(helperText.classList.contains('text-gray-500')).toBe(true);
        });

        it('should have proper textarea styling', () => {
            const featuresTextarea = document.getElementById('deskripsi-produk-fitur');
            expect(featuresTextarea.classList.contains('w-full')).toBe(true);
            expect(featuresTextarea.classList.contains('px-4')).toBe(true);
            expect(featuresTextarea.classList.contains('py-3')).toBe(true);
            expect(featuresTextarea.classList.contains('border')).toBe(true);
            expect(featuresTextarea.classList.contains('rounded-lg')).toBe(true);
            expect(featuresTextarea.classList.contains('focus:ring-pink-500')).toBe(true);
            expect(featuresTextarea.classList.contains('resize-y')).toBe(true);
        });
    });

    // Target Audience Selection Tests
    describe('Target Audience Selection', () => {
        it('should render target select element', () => {
            const targetSelect = document.getElementById('deskripsi-produk-target');
            expect(targetSelect).toBeTruthy();
            expect(targetSelect.tagName).toBe('SELECT');
        });

        it('should have correct placeholder option', () => {
            const targetSelect = document.getElementById('deskripsi-produk-target');
            const firstOption = targetSelect.querySelector('option');
            expect(firstOption).toBeTruthy();
            expect(firstOption.value).toBe('');
            expect(firstOption.textContent).toContain('Pilih target audiens...');
        });

        it('should have all target audience options', () => {
            const targetSelect = document.getElementById('deskripsi-produk-target');
            const options = targetSelect.querySelectorAll('option');
            expect(options.length).toBe(9); // 1 placeholder + 8 targets
            
            expect(options[1].value).toBe('remaja');
            expect(options[1].textContent).toContain('Remaja (15-24 tahun)');
            
            expect(options[2].value).toBe('dewasa-muda');
            expect(options[2].textContent).toContain('Dewasa Muda (25-35 tahun)');
            
            expect(options[3].value).toBe('dewasa');
            expect(options[3].textContent).toContain('Dewasa (36-50 tahun)');
            
            expect(options[4].value).toBe('orang-tua');
            expect(options[4].textContent).toContain('Orang Tua (50+ tahun)');
            
            expect(options[5].value).toBe('profesional');
            expect(options[5].textContent).toContain('Profesional');
            
            expect(options[6].value).toBe('mahasiswa');
            expect(options[6].textContent).toContain('Mahasiswa');
            
            expect(options[7].value).toBe('ibu-rumah-tangga');
            expect(options[7].textContent).toContain('Ibu Rumah Tangga');
            
            expect(options[8].value).toBe('semua');
            expect(options[8].textContent).toContain('Semua Umur');
        });

        it('should have target label with icon', () => {
            const targetLabel = document.querySelector('label[for="deskripsi-produk-target"]');
            expect(targetLabel).toBeTruthy();
            expect(targetLabel.textContent).toContain('Target Audiens');
            expect(targetLabel.querySelector('i.fas.fa-users')).toBeTruthy();
            expect(targetLabel.querySelector('i').classList.contains('text-pink-500')).toBe(true);
        });

        it('should have proper select styling', () => {
            const targetSelect = document.getElementById('deskripsi-produk-target');
            expect(targetSelect.classList.contains('w-full')).toBe(true);
            expect(targetSelect.classList.contains('px-4')).toBe(true);
            expect(targetSelect.classList.contains('py-3')).toBe(true);
            expect(targetSelect.classList.contains('border')).toBe(true);
            expect(targetSelect.classList.contains('rounded-lg')).toBe(true);
            expect(targetSelect.classList.contains('focus:ring-pink-500')).toBe(true);
            expect(targetSelect.classList.contains('bg-white')).toBe(true);
        });
    });

    // Generate Button Tests
    describe('Generate Button', () => {
        it('should render generate button', () => {
            const generateBtn = document.getElementById('deskripsi-produk-generate');
            expect(generateBtn).toBeTruthy();
            expect(generateBtn.tagName).toBe('BUTTON');
        });

        it('should have correct button text', () => {
            const generateBtn = document.getElementById('deskripsi-produk-generate');
            expect(generateBtn.textContent).toContain('Generate Deskripsi Produk');
        });

        it('should have magic icon', () => {
            const generateBtn = document.getElementById('deskripsi-produk-generate');
            expect(generateBtn.querySelector('i.fas.fa-magic')).toBeTruthy();
        });

        it('should have correct styling classes', () => {
            const generateBtn = document.getElementById('deskripsi-produk-generate');
            expect(generateBtn.classList.contains('w-full')).toBe(true);
            expect(generateBtn.classList.contains('py-4')).toBe(true);
            expect(generateBtn.classList.contains('px-6')).toBe(true);
            expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
            expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
            expect(generateBtn.classList.contains('text-white')).toBe(true);
            expect(generateBtn.classList.contains('font-bold')).toBe(true);
            expect(generateBtn.classList.contains('rounded-lg')).toBe(true);
            expect(generateBtn.classList.contains('shadow-lg')).toBe(true);
            expect(generateBtn.classList.contains('hover:shadow-xl')).toBe(true);
            expect(generateBtn.classList.contains('transition-all')).toBe(true);
        });

        it('should have flex layout with gap', () => {
            const generateBtn = document.getElementById('deskripsi-produk-generate');
            expect(generateBtn.classList.contains('flex')).toBe(true);
            expect(generateBtn.classList.contains('items-center')).toBe(true);
            expect(generateBtn.classList.contains('justify-center')).toBe(true);
            expect(generateBtn.classList.contains('gap-2')).toBe(true);
        });
    });

    // Results Area Tests
    describe('Results Area', () => {
        it('should render results container', () => {
            const resultContainer = document.getElementById('deskripsi-produk-result');
            expect(resultContainer).toBeTruthy();
            expect(resultContainer.classList.contains('hidden')).toBe(true);
            expect(resultContainer.classList.contains('mt-8')).toBe(true);
        });

        it('should render results header', () => {
            const resultContainer = document.getElementById('deskripsi-produk-result');
            const header = resultContainer.querySelector('h3');
            expect(header).toBeTruthy();
            expect(header.textContent).toContain('Hasil Deskripsi Produk');
            expect(header.classList.contains('text-xl')).toBe(true);
            expect(header.classList.contains('font-bold')).toBe(true);
            
            const icon = header.querySelector('i.fas.fa-file-alt');
            expect(icon).toBeTruthy();
            expect(icon.classList.contains('text-pink-500')).toBe(true);
        });

        it('should render copy button', () => {
            const copyBtn = document.getElementById('deskripsi-produk-copy');
            expect(copyBtn).toBeTruthy();
            expect(copyBtn.textContent).toContain('Salin');
            expect(copyBtn.querySelector('i.fas.fa-copy')).toBeTruthy();
            expect(copyBtn.classList.contains('bg-pink-100')).toBe(true);
            expect(copyBtn.classList.contains('text-pink-600')).toBe(true);
        });

        it('should render output area', () => {
            const output = document.getElementById('deskripsi-produk-output');
            expect(output).toBeTruthy();
            expect(output.classList.contains('prose')).toBe(true);
            expect(output.classList.contains('prose-pink')).toBe(true);
            expect(output.classList.contains('max-w-none')).toBe(true);
            expect(output.classList.contains('p-4')).toBe(true);
            expect(output.classList.contains('bg-gray-50')).toBe(true);
            expect(output.classList.contains('rounded-lg')).toBe(true);
            expect(output.classList.contains('border')).toBe(true);
        });

        it('should have proper results card styling', () => {
            const resultCard = document.getElementById('deskripsi-produk-result').querySelector('.bg-white');
            expect(resultCard).toBeTruthy();
            expect(resultCard.classList.contains('rounded-2xl')).toBe(true);
            expect(resultCard.classList.contains('shadow-lg')).toBe(true);
        });
    });

    // Color Scheme Tests
    describe('Color Scheme (pink/rose)', () => {
        it('should use pink/rose gradient in header icon', () => {
            const iconContainer = document.body.querySelector('.rounded-full.bg-gradient-to-br');
            expect(iconContainer).toBeTruthy();
            expect(iconContainer.classList.contains('from-pink-500')).toBe(true);
            expect(iconContainer.classList.contains('to-rose-500')).toBe(true);
        });

        it('should use pink accents in form labels', () => {
            const labels = document.body.querySelectorAll('label i.text-pink-500');
            expect(labels.length).toBe(4); // category, name, features, target
        });

        it('should use pink/rose gradient in generate button', () => {
            const generateBtn = document.getElementById('deskripsi-produk-generate');
            expect(generateBtn.classList.contains('bg-gradient-to-r')).toBe(true);
            expect(generateBtn.classList.contains('from-pink-500')).toBe(true);
            expect(generateBtn.classList.contains('to-rose-500')).toBe(true);
        });

        it('should use pink accents in focus states', () => {
            const categorySelect = document.getElementById('deskripsi-produk-kategori');
            expect(categorySelect.classList.contains('focus:ring-pink-500')).toBe(true);
            expect(categorySelect.classList.contains('focus:border-pink-500')).toBe(true);
            
            const nameInput = document.getElementById('deskripsi-produk-nama');
            expect(nameInput.classList.contains('focus:ring-pink-500')).toBe(true);
            expect(nameInput.classList.contains('focus:border-pink-500')).toBe(true);
            
            const featuresTextarea = document.getElementById('deskripsi-produk-fitur');
            expect(featuresTextarea.classList.contains('focus:ring-pink-500')).toBe(true);
            expect(featuresTextarea.classList.contains('focus:border-pink-500')).toBe(true);
            
            const targetSelect = document.getElementById('deskripsi-produk-target');
            expect(targetSelect.classList.contains('focus:ring-pink-500')).toBe(true);
            expect(targetSelect.classList.contains('focus:border-pink-500')).toBe(true);
        });

        it('should use pink accents in copy button', () => {
            const copyBtn = document.getElementById('deskripsi-produk-copy');
            expect(copyBtn.classList.contains('bg-pink-100')).toBe(true);
            expect(copyBtn.classList.contains('text-pink-600')).toBe(true);
            expect(copyBtn.classList.contains('hover:bg-pink-200')).toBe(true);
        });

        it('should use pink accents in results header', () => {
            const resultsIcon = document.body.querySelector('#deskripsi-produk-result i.text-pink-500');
            expect(resultsIcon).toBeTruthy();
        });

        it('should use pink accents in loading spinner', () => {
            const loadingSpinner = document.body.querySelector('#deskripsi-produk-loading .border-pink-500');
            expect(loadingSpinner).toBeTruthy();
        });

        it('should use prose-pink for output styling', () => {
            const output = document.getElementById('deskripsi-produk-output');
            expect(output.classList.contains('prose-pink')).toBe(true);
        });
    });

    // Loading State Tests
    describe('Loading State', () => {
        it('should render loading container', () => {
            const loadingContainer = document.getElementById('deskripsi-produk-loading');
            expect(loadingContainer).toBeTruthy();
            expect(loadingContainer.classList.contains('hidden')).toBe(true);
            expect(loadingContainer.classList.contains('fixed')).toBe(true);
            expect(loadingContainer.classList.contains('inset-0')).toBe(true);
            expect(loadingContainer.classList.contains('bg-black/50')).toBe(true);
            expect(loadingContainer.classList.contains('z-50')).toBe(true);
        });

        it('should render loading spinner', () => {
            const loadingContainer = document.getElementById('deskripsi-produk-loading');
            const spinner = loadingContainer.querySelector('.animate-spin');
            expect(spinner).toBeTruthy();
            expect(spinner.classList.contains('rounded-full')).toBe(true);
            expect(spinner.classList.contains('h-12')).toBe(true);
            expect(spinner.classList.contains('w-12')).toBe(true);
            expect(spinner.classList.contains('border-4')).toBe(true);
            expect(spinner.classList.contains('border-pink-500')).toBe(true);
            expect(spinner.classList.contains('border-t-transparent')).toBe(true);
        });

        it('should have loading text', () => {
            const loadingContainer = document.getElementById('deskripsi-produk-loading');
            expect(loadingContainer.textContent).toContain('Sedang membuat deskripsi produk...');
        });
    });

    // Form Spacing Tests
    describe('Form Spacing', () => {
        it('should have proper spacing between form elements', () => {
            const formContainer = document.body.querySelector('.bg-white.rounded-2xl');
            const formDivs = formContainer.querySelectorAll('.mb-6, .mb-8');
            expect(formDivs.length).toBe(4); // category, name, features, target
        });

        it('should have category section with bottom margin', () => {
            const categorySection = document.querySelector('#deskripsi-produk-kategori').closest('.mb-6');
            expect(categorySection).toBeTruthy();
        });

        it('should have name section with bottom margin', () => {
            const nameSection = document.querySelector('#deskripsi-produk-nama').closest('.mb-6');
            expect(nameSection).toBeTruthy();
        });

        it('should have features section with bottom margin', () => {
            const featuresSection = document.querySelector('#deskripsi-produk-fitur').closest('.mb-6');
            expect(featuresSection).toBeTruthy();
        });

        it('should have target section with larger bottom margin', () => {
            const targetSection = document.querySelector('#deskripsi-produk-target').closest('.mb-8');
            expect(targetSection).toBeTruthy();
        });
    });

    // Accessibility Tests
    describe('Accessibility', () => {
        it('should have proper label associations', () => {
            const categoryLabel = document.querySelector('label[for="deskripsi-produk-kategori"]');
            const categorySelect = document.getElementById('deskripsi-produk-kategori');
            expect(categoryLabel.getAttribute('for')).toBe(categorySelect.id);
            
            const nameLabel = document.querySelector('label[for="deskripsi-produk-nama"]');
            const nameInput = document.getElementById('deskripsi-produk-nama');
            expect(nameLabel.getAttribute('for')).toBe(nameInput.id);
            
            const featuresLabel = document.querySelector('label[for="deskripsi-produk-fitur"]');
            const featuresTextarea = document.getElementById('deskripsi-produk-fitur');
            expect(featuresLabel.getAttribute('for')).toBe(featuresTextarea.id);
            
            const targetLabel = document.querySelector('label[for="deskripsi-produk-target"]');
            const targetSelect = document.getElementById('deskripsi-produk-target');
            expect(targetLabel.getAttribute('for')).toBe(targetSelect.id);
        });

        it('should have proper heading structure', () => {
            const h2 = document.body.querySelector('h2');
            expect(h2).toBeTruthy();
            
            const h3 = document.body.querySelector('#deskripsi-produk-result h3');
            expect(h3).toBeTruthy();
        });

        it('should have proper button labels', () => {
            const generateBtn = document.getElementById('deskripsi-produk-generate');
            expect(generateBtn.textContent).toContain('Generate Deskripsi Produk');
            
            const copyBtn = document.getElementById('deskripsi-produk-copy');
            expect(copyBtn.textContent).toContain('Salin');
        });
    });

    // Text Content Tests
    describe('Text Content', () => {
        it('should have Indonesian text', () => {
            expect(document.body.textContent).toContain('Deskripsi Produk');
            expect(document.body.textContent).toContain('Buat deskripsi produk yang menarik dan persuasif');
            expect(document.body.textContent).toContain('Kategori Produk');
            expect(document.body.textContent).toContain('Nama Produk');
            expect(document.body.textContent).toContain('Fitur Utama Produk');
            expect(document.body.textContent).toContain('Target Audiens');
            expect(document.body.textContent).toContain('Generate Deskripsi Produk');
            expect(document.body.textContent).toContain('Hasil Deskripsi Produk');
            expect(document.body.textContent).toContain('Salin');
        });

        it('should have proper placeholder text', () => {
            const nameInput = document.getElementById('deskripsi-produk-nama');
            expect(nameInput.placeholder).toContain('Masukkan nama produk Anda...');
        });
    });

    // Responsive Design Tests
    describe('Responsive Design', () => {
        it('should have responsive container width', () => {
            const container = document.getElementById('deskripsi-produk-container');
            expect(container.classList.contains('w-full')).toBe(true);
            expect(container.classList.contains('max-w-4xl')).toBe(true);
            expect(container.classList.contains('mx-auto')).toBe(true);
        });

        it('should have responsive padding', () => {
            const container = document.getElementById('deskripsi-produk-container');
            expect(container.classList.contains('p-6')).toBe(true);
        });

        it('should have responsive form padding', () => {
            const formContainer = document.body.querySelector('.bg-white.rounded-2xl');
            expect(formContainer.classList.contains('p-6')).toBe(true);
            expect(formContainer.classList.contains('md:p-8')).toBe(true);
        });

        it('should have responsive results padding', () => {
            const resultsCard = document.getElementById('deskripsi-produk-result').querySelector('.bg-white');
            expect(resultsCard.classList.contains('p-6')).toBe(true);
            expect(resultsCard.classList.contains('md:p-8')).toBe(true);
        });
    });

    // Component Integration Tests
    describe('Component Integration', () => {
        it('should have all required form elements', () => {
            expect(document.getElementById('deskripsi-produk-kategori')).toBeTruthy();
            expect(document.getElementById('deskripsi-produk-nama')).toBeTruthy();
            expect(document.getElementById('deskripsi-produk-fitur')).toBeTruthy();
            expect(document.getElementById('deskripsi-produk-target')).toBeTruthy();
            expect(document.getElementById('deskripsi-produk-generate')).toBeTruthy();
        });

        it('should have all required result elements', () => {
            expect(document.getElementById('deskripsi-produk-result')).toBeTruthy();
            expect(document.getElementById('deskripsi-produk-output')).toBeTruthy();
            expect(document.getElementById('deskripsi-produk-copy')).toBeTruthy();
        });

        it('should have loading element', () => {
            expect(document.getElementById('deskripsi-produk-loading')).toBeTruthy();
        });

        it('should have proper element hierarchy', () => {
            const container = document.getElementById('deskripsi-produk-container');
            expect(container.querySelector('.text-center')).toBeTruthy();
            expect(container.querySelector('.bg-white.rounded-2xl')).toBeTruthy();
            expect(container.querySelector('#deskripsi-produk-result')).toBeTruthy();
            expect(container.querySelector('#deskripsi-produk-loading')).toBeTruthy();
        });
    });

    // Icon Tests
    describe('Icons', () => {
        it('should use FontAwesome icons', () => {
            const icons = document.body.querySelectorAll('i.fas');
            expect(icons.length).toBeGreaterThan(5);
        });

        it('should have box-open icon in header', () => {
            const headerIcon = document.body.querySelector('i.fas.fa-box-open');
            expect(headerIcon).toBeTruthy();
        });

        it('should have tag icon for category', () => {
            const categoryLabel = document.querySelector('label[for="deskripsi-produk-kategori"]');
            const tagIcon = categoryLabel.querySelector('i.fas.fa-tag');
            expect(tagIcon).toBeTruthy();
        });

        it('should have box icon for name', () => {
            const nameLabel = document.querySelector('label[for="deskripsi-produk-nama"]');
            const boxIcon = nameLabel.querySelector('i.fas.fa-box');
            expect(boxIcon).toBeTruthy();
        });

        it('should have star icon for features', () => {
            const featuresLabel = document.querySelector('label[for="deskripsi-produk-fitur"]');
            const starIcon = featuresLabel.querySelector('i.fas.fa-star');
            expect(starIcon).toBeTruthy();
        });

        it('should have users icon for target', () => {
            const targetLabel = document.querySelector('label[for="deskripsi-produk-target"]');
            const usersIcon = targetLabel.querySelector('i.fas.fa-users');
            expect(usersIcon).toBeTruthy();
        });

        it('should have magic icon for generate button', () => {
            const magicIcon = document.getElementById('deskripsi-produk-generate').querySelector('i.fas.fa-magic');
            expect(magicIcon).toBeTruthy();
        });

        it('should have file-alt icon for results', () => {
            const fileIcon = document.body.querySelector('#deskripsi-produk-result i.fas.fa-file-alt');
            expect(fileIcon).toBeTruthy();
        });

        it('should have copy icon for copy button', () => {
            const copyIcon = document.getElementById('deskripsi-produk-copy').querySelector('i.fas.fa-copy');
            expect(copyIcon).toBeTruthy();
        });
    });
});
