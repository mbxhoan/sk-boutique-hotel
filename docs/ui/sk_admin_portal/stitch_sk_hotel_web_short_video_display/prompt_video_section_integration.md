# Design Prompt: SK Boutique Hotel - Elegant Video Section Integration

## 1. Overview
The goal is to integrate a sophisticated storytelling section into the homepage. This section features a dual-column layout: compelling brand copy on the left and an immersive, vertical video on the right that acts as a "window" into the hotel's heritage.

## 2. Visual Style & Brand Alignment
- **Theme:** "Majestic Heritage" (Luxury, Minimalist, Elegant).
- **Colors:** 
    - Background: Off-white/Cream (#FBF9F5).
    - Text: Deep Charcoal/Navy (#000C1E).
    - Accent: Gold (#B08D57) for call-to-action or decorative elements.
- **Typography:**
    - **Headings:** Playfair Display (Serif) – Bold, large scale, elegant letter spacing.
    - **Body Text:** Be Vietnam Pro (Sans-serif) – Modern, clean, highly legible.

## 3. Layout Structure (Desktop - 1440px+)
- **Section Container:** Full width with generous horizontal padding (e.g., `px-12` or `px-24`). Vertical padding should create a sense of space (e.g., `py-24`).
- **Two-Column Grid:** 
    - **Left Column (Text - 50%):** 
        - Top label: Small uppercase text (e.g., "THE ANTHOLOGY") in Gold.
        - Heading: Large, impactful H2.
        - Subtext: Refined paragraph with comfortable line height.
        - CTA (Optional): A "Learn More" link with a subtle arrow icon.
    - **Right Column (Video - 50%):**
        - Centered container for the video.
        - Aspect Ratio: 9:16 (Vertical/Shorts style).
        - Styling: Rounded corners (e.g., `rounded-2xl`), subtle soft shadow.

## 4. Video Specifications & Behavior
- **Video Type:** High-quality, atmospheric footage of the hotel interior, staff, or guest experience.
- **Auto-play Logic:** 
    - The video must be **muted** by default.
    - Implement an **Intersection Observer** so the video starts playing automatically when it enters the viewport and pauses when it leaves.
- **Overlay Elements:** 
    - A subtle "Play" icon overlay (optional) to indicate video content.
    - A caption card at the bottom of the video frame (e.g., "A Glimpse of Elegance").

## 5. Technical Implementation Notes (Tailwind CSS)
- Use `flex` or `grid` for the main layout.
- For the video section: `relative aspect-[9/16] overflow-hidden rounded-xl`.
- For the typography: `font-['Playfair_Display']` for headers and `font-['Be_Vietnam_Pro']` for body.
- Video tag attributes: `autoplay`, `muted`, `loop`, `playsinline`.

## 6. Content Example
- **Label:** THE ANTHOLOGY
- **Heading:** Trải Nghiệm Đẳng Cấp Di Sản
- **Body:** Discover a sanctuary where timeless elegance meets modern sophistication. Every detail of SK Boutique Hotel is meticulously curated to transport you into a world of refined luxury, offering an unparalleled heritage experience in the heart of the city.
