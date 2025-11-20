'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'

interface TrendDataPoint {
  date: string
  positive: number
  neutral: number
  negative: number
  annotation?: {
    title: string
    description: string
    metrics?: Array<{ label: string; value: string; icon?: string }>
  }
}

interface TrendChartProps {
  data: TrendDataPoint[]
  period: string
  onPeriodChange: (period: string) => void
}

export default function TrendChart({ data, period, onPeriodChange }: TrendChartProps) {
  const periods = ['1 D', '5 D', '1 M', '3 M', '6 M']
  const [selectedAnnotation, setSelectedAnnotation] = useState<TrendDataPoint | null>(null)

  // Custom tooltip - simpler version
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3">
          <p className="text-xs font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-600 capitalize">{entry.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">{entry.value}%</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Check if we have any data
  const hasData = data && data.length > 0 && data.some(d => d.positive !== null || d.negative !== null)

  // Get data point with annotation
  const annotatedPoint = data.find(d => d.annotation)

  // Custom dot to make annotation dots clickable
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    if (!payload.annotation) {
      return <circle cx={cx} cy={cy} r={0} fill="transparent" />
    }

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="#22C55E"
          stroke="#D1FAE5"
          strokeWidth={3}
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedAnnotation(payload)}
        />
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="white"
        />
      </g>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col relative">
      {/* Header */}
      <div className="p-5 flex-shrink-0 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Top Trends</h2>

        {/* Period Filter - separate row */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">

        {/* No Data Message */}
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                No sentiment data available for this time period
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="flex-1 min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '9px' }}
                interval="preserveStartEnd"
                tickMargin={6}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '9px' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                width={30}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Lines */}
              <Line
                type="monotone"
                dataKey="negative"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={CustomDot}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="positive"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={CustomDot}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Annotation Popup Card */}
          {selectedAnnotation && selectedAnnotation.annotation && (
            <div className="absolute top-16 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72 z-10">
              {/* Close button */}
              <button
                onClick={() => setSelectedAnnotation(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Green indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {selectedAnnotation.annotation.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {selectedAnnotation.annotation.description}
              </p>

              {/* Metrics */}
              {selectedAnnotation.annotation.metrics && selectedAnnotation.annotation.metrics.length > 0 && (
                <div className="space-y-2.5">
                  {selectedAnnotation.annotation.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {metric.icon === 'retweet' && (
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                        {metric.icon === 'hashtag' && (
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        )}
                        {metric.icon === 'news' && (
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        )}
                      </div>
                      {/* Text */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">{metric.value}</span> {metric.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
          </>
        )}

        {/* Legend - only show if we have data */}
        {hasData && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 text-xs flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="text-gray-600">Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <span className="text-gray-600">Negative</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
