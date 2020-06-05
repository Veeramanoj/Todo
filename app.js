const express=require("express") ;
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app = express();
const mongoose=require("mongoose") ;
const _=require("lodash");

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect("mongodb+srv://admin-manoj:test1234@cluster0-lzvkz.mongodb.net/todoDB",{useNewUrlParser :true});

const itemsSchema={
  name:String
}
const Item=new mongoose.model("Item",itemsSchema)

const item1= new Item({
  name:"welcome to todo list."
})
const item2 = new Item({
  name:"Hit + to add new items"
})
const item3 =new Item({
  name:"<-- hit to delete item"
})
const defaultItems =[item1,item2,item3];

const listSchema ={
  name:String ,
  items: [itemsSchema]
};

const List= mongoose.model('List',listSchema) ;

app.get("/",function(req,res){
  Item.find({},function(err,foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else {
          console.log("succefully saved items to db .");
        }
      })
      res.redirect("/");
    }else{
      res.render("list", {listTytle:"Today" , newitem:foundItems} ) ;
    }
  })
})


app.post("/",function(req,res){
  const itemName =req.body.entered;
  const listName= req.body.list;

  const item = new Item({
    name: itemName
  })
  if(listName==="Today"){
  item.save();
  res.redirect("/")
  }else {
    List.findOne({name:listName} ,function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
})

app.post("/delete",(req,res)=>{
  const delItem=req.body.checkbox ;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(delItem,function(err){
      if(!err){
        console.log("deleted item");
        res.redirect("/")
      }else {
        console.log(err);
      }
    });
  }else {
    List.findOneAndUpdate({name:listName},{$pull : {items:{_id:delItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
})

app.get("/:route",(req,res)=>{
  const customlist =_.capitalize(req.params.route) ;
  List.findOne({name:customlist},function(err,foundList){
    if(!err){
      if(!foundList){
        const list =new List({
          name : customlist ,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customlist);
      }else{
        res.render("list",{listTytle:foundList.name,newitem:foundList.items})
      }
    }
  })
})

app.listen(process.env.PORT||3000,function(){
  console.log("server started ");
})
