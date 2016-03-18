var express = require('express');
var app = express();
var mysql = require('mysql');
var fs= require('fs');
var xml2js=require('xml2js');


app.use(express.static('public'));


var connection =mysql.createConnection({

    host : 'localhost',
    user : 'root',
    password :'98879498',
    database: 'capstone'
});


connection.connect(function(err){
  if(err){

    console.log("error in connect DB"+err.stack);
    return;
  }



});
app.get('/', function (req, res) {


  var query = connection.query ('desc attend',function (err, rows){

    console.log(rows);
  });
  res.send('Hello World!');
});



app.get('/insert',function(req,res){

//var query_data={};
var query_key=[];
var query_value=[];
for(key in req.query){
  query_key.push(key);
  query_value.push(req.query[key]);
}

//console.log(Object.keys(query_data).length);

query_value='('+query_value.join(',')+')';


//var db_sql="INSERT INTO attend (studentId) VALUES (20131549)";

var db_sql='INSERT INTO attend ('+ query_key.join(',') +') VALUES' + query_value+";" ;
console.log(db_sql);
connection.query(db_sql);

connection.query('SELECT * from attend',function(err,rows){

  console.log(rows);z

});
res.send("DONE INSERT");

});

app.get('/xml',function(req,res){

    var parser= new xml2js.Parser();

    fs.readFile('queryDFSRSS.xml',function(err,data){
        parser.parseString(data,function(err,result){
            var js_xml=result.rss.channel;
            var pubDate=js_xml[0].pubDate;

            js_xml=js_xml[0].item[0];
            var city=(js_xml.category);


            js_xml=js_xml.description[0].body[0];


            for ( i in js_xml.data){
           //     console.log(JSON.stringify(i.hour)+"시" +i.tem+"도\n");
                var  tp = js_xml.data[i];
                var  tp_hour= tp.hour;
                var  tp_temp= tp.temp;
                var db_sql='INSERT INTO climate (time, temp) VALUES ('+tp_hour+','+tp_temp+')';
                connection.query(db_sql);
                console.log(tp_hour +"시 "+ tp_temp+"도 ");
            }
            //console.log(JSON.stringify(js_xml.data[0]));

            connection.query('SELECT * FROM climate',function(err,rows){
                console.log(rows);
            });



             res.send(JSON.stringify(result.rss.channel));
        });

    });


});



app.get('/chart',function(req,res){
  fs.readFile('linechart.html',function(err,data){
    if(err)
      console.log(err);
    else{
        res.writeHead(200,{'Content-Type':'text/html'});
        res.end(data);

    }
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
