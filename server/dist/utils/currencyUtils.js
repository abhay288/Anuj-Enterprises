/**
 * Convert numeric Indian currency into words
 * e.g. 15420 => "Indian Rupees Fifteen Thousand Four Hundred Twenty Only"
 */
export const numberToWordsIndian = (num) => {
    if (isNaN(num) || num === null || num === undefined)
        return 'Zero Rupees Only';
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convertLessThanOneThousand = (n) => {
        let str = '';
        if (n >= 100) {
            str += a[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
        }
        else if (n > 0) {
            str += a[n] + ' ';
        }
        return str.trim();
    };
    const rounded = Math.round(num);
    if (rounded === 0)
        return 'Indian Rupees Zero Only';
    let remaining = rounded;
    let words = '';
    // Crores (1,00,00,000)
    const crores = Math.floor(remaining / 10000000);
    if (crores > 0) {
        words += convertLessThanOneThousand(crores) + ' Crore ';
        remaining %= 10000000;
    }
    // Lakhs (1,00,000)
    const lakhs = Math.floor(remaining / 100000);
    if (lakhs > 0) {
        words += convertLessThanOneThousand(lakhs) + ' Lakh ';
        remaining %= 100000;
    }
    // Thousands (1,000)
    const thousands = Math.floor(remaining / 1000);
    if (thousands > 0) {
        words += convertLessThanOneThousand(thousands) + ' Thousand ';
        remaining %= 1000;
    }
    // Hundreds and units
    if (remaining > 0) {
        words += convertLessThanOneThousand(remaining) + ' ';
    }
    return `Indian Rupees ${words.trim()} Only`;
};
