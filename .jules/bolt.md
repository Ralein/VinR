## 2023-10-25 - Prevented N+1 in Celery push notification workers
**Learning:** Sequential processing in recurring scheduled scripts can accumulate vast delays when firing asynchronous I/O ops (like HTTP queries) repeatedly within a database loop. Expo provides a bulk batching API capable of 100 messages at a time, but this app was iterating manually, invoking latency blocks on scale-up.
**Action:** When scheduling external interactions loop processing via Celery or Cron, always queue items and execute natively via a batch endpoint (e.g. `_send_in_batches`) avoiding sequential N+1 delays.
## 2025-02-12 - Concurrent API Calls in Events Service
**Learning:** Sequential network requests, such as searching Google Places and Eventbrite separately using `await`, sum up the total latency of both requests (max(T_google)+max(T_eventbrite)). In situations where one API takes up to 2 seconds and another 1 second, it forces a 3-second wait unnecessarily.
**Action:** Always utilize `asyncio.gather` for distinct, independent asynchronous operations, specifically API fetching, to execute them concurrently. This binds the total latency to max(T_google, T_eventbrite).

## 2023-10-26 - React Native Component Re-renders
**Learning:** In React Native, large lists (`SectionList` or `FlatList`) that render complex items (like cards with multiple interactive elements) can cause massive re-renders when parent state updates.
**Action:** When passing event handlers to children in list items, always wrap them in `useCallback` to prevent new function references from breaking `memo` optimizations in child components, and wrap expensive derived state calculation inside the list in `useMemo`.

## 2023-11-20 - Concurrent Async Database/API Operations in Chat Service
**Learning:** Sequential async operations that don't depend on each other (like fetching RAG context and user context from the database) add unnecessary latency to the critical response path for LLM generation. While individual operations might take ~100ms, chaining them sequentially doubles the latency.
**Action:** When performing multiple independent async context-gathering operations before an LLM call, always use `asyncio.gather` to fetch them concurrently, reducing total context assembly time from max(T_rag)+max(T_user) to max(T_rag, T_user).
