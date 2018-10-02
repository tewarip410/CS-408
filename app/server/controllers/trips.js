const request = require('request');
const moment = require('moment');
const Trip = require('../models/trip');

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
        user: req.user
      });
  },
  //
  // POST /
  tripsPost: async (req, res) => {
    req.session.data = req.body;
    res.render('trips/create-map');
  },
  detailsPost: async (req, res) => {
    // save trip info
    const {name} = req.body;
    const {date} = req.body;
    const {roundTrip} = req.body;
    const {optradio} = req.body;
    const {duration} = req.body;
    const {order} = req.body;
    const {location_data} = req.session.data;
    const {user} = req;
    const nLocations = order.length;
    const locations = [];
    const transportation = [];
    console.log(location_data);
    for (var i = 0; i < nLocations; i++) {
      transportation.push(
        req.body[`transportation_${i}`]
      );
    }
    for (var i = 0; i < nLocations; i++) {
      // if (removed[i]) { continue; }
      // TODO use order to sort first
      locations.push({
        name: location_data[i][0],
        x: location_data[i][2],
        y: location_data[i][1],
        duration: duration[i],
        transportation: transportation[i]
      });
    }

    let trip;
    try {
      trip = await Trip.create({
        name,
        start_date: date,
        _userId: user._id,
        locations,
        optradio,
        roundTrip
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
  transportationGet: async (req, res) => {
    const {tripId} = req.params;
    const {index} = req.query;
    console.log(index);

    if (!tripId) { return res.json({error: 'Invalid trip ID.'}); }
    if (!index) { return res.json({error: 'Invalid location index.'}); }
    
    let trip;
    try {
      trip = await Trip.findById(tripId);
    } catch (e) {
      console.log(e);
      req.flash('error', 'Error finding trip by tripId.');
      return res.redirect('/');
    }

    if (Number(index) === trip.locations.length - 1) { return res.json({ OK: 'last index' }) }

    const apCodes = await getAirportCodes(trip.locations.length, trip.locations);
    const trip_data = await makeTripData(apCodes, trip);
    console.log(trip_data);
    //const flight_data = await getFlights(trip_data, trip.optradio);
    //const hotel_data = await getHotels(trip_data);
    //res.json({ response: 'works'});
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

async function getAirportCodes(length, locationData) {
  const promises = [];
  for (var i = 0; i < length; i++) {
    const lat = locationData[i].y;
    const lng = locationData[i].x;
    const api_call = "https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
    const get_airport_code = api_call + "&latitude=" + lat + "&longitude=" + lng;
    promises.push(call_api(get_airport_code, 1));
  }
  try {
    data = await Promise.all(promises);
    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function makeTripData(apCodes, trip) {
  console.log(trip);
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

  data = data.sort(function(a,b) {
    return a.order - b.order;
  });

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

async function getFlights(trip_data, efficiency) {
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
        api_call = `https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=${process.env.AMADEUS_API}&origin=${origin}&destination=${destination}&departure_date=${departure_date}`;
        if (efficiency === 'te') {
          api_call = api_call + "&nonstop=true";
        }
        // console.log(api_call);
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

async function getHotels(trip_data) {
  const hotel_promises = [];
  for (var i = 0; i < trip_data.length; i++) {
    if (i > 0) {
      var check_in = trip_data[i].start_date;
      var check_out = trip_data[i].end_date;

      if (check_in != check_out) {
        api_call = "https://api.sandbox.amadeus.com/v1.2/hotels/search-circle?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
        api_call = api_call + "&latitude=" + trip_data[i].lat + "&longitude=" + trip_data[i].lng + "&radius=50" + "&check_in=" + check_in + "&check_out=" + check_out + "&lang=EN&currency=USD";
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