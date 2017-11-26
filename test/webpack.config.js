'use strict';

const webpack = require('webpack'),
    path = require('path');
const ROOTPATH=process.cwd();
const CodeLinePlugin=require('../index');
/**
 * 
 * @param {*} cur 当前版本号
 * @param {*} target 目标版本号 
 * @returns 1 当前版本大于目标版本  -1当前版本小于目标版本
 */
function compareVersion(cur,target){
    cur=cur.replace(/\.0?$/).split('.'),
    target=target.replace(/\.0?$/).split('.'); 
    let curLen=cur.length,
        targetLen=target.length;
    let len=Math.min(curLen,targetLen);
    for(let i=0;i<len;++i){
        if(cur[i]>target[i]){
            return 1;
        }else if(cur[i]<target[i]){
            return -1;
        }
    }  
    if(curLen>targetLen){
        return 1;
    }else if(curLen<targetLen){
        return -1;
    }else{
        return 0;
    }
}
let config={
    DISTPATH:path.join(ROOTPATH,'dist'),
    entry:{
        app:path.join(ROOTPATH,'src/index.js')
    }
};
let _config = {
    entry: {
        app:config.entry.app
    },
    context: path.join(ROOTPATH,'src'),
    output: {
        path: config.DISTPATH,
        publicPath: '../dist/',
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js',
        devtoolLineToLine:true
        // sourceMapFilename:'http://localhost:8080/demo/dist/js/[name].map'
    },
    // watch:true,
    plugins: [
        new CodeLinePlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude:/(node_modules)/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['env']
                    }
                }
            }
        ]
    }
};
_config.devtool='source-map';
module.exports = _config;
