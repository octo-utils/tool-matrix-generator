/* Created by tommyZZM.OSX on 2019/2/15. */
"use strict";
import Vue from "vue";
import style from "./space2d.scss"
import Slider from "../components/slider"
import pascalCase from "pascal-case"
import { mat3 } from "gl-matrix"
import { skewMat3 } from "../util/matrix-skew";
import IconPlay from "../assets/play-solid.svg"
import IconStop from "../assets/stop-solid.svg"
import IconCopy from "../assets/copy-regular.svg"
import Katex from "../components/katex"
import copy from 'copy-to-clipboard';
import AntdToolTip from "ant-design-vue/lib/tooltip"
// import Decimal from "decimal.js"

const IDENTITY_MATRIX_3x3 = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
]

export default Vue.extend({
  data() {
    return {
      isPlaying: false,
      durationPlay: 600,
      canvasViewportScale: 1,
      boxTranslateX: 0,
      boxTranslateY: 0,
      boxRotate: 0,
      boxSkewX: 0,
      boxSkewY: 0,
      boxScaleX: 1,
      boxScaleY: 1,
      boxTransformMatrix: null,
      boxCurrentDuration: 0,
      boxCurrentTransform: null,
      boxResultTransform: null,
      isJustCopyAsPlainText: false,
      isJustCopyAsCssText: false,
      // isTransposed: false,
      // boxTransformMatrixToShow: null,
    }
  },
  computed: {
    // boxTransformMatrixToShow() {
    //   return this.boxTransformMatrix;
    // },
    boxTransformMatrixSimplify() {
      return this.boxTransformMatrix.map(n => Number(n.toFixed(3)));
    },
    boxTransformMatrixForCss() {
      const m = mat3.fromValues(...IDENTITY_MATRIX_3x3);
      mat3.translate(m, m, [this.boxTranslateX, this.boxTranslateY]);

      mat3.rotate(m, m, this.boxRotate * Math.PI / 180);
      mat3.scale(m, m, [this.boxScaleX, this.boxScaleY]);
      skewMat3(m, m, [this.boxSkewX, this.boxSkewY])
      mat3.transpose(m, m);

      this.boxTransformMatrix = Array.from(m);

      const [a, c, e, b, d, f] = m;

      return [a, b, c, d, e, f];
    }
  },
  watch: {
    boxTransformMatrixForCss(value) {
      const cssMatrix = `matrix(${value.join(",")})`;
      this.boxResultTransform = cssMatrix;
      this.boxCurrentTransform = cssMatrix;
    }
  },
  methods: {
    resetParameters() {
      this.boxTranslateX = 0;
      this.boxTranslateY = 0;
      this.boxRotate = 0;
      this.boxSkewX = 0;
      this.boxSkewY = 0;
      this.boxScaleX = 1;
      this.boxScaleY = 1;
    },
    onTranspose() {},
    onCopyAsPlainText() {
      copy(this.boxTransformMatrixSimplify.join(','))
      this.isJustCopyAsPlainText = true;
    },
    onCopyAsCssText() {
      copy(`matrix(${this.boxTransformMatrixForCss.map(n => Number(n.toFixed(3))).join(",")})`);
      this.isJustCopyAsCssText = true;
    },
    navigateBack() {
      this.$router.back();
    },
    onCanvasViewportScaleChange(value) {
      this.canvasViewportScale = value;
    },
    shouldUpdateBox(key) {
      return (event) => {
        const value = event.currentTarget.value;
        this[`box${pascalCase(key)}`] = value;
      }
    },
    onTogglePlay() {
      if ( this.isPlaying ) {
        this.isPlaying = false;
        this.boxCurrentDuration = 0;
        this.boxCurrentTransform = this.boxResultTransform;
        return;
      }

      this.boxCurrentDuration = 0;
      this.boxCurrentTransform = null;
      this.isPlaying = true;

      Vue.nextTick(_ => {
        requestAnimationFrame(_ => {
          this.boxCurrentDuration = this.durationPlay;
          this.boxCurrentTransform = this.boxResultTransform;
          setTimeout(_ => {
            this.isPlaying = false;
            this.boxCurrentDuration = 0;
          }, this.boxCurrentDuration);
        })
      })
    }
  },
  render() {
    const { canvasViewportScale } = this;

    const viewportScaleReciprocal = 1 / canvasViewportScale;

    // const textBoxTransformMatrix = this.boxTransformMatrix.map(n => {
    //   return Number(n.toFixed(3));
    // }).join(",");

    return <div class={style('page')}>
      <div class={style('content')}>
        <div class={style('head')}>
          <div onClick={this.navigateBack} class={style('btn-in-head')}>Back</div>
          <div onClick={this.resetParameters} class={style('btn-in-head', 'reset')}>Reset</div>
        </div>
        <div class={style('canvas-wrap')}>
          <div class={style('canvas-content')}>
            <div class={style('coordinate')} style={{
              transform: `scale(${viewportScaleReciprocal}, ${viewportScaleReciprocal})`
            }}>
              <div class={style('box-result')}
                   style={{
                     transitionDuration: this.boxCurrentDuration + 'ms',
                     transform: this.boxCurrentTransform
                   }}/>
              <div class={style('box-basic')}/>
            </div>
          </div>
          <div class={style('canvas-viewport-scale-slider')}>
            <Slider onInput={this.onCanvasViewportScaleChange}
                    min={1} max={6} precision={0.1} scopedSlots={{
              bar: (props = {}) => {
                return <div class={style('slider-bar')}>
                  <div style={{ width: props.width + 'px' }} class={style('fill')}/>
                </div>
              },
              handler: props => {
                let scale = 1 + ((props.positionIndex + 1) * 0.01)
                return <div class={style({ 'slider-bar-handler': true, 'hover': props.isDragging })}>
                  <div class={style('tool-tip')}>
                    <div><span>×</span><span>{props.value}</span></div>
                  </div>
                  <div style={{ transform: `scale3d(${scale}, ${scale}, 1)` }}
                       class={style({ 'circle': true })}/>
                </div>
              }
            }}>
            </Slider>
          </div>
        </div>
        <div class={style('parameters-edit-panel')}>
          <div class={style('form')}>
            <div class={style('form-item')}>
              <div class={style("title")}>
                <span>Transition</span>
              </div>
              <div class={style("form-item-couple")}>
                <label>
                  <span class={style("name")}>X</span>
                  <input onInput={this.shouldUpdateBox('translateX')}
                         value={this.boxTranslateX}
                         class={style('input')} type={'text'}/>
                </label>
                <label>
                  <span class={style("name")}>Y</span>
                  <input onInput={this.shouldUpdateBox('translateY')}
                         value={this.boxTranslateY}
                         class={style('input')} type={'text'}/>
                </label>
              </div>
            </div>
            <div class={style('form-item')}>
              <label>
                <div class={style("title", "name")}>
                  <span>Rotate</span>
                </div>
                <input onInput={this.shouldUpdateBox('rotate')}
                       value={this.boxRotate}
                       class={style('input')} type={'text'}/>
              </label>
            </div>
            <div class={style('form-item')}>
              <div class={style("title", "name")}>
                <span>Skew</span>
              </div>
              <div class={style("form-item-couple")}>
                <label>
                  <span class={style("name")}>X</span>
                  <input onInput={this.shouldUpdateBox('skewX')}
                         value={this.boxSkewX}
                         class={style('input')} type={'text'}/>
                </label>
                <label>
                  <span class={style("name")}>Y</span>
                  <input onInput={this.shouldUpdateBox('skewY')}
                         value={this.boxSkewY}
                         class={style('input')} type={'text'}/>
                </label>
              </div>
            </div>
            <div class={style('form-item')}>
              <div className={style("title", "name")}>
                <span>Scale</span>
              </div>
              <div class={style("form-item-couple")}>
                <label>
                  <span class={style("name")}>X</span>
                  <input onInput={this.shouldUpdateBox('scaleX')}
                         value={this.boxScaleX}
                         class={style('input')} type={'text'}/>
                </label>
                <label>
                  <span class={style("name")}>Y</span>
                  <input onInput={this.shouldUpdateBox('scaleY')}
                         value={this.boxScaleY}
                         class={style('input')} type={'text'}/>
                </label>
              </div>
            </div>
          </div>
          <div>
            <div onClick={this.onTogglePlay} class={style('btn-play')}>
              <i class={'icon'}>{this.isPlaying ? <IconStop/> : <IconPlay/>}</i>
              <span>Play</span>
            </div>
          </div>
        </div>
        <div class={style('footer')}>
          <div class={style('footer-content')}>
            <span>
              <Katex expression={generateKatexMatrixExpression(this.boxTransformMatrixSimplify)}/>
            </span>
          </div>
          <div class={style('footer-btn-group')}>
            <AntdToolTip trigger={'click'} align={{ offset: [0, 5] }}
                         onMouseleave={_ => this.isJustCopyAsPlainText = false}
                         visible={this.isJustCopyAsPlainText} placement="top">
              <template slot="title">
                <span>Copied~</span>
              </template>
              <div onClick={this.onCopyAsPlainText}
                   class={style('btn-f', 'btn-copy-as-plain-text')}>
                <i class={'icon'}><IconCopy/></i><span>plain Text</span>
              </div>
            </AntdToolTip>
            <AntdToolTip trigger={'click'} align={{ offset: [0, 5] }}
                         onMouseleave={_ => this.isJustCopyAsCssText = false}
                         visible={this.isJustCopyAsCssText} placement="top">
              <template slot="title">
                <span>Copied~</span>
              </template>
              <div title={'copy as css transform prop value \"matrix(...)\"'}
                   onClick={this.onCopyAsCssText}
                   class={style('btn-f', 'btn-copy-as-css-transform-matrix')}>
                <i class={'icon'}><IconCopy/></i><span>CSS matrix()</span>
              </div>
            </AntdToolTip>
          </div>
        </div>
      </div>
    </div>
  }
})

function generateKatexMatrixExpression(m) {
  const [
    a, c, e,
    b, d, f,
    i1, i2, i3
  ] = m;
  return `
\\begin{pmatrix}
   ${a} & ${c} & ${e} \\\\
   ${b} & ${d} & ${f} \\\\
   ${i1} & ${i2} & ${i3}
\\end{pmatrix}	
  `.trim();
}
