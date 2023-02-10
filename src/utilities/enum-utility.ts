export const getEnumValues = (e: object) => {
    const values = Object.values(e);

    return values.slice(0, values.length / 2).map((value) => value.toString());
};
