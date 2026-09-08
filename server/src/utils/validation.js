export function validateProductInput(body, isUpdate = false) {
  const errors = {};

  if (!isUpdate || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.name = 'Product name is required';
    } else if (body.name.trim().length > 255) {
      errors.name = 'Product name must be 255 characters or less';
    }
  }

  if (body.category !== undefined && body.category.length > 100) {
    errors.category = 'Category must be 100 characters or less';
  }

  if (body.material !== undefined && body.material.length > 100) {
    errors.material = 'Material must be 100 characters or less';
  }

  if (body.colour !== undefined && body.colour.length > 100) {
    errors.colour = 'Colour must be 100 characters or less';
  }

  if (body.craft_type !== undefined && body.craft_type.length > 100) {
    errors.craft_type = 'Craft type must be 100 characters or less';
  }

    if (body.final_price !== undefined) {
    const price = Number(body.final_price);
    if (isNaN(price) || price < 0) {
      errors.final_price = 'Final price must be a valid non-negative number';
    }
  } else if (!isUpdate) {
    // final_price is mandatory for new products (image must be stored first).
    errors.final_price = 'Final price is required';
  }

  if (body.image_url !== undefined) {
    if (typeof body.image_url !== 'string' || body.image_url.trim().length === 0) {
      errors.image_url = 'image_url must be a non-empty string';
    }
  } else if (!isUpdate) {
    errors.image_url = 'Product image URL is required';
  }


  if (body.price_min !== undefined) {
    const price = Number(body.price_min);
    if (isNaN(price) || price < 0) {
      errors.price_min = 'Minimum price must be a valid non-negative number';
    }
  }

  if (body.price_max !== undefined) {
    const price = Number(body.price_max);
    if (isNaN(price) || price < 0) {
      errors.price_max = 'Maximum price must be a valid non-negative number';
    }
  }

  if (body.status !== undefined) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(body.status)) {
      errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
    }
  }

  if (body.keywords !== undefined) {
    if (!Array.isArray(body.keywords)) {
      errors.keywords = 'Keywords must be an array of strings';
    } else if (body.keywords.some((k) => typeof k !== 'string')) {
      errors.keywords = 'Each keyword must be a string';
    }
  }

  if (body.artisan_id !== undefined && body.artisan_id !== null) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.artisan_id)) {
      errors.artisan_id = 'artisan_id must be a valid UUID';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateArtisanInput(body, isUpdate = false) {
  const errors = {};

  if (!isUpdate || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.name = 'Artisan name is required';
    } else if (body.name.trim().length > 255) {
      errors.name = 'Name must be 255 characters or less';
    }
  }

  if (!isUpdate || body.phone !== undefined) {
    if (!body.phone || typeof body.phone !== 'string' || body.phone.trim().length === 0) {
      errors.phone = 'Phone number is required';
    } else if (body.phone.trim().length > 20) {
      errors.phone = 'Phone must be 20 characters or less';
    }
  }

  if (body.preferred_language !== undefined && body.preferred_language.length > 50) {
    errors.preferred_language = 'Preferred language must be 50 characters or less';
  }

  if (body.location !== undefined && body.location.length > 255) {
    errors.location = 'Location must be 255 characters or less';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Validate and normalize an Indian mobile number to E.164 (+91XXXXXXXXXX).
 *
 * Accepts: "9876543210", "09876543210", "919876543210", "+919876543210"
 * Rejects: non-10-digit, wrong leading digit (must be 6-9), letters, etc.
 *
 * @returns {{ valid: boolean, normalized: string|null, error: string|null }}
 */
export function normalizeIndianMobile(input) {
  if (typeof input !== 'string') return { valid: false, normalized: null, error: 'Mobile number is required' };

  const digits = input.replace(/\D/g, '');

  // Strip a leading '0' (common Indian domestic prefix), e.g. 09876...
  let core = digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits;
  // Strip a leading '91' country code supplied without '+', e.g. 919876...
  core = core.length === 12 && core.startsWith('91') ? core.slice(2) : core;

  const valid = core.length === 10 && /^[6-9]\d{9}$/.test(core);
  if (!valid) {
    return { valid: false, normalized: null, error: 'Mobile number must be a valid 10-digit Indian number (e.g. 9876543210)' };
  }
  return { valid: true, normalized: `+91${core}`, error: null };
}
