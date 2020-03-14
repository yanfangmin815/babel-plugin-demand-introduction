const t = require('@babel/types');

module.exports = function(babel) {
    function getLowerCase(str) {
        return str.toLowerCase()
    }
    function getImportDeclaration(specifiers, stringLiteralComponent) {
        return t.importDeclaration(specifiers, t.stringLiteral(stringLiteralComponent) )
    }
    return {
        visitor: {
            ImportDeclaration(path, { opts }) {
                let isStyle = false
                // 如果需要获取参数可以使用opts
                if (opts && !opts.libraryName) {
                    throw 'libraryname is required'
                }
                if (Object.is(path.node.source.value, opts.libraryName)) {
                    // console.log(path.scope.bindings.Table.references, '>>>>>>>>>>>>>>>>>')
                    if (opts && !opts.libraryDirectory) {
                        opts.libraryDirectory = 'lib'
                    }
                    if (opts && opts.style || opts.styleCustom) {
                        isStyle = true
                    }
                    const { libraryName, libraryDirectory } = opts
                    const specifiers = path.node.specifiers
                    const len = specifiers.length
                    let typesArrs = []
                   
                    // new path.node.specifiers.length 个ImportDeclaration语句：引入组件&引入样式文件
                    for (let i=0; i<len; i++){
                        const specifiersName = specifiers[i].imported.name
                        // 开启类tree-shaking效果，未引用变量不处理
                        if (path.scope.bindings[specifiersName].references) {
                            const stringLiteralComponent = `${libraryName}/${libraryDirectory}/${getLowerCase(specifiersName)}`
                            const importDefaultSpecifier = t.importDefaultSpecifier(t.identifier(specifiersName))
                            let importDeclarationComponent = ''
                            let importDeclarationStyle = ''
                            importDeclarationComponent = getImportDeclaration([importDefaultSpecifier], stringLiteralComponent)
                            if (isStyle) {
                                // if opts.style && opts.styleCustom exist throw err 
                                if (opts.style && opts.styleCustom) {
                                    throw 'opts.style or opts.styleCustom can only have one, but received two'
                                }
                                let stringLiteralStyle = ''
                                if (opts.style) {
                                    stringLiteralStyle = `${libraryName}/${libraryDirectory}/${getLowerCase(specifiersName)}/style/${opts.style}`
                                }
                                if (opts.styleCustom) {
                                    stringLiteralStyle = `${libraryName}/${eval(opts.styleCustom)(getLowerCase(specifiersName))}`
                                }
                                importDeclarationStyle = getImportDeclaration([], stringLiteralStyle)
                            }
                            typesArrs.push(importDeclarationComponent, importDeclarationStyle)
                        }
                    }
                    path.replaceWithMultiple(typesArrs)
                }           
            }
        }
    }
}