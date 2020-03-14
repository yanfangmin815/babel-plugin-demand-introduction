
## Usage 使用
> .babelrc文件配置
```js
 "plugins": [
        ...
        // styleCustom or style, not both
        [ "lazy-import", {
            "libraryName": "i-mayfly",
            "libraryDirectory": "lib/component",
            "styleCustom": "(item) => 'lib/sass/'+ item + '/index.scss'",
            // "style": "css"
        }],
        ...
    ]
```

## Example 示例
```js
 import { Table } from 'i-mayfly';

 1. [ "lazy-import", {
        ...
        "styleCustom": "(item) => 'lib/sass/'+ item + '/index.scss'"
    }]

    import Table from 'i-mayfly/lib/component/table'
    import 'i-mayfly/lib/sass/table/index.scss'

 2. [ "lazy-import", {
        ...
        "style": "css"
    }]
    
    import Table from 'i-mayfly/lib/component/table'
    import 'i-mayfly/lib/sass/table/style/css.js'  
```