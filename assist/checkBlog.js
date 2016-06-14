module.exports = function(req, res) {
  if(!req.body.title) {
    return {error:'You must have a title!'};
  }
  if(!req.body.content) {
    return {error: 'Please type something OK?'};
  }
  return;
};
