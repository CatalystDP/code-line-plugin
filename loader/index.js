const acorn=require('acorn');
const lineName='__LINE__';
module.exports=function(content){
    let lines=[];
    let ast=acorn.parse(content,{
        ecmaVersion:8,
        ranges:true,
        locations:true,
        onToken:function(token){
            if(token.value===lineName){
                if(token.loc){
                    let line=token.loc.start.line;//获取行号
                    let start=token.start,
                        end=token.end;
                    //替换指定位置的字符串
                    lines.push(line); 
                }
            }
        } 
    });
    console.log(lines);
    let i=0;
    content=content.replace(new RegExp(lineName,'g'),function(str){
        let s=lines[i];
        ++i;
        return s+''; 
    });
    return content;
}