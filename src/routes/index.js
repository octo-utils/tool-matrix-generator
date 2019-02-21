/* Created by tommyZZM.OSX on 2019/2/15. */
"use strict";
import Vue from "vue";
import style from "./index.scss"
import IconPlane from "../assets/clone-regular.svg"
import IconCube from "../assets/cube-regular.svg"

export default Vue.extend({
  render() {
    return <div class={style('index')}>
      <router-link to="/space2d" class={style({
        ['btn-index']: true,
        left: true,
        // disabled: false,
      })} title={'2D Space Transform Matrix(3x3)'}>
        <i class={style('icon')}><IconPlane/></i>
        <span>2D(3x3)</span>
      </router-link>
      <div class={style({
        ['btn-index']: true,
        right: true,
        disabled: true,
      })} title={'3D Space Transform Matrix(4x4)'}>
        <i class={style('icon')}><IconCube/></i>
        <span>3D(4x4)</span>
      </div>
    </div>
  }
})
