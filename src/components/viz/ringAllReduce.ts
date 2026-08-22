export type RingPhase = 'reduce-scatter' | 'all-gather'

export interface RingStep {
  phase: RingPhase
  stepIndex: number
  totalStepsInPhase: number
  /** for each gpu i, the chunk index it sends to gpu (i+1)%N this step */
  sends: number[]
  /** state of every gpu's vector immediately after this step (null = not yet a real value) */
  state: (number | null)[][]
}

export interface RingTrace {
  n: number
  trueSum: number[]
  steps: RingStep[]
}

export function simulateRingAllReduce(vectors: number[][]): RingTrace {
  const n = vectors.length
  const trueSum = Array(n).fill(0)
  for (let c = 0; c < n; c++) {
    for (let i = 0; i < n; i++) trueSum[c] += vectors[i][c]
  }

  const steps: RingStep[] = []

  // Phase 1: reduce-scatter — N-1 steps, each gpu sends one chunk to its ring neighbor,
  // neighbor adds it into its own copy of that chunk.
  let state: number[][] = vectors.map((row) => [...row])
  for (let s = 0; s < n - 1; s++) {
    const sends = Array.from({ length: n }, (_, i) => (((i - s) % n) + n) % n)
    const incoming = sends.map((chunk, i) => ({ dest: (i + 1) % n, chunk, value: state[i][chunk] }))
    const next = state.map((row) => [...row])
    incoming.forEach(({ dest, chunk, value }) => {
      next[dest][chunk] += value
    })
    state = next
    steps.push({ phase: 'reduce-scatter', stepIndex: s, totalStepsInPhase: n - 1, sends, state: state.map((r) => [...r]) })
  }

  // After reduce-scatter, gpu i fully owns the true sum for chunk (i+1)%n.
  let gatherState: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null))
  for (let i = 0; i < n; i++) {
    const owned = (i + 1) % n
    gatherState[i][owned] = state[i][owned]
  }
  let forwarding = Array.from({ length: n }, (_, i) => (i + 1) % n)

  for (let s = 0; s < n - 1; s++) {
    const sends = [...forwarding]
    const transfers = sends.map((chunk, i) => ({ dest: (i + 1) % n, chunk, value: gatherState[i][chunk] }))
    const next = gatherState.map((row) => [...row])
    transfers.forEach(({ dest, chunk, value }) => {
      next[dest][chunk] = value
    })
    gatherState = next
    const nextForwarding = Array(n).fill(0)
    transfers.forEach(({ chunk }, i) => {
      nextForwarding[(i + 1) % n] = chunk
    })
    forwarding = nextForwarding
    steps.push({ phase: 'all-gather', stepIndex: s, totalStepsInPhase: n - 1, sends, state: gatherState.map((r) => [...r]) })
  }

  return { n, trueSum, steps }
}
