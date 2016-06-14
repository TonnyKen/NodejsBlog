$(document).ready(function(){
  $("#blog_submit").click(function(){
    var um = UM.getEditor('myEditor');
    if (!$("#blog_title").val()){
      alert("please add a title to your blog");
      return;
    }
    else if (!um.getContent()){
      alert("please add some content to your blog");
      return;
    }
    $.post('/blog',{title:$("#blog_title").val(),content:um.getContent()});
    alert("new blog has added, thanks");
    window.location.href='/';
  });
});
