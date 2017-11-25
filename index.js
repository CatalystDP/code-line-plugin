const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const NullFactory = require('webpack/lib/NullFactory');
const semver = require('semver');
const path = require('path');
const version=require('webpack/package.json').version;

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
        // this.lineName = opts.lineName || '__LINE__';
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
            let compatiableParer = parser => {
                // parser.plugin('expression ' + this.lineName, function (expr) {
                //     let line = JSON.stringify(expr.loc.start.line + '');//get line num
                //     return toConstantDependency(line).call(this, expr);
                // });
                parser.plugin('expression ' + this.fileName, function (expr) {
                    let context = compiler.options.context,
                        request = this.state.current.rawRequest;
                    let fileName = path.relative(context, request);
                    fileName = JSON.stringify(fileName || '');

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