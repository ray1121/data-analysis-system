const ee_db = require('../lib/mysql'),
	  config = require('../configs/configs');


const Keywords = {}

Keywords.getEefocusSingleArticle = (id, callback) => {
    let sql = 'SELECT * FROM eef_article_article WHERE id=161636';
    ee_db.executeQuery(config.eefocus_db,sql, null, callback);
}

module.exports = Keywords;