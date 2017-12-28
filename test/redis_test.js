const redisDB = require('../src/lib/redis');
const fs = require('fs');
const csv = require('../src/node_modules/fast-csv');
// console.time('测试redis时间:');

//  redisDB.executeCommand('zscore',['eefocus:article:keywords','啦啦'],(err,res)=>{
//  	if(err){
//  		console.log(err);
//  	}else {
//  		console.log(res)
//  	}
//  })
// console.timeEnd('测试redis时间:');



// redisClient.get('foo',(err,res)=>{
//      if(err){
//      	console.log(err);
//      }else {
//      	console.log(res);
//      }
//      redisClient.quit();
// })




// console.log(__filename);
// console.log(__dirname);

// const logger = require('../src/lib/logger');


// logger.writeInfo('这是info日志')
// logger.writeErr('这是Err日志')
// logger.writeWarn('这是Warn日志')
// logger.writeDebug('这是Debug日志')




// console.time('测试redis时间:');
// redisDB.addToSortedSet('eefocus:article:keywords',['周四','周五'],(err,res)=>{
//     if(err){
//     	console.log(err);
//     }else {
//     	console.log(res);
//     }
// })

// console.timeEnd('测试redis时间:');



redisDB.getSortedSetTopN('eefocus:article:keywords', 10, (err, res) => {
    if (err) {
        console.log(err);
    } else {
    	let formatRes = [],
    		temAry = [];
    	for(let i = 0 ; i<res.length;i++){
    		if(i===0){
    			temAry.push(res[i]);
    		}else if (i%2 !==0) {
    			temAry.push(res[i]);
    			formatRes.push(temAry);
    		}else{
    			temAry = [];
    			temAry.push(res[i]);
    		}
    	}
    	temAry = null;
    	csv.writeToStream(fs.createWriteStream('test.csv'),formatRes,{headers:true})
    	   .on('finish',()=>{
    	   	console.log('csvFile is finished!')
    	   })
    }
})