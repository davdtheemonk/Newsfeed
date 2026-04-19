# NewsFeed

A React Native news feed application built with TypeScript, Redux Toolkit, and React Navigation. Fetches and displays top stories from the Hacker News API across two screens with bookmarking, sorting, search, and offline detection.

---

## Screenshots

| Feed                            | Detail                               | Bookmarks                          |
| ------------------------------- | ------------------------------------ | ---------------------------------- |
| Article list with sort + search | Article detail with bookmark + share | Saved stories with swipe to remove |

---

## Tech Stack

| Library                      | Version  | Purpose                       |
| ---------------------------- | -------- | ----------------------------- |
| React Native                 | 0.85     | Core framework                |
| TypeScript                   | 5.x      | Type safety throughout        |
| Redux Toolkit                | latest   | State management              |
| React Redux                  | latest   | React bindings                |
| React Navigation             | v6       | Stack + bottom tab navigation |
| AsyncStorage                 | latest   | Bookmark persistence          |
| NetInfo                      | latest   | Offline detection             |
| React Native Gesture Handler | latest   | Swipe to delete               |
| Testing Library              | latest   | Component interaction tests   |
| Jest                         | built-in | Unit tests                    |

---

## Getting Started

### Prerequisites

- Node.js 22+
- JDK 17+
- Android Studio with an emulator (API 30+) or a physical device
- For iOS: macOS with Xcode 15+ (see iOS note below)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/davdtheemonk/NewsFeed.git
cd NewsFeed
```

**2. Install JavaScript dependencies**

```bash
npm install
```

**3. Install iOS pods (macOS only)**

```bash
cd ios && pod install && cd ..
```

**4. Start Metro bundler**

```bash
npx react-native start
```

**5. Run on Android**

```bash
npx react-native run-android
```

**6. Run on iOS (macOS only)**

```bash
npx react-native run-ios
```

## Project Structure

## Features

### Required Features I implemented

- [x] Article list with FlatList — `keyExtractor`, `getItemLayout`, `React.memo`
- [x] Pull-to-refresh via `RefreshControl`
- [x] Loading, error, and empty states
- [x] Sort toggle — by score or by time, survives navigation
- [x] Scroll position restored when navigating back from detail
- [x] Article detail with tappable URL via `Linking.openURL`
- [x] Share button in header using `Share API`
- [x] Bookmark toggle persisted across cold restarts via AsyncStorage
- [x] TypeScript throughout — no unexplained `any`
- [x] Unit test — `relativeTime()` (Jest)
- [x] Component interaction test — `ArticleCard` press (RNTL)

### Bonus Features I implemented

- [x] Bookmarks tab with swipe-to-remove
- [x] Debounced search on Screen 1 — client-side filtering, no additional API calls
- [x] Offline detection banner with slide animation

## Architecture Decisions

### State Management — Redux Toolkit

I chose Redux Toolkit over Zustand for three reasons. First, `createAsyncThunk` provides a clean standardised pattern for the fetch lifecycle — `pending / fulfilled / rejected` — that maps directly onto the three required UI states. Second, sort toggle and bookmark state need to survive navigation, and RTK's single global store makes cross-screen state sharing explicit and traceable without prop-drilling. Third, typed `useAppDispatch` and `useAppSelector` wrappers enforce TypeScript correctness at every callsite.

The trade-off is boilerplate. Zustand would be leaner for simpler state needs. The deciding factor here was `createAsyncThunk` and the structured async lifecycle it provides.

### Bookmark Persistence — AsyncStorage

I chose AsyncStorage over MMKV because it requires no additional native setup and works out of the box on both platforms at this scale. Bookmarked IDs are stored as a JSON array under a single key. On startup, `store.ts` calls `loadBookmarks()` and dispatches `setBookmarks()` to rehydrate. A store subscriber calls `saveBookmarks()` on every change.

MMKV would be the better choice in a production app, it is synchronous, significantly faster, and supports encryption. The trade-off here was simplicity over performance for a feature that writes infrequently.

### Selectors — createSelector

All selectors that derive new array references — `selectSortedArticles` and `selectAllBookmarkedArticles` — are wrapped in `createSelector` from Redux Toolkit. This memoises the result and only recomputes when the input selectors return new references, preventing unnecessary re-renders when unrelated state changes.

### Performance

- `keyExtractor` and `getItemLayout` on every FlatList
- `React.memo` on `ArticleCard` with `useCallback` on `renderItem` and `onPress`
- Debounced search at 300ms, filters the already-fetched array client-side
- `useNativeDriver: true` on the offline banner animation

### Known Trade-offs

- `getItemLayout` assumes a fixed card height. If cards vary in height (e.g. very long titles), the scroll position calculation will be slightly off. The correct fix is dynamic measurement with `onLayout` per item.
- The offline banner uses `Animated` and `PanResponder` from core React Native rather than Reanimated, which had compatibility issues with RN 0.85. Reanimated would give smoother 60fps animations on the UI thread.
- Bookmark persistence writes on every toggle. In a high-frequency write scenario, debouncing the save would reduce I/O.

---

## Running Tests

```bash
npm test
```

### Unit test — `src/utils/time.test.ts`

Tests `relativeTime()` with multiple inputs covering seconds, minutes, hours, and days.

### Component test — `src/features/articles/ArticleList.test.tsx`

Renders `ArticleCard` with a mock article, fires a press event, and asserts `onPress` was called with the correct article. Uses `@testing-library/react-native`.

## API Reference

Base URL: `https://hacker-news.firebaseio.com/v0`

