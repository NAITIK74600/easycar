import { SequenceConfig } from '../types';

export interface SequenceManifestItem extends SequenceConfig {
  width: number;
  height: number;
  direction?: 'forward' | 'reverse';
  loadingStrategy: 'eager' | 'lazy' | 'nearest-section';
  mobileFallbackPoster: string;
  hasAudio?: boolean;
}

export const CINEMATIC_SEQUENCES: Record<string, SequenceManifestItem> = {
  'audi-hero': {
    sequenceId: 'audi-hero',
    directory: '/sequences/audi-a5/',
    totalFrames: 120, // Set to real frame count once user places images into public/sequences/audi-a5/
    namingConvention: 'frame_{0000}.webp',
    poster: '/easy-car.jpeg',
    mobileFallbackPoster: '/easy-car.jpeg',
    fps: 30,
    width: 1920,
    height: 1080,
    scrollRange: [0, 1],
    direction: 'forward',
    loadingStrategy: 'eager',
  },
  'audi-exterior': {
    sequenceId: 'audi-exterior',
    directory: '/frames/',
    totalFrames: 120,
    namingConvention: 'frame_{0000}.webp',
    poster: '/easy-car.jpeg',
    mobileFallbackPoster: '/easy-car.jpeg',
    fps: 30,
    width: 1920,
    height: 1080,
    scrollRange: [0, 1],
    direction: 'forward',
    loadingStrategy: 'nearest-section',
  },
  'audi-interior': {
    sequenceId: 'audi-interior',
    directory: '/assets/cinematic/audi-interior/',
    totalFrames: 0,
    namingConvention: 'frame_{0000}.webp',
    poster: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&q=85',
    mobileFallbackPoster: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
    fps: 30,
    width: 1920,
    height: 1080,
    scrollRange: [0, 1],
    direction: 'forward',
    loadingStrategy: 'nearest-section',
  },
  'audi-quality': {
    sequenceId: 'audi-quality',
    directory: '/assets/cinematic/audi-quality/',
    totalFrames: 0,
    namingConvention: 'frame_{0000}.webp',
    poster: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1920&q=85',
    mobileFallbackPoster: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=900&q=80',
    fps: 30,
    width: 1920,
    height: 1080,
    scrollRange: [0, 1],
    direction: 'forward',
    loadingStrategy: 'lazy',
  },
  'driving': {
    sequenceId: 'driving',
    directory: '/assets/cinematic/driving/',
    totalFrames: 0,
    namingConvention: 'frame_{0000}.webp',
    poster: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=85',
    mobileFallbackPoster: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
    fps: 30,
    width: 1920,
    height: 1080,
    scrollRange: [0, 1],
    direction: 'forward',
    loadingStrategy: 'lazy',
  },
};

export function formatFrameUrl(directory: string, namingConvention: string, frameIndex: number): string {
  const padLength = (namingConvention.match(/0+/)?.[0]?.length) || 4;
  const paddedNumber = String(frameIndex).padStart(padLength, '0');
  const fileName = namingConvention.replace(/\{0+\}/, paddedNumber);
  return `${directory.endsWith('/') ? directory : directory + '/'}${fileName}`;
}
