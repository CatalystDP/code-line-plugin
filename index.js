const ConstDependency = require('webpack/lib/dependencies/ConstDependency'),
      NullFactory = require('webpack/lib/NullFactory'),
      semver = require('semver'),
      path = require('path'),
      chalk=require('chalk')

const version = require('webpack/package.json').version;
function toConstantDependency(value) {
    return function constDependency(expr) {
        var dep = new ConstDependency(value, expr.range);
        dep.loc = expr.loc;
        this.state.current.addDependency(dep);
        return true;
    };
}
class CodeLinePlugin {
    constructor(opts = {}) {
        this.fileName = opts.fileName || '__FILE__';
        this.lineName = opts.lineName || '__LINE__';
    }
    apply(compiler) {
        let self = this;
        if(compiler.options && compiler.options.output){
            if(!compiler.options.output.devtoolLineToLine){
               console.log(chalk.yellow('[warn] __LINE__ may offset a lot '+ 
               'because of some loader change js source file,babel-loader for example\n')); 
            }
        }
        compiler.plugin('compilation', (compilation, params) => {
            if (!(compilation.dependencyFactories.get(ConstDependency) instanceof NullFactory)) {
                compilation.dependencyFactories.set(ConstDependency, new NullFactory());
            }
            if (!(compilation.dependencyTemplates.get(ConstDependency) instanceof ConstDependency.Template)) {
                compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
            }
            compilation.plugin('build-module', function (module) {
                module._linesCollection = [];
            });
            compilation.plugin('succeed-module', function (module) {
                if(module._source && module._source._originalSource){

                    let originCode = module._source._originalSource || '';
                    originCode = originCode.split('\n');
                    let originIdx = 0;
                    let originLines = [];
                    let reg = new RegExp(self.lineName, 'g');
                    originCode.forEach((content, line) => {
                        let match = content.match(reg);
                        if (Array.isArray(match)) {
                            match.forEach(() => { originLines.push(line + 1) });
                        }
                        reg.lastIndex = 0;
                    });
                    originLines.forEach((lineNum, index) => {
                        toConstantDependency(JSON.stringify(lineNum)).call({
                            state: {
                                current: module
                            }
                        }, module._linesCollection[index]);
                    });
                }
                delete module._linesCollection;
                return true;
            });
            let compatiableParer = parser => {
                parser.plugin('expression ' + this.lineName, function (expr) {
                    let line = expr.loc.start.line;//get line num
                    if(this.state.current.lineToLine){
                        this.state.current._linesCollection.push(expr);
                    }else{
                        //if not lineToLine flag then direct add dependency
                        return toConstantDependency(line+'').call(this,expr);
                    }
                    return true;
                });
                parser.plugin('expression ' + this.fileName, function (expr) {
                    let context = compiler.options.context||process.cwd();
                    let request = this.state.current.resource;
                    let fileName = JSON.stringify(path.relative(context,request));
                    return toConstantDependency(fileName).call(this, expr);
                });
            };
            if (semver.gt(version, '2.0.0')) {
                params.normalModuleFactory.plugin('parser', compatiableParer);
            } else {
                compatiableParer(compiler.parser);
            }
        });
    }
}
module.exports = CodeLinePlugin;