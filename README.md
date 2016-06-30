### webpack多页面配置

> 支持es6 + react + less

### Installation

> 下载后 `npm i` 即可

### 命令

> `npm run build` 会把当前文件下的build目录删除 重新创建一个build目录

> `npm start` 启动当前的页面

### 规则

> src目录下的html文件要与 src/js下的.js文件的名字一样,这样保证可以正常调用到每个不同页面的js。

> src/js目录下的其他文件夹里的js不会被webpack压缩,也不会被webpack输出。