const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const NullFactory = require('webpack/lib/NullFactory');
const semver = require('semver');
const path = require('path');
const version = require('webpack/package.json').version;
const sourceMap = require('source-map');
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
        compiler.plugin('compilation', (compilation, params) => {
            if (!compilation.dependencyFactories.get(ConstDependency) instanceof NullFactory) {
                compilation.dependencyFactories.set(ConstDependency, new NullFactory());
            }
            if (!compilation.dependencyTemplates.get(ConstDependency) instanceof ConstDependency.Template) {
                compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
            }
            compilation.plugin('build-module', function (module) {
                module._linesCollection = [];//记录module的当前的行号数组
            });
            compilation.plugin('succeed-module', function (module) {
                //根据_linesCollection 获取到原始代码行
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
                return true;
            });
            let compatiableParer = parser => {
                parser.plugin('expression ' + this.lineName, function (expr) {
                    let line = expr.loc.start.line;//get line num
                    this.state.current._linesCollection.push(expr);
                    return true;
                });
                parser.plugin('expression ' + this.fileName, function (expr) {
                    let context = compiler.options.context||process.cwd();
                    let request = this.state.current.request;
                    let fileName = JSON.stringify(path.relative(context,request));
                    return toConstantDependency(fileName).call(this, expr);
                });
            };
            if (semver.gt(version, '2.0.0')) {
                console.log('gt 2.0');
                params.normalModuleFactory.plugin('parser', compatiableParer);
            } else {
                console.log('lt 2.0');
                compatiableParer(compiler.parser);
            }
        });
    }
}
module.exports = CodeLinePlugin;