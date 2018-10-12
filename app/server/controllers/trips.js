const request = require('request');
const moment = require('moment');
const Trip = require('../models/trip');
const AMADEUS_API = process.env.AMADEUS_API;
console.log(AMADEUS_API);

module.exports = {
  //
  // GET /create
  createGet: async (req, res) => {
    const { page } = req.params;
    if (page === 'details') {
      if (!req.session.data) {
        return res.redirect('/trips/create');
      }
      // TODO modify this
      return res.render('forms/create-form-layout',
      {
        page: 'create-form.ejs',
        title: 'Trip Details • Adventum',
        user: req.user,
        data: req.session.data
      });
    }
    res.render('forms/create-form-layout',
      {
        page: 'create-map.ejs',
        stylesheet: 'map.css',
        title: 'Select Locations • Adventum',
        user: req.user,
        prev_locations: []
      });
  },

  createPrevMapGet: async(req, res) => {
    res.render('forms/create-form-layout', {
      page: 'create-map.ejs',
      stylesheet: 'map.css',
      title: 'Select Locations • Adventum',
      user: req.user,
      prev_locations: req.session.data
    });
  },

  createTouristGet: async(req, res) => {
    res.render('forms/create-form-layout',
      {
        page: 'tourist-map.ejs',
        stylesheet: 'map.css',
        title: 'Tourist Attractions • Adventum',
        user: req.user
      });
  },
  //
  // POST /trips
  tripsPost: async (req, res) => {
    req.session.data = req.body;
    res.render('trips/create-map', {
      prev_locations: []
    });
  },
  //
  // POST /trips/details
  detailsPost: async (req, res) => {
    // save trip info
    var name = req.body.title;
    const {date} = req.body;
    var optradio = req.body.optradio;
    const {duration} = req.body;
    var numPeople = req.body.numPeople;
    const {location_data} = req.session.data;
    const {user} = req;
    const locations = [];
    const order = JSON.parse(req.body.order);
    const nLocations = order.length;

    // TODO serialize

    var trip_duration = 0;

    runningDate = new moment(date).utc();
    for (var i = 0; i < nLocations; i++) {
      for (var j = 0; j < location_data.length; j++) {
        if (order[i] === location_data[j][0]) {
          locations.push({
            name: location_data[j][0],
            x: location_data[j][2],
            y: location_data[j][1],
            duration: duration[i],
            transportation: req.body['exampleRadios ' + location_data[j][3]],
            departureDate: runningDate.format('YYYY-MM-DD')
          });
          runningDate.add(duration[i], 'days');
        }
      }

      if (locations[i].duration && !isNaN(locations[i].duration)) {
        trip_duration += parseInt(locations[i].duration);
      }
    }

    let trip;

    try {
      trip = await Trip.create({
        name: name,
        start_date: date,
        start_date_str: moment(date).format("MMM DD, YYYY"),
        total_duration: trip_duration,
        _userId: user._id,
        trpriority: optradio,
        num_people: numPeople,
        locations,
        favorite: false
      });
    } catch (e) {
      console.log(e);
      req.flash('error', 'Sorry, something went wrong while attempting to create your trip.');
      return res.redirect('/trips/create/details');
    }

    if (trip) {
      res.redirect(`/trips/${trip._id}`);
    }


    // TODO render itinerary.ejs
    // TODO itinerary.ejs makes ajax calls to get info about the trip (on page load)
    // TODO server processes requests and sends back html
    // TODO front end replaces spinner with html
    // TODO remove below
    //TODO - add checks for valid date and valid order (ie. an invalid order would be 1,5 - should be 1,2)
    /*const round_trip = req.body.rt;
    const efficiency = req.body.optradio;
    const {duration} = req.body;
    const {location_data} = req.session.data;
    let date = (req.body.date).split('/');
    date = date[2] + '-' + date[0] + '-' + date[1];
    console.log('\nbeginning itinerary requests...');
    console.log(`\tstart date: ${date}`);
    let queryStart = new Date();
    const apCodes = await getAirportCodes(duration.length, location_data);
    if (!apCodes) {
      req.flash('error', 'Sorry, we were unable to find an airport near one of your locations.');
      return res.redirect('/trips/create/details');
    }
    console.log(`\tfinished airport code request in ${(new Date() - queryStart) / 1000} seconds.`);

    const trip_data = await makeTripData(req, apCodes, location_data, date);
    // console.log(trip_data);

    queryStart = new Date();
    const [flights, hotels] = await Promise.all([
      getFlights(trip_data, efficiency),
      getHotels(trip_data)
    ]);
    console.log(`\tfinished flight and hotel query in ${(new Date() - queryStart) / 1000} seconds.`);

    if (!flights) {
      console.log('error finding flights.')
      req.flash('error', 'Sorry, something went wrong while attempting to find flights.');
      return res.redirect('/trips/create/details');
    }

    if (!hotels) {
      console.log('error finding hotels.')
      req.flash('error', 'Sorry, something went wrong while attempting to find hotels.');
      return res.redirect('/trips/create/details');
    }

    console.log(hotels);
    const flight_itinerary = [];
    const flight_prices = [];
    const hotel_itinerary = [];
    const hotel_prices = [];

    for (var j = 0; j < flights.length; j++) {
      var flight = flights[j].results[0].itineraries[0].outbound.flights;
      flight_prices.push(flights[j].results[0].fare.total_price);
      for (var i = 0 ; i < flight.length; i++) {
        var origin = flight[i].origin.airport;
        var dest = flight[i].destination.airport;
        var departure = flight[i].departs_at;
        var arrival = flight[i].arrives_at;
        var airline = flight[i].operating_airline;
        var flight_number = flight[i].flight_number;
        var travel_class = flight[i].booking_info.travel_class;
        var plan = {departure, arrival, origin, dest, airline, flight_number, travel_class};
        flight_itinerary.push(plan);
      }
    }

    //console.log(flight_itinerary);
    // console.log('------')
    //console.log(flight_prices);
    for (var i = 0; i < hotels.length; i++) {
      var result = hotels[i].results[0];
      hotel_prices.push(result.total_price.amount);
      var name = result.property_name;
      var addr = result.address.line1 + " " + result.address.city + ", " + result.address.region + " " + result.address.postal_code + ", " + result.address.country;
      hotel_itinerary.push({name, addr});
    }

    //console.log('-----');
    //console.log(hotels);
    //console.log('-----');
    //console.log(hotel_prices);
    res.render('forms/create-form-layout',
      {
        page: 'itinerary.ejs',
        title: 'Itinerary • Adventum',
        flights: flight_itinerary,
        flight_prices,
        hotels: hotel_itinerary,
        hotel_prices,
        user: req.user
      });*/
  },
  tripIdeasGet: async (req, res) => {
    res.render('forms/create-form-layout',
    {
      page: 'trip-ideas.ejs',
      title: `Trip Ideas • Adventum`,
      user: req.user
    });
  },
  tripGet: async (req, res) => {
    const {tripId} = req.params;
    if (!tripId) {
      req.flash('error', 'Invalid trip ID.');
      return res.redirect('/');
    }

    let trip;
    try {
      trip = await Trip.findById(tripId);
    } catch (e) {
      console.log(e);
      req.flash('error', 'Error finding trip by tripId.');
      return res.redirect('/');
    }

    res.render('forms/create-form-layout',
      {
        page: 'itinerary.ejs',
        title: `${trip.name} Itinerary • Adventum`,
        user: req.user,
        trip
      });
  },
  tripDelete: async (req, res) => {
    const {tripId} = req.params;
    let trip;
    try {
      trip = await Trip.findById(tripId);
      await trip.remove();
    } catch (e) {
      console.log(e);
      req.flash('error', 'Sorry, we could not delete that trip.');
      return res.redirect('/');
    }
    req.flash('success', `We removed your trip named ${trip.name}`);
    res.redirect('/profiles/trips');
  },
  tripFavorite: async(req, res) => {
    const {tripId} = req.params;
    let trip;
    try {
      trip = await Trip.findById(tripId);
      await trip.updateOne({favorite: true});
    } catch (e) {
      console.log(e);
      req.flash('error', 'Sorry, favoriting the trip failed.');
      return res.redirect('/');
    }

    req.flash('success', `Your trip named ${trip.name} has been favorited!`);
    res.redirect('/profiles/trips');
  },
  tripUnFavorite: async(req, res) => {
    const {tripId} = req.params;
    let trip;
    try {
      trip = await Trip.findById(tripId);
      await trip.updateOne({favorite: false});
    } catch (e) {
      console.log(e);
      req.flash('error', 'Sorry, favoriting the trip failed.');
      return res.redirect('/');
    }

    req.flash('success', `Your trip named ${trip.name} has been unfavorited.`);
    res.redirect('/profiles/trips');
  },
  transportationGet: async (req, res) => {
    const {tripId} = req.params;
    const index = await Number(req.query.index);
    const {type} = req.query;

    console.log('index: '+ index);

    if (!tripId) { return res.json({error: 'Invalid trip ID.'}); }
    if (isNaN(index)) { return res.json({error: 'Invalid location index.'}); }
    if (!type) { return res.json({error: 'No type...'}); }

    let trip;
    try {
      trip = await Trip.findById(tripId);
    } catch (e) {
      console.log(e);
      req.flash('error', 'Error finding trip by tripId.');
      return res.redirect('/');
    }

    if (index === trip.locations.length - 1) { return res.json({ OK: 'last index' }) }


    switch (type) {
      case 'flight':
        const flights = await getFlights(trip, index);
        if (flights) { return res.json(flights); }
        else { return res.json({ error: 'Error retrieving flights' }); }
      case 'hotel':
        return await getHotels(trip, index);
      default:
        return res.json({error: 'Invalid type...'});
    }
    //const apCodes = await getAirportCodes(trip.locations.length, trip.locations);
    //const trip_data = await makeTripData(apCodes, trip);
    //const flight_data = await getFlights(trip_data, trip.trpriority, trip.num_people);
    //const hotel_data = await getHotels(trip_data);
  }
}

