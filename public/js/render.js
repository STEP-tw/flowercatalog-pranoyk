const getComments = function () {
  let comments = '';
  data.forEach(feedback=>{
    comments+=feedback['name']+' ';
    comments+=feedback['comment']+' ';
    comments=`${comments} \n`;
  })
  return comments;
}

const comments = function () {
  let comment = document.getElementById('comments');
  comment.innerText = getComments();
}

window.onload = comments;
