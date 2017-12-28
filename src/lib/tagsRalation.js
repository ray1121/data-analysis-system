/*
* 总体流程：
* 1.关联度分析使用python（2.x）实现的Apriori算法，接收一个csv文件做运行参数(内容是每篇文章的tag组成的行)
* 2.数据库操作以及数据的整理分发用node控制，python算法部分用node开启一个子进程去执行
*
*
* 思路：
* 1. 数据库中取出每篇文章对应的所有tag，在测试数据库mysql中存入article_tags表中
     article_tags表两列分别为article_id(主键);  tags
  2. 导出csv，进行关联度算法，结果返回给node主线程进行存入数据库的工作

*/

const tagsModel = require('../models/tagsRalation'),
	logger = require('./logger'),
	async = require('async');
const tagsRalation = {};
/*
 * 清洗数据插入到测试数据库中
 *
 */
let initDataProcedure = () => {
	tagsModel.getDistinctItemCount((err, res) => {
		if (err) {
			console.log(err)
		} else {
			let total = res[0]['count(distinct item)'];
			console.log(total)
			let start = 0,
				range = 1000,
				params = [start, range];
			operateData(total, params, start, range)
		}
	})
}
/*
* 分段递归从与非数据库取出过滤后插入测试数据库
*/
let operateData = (total, params, start, range) => {
	tagsModel.getTagsForTest(params, (err, data) => {
		if (err) {
			console.log(err)
		} else {
			async.map(data, (element, callback) => {
				let insertColParams = [element.item, element.tags_ids, element.tags];
				tagsModel.insertTagsToTestDB(insertColParams, callback);
			}, (err, res) => {
				if (err) {
					// console.log(err);
				} else {
					start = start + range;
					console.log(`success! have finished ${start}`);
					total - start > 1000 ? range = 1000 : range = total - start;
					if (start < total) {
						params = [start, range];
						operateData(total, params, start, range)
					} else {
						console.log('all success!');
					}
				}
			})

		}
	})
}