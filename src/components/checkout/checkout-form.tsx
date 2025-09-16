'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Ticket, User, CreditCard, Tag, Clock, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface CheckoutFormProps {
  data: {
    event: {
      id: string
      title: string
      startDate: Date
      location: string
      organizer: {
        id: string
        name: string
      }
      category: {
        id: string
        name: string
      }
    }
    ticketType: {
      id: string
      name: string
      price: number
      description: string | null
      available: number
    }
    quantity: number
    user: {
      id: string
      name: string
      email: string
      points: number
    }
    availableCoupons: Array<{
      id: string
      isUsed: boolean
      coupon: {
        id: string
        code: string
        discountType: 'FIXED' | 'PERCENTAGE'
        discountValue: number
        maxDiscount: number | null
        minPurchase: number | null
        description: string | null
      }
    }>
    availableVouchers: Array<{
      id: string
      code: string
      discountType: 'FIXED' | 'PERCENTAGE'
      discountValue: number
      maxDiscount: number | null
      minPurchase: number | null
      description: string | null
    }>
  }
}

export function CheckoutForm({ data }: CheckoutFormProps) {
  const router = useRouter()
  const [usePoints, setUsePoints] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [selectedCoupon, setSelectedCoupon] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const baseTotal = data.ticketType.price * data.quantity
  let discount = 0
  let pointsDiscount = 0

  // Calculate points discount (1 point = Rp 1)
  if (usePoints) {
    const maxPointsCanUse = Math.min(data.user.points, baseTotal)
    const actualPointsToUse = Math.min(pointsToUse, maxPointsCanUse)
    pointsDiscount = actualPointsToUse
  }

  // Calculate coupon discount
  if (selectedCoupon) {
    const coupon = data.availableCoupons.find(c => c.id === selectedCoupon)?.coupon
    if (coupon) {
      if (coupon.discountType === 'FIXED') {
        discount += coupon.discountValue
      } else {
        const percentageDiscount = (baseTotal * coupon.discountValue) / 100
        discount += coupon.maxDiscount 
          ? Math.min(percentageDiscount, coupon.maxDiscount)
          : percentageDiscount
      }
    }
  }

  // Calculate voucher discount
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'FIXED') {
      discount += appliedVoucher.discountValue
    } else {
      const percentageDiscount = (baseTotal * appliedVoucher.discountValue) / 100
      discount += appliedVoucher.maxDiscount 
        ? Math.min(percentageDiscount, appliedVoucher.maxDiscount)
        : percentageDiscount
    }
  }

  const totalDiscount = discount + pointsDiscount
  const finalTotal = Math.max(0, baseTotal - totalDiscount)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return

    try {
      const voucher = data.availableVouchers.find(v => v.code === voucherCode.trim())
      if (voucher) {
        setAppliedVoucher(voucher)
        setError('')
      } else {
        setError('Kode voucher tidak valid atau sudah kadaluarsa')
      }
    } catch (error) {
      setError('Gagal menerapkan voucher')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: data.event.id,
          ticketTypeId: data.ticketType.id,
          quantity: data.quantity,
          pointsUsed: usePoints ? pointsToUse : 0,
          couponId: selectedCoupon || null,
          voucherCode: appliedVoucher?.code || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal membuat transaksi')
      }

      const transaction = await response.json()
      router.push(`/transactions/${transaction.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checkout Tiket
          </h1>
          <p className="text-gray-600">
            Selesaikan pembelian tiket Anda
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detail Event
              </h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">{data.event.title}</div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(data.event.startDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">{data.event.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">by {data.event.organizer.name}</span>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detail Tiket
              </h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{data.ticketType.name}</div>
                    {data.ticketType.description && (
                      <div className="text-sm text-gray-600">{data.ticketType.description}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {data.quantity} x {formatCurrency(data.ticketType.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.ticketType.available} tersisa
                  </div>
                </div>
              </div>
            </div>

            {/* Points Usage */}
            {data.user.points > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Gunakan Poin
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="usePoints"
                      checked={usePoints}
                      onChange={(e) => {
                        setUsePoints(e.target.checked)
                        if (!e.target.checked) {
                          setPointsToUse(0)
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="usePoints" className="text-gray-900">
                      Gunakan poin saya ({data.user.points.toLocaleString()} poin tersedia)
                    </label>
                  </div>
                  {usePoints && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah poin yang digunakan (1 poin = Rp 1)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={Math.min(data.user.points, baseTotal)}
                        value={pointsToUse}
                        onChange={(e) => setPointsToUse(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Coupons */}
            {data.availableCoupons.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Kupon Tersedia
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih kupon
                    </label>
                    <select
                      value={selectedCoupon}
                      onChange={(e) => setSelectedCoupon(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih kupon (opsional)</option>
                      {data.availableCoupons.map((userCoupon) => (
                        <option key={userCoupon.id} value={userCoupon.id}>
                          {userCoupon.coupon.code} - {
                            userCoupon.coupon.discountType === 'FIXED'
                              ? formatCurrency(userCoupon.coupon.discountValue)
                              : `${userCoupon.coupon.discountValue}%`
                          }
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Voucher */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Kode Voucher
              </h2>
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Masukkan kode voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Voucher {appliedVoucher.code} diterapkan
                      </span>
                    </div>
                    {appliedVoucher.description && (
                      <p className="text-sm text-green-700 mt-1">
                        {appliedVoucher.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informasi Pembayaran
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">
                      Pembayaran Manual
                    </h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Setelah checkout, Anda akan diarahkan ke halaman untuk upload bukti pembayaran. 
                      Pembayaran harus diselesaikan dalam 2 jam atau transaksi akan dibatalkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(baseTotal)}</span>
                  </div>

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Poin ({pointsToUse.toLocaleString()} poin)</span>
                      <span>-{formatCurrency(pointsDiscount)}</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Kupon/Voucher</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                </button>

                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Batas waktu pembayaran: 2 jam</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
