/**
 * Phone Number Formatting Utility for African Countries
 * Handles country codes, formatting, and validation
 */

export interface CountryPhoneConfig {
  code: string;
  countryCode: string;
  dialCode: string;
  format: string;
  placeholder: string;
  digitCount: number; // Expected digits after country code
  flag: string;
}

export const COUNTRY_PHONE_CONFIGS: Record<string, CountryPhoneConfig> = {
  kenya: {
    code: 'KE',
    countryCode: 'kenya',
    dialCode: '+254',
    format: '+254 ### ### ###',
    placeholder: '+254 712 345 678',
    digitCount: 9,
    flag: '🇰🇪'
  },
  tanzania: {
    code: 'TZ',
    countryCode: 'tanzania',
    dialCode: '+255',
    format: '+255 ### ### ###',
    placeholder: '+255 712 345 678',
    digitCount: 9,
    flag: '🇹🇿'
  },
  uganda: {
    code: 'UG',
    countryCode: 'uganda',
    dialCode: '+256',
    format: '+256 ### ### ###',
    placeholder: '+256 712 345 678',
    digitCount: 9,
    flag: '🇺🇬'
  },
  rwanda: {
    code: 'RW',
    countryCode: 'rwanda',
    dialCode: '+250',
    format: '+250 ### ### ###',
    placeholder: '+250 712 345 678',
    digitCount: 9,
    flag: '🇷🇼'
  },
  nigeria: {
    code: 'NG',
    countryCode: 'nigeria',
    dialCode: '+234',
    format: '+234 ### ### ####',
    placeholder: '+234 803 123 4567',
    digitCount: 10,
    flag: '🇳🇬'
  },
  ghana: {
    code: 'GH',
    countryCode: 'ghana',
    dialCode: '+233',
    format: '+233 ## ### ####',
    placeholder: '+233 24 123 4567',
    digitCount: 9,
    flag: '🇬🇭'
  },
  south_africa: {
    code: 'ZA',
    countryCode: 'south_africa',
    dialCode: '+27',
    format: '+27 ## ### ####',
    placeholder: '+27 82 123 4567',
    digitCount: 9,
    flag: '🇿🇦'
  },
  ethiopia: {
    code: 'ET',
    countryCode: 'ethiopia',
    dialCode: '+251',
    format: '+251 ## ### ####',
    placeholder: '+251 91 123 4567',
    digitCount: 9,
    flag: '🇪🇹'
  },
  morocco: {
    code: 'MA',
    countryCode: 'morocco',
    dialCode: '+212',
    format: '+212 ### ### ###',
    placeholder: '+212 612 345 678',
    digitCount: 9,
    flag: '🇲🇦'
  },
  egypt: {
    code: 'EG',
    countryCode: 'egypt',
    dialCode: '+20',
    format: '+20 ### ### ####',
    placeholder: '+20 100 123 4567',
    digitCount: 10,
    flag: '🇪🇬'
  },
  other: {
    code: 'OTHER',
    countryCode: 'other',
    dialCode: '+',
    format: '+###',
    placeholder: '+000 000 000 000',
    digitCount: 10,
    flag: '🌍'
  }
};

/**
 * Format phone number based on country configuration
 */
export function formatPhoneNumber(value: string, countryCode: string): string {
  const config = COUNTRY_PHONE_CONFIGS[countryCode];
  if (!config) return value;

  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // If user is typing from scratch and hasn't entered +, add country code
  if (!cleaned.startsWith('+')) {
    cleaned = config.dialCode + cleaned;
  }

  // Remove + for easier processing
  const dialCode = config.dialCode.substring(1);
  let phoneDigits = cleaned.substring(1);

  // If the phone starts with country code digits, keep only the rest
  if (phoneDigits.startsWith(dialCode)) {
    phoneDigits = phoneDigits.substring(dialCode.length);
  }

  // Limit to expected digit count
  phoneDigits = phoneDigits.substring(0, config.digitCount);

  // Format based on country
  let formatted = config.dialCode;
  
  if (phoneDigits.length > 0) {
    formatted += ' ';
    
    // Apply formatting based on country
    if (countryCode === 'nigeria') {
      // +234 ### ### ####
      if (phoneDigits.length > 0) formatted += phoneDigits.substring(0, 3);
      if (phoneDigits.length > 3) formatted += ' ' + phoneDigits.substring(3, 6);
      if (phoneDigits.length > 6) formatted += ' ' + phoneDigits.substring(6, 10);
    } else if (countryCode === 'ghana' || countryCode === 'south_africa' || countryCode === 'ethiopia') {
      // +233/+27/+251 ## ### ####
      if (phoneDigits.length > 0) formatted += phoneDigits.substring(0, 2);
      if (phoneDigits.length > 2) formatted += ' ' + phoneDigits.substring(2, 5);
      if (phoneDigits.length > 5) formatted += ' ' + phoneDigits.substring(5, 9);
    } else if (countryCode === 'egypt') {
      // +20 ### ### ####
      if (phoneDigits.length > 0) formatted += phoneDigits.substring(0, 3);
      if (phoneDigits.length > 3) formatted += ' ' + phoneDigits.substring(3, 6);
      if (phoneDigits.length > 6) formatted += ' ' + phoneDigits.substring(6, 10);
    } else if (countryCode === 'other') {
      // Custom format for other countries
      formatted = value;
    } else {
      // Default format for Kenya, Tanzania, Uganda, Rwanda, Morocco: +XXX ### ### ###
      if (phoneDigits.length > 0) formatted += phoneDigits.substring(0, 3);
      if (phoneDigits.length > 3) formatted += ' ' + phoneDigits.substring(3, 6);
      if (phoneDigits.length > 6) formatted += ' ' + phoneDigits.substring(6, 9);
    }
  }

  return formatted;
}

