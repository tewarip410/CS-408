module.exports = {
  indexGet: async (req, res) => {
    console.log(req.user);
    return res.render('index.ejs', { user: req.user });
  }
};
