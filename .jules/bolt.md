## 2023-10-25 - Prevented N+1 in Celery push notification workers
**Learning:** Sequential processing in recurring scheduled scripts can accumulate vast delays when firing asynchronous I/O ops (like HTTP queries) repeatedly within a database loop. Expo provides a bulk batching API capable of 100 messages at a time, but this app was iterating manually, invoking latency blocks on scale-up.
**Action:** When scheduling external interactions loop processing via Celery or Cron, always queue items and execute natively via a batch endpoint (e.g. `_send_in_batches`) avoiding sequential N+1 delays.
## 2025-02-12 - Concurrent API Calls in Events Service
**Learning:** Sequential network requests, such as searching Google Places and Eventbrite separately using `await`, sum up the total latency of both requests (max(T_google)+max(T_eventbrite)). In situations where one API takes up to 2 seconds and another 1 second, it forces a 3-second wait unnecessarily.
**Action:** Always utilize `asyncio.gather` for distinct, independent asynchronous operations, specifically API fetching, to execute them concurrently. This binds the total latency to max(T_google, T_eventbrite).

## 2023-10-26 - React Native Component Re-renders
**Learning:** In React Native, large lists (`SectionList` or `FlatList`) that render complex items (like cards with multiple interactive elements) can cause massive re-renders when parent state updates.
**Action:** When passing event handlers to children in list items, always wrap them in `useCallback` to prevent new function references from breaking `memo` optimizations in child components, and wrap expensive derived state calculation inside the list in `useMemo`.

## 2025-02-12 - Prevent Re-renders in Complex Lists
**Learning:** In React Native, filtering or computing heavy list section groupings inside functional components without memoization causes the sections to be re-evaluated on every render. Additionally, inline handlers in list components without standard signature overrides trigger continuous nested element re-renders.
**Action:** When setting up sectioned lists like `SectionList` or `FlatList`, always `useMemo` for derived layout sections like `events.filter(...)`. Ensure action handlers like `onBookmarkToggle` can be provided all necessary state via callback signatures and wrap callback bindings in `useCallback` when feeding directly into render maps.
