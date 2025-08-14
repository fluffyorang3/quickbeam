import { PatternRecognitionEngine } from '../../src/content/pattern-recognition-engine';
import { PatternType } from '../../src/types';

describe('Enhanced Pattern Recognition Engine - Execution Cycle 5', () => {
  let engine: PatternRecognitionEngine;

  beforeEach(async () => {
    engine = new PatternRecognitionEngine();
    await engine.initialize();
  });

  afterEach(() => {
    engine.cleanup();
  });

  describe('Enhanced Date/Time Parsing', () => {
    test('should detect natural language dates', async () => {
      const text = 'Team meeting Thursday at 3 PM, Conference Room B';
      const patterns = await engine.detectPatterns(text);
      
      const dateTimePatterns = patterns.filter(p => p.type === PatternType.DATE_TIME);
      expect(dateTimePatterns).toHaveLength(1);
      
      const pattern = dateTimePatterns[0];
      expect(pattern.metadata.isEvent).toBe(true);
      expect(pattern.metadata.suggestedActions).toContain('calendar');
    });

    test('should detect relative dates', async () => {
      const text = 'Meeting tomorrow at 2:30 PM';
      const patterns = await engine.detectPatterns(text);
      
      const dateTimePatterns = patterns.filter(p => p.type === PatternType.DATE_TIME);
      expect(dateTimePatterns).toHaveLength(1);
      
      const pattern = dateTimePatterns[0];
      expect(pattern.metadata.isRelative).toBe(true);
      expect(pattern.metadata.parsed.reference).toBe('tomorrow');
    });

    test('should detect ISO dates', async () => {
      const text = 'Event on 2024-12-25T18:00:00Z';
      const patterns = await engine.detectPatterns(text);
      
      const dateTimePatterns = patterns.filter(p => p.type === PatternType.DATE_TIME);
      expect(dateTimePatterns).toHaveLength(1);
      
      const pattern = dateTimePatterns[0];
      expect(pattern.metadata.type).toBe('iso');
      expect(pattern.metadata.parsed.isValid).toBe(true);
    });

    test('should detect event-specific patterns', async () => {
      const text = 'Weekly standup every Monday at 9 AM';
      const patterns = await engine.detectPatterns(text);
      
      const dateTimePatterns = patterns.filter(p => p.type === PatternType.DATE_TIME);
      expect(dateTimePatterns).toHaveLength(1);
      
      const pattern = dateTimePatterns[0];
      expect(pattern.metadata.isEvent).toBe(true);
      expect(pattern.metadata.parsed.eventType).toBe('standup');
    });
  });

  describe('Enhanced Tracking Number Detection', () => {
    test('should detect international carrier tracking numbers', async () => {
      const text = 'Package tracking: 1Z999AA1234567890 (UPS) and 1234567890123456789012 (USPS)';
      const patterns = await engine.detectPatterns(text);
      
      const trackingPatterns = patterns.filter(p => p.type === PatternType.TRACKING_NUMBER);
      expect(trackingPatterns).toHaveLength(2);
      
      const upsPattern = trackingPatterns.find(p => p.metadata.carrier === 'ups');
      expect(upsPattern).toBeDefined();
      expect(upsPattern?.metadata.country).toBe('US');
      expect(upsPattern?.metadata.trackingUrl).toContain('ups.com');
      
      const uspsPattern = trackingPatterns.find(p => p.metadata.carrier === 'usps');
      expect(uspsPattern).toBeDefined();
      expect(uspsPattern?.metadata.country).toBe('US');
      expect(uspsPattern?.metadata.trackingUrl).toContain('usps.com');
    });

    test('should detect European carrier tracking numbers', async () => {
      const text = 'Royal Mail tracking: AB123456789GB';
      const patterns = await engine.detectPatterns(text);
      
      const trackingPatterns = patterns.filter(p => p.type === PatternType.TRACKING_NUMBER);
      expect(trackingPatterns).toHaveLength(1);
      
      const pattern = trackingPatterns[0];
      expect(pattern.metadata.carrier).toBe('royal mail');
      expect(pattern.metadata.country).toBe('GB');
      expect(pattern.metadata.trackingUrl).toContain('royalmail.com');
    });

    test('should detect e-commerce tracking numbers', async () => {
      const text = 'Amazon order: TBA1234567890123';
      const patterns = await engine.detectPatterns(text);
      
      const trackingPatterns = patterns.filter(p => p.type === PatternType.TRACKING_NUMBER);
      expect(trackingPatterns).toHaveLength(1);
      
      const pattern = trackingPatterns[0];
      expect(pattern.metadata.carrier).toBe('amazon');
      expect(pattern.metadata.trackingUrl).toContain('amazon.com');
    });
  });

  describe('Enhanced Address Parsing', () => {
    test('should detect and parse US addresses', async () => {
      const text = 'Office at 123 Main Street, New York, NY 10001';
      const patterns = await engine.detectPatterns(text);
      
      const addressPatterns = patterns.filter(p => p.type === PatternType.ADDRESS);
      expect(addressPatterns).toHaveLength(1);
      
      const pattern = addressPatterns[0];
      expect(pattern.metadata.country).toBe('US');
      expect(pattern.metadata.format).toBe('US');
      expect(pattern.metadata.components.street).toBe('123 Main Street');
      expect(pattern.metadata.components.city).toBe('New York');
      expect(pattern.metadata.components.state).toBe('NY');
      expect(pattern.metadata.components.zip).toBe('10001');
    });

    test('should detect and parse UK addresses', async () => {
      const text = 'Home at 10 Downing Street, London, SW1A 2AA';
      const patterns = await engine.detectPatterns(text);
      
      const addressPatterns = patterns.filter(p => p.type === PatternType.ADDRESS);
      expect(addressPatterns).toHaveLength(1);
      
      const pattern = addressPatterns[0];
      expect(pattern.metadata.country).toBe('GB');
      expect(pattern.metadata.format).toBe('UK');
      expect(pattern.metadata.components.street).toBe('10 Downing Street');
      expect(pattern.metadata.components.city).toBe('London');
      expect(pattern.metadata.components.zip).toBe('SW1A 2AA');
    });

    test('should detect and parse European addresses', async () => {
      const text = 'German office: Musterstraße 123, Berlin, 10115';
      const patterns = await engine.detectPatterns(text);
      
      const addressPatterns = patterns.filter(p => p.type === PatternType.ADDRESS);
      expect(addressPatterns).toHaveLength(1);
      
      const pattern = addressPatterns[0];
      expect(pattern.metadata.country).toBe('DE');
      expect(pattern.metadata.format).toBe('European');
      expect(pattern.metadata.components.street).toBe('Musterstraße 123');
      expect(pattern.metadata.components.city).toBe('Berlin');
      expect(pattern.metadata.components.zip).toBe('10115');
    });

    test('should detect international postal codes', async () => {
      const text = 'Postal codes: 12345 (US), SW1A 2AA (UK), 10115 (DE)';
      const patterns = await engine.detectPatterns(text);
      
      const addressPatterns = patterns.filter(p => p.type === PatternType.ADDRESS);
      expect(addressPatterns).toHaveLength(3);
      
      const usPattern = addressPatterns.find(p => p.metadata.type === 'postal_code' && p.metadata.country === 'US');
      expect(usPattern).toBeDefined();
      
      const ukPattern = addressPatterns.find(p => p.metadata.type === 'postal_code' && p.metadata.country === 'GB');
      expect(ukPattern).toBeDefined();
      
      const dePattern = addressPatterns.find(p => p.metadata.type === 'postal_code' && p.metadata.country === 'DE');
      expect(dePattern).toBeDefined();
    });
  });

  describe('Enhanced Currency Detection', () => {
    test('should detect international currency symbols', async () => {
      const text = 'Prices: $100, €85, £75, ¥15000, ₹7500';
      const patterns = await engine.detectPatterns(text);
      
      const currencyPatterns = patterns.filter(p => p.type === PatternType.CURRENCY);
      expect(currencyPatterns).toHaveLength(5);
      
      const usdPattern = currencyPatterns.find(p => p.metadata.symbol === '$');
      expect(usdPattern?.metadata.code).toBe('USD');
      expect(usdPattern?.metadata.country).toBe('US');
      
      const eurPattern = currencyPatterns.find(p => p.metadata.symbol === '€');
      expect(eurPattern?.metadata.code).toBe('EUR');
      expect(eurPattern?.metadata.country).toBe('EU');
    });

    test('should detect currency codes', async () => {
      const text = 'Amounts: USD 100, EUR 85, GBP 75';
      const patterns = await engine.detectPatterns(text);
      
      const currencyPatterns = patterns.filter(p => p.type === PatternType.CURRENCY);
      expect(currencyPatterns).toHaveLength(3);
      
      currencyPatterns.forEach(pattern => {
        expect(pattern.metadata.code).toBeDefined();
        expect(pattern.metadata.conversionRates).toBeDefined();
      });
    });

    test('should detect written currency amounts', async () => {
      const text = 'Cost: 100 dollars, 85 euros, 75 pounds';
      const patterns = await engine.detectPatterns(text);
      
      const currencyPatterns = patterns.filter(p => p.type === PatternType.CURRENCY);
      expect(currencyPatterns).toHaveLength(3);
    });
  });

  describe('Enhanced Unit Detection', () => {
    test('should detect comprehensive unit types', async () => {
      const text = 'Measurements: 5 kg, 10 km, 2.5 L, 25°C, 100 sq ft, 50 km/h';
      const patterns = await engine.detectPatterns(text);
      
      const unitPatterns = patterns.filter(p => p.type === PatternType.UNIT);
      expect(unitPatterns).toHaveLength(6);
      
      const weightPattern = unitPatterns.find(p => p.metadata.category === 'weight');
      expect(weightPattern?.metadata.unit).toBe('kg');
      expect(weightPattern?.metadata.conversions).toBeDefined();
      
      const distancePattern = unitPatterns.find(p => p.metadata.category === 'distance');
      expect(distancePattern?.metadata.unit).toBe('km');
      
      const temperaturePattern = unitPatterns.find(p => p.metadata.category === 'temperature');
      expect(temperaturePattern?.metadata.unit).toBe('°C');
    });

    test('should provide unit conversions', async () => {
      const text = 'Weight: 10 kg';
      const patterns = await engine.detectPatterns(text);
      
      const unitPattern = patterns.find(p => p.type === PatternType.UNIT);
      expect(unitPattern).toBeDefined();
      
      const conversions = unitPattern?.metadata.conversions;
      expect(conversions).toBeDefined();
      expect(conversions?.lb).toBe(22.0462); // 10 kg * 2.20462
      expect(conversions?.g).toBe(10000); // 10 kg * 1000
    });

    test('should suggest preferred units', async () => {
      const text = 'Distance: 5000 m';
      const patterns = await engine.detectPatterns(text);
      
      const unitPattern = patterns.find(p => p.type === PatternType.UNIT);
      expect(unitPattern).toBeDefined();
      
      const preferredUnits = unitPattern?.metadata.preferredUnits;
      expect(preferredUnits).toContain('km');
      expect(preferredUnits).toContain('mi');
    });
  });

  describe('Enhanced Email Validation', () => {
    test('should detect international email domains', async () => {
      const text = 'Contacts: john@company.co.uk, maria@firma.de, pierre@entreprise.fr';
      const patterns = await engine.detectPatterns(text);
      
      const emailPatterns = patterns.filter(p => p.type === PatternType.EMAIL);
      expect(emailPatterns).toHaveLength(3);
      
      const ukEmail = emailPatterns.find(p => p.metadata.domain === 'company.co.uk');
      expect(ukEmail?.metadata.country).toBe('GB');
      
      const deEmail = emailPatterns.find(p => p.metadata.domain === 'firma.de');
      expect(deEmail?.metadata.country).toBe('DE');
      
      const frEmail = emailPatterns.find(p => p.metadata.domain === 'entreprise.fr');
      expect(frEmail?.metadata.country).toBe('FR');
    });

    test('should identify corporate vs disposable emails', async () => {
      const text = 'Emails: john@company.com, temp@tempmail.com';
      const patterns = await engine.detectPatterns(text);
      
      const emailPatterns = patterns.filter(p => p.type === PatternType.EMAIL);
      expect(emailPatterns).toHaveLength(2);
      
      const corporateEmail = emailPatterns.find(p => p.metadata.domain === 'company.com');
      expect(corporateEmail?.metadata.isCorporate).toBe(true);
      expect(corporateEmail?.metadata.isDisposable).toBe(false);
      
      const disposableEmail = emailPatterns.find(p => p.metadata.domain === 'tempmail.com');
      expect(disposableEmail?.metadata.isDisposable).toBe(true);
      expect(disposableEmail?.metadata.isCorporate).toBe(false);
    });

    test('should suggest appropriate actions for emails', async () => {
      const text = 'Contact: ceo@corporation.com';
      const patterns = await engine.detectPatterns(text);
      
      const emailPattern = patterns.find(p => p.type === PatternType.EMAIL);
      expect(emailPattern).toBeDefined();
      
      const suggestedActions = emailPattern?.metadata.suggestedActions;
      expect(suggestedActions).toContain('email');
      expect(suggestedActions).toContain('copy');
      expect(suggestedActions).toContain('contact');
      expect(suggestedActions).toContain('save');
    });
  });

  describe('Enhanced Phone Number Detection', () => {
    test('should detect international phone numbers', async () => {
      const text = 'Phone: +1-555-123-4567, +44 20 7946 0958, +49 30 12345678';
      const patterns = await engine.detectPatterns(text);
      
      const phonePatterns = patterns.filter(p => p.type === PatternType.PHONE);
      expect(phonePatterns).toHaveLength(3);
      
      const usPhone = phonePatterns.find(p => p.metadata.country === 'US');
      expect(usPhone?.metadata.isInternational).toBe(true);
      expect(usPhone?.metadata.countryCode).toBe('1');
      
      const ukPhone = phonePatterns.find(p => p.metadata.country === 'GB');
      expect(ukPhone?.metadata.countryCode).toBe('44');
      
      const dePhone = phonePatterns.find(p => p.metadata.country === 'DE');
      expect(dePhone?.metadata.countryCode).toBe('49');
    });

    test('should format phone numbers correctly', async () => {
      const text = 'Call: 555-123-4567';
      const patterns = await engine.detectPatterns(text);
      
      const phonePattern = patterns.find(p => p.type === PatternType.PHONE);
      expect(phonePattern).toBeDefined();
      
      const formatted = phonePattern?.metadata.formatted;
      expect(formatted).toBe('(555) 123-4567');
    });
  });

  describe('Performance and Accuracy', () => {
    test('should maintain performance within thresholds', async () => {
      const startTime = performance.now();
      const text = 'Complex text with multiple patterns: $100, 5 kg, john@email.com, 123 Main St, NY 10001, +1-555-123-4567, meeting tomorrow at 3 PM, 1Z999AA1234567890';
      
      const patterns = await engine.detectPatterns(text);
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(50); // PATTERN_DETECTION threshold
      expect(patterns.length).toBeGreaterThan(5);
    });

    test('should achieve high accuracy for known patterns', async () => {
      const testCases = [
        { text: '$100', expectedType: PatternType.CURRENCY, expectedConfidence: 0.8 },
        { text: '5 kg', expectedType: PatternType.UNIT, expectedConfidence: 0.8 },
        { text: 'john@email.com', expectedType: PatternType.EMAIL, expectedConfidence: 0.7 },
        { text: '123 Main St, NY 10001', expectedType: PatternType.ADDRESS, expectedConfidence: 0.6 },
        { text: '+1-555-123-4567', expectedType: PatternType.PHONE, expectedConfidence: 0.6 },
        { text: 'meeting tomorrow at 3 PM', expectedType: PatternType.DATE_TIME, expectedConfidence: 0.7 },
        { text: '1Z999AA1234567890', expectedType: PatternType.TRACKING_NUMBER, expectedConfidence: 0.8 }
      ];

      for (const testCase of testCases) {
        const patterns = await engine.detectPatterns(testCase.text);
        const pattern = patterns.find(p => p.type === testCase.expectedType);
        
        expect(pattern).toBeDefined();
        expect(pattern?.confidence).toBeGreaterThanOrEqual(testCase.expectedConfidence);
      }
    });
  });
});
