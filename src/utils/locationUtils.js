import { ALL_INDIAN_STATES } from '../data/indiaStatesAndDistricts.js';
import KANPUR_PLACES from '../data/kanpurPlaces.json';

/**
 * Deduplicate address string tokens ignoring case
 */
const dedupeParts = (parts = []) => {
  const seen = new Set();
  const res = [];
  for (const p of parts) {
    if (!p) continue;
    const clean = String(p).trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      res.push(clean);
    }
  }
  return res;
};

/**
 * Match a raw state string to official Indian states list
 */
const matchIndianState = (rawState = '') => {
  if (!rawState) return 'Uttar Pradesh';
  const clean = rawState.trim().toLowerCase();
  const exact = ALL_INDIAN_STATES.find(s => s.toLowerCase() === clean);
  if (exact) return exact;

  const partial = ALL_INDIAN_STATES.find(
    s => clean.includes(s.toLowerCase()) || s.toLowerCase().includes(clean)
  );
  return partial || rawState || 'Uttar Pradesh';
};

/**
 * Match a locality or query against Kanpur local places database
 */
const findKanpurMatch = (searchTerms = []) => {
  for (const term of searchTerms) {
    if (!term || typeof term !== 'string') continue;
    const t = term.trim().toLowerCase();
    if (t.length < 3) continue;

    const matched = KANPUR_PLACES.find(p => {
      const name = (p.name || '').toLowerCase();
      const place = (p.place || '').toLowerCase();
      const loc = (p.locality || '').toLowerCase();
      const teh = (p.tehsil || '').toLowerCase();
      return (
        name === t ||
        place === t ||
        loc === t ||
        (p.keywords && p.keywords.includes(t)) ||
        (t.length > 4 && (name.includes(t) || loc.includes(t)))
      );
    });

    if (matched) return matched;
  }
  return null;
};

/**
 * Clean display name by stripping superfluous country & postal codes
 */
const formatCleanDisplayName = (displayName = '') => {
  if (!displayName) return '';
  return displayName
    .replace(/,\s*(India|Bharat)$/i, '')
    .replace(/,\s*\d{6}$/, '')
    .trim();
};

/**
 * Fetch current browser geolocation with accuracy and timeout
 */
export const getCurrentLivePosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser or device.'));
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0),
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp || Date.now()
        });
      },
      (error) => {
        let msg = 'Failed to acquire live location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'GPS or Network location information is unavailable. Please check your GPS/network.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please ensure GPS is enabled and try again.';
            break;
          default:
            msg = error.message || 'An unknown error occurred while retrieving location.';
        }
        const customErr = new Error(msg);
        customErr.code = error.code;
        reject(customErr);
      },
      defaultOptions
    );
  });
};

/**
 * Reverse geocode latitude and longitude to complete, human-readable address details
 * Multi-tier strategy:
 * 1. Vite & Server-side proxy (/api/geocode/reverse) -> OpenStreetMap Nominatim with full street/pincode
 * 2. BigDataCloud Client API
 * 3. Kanpur places local database enrichment
 */
export const reverseGeocodeCoordinates = async (latitude, longitude) => {
  let addressData = null;

  // 1. First Priority: Call local proxy endpoint (Vite dev server middleware or Express server backend)
  // This completely eliminates browser CORS & 403 blocks and provides full road, suburb, building & pincode
  const proxyEndpoints = [
    `/api/geocode/reverse?lat=${latitude}&lon=${longitude}`,
    `/api/v1/geocode/reverse?lat=${latitude}&lon=${longitude}`
  ];

  for (const endpoint of proxyEndpoints) {
    if (addressData) break;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || data;
        if (addr && (addr.road || addr.suburb || addr.city || addr.town || addr.county || data.display_name)) {
          const rawState = addr.state || '';
          const matchedState = matchIndianState(rawState);
          const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || 'Kanpur';
          const area = addr.suburb || addr.neighbourhood || addr.subdistrict || addr.locality || '';
          const pincode = addr.postcode || '';

          const streetParts = dedupeParts([
            addr.house_number || addr.building || addr.amenity,
            addr.road,
            area
          ]);

          let formattedAddress = '';
          if (streetParts.length > 0) {
            formattedAddress = streetParts.join(', ');
          } else if (data.display_name) {
            formattedAddress = formatCleanDisplayName(data.display_name);
          } else {
            formattedAddress = dedupeParts([area, city]).join(', ');
          }

          addressData = {
            address: formattedAddress || `Premises at ${city}`,
            city,
            state: matchedState,
            pincode,
            area,
            displayName: data.display_name || formattedAddress,
            source: 'proxy_nominatim'
          };
        }
      }
    } catch (proxyErr) {
      // Local proxy not available (e.g. running without dev proxy), continue to next strategy
    }
  }

  // 2. Second Priority: Direct BigDataCloud Client-Side API
  if (!addressData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const bdc = await res.json();
        const rawState = bdc.principalSubdivision || '';
        const matchedState = matchIndianState(rawState);
        const city = bdc.city || bdc.locality || 'Kanpur';
        const locality = bdc.locality && bdc.locality.toLowerCase() !== city.toLowerCase() ? bdc.locality : '';
        const pincode = bdc.postcode || '';

        // Extract specific administrative names (locality, tehsil, ward)
        let adminLocality = '';
        if (Array.isArray(bdc.localityInfo?.administrative)) {
          const specificItems = bdc.localityInfo.administrative
            .filter(a => a.name && !['India', rawState, city, `${city} District`].includes(a.name) && a.order >= 6)
            .map(a => a.name);
          if (specificItems.length > 0) {
            adminLocality = specificItems[0];
          }
        }

        const effectiveArea = locality || adminLocality || '';

        // Try to match in Kanpur local places database to get real mandi / locality / pincode
        const matchedPlace = findKanpurMatch([effectiveArea, locality, adminLocality, city]);
        const finalPincode = pincode || matchedPlace?.pincode || '';
        const finalArea = matchedPlace?.name || effectiveArea;

        const streetParts = dedupeParts([
          'Shop / Store Premises',
          finalArea,
          city
        ]);

        addressData = {
          address: streetParts.join(', '),
          city,
          state: matchedState,
          pincode: finalPincode,
          area: finalArea,
          displayName: `${streetParts.join(', ')}, ${matchedState} ${finalPincode}`.trim(),
          source: 'bigdatacloud'
        };
      }
    } catch (bdcErr) {
      console.warn('BigDataCloud reverse geocode failed:', bdcErr?.message || bdcErr);
    }
  }

  // 3. Third Priority: Local coordinates proximity matching in Kanpur
  if (!addressData) {
    // If coordinates are in Kanpur region (~26.4N, ~80.3E)
    const isKanpurRegion = Math.abs(latitude - 26.4499) < 0.5 && Math.abs(longitude - 80.3319) < 0.5;
    const defaultPlace = isKanpurRegion ? KANPUR_PLACES[0] : null;

    addressData = {
      address: isKanpurRegion ? 'Shop / Retail Premises, Civil Lines Wholesale Market' : 'Shop / Retail Premises',
      city: isKanpurRegion ? 'Kanpur' : 'Kanpur',
      state: 'Uttar Pradesh',
      pincode: defaultPlace?.pincode || '208001',
      area: defaultPlace?.name || 'Kanpur Central',
      displayName: `Kanpur, Uttar Pradesh`,
      source: 'offline_fallback'
    };
  }

  return {
    ...addressData,
    latitude,
    longitude,
    mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
  };
};
