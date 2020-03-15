
## Usage 使用
> .babelrc文件配置
```js
 "plugins": [
        ...
        // styleCustom or style, not both
        [ "lib", {
            "libraryName": "i-mayfly",
            "libraryDirectory": "lib/component",
            "styleCustom": "(item) => 'lib/sass/'+ item + '/index.scss'",
            // "styleLibraryDirectory": "lib/sass"
            // "style": "css"
        }],
        ...
    ]
```

## Example 示例
```js
 import { Table } from 'i-mayfly';

 > [ "lib", {
        ...
        "styleCustom": "(item) => 'lib/sass/'+ item + '/index.scss'"
    }]

    import Table from 'i-mayfly/lib/component/table'
    import 'i-mayfly/lib/sass/table/index.scss'

 > [ "lib", {
        ...
        "style": "css"
    }]

    import Table from 'i-mayfly/lib/component/table'
    import 'i-mayfly/lib/sass/table/style/css.js' 
    
 > [ "lib", {
        ...
        "styleLibraryDirectory": "lib/sass"
    }]

    import Table from 'i-mayfly/lib/component/table'
    import 'i-mayfly/lib/sass/table' 
```

## Other 其他
> 开启tree-shaking，同一文件中未引用的变量不做处理