module.exports = {
  indexGet: async (req, res) => {
    console.log(req.user);
    return res.render('index.ejs', { user: req.user });
  },
  //
  // POST /
  mapPost: async (req, res) => {
    let { markers } = req.body;
    for (var marker in markers) {
      console.log(markers[marker]);
    }
    return res.render('forms/main-form-layout',
    {
      page: 'itinerary-form.ejs',
      title: 'Plan Vacation • Adventum',
      markers
    }
  );
  }
};
