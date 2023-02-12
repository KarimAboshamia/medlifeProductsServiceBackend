export const getServiceToken = (username, password) => {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
};
