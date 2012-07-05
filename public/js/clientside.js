jQuery(function() {
  
  // Handler for .ready() called.


  var searchBox = $("#searchBox");
  var lastSearch = "";
  var logColHeight = $(".logCol table").height();


  // $(".logContent").draggable({ containment: "window", zIndex:99, appendTo:".row-fluid" });


  $(".logContent").on('click',function () {
    var logContent = $(this);
    if(logContent.hasClass("showingDetails")){
      logContent.removeClass("showingDetails");
      logContent.find("pre").remove();
      return;
    }
    var hash = logContent.find(".hash").text();
    $.get('getHashDetails/'+hash,function(data){
      logContent.append("<pre>"+data.hashDetails+"</pre>");
      logContent.find("pre").css("width",logContent.width()-20);
      logContent.addClass("showingDetails")
    });
  });


  $(".branchName").click(function () {
    var branchNameEl = $(this);
    var branchName = branchNameEl.text();

    //handle slashes in branch names
    var branchNameForUrl = branchName.replace(/\//g,'___');

    $.get('getBranchLogs/'+branchNameForUrl,function(data){
      console.log("data = %o",data);

      var colDiv = branchNameEl.parents(".span4");
      colDiv.find(".currentBranchName").text(branchName);
      colDiv.find("tr").remove();
      
      var rows = [];
      $.each(data.logCol.logList,function(i,val){
        rows.push("<tr><td><div class=\"logContent\">"+val+"</div></td></tr>");
      });
      var table = colDiv.find("table");
      table.append(rows.join(""));
    });

  });


  $(".topLink").click(function () {
   $(this).parents(".span4").find(".logCol").animate({ scrollTop: 0 }, "fast");
  });


  $(".bottomLink").click(function () {
   $(this).parents(".span4").find(".logCol").animate({ scrollTop: logColHeight }, "fast");
  });


  $(".author").text(function(index, text){

    if(text.indexOf(' ') > -1){
      var names = text.split(' ');
      return names[0].charAt(0) + names[1].charAt(0);
    } else {
      return text.substring(0,Math.min(2,text.length)).toUpperCase();
    }
    
  }).click(function(){
    searchBox.val($(this).text());
  });

 
  setInterval(function(event){
      var searchVal = searchBox.val();
      if(searchVal!==lastSearch){
        $("td").each(function (){
          if($(this).text().toLowerCase().indexOf(searchVal.toLowerCase())>-1){
            $(this).show();
          } else {
            $(this).hide();
          }
        });
      }
    }
  ,100);


}); 