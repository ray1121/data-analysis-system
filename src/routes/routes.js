const keyWords =require('../controllers/eefocus/keywords');

module.exports = function(app){   
    app.get('/test',keyWords.index);
}