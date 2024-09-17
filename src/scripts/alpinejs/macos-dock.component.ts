import { checkEnableHover } from '../utils/mediaQuery'
import Alpine from 'alpinejs'
import GUI from 'lil-gui'

// Debug
const gui = new GUI()

Alpine.data('macosDock', () => {
  const dockBorder = document.querySelector('[x-ref="dockBorder"]') as HTMLLIElement
  const dockItems: NodeListOf<Element> = document.querySelectorAll('[x-refs="item"]')
  const dockItemStatus = [...dockItems].map((dockItem) => {
    return {
      dom: dockItem as HTMLLIElement,
      isHovered: false,
      isNeighbor: false,
      isSecondNeighbor: false,
    }
  })

  const config = {
    defaultScale: 1,
    hoverScale: 1.7,
    neighborScale: 1.25,
    defaultMargin: 6,
    isSecondNeighborScale: false,
    expandedMargin: 27, // (iconSize * hoverScale - iconSize) * 0.5 + defaultMargin
    iconSize: dockItems[0].getBoundingClientRect().width,
    containerSize: dockBorder.getBoundingClientRect().width,
  }

  // gui
  gui
    .add(config, 'hoverScale')
    .min(1.3)
    .max(2.3)
    .step(0.1)
    .onFinishChange((value: number) => {
      config.neighborScale = (value - 1) * 0.357 + 1
    })
  gui.add(config, 'expandedMargin').min(10).max(60).step(1)
  gui.add(config, 'defaultMargin').min(2).max(15).step(1)

  const { mqList: enableHoverMq } = checkEnableHover()
  let enableHover = enableHoverMq.matches
  enableHoverMq.addEventListener('change', (event) => {
    enableHover = event.matches
  })

  let isDockItemHovered = false
  let hoveredItemIndex = 0

  const updateSlideItems = () => {
    const {
      defaultScale,
      hoverScale,
      neighborScale,
      expandedMargin,
      defaultMargin,
      iconSize,
      containerSize,
    } = config

    // borderの横幅をscaleで広げる
    if (isDockItemHovered) {
      const addWidth = expandedMargin * 1.5 + defaultMargin * 1.5
      dockBorder.style.scale = `${(containerSize + addWidth) / containerSize} 1`
    } else {
      dockBorder.style.scale = '1 1'
    }

    for (let i = 0; i < dockItemStatus.length; i++) {
      const data = dockItemStatus[i]

      let scale = defaultScale
      let translateX = 0

      if (isDockItemHovered) {
        // hoverした要素からの距離を計算
        const distanceFromHover = hoveredItemIndex - i

        if (data.isHovered) {
          scale = hoverScale
        } else if (data.isNeighbor) {
          scale = neighborScale
          translateX = Math.sign(distanceFromHover) * -expandedMargin
        } else {
          translateX = (expandedMargin + defaultMargin) * Math.sign(distanceFromHover) * -1
        }
      }

      data.dom.style.transform = `translateX(${translateX}px) scale(${scale})`
    }
  }

  return {
    init() {},
    handleMouseEnter(event: MouseEvent) {
      if (!enableHover) return

      const target = event.currentTarget as HTMLLIElement
      hoveredItemIndex = Array.from(dockItems).indexOf(target)
      isDockItemHovered = true

      for (let i = 0; i < dockItemStatus.length; i++) {
        const item = dockItemStatus[i]
        item.isHovered = item.dom === event.currentTarget
        item.isNeighbor = Math.abs(i - hoveredItemIndex) === 1
      }

      updateSlideItems()
    },
    handleMouseLeave() {
      isDockItemHovered = false

      for (let i = 0; i < dockItemStatus.length; i++) {
        dockItemStatus[i].isHovered = false
        dockItemStatus[i].isNeighbor = false
      }

      updateSlideItems()
    },
  }
})
