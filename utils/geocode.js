const axios = require("axios");

async function getCoordsForAddress(address) {
  const apiKey = "4104041376044cdd841d6f1d75df17ce";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry;
      return {
        lat: location.lat,
        lng: location.lng,
        // formattedAddress: response.data.results[0].formatted,
      };
    } else {
      throw new Error("Geocoding failed: No results found");
    }
  } catch (error) {
    console.error("Error occurred while geocoding:", error);
    throw error;
  }
}

module.exports = getCoordsForAddress;
// Example usage
// geocodeAddress("tehran, IRAN")
//   .then((location) => console.log(location))
//   .catch((error) => console.error(error));
