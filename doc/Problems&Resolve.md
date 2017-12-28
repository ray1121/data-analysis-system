# 项目总遇到的问题解决与积累
### 1.关于node-redis中quit()的优雅退出遇到forEach的问题
在redis的node客户端中官方文档上描述客户端断开与redis的连接的方式有两种：

* client.end()所谓的‘二话不说直接暴力断开’；官方文档上是这样描述end()方法的：

Forcibly close the connection to the Redis server. Note that this does not wait until all replies have been parsed. If you want to exit cleanly, call client.quit() as mentioned above.
You should set flush to true, if you are not absolutely sure you do not care about any other commands. If you set flush to false all still running commands will silently fail.

大体上的意思就是说end()方法不会等到所有的答复都被解析之后才断开和redis的连接，他会立刻断开与数据库的连接，若是你想要优雅的退出你应该选择quit()。

* quit()方法在官方文档上是这样描述的：

This sends the quit command to the redis server and ends cleanly right after all running commands were properly handled. If this is called while reconnecting (and therefore no connection to the redis server exists) it is going to end the connection right away instead of resulting in further reconnections! All offline commands are going to be flushed with an error in that case.

主旨是说调用quit命令将所有运行的命令正确处理后，将quit命令发送到redis服务器，并将其完全正确地结束。就是所谓的**优雅退出**
如果在重新连接时调用（即redis服务器的连接不存在），则它将立即结束连接，而不会导致进一步的重新连接，在这种情况下，所有脱机命令将被刷新，并出现错误。

因为有所谓的优雅退出才会有如下的方式写法：

```
var redis = require("redis");
var client = redis.createClient({detect_buffers: true});
 
client.set("foo_rand000000000000", "OK");
 
// This will return a JavaScript String 
client.get("foo_rand000000000000", function (err, reply) {
    console.log(reply.toString()); // Will print `OK` 
});
 
// This will return a Buffer since original key is specified as a Buffer 
client.get(new Buffer("foo_rand000000000000"), function (err, reply) {
    console.log(reply.toString()); // Will print `<Buffer 4f 4b>` 
});
client.quit();

```
这段代码中的client.set()和client.get()无疑都是异步的代码，若是此处用的是client.end()替换掉client.quit()无疑会在命令未能正确处理之前就会于数据库断开从而出现错误，而quit()就会处理完所有命令回复之后才安全的断开与数据库的连接。

Redis中的quit()和end()就相应类比为在node-mysql中的两种与数据库断开的方式end()和destroy()方法。

接下来就是我在写代码（lib层下的redis.js）的时候自以为quit**优雅退出**遇到的问题，原始代码如下：

```
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
		args.forEach((element, index) => {
			let params = [];
			params.push(keyName, element);
			client.zscore(params, (err, results) => {
				if (err) {
					logger.writeDebug(err);
					callback(err);
				} else {
					if (results) { //成员已经存在
						let params = [];
						params.push(keyName, 1, element);
						client.zincrby(params, (err, res) => {
							if (err) {
								logger.writeDebug(err);
								callback(err);
							} else {
								callback(null, res);
							}
						})

					} else { //成员不存在直接插入,初始分数为0
						let params = [];
						params.push(keyName, 0, element);
						client.zadd(params, (err, res) => {
							if (err) {
								logger.writeDebug(err);
								callback(err);
							} else {
								callback(null, res);
							}
						})

					}
				}
			})
		});
	 client.quit();
	}
```

这段代码主要的结构就是我在建立了node与Redis的连接之后跟了一个对数组的forEach循环，然后再循环体中有嵌套两层的异步回调函数；**（Tips：在写这段的时候我是需要去判断数组内的元素在redis的有序集合中是不是已经存在，由于有序集合不像是Set结构那样有一条命令去直接判断元素是否是Set的成员（`sismember命令`)，所以我用了`zscore key memberName` 如果成员存在则会返回这个成员对应的score，如果这个成员不存在则就会返回null，以此判断是否存在）**

