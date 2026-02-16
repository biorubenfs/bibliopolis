import { IsbnPair } from "./interfaces.utils";

export class ISBNUtils {
  static isbn13ToIsbn10(isbn13: string): string {
    const clean = isbn13.replace(/[-\s]/g, "");

    if (!/^\d{13}$/.test(clean)) {
      throw new Error("ISBN-13 invalid");
    }

    if (!clean.startsWith("978")) {
      throw new Error(
        "This ISBN-13 cannot be converted to ISBN-10 (does not start with 978)",
      );
    }

    // Extract the 9 central digits
    const core = clean.slice(3, 12);

    // Calculate ISBN-10 check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(core[i], 10) * (10 - i);
    }

    const check = 11 - (sum % 11);
    let checkDigit;

    if (check === 10) checkDigit = "X";
    else if (check === 11) checkDigit = "0";
    else checkDigit = String(check);

    return core + checkDigit;
  }

  static isbn10ToIsbn13(isbn10: string): string {
    // Clean hyphens and spaces
    const clean = isbn10.replace(/[-\s]/g, "");

    if (!/^\d{9}[\dX]$/.test(clean)) {
      throw new Error("ISBN-10 invalid");
    }

    // Remove ISBN-10 check digit and add 978
    const core = "978" + clean.slice(0, 9);

    // Calculate ISBN-13 check digit
    let sum = 0;
    for (let i = 0; i < core.length; i++) {
      sum += parseInt(core[i], 10) * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;

    return core + checkDigit;
  }

  // Calculates missing ISBNs and validates compatibility if both are provided
  static calculateIsbns(isbn_10?: string | null, isbn_13?: string | null): IsbnPair {
    if (!isbn_10 && !isbn_13) {
      throw new Error("Either isbn_10 or isbn_13 must be provided");
    }

    const resolvedIsbn10 = isbn_10 ?? (isbn_13 ? ISBNUtils.isbn13ToIsbn10(isbn_13) : null);
    const resolvedIsbn13 = isbn_13 ?? (isbn_10 ? ISBNUtils.isbn10ToIsbn13(isbn_10) : null);

    if (resolvedIsbn10 == null || resolvedIsbn13 == null) {
      throw new Error("Could not resolve ISBNs");
    }

    // Validate compatibility if both were provided
    if (isbn_10 && isbn_13 && resolvedIsbn10 !== isbn_10) {
      throw new Error("isbn_10 and isbn_13 are not compatible");
    }

    return { isbn_10: resolvedIsbn10, isbn_13: resolvedIsbn13 };
  }
}
