import React, { useMemo } from 'react'

function rotatePoint2d(x, y, cx, cy, angle) {
  const radians = (angle * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = cos * (x - cx) + sin * (y - cy) + cx
  const ny = cos * (y - cy) - sin * (x - cx) + cy
  return [nx, ny]
}

function rotatePoints2d(points, cx, cy, angle) {
  return points
    .split(' ')
    .map((point) => {
      const [x, y] = point.split(',')
      const [nx, ny] = rotatePoint2d(parseFloat(x), parseFloat(y), cx, cy, angle)
      return `${nx.toFixed(1)},${ny.toFixed(1)}`
    })
    .join(' ')
}

class SQ1Simulator {
  constructor() {
    // Solved state representation matching scrambler
    this.top = [0, 1, 2, 3, 4, 5, 6, 7]
    this.bottom = [8, 9, 10, 11, 12, 13, 14, 15]
  }

  performAlg(alg) {
    if (!alg) return
    const regex = /\/|\(-?\d+,\s*-?\d+\)/g
    const matches = alg.match(regex) || []
    for (const token of matches) {
      if (token === '/') {
        this.slash()
      } else {
        const parts = token.replace(/\(|\)/g, '').split(',')
        const topTurn = parseInt(parts[0], 10)
        const bottomTurn = parseInt(parts[1], 10)
        this.turnU(topTurn)
        this.turnD(bottomTurn)
      }
    }
  }

  slash() {
    let topCount = 0
    let bottomCount = 0
    let topIndex = 0
    let bottomIndex = 0

    for (const value of this.top) {
      topCount += value % 2 === 0 ? 2 : 1
      topIndex += 1
      if (topCount === 6) break
    }
    for (const value of this.bottom) {
      bottomCount += value % 2 === 0 ? 2 : 1
      bottomIndex += 1
      if (bottomCount === 6) break
    }

    const topPart = this.top.slice(topIndex)
    const bottomPart = this.bottom.slice(bottomIndex)
    this.top = this.top.slice(0, topIndex).concat(bottomPart.reverse())
    this.bottom = this.bottom.slice(0, bottomIndex).concat(topPart.reverse())
  }

  turnU(n) {
    this.top = this.turnFace(-n, this.top)
  }

  turnD(n) {
    this.bottom = this.turnFace(n, this.bottom)
  }

  getTotal(face) {
    let total = 0
    for (const value of face) {
      total += value % 2 === 0 ? 2 : 1
    }
    return total
  }

  turnFace(n, face) {
    const total = this.getTotal(face)
    n = ((n % total) + total) % total
    if (n === 0) return face

    let count = 0
    let index = 0
    for (const value of face) {
      count += value % 2 === 0 ? 2 : 1
      index += 1
      if (count === n) break
    }

    const beginning = face.slice(0, index)
    const end = face.slice(index)
    return end.concat(beginning)
  }

  getPolygons(face, top) {
    // Pieces stickers (yellow/white base and side stickers)
    const pieces = [
      ['#FFCC00', '#0044ff', '#ff1100'], // Corner top (0)
      ['#FFCC00', '#0044ff'],            // Edge top (1)
      ['#FFCC00', '#ffaa00', '#0044ff'], // Corner top (2)
      ['#FFCC00', '#ffaa00'],            // Edge top (3)
      ['#FFCC00', '#00cc44', '#ffaa00'], // Corner top (4)
      ['#FFCC00', '#00cc44'],            // Edge top (5)
      ['#FFCC00', '#ff1100', '#00cc44'], // Corner top (6)
      ['#FFCC00', '#ff1100'],            // Edge top (7)
      // Bottom face stickers (White base)
      ['#FFFFFF', '#ff1100', '#0044ff'], // Corner bottom (8)
      ['#FFFFFF', '#0044ff'],            // Edge bottom (9)
      ['#FFFFFF', '#0044ff', '#ffaa00'], // Corner bottom (10)
      ['#FFFFFF', '#ffaa00'],            // Edge bottom (11)
      ['#FFFFFF', '#ffaa00', '#00cc44'], // Corner bottom (12)
      ['#FFFFFF', '#00cc44'],            // Edge bottom (13)
      ['#FFFFFF', '#00cc44', '#ff1100'], // Corner bottom (14)
      ['#FFFFFF', '#ff1100'],            // Edge bottom (15)
    ]

    const size = 100
    const mid = size / 2
    const pad = 0.12 * size
    const width = 0.1 * size
    const inner = (width + pad - mid) / Math.tan((75 * Math.PI) / 180) + mid
    const outer = (pad - mid) / Math.tan((75 * Math.PI) / 180) + mid

    let corner1 = `${mid},${mid} ${inner},${size - width - pad} ${width + pad},${size - width - pad} ${width + pad},${size - inner}`
    let corner2 = `${pad},${size - pad} ${width + pad},${size - width - pad} ${width + pad},${size - inner} ${pad},${size - outer}`
    let corner3 = `${pad},${size - pad} ${width + pad},${size - width - pad} ${inner},${size - width - pad} ${outer},${size - pad}`
    const edge1 = `${mid},${mid} ${size - inner},${size - width - pad} ${inner},${size - width - pad}`
    const edge2 = `${outer},${size - pad} ${inner},${size - width - pad} ${size - inner},${size - width - pad} ${size - outer},${size - pad}`

    if (!top) {
      const tmp = corner2
      corner2 = corner3
      corner3 = tmp
    }

    let angle = 0
    const polygons = []
    for (let i = 0; i < face.length; i++) {
      const piece = pieces[face[i]]
      if (piece.length === 3) {
        polygons.push({ points: rotatePoints2d(corner1, mid, mid, angle), fill: piece[0] })
        polygons.push({ points: rotatePoints2d(corner2, mid, mid, angle), fill: piece[1] })
        polygons.push({ points: rotatePoints2d(corner3, mid, mid, angle), fill: piece[2] })
        angle -= 60
      } else if (piece.length === 2) {
        polygons.push({ points: rotatePoints2d(edge1, mid, mid, angle - 30), fill: piece[0] })
        polygons.push({ points: rotatePoints2d(edge2, mid, mid, angle - 30), fill: piece[1] })
        angle -= 30
      }
    }
    return polygons
  }
}

const Sq1Preview = ({ scramble }) => {
  const { topPolygons, bottomPolygons } = useMemo(() => {
    const simulator = new SQ1Simulator()
    try {
      simulator.performAlg(scramble)
      return {
        topPolygons: simulator.getPolygons(simulator.top, true),
        bottomPolygons: simulator.getPolygons(simulator.bottom, false)
      }
    } catch (e) {
      console.error('Error simulating SQ1 scramble:', e)
      return {
        topPolygons: simulator.getPolygons(simulator.top, true),
        bottomPolygons: simulator.getPolygons(simulator.bottom, false)
      }
    }
  }, [scramble])

  const renderSvg = (polygons) => (
    <svg 
      viewBox="0 0 100 100" 
      strokeLinejoin="round" 
      className="w-16 h-16 md:w-20 md:h-20"
      style={{ display: 'inline-block' }}
    >
      {polygons.map((p, idx) => (
        <polygon 
          key={idx} 
          points={p.points} 
          fill={p.fill} 
          stroke="#111111" 
          strokeWidth="1.2" 
          strokeLinejoin="round" 
        />
      ))}
    </svg>
  )

  return (
    <div className="flex items-center justify-center gap-4 bg-brand-gray-50 dark:bg-brand-gray-900/40 p-2 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-800">
      <div className="flex flex-col items-center">
        {renderSvg(topPolygons)}
      </div>
      <div className="w-px h-12 bg-brand-gray-200 dark:bg-brand-gray-800" />
      <div className="flex flex-col items-center">
        {renderSvg(bottomPolygons)}
      </div>
    </div>
  )
}

export default Sq1Preview