这段代码在我测试调用插入两条数据的时候报出了这样的错误：

```
{ AbortError: 
Stream connection ended and command aborted.
It might have been processed.
  code: 'NR_CLOSED',
  command: 'ZINCRBY',}

```
说我的连接断了，执行到ZINCRBY的时候命令中断了........

原来“优雅退出”也并不是完全让人省心......(我好想抖段子。。。）

我仔细看了一下报错，我插入了两条数据库里都存在数据，应该到最后走的都是最里层`ZINCRBY`的那个异步分支，而报错的就是**forEach中两条数数据都是执行到`ZINCRBY`报出得`Stream connection ended and command aborted.`**

当时我的脑子里过的第一个单纯的想法是forEach会不会是个异步的，因为它长得像，而quit()优雅退出的是redis自己的命令回调，并不会管别的异步回调，然而forEach虽然传了一个函数但是它本身并不是异步的,测试代码如下：

```
let args=[2,3,4];
args.forEach( (element, index)=> {
	console.log(element);
});
console.log(1);
```
打印结果：
```
2
3
4
1
```
并不是想象中的异步的；必然还是要试一下forEach中只有一层异步的情况的，试完问题就必然都对上号了

```
redisDB.addToSortedSet = (keyName, args, callback) => {
		let client = redisDB.connect();
		args.forEach((element, index) => {
			let params = [];
			params.push(keyName, element);
			client.zscore(params, (err, results) => {
				if (err) {
					logger.writeDebug(err);
					callback(err);
				} else {
					console.log(results);
				}
			})
		});
	   client.quit();
	}
```
这一次执行之后没毛病，传进去有两个元素的args，因为存在所以就很**优雅**的返回了两个成员的分数，看来优雅的照顾也是有限的，我只负责你一层所有的命令全部给你结果，再嵌套一层就不会管你了：）

遂...

代码改为如下

```
redisDB.addToSortedSet = (keyName, args, callback) => {
		let client = redisDB.connect();
		args.forEach((element, index) => {
			let params = [];
			params.push(keyName, element);
			client.zscore(params, (err, results) => {
				if (err) {
					logger.writeDebug(err);
					callback(err);
				} else {
					if (results) { //成员已经存在
						let params = [];
						params.push(keyName, 1, element);
						client.zincrby(params, (err, res) => {

							client.quit();

							if (err) {
								logger.writeDebug(err);
								callback(err);
							} else {
								callback(null, res);
							}
						})

					} else { //成员不存在直接插入,初始分数为0
						let params = [];
						params.push(keyName, 0, element);
						client.zadd(params, (err, res) => {

							client.quit();

							if (err) {
								logger.writeDebug(err);
								callback(err);
							} else {
								callback(null, res);
							}
						})

					}
				}
			})
		});
	}

```

这下没毛病了



### 2.占位

```
keysExtractProcedure = ()=>{
  // 获取文章总数
  keysExtractModel.getTotalCount((err,res)=>{

    if(err){
    	console.log(err);
    }else {
    	let total = res;
    	let count =0;
    	let status = 'going';//上悲观锁
    	while (count < total && status==='going') {
    		// 获取100篇文章的id和content
    		status = 'waiting';
    		let params = [count,100]
    		keysExtractModel.getContent(params,(error,results)=>{
    			if(error){console.log(error);}else {
    				count +=100;
    				status = 'going';
    				insertData(results,(fail,success)=>{
    					if(fail){
    						console.log(fail);
    					}else {
    						console.log(success);
    					}
    				})
    			}
    		})
    	}
    }
```    


```
/Users/liulei/Desktop/recommended-system/src/node_modules/async/dist/async.js:903
        if (fn === null) throw new Error("Callback was already called.");
                         ^

Error: Callback was already called.
```

```
errorevent - undefined:undefined - AbortError: Ready check failed: Redis connection lost and command aborted. It might have been processed.
```








DB connection error: Error: connect EMFILE 192.168.2.82:3309 - Local (undefined:undefined)




