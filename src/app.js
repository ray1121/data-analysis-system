const express = require('express'),
	  routes = require('./routes/routes'),
	  http = require('http');
const app = express();

routes(app);

app.set('port', process.env.PORT || 3000);

http.createServer(app).listen(app.get('port'),()=>{

	console.log('Express server listening on port ' + app.get('port'));
});