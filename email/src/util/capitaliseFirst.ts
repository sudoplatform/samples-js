/**
 * Formats a string with the first character as uppercase
 * and the rest as lower case.
 */
export const capitaliseFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
