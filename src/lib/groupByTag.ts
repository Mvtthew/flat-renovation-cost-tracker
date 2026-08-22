export const NO_TAG_GROUP = '__no_tag__'

export interface TaggedItem {
  tags?: string[]
}

export interface TagGroup<T> {
  tag: string
  items: T[]
}

export function groupItemsByTag<T extends TaggedItem>(items: T[]): TagGroup<T>[] {
  const groups = new Map<string, T[]>()
  items.forEach((item) => {
    const tags = item.tags && item.tags.length > 0 ? item.tags : [NO_TAG_GROUP]
    tags.forEach((tag) => {
      const list = groups.get(tag)
      if (list) list.push(item)
      else groups.set(tag, [item])
    })
  })
  return [...groups.entries()]
    .map(([tag, groupItems]) => ({ tag, items: groupItems }))
    .sort((a, b) => {
      if (a.tag === NO_TAG_GROUP) return 1
      if (b.tag === NO_TAG_GROUP) return -1
      return a.tag.localeCompare(b.tag, 'pl')
    })
}
