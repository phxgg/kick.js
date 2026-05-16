/* Serializable base + reflective serializer
 * Extend Serializable to auto-expose all (inherited) getters as JSON.
 * - Recurses into nested Serializable instances (and other objects)
 * - Honors custom toJSON for objects NOT extending Serializable
 * - Prevents circular references
 */
export interface SerializeOptions {
  include?: (key: string, value: unknown, owner: any) => boolean;
  transform?: (key: string, value: unknown, owner: any) => unknown;
  circularValue?: (value: unknown) => unknown;
  skipNull?: boolean;
  skipUndefined?: boolean;
}

export abstract class Serializable {
  // Override in subclasses if you want per-class default options
  protected static serializeDefaults?: SerializeOptions;

  toJSON(options?: SerializeOptions) {
    const ctor = this.constructor as typeof Serializable;
    return serializeInstance(this, {
      ...(ctor.serializeDefaults || {}),
      ...(options || {}),
    });
  }
}

/*
 * Example usage:
 *
 * toJSON() {
 *  // Automatically gathers all getters (bannerPicture, broadcasterUserId, category, etc.)
 *  // and recurses into nested objects that implement toJSON (e.g., Category).
 *  return serialize(this, {
 *    // Example: filter out large / sensitive fields if needed
 *    // include: (key) => key !== 'someSensitiveGetter',
 *  });
 * }
 */
function serializeInstance<T extends object>(instance: T, opts: SerializeOptions = {}): any {
  const { include, transform, circularValue = () => '[Circular]', skipNull = false, skipUndefined = true } = opts;
  const visited = new WeakSet();

  function isPlainObject(v: any) {
    if (v === null || typeof v !== 'object') return false;
    const proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
  }

  function inner(value: any): any {
    if (value === null) return null;
    if (typeof value !== 'object') return value;
    if (visited.has(value)) return circularValue(value);

    // Use native toJSON ONLY if not a Serializable descendant (so we do reflection for those).
    if (typeof value.toJSON === 'function' && !(value instanceof Serializable)) {
      try {
        const out = value.toJSON();
        // continue processing in case nested structures need handling
        return inner(out);
      } catch {
        // fall through
      }
    }

    if (Array.isArray(value)) {
      visited.add(value);
      const arr = value.map((el) => inner(el));
      visited.delete(value);
      return arr;
    }

    if (isPlainObject(value)) {
      visited.add(value);
      const out: any = {};
      for (const k of Object.keys(value)) {
        const v = value[k];
        if (skipUndefined && v === undefined) continue;
        if (skipNull && v === null) continue;
        out[k] = inner(v);
      }
      visited.delete(value);
      return out;
    }

    // Custom class (Serializable or other) – reflect getters.
    visited.add(value);
    const out: any = {};
    const seen = new Set<string>();
    let proto = Object.getPrototypeOf(value);
    while (proto && proto !== Object.prototype) {
      const descriptors = Object.getOwnPropertyDescriptors(proto);
      for (const [name, desc] of Object.entries(descriptors)) {
        if (name === 'constructor') continue;
        if (seen.has(name)) continue;
        if (typeof desc.get === 'function') {
          let val;
          try {
            val = desc.get.call(value);
          } catch {
            continue;
          }
          if (include && !include(name, val, value)) continue;
          if (skipUndefined && val === undefined) continue;
          if (skipNull && val === null) continue;
          const processed = inner(val);
          out[name] = transform ? transform(name, processed, value) : processed;
          seen.add(name);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
    visited.delete(value);
    return out;
  }

  return inner(instance);
}

// Optional helper export if you need to serialize non-Serializable instances manually
export const serialize = serializeInstance;
