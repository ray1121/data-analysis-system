const mysql = require('../src/lib/mysql');
const keysExtractModel = require('../src/models/keysExtract');
const mysqlTest = {};
const keysTest = require('../src/lib/keysExtract');
const configs = require('../src/configs/configs')

// mysqlTest.getConnect = ()=>{
//     mysql.connect();

// };
// mysqlTest.getConnect();

// mysqlTest.getaSingleTest = (ids, callback) => {
//     let sql = 'SELECT * FROM eef_article_article WHERE id=161636';
//     mysql.executeQuery(sql, null, callback);
// }


// mysqlTest.getSingleTest(null,(err,res)=>{
//     if(err){
//     	console.log(err);
//     }else {
//     	console.log(res[0].content)
//     }
// })

// keysExtractModel.getContent([0,5],(err,res)=>{
// 	if(err){
// 		console.log(err);
// 	}else {
// 		keysTest.insertData(res)
// 	}
// })


mysqlTest.getTags = ()=>{
	
	let	sql = "SELECT item,group_concat(tag separator ',') AS eefocus_article_tags FROM eef_tag_link GROUP BY item ORDER BY item DESC LIMIT 0,10 ";
		mysql.executeQuery(configs.eefocus_db,sql, null,function(err,res){
			if(err){
				console.log('Fuck Wrong')
			}else {
				console.log(res)
			}
		})
}
mysqlTest.getTags()
