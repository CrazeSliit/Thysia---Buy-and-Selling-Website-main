// Delivery functionality not implemented in current schema

interface ActiveDeliveryProps {
  userId?: string
}

export default function ActiveDelivery({ userId }: ActiveDeliveryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-secondary-900 mb-4">
        Active Delivery
      </h2>
      <p className="text-secondary-600">
        Delivery functionality is not available yet.
      </p>
    </div>
  )
}

