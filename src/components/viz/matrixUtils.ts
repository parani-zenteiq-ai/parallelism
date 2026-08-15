export type Matrix = number[][]

export function multiply(a: Matrix, b: Matrix): Matrix {
  const rows = a.length
  const inner = b.length
  const cols = b[0].length
  const out: Matrix = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let sum = 0
      for (let k = 0; k < inner; k++) sum += a[i][k] * b[k][j]
      out[i][j] = sum
    }
  }
  return out
}

export function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]))
}

export function column(m: Matrix, j: number): number[] {
  return m.map((row) => row[j])
}

export function sliceCols(m: Matrix, start: number, end: number): Matrix {
  return m.map((row) => row.slice(start, end))
}

export function sliceRows(m: Matrix, start: number, end: number): Matrix {
  return m.slice(start, end)
}
