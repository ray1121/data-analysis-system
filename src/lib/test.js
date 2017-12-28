// 这里用到一个很实用的 npm 模块，用以在同一行打印文本
var slog = require('single-line-log').stdout;

// 封装的 ProgressBar 工具
class ProgressBar {
    // 两个基本参数(属性)
    constructor(description, bar_length) {
        this.description = description || 'Progress'; // 命令行开头的文字信息
        this.length = bar_length || 25; // 进度条的长度(单位：字符)，默认设为 25

        // 刷新进度条图案、文字的方法
        this.render = function(opts) {
            var percent = (opts.completed / opts.total).toFixed(4); // 计算进度(子任务的 完成数 除以 总数)
            var cell_num = Math.floor(percent * this.length); // 计算需要多少个 █ 符号来拼凑图案

            // 拼接黑色条
            var cell = '';
            for (var i = 0; i < cell_num; i++) {
                cell += '█';

            }

            // 拼接灰色条
            var empty = '';
            for (var i = 0; i < this.length - cell_num; i++) {
                empty += '░';
            }

            // 拼接最终文本
            var cmdText = this.description + ': ' + (100 * percent).toFixed(2) + '% ' + cell + empty + ' ' + opts.completed + '/' + opts.total;

            // 在单行输出文本
            slog(cmdText);
        };
    }

}
let test = new ProgressBar('测试什么情况')

// typeof(test.render())
for (let j = 0; j < 10; j++) {
  setTimeout(()=>{
    test.render({total:10,completed:++j})
  },j*1000)
}








// 模块导出
module.exports = ProgressBar;