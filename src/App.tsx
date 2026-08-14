import { Routes, Route } from 'react-router-dom'
import { NavSidebar } from './components/layout/NavSidebar'
import { Home } from './chapters/Home'
import { Playground } from './pages/Playground'
import { WhyParallelism } from './chapters/WhyParallelism'
import { Collectives } from './chapters/Collectives'
import { DataParallel } from './chapters/DataParallel'
import { ZeroFsdp } from './chapters/ZeroFsdp'
import { TensorParallel } from './chapters/TensorParallel'
import { PipelineParallel } from './chapters/PipelineParallel'
import { SequenceParallel } from './chapters/SequenceParallel'
import { Moe } from './chapters/Moe'
import { PuttingItTogether } from './chapters/PuttingItTogether'

function App() {
  return (
    <div className="app-layout">
      <NavSidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/why-parallelism" element={<WhyParallelism />} />
          <Route path="/collectives" element={<Collectives />} />
          <Route path="/data-parallel" element={<DataParallel />} />
          <Route path="/zero-fsdp" element={<ZeroFsdp />} />
          <Route path="/tensor-parallel" element={<TensorParallel />} />
          <Route path="/pipeline-parallel" element={<PipelineParallel />} />
          <Route path="/sequence-parallel" element={<SequenceParallel />} />
          <Route path="/moe" element={<Moe />} />
          <Route path="/putting-it-together" element={<PuttingItTogether />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
