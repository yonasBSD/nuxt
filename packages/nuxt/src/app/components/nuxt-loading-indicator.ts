import { defineComponent, h } from 'vue'
import { useLoadingIndicator } from '../composables/loading-indicator'

export default defineComponent({
  name: 'NuxtLoadingIndicator',
  props: {
    throttle: {
      type: Number,
      default: 200,
    },
    duration: {
      type: Number,
      default: 2000,
    },
    hideDelay: {
      type: Number,
      default: 500,
    },
    resetDelay: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 3,
    },
    color: {
      type: [String, Boolean],
      default: 'repeating-linear-gradient(to right,#00dc82 0%,#34cdfe 50%,#0047e1 100%)',
    },
    errorColor: {
      type: String,
      default: 'repeating-linear-gradient(to right,#f87171 0%,#ef4444 100%)',
    },
    estimatedProgress: {
      type: Function as unknown as () => (duration: number, elapsed: number) => number,
      required: false,
    },
  },
  setup (props, { slots, expose }) {
    const { progress, isLoading, error, start, finish, clear } = useLoadingIndicator({
      duration: props.duration,
      throttle: props.throttle,
      hideDelay: props.hideDelay,
      resetDelay: props.resetDelay,
      estimatedProgress: props.estimatedProgress,
    })

    expose({
      progress, isLoading, error, start, finish, clear,
    })

    return () => h('div', {
      class: 'nuxt-loading-indicator',
      style: {
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        pointerEvents: 'none',
        width: 'auto',
        height: `${props.height}px`,
        opacity: isLoading.value ? 1 : 0,
        background: error.value ? props.errorColor : props.color || undefined,
        backgroundSize: `${(100 / progress.value) * 100}% auto`,
        transform: `scaleX(${progress.value}%)`,
        transformOrigin: 'left',
        transition: 'transform 0.1s, height 0.4s, opacity 0.4s',
        zIndex: 999999,
      },
    }, slots)
  },
})
