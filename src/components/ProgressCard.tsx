'use client'

interface ProgressCardProps {
  icon: string
  label: string
  value: string | number
}

export default function ProgressCard({ icon, label, value }: ProgressCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-3xl">{icon}</p>
      <p className="mt-2 text-2xl font-bold text-amber-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
