$(document).ready(function(){
  $("#blog_comment").hide();
  $("#comment_title").hide();
  $("#showComment").click(function(){
    var um = UM.getEditor('commentEditor');
    $("#showComment").attr("disabled", "true");
    $("#blog_comment").show();
    $("#commentSubmit").click(function(){
      if (!um.getContent()){
        alert("please write some comment");
        return;
      }
      $.post('/comment',{name:$("#blog_author").html(), time:$("#blog_time").html(), title:$("#comment_title").html(), comment:um.getContent()});
      alert('add comment successed');
      var url = "/u/"+ $("#blog_author").html() + "/" + $("#blog_time").html() + "/" + $("#comment_title").html();
      window.location.href = escape(url);
    });
  });
});
