import { exiftool } from 'exiftool-vendored';

function toList(value) {
  if (value == null) return [];
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values
    .flatMap(item => String(item ?? '').split(/[;\n\r]+/))
    .map(item => item.trim())
    .filter(Boolean))];
}

function normaliseText(value) {
  return String(value ?? '').trim();
}

function readFirstText(metadata, names) {
  for (const name of names) {
    const value = metadata[name];
    if (value == null) continue;
    const text = normaliseText(Array.isArray(value) ? value[0] : value);
    if (text) return text;
  }
  return '';
}

/**
 * Write AI/user metadata directly into the processed JPEG and verify it by
 * reading the same physical file again with ExifTool.
 *
 * We deliberately use ExifTool's canonical tag names here rather than mixing
 * group-qualified aliases. ExifTool maps these tags to the appropriate EXIF,
 * IPTC and XMP containers for JPEG output.
 */
export async function writePhotoMetadata(filePath, analysis = {}) {
  const tags = toList(analysis.tags);
  const themes = toList(analysis.themes);
  const description = normaliseText(analysis.description);
  const author = normaliseText(analysis.author);
  const keywords = toList([...tags, ...themes]);

  if (!description && keywords.length === 0 && !author) {
    return {
      saved: false,
      verified: false,
      tags,
      themes,
      keywords,
      description,
      author,
    };
  }

  const metadata = {};

  // Description: write to the common fields used by Lightroom, Windows,
  // Preview/Finder and other photo applications.
  if (description) {
    metadata.Description = description;
    metadata['Caption-Abstract'] = description;
    metadata.ImageDescription = description;
    metadata.XPComment = description;
  }

  // Photographer/author.
  if (author) {
    metadata.Creator = [author];
    metadata['By-line'] = author;
    metadata.Artist = author;
    metadata.XPAuthor = author;
  }

  // Keywords/tags.
  if (keywords.length) {
    metadata.Subject = keywords;
    metadata.Keywords = keywords;
    metadata.XPKeywords = keywords.join('; ');
  }

  console.log(`[metadata] writing ${filePath}`);
  console.log('[metadata] fields:', Object.keys(metadata));

  await exiftool.write(filePath, metadata, [
    '-overwrite_original',
    '-P',
  ]);

  // Verify the exact output file that will be placed in the ZIP.
  const written = await exiftool.read(filePath, { useMWG: false });

  const storedKeywords = toList([
    written.Subject,
    written.Keywords,
    written.XPKeywords,
  ]);

  const missingKeywords = keywords.filter(
    keyword => !storedKeywords.includes(keyword),
  );

  const storedDescription = readFirstText(written, [
    'Description',
    'Caption-Abstract',
    'ImageDescription',
    'XPComment',
  ]);

  const storedAuthors = toList([
    written.Creator,
    written['By-line'],
    written.Artist,
    written.XPAuthor,
  ]);

  const authorVerified = !author || storedAuthors.includes(author);
  const descriptionVerified = !description || storedDescription === description;
  const keywordsVerified = missingKeywords.length === 0;

  if (!keywordsVerified) {
    throw new Error(
      `Metadata keywords could not be verified in output JPEG: ${missingKeywords.join(', ')}`,
    );
  }

  if (!authorVerified) {
    throw new Error(`Metadata author could not be verified in output JPEG: ${author}`);
  }

  if (!descriptionVerified) {
    throw new Error('Metadata description could not be verified in output JPEG.');
  }

  return {
    saved: true,
    verified: true,
    tags,
    themes,
    keywords,
    description,
    author,
  };
}
