/* Created by tommyZZM.OSX on 2019/2/20. */
"use strict";
import Vue from "vue"
import style from "./slider.scss"
import Decimal from "decimal.js"

export default Vue.extend({
  props: {
    min: {
      default: 0
    },
    max: {
      default: 10
    },
    precision: {
      default: 1
    },
    value: {
      default: 0
    },
    transitionDuration: {
      default: 200
    },
  },
  data() {
    return {
      positionIndexIntl: 0,
      valueIntl: this.min,
      widthProgressBar: 0,
      ratioFinalIntl: 0,
      isDragging: false,
      draggingBeginMouseX: 0,
      draggingBeginLeft: 0,
      draggingMaxLeft: 0,
      onDocumentMouseMove: null,
      onDocumentMouseUp: null,
      styleHandlerPosition: {
        left: 0,
      }
    }
  },
  computed: {
    handlerRelativePositions() {
      const { min, max, precision } = this;
      const count = (max - min)/precision;
      let arr = [];
      for (let i = 0; i < (count + 1); i++) {
        arr.push(new Decimal(precision).times(i).add(min).toNumber());
      }
      return arr;
    }
  },
  methods: {
    onStartDrag(event) {
      if (event.button !== 0) {
        return;
      }

      const { handler, bar } = this.$refs;
      const barRect = bar.getBoundingClientRect();
      const handlerRect = handler.getBoundingClientRect();

      const handlerOffsetLeft = handlerRect.left - barRect.left;
      const { clientX } = event;

      this.draggingBeginLeft = handlerOffsetLeft;
      this.draggingBeginMouseX = clientX;
      this.draggingMaxLeft = barRect.width;

      this.isDragging = true;

      this.onDocumentMouseMove = e => this.onDragging(e)
      this.onDocumentMouseUp = e => this.onEndDrag(e)
      document.addEventListener('mousemove', this.onDocumentMouseMove);
      document.addEventListener('mouseup', this.onDocumentMouseUp);
    },
    onDragging(event) {

      if (!this.isDragging) return;

      const { bar } = this.$refs;
      const barRect = bar.getBoundingClientRect();

      event.preventDefault();

      const { clientX } = event;
      const dleft = clientX - this.draggingBeginMouseX;
      const currentLeft = Math.max(0, Math.min(this.draggingMaxLeft, (this.draggingBeginLeft + dleft)));

      const pieces = this.handlerRelativePositions.length;
      // const pieceWidth = barRect.width / pieces;
      const ratio = currentLeft / barRect.width;

      let indexOfPositions = Math.round(pieces * ratio);//Math.round(pieces * ratio);
      if (indexOfPositions > pieces - 1) {
        indexOfPositions = pieces - 1;
      }

      const nextValueIntl = this.handlerRelativePositions[indexOfPositions];

      if (nextValueIntl !== this.valueIntl) {
        this.$emit('input', nextValueIntl);
      }

      this.positionIndexIntl = indexOfPositions;
      this.valueIntl = nextValueIntl;
      this.ratioFinalIntl = indexOfPositions / (pieces - 1);
      this.widthProgressBar = currentLeft;
      this.styleHandlerPosition = {
        ...this.styleHandlerPosition,
        transform: `translateX(${currentLeft+ 'px'})`
      };
    },
    onEndDrag() {
      document.removeEventListener('mousemove', this.onDocumentMouseMove);
      document.removeEventListener('mouseup', this.onDocumentMouseUp);
      this.isDragging = false;

      Vue.nextTick(_ => {
        const { bar } = this.$refs;
        const barRect = bar.getBoundingClientRect();

        const pieces = this.handlerRelativePositions.length;
        const pieceWidth = barRect.width / pieces;

        const finalLeft = (barRect.width) * this.ratioFinalIntl;
        this.widthProgressBar = finalLeft;

        this.styleHandlerPosition = {
          ...this.styleHandlerPosition,
          transform: `translateX(${finalLeft + 'px'})`,
        };
      })
    }
  },
  render() {
    const { isDragging, positionIndexIntl, valueIntl, widthProgressBar } = this;
    const slotsBar = this.$scopedSlots.bar({width: widthProgressBar}) || [];
    const slotsHandler = this.$scopedSlots.handler({
      isDragging,
      positionIndex: positionIndexIntl,
      value: valueIntl
    }) || [];

    const transitionDuration = this.isDragging ? '0ms' : this.transitionDuration + 'ms'

    return <div class={style('component')}>
      <div class={style('content')}>
        <div class={style('slider-bar')}
             style={{transitionDuration}}
             ref={'bar'}
             onMouseup={this.onEndDrag}>
          <div class={style('slider-bar-slot')}>{[...slotsBar]}</div>
          <div class={style({'slider-handler': true, 'dragging': this.isDragging})}
               style={{...this.styleHandlerPosition, transitionDuration}}
               ref={'handler'}
               onMousedown={this.onStartDrag}>
            <div>{[...slotsHandler]}</div>
          </div>
        </div>
      </div>
    </div>
  }
});
