const mongoose=require('mongoose');
const TaskSchema=new mongoose.Schema({
 title:{type:String,required:[true,'Task title is required'],trim:true,minlength:2,maxlength:200},
 description:{type:String,trim:true,maxlength:2000,default:''},
 project:{type:mongoose.Schema.Types.ObjectId,ref:'Project',required:true,index:true},
 owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 assignee:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
 status:{type:String,enum:['todo','in-progress','done'],default:'todo',index:true},
 priority:{type:String,enum:['low','medium','high','urgent'],default:'medium'},
 dueDate:{type:Date,default:null},
 aiGenerated:{type:Boolean,default:false}
},{timestamps:true});
TaskSchema.index({project:1,status:1});
TaskSchema.index({title:'text',description:'text'});
module.exports=mongoose.model('Task',TaskSchema);