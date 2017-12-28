# 抽取与非主站文章关键词及统计Top5000关键词实验

## 基本思路：
 * 先获取与非网主站数据库文章中的总数量做判断条件，
 * 每次批量取200篇文章ID和文章内容进行分词等一系列的处理通过TF-idf算法得出每一篇文章权重值前35位的关键词
 * 存入eefocus_testDB(mysql)中的article_keywords表对应article_id和keywords
 * 选择redis中的有序集合数据类型，将每篇文章提取出来的关键词存入到redis的0号数据库中，
 
 
## redis数据库的设计：
 1. 用有序集合的分数存储关键词出现在所有文章里的次数
 2. key的设计：eefocus:article:keywords
 
## 运行方式：
* **cd/recommended-system/src/lib**
* **node keysExtract.js**