/**
 * Validate phone number based on country
 */
export function validatePhoneNumber(phone: string, countryCode: string): { isValid: boolean; error?: string } {
  const config = COUNTRY_PHONE_CONFIGS[countryCode];
  
  if (!config) {
    return { isValid: false, error: 'Invalid country selected' };
  }

  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // For "other" country, just check basic format
  if (countryCode === 'other') {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      return { isValid: false, error: 'Phone number is too short' };
    }
    if (!phone.startsWith('+')) {
      return { isValid: false, error: 'Phone number must include country code (e.g., +1, +44)' };
    }
    return { isValid: true };
  }

  // Extract digits only (excluding +)
  const digitsOnly = phone.replace(/\D/g, '');
  const dialCodeDigits = config.dialCode.substring(1);

  // Check if phone starts with correct country code
  if (!digitsOnly.startsWith(dialCodeDigits)) {
    return { isValid: false, error: `Phone number must start with ${config.dialCode}` };
  }

  // Get phone digits after country code
  const phoneDigits = digitsOnly.substring(dialCodeDigits.length);

  // Validate length
  if (phoneDigits.length < config.digitCount) {
    return { 
      isValid: false, 
      error: `Phone number must have ${config.digitCount} digits after ${config.dialCode}` 
    };
  }

  if (phoneDigits.length > config.digitCount) {
    return { 
      isValid: false, 
      error: `Phone number is too long` 
    };
  }

  return { isValid: true };
}

/**
 * Parse phone number to extract country code and number
 */
export function parsePhoneNumber(phone: string): { dialCode: string; number: string } {
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) {
    return { dialCode: '', number: cleaned };
  }

  // Try to match known dial codes
  for (const config of Object.values(COUNTRY_PHONE_CONFIGS)) {
    if (cleaned.startsWith(config.dialCode)) {
      return {
        dialCode: config.dialCode,
        number: cleaned.substring(config.dialCode.length)
      };
    }
  }

  // Unknown dial code
  const plusIndex = cleaned.indexOf('+');
  const firstSpaceOrDigit = cleaned.substring(plusIndex + 1).search(/\s|(?<=\d{3})/);
  
  if (firstSpaceOrDigit > 0) {
    return {
      dialCode: cleaned.substring(0, plusIndex + firstSpaceOrDigit + 1),
      number: cleaned.substring(plusIndex + firstSpaceOrDigit + 1)
    };
  }

  return { dialCode: '+', number: cleaned.substring(1) };
}

/**
 * Get country config by dial code
 */
export function getCountryByDialCode(dialCode: string): CountryPhoneConfig | null {
  for (const config of Object.values(COUNTRY_PHONE_CONFIGS)) {
    if (config.dialCode === dialCode) {
      return config;
    }
  }
  return null;
}

/**
 * Clean phone number for storage (digits only with +)
 */
export function cleanPhoneForStorage(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Display phone number in a user-friendly format
 */
export function displayPhoneNumber(phone: string, countryCode?: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (countryCode && COUNTRY_PHONE_CONFIGS[countryCode]) {
    return formatPhoneNumber(cleaned, countryCode);
  }

  // Try to auto-detect country from phone number
  for (const [key, config] of Object.entries(COUNTRY_PHONE_CONFIGS)) {
    if (cleaned.startsWith(config.dialCode)) {
      return formatPhoneNumber(cleaned, key);
    }
  }

  // Return as-is if can't format
  return phone;
}
