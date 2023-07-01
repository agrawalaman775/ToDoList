

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const _=require("lodash")

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://agrawalaman977:Qwerty@123@todolist.z5csbpt.mongodb.net/?retryWrites=true&w=majority/todolistDB", ()=> {
    console.log("connected");
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

const itemSchema=new mongoose.Schema({
  name: String
})

const Item=new mongoose.model("Item", itemSchema)

const item1=new Item({
  name: "Welcome to your ToDoList!"
});

// const item2=new Item({
//   name: "Cook Food"
// });

// const item3=new Item({
//   name: "Eat Food"
// });

const defaultItems= [item1]

const listSchema={
  name: String,
  items: [itemSchema]
}

const List=mongoose.model("List", listSchema)


// Item.deleteMany({name: "Get Food"}, function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Deleted");
//   }
// })

const day = date.getDate();
app.get("/", function(req, res) {

  
  Item.find({}, function(err, foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Succesfully added");
        }
      })
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  })
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list= new List({
          name: customListName,
          items: defaultItems
        })
      
        list.save()
        res.redirect("/"+ customListName)
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  const item=new Item({
    name: itemName
  })
  if(listName===day){
    item.save()
    res.redirect("/")
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+ listName)      
    })
  }
  
});

app.post("/delete", function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Deleted");
      }
    })
    res.redirect("/")
  }
  else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      function (err,foundlist) {
        if(err){
          console.log(err);
        }
        else{
          res.redirect("/"+listName)
        }
      }
      )
  }
  
  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
