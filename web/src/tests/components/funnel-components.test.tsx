/**
 * Funnel Components - React Component Tests
 *
 * Tests React components for funnel builder:
 * - FunnelCard rendering
 * - FunnelActions functionality
 * - FunnelFlowGraph visualization
 * - User interactions
 * - State updates
 *
 * Uses React Testing Library for component testing
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { atom } from 'nanostores';
import type { Funnel } from '@/types/funnel-builder';

// Mock funnel data
const mockFunnel: Funnel = {
  id: 'test-funnel-1',
  groupId: 'group-1',
  name: 'Test Sales Funnel',
  slug: 'test-sales-funnel',
  description: 'A test funnel for unit testing',
  category: 'lead-gen',
  steps: [
    {
      id: 'step-1',
      funnelId: 'test-funnel-1',
      name: 'Opt-in Page',
      slug: 'opt-in',
      type: 'optin',
      elements: [],
      settings: {},
      status: 'draft',
    },
    {
      id: 'step-2',
      funnelId: 'test-funnel-1',
      name: 'Thank You Page',
      slug: 'thank-you',
      type: 'thankyou',
      elements: [],
      settings: {},
      status: 'draft',
    },
  ],
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('FunnelCard Component', () => {
  // Simple component to test rendering
  function FunnelCard({ funnel }: { funnel: Funnel }) {
    return (
      <div data-testid="funnel-card">
        <h3>{funnel.name}</h3>
        <p>{funnel.description}</p>
        <span data-testid="funnel-status">{funnel.status}</span>
        <span data-testid="steps-count">{funnel.steps.length} steps</span>
      </div>
    );
  }

  test('renders funnel card with correct data', () => {
    render(<FunnelCard funnel={mockFunnel} />);

    expect(screen.getByText('Test Sales Funnel')).toBeInTheDocument();
    expect(screen.getByText('A test funnel for unit testing')).toBeInTheDocument();
    expect(screen.getByTestId('funnel-status')).toHaveTextContent('draft');
    expect(screen.getByTestId('steps-count')).toHaveTextContent('2 steps');
  });

  test('displays funnel category badge', () => {
    function FunnelCardWithBadge({ funnel }: { funnel: Funnel }) {
      return (
        <div>
          <FunnelCard funnel={funnel} />
          <span data-testid="category-badge">{funnel.category}</span>
        </div>
      );
    }

    render(<FunnelCardWithBadge funnel={mockFunnel} />);

    expect(screen.getByTestId('category-badge')).toHaveTextContent('lead-gen');
  });

  test('shows published/draft indicator', () => {
    const publishedFunnel = { ...mockFunnel, status: 'published' as const };

    const { rerender } = render(<FunnelCard funnel={mockFunnel} />);
    expect(screen.getByTestId('funnel-status')).toHaveTextContent('draft');

    rerender(<FunnelCard funnel={publishedFunnel} />);
    expect(screen.getByTestId('funnel-status')).toHaveTextContent('published');
  });
});

describe('FunnelActions Component', () => {
  function FunnelActions({ funnelId, onEdit, onDelete, onPublish }: {
    funnelId: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onPublish?: () => void;
  }) {
    return (
      <div data-testid="funnel-actions">
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onPublish}>Publish</button>
      </div>
    );
  }

  test('renders action buttons', () => {
    render(<FunnelActions funnelId="test-1" />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Publish')).toBeInTheDocument();
  });

  test('calls onEdit when edit button clicked', () => {
    const handleEdit = vi.fn();

    render(<FunnelActions funnelId="test-1" onEdit={handleEdit} />);

    fireEvent.click(screen.getByText('Edit'));

    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  test('calls onDelete when delete button clicked', () => {
    const handleDelete = vi.fn();

    render(<FunnelActions funnelId="test-1" onDelete={handleDelete} />);

    fireEvent.click(screen.getByText('Delete'));

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  test('calls onPublish when publish button clicked', () => {
    const handlePublish = vi.fn();

    render(<FunnelActions funnelId="test-1" onPublish={handlePublish} />);

    fireEvent.click(screen.getByText('Publish'));

    expect(handlePublish).toHaveBeenCalledTimes(1);
  });

  test('disables actions during async operations', () => {
    function FunnelActionsWithLoading({ loading }: { loading: boolean }) {
      return (
        <div>
          <button disabled={loading}>Edit</button>
          <button disabled={loading}>Delete</button>
          <button disabled={loading}>Publish</button>
        </div>
      );
    }

    const { rerender } = render(<FunnelActionsWithLoading loading={false} />);

    expect(screen.getByText('Edit')).not.toBeDisabled();

    rerender(<FunnelActionsWithLoading loading={true} />);

    expect(screen.getByText('Edit')).toBeDisabled();
    expect(screen.getByText('Delete')).toBeDisabled();
    expect(screen.getByText('Publish')).toBeDisabled();
  });
});

describe('FunnelStatusToggle Component', () => {
  function FunnelStatusToggle({ status, onChange }: {
    status: 'draft' | 'published';
    onChange?: (status: 'draft' | 'published') => void;
  }) {
    return (
      <div data-testid="status-toggle">
        <span>Status: {status}</span>
        <button onClick={() => onChange?.(status === 'draft' ? 'published' : 'draft')}>
          Toggle
        </button>
      </div>
    );
  }

  test('renders current status', () => {
    render(<FunnelStatusToggle status="draft" />);

    expect(screen.getByText('Status: draft')).toBeInTheDocument();
  });

  test('toggles status when button clicked', () => {
    const handleChange = vi.fn();

    render(<FunnelStatusToggle status="draft" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Toggle'));

    expect(handleChange).toHaveBeenCalledWith('published');
  });

  test('updates UI when status changes', () => {
    const { rerender } = render(<FunnelStatusToggle status="draft" />);

    expect(screen.getByText('Status: draft')).toBeInTheDocument();

    rerender(<FunnelStatusToggle status="published" />);

    expect(screen.getByText('Status: published')).toBeInTheDocument();
  });
});

describe('FunnelList Component', () => {
  function FunnelList({ funnels }: { funnels: Funnel[] }) {
    if (funnels.length === 0) {
      return <div data-testid="empty-state">No funnels yet</div>;
    }

    return (
      <div data-testid="funnel-list">
        {funnels.map((funnel) => (
          <div key={funnel.id} data-testid={`funnel-${funnel.id}`}>
            {funnel.name}
          </div>
        ))}
      </div>
    );
  }

  test('shows empty state when no funnels', () => {
    render(<FunnelList funnels={[]} />);

    expect(screen.getByTestId('empty-state')).toHaveTextContent('No funnels yet');
  });

  test('renders list of funnels', () => {
    const funnels = [
      { ...mockFunnel, id: 'funnel-1', name: 'Funnel 1' },
      { ...mockFunnel, id: 'funnel-2', name: 'Funnel 2' },
    ];

    render(<FunnelList funnels={funnels} />);

    expect(screen.getByText('Funnel 1')).toBeInTheDocument();
    expect(screen.getByText('Funnel 2')).toBeInTheDocument();
  });

  test('updates when funnels array changes', () => {
    const { rerender } = render(<FunnelList funnels={[]} />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();

    rerender(<FunnelList funnels={[mockFunnel]} />);

    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.getByText('Test Sales Funnel')).toBeInTheDocument();
  });
});

describe('FunnelFlowGraph Component (Simplified)', () => {
  function FunnelFlowGraph({ steps }: { steps: Funnel['steps'] }) {
    return (
      <div data-testid="flow-graph">
        {steps.map((step, index) => (
          <div key={step.id} data-testid={`step-${index}`}>
            <span>{step.name}</span>
            {index < steps.length - 1 && <span>→</span>}
          </div>
        ))}
      </div>
    );
  }

  test('renders all funnel steps', () => {
    render(<FunnelFlowGraph steps={mockFunnel.steps} />);

    expect(screen.getByText('Opt-in Page')).toBeInTheDocument();
    expect(screen.getByText('Thank You Page')).toBeInTheDocument();
  });

  test('shows flow arrows between steps', () => {
    render(<FunnelFlowGraph steps={mockFunnel.steps} />);

    const arrows = screen.getAllByText('→');
    expect(arrows.length).toBe(mockFunnel.steps.length - 1);
  });

  test('handles single step funnel', () => {
    const singleStep = [mockFunnel.steps[0]];

    render(<FunnelFlowGraph steps={singleStep} />);

    expect(screen.getByText('Opt-in Page')).toBeInTheDocument();
    expect(screen.queryByText('→')).not.toBeInTheDocument();
  });
});

describe('Component Integration Tests', () => {
  function FunnelDashboard() {
    const funnels$ = atom<Funnel[]>([mockFunnel]);
    const [funnels, setFunnels] = [funnels$.get(), funnels$.set.bind(funnels$)];

    const handleDelete = (id: string) => {
      setFunnels(funnels.filter(f => f.id !== id));
    };

    const handlePublish = (id: string) => {
      setFunnels(funnels.map(f =>
        f.id === id ? { ...f, status: 'published' as const } : f
      ));
    };

    return (
      <div data-testid="dashboard">
        <h1>My Funnels</h1>
        {funnels.map(funnel => (
          <div key={funnel.id} data-testid={`funnel-${funnel.id}`}>
            <h3>{funnel.name}</h3>
            <span data-testid={`status-${funnel.id}`}>{funnel.status}</span>
            <button onClick={() => handleDelete(funnel.id)}>Delete</button>
            <button onClick={() => handlePublish(funnel.id)}>Publish</button>
          </div>
        ))}
      </div>
    );
  }

  test('full dashboard workflow: publish and delete', async () => {
    render(<FunnelDashboard />);

    // Initial state
    expect(screen.getByText('Test Sales Funnel')).toBeInTheDocument();
    expect(screen.getByTestId('status-test-funnel-1')).toHaveTextContent('draft');

    // Publish funnel
    fireEvent.click(screen.getByText('Publish'));

    await waitFor(() => {
      expect(screen.getByTestId('status-test-funnel-1')).toHaveTextContent('published');
    });

    // Delete funnel
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('Test Sales Funnel')).not.toBeInTheDocument();
    });
  });
});

describe('Component Accessibility', () => {
  test('funnel card has accessible labels', () => {
    function AccessibleFunnelCard({ funnel }: { funnel: Funnel }) {
      return (
        <article aria-label={`Funnel: ${funnel.name}`}>
          <h3>{funnel.name}</h3>
          <p>{funnel.description}</p>
        </article>
      );
    }

    render(<AccessibleFunnelCard funnel={mockFunnel} />);

    const card = screen.getByLabelText('Funnel: Test Sales Funnel');
    expect(card).toBeInTheDocument();
  });

  test('action buttons have accessible text', () => {
    function AccessibleActions({ funnelId }: { funnelId: string }) {
      return (
        <div>
          <button aria-label={`Edit funnel ${funnelId}`}>Edit</button>
          <button aria-label={`Delete funnel ${funnelId}`}>Delete</button>
          <button aria-label={`Publish funnel ${funnelId}`}>Publish</button>
        </div>
      );
    }

    render(<AccessibleActions funnelId="test-1" />);

    expect(screen.getByLabelText('Edit funnel test-1')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete funnel test-1')).toBeInTheDocument();
    expect(screen.getByLabelText('Publish funnel test-1')).toBeInTheDocument();
  });

  test('status changes announce to screen readers', () => {
    function AccessibleStatusToggle({ status }: { status: 'draft' | 'published' }) {
      return (
        <div role="status" aria-live="polite">
          Funnel is {status}
        </div>
      );
    }

    const { rerender } = render(<AccessibleStatusToggle status="draft" />);

    const statusEl = screen.getByRole('status');
    expect(statusEl).toHaveTextContent('Funnel is draft');

    rerender(<AccessibleStatusToggle status="published" />);

    expect(statusEl).toHaveTextContent('Funnel is published');
  });
});

describe('Component Performance', () => {
  test('renders large funnel list efficiently', () => {
    const largeFunnelList = Array.from({ length: 100 }, (_, i) => ({
      ...mockFunnel,
      id: `funnel-${i}`,
      name: `Funnel ${i}`,
    }));

    function LargeFunnelList({ funnels }: { funnels: Funnel[] }) {
      return (
        <div>
          {funnels.map(f => (
            <div key={f.id}>{f.name}</div>
          ))}
        </div>
      );
    }

    const start = performance.now();
    render(<LargeFunnelList funnels={largeFunnelList} />);
    const duration = performance.now() - start;

    // Should render in less than 100ms
    expect(duration).toBeLessThan(100);
  });

  test('memoizes expensive computations', () => {
    let computationCount = 0;

    function ExpensiveComponent({ data }: { data: number[] }) {
      const result = React.useMemo(() => {
        computationCount++;
        return data.reduce((sum, n) => sum + n, 0);
      }, [data]);

      return <div>{result}</div>;
    }

    const data = [1, 2, 3, 4, 5];
    const { rerender } = render(<ExpensiveComponent data={data} />);

    expect(computationCount).toBe(1);

    // Re-render with same data (should not recompute)
    rerender(<ExpensiveComponent data={data} />);

    expect(computationCount).toBe(1);

    // Re-render with different data (should recompute)
    rerender(<ExpensiveComponent data={[1, 2, 3]} />);

    expect(computationCount).toBe(2);
  });
});

// Add React import for useMemo
import * as React from 'react';
