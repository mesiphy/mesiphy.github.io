import { getCollection, type CollectionEntry } from 'astro:content';
import { createMusicCatalog } from './music-catalog';

export type Album = CollectionEntry<'albums'>;
export type Track = CollectionEntry<'music'>;
export { neteaseUrl, neteasePlayerUrl } from './music-catalog';

/** 唯一音乐读取入口：发布时同时排除草稿专辑及其曲目。 */
export async function getMusicCatalog() {
  const [albums, tracks] = await Promise.all([getCollection('albums'), getCollection('music')]);
  return createMusicCatalog(albums, tracks, import.meta.env.DEV);
}

export const albumUrl = (album: Album) => `/music/albums/${album.id}/`;
export const trackUrl = (track: Track) => `/music/${track.id}/`;
export const albumTracks = (tracks: Track[], album: Album) =>
  tracks.filter((track) => track.data.album.id === album.id)
    .sort((a, b) => a.data.trackNumber - b.data.trackNumber);
