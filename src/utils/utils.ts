export const formatRichText = (text: string): string => {
  if (!text) return ""

  return text
    .replace(/\*\*(.*?)\*\*/g, "<em>$1</em>") // italics
    .replace(/__(.*?)__/g, "<strong>$1</strong>") // bold
    .replace(/~~(.*?)~~/g, "<del>$1</del>") // strikethrough
}
