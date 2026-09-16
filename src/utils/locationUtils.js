import { ALL_INDIAN_STATES } from '../data/indiaStatesAndDistricts.js';

/**
 * Deduplicate address components ignoring case
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
            msg = 'Location permission denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'GPS or Network location information is unavailable. Please check your connection or location settings.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please try again or ensure your GPS is enabled.';
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
 * Reverse geocode latitude and longitude to full address details
 * Uses Nominatim with fallback to BigDataCloud
 */
export const reverseGeocodeCoordinates = async (latitude, longitude) => {
  let addressData = null;

  // 1. Try Nominatim (OpenStreetMap)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const headers = { 'Accept': 'application/json' };
    // Node / PWA environments can set User-Agent safely
    if (typeof window === 'undefined' || !window.navigator) {
      headers['User-Agent'] = 'AnujEnterprises/1.0';
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers,
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;

        // Match state with Indian states database
        const rawState = addr.state || '';
        const matchedState = ALL_INDIAN_STATES.find(s => 
          s.toLowerCase() === rawState.trim().toLowerCase()
        ) || ALL_INDIAN_STATES.find(s => 
          rawState.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rawState.toLowerCase())
        ) || rawState || 'Uttar Pradesh';

        const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || 'Kanpur';
        const pincode = addr.postcode || '';
        const area = addr.suburb || addr.neighbourhood || addr.subdistrict || addr.locality || '';

        const streetParts = dedupeParts([
          addr.house_number || addr.building || addr.amenity,
          addr.road,
          area
        ]);

        const formattedAddress = streetParts.length > 0 
          ? streetParts.join(', ')
          : (data.display_name ? data.display_name.replace(/,\s*India$/i, '').trim() : dedupeParts([area, city]).join(', '));

        addressData = {
          address: formattedAddress,
          city,
          state: matchedState,
          pincode,
          area,
          displayName: data.display_name || '',
          raw: data
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed or timed out, trying fallback:', err?.message || err);
  }

  // 2. Fallback to BigDataCloud client API if Nominatim didn't return address
  if (!addressData) {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (res.ok) {
        const bdc = await res.json();
        const rawState = bdc.principalSubdivision || '';
        const matchedState = ALL_INDIAN_STATES.find(s => 
          s.toLowerCase() === rawState.trim().toLowerCase()
        ) || ALL_INDIAN_STATES.find(s => 
          rawState.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rawState.toLowerCase())
        ) || rawState || 'Uttar Pradesh';

        const city = bdc.city || bdc.locality || 'Kanpur';
        const area = bdc.locality && bdc.locality.toLowerCase() !== city.toLowerCase() ? bdc.locality : '';
        const pincode = bdc.postcode || '';

        // Extract more specific admin names if available
        let extraLocality = '';
        if (Array.isArray(bdc.localityInfo?.administrative)) {
          const specific = bdc.localityInfo.administrative
            .filter(a => a.name && !['India', rawState, city].includes(a.name) && a.order >= 6)
            .map(a => a.name);
          if (specific.length > 0) {
            extraLocality = specific[0];
          }
        }

        const parts = dedupeParts([extraLocality, area, city]);
        const formattedAddress = parts.length > 0 ? parts.join(', ') : `Location near ${city}`;

        addressData = {
          address: formattedAddress,
          city,
          state: matchedState,
          pincode,
          area: area || extraLocality,
          displayName: `${formattedAddress}, ${matchedState} ${pincode}`.trim(),
          raw: bdc
        };
      }
    } catch (fallbackErr) {
      console.warn('BigDataCloud reverse geocode also failed:', fallbackErr?.message || fallbackErr);
    }
  }

  // 3. Fallback if both reverse geocoding APIs fail
  if (!addressData) {
    addressData = {
      address: `Live Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      pincode: '',
      area: '',
      displayName: `Lat: ${latitude}, Lng: ${longitude}`
    };
  }

  return {
    ...addressData,
    latitude,
    longitude,
    mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
  };
};