| Endpoint               | Description                 |
| ---------------------- | --------------------------- |
| `GET /topstories.json` | Returns array of story IDs  |
| `GET /item/{id}.json`  | Returns single story object |

Fetches the first 20 IDs then retrieves each item in parallel via `Promise.all`. Filters to items where `type === 'story'` and a `url` exists.

---

## Technical Questions

### Q1 — Bridge vs JSI & The New Architecture

The old Bridge worked like a translator between JavaScript and native code, but it was slow. Every time JS needed something from native, the request had to be turned into a JSON string, sent across the bridge, unpacked on the native side, then the response had to be turned back into JSON and sent again. That meant you couldn’t access native things synchronously, and the delay was especially noticeable during gestures or animations where every frame counts.

JSI changes that completely. Instead of passing messages back and forth, it gives the JavaScript engine a direct C++ reference to native objects. So when JS calls a native method, it happens right away—no serialization, no waiting. The JS thread actually holds a pointer to a real native object, which cuts out the whole JSON round-trip.

The New Architecture builds on top of JSI with two main pieces.
Fabric is the new rendering system—it moves layout work off the main thread and lets the renderer read native view state synchronously. That means things like useNativeDriver can work everywhere, and you don’t drop frames waiting for the Bridge.
TurboModules replace the old NativeModules system. Instead of loading every native module when the app starts up, TurboModules load lazily via JSI—only when you actually call them. That speeds up startup time significantly.

Together, they remove the Bridge entirely. Native and JavaScript communication starts to feel just like a regular function call.

---

### Q2 — Diagnosing a Janky FlatList

I'd open up Flipper or Android Studio's CPU profiler with React Native tracing turned on, scroll through the list, and see whether the frame drops are happening on the JS thread or the UI thread. Spikes on the JS thread usually mean render logic issues; spikes on the UI thread point to native layout problems or overdraw.

Next, I'd check for two missing things: keyExtractor and getItemLayout. Without keyExtractor, React falls back to matching items by index, so any reordering triggers full re-renders. And without getItemLayout, the FlatList can't pre-calculate where each item goes, so it has to measure every single item when the list mounts, which causes a ton of layout thrashing. Both are quick fixes with no downsides.

Then I'd look at the renderItem function. If it's written inline, like renderItem={({ item }) => <Card />} that creates a brand new function reference every time the parent re-renders, which completely breaks React.memo on the item component. Pulling it out with useCallback and wrapping the item component in React.memo solves that.

