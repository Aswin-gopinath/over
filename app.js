const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const userRouter = require('./routes/user');const adminRouter = require('./routes/admin');
var hbs=require('express-handlebars');
// const fileUpload=require('express-fileupload'); 
const db=require('./config/connection')
const session=require('express-session')
const $  = require( 'jquery' );

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs', defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/', partialDir:__dirname+'/views/partials'}))


var handlebar=hbs.create({});
handlebar.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(fileUpload());

var hbs=require("handlebars");
hbs.registerHelper("inc",function(value,options){
  return parseInt(value)+1; 
})


app.use(
  session({
    secret:"key",
    resave:false,
    cookie:{ maxAge:3000000},
    saveUninitialized:false,

  })
)
db.connect((err)=>{
  if(err) console.log('Connection Error');
  else console.log("Database Connected"); 
});

app.use((req,res,next)=>{
  res.set('cache-control','no-store')
  next()
})

app.use('/', userRouter);
app.use('/admin', adminRouter); 

// catch 404 and forward to error handler 
app.use(function(req, res, next) { 
  next(createError(404));  
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  res.render('user/404');
});

module.exports = app;
