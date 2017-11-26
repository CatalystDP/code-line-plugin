## code-line-plugin

#### The plugin is use to replace `__LINE__` and `__FILE__` in js

### Usage

```
const CodeLinePlugin=require('code-line-plugin');
//some webpack configs
output:{
    ...
    devtoolLineToLine:true
},
plugins:[
    new CodeLinePlugin
],
devtool='source-map'
``` 
#### The devtool configs are optional,but it is recommended to add it because with out linetoline flag,the `__LINE__` may have offset a lot due to some loader,babel-loader for example,it will modify the source file.
 
