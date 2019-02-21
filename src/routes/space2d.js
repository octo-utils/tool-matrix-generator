/* Created by tommyZZM.OSX on 2019/2/15. */
"use strict";
import Vue from "vue";
import style from "./space2d.scss"
import Slider from "../components/slider"
import pascalCase from "pascal-case"
import { mat3 } from "gl-matrix"
import IconPlay from "../assets/play-solid.svg"
import IconStop from "../assets/stop-solid.svg"

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
      boxSkew: 0,
      boxScale: 1,
      boxTransformMatrix: null,
      boxCurrentDuration: 0,
      boxCurrentTransform: null,
      boxResultTransform: null,
    }
  },
  computed: {
    boxTransformMatrixForCss() {
      const m = mat3.fromValues(...IDENTITY_MATRIX_3x3);
      mat3.translate(m, m, [this.boxTranslateX, this.boxTranslateY]);

      mat3.rotate(m, m, this.boxRotate * Math.PI / 180);
      mat3.scale(m, m, [this.boxScale, this.boxScale]);
      mat3.transpose(m, m);

      this.boxTransformMatrix = Array.from(m);

      const [a, c, e, b, d, f] = m;
      // const [
      //   a, b, i,
      //   c, d, ii,
      //   e, f, iii
      // ] = m

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

    const resultText = this.boxTransformMatrix.join(",");

    return <div class={style('page')}>
      <div class={style('content')}>
        <div class={style('head')}>
          <div onClick={this.navigateBack} class={style('btn-back')}>Back</div>
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
              <div class={style("form-item-transition")}>
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
              <label>
                <div class={style("title", "name")}>
                  <span>Skew</span>
                </div>
                <input onInput={this.shouldUpdateBox('skew')}
                       value={this.boxSkew}
                       class={style('input')} type={'text'}/>
              </label>
            </div>
            <div class={style('form-item')}>
              <label>
                <div class={style("title", "name")}>
                  <span>Scale</span>
                </div>
                <input onInput={this.shouldUpdateBox('scale')}
                       value={this.boxScale}
                       class={style('input')} type={'text'}/>
              </label>
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
            <span>{resultText}</span>
          </div>
        </div>
      </div>
    </div>
  }
})
