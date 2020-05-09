var express = require('express');
var router = express.Router();
const db = require('../data/config.js');
var mysql = require('mysql');
module.exports = router;
var moment = require('moment');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var img_google= 0;
/*google drive*/


const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

const TOKEN_PATH = 'token.json';

fs.readFile('data/credentials.json', (err, content,consult_string) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listFiles, consult_string);
});


function authorize(credentials, callback, consult_string) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  let consult_=consult_string;
  console.log(consult_string);
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, consult_);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


function listFiles(auth, consult_string) {
  if(consult_string){
    consult_=consult_string;
  }
  else{
   consult_=''
  }
  const drive = google.drive({version: 'v3', auth});
  
  drive.files.list({
    q: "name contains '"+consult_+"'",
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
    space: 'drive',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
    processFile(files);
  } else {
    console.log('No files found.');
    processFile("No files found");
  }
  });
}

function processFile(content) {
  var img_get = content;
  console.log('processfile');
  console.log(img_get);
  img_google=img_get;
  return img_get;
}
/*async/


/*galery*/
router.get('/galery', function(req, res, next) {

    res.render('galery', { title: 'Imagenes' });
});

/* wave*/
router.get('/wave', function(req, res, next) {

  res.render('wave', { title: 'Wave' });
});

/* resumen*/
router.get('/summary', function(req, res, next) {

  res.render('summary', { title: 'Summary' });
});
/*galery post*/

router.post('/galery_post', (req, res, next) => {
  if(req.body.DataString){
    consult_=req.body.DataString;
  }else {
    console.log("consulta no existe")
  }
  //var consult_="alto";
  
  
  fs.readFile('data/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listFiles, consult_);
  });
    var img_json = JSON.stringify(img_google);
    console.log(img_json);
    res.json(img_json);
});
/*resumen post*/
router.post('/resumen_post', (req, res, next) => {
  if(req.body.DataString){
    consult_=req.body.DataString;
  }else {
    console.log("consulta no existe")
  }
  //var consult_="alto";
  
  
  fs.readFile('data/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listFiles, consult_);
  });
    var img_json = JSON.stringify(img_google);
    console.log(img_json);
    res.json(img_json);
});



/*init*/
router.get('/', (req, res, next) => {
  const connection = mysql.createConnection(db);

  connection.connect((error) => {
    if (error) {
      throw error;                       
    } else {
      console.log('Connection Successful init.');
    }
  });

  const textQuery = 'SELECT * FROM LOC ORDER BY time DESC LIMIT 50';
  var eventList = [];
  
  connection.query(textQuery, (error, rows, fields) => {
    if (error) {
      throw error;
    } else if (rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        var warn = {
          'time':rows[i].time,
          'longitude':rows[i].longitude,  
          'latitude':rows[i].latitude,
          'depth':rows[i].depth,
          'magnitude':rows[i].magnitude,
          'rms':rows[i].rms,
          'gap':rows[i].gap,
          'status':rows[i].status,
          'dx':rows[i].dx,
          'dy':rows[i].dy,
          'dz':rows[i].dz,
          'serverid':rows[i].serverid,
          'number of stations':rows[i].number_of_stations
                }
        eventList.push(warn);
      }
      res.render('index', { consulta: eventList,  title: 'Gema Udec' });
    } else {
      console.log('Registro no encontrado');
    }  
  });
  connection.end();  
});
 /*post*/
router.post('/map', (req, res, next) => {
  const connection = mysql.createConnection(db);

  connection.connect((error) => {
    if (error) {
      throw error;
    } else {
      console.log('Connection Successful post-init.');
    }
  });
  

  const textQuery = 'SELECT LOC.time, LOC.longitude, LOC.latitude, LOC.depth, LOC.magnitude, LOC.rms, LOC.gap, LOC.status, LOC.dx, LOC.dy, LOC.dz, LOC.serverid, LOC.number_of_stations FROM LOC WHERE status != "rejected" ORDER BY time DESC LIMIT 150';
  var eventList = [];
  
  connection.query(textQuery, (error, rows, fields) => {
    if (error) {
      throw error;
    } else if (rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        var warn = {  
          'time':rows[i].time,
          'longitude':rows[i].longitude,  
          'latitude':rows[i].latitude,
          'depth':rows[i].depth,
          'magnitude':rows[i].magnitude,
          'rms':rows[i].rms,
          'gap':rows[i].gap,
          'status':rows[i].status,
          'dx':rows[i].dx,
          'dy':rows[i].dy,
          'dz':rows[i].dz,
          'serverid':rows[i].serverid,
          'number of stations':rows[i].number_of_stations,       
                }
        eventList.push(warn);
      }
      var eventJSON = JSON.stringify(eventList);
      res.json(eventJSON);
    } else {
      console.log('Registro no encontrado');
    }
  });
  connection.end();

});


/*popup*/
router.post('/img_map', (req, res, next) => {
  if (req.xhr) {
    console.log(JSON.stringify(req.body));
    const connection = mysql.createConnection(db);

    connection.connect((error) => {
      if (error) {
        throw error;
      } else {
        console.log('Successful connect img_map');
      }
    });

    if (!req.body.time ) {
      res.send('<div class="alert alert-warning">error en formato.</div>');
    }

    console.log("time: -> "+req.body.time); 
    let timeloc=moment(req.body.time).format('YYYY-MM-DD HH:mm:ss');
    console.log(timeloc);
    
    const textQuery = 'SELECT loc_img.img from loc_img, LOC WHERE  loc_img.time = LOC.time && loc_img.time='+"'"+timeloc+"'";
    console.log(textQuery)
    
    connection.query(textQuery, (error, result, fields) => {
      if (error) {
        throw error;
      } else if (result.length > 0) {      
        //-console.log(result)
        var eventJSON = JSON.stringify(result);
        res.json(eventJSON);
      } else {
        res.send('noimagen');
      }
    });

    connection.end();
  }
});

/*warning*/ /* warning */
  
router.post('/warning', (req, res, next) => {
   
    const connection = mysql.createConnection(db);

    connection.connect((error) => {
      if (error) {
        throw error;
      } else {
        console.log('Successful connect warning');
      } 
    });   


   const locQuery = 'SELECT * FROM warnings ORDER BY time DESC LIMIT 150;';

    connection.query(locQuery, (error, result, fields) => {
      if (error) {
        throw error;
      } else if (result.length > 0) {
        var eventJSON = JSON.stringify(result);
        res.json(eventJSON);
      } else {
        res.send('<div class="alert alert-success">No se encontraron alertas</div>');
      }
    });

    connection.end();
});




/*thermal*/
  
router.post('/thermal', (req, res, next) => {
   
  const connection = mysql.createConnection(db);

  connection.connect((error) => {
    if (error) {
      throw error;
    } else {
      console.log('Successful connect warning');
    } 
  });   

 const locQuery = 'SELECT * FROM thermal ORDER BY time DESC LIMIT 150;';

  connection.query(locQuery, (error, result, fields) => {
    if (error) {
      throw error;
    } else if (result.length > 0) {
      var eventJSON = JSON.stringify(result);
      res.json(eventJSON);
    } else {
      res.send('<div class="alert alert-success">No se encontraron alertas</div>');
    }
  });

  connection.end();
});



