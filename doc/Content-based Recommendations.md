# Content-based Recommendations

1. **Item Representation**：为每个item抽取出一些特征（也就是item的content了）来表示此item；对于个性化阅读来说item及是文章，对于文章的特征抽取现已经基本完成。

2. Profile Learning：利用一个用户过去喜欢（及不喜欢）的item的特征数据，来学习出此用户的喜好特征（profile）；

3. Recommendation Generation：通过比较上一步得到的用户profile与候选item的特征，为此用户推荐一组相关性最大的item。

## CB里常用的学习算法：

1. **最近邻方法**（k-Nearest Neighbor，简称kNN）

 对于一个新的item，最近邻方法首先找用户u已经评判过并与此新item最相似的k个item，然后依据用户u对这k个item的喜好程度来判断其对此新item的喜好程度。**这种做法和CF中的item-based kNN很相似，差别在于这里的item相似度是根据item的属性向量计算得到，而CF中是根据所有用户对item的评分计算得到**。

 对于这个方法，比较关键的可能就是如何通过item的**属性向量**计算item之间的两两相似度。建议对于结构化数据，相似度计算使用欧几里得距离；而如果使用向量空间模型（VSM）来表示item的话，则相似度计算可以使用cosine。
 
2. **决策树算法**（Decision Tree，简称DT）

      当item的属性较少而且是结构化属性时，决策树一般会是个好的选择。这种情况下决策树可以产生简单直观、容易让人理解的结果。而且我们可以把决策树的决策过程展示给用户u，告诉他为什么这些item会被推荐。但是如果item的属性较多，且都来源于非结构化数据（如item是文章），那么决策树的效果可能并不会很好。