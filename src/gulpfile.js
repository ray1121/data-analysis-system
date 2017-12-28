const gulp = require('gulp')
	, $ =require('gulp-load-plugins')()
	, browserSync = require('browser-sync').create();
	//gulp-load-plugins使得gulp相关插件能够根据package.json的gulp插件依赖，在它使用的时候才加载进来，并且使用的时候直接用plugins.rename

gulp.task('test',function(){
	$.nodemon({
		script: 'app.js',
        ext: 'js',
        ignore: ['gulpfile.js','node_module']
	});
});
// gulp.task('server',['restart'],function(){
// 	let files =['public/**/*.*'];
// 	browserSync.init({
//  		proxy: 'http://localhost:3000',
//         browser: 'google chrome',
//         notify: false,
//         port: 4001
// 	});
//     gulp.watch(files).on("change", browserSync.reload); 
// })