Finally, I'd check how images are loading. Unoptimized image can really hammer the GPU on mid-range Android phones. Switching to FastImage, setting explicit width and height, and using resizeMode="cover" usually clears that up. If frames are still dropping after that, I'd tweak maxToRenderPerBatch, windowSize, and turn on removeClippedSubviews.

---

### Q3 — useCallback and useMemo

Let me give you a real example where useCallback actually makes a measurable difference. Imagine a FlatList with over 180 items. If your renderItem creates a new function reference every time the parent component re renders, you run into trouble. Every state change in the parent, like toggling a sort order or updating a search query, causes every single list item wrapped in React.memo to re render anyway. Why? Because the onPress prop keeps changing to a brand new function, even though the behavior is identical. Wrapping both renderItem and that onPress in useCallback locks down the reference, so React.memo can finally do its job. The result is dramatic. Re renders drop from re rendering all 180 items down to just the one that actually changed.

Now here is where useMemo can actually make performance worse. Take a trivial computation like this: const label = useMemo(() => user.firstName + ' ' + user.lastName, [user]). You are just concatenating two strings. But useMemo is not free. It has to allocate an array for the dependencies, compare references on every render, and store the cached result. All of that overhead often costs more than just running the original operation inline. So in cases like this, useMemo actually slows things down instead of speeding them up.

useMemo only pays for itself in two situations. One, when the wrapped computation is genuinely expensive, like heavy math, sorting large arrays, or complex data transformations. Two, when you need referential stability of the returned object for a downstream component wrapped in memo. Applying useMemo indiscriminately to cheap operations is a great way to slow your app down without even realizing it.

---

### Q4 — State Management Decision

Context API is fine for global state that doesn't change often. Think things like theme, locale, or whether a user is logged in. Updates are rare and not that many components need to listen in. The big catch is that every single context consumer re renders whenever anything in the context changes, even if that component only uses one tiny field. So for an app with twelve screens and a handful of API integrations, this becomes a real performance problem fast. And on top of that, Context doesn't give you anything for async data fetching or handling loading and error states. You're on your own there.

Redux Toolkit fixes the performance issue with selectors. Components subscribe to exactly the piece of state they care about, so they only re render when that specific data actually changes. createAsyncThunk gives you a clean, standard way to handle async flows with built in pending, fulfilled, and rejected states. The downside is the boilerplate. You have slices, selectors, typed hooks. It adds setup time, but in a large codebase that investment really pays off.

Zustand lands somewhere in the middle. The API is way leaner than Redux Toolkit. No Provider to wrap your whole app, almost no boilerplate, but you still get selector based subscriptions. For this project I went with Redux Toolkit because createAsyncThunk made the three state fetch lifecycle really simple to implement and test. If the app had fewer async network requests, Zustand would have been the better choice. You get what you need without all the extra wiring

---

### Q5 — Offline-First UX Strategy

Detecting connectivity is your first line of defense. I use @react-native-community/netinfo with a little useNetInfo hook that just tells me isConnected. That drives an OfflineBanner component I stick at the navigator level so it shows up everywhere without me having to wire it into each screen individually.

The caching strategy really depends on what kind of data you're dealing with. Take a news feed. It changes often, but even stale content is better than a blank screen. For that, I would cache the last successful API response in AsyncStorage, keyed by the endpoint. When the screen loads, it shows the cached data instantly while quietly fetching fresh stuff in the background. If the fetch works, the cache updates. If you are offline, the user still sees something, just with a little timestamp letting them know when it was last refreshed.

For cache invalidation, I keep it simple. Feed data gets a five minute "fresh" window, but offline it is considered stale but usable indefinitely. For user generated stuff like bookmarks, I invalidate immediately on any write action. No waiting around.

The core trade-off is consistency versus availability. Serving stale cached data keeps the app functional offline but risks showing outdated content. The mitigation is showing it clearly in the UI, one can use last-updated timestamp and an offline banner so users always know the data freshness without being blocked from using the app.

---

## What I Would Do Differently

- Implement **react-query** or **RTK Query** for the API layer — built-in caching, background refetch, and stale-while-revalidate out of the box
- Add **pagination** — currently fetches only the first 20 stories; a real feed would paginate as the user scrolls
