# RoomIconPicker

Lets the user pick an icon for a room from a curated set of ~30 [Gravity UI icons](https://github.com/gravity-ui/icons) (`src/lib/roomIcons.ts`) fitting a home-renovation theme (rooms, tools, utilities, storage, decor). Used by [RoomFormPage](../pages/RoomFormPage.md) so each room in [RoomsSection](RoomsSection.md) can show a distinct icon instead of a generic placeholder.

Renders a circular button showing the currently selected icon (`primary.100` background, `primary.600` icon color); clicking it opens a Chakra `Dialog` with a 5-column `Grid` of all icons from `ROOM_ICONS`. Clicking an icon calls `onChange` with its name and closes the dialog immediately (no separate confirm step). The currently selected icon is highlighted with a `primary.solid` background instead of `primary.100`.

Icon selection is stored as a plain string key into `ROOM_ICONS` (e.g. `"House"`, `"Droplet"`), not the component itself — this is what's persisted on the `Room.icon` field in the Realtime Database. `getRoomIcon(name)` (also from `src/lib/roomIcons.ts`) resolves a name back to the icon component, falling back to `DEFAULT_ROOM_ICON` (`"House"`) if `name` is missing or unrecognized — used both by this component and by `RoomsSection` when rendering each room's row icon.

## Props

- `value?: string` — the currently selected icon name (a key of `ROOM_ICONS`); `undefined` displays/highlights the default icon.
- `onChange: (icon: string) => void` — called with the newly selected icon name.

## Use cases

- `RoomFormPage`: shown centered above the room name field so the user can set a room's icon when adding or editing it.
