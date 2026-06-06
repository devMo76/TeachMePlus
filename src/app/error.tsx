'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main>
      <p>Global error page - placeholder</p>
      <button onClick={reset}>Reset</button>
    </main>
  )
}
