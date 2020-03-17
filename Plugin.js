const t = require('@babel/types');
const chalk = require('chalk');
const assert = require('assert');
const log = console.log;
const warning = chalk.bold.blue;
var reg = /style\w*/g;

function getStyleNum(context) {
   const notNull = Reflect.ownKeys(context).map((item,index) => context[item] && item)
   return notNull.join(',').match(reg).length
}

function getLowerCase(str) {
  return str.toLowerCase()
}

function getImportDeclaration(specifiers, stringLiteralComponent) {
  return t.importDeclaration(specifiers, t.stringLiteral(stringLiteralComponent) )
}

function getBuildCodeFrameError (path, msg) {
  return path.buildCodeFrameError(msg)
}

module.exports = class Plugin {
  constructor(
    libraryName,
    libraryDirectory,
    style,
    styleLibraryDirectory,
    styleCustom
  ) {
    this.libraryName = libraryName;
    this.libraryDirectory = typeof libraryDirectory === 'undefined'
      ? 'lib'
      : libraryDirectory;
    this.styleCustom = typeof styleCustom === 'undefined'
      ? false
      : eval(styleCustom);
    this.styleLibraryDirectory = styleLibraryDirectory;
    this.style = style || false;
  }

  getPluginState(state) {
    if (!state[this.pluginStateKey]) {
      state[this.pluginStateKey] = {};  // eslint-disable-line
    }
    return state[this.pluginStateKey];
  }


  ProgramEnter(path, state) {
    
  }

  ProgramExit(path, state) {

  }

  ImportDeclaration(path, { opts }) {
    let isStyle = false
    // 如果需要获取参数可以使用opts
    if (Object.is(path.node.source.value, this.libraryName)) {
        
        if (this.style || this.styleCustom || this.styleLibraryDirectory) {
            isStyle = true
        }
        const { libraryName, libraryDirectory } = this
        const specifiers = path.node.specifiers
        const len = specifiers.length
        let typesArrs = []
       
        // new path.node.specifiers.length 个ImportDeclaration语句：引入组件&引入样式文件
        // 注意：try...catch放到for循环体内外的区别
        try {
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
                        // if this.style && this.styleCustom && this.styleLibraryDirectory exist throw err 
                        if(getStyleNum(this) > 1) {
                            throw getBuildCodeFrameError(path, "style variable can only have one, but received more than one")
                        }
                        let stringLiteralStyle = ''
                        
                        if (this.style) {
                            stringLiteralStyle = `${libraryName}/${libraryDirectory}/${getLowerCase(specifiersName)}/style/${opts.style}`
                        }
                        if (this.styleCustom) {
                            stringLiteralStyle = `${libraryName}/${eval(this.styleCustom)(getLowerCase(specifiersName))}`
                        }
                        if (this.styleLibraryDirectory) {
                            stringLiteralStyle = `${libraryName}/${this.styleLibraryDirectory}/${getLowerCase(specifiersName)}`
                        }
                        importDeclarationStyle = getImportDeclaration([], stringLiteralStyle)
                    }
                    typesArrs.push(importDeclarationComponent, importDeclarationStyle)
                }
            } 
        } catch (error) {
            throw getBuildCodeFrameError(path, error)
        } finally {
            typesArrs.length ? path.replaceWithMultiple(typesArrs) : path.remove()
        }
    }           
}
}
