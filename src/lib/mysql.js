const mysql = require('mysql'),
      logger = require('./logger');
const db = {};
/**
 * Connect to database
 * @return {boolean}
 */
db.connect = (config_db)=> {
    var connection = mysql.createConnection(config_db);
    connection.connect((err)=> {
        if (err) {
            console.log("DB connection error: " + err);
            return false;
        } else {
            // console.log("DB connection success");
        }
    });
    return connection;
}
/**
 * excute a query, and return the results
 @param   {String}   config_db      [description]
 * @param  {String}   sql      [description]
 * @param  {Array}   params   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */

db.executeQuery = (config_db,sql, params, callback)=> {
    var con = db.connect(config_db);
    con.query(sql, params, (err, results)=> {
        if (err) {
            logger.writeErr(err);
            callback(err);
        } else {
            callback(null, results);
        }
    });
    con.end();
}

/*
* 获取数据库的某个表的记录总数
*/

db.getTotalCount = (config_db,tblName,attribute,callback)=>{
   let sql = 'SELECT count('+attribute+') FROM '+tblName;
   db.executeQuery(config_db,sql,[],(err,results)=>{   
    if(err){
        logger.writeErr(err);
        callback(err);
    }else {
        callback(null,results);
    }
   })
};

/**
* 某列属性值相等的记录数
*/
db.getSameValueCount = (config_db,tablName,colName,params)=>{
    let sql = `SELECT COUNT(*) AS totalCount FROM ${tablName} WHERE ${colName}=?`;
    return new Promise((resolve,reject)=>{
       db.executeQuery(config_db,sql,params,(err,result)=>{
        if (err) {
           reject(err)
        } else {
            resolve(result)
        }
       }); 
    })
    
}

/**
* 向某个表插入指定值
* @param   {String}   config_db      [description]
* @param   {String}   tabName
* @param   {String}   colName         ['(col1,col2,col3)']
* @param   {String}   values    ['(?,?,?)'  问号的个数为所插入属性的个数]
* @param  {Array}   params   [description]
*/

db.insertRecord = (config_db,tablName,colName,values,params)=>{
     let sql = `INSERT INTO ${tablName} ${colName} VALUES${values}`;
    return new Promise((resolve,reject)=>{
       db.executeQuery(config_db,sql,params,(err,result)=>{
        if (err) {
           reject(err)
        } else {
            resolve(result)
        }
       }); 
    })
}

/**
** Promise化一个sql的执行结果,即执行结果返回一个promise
**
**
*/










module.exports = db;
