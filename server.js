const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const timeStamp = require('./time.js').timeStamp;
const WebApp = require('./webApp.js');
const loginPage = fs.readFileSync('./login.html');

let registered_users = [{userName:'pranoyk', name:'Pranoy'}, {userName:'kaskichandrakant', name:'Chandrakant'}];

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

let redirectToHome = (req,res)=>{
  console.log(req.url);
  if(req.urlIsOneOf(['/']) ) res.redirect('/index.html');
}

const isFile = (path)=>{
  return fs.existsSync(path);
}

const readFile = (filePath)=>{
  return fs.readFileSync(filePath)
}

const serveStaticFile = (req,res)=>{
  console.log(`${req.method} ${req.url}`);
  let filePath = `public${req.url}`;
  if(req.url=='/') {
    res.write(fs.readFileSync('./public/index.html'));
    res.end();
  } else if(req.url.includes('/favicon')) {
    res.statusCode=404;
    res.end();
  } else if(req.url.includes('/data')) {
    res.write(fs.readFileSync('./data/data.js'));
    res.end();
  } else if(req.method=='GET' && isFile(filePath)){
    res.write(readFile(filePath));
    res.end();
  }
}

const storeComments = function (query) {
  let data = fs.readFileSync("./data/data.js", "utf8");
  let commentData = data.split('= ')[1];
  let modifiedData = JSON.parse(commentData);
  modifiedData.unshift(query);
  let comments = `var data = ${JSON.stringify(modifiedData)}`;
  fs.writeFileSync('./data/data.js', comments);
  res.redirect('/addComment.html');
}

const parseComments = function (req,res) {
  req.on('data',(text)=>{
    console.log('========================>>>>>>>>>>>>>');
    let comment = qs.parse(text.toString());
    storeComments(comment);
  });
}

let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/','/home','/logout']) && !req.user) res.redirect('/login.html');
}

let app = WebApp.create();
app.use(loadUser);
app.use(serveStaticFile);
app.use(redirectLoggedOutUserToLogin);

app.post('/guestBook.html',(req,res)=> {
  res.redirect('/login');
});

app.post('/login.html',(req,res)=>{
  res.redirect('/addComment.html');
})
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
    res.redirect('/login.html');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/addComment.html');
});

app.get('/addComment.html',(req,res)=>{
  res.setHeader('Content-Type','text/html');
  res.write(fs.readFileSync('./addComment.html'));
  res.end();
})

const PORT = 5050;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
