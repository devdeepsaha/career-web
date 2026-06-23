export const formatMathText = (value) => {
    if (!value) return '';

    return String(value)
        .replace(/\\\$/g, '$')
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$')
        .replace(/\\\[/g, '$$')
        .replace(/\\\]/g, '$$')
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};
