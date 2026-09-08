import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../../context/CartContext'
import Checkout from '../Checkout'

function renderCheckout() {
  return render(<MemoryRouter><CartProvider><Checkout /></CartProvider></MemoryRouter>)
}

describe('Checkout', () => {
  beforeEach(() => window.localStorage.clear())

  it('defaults to Casablanca and supports Moroccan city selection', () => {
    renderCheckout()
    const city = screen.getByRole('combobox', { name: 'City' })

    expect(city).toHaveValue('Casablanca')
    fireEvent.change(city, { target: { value: 'Marrakech' } })
    expect(city).toHaveValue('Marrakech')
    expect(screen.getByRole('option', { name: /Tangier/ })).toBeInTheDocument()
  })

  it('defaults to Cash on Delivery after advancing to payment', () => {
    renderCheckout()
    fireEvent.change(screen.getByLabelText('Phone (+212)'), { target: { value: '+212 612-345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment' }))

    expect(screen.getByRole('radio', { name: /Cash on Delivery/i })).toBeChecked()
  })

  it('accepts a Moroccan phone field on the delivery step', () => {
    renderCheckout()
    const phone = screen.getByRole('textbox', { name: 'Phone (+212)' })

    fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment' }))
    expect(screen.getByText('Use +212 6XX-XXXXXX or +212 7XX-XXXXXX.')).toBeInTheDocument()
    fireEvent.change(phone, { target: { value: '+212 612-345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue to Payment' }))
    expect(phone).toHaveValue('+212 612-345678')
    expect(screen.getByRole('radio', { name: /Cash on Delivery/i })).toBeChecked()
  })
})
