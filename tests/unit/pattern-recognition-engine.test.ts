import { PatternRecognitionEngine } from '../../src/content/pattern-recognition-engine';
import { PatternType } from '../../src/types';

describe('PatternRecognitionEngine', () => {
  let engine: PatternRecognitionEngine;

  beforeEach(() => {
    engine = new PatternRecognitionEngine();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(engine.initialize()).resolves.not.toThrow();
    });

    it('should not reinitialize if already initialized', async () => {
      await engine.initialize();
      const consoleSpy = jest.spyOn(console, 'log');
      
      await engine.initialize();
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw error if initialization fails', async () => {
      const mockEngine = new PatternRecognitionEngine();
      jest.spyOn(mockEngine as any, 'initializePatterns').mockImplementation(() => {
        throw new Error('Pattern initialization failed');
      });

      await expect(mockEngine.initialize()).rejects.toThrow('Pattern initialization failed');
    });
  });

  describe('email detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect valid email addresses', async () => {
      const text = 'Contact us at test@example.com or support@company.org';
      const patterns = await engine.detectPatterns(text);

      const emailPatterns = patterns.filter(p => p.type === PatternType.EMAIL);
      expect(emailPatterns).toHaveLength(2);
      expect(emailPatterns[0].match).toBe('test@example.com');
      expect(emailPatterns[1].match).toBe('support@company.org');
    });

    it('should not detect invalid email addresses', async () => {
      const text = 'Invalid emails: test@, @example.com, test.example.com';
      const patterns = await engine.detectPatterns(text);

      const emailPatterns = patterns.filter(p => p.type === PatternType.EMAIL);
      expect(emailPatterns).toHaveLength(0);
    });

    it('should handle edge cases in email detection', async () => {
      const text = 'Emails: test+tag@example.com, user.name@domain.co.uk';
      const patterns = await engine.detectPatterns(text);

      const emailPatterns = patterns.filter(p => p.type === PatternType.EMAIL);
      expect(emailPatterns).toHaveLength(2);
    });
  });

  describe('phone number detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect various phone number formats', async () => {
      const text = 'Call us at (555) 123-4567 or +1-555-123-4567 or 555.123.4567';
      const patterns = await engine.detectPatterns(text);

      const phonePatterns = patterns.filter(p => p.type === PatternType.PHONE);
      expect(phonePatterns).toHaveLength(3);
    });

    it('should detect international phone numbers', async () => {
      const text = 'International: +44 20 7946 0958 or +81 3-1234-5678';
      const patterns = await engine.detectPatterns(text);

      const phonePatterns = patterns.filter(p => p.type === PatternType.PHONE);
      expect(phonePatterns).toHaveLength(2);
    });

    it('should not detect non-phone number sequences', async () => {
      const text = 'Numbers: 12345, 999-999-9999, 123-456-789';
      const patterns = await engine.detectPatterns(text);

      const phonePatterns = patterns.filter(p => p.type === PatternType.PHONE);
      expect(phonePatterns).toHaveLength(0);
    });
  });

  describe('URL detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect various URL formats', async () => {
      const text = 'Visit https://example.com or http://test.org/path?param=value';
      const patterns = await engine.detectPatterns(text);

      const urlPatterns = patterns.filter(p => p.type === PatternType.URL);
      expect(urlPatterns).toHaveLength(2);
    });

    it('should detect URLs with subdomains and paths', async () => {
      const text = 'Links: https://www.example.com/path/to/page and https://api.example.org';
      const patterns = await engine.detectPatterns(text);

      const urlPatterns = patterns.filter(p => p.type === PatternType.URL);
      expect(urlPatterns).toHaveLength(2);
    });

    it('should not detect invalid URLs', async () => {
      const text = 'Invalid: http://, https://, ftp://example';
      const patterns = await engine.detectPatterns(text);

      const urlPatterns = patterns.filter(p => p.type === PatternType.URL);
      expect(urlPatterns).toHaveLength(0);
    });
  });

  describe('tracking number detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect UPS tracking numbers', async () => {
      const text = 'UPS tracking: 1Z999AA10123456784';
      const patterns = await engine.detectPatterns(text);

      const trackingPatterns = patterns.filter(p => p.type === PatternType.TRACKING_NUMBER);
      expect(trackingPatterns).toHaveLength(1);
      expect(trackingPatterns[0].match).toBe('1Z999AA10123456784');
    });

    it('should detect FedEx tracking numbers', async () => {
      const text = 'FedEx tracking: 123456789012 or 123456789012345';
      const patterns = await engine.detectPatterns(text);

      const trackingPatterns = patterns.filter(p => p.type === PatternType.TRACKING_NUMBER);
      expect(trackingPatterns).toHaveLength(2);
    });

    it('should detect USPS tracking numbers', async () => {
      const text = 'USPS tracking: 9400100000000000000000 or 9205500000000000000000';
      const patterns = await engine.detectPatterns(text);

      const trackingPatterns = patterns.filter(p => p.type === PatternType.TRACKING_NUMBER);
      expect(trackingPatterns).toHaveLength(2);
    });

    it('should detect DHL tracking numbers', async () => {
      const text = 'DHL tracking: 1234567890 or 1234567890123456789012';
      const patterns = await engine.detectPatterns(text);

      const trackingPatterns = patterns.filter(p => p.type === PatternType.TRACKING_NUMBER);
      expect(trackingPatterns).toHaveLength(2);
    });
  });

  describe('address detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect street addresses', async () => {
      const text = 'Address: 123 Main Street, New York, NY 10001';
      const patterns = await engine.detectPatterns(text);

      const addressPatterns = patterns.filter(p => p.type === PatternType.ADDRESS);
      expect(addressPatterns).toHaveLength(1);
    });

    it('should detect addresses with abbreviations', async () => {
      const text = 'Location: 456 Oak Ave, Los Angeles, CA 90210';
      const patterns = await engine.detectPatterns(text);

      const addressPatterns = patterns.filter(p => p.type === PatternType.ADDRESS);
      expect(addressPatterns).toHaveLength(1);
    });

    it('should detect international addresses', async () => {
      const text = 'UK Address: 10 Downing Street, London, SW1A 2AA';
      const patterns = await engine.detectPatterns(text);

      const addressPatterns = patterns.filter(p => p.type === PatternType.ADDRESS);
      expect(addressPatterns).toHaveLength(1);
    });
  });

  describe('date and time detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect various date formats', async () => {
      const text = 'Dates: Jan 15, 2024, 12/25/2024, 2024-12-25';
      const patterns = await engine.detectPatterns(text);

      const dateTimePatterns = patterns.filter(p => p.type === PatternType.DATE_TIME);
      expect(dateTimePatterns).toHaveLength(3);
    });

    it('should detect time expressions', async () => {
      const text = 'Times: Monday at 3 PM, Tomorrow at 2:30 PM';
      const patterns = await engine.detectPatterns(text);

      const dateTimePatterns = patterns.filter(p => p.type === PatternType.DATE_TIME);
      expect(dateTimePatterns).toHaveLength(2);
    });
  });

  describe('currency detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect various currency symbols', async () => {
      const text = 'Prices: $100.50, €75.25, £200.00, ¥1000';
      const patterns = await engine.detectPatterns(text);

      const currencyPatterns = patterns.filter(p => p.type === PatternType.CURRENCY);
      expect(currencyPatterns).toHaveLength(4);
    });

    it('should detect written currency amounts', async () => {
      const text = 'Costs: 100 dollars, 50 euros, 25 pounds';
      const patterns = await engine.detectPatterns(text);

      const currencyPatterns = patterns.filter(p => p.type === PatternType.CURRENCY);
      expect(currencyPatterns).toHaveLength(3);
    });
  });

  describe('unit detection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should detect weight units', async () => {
      const text = 'Weights: 5 kg, 10 pounds, 500 grams';
      const patterns = await engine.detectPatterns(text);

      const unitPatterns = patterns.filter(p => p.type === PatternType.UNIT);
      expect(unitPatterns).toHaveLength(3);
    });

    it('should detect distance units', async () => {
      const text = 'Distances: 10 km, 5 miles, 100 meters';
      const patterns = await engine.detectPatterns(text);

      const unitPatterns = patterns.filter(p => p.type === PatternType.UNIT);
      expect(unitPatterns).toHaveLength(3);
    });

    it('should detect temperature units', async () => {
      const text = 'Temperatures: 25°C, 98.6°F, 0 celsius';
      const patterns = await engine.detectPatterns(text);

      const unitPatterns = patterns.filter(p => p.type === PatternType.UNIT);
      expect(unitPatterns).toHaveLength(3);
    });
  });

  describe('performance', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should complete pattern detection within performance threshold', async () => {
      const longText = 'This is a very long text with multiple patterns. ' +
        'Contact us at test@example.com or call (555) 123-4567. ' +
        'Visit https://example.com for more information. ' +
        'Our address is 123 Main Street, New York, NY 10001. ' +
        'Meeting on Monday at 3 PM. Price: $100.50. Weight: 5 kg. '.repeat(10);

      const startTime = performance.now();
      const patterns = await engine.detectPatterns(longText);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete within 50ms
      expect(patterns.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should throw error if not initialized', async () => {
      await expect(engine.detectPatterns('test text')).rejects.toThrow(
        'PatternRecognitionEngine not initialized'
      );
    });

    it('should handle empty text gracefully', async () => {
      await engine.initialize();
      const patterns = await engine.detectPatterns('');
      expect(patterns).toEqual([]);
    });

    it('should handle text with no patterns', async () => {
      await engine.initialize();
      const text = 'This is just regular text with no special patterns to detect.';
      const patterns = await engine.detectPatterns(text);
      expect(patterns).toEqual([]);
    });
  });
});
