
/******************************************************************
 * Ideas:
 *    click commit to get more details: diff stat
 *
 *
 *
 *
 *
 *     drag commit to another branch to cherry-pick
 *     drag commit within branch to squash unpushed commits
 *
 * Run with:
 *     supervisor -p app.js -w .
 ******************************************************************/
var express = require('express')
  , sh = require('shelljs')
  , ejs =  require('ejs')
  , str = require('string');

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


var since = "1 year ago";
var gitRepoDir = '/Users/jeremy/code/spida/calc';


/******************************************************************
 * Routes
 ******************************************************************/
app.get('/', function(req, res){  
  
  var logCols = [];
  logCols.push(getLogCol(gitRepoDir, 'master', since));
  logCols.push(getLogCol(gitRepoDir, '4.3.x', since));
  logCols.push(getLogCol(gitRepoDir, '4.2.x', since));

  var branchString = sh.exec('git branch -a', {silent:true}).output;
  var branchList = branchString.replace('* ','').split('\n');
  for ( var i = 0; i < branchList.length; i++ ) {
    var arrowIndex = branchList[i].indexOf('->');
    if(arrowIndex>-1){
      branchList[i] = branchList[i].substring(0,arrowIndex-1);
    } 
  }

  res.render('index', { branchList:branchList, logCols:logCols });
});


app.get('/getBranchLogs/:branchName', function(req, res){  
  //handle slashes in branch names
  var actualBranchName = req.params.branchName.replace(/___/g,'\/');
  
  var logCol = getLogCol(gitRepoDir, actualBranchName, since);
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
function getLogCol(gitRepoDir, branchName, since){
  var formatting = '--pretty=format:"DATE_BEGIN%adDATE_END HASH_BEGIN%hHASH_END AUTH_BEGIN%anAUTH_END DECO_BEGIN%dDECO_END SUBJ_BEGIN%sSUBJ_END" --abbrev-commit --date=short';
  sh.cd(gitRepoDir);
  // http://www.kernel.org/pub/software/scm/git/docs/git-log.html
  var logString = sh.exec('git log '+branchName+' '+formatting+' --since=\"'+since+'\"', {silent:true}).output;
  logString = str(logString)
          .replaceAll('DATE_BEGIN','<span class=\'label label-info date\'>')
          .replaceAll('DATE_END','</span>')
          .replaceAll('HASH_BEGIN','<span class=\'label hash\'>')
          .replaceAll('HASH_END','</span>')
          .replaceAll('SUBJ_BEGIN','')
          .replaceAll('SUBJ_END','')
          .replaceAll('AUTH_BEGIN','<span class=\'label author\'>')
          .replaceAll('AUTH_END','</span>')
          .replaceAll('DECO_BEGINDECO_END','')//handle no decoration
          .replaceAll('DECO_BEGIN','<span class=\'label label-success\'>')
          .replaceAll('DECO_END','</span>')
          .s;
  var logList = logString.split('\n');
  return {branchName:branchName, logList:logList};
}


/******************************************************************
 * Startup
 ******************************************************************/
app.listen(3000, function(){
  console.log("http://localhost:%d in %s mode", app.address().port, app.settings.env);
});

