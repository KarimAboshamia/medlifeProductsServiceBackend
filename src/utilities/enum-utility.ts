/* 
    enum E {
        VALUE1,
        VALUE2
    }

    getEnumValues(E) =======> [VALUE1, VALUE2]
*/
export const getEnumValues = (e: object) => {
    try {
        const values = Object.values(e);

        return values.slice(0, values.length / 2).map((value) => value.toString());
    } catch (error) {
        throw error;
    }
};
