


console.log('log ','at '+__LINE__,'in '+__FILE__);
require('./dep1')


console.log("line1",__LINE__,__FILE__);console.log('line2',__LINE__,__FILE__);


class A{
    constructor(){
        console.log('in class A constructor ',__LINE__,__FILE__);
    }
}