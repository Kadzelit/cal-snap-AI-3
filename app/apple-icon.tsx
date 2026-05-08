import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#00c853',
          borderRadius: 40,
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Camera bump */}
        <div style={{
          position: 'absolute', top: 41, left: 64,
          width: 52, height: 22,
          background: 'white',
          borderRadius: '10px 10px 0 0',
        }} />
        {/* Camera body */}
        <div style={{
          position: 'absolute', top: 60, left: 23,
          width: 134, height: 90,
          background: 'white',
          borderRadius: 19,
        }} />
        {/* Lens outer (green) */}
        <div style={{
          position: 'absolute', top: 75, left: 60,
          width: 60, height: 60,
          background: '#00c853',
          borderRadius: '50%',
        }} />
        {/* Lens middle (white) */}
        <div style={{
          position: 'absolute', top: 84, left: 69,
          width: 42, height: 42,
          background: 'white',
          borderRadius: '50%',
        }} />
        {/* Lens inner (green) */}
        <div style={{
          position: 'absolute', top: 94, left: 79,
          width: 22, height: 22,
          background: '#00c853',
          borderRadius: '50%',
        }} />
        {/* Flash dot */}
        <div style={{
          position: 'absolute', top: 75, left: 127,
          width: 16, height: 11,
          background: '#00c853',
          borderRadius: 6,
        }} />
        {/* Sparkle horizontal bar */}
        <div style={{
          position: 'absolute', top: 44, left: 133,
          width: 14, height: 3,
          background: 'white',
          borderRadius: 2,
        }} />
        {/* Sparkle vertical bar */}
        <div style={{
          position: 'absolute', top: 38, left: 139,
          width: 3, height: 14,
          background: 'white',
          borderRadius: 2,
        }} />
      </div>
    ),
    { ...size }
  )
}
