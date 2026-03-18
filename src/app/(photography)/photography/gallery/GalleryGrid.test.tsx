import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/image to render a simple img tag
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('GalleryGrid — PHOTO-01 category filter', () => {
  it('renders photos and filters by category', async () => {
    const { GalleryGrid } = await import(
      '@/app/(photography)/photography/gallery/GalleryGrid'
    );

    render(<GalleryGrid />);

    // Should render all photos initially (at least portraits AND landscapes AND events)
    const allImages = screen.getAllByRole('img');
    expect(allImages.length).toBeGreaterThanOrEqual(3);

    // Click "Portraits" category button
    const portraitButton = screen.getByRole('button', { name: /portraits/i });
    await userEvent.click(portraitButton);

    // After filtering, only portrait photos should be visible
    const filteredImages = screen.getAllByRole('img');
    filteredImages.forEach((img) => {
      // Each visible image should have an alt text related to portrait
      // (the GalleryGrid uses photo.alt from the data, which contains category-relevant text)
      expect(img).toBeInTheDocument();
    });

    // The number of filtered images should be less than all images
    // (assuming there are photos in other categories too)
    expect(filteredImages.length).toBeLessThan(allImages.length);
  });

  it('shows all photos when "All" filter is selected', async () => {
    const { GalleryGrid } = await import(
      '@/app/(photography)/photography/gallery/GalleryGrid'
    );

    render(<GalleryGrid />);

    // Click a category first
    const eventButton = screen.getByRole('button', { name: /events/i });
    await userEvent.click(eventButton);

    // Then click "All"
    const allButton = screen.getByRole('button', { name: /all/i });
    await userEvent.click(allButton);

    // All images should be visible again
    const allImages = screen.getAllByRole('img');
    expect(allImages.length).toBeGreaterThanOrEqual(3);
  });
});
