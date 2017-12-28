const configs = require('../configs/configs'),
	  mysqlDB = require('../lib/mysql'),
	  redisDB = require('../lib/redis');
const articleTagsModule = {};


/*
* 获取与非主站所有文章的tags数组
*
*/


articleTagsModule.getAllTags = 