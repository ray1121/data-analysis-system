/**
** 1.逐行读取../../doc/editorChoiceKeys.csv
** 2.判断测试数据库中的tag表是否存在当前词汇
** 3.若存在则略过，若不存在则判断eefocus_testDB中出现此词汇的文章id，以及总篇幅数
** 4.eef_tag_tag 表结构：(tagid,term,count)[tagID,tag名字,出现次数]
	 eef_tag_link表结构(id,tag,module,type,item,time,order)
	 eef_tag_stats表结构(id,tag,module,type,count)

** 扩充现有的关系表

*/


const fs = require('fs'),
    csv = require('fast-csv');
const backWriteModel = require('../models/backWriteTag');

let keys = [];

let stream = fs.createReadStream("../../doc/editorChoiceKeys.csv");

let csvStream = csv
    .parse()
    .on("data", function(data) {
        keys.push(data[0]);
    })
    .on("end", async function() {
    	let newKeys=keys.map((key)=>{
    		return backWriteModel.keyIsExists(key)
    	})
        let results = await Promise.all(newKeys);
        let news=results.filter((newkey)=>{
        	return (newkey !== true)
        })

       for (let addKey of news) {
       	   console.log(addKey)
       	   let {count , articleIdArr}= await backWriteModel.getArtileIdByKeyword(addKey)
       	   let newTagid = await backWriteModel.insertNewTag([addKey,count]);
       	   console.log(newTagid);
       	   for (articleId of articleIdArr) {
       	   		let linkId = await backWriteModel.insertTagLink([newTagid,articleId])
       	   }
       	   console.log(`${count} 条关系插入成功！`);
       }
    });

