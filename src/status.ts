

export const getStatusColor = (status: number) => {
    if (status === 0) {
        return "green";
    } else if (status === 1) {
        return "yellow";
    } else {
        return "red";
    }
}