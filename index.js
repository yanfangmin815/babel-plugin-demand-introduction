const t = require('@babel/types');
const chalk = require('chalk');
const log = console.log;
const warning = chalk.bold.blue;

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
                    throw path.buildCodeFrameError("libraryname is required")
                }
                if (Object.is(path.node.source.value, opts.libraryName)) {
                    if (opts && !opts.libraryDirectory) {
                        opts.libraryDirectory = 'lib'
                        log()
                        log(warning('warning:Librarydirectory will be defaulted to lib, please confirm whether it is suitable'));
                    }
                    if (opts && opts.style || opts.styleCustom || opts.styleLibraryDirectory) {
                        isStyle = true
                    }
                    const { libraryName, libraryDirectory } = opts
                    const specifiers = path.node.specifiers
                    const len = specifiers.length
                    let typesArrs = []
                   
                    // new path.node.specifiers.length 个ImportDeclaration语句：引入组件&引入样式文件
                    // 注意：try...catch放到for循环体内外的区别
                    try {
                        if (!len) {
                            path.remove()
                            return
                        }
                        // 不能包含默认导入和命名空间导入
                        if (specifiers.some(i => t.isImportDefaultSpecifier(i) || t.isImportNamespaceSpecifier(i))) {
                            throw path.buildCodeFrameError("不能使用默认导入或命名空间导入")
                        }
                        for (let i=0; i<len; i++) {
                            const specifiersName = specifiers[i].imported.name
                            // 开启类tree-shaking效果，未引用变量不处理
                            if (path.scope.bindings[specifiersName].references) {
                                let importDeclarationComponent = ''
                                let importDeclarationStyle = ''
                                const stringLiteralComponent = `${libraryName}/${libraryDirectory}/${getLowerCase(specifiersName)}`
                                const importDefaultSpecifier = t.importDefaultSpecifier(t.identifier(specifiersName))
                                importDeclarationComponent = getImportDeclaration([importDefaultSpecifier], stringLiteralComponent)
                                if (isStyle) {
                                    // if opts.style && opts.styleCustom exist throw err 
                                    if (opts.style && opts.styleCustom && opts.styleLibraryDirectory) {
                                        throw path.buildCodeFrameError("style or styleCustom or styleLibraryDirectory can only have one, but received two")
                                    }
                                    let stringLiteralStyle = ''
                                    if (opts.style) {
                                        stringLiteralStyle = `${libraryName}/${libraryDirectory}/${getLowerCase(specifiersName)}/style/${opts.style}`
                                    }
                                    if (opts.styleCustom) {
                                        stringLiteralStyle = `${libraryName}/${eval(opts.styleCustom)(getLowerCase(specifiersName))}`
                                    }
                                    if (opts.styleLibraryDirectory) {
                                        stringLiteralStyle = `${libraryName}/${opts.styleLibraryDirectory}/${getLowerCase(specifiersName)}`
                                    }
                                    importDeclarationStyle = getImportDeclaration([], stringLiteralStyle)
                                }
                                typesArrs.push(importDeclarationComponent, importDeclarationStyle)
                            }
                        } 
                    } catch (error) {
                        throw path.buildCodeFrameError(error)
                    } finally {
                        typesArrs.length ? path.replaceWithMultiple(typesArrs) : ''
                    }
                }           
            }
        }
    }
}