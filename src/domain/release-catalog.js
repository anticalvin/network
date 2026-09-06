import { isAtlasEntityPublic } from './atlas.js';

// Atlas owns publication; the old catalogue supplies only missing presentation fields.
export function releaseCatalog(entities = [], legacy = []) {
  return entities.filter((entity) => entity.entityType === 'release' && isAtlasEntityPublic(entity)).map((entity) => {
    const meta = entity.metadata || {};
    const previous = legacy.find((item) => item.id === entity.slug || item.url === (meta.officialUrl || meta.url)) || {};
    const date = meta.releaseDate || entity.startDate || previous.installed || '';
    const year = /^\d{4}/.test(date) ? date.slice(0, 4) : previous.year || 'Undated';
    const tracks = Array.isArray(meta.tracks) ? meta.tracks.map((track) => typeof track === 'string' ? track : track.title).filter(Boolean) : previous.tracks || [];
    return { ...previous, id: previous.id || entity.slug, atlasId: entity.id, title: entity.name, type: meta.releaseType || previous.type || 'Release', year, installed: date,
      path: previous.path || `A:\\Archive\\${year}\\${entity.slug}`, cover: meta.artworkUrl || previous.cover || 'assets/img/awaken-logo.webp',
      url: meta.officialUrl || meta.url || previous.url || '', readme: entity.description || previous.readme || entity.summary || '',
      tracks, size: meta.trackCount ? `${meta.trackCount} tracks` : previous.size || `${tracks.length} listed tracks`,
      tags: [...new Set([...(entity.tags || []), ...(previous.tags || [])])], status: 'Published' };
  });
}
