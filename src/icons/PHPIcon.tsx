import React from 'react'

interface IconProps {
  width?: number
  height?: number
}

const PHPIcon: React.FC<IconProps> = ({ width = 48, height = 48 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 32 32'
      xmlns='http://www.w3.org/2000/svg'
      fill='#000000'
    >
      <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
      <g
        id='SVGRepo_tracerCarrier'
        stroke-linecap='round'
        stroke-linejoin='round'
      ></g>
      <g id='SVGRepo_iconCarrier'>
        <title>file_type_php3</title>
        <path
          d='M7.6,13.791a2.352,2.352,0,0,1,1.745.483,1.916,1.916,0,0,1,.207,1.66,2.78,2.78,0,0,1-.918,1.748,3.375,3.375,0,0,1-2.07.529h-1.4L6.024,13.8ZM2,22.677H4.3l.545-2.8H6.812A7.049,7.049,0,0,0,8.956,19.6a4.06,4.06,0,0,0,1.53-.918A4.585,4.585,0,0,0,11.93,16.1a3.288,3.288,0,0,0-.55-2.922A3.671,3.671,0,0,0,8.47,12.129H4.057Z'
          style={{ fill: '#8993be' }}
        ></path>
        <path
          d='M13.617,9.323H15.9l-.553,2.8h2.031a3.956,3.956,0,0,1,2.645.669,2.213,2.213,0,0,1,.436,2.167l-.954,4.909H17.195l.908-4.667a1.267,1.267,0,0,0-.114-1.086,1.6,1.6,0,0,0-1.144-.286H15.022l-1.175,6.044H11.559Z'
          style={{ fill: '#8993be' }}
        ></path>
        <path
          d='M25.539,13.791a2.352,2.352,0,0,1,1.745.483,1.916,1.916,0,0,1,.207,1.66,2.78,2.78,0,0,1-.918,1.748,3.375,3.375,0,0,1-2.074.529H23.1l.858-4.416Zm-5.6,8.886h2.3l.545-2.8h1.968A7.049,7.049,0,0,0,26.9,19.6a4.06,4.06,0,0,0,1.53-.918A4.585,4.585,0,0,0,29.869,16.1a3.288,3.288,0,0,0-.55-2.922,3.671,3.671,0,0,0-2.909-1.046h-4.42Z'
          style={{ fill: '#8993be' }}
        ></path>
      </g>
    </svg>
  )
}

export default PHPIcon
