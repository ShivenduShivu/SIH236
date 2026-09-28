import { useId } from 'react'

export function ProduceArt({ kind = 'tomato', small = false }: { kind?: string; small?: boolean }) {
  const id = useId().replace(/:/g, '')
  const broccoli = kind === 'broccoli'
  const dry = kind === 'peanuts' || kind === 'chips'
  return (
    <svg
      viewBox="0 0 600 490"
      className={small ? 'produce-art small' : 'produce-art'}
      role="img"
      aria-label={
        dry
          ? 'Illustration of a snack pouch'
          : broccoli
            ? 'Illustration of broccoli in a ventilated crate'
            : 'Illustration of tomatoes in a ventilated crate'
      }
    >
      <defs>
        <linearGradient id={`${id}fruit`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#e89266" />
          <stop offset=".5" stopColor="#d86647" />
          <stop offset="1" stopColor="#af4534" />
        </linearGradient>
        <linearGradient id={`${id}leaf`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#698754" />
          <stop offset="1" stopColor="#294c35" />
        </linearGradient>
        <linearGradient id={`${id}pouch`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#e2d7b4" />
          <stop offset="1" stopColor="#bdb58c" />
        </linearGradient>
        <radialGradient id={`${id}shadow`}>
          <stop stopColor="#536242" stopOpacity=".2" />
          <stop offset="1" stopColor="#536242" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="241" r="213" fill="none" stroke="#7f9574" strokeOpacity=".18" />
      <circle cx="300" cy="241" r="168" fill="none" stroke="#7f9574" strokeOpacity=".15" />
      <path d="M 300 28 A 213 213 0 0 1 510 202" fill="none" stroke="#71815a" strokeWidth="2" />
      <circle cx="510" cy="202" r="5" fill="#7d8b60" />
      <ellipse cx="309" cy="408" rx="251" ry="62" fill={`url(#${id}shadow)`} />
      {dry ? (
        <g transform="rotate(-7 300 250)">
          <path d="M185 93L393 93L413 383Q301 413 170 385Z" fill={`url(#${id}pouch)`} />
          <path d="M185 93L393 93L391 113L185 113Z" fill="#b2ad85" />
          <path d="M178 330L409 330L413 383Q301 413 170 385Z" fill="#3e5a42" />
          <rect x="214" y="150" width="151" height="115" rx="75" fill="#f3f1e6" />
          <path
            d="M276 178Q243 169 244 196Q242 211 262 218Q252 242 278 246Q303 248 308 227Q333 226 332 204Q330 176 303 184Q292 166 276 178Z"
            fill="#c4a571"
          />
          <path
            d="M281 188Q293 206 280 236M258 195L320 211"
            stroke="#a48758"
            fill="none"
            strokeWidth="2"
          />
          <text
            x="290"
            y="305"
            textAnchor="middle"
            fontFamily="Georgia,serif"
            fontSize="23"
            fill="#35482d"
          >
            thoughtfully packed
          </text>
          <path d="M211 364H374" stroke="#b4c78f" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M90 276L322 196L530 278L304 365Z" fill="#617653" />
          {(broccoli
            ? [
                [221, 241, 0.8],
                [329, 209, 0.85],
                [407, 261, 0.7],
                [310, 299, 0.8],
              ]
            : [
                [201, 235, 1],
                [302, 205, 0.95],
                [406, 245, 0.9],
                [243, 294, 0.82],
                [350, 292, 0.94],
              ]
          ).map(([x, y, scale], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
              {broccoli ? (
                <>
                  <path d="M-14 32L-21 84H20L12 25Z" fill="#9dad77" />
                  {[
                    [-32, -6],
                    [0, -23],
                    [31, -5],
                    [-21, 25],
                    [18, 21],
                  ].map(([cx, cy], j) => (
                    <circle key={j} cx={cx} cy={cy} r="29" fill={`url(#${id}leaf)`} />
                  ))}
                  <path d="M-15-21L-8-28M16 11L23 5M-30 9L-24 3" stroke="#88a375" strokeWidth="2" />
                </>
              ) : (
                <>
                  <path
                    d="M0-50C-28-56-61-24-59 12C-56 54-21 72 9 66C48 60 67 24 54-12C47-38 25-57 0-50Z"
                    fill={`url(#${id}fruit)`}
                  />
                  <ellipse
                    cx="-24"
                    cy="-16"
                    rx="14"
                    ry="9"
                    fill="#f3b890"
                    opacity=".58"
                    transform="rotate(-30)"
                  />
                  <path
                    d="M0-49L-26-57L-10-42L-27-28L-1-35L19-25L10-43L29-53L7-50L10-67Z"
                    fill="#486545"
                  />
                </>
              )}
            </g>
          ))}
          <path d="M88 276L305 360L305 429L88 345Z" fill="#a7b38a" />
          <path d="M305 360L532 278L532 351L305 429Z" fill="#819268" />
          <path d="M84 271L305 353L305 370L84 288Z" fill="#c6d0a8" />
          <path d="M305 353L537 272L537 291L305 370Z" fill="#d4dbb7" />
          {[0, 1, 2].map((row) => (
            <g key={row}>
              {[0, 1, 2, 3].map((col) => (
                <path
                  key={col}
                  d={`M${107 + col * 46} ${304 + row * 16 + col * 17}l31 12v7l-31-12Z`}
                  fill="#71845c"
                />
              ))}
            </g>
          ))}
          {[0, 1, 2].map((row) => (
            <g key={row}>
              {[0, 1, 2, 3].map((col) => (
                <path
                  key={col}
                  d={`M${327 + col * 47} ${373 + row * 15 - col * 17}l33-12v7l-33 12Z`}
                  fill="#506441"
                />
              ))}
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}
