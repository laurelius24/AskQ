
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"; // Вставьте сюда ваш API ключ

let isLoaded = false;
let autocompleteService: any = null;
let placesService: any = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isLoaded) {
      resolve();
      return;
    }

    if (window.google && window.google.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isLoaded = true;
      resolve();
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

export const initServices = () => {
  if (!window.google || !window.google.maps || !window.google.maps.places) return;
  if (!autocompleteService) {
    autocompleteService = new window.google.maps.places.AutocompleteService();
  }
  // PlacesService requires a DOM node, usually a map or a div. creating a dummy one.
  if (!placesService) {
      const dummyDiv = document.createElement('div');
      placesService = new window.google.maps.places.PlacesService(dummyDiv);
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

export const searchCities = (input: string, countryCode?: string): Promise<GooglePlaceResult[]> => {
  return new Promise((resolve) => {
    if (!input || !autocompleteService) {
      resolve([]);
      return;
    }

    const request: any = {
      input,
      types: ['(cities)'],
    };

    if (countryCode) {
      request.componentRestrictions = { country: countryCode };
    }

    autocompleteService.getPlacePredictions(request, (predictions: any[], status: string) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
        resolve([]);
      } else {
        resolve(predictions);
      }
    });
  });
};
