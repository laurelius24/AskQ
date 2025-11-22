
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback?: () => void;
    gm_authFailure?: () => void;
  }
}

// Key provided by user for Maps JavaScript API
const GOOGLE_API_KEY = "AIzaSyB_rbKpIk83iHDI27ww8pqd_6or-5hljwE";

let isLoaded = false;
let isError = false;
let autocompleteService: any = null;
let placesService: any = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isLoaded) {
      resolve();
      return;
    }
    
    if (isError) {
      resolve();
      return;
    }

    if (window.google && window.google.maps && window.google.maps.places) {
      isLoaded = true;
      resolve();
      return;
    }

    window.initGoogleMapsCallback = () => {
        isLoaded = true;
        initServices();
        resolve();
    };

    window.gm_authFailure = () => {
        console.warn("Google Maps API Authentication Error (AuthFailure). Falling back to local data.");
        isError = true;
        isLoaded = false;
        resolve();
    };

    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        if (window.google && window.google.maps) {
            isLoaded = true;
            resolve();
        }
        return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
        console.warn("Google Maps Script Network Error:", e);
        isError = true;
        resolve();
    };
    document.head.appendChild(script);
  });
};

export const initServices = () => {
  if (isError) return;
  
  if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
  }

  try {
      if (!autocompleteService) {
        autocompleteService = new window.google.maps.places.AutocompleteService();
      }
      if (!placesService) {
          const dummyDiv = document.createElement('div');
          placesService = new window.google.maps.places.PlacesService(dummyDiv);
      }
  } catch (e) {
      console.warn("Error initializing Google Maps services:", e);
      isError = true;
  }
};

export interface GooglePlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const performSearch = (input: string, options: any): Promise<GooglePlaceResult[]> => {
  return new Promise((resolve) => {
    if (!input || isError) {
      resolve([]);
      return;
    }

    if (isLoaded && !autocompleteService) {
        initServices();
    }

    if (!autocompleteService) {
        resolve([]);
        return;
    }

    try {
        autocompleteService.getPlacePredictions({ input, ...options }, (predictions: any[], status: string) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT' || status === 'UNKNOWN_ERROR') {
                console.warn(`Google Maps API Error: ${status}. Switching session to local database only.`);
                isError = true;
            }
            resolve([]);
          } else {
            resolve(predictions);
          }
        });
    } catch (e) {
        console.warn("Google Maps Search Exception:", e);
        resolve([]);
    }
  });
};

export const searchCities = (input: string, countryCode?: string): Promise<GooglePlaceResult[]> => {
    const request: any = {
      types: ['(cities)'],
    };
    if (countryCode) {
      request.componentRestrictions = { country: countryCode };
    }
    return performSearch(input, request);
};

export const searchCountries = (input: string): Promise<GooglePlaceResult[]> => {
    return performSearch(input, {
        types: ['country'] // STRICT: Only countries, no cities/regions
    });
};

export const getCountryCode = (placeId: string): Promise<string | null> => {
    return new Promise((resolve) => {
        if (!placesService) {
            initServices();
            if (!placesService) {
                resolve(null);
                return;
            }
        }

        const request = {
            placeId: placeId,
            fields: ['address_components']
        };

        placesService.getDetails(request, (place: any, status: string) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.address_components) {
                const countryComponent = place.address_components.find((c: any) => c.types.includes('country'));
                if (countryComponent) {
                    resolve(countryComponent.short_name); // e.g. "US", "CZ"
                    return;
                }
            }
            resolve(null);
        });
    });
};

export const getFlagEmoji = (countryCode: string | null | undefined): string => {
  if (!countryCode) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
