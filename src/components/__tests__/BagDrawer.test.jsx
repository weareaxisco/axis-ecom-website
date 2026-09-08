import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider, useCart } from '../../context/CartContext'
import BagDrawer from '../BagDrawer'
import { LanguageProvider } from '../../context/LanguageContext'

function OpenBag({ children }) {
  const { addToCart } = useCart()
  return <><button type="button" onClick={() => addToCart({ id: 'p1', name: 'Heritage Timepiece', price: 156000, main_image_url: '/watch.jpg' })}>Seed bag</button>{children}</>
}

function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>
}

describe('BagDrawer', () => {
  beforeEach(() => { window.localStorage.clear(); window.localStorage.setItem('maison_language', 'en') })

  it('renders thumbnails, quantities, and the subtotal when opened', () => {
    render(<MemoryRouter><LanguageProvider><CartProvider><OpenBag><BagDrawer /></OpenBag></CartProvider></LanguageProvider></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Seed bag' }))

    expect(screen.getByRole('img', { name: 'Heritage Timepiece' })).toBeInTheDocument()
    expect(screen.getByText('Heritage Timepiece')).toBeInTheDocument()
    expect(screen.getAllByText('156,000 MAD')).toHaveLength(2)
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
  })

  it('navigates to checkout and closes the drawer', () => {
    render(<MemoryRouter initialEntries={['/']}><LanguageProvider><CartProvider><OpenBag><BagDrawer /><Routes><Route path="*" element={<LocationProbe />} /></Routes></OpenBag></CartProvider></LanguageProvider></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Seed bag' }))
    fireEvent.click(screen.getByRole('button', { name: 'Proceed to Checkout' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/checkout')
  })
})
