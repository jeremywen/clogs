jQuery(function() {
  
  var searchBox = $("#searchBox");
  var logsSince = $("#logsSince");
  var ajaxLoader = $("#ajaxLoader");
  var logColHeight = $(".logCol table").height();
  ajaxLoader.hide();

  // $(".logContent").draggable({ containment: "window", zIndex:99, appendTo:".row-fluid" });


  $(".logContent").live('click', function () {
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


  $(".branchName").live('click', function () {
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


  $(".topLink").live('click', function () {
   $(this).parents(".span4").find(".logCol").animate({ scrollTop: 0 }, "fast");
  });


  $(".bottomLink").live('click', function () {
   $(this).parents(".span4").find(".logCol").animate({ scrollTop: logColHeight }, "fast");
  });


  searchBox.keyup(function(e) {
    if(e.which==13){
      var searchVal = searchBox.val().toLowerCase();
       $("td").each(function (){
          var thisEl = $(this);
          if(thisEl.text().toLowerCase().indexOf(searchVal)>-1){
            thisEl.show();
          } else {
            thisEl.hide();
          }
        });
     }
    });


  logsSince.keyup(function(e) {

    $.get('setLogsSince/'+$(this).val(),function(data){
      
    });
  });



}); 