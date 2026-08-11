# TagsInputWithSuggestions

A Chakra `TagsInput.Root` (tag chips + free-text entry) wrapped with a dropdown of matching existing tags, so users can pick a previously-used tag instead of retyping it.

## Props

- `value: string[]` / `onValueChange: (value: string[]) => void` — the selected tags.
- `inputValue: string` / `onInputValueChange: (inputValue: string) => void` — the in-progress text in the input, lifted to the parent (needed so a suggestion click can clear it).
- `existingTags: string[]` — the full pool of tags to suggest from (e.g. every tag used across all plan items). Typically loaded via an `onValue` subscription on `planItems` in the parent.
- `disabled?: boolean`.

## Behavior

While `inputValue` is non-empty, suggestions are `existingTags` filtered by case-insensitive substring match, minus tags already in `value`, capped at 6, shown in an absolutely-positioned dropdown below the input. Clicking a suggestion (via `onMouseDown` with `preventDefault` so the input doesn't lose focus first) appends it to `value` and clears `inputValue`.

## Use cases

- [PlanItemFormPage](../pages/PlanItemFormPage.md)'s "Tagi" field when adding/editing a single planned item.
- [RoomDetailPage](../pages/RoomDetailPage.md)'s "Dodaj tag" bulk-action modal for tagging multiple selected plan items at once.
