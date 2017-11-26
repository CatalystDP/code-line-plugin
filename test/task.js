const webpack=require('webpack'),
      config=require('./webpack.config')
webpack(config,(err,status)=>{
    if(err){
        console.error(err);
    }
    // console.log(status);
})