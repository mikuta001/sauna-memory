import AlbumContent from "./AlbumContent";
import { parseAlbumSelection, type AlbumSearchParams } from "./selection";

export default async function AlbumPage({
  searchParams,
}: {
  searchParams: Promise<AlbumSearchParams>;
}) {
  const selection = parseAlbumSelection(await searchParams);
  return <AlbumContent {...selection} />;
}
