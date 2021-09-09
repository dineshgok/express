var express=require("express");
var app=express();

app.use(express.urlencoded({extended:true}))
app.use(express.json());



app.set('view engine', 'pug');
app.set('views','./views');

const {MongoClient,ObjectId} =require('mongodb');

const url='mongodb://localhost:27017';
var path = require("path");
const multer  = require('multer')
app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname+'/uploads')
    },
    filename: function (req, file, cb) {
        console.log("file in filename function::",file)
        var fileext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+fileext)
    }
})

const upload = multer({ storage: storage })

app.get("/registerstudent",function(req,res){
    res.sendFile(__dirname+"/studentform.html")
})



/*app.post("/addStudent",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("meritdinesh");
        db.collection("students").insertOne(req.body,function(err,data){
            res.send(data);
        })
        
    })
})*/
app.post("/addStudent",upload.single("profilepic"),function(req,res){
    console.clear();
    console.log("req.file",req.file);    
    req.body.profilePic = req.file.filename;
    console.log("req.body",req.body);
    MongoClient.connect(url,function(err,conn){
        var db = conn.db("meritdinesh");
        db.collection("students").insertOne(req.body,function(err,data){
            res.send(data)
        })
    })
})

app.get("/stds",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("meritdinesh");
        db.collection("students").find().toArray(function(err,data){
            res.render("detailsstudent",{
                allstudents:data
            })
      })
        
    })
})

app.get("/studentlist",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("meritdinesh");
        db.collection("students").find().toArray(function(err,data){
            res.render("studentdetails2",{
                allstudents:data
            })
      })
        
    })
})

app.get("/studentdetails/:id",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("meritdinesh");
        db.collection("students").find({_id:ObjectId(req.params.id)})
        .toArray(function(err,data){
            res.render("pic1",{
                allstudentdetails:data  
            })
        })
    })
})

app.get("/addStudentWeightForm/:id",function(req,res){
    res.render("weightform",{
        studentid:req.params.id
    })
})
app.post("/addStudentWeight",function(req,res){
    MongoClient.connect(url,function(err,conn){
        console.log(req.body)
        var db = conn.db("meritdinesh");
        db.collection("students")
        .updateOne(
            {_id:ObjectId(req.body.id)},
            {
                $push:{
                    weightEntry:{
                        date:req.body.date,
                        weight:req.body.weight,
                        gender:req.body.gender,
                        Hipsize:req.body.Hipsize,
                        musclemass:req.body.musclemass
                    }
                }
            },
            function(err,data){
                console.log(data)
                res.redirect("/studentList")
            }
        )
    })
})


app.get("/deletestudent/:id",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("meritdinesh");
        db.collection("students").deleteOne({_id:ObjectId(req.params.id)},function(err,data){
            res.redirect("/studentlist")
  
      })
        
    })
})

app.listen(9080,function(){console.log("port is 9080")})

