const redis = require('redis'),
    logger = require('./logger'),
    async = require('async'),
    globalConfig = require('../configs/configs');
const redisDB = {};
/**
 * Connect to Redis 
 */
redisDB.connect = () => {
    let client = redis.createClient(globalConfig.redis.port, globalConfig.redis.host);
    client.on('error', (err) => {
        console.log('errorevent - ' + redis.host + ':' + redis.port + ' - ' + err);
    });
    return client;
};

/**
 * 执行一个redis的命令
 * @param {String} redis命令的名字
 * @param {Array}  执行命令所需要的参数
 * @param {Function} 回调函数
 */
redisDB.executeCommand = (command_name, args, callback) => {
    let client = redisDB.connect();
    client.send_command(command_name, args, (err, results) => {
        if (err) {
            logger.writeErr(err);
            callback(err);
        } else {
            callback(null, results);
        }
    })
    client.quit();
}

/**
 * 往某一个有序集合里面增加一个成员，如果这个成员存在则将其分数加1，如果不存在则直接加入一个成员；
 * 判断members是否已经在sortedSet中存在了
 * 由于有序集合中不像简单集合中有SISMEMBER直接判断是否存在的命令
 * 这里我使用 ’zscore key memberName‘ 的方式如果返回为null则表明他不存在
 * @param {String} 键的keyName
 * @param {Array}  
 * @param {Function}
 */


redisDB.addToSortedSet = (keyName, args, callback) => {
        let client = redisDB.connect();
         async.map(args,function(element,cb){
         	let params = [keyName,element];
         	client.zscore(params,(err,res)=>{
         		if(err){
         			logger.writeErr(err);
         			cb(err);
         		}else {
         			 if (res) { //成员已经存在
                        let params = [];
                        params.push(keyName, 1, element);
                        client.zincrby(params, (err, result) => {

                            client.quit();

                            if (err) {
                                logger.writeDebug(err);
                                cb(err);
                            } else {
                                cb(null, result);
                            }
                        })

                    }else {
                    	let params = [];
                        params.push(keyName, 0, element);
                        client.zadd(params,(err,result)=>{
                        	client.quit();
                        	if (err) {
                                logger.writeDebug(err);
                                cb(err);
                            } else {
                                cb(null, result);
                            }
                        })
                    }
         		}
         	})
         	
         },function(err,results){
         	if (err){
         		logger.writeErr(err);
         		callback(err);
         	}else{
         		callback(null,results)
         	}
         })
        }
 /**
  * 返回SortedSet中score前topNum位的member
  * Redis命令zrevrange key start stop [withscores]
  * @param {String} 键的keyName
  * @param {Number} 
  * @param {Function}  
  */
 redisDB.getSortedSetTopN = (keyName, topNum, callback) => {
     let params = [];
     params.push(keyName, 0, topNum-1, 'withscores');
     redisDB.executeCommand('zrevrange', params, (err, results) => {
         if (err) {
             logger.writeErr(err);
             callback(err);
         } else {
             callback(null, results);
         }
     })
 }
        module.exports = redisDB;