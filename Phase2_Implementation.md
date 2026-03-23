# Phase 2 Implementation

We are beginning Phase 2 of the VinR Implementation with the following features and modifications:

## 1. Personalization Onboarding
- After login, prompt the user for their **username**, **age**, and **personalization preferences** (e.g., sports, fitness, goals).
- Save these details to the user's profile in the database.

## 2. Gratitude Page
- Add a new dedicated "Gratitude" page.
- Allow users to log what they are grateful for today.
- Save and retrieve gratitude logs.

## 3. Immediate Relief Enhancement
- Enhance the current "Immediate relief" feature.
- Create a dedicated page for it.
- Include breathing animations with different tiers (e.g., box breathing, 4-7-8 breathing).
- Fix existing bugs/features related to immediate relief.

## 4. 21-Day Daily Habit
- Move the "21-Day Daily Habit" feature to a separate, dedicated page.
- Fix any existing features or UI issues related to it.

## 5. Wind Down Removal
- Remove the "Tonight wind down" / music feature entirely from the app payload and UI.

## 6. Dashboard UI Enhancement
- Enhance the overall UI of the main Dashboard.
- Ensure UI consistency across all pages (typography, colors, spacing, components).

## 7. Eventbrite Integration
- Efficiently integrate Eventbrite for relevant local events.
- Retrieve events using:
  - `EVENTBRITE_API_KEY`
  - `EVENTBRITE_PUBLIC_TOKEN`
  - `EVENTBRITE_CLIENT_SECRET`
- Display local events to the user.
- Utilize push notifications via `EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send` (local url 8081).
