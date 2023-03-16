export const mapProductImages = (imagesID: string[], imagesURL: string[]) => {
    try {
        return imagesID.map((imageID: string, idx: number) => ({ id: imageID, url: imagesURL[idx] }));
    } catch (error) {
        throw error;
    }
};
