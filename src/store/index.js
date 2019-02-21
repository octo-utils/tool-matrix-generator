/* Created by tommyZZM.OSX on 2019/2/15. */
"use strict";
import Vue from "vue"
import Vuex from "vuex"

export { mapState } from "vuex"

Vue.use(Vuex);

export default function (router) {
  return new Vuex.Store({
    state: {}
  })
}

