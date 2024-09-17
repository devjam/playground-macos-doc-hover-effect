export const mq = (width: string) => {
  const mqList = window.matchMedia(`(min-width: ${width})`)
  return {
    mqList,
  }
}

// ホバー可能なデバイスかどうかを判定
export const checkEnableHover = () => {
  const mqList = window.matchMedia('(hover: hover) and (pointer: fine)')
  return {
    mqList,
  }
}
