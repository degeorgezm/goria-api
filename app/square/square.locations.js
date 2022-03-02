// logger gives us insight into what's happening
const logger = require('./square.logger');
// square provides the API client and error types
const { ApiError, client: square } = require('./square.client');

const { locationsApi } = square;

const getLocations = async () => {
    // The try/catch statement needs to be called from within an asynchronous function
    try {
        logger.info("Fetching Square Client Locations...");
        // Call listLocations method to get all locations in this Square account
        let listLocationsResponse = await locationsApi.listLocations();

        // Get first location from list
        let firstLocation = listLocationsResponse.result.locations[0];

        console.log("Here is your first Sqaure location: ", firstLocation)
    } catch (error) {
        if (error instanceof ApiError) {
            console.log("There was an error in your request: ", error.errors)
        } else {
            console.log("Unexpected Error: ", error)
        }
    }
}

// Invokes the async function
getLocations()