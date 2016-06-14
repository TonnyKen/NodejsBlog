var crypto = require('crypto');
var md5 = crypto.createHash('md5');

module.exports = function(email){
  var email_MD5 = md5.update(email.toLowerCase()).digest('hex');
  head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
  return head;
};
