const fs = require('fs'),
    csv = require('fast-csv'),
    mysql = require('./mysql'),
    redisDB = require('./redis'),
    tagsModel = require('../models/tagsRalation')
const importFile = {};
/**
 * 将redis数据库中的数据导出生成CSV格式文件
 * @param {Array} 此处尤为注意，传入的格式一定是例如[[a,b],[c,d]...]格式
 *				  或者[{}，{}....]格式的数组
 *				 大数组内的每一个小数组或者一个对象即为CSV文件中的一行
 *@param {String} 文件所存放的路径
 *@param {String} 文件名称，不需要加后缀名
 */

let importToCsvFomart = (arr, path, fileName) => {
    csv.writeToStream(fs.createWriteStream(path+fileName+'.csv'), arr, { headers: true })
        .on('finish', () => {
            console.log(`csvFile---${fileName}.csv have fomarted in the ${path}!`)
        })
}

let topKeysToCsv = ()=>{
redisDB.getSortedSetTopN('eefocus:article:keywords', 10000, (err, res) => {
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
    	let path ='../../doc/',
    		fileName='seccond10000';
    	importToCsvFomart(formatRes,path,fileName);
    }
})
}

let articleTagsToCsv = ()=>{
    
    tagsModel.getTagsAryForCsv([],(err,data)=>{
        if(err){
            console.log(err);
            logger.writeErr(err);
        }else {
            let path = '../../doc/',
                fileName = 'articleTags';
            importToCsvFomart(data,path,fileName);
        }
    })
}

articleTagsToCsv();

module.exports = importFile;