import { parsePhoneNumberFromString } from "libphonenumber-js"

/** Baileys sends digits only, with country code (e.g. 15014947546). */
export function formatPhoneNumber(raw: string): string {
  const normalized = raw.startsWith("+") ? raw : `+${raw}`
  const phone = parsePhoneNumberFromString(normalized)

  return phone?.isValid()
    ? phone.formatInternational().replace(/ /g, "\u202f")
    : raw
}
