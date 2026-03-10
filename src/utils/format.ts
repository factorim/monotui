export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function spacesToHyphen(value: string): string {
  return value.replaceAll(" ", "-")
}

export function formatFacetId(basePath: string, name: string): string {
  return `${basePath}:${spacesToHyphen(name)}`
}
