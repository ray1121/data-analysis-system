const configs = require('../configs/configs'),
	mysqlDB = require('../lib/mysql'),
	redisDB = require('../lib/redis'),
	async = require('async');
const tagsModel = {};
/*
 * 从tag_link表中获取所有的不重复的文章总数
 */

tagsModel.getDistinctItemCount = (callback) => {
	let config_db = configs.eefocus_db,
		tablName = 'eef_tag_link',
		attribute = 'distinct item';
	mysqlDB.getTotalCount(config_db, tablName, attribute, callback);
}

/*
 * 取出与非文章的tags 序列和对应文章id
 *  @param  {Array}   params     [获取条目开始的位置和范围]
 *  @param  {Function} callback [description]
 */

tagsModel.getTagsForTest = (params, callback) => {
		let config_db = configs.eefocus_db,
			tblName = 'eef_tag_link ',
			queryStr = "SELECT ";
		queryStr += "item,group_concat(tag separator ',') AS tags_ids,";
		queryStr += "group_concat((SELECT term from eef_tag_tag where eef_tag_tag.id =eef_tag_link.tag) separator ',') AS tags From ";
		queryStr += tblName;
		queryStr += 'GROUP BY item ';
		let orderStr = 'ORDER BY item Desc ',
			limitStr = 'LIMIT ?,?';
		let sql = queryStr + orderStr + limitStr;
		mysqlDB.executeQuery(config_db, sql, params, callback)
	}
	/*
	 * 将获取的每篇文章的tags_ids序列和tags名称插入到测试数据库中
	 */
tagsModel.insertTagsToTestDB = (params, callback) => {
	let config_db = configs.eefocus_testDB,
		tblName = 'article_tags ',
		queryStr = 'INSERT INTO ',
		colName = '(article_id,tags_ids,tags) ',
		sql = queryStr + tblName + colName + 'VALUES(?,?,?)';
	mysqlDB.executeQuery(config_db, sql, params, callback);
}

/*
 * 获取每篇文章对应的tags数组
 */
tagsModel.getTagsAryForCsv = (params, callback) => {
	let config_db = configs.eefocus_testDB,
		tablName = 'article_tags ';
	let sql = "SELECT tags From ";
	sql += tablName;
	sql += "ORDER BY article_id DESC";

	if (params.length>0) {
		sql += " LIMIT ?,?";
		 
	}
	mysqlDB.executeQuery(config_db, sql, params, callback);

}



module.exports = tagsModel;