function call_api(api_call, return_info) {
  return new Promise(function(resolve, reject) {
    request(api_call, function(error, response, body) {
      if (error) {
        return reject(error);
      }
      //console.log(body);
      //console.log(return_info);
      var json = JSON.parse(body);
      if (return_info === 1 && !json.length) {
        return reject('Nothing found!');
      }
      if (return_info === 1) { //return airport code
        return resolve(json[0].airport);
      }
      else if (return_info === 2) { //return airfare information
        return resolve(json);
      }
      else if (return_info === 3) { //return hotel information
        return resolve(json);
      }
    });
  });
}

async function getFlights(trip, index) {
  /*  input check */
  if (!trip) {
    console.log('No trip...');
    return false;
  }
  if (isNaN(index) || trip.locations.length <= 1) {
    console.log('Index NaN or trip length too small.');
    return false;
  }

  await console.log(trip.locations[index]);
  await console.log(index+1);
  await console.log(trip.locations[index+1]);
  await console.log(`index: ${index}`)
  const lon1 = trip.locations[index].x;
  const lat1 = trip.locations[index].y;
  const lon2 = trip.locations[index+1].x;
  const lat2 = trip.locations[index+1].y;

  try {
    /*  get airport code to use in flight search
   *  probably should just store the airport codes  */

    const ap1 = await getAirportCode(lat1, lon1);
    const ap2 = await getAirportCode(lat2, lon2);

    /*  get flights using airport code  */
    const flights = await callFlightsApi(ap1, ap2, index, trip);

    return flights;

  } catch (e) {
    console.log(e);
    return false;
  }

}

