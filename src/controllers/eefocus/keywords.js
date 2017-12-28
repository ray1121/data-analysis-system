const keyWords=require('../../lib/keywords');

exports.index = (req,res)=>{
	keyWords.keywords(req,res);
}


