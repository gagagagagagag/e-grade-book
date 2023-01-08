export const getDiff = (current: number, last: number) => {
  return Math.round(((current - last) / last) * 100)
}
