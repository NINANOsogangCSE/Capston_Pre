var express = require('express');
var path =require('path');
var app = express();
var http=require('http');
var mysql = require('mysql');
var fs= require('fs');
var xml2js=require('xml2js');
var moment = require('moment-timezone');
var cronJob = require('cron').CronJob; // 매시간 정보를 가져오기 위해서
var ejs= require('ejs');


app.use(express.static(path.join(__dirname,'public')));
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

//한시간마다 한번씩
var job=new cronJob(
		"00 00 * * * 0-6", 
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
						insertDb(filename); //DB갱신	
					}
				});


			});

		});

		},
		function(){
			console.log("cron이멈 췄어요");
		},
		true,
		'Asia/Seoul');


//초기화면
app.get('/', function (req, res) {

		console.log(req.header);
		res.send('Hello World!! Sogang Univ Capstone + Node.js + Mysql');
});



app.get('/chart',function(req,res){
	var nowtime=moment(new Date()).format ("YYYY-MM-DD HH:mm:ss");
	var today=moment(new Date()).format("YYYY-MM-DD HH");
	console.log("chart >>" + today);


	fs.readFile('./public/lineejs.html','utf8',function(err,data){
			connection.query('SELECT nextday, time, temp FROM weather WHERE recordTime Like ?',today+"%",function(err,rows){
				if(err){
					throw err;
				}
				else{	
					 res.send(ejs.render(data,{time : nowtime, hihi:rows}));
				}
			});
		});
});




function insertDb(filename)
{

	var parser= new xml2js.Parser();
	fs.readFile(filename,function(err,data){
			parser.parseString(data,function(err,result){
				var js_xml=result.rss.channel;
				js_xml=js_xml[0].item[0];
				var city=(js_xml.category);
				var pubDate=js_xml.description[0].header[0].tm+"";

				js_xml=js_xml.description[0].body[0];

				for ( i in js_xml.data){
					var  tp = js_xml.data[i];
					var  tp_hour= tp.hour;
					var  tp_temp= tp.temp;
					var  tp_rain =tp.pop;
					var  tp_nextday = tp.day;
//					if(tp.day ==1)
//						tp_hour =parseInt(tp_hour)+24;
//						console.log(tp_hour);
				//DB에 저장
					var db_sql='INSERT INTO weather (time, temp, rain,pubDate,nextday) VALUES ('+tp_hour+ ','+ tp_temp+ ','+ tp_rain+','+pubDate+','+tp_nextday+')';
					connection.query(db_sql);
				}

			});

	});


}



//DB정보를 확인하려고합니다
app.get('/Db',function(req,res){	

		var aa={};
		fs.readFile('list.html','utf8',function(err,data){
			connection.query('SELECT * FROM weather ORDER BY recordTime DESC, nextday ASC, time ASC',function(err,rows){
				if(err){
					throw err;
				}
				else{
				res.send(ejs.render(data,{data:rows}));
				}
			});
		});

});



app.listen(3000, function () {
		console.log('Example app listening on port 3000!');
		});


///////////////////////////////////////////////////////////////////
