/*
 **  1.并发取出现在已经有的关系的到的articleId数组和关键词在哪些个文章中出现过的articleId数组
 **  2.对比两个数组取出差集
 **  3.根据差集数组并发插入到tag_link 表中
 */
const fs = require('fs'),
    logger = require('./logger'),
    csv = require('fast-csv');
const backWriteModel = require('../models/backWriteTag');

let keys = [];

Array.prototype.arrDiffer = function(arr) {
    var result = new Array();
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = 1;
    }
    for (var j = 0; j < this.length; j++) {
        if (!obj[this[j]]) {
            obj[this[j]] = 1;
            result.push(this[j]);
        }
    }
    return result;
};
// console.log([1,2,3,4].arrDiffer([1,2]))

async function main(key) {
    //根据标签名字获得标签id
    try {
        var idObj = await backWriteModel.getTagIdByName(key)

    } catch (e) {
        console.log(`${key}获取tagid失败`)
    }
    let tagid = idObj.id;
    try {
        var [oldAticleLinkIds, newAticleLinkInfos] = await Promise.all([
            backWriteModel.getHadLinkByTagId(tagid),
            backWriteModel.getArtileIdByKeyword(key)
        ])
    } catch (e) {
        console.log(`${key}获取文章关系失败`)
        
    }
    // console.log(oldAticleLinkIds.length)
    // console.log(oldAticleLinkIds)
    // console.log(newAticleLinkInfos.articleIdArr.length)
    let diffArr = newAticleLinkInfos.articleIdArr.arrDiffer(oldAticleLinkIds)
    // console.log(diffArr)
    logger.writeInfo(`${key}:新增${diffArr.length}条关系`) 
    if(diffArr.length>0){
        let hasgoing = 0
        for (let newId of diffArr) {
        await backWriteModel.insertTagLink([tagid, newId])
        hasgoing++
        console.log(`${key}已经完成了${hasgoing}条`)
    }
    try {
        await backWriteModel.updateStatsCount(tagid,newAticleLinkInfos.articleIdArr.length)
        await backWriteModel.updateTagCount(tagid,newAticleLinkInfos.articleIdArr.length)
    } catch(e) {
        console.log(`${key}更新count失败`);
    }   
    console.log(`${key},${diffArr.length}条记录插入成功`)
    }   
    
}



let stream = fs.createReadStream("../../doc/editorChoiceKeys.csv");

let csvStream = csv
    .parse()
    .on("data", function(data) {
        keys.push(data[0]);
    })
    .on("end", async () => {
        for (let key of keys) {
            try {
               await main(key)
            } catch(e) {
                console.log(e);
            }
        }
    })


stream.pipe(csvStream);