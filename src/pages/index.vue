<script setup lang="ts">
import type { GraphData } from '@antv/g6'
import { Graph, NodeEvent } from '@antv/g6'

import { onUnmounted } from 'vue'
import { generateNodeData, getId } from './utils'

defineOptions({
  name: 'IndexPage',
})

const name = ref('')
// 图表容器引用
const chartRef = ref(null)
// 图表实例
let chart: Graph | null = null
const historyList = ref<{ name: string, data: GraphData }[]>([])
const isErr = ref(false)

function handleHistory(name: string, data: GraphData) {
  const index = historyList.value.findIndex(e => e.name === name)

  if (index > -1) {
    historyList.value = historyList.value.slice(0, index + 1)
  }
  else {
    historyList.value = [...historyList.value, { name, data }]
  }
}

function go(id?: string) {
  const nodeName = id ? getId(id) : name.value.trim()
  if (!id) {
    historyList.value = []
  }
  const nodeData = generateNodeData(nodeName)

  if (!nodeData) {
    isErr.value = true
    return
  }
  isErr.value = false

  handleHistory(nodeName, nodeData)
  renderGraph(nodeData)
}

useHead({
  title: () => '深海迷航小厨房',
})

function handleNodeClick(e) {
  const node = e.target
  go(node.id)
}
async function renderGraph(data?: GraphData) {
  if (chart) {
    chart.destroy()
  }
  // 首次创建实例
  chart = new Graph({
    container: 'container',
    data,
    padding: 30,
    plugins: [
      {
        type: 'tooltip',
        // 只对节点启用，边不显示tooltip
        enable: e => e.targetType === 'node',
        getContent: (e, items) => {
          const d = items[0]
          const path = d.data.path ? `<div style="font-size: 20px; margin: 0 0 4px 0;">${d.data.path}</div>` : ''

          return `<div style="font-size: 20px;">${d.data.label}</div>
          ${path}`
        },
        style: {
          '.tooltip': {
            background: '#121212',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: '200px',
            color: '#00f7ffc2',
            padding: '12px',
            fontSize: '24px',
            border: '1px solid #00f7ffc2',
          },
        },
      },
    ],
    node: {
      type: 'rect',
      style: {
        size: 60,
        fill: '#121212',
        stroke: '#00f7ff9e',
        lineWidth: 1,
        cursor: 'pointer',
        label: true,
        labelText: d => d.data.label,
        labelBackground: true,
        labelPadding: [10, 10],
        labelBackgroundOpacity: 0,
        labelPlacement: 'center',
        labelWordWrap: true,
        labelMaxWidth: '90%',
        labelMaxLines: 3,
        radius: 1,
        labelTextOverflow: 'ellipsis',
        labelFill: '#00f7ffc2',
        labelTextAlign: 'center',
      },
    },
    edge: {
      type: 'polyline',
      style: {
        router: { type: 'orth' },
        stroke: '#00f7ff',
      },
    },
    layout: { type: 'dagre' },
    autoFit: 'view',
    behaviors: ['zoom-canvas', 'collapse-expand', 'drag-canvas'],
  })
  chart.render()
  // 监听节点点击事件
  chart.on(NodeEvent.CLICK, handleNodeClick)
}

// 组件卸载时仍需清理
onUnmounted(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<template>
  <TheBackground />

  <div flex flex-1 flex-col overflow-hidden>
    <div relative flex items-center px-6 :class="`content-auto beveled-glow ${historyList.length ? 'justify-between' : 'flex-1 flex-col justify-center w-full h-full'}`">
      <div flex items-center justify-center>
        <div i-carbon:quotes inline-block h-8 w-8 class="text-[#00f7ff]" text-op-80 />
        <div ml-2 opacity-80>
          【深海迷航-百川归海】 小厨房
        </div>
      </div>

      <div my-6>
        <div>
          <TheInput
            v-model="name"
            placeholder="输入物品名称回车搜索，如：釉瓷玻璃"
            autocomplete="false"
            @keydown.enter="() => go()"
          />
          <button class="ml-2 border border-[#00f7ff] rounded-1 bg-transparent px-6 py-2 text-[#00f7ff] transition-all hover:bg-[#00f7ff]/10" @click="() => go()">
            查找
          </button>
        </div>
        <div v-if="isErr">
          ops！这个物品不在我的知识范围内~(￣▽￣)~*
        </div>
      </div>
      <div flex items-center opacity-75>
        <em>关注B站<a font-bold underline class="text-[#00f7ff]" href="https://space.bilibili.com/22022022" target="_blank">SilentXo</a>，一起换游戏呀！</em>
        <div class="text-[#00f7ff]" i-carbon:quotes ml-2 inline-block h-8 w-8 rotate-180 text-op-80 />
      </div>
    </div>

    <div v-if="historyList.length" class="beveled-glow" my-4 flex items-center justify-center p-4>
      <span i-carbon:road-weather mr-1 inline-block text-op-80 class="text-[#00f7ff]" />
      <span>历史记录: </span>
      <span v-for="(item, index) in historyList" :key="item.name">
        <span px-1>{{ index > 0 ? '/' : '' }}</span>
        <span cursor-pointer underline class="hover:text-[#00f7ff]" @click="() => go(item.name)">{{ item.name }}</span>
      </span>
    </div>

    <div v-if="historyList.length" relative h-full w-full flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2 bg-op-90 class="beveled-glow">
      <div id="container" ref="chartRef" h-full w-full flex-1 />
    </div>
  </div>
  <em righ-0 absolute bottom-0 left-0 scale-50 text-sm opacity-90>本网页为非官方辅助工具，所涉及游戏数据均源于公开的游戏内容，仅用于帮助玩家更便捷地查询游戏信息</em>
</template>

<route lang="yaml">
meta:
  layout: home
</route>

<style lang="css">
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
  .beveled-glow {
    position: relative;
    overflow: hidden;
  }
  .beveled-glow::before {
    content: '';
    position: absolute;
    inset: -2px;
    z-index: 0;
    pointer-events: none;
    /* 斜角剪裁路径 */
    clip-path: polygon(
      15px 0,
      calc(100% - 15px) 0,
      100% 15px,
      100% calc(100% - 15px),
      calc(100% - 15px) 100%,
      15px 100%,
      0 calc(100% - 15px),
      0 15px
    );
    /* 发光效果 - 使用 UnoCSS 变量或直接定义颜色 */
    box-shadow:
      0 0 10px #00f7ff,
      0 0 20px #00f7ff,
      0 0 30px #00f7ff,
      inset 0 0 10px #00f7ff;
    transition: all 0.3s ease;
  }
  .beveled-glow:hover::before {
    pointer-events: none;
    box-shadow:
      0 0 15px #b300ff,
      0 0 30px #b300ff,
      0 0 45px #b300ff,
      inset 0 0 15px #b300ff;
  }
  .content-above {
    position: relative;
    z-index: 1;
  }
}
</style>
