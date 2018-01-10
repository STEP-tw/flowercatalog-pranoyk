const getComments = function () {
  let comments = '';
  data.forEach(feedback=>{
    comments+=feedback['date']+' ';
    comments+=feedback['time']+' ';
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
