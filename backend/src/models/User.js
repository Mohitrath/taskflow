const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
  name:{type:String,required:[true,'Name is required'],trim:true,minlength:2,maxlength:80},
  email:{type:String,required:[true,'Email is required'],unique:true,lowercase:true,trim:true,match:[/^\S+@\S+\.\S+$/,'Please provide a valid email']},
  password:{type:String,required:[true,'Password is required'],minlength:6,select:false},
  avatarColor:{type:String,default:()=>'#'+Math.floor(Math.random()*16777215).toString(16)}
},{timestamps:true});
UserSchema.pre('save',async function(next){if(!this.isModified('password')) return next(); const salt=await bcrypt.genSalt(10); this.password=await bcrypt.hash(this.password,salt); next();});
UserSchema.methods.comparePassword=function(candidate){return bcrypt.compare(candidate,this.password)};
UserSchema.methods.toSafeObject=function(){return {id:this._id,name:this.name,email:this.email,avatarColor:this.avatarColor,createdAt:this.createdAt}};
module.exports=mongoose.model('User',UserSchema);