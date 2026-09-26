require('dotenv').config();
const express=require('express');const cors=require('cors');const morgan=require('morgan');const connectDB=require('./config/db');const{notFound,errorHandler}=require('./middleware/errorHandler');
const authRoutes=require('./routes/auth');const projectRoutes=require('./routes/projects');const taskRoutes=require('./routes/tasks');const aiRoutes=require('./routes/ai');const statsRoutes=require('./routes/stats');
const app=express();app.use(express.json({limit:'1mb'}));app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));
const allowedOrigins=(process.env.CLIENT_ORIGIN||'http://localhost:3000').split(',').map(o=>o.trim());app.use(cors({origin:allowedOrigins,credentials:true}));
app.get('/api/health',(req,res)=>res.json({success:true,message:'TaskFlow API is running',timestamp:new Date().toISOString()}));
app.use('/api/auth',authRoutes);app.use('/api/projects',projectRoutes);app.use('/api/tasks',taskRoutes);app.use('/api/ai',aiRoutes);app.use('/api/stats',statsRoutes);app.use(notFound);app.use(errorHandler);
const PORT=process.env.PORT||5000;if(process.env.VERCEL!=='1'){connectDB().then(()=>app.listen(PORT,()=>console.log('[server] TaskFlow API listening on port '+PORT)))}module.exports=app;