const configs = require('../configs/configs'),
	  mysqlDB = require('../lib/mysql'),
	  redisDB = require('../lib/redis');
const keysModel = {};

/**
* 获取到文章总数
*/
keysModel.getTotalCount = (callback)=>{
	let config_db = configs.eefocus_db;
    let tblName = 'eef_article_article';
    let attribute ='1';
    mysqlDB.getTotalCount(config_db,tblName,attribute,callback);
}

/**
* 获取文章的id和content
* @params {params} 【Array】 查询条目开始位置和查询范围
*/ 
keysModel.getContent = (params,callback)=>{
    let config_db = configs.eefocus_db,
     	tblName = 'eef_article_article ',
     	queryStr = 'SELECT id,content From ',
     	order = 'ORDER BY id Desc ',
     	limit = 'LIMIT ?,?',
     	sql = queryStr+tblName+order+limit;
     mysqlDB.executeQuery(config_db,sql, params, callback);

}

/**
*将eefocus的articel_id 和 对应抽取的关键词查入到mysql数据库的article_keywords表中
*对应`article_id`和`keywords`字段
*/ 
keysModel.insertToMysql = (params,callback)=>{
	let config_db = configs.eefocus_testDB,
		tblName = 'article_keywords ',
		queryStr = 'INSERT INTO ',
		colName = '(article_id,keywords) ',
		sql = queryStr + tblName + colName + 'VALUES(?,?)';
	mysqlDB.executeQuery(config_db,sql,params,callback);
}
/**
*将关键词单独插入到Redis当中
*/
keysModel.insertToRedis = (params,callback)=>{
	let keyName = 'eefocus:article:keywords';
    redisDB.addToSortedSet(keyName, params, callback);
}
/**
* 获取redis中top5000的关键词
*let keyName = 'eefocus:article:keywords';
*let topNum = 5000;
*/
keysModel.getKeywordsTopN = (keyName, topNum, callback)=>{
	redisDB.getSortedSetTopN = (keyName, topNum, callback);
}
module.exports = keysModel;