# Aro Cafe

The Aro Cafe website, built with React and Vite.

## Run it

```bash
npm install
npm run dev
```

`npm run build` makes the production site in `dist/`, and `npm run preview` serves that build locally.

## Where things live

```
aro-cafe/
├─ index.html            page shell: meta tags, fonts, the welcome curtain
├─ public/assets/        photos, hero videos and the scroll film frames (served as /assets/...)
└─ src/
   ├─ main.jsx           starts React
   ├─ App.jsx            the page, top to bottom
   ├─ components/
   │  ├─ layout/         Nav, Footer, Dock, Environment (backdrop)
   │  ├─ hero/           PhoneHero (looping film) and ScrollHero (scroll journey)
   │  ├─ sections/       one file per section of the page
   │  └─ ui/             small shared pieces (Wordmark)
   ├─ data/              the words and lists: menu, timeline, moments, FAQ, links
   ├─ styles/            the stylesheet, split by area; index.css sets the order
   ├─ hooks/             useSiteAnimations starts the animation engine once
   └─ animation/         GSAP, Lenis and three.js code that drives the page
      ├─ site.js         scroll film, captions, section animations, start-up
      ├─ phoneFilm.js    phone hero video and its frame-by-frame fallback
      ├─ holdToSayAro.js the press-and-hold button
      ├─ splitHeadlines.js, heroShaders.js, constants.js, utils.js
```

## Changing content

- Menu tiles, timeline, polaroids and FAQ: edit the files in `src/data/`.
- Links (Google Maps, Instagram): `src/data/site.js`.
- Text inside a section: the matching file in `src/components/sections/`.

The animation code works on the page directly, so the components are plain markup with no state.
Keep class names and `data-` attributes as they are; the animations look them up by name.

## Deploying on Vercel

Set the project's Root Directory to `aro-cafe`. `vercel.json` tells Vercel it is a Vite project
(build with `npm run build`, serve `dist/`).
