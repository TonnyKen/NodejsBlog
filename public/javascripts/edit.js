// deal with editing your blog
$(document).ready(function(){
  //My editor
  var um = UM.getEditor('myEditor');

  $("#edit_form").hide();
  $("#cur_user").hide();
  //$("").html($("#cur_user p").html());
  $("#edit").click(function(){
    // if($("#cur_user p").html() === $("#info a").html()){
      $("#edit_form").show();
      $("#content").hide();
      // $("#edit_form textarea").text($("#content").html());
      um.setContent($("#content p").html());
    // }
    // else{
    //   alert("You can just edit your own blog");
    // }
  });
  $("#edit_button").click(function(){
    $("#edit_form").hide();
    $("#content").show();
  });

});
