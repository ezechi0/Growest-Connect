/**
 * Utilitaires pour la gestion des devises
 * Configuration centralisée pour Franc CFA (XOF)
 */

export const CURRENCY_CONFIG = {
  code: 'XOF',
  symbol: 'FCFA',
  name: 'Franc CFA',
  locale: 'fr-FR',
  position: 'after' // Position du symbole (before ou after le montant)
} as const;

/**
 * Formate un montant en devise locale (Franc CFA)
 * @param amount - Le montant à formater
 * @param showSymbol - Afficher ou non le symbole de devise
 * @returns Le montant formaté avec la devise
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = amount.toLocaleString(CURRENCY_CONFIG.locale);
  
  if (!showSymbol) {
    return formatted;
  }
  
  return CURRENCY_CONFIG.position === 'after' 
    ? `${formatted} ${CURRENCY_CONFIG.symbol}`
    : `${CURRENCY_CONFIG.symbol}${formatted}`;
}

/**
 * Parse une chaîne de devise en nombre
 * @param currencyString - La chaîne à parser (ex: "50 000 FCFA")
 * @returns Le montant numérique
 */
export function parseCurrency(currencyString: string): number {
  const cleanString = currencyString
    .replace(/[^\d,.-]/g, '') // Enlever tout sauf les chiffres et séparateurs
    .replace(/\s/g, ''); // Enlever les espaces
  
  return parseFloat(cleanString) || 0;
}

/**
 * Convertit un montant avec un taux de change
 * @param amount - Le montant à convertir
 * @param rate - Le taux de change
 * @returns Le montant converti
 */
export function convertCurrency(amount: number, rate: number): number {
  return amount * rate;
}