async function getAirportCode(lat, lon) {
  const api_call = `https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey=${AMADEUS_API}&latitude=${lat}&longitude=${lon}`;
  try {
    const apCode = await call_api(api_call, 1);
    return apCode;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function callFlightsApi(ap1, ap2, index, trip) {
  const {trpriority} = trip;
  const {num_people} = trip;
  const date = trip.locations[index]['departureDate'];

  let api_call = `https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=${AMADEUS_API}&origin=${ap1}&destination=${ap2}&departure_date=${date}&number_of_results=5`;
  if (trpriority === 'te') {
    api_call += '&nonstop=true';
  }
  api_call += `&adults=${num_people}`;
  let flights;
  try {
    flights = await call_api(api_call, 2);
    return flights;
  } catch (e) {
    console.log(e);
    return false;
  }
}
  /*
  const promises = [];
  for (var i = 0; i < length; i++) {
    const lat = locationData[i].y;
    const lng = locationData[i].x;
    const api_call = "https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey=L1p5fbab3ElOhCBWvOibeZKDeHwcisi4";
    const get_airport_code = api_call + "&latitude=" + lat + "&longitude=" + lng;
    promises.push(call_api(get_airport_code, 1));
  }
  try {
    data = await Promise.all(promises);
    return data;
  } catch (e) {
    console.log(e);
    return false;
  }*/

async function makeTripData(apCodes, trip) {
  let data = [];
  const nLocs = apCodes.length;
  let date = trip.start_date;
  for (var i = 0; i < nLocs; i++) {
    const radio = "exampleRadios " + i;
    const name = trip.locations[i].name;
    const lat = trip.locations[i].y;
    const lng = trip.locations[i].x;
    const td = {
      duration: trip.locations[i].duration,
      order: i,
      transportation: trip.locations[i].transportation,
      name,
      lat,
      lng,
      apCode: apCodes[i]
    };
    data.push(td)
  }

  for (var i = 0; i < nLocs; i++) {
    var start_date;
    if (i === 0) {
      data[i].start_date = moment(date).format("YYYY-MM-DD") + '';
      data[i].end_date = moment(date).format("YYYY-MM-DD") + '';
    }
    else {
      start_date = moment(date).format("YYYY-MM-DD") + '';
      console.log(start_date);
      var date_split = start_date.split('-');
      date = moment([Number(date_split[0]), Number(date_split[1]) - 1, Number(date_split[2])]).add(Number(data[i].duration), 'days');
      date = moment(date).format("YYYY-MM-DD");
      data[i].start_date = start_date;
      data[i].end_date = date;
    }
  }
  return data;
}

/*
async function getFlights(trip_data, efficiency, numPeople) {
  const trip_promises = [];
  for (var i = 0; i < trip_data.length; i++) {
    if (trip_data[i].transportation === 'plane') {
      if (i < 1) {
        console.log("Cannot route flight from origin to origin!");
        continue;
      }
      else {
        const origin = trip_data[i-1].apCode;
        const destination = trip_data[i].apCode;
        const departure_date = trip_data[i].start_date;
        api_call = `https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=L1p5fbab3ElOhCBWvOibeZKDeHwcisi4&origin=${origin}&destination=${destination}&departure_date=${departure_date}&number_of_results=5`;
        if (efficiency === 'te') {
          api_call = api_call + "&nonstop=true";
        }
        api_call = api_call + "&adults=" + numPeople;
        trip_promises.push(call_api(api_call, 2));
      }
    }
  }

  try {
    const data = await Promise.all(trip_promises);
    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
}
*/

async function getHotels(trip_data) {
  const hotel_promises = [];
  for (var i = 0; i < trip_data.length; i++) {
    if (i > 0) {
      var check_in = trip_data[i].start_date;
      var check_out = trip_data[i].end_date;

      if (check_in != check_out) {
        api_call = "https://api.sandbox.amadeus.com/v1.2/hotels/search-circle?apikey=L1p5fbab3ElOhCBWvOibeZKDeHwcisi4";
        api_call = api_call + "&latitude=" + trip_data[i].lat + "&longitude=" + trip_data[i].lng + "&radius=50" + "&check_in=" + check_in + "&check_out=" + check_out + "&lang=EN&currency=USD&number_of_results=5";
        hotel_promises.push(call_api(api_call, 3));
      }
    }
  }

  try {
    const data = await Promise.all(hotel_promises);
    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
}
