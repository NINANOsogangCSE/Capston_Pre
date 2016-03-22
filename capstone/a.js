var express = require('express');
var app = express();
var http=require('http');
var mysql = require('mysql');
var fs= require('fs');
var xml2js=require('xml2js');
var moment = require('moment-timezone');
var cronJob = require('cron').CronJob; // 매시간 정보를 가져오기 위해서
var ejs= require('ejs');



app.use(express.static('public'));
app.use(express.static('/xml'));
//DB연결 부분
var connection =mysql.createConnection({

host : 'localhost',
user : 'root',
password :'capstone',
database: 'capstone',
timezone: 'KST'
});

moment.tz.setDefault("Asia/Seoul");

connection.connect(function(err){
		if(err){
		console.log("error in connect DB"+err.stack);
		return;
		}

});


var job=new cronJob(
	"00 * * * * 0-6",
	function(){
	console.log(" now download xml file from 기상청");
	var url_meteo="http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=4141052000";
	var filename="./xml/"+moment(new Date()	).format("YYYYMMDDHHmm")+".xml";

	http.get(url_meteo,function(res){
		var xml='';
		res.on('data',function(chunk){
			xml+=chunk;
		});
		res.on('end',function(chunk){
			//console.log(xml);
	        	fs.exists(filename,function(exists){
			if(exists){
			}
			else{
				fs.open(filename,'w+',function(err,fd){
					if(err) throw err;
					fs.writeFile(filename,xml,'utf8',function(err){
					
					});
				});
	
			}
			});
		

		});

	});
	//파일생성


	},
	function(){
	console.log("cron이멈 췄어요");
	},
	true,
	'Asia/Seoul');














//초기화면
app.get('/', function (req, res) {

		console.log(req.header);
		res.send('Hello World!');
		});


//insert DB   
app.get('/insert',function(req,res){

		var query_key=[];
		var query_value=[];
		for(key in req.query){
		query_key.push(key);
		query_value.push(req.query[key]);
		}

		query_value='('+query_value.join(',')+')';
		var db_sql='INSERT INTO weather ('+ query_key.join(',') +') VALUES' + query_value+";" ;
		console.log(db_sql);
		connection.query(db_sql);

		connection.query('SELECT * from weather',function(err,rows){

				if(err){
					console.log(err);	
					res.send("Fail in Insert ");
					return;
				}
				console.log(rows);

		});
		res.send("DONE INSERT");

});


//기상청 정보를  DB에 넣으려고
app.get('/xml',function(req,res){

		var parser= new xml2js.Parser();

		fs.readFile('./xml/queryDFSRSS.xml',function(err,data){
				parser.parseString(data,function(err,result){
				var js_xml=result.rss.channel;
			//xml.rss.channel[0].item[0].description[0].body[0].descript	
				js_xml=js_xml[0].item[0];
				var city=(js_xml.category);
				var pubDate=js_xml.description[0].header[0].tm+"";
			
				js_xml=js_xml.description[0].body[0];

				for ( i in js_xml.data){
				var  tp = js_xml.data[i];
				var  tp_hour= tp.hour;
				var  tp_temp= tp.temp;
				var  tp_rain =tp.pop;
				//DB에 저장
				var db_sql='INSERT INTO weather (time, temp, rain,pubDate) VALUES ('+tp_hour+ ','+ tp_temp+ ','+ tp_rain+','+pubDate+')';
				console.log(db_sql);

				connection.query(db_sql);
				console.log(tp_hour +"시 "+ tp_temp+"도 강수확률"+tp_rain+"%");
				}

				//db에 들어갔는지 확인
				connection.query('SELECT * FROM weather',function(err,rows){
						console.log(rows);
						res.send(rows);
				});

				//res.send(JSON.stringify(result.rss.channel));
				});

		});


});



app.get('/chart',function(req,res){
		fs.readFile('char.ejs','utf8',function(err,data){
			if(err)
			console.log(err);
			else{
			res.writeHead(200,{'Content-Type':'text/html'});
			res.end(ejs.render(data,{
			}));

			}
			});
		});

app.listen(3000, function () {
		console.log('Example app listening on port 3000!');
});


///////////////////////////////////////////////////////////////////
var get_xml_file=function (url,data,callback){




};
