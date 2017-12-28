const configs = require('../configs/configs'),
      fs = require('fs')
    mysqlDB = require('../lib/mysql');

const backWriteModel = {};

/**判断与非文章tag库是否有当前词汇
 * 表 eef_tag_tag ;字段 term
 * @params keyword [String]
 * @return [Promise]
 */
backWriteModel.keyIsExists = (keyword) => {
    let queryStr = 'SELECT count(1) FROM ';
    queryStr += 'eef_tag_tag ';
    queryStr += 'WHERE term = ?';
    let config_db = configs.eefocus_db;
    let params = [keyword];
    return new Promise((resolve, reject) => {
        mysqlDB.executeQuery(config_db, queryStr, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                results[0]['count(1)'] ? resolve(true) : resolve(keyword)
            }
        })
    })
}
/**
 * 检查那些文章中出现了当前关键词
 * @params keyword [String]
 *
 */
backWriteModel.getArtileIdByKeyword = (keyword) => {
    let queryStr = "SELECT `article_id` FROM article_keywords WHERE FIND_IN_SET('"
    queryStr += keyword+"',keywords)>0";
    // console.log(queryStr)
    let config_db = configs.eefocus_testDB;
    return new Promise((resolve, reject) => {
        mysqlDB.executeQuery(config_db, queryStr, [], (err, result) => {
            if (err) {
                reject(err)
            } else {
                let count = result.length;
                let articleIdArr = [];
                let resultMap = {};
                result.forEach(function(element, index) {
                    articleIdArr.push(element.article_id)
                });
                resultMap.count = count;
                resultMap.articleIdArr = articleIdArr;
                resolve(resultMap);
            }
        })
    })
}

/**
 * 将新的Tag插入到eef_tag_tag表中
 *@params    {Array}   [str,num]  [tag的名字,出现次数]
 *
 */

backWriteModel.insertNewTag = async (params) => {
    let config_db = configs.eefocus_db,
        tablName = 'eef_tag_tag',
        colName = '(term,count)',
        values = '(?,?)';
    let sucess = await mysqlDB.insertRecord(config_db, tablName, colName, values, params)
    return sucess.insertId;
}
/**
 * 将新的插入到eef_tag_link表中
 *@params    {Array}   [tagid,articleId]  [tag的id,文章的id]
 *
 */
backWriteModel.insertTagLink =async (params) => {
    let config_db = configs.eefocus_db,
        tablName = 'eef_tag_link',
        colName = '(`tag`,`item`,`module`,`time`,`order`)',
        values = '(?,?,?,?,?)';
    params.push('article');
    params.push(Math.round(new Date().getTime() / 1000));
    let countResult = await mysqlDB.getSameValueCount(config_db, tablName, 'item', [params[1]]) 
    params.push(countResult[0].totalCount);
    let sucess = await mysqlDB.insertRecord(config_db, tablName, colName, values, params);
    return sucess.insertId; 
}

/**
 * 将新的插入到eef_tag_stats表中
 *@params    {Array}   [tagid,num]  [tag的名字,出现次数]] 
 *
 */

// backWriteModel.insertTagStats =async (params) => {
//     let config_db = configs.eefocus_db,
//         tablName = 'eef_tag_stats',
//         colName = '(`tag`,`count`,`id`,`module`)',
//         values = '(?,?,?,?)';
//     params.push(params[0]);
//     params.push('article');
//     let sucess = await mysqlDB.insertRecord(config_db, tablName, colName, values, params);
//     return sucess.insertId; 
// }


/**
** 根据tag名称获得对应tag的id号
** return {id : xxx}
*/
backWriteModel.getTagIdByName = (tagName)=>{
    let config_db = configs.eefocus_db;
    let sql = "SELECT `id` FROM `eef_tag_tag` WHERE `term` ='"
        sql += tagName + "'";
    return new Promise((resolve, reject) => {
        mysqlDB.executeQuery(config_db, sql, [], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        })
    })
}


/**
** 得到现有的tag对应的文章id数组
**GROUP_CONCAT(item SEPARATOR ',')这个有最大长度限制！！！！！！
*/

backWriteModel.getHadLinkByTagId = (tagid) =>{
    let config_db = configs.eefocus_db;
    let sql = "SELECT item AS oldArticleIds FROM `eef_tag_link` WHERE tag=?"
    return new Promise((resolve, reject) => {
        mysqlDB.executeQuery(config_db, sql, [tagid], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.map(element=>element.oldArticleIds))
            }
        })
    })

}


/*同时更新eef_tag_stats的count字段*/
backWriteModel.updateStatsCount = (tagid,count) =>{
    let config_db = configs.eefocus_db;
    let sql = "UPDATE `eef_tag_stats`  SET `count`=? WHERE tag=?";
       
    let params = [count,tagid];
    return new Promise((resolve, reject) => {
        mysqlDB.executeQuery(config_db, sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result)
            }
        })
    })
}
/*更新eef_tag_tags的count字段*/
backWriteModel.updateTagCount = (tagid,count) =>{
    let config_db = configs.eefocus_db;
    let sql = "UPDATE `eef_tag_tag`  SET `count`=? WHERE id=?";
       
    let params = [count,tagid];
    return new Promise((resolve, reject) => {
        mysqlDB.executeQuery(config_db, sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result)
            }
        })
    })
}












module.exports = backWriteModel;