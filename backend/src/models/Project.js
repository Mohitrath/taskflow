const mongoose=require('mongoose');
const ProjectSchema=new mongoose.Schema({
 name:{type:String,required:[true,'Project name is required'],trim:true,minlength:2,maxlength:120},
 description:{type:String,trim:true,maxlength:1000,default:''},
 owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 status:{type:String,enum:['active','on-hold','completed','archived'],default:'active'},
 color:{type:String,default:'#6366f1'}
},{timestamps:true});
ProjectSchema.index({owner:1,createdAt:-1});
module.exports=mongoose.model('Project',ProjectSchema);