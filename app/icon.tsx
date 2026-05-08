import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#00c853',
          borderRadius: 8,
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Camera body */}
        <div style={{
          position: 'absolute', top: 11, left: 4,
          width: 24, height: 16,
          background: 'white',
          borderRadius: 4,
        }} />
        {/* Camera bump */}
        <div style={{
          position: 'absolute', top: 7, left: 11,
          width: 10, height: 5,
          background: 'white',
          borderRadius: '3px 3px 0 0',
        }} />
        {/* Lens outer */}
        <div style={{
          position: 'absolute', top: 14, left: 11,
          width: 10, height: 10,
          background: '#00c853',
          borderRadius: '50%',
        }} />
        {/* Lens middle */}
        <div style={{
          position: 'absolute', top: 16, left: 13,
          width: 6, height: 6,
          background: 'white',
          borderRadius: '50%',
        }} />
        {/* Lens inner */}
        <div style={{
          position: 'absolute', top: 18, left: 15,
          width: 2, height: 2,
          background: '#00c853',
          borderRadius: '50%',
        }} />
      </div>
    ),
    { ...size }
  )
}
