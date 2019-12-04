This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

```bash
$ yarn start

$ yarn build
```

# single-spa 引入react项目

这里 主要讲解 使用 create-react-app 创建的项目

手动使用 webpack 搭建的项目 原理一样

### 创建项目 `react-app`

默认创建好了

弹出 webpack 配置

```bash
$ npm run eject
```

为了防止与其他项目冲突，修改默认 端口号 为 3500

react-app/scripts/start.js
```js
// Tools like Cloud9 rely on this.
// const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3500;
```

### react-app 配置 single-spa-react

根据 [官方文档 react](https://single-spa.js.org/docs/ecosystem-react)

安装 single-spa-react

```bash
# 进入 react-app
$ cd react-app
# install
$ npm install --save single-spa-react

# 创建 root.app.js 用于存放之前
# 在 src/index.js 引入的文件

$ touch src/root.app.js
```

`src/index.js` 修改之前
```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

```

根据文档 继续修改 `src/index.js`

```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

import singleSpaReact from 'single-spa-react';
function domElementGetter() {
    return document.getElementById('cra');
}
const reactLifecycles = singleSpaReact({
    React,
    ReactDOM,
    rootComponent: App,
    domElementGetter
});

export const bootstrap = [reactLifecycles.bootstrap];
export const mount = [reactLifecycles.mount];
export const unmount = [reactLifecycles.unmount];
```

### 修改webpaack配置

`config/webpack.config.js` output 字段中添加 
    library: 'cra'
    libraryTarget: 'amd'

```js
module.exports = function (webpackEnv) {
    // ...
    return {
        // ...
        output: {
            // The build folder.
            path: isEnvProduction ? paths.appBuild : undefined,
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isEnvDevelopment,
            // There will be one main bundle, and one file per asynchronous chunk.
            // In development, it does not produce real files.
            filename: isEnvProduction ?
                'static/js/[name].[contenthash:8].js'
                : isEnvDevelopment && 'static/js/bundle.js',

            library: 'cra',
            libraryTarget: 'amd',
            // ...

} 
```

根据 config/webpack.config.js 中的 output 下的filename
得知开发环境下的出口文件是 `static/js/bundle.js`
即 通过此URL 可以得到 `http://localhost:3500/static/js/bundle.js`

![11-react-app-static-js-bundle.js.png](./imgs/11-react-app-static-js-bundle.js.png)


修改完上面的配置 需要重新启动项目


### 在入口html文件中引入 cra 项目

index.html head 

```html
<script type="systemjs-importmap">
    {
        "imports": {
            "navbar": "http://localhost:8800/app.js",
            "cra": "http://localhost:3500/static/js/bundle.js",
            "single-spa": "http://localhost:9500/node_modules/single-spa/lib/system/single-spa.min.js"
        }
    }
</script>
```
body
```html
<body>
    <script>
        (function() {
            Promise.all([
                System.import('single-spa')
            ]).then(function(modules) {

                const singleSpa = modules[0];

                singleSpa.registerApplication(
                    'navbar',
                    () => System.import('navbar'),
                    location => true
                );
                singleSpa.registerApplication(
                    'cra',
                        () =>  System.import('cra'),
                    location => location.pathname.startsWith('/cra')
                );

                singleSpa.start();
            });
        })();
    </script>
    <!-- See https://github.com/joeldenning/import-map-overrides#user-interface  -->
    <import-map-overrides-full
    show-when-local-storage="overrides-ui"
    ></import-map-overrides-full>
    <div id="navbar"></div>
    <div id="cra"></div>
</body>
```

问题： 不管怎么切换顶部 navbar 路由 不触发 react-app ，也没用报错

![13-not-import-react-app.png](./imgs/13-not-import-react-app.png)

写一个 log

```js
singleSpa.registerApplication(
    'react-app',
    () => System.import('react-app'),
    location => {
        const d = location.pathname.startsWith('/react-app');
        console.log('location.pathname', location.pathname);
        console.log('d', d);
        return d;
    }
);
```

![log](./imgs/14-log-location-pathname.png)

由上可以知道 navbar 的route需要改为 history 模式

navbar/router/index.js

```js

import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/home/index';

Vue.use(Router);

// 创建路由实例
const createRouter = () =>
    new Router({
        // mode: 'hash',
        mode: 'history',
```

![15-log-error-cors.png](./imgs/15-log-error-cors.png)

又遇到 react-app 跨域问题
解决方法：
进入 `react-app/config/webpackDevServer.config.js` 文件
添加 headers `'Access-Control-Allow-Origin': '*'`

```js
// Enable HTTPS if the HTTPS environment variable is set to 'true'
https: protocol === 'https',
headers: {
    'Access-Control-Allow-Origin': '*'
},
host,
overlay: false,
historyApiFallback: {
    // Paths with dots should still use the history fallback.
    // See https://github.com/facebook/create-react-app/issues/387.
    disableDotRule: true,
},
```
![16-log-error-cors-resolve.png](./imgs/16-log-error-cors-resolve.png)

重新 react-app 启动项目, 刷新 `http://localhost:9500/`

报错~~~~
[github issues](https://github.com/CanopyTax/single-spa/issues/325)

问题没有解决， 被关闭了：`Closing due to staleness and also this appears to just be a configuration issue with CRA projects and not a bug in single-spa itself.`
`由于过时而关闭，而且这似乎只是CRA项目的配置问题，而不是单个spa本身的错误。`
