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
- For iOS: macOS with Xcode 15+

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
- [x] Sort toggle, by score and by time
- [x] Scroll position restored when navigating back from detail
- [x] Article detail with tappable URL via `Linking.openURL`
- [x] Share button in header using `Share API`
- [x] Bookmarks persist across cold restarts via AsyncStorage
- [x] TypeScript throughout, no unexplained `any`
- [x] Unit test
- [x] Component interaction test — `ArticleCard`

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

The old Bridge worked like a translator between JavaScript and native code, but it was slow. Every request had to be serialized to JSON, sent across, unpacked on the native side, and then the response had to be serialized and sent back. That meant you couldn't access native things synchronously, and the delay was especially noticeable during gestures or animations.

JSI changes that completely by giving the JavaScript engine a direct C++ reference to native objects. When JS calls a native method, it happens right away with no serialization and no waiting. The JS thread holds an actual pointer to a native object, cutting out the entire JSON round trip.

The New Architecture builds on JSI with two main pieces. Fabric is the new rendering system that moves layout work off the main thread, so useNativeDriver works everywhere without frame drops. TurboModules replace the old NativeModules system by loading lazily via JSI instead of eagerly at startup, which significantly speeds up app launch. Together, they remove the Bridge entirely, making native to JS communication feel just like a regular function call.

---

### Q2 — Diagnosing a Janky FlatList

I'd open Flipper or Android Studio's CPU profiler with React Native tracing on, scroll through the list, and see whether frame drops are happening on the JS thread or the UI thread. Spikes on the JS thread usually mean render logic issues, while spikes on the UI thread point to native layout problems or overdraw.

Next, I'd check for two missing things: keyExtractor and getItemLayout. Without keyExtractor, React falls back to matching items by index, so any reordering triggers full re-renders. Without getItemLayout, the FlatList can't precalculate item positions and has to measure every item on mount, causing layout thrashing.

Then I'd look at the renderItem function. If it's written inline like renderItem={({ item }) => <Card />}, that creates a new function reference on every parent render, which breaks React.memo on the item component. Pulling it out with useCallback and wrapping the item component in React.memo solves that.

Finally, I'd check image loading, because unoptimized images can hammer the GPU on mid-range Android phones. Switching to FastImage, setting explicit dimensions, and using resizeMode="cover" usually clears it up. If frames are still dropping, I'd tweak maxToRenderPerBatch, windowSize, and enable removeClippedSubviews.

---

### Q3 — useCallback and useMemo

Let me give you a real example where useCallback actually makes a measurable difference. Imagine a FlatList with 180 items where renderItem creates a new function reference on every parent render. Every state change in the parent, like toggling sort order or updating a search query, causes every list item wrapped in React.memo to re render anyway because the onPress prop keeps changing to a brand new function. Wrapping both renderItem and onPress in useCallback locks down the reference, so React.memo can finally do its job. The result is dramatic, dropping re renders from all 180 items down to just the one that actually changed.

Now here is where useMemo can actually make performance worse. Take a trivial computation like const label = useMemo(() => user.firstName + ' ' + user.lastName, [user]). You are just concatenating two strings, but useMemo has to allocate a dependency array, compare references on every render, and store the cached result. That overhead often costs more than just running the original operation inline.

useMemo only pays for itself in two situations. First, when the wrapped computation is genuinely expensive, like heavy math, sorting large arrays, or complex data transformations. Second, when you need referential stability of the returned object for a downstream component wrapped in memo. Applying useMemo indiscriminately to cheap operations is a great way to slow your app down without realizing it.

---

### Q4 — State Management Decision

Context API is fine for global state that doesn't change often, like theme, locale, or login status. The big catch is that every context consumer re renders whenever anything in the context changes, even if that component only uses one tiny field. For an app with twelve screens and several API integrations, this becomes a real performance problem fast. On top of that, Context gives you nothing for async data fetching or handling loading and error states.

Redux Toolkit fixes the performance issue with selectors, so components only re render when their specific piece of state actually changes. createAsyncThunk gives you a clean way to handle async flows with built in pending, fulfilled, and rejected states. The downside is the boilerplate, including slices, selectors, and typed hooks, but in a large codebase that investment pays off.

Zustand lands somewhere in the middle with a much leaner API and no Provider wrapper, while still supporting selector based subscriptions. For this project I chose Redux Toolkit because createAsyncThunk made the three state fetch lifecycle simple to implement and test. If the app had fewer async network requests, Zustand would have been the better choice since you get what you need without all the extra wiring.

---

### Q5 — Offline-First UX Strategy

Detecting connectivity is your first line of defense. I use @react-native-community/netinfo with a small hook that tells me isConnected, which drives an OfflineBanner component at the navigator level so it shows up everywhere without per screen wiring.

The caching strategy depends on your data. For a news feed that changes often but where stale content is better than a blank screen, I cache the last successful API response in AsyncStorage keyed by endpoint. When the screen loads, it shows cached data instantly while quietly fetching fresh data in the background. If you are offline, the user still sees something, just with a timestamp letting them know when it was last refreshed.

For cache invalidation, I keep it simple. Feed data gets a five minute fresh window, but offline it remains usable indefinitely. For user generated data like bookmarks, I invalidate immediately on any write action.

The main tension is giving users the latest info versus giving them any info at all. Serving stale cached data keeps the app functional offline but risks showing outdated content. The mitigation is clear UI affordances, like a last updated timestamp and an offline banner, so users always know the data freshness without being blocked from using the app.

---

## What I Would Do Differently

- Implement **react-query** or **RTK Query** for the API layer — built-in caching, background refetch, and stale-while-revalidate out of the box
- Add **pagination** — currently fetches only the first 20 stories; a real feed would paginate as the user scrolls
