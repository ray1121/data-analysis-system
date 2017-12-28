const keysExtractModel = require('../models/keysExtract'),
	nodejieba = require('nodejieba'),
	logger = require('./logger'),
	async = require('async');
const keysExtract = {};

/**
 * 提取单篇文章的关键词所组成的数组
 * @params {String} 文章内容
 * @params {Number} 每篇文章所抽取多少关键词
 */
let getExtractKeysAry = (content, number) => {

		// 此时的得到的key是每一项型如{"word":"算法","weight":182.51502148173}的数组
		let key = nodejieba.extract(content, number)
		let keysAry = key.map((item, index) => {
			return item['word'];
		})
		return keysAry;
	}
/**
 * 本函数将处理获得数据进行插入到数据库中的相关任务
 * 所获得数据Data 形如[{id:xxxx;content:xxxxx}]
 */
 let insertData = (data,callback) => {
	// let keysMap = [];
	async.map(data,function(element,callback){
		let articleId = element.id;
		let keywords = getExtractKeysAry(element.content,35);
		let params = [articleId,keywords.toString()];
 		
 		async.parallel([function(callback){
			keysExtractModel.insertToMysql(params,callback);
		},function(callback){
			keysExtractModel.insertToRedis(keywords,callback);
		}],function(error,res){
             if(error){
             	logger.writeErr(error);
             	callback(error);
             }else {
             	callback(null,res)
             }
		})
	},function(err,results){
		if(err){
			callback(err);
		}else {
			callback(null,'insert sucess!')
		}
	})
   
}
/**
* 要进行递归循环的获取数据的函数，并且调用插入操作
*/
let operateData = (total,params,start,range) => {
	
	keysExtractModel.getContent(params, (error, results) => {
		if (error) {
			console.log(error);
		} else {
			insertData(results, (fail, success) => {
				if (fail) {
					console.log(fail);
				} else {
					
					start = start + range;
					logger.writeInfo('已经完成到了第'+start+'篇');
					total - start > 200 ? range = 200 : range = total - start;
					if (start < total) {
                       params = [start,range];
                       console.log(success);
                       operateData(total,params,start,range)
					}else {
						console.log('all success!');
					}
				}
			})
		}
	})
}

let keysExtractProcedure = () => {
	// 获取文章总数
	keysExtractModel.getTotalCount((err, res) => {

		if (err) {
			console.log(err);
		} else {
            const total = res[0]['count(1)'];
            logger.writeInfo(total);
		    let   start = 0,
		          range = 200,
		          params = [start, range];
		     operateData(total,params,start,range);
		}
	});
}

// keysExtractProcedure();
module.exports = keysExtract;