// A post's tags as a row of small labels (News overview cards and article
// pages; styles: .tag-list in globals.css). Plain text, not links: there is
// no page per tag.

export default function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="tag-list">
      {/* Index in the key: an editor may enter the same tag twice. */}
      {tags.map((tag, i) => (
        <li key={`${i}-${tag}`}>{tag}</li>
      ))}
    </ul>
  );
}
