import type { Result, Scenario } from './types'
export async function request<T>(path: string, scenario?: Scenario): Promise<T> {
  const response = await fetch(
    path,
    scenario
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario),
          signal: AbortSignal.timeout(15000),
        }
      : { signal: AbortSignal.timeout(15000) },
  )
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const detail = data.detail
    throw new Error(
      Array.isArray(detail)
        ? detail
            .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
            .join('\n')
        : typeof detail === 'string'
          ? detail
          : `The local service returned ${response.status}. Please try again.`,
    )
  }
  return response.json() as Promise<T>
}
export function evaluate(scenario: Scenario) {
  return request<Result>('/api/evaluate', scenario)
}
export function download(name: string, data: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
export function formatValue(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: value >= 100 ? 0 : value >= 1 ? 2 : 4,
  }).format(value)
}
