const http = require('http');
const fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const WebApp = require('./webApp.js');
const loginPage = fs.readFileSync('./login.html');
const Comment = require('./lib/comment.js');

let toS = o=>JSON.stringify(o,null,2);

let logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});

  console.log(`${req.method} ${req.url}`);
}

let registered_users = [{userName:'pranoyk', name:'Pranoy'},{userName:'pavanigbn', name:'Pavani'}];

let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};

const getHeaderType = (file)=>{
  let extension = file.slice(file.lastIndexOf('.'));
  let headers = {
    '.html' : 'text/html',
    '.jpg' : 'text/jpg',
    '.pdf' : 'text/pdf',
    '.css' : 'text/css',
    '.gif' : 'text/gif',
    '.js' : 'text/js'
  }
  return headers[extension];
}

const isFile = (path)=>{
  return fs.existsSync(path);
}

const readFile = (filePath)=>{
  return fs.readFileSync(filePath)
}

const serveStaticFile = (req,res)=>{
  let filePath = `public${req.url}`;
  if(req.method=='GET' && isFile(filePath)){
    res.write(readFile(filePath));
    res.end();
  }
}

let serveData = (req,res)=>{
  if(req.url.includes('/data')) {
    res.write(fs.readFileSync('./data/data.js'));
    res.end();
  }
}

let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/logout']) && !req.user) res.redirect('/login.html');
}

let redirectToHomePage = (req,res)=>{
  if(req.url=='/') res.redirect('/flowerCatalog');
}

let app = WebApp.create();
app.use(logRequest);
app.use(loadUser);
app.use(redirectToHomePage);
app.use(serveStaticFile);
app.use(serveData);
app.use(redirectLoggedOutUserToLogin);

app.get('/flowerCatalog',(req,res)=>{
  res.write(fs.readFileSync('./public/index.html'));
  res.end();
})

app.post('/guestBook.html',(req,res)=> {
  res.redirect('/login');
});

app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/login');
});

app.get('/login',(req,res)=>{
  res.setHeader('Content-type','text/html');
  res.write(loginPage);
  res.end();
});

app.post('/login',(req,res)=>{
  let user = registered_users.find(u=>u.userName==req.body.userName);
  if(!user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/addComment.html');
});

app.get('/addComment.html',(req,res)=>{
  let addCommentPage = fs.readFileSync('./addComment.html','utf8');
  res.setHeader('Content-Type','text/html');
  let finalPage = addCommentPage.replace(/<p><p>/,`${req.user.name}<br><br>`);
  res.write(finalPage);
  res.end();
})

app.post('/addComments',(req,res)=>{
  let name = req.user.name;
  let comment = req.body.comment;
  let newComment = new Comment(name,comment);
  let data = fs.readFileSync('./data/data.js','utf8');
  let commentData = data.split('= ')[1];
  let modifiedData = JSON.parse(commentData);
  let finalComment = newComment.getComment();
  modifiedData.unshift(finalComment);
  finalComment = `var data = ${JSON.stringify(modifiedData)}`;
  fs.writeFileSync('./data/data.js', finalComment);
  res.redirect('/addComment.html');
})

const PORT = 5050;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
