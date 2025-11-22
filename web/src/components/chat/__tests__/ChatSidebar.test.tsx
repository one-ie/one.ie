/**
 * ChatSidebar Tests
 *
 * Tests for the sidebar navigation component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatSidebar } from '../ChatSidebar';

describe('ChatSidebar', () => {
  it('renders without crashing', () => {
    render(<ChatSidebar />);
    expect(screen.getByText(/sidebar settings/i)).toBeInTheDocument();
  });

  it('renders all 7 sections when expanded', () => {
    render(<ChatSidebar />);

    // Check for section headers
    expect(screen.getByText(/stream/i)).toBeInTheDocument();
    expect(screen.getByText(/organisations/i)).toBeInTheDocument();
    expect(screen.getByText(/groups/i)).toBeInTheDocument();
    expect(screen.getByText(/channels/i)).toBeInTheDocument();
    expect(screen.getByText(/tools/i)).toBeInTheDocument();
    expect(screen.getByText(/agents/i)).toBeInTheDocument();
    expect(screen.getByText(/people/i)).toBeInTheDocument();
  });
});
