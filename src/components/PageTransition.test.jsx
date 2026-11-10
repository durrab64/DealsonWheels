import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PageTransition from './PageTransition'

const TransitionedSearch = () => {
  const [searchParams] = useSearchParams()

  return <p data-testid="transitioned-search">{searchParams.get('q') || 'none'}</p>
}

const Harness = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentSearch = new URLSearchParams(location.search).get('q') || 'none'

  return (
    <div>
      <button type="button" onClick={() => navigate('/category/exterior?q=updated')}>
        Change query
      </button>
      <p data-testid="current-search">{currentSearch}</p>
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          <Route path="/category/exterior" element={<TransitionedSearch />} />
        </Routes>
      </PageTransition>
    </div>
  )
}

describe('PageTransition query-string navigation', () => {
  it('documents that a same-path query change leaves the transitioned page stale', async () => {
    // Known defect: PageTransition only swaps displayChildren when the
    // pathname changes. App passes a location snapshot into Routes, so a
    // same-path ?q= update is not reflected in the page it renders.
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/category/exterior?q=initial']}>
        <Harness />
      </MemoryRouter>
    )

    expect(screen.getByTestId('current-search').textContent).toBe('initial')
    expect(screen.getByTestId('transitioned-search').textContent).toBe('initial')

    await user.click(screen.getByRole('button', { name: 'Change query' }))

    await waitFor(() =>
      expect(screen.getByTestId('current-search').textContent).toBe('updated')
    )
    expect(screen.getByTestId('transitioned-search').textContent).toBe('initial')
  })
})
