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
