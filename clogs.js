#! /usr/bin/env node

/******************************************************************
 * CLOGS
 *     Git Column Logs
 *
 * Run:
 *     node clogs.js
 *     nodemon clogs.js
 * 
 * Links:
 *     http://localhost:3000/#
 *     http://expressjs.com/guide.html
 *     https://github.com/visionmedia/ejs
 *     https://github.com/arturadib/shelljs/
 *     http://stringjs.com/
 *     http://twitter.github.com/bootstrap/
 *     http://www.kernel.org/pub/software/scm/git/docs/git-log.html
 * 
 * Ideas:
 *     remember last branches used
 *     show current branch status and allow to commit with a message
 *     drag commit to another branch to cherry-pick
 *     drag commit within branch to squash
 *     allow searching logs for certain things - for example, file:app.js
 *     allow changing logsSince string
 *     allow pushing commits
 *
 ******************************************************************/


var express = require('express')
  , sh = require('shelljs')
  , ejs =  require('ejs')
  , str = require('string')
  , open = require('open');

console.log("process.argv = " + process.argv);
var gitRepoDir = process.argv[2] || require('path').resolve("./");
var logsSince = "1 year ago";
var app = module.exports = express.createServer();


/******************************************************************
 * Configuration
 ******************************************************************/
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


/******************************************************************
 * Routes
 ******************************************************************/
app.get('/', function(req, res){  
  
  var logCols = [];
  logCols.push(getLogCol(gitRepoDir, 'master', logsSince));

  var branchString = sh.exec('git branch -a', {silent:true}).output;
  var branchList = branchString.replace('* ','').trim().split('\n');

  for ( var i = 0; i < branchList.length; i++ ) {
    var arrowIndex = branchList[i].indexOf('->');
    if(arrowIndex >- 1){
      branchList[i] = branchList[i].substring(0, arrowIndex-1);
    } 
    branchList[i] = branchList[i].trim();

    if(logCols.length < 3 && 
      branchList[i] !== "master" && 
      branchList[i].indexOf("/master") == -1 && 
      branchList[i].indexOf("/HEAD") == -1){

      logCols.push(getLogCol(gitRepoDir, branchList[i], logsSince));
    }
  }

  res.render('index', { gitRepoDir:gitRepoDir,branchList:branchList, logCols:logCols });
});


app.get('/getBranchLogs/:branchName', function(req, res){  
  //handle slashes in branch names
  var actualBranchName = req.params.branchName.replace(/___/g,'\/');
  
  var logCol = getLogCol(gitRepoDir, actualBranchName, logsSince);
  res.json({ logCol:logCol });
});


app.get('/getHashDetails/:hash', function(req, res){  
  var hashDetails=sh.exec('git show --stat ' + req.params.hash, {silent:true}).output;
  hashDetails = hashDetails.replace(/</g,'').replace(/>/g,'');
  res.json({ hashDetails:hashDetails });
});


/******************************************************************
 * Utils
 ******************************************************************/
function getLogCol(gitRepoDir, branchName, logsSince){
  var formatting = '--pretty=format:"DATE_%ad_DATE HASH_%h_HASH AUTH_%an_AUTH DECO_%d_DECO SUBJ_%s_SUBJ" --abbrev-commit --date=short';
  sh.cd(gitRepoDir);
  var logString = sh.exec('git log '+branchName+' '+formatting+' --since=\"'+logsSince+'\"', {silent:true}).output;
  logString = str(logString)
          .replaceAll('DATE_','<span class=\'label label-info date\'>')
          .replaceAll('_DATE','</span>')
          .replaceAll('HASH_','<span class=\'label hash\'>')
          .replaceAll('_HASH','</span>')
          .replaceAll('DECO__DECO','')//handle no decoration
          .replaceAll('DECO_','<span class=\'label label-success\'>')
          .replaceAll('_DECO','</span>')
          .replaceAll('SUBJ_','')
          .replaceAll('_SUBJ','')
          .s;

  var logList = logString.trim().split('\n');
  for ( var i = 0; i < logList.length; i++ ) {
    if(logList[i].indexOf('AUTH') > -1){
      var preName = logList[i].substring(0, logList[i].indexOf('AUTH_'));
      var postName = logList[i].substring(logList[i].indexOf('_AUTH') + 5);
      var name = logList[i].substring(logList[i].indexOf('AUTH_') + 5, logList[i].indexOf('_AUTH'));
      logList[i] = preName + '<span class=\'label author\'>' + convertToInitials(name) + '</span>' + postName;
    }
  }

  return {branchName:branchName, logList:logList};
}


function convertToInitials(fullName){
  if(fullName.indexOf(' ') > -1){
    var names = fullName.trim().split(' ');
    return names[0].charAt(0) + names[1].charAt(0);
  } else {
    return fullName.substring(0,Math.min(2,fullName.length)).toUpperCase();
  }
}


/******************************************************************
 * Startup
 ******************************************************************/
app.listen(8013, function(){
  console.log("git repo dir: " + gitRepoDir);
  console.log("http://localhost:%d in %s mode", app.address().port, app.settings.env);
  open('http://localhost:'+app.address().port);
});

