import { PATTERN_REGEX, PERFORMANCE_THRESHOLDS } from '../constants';
import { PatternMatch, PatternType } from '../types';

export class PatternRecognitionEngine {
  private isInitialized = false;
  private addressPatterns: RegExp[] = [];
  private dateTimePatterns: RegExp[] = [];
  private currencyPatterns: RegExp[] = [];
  private unitPatterns: RegExp[] = [];
  private trackingPatterns: Map<string, RegExp> = new Map();
  private internationalAddressPatterns: RegExp[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize pattern recognition rules
      this.initializePatterns();
      
      this.isInitialized = true;
      console.log('PatternRecognitionEngine initialized with advanced patterns');
    } catch (error) {
      console.error('Failed to initialize PatternRecognitionEngine:', error);
      throw error;
    }
  }

  private initializePatterns(): void {
    // Enhanced address patterns with international support
    this.addressPatterns = [
      // US/Canada addresses
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter)\b/i,
      /\b[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter)\s+\d+\b/i,
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter)\s*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/i,
      
      // UK addresses
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter|Close|Crescent|Grove|Hill|Mews|Park|Row|Square|Walk)\b/i,
      /\b[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter|Close|Crescent|Grove|Hill|Mews|Park|Row|Square|Walk)\s+\d+\b/i,
      
      // European addresses
      /\b[A-Za-z\s]+(?:straße|strasse|straat|rue|calle|via|ulica|utca)\s+\d+[a-z]?\b/gi,
      /\b\d+\s+[A-Za-z\s]+(?:straße|strasse|straat|rue|calle|via|ulica|utca)\b/gi,
      
      // Generic international addresses
      /\b\d+\s+[A-Za-z\s]+\s*,\s*[A-Za-z\s]+\s*,\s*[A-Za-z\s]+\s*,\s*\d{4,5}\b/gi,
      /\b[A-Za-z\s]+\s+\d+\s*,\s*[A-Za-z\s]+\s*,\s*[A-Za-z\s]+\s*,\s*\d{4,5}\b/gi
    ];

    // International address patterns
    this.internationalAddressPatterns = [
      // Postal codes from various countries
      /\b[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b/gi,  // UK
      /\b\d{5}(?:-\d{4})?\b/gi,                   // US
      /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi,          // Canada
      /\b\d{4}\s?[A-Z]{2}\b/gi,                   // Netherlands
      /\b\d{5}\b/gi,                              // Germany, France
      /\b\d{4}\b/gi,                              // Switzerland
      /\b\d{3}\s?\d{2}\b/gi,                      // Poland
      /\b\d{6}\b/gi,                              // India
      /\b\d{4}\b/gi,                              // Australia
      /\b\d{3}-\d{4}\b/gi                         // Japan
    ];

    // Enhanced date and time patterns with natural language processing
    this.dateTimePatterns = [
      // Standard date formats
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/i,
      /\b\d{1,2}\/(\d{1,2})\/\d{2,4}\b/,
      /\b\d{1,2}-(\d{1,2})-\d{2,4}\b/,
      /\b\d{4}-(\d{1,2})-(\d{1,2})\b/,
      
      // Natural language dates
      /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(?:at\s+)?\d{1,2}:(?:\d{2})?\s*(?:AM|PM|am|pm)?\b/i,
      /\b(?:Today|Tomorrow|Yesterday)\s+(?:at\s+)?\d{1,2}:(?:\d{2})?\s*(?:AM|PM|am|pm)?\b/i,
      /\b(?:Next|Last)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i,
      /\b(?:This|Next|Last)\s+(?:week|month|year)\b/i,
      
      // Relative time expressions
      /\b(?:in\s+)?(\d+)\s+(?:minutes?|mins?|hours?|days?|weeks?|months?|years?)\s+(?:from\s+now|ago|later)\b/i,
      /\b(?:at\s+)?(\d{1,2}):(\d{2})\s*(?:AM|PM|am|pm)?\b/i,
      /\b(?:noon|midnight|midday)\b/i,
      
      // ISO and international formats
      /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})?\b/,
      /\b\d{2}\.\d{2}\.\d{4}\b/,
      /\b\d{2}\/\d{2}\/\d{4}\b/,
      
      // Event-specific patterns
      /\b(?:meeting|appointment|call|event)\s+(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(?:at\s+)?\d{1,2}:(?:\d{2})?\s*(?:AM|PM|am|pm)?\b/i,
      /\b(?:team\s+)?(?:meeting|standup|review)\s+(?:every\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(?:at\s+)?\d{1,2}:(?:\d{2})?\s*(?:AM|PM|am|pm)?\b/i
    ];

    // Enhanced currency patterns with international support
    this.currencyPatterns = [
      // Major currencies with symbols
      /\$[\d,]+(?:\.\d{2})?/g,
      /€[\d,]+(?:\.\d{2})?/g,
      /£[\d,]+(?:\.\d{2})?/g,
      /¥[\d,]+(?:\.\d{2})?/g,
      /₹[\d,]+(?:\.\d{2})?/g,
      /₽[\d,]+(?:\.\d{2})?/g,
      /₩[\d,]+(?:\.\d{2})?/g,
      /₪[\d,]+(?:\.\d{2})?/g,
      
      // Currency codes
      /\b(?:USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|BRL)\s+[\d,]+(?:\.\d{2})?\b/gi,
      
      // Written currency amounts
      /\b[\d,]+(?:\.\d{2})?\s*(?:dollars?|euros?|pounds?|yen|rupees?|rubles?|won|shekels?)\b/gi,
      
      // International number formats
      /\b[\d\s,]+(?:\.\d{2})?\s*(?:USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|BRL)\b/gi,
      
      // Decimal and comma variations
      /\b[\d\s,]+(?:\.\d{2})?\s*[A-Z]{3}\b/gi,
      /\b[\d\s.]+(?:,\d{2})?\s*[A-Z]{3}\b/gi
    ];

    // Enhanced unit patterns with international support
    this.unitPatterns = [
      // Weight units
      /\b\d+(?:\.\d+)?\s*(?:kg|kilograms?|lb|pounds?|g|grams?|oz|ounces?|ton|tons?|stone|stones?)\b/gi,
      
      // Distance units
      /\b\d+(?:\.\d+)?\s*(?:km|kilometers?|mi|miles?|m|meters?|ft|feet?|in|inches?|cm|centimeters?|mm|millimeters?|yd|yards?)\b/gi,
      
      // Volume units
      /\b\d+(?:\.\d+)?\s*(?:L|liters?|gal|gallons?|ml|milliliters?|fl\s*oz|fluid\s*ounces?|pt|pints?|qt|quarts?|cup|cups?)\b/gi,
      
      // Temperature units
      /\b\d+(?:\.\d+)?\s*(?:°C|°F|celsius|fahrenheit|kelvin)\b/gi,
      
      // Area units
      /\b\d+(?:\.\d+)?\s*(?:sq\s*ft|square\s*feet?|sq\s*m|square\s*meters?|acres?|hectares?)\b/gi,
      
      // Speed units
      /\b\d+(?:\.\d+)?\s*(?:km\/h|mph|m\/s|knots?)\b/gi,
      
      // Digital units
      /\b\d+(?:\.\d+)?\s*(?:KB|MB|GB|TB|kilobytes?|megabytes?|gigabytes?|terabytes?)\b/gi,
      
      // Time units
      /\b\d+(?:\.\d+)?\s*(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b/gi
    ];

    // Enhanced tracking number patterns with international carriers
    this.trackingPatterns = new Map([
      // US Carriers
      ['UPS', /^1Z[0-9A-Z]{16}$/],
      ['FedEx', /^[0-9]{12}$|^[0-9]{15}$|^[0-9]{22}$/],
      ['USPS', /^[0-9]{20}$|^[0-9]{22}$|^[A-Z]{2}[0-9]{9}[A-Z]{2}$/],
      ['DHL', /^[0-9]{10}$|^[0-9]{12}$|^[0-9]{14}$/],
      
      // International Carriers
      ['Royal Mail', /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/],
      ['Canada Post', /^[0-9]{16}$|^[A-Z]{2}[0-9]{9}[A-Z]{2}$/],
      ['Australia Post', /^[0-9]{13}$|^[A-Z]{2}[0-9]{9}[A-Z]{2}$/],
      ['Deutsche Post', /^[0-9]{14}$|^[0-9]{16}$/],
      ['La Poste', /^[0-9]{13}$|^[0-9]{15}$/],
      ['Correos', /^[0-9]{14}$|^[0-9]{16}$/],
      ['PostNL', /^[0-9]{14}$|^[0-9]{16}$/],
      ['Swiss Post', /^[0-9]{13}$|^[0-9]{15}$/],
      
      // E-commerce platforms
      ['Amazon', /^TBA[0-9]{10}$|^1Z[0-9A-Z]{16}$/],
      ['eBay', /^[0-9]{12}$|^[0-9]{15}$|^[0-9]{20}$/],
      ['AliExpress', /^[0-9]{13}$|^[0-9]{15}$|^[0-9]{17}$/],
      
      // Generic patterns for unknown carriers
      ['Generic', /^[0-9A-Z]{10,25}$/]
    ]);
  }

  async detectPatterns(text: string): Promise<PatternMatch[]> {
    if (!this.isInitialized) {
      throw new Error('PatternRecognitionEngine not initialized');
    }

    const startTime = performance.now();
    const patterns: PatternMatch[] = [];

    try {
      // Detect email addresses
      const emailMatches = this.detectEmails(text);
      patterns.push(...emailMatches);

      // Detect phone numbers
      const phoneMatches = this.detectPhoneNumbers(text);
      patterns.push(...phoneMatches);

      // Detect URLs
      const urlMatches = this.detectUrls(text);
      patterns.push(...urlMatches);

      // Detect tracking numbers
      const trackingMatches = this.detectTrackingNumbers(text);
      patterns.push(...trackingMatches);

      // Detect addresses
      const addressMatches = this.detectAddresses(text);
      patterns.push(...addressMatches);

      // Detect dates and times
      const dateTimeMatches = this.detectDateTime(text);
      patterns.push(...dateTimeMatches);

      // Detect currency amounts
      const currencyMatches = this.detectCurrency(text);
      patterns.push(...currencyMatches);

      // Detect units
      const unitMatches = this.detectUnits(text);
      patterns.push(...unitMatches);

      // Sort by confidence and remove overlapping matches
      const sortedPatterns = this.sortAndDeduplicatePatterns(patterns);

      const duration = performance.now() - startTime;
      if (duration > PERFORMANCE_THRESHOLDS.PATTERN_DETECTION) {
        console.warn(`Pattern detection took ${duration.toFixed(2)}ms, exceeding threshold of ${PERFORMANCE_THRESHOLDS.PATTERN_DETECTION}ms`);
      }

      return sortedPatterns;
    } catch (error) {
      console.error('Error detecting patterns:', error);
      return [];
    }
  }

  private detectTrackingNumbers(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // Use enhanced tracking patterns
    this.trackingPatterns.forEach((pattern, carrier) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const trackingNumber = match[0];
        const confidence = this.calculateTrackingConfidence(trackingNumber, carrier);
        
        if (confidence > 0.8) {
          matches.push({
            type: PatternType.TRACKING_NUMBER,
            match: trackingNumber,
            confidence,
            startIndex: match.index,
            endIndex: match.index + trackingNumber.length,
            metadata: {
              carrier: carrier.toLowerCase(),
              format: pattern.source,
              country: this.getCarrierCountry(carrier),
              trackingUrl: this.getTrackingUrl(carrier, trackingNumber)
            }
          });
        }
      }
    });
    
    return matches;
  }

  private detectAddresses(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // Check standard address patterns
    this.addressPatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const address = match[0];
        const confidence = this.calculateAddressConfidence(address, index);
        
        if (confidence > 0.6) {
          matches.push({
            type: PatternType.ADDRESS,
            match: address,
            confidence,
            startIndex: match.index,
            endIndex: match.index + address.length,
            metadata: {
              patternIndex: index,
              components: this.parseAddressComponents(address),
              country: this.detectAddressCountry(address),
              format: this.classifyAddressFormat(address)
            }
          });
        }
      }
    });
    
    // Check international address patterns
    this.internationalAddressPatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const postalCode = match[0];
        const confidence = this.calculatePostalCodeConfidence(postalCode, index);
        
        if (confidence > 0.7) {
          matches.push({
            type: PatternType.ADDRESS,
            match: postalCode,
            confidence,
            startIndex: match.index,
            endIndex: match.index + postalCode.length,
            metadata: {
              type: 'postal_code',
              country: this.detectCountryFromPostalCode(postalCode),
              format: 'international'
            }
          });
        }
      }
    });
    
    return matches;
  }

  private detectDateTime(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    this.dateTimePatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dateTime = match[0];
        const confidence = this.calculateDateTimeConfidence(dateTime, index);
        
        if (confidence > 0.7) {
          const parsed = this.parseDateTime(dateTime);
          matches.push({
            type: PatternType.DATE_TIME,
            match: dateTime,
            confidence,
            startIndex: match.index,
            endIndex: match.index + dateTime.length,
            metadata: {
              patternIndex: index,
              parsed,
              type: parsed.type,
              isRelative: parsed.isRelative,
              isEvent: parsed.isEvent,
              suggestedActions: this.getSuggestedDateTimeActions(parsed)
            }
          });
        }
      }
    });
    
    return matches;
  }

  private detectCurrency(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    this.currencyPatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const currency = match[0];
        const confidence = this.calculateCurrencyConfidence(currency, index);
        
        if (confidence > 0.8) {
          const parsed = this.parseCurrencyAmount(currency);
          const symbol = this.extractCurrencySymbol(currency);
          const code = this.extractCurrencyCode(currency);
          
          matches.push({
            type: PatternType.CURRENCY,
            match: currency,
            confidence,
            startIndex: match.index,
            endIndex: match.index + currency.length,
            metadata: {
              patternIndex: index,
              amount: parsed,
              symbol,
              code: code || this.getCurrencyCodeFromSymbol(symbol),
              country: this.getCountryFromCurrency(code || symbol),
              conversionRates: this.getDefaultConversionRates(code || symbol)
            }
          });
        }
      }
    });
    
    return matches;
  }

  private detectUnits(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    this.unitPatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const unit = match[0];
        const confidence = this.calculateUnitConfidence(unit, index);
        
        if (confidence > 0.8) {
          const parsed = this.parseUnitValue(unit);
          const unitType = this.extractUnitType(unit);
          const category = this.categorizeUnit(unitType);
          
          matches.push({
            type: PatternType.UNIT,
            match: unit,
            confidence,
            startIndex: match.index,
            endIndex: match.index + unit.length,
            metadata: {
              patternIndex: index,
              value: parsed,
              unit: unitType,
              category,
              conversions: this.getUnitConversions(unitType, parsed),
              preferredUnits: this.getPreferredUnits(category)
            }
          });
        }
      }
    });
    
    return matches;
  }

  private detectEmails(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // Enhanced email patterns with better validation
    const emailPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\.[A-Z|a-z]{2,}\b/g, // .co.uk, .com.au
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\.[A-Z|a-z]{2,}\.[A-Z|a-z]{2,}\b/g // .co.uk.com
    ];
    
    emailPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const email = match[0];
        const confidence = this.calculateEmailConfidence(email);
        
        if (confidence > 0.7) {
          const [localPart, domain] = email.split('@');
          matches.push({
            type: PatternType.EMAIL,
            match: email,
            confidence,
            startIndex: match.index,
            endIndex: match.index + email.length,
            metadata: {
              domain,
              localPart,
              country: this.detectEmailCountry(domain),
              isDisposable: this.isDisposableEmail(domain),
              isCorporate: this.isCorporateEmail(domain),
              suggestedActions: this.getSuggestedEmailActions(email)
            }
          });
        }
      }
    });
    
    return matches;
  }

  private calculateEmailConfidence(email: string): number {
    // Basic email validation confidence
    if (email.length > 50) return 0.3;
    if (email.includes('..')) return 0.4;
    if (email.startsWith('.') || email.endsWith('.')) return 0.5;
    if (email.split('@').length !== 2) return 0.3;
    
    const [localPart, domain] = email.split('@');
    if (localPart.length < 1 || domain.length < 3) return 0.4;
    if (domain.includes('..')) return 0.4;
    
    return 0.9;
  }

  private calculatePhoneConfidence(phone: string): number {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return 0.3;
    if (digits.length === 10 || digits.length === 11) return 0.9;
    return 0.7;
  }

  private calculateUrlConfidence(url: string): number {
    if (url.length < 10) return 0.3;
    if (!url.includes('.') || url.includes('..')) return 0.4;
    if (url.startsWith('http://') || url.startsWith('https://')) return 0.95;
    return 0.8;
  }

  private calculateAddressConfidence(address: string, patternIndex: number): number {
    // Higher confidence for more specific patterns
    const baseConfidence = 0.6 + (patternIndex * 0.1);
    const lengthBonus = Math.min(address.length / 100, 0.2);
    return Math.min(baseConfidence + lengthBonus, 0.95);
  }

  private calculateDateTimeConfidence(_dateTime: string, patternIndex: number): number {
    // Higher confidence for more specific patterns
    const baseConfidence = 0.7 + (patternIndex * 0.05);
    return Math.min(baseConfidence, 0.95);
  }

  private calculateCurrencyConfidence(_currency: string, patternIndex: number): number {
    // Currency patterns are generally reliable
    return 0.8 + (patternIndex * 0.05);
  }

  private calculateUnitConfidence(_unit: string, patternIndex: number): number {
    // Unit patterns are generally reliable
    return 0.8 + (patternIndex * 0.05);
  }

  private sortAndDeduplicatePatterns(patterns: PatternMatch[]): PatternMatch[] {
    // Sort by confidence (highest first)
    const sorted = patterns.sort((a, b) => b.confidence - a.confidence);
    
    // Remove overlapping patterns, keeping the highest confidence one
    const deduplicated: PatternMatch[] = [];
    
    for (const pattern of sorted) {
      const hasOverlap = deduplicated.some(existing => 
        this.patternsOverlap(pattern, existing)
      );
      
      if (!hasOverlap) {
        deduplicated.push(pattern);
      }
    }
    
    return deduplicated;
  }

  private patternsOverlap(a: PatternMatch, b: PatternMatch): boolean {
    return !(a.endIndex <= b.startIndex || b.endIndex <= a.startIndex);
  }

  private formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  private parseAddressComponents(address: string): Record<string, string> {
    const result: Record<string, string> = {
      full: address,
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      format: 'unknown'
    };

    // Detect address format and parse accordingly
    if (this.isUSAddress(address)) {
      result.format = 'US';
      result.street = this.extractUSStreet(address);
      result.city = this.extractUSCity(address);
      result.state = this.extractUSState(address);
      result.zip = this.extractUSZip(address);
      result.country = 'US';
    } else if (this.isUKAddress(address)) {
      result.format = 'UK';
      result.street = this.extractUKStreet(address);
      result.city = this.extractUKCity(address);
      result.zip = this.extractUKPostalCode(address);
      result.country = 'GB';
    } else if (this.isEuropeanAddress(address)) {
      result.format = 'European';
      result.street = this.extractEuropeanStreet(address);
      result.city = this.extractEuropeanCity(address);
      result.zip = this.extractEuropeanPostalCode(address);
      result.country = this.detectEuropeanCountry(address);
    } else {
      result.format = 'Generic';
      result.street = this.extractGenericStreet(address);
      result.city = this.extractGenericCity(address);
      result.zip = this.extractGenericPostalCode(address);
      result.country = this.detectGenericCountry(address);
    }

    return result;
  }

  private isUSAddress(address: string): boolean {
    return /\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/.test(address) || 
           /\b(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter)\b/i.test(address);
  }

  private isUKAddress(address: string): boolean {
    return /\b[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b/.test(address) ||
           /\b(?:Close|Crescent|Grove|Hill|Mews|Park|Row|Square|Walk)\b/i.test(address);
  }

  private isEuropeanAddress(address: string): boolean {
    return /\b(?:straße|strasse|straat|rue|calle|via|ulica|utca)\b/gi.test(address);
  }

  private extractUSStreet(address: string): string {
    const streetMatch = address.match(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter)\b/i);
    return streetMatch ? streetMatch[0] : '';
  }

  private extractUSCity(address: string): string {
    const cityMatch = address.match(/,\s*([A-Za-z\s]+),\s*[A-Z]{2}/);
    return cityMatch ? cityMatch[1].trim() : '';
  }

  private extractUSState(address: string): string {
    const stateMatch = address.match(/,\s*[A-Za-z\s]+,\s*([A-Z]{2})/);
    return stateMatch ? stateMatch[1] : '';
  }

  private extractUSZip(address: string): string {
    const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
    return zipMatch ? zipMatch[0] : '';
  }

  private extractUKStreet(address: string): string {
    const streetMatch = address.match(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Terrace|Ter|Close|Crescent|Grove|Hill|Mews|Park|Row|Square|Walk)\b/i);
    return streetMatch ? streetMatch[0] : '';
  }

  private extractUKCity(address: string): string {
    const cityMatch = address.match(/,\s*([A-Za-z\s]+)\s*[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}/);
    return cityMatch ? cityMatch[1].trim() : '';
  }

  private extractUKPostalCode(address: string): string {
    const postalMatch = address.match(/\b[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b/);
    return postalMatch ? postalMatch[0] : '';
  }

  private extractEuropeanStreet(address: string): string {
    const streetMatch = address.match(/\b[A-Za-z\s]+(?:straße|strasse|straat|rue|calle|via|ulica|utca)\s+\d+[a-z]?\b/gi);
    if (!streetMatch) {
      const altMatch = address.match(/\b\d+\s+[A-Za-z\s]+(?:straße|strasse|straat|rue|calle|via|ulica|utca)\b/gi);
      return altMatch ? altMatch[0] : '';
    }
    return streetMatch[0];
  }

  private extractEuropeanCity(address: string): string {
    // Extract city from European address patterns
    const cityMatch = address.match(/,\s*([A-Za-z\s]+)\s*,\s*\d{4,5}/);
    return cityMatch ? cityMatch[1].trim() : '';
  }

  private extractEuropeanPostalCode(address: string): string {
    const postalMatch = address.match(/\b\d{4,5}\b/);
    return postalMatch ? postalMatch[0] : '';
  }

  private detectEuropeanCountry(address: string): string {
    if (address.includes('straße') || address.includes('strasse')) return 'DE';
    if (address.includes('straat')) return 'NL';
    if (address.includes('rue')) return 'FR';
    if (address.includes('calle')) return 'ES';
    if (address.includes('via')) return 'IT';
    if (address.includes('ulica')) return 'PL';
    if (address.includes('utca')) return 'HU';
    return 'Unknown';
  }

  private extractGenericStreet(address: string): string {
    // Generic street extraction for unknown formats
    const streetMatch = address.match(/\b\d+\s+[A-Za-z\s]+\b/);
    return streetMatch ? streetMatch[0] : '';
  }

  private extractGenericCity(address: string): string {
    // Generic city extraction
    const parts = address.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      return parts[1];
    }
    return '';
  }

  private extractGenericPostalCode(address: string): string {
    // Generic postal code extraction
    const postalMatch = address.match(/\b\d{3,10}\b/);
    return postalMatch ? postalMatch[0] : '';
  }

  private detectGenericCountry(address: string): string {
    // Try to detect country from postal code format
    const postalCode = this.extractGenericPostalCode(address);
    if (postalCode) {
      return this.detectCountryFromPostalCode(postalCode);
    }
    
    // Try to detect from address patterns
    return this.detectAddressCountry(address);
  }

  private parseDateTime(dateTime: string): Record<string, any> {
    const result: Record<string, any> = {
      raw: dateTime,
      type: this.classifyDateTimeType(dateTime),
      isRelative: false,
      isEvent: false,
      parsed: null,
      suggestions: []
    };

    // Enhanced parsing based on type
    switch (result.type) {
      case 'date':
        result.parsed = this.parseDate(dateTime);
        break;
      case 'time':
        result.parsed = this.parseTime(dateTime);
        break;
      case 'relative':
        result.isRelative = true;
        result.parsed = this.parseRelativeDateTime(dateTime);
        break;
      case 'event':
        result.isEvent = true;
        result.parsed = this.parseEventDateTime(dateTime);
        break;
      case 'iso':
        result.parsed = this.parseISODateTime(dateTime);
        break;
    }

    // Detect if it's an event-related text
    if (this.isEventRelated(dateTime)) {
      result.isEvent = true;
      result.suggestions = this.getEventSuggestions(dateTime);
    }

    return result;
  }

  private classifyDateTimeType(dateTime: string): string {
    if (dateTime.includes('T') && dateTime.includes('Z')) return 'iso';
    if (dateTime.includes(':')) return 'time';
    if (dateTime.includes('/') || dateTime.includes('-') || dateTime.includes('.')) return 'date';
    if (dateTime.includes('Today') || dateTime.includes('Tomorrow') || dateTime.includes('Yesterday')) return 'relative';
    if (this.isEventRelated(dateTime)) return 'event';
    return 'unknown';
  }

  private parseDate(dateStr: string): Record<string, any> {
    const result: Record<string, any> = {
      original: dateStr,
      format: 'unknown',
      components: {},
      isValid: false
    };

    // Try different date formats
    const formats = [
      // MM/DD/YYYY or MM-DD-YYYY
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/,
      // DD/MM/YYYY or DD-MM-YYYY
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // Month DD, YYYY
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})$/i,
      // DD Month YYYY
      /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i
    ];

    for (let i = 0; i < formats.length; i++) {
      const match = dateStr.match(formats[i]);
      if (match) {
        result.format = i === 0 ? 'MM/DD/YYYY' : i === 1 ? 'DD/MM/YYYY' : i === 2 ? 'YYYY-MM-DD' : i === 3 ? 'Month DD, YYYY' : 'DD Month YYYY';
        result.components = this.extractDateComponents(match, result.format);
        result.isValid = this.validateDateComponents(result.components);
        break;
      }
    }

    return result;
  }

  private parseTime(timeStr: string): Record<string, any> {
    const result: Record<string, any> = {
      original: timeStr,
      format: 'unknown',
      components: {},
      isValid: false
    };

    // Time patterns
    const timePatterns = [
      // HH:MM or HH:MM:SS
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/,
      // HH:MM AM/PM
      /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/,
      // 24-hour format
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    ];

    for (let i = 0; i < timePatterns.length; i++) {
      const match = timeStr.match(timePatterns[i]);
      if (match) {
        result.format = i === 0 ? 'HH:MM:SS' : i === 1 ? 'HH:MM AM/PM' : '24-hour';
        result.components = this.extractTimeComponents(match);
        result.isValid = this.validateTimeComponents(result.components);
        break;
      }
    }

    return result;
  }

  private parseRelativeDateTime(relativeStr: string): Record<string, any> {
    const result: Record<string, any> = {
      original: relativeStr,
      type: 'relative',
      reference: 'now',
      offset: null,
      unit: null
    };

    // Parse relative expressions
    if (relativeStr.includes('Today')) {
      result.reference = 'today';
    } else if (relativeStr.includes('Tomorrow')) {
      result.reference = 'tomorrow';
      result.offset = 1;
      result.unit = 'day';
    } else if (relativeStr.includes('Yesterday')) {
      result.reference = 'yesterday';
      result.offset = -1;
      result.unit = 'day';
    } else if (relativeStr.includes('Next')) {
      result.reference = 'next';
      result.offset = 1;
      result.unit = this.extractUnitFromRelative(relativeStr);
    } else if (relativeStr.includes('Last')) {
      result.reference = 'last';
      result.offset = -1;
      result.unit = this.extractUnitFromRelative(relativeStr);
    }

    return result;
  }

  private parseEventDateTime(eventStr: string): Record<string, any> {
    const result: Record<string, any> = {
      original: eventStr,
      type: 'event',
      eventType: this.extractEventType(eventStr),
      dateTime: this.extractDateTimeFromEvent(eventStr),
      location: this.extractLocationFromEvent(eventStr),
      participants: this.extractParticipantsFromEvent(eventStr)
    };

    return result;
  }

  private parseISODateTime(isoStr: string): Record<string, any> {
    try {
      const date = new Date(isoStr);
      const result: Record<string, any> = {
        original: isoStr,
        type: 'iso',
        date: date,
        isValid: !isNaN(date.getTime()),
        components: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds(),
          timezone: date.getTimezoneOffset()
        }
      };

      return result;
    } catch (error) {
      return {
        original: isoStr,
        type: 'iso',
        isValid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private extractDateComponents(match: RegExpMatchArray, format: string): Record<string, any> {
    const components: Record<string, any> = {};
    
    if (format === 'MM/DD/YYYY' || format === 'DD/MM/YYYY') {
      components.month = parseInt(match[1]);
      components.day = parseInt(match[2]);
      components.year = parseInt(match[3]);
    } else if (format === 'YYYY-MM-DD') {
      components.year = parseInt(match[1]);
      components.month = parseInt(match[2]);
      components.day = parseInt(match[3]);
    } else if (format === 'Month DD, YYYY') {
      components.month = this.monthNameToNumber(match[1]);
      components.day = parseInt(match[2]);
      components.year = parseInt(match[3]);
    } else if (format === 'DD Month YYYY') {
      components.day = parseInt(match[1]);
      components.month = this.monthNameToNumber(match[2]);
      components.year = parseInt(match[3]);
    }

    return components;
  }

  private extractTimeComponents(match: RegExpMatchArray): Record<string, any> {
    const components: Record<string, any> = {
      hour: parseInt(match[1]),
      minute: parseInt(match[2]),
      second: match[3] ? parseInt(match[3]) : 0,
      period: match[4] ? match[4].toUpperCase() : null
    };

    // Convert 12-hour to 24-hour if needed
    if (components.period === 'PM' && components.hour < 12) {
      components.hour += 12;
    } else if (components.period === 'AM' && components.hour === 12) {
      components.hour = 0;
    }

    return components;
  }

  private extractUnitFromRelative(relativeStr: string): string {
    if (relativeStr.includes('week')) return 'week';
    if (relativeStr.includes('month')) return 'month';
    if (relativeStr.includes('year')) return 'year';
    if (relativeStr.includes('Monday') || relativeStr.includes('Tuesday') || 
        relativeStr.includes('Wednesday') || relativeStr.includes('Thursday') || 
        relativeStr.includes('Friday') || relativeStr.includes('Saturday') || 
        relativeStr.includes('Sunday')) return 'day';
    return 'unknown';
  }

  private extractEventType(eventStr: string): string {
    const eventTypes = ['meeting', 'appointment', 'call', 'event', 'standup', 'review'];
    for (const type of eventTypes) {
      if (eventStr.toLowerCase().includes(type)) {
        return type;
      }
    }
    return 'unknown';
  }

  private extractDateTimeFromEvent(eventStr: string): Record<string, any> {
    // Extract date/time information from event text
    const dateTimeMatch = eventStr.match(/(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(?:at\s+)?(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
    
    if (dateTimeMatch) {
      return {
        day: this.extractDayOfWeek(eventStr),
        time: {
          hour: parseInt(dateTimeMatch[1]),
          minute: parseInt(dateTimeMatch[2]),
          period: dateTimeMatch[3] ? dateTimeMatch[3].toUpperCase() : null
        }
      };
    }

    return {};
  }

  private extractLocationFromEvent(eventStr: string): string | null {
    // Extract location information from event text
    const locationMatch = eventStr.match(/(?:in|at|room)\s+([A-Za-z\s]+(?:Room|Building|Office|Center|Hall))/i);
    return locationMatch ? locationMatch[1].trim() : null;
  }

  private extractParticipantsFromEvent(eventStr: string): string[] {
    // Extract participant information from event text
    const participantMatch = eventStr.match(/(?:team|with|including)\s+([A-Za-z\s,]+)/i);
    if (participantMatch) {
      return participantMatch[1].split(',').map(p => p.trim());
    }
    return [];
  }

  private monthNameToNumber(monthName: string): number {
    const months: Record<string, number> = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    return months[monthName.toLowerCase()] || 1;
  }

  private extractDayOfWeek(eventStr: string): string | null {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of days) {
      if (eventStr.includes(day)) {
        return day;
      }
    }
    return null;
  }

  private validateDateComponents(components: Record<string, any>): boolean {
    if (!components.year || !components.month || !components.day) return false;
    
    const year = components.year;
    const month = components.month;
    const day = components.day;
    
    // Basic validation
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Month-specific day validation
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      daysInMonth[1] = 29; // Leap year
    }
    
    return day <= daysInMonth[month - 1];
  }

  private validateTimeComponents(components: Record<string, any>): boolean {
    if (!components.hour || !components.minute) return false;
    
    const hour = components.hour;
    const minute = components.minute;
    const second = components.second || 0;
    
    return hour >= 0 && hour <= 23 && 
           minute >= 0 && minute <= 59 && 
           second >= 0 && second <= 59;
  }

  private isEventRelated(text: string): boolean {
    const eventKeywords = ['meeting', 'appointment', 'call', 'event', 'standup', 'review', 'team', 'schedule'];
    return eventKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private getEventSuggestions(eventText: string): string[] {
    const suggestions: string[] = ['calendar'];
    
    if (eventText.toLowerCase().includes('team')) {
      suggestions.push('share', 'invite');
    }
    
    if (eventText.toLowerCase().includes('call')) {
      suggestions.push('dial', 'video');
    }
    
    if (eventText.toLowerCase().includes('meeting')) {
      suggestions.push('reminder', 'notes');
    }
    
    return suggestions;
  }

  private parseCurrencyAmount(currency: string): number {
    const amount = currency.replace(/[^\d.,]/g, '');
    return parseFloat(amount.replace(',', ''));
  }

  private extractCurrencySymbol(currency: string): string {
    const symbols = ['$', '€', '£', '¥'];
    return symbols.find(symbol => currency.includes(symbol)) || '';
  }

  private parseUnitValue(unit: string): number {
    const value = unit.match(/\d+(?:\.\d+)?/)?.[0];
    return value ? parseFloat(value) : 0;
  }

  private extractUnitType(unit: string): string {
    const unitTypes = unit.match(/(?:kg|kilograms?|lb|pounds?|g|grams?|oz|ounces?|km|kilometers?|mi|miles?|m|meters?|ft|feet?|in|inches?|L|liters?|gal|gallons?|ml|milliliters?|fl\s*oz|fluid\s*ounces?|°C|°F|celsius|fahrenheit)/i);
    return unitTypes?.[0] || '';
  }

  cleanup(): void {
    this.isInitialized = false;
  }

  private detectPhoneNumbers(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // Enhanced phone number patterns with international support
    const phonePatterns = [
      // US/Canada patterns
      /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      /\b(?:\+?1[-.\s]?)?([0-9]{3})[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      
      // International patterns
      /\b(?:\+?[0-9]{1,3}[-.\s]?)?([0-9]{4,5})[-.\s]?([0-9]{4,5})\b/g,
      /\b\+[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}\b/g,
      
      // UK patterns
      /\b(?:\+44|0)[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b/g,
      
      // European patterns
      /\b(?:\+33|0)[0-9]{1,2}[-.\s]?[0-9]{2,3}[-.\s]?[0-9]{2,3}[-.\s]?[0-9]{2,3}\b/g,
      /\b(?:\+49|0)[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b/g,
      
      // Generic international
      /\b\+[0-9]{1,4}[-.\s]?[0-9]{4,15}\b/g
    ];
    
    phonePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const phoneNumber = match[0];
        const confidence = this.calculatePhoneConfidence(phoneNumber);
        
        if (confidence > 0.6) {
          matches.push({
            type: PatternType.PHONE,
            match: phoneNumber,
            confidence,
            startIndex: match.index,
            endIndex: match.index + phoneNumber.length,
            metadata: {
              countryCode: phoneNumber.startsWith('+') ? phoneNumber.match(/\+(\d+)/)?.[1] : undefined,
              formatted: this.formatPhoneNumber(phoneNumber),
              country: this.detectPhoneCountry(phoneNumber),
              isInternational: phoneNumber.startsWith('+')
            }
          });
        }
      }
    });
    
    return matches;
  }

  private detectUrls(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const urlRegex = PATTERN_REGEX.URL;
    
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const confidence = this.calculateUrlConfidence(url);
      
      if (confidence > 0.8) {
        matches.push({
          type: PatternType.URL,
          match: url,
          confidence,
          startIndex: match.index,
          endIndex: match.index + url.length,
          metadata: {
            protocol: url.split('://')[0],
            domain: url.split('://')[1]?.split('/')[0],
            isSecure: url.startsWith('https://'),
            country: this.detectUrlCountry(url)
          }
        });
      }
    }
    
    return matches;
  }

  // Helper methods for enhanced pattern recognition
  private calculateTrackingConfidence(trackingNumber: string, carrier: string): number {
    // Higher confidence for known carriers
    const knownCarriers = ['UPS', 'FedEx', 'USPS', 'DHL', 'Royal Mail', 'Canada Post'];
    const baseConfidence = knownCarriers.includes(carrier) ? 0.9 : 0.7;
    
    // Additional confidence based on format validation
    const length = trackingNumber.length;
    if (length >= 10 && length <= 25) {
      return Math.min(baseConfidence + 0.1, 0.95);
    }
    
    return baseConfidence;
  }

  private getCarrierCountry(carrier: string): string {
    const carrierCountries: Record<string, string> = {
      'UPS': 'US',
      'FedEx': 'US',
      'USPS': 'US',
      'DHL': 'DE',
      'Royal Mail': 'GB',
      'Canada Post': 'CA',
      'Australia Post': 'AU',
      'Deutsche Post': 'DE',
      'La Poste': 'FR',
      'Correos': 'ES',
      'PostNL': 'NL',
      'Swiss Post': 'CH'
    };
    
    return carrierCountries[carrier] || 'Unknown';
  }

  private getTrackingUrl(carrier: string, trackingNumber: string): string {
    const carrierUrls: Record<string, string> = {
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      'Royal Mail': `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`,
      'Canada Post': `https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=${trackingNumber}`,
      'Amazon': `https://www.amazon.com/gp/your-account/order-details?orderID=${trackingNumber}`,
      'eBay': `https://www.ebay.com/sh/lst/active?tracking_number=${trackingNumber}`
    };
    
    return carrierUrls[carrier] || `https://www.google.com/search?q=${trackingNumber}`;
  }

  private detectAddressCountry(address: string): string {
    // Detect country based on address patterns
    if (address.match(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/)) return 'US';
    if (address.match(/\b[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b/)) return 'GB';
    if (address.match(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/)) return 'CA';
    if (address.match(/\b(?:straße|strasse)\b/)) return 'DE';
    if (address.match(/\b(?:rue|avenue)\b/)) return 'FR';
    if (address.match(/\b(?:calle|avenida)\b/)) return 'ES';
    if (address.match(/\b(?:via|strada)\b/)) return 'IT';
    
    return 'Unknown';
  }

  private classifyAddressFormat(address: string): string {
    if (address.includes('Street') || address.includes('Avenue') || address.includes('Road')) {
      return 'US';
    }
    if (address.includes('straße') || address.includes('strasse')) {
      return 'German';
    }
    if (address.includes('rue') || address.includes('avenue')) {
      return 'French';
    }
    if (address.includes('calle') || address.includes('avenida')) {
      return 'Spanish';
    }
    if (address.includes('via') || address.includes('strada')) {
      return 'Italian';
    }
    
    return 'Generic';
  }

  private calculatePostalCodeConfidence(postalCode: string, patternIndex: number): number {
    const baseConfidence = 0.7 + (patternIndex * 0.02);
    const length = postalCode.length;
    
    // Higher confidence for expected lengths
    if (length >= 4 && length <= 10) {
      return Math.min(baseConfidence + 0.2, 0.95);
    }
    
    return baseConfidence;
  }

  private detectCountryFromPostalCode(postalCode: string): string {
    const postalCodePatterns: Record<string, RegExp> = {
      'US': /^\d{5}(-\d{4})?$/,
      'GB': /^[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}$/,
      'CA': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
      'NL': /^\d{4}\s?[A-Z]{2}$/,
      'PL': /^\d{3}\s?\d{2}$/,
      'IN': /^\d{6}$/,
      'AU': /^\d{4}$/,
      'JP': /^\d{3}-\d{4}$/
    };
    
    for (const [country, pattern] of Object.entries(postalCodePatterns)) {
      if (pattern.test(postalCode)) {
        return country;
      }
    }
    
    return 'Unknown';
  }

  private getSuggestedDateTimeActions(parsed: any): string[] {
    const actions: string[] = [];
    
    if (parsed.type === 'date' || parsed.type === 'relative') {
      actions.push('calendar');
    }
    
    if (parsed.type === 'time') {
      actions.push('reminder');
    }
    
    if (parsed.isEvent) {
      actions.push('calendar', 'reminder', 'share');
    }
    
    return actions;
  }

  private extractCurrencyCode(currency: string): string | null {
    const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];
    
    for (const code of currencyCodes) {
      if (currency.includes(code)) {
        return code;
      }
    }
    
    return null;
  }

  private getCurrencyCodeFromSymbol(symbol: string): string {
    const symbolToCode: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      '₽': 'RUB',
      '₩': 'KRW',
      '₪': 'ILS'
    };
    
    return symbolToCode[symbol] || 'USD';
  }

  private getCountryFromCurrency(currency: string): string {
    const currencyToCountry: Record<string, string> = {
      'USD': 'US',
      'EUR': 'EU',
      'GBP': 'GB',
      'JPY': 'JP',
      'CAD': 'CA',
      'AUD': 'AU',
      'CHF': 'CH',
      'CNY': 'CN',
      'INR': 'IN',
      'BRL': 'BR'
    };
    
    return currencyToCountry[currency] || 'Unknown';
  }

  private getDefaultConversionRates(currency: string): Record<string, number> {
    // Default conversion rates (would be updated with real-time data)
    const baseRates: Record<string, Record<string, number>> = {
      'USD': { 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0, 'CAD': 1.25, 'AUD': 1.35 },
      'EUR': { 'USD': 1.18, 'GBP': 0.86, 'JPY': 129.0, 'CAD': 1.47, 'AUD': 1.59 },
      'GBP': { 'USD': 1.37, 'EUR': 1.16, 'JPY': 150.0, 'CAD': 1.71, 'AUD': 1.85 }
    };
    
    return baseRates[currency] || {};
  }

  private categorizeUnit(unit: string): string {
    if (unit.match(/(?:kg|kilograms?|lb|pounds?|g|grams?|oz|ounces?|ton|tons?|stone|stones?)/i)) {
      return 'weight';
    }
    if (unit.match(/(?:km|kilometers?|mi|miles?|m|meters?|ft|feet?|in|inches?|cm|centimeters?|mm|millimeters?|yd|yards?)/i)) {
      return 'distance';
    }
    if (unit.match(/(?:L|liters?|gal|gallons?|ml|milliliters?|fl\s*oz|fluid\s*ounces?|pt|pints?|qt|quarts?|cup|cups?)/i)) {
      return 'volume';
    }
    if (unit.match(/(?:°C|°F|celsius|fahrenheit|kelvin)/i)) {
      return 'temperature';
    }
    if (unit.match(/(?:sq\s*ft|square\s*feet?|sq\s*m|square\s*meters?|acres?|hectares?)/i)) {
      return 'area';
    }
    if (unit.match(/(?:km\/h|mph|m\/s|knots?)/i)) {
      return 'speed';
    }
    if (unit.match(/(?:KB|MB|GB|TB|kilobytes?|megabytes?|gigabytes?|terabytes?)/i)) {
      return 'digital';
    }
    if (unit.match(/(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)/i)) {
      return 'time';
    }
    
    return 'unknown';
  }

  private getUnitConversions(unit: string, value: number): Record<string, number> {
    // Basic unit conversion logic (would be enhanced with comprehensive conversion tables)
    const conversions: Record<string, Record<string, number>> = {
      'weight': {
        'kg': value,
        'lb': value * 2.20462,
        'g': value * 1000,
        'oz': value * 35.274
      },
      'distance': {
        'km': value,
        'mi': value * 0.621371,
        'm': value * 1000,
        'ft': value * 3280.84
      },
      'temperature': {
        '°C': value,
        '°F': value * 9/5 + 32,
        'K': value + 273.15
      }
    };
    
    const category = this.categorizeUnit(unit);
    return conversions[category] || {};
  }

  private getPreferredUnits(category: string): string[] {
    const preferredUnits: Record<string, string[]> = {
      'weight': ['kg', 'lb'],
      'distance': ['km', 'mi', 'm'],
      'volume': ['L', 'gal', 'ml'],
      'temperature': ['°C', '°F'],
      'area': ['sq m', 'sq ft'],
      'speed': ['km/h', 'mph'],
      'digital': ['GB', 'MB', 'KB'],
      'time': ['hours', 'minutes', 'days']
    };
    
    return preferredUnits[category] || [];
  }

  private detectEmailCountry(domain: string): string {
    const countryTLDs: Record<string, string> = {
      '.uk': 'GB',
      '.de': 'DE',
      '.fr': 'FR',
      '.es': 'ES',
      '.it': 'IT',
      '.ca': 'CA',
      '.au': 'AU',
      '.jp': 'JP',
      '.cn': 'CN',
      '.in': 'IN',
      '.br': 'BR',
      '.ru': 'RU',
      '.kr': 'KR',
      '.nl': 'NL',
      '.ch': 'CH',
      '.se': 'SE',
      '.no': 'NO',
      '.dk': 'DK',
      '.fi': 'FI',
      '.pl': 'PL'
    };
    
    for (const [tld, country] of Object.entries(countryTLDs)) {
      if (domain.endsWith(tld)) {
        return country;
      }
    }
    
    return 'Unknown';
  }

  private isDisposableEmail(domain: string): boolean {
    const disposableDomains = [
      'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
      'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getairmail.com'
    ];
    
    return disposableDomains.some(d => domain.includes(d));
  }

  private isCorporateEmail(domain: string): boolean {
    const corporateIndicators = [
      'corp', 'inc', 'llc', 'ltd', 'company', 'enterprise', 'business',
      'office', 'work', 'job', 'career', 'professional'
    ];
    
    return corporateIndicators.some(indicator => domain.includes(indicator));
  }

  private getSuggestedEmailActions(email: string): string[] {
    const actions = ['email', 'copy'];
    
    if (this.isCorporateEmail(email.split('@')[1])) {
      actions.push('contact', 'save');
    }
    
    return actions;
  }

  private detectPhoneCountry(phoneNumber: string): string {
    const countryPatterns: Record<string, RegExp> = {
      'US': /^\+?1/,
      'GB': /^\+?44/,
      'DE': /^\+?49/,
      'FR': /^\+?33/,
      'ES': /^\+?34/,
      'IT': /^\+?39/,
      'CA': /^\+?1/,
      'AU': /^\+?61/,
      'JP': /^\+?81/,
      'CN': /^\+?86/,
      'IN': /^\+?91/,
      'BR': /^\+?55/,
      'RU': /^\+?7/,
      'KR': /^\+?82/
    };
    
    for (const [country, pattern] of Object.entries(countryPatterns)) {
      if (pattern.test(phoneNumber)) {
        return country;
      }
    }
    
    return 'Unknown';
  }

  private detectUrlCountry(url: string): string {
    const countryTLDs: Record<string, string> = {
      '.uk': 'GB',
      '.de': 'DE',
      '.fr': 'FR',
      '.es': 'ES',
      '.it': 'IT',
      '.ca': 'CA',
      '.au': 'AU',
      '.jp': 'JP',
      '.cn': 'CN',
      '.in': 'IN',
      '.br': 'BR',
      '.ru': 'RU',
      '.kr': 'KR'
    };
    
    for (const [tld, country] of Object.entries(countryTLDs)) {
      if (url.includes(tld)) {
        return country;
      }
    }
    
    return 'Unknown';
  }
}
