export default function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // spaces → hyphens
    .replace(/[^\w-]+/g, "")    // remove special chars
    .replace(/--+/g, "-");      // remove duplicate hyphens
}