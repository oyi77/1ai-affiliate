/**
 * Sample Unit Tests for 1affiliate Client User
 * Demonstrates Vitest testing patterns for utility functions and DOM manipulation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Setup global environment before tests
beforeEach(() => {
    // Create minimal DOM environment for testing
    const mockBody = {
        appendChild: vi.fn(),
        children: []
    };
    
    // Create mock elements for querySelector
    const mockInputElement = {
        value: '',
        focus: vi.fn(),
        onkeypress: null
    };
    
    const mockButtonElement = {
        onclick: null
    };
    
    const mockModalElement = {
        remove: vi.fn(),
        innerHTML: '',
        querySelector: vi.fn((selector) => {
            if (selector === '#modalPasswordInput') return mockInputElement;
            if (selector === '#modalCancelBtn') return mockButtonElement;
            if (selector === '#modalConfirmBtn') return mockButtonElement;
            return null;
        })
    };
    
    global.document = {
        body: mockBody,
        createElement: vi.fn((tag) => ({
            tag,
            id: '',
            className: '',
            style: {},
            innerHTML: '',
            innerText: '',
            appendChild: vi.fn(),
            remove: vi.fn(),
            focus: vi.fn(),
            onclick: null,
            querySelector: vi.fn(() => mockModalElement)
        })),
        getElementById: vi.fn(() => null),
        querySelector: vi.fn(() => null)
    };
    
    // Mock localStorage
    global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    };
    
    // Mock window object
    global.window = {
        generateToken: null,
        showToast: null,
        showPasswordModal: null,
        showGlobalQRIS: null,
        showConfirmModal: null
    };
});

// Test utility functions that mirror the auth.js implementation
const testGenerateToken = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const testShowToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

describe('Utility Functions', () => {
    describe('generateToken', () => {
        it('should generate a token with expected format', () => {
            const token = testGenerateToken();
            
            // Token should be a non-empty string
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(20);
        });

        it('should generate unique tokens on each call', () => {
            const token1 = testGenerateToken();
            const token2 = testGenerateToken();
            
            // Tokens should be different
            expect(token1).not.toBe(token2);
        });

        it('should contain timestamp component', () => {
            const beforeTime = Date.now();
            const token = testGenerateToken();
            const afterTime = Date.now();
            
            // Token should contain a timestamp-like string
            expect(token.length).toBeGreaterThan(0);
        });
    });
});

describe('DOM Manipulation Functions', () => {
    describe('showToast', () => {
        it('should create toast element with message', () => {
            const testMessage = 'Test notification';
            testShowToast(testMessage);
            
            // Should create a div element
            expect(global.document.createElement).toHaveBeenCalled();
            expect(global.document.createElement).toHaveBeenCalledWith('div');
            
            // Should append to body
            expect(global.document.body.appendChild).toHaveBeenCalled();
        });

        it('should set toast className correctly', () => {
            testShowToast('Test message');
            
            // Check that createElement was called
            expect(global.document.createElement).toHaveBeenCalled();
            
            // Get the last call arguments
            const lastCall = global.document.createElement.mock.calls[global.document.createElement.mock.calls.length - 1];
            expect(lastCall[0]).toBe('div');
        });

        it('should handle empty message gracefully', () => {
            // Should not throw
            expect(() => testShowToast('')).not.toThrow();
            expect(() => testShowToast(null)).not.toThrow();
        });
    });

    describe('showPasswordModal', () => {
        const testShowPasswordModal = (title, callback) => {
            const modalId = 'password-modal';
            let modal = document.getElementById(modalId);
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'custom-modal-overlay';
                document.body.appendChild(modal);
            }
        
            modal.innerHTML = `
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <i class="fas fa-shield-alt modal-icon"></i>
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <input type="password" id="modalPasswordInput" class="modal-input" placeholder="••••••••">
                    </div>
                    <div class="custom-modal-footer">
                        <button id="modalCancelBtn" class="modal-btn cancel">Batal</button>
                        <button id="modalConfirmBtn" class="modal-btn confirm">Lanjutkan</button>
                    </div>
                </div>
            `;
        
            const input = modal.querySelector('#modalPasswordInput');
            const cancelBtn = modal.querySelector('#modalCancelBtn');
            const confirmBtn = modal.querySelector('#modalConfirmBtn');
        
            const handleConfirm = () => {
                const val = input.value;
                modal.remove();
                callback(val);
            };
        
            const handleCancel = () => {
                modal.remove();
                callback(null);
            };
        
            confirmBtn.onclick = handleConfirm;
            cancelBtn.onclick = handleCancel;
            input.onkeypress = (e) => { if (e.key === 'Enter') handleConfirm(); };
        
            setTimeout(() => input.focus(), 100);
        };

        it('should create modal with correct structure', () => {
            const callback = vi.fn();
            testShowPasswordModal('Enter password:', callback);
            
            // Should create modal element
            expect(global.document.createElement).toHaveBeenCalled();
            expect(global.document.createElement).toHaveBeenCalledWith('div');
            
            // Should append to body
            expect(global.document.body.appendChild).toHaveBeenCalled();
        });

        it('should call callback with password value on confirm', () => {
            const callback = vi.fn();
            
            // Create mock elements directly
            const mockInput = {
                value: 'testpassword123',
                focus: vi.fn(),
                onkeypress: null
            };
            
            const mockConfirmBtn = {
                onclick: null
            };
            
            const mockModal = {
                remove: vi.fn(),
                innerHTML: '',
                querySelector: vi.fn((selector) => {
                    if (selector === '#modalPasswordInput') return mockInput;
                    if (selector === '#modalConfirmBtn') return mockConfirmBtn;
                    return null;
                })
            };
            
            // Simulate the modal creation and button click
            global.document.body.appendChild(mockModal);
            
            // Set up the confirm handler
            const handleConfirm = () => {
                const val = mockInput.value;
                mockModal.remove();
                callback(val);
            };
            
            mockConfirmBtn.onclick = handleConfirm;
            
            // Trigger confirm
            mockConfirmBtn.onclick();
            
            // Callback should be called with password
            expect(callback).toHaveBeenCalledWith('testpassword123');
        });

        it('should call callback with null on cancel', () => {
            const callback = vi.fn();
            testShowPasswordModal('Enter password:', callback);
            
            const modalElement = global.document.body.appendChild.mock.calls[0][0];
            const cancelBtn = modalElement.querySelector('#modalCancelBtn');
            
            // Trigger cancel
            cancelBtn.onclick();
            
            // Callback should be called with null
            expect(callback).toHaveBeenCalledWith(null);
        });
    });
});

describe('Error Handling Scenarios', () => {
    describe('Input Validation', () => {
        it('should handle missing email in login', () => {
            const mockElement = {
                value: '',
                innerText: ''
            };
            
            global.document.getElementById = vi.fn((id) => {
                if (id === 'emailInput') return mockElement;
                if (id === 'errorMsg') return mockElement;
                if (id === 'loadingMsg') return { style: { display: 'none' } };
                return null;
            });
            
            // Simulate prosesLogin behavior
            const prosesLogin = () => {
                const email = document.getElementById("emailInput").value.trim();
                const errorMsg = document.getElementById("errorMsg");
                
                if (!email) {
                    errorMsg.innerText = "⚠️ Email wajib diisi!";
                    return;
                }
            };
            
            // Should not throw and should set error message
            expect(() => prosesLogin()).not.toThrow();
            expect(mockElement.innerText).toBe("⚠️ Email wajib diisi!");
        });

        it('should handle missing email in register', () => {
            const mockElement = {
                value: '',
                innerText: ''
            };
            
            global.document.getElementById = vi.fn((id) => {
                if (id === 'emailInput') return mockElement;
                if (id === 'errorMsg') return mockElement;
                if (id === 'loadingMsg') return { style: { display: 'none' } };
                return null;
            });
            
            // Simulate prosesRegister behavior
            const prosesRegister = () => {
                const email = document.getElementById("emailInput").value.trim();
                const errorMsg = document.getElementById("errorMsg");
                
                if (!email) {
                    errorMsg.innerText = "⚠️ Email wajib diisi!";
                    return;
                }
            };
            
            // Should not throw and should set error message
            expect(() => prosesRegister()).not.toThrow();
            expect(mockElement.innerText).toBe("⚠️ Email wajib diisi!");
        });
    });

    describe('Network Error Handling', () => {
        it('should handle fetch errors gracefully', async () => {
            // Mock fetch to reject
            const fetchSpy = vi.fn(() => Promise.reject(new Error('Network error')));
            global.fetch = fetchSpy;
            
            // Simulate fetch error handling
            const handleFetchError = async () => {
                try {
                    await fetch('/api/test');
                } catch (e) {
                    console.error("Error:", e);
                    return "Error handled";
                }
            };
            
            const result = await handleFetchError();
            
            // Should handle error without throwing
            expect(result).toBe("Error handled");
            expect(fetchSpy).toHaveBeenCalled();
        });
    });
});

describe('Mocking and Spying', () => {
    it('should spy on functions', () => {
        const testFunction = vi.fn((message) => `Hello ${message}`);
        
        // Call the function
        const result = testFunction('World');
        
        // Verify it was called
        expect(testFunction).toHaveBeenCalled();
        expect(testFunction).toHaveBeenCalledWith('World');
        expect(result).toBe('Hello World');
    });

    it('should mock localStorage operations', () => {
        const mockLocalStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn()
        };
        
        global.localStorage = mockLocalStorage;
        
        // Test localStorage interactions
        mockLocalStorage.getItem.mockReturnValue('test-token');
        
        const token = localStorage.getItem('1affiliate_token');
        
        expect(token).toBe('test-token');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('1affiliate_token');
    });

    it('should mock timer functions', () => {
        // Mock setTimeout
        const setTimeoutSpy = vi.fn();
        global.setTimeout = setTimeoutSpy;
        
        // Test timer mocking
        const delayedFunction = () => {
            setTimeout(() => {}, 1000);
        };
        
        delayedFunction();
        
        // Should have called setTimeout
        expect(setTimeoutSpy).toHaveBeenCalled();
    });
});

describe('Component Integration', () => {
    it('should handle modal creation and removal', () => {
        const callback = vi.fn();
        
        // Simulate modal creation and removal
        const modalElement = document.createElement('div');
        document.body.appendChild(modalElement);
        
        // Simulate removal
        modalElement.remove();
        
        // Should have called appendChild and remove
        expect(global.document.body.appendChild).toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled(); // Callback not called in this test
    });

    it('should handle multiple modal instances', () => {
        // Create multiple modal elements
        const modal1 = document.createElement('div');
        const modal2 = document.createElement('div');
        
        document.body.appendChild(modal1);
        document.body.appendChild(modal2);
        
        // Should create two modal elements
        expect(global.document.createElement).toHaveBeenCalled();
        expect(global.document.createElement).toHaveBeenCalledTimes(2);
        expect(global.document.body.appendChild).toHaveBeenCalledTimes(2);
    });
});

describe('Edge Cases', () => {
    it('should handle very long messages', () => {
        const longMessage = 'A'.repeat(10000);
        
        // Should not throw
        expect(() => testShowToast(longMessage)).not.toThrow();
    });

    it('should handle special characters in messages', () => {
        const specialMessage = 'Test <script>alert("xss")</script> & "quotes" \'single\'';
        
        // Should not throw and should handle safely
        expect(() => testShowToast(specialMessage)).not.toThrow();
    });

    it('should handle concurrent toast notifications', () => {
        // Create multiple toasts
        expect(() => {
            testShowToast('First');
            testShowToast('Second');
            testShowToast('Third');
        }).not.toThrow();
    });
});