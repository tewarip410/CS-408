const request = require('request');
const moment = require('moment');

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
    //TODO - add checks for valid date and valid order (ie. an invalid order would be 1,5 - should be 1,2)
    let date = (req.body.date).split('/');
    date = date[2] + '-' + date[0] + '-' + date[1];
    console.log(date);
    const round_trip = req.body.rt;
    const option = req.body.optradio;
    let trip_data = [];
    const promises = [];

    for (var i = 0; i < req.body.duration.length; i++) {
      const lat = req.session.data.location_data[i][1];
      const lng = req.session.data.location_data[i][2];
      const api_call = "https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
      const get_airport_code = api_call + "&latitude=" + lat + "&longitude=" + lng;
      promises.push(call_api(get_airport_code, 1));
    }
    let start_time = new Date();
    let data;
    try {
      data = await Promise.all(promises);
    } catch (e) {
      return console.log(e);
    }

    console.log(`finished api requests in ${(new Date() - start_time) / 1000} seconds.`);
    for (var i = 0; i < data.length; i++) {
      const radio = "exampleRadios " + i;
      const name = req.session.data.location_data[i][0];
      const lat = req.session.data.location_data[i][1];
      const lng = req.session.data.location_data[i][2];
      const td = [req.body.duration[i], req.body.order[i], req.body[radio], name, lat, lng, data[i]];
      trip_data.push(td)
    }

    trip_data = trip_data.sort(function(a,b) {
      return a[1] - b[1];
    });

    const dates = [];
    //compute start and end dates for all parts of a trip
    for (var i = 0; i < trip_data.length; i++) {
      var start_date;
      if (i == 0) {
        dates.push([date, date]);
      }
      else {
        start_date = date;
        var date_split = date.split('-');
        date = moment([Number(date_split[0]), Number(date_split[1]) - 1, Number(date_split[2])]).add(Number(trip_data[i][0]), 'days');
        date = moment(date).format("YYYY-MM-DD");
        dates.push([start_date, date]);
      }
    }
    console.log(trip_data);
    console.log(dates);
      
    var trip_promises = [];
    var hotel_promises = [];
    for (var i = 0; i < trip_data.length; i++) {
      if (trip_data[i][2] === 'plane') {
        if (i < 1) {
          console.log("Cannot route flight from origin to origin!");
          continue;
        }
        else {
          var origin = trip_data[i-1][6];
          var destination = trip_data[i][6];

          api_call = "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
          api_call = api_call + "&origin=" + origin + "&destination=" + destination + "&departure_date=" + dates[i][0];
          if (option == 'te') {
            api_call = api_call + "&nonstop=true";
          }
          console.log(api_call);
          trip_promises.push(call_api(api_call, 2));
        }
      }

      if (i > 0) {
        var location = trip_data[i][6];
        var check_in = dates[i][0];
        var check_out = dates[i][1];

        if (check_in != check_out) {
          api_call = "https://api.sandbox.amadeus.com/v1.2/hotels/search-airport?apikey=wrrt6wCJMvGOywCv2FNXc4GtQtYXXsoH";
          api_call = api_call + "&location=" + location + "&check_in=" + check_in + "&check_out=" + check_out + "&lang=EN&currency=USD";
          hotel_promises.push(call_api(api_call, 3));
        }
      }
    }

    var itinerary = [];
    var flight_prices = [];
    var hotels = [];
    var hotel_prices = [];

    data = await Promise.all(trip_promises);
          
    for (var j = 0; j < data.length; j++) {
      var flight = data[j].results[0].itineraries[0].outbound.flights;
      flight_prices.push(data[j].results[0].fare.total_price);
      for (var i = 0 ; i < flight.length; i++) {
        var origin = flight[i].origin.airport;
        var dest = flight[i].destination.airport;
        var departure = flight[i].departs_at;
        var arrival = flight[i].arrives_at;
        var airline = flight[i].operating_airline;
        var flight_number = flight[i].flight_number;
        var travel_class = flight[i].booking_info.travel_class;
        var plan = [departure, arrival, origin, dest, airline, flight_number, travel_class];
        itinerary.push(plan);
      }
    }

    data = await Promise.all(hotel_promises);
    console.log(itinerary);
    console.log('------')
    console.log(flight_prices);
    for (var i = 0; i < data.length; i++) {
      var result = data[i].results[0];
      hotel_prices.push(result.total_price.amount);
      var name = result.property_name;
      var addr = result.address.line1 + " " + result.address.city + ", " + result.address.region + " " + result.address.postal_code + ", " + result.address.country;
      hotels.push([name, addr]);
    }

    console.log('-----');
    console.log(hotels);
    console.log('-----');
    console.log(hotel_prices);
    console.log('here');
    res.render('forms/create-form-layout',
      {
        page: 'itinerary.ejs',
        title: 'Itinerary • Adventum',
        flights: itinerary,
        flight_prices,
        hotels,
        hotel_prices,
        user: req.user
      });
  }
}

function call_api(api_call, return_info) {
  return new Promise(function(resolve, reject) {
    request(api_call, function(error, response, body) {
      if (error) {
        return reject(error);
      }

      var json = JSON.parse(body);
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