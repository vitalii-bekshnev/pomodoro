/**
 * Unit tests for localStorage utilities
 */

import { getStorageItem, setStorageItem, removeStorageItem } from '../../../src/utils/storage';

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('setStorageItem', () => {
    it('should store string values', () => {
      setStorageItem('test-key', 'test-value');
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '"test-value"');
    });

    it('should store number values', () => {
      setStorageItem('num-key', 42);
      expect(localStorage.setItem).toHaveBeenCalledWith('num-key', '42');
    });

    it('should store boolean values', () => {
      setStorageItem('bool-key', true);
      expect(localStorage.setItem).toHaveBeenCalledWith('bool-key', 'true');
    });

    it('should store object values', () => {
      const obj = { name: 'Test', value: 123 };
      setStorageItem('obj-key', obj);
      expect(localStorage.setItem).toHaveBeenCalledWith('obj-key', JSON.stringify(obj));
    });

    it('should store array values', () => {
      const arr = [1, 2, 3, 4, 5];
      setStorageItem('arr-key', arr);
      expect(localStorage.setItem).toHaveBeenCalledWith('arr-key', JSON.stringify(arr));
    });

    it('should handle null values', () => {
      setStorageItem('null-key', null);
      expect(localStorage.setItem).toHaveBeenCalledWith('null-key', 'null');
    });
  });

  describe('getStorageItem', () => {
    it('should retrieve string values', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('"test-value"');
      const result = getStorageItem('test-key');
      expect(result).toBe('test-value');
    });

    it('should retrieve number values', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('42');
      const result = getStorageItem('num-key');
      expect(result).toBe(42);
    });

    it('should retrieve boolean values', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');
      const result = getStorageItem('bool-key');
      expect(result).toBe(true);
    });

    it('should retrieve object values', () => {
      const obj = { name: 'Test', value: 123 };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(obj));
      const result = getStorageItem('obj-key');
      expect(result).toEqual(obj);
    });

    it('should retrieve array values', () => {
      const arr = [1, 2, 3, 4, 5];
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(arr));
      const result = getStorageItem('arr-key');
      expect(result).toEqual(arr);
    });

    it('should return null for non-existent keys', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      const result = getStorageItem('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid-json{');
      const result = getStorageItem('invalid-key');
      expect(result).toBeNull();
    });

    it('should handle localStorage exceptions gracefully', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      const result = getStorageItem('error-key');
      expect(result).toBeNull();
    });
  });

  describe('removeStorageItem', () => {
    it('should remove items from storage', () => {
      removeStorageItem('test-key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle removal of non-existent keys', () => {
      removeStorageItem('non-existent');
      expect(localStorage.removeItem).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('round-trip storage', () => {
    it('should maintain data integrity through set and get', () => {
      const testData = {
        string: 'hello',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: { a: 1, b: { c: 2 } },
      };

      // Mock localStorage behavior
      const store: Record<string, string> = {};
      (localStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
        store[key] = value;
      });
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => store[key] || null);

      setStorageItem('test-data', testData);
      const retrieved = getStorageItem('test-data');
      expect(retrieved).toEqual(testData);
    });
  });
});

