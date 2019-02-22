/* Created by tommyZZM.OSX on 2019/2/15. */
"use strict";
import Vue from "vue"
import style from "./index.scss"
import createStore from "./store"
import VueRouter from "vue-router"
import Index from "./routes/index"
import Space2d from "./routes/space2d"
// import "katex/dist/katex.css"
import "ant-design-vue/lib/tooltip/style"

export function entry() {

  const routes = [
    { path: '/', component:Index },
    { path: '/space2d', component: Space2d },
    { path: '*', redirect: '/' }
  ]

  const router = new VueRouter({
    routes
  })

  const store = createStore(router);

  new Vue({
    el: "#app",
    store,
    router,
    render() {
      return <div class={style('app')}>
        <transition name="transition-app" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    }
  })
}
