import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SearchBar } from '../events/search-bar'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(() => ''),
    toString: jest.fn(() => ''),
  }),
}))

// Mock the useDebounce hook
jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value, // Return value immediately for testing
}))

describe('SearchBar Component', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  test('renders search input correctly', () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByPlaceholderText('Cari event berdasarkan nama, lokasi, atau kategori...')
    expect(searchInput).toBeInTheDocument()
  })

  test('handles search input changes', async () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByPlaceholderText('Cari event berdasarkan nama, lokasi, atau kategori...')
    
    fireEvent.change(searchInput, { target: { value: 'tech conference' } })
    
    expect(searchInput).toHaveValue('tech conference')
  })

  test('shows clear button when there is search text', async () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByPlaceholderText('Cari event berdasarkan nama, lokasi, atau kategori...')
    
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    await waitFor(() => {
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })
  })

  test('clears search when clear button is clicked', async () => {
    render(<SearchBar />)
    
    const searchInput = screen.getByPlaceholderText('Cari event berdasarkan nama, lokasi, atau kategori...')
    
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    await waitFor(() => {
      const clearButton = screen.getByRole('button')
      fireEvent.click(clearButton)
    })
    
    expect(searchInput).toHaveValue('')
  })
})
