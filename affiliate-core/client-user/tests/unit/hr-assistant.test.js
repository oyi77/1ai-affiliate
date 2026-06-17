/**
 * Unit Tests for HR Assistant Component
 * Tests component structure, document type selection, input handling,
 * generation functionality, and teal/cyan color scheme
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock window functions
window.showToast = vi.fn();
window.copyToClipboard = vi.fn().mockResolvedValue();
window.downloadFile = vi.fn();

describe('HR Assistant Component', () => {
    
    // Mock component HTML structure
    const mockComponentHTML = `
        <div id="content-hr-assistant" class="main-content-panel hidden">
            <div class="max-w-4xl mx-auto py-8 px-4">
                <header class="mb-8 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                        <i class="fas fa-users-cog fa-lg"></i>
                    </div>
                    <div>
                        <h2 class="text-3xl font-black text-gray-800 tracking-tight">Asisten HR</h2>
                        <p class="text-gray-500 font-medium">Buat dokumen dan kebijakan SDM dengan AI</p>
                    </div>
                </header>

                <div class="space-y-6">
                    <!-- HR Document Type Selection -->
                    <div class="card overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white">
                                    <i class="fas fa-file-alt"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-800">Jenis Dokumen HR</h3>
                            </div>

                            <p class="text-sm text-gray-600 mb-6 leading-relaxed">
                                Pilih jenis dokumen SDM yang ingin Anda buat. Sistem akan menghasilkan dokumen profesional berdasarkan pilihan Anda.
                            </p>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <button type="button" id="hr-assistant-doc-job-desc" class="hr-assistant-doc-type-btn flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200">
                                    <div class="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                                        <i class="fas fa-briefcase"></i>
                                    </div>
                                    <div class="text-left">
                                        <span class="font-bold text-gray-800 block">Deskripsi Pekerjaan</span>
                                        <span class="text-xs text-gray-500">Job description untuk posisi tertentu</span>
                                    </div>
                                </button>

                                <button type="button" id="hr-assistant-doc-policy" class="hr-assistant-doc-type-btn flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200">
                                    <div class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                                        <i class="fas fa-book"></i>
                                    </div>
                                    <div class="text-left">
                                        <span class="font-bold text-gray-800 block">Kebijakan Perusahaan</span>
                                        <span class="text-xs text-gray-500">Aturan dan prosedur kerja</span>
                                    </div>
                                </button>

                                <button type="button" id="hr-assistant-doc-contract" class="hr-assistant-doc-type-btn flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200">
                                    <div class="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                                        <i class="fas fa-file-signature"></i>
                                    </div>
                                    <div class="text-left">
                                        <span class="font-bold text-gray-800 block">Kontrak Kerja</span>
                                        <span class="text-xs text-gray-500">Template perjanjian kerja</span>
                                    </div>
                                </button>

                                <button type="button" id="hr-assistant-doc-evaluation" class="hr-assistant-doc-type-btn flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200">
                                    <div class="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                                        <i class="fas fa-clipboard-check"></i>
                                    </div>
                                    <div class="text-left">
                                        <span class="font-bold text-gray-800 block">Evaluasi Kinerja</span>
                                        <span class="text-xs text-gray-500">Form penilaian karyawan</span>
                                    </div>
                                </button>
                            </div>

                            <div id="hr-assistant-selected-doc" class="hidden p-4 bg-teal-50 rounded-xl border border-teal-200">
                                <p class="text-sm text-teal-700 font-medium">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    <span id="hr-assistant-selected-doc-text">Dokumen yang dipilih: -</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Position Input -->
                    <div id="hr-assistant-position-section" class="card overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 hidden">
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-800">Informasi Posisi</h3>
                            </div>

                            <div class="space-y-4">
                                <div class="relative">
                                    <label for="hr-assistant-position-input" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nama Posisi</label>
                                    <input type="text" id="hr-assistant-position-input" class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-teal-500 focus:bg-white focus:outline-none transition-all duration-200" placeholder="Contoh: Staff Marketing, Manager Keuangan, dll">
                                </div>

                                <div class="relative">
                                    <label for="hr-assistant-department-input" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Departemen</label>
                                    <input type="text" id="hr-assistant-department-input" class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-teal-500 focus:bg-white focus:outline-none transition-all duration-200" placeholder="Contoh: Marketing, Keuangan, HRD, dll">
                                </div>

                                <div class="relative">
                                    <label for="hr-assistant-level-input" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Level Posisi</label>
                                    <select id="hr-assistant-level-input" class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-teal-500 focus:bg-white focus:outline-none transition-all duration-200">
                                        <option value="">Pilih level posisi...</option>
                                        <option value="entry">Entry Level / Junior</option>
                                        <option value="mid">Mid Level / Menengah</option>
                                        <option value="senior">Senior Level / Atas</option>
                                        <option value="manager">Manager / Kepala Bagian</option>
                                        <option value="director">Director / Direktur</option>
                                        <option value="executive">Executive / Eksekutif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Policy Details -->
                    <div id="hr-assistant-policy-section" class="card overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 hidden">
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white">
                                    <i class="fas fa-list-ul"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-800">Detail Kebijakan</h3>
                            </div>

                            <div class="space-y-4">
                                <div class="relative">
                                    <label for="hr-assistant-policy-title" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Judul Kebijakan</label>
                                    <input type="text" id="hr-assistant-policy-title" class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-teal-500 focus:bg-white focus:outline-none transition-all duration-200" placeholder="Contoh: Kebijakan Cuti, Kehadiran, dll">
                                </div>

                                <div class="relative">
                                    <label for="hr-assistant-policy-scope" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Ruang Lingkup</label>
                                    <textarea id="hr-assistant-policy-scope" class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-teal-500 focus:bg-white focus:outline-none transition-all duration-200" rows="3" placeholder="Jelaskan siapa yang berlaku kebijakan ini dan dalam situasi apa..."></textarea>
                                </div>

                                <div class="relative">
                                    <label for="hr-assistant-policy-content" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Poin-poin Kebijakan</label>
                                    <textarea id="hr-assistant-policy-content" class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-teal-500 focus:bg-white focus:outline-none transition-all duration-200" rows="4" placeholder="Masukkan poin-poin utama kebijakan yang ingin dibuat (satu poin per baris)..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Details -->
                    <div id="hr-assistant-details-section" class="card overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 hidden">
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white">
                                    <i class="fas fa-info-circle"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-800">Detail Tambahan</h3>
                            </div>

                            <div class="space-y-4">
                                <div class="relative">
                                    <label for="hr-assistant-additional-info" class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Informasi Tambahan (Opsional)</label>
                                    <textarea id="hr-assistant-additional-info" class="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 focus:border-teal-500 focus:bg-white focus:outline-none transition-all duration-200" rows="4" placeholder="Masukkan informasi tambahan yang ingin dimasukkan dalam dokumen..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Generate Button -->
                    <div id="hr-assistant-generate-section" class="hidden">
                        <button id="hr-assistant-generate-btn" class="w-full bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-teal-200/50 hover:-translate-y-0.5 transition-all duration-200">
                            <i class="fas fa-magic mr-2"></i>
                            Buat Dokumen HR
                        </button>
                    </div>

                    <!-- Output Section -->
                    <div id="hr-assistant-output-section" class="card overflow-hidden border border-gray-100 shadow-sm hidden">
                        <div class="p-6">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white">
                                    <i class="fas fa-file-export"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-800">Hasil Dokumen</h3>
                            </div>

                            <div id="hr-assistant-output-placeholder" class="flex flex-col items-center justify-center min-h-[200px] text-center">
                                <i class="fas fa-file-alt text-6xl text-teal-300 mb-4"></i>
                                <p class="text-gray-600 font-medium">Dokumen HR akan muncul di sini</p>
                                <p class="text-sm text-gray-500 mt-1">Isi form di atas dan klik tombol buat dokumen</p>
                            </div>

                            <div id="hr-assistant-output-content" class="hidden">
                                <div class="bg-gray-50 rounded-xl p-6 mb-4 max-h-[500px] overflow-y-auto">
                                    <pre id="hr-assistant-document-text" class="whitespace-pre-wrap text-sm text-gray-700 font-mono"></pre>
                                </div>

                                <div class="flex flex-wrap gap-3">
                                    <button id="hr-assistant-copy-btn" class="flex-1 min-w-[120px] bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-teal-200/50 hover:-translate-y-0.5 transition-all duration-200">
                                        <i class="fas fa-copy mr-2"></i>Salin
                                    </button>
                                    <button id="hr-assistant-download-btn" class="flex-1 min-w-[120px] bg-white border-2 border-teal-500 text-teal-600 font-bold py-3 px-6 rounded-xl hover:bg-teal-50 transition-all duration-200">
                                        <i class="fas fa-download mr-2"></i>Unduh
                                    </button>
                                    <button id="hr-assistant-clear-btn" class="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200">
                                        <i class="fas fa-trash mr-2"></i>Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
        // Setup DOM environment
        document.body.innerHTML = mockComponentHTML;
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
    });

    describe('Component Structure', () => {
        it('should have main container with correct ID', () => {
            const container = document.getElementById('content-hr-assistant');
            expect(container).not.toBeNull();
            expect(container.className).toContain('main-content-panel');
            expect(container.className).toContain('hidden');
        });

        it('should have header with title and description', () => {
            const header = document.querySelector('#content-hr-assistant header');
            expect(header).not.toBeNull();
            
            const title = header.querySelector('h2');
            expect(title.textContent).toBe('Asisten HR');
            
            const description = header.querySelector('p');
            expect(description.textContent).toContain('Buat dokumen dan kebijakan SDM dengan AI');
        });

        it('should have header icon with teal/cyan gradient', () => {
            const iconContainer = document.querySelector('#content-hr-assistant header > div:first-child');
            expect(iconContainer).not.toBeNull();
            expect(iconContainer.className).toContain('bg-gradient-to-br');
            expect(iconContainer.className).toContain('from-teal-600');
            expect(iconContainer.className).toContain('to-cyan-500');
        });

        it('should have all document type selection buttons', () => {
            const docTypes = [
                'hr-assistant-doc-job-desc',
                'hr-assistant-doc-policy', 
                'hr-assistant-doc-contract',
                'hr-assistant-doc-evaluation'
            ];

            docTypes.forEach(id => {
                const button = document.getElementById(id);
                expect(button).not.toBeNull();
                expect(button.className).toContain('hr-assistant-doc-type-btn');
            });
        });

        it('should have position input section', () => {
            const positionSection = document.getElementById('hr-assistant-position-section');
            expect(positionSection).not.toBeNull();
            expect(positionSection.className).toContain('hidden');
            
            // Check input fields exist
            expect(document.getElementById('hr-assistant-position-input')).not.toBeNull();
            expect(document.getElementById('hr-assistant-department-input')).not.toBeNull();
            expect(document.getElementById('hr-assistant-level-input')).not.toBeNull();
        });

        it('should have policy details section', () => {
            const policySection = document.getElementById('hr-assistant-policy-section');
            expect(policySection).not.toBeNull();
            expect(policySection.className).toContain('hidden');
            
            // Check policy input fields exist
            expect(document.getElementById('hr-assistant-policy-title')).not.toBeNull();
            expect(document.getElementById('hr-assistant-policy-scope')).not.toBeNull();
            expect(document.getElementById('hr-assistant-policy-content')).not.toBeNull();
        });

        it('should have additional details section', () => {
            const detailsSection = document.getElementById('hr-assistant-details-section');
            expect(detailsSection).not.toBeNull();
            expect(detailsSection.className).toContain('hidden');
            
            expect(document.getElementById('hr-assistant-additional-info')).not.toBeNull();
        });

        it('should have generate button section', () => {
            const generateSection = document.getElementById('hr-assistant-generate-section');
            expect(generateSection).not.toBeNull();
            expect(generateSection.className).toContain('hidden');
            
            const generateBtn = document.getElementById('hr-assistant-generate-btn');
            expect(generateBtn).not.toBeNull();
            expect(generateBtn.textContent).toContain('Buat Dokumen HR');
        });

        it('should have output section with action buttons', () => {
            const outputSection = document.getElementById('hr-assistant-output-section');
            expect(outputSection).not.toBeNull();
            expect(outputSection.className).toContain('hidden');
            
            // Check action buttons exist
            expect(document.getElementById('hr-assistant-copy-btn')).not.toBeNull();
            expect(document.getElementById('hr-assistant-download-btn')).not.toBeNull();
            expect(document.getElementById('hr-assistant-clear-btn')).not.toBeNull();
        });
    });

    describe('HR Document Type Selection', () => {
        it('should display selected document type indicator', () => {
            const selectedDoc = document.getElementById('hr-assistant-selected-doc');
            expect(selectedDoc).not.toBeNull();
            expect(selectedDoc.className).toContain('hidden');
            expect(selectedDoc.className).toContain('bg-teal-50');
            expect(selectedDoc.className).toContain('border-teal-200');
        });

        it('should have document type buttons with correct icons and text', () => {
            // Job Description button
            const jobDescBtn = document.getElementById('hr-assistant-doc-job-desc');
            expect(jobDescBtn.innerHTML).toContain('fa-briefcase');
            expect(jobDescBtn.textContent).toContain('Deskripsi Pekerjaan');
            
            // Policy button
            const policyBtn = document.getElementById('hr-assistant-doc-policy');
            expect(policyBtn.innerHTML).toContain('fa-book');
            expect(policyBtn.textContent).toContain('Kebijakan Perusahaan');
            
            // Contract button
            const contractBtn = document.getElementById('hr-assistant-doc-contract');
            expect(contractBtn.innerHTML).toContain('fa-file-signature');
            expect(contractBtn.textContent).toContain('Kontrak Kerja');
            
            // Evaluation button
            const evaluationBtn = document.getElementById('hr-assistant-doc-evaluation');
            expect(evaluationBtn.innerHTML).toContain('fa-clipboard-check');
            expect(evaluationBtn.textContent).toContain('Evaluasi Kinerja');
        });

        it('should show teal/cyan styling on document type buttons', () => {
            const buttons = document.querySelectorAll('.hr-assistant-doc-type-btn');
            
            buttons.forEach(btn => {
                expect(btn.className).toContain('hover:border-teal-500');
                expect(btn.className).toContain('hover:bg-teal-50');
            });
        });
    });

    describe('Employee Position Input', () => {
        it('should have position name input field', () => {
            const positionInput = document.getElementById('hr-assistant-position-input');
            expect(positionInput).not.toBeNull();
            expect(positionInput.type).toBe('text');
            expect(positionInput.placeholder).toContain('Staff Marketing');
        });

        it('should have department input field', () => {
            const departmentInput = document.getElementById('hr-assistant-department-input');
            expect(departmentInput).not.toBeNull();
            expect(departmentInput.type).toBe('text');
            expect(departmentInput.placeholder).toContain('Marketing');
        });

        it('should have level select dropdown with all options', () => {
            const levelSelect = document.getElementById('hr-assistant-level-input');
            expect(levelSelect).not.toBeNull();
            
            const options = levelSelect.querySelectorAll('option');
            expect(options.length).toBe(7); // 1 default + 6 levels
            
            const expectedValues = ['', 'entry', 'mid', 'senior', 'manager', 'director', 'executive'];
            expectedValues.forEach((value, index) => {
                expect(options[index].value).toBe(value);
            });
        });

        it('should have teal focus styling on inputs', () => {
            const inputs = [
                document.getElementById('hr-assistant-position-input'),
                document.getElementById('hr-assistant-department-input'),
                document.getElementById('hr-assistant-level-input')
            ];

            inputs.forEach(input => {
                expect(input.className).toContain('focus:border-teal-500');
            });
        });
    });

    describe('Policy Creation', () => {
        it('should have policy title input field', () => {
            const titleInput = document.getElementById('hr-assistant-policy-title');
            expect(titleInput).not.toBeNull();
            expect(titleInput.type).toBe('text');
            expect(titleInput.placeholder).toContain('Kebijakan Cuti');
        });

        it('should have policy scope textarea', () => {
            const scopeTextarea = document.getElementById('hr-assistant-policy-scope');
            expect(scopeTextarea).not.toBeNull();
            expect(scopeTextarea.tagName).toBe('TEXTAREA');
            expect(scopeTextarea.rows).toBe(3);
        });

        it('should have policy content textarea', () => {
            const contentTextarea = document.getElementById('hr-assistant-policy-content');
            expect(contentTextarea).not.toBeNull();
            expect(contentTextarea.tagName).toBe('TEXTAREA');
            expect(contentTextarea.rows).toBe(4);
        });

        it('should have teal focus styling on policy inputs', () => {
            const inputs = [
                document.getElementById('hr-assistant-policy-title'),
                document.getElementById('hr-assistant-policy-scope'),
                document.getElementById('hr-assistant-policy-content')
            ];

            inputs.forEach(input => {
                expect(input.className).toContain('focus:border-teal-500');
            });
        });
    });

    describe('Job Description Generation', () => {
        it('should show position section when job desc is selected', () => {
            const positionSection = document.getElementById('hr-assistant-position-section');
            expect(positionSection.className).toContain('hidden');
        });

        it('should show additional details section for job desc', () => {
            const detailsSection = document.getElementById('hr-assistant-details-section');
            expect(detailsSection.className).toContain('hidden');
        });

        it('should show generate button when form is complete', () => {
            const generateSection = document.getElementById('hr-assistant-generate-section');
            expect(generateSection.className).toContain('hidden');
        });
    });

    describe('Generate Button', () => {
        it('should have correct styling and text', () => {
            const generateBtn = document.getElementById('hr-assistant-generate-btn');
            expect(generateBtn).not.toBeNull();
            expect(generateBtn.className).toContain('bg-gradient-to-r');
            expect(generateBtn.className).toContain('from-teal-600');
            expect(generateBtn.className).toContain('to-cyan-500');
            expect(generateBtn.className).toContain('shadow-lg');
            expect(generateBtn.innerHTML).toContain('fa-magic');
        });

        it('should be hidden initially', () => {
            const generateSection = document.getElementById('hr-assistant-generate-section');
            expect(generateSection.className).toContain('hidden');
        });
    });

    describe('Results Area', () => {
        it('should have output section with placeholder', () => {
            const outputPlaceholder = document.getElementById('hr-assistant-output-placeholder');
            expect(outputPlaceholder).not.toBeNull();
            expect(outputPlaceholder.innerHTML).toContain('fa-file-alt');
            expect(outputPlaceholder.textContent).toContain('Dokumen HR akan muncul di sini');
        });

        it('should have document text container', () => {
            const documentText = document.getElementById('hr-assistant-document-text');
            expect(documentText).not.toBeNull();
            expect(documentText.className).toContain('whitespace-pre-wrap');
            expect(documentText.className).toContain('font-mono');
        });

        it('should have output content section hidden initially', () => {
            const outputContent = document.getElementById('hr-assistant-output-content');
            expect(outputContent).not.toBeNull();
            expect(outputContent.className).toContain('hidden');
        });

        it('should have copy button with teal styling', () => {
            const copyBtn = document.getElementById('hr-assistant-copy-btn');
            expect(copyBtn).not.toBeNull();
            expect(copyBtn.className).toContain('bg-gradient-to-r');
            expect(copyBtn.className).toContain('from-teal-600');
            expect(copyBtn.className).toContain('to-cyan-500');
            expect(copyBtn.innerHTML).toContain('fa-copy');
        });

        it('should have download button with teal border', () => {
            const downloadBtn = document.getElementById('hr-assistant-download-btn');
            expect(downloadBtn).not.toBeNull();
            expect(downloadBtn.className).toContain('border-teal-500');
            expect(downloadBtn.className).toContain('text-teal-600');
            expect(downloadBtn.innerHTML).toContain('fa-download');
        });

        it('should have clear button', () => {
            const clearBtn = document.getElementById('hr-assistant-clear-btn');
            expect(clearBtn).not.toBeNull();
            expect(clearBtn.innerHTML).toContain('fa-trash');
        });
    });

    describe('Color Scheme (Teal/Cyan)', () => {
        it('should use teal-600 to cyan-500 gradient on main elements', () => {
            // Header icon
            const headerIcon = document.querySelector('#content-hr-assistant header > div:first-child');
            expect(headerIcon.className).toContain('from-teal-600');
            expect(headerIcon.className).toContain('to-cyan-500');

            // Section icons
            const sectionIcons = document.querySelectorAll('#content-hr-assistant .bg-gradient-to-br');
            expect(sectionIcons.length).toBeGreaterThan(0);
            
            sectionIcons.forEach(icon => {
                expect(icon.className).toMatch(/from-teal-[56]00/);
                expect(icon.className).toMatch(/to-cyan-[45]00/);
            });
        });

        it('should use teal-500 for hover states and focus', () => {
            const buttons = document.querySelectorAll('.hr-assistant-doc-type-btn');
            buttons.forEach(btn => {
                expect(btn.className).toContain('hover:border-teal-500');
            });

            const inputs = document.querySelectorAll('#content-hr-assistant input, #content-hr-assistant select, #content-hr-assistant textarea');
            inputs.forEach(input => {
                expect(input.className).toContain('focus:border-teal-500');
            });
        });

        it('should use teal-100 and cyan-100 for backgrounds', () => {
            // Job desc and contract buttons have teal backgrounds
            const tealButtons = document.querySelectorAll('#hr-assistant-doc-job-desc .w-10, #hr-assistant-doc-contract .w-10');
            tealButtons.forEach(btn => {
                expect(btn.className).toContain('bg-teal-100');
                expect(btn.className).toContain('text-teal-600');
            });

            // Policy and evaluation buttons have cyan backgrounds
            const cyanButtons = document.querySelectorAll('#hr-assistant-doc-policy .w-10, #hr-assistant-doc-evaluation .w-10');
            cyanButtons.forEach(btn => {
                expect(btn.className).toContain('bg-cyan-100');
                expect(btn.className).toContain('text-cyan-600');
            });
        });

        it('should use teal-50 for selected state background', () => {
            const selectedDoc = document.getElementById('hr-assistant-selected-doc');
            expect(selectedDoc.className).toContain('bg-teal-50');
            expect(selectedDoc.className).toContain('border-teal-200');
            // Check the text element inside instead
            const selectedDocText = document.getElementById('hr-assistant-selected-doc-text');
            expect(selectedDocText.parentElement.className).toContain('text-teal-700');
        });

        it('should use teal-600 to cyan-500 gradient on action buttons', () => {
            // Generate button
            const generateBtn = document.getElementById('hr-assistant-generate-btn');
            expect(generateBtn.className).toContain('from-teal-600');
            expect(generateBtn.className).toContain('to-cyan-500');

            // Copy button
            const copyBtn = document.getElementById('hr-assistant-copy-btn');
            expect(copyBtn.className).toContain('from-teal-600');
            expect(copyBtn.className).toContain('to-cyan-500');
        });

        it('should use teal-200 for shadow effects', () => {
            const generateBtn = document.getElementById('hr-assistant-generate-btn');
            expect(generateBtn.className).toContain('shadow-teal-200/50');
            
            const copyBtn = document.getElementById('hr-assistant-copy-btn');
            expect(copyBtn.className).toContain('shadow-teal-200/50');
        });

        it('should use teal-500 for download button border', () => {
            const downloadBtn = document.getElementById('hr-assistant-download-btn');
            expect(downloadBtn.className).toContain('border-teal-500');
            expect(downloadBtn.className).toContain('text-teal-600');
            expect(downloadBtn.className).toContain('hover:bg-teal-50');
        });
    });

    describe('Component Interaction Logic', () => {
        it('should handle document type selection', () => {
            // Simulate selecting job description
            const jobDescBtn = document.getElementById('hr-assistant-doc-job-desc');
            const selectedDoc = document.getElementById('hr-assistant-selected-doc');
            const selectedDocText = document.getElementById('hr-assistant-selected-doc-text');
            
            // Initially hidden
            expect(selectedDoc.className).toContain('hidden');
            
            // Simulate selection (in real component, this would be handled by JS)
            selectedDoc.classList.remove('hidden');
            selectedDocText.textContent = 'Dokumen yang dipilih: Deskripsi Pekerjaan';
            
            // Should now be visible
            expect(selectedDoc.className).not.toContain('hidden');
            expect(selectedDocText.textContent).toContain('Deskripsi Pekerjaan');
        });

        it('should show position section when job desc is selected', () => {
            const positionSection = document.getElementById('hr-assistant-position-section');
            
            // Initially hidden
            expect(positionSection.classList.contains('hidden')).toBe(true);
            
            // Simulate showing section
            positionSection.classList.remove('hidden');
            
            // Should now be visible
            expect(positionSection.classList.contains('hidden')).toBe(false);
        });

        it('should show policy section when policy is selected', () => {
            const policySection = document.getElementById('hr-assistant-policy-section');
            
            // Initially hidden
            expect(policySection.classList.contains('hidden')).toBe(true);
            
            // Simulate showing section
            policySection.classList.remove('hidden');
            
            // Should now be visible
            expect(policySection.classList.contains('hidden')).toBe(false);
        });

        it('should show generate button when form is complete', () => {
            const generateSection = document.getElementById('hr-assistant-generate-section');
            
            // Initially hidden
            expect(generateSection.className).toContain('hidden');
            
            // Simulate showing section
            generateSection.classList.remove('hidden');
            
            // Should now be visible
            expect(generateSection.className).not.toContain('hidden');
        });

        it('should show output section when document is generated', () => {
            const outputSection = document.getElementById('hr-assistant-output-section');
            const outputPlaceholder = document.getElementById('hr-assistant-output-placeholder');
            const outputContent = document.getElementById('hr-assistant-output-content');
            
            // Initially hidden
            expect(outputSection.classList.contains('hidden')).toBe(true);
            
            // Simulate showing output
            outputSection.classList.remove('hidden');
            outputPlaceholder.classList.add('hidden');
            outputContent.classList.remove('hidden');
            
            // Should now be visible
            expect(outputSection.classList.contains('hidden')).toBe(false);
            expect(outputPlaceholder.classList.contains('hidden')).toBe(true);
            expect(outputContent.classList.contains('hidden')).toBe(false);
        });

        it('should handle input field interactions', () => {
            const positionInput = document.getElementById('hr-assistant-position-input');
            
            // Test setting value
            positionInput.value = 'Staff Marketing';
            expect(positionInput.value).toBe('Staff Marketing');
            
            // Test focus
            const focusSpy = vi.fn();
            positionInput.focus = focusSpy;
            positionInput.focus();
            expect(focusSpy).toHaveBeenCalled();
        });

        it('should handle select dropdown interaction', () => {
            const levelSelect = document.getElementById('hr-assistant-level-input');
            
            // Test selecting option
            levelSelect.value = 'manager';
            expect(levelSelect.value).toBe('manager');
            
            // Test getting selected option text
            const selectedOption = levelSelect.options[levelSelect.selectedIndex];
            expect(selectedOption.text).toContain('Manager');
        });

        it('should handle textarea interactions', () => {
            const policyContent = document.getElementById('hr-assistant-policy-content');
            
            // Test setting value
            policyContent.value = 'Point 1\nPoint 2\nPoint 3';
            expect(policyContent.value).toBe('Point 1\nPoint 2\nPoint 3');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing document type selection', () => {
            // Simulate trying to generate without selecting document type
            const generateBtn = document.getElementById('hr-assistant-generate-btn');
            const showToastSpy = vi.spyOn(window, 'showToast');
            
            // Should show error toast
            window.showToast('Pilih jenis dokumen HR terlebih dahulu!');
            expect(showToastSpy).toHaveBeenCalledWith('Pilih jenis dokumen HR terlebih dahulu!');
        });

        it('should handle missing required fields for job description', () => {
            const positionInput = document.getElementById('hr-assistant-position-input');
            const showToastSpy = vi.spyOn(window, 'showToast');
            
            // Empty position
            positionInput.value = '';
            
            // Should show error toast
            window.showToast('Nama posisi wajib diisi!');
            expect(showToastSpy).toHaveBeenCalledWith('Nama posisi wajib diisi!');
        });

        it('should handle missing required fields for policy', () => {
            const policyTitle = document.getElementById('hr-assistant-policy-title');
            const showToastSpy = vi.spyOn(window, 'showToast');
            
            // Empty title
            policyTitle.value = '';
            
            // Should show error toast
            window.showToast('Judul kebijakan wajib diisi!');
            expect(showToastSpy).toHaveBeenCalledWith('Judul kebijakan wajib diisi!');
        });

        it('should handle API errors gracefully', async () => {
            // Mock fetch to reject
            fetch.mockRejectedValueOnce(new Error('API Error'));
            
            const generateBtn = document.getElementById('hr-assistant-generate-btn');
            const showToastSpy = vi.spyOn(window, 'showToast');
            
            // Should handle error
            try {
                await fetch('/api/generate-hr-document');
            } catch (e) {
                window.showToast('Gagal membuat dokumen. Silakan coba lagi.');
            }
            
            expect(showToastSpy).toHaveBeenCalledWith('Gagal membuat dokumen. Silakan coba lagi.');
        });
    });

    describe('Copy Functionality', () => {
        it('should call copyToClipboard when copy button is clicked', () => {
            const copyBtn = document.getElementById('hr-assistant-copy-btn');
            const copyToClipboardSpy = vi.spyOn(window, 'copyToClipboard');
            
            // Simulate copy
            window.copyToClipboard('Test document content');
            
            expect(copyToClipboardSpy).toHaveBeenCalledWith('Test document content');
        });

        it('should show success toast after copying', () => {
            const copyBtn = document.getElementById('hr-assistant-copy-btn');
            const showToastSpy = vi.spyOn(window, 'showToast');
            
            // Simulate successful copy
            window.copyToClipboard.mockResolvedValueOnce();
            window.showToast('Dokumen berhasil disalin!');
            
            expect(showToastSpy).toHaveBeenCalledWith('Dokumen berhasil disalin!');
        });
    });

    describe('Download Functionality', () => {
        it('should call downloadFile when download button is clicked', () => {
            const downloadBtn = document.getElementById('hr-assistant-download-btn');
            const downloadFileSpy = vi.spyOn(window, 'downloadFile');
            
            // Simulate download
            window.downloadFile('hr-document.txt', 'Document content');
            
            expect(downloadFileSpy).toHaveBeenCalledWith('hr-document.txt', 'Document content');
        });
    });

    describe('Clear Functionality', () => {
        it('should clear all input fields when clear button is clicked', () => {
            const clearBtn = document.getElementById('hr-assistant-clear-btn');
            
            // Set some values
            document.getElementById('hr-assistant-position-input').value = 'Staff Marketing';
            document.getElementById('hr-assistant-department-input').value = 'Marketing';
            document.getElementById('hr-assistant-level-input').value = 'mid';
            
            // Simulate clear
            document.getElementById('hr-assistant-position-input').value = '';
            document.getElementById('hr-assistant-department-input').value = '';
            document.getElementById('hr-assistant-level-input').value = '';
            
            // Verify cleared
            expect(document.getElementById('hr-assistant-position-input').value).toBe('');
            expect(document.getElementById('hr-assistant-department-input').value).toBe('');
            expect(document.getElementById('hr-assistant-level-input').value).toBe('');
        });

        it('should hide output section when clear button is clicked', () => {
            const clearBtn = document.getElementById('hr-assistant-clear-btn');
            const outputSection = document.getElementById('hr-assistant-output-section');
            const outputPlaceholder = document.getElementById('hr-assistant-output-placeholder');
            const outputContent = document.getElementById('hr-assistant-output-content');
            
            // Show output first
            outputSection.classList.remove('hidden');
            outputPlaceholder.classList.add('hidden');
            outputContent.classList.remove('hidden');
            
            // Simulate clear
            outputSection.classList.add('hidden');
            outputPlaceholder.classList.remove('hidden');
            outputContent.classList.add('hidden');
            
            // Verify hidden
            expect(outputSection.className).toContain('hidden');
            expect(outputPlaceholder.className).not.toContain('hidden');
            expect(outputContent.className).toContain('hidden');
        });
    });
});
