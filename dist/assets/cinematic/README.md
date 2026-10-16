# Cinematic Asset Integration Guide

This directory holds your future image sequences generated from cinematic car videos.

## Directory Structure:
- `audi-hero/` — Full-screen hero opening sequence (e.g. `frame_0001.webp` ... `frame_0120.webp`)
- `audi-exterior/` — 360 camera-orbit or exterior reveal sequence
- `audi-interior/` — Door opening and cockpit transition sequence
- `audi-quality/` — Detail and mechanical inspection sequence
- `driving/` — Cinematic highway/alpine driving footage sequence
- `curtain/` — Theater wipe curtain frames or video
- `fleet-transitions/` — Spatial fleet cross-fade transitions
- `posters/` — High-resolution fallback static images

## How to integrate your real video/frames:
1. Export your video into a sequence of WebP or JPEG images:
   ```bash
   ffmpeg -i input.mp4 -vf "scale=1920:1080" -q:v 85 frame_%04d.webp
   ```
2. Move `frame_0001.webp` ... `frame_0NNN.webp` into the respective folder above.
3. Open `src/config/cinematicSequences.ts` and update `totalFrames` to the count of images you placed.
4. That's it! The `FrameSequenceCanvas` and `CinematicSequence` components will automatically load and animate your sequence in real-time mapped to scroll or playback.
