import type { EdgeData, NodeData } from '@antv/g6'
import { data } from './const'

export interface Atom {
  name: string
  /** 父级节点 */
  parent: string
  /** 节点路径 */
  path: string
  /** 配方，可能有多个 */
  recipe: { material: string, quantity: string }[][],
}

function generateCategory() {
  // 按行拆分CSV
  const lines = data.split('\n').filter(line => line.trim() !== '')
  const atomMap: Record<string, Atom> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line)
      continue

    const columns = line.split(',')
    if (columns.length < 3) {
      console.warn(`跳过无效行 (列数不足): ${line}`)
      continue
    }
    const categoryTree = columns[0].split('/')
    const atom = columns[1].replaceAll(' ', '')
    const recipe = columns[2].split('|').map((item) => {
      const [material, quantity] = item.split(' x ')
      return { material, quantity }
    })

    if (atomMap[atom]) {
      atomMap[atom].recipe.push(recipe)
    }
    else {
      atomMap[atom] = {
        name: atom,
        parent: categoryTree[categoryTree.length - 1],
        path: columns[0],
        recipe: [recipe],
      }
    }
  }
  return atomMap
}

const source = generateCategory()
const SPLIT_SYMBOL = '@_@'

function generateNodeData(name: string): { nodes: NodeData[], edges: EdgeData[] } | null {
  const atomData = source[name]
  if (!atomData)
    return null

  const nodeList: NodeData[] = []
  const edges: EdgeData[] = []

  // 生成唯一的节点ID
  const id = atomData.name

  // 添加当前节点
  nodeList.push({
    id,
    data: {
      label: atomData.name,
      path: atomData.path,
    },
  })

  // 处理配方
  const len = atomData.recipe.length
  if (len > 1) {
    // 多配方情况下，创建配方节点
    for (let i = 0; i < len; i++) {
      const recipeName = `配方${i + 1}`
      const recipeId = `${id}${SPLIT_SYMBOL}${recipeName}`

      // 添加配方节点
      nodeList.push({
        id: recipeId,
        data: {
          label: recipeName,
        },
      })

      // 添加从当前节点到配方节点的边
      edges.push({
        source: id,
        target: recipeId,
      })
      atomData.recipe.forEach((e, i) => {
        e.forEach((m) => {
          const currentId = `${recipeId}${SPLIT_SYMBOL}${i}${SPLIT_SYMBOL}${m.material}`
          nodeList.push({
            id: currentId,
            data: {
              label: `${m.material}x${m.quantity}`,
            },
          })
          edges.push({
            source: recipeId,
            target: currentId,
          })
        })
      })
    }
  }
  else if (len === 1) {
    atomData.recipe.forEach((e) => {
      
      e.forEach((m) => {
        const node = source[m.material];
        nodeList.push({
          id: m.material,
          data: {
            label: `${m.material}x${m.quantity}`,
            path: node?.path,
          },
        })
        edges.push({
          source: id,
          target: m.material,
        })
      })
    })
  }

  return { nodes: nodeList, edges }
}

function getId(str: string) {
  const arr = str.split(SPLIT_SYMBOL)
  return arr[arr.length - 1]
}

export { generateNodeData, getId }
