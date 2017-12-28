const nodejieba = require('nodejieba'),
	  eefocus_article =require('../models/keywords');

exports.keywords=(req,res)=>{
    
     eefocus_article.getEefocusSingleArticle(null,(err,result)=>{
         if (err){
         	console.log(err);
         }else {
         	let articleId = result[0].id
         	let article = result[0].content;
         	let key = null;
         	let topN = 50;
         	// // 抽取topN的权重的关键词{"word":"算法","weight":182.51502148173}
         	// key = nodejieba.extract(article,topN);
         	// key.forEach((element, index)=> {
         	    
         	// });
         	console.log(articleId)
            res.send('hello')
         }
     })
	
}