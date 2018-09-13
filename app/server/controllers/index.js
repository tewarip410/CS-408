module.exports = {
  indexGet: async (req, res) => {
    const user = {
      name: 'Sean Becker',
      age: 'Twenty-fun'
    }
    return res.render('index.ejs', { user });
  }
